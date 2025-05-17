
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import { useTripData } from "@/hooks/useTripData";
import { TripLoader } from "@/components/trip-result/TripLoader";

const TripResultPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { tripData, loading } = useTripData(tripId);

  // Display loading state with tripId for debugging
  if (loading) {
    return <TripLoader tripId={tripId} />;
  }

  console.log("Rendering trip result page with data:", tripData);

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          <header className="mb-8">
            <h1 className="text-4xl font-bold font-playfair mb-2">{tripData.destination}</h1>
            <p className="text-gray-600">{tripData.dateRange}</p>
          </header>
          
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
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
