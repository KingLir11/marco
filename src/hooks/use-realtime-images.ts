
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Channel name used consistently across components
export const CHANNEL_NAME = 'public:Images-Plan';

export interface ImagePlanData {
  ImageURL?: string | null;
  Response?: string | null;
  created_at?: string;
}

export function useRealtimeImages(onNewImage?: (data: ImagePlanData) => void) {
  const [connected, setConnected] = useState(false);
  
  // Set up the Supabase realtime connection
  useEffect(() => {
    console.log("Setting up Realtime listener for 'Images-Plan' table");
    
    const channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Images-Plan'
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
      });

    return () => {
      console.log("Cleaning up Supabase channel");
      supabase.removeChannel(channel);
    };
  }, [onNewImage]);

  return { connected };
}
