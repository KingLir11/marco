
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// We keep using the external webhook to generate the trip plan
const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

// Maximum polling time in seconds before giving up
const MAX_POLLING_TIME = 90; // Extended timeout to 90 seconds
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
        // Start polling in the next tick to ensure state has updated
        setTimeout(() => {
          checkTripCreation(destinationRef.current || '');
        }, 0);
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
          
          // Instead of just showing an error, let's try to navigate to My Trips
          toast.error("Trip creation is taking longer than expected. Redirecting to My Trips...");
          setProcessingState('idle');
          setLoading(false);
          
          // Give the toast time to show, then navigate
          setTimeout(() => {
            navigate('/my-trips');
          }, 2000);
          
          return;
        }
        
        if (!submissionTimestamp.current) {
          console.error("No submission timestamp available for filtering trips");
          return;
        }

        const timestampStr = submissionTimestamp.current.toISOString();
        console.log(`Looking for trips created after: ${timestampStr}`);
        console.log(`Looking for destination (case-insensitive): "${tripDestination}"`);
        
        // First query: Try exact case-insensitive match
        let { data, error } = await supabase
          .from('trip_plans')
          .select('*')
          .ilike('destination', tripDestination)
          .gte('created_at', timestampStr)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) {
          console.error("Error checking for trip:", error);
          return;
        }
        
        console.log(`Poll result for exact match: found ${data?.length} trips`, data);
        
        // If no exact match found, try looking for any recent trip
        if (!data || data.length === 0) {
          console.log("No exact match found, looking for any recent trips...");
          
          const { data: recentData, error: recentError } = await supabase
            .from('trip_plans')
            .select('*')
            .gte('created_at', timestampStr)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (recentError) {
            console.error("Error checking for recent trips:", recentError);
            return;
          }
          
          console.log(`Poll result for recent trips: found ${recentData?.length} trips`, recentData);
          data = recentData;
        }
        
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
          
          // Ensure we can navigate
          const resultUrl = `/result/${tripId}`;
          console.log(`Preparing to redirect to ${resultUrl}`);
          
          // Give a moment for the user to see 100% before redirecting
          setTimeout(() => {
            console.log(`NOW REDIRECTING to ${resultUrl}`);
            
            try {
              // Use direct window.location as a fallback if navigate fails
              navigate(resultUrl);
              console.log("Navigation called!");
              
              // Reset state after navigation
              setProcessingState('idle');
              setLoading(false);
              
              // Fallback to direct redirection after a small delay if we're still here
              setTimeout(() => {
                if (window.location.pathname !== resultUrl) {
                  console.log("Fallback: Using direct window.location redirection");
                  window.location.href = resultUrl;
                }
              }, 1000);
            } catch (navError) {
              console.error("Navigation error:", navError);
              // Emergency fallback
              window.location.href = resultUrl;
            }
          }, 1000);
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
      const responseText = await response.text();
      console.log("Webhook response:", responseText);
      
      setProcessingState('waiting');
      setProgress(30); // Update progress after successful webhook call
      
      toast.success("Trip request sent! Creating your personalized plan...");
      
      // Note: We'll let the useEffect trigger the checkTripCreation now that we've set processingState to 'waiting'
      
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
