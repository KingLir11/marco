
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";

interface ExtraRequestsFieldProps {
  control: Control<TripFormData>;
}

export const ExtraRequestsField: React.FC<ExtraRequestsFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="extraRequests"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Extra Requests</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Any special requests or preferences for your trip..." 
              className="min-h-[120px] resize-none"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
