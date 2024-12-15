import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  id: string;
  name: string;
  type: "study" | "focus";
  participants: number;
  isPublic?: boolean;
}

const RoomCard = ({ id, name, type, participants, isPublic = false }: RoomCardProps) => {
  const navigate = useNavigate();

  return (
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
            {isPublic && (
              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                Public
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
        onClick={() => navigate(`/dashboard/study-room/${id}`)}
      >
        Join Room
      </Button>
    </Card>
  );
};

export default RoomCard;