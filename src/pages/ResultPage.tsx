
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TripResultPage from "@/components/TripResultPage";
import BackgroundImage from "@/components/trip-result/BackgroundImage";
import ImageFetcher from "@/components/trip-result/ImageFetcher";
import ResultPageLayout from "@/components/trip-result/ResultPageLayout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRealtimeImages } from "@/hooks/use-realtime-images";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const ResultPage = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force component refresh
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [forceStay, setForceStay] = useState(false); // New state to prevent redirect
  
  // Check if we have any trip data on mount
  useEffect(() => {
    const checkForTripData = async () => {
      try {
        setIsLoading(true);
        console.log("ResultPage: Checking for trip data on mount");

        // Add a detailed log of all rows to help debug
        const { data: allData, error: debugError } = await supabase
          .from('URL+Response')
          .select('*');
          
        if (debugError) {
          console.error("Debug error fetching all data:", debugError);
        } else {
          console.log("All data in URL+Response table:", allData);
          console.log("Total row count:", allData?.length || 0);
          
          // If we have any data, don't redirect regardless of count query
          if (allData && allData.length > 0) {
            console.log("ResultPage: Data found during debug check, preventing redirect");
            setForceStay(true);
            setIsLoading(false);
            return;
          }
        }
        
        // The original count check, kept as fallback
        const { count, error } = await supabase
          .from('URL+Response')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error("Error checking for trip data:", error);
          setError(`Database error: ${error.message}`);
          return;
        }
        
        console.log("ResultPage: Trip data count from query:", count);
        
        if (count === 0 && !forceStay) {
          // Only redirect if we really have zero records AND we haven't set forceStay
          console.log("ResultPage: No trip data found, redirecting to plan page");
          toast.error("No trip plan found. Please create a new trip.");
          navigate("/plan");
        } else {
          console.log("ResultPage: Trip data found, count:", count);
        }
      } catch (err) {
        console.error("Error in checkForTripData:", err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForTripData();
  }, [navigate, forceStay]);
  
  // Monitor realtime connection status
  const { connected } = useRealtimeImages();
  
  useEffect(() => {
    console.log("ResultPage: Realtime connection status:", connected ? "Connected" : "Disconnected");
  }, [connected]);
  
  // Handler for when a new image is loaded
  const handleImageLoad = (imageURL: string) => {
    console.log("ResultPage: Image loaded:", imageURL);
    setBackgroundImage(imageURL);
    setError(null);
  };
  
  // Handler to trigger a refresh of the TripResultPage component
  const handleRefresh = () => {
    console.log("ResultPage: Refreshing trip result content");
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Manual retry function
  const handleRetry = () => {
    console.log("ResultPage: Manual retry requested");
    setRetryCount(prev => prev + 1);
    setRefreshKey(prevKey => prevKey + 1);
    setError(null);
  };

  // Force stay on this page even if no data found initially
  const handleForceStay = () => {
    setForceStay(true);
    setError(null);
    handleRetry();
    toast.info("Staying on results page. Refreshing data...");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Checking for trip data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background component */}
      <BackgroundImage imageURL={backgroundImage} />
      
      {/* Image fetcher component */}
      <ImageFetcher 
        key={`image-fetcher-${retryCount}`}
        onImageLoad={handleImageLoad} 
        onRefresh={handleRefresh} 
      />
      
      {/* Page layout with content */}
      <ResultPageLayout>
        {error ? (
          <div className="space-y-6 text-center py-20">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </Button>
              <Button onClick={handleForceStay} variant="secondary" className="gap-2">
                Stay on Results Page
              </Button>
              <Button asChild>
                <Link to="/plan">Create New Trip Plan</Link>
              </Button>
            </div>
          </div>
        ) : (
          <TripResultPage key={refreshKey} />
        )}
      </ResultPageLayout>
    </div>
  );
};

export default ResultPage;
