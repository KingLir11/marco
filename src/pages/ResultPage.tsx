
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTripPlanStore } from "@/stores/tripPlanStore";
import TripPlanDisplay from "@/components/TripPlanDisplay";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

const ResultPage = () => {
  const { currentPlan } = useTripPlanStore();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        {currentPlan ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold font-playfair">Your Trip to {currentPlan.destination}</h1>
              <div className="flex justify-center items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentPlan.startDate} to {currentPlan.endDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentPlan.destination}</span>
                </div>
              </div>
            </div>
            
            {currentPlan.imageUrl && (
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-xl">
                <img 
                  src={currentPlan.imageUrl} 
                  alt={`${currentPlan.destination} trip`} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            )}
            
            <TripPlanDisplay plan={currentPlan} />
            
            <div className="flex justify-center gap-4 pt-4">
              <Button asChild>
                <Link to="/plan">Plan Another Trip</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/my-trips">My Trips</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-8 max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">No Trip Plan Available</h2>
            <p className="text-gray-600">
              It looks like there's no trip plan data available. Please create a new trip plan.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link to="/plan">Plan a Trip</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/my-trips">My Trips</Link>
              </Button>
            </div>
          </Card>
        )}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default ResultPage;
