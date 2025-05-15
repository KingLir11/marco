
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TripResultPage from "@/components/TripResultPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const ResultPage = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>('/lovable-uploads/1da3ddbc-983a-4a03-a884-3d41acdc3dd2.png');
  
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
          // Force the TripResultPage component to reload by causing a re-render
          const timestamp = new Date().getTime();
          window.location.href = `/result?t=${timestamp}`;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="backdrop-blur-sm bg-white/10 min-h-screen flex flex-col">
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
