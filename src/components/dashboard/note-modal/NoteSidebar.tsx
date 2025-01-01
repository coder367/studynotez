import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NoteSidebarProps {
  noteId: string;
  currentUser: { id: string } | null;
}

export const NoteSidebar = ({ noteId, currentUser }: NoteSidebarProps) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
          .eq("note_id", noteId);
      } else {
        await supabase
          .from("note_likes")
          .insert({
            user_id: currentUser.id,
            note_id: noteId,
          });
      }
      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "Unliked" : "Liked",
        description: isLiked ? "Note removed from likes" : "Note added to likes",
      });
    } catch (error: any) {
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
          .eq("note_id", noteId);
      } else {
        await supabase
          .from("saved_notes")
          .insert({
            user_id: currentUser.id,
            note_id: noteId,
          });
      }
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Removed" : "Saved",
        description: isSaved ? "Note removed from library" : "Note saved to library",
      });
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
      const shareUrl = `${window.location.origin}/dashboard/notes/${noteId}`;
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

  return (
    <div className="p-4 space-y-4">
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
  );
};