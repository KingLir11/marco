
import React from "react";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/trip-form/LoadingState";

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
        <p className="text-center text-gray-700">
          {getMessage()}
        </p>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-gray-500">
          {progress < 90 ? "This may take up to a minute" : "Preparing your results..."}
        </p>
      </div>
    </div>
  );
};
