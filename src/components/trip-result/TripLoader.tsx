
import React from "react";

export const TripLoader = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-12 p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex flex-col items-center justify-center py-10">
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
        <p className="text-center mt-8 text-gray-600">Loading your trip plan...</p>
      </div>
    </div>
  );
};
