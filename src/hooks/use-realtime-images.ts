
import { useState, useEffect, useRef } from 'react';
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
  
  // Set up the Supabase realtime connection
  useEffect(() => {
    console.log("Setting up Realtime listener for 'URL+Response' table");
    
    // Only create a new channel if we don't already have one
    if (!channelRef.current) {
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
              onNewImage(payload.new as ImagePlanData);
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
  }, []); // Only set up once, don't rely on onNewImage changing

  // If onNewImage changes, update the channel's event handler
  useEffect(() => {
    if (channelRef.current && onNewImage) {
      console.log("Updating onNewImage handler");
      // This is a separate effect to avoid recreating the channel when onNewImage changes
    }
  }, [onNewImage]);

  return { connected };
}
