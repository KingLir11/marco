
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { tripFormSchema, TripFormData } from "@/lib/schemas/tripPlanSchema";
import { FormFields } from "./FormFields";
import { SubmitButton } from "./SubmitButton";
import { useTripFormSubmission } from "@/hooks/use-trip-form-submission";
import { LoadingState } from "./LoadingState";

const TripFormContainer: React.FC = () => {
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
      extraRequests: "",
    },
  });

  const { loading, onSubmit } = useTripFormSubmission();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 relative z-10">
        <h1 className="text-3xl font-bold font-playfair text-center mb-8">Plan Your Trip</h1>
        
        {loading ? (
          <div className="space-y-4">
            <LoadingState />
            <p className="text-center text-gray-600">
              We're creating your personalized trip plan. This may take a minute...
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormFields form={form} />
              <SubmitButton />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default TripFormContainer;
