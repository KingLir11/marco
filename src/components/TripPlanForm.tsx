
import React from "react";
import TripFormContainer from "./trip-form/TripFormContainer";
import { checkIfTripPlansExist } from "@/services/tripImageService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const TripPlanForm = () => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Check if there are any trip plans in the database
  // If there are, we can navigate to the result page immediately
  useEffect(() => {
    const checkForExistingPlans = async () => {
      try {
        setChecking(true);
        console.log("Checking for existing trip plans...");
        const exists = await checkIfTripPlansExist();
        
        if (exists) {
          console.log("Existing trip plans found, navigating to result page");
          // Small delay to ensure UI updates before navigation
          setTimeout(() => navigate("/result"), 300);
        } else {
          console.log("No existing trip plans found, showing form");
        }
      } catch (error) {
        console.error("Error checking for existing trip plans:", error);
      } finally {
        setChecking(false);
      }
    };

    checkForExistingPlans();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="text-lg">Loading your trip information...</div>
        </div>
      </div>
    );
  }

  return <TripFormContainer />;
};

export default TripPlanForm;
