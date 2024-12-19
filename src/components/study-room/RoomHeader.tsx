import { ArrowLeft, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface RoomHeaderProps {
  name: string;
  isPrivate: boolean;
  participantsCount: number;
  isRoomCreator: boolean;
  invitationCode?: string | null;
  onCopyInvitationCode: () => void;
  onDeleteRoom: () => void;
}

const RoomHeader = ({
  name,
  isPrivate,
  participantsCount,
  isRoomCreator,
  invitationCode,
  onCopyInvitationCode,
  onDeleteRoom,
}: RoomHeaderProps) => {
  const navigate = useNavigate();

  return (
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
            <h1 className="text-2xl font-bold">{name}</h1>
            {isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <Badge variant="secondary">
              {participantsCount} participant{participantsCount !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isRoomCreator && isPrivate && invitationCode && (
          <Button variant="outline" onClick={onCopyInvitationCode}>
            Copy Invitation Code
          </Button>
        )}
        {isRoomCreator && (
          <Button variant="destructive" onClick={onDeleteRoom}>
            Delete Room
          </Button>
        )}
      </div>
    </div>
  );
};

export default RoomHeader;