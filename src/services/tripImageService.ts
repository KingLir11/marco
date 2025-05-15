
import { supabase } from "@/integrations/supabase/client";

export interface TripImagePlan {
  created_at: string;
  ImageURL: string | null;
  Response: string | null;
}

export const getTripImagePlans = async (): Promise<TripImagePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('Images-Plan')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching trip image plans:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch trip image plans:', error);
    throw error;
  }
};

export const getLatestTripImagePlan = async (): Promise<TripImagePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('Images-Plan')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching latest trip image plan:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch latest trip image plan:', error);
    throw error;
  }
};
