import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface ChatSidebarProps {
  users: ChatUser[];
  activeChat: "public" | ChatUser | null;
  onChatSelect: (chat: "public" | ChatUser) => void;
}

export const ChatSidebar = ({ users, activeChat, onChatSelect }: ChatSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="w-64 border-r bg-background flex flex-col">
      <div className="p-4 flex-1">
        <Button
          variant="ghost"
          className="w-full justify-start mb-4"
          onClick={() => onChatSelect("public")}
        >
          <Users className="mr-2 h-4 w-4" />
          Public Chat
        </Button>
        <Separator className="my-4" />
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Private Chats
        </div>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onChatSelect(user)}
              >
                <User className="mr-2 h-4 w-4" />
                {user.full_name || "Anonymous"}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate("/dashboard/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          My Profile
        </Button>
      </div>
    </div>
  );
};