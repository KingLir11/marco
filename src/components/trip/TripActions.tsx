
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TripActions: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link to="/my-trips">Save Trip</Link>
      </Button>
      <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90">
        <Link to="/plan">Plan Another Trip</Link>
      </Button>
    </div>
  );
};

export default TripActions;
