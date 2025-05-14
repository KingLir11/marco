
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";

interface StyleFieldProps {
  control: Control<TripFormData>;
}

export const StyleField: React.FC<StyleFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="style"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Trip Style</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a trip style" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="relaxed">Relaxed</SelectItem>
              <SelectItem value="nature">Nature & Outdoors</SelectItem>
              <SelectItem value="urban">Urban & City</SelectItem>
              <SelectItem value="adventure">Adventure & Activities</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
