import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RoomCard from "@/components/study-room/RoomCard";
import { CreateRoomForm } from "@/components/study-room/CreateRoomForm";
import type { StudyRoom } from "@/types/study-room";

const SECRET_STATEMENT = "Deepanshu and Pratham this year is will do something";

const StudyRoomPage = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accessAttempted, setAccessAttempted] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 30000,
  });

  const { data: rooms = [], isLoading } = useQuery({
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
        participants: room.room_participants?.[0]?.count || 0
      })) as StudyRoom[];
    },
    staleTime: 5000,
  });

  // Check if user has access through localStorage
  const hasAccess = localStorage.getItem("studyRoomAccess") === "granted";

  const handleAccessAttempt = (statement: string) => {
    if (statement === SECRET_STATEMENT) {
      localStorage.setItem("studyRoomAccess", "granted");
      window.location.reload(); // Reload to show the study room
    }
    setAccessAttempted(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading...</div>;
  }

  // Show coming soon page for users without access
  if (!hasAccess) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Study Rooms</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="animate-float">
            <Rocket className="h-24 w-24 text-primary mb-6" />
          </div>
          <h2 className="text-4xl font-bold text-primary mb-4 animate-fade-up">
            Coming Soon!
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-md mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
            We're working hard to bring you an amazing collaborative study experience. Stay tuned!
          </p>
          
          {/* Access form */}
          <div className="w-full max-w-md mt-4">
            <input
              type="text"
              placeholder="Enter access statement"
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => handleAccessAttempt(e.target.value)}
            />
            {accessAttempted && (
              <p className="text-sm text-destructive mt-2">Invalid access statement. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <CreateRoomForm 
              currentUserId={currentUser?.id}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            type={room.type}
            participants={room.participants}
            isPublic={room.is_public}
            invitationCode={room.invitation_code}
            createdBy={room.created_by}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyRoomPage;