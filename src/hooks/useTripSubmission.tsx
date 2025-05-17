
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// We keep using the external webhook to generate the trip plan
const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

// Maximum polling time in seconds before giving up
const MAX_POLLING_TIME = 60; 
// How often to check for the trip (in ms)
const POLLING_INTERVAL = 1500;

export const useTripSubmission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'sending' | 'waiting'>('idle');
  const [progress, setProgress] = useState(0);
  const [latestTripId, setLatestTripId] = useState<string | null>(null);
  
  // Use refs to store submission timestamp and polling information
  const submissionTimestamp = useRef<Date | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollCount = useRef<number>(0);

  // Effect to simulate progress bar movement while waiting for trip data
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (processingState === 'waiting') {
      interval = setInterval(() => {
        setProgress(prev => {
          // Move progress gradually up to 90% (leave room for completion)
          const nextProgress = prev + (90 - prev) * 0.05;
          return Math.min(nextProgress, 90);
        });
      }, 500);
    } else if (processingState === 'idle') {
      setProgress(0);
      submissionTimestamp.current = null;
      pollCount.current = 0;
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingState]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Function to check if trip has been created in Supabase
  const checkTripCreation = (tripDestination: string) => {
    // Clear any existing polling interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    // Start a new polling interval
    pollingInterval.current = setInterval(async () => {
      try {
        pollCount.current += 1;
        console.log(`Polling for trip (attempt ${pollCount.current})...`);
        
        // Check for timeout condition
        if (pollCount.current > MAX_POLLING_TIME * 1000 / POLLING_INTERVAL) {
          clearInterval(pollingInterval.current!);
          toast.error("Trip creation is taking longer than expected. Please check 'My Trips' later.");
          setProcessingState('idle');
          setLoading(false);
          return;
        }
        
        // Check for recent trip with this destination created after submission
        const { data, error } = await supabase
          .from('trip_plans')
          .select('*')
          .eq('destination', tripDestination)
          .gte('created_at', submissionTimestamp.current?.toISOString() || new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error checking for trip:", error);
          return;
        }
        
        if (data && data.length > 0) {
          // Found the trip! Complete progress and redirect
          const tripId = data[0].id;
          console.log("Trip found in database:", data[0]);
          setLatestTripId(tripId);
          setProgress(100);
          toast.success("Trip plan created successfully!");
          
          // Clear the polling interval
          clearInterval(pollingInterval.current!);
          pollingInterval.current = null;
          
          // Give a moment for the user to see 100% before redirecting
          setTimeout(() => {
            console.log(`Redirecting to /result/${tripId}`);
            navigate(`/result/${tripId}`);
            setProcessingState('idle');
            setLoading(false);
          }, 500);
        }
      } catch (err) {
        console.error("Error checking for trip:", err);
      }
    }, POLLING_INTERVAL);
  };

  // Function to submit trip data
  const submitTripData = async (data: TripFormData) => {
    setLoading(true);
    setProcessingState('sending');
    setProgress(10); // Start progress at 10%
    
    try {
      // Set submission timestamp for filtering recent trips
      submissionTimestamp.current = new Date();
      
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
        throw new Error(`Failed to send trip data: ${response.status} ${response.statusText}`);
      }

      // Change state to waiting - don't try to parse response as JSON
      setProcessingState('waiting');
      setProgress(30); // Update progress after successful webhook call
      
      toast.success("Trip request sent! Creating your personalized plan...");
      
      // Start checking for the trip in the database with updated polling mechanism
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
    submitTripData,
    latestTripId
  };
};
