
import React from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <span className="text-xl font-bold">Brandify</span>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Testimonials
          </a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Login
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
