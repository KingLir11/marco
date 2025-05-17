
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Umbrella, Sun, Wind, Mountain, Map, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const TripResultPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tripData, setTripData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
          
          // Get the text plan directly from the trip record
          if (trip.text_plan) {
            setTripTextContent(trip.text_plan);
          }
          
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

  // Fallback plan text
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
  const fallbackTripData = {
    destination: "Swiss Alps",
    start_date: "2023-06-10",
    end_date: "2023-06-17",
    style: "nature",
    budget: 500
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
      default: return <Mountain className="h-5 w-5" />;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Function to convert plain text with markdown-style formatting to HTML
  const formatTripText = (text: string | null) => {
    if (!text) return [];
    
    // Split text into paragraphs
    return text.split('\n').map((line, index) => {
      // Handle headers (###)
      if (line.startsWith('###')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      }
      // Handle subheaders (**)
      else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return <h4 key={index} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '').trim()}</h4>;
      }
      // Handle list items (-)
      else if (line.trim().startsWith('-')) {
        return <li key={index} className="ml-4">{line.replace('-', '').trim()}</li>;
      }
      // Regular paragraph, but only if not empty
      else if (line.trim()) {
        return <p key={index} className="mb-2">{line}</p>;
      }
      // Empty line
      return <br key={index} />;
    });
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
          
          <div className="mb-10 prose prose-sm max-w-none">
            {tripTextContent ? (
              <div className="bg-white/80 p-6 rounded-lg shadow-sm">
                {formatTripText(tripTextContent)}
              </div>
            ) : (
              <p className="text-center text-gray-500">Your personalized trip plan is being created...</p>
            )}
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
