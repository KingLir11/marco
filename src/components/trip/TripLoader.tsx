
import React from "react";

const TripLoader: React.FC = () => {
  return (
    <div className="py-20 px-4 flex justify-center items-center">
      <div className="container mx-auto max-w-5xl text-center">
        <p className="text-xl">Loading your trip plan...</p>
      </div>
    </div>
  );
};

export default TripLoader;
