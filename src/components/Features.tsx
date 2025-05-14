
import React from "react";
import { CircleCheck, Zap, Shield, Globe } from "lucide-react";

const features = [
  {
    title: "Beautiful Templates",
    description: "Choose from hundreds of professionally designed templates to get started quickly.",
    icon: <Globe className="h-8 w-8 text-primary" />,
  },
  {
    title: "Lightning Fast",
    description: "Our platform is optimized for speed, ensuring your site loads quickly for all visitors.",
    icon: <Zap className="h-8 w-8 text-primary" />,
  },
  {
    title: "Secure & Reliable",
    description: "Built with security in mind, your data is protected with enterprise-grade technology.",
    icon: <Shield className="h-8 w-8 text-primary" />,
  },
  {
    title: "SEO Friendly",
    description: "Rank higher in search engines with our SEO optimized platform.",
    icon: <CircleCheck className="h-8 w-8 text-primary" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Powerful Features for Growing Brands
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Everything you need to build, launch, and grow your online presence.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-sm transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-500 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
