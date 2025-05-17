
import React from "react";
import { useTripData } from "@/hooks/useTripData";
import TripHeader from "@/components/trip/TripHeader";
import TripContent from "@/components/trip/TripContent";
import TripActions from "@/components/trip/TripActions";
import TripLoader from "@/components/trip/TripLoader";

const TripResultPage = () => {
  // Use our custom hook to fetch trip data
  const { isLoading, tripData, tripTextContent, dateRange } = useTripData();

  if (isLoading) {
    return <TripLoader />;
  }

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          <TripHeader destination={tripData?.destination} dateRange={dateRange} />
          <TripContent tripTextContent={tripTextContent} />
          <TripActions />
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
