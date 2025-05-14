
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 absolute top-0 left-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold font-playfair text-white">Marco</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
            Home
          </Link>
          <Link to="/plan" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
            Plan Trip
          </Link>
          <Link to="/my-trips" className="text-sm font-medium text-white hover:text-gray-200 transition-colors">
            My Trips
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex text-white border-white hover:bg-white/20">
            Login
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
