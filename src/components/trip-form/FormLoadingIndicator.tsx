
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
  return (
    <div className="space-y-8">
      <LoadingState />
      
      <div className="space-y-2">
        <p className="text-center text-gray-700">
          {processingState === 'sending' ? 'Sending your request...' : 'Creating your perfect trip plan...'}
        </p>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-gray-500">This may take up to a minute</p>
      </div>
    </div>
  );
};
