
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Control } from "react-hook-form";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";

interface BudgetFieldProps {
  control: Control<TripFormData>;
}

export const BudgetField: React.FC<BudgetFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="budget"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Budget ($ per day)</FormLabel>
          <FormControl>
            <div className="space-y-3">
              <Slider
                value={field.value}
                onValueChange={field.onChange}
                max={300}
                step={10}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Budget</span>
                <span>${field.value} / day</span>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
