
import { z } from "zod";

// Schema for daily activity items
export const dailyActivitySchema = z.object({
  day: z.string().default("Unknown day"),
  activity: z.string().default("No activity planned"),
  weather: z.string().default("Weather data unavailable")
});

// Schema for equipment items
export const equipmentItemSchema = z.object({
  name: z.string().default("Unknown item")
  // icon will be added by the UI component
});

// Schema for full trip data
export const tripDataSchema = z.object({
  mainPlan: z.array(dailyActivitySchema).default([]),
  alternativePlan: z.array(dailyActivitySchema).default([]),
  equipment: z.array(equipmentItemSchema).default([])
});

// Parse and normalize trip plan data
export const normalizeTripPlanData = (jsonData: any) => {
  try {
    // Handle common AI output variations
    const dataToValidate = {
      mainPlan: jsonData.mainPlan || 
                jsonData.main_plan || 
                jsonData.primaryPlan || 
                jsonData.primary_plan || 
                jsonData.plan ||
                [],
      
      alternativePlan: jsonData.alternativePlan || 
                       jsonData.alternative_plan || 
                       jsonData.secondaryPlan || 
                       jsonData.secondary_plan || 
                       jsonData.backupPlan || 
                       jsonData.backup_plan ||
                       [],
      
      equipment: jsonData.equipment || 
                 jsonData.gear || 
                 jsonData.items || 
                 jsonData.packing_list || 
                 jsonData.packingList ||
                 []
    };

    // Validate and return normalized data
    return tripDataSchema.parse(dataToValidate);
  } catch (error) {
    console.error("Error normalizing trip data:", error);
    // Return default empty data structure on error
    return tripDataSchema.parse({});
  }
};
