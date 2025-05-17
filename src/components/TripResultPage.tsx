
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
  const [rawResponse, setRawResponse] = useState<Json | null>(null);

  useEffect(() => {
    const fetchLatestTripPlan = async () => {
      try {
        setLoading(true);
        const latestPlan = await getLatestTripImagePlan();
        
        if (latestPlan) {
          setImageURL(latestPlan["Image URL"]);
          
          // Store raw response for fallback display
          if (latestPlan.Response) {
            setRawResponse(latestPlan.Response);
            
            // Try to parse as JSON if it's a string
            if (typeof latestPlan.Response === 'string') {
              try {
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
                }
              } catch (error) {
                console.error("Error parsing AI response:", error);
                toast.info("Trip data available in text format");
                
                // Set default trip data with placeholders since we couldn't parse JSON
                setTripData({
                  destination: "Trip Destination",
                  dateRange: "Your Travel Dates",
                  mainPlan: [],
                  alternativePlan: [],
                  equipment: []
                });
              }
            } else if (typeof latestPlan.Response === 'object' && latestPlan.Response !== null) {
              // If Response is already a JSON object, use it directly
              const responseObj = latestPlan.Response as any;
              setTripData({
                destination: responseObj.destination || "Your Destination",
                dateRange: responseObj.dateRange || "Your Travel Dates",
                mainPlan: responseObj.mainPlan || [],
                alternativePlan: responseObj.alternativePlan || [],
                equipment: responseObj.equipment ? responseObj.equipment.map((item: any) => ({
                  name: item.name,
                  icon: getIconForEquipment(item.name)
                })) : []
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

  // Helper function to safely display raw response as string
  const renderRawResponse = () => {
    if (!rawResponse) return null;
    
    if (typeof rawResponse === 'string') {
      return rawResponse;
    } else {
      return JSON.stringify(rawResponse, null, 2);
    }
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
              
              {/* Display structured data if available */}
              {(tripData.mainPlan.length > 0 || tripData.alternativePlan.length > 0) ? (
                <TripPlanDisplays mainPlan={tripData.mainPlan} alternativePlan={tripData.alternativePlan} />
              ) : rawResponse ? (
                // Fallback to displaying raw response when JSON parsing failed
                <div className="mb-10 prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Your Trip Plan</h3>
                  <div className="bg-white/80 p-6 rounded-lg shadow-sm border">
                    <pre className="whitespace-pre-wrap text-sm">{renderRawResponse()}</pre>
                  </div>
                </div>
              ) : null}
              
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
