import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserInfoProps {
  avatarUrl?: string;
  fullName: string;
  createdAt: string;
  userId: string;
}

export const UserInfo = ({ avatarUrl, fullName, createdAt, userId }: UserInfoProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/dashboard/profile/${userId}`);
  };

  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-lg bg-background cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleProfileClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-medium">{fullName || "Anonymous"}</h4>
        <p className="text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};