import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { StudyRoomType } from "@/types/study-room";

interface RoomCardProps {
  id: string;
  name: string;
  type: StudyRoomType;
  participants: number;
  isPublic?: boolean;
  invitationCode?: string | null;
}

const RoomCard = ({ 
  id, 
  name, 
  type, 
  participants, 
  isPublic = false,
  invitationCode 
}: RoomCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [code, setCode] = useState("");

  const handleJoinRoom = () => {
    if (!isPublic && invitationCode) {
      setShowCodeDialog(true);
    } else {
      navigate(`/dashboard/study-room/${id}`);
    }
  };

  const handleSubmitCode = () => {
    if (code === invitationCode) {
      setShowCodeDialog(false);
      navigate(`/dashboard/study-room/${id}`);
    } else {
      toast({
        title: "Error",
        description: "Invalid invitation code",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {participants} participant{participants !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {type === "study" ? "Study Room" : "Focus Room"}
              </span>
              {!isPublic && (
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}
            </div>
          </div>
          {type === "study" ? (
            <Video className="h-5 w-5 text-primary" />
          ) : (
            <Mic className="h-5 w-5 text-primary" />
          )}
        </div>
        <Button 
          className="w-full"
          onClick={handleJoinRoom}
        >
          Join Room
        </Button>
      </Card>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Invitation Code</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSubmitCode}>Join Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomCard;