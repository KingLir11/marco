
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BackgroundImageProps {
  imageURL: string | null;
}

const BackgroundImage = ({ imageURL }: BackgroundImageProps) => {
  return (
    <>
      {imageURL ? (
        <div className="absolute inset-0 w-full h-full z-0">
          <AspectRatio ratio={16/9} className="h-full">
            <img 
              src={imageURL} 
              alt="Trip destination" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </AspectRatio>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-300 z-0" />
      )}
    </>
  );
};

export default BackgroundImage;
