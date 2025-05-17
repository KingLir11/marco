
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Channel name used consistently across components
export const CHANNEL_NAME = 'public:URL+Response';

export interface ImagePlanData {
  "Image URL"?: string | null;
  Response?: string | null;
  created_at?: string;
}

export function useRealtimeImages(onNewImage?: (data: ImagePlanData) => void) {
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const toastShownRef = useRef(false);
  const previousCallbackRef = useRef(onNewImage);
  
  // Setup or update the Supabase realtime connection
  const setupChannel = useCallback(() => {
    console.log("Setting up Realtime listener for 'URL+Response' table, callback present:", !!onNewImage);
    
    // Clean up any existing channel before creating a new one
    if (channelRef.current) {
      console.log("Removing previous channel subscription");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Create a new channel with the current callback
    const channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'URL+Response'
        },
        (payload) => {
          console.log("New trip plan received!", payload);
          
          if (onNewImage && payload.new) {
            console.log("Calling onNewImage with:", payload.new);
            onNewImage(payload.new as ImagePlanData);
          } else {
            console.log("onNewImage not called:", { 
              hasCallback: !!onNewImage, 
              hasPayload: !!payload.new 
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Supabase channel status:", status);
        setConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED' && !toastShownRef.current) {
          toast.success("Connected to real-time updates!");
          toastShownRef.current = true;
        } else if (status === 'TIMED_OUT') {
          toast.error("Connection timed out. Please refresh the page.");
        } else if (status === 'CHANNEL_ERROR') {
          toast.error("Error connecting to real-time updates.");
        }
      });
      
    // Store the channel reference
    channelRef.current = channel;
  }, [onNewImage]);

  // Setup the channel when component mounts or when onNewImage changes
  useEffect(() => {
    // Only set up a new channel if the callback has actually changed
    if (previousCallbackRef.current !== onNewImage) {
      console.log("Callback changed, recreating channel");
      previousCallbackRef.current = onNewImage;
      setupChannel();
    } else if (!channelRef.current) {
      // Initial setup if no channel exists yet
      console.log("Initial channel setup");
      setupChannel();
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up Supabase channel");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        toastShownRef.current = false;
      }
    };
  }, [setupChannel, onNewImage]); // Depend on both setupChannel and onNewImage

  return { connected };
}
