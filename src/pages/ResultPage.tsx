
import React from "react";
import Header from "@/components/Header";
import TripResultPage from "@/components/TripResultPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const ResultPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image container with proper aspect ratio */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <AspectRatio ratio={16/9} className="h-full">
          <img 
            src="/lovable-uploads/1da3ddbc-983a-4a03-a884-3d41acdc3dd2.png"
            alt="Mountain landscape background"
            className="w-full h-full object-cover"
          />
        </AspectRatio>
      </div>
      
      {/* Semi-transparent overlay for content readability */}
      <div className="min-h-screen flex flex-col bg-black/30">
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
