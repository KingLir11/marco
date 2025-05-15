
import React from "react";

interface TripHeaderProps {
  destination: string;
  dateRange: string;
}

const TripHeader = ({ destination, dateRange }: TripHeaderProps) => {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold font-playfair mb-2">{destination}</h1>
      <p className="text-gray-600">{dateRange}</p>
    </header>
  );
};

export default TripHeader;
