import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface ChatSidebarProps {
  users: ChatUser[];
  activeChat: "public" | ChatUser | null;
  onChatSelect: (chat: "public" | ChatUser) => void;
  currentUserId: string | null;
}

export const ChatSidebar = ({ activeChat, onChatSelect, currentUserId }: ChatSidebarProps) => {
  const navigate = useNavigate();

  const { data: connectedUsers = [] } = useQuery({
    queryKey: ["connected-users", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      // Get users from private messages
      const { data: messageUsers } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .not("receiver_id", "is", null);

      if (!messageUsers) return [];

      // Get unique user IDs from messages
      const userIds = new Set<string>();
      messageUsers.forEach(msg => {
        if (msg.sender_id !== currentUserId) userIds.add(msg.sender_id);
        if (msg.receiver_id !== currentUserId) userIds.add(msg.receiver_id);
      });

      // Get user profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(userIds));

      return profiles || [];
    },
    enabled: !!currentUserId,
  });
  
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
        
        {connectedUsers.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Private Chats
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2">
                {connectedUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onChatSelect(user)}
                  >
                    <div className="w-4 h-4 rounded-full bg-primary/10 mr-2 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                      ) : (
                        <span className="text-xs">{user.full_name?.[0]}</span>
                      )}
                    </div>
                    {user.full_name || "Anonymous"}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate("/dashboard/profile")}
        >
          <div className="w-4 h-4 rounded-full bg-primary/10 mr-2 flex items-center justify-center">
            <span className="text-xs">M</span>
          </div>
          My Profile
        </Button>
      </div>
    </div>
  );
};