import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff } from "lucide-react";

interface Participant {
  id: string;
  profile: {
    full_name: string | null;
    avatar_url?: string | null;
  };
  isAudioEnabled?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId?: string;
}

const ParticipantsList = ({ participants, currentUserId }: ParticipantsListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Participants ({participants.length})
      </h2>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {participant.profile.avatar_url && (
                  <AvatarImage src={participant.profile.avatar_url} />
                )}
                <AvatarFallback>
                  {participant.profile.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span>
                {participant.profile.full_name || "Anonymous"}
                {participant.id === currentUserId && " (You)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {participant.isAudioEnabled !== undefined && (
                participant.isAudioEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;