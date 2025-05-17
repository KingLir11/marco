
import React from "react";
import { Progress } from "@/components/ui/progress";

export const TripLoader = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-12 p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="relative mb-6">
          <div className="h-16 w-40 bg-[#79A9CE]/40 rounded-full animate-cloud-move mb-4"></div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Loading Your Trip Plan</h2>
        
        <div className="animate-pulse space-y-6 w-full">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
            <div className="h-64 bg-gray-100 rounded shadow"></div>
            <div className="h-64 bg-gray-100 rounded shadow"></div>
          </div>
          
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 max-w-md w-full">
          <Progress value={66} className="h-1 mb-2" />
          <p className="text-center text-gray-600">Retrieving your personalized trip details...</p>
        </div>
      </div>
    </div>
  );
};
