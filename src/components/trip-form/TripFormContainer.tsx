
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DestinationField } from "@/components/trip-form/DestinationField";
import { DateField } from "@/components/trip-form/DateField";
import { StyleField } from "@/components/trip-form/StyleField";
import { BudgetField } from "@/components/trip-form/BudgetField";
import { ExtraRequestsField } from "@/components/trip-form/ExtraRequestsField";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";
import { UseFormReturn } from "react-hook-form";

interface TripFormContainerProps {
  form: UseFormReturn<TripFormData>;
  onSubmit: (data: TripFormData) => void;
}

export const TripFormContainer: React.FC<TripFormContainerProps> = ({ form, onSubmit }) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DestinationField control={form.control} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateField 
            control={form.control} 
            name="startDate" 
            label="Start Date" 
            getDisabledDates={date => date < new Date()} 
          />
          
          <DateField 
            control={form.control} 
            name="endDate" 
            label="End Date" 
            getDisabledDates={date => {
              const startDate = form.getValues("startDate");
              return startDate ? date < startDate : date < new Date();
            }} 
          />
        </div>
        
        <StyleField control={form.control} />
        <BudgetField control={form.control} />
        <ExtraRequestsField control={form.control} />
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
          Create My Plan
        </Button>
      </form>
    </Form>
  );
};
