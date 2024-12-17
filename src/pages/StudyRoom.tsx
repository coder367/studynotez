import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RoomCard from "@/components/study-room/RoomCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const StudyRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["studyRooms"],
    queryFn: async () => {
      const { data: rooms, error } = await supabase
        .from("study_rooms")
        .select(`
          *,
          room_participants (
            count
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return rooms.map(room => ({
        ...room,
        participants: room.room_participants[0]?.count || 0
      }));
    },
  });

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as "study" | "focus";
    const isPublic = formData.get("visibility") === "public";
    const invitationCode = !isPublic ? generateInvitationCode() : null;

    try {
      if (!currentUser) throw new Error("Not authenticated");

      const { data: room, error } = await supabase
        .from("study_rooms")
        .insert({
          name,
          type,
          is_public: isPublic,
          created_by: currentUser.id,
          invitation_code: invitationCode,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("room_participants")
        .insert({
          room_id: room.id,
          user_id: currentUser.id,
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

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from("study_rooms")
        .delete()
        .eq("id", roomId)
        .eq("created_by", currentUser?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["studyRooms"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  const copyInvitationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Success",
        description: "Invitation code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy invitation code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Study Rooms</h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Room</DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="relative">
            <RoomCard
              id={room.id}
              name={room.name}
              type={room.type}
              participants={room.participants}
              isPublic={room.is_public}
            />
            {room.created_by === currentUser?.id && (
              <div className="absolute top-4 right-4 flex gap-2">
                {!room.is_public && room.invitation_code && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyInvitationCode(room.invitation_code!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyRoom;
