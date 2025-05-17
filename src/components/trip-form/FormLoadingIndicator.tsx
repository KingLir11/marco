
import React from "react";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/trip-form/LoadingState";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormLoadingIndicatorProps {
  progress: number;
  processingState: 'idle' | 'sending' | 'waiting';
}

export const FormLoadingIndicator: React.FC<FormLoadingIndicatorProps> = ({ 
  progress, 
  processingState 
}) => {
  const navigate = useNavigate();
  
  // Generate a message based on the current state and progress
  const getMessage = () => {
    if (processingState === 'sending') {
      return 'Sending your request...';
    } else if (processingState === 'waiting') {
      if (progress < 40) return 'Creating your perfect trip plan...';
      if (progress < 70) return 'Optimizing activities based on weather...';
      if (progress < 90) return 'Finalizing your trip details...';
      return 'Almost there! Just a moment...';
    }
    return 'Processing your request...';
  };
  
  const handleGoToMyTrips = () => {
    navigate('/my-trips', { state: { fromPlan: true }});
  };

  return (
    <div className="space-y-8">
      <LoadingState />
      
      <div className="space-y-2">
        <div className="flex justify-center items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          <p className="text-center text-gray-700">
            {getMessage()}
          </p>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <p className="text-center text-sm text-gray-500">
          {progress < 90 
            ? `This may take up to a minute (${processingState} state, ${Math.round(progress)}%)`
            : "Preparing your results..."
          }
        </p>
        
        {/* Show option to view My Trips after waiting for a while */}
        {processingState === 'waiting' && progress > 50 && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">
              Taking longer than expected? Your plan might already be available.
            </p>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2" 
              onClick={handleGoToMyTrips}
            >
              <RefreshCw className="h-4 w-4" /> View My Trips
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
