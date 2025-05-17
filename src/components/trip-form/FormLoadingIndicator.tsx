
import React from "react";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/trip-form/LoadingState";
import { Loader2 } from "lucide-react";

interface FormLoadingIndicatorProps {
  progress: number;
  processingState: 'idle' | 'sending' | 'waiting';
}

export const FormLoadingIndicator: React.FC<FormLoadingIndicatorProps> = ({ 
  progress, 
  processingState 
}) => {
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
      </div>
    </div>
  );
};
