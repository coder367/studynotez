import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoCall from "@/components/study-room/VideoCall";
import { Badge } from "@/components/ui/badge";

const StudyRoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    fetchRoomDetails();
    const subscription = supabase
      .channel('room_participants')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'room_participants',
        filter: `room_id=eq.${id}` 
      }, () => {
        fetchRoomDetails();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const { data: room, error: roomError } = await supabase
        .from("study_rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (roomError) throw roomError;

      const { data: participants, error: participantsError } = await supabase
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

      if (participantsError) throw participantsError;

      setRoom(room);
      setParticipants(participants);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch room details",
        variant: "destructive",
      });
      navigate("/dashboard/study-room");
    }
  };

  if (!room) {
    return null;
  }

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
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <Badge variant="secondary">
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
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