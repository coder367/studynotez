import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings2, Check } from "lucide-react";
import NotificationBadge from "./NotificationBadge";
import { NotificationType } from "@/types/notifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./NotificationItem";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [notificationsData, messagesData] = await Promise.all([
        supabase
          .from("notifications")
          .select("*, sender:profiles!sender_id(*)")
          .eq("user_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq("receiver_id", user.id)
          .is("read_at", null)
          .order("created_at", { ascending: false })
      ]);

      if (notificationsData.error) throw notificationsData.error;
      if (messagesData.error) throw messagesData.error;

      const messageNotifications = messagesData.data.map(message => ({
        id: `message-${message.id}`,
        type: "new_message",
        user_id: message.receiver_id!,
        data: {
          sender_name: message.sender?.full_name || "Anonymous",
          sender_id: message.sender_id!,
          avatar_url: message.sender?.avatar_url,
          message: message.content
        },
        created_at: message.created_at,
        read_at: message.read_at
      }));

      return [...notificationsData.data, ...messageNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    refetchInterval: 10000,
  });

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", user.id)
        .is("read_at", null);

      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setIsOpen(false);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      if (notification.type === "new_message") {
        if (notification.id.startsWith('message-')) {
          const messageId = notification.id.replace('message-', '');
          await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", messageId);
        }
        
        navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
        setIsOpen(false);
      } else if (notification.type === "new_note") {
        navigate(`/dashboard/notes?note=${notification.data.note_id}`);
        setIsOpen(false);
      }
      
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error: any) {
      console.error("Error handling notification click:", error);
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <NotificationBadge 
        unreadCount={notifications.length} 
        onClick={() => setIsOpen(true)} 
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle>Notifications</DialogTitle>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No new notifications
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsMenu;