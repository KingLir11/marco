
import React from 'react';
import { Mountain, Map, Compass, Sun, Umbrella, Wind } from 'lucide-react';

/**
 * Returns the appropriate icon component for a given equipment name
 * @param equipmentName The name of the equipment
 * @returns React component for the icon
 */
export const getIconForEquipment = (equipmentName: string): React.ReactNode => {
  switch(equipmentName) {
    case "Hiking boots":
      return <Mountain className="h-5 w-5" />;
    case "Rain jacket":
      return <Umbrella className="h-5 w-5" />;
    case "Sun protection":
      return <Sun className="h-5 w-5" />;
    case "Trail map":
      return <Map className="h-5 w-5" />;
    case "Water bottle":
      return <Wind className="h-5 w-5" />;
    case "Compass":
      return <Compass className="h-5 w-5" />;
    default:
      return <Map className="h-5 w-5" />; // Default icon
  }
};
