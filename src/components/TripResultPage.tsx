
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { getLatestTripImagePlan } from "@/services/tripImageService";
import { getIconForEquipment } from "./trip-result/utils/equipmentIcons";

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
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  // Helper function to strip markdown code blocks if present
  const cleanJsonString = (jsonString: string): string => {
    if (typeof jsonString !== 'string') {
      return JSON.stringify(jsonString); // Convert non-string to string
    }
    
    // Remove markdown code blocks if present (```json and ```)
    const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      return markdownMatch[1].trim();
    }
    
    return jsonString.trim();
  };

  // New function to extract trip data from the complex AI response structure
  const extractTripData = (responseData: any) => {
    console.log("Processing response data structure:", responseData);
    
    // Check for different possible data structures
    if (responseData?.destination) {
      // Standard format already
      return responseData;
    }
    
    // Format with Primary/Alternative Itinerary
    if (responseData?.["Primary Itinerary"]) {
      // Extract data from the Primary Itinerary format
      const primaryItinerary = responseData["Primary Itinerary"];
      const alternativeItinerary = responseData["Alternative Itinerary (Bad Weather Plan)"];
      const packingList = responseData["Packing List"];
      
      // Create a normalized structure that our components can use
      const destination = primaryItinerary.notes?.split("!")[0].trim() || "Your Destination";
      const dateRange = "Your Travel Dates";
      
      // Convert primary itinerary days to our mainPlan format
      const mainPlan = primaryItinerary.days?.map((day: any) => ({
        day: `${day.dayOfWeek} (${day.date})`,
        activity: `${day.morning} ${day.afternoon} ${day.evening}`,
        weather: ""
      })) || [];
      
      // Convert alternative itinerary to our alternativePlan format
      const alternativePlan = alternativeItinerary?.plan?.map((item: any) => ({
        day: item.time || "Any time",
        activity: item.activity,
        weather: alternativeItinerary.weatherType || ""
      })) || [];
      
      // Convert packing list to equipment format
      const equipment = [
        ...(packingList?.mustHaves?.map((item: string) => ({ name: item })) || []),
        ...(packingList?.niceToHave?.map((item: string) => ({ name: item })) || [])
      ];
      
      return {
        destination,
        dateRange,
        mainPlan,
        alternativePlan,
        equipment
      };
    }
    
    // Fallback: return minimal structure with whatever is available
    return {
      destination: "Your Destination",
      dateRange: "Your Travel Dates",
      mainPlan: [],
      alternativePlan: [],
      equipment: []
    };
  };

  useEffect(() => {
    const fetchLatestTripPlan = async () => {
      try {
        setLoading(true);
        setParsingError(null);
        const latestPlan = await getLatestTripImagePlan();
        
        if (latestPlan) {
          // Set image URL if available
          if (latestPlan["Image URL"]) {
            if (typeof latestPlan["Image URL"] === 'string') {
              setImageURL(latestPlan["Image URL"]);
            } else if (latestPlan["Image URL"] !== null) {
              // Handle case where Image URL might be stored as JSON
              setImageURL(String(latestPlan["Image URL"]));
            }
          }
          
          // Parse AI response if available
          if (latestPlan.Response) {
            try {
              // Store raw response for debugging
              if (typeof latestPlan.Response === 'string') {
                setRawResponse(latestPlan.Response);
              } else {
                setRawResponse(JSON.stringify(latestPlan.Response));
              }
              
              // Get response content
              let responseData;
              
              if (typeof latestPlan.Response === 'string') {
                // Clean up potential markdown formatting
                const cleanedJson = cleanJsonString(latestPlan.Response);
                responseData = JSON.parse(cleanedJson);
              } else {
                // If it's already a JSON object (not a string)
                responseData = latestPlan.Response;
              }
              
              // Debug log the parsed data
              console.log("Successfully parsed trip data:", responseData);
              
              if (responseData) {
                // Process the complex response structure into a normalized format
                const normalizedData = extractTripData(responseData);
                
                // Update trip data with the normalized response
                setTripData({
                  destination: normalizedData.destination || "Your Destination",
                  dateRange: normalizedData.dateRange || "Your Travel Dates",
                  mainPlan: Array.isArray(normalizedData.mainPlan) ? normalizedData.mainPlan : [],
                  alternativePlan: Array.isArray(normalizedData.alternativePlan) ? normalizedData.alternativePlan : [],
                  equipment: normalizedData.equipment 
                    ? normalizedData.equipment.map((item: any) => ({
                        name: item.name,
                        icon: getIconForEquipment(item.name)
                      })) 
                    : []
                });
              }
            } catch (error) {
              console.error("Error parsing AI response:", error);
              setParsingError(`Failed to parse trip data: ${error instanceof Error ? error.message : String(error)}`);
              
              // Log the raw response for debugging
              console.error("Raw response data:", latestPlan.Response);
              toast.error("Failed to parse trip data");
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

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          {loading ? (
            <LoadingState />
          ) : parsingError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              <h3 className="font-medium mb-2">Error parsing trip data</h3>
              <p className="text-sm">{parsingError}</p>
              
              {/* Debug section to show raw response */}
              {rawResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 overflow-auto max-h-60">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Raw Response Data (Debug)</h4>
                  <pre className="text-xs">{rawResponse}</pre>
                </div>
              )}
              
              <div className="mt-4">
                <ActionButtons />
              </div>
            </div>
          ) : (
            <>
              <TripHeader destination={tripData.destination} dateRange={tripData.dateRange} />
              <TripImage imageURL={imageURL} destination={tripData.destination} />
              <TripPlanDisplays mainPlan={tripData.mainPlan} alternativePlan={tripData.alternativePlan} />
              <PackingList equipment={tripData.equipment} />
              <ActionButtons />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
