
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TripFormData } from "@/lib/schemas/tripPlanSchema";
import { DestinationField } from "./DestinationField";
import { DateField } from "./DateField";
import { StyleField } from "./StyleField";
import { BudgetField } from "./BudgetField";
import { ExtraRequestsField } from "./ExtraRequestsField";

interface FormFieldsProps {
  form: UseFormReturn<TripFormData>;
}

export const FormFields: React.FC<FormFieldsProps> = ({ form }) => {
  return (
    <>
      <DestinationField control={form.control} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateField 
          control={form.control} 
          name="startDate" 
          label="Start Date" 
          getDisabledDates={(date) => date < new Date()}
        />
        
        <DateField 
          control={form.control} 
          name="endDate" 
          label="End Date" 
          getDisabledDates={(date) => {
            const startDate = form.getValues("startDate");
            return startDate ? date < startDate : date < new Date();
          }}
        />
      </div>
      
      <StyleField control={form.control} />
      <BudgetField control={form.control} />
      <ExtraRequestsField control={form.control} />
    </>
  );
};
