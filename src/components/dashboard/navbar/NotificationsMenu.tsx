import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationBadge from "./NotificationBadge";
import NotificationItem from "./NotificationItem";
import NotificationHeader from "./NotificationHeader";
import { useNotifications } from "./hooks/useNotifications";
import { useNotificationActions } from "./hooks/useNotificationActions";
import { NotificationType } from "@/types/notifications";
import { useToast } from "@/hooks/use-toast";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: notifications = [], refetch, isLoading } = useNotifications();
  const { markAllAsRead, handleNotificationClick: handleClick } = useNotificationActions(refetch);

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      await handleClick(notification);
      
      if (notification.type === "new_message") {
        navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
        setIsOpen(false);
      } else if (notification.type === "new_note") {
        navigate(`/dashboard/notes?note=${notification.data.note_id}`);
        setIsOpen(false);
      }
      
      // Force refetch after handling the click
      await refetch();
    } catch (error) {
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
      await markAllAsRead();
      // After marking all as read, force a refetch to update the UI
      await refetch();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read && !n.read_at).length;

  return (
    <div className="relative">
      <NotificationBadge 
        unreadCount={unreadCount} 
        onClick={() => setIsOpen(true)} 
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <NotificationHeader 
            notificationCount={notifications.length}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
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