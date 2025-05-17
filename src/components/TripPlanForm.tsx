
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripFormSchema, TripFormData } from "@/lib/schemas/tripPlanSchema";
import { useTripSubmission } from "@/hooks/useTripSubmission";
import { FormLoadingIndicator } from "@/components/trip-form/FormLoadingIndicator";
import { TripFormContainer } from "@/components/trip-form/TripFormContainer";

const TripPlanForm = () => {
  const { loading, processingState, progress, submitTripData } = useTripSubmission();
  
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
      extraRequests: ""
    }
  });

  const onSubmit = (data: TripFormData) => {
    submitTripData(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 relative z-10 py-[36px] my-[32px]">
        <h1 className="text-3xl font-bold font-playfair text-center mb-8">Plan Your Trip</h1>
        
        {loading ? (
          <FormLoadingIndicator 
            processingState={processingState}
            progress={progress}
          />
        ) : (
          <TripFormContainer 
            form={form} 
            onSubmit={onSubmit} 
          />
        )}
      </div>
    </div>
  );
};

export default TripPlanForm;
