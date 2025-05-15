
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="flex flex-col justify-center items-center py-20 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg">Loading your trip plan...</p>
    </div>
  );
};

export default LoadingState;
