import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, UserPlus, UserMinus, Twitter, Linkedin, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    bio: "",
    twitter_url: "",
    linkedin_url: "",
    github_url: "",
  });
  
  const { data: userNotes = [], isLoading: isLoadingNotes } = useQuery({
    queryKey: ["userNotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      return data || [];
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          bio: data.bio || "",
          twitter_url: data.twitter_url || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          twitter_url: profileData.twitter_url,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {profileData.full_name?.charAt(0) || "?"}
              </span>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="mb-2"
                />
              ) : (
                <h2 className="text-xl font-bold">{profileData.full_name || "Anonymous"}</h2>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="mb-4"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="twitter_url"
                  value={profileData.twitter_url}
                  onChange={handleInputChange}
                  placeholder="Twitter URL"
                  type="url"
                />
                <Input
                  name="linkedin_url"
                  value={profileData.linkedin_url}
                  onChange={handleInputChange}
                  placeholder="LinkedIn URL"
                  type="url"
                />
                <Input
                  name="github_url"
                  value={profileData.github_url}
                  onChange={handleInputChange}
                  placeholder="GitHub URL"
                  type="url"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProfile} 
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">{profileData.bio || "No bio yet"}</p>
              <div className="flex gap-2 mb-4">
                {profileData.twitter_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={profileData.twitter_url} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profileData.linkedin_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profileData.github_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={profileData.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Edit Profile
              </Button>
            </>
          )}
        </Card>

        {/* User's Notes */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Uploaded Notes</h3>
          {isLoadingNotes ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : userNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNotes.map((note: any) => (
                <Card key={note.id} className="p-4">
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground">{note.subject}</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No notes uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;