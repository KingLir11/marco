
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
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
});

type FormData = z.infer<typeof formSchema>;

const TripPlanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      style: "nature",
      budget: [50],
    },
  });

  function onSubmit(data: FormData) {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd save this data to state/context or API
      console.log("Form data:", data);
      navigate("/result");
      setLoading(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#7FA99C] to-[#6c9589] p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold font-playfair text-center mb-8">Plan Your Trip</h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <div className="h-16 w-40 bg-[#79A9CE]/40 rounded-full animate-cloud-move mb-4"></div>
              <p className="text-center text-lg font-medium">Matching your route with the weather forecast...</p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate ? date < startDate : date < new Date();
                            }}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
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
              
              <FormField
                control={form.control}
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
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                Create My Plan
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default TripPlanForm;
