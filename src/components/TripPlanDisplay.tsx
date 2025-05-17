
import React from "react";
import { TripPlan } from "@/stores/tripPlanStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sun, Umbrella, Home, CalendarDays } from "lucide-react";

interface TripPlanDisplayProps {
  plan: TripPlan;
}

const TripPlanDisplay: React.FC<TripPlanDisplayProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      {/* Itinerary Section */}
      {plan.itinerary && plan.itinerary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>Itinerary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {plan.itinerary.map((day, index) => (
                <AccordionItem key={index} value={`day-${day.day}`}>
                  <AccordionTrigger>
                    Day {day.day}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {day.activities.map((activity, activityIndex) => (
                        <li key={activityIndex}>{activity}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Accommodations Section */}
      {plan.accommodations && plan.accommodations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span>Accommodations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {plan.accommodations.map((accommodation, index) => (
                <li key={index}>{accommodation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weather Forecast Section */}
      {plan.weatherForecast && plan.weatherForecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <span>Weather Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {plan.weatherForecast.map((weather, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  {weather.condition.toLowerCase().includes('rain') ? (
                    <Umbrella className="h-8 w-8 text-blue-500" />
                  ) : (
                    <Sun className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{weather.condition}</p>
                    <p className="text-sm">{weather.temperature}°C</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Display other sections of the trip plan as needed */}
    </div>
  );
};

export default TripPlanDisplay;
