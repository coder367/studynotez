import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NoteHeader } from "./note-modal/NoteHeader";
import { UserInfo } from "./note-modal/UserInfo";
import { NoteActions } from "./note-modal/NoteActions";

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
        <DialogTitle className="sr-only">{note.title}</DialogTitle>
        <NoteHeader
          title={note.title}
          description={note.description}
          subject={note.subject}
          university={note.university}
          fileUrl={note.file_url}
          onDownload={handleDownload}
          onClose={onClose}
        />

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
              <UserInfo
                avatarUrl={profile.avatar_url}
                fullName={profile.full_name}
                createdAt={note.created_at}
              />
              <NoteActions
                isLiked={isLiked}
                isSaved={isSaved}
                showChatButton={!!currentUser && currentUser.id !== note.user_id}
                isFollowing={isFollowing}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onChat={handleChat}
                onFollow={handleFollow}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;