import React, { useState, useEffect } from "react";

export const LoadingState: React.FC = () => {
  const [message, setMessage] = useState("Matching your route with the weather forecast...");
  
  // Show different messages over time to keep the user engaged
  useEffect(() => {
    const messages = [
      "Matching your route with the weather forecast...",
      "Finding the best activities for your style...",
      "Checking local events and attractions...",
      "Creating your personalized travel plan...",
      "Finalizing alternative options for your trip...",
      "Almost ready with your adventure plan..."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6">
      <div className="relative">
        <div className="flex space-x-2">
          <div className="h-16 w-40 bg-[#79A9CE]/40 rounded-full animate-cloud-move mb-4"></div>
          <div className="h-12 w-28 bg-[#79A9CE]/30 rounded-full animate-cloud-move-slow mt-2"></div>
        </div>
        
        <div className="h-3 w-3 bg-primary rounded-full animate-ping absolute top-full left-1/2 -translate-x-1/2"></div>
      </div>
      
      <div className="text-center max-w-md">
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">This may take up to a minute or two</p>
      </div>
      
      {/* Animated progress dots */}
      <div className="flex space-x-2 mt-4">
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse"></div>
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse delay-150"></div>
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
};
