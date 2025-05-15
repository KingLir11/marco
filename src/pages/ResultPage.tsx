
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TripResultPage from "@/components/TripResultPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";

const ResultPage = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch latest image on initial load
  useEffect(() => {
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
        
        if (data?.ImageURL) {
          setBackgroundImage(data.ImageURL);
        } else {
          // If no data is found, redirect to plan page
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
  }, [navigate]);
  
  // Subscribe to new inserts in the Images-Plan table
  useEffect(() => {
    const channel = supabase
      .channel('public:Images-Plan')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Images-Plan'
        },
        (payload) => {
          toast.success("New trip plan received!");
          // Update the background image if a new one is available
          if (payload.new && payload.new.ImageURL) {
            setBackgroundImage(payload.new.ImageURL);
          }
          // Force the TripResultPage component to reload by causing a re-render
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          <TripResultPage />
        </main>
        <Footer />
        <ChatBot />
      </div>
    </div>
  );
};

export default ResultPage;
