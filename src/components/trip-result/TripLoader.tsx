
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TripLoaderProps {
  tripId?: string;
}

export const TripLoader: React.FC<TripLoaderProps> = ({ tripId }) => {
  const [loadTime, setLoadTime] = useState(0);
  const navigate = useNavigate();
  
  // Keep track of load time
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRefreshMyTrips = () => {
    navigate('/my-trips');
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto my-12 p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="relative mb-6">
          <div className="h-16 w-40 bg-[#79A9CE]/40 rounded-full animate-cloud-move mb-4"></div>
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-3" />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Loading Your Trip Plan</h2>
        
        {tripId ? (
          <p className="text-sm text-gray-500 mb-6">Loading trip ID: {tripId}</p>
        ) : (
          <p className="text-sm text-gray-500 mb-6">Retrieving latest trip details... ({loadTime}s)</p>
        )}
        
        <div className="animate-pulse space-y-6 w-full">
          <Skeleton className="h-8 w-1/3 mx-auto" />
          <Skeleton className="h-4 w-1/4 mx-auto" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
        
        <div className="mt-8 max-w-md w-full">
          <Progress value={Math.min(loadTime * 5, 95)} className="h-1 mb-2" />
          <p className="text-center text-gray-600">Retrieving your trip plan from database...</p>
        </div>
        
        {/* Add an option to view all trips if loading takes too long */}
        {loadTime > 10 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Taking longer than expected? Check all your saved trips.
            </p>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleRefreshMyTrips}
            >
              <RefreshCw className="h-4 w-4" /> View My Trips
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
