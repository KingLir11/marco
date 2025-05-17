
import React from "react";
import { useTripDataProcessing } from "@/hooks/use-trip-data-processing";

// Import refactored components
import LoadingState from "./trip-result/LoadingState";
import TripHeader from "./trip-result/TripHeader";
import TripImage from "./trip-result/TripImage";
import TripPlanDisplays from "./trip-result/TripPlanDisplays";
import PackingList from "./trip-result/PackingList";
import ActionButtons from "./trip-result/ActionButtons";
import DebugError from "./trip-result/DebugError";

interface TripResultPageProps {
  webhookData?: any;
}

const TripResultPage = ({ webhookData }: TripResultPageProps) => {
  const { loading, tripData, imageURL, parsingError, rawResponse } = useTripDataProcessing(webhookData);

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 border border-white/20">
          {loading ? (
            <LoadingState />
          ) : parsingError ? (
            <DebugError parsingError={parsingError} rawResponse={rawResponse} />
          ) : (
            <>
              <TripHeader destination={tripData.destination} dateRange={tripData.dateRange} />
              <TripImage imageURL={imageURL} destination={tripData.destination} />
              <TripPlanDisplays mainPlan={tripData.mainPlan} alternativePlan={tripData.alternativePlan} />
              <PackingList equipment={tripData.equipment} />
              <ActionButtons />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;
