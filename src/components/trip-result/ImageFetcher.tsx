
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeImages, ImagePlanData } from "@/hooks/use-realtime-images";

interface ImageFetcherProps {
  onImageLoad: (imageURL: string) => void;
  onRefresh: () => void;
}

const ImageFetcher = ({ onImageLoad, onRefresh }: ImageFetcherProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Handle new images from Supabase Realtime
  const handleNewImage = (data: ImagePlanData) => {
    console.log("ResultPage: New trip plan received!", data);
    toast.success("New trip plan received!");
    
    // Update the background image if a new one is available
    if (data && data.ImageURL) {
      console.log("ResultPage: Updating background image to:", data.ImageURL);
      onImageLoad(data.ImageURL);
      // Trigger refresh
      onRefresh();
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
          onImageLoad(data.ImageURL);
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
  }, [navigate, onImageLoad, onRefresh]);

  return null; // This component doesn't render anything
};

export default ImageFetcher;
