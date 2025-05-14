
import React from "react";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Ready to Transform Your Online Presence?
            </h2>
            <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
              Join thousands of businesses that trust Brandify to power their digital growth.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Book a Demo
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/60">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
