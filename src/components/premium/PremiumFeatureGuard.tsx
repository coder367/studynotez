import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
}

export const PremiumFeatureGuard = ({ children }: PremiumFeatureGuardProps) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      
      return subscription;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          This feature is only available to premium subscribers. Upgrade your plan to access premium features.
        </p>
        <Button onClick={() => navigate("/dashboard/pricing")} className="w-full max-w-sm">
          View Pricing Plans
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};