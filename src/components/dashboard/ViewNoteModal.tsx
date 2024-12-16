import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, User, Heart, Share2, Bookmark, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    university?: string;
    file_url?: string;
    file_type?: string;
    user_id: string;
    created_at: string;
  };
}

const ViewNoteModal = ({ isOpen, onClose, note }: ViewNoteModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", note.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", note.user_id)
        .single();
      return data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", note.user_id],
    queryFn: async () => {
      if (!currentUser) return false;
      const { data } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", note.user_id)
        .single();
      return !!data;
    },
    enabled: !!currentUser && currentUser.id !== note.user_id,
  });

  const handleDownload = async () => {
    if (note.file_url) {
      const response = await fetch(note.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.${note.file_type?.split('/').pop()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", note.user_id);
      } else {
        await supabase
          .from("followers")
          .insert({
            follower_id: currentUser.id,
            following_id: note.user_id,
          });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like notes",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("note_likes")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("note_id", note.id);
      } else {
        await supabase
          .from("note_likes")
          .insert({
            user_id: currentUser.id,
            note_id: note.id,
          });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save notes",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from("saved_notes")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("note_id", note.id);
      } else {
        await supabase
          .from("saved_notes")
          .insert({
            user_id: currentUser.id,
            note_id: note.id,
          });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleChat = () => {
    navigate(`/dashboard/chat?user=${note.user_id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{note.title}</h2>
            {note.description && (
              <p className="text-muted-foreground mt-1">{note.description}</p>
            )}
            <div className="flex gap-2 mt-2">
              {note.subject && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {note.subject}
                </span>
              )}
              {note.university && (
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  {note.university}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {note.file_url && (
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 overflow-hidden">
            {note.file_url && (
              <iframe
                src={note.file_url}
                className="w-full h-full"
                title={note.title}
              />
            )}
          </div>
          {profile && (
            <div className="w-64 border-l p-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{profile.full_name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                {currentUser && currentUser.id !== note.user_id && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleChat}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLike}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    className={isSaved ? "text-yellow-500" : ""}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;