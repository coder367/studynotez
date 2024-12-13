import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === "SIGNED_IN") {
        navigate("/dashboard");
      } else if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side image */}
      <div className="hidden lg:flex lg:w-3/5 bg-primary/10">
        <div className="w-full h-full flex items-center justify-center p-12">
          <img
            src="/placeholder.svg"
            alt="Study illustration"
            className="max-w-full max-h-full object-contain animate-float"
          />
        </div>
      </div>

      {/* Right side auth form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight heading-gradient">
              Welcome to StudyNotes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join our community of students sharing knowledge
            </p>
          </div>

          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(126, 105, 171)',
                    brandAccent: 'rgb(110, 89, 165)',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-md',
                message: 'text-sm text-red-500',
              },
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth/callback`}
            onError={(error) => {
              console.error("Auth error:", error);
              toast({
                variant: "destructive",
                title: "Authentication Error",
                description: error.message || "Failed to authenticate. Please try again.",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;