interface Participant {
  id: string;
  profile: {
    full_name: string | null;
    avatar_url?: string | null;
  };
}

interface ParticipantsListProps {
  participants: Participant[];
}

const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
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
  );
};

export default ParticipantsList;