import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileSetupModal } from "@/components/profile/ProfileSetupModal";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ResendVerification } from "@/components/auth/ResendVerification";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (session?.user?.email_confirmed_at) {
          console.log("User has confirmed email, redirecting to dashboard");
          navigate("/dashboard");
        } else if (session?.user?.email) {
          console.log("User email not confirmed, showing verification options");
          setUserEmail(session.user.email);
          setShowResendButton(true);
          toast({
            title: "Email Verification Required",
            description: "Please check your email and verify your account before signing in.",
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check authentication status",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN") {
        if (!session?.user.email_confirmed_at) {
          console.log("Email not confirmed, showing verification options");
          setUserEmail(session.user.email);
          setShowResendButton(true);
          toast({
            title: "Email Verification Required",
            description: "Please check your email and verify your account before signing in.",
          });
          return;
        }

        if (session?.user.app_metadata.provider === "email") {
          setNewUserId(session.user.id);
          setShowProfileSetup(true);
        } else {
          toast({
            title: "Welcome!",
            description: "Successfully signed in.",
          });
          navigate("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        navigate("/");
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for the password reset link",
        });
      } else if (event === "USER_UPDATED") {
        console.log("User updated:", session);
        if (session?.user.email_confirmed_at) {
          navigate("/dashboard");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-3/5 bg-primary/5">
        <div className="w-full h-full relative flex items-center justify-center p-12">
          <img
            src="/lovable-uploads/2651af33-462f-42d5-b1cc-e6a55e16764d.png"
            alt="Student studying with laptop and books"
            className="max-w-full max-h-full object-contain"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <AuthHeader />

          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(126, 105, 171)',
                    brandAccent: 'rgb(110, 89, 165)',
                    inputText: 'white',
                    inputBackground: 'transparent',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-md',
                message: 'text-sm text-red-500',
                label: 'text-foreground',
                input: 'text-foreground caret-white bg-muted',
                anchor: 'text-primary hover:text-primary/80',
              },
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth/callback`}
            localization={{
              variables: {
                sign_up: {
                  email_label: "Email",
                  password_label: "Password",
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Your password",
                  button_label: "Sign up",
                  loading_button_label: "Signing up ...",
                },
                sign_in: {
                  email_label: "Email",
                  password_label: "Password",
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Your password",
                  button_label: "Sign in",
                  loading_button_label: "Signing in ...",
                },
                forgotten_password: {
                  email_label: "Email",
                  password_label: "Password",
                  email_input_placeholder: "Your email address",
                  button_label: "Send reset instructions",
                  loading_button_label: "Sending reset instructions...",
                },
              },
            }}
          />

          <ResendVerification 
            userEmail={userEmail}
            show={showResendButton}
          />
        </div>
      </div>

      {showProfileSetup && newUserId && (
        <ProfileSetupModal
          isOpen={showProfileSetup}
          onClose={() => {
            setShowProfileSetup(false);
            navigate("/dashboard");
          }}
          userId={newUserId}
        />
      )}
    </div>
  );
};

export default Auth;