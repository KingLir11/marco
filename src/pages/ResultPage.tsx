
import React, { useState } from "react";
import TripResultPage from "@/components/TripResultPage";
import BackgroundImage from "@/components/trip-result/BackgroundImage";
import ImageFetcher from "@/components/trip-result/ImageFetcher";
import ResultPageLayout from "@/components/trip-result/ResultPageLayout";

const ResultPage = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force component refresh
  
  // Handler for when a new image is loaded
  const handleImageLoad = (imageURL: string) => {
    setBackgroundImage(imageURL);
  };
  
  // Handler to trigger a refresh of the TripResultPage component
  const handleRefresh = () => {
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
        <TripResultPage key={refreshKey} />
      </ResultPageLayout>
    </div>
  );
};

export default ResultPage;
