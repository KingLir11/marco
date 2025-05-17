
/**
 * Utility functions for processing trip data
 */

// Helper function to strip markdown code blocks if present
export const cleanJsonString = (jsonString: string): string => {
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

// Extract trip data from the complex AI response structure
export const extractTripData = (responseData: any) => {
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
