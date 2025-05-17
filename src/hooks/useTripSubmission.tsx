import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// We keep using the external webhook to generate the trip plan
const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

export const useTripSubmission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'sending' | 'waiting'>('idle');
  const [progress, setProgress] = useState(0);
  const [latestTripId, setLatestTripId] = useState<string | null>(null);

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

  // Function to check if trip has been created in Supabase
  const checkTripCreation = async (tripDestination: string) => {
    let interval: NodeJS.Timeout;
    
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
  };

  // Function to submit trip data
  const submitTripData = async (data: TripFormData) => {
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
      
      // Start checking for the trip in the database
      checkTripCreation(data.destination);
      
    } catch (error) {
      console.error("Error submitting trip data:", error);
      toast.error("Failed to submit trip data. Please try again.");
      setProcessingState('idle');
      setLoading(false);
    }
  };

  return {
    loading,
    processingState,
    progress,
    submitTripData
  };
};
