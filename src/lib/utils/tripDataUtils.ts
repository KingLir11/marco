
import { TripPlanRecord, ParsedTripPlan, TripData } from '@/lib/types/tripTypes';
import { getIconForEquipment } from './equipmentIcons';
import React from 'react';

// Mock data for when we're in development or if data fetching fails
export const mockTripData: TripData = {
  destination: "Swiss Alps",
  dateRange: "June 10-17, 2023",
  mainPlan: [
    { day: "Day 1", activity: "Arrival and check-in at Mountain Lodge", weather: "Sunny, 22°C" },
    { day: "Day 2", activity: "Hiking trail to Alpine Lake", weather: "Sunny, 24°C" },
    { day: "Day 3", activity: "Cable car to Mountain Peak", weather: "Partly Cloudy, 20°C" },
    { day: "Day 4", activity: "Visit to local village and markets", weather: "Sunny, 23°C" },
    { day: "Day 5", activity: "Mountain biking adventure", weather: "Cloudy, 19°C" },
  ],
  alternativePlan: [
    { day: "Day 2", activity: "Visit Alpine Museum", weather: "Rain, 15°C" },
    { day: "Day 3", activity: "Spa day at Mountain Lodge", weather: "Heavy Rain, 14°C" },
    { day: "Day 5", activity: "Indoor rock climbing center", weather: "Thunderstorm, 16°C" },
  ],
  equipment: [
    { name: "Hiking boots" },
    { name: "Rain jacket" },
    { name: "Sun protection" },
    { name: "Trail map" },
    { name: "Water bottle" },
    { name: "Compass" },
  ]
};

/**
 * Parse the trip plan data from a Supabase record
 */
export const parseTripPlanData = (record: TripPlanRecord): ParsedTripPlan => {
  try {
    // Parse JSON string from trip_plan field if it's a string
    if (typeof record.trip_plan === 'string') {
      const parsed = JSON.parse(record.trip_plan);
      // Check if it's an array and take the first item if it is
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      } else {
        return parsed;
      }
    } else if (typeof record.trip_plan === 'object') {
      // Handle if already parsed as object
      if (Array.isArray(record.trip_plan) && record.trip_plan.length > 0) {
        return record.trip_plan[0];
      } else {
        return record.trip_plan;
      }
    }
  } catch (error) {
    console.error("Error parsing trip plan data:", error);
  }
  
  return {};
};

/**
 * Format a date range string from start and end dates
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

/**
 * Convert Supabase trip record to TripData format
 */
export const convertToTripData = (record: TripPlanRecord): TripData => {
  try {
    // Parse the trip plan data
    const tripPlanData = parseTripPlanData(record);
    
    // Format date range
    const dateRange = formatDateRange(record.start_date, record.end_date);
    
    // Ensure all required fields are present with proper validation
    const mainPlan = tripPlanData.mainPlan?.map(item => ({
      day: item.day || "Unknown Day",
      activity: item.activity || "No activity planned",
      weather: item.weather || "Weather data unavailable"
    })) || mockTripData.mainPlan;
    
    const alternativePlan = tripPlanData.alternativePlan?.map(item => ({
      day: item.day || "Unknown Day",
      activity: item.activity || "No activity planned",
      weather: item.weather || "Weather data unavailable"
    })) || mockTripData.alternativePlan;
    
    const equipment = tripPlanData.equipment?.map(item => ({
      name: item.name || "Unnamed equipment"
    })) || mockTripData.equipment;
    
    // Return properly formatted TripData
    return {
      id: record.id,
      destination: record.destination,
      dateRange,
      mainPlan,
      alternativePlan,
      equipment
    };
  } catch (error) {
    console.error("Error converting trip plan data:", error);
    return {
      ...mockTripData,
      id: record.id,
      destination: record.destination
    };
  }
};

/**
 * Add icon components to equipment items
 */
export const enhanceTripDataWithIcons = (tripData: TripData): TripData => {
  return {
    ...tripData,
    equipment: tripData.equipment.map(item => ({
      ...item,
      icon: getIconForEquipment(item.name)
    }))
  };
};
