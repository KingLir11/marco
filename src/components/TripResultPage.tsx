
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { getLatestTripImagePlan } from "@/services/tripImageService";
import { getIconForEquipment } from "./trip-result/utils/equipmentIcons";
import { Json } from "@/integrations/supabase/types";

// Import refactored components
import LoadingState from "./trip-result/LoadingState";
import TripHeader from "./trip-result/TripHeader";
import TripImage from "./trip-result/TripImage";
import TripPlanDisplays from "./trip-result/TripPlanDisplays";
import PackingList from "./trip-result/PackingList";
import ActionButtons from "./trip-result/ActionButtons";

const TripResultPage = () => {
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState({
    destination: "",
    dateRange: "",
    mainPlan: [] as { day: string; activity: string; weather: string }[],
    alternativePlan: [] as { day: string; activity: string; weather: string }[],
    equipment: [] as { name: string; icon: JSX.Element }[]
  });
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTripPlan = async () => {
      try {
        setLoading(true);
        const latestPlan = await getLatestTripImagePlan();
        
        if (latestPlan) {
          // Set image URL if available
          if (latestPlan["Image URL"]) {
            setImageURL(latestPlan["Image URL"]);
          }
          
          // Handle the response data
          if (latestPlan.Response) {
            try {
              // Store raw response text for display if needed
              if (typeof latestPlan.Response === 'string') {
                setRawResponse(latestPlan.Response);
              }
              
              // Try to find JSON data within the response
              let parsedResponse = null;
              
              // If it's a string, try to find JSON within it or extract data using regex
              if (typeof latestPlan.Response === 'string') {
                const jsonRegex = /{[\s\S]*}/;
                const match = latestPlan.Response.match(jsonRegex);
                
                if (match) {
                  // Try to parse the JSON portion if found
                  try {
                    parsedResponse = JSON.parse(match[0]);
                  } catch (jsonError) {
                    console.log("Failed to parse JSON from match:", jsonError);
                    // Continue with fallback extraction
                  }
                }
                
                // If no JSON found or parsing failed, extract trip data using heuristics
                if (!parsedResponse) {
                  console.log("No valid JSON found, extracting data from text");
                  parsedResponse = extractDataFromText(latestPlan.Response);
                }
              } else {
                // If it's already an object, use it directly
                parsedResponse = latestPlan.Response;
              }
              
              if (parsedResponse) {
                // Update trip data with the parsed/extracted response
                setTripData({
                  destination: parsedResponse.destination || "Your Destination",
                  dateRange: parsedResponse.dateRange || "Your Travel Dates",
                  mainPlan: parsedResponse.mainPlan || [],
                  alternativePlan: parsedResponse.alternativePlan || [],
                  equipment: parsedResponse.equipment ? parsedResponse.equipment.map((item: any) => ({
                    name: item.name,
                    icon: getIconForEquipment(item.name)
                  })) : []
                });
              }
            } catch (error) {
              console.error("Error processing response:", error);
              toast.error("Failed to parse trip data");
              
              // Fall back to extracting basic info
              if (typeof latestPlan.Response === 'string') {
                const fallbackData = extractDataFromText(latestPlan.Response);
                setTripData({
                  destination: fallbackData.destination || "Your Destination",
                  dateRange: fallbackData.dateRange || "Your Travel Dates",
                  mainPlan: fallbackData.mainPlan || [],
                  alternativePlan: fallbackData.alternativePlan || [],
                  equipment: fallbackData.equipment ? fallbackData.equipment.map((item: any) => ({
                    name: item.name,
                    icon: getIconForEquipment(item.name)
                  })) : []
                });
              }
            }
          }
        } else {
          toast.error("No trip plan found. Please create a new trip plan.");
        }
      } catch (error) {
        console.error("Error fetching trip plan:", error);
        toast.error("Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTripPlan();
  }, []);

  // Helper function to extract trip data from text when JSON parsing fails
  const extractDataFromText = (text: string) => {
    console.log("Extracting data from text:", text.substring(0, 100) + "...");
    
    // Default data
    const result = {
      destination: "",
      dateRange: "",
      mainPlan: [] as { day: string; activity: string; weather: string }[],
      alternativePlan: [] as { day: string; activity: string; weather: string }[],
      equipment: [] as { name: string }[]
    };
    
    // Extract destination
    const destinationMatch = text.match(/(?:to|in|for|Your)\s+([A-Z][a-zA-Z\s]+?)(?:\s+Urban Adventure|\s+-|\s+plan|\.|$)/);
    if (destinationMatch) {
      result.destination = destinationMatch[1].trim();
    }
    
    // Extract date range
    const dateMatch = text.match(/(?:on|for)\s+([A-Za-z]+\s+\d{1,2}-\d{1,2}|[A-Za-z]+\s+\d{1,2}\s+to\s+\d{1,2})/i);
    if (dateMatch) {
      result.dateRange = dateMatch[1];
    }
    
    // Extract equipment items
    const equipmentItems = text.match(/[•*-]\s*\*\*([^*]+)\*\*/g) || 
                          text.match(/[•*-]\s*([A-Z][^:]+?)(?::|$)/gm);
    
    if (equipmentItems) {
      result.equipment = equipmentItems.map(item => {
        const cleaned = item.replace(/[•*-]\s*\*\*|\*\*/g, '').trim();
        return { name: cleaned };
      });
    }
    
    // Extract some activities for main plan
    const days = ["Day 1", "Day 2", "Day 3", "Morning", "Afternoon", "Evening"];
    days.forEach(day => {
      const regex = new RegExp(`${day}[^.]*?([^.]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        result.mainPlan.push({
          day: day,
          activity: match[1].trim(),
          weather: "Weather information not available"
        });
      }
    });
    
    return result;
  };

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              <TripHeader destination={tripData.destination} dateRange={tripData.dateRange} />
              <TripImage imageURL={imageURL} destination={tripData.destination} />
              <TripPlanDisplays mainPlan={tripData.mainPlan} alternativePlan={tripData.alternativePlan} />
              <PackingList equipment={tripData.equipment} />
              <ActionButtons />
              
              {/* Debug section - can be removed in production */}
              {rawResponse && process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <details>
                    <summary className="cursor-pointer text-sm text-gray-500">Debug: Raw Response</summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-64">
                      {rawResponse}
                    </pre>
                  </details>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
