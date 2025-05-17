
import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative">
        <div className="h-16 w-40 bg-[#79A9CE]/40 rounded-full animate-cloud-move mb-4"></div>
        <p className="text-center text-lg font-medium">Matching your route with the weather forecast...</p>
      </div>
    </div>
  );
};
