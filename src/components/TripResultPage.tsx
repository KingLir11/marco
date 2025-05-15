
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Umbrella, Sun, Wind, Mountain, Map, Route, Compass, Loader2, Backpack, List } from "lucide-react";
import { Link } from "react-router-dom";
import { getLatestTripImagePlan } from "@/services/tripImageService";
import { toast } from "@/components/ui/sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const TripResultPage = () => {
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState({
    destination: "",
    dateRange: "",
    mainPlan: [] as { day: string; activity: string; weather: string }[],
    alternativePlan: [] as { day: string; activity: string; weather: string }[],
    equipment: [] as { name: string; icon: JSX.Element }[]
  });
  const [imageURL, setImageURL] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTripPlan = async () => {
      try {
        setLoading(true);
        const latestPlan = await getLatestTripImagePlan();
        
        if (latestPlan) {
          setImageURL(latestPlan.ImageURL);
          
          // Parse AI response if available
          if (latestPlan.Response) {
            try {
              const parsedResponse = JSON.parse(latestPlan.Response);
              if (parsedResponse) {
                // Update trip data with the parsed response
                setTripData({
                  destination: parsedResponse.destination || "Your Destination",
                  dateRange: parsedResponse.dateRange || "Your Travel Dates",
                  mainPlan: parsedResponse.mainPlan || [],
                  alternativePlan: parsedResponse.alternativePlan || [],
                  equipment: parsedResponse.equipment ? parsedResponse.equipment.map((item: any) => ({
                    name: item.name,
                    icon: getIconForEquipment(item.name)
                  })) : []
                });
              }
            } catch (error) {
              console.error("Error parsing AI response:", error);
              toast.error("Failed to parse trip data");
            }
          }
        } else {
          toast.error("No trip plan found. Please create a new trip plan.");
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
      "Compass": <Compass className="h-5 w-5" />,
      "Navigation": <Route className="h-5 w-5" />
    };
    
    return iconMap[name] || <Map className="h-5 w-5" />;
  };

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg">Loading your trip plan...</p>
            </div>
          ) : (
            <>
              <header className="mb-8">
                <h1 className="text-4xl font-bold font-playfair mb-2">{tripData.destination}</h1>
                <p className="text-gray-600">{tripData.dateRange}</p>
              </header>
              
              {/* Featured image section */}
              {imageURL && (
                <div className="mb-10 border rounded-lg overflow-hidden shadow-lg">
                  <AspectRatio ratio={16/9}>
                    <img 
                      src={imageURL} 
                      alt={`${tripData.destination} preview`} 
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <Card className="border border-white/20 shadow-lg">
                  <CardHeader className="bg-primary/10 border-b">
                    <CardTitle className="text-primary">Main Plan</CardTitle>
                    <CardDescription>Optimized for the forecast weather</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {tripData.mainPlan.length > 0 ? (
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
                    ) : (
                      <p className="text-gray-500 italic">No main plan activities yet.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-white/20 shadow-lg">
                  <CardHeader className="bg-secondary/10 border-b">
                    <CardTitle className="text-secondary">Alternative Plan</CardTitle>
                    <CardDescription>In case of weather changes</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {tripData.alternativePlan.length > 0 ? (
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
                    ) : (
                      <p className="text-gray-500 italic">No alternative plan activities yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Dedicated packing list section */}
              {tripData.equipment.length > 0 && (
                <Card className="mb-10 border border-white/20 shadow-lg">
                  <CardHeader className="bg-green-50 border-b">
                    <div className="flex items-center">
                      <Backpack className="h-6 w-6 text-green-600 mr-2" />
                      <CardTitle className="text-green-600">Packing List</CardTitle>
                    </div>
                    <CardDescription>Recommended equipment for your trip</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Item</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tripData.equipment.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="bg-primary/10 p-2 rounded-full">
                                {item.icon}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
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
