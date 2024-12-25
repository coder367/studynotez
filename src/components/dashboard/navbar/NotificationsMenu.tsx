import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type DatabaseNotification = Database["public"]["Tables"]["notifications"]["Row"];

interface MessageData {
  sender_name: string;
  message: string;
  sender_id: string;
}

interface MessageNotification {
  id: string;
  type: "new_message";
  user_id: string;
  data: MessageData;
  created_at: string;
  read_at: string | null;
}

interface NotificationItemType {
  id: string;
  type: string;
  data: any;
  created_at: string;
  read_at: string | null;
}

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          .is("read", false)
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

      const messageNotifications: MessageNotification[] = messagesData.data.map(message => ({
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

      const formattedNotifications: NotificationItemType[] = notificationsData.data.map(notification => ({
        ...notification,
        read_at: notification.read ? new Date().toISOString() : null
      }));

      return [...formattedNotifications, ...messageNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const handleNotificationClick = async (notification: NotificationItemType) => {
    if (notification.type === "new_message" && 
        typeof notification.data === 'object' && 
        notification.data !== null && 
        'sender_id' in notification.data) {
      navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark all notifications as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .is("read", false);

      // Mark all messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", user.id)
        .is("read_at", null);

      await refetchNotifications();
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
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
                />
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                No notifications
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsMenu;