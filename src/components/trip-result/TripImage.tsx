
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TripImageProps {
  imageURL: string | null;
  destination: string;
}

const TripImage = ({ imageURL, destination }: TripImageProps) => {
  if (!imageURL) return null;

  return (
    <div className="mb-10 border rounded-lg overflow-hidden shadow-lg">
      <AspectRatio ratio={16/9}>
        <img 
          src={imageURL} 
          alt={`${destination} preview`} 
          className="w-full h-full object-cover"
        />
      </AspectRatio>
    </div>
  );
};

export default TripImage;
