
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ResultPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Trip Result Page</h1>
          <p>This page is ready to be recreated in a new way.</p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/plan">Plan Another Trip</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/my-trips">My Trips</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default ResultPage;
