
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripPlan {
  destination: string;
  startDate: string;
  endDate: string;
  itinerary?: {
    day: number;
    activities: string[];
  }[];
  accommodations?: string[];
  weatherForecast?: {
    condition: string;
    temperature: number;
  }[];
  imageUrl?: string;
}

interface TripPlanState {
  currentPlan: TripPlan | null;
  setCurrentPlan: (plan: TripPlan) => void;
  clearCurrentPlan: () => void;
}

export const useTripPlanStore = create<TripPlanState>()(
  persist(
    (set) => ({
      currentPlan: null,
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      clearCurrentPlan: () => set({ currentPlan: null }),
    }),
    {
      name: 'trip-plan-storage',
    }
  )
);
