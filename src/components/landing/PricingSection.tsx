import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const pricingPlans = [
  {
    name: "Notes",
    description: "Perfect for note-taking",
    price: "10",
    featured: false,
    features: [
      "Access to all notes",
      "Basic note organization",
      "Community support",
      "Email support",
    ],
  },
  {
    name: "Chat",
    description: "Connect with other students",
    price: "15",
    featured: false,
    features: [
      "Everything in Notes",
      "Access to chat feature",
      "Direct messaging",
      "Group chats",
      "File sharing",
    ],
  },
  {
    name: "Study Room",
    description: "Best for active students",
    price: "20",
    featured: true,
    features: [
      "Everything in Chat",
      "Access to study rooms",
      "Live study sessions",
      "Video conferencing",
      "Screen sharing",
      "Priority support",
    ],
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 heading-gradient">
          Choose Your Study Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 rounded-xl animate-fade-up hover:scale-105 transition-transform ${
                plan.featured ? "border-2 border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              {plan.featured && (
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`w-full text-center block py-3 px-6 rounded-lg transition-colors ${
                  plan.featured
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;