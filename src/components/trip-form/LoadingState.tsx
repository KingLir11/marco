
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export const LoadingState: React.FC = () => {
  const [message, setMessage] = useState("Matching your route with the weather forecast...");
  const [showManualButton, setShowManualButton] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
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
    
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set a new interval
    intervalRef.current = window.setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 4000);
    
    // Show manual button after 15 seconds as a fallback
    const buttonTimeout = setTimeout(() => {
      setShowManualButton(true);
      toast.info("You can proceed to view results now or wait for automatic redirection");
    }, 15000);

    // Track elapsed time
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      clearTimeout(buttonTimeout);
    };
  }, []);
  
  // Manual navigation handler
  const handleManualNavigate = () => {
    console.log("Manual navigation to result page requested");
    toast.info("Navigating to results page");
    navigate("/result");
  };
  
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
        <p className="text-sm text-gray-500 mt-2">
          {elapsedSeconds < 30 
            ? "This may take up to a minute or two" 
            : "Taking longer than expected. You may proceed to results"}
        </p>
      </div>
      
      {/* Animated progress dots */}
      <div className="flex space-x-2 mt-4">
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse"></div>
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse delay-150"></div>
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {/* Manual button for fallback navigation */}
      {showManualButton && (
        <div className="mt-8">
          <Button 
            onClick={handleManualNavigate}
            variant="secondary"
            className="animate-pulse"
          >
            View Trip Results
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {elapsedSeconds < 30
              ? "Want to check if results are ready?"
              : "Taking too long? Click to view your trip results."}
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingState;
