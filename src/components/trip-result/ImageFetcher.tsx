
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeImages, ImagePlanData } from "@/hooks/use-realtime-images";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Handle new images from Supabase Realtime
  const handleNewImage = React.useCallback((data: ImagePlanData) => {
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
    } else {
      console.warn("ResultPage: Trip plan received but no image URL was provided");
    }
  }, [onImageLoad, onRefresh]);
  
  // Set up the realtime listener
  const { connected } = useRealtimeImages(handleNewImage);

  useEffect(() => {
    console.log("Realtime connection status:", connected ? "Connected" : "Disconnected");
  }, [connected]);
  
  // Fetch latest image on initial load
  useEffect(() => {
    // Skip if we've already attempted a fetch
    if (hasAttemptedFetch) return;
    
    console.log("ResultPage: Fetching latest image...");
    
    const fetchLatestImage = async () => {
      try {
        setLoading(true);
        setHasAttemptedFetch(true);
        
        // Debug - log all rows in the table (only in development)
        if (process.env.NODE_ENV === 'development') {
          await debugLogAllRows();
        }
        
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
        
        console.log("ResultPage: Fetched latest data:", data);
        
        if (data?.["Image URL"]) {
          console.log("ResultPage: Setting background image:", data["Image URL"]);
          onImageLoad(data["Image URL"]);
          onRefresh();
        } else {
          console.log("ResultPage: No trip plan found or no image URL in the data");
          if (data) {
            setError("Trip plan found but it doesn't have an image URL yet. Waiting for updates...");
          } else {
            setError("No trip plan found yet. Please try creating a new trip plan.");
            
            // Check if there are ANY rows in the table
            const { count } = await supabase
              .from('URL+Response')
              .select('*', { count: 'exact', head: true });
              
            if (count === 0 && !redirectAttempted) {
              console.log("ResultPage: No rows in URL+Response table, redirecting to plan page");
              toast.error("No trip plan found. Please create a new trip plan.");
              setRedirectAttempted(true);
              setTimeout(() => navigate("/plan"), 1500);
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
  }, [navigate, onImageLoad, onRefresh, hasAttemptedFetch, redirectAttempted]);

  // Retry loading the image
  const handleRetry = () => {
    console.log("Retrying image fetch...");
    setError(null);
    setHasAttemptedFetch(false);
    // Force re-run of the useEffect
    onRefresh();
  };

  // Display error if needed
  if (error && !loading && hasAttemptedFetch) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error Loading Trip Plan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={handleRetry} size="sm" variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button asChild size="sm">
              <Link to="/plan">Create New Trip</Link>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return null; // This component doesn't render anything by default
};

export default ImageFetcher;
