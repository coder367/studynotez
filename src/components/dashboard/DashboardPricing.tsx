import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const pricingPlans = [
  {
    name: "Basic",
    description: "Perfect for getting started",
    price: "0",
    featured: false,
    features: [
      "Access to all notes",
      "Basic note organization",
      "Community support",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description: "Best for active students",
    price: "20",
    featured: true,
    features: [
      "Everything in Basic",
      "Access to chat feature",
      "Access to study rooms",
      "Live study sessions",
      "Priority support",
    ],
  },
];

export const DashboardPricing = () => {
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setHasSubscription(!!subscription);
    };

    checkSubscription();
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Basic") {
      toast({
        title: "Already on Basic Plan",
        description: "You are currently using the Basic plan features.",
      });
      return;
    }

    // Initialize PayPal payment
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Here we'll add PayPal payment flow
      toast({
        title: "Coming Soon",
        description: "PayPal integration is being set up. Please try again later.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your study needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-8 rounded-xl ${
              plan.featured ? "border-2 border-primary" : ""
            }`}
          >
            {plan.featured && (
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
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
            <Button
              className="w-full"
              variant={plan.featured ? "default" : "outline"}
              onClick={() => handleSubscribe(plan.name)}
              disabled={plan.name === "Basic" || (plan.name === "Pro" && hasSubscription)}
            >
              {plan.name === "Basic"
                ? "Current Plan"
                : hasSubscription
                ? "Current Plan"
                : "Subscribe Now"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};