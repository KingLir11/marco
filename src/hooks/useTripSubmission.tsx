
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
  const destinationRef = useRef<string | null>(null);

  // Effect to simulate progress bar movement while waiting for trip data
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (processingState === 'waiting') {
      console.log('Starting progress bar animation as we wait for trip creation');
      interval = setInterval(() => {
        setProgress(prev => {
          // Move progress gradually up to 90% (leave room for completion)
          const nextProgress = prev + (90 - prev) * 0.05;
          return Math.min(nextProgress, 90);
        });
      }, 500);

      // Start polling for trip if we have a destination
      if (destinationRef.current) {
        console.log(`Starting to poll for trip with destination: ${destinationRef.current}`);
        checkTripCreation(destinationRef.current);
      } else {
        console.warn('No destination set for polling');
      }
    } else if (processingState === 'idle') {
      setProgress(0);
      submissionTimestamp.current = null;
      pollCount.current = 0;
      destinationRef.current = null;
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
      pollingInterval.current = null;
    }
    
    console.log(`Setting up polling for destination: "${tripDestination}"`);
    
    // Start a new polling interval
    pollingInterval.current = setInterval(async () => {
      try {
        pollCount.current += 1;
        console.log(`Polling for trip (attempt ${pollCount.current})...`);
        
        // Check for timeout condition
        if (pollCount.current > MAX_POLLING_TIME * 1000 / POLLING_INTERVAL) {
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
          toast.error("Trip creation is taking longer than expected. Please check 'My Trips' later.");
          setProcessingState('idle');
          setLoading(false);
          return;
        }
        
        if (!submissionTimestamp.current) {
          console.error("No submission timestamp available for filtering trips");
          return;
        }

        const timestampStr = submissionTimestamp.current.toISOString();
        console.log(`Looking for trips created after: ${timestampStr}`);
        console.log(`Looking for destination (case-insensitive): "${tripDestination}"`);
        
        // Check for recent trip with this destination created after submission
        // Using ilike for case-insensitive comparison
        const { data, error } = await supabase
          .from('trip_plans')
          .select('*')
          .ilike('destination', tripDestination) // Case-insensitive match
          .gte('created_at', timestampStr)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error checking for trip:", error);
          return;
        }
        
        console.log(`Poll result: found ${data?.length} trips`, data);
        
        if (data && data.length > 0) {
          // Found the trip! Complete progress and redirect
          const tripId = data[0].id;
          console.log("Trip found in database:", data[0]);
          setLatestTripId(tripId);
          setProgress(100);
          toast.success("Trip plan created successfully!");
          
          // Clear the polling interval
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
          
          // Give a moment for the user to see 100% before redirecting
          setTimeout(() => {
            const resultUrl = `/result/${tripId}`;
            console.log(`Redirecting to ${resultUrl}`);
            navigate(resultUrl);
            
            // Reset state after navigation
            setTimeout(() => {
              setProcessingState('idle');
              setLoading(false);
            }, 100);
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
      // Store destination for polling reference
      destinationRef.current = data.destination;
      
      // Set submission timestamp for filtering recent trips
      submissionTimestamp.current = new Date();
      console.log(`Trip submission started at: ${submissionTimestamp.current.toISOString()}`);
      console.log(`Trip destination: "${data.destination}"`);
      
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
      // Note: checkTripCreation will be called by the useEffect when state changes to 'waiting'
      
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
