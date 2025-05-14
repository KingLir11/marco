
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#385E40] text-white py-10 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-playfair text-xl font-bold mb-4">Marco</h3>
            <p className="text-gray-200 text-sm">
              Plan your perfect trip around the weather forecast. Create personalized itineraries and always have a backup plan.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-200 hover:text-white text-sm">Home</Link>
              </li>
              <li>
                <Link to="/plan" className="text-gray-200 hover:text-white text-sm">Plan a Trip</Link>
              </li>
              <li>
                <Link to="/my-trips" className="text-gray-200 hover:text-white text-sm">My Trips</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-200 hover:text-white text-sm">Weather Guide</a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-white text-sm">Packing Tips</a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-white text-sm">Travel Insurance</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Email: hello@marco-trip.com</li>
              <li>Support: help@marco-trip.com</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Marco. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
