
import { supabase } from "@/integrations/supabase/client";

export interface TripImagePlan {
  created_at: string;
  ImageURL: string | null;
  Response: string | null;
}

export const getTripImagePlans = async (): Promise<TripImagePlan[]> => {
  console.log("Fetching all trip image plans");
  try {
    const { data, error } = await supabase
      .from('Images-Plan')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching trip image plans:', error);
      throw new Error(`Failed to fetch trip plans: ${error.message}`);
    }

    console.log(`Retrieved ${data?.length || 0} trip image plans`);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch trip image plans:', error);
    throw error;
  }
};

export const getLatestTripImagePlan = async (): Promise<TripImagePlan | null> => {
  console.log("Fetching latest trip image plan");
  try {
    const { data, error } = await supabase
      .from('Images-Plan')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching latest trip image plan:', error);
      throw new Error(`Failed to fetch latest trip plan: ${error.message}`);
    }

    console.log("Latest trip image plan:", data);
    return data;
  } catch (error) {
    console.error('Failed to fetch latest trip image plan:', error);
    throw error;
  }
};

// Add a new function to check if any trip plans exist
export const checkIfTripPlansExist = async (): Promise<boolean> => {
  console.log("Checking if any trip plans exist");
  try {
    const { count, error } = await supabase
      .from('Images-Plan')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking trip plans existence:', error);
      throw new Error(`Failed to check if trip plans exist: ${error.message}`);
    }

    const exists = count !== null && count > 0;
    console.log(`Trip plans exist: ${exists} (count: ${count})`);
    return exists;
  } catch (error) {
    console.error('Failed to check if trip plans exist:', error);
    throw error;
  }
};
