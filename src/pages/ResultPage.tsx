
import React, { useState, useEffect } from "react";
import TripResultPage from "@/components/TripResultPage";
import BackgroundImage from "@/components/trip-result/BackgroundImage";
import ImageFetcher from "@/components/trip-result/ImageFetcher";
import ResultPageLayout from "@/components/trip-result/ResultPageLayout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRealtimeImages } from "@/hooks/use-realtime-images";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react"; 
import { Link } from "react-router-dom";
import { debugLogAllRows } from "@/services/tripImageService";

const ResultPage = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force component refresh
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Monitor realtime connection status
  const { connected } = useRealtimeImages();
  
  useEffect(() => {
    console.log("ResultPage: Realtime connection status:", connected ? "Connected" : "Disconnected");
    
    // Debug: Log all rows in the table to help diagnose issues
    const logRows = async () => {
      await debugLogAllRows();
    };
    
    logRows();
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
