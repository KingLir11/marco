
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
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    async function fetchTripData() {
      try {
        setLoading(true);
        setIsUsingMockData(false);
        
        // Debug the tripId received
        console.log("useTripData called with tripId:", tripId);
        
        // First, let's check if the table exists and has data by doing a count query
        const { count, error: countError } = await supabase
          .from('trip_plans')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error("Error checking trip_plans table:", countError);
          toast.error("Database connection error. Check console for details.");
          throw countError;
        }
        
        console.log("Total trips in database:", count);
        
        // If there are no trips at all in the database, show appropriate message
        if (count === 0) {
          console.log("No trips exist in the database at all");
          setIsUsingMockData(true);
          toast.info("No trips found in database. Using sample data.");
          setTripData(mockTripData);
          setLoading(false);
          return;
        }
        
        // Proceed with regular query
        let query = supabase.from('trip_plans').select('*');
        
        // If a specific tripId is provided, fetch just that trip
        if (tripId && tripId !== ':tripId') {
          console.log("Fetching specific trip with ID:", tripId);
          query = query.eq('id', tripId);
        } else {
          // Otherwise get the most recent trip
          console.log("Fetching most recent trip");
          query = query.order('created_at', { ascending: false }).limit(1);
        }
        
        const { data, error } = await query;
        console.log("Query results:", { data, error });
        
        if (error) {
          console.error("Supabase error:", error);
          toast.error(`Database error: ${error.message}`);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Retrieved trip data:", data[0]);
          const formattedData = convertToTripData(data[0]);
          console.log("Formatted trip data:", formattedData);
          setTripData(formattedData);
          setIsUsingMockData(false);
          toast.success("Trip plan loaded successfully");
        } else {
          console.log("No matching trip data found for the query");
          setIsUsingMockData(true);
          
          if (tripId && tripId !== ':tripId') {
            toast.error(`Trip with ID ${tripId} not found, but other trips exist in database`);
          } else {
            toast.info("No trips match your query. Using sample data instead.");
          }
          // Use mock data if no data found
          setTripData(mockTripData);
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Error loading trip data");
        // Fallback to mock data
        setTripData(mockTripData);
        setIsUsingMockData(true);
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

  return { 
    tripData: enhancedTripData, 
    loading, 
    error, 
    isUsingMockData 
  };
}
