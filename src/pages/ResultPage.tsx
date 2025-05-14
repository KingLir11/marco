
import React from "react";
import Header from "@/components/Header";
import TripResultPage from "@/components/TripResultPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const ResultPage = () => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/lovable-uploads/1da3ddbc-983a-4a03-a884-3d41acdc3dd2.png')" }}
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
