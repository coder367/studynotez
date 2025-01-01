import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NoteContainer } from "./note-modal/NoteContainer";

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

  // Query to get the note author's profile
  const { data: profile } = useQuery({
    queryKey: ["profile", note.user_id],
    queryFn: async () => {
      console.log("Fetching profile for user:", note.user_id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", note.user_id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      console.log("Profile data:", data);
      return data;
    },
  });

  // Query to get current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
      return user;
    },
  });

  // Query to check if following
  const { data: followers = [] } = useQuery({
    queryKey: ["isFollowing", note.user_id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", note.user_id);
      return data || [];
    },
    enabled: !!currentUser && currentUser.id !== note.user_id,
  });

  const isFollowing = followers.length > 0;

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
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
      const shareUrl = `${window.location.origin}/dashboard/notes/${note.id}`;
      await navigator.clipboard.writeText(shareUrl);
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
        <DialogTitle className="sr-only">{note.title}</DialogTitle>
        
        <NoteContainer
          note={note}
          profile={profile}
          isLiked={isLiked}
          isSaved={isSaved}
          showChatButton={!!currentUser && currentUser.id !== note.user_id}
          isFollowing={isFollowing}
          onDownload={handleDownload}
          onLike={handleLike}
          onSave={handleSave}
          onShare={handleShare}
          onChat={handleChat}
          onFollow={handleFollow}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;