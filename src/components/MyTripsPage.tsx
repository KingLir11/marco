
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Mountain, Sun, CloudMoonRain } from "lucide-react";

const MyTripsPage = () => {
  // In a real app, this would come from an API or state management
  const trips = [
    {
      id: 1,
      destination: "Swiss Alps",
      dateRange: "June 10-17, 2023",
      thumbnail: <Mountain className="h-12 w-12 text-primary" />,
      weather: "Mostly sunny"
    },
    {
      id: 2,
      destination: "Barcelona",
      dateRange: "August 5-12, 2023",
      thumbnail: <Sun className="h-12 w-12 text-yellow-500" />,
      weather: "Hot and sunny"
    },
    {
      id: 3,
      destination: "Scottish Highlands",
      dateRange: "October 15-22, 2023",
      thumbnail: <CloudMoonRain className="h-12 w-12 text-blue-500" />,
      weather: "Cool with occasional rain"
    },
  ];

  return (
    <div 
      className="min-h-screen py-20 px-4 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/lovable-uploads/76fb0b52-5610-43f9-b2cc-5b20a0978557.png')" }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold font-playfair mb-2">My Trips</h1>
            <p className="text-gray-600">Your saved trip plans</p>
          </header>
          
          {trips.length === 0 ? (
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
                      {trip.thumbnail}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-xl font-playfair">{trip.destination}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{trip.dateRange}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-gray-600">Weather:</span>
                      <span className="ml-1">{trip.weather}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/result/${trip.id}`}>View Details</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
