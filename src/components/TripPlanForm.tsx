import React, { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";

// We keep using the external webhook to generate the trip plan
const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

const TripPlanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'sending' | 'waiting'>('idle');
  const [progress, setProgress] = useState(0);
  const [latestTripId, setLatestTripId] = useState<string | null>(null);
  
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
      extraRequests: ""
    }
  });

  // Effect to simulate progress bar movement while waiting for trip data
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (processingState === 'waiting') {
      interval = setInterval(() => {
        setProgress(prev => {
          // Move progress gradually up to 95% (leave room for completion)
          const nextProgress = prev + (95 - prev) * 0.05;
          return Math.min(nextProgress, 95);
        });
      }, 500);
    } else if (processingState === 'idle') {
      setProgress(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingState]);

  // Effect to check if trip has been created in Supabase
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const tripDestination = form.getValues("destination");
    
    if (processingState === 'waiting' && tripDestination) {
      interval = setInterval(async () => {
        try {
          // Check for recent trip with this destination
          const { data, error } = await supabase
            .from('trip_plans')
            .select('*')
            .eq('destination', tripDestination)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Found the trip! Complete progress and redirect
            const tripId = data[0].id;
            console.log("Trip found in database:", data[0]);
            setLatestTripId(tripId);
            setProgress(100);
            toast.success("Trip plan created successfully!");
            
            // Give a moment for the user to see 100% before redirecting
            setTimeout(() => {
              // Use the specific trip ID when navigating to the result page
              navigate(`/result/${tripId}`);
            }, 500);
            
            setProcessingState('idle');
            setLoading(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error checking for trip:", err);
        }
      }, 2000); // Check every 2 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingState, navigate, form]);

  async function onSubmit(data: TripFormData) {
    setLoading(true);
    setProcessingState('sending');
    setProgress(10); // Start progress at 10%
    
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

      // Change state to waiting - don't try to parse response as JSON
      setProcessingState('waiting');
      setProgress(30); // Update progress after successful webhook call
      
      toast.success("Trip request sent! Creating your personalized plan...");
      
      // Don't navigate immediately - wait for the trip to appear in the database
      // The useEffect above will handle the navigation once the trip is found
      
    } catch (error) {
      console.error("Error submitting trip data:", error);
      toast.error("Failed to submit trip data. Please try again.");
      setProcessingState('idle');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 relative z-10 py-[36px] my-[32px]">
        <h1 className="text-3xl font-bold font-playfair text-center mb-8">Plan Your Trip</h1>
        
        {loading ? (
          <div className="space-y-8">
            <LoadingState />
            
            <div className="space-y-2">
              <p className="text-center text-gray-700">
                {processingState === 'sending' ? 'Sending your request...' : 'Creating your perfect trip plan...'}
              </p>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-gray-500">This may take up to a minute</p>
            </div>
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
