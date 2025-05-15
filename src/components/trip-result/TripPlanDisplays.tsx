
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanItem {
  day: string;
  activity: string;
  weather: string;
}

interface TripPlanDisplaysProps {
  mainPlan: PlanItem[];
  alternativePlan: PlanItem[];
}

const TripPlanDisplays = ({ mainPlan, alternativePlan }: TripPlanDisplaysProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      <Card className="border border-white/20 shadow-lg">
        <CardHeader className="bg-primary/10 border-b">
          <CardTitle className="text-primary">Main Plan</CardTitle>
          <CardDescription>Optimized for the forecast weather</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {mainPlan.length > 0 ? (
            <ul className="space-y-3">
              {mainPlan.map((item, index) => (
                <li key={index} className="flex justify-between border-b pb-2 last:border-0">
                  <div>
                    <span className="font-semibold">{item.day}:</span> {item.activity}
                  </div>
                  <div className="text-sm text-gray-600">{item.weather}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No main plan activities yet.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="border border-white/20 shadow-lg">
        <CardHeader className="bg-secondary/10 border-b">
          <CardTitle className="text-secondary">Alternative Plan</CardTitle>
          <CardDescription>In case of weather changes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {alternativePlan.length > 0 ? (
            <ul className="space-y-3">
              {alternativePlan.map((item, index) => (
                <li key={index} className="flex justify-between border-b pb-2 last:border-0">
                  <div>
                    <span className="font-semibold">{item.day}:</span> {item.activity}
                  </div>
                  <div className="text-sm text-gray-600">{item.weather}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No alternative plan activities yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripPlanDisplays;
