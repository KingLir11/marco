
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
import { useRealtimeImages, ImagePlanData } from "@/hooks/use-realtime-images";
import { useState, useEffect } from "react";

const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

const TripPlanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  // Handle new images from Supabase Realtime
  const handleNewImage = (data: ImagePlanData) => {
    console.log("New trip plan received in TripPlanForm!", data);
    toast.success("Your trip plan is ready!");
    setLoading(false);
    
    // Add a small delay before navigation to ensure state updates are processed
    setTimeout(() => {
      console.log("Navigating to result page...");
      navigate("/result");
    }, 500);
  };
  
  // Only set up the realtime listener if we've submitted the form
  const { connected } = useRealtimeImages(submittedAt ? handleNewImage : undefined);
  
  useEffect(() => {
    if (submittedAt && connected) {
      console.log("Connected to Supabase Realtime and waiting for new data...");
    }
  }, [submittedAt, connected]);

  // Set a fallback timeout in case we don't receive a webhook response
  useEffect(() => {
    if (!submittedAt || !loading) return;
    
    const timeoutId = setTimeout(() => {
      if (loading) {
        toast.info("Still working on your trip plan. Please wait a moment...");
        
        // Set another timeout for another 2 minutes
        setTimeout(() => {
          if (loading) {
            setLoading(false);
            toast.error("It's taking longer than expected. Please try again.");
          }
        }, 120000);
      }
    }, 120000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [submittedAt, loading]);

  // Force navigation after 30 seconds if we haven't received a response
  useEffect(() => {
    if (!submittedAt || !loading) return;
    
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Forcing navigation to result page after timeout");
        setLoading(false);
        navigate("/result");
      }
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [submittedAt, loading, navigate]);

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
      extraRequests: "",
    },
  });

  async function onSubmit(data: TripFormData) {
    setLoading(true);
    const currentTime = new Date();
    setSubmittedAt(currentTime);
    
    try {
      // Format dates to ISO strings for the API
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: data.endDate.toISOString().split('T')[0],
        budget: data.budget[0], // Send the single budget value instead of array
        submittedAt: currentTime.toISOString() // Add submission timestamp
      };
      
      console.log("Sending form data to webhook:", formattedData);
      
      // Send data to the webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send trip data");
      }
      
      console.log("Webhook response status:", response.status);
      toast.success("Trip details submitted successfully! Creating your plan...");
    } catch (error) {
      console.error("Error submitting trip data:", error);
      toast.error("Failed to submit trip data. Please try again.");
      setLoading(false);
      setSubmittedAt(null);
    }
  }

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
