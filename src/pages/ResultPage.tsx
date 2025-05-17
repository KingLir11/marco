
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
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const ResultPage = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force component refresh
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [webhookData, setWebhookData] = useState<any>(null);
  
  // Get query parameters from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const webhookResponse = queryParams.get('response');
  
  // Monitor realtime connection status
  const { connected } = useRealtimeImages();
  
  useEffect(() => {
    console.log("ResultPage: Realtime connection status:", connected ? "Connected" : "Disconnected");
    
    // Debug: Log all rows in the table to help diagnose issues
    const logRows = async () => {
      await debugLogAllRows();
    };
    
    logRows();
    
    // Check for webhook response in URL parameters
    if (webhookResponse) {
      try {
        // Try to parse the webhook response data
        const parsedData = JSON.parse(decodeURIComponent(webhookResponse));
        console.log("ResultPage: Parsed webhook response data:", parsedData);
        
        // Set webhook data for use in components
        setWebhookData(parsedData);
        
        // If there's an image URL in the webhook data, use it
        if (parsedData.imageUrl || parsedData.imageURL || parsedData["Image URL"]) {
          const imageUrl = parsedData.imageUrl || parsedData.imageURL || parsedData["Image URL"];
          setBackgroundImage(imageUrl);
          setError(null);
          toast.success("Trip plan loaded from webhook response");
        }
      } catch (error) {
        console.error("Error parsing webhook response:", error);
        setError(`Failed to parse webhook response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [connected, webhookResponse]);
  
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
  const handleRetry = async () => {
    console.log("ResultPage: Manual retry requested");
    setIsRetrying(true);
    
    try {
      // Debug log all rows to see what data we have
      await debugLogAllRows();
      
      // Increment retry counter and refresh key to force components to reload
      setRetryCount(prev => prev + 1);
      setRefreshKey(prevKey => prevKey + 1);
      setError(null);
    } catch (error) {
      console.error("Error during retry:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background component */}
      <BackgroundImage imageURL={backgroundImage} />
      
      {/* Only use ImageFetcher if we don't have webhook data */}
      {!webhookData && (
        <ImageFetcher 
          key={`image-fetcher-${retryCount}`}
          onImageLoad={handleImageLoad} 
          onRefresh={handleRefresh} 
        />
      )}
      
      {/* Page layout with content */}
      <ResultPageLayout>
        {error ? (
          <div className="space-y-6 text-center py-20">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="gap-2"
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRetrying ? "Retrying..." : "Retry Loading"}
              </Button>
              <Button asChild>
                <Link to="/plan">Create New Trip Plan</Link>
              </Button>
            </div>
          </div>
        ) : (
          <TripResultPage key={refreshKey} webhookData={webhookData} />
        )}
      </ResultPageLayout>
    </div>
  );
};

export default ResultPage;
