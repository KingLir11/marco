
import React from "react";
import { MapPin } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";

interface DestinationFieldProps {
  control: Control<TripFormData>;
}

export const DestinationField: React.FC<DestinationFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="destination"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Destination</FormLabel>
          <FormControl>
            <div className="relative">
              <MapPin className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
              <Input className="pl-9" placeholder="Where do you want to go?" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
