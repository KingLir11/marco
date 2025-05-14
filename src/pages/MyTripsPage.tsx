
import React from "react";
import Header from "@/components/Header";
import MyTripsPage from "@/components/MyTripsPage";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

const MyTrips = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MyTripsPage />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default MyTrips;
