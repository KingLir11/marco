
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Define a proper interface for our trip data
export interface TripData {
  id: string;
  created_at: string;
  text_plan: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  style?: string;
  budget?: number;
}

// Create fallback trip plan content
const fallbackTripPlan = `
Hey there! Planning a relaxed trip to the Swiss Alps? Awesome choice!

### Primary Itinerary

**Day 1: Arrival and Settling In**
- Morning: Arrive at Zurich Airport
- Afternoon: Train journey to your mountain lodge
- Evening: Relax and enjoy dinner with mountain views

**Day 2: Hiking Adventure**
- Morning: Breakfast at the lodge
- Day: Guided hiking trail to Alpine Lake
- Evening: Traditional Swiss dinner

**Day 3: Mountain Exploration**
- Morning: Cable car to Mountain Peak
- Afternoon: Photography and lunch at altitude
- Evening: Relax at the lodge spa

**Day 4: Village Experience**
- Morning: Visit to local cheese maker
- Afternoon: Explore village and markets
- Evening: Fondue dinner experience

**Day 5: Adventure Day**
- Full day: Mountain biking adventure
- Evening: Farewell dinner
`;

// Fallback data when trip is not yet loaded
const fallbackTripData: TripData = {
  id: "fallback-id",
  created_at: new Date().toISOString(),
  text_plan: fallbackTripPlan,
  destination: "Swiss Alps",
  start_date: "2023-06-10",
  end_date: "2023-06-17",
  style: "nature",
  budget: 500
};

export const useTripData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [tripTextContent, setTripTextContent] = useState<string | null>(null);

  useEffect(() => {
    // Get the destination from local storage (set during form submission)
    const destination = localStorage.getItem("lastTripDestination");
    
    const fetchLatestTrip = async () => {
      try {
        setIsLoading(true);
        
        if (!destination) {
          toast.error("Trip destination not found");
          return;
        }

        // Using explicit type casting to avoid deep instantiation errors
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("destination", destination)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Explicitly cast the data to our TripData interface
          const trip = data[0] as unknown as TripData;
          setTripData(trip);
          
          // Get the text plan directly from the trip record
          if (trip.text_plan) {
            setTripTextContent(trip.text_plan);
          }
        } else {
          // If no data yet, fallback to mock data
          setTripData(fallbackTripData);
          setTripTextContent(fallbackTripPlan);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
        toast.error("Failed to load trip plan");
        setTripData(fallbackTripData);
        setTripTextContent(fallbackTripPlan);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestTrip();
  }, []);

  // Format date range for display
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const dateRange = tripData && tripData.start_date && tripData.end_date 
    ? formatDateRange(tripData.start_date, tripData.end_date) 
    : "";

  return {
    isLoading,
    tripData,
    tripTextContent,
    dateRange
  };
};
