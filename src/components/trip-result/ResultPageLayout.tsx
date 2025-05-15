
import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

interface ResultPageLayoutProps {
  children: ReactNode;
}

const ResultPageLayout = ({ children }: ResultPageLayoutProps) => {
  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default ResultPageLayout;
