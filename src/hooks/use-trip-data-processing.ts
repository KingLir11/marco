
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { getLatestTripImagePlan } from "@/services/tripImageService";
import { getIconForEquipment } from "@/components/trip-result/utils/equipmentIcons";
import { cleanJsonString, extractTripData } from "@/components/trip-result/utils/dataProcessing";

interface TripData {
  destination: string;
  dateRange: string;
  mainPlan: { day: string; activity: string; weather: string }[];
  alternativePlan: { day: string; activity: string; weather: string }[];
  equipment: { name: string; icon: JSX.Element }[];
}

export const useTripDataProcessing = (webhookData?: any) => {
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState<TripData>({
    destination: "",
    dateRange: "",
    mainPlan: [],
    alternativePlan: [],
    equipment: []
  });
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        setParsingError(null);
        
        let responseData: any = null;
        let imageUrl: string | null = null;
        
        // If webhook data is provided, use it
        if (webhookData) {
          console.log("Using webhook data:", webhookData);
          
          // Get image URL from webhook data
          if (webhookData.imageUrl || webhookData.imageURL || webhookData["Image URL"]) {
            imageUrl = webhookData.imageUrl || webhookData.imageURL || webhookData["Image URL"];
            
            // Clean the image URL if it's wrapped in quotes
            if (typeof imageUrl === 'string' && (imageUrl.startsWith('"') && imageUrl.endsWith('"'))) {
              imageUrl = imageUrl.slice(1, -1);
            }
            setImageURL(imageUrl);
          }
          
          // Get response data from webhook
          if (webhookData.tripPlan || webhookData.Response) {
            const rawResponseData = webhookData.tripPlan || webhookData.Response;
            
            // Store raw response for debugging
            if (typeof rawResponseData === 'string') {
              setRawResponse(rawResponseData);
            } else {
              setRawResponse(JSON.stringify(rawResponseData));
            }
            
            // Parse response data
            if (typeof rawResponseData === 'string') {
              const cleanedJson = cleanJsonString(rawResponseData);
              responseData = JSON.parse(cleanedJson);
            } else {
              responseData = rawResponseData;
            }
          }
        } else {
          // Fallback: fetch from Supabase
          const latestPlan = await getLatestTripImagePlan();
          
          if (latestPlan) {
            // Set image URL if available
            if (latestPlan["Image URL"]) {
              if (typeof latestPlan["Image URL"] === 'string') {
                imageUrl = latestPlan["Image URL"];
                
                // Clean the image URL if it's wrapped in quotes
                if (imageUrl.startsWith('"') && imageUrl.endsWith('"')) {
                  imageUrl = imageUrl.slice(1, -1);
                }
                setImageURL(imageUrl);
              } else if (latestPlan["Image URL"] !== null) {
                setImageURL(String(latestPlan["Image URL"]));
              }
            }
            
            // Parse AI response if available
            if (latestPlan.Response) {
              // Store raw response for debugging
              if (typeof latestPlan.Response === 'string') {
                setRawResponse(latestPlan.Response);
              } else {
                setRawResponse(JSON.stringify(latestPlan.Response));
              }
              
              // Get response content
              if (typeof latestPlan.Response === 'string') {
                // Clean up potential markdown formatting
                const cleanedJson = cleanJsonString(latestPlan.Response);
                responseData = JSON.parse(cleanedJson);
              } else {
                responseData = latestPlan.Response;
              }
            }
          } else {
            toast.error("No trip plan found. Please create a new trip plan.");
          }
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
        console.error("Error parsing trip data:", error);
        setParsingError(`Failed to parse trip data: ${error instanceof Error ? error.message : String(error)}`);
        
        // Log the raw response for debugging
        console.error("Raw response data:", webhookData?.Response || webhookData?.tripPlan || "No raw data available");
        toast.error("Failed to parse trip data");
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [webhookData]);

  return { loading, tripData, imageURL, parsingError, rawResponse };
};
