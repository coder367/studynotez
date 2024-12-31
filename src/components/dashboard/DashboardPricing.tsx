import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PricingPlan } from "./pricing/PricingPlan";
import { PayPalButton } from "./pricing/PayPalButton";

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
  const [showPayPal, setShowPayPal] = useState(false);
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

    // Load PayPal script
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD";
    script.async = true;
    document.body.appendChild(script);

    checkSubscription();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Basic") {
      toast({
        title: "Already on Basic Plan",
        description: "You are currently using the Basic plan features.",
      });
      return;
    }

    setShowPayPal(true);
  };

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'pro',
          status: 'active',
          current_period_end: endDate.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
      
      setHasSubscription(true);
      setShowPayPal(false);
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
          <div key={plan.name}>
            <PricingPlan
              {...plan}
              onSubscribe={() => handleSubscribe(plan.name)}
              disabled={hasSubscription || (plan.featured && showPayPal)}
              buttonText={hasSubscription ? "Current Plan" : "Subscribe Now"}
            />
            {plan.featured && showPayPal && !hasSubscription && (
              <PayPalButton onSuccess={handlePaymentSuccess} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPricing;