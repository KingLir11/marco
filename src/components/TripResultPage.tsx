
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
                // Update trip data with the parsed response
                setTripData({
                  destination: responseData.destination || "Your Destination",
                  dateRange: responseData.dateRange || "Your Travel Dates",
                  mainPlan: Array.isArray(responseData.mainPlan) ? responseData.mainPlan : [],
                  alternativePlan: Array.isArray(responseData.alternativePlan) ? responseData.alternativePlan : [],
                  equipment: responseData.equipment 
                    ? responseData.equipment.map((item: any) => ({
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
