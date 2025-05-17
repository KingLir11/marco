import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TripData, TripPlanRecord, ParsedTripPlan } from '@/lib/types/tripTypes';
import { Mountain, Map, Compass, Sun, Umbrella, Wind } from 'lucide-react';
import React from 'react';

// Mock data for when we're in development or if data fetching fails
const mockTripData: TripData = {
  destination: "Swiss Alps",
  dateRange: "June 10-17, 2023",
  mainPlan: [
    { day: "Day 1", activity: "Arrival and check-in at Mountain Lodge", weather: "Sunny, 22°C" },
    { day: "Day 2", activity: "Hiking trail to Alpine Lake", weather: "Sunny, 24°C" },
    { day: "Day 3", activity: "Cable car to Mountain Peak", weather: "Partly Cloudy, 20°C" },
    { day: "Day 4", activity: "Visit to local village and markets", weather: "Sunny, 23°C" },
    { day: "Day 5", activity: "Mountain biking adventure", weather: "Cloudy, 19°C" },
  ],
  alternativePlan: [
    { day: "Day 2", activity: "Visit Alpine Museum", weather: "Rain, 15°C" },
    { day: "Day 3", activity: "Spa day at Mountain Lodge", weather: "Heavy Rain, 14°C" },
    { day: "Day 5", activity: "Indoor rock climbing center", weather: "Thunderstorm, 16°C" },
  ],
  equipment: [
    { name: "Hiking boots" },
    { name: "Rain jacket" },
    { name: "Sun protection" },
    { name: "Trail map" },
    { name: "Water bottle" },
    { name: "Compass" },
  ]
};

// Convert Supabase trip record to TripData format
const convertToTripData = (record: TripPlanRecord): TripData => {
  try {
    // Parse JSON string from trip_plan field if it's a string
    let tripPlanData: ParsedTripPlan = {};
    
    if (typeof record.trip_plan === 'string') {
      const parsed = JSON.parse(record.trip_plan);
      // Check if it's an array and take the first item if it is
      if (Array.isArray(parsed) && parsed.length > 0) {
        tripPlanData = parsed[0];
      } else {
        tripPlanData = parsed;
      }
    } else if (typeof record.trip_plan === 'object') {
      // Handle if already parsed as object
      if (Array.isArray(record.trip_plan) && record.trip_plan.length > 0) {
        tripPlanData = record.trip_plan[0];
      } else {
        tripPlanData = record.trip_plan;
      }
    }
    
    // Format date range
    const startDate = new Date(record.start_date);
    const endDate = new Date(record.end_date);
    const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    
    // Ensure all required fields are present with proper validation
    const mainPlan = tripPlanData.mainPlan?.map(item => ({
      day: item.day || "Unknown Day",
      activity: item.activity || "No activity planned",
      weather: item.weather || "Weather data unavailable"
    })) || mockTripData.mainPlan;
    
    const alternativePlan = tripPlanData.alternativePlan?.map(item => ({
      day: item.day || "Unknown Day",
      activity: item.activity || "No activity planned",
      weather: item.weather || "Weather data unavailable"
    })) || mockTripData.alternativePlan;
    
    const equipment = tripPlanData.equipment?.map(item => ({
      name: item.name || "Unnamed equipment"
    })) || mockTripData.equipment;
    
    // Return properly formatted TripData
    return {
      id: record.id,
      destination: record.destination,
      dateRange,
      mainPlan,
      alternativePlan,
      equipment
    };
  } catch (error) {
    console.error("Error converting trip plan data:", error);
    return {
      ...mockTripData,
      id: record.id,
      destination: record.destination
    };
  }
};

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
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("Retrieved trip data:", data[0]);
          const formattedData = convertToTripData(data[0]);
          console.log("Formatted trip data:", formattedData);
          setTripData(formattedData);
        } else {
          console.log("No trip data found, using mock data");
          // Use mock data if no data found
          setTripData(mockTripData);
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fallback to mock data
        setTripData(mockTripData);
      } finally {
        setLoading(false);
      }
    }

    fetchTripData();
  }, [tripId]);

  // Add icon components to equipment items
  const enhancedTripData = React.useMemo(() => {
    const iconMap: Record<string, React.ReactNode> = {
      "Hiking boots": <Mountain className="h-5 w-5" />,
      "Rain jacket": <Umbrella className="h-5 w-5" />,
      "Sun protection": <Sun className="h-5 w-5" />,
      "Trail map": <Map className="h-5 w-5" />,
      "Water bottle": <Wind className="h-5 w-5" />,
      "Compass": <Compass className="h-5 w-5" />
    };
    
    return {
      ...tripData,
      equipment: tripData.equipment.map(item => ({
        ...item,
        icon: iconMap[item.name] || <Map className="h-5 w-5" />
      }))
    };
  }, [tripData]);

  return { tripData: enhancedTripData, loading, error };
}
