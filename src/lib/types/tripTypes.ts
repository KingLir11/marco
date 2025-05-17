
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
  trip_plan: string; // JSON string of trip data
  created_at: string;
  user_id?: string;
}
