import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
}

export const PremiumFeatureGuard = ({ children }: PremiumFeatureGuardProps) => {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select()
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (error) throw error;
        setHasSubscription(!!subscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Error",
          description: "Failed to verify subscription status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [navigate, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[200px]">Loading...</div>;
  }

  if (!hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          This feature is only available to Pro plan subscribers. Upgrade your plan to access chat and study room features.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="w-full max-w-sm">
          View Pricing Plans
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};