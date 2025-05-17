
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Umbrella, Sun, Wind, Mountain, Map, Route, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const TripResultPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tripData, setTripData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

        // Fetch the latest trip for this destination
        const { data: trips, error } = await supabase
          .from("trips")
          .select("*")
          .eq("destination", destination)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        if (trips && trips.length > 0) {
          const trip = trips[0];
          setTripData(trip);
          
          // If there's an image path, fetch the image URL
          if (trip.image_path) {
            const { data: imageData, error: imageError } = await supabase
              .storage
              .from("trip_images")
              .createSignedUrl(trip.image_path, 60 * 60); // 1 hour expiry

            if (!imageError && imageData) {
              setImageUrl(imageData.signedUrl);
            }
          }
        } else {
          // If no data yet, fallback to mock data
          setTripData(fallbackTripData);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
        toast.error("Failed to load trip plan");
        setTripData(fallbackTripData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestTrip();
  }, []);

  // Fallback data when trip is not yet loaded
  const fallbackTripData = {
    destination: "Swiss Alps",
    start_date: "2023-06-10",
    end_date: "2023-06-17",
    plan: {
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
        { name: "Hiking boots", icon: "mountain" },
        { name: "Rain jacket", icon: "umbrella" },
        { name: "Sun protection", icon: "sun" },
        { name: "Trail map", icon: "map" },
        { name: "Water bottle", icon: "wind" },
        { name: "Compass", icon: "compass" },
      ]
    }
  };

  // Map icon strings to Lucide React components
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "mountain": return <Mountain className="h-5 w-5" />;
      case "umbrella": return <Umbrella className="h-5 w-5" />;
      case "sun": return <Sun className="h-5 w-5" />;
      case "map": return <Map className="h-5 w-5" />;
      case "wind": return <Wind className="h-5 w-5" />;
      case "compass": return <Compass className="h-5 w-5" />;
      case "route": return <Route className="h-5 w-5" />;
      default: return <Mountain className="h-5 w-5" />;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  if (isLoading) {
    return (
      <div className="py-20 px-4 flex justify-center items-center">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-xl">Loading your trip plan...</p>
        </div>
      </div>
    );
  }

  // Format date range for display
  const dateRange = tripData ? formatDateRange(tripData.start_date, tripData.end_date) : "";
  const plan = tripData?.plan || {};

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          <header className="mb-8">
            <h1 className="text-4xl font-bold font-playfair mb-2">{tripData?.destination}</h1>
            <p className="text-gray-600">{dateRange}</p>
          </header>
          
          {imageUrl && (
            <div className="mb-8">
              <img 
                src={imageUrl} 
                alt={`${tripData?.destination} view`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <Card className="border border-white/20 shadow-lg">
              <CardHeader className="bg-primary/10 border-b">
                <CardTitle className="text-primary">Main Plan</CardTitle>
                <CardDescription>Optimized for the forecast weather</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.mainPlan?.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between border-b pb-2 last:border-0">
                      <div>
                        <span className="font-semibold">{item.day}:</span> {item.activity}
                      </div>
                      <div className="text-sm text-gray-600">{item.weather}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border border-white/20 shadow-lg">
              <CardHeader className="bg-secondary/10 border-b">
                <CardTitle className="text-secondary">Alternative Plan</CardTitle>
                <CardDescription>In case of weather changes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.alternativePlan?.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between border-b pb-2 last:border-0">
                      <div>
                        <span className="font-semibold">{item.day}:</span> {item.activity}
                      </div>
                      <div className="text-sm text-gray-600">{item.weather}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-playfair font-semibold mb-4">Recommended Equipment</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {plan.equipment?.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="bg-primary/10 p-2 rounded-full mb-2">
                    {getIconComponent(item.icon)}
                  </div>
                  <span className="text-sm text-center">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/my-trips">Save Trip</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Link to="/plan">Plan Another Trip</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
