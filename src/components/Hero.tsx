
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen pt-20 pb-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center z-0" />
      
      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-playfair text-white drop-shadow-md">
              Plan a Trip <br /> Around the Weather
            </h1>
            <p className="mx-auto max-w-[700px] text-white md:text-xl drop-shadow">
              Let nature lead the way. Create a personalized itinerary based on the forecast.
            </p>
          </div>
          <div className="pt-6">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 rounded-md px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link to="/plan">Plan My Trip</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
