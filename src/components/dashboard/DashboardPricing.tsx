import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

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
      "Video conferencing",
      "Priority support",
    ],
  },
];

const DashboardPricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (planName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
    <SidebarProvider>
      <div className="min-h-screen flex">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Pricing Plans</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`p-8 rounded-xl glass-card transition-all duration-300 hover:scale-105 ${
                    plan.featured ? "border-2 border-primary ring-2 ring-primary/20" : ""
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
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-muted-foreground">
                        <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full text-lg py-6"
                    variant={plan.featured ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    Subscribe Now
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPricing;