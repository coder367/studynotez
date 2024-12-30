import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResendVerificationProps {
  userEmail: string | null;
  show: boolean;
}

export const ResendVerification = ({ userEmail, show }: ResendVerificationProps) => {
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!userEmail) {
      console.error("No email provided for verification");
      return;
    }

    try {
      console.log("Attempting to resend verification email to:", userEmail);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) {
        console.error("Error resending verification:", error);
        throw error;
      }

      console.log("Verification email sent successfully");
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
      });
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resend verification email",
      });
    }
  };

  if (!show || !userEmail) return null;

  return (
    <div className="text-center mt-4">
      <p className="text-sm text-muted-foreground mb-2">
        Haven't received the verification email?
      </p>
      <Button
        variant="outline"
        onClick={handleResendVerification}
        className="w-full"
      >
        Resend Verification Email
      </Button>
    </div>
  );
};