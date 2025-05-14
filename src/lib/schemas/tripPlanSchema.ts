
import { z } from "zod";

export const tripFormSchema = z.object({
  destination: z.string().min(2, { message: "Please enter a valid destination" }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  style: z.enum(["relaxed", "nature", "urban", "adventure"], {
    required_error: "Please select a trip style",
  }),
  budget: z.array(z.number()).refine((value) => value.length === 1, {
    message: "Budget is required",
  }),
  extraRequests: z.string().optional(),
});

export type TripFormData = z.infer<typeof tripFormSchema>;
