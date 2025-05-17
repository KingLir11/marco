
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeImages, ImagePlanData } from "@/hooks/use-realtime-images";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Handle new images from Supabase Realtime
  const handleNewImage = (data: ImagePlanData) => {
    console.log("ResultPage: New trip plan received via realtime!", data);
    toast.success("New trip plan received!");
    
    // Update the background image if a new one is available
    if (data && data["Image URL"]) {
      let imageUrl: string;
      
      // Handle different types for Image URL
      if (typeof data["Image URL"] === 'string') {
        imageUrl = data["Image URL"];
      } else {
        // Convert non-string Image URL to string
        imageUrl = String(data["Image URL"]);
      }
      
      console.log("ResultPage: Updating background image to:", imageUrl);
      onImageLoad(imageUrl);
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
  
  // Handle manual retry
  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    
    // Log all rows in the database to help debug issues
    debugLogAllRows().then(() => {
      // Re-attempt to fetch the latest image
      fetchLatestImage();
    });
  };
  
  // Function to fetch the latest image from Supabase
  const fetchLatestImage = async () => {
    try {
      setLoading(true);
      setHasAttemptedFetch(true);
      
      console.log("ImageFetcher: Fetching latest image plan...");
      
      const { data, error } = await supabase
        .from('URL+Response')
        .select('created_at, "Image URL", Response')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching background image:", error);
        setError(`Failed to fetch image: ${error.message}`);
        return;
      }
      
      console.log("ImageFetcher: Fetched latest data:", data);
      
      if (data?.["Image URL"]) {
        let imageUrl: string;
        
        // Handle different types for Image URL
        if (typeof data["Image URL"] === 'string') {
          imageUrl = data["Image URL"];
        } else {
          // Convert non-string Image URL to string
          imageUrl = String(data["Image URL"]);
        }
        
        console.log("ImageFetcher: Setting background image:", imageUrl);
        onImageLoad(imageUrl);
        onRefresh();
      } else {
        console.log("ImageFetcher: No trip plan found or no image URL in the data");
        if (data) {
          setError("Trip plan found but it doesn't have an image URL. Waiting for updates...");
        } else {
          setError("No trip plan found yet. Waiting for updates...");
          
          // Check if there are ANY rows in the table
          const { count } = await supabase
            .from('URL+Response')
            .select('*', { count: 'exact', head: true });
            
          if (count === 0) {
            console.log("ImageFetcher: No rows in URL+Response table, redirecting to plan page");
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
      setIsRetrying(false);
    }
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchLatestImage();
  }, [navigate, onImageLoad, onRefresh]);

  // Display error if needed
  if (error && !loading && hasAttemptedFetch) {
    return (
      <div className="max-w-md mx-auto mt-4 space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying} 
            className="flex items-center gap-2"
          >
            {isRetrying && <RefreshCw className="h-4 w-4 animate-spin" />}
            {!isRetrying && <RefreshCw className="h-4 w-4" />}
            {isRetrying ? "Retrying..." : "Retry Loading"}
          </Button>
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything by default
};

export default ImageFetcher;
