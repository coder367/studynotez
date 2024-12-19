import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoCall from "@/components/study-room/VideoCall";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RoomHeader from "@/components/study-room/RoomHeader";
import ParticipantsList from "@/components/study-room/ParticipantsList";

const StudyRoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: room, isError: isRoomError } = useQuery({
    queryKey: ["studyRoom", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_rooms")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
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

  useEffect(() => {
    if (isRoomError || (room && room.deleted_at)) {
      toast({
        title: "Error",
        description: "This room no longer exists",
        variant: "destructive",
      });
      navigate("/dashboard/study-room");
    }
  }, [isRoomError, room, navigate, toast]);

  const handleCopyInvitationCode = async () => {
    if (room?.invitation_code) {
      try {
        await navigator.clipboard.writeText(room.invitation_code);
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
    }
  };

  const handleDeleteRoom = async () => {
    try {
      if (!currentUser?.id) return;
      
      // Soft delete the room
      const { error: roomError } = await supabase
        .from("study_rooms")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("created_by", currentUser.id);

      if (roomError) throw roomError;

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["studyRooms"] });
      queryClient.invalidateQueries({ queryKey: ["studyRoom", id] });
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
  const isRoomCreator = currentUser && room.created_by === currentUser.id;

  return (
    <div className="container mx-auto py-6">
      <RoomHeader
        name={room.name}
        isPrivate={isPrivateRoom}
        participantsCount={participants.length}
        isRoomCreator={isRoomCreator}
        invitationCode={room.invitation_code}
        onCopyInvitationCode={handleCopyInvitationCode}
        onDeleteRoom={handleDeleteRoom}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoCall roomId={room.id} isVoiceOnly={room.type === "focus"} />
        </div>
        <div>
          <ParticipantsList participants={participants} />
        </div>
      </div>
    </div>
  );
};

export default StudyRoomView;