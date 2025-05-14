
import React from "react";
import Header from "@/components/Header";
import TripPlanForm from "@/components/TripPlanForm";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const PlanPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <TripPlanForm />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default PlanPage;
