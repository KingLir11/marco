
import React from "react";
import Header from "@/components/Header";
import TripResultPage from "@/components/TripResultPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const ResultPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <TripResultPage />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default ResultPage;
