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
  const [textResponse, setTextResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTripPlan = async () => {
      try {
        setLoading(true);
        const latestPlan = await getLatestTripImagePlan();
        
        if (latestPlan) {
          setImageURL(latestPlan["Image URL"]);
          
          // Parse AI response if available
          if (latestPlan.Response) {
            try {
              // Try to parse as JSON
              const parsedResponse = JSON.parse(latestPlan.Response);
              if (parsedResponse) {
                // Update trip data with the parsed response
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
                setTextResponse(null);
              }
            } catch (error) {
              // If JSON parsing fails, treat it as plain text
              console.error("Error parsing AI response as JSON:", error);
              console.log("Displaying response as plain text instead");
              setTextResponse(latestPlan.Response);
              
              // Set basic trip data
              setTripData({
                destination: "Your Trip",
                dateRange: "Your Travel Dates",
                mainPlan: [],
                alternativePlan: [],
                equipment: []
              });
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
          ) : (
            <>
              <TripHeader destination={tripData.destination} dateRange={tripData.dateRange} />
              <TripImage imageURL={imageURL} destination={tripData.destination} />
              
              {textResponse ? (
                // Display plain text response if JSON parsing failed
                <div className="my-8 p-6 bg-blue-50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Your Trip Plan</h2>
                  <div className="prose max-w-none whitespace-pre-wrap">
                    {textResponse}
                  </div>
                </div>
              ) : (
                // Otherwise display structured data
                <TripPlanDisplays mainPlan={tripData.mainPlan} alternativePlan={tripData.alternativePlan} />
              )}
              
              {!textResponse && tripData.equipment.length > 0 && (
                <PackingList equipment={tripData.equipment} />
              )}
              
              <ActionButtons />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
