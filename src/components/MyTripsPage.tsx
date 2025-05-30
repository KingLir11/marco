import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mountain, Sun, CloudMoonRain, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TripPlanRecord } from "@/lib/types/tripTypes";
import { toast } from "@/components/ui/sonner";

const getTripIcon = (destination: string) => {
  // Simple logic to assign icons based on destination
  const lowerDest = destination.toLowerCase();
  if (lowerDest.includes('mountain') || lowerDest.includes('alps') || lowerDest.includes('hill')) {
    return <Mountain className="h-12 w-12 text-primary" />;
  } else if (lowerDest.includes('beach') || lowerDest.includes('coast') || lowerDest.includes('island')) {
    return <Sun className="h-12 w-12 text-yellow-500" />;
  } else {
    return <CloudMoonRain className="h-12 w-12 text-blue-500" />;
  }
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

const MyTripsPage = () => {
  const [trips, setTrips] = useState<TripPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is coming from the planning page
  const comingFromPlan = location.state?.fromPlan || false;

  // Function to fetch trips that can be called multiple times
  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching trips...");
      
      const { data, error } = await supabase
        .from('trip_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        console.log(`Fetched ${data.length} trips`);
        // Convert the data to ensure it matches our TripPlanRecord type
        const formattedTrips: TripPlanRecord[] = data.map(trip => ({
          id: trip.id,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          trip_plan: trip.trip_plan,
          created_at: trip.created_at,
          user_id: trip.user_id || undefined
        }));
        
        setTrips(formattedTrips);
        
        // If we're auto-refreshing and we just got our first trip after plan submission,
        // navigate to the trip result page
        if (autoRefreshing && comingFromPlan && formattedTrips.length > 0) {
          const latestTrip = formattedTrips[0];
          // Stop auto-refresh and navigate to result page
          stopAutoRefresh();
          setAutoRefreshing(false);
          
          toast.success("Trip plan created! Showing details...");
          navigate(`/result/${latestTrip.id}`);
        }
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips. Please try again later.");
      // Use mock data if fetching fails
      setTrips([
        {
          id: "1",
          destination: "Swiss Alps",
          start_date: "2023-06-10",
          end_date: "2023-06-17",
          trip_plan: "{}",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [comingFromPlan, navigate, autoRefreshing]);

  // Set up auto-refreshing when component mounts
  useEffect(() => {
    fetchTrips();
    
    // If we're coming from the plan page, start auto-refreshing
    if (comingFromPlan) {
      console.log("Starting auto-refresh to detect new trip");
      toast.info("Waiting for trip creation...", { duration: 3000 });
      
      // Auto-refresh every 3 seconds to look for new trips
      const interval = setInterval(() => {
        if (autoRefreshing) {
          fetchTrips();
        }
      }, 3000);
      
      setRefreshInterval(interval);
      
      // After 30 seconds, stop auto-refreshing
      const timeout = setTimeout(() => {
        stopAutoRefresh();
        if (autoRefreshing) {
          toast.info("Stopped auto-refreshing. Use the refresh button if needed.");
          setAutoRefreshing(false);
        }
      }, 30000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    
    return undefined;
  }, [fetchTrips, comingFromPlan, autoRefreshing]);

  // Function to stop auto-refreshing
  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTrips(trips.filter(trip => trip.id !== id));
      toast.success("Trip deleted successfully");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip. Please try again.");
    }
  };

  const handleManualRefresh = () => {
    toast.info("Refreshing trips...");
    fetchTrips();
  };

  return (
    <div 
      className="min-h-screen py-20 px-4 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/lovable-uploads/76fb0b52-5610-43f9-b2cc-5b20a0978557.png')" }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold font-playfair mb-2">My Trips</h1>
              <p className="text-gray-600">Your saved trip plans</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={handleManualRefresh}
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </header>
          
          {autoRefreshing && comingFromPlan && (
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
              <p className="text-blue-800 flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Looking for your newly created trip plan...
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-4 text-gray-500">Loading your trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">You haven't saved any trips yet.</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/plan">Plan Your First Trip</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {trips.map((trip) => (
                <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-accent/10">
                    <div className="flex justify-center py-4">
                      {getTripIcon(trip.destination)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-xl font-playfair">{trip.destination}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{formatDateRange(trip.start_date, trip.end_date)}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-1">{new Date(trip.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/result/${trip.id}`}>View Details</Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/plan">Plan New Trip</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTripsPage;
