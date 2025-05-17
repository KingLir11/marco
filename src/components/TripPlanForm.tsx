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
import { ExtraRequestsField } from "@/components/trip-form/ExtraRequestsField";
import { LoadingState } from "@/components/trip-form/LoadingState";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { normalizeTripPlanData } from "@/lib/schemas/tripDataSchema";

// We keep using the external webhook to generate the trip plan
const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

const TripPlanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
      extraRequests: ""
    }
  });

  async function onSubmit(data: TripFormData) {
    setLoading(true);
    try {
      // Format dates to ISO strings for the API
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: data.endDate.toISOString().split('T')[0],
        budget: data.budget[0] // Send the single budget value instead of array
      };
      
      console.log("Sending form data to webhook:", formattedData);

      // Send data to the webhook to generate trip plan
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to send trip data");
      }

      // Get the trip plan data from the webhook response
      const tripPlanData = await response.json();
      
      // Normalize the trip plan data before storing
      const normalizedData = normalizeTripPlanData(tripPlanData);
      console.log("Normalized data before storing:", normalizedData);
      
      // Store the trip data in Supabase
      const { error } = await supabase
        .from('trip_plans')
        .insert({
          destination: data.destination,
          start_date: data.startDate.toISOString().split('T')[0],
          end_date: data.endDate.toISOString().split('T')[0],
          trip_plan: JSON.stringify(normalizedData),
          // user_id will be automatically set by RLS if user is authenticated
        });

      if (error) {
        console.error("Error saving trip to Supabase:", error);
        throw new Error("Failed to save trip data");
      }
      
      toast.success("Trip details submitted successfully!");
      navigate("/result");
    } catch (error) {
      console.error("Error submitting trip data:", error);
      toast.error("Failed to submit trip data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 relative z-10 py-[36px] my-[32px]">
        <h1 className="text-3xl font-bold font-playfair text-center mb-8">Plan Your Trip</h1>
        
        {loading ? <LoadingState /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <DestinationField control={form.control} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField 
                  control={form.control} 
                  name="startDate" 
                  label="Start Date" 
                  getDisabledDates={date => date < new Date()} 
                />
                
                <DateField 
                  control={form.control} 
                  name="endDate" 
                  label="End Date" 
                  getDisabledDates={date => {
                    const startDate = form.getValues("startDate");
                    return startDate ? date < startDate : date < new Date();
                  }} 
                />
              </div>
              
              <StyleField control={form.control} />
              <BudgetField control={form.control} />
              <ExtraRequestsField control={form.control} />
              
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
