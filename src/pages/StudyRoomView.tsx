import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoCall from "@/components/study-room/VideoCall";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const StudyRoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitationCode, setInvitationCode] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: room } = useQuery({
    queryKey: ["studyRoom", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["roomParticipants", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_participants")
        .select(`
          *,
          profile:profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("room_id", id);

      if (error) throw error;
      return data;
    },
  });

  const handleJoinRoom = async () => {
    try {
      if (!currentUser) throw new Error("Not authenticated");

      if (!room?.is_public && room?.invitation_code !== invitationCode) {
        toast({
          title: "Error",
          description: "Invalid invitation code",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("room_participants")
        .insert({
          room_id: id,
          user_id: currentUser.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the room",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join room",
        variant: "destructive",
      });
      navigate("/dashboard/study-room");
    }
  };

  const handleCopyInvitationCode = () => {
    if (room?.invitation_code) {
      navigator.clipboard.writeText(room.invitation_code);
      toast({
        title: "Success",
        description: "Invitation code copied to clipboard",
      });
    }
  };

  const handleDeleteRoom = async () => {
    try {
      if (!currentUser) return;
      
      const { error } = await supabase
        .from("study_rooms")
        .delete()
        .eq("id", id)
        .eq("created_by", currentUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      navigate("/dashboard/study-room");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  if (!room) return null;

  const isPrivateRoom = !room.is_public;
  const isRoomCreator = room.created_by === currentUser?.id;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/study-room")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{room.name}</h1>
              {isPrivateRoom && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <Badge variant="secondary">
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPrivateRoom && room.invitation_code && (
            <Button
              variant="outline"
              onClick={handleCopyInvitationCode}
            >
              Copy Invitation Code
            </Button>
          )}
          {isRoomCreator && (
            <Button
              variant="destructive"
              onClick={handleDeleteRoom}
            >
              Delete Room
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoCall roomId={room.id} isVoiceOnly={room.type === "focus"} />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Participants</h2>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {participant.profile.full_name?.[0] || "?"}
                </div>
                <span>{participant.profile.full_name || "Anonymous"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoomView;