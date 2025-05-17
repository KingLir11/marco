
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TripData } from '@/lib/types/tripTypes';
import { mockTripData, convertToTripData, enhanceTripDataWithIcons } from '@/lib/utils/tripDataUtils';
import React from 'react';
import { toast } from "@/components/ui/sonner";

export function useTripData(tripId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tripData, setTripData] = useState<TripData>(mockTripData);

  useEffect(() => {
    async function fetchTripData() {
      try {
        setLoading(true);
        
        let query = supabase.from('trip_plans').select('*');
        
        // If a specific tripId is provided, fetch just that trip
        // Make sure tripId isn't the route parameter placeholder
        if (tripId && tripId !== ':tripId') {
          console.log("Fetching specific trip with ID:", tripId);
          query = query.eq('id', tripId);
        } else {
          // Otherwise get the most recent trip
          console.log("Fetching most recent trip");
          query = query.order('created_at', { ascending: false }).limit(1);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Retrieved trip data:", data[0]);
          const formattedData = convertToTripData(data[0]);
          console.log("Formatted trip data:", formattedData);
          setTripData(formattedData);
          toast.success("Trip plan loaded successfully");
        } else {
          console.log("No trip data found, using mock data");
          toast.info("Using sample trip data - no trips found in database");
          // Use mock data if no data found
          setTripData(mockTripData);
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Error loading trip data");
        // Fallback to mock data
        setTripData(mockTripData);
      } finally {
        setLoading(false);
      }
    }

    fetchTripData();
  }, [tripId]);

  // Add icon components to equipment items
  const enhancedTripData = React.useMemo(() => 
    enhanceTripDataWithIcons(tripData)
  , [tripData]);

  return { tripData: enhancedTripData, loading, error };
}
