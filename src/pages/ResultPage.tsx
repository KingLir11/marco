
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TripResultPage from "@/components/TripResultPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { useRealtimeImages, ImagePlanData } from "@/hooks/use-realtime-images";

const ResultPage = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force component refresh
  
  // Handle new images from Supabase Realtime
  const handleNewImage = (data: ImagePlanData) => {
    console.log("ResultPage: New trip plan received!", data);
    toast.success("New trip plan received!");
    
    // Update the background image if a new one is available
    if (data && data.ImageURL) {
      console.log("ResultPage: Updating background image to:", data.ImageURL);
      setBackgroundImage(data.ImageURL);
      // Force the TripResultPage component to reload by causing a re-render
      setRefreshKey(prevKey => prevKey + 1);
    }
  };
  
  // Set up the realtime listener
  useRealtimeImages(handleNewImage);
  
  // Fetch latest image on initial load
  useEffect(() => {
    console.log("ResultPage: Fetching latest image...");
    
    const fetchLatestImage = async () => {
      try {
        const { data, error } = await supabase
          .from('Images-Plan')
          .select('ImageURL')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching background image:", error);
          return;
        }
        
        console.log("ResultPage: Fetched data:", data);
        
        if (data?.ImageURL) {
          console.log("ResultPage: Setting background image:", data.ImageURL);
          setBackgroundImage(data.ImageURL);
        } else {
          console.log("ResultPage: No trip plan found, redirecting to plan page");
          toast.error("No trip plan found. Please create a new trip plan.");
          navigate("/plan");
        }
        
      } catch (error) {
        console.error("Error in fetching background image:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestImage();
  }, [navigate, refreshKey]);

  return (
    <div className="min-h-screen flex flex-col">
      {backgroundImage ? (
        <div className="absolute inset-0 w-full h-full z-0">
          <AspectRatio ratio={16/9} className="h-full">
            <img 
              src={backgroundImage} 
              alt="Trip destination" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" /> {/* Darker overlay for better readability */}
          </AspectRatio>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-300 z-0" />
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <TripResultPage key={refreshKey} />
        </main>
        <Footer />
        <ChatBot />
      </div>
    </div>
  );
};

export default ResultPage;
