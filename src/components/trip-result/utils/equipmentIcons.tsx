
import React from "react";
import { Mountain, Umbrella, Sun, Map, Wind, Compass, Route } from "lucide-react";

export const getIconForEquipment = (name: string): JSX.Element => {
  const iconMap: Record<string, JSX.Element> = {
    "Hiking boots": <Mountain className="h-5 w-5" />,
    "Rain jacket": <Umbrella className="h-5 w-5" />,
    "Sun protection": <Sun className="h-5 w-5" />,
    "Trail map": <Map className="h-5 w-5" />,
    "Water bottle": <Wind className="h-5 w-5" />,
    "Compass": <Compass className="h-5 w-5" />,
    "Navigation": <Route className="h-5 w-5" />
  };
  
  return iconMap[name] || <Map className="h-5 w-5" />;
};
