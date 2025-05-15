
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Umbrella, Sun, Wind, Mountain, Map, Route, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { getLatestTripImagePlan, TripImagePlan } from "@/services/tripImageService";
import { toast } from "@/components/ui/sonner";

const TripResultPage = () => {
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState({
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
      { name: "Hiking boots", icon: <Mountain className="h-5 w-5" /> },
      { name: "Rain jacket", icon: <Umbrella className="h-5 w-5" /> },
      { name: "Sun protection", icon: <Sun className="h-5 w-5" /> },
      { name: "Trail map", icon: <Map className="h-5 w-5" /> },
      { name: "Water bottle", icon: <Wind className="h-5 w-5" /> },
      { name: "Compass", icon: <Compass className="h-5 w-5" /> },
    ]
  });
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTripPlan = async () => {
      try {
        setLoading(true);
        const latestPlan = await getLatestTripImagePlan();
        
        if (latestPlan) {
          setImageURL(latestPlan.ImageURL);
          setAiResponse(latestPlan.Response);
          
          // Parse AI response if available
          if (latestPlan.Response) {
            try {
              const parsedResponse = JSON.parse(latestPlan.Response);
              if (parsedResponse) {
                // Update trip data with the parsed response
                setTripData(prevData => ({
                  ...prevData,
                  destination: parsedResponse.destination || prevData.destination,
                  dateRange: parsedResponse.dateRange || prevData.dateRange,
                  mainPlan: parsedResponse.mainPlan || prevData.mainPlan,
                  alternativePlan: parsedResponse.alternativePlan || prevData.alternativePlan,
                  equipment: parsedResponse.equipment ? parsedResponse.equipment.map((item: any) => ({
                    name: item.name,
                    icon: getIconForEquipment(item.name)
                  })) : prevData.equipment
                }));
              }
            } catch (error) {
              console.error("Error parsing AI response:", error);
              toast.error("Failed to parse trip data");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching trip plan:", error);
        toast.error("Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTripPlan();
  }, []);

  // Helper function to get icon based on equipment name
  const getIconForEquipment = (name: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "Hiking boots": <Mountain className="h-5 w-5" />,
      "Rain jacket": <Umbrella className="h-5 w-5" />,
      "Sun protection": <Sun className="h-5 w-5" />,
      "Trail map": <Map className="h-5 w-5" />,
      "Water bottle": <Wind className="h-5 w-5" />,
      "Compass": <Compass className="h-5 w-5" />
    };
    
    return iconMap[name] || <Map className="h-5 w-5" />;
  };

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <header className="mb-8">
                <h1 className="text-4xl font-bold font-playfair mb-2">{tripData.destination}</h1>
                <p className="text-gray-600">{tripData.dateRange}</p>
              </header>
              
              {imageURL && (
                <div className="mb-8">
                  <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    <img 
                      src={imageURL} 
                      alt={tripData.destination}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                      {tripData.mainPlan.map((item, index) => (
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
                      {tripData.alternativePlan.map((item, index) => (
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
                  {tripData.equipment.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        {item.icon}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
