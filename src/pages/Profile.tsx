import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/profile/UserProfile";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  const profileUserId = userId || currentUserId;

  if (!profileUserId) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <UserProfile userId={profileUserId} currentUserId={currentUserId} />
    </div>
  );
};

export default Profile;