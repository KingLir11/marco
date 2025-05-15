
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeImages, ImagePlanData } from "@/hooks/use-realtime-images";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { debugLogAllRows } from "@/services/tripImageService";

interface ImageFetcherProps {
  onImageLoad: (imageURL: string) => void;
  onRefresh: () => void;
}

const ImageFetcher = ({ onImageLoad, onRefresh }: ImageFetcherProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Handle new images from Supabase Realtime
  const handleNewImage = (data: ImagePlanData) => {
    console.log("ResultPage: New trip plan received via realtime!", data);
    toast.success("New trip plan received!");
    
    // Update the background image if a new one is available
    if (data && data["Image URL"]) {
      console.log("ResultPage: Updating background image to:", data["Image URL"]);
      onImageLoad(data["Image URL"]);
      // Trigger refresh
      onRefresh();
      // Clear any previous errors
      setError(null);
    }
  };
  
  // Set up the realtime listener
  const { connected } = useRealtimeImages(handleNewImage);

  useEffect(() => {
    console.log("Realtime connection status:", connected ? "Connected" : "Disconnected");
  }, [connected]);
  
  // Fetch latest image on initial load
  useEffect(() => {
    console.log("ResultPage: Fetching latest image...");
    
    const fetchLatestImage = async () => {
      try {
        setLoading(true);
        setHasAttemptedFetch(true);
        
        // Debug - log all rows in the table
        await debugLogAllRows();
        
        const { data, error } = await supabase
          .from('URL+Response')
          .select('"Image URL", Response')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching background image:", error);
          setError(`Failed to fetch image: ${error.message}`);
          return;
        }
        
        console.log("ResultPage: Fetched latest data:", data);
        
        if (data?.["Image URL"]) {
          console.log("ResultPage: Setting background image:", data["Image URL"]);
          onImageLoad(data["Image URL"]);
          onRefresh();
        } else {
          console.log("ResultPage: No trip plan found or no image URL in the data");
          if (data) {
            setError("Trip plan found but it doesn't have an image URL. Waiting for updates...");
          } else {
            setError("No trip plan found yet. Waiting for updates...");
            
            // Check if there are ANY rows in the table
            const { count } = await supabase
              .from('URL+Response')
              .select('*', { count: 'exact', head: true });
              
            if (count === 0) {
              console.log("ResultPage: No rows in URL+Response table, redirecting to plan page");
              toast.error("No trip plan found. Please create a new trip plan.");
              navigate("/plan");
            }
          }
        }
        
      } catch (error) {
        console.error("Error in fetching background image:", error);
        setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestImage();
  }, [navigate, onImageLoad, onRefresh]);

  // Display error if needed
  if (error && !loading && hasAttemptedFetch) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null; // This component doesn't render anything by default
};

export default ImageFetcher;
