
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";
import { useRealtimeImages, ImagePlanData } from "./use-realtime-images";
import { generateSupabaseId } from "@/lib/utils";

const WEBHOOK_URL = "https://hook.eu2.make.com/5nzrkzdmuu16mbpkmjryc92n13ysdpn3";

export function useTripFormSubmission() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const longWaitTimerRef = useRef<number | null>(null);
  const notificationShownRef = useRef(false);
  const submittedIdRef = useRef<string | null>(null);
  const navigationAttemptedRef = useRef(false);
  
  // Memoize the handleNewImage function to avoid recreating it on every render
  const handleNewImage = useCallback((data: ImagePlanData) => {
    if (navigationAttemptedRef.current) return; // Prevent multiple navigation attempts
    
    console.log("New trip plan received in TripPlanForm!", data);
    toast.success("Your trip plan is ready!");
    setLoading(false);
    navigationAttemptedRef.current = true;
    
    // Clear any pending timers
    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    
    if (longWaitTimerRef.current) {
      window.clearTimeout(longWaitTimerRef.current);
      longWaitTimerRef.current = null;
    }
    
    // Add a small delay before navigation to ensure state updates are processed
    setTimeout(() => {
      console.log("Navigating to result page...");
      navigate("/result");
    }, 500);
  }, [navigate]);
  
  // Only set up the realtime listener if we've submitted the form
  const { connected } = useRealtimeImages(submittedAt ? handleNewImage : undefined);
  
  // Log connection status when it changes
  useEffect(() => {
    if (submittedAt && connected) {
      console.log("Connected to Supabase Realtime and waiting for new data...");
      if (!notificationShownRef.current) {
        toast.info("Waiting for your trip plan to be generated...");
        notificationShownRef.current = true;
      }
    }
    
    return () => {
      // Reset notification state when component unmounts
      notificationShownRef.current = false;
    };
  }, [submittedAt, connected]);

  // Set a fallback timeout in case we don't receive a webhook response
  useEffect(() => {
    // Clean up any existing timers
    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    
    if (longWaitTimerRef.current) {
      window.clearTimeout(longWaitTimerRef.current);
      longWaitTimerRef.current = null;
    }
    
    if (!submittedAt || !loading) return;
    
    console.log("Setting fallback timeouts for navigation");
    
    // Just one warning after 1 minute
    longWaitTimerRef.current = window.setTimeout(() => {
      if (loading && !navigationAttemptedRef.current) {
        toast.info("Still working on your trip plan. This may take a bit longer...");
      }
    }, 60000);

    // Force navigation after 30 seconds if we haven't received a response
    navigationTimerRef.current = window.setTimeout(() => {
      if (loading && !navigationAttemptedRef.current) {
        console.log("Forcing navigation to result page after 30 second timeout");
        navigationAttemptedRef.current = true;
        setLoading(false);
        navigate("/result");
      }
    }, 30000);

    return () => {
      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
      
      if (longWaitTimerRef.current) {
        window.clearTimeout(longWaitTimerRef.current);
        longWaitTimerRef.current = null;
      }
    };
  }, [submittedAt, loading, navigate]);

  const onSubmit = async (data: TripFormData) => {
    // Reset navigation attempt tracking
    navigationAttemptedRef.current = false;
    
    setLoading(true);
    const currentTime = new Date();
    setSubmittedAt(currentTime);
    notificationShownRef.current = false;
    
    try {
      // Generate a random ID suitable for Supabase int8 type
      const supabaseId = generateSupabaseId();
      submittedIdRef.current = supabaseId.toString();
      
      // Format dates to ISO strings for the API
      const formattedData = {
        ...data,
        id: supabaseId, // Include the generated ID in the webhook payload
        startDate: data.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: data.endDate.toISOString().split('T')[0],
        budget: data.budget[0], // Send the single budget value instead of array
        submittedAt: currentTime.toISOString() // Add submission timestamp
      };
      
      console.log("Sending form data to webhook with ID:", supabaseId);
      
      // Send data to the webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send trip data: ${response.status} ${response.statusText}`);
      }
      
      console.log("Webhook response status:", response.status);
      toast.success("Trip details submitted! Creating your plan...");
      
      // We'll wait for the realtime update or the timeout to navigate
    } catch (error) {
      console.error("Error submitting trip data:", error);
      toast.error(`Failed to submit trip data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      setSubmittedAt(null);
    }
  };

  return { loading, onSubmit };
}
