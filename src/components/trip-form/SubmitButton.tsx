
import React from "react";
import { Button } from "@/components/ui/button";

export const SubmitButton: React.FC = () => {
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
      Create My Plan
    </Button>
  );
};
