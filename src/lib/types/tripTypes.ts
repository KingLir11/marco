
import React from 'react';

export interface DailyActivity {
  day: string;
  activity: string;
  weather: string;
}

export interface EquipmentItem {
  name: string;
  icon?: React.ReactNode; // Will be populated in the UI
}

export interface TripData {
  id?: string;
  destination: string;
  dateRange: string;
  mainPlan: DailyActivity[];
  alternativePlan: DailyActivity[];
  equipment: EquipmentItem[];
}

// Database representation of a trip plan
export interface TripPlanRecord {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_plan: string | any; // Updated to accept both string and parsed JSON
  created_at: string;
  user_id?: string;
}

// Helper type for parsed trip plan data from JSON
export interface ParsedTripPlan {
  mainPlan?: Array<{
    day: string;
    activity: string;
    weather: string;
  }>;
  alternativePlan?: Array<{
    day: string;
    activity: string;
    weather: string;
  }>;
  equipment?: Array<{
    name: string;
  }>;
}
