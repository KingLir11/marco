
import React, { useState, useEffect } from "react";
import TripResultPage from "@/components/TripResultPage";
import BackgroundImage from "@/components/trip-result/BackgroundImage";
import ImageFetcher from "@/components/trip-result/ImageFetcher";
import ResultPageLayout from "@/components/trip-result/ResultPageLayout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRealtimeImages } from "@/hooks/use-realtime-images";

const ResultPage = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force component refresh
  const [error, setError] = useState<string | null>(null);
  
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background component */}
      <BackgroundImage imageURL={backgroundImage} />
      
      {/* Image fetcher component */}
      <ImageFetcher 
        onImageLoad={handleImageLoad} 
        onRefresh={handleRefresh} 
      />
      
      {/* Page layout with content */}
      <ResultPageLayout>
        {error ? (
          <Alert variant="destructive" className="max-w-md mx-auto mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <TripResultPage key={refreshKey} />
        )}
      </ResultPageLayout>
    </div>
  );
};

export default ResultPage;
