
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { tripFormSchema, TripFormData } from "@/lib/schemas/tripPlanSchema";
import { DestinationField } from "@/components/trip-form/DestinationField";
import { DateField } from "@/components/trip-form/DateField";
import { StyleField } from "@/components/trip-form/StyleField";
import { BudgetField } from "@/components/trip-form/BudgetField";
import { LoadingState } from "@/components/trip-form/LoadingState";

const TripPlanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
    },
  });

  function onSubmit(data: TripFormData) {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd save this data to state/context or API
      console.log("Form data:", data);
      navigate("/result");
      setLoading(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 relative z-10">
        <h1 className="text-3xl font-bold font-playfair text-center mb-8">Plan Your Trip</h1>
        
        {loading ? (
          <LoadingState />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <DestinationField control={form.control} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField 
                  control={form.control} 
                  name="startDate" 
                  label="Start Date" 
                  getDisabledDates={(date) => date < new Date()}
                />
                
                <DateField 
                  control={form.control} 
                  name="endDate" 
                  label="End Date" 
                  getDisabledDates={(date) => {
                    const startDate = form.getValues("startDate");
                    return startDate ? date < startDate : date < new Date();
                  }}
                />
              </div>
              
              <StyleField control={form.control} />
              <BudgetField control={form.control} />
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                Create My Plan
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default TripPlanForm;
