
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ArrowRight } from "lucide-react";

export const LoadingState: React.FC = () => {
  const [message, setMessage] = useState("Matching your route with the weather forecast...");
  const [showManualButton, setShowManualButton] = useState(false);
  const intervalRef = useRef<number | null>(null);
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
    
    // Show manual button after 10 seconds as a fallback (reduced from 20 seconds)
    const buttonTimeout = setTimeout(() => {
      setShowManualButton(true);
    }, 10000);
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearTimeout(buttonTimeout);
    };
  }, []);
  
  // Manual navigation handler
  const handleManualNavigate = () => {
    console.log("LoadingState: Manual navigation to result page requested");
    toast.info("Checking your trip results...");
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
        <p className="text-sm text-gray-500 mt-2">This may take up to a minute or two</p>
      </div>
      
      {/* Animated progress dots */}
      <div className="flex space-x-2 mt-4">
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse"></div>
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse delay-150"></div>
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {/* Manual button for fallback navigation - show earlier and make more prominent */}
      {showManualButton && (
        <div className="mt-8 animate-bounce">
          <Button 
            onClick={handleManualNavigate}
            variant="default"
            size="lg"
            className="gap-2"
          >
            View Trip Results
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Click to check if your trip plan is ready
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingState;
