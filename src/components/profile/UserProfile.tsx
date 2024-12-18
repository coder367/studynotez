import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ViewNoteModal from "@/components/dashboard/ViewNoteModal";
import { useState } from "react";

interface UserProfileProps {
  userId: string;
  currentUserId?: string;
}

export const UserProfile = ({ userId, currentUserId }: UserProfileProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    },
  });

  const { data: userNotes } = useQuery({
    queryKey: ["userNotes", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data;
    },
  });

  const { data: followersCount = 0 } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("followers")
        .select("*", { count: 'exact', head: true })
        .eq("following_id", userId);
      return count || 0;
    },
  });

  const { data: followingCount = 0 } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("followers")
        .select("*", { count: 'exact', head: true })
        .eq("follower_id", userId);
      return count || 0;
    },
  });

  const isFollowing = followersCount > 0;

  const handleFollow = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        if (error) throw error;
      } else {
        const { data: existingFollow } = await supabase
          .from("followers")
          .select("*")
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        if (!existingFollow || existingFollow.length === 0) {
          const { error } = await supabase
            .from("followers")
            .insert({
              follower_id: currentUserId,
              following_id: userId,
            });

          if (error) throw error;
        }
      }
      queryClient.invalidateQueries({ queryKey: ["isFollowing", userId] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleChat = () => {
    navigate(`/dashboard/chat?user=${userId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {profile?.full_name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name || "Anonymous"}</h2>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{followersCount} followers</span>
              <span>{followingCount} following</span>
            </div>
            {profile?.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
          </div>
        </div>
        {currentUserId && currentUserId !== userId && (
          <div className="flex gap-2">
            <Button onClick={handleFollow} variant="outline">
              {isFollowing ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow
                </>
              )}
            </Button>
            <Button onClick={handleChat}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userNotes?.map((note) => (
            <Card
              key={note.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedNote(note)}
            >
              <h4 className="font-medium">{note.title}</h4>
              {note.subject && (
                <p className="text-sm text-muted-foreground mt-1">
                  {note.subject} - {note.university || "Unknown University"}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedNote && (
        <ViewNoteModal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          note={selectedNote}
        />
      )}
    </div>
  );
};
