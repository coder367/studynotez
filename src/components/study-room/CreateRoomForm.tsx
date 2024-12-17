import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudyRoomType } from "@/types/study-room";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface CreateRoomFormProps {
  currentUserId?: string;
  onSuccess?: () => void;
}

export const CreateRoomForm = ({ currentUserId, onSuccess }: CreateRoomFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as StudyRoomType;
    const isPublic = formData.get("visibility") === "public";
    const invitationCode = !isPublic ? generateInvitationCode() : null;

    try {
      if (!currentUserId) throw new Error("Not authenticated");

      const { data: room, error } = await supabase
        .from("study_rooms")
        .insert({
          name,
          type,
          is_public: isPublic,
          created_by: currentUserId,
          invitation_code: invitationCode,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("room_participants")
        .insert({
          room_id: room.id,
          user_id: currentUserId,
        });

      if (!isPublic) {
        toast({
          title: "Room Created",
          description: `Invitation Code: ${invitationCode}`,
        });
      } else {
        toast({
          title: "Success",
          description: "Room created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["studyRooms"] });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreateRoom} className="space-y-4">
      <div>
        <Label htmlFor="name">Room Name</Label>
        <Input id="name" name="name" required />
      </div>
      
      <div className="space-y-2">
        <Label>Room Type</Label>
        <RadioGroup name="type" defaultValue="study" className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="study" id="study" />
            <Label htmlFor="study">Study Room (Video)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="focus" id="focus" />
            <Label htmlFor="focus">Focus Room (Voice)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        <RadioGroup name="visibility" defaultValue="private" className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public">Public</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="private" id="private" />
            <Label htmlFor="private">Private</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
};