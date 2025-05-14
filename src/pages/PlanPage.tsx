
import React from "react";
import Header from "@/components/Header";
import TripPlanForm from "@/components/TripPlanForm";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const PlanPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image for the plan page */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: "url('/lovable-uploads/39eae3dc-5dc2-46ff-ab38-c8e96334133d.png')" }}
      />
      <div className="absolute inset-0 bg-black/10 z-0" /> {/* Light overlay for better form visibility */}
      
      <Header />
      <main className="flex-1 relative z-1">
        <TripPlanForm />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default PlanPage;
