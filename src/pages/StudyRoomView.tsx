import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoCall from "@/components/study-room/VideoCall";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RoomHeader from "@/components/study-room/RoomHeader";
import ParticipantsList from "@/components/study-room/ParticipantsList";

const StudyRoomView = () => {
  const { id } = useParams<{ id: string }>();
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
      if (!id) throw new Error("Room ID is required");

      const { data, error } = await supabase
        .from("study_rooms")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) {
        console.error("Error fetching room:", error);
        throw error;
      }
      if (!data) {
        console.error("Room not found");
        throw new Error("Room not found");
      }
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["roomParticipants", id],
    queryFn: async () => {
      if (!id) throw new Error("Room ID is required");

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

      if (error) {
        console.error("Error fetching participants:", error);
        throw error;
      }
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (isRoomError || (room && room.deleted_at)) {
      toast({
        title: "Room Not Found",
        description: "This room no longer exists or has been deleted",
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
      if (!currentUser?.id || !id) return;
      
      // Delete the room participants first
      const { error: participantsError } = await supabase
        .from("room_participants")
        .delete()
        .eq("room_id", id);

      if (participantsError) throw participantsError;

      // Then delete the room
      const { error: roomError } = await supabase
        .from("study_rooms")
        .delete()
        .eq("id", id)
        .eq("created_by", currentUser.id);

      if (roomError) throw roomError;

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["studyRooms"] });
      navigate("/dashboard/study-room");
    } catch (error: any) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  if (!room || !id) return null;

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
          <VideoCall roomId={id} isVoiceOnly={room.type === "focus"} />
        </div>
        <div>
          <ParticipantsList participants={participants} />
        </div>
      </div>
    </div>
  );
};

export default StudyRoomView;