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
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import NotificationItem from "./NotificationItem";
import NotificationBadge from "./NotificationBadge";
import { NotificationType, isMessageNotification } from "@/types/notifications";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exitingNotifications, setExitingNotifications] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [notificationsData, messagesData] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey (
              full_name
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
          message: message.content,
          sender_id: message.sender_id!
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

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      if (notification.type === "new_message" && 
          typeof notification.data === 'object' && 
          notification.data !== null && 
          'sender_id' in notification.data) {
        
        if (isMessageNotification(notification) && notification.id.startsWith('message-')) {
          const messageId = notification.id.replace('message-', '');
          await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", messageId);
        }
        
        navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
        setIsOpen(false);
        await refetchNotifications();
      }
    } catch (error: any) {
      console.error("Error handling notification click:", error);
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setExitingNotifications(notifications.map(n => n.id));
      
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

      await refetchNotifications();
      setExitingNotifications([]);
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

  return (
    <div className="relative">
      <NotificationBadge 
        unreadCount={notifications.length} 
        onClick={() => setIsOpen(true)} 
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-8">
              <DialogTitle>Notifications</DialogTitle>
              {notifications.length > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                  Mark all as read
                </Button>
              )}
            </div>
            <DialogDescription>Your recent notifications</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  isExiting={exitingNotifications.includes(notification.id)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                No new notifications
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsMenu;