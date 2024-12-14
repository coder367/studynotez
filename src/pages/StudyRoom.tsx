import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Video, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Room {
  id: string;
  name: string;
  type: "study" | "focus";
  participants: number;
}

const StudyRoom = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", name: "Math Study Group", type: "study", participants: 3 },
    { id: "2", name: "Focus Room", type: "focus", participants: 1 },
  ]);

  const handleCreateRoom = (name: string, type: "study" | "focus") => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      type,
      participants: 0,
    };
    setRooms([...rooms, newRoom]);
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
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateRoom(
                formData.get("name") as string,
                formData.get("type") as "study" | "focus"
              );
            }}>
              <div>
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-20"
                    onClick={() => handleCreateRoom("New Study Room", "study")}
                  >
                    <div className="text-center">
                      <Video className="h-6 w-6 mx-auto mb-2" />
                      <span>Study Room</span>
                    </div>
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-20"
                    onClick={() => handleCreateRoom("New Focus Room", "focus")}
                  >
                    <div className="text-center">
                      <Mic className="h-6 w-6 mx-auto mb-2" />
                      <span>Focus Room</span>
                    </div>
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {room.participants} participant{room.participants !== 1 ? "s" : ""}
                </p>
              </div>
              {room.type === "study" ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <Mic className="h-5 w-5 text-primary" />
              )}
            </div>
            <Button className="w-full">Join Room</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyRoom;