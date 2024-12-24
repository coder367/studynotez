import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationItem from "./NotificationItem";
import NotificationBadge from "./NotificationBadge";
import { useNavigate } from "react-router-dom";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [notificationsData, messagesData] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
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
          .eq("read", false)
          .order("created_at", { ascending: false })
      ]);

      if (notificationsData.error) throw notificationsData.error;
      if (messagesData.error) throw messagesData.error;

      // Convert messages to notifications format
      const messageNotifications = messagesData.data.map(message => ({
        id: `message-${message.id}`,
        type: "new_message",
        user_id: message.receiver_id,
        data: {
          sender_name: message.sender?.full_name || "Anonymous",
          message: message.content,
          sender_id: message.sender_id
        },
        created_at: message.created_at,
        read: message.read
      }));

      return [...notificationsData.data, ...messageNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: any) => {
    console.log("Notification clicked:", notification);
    
    if (notification.type === "new_message") {
      // If it's a message notification, navigate to chat
      navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
      setIsOpen(false);
    }
  };

  const handleMarkAsRead = async (notification: any) => {
    try {
      if (notification.id.startsWith('message-')) {
        // Handle message notifications
        const messageId = notification.id.replace('message-', '');
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("id", messageId);
      } else {
        // Handle regular notifications
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notification.id);
      }
      
      // Invalidate the notifications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    
    if (open && unreadCount > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Mark all notifications as read
        await Promise.all([
          supabase
            .from("notifications")
            .update({ read: true })
            .eq("read", false)
            .eq("user_id", user.id),
          supabase
            .from("messages")
            .update({ read: true })
            .eq("read", false)
            .eq("receiver_id", user.id)
        ]);
        
        // Invalidate the notifications query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    }
  };

  return (
    <div className="relative">
      {unreadCount > 0 ? (
        <NotificationBadge unreadCount={unreadCount} onClick={() => handleDialogOpen(true)} />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDialogOpen(true)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Your recent notifications</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                No notifications yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsMenu;