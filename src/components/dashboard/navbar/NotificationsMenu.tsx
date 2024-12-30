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
import { NotificationType, isReadNotification, isMessageNotification } from "@/types/notifications";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast: internalToast } = useToast();
  const { data: notifications = [], refetch, isLoading } = useNotifications();
  const { markAllAsRead, handleNotificationClick: handleClick } = useNotificationActions(refetch);

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      await handleClick(notification);
      
      if (isMessageNotification(notification)) {
        navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
        setIsOpen(false);
      } else if (notification.type === "new_note") {
        navigate(`/dashboard/notes?note=${notification.data.note_id}`);
        setIsOpen(false);
      }
      
      await refetch();
    } catch (error) {
      console.error("Error handling notification click:", error);
      internalToast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await refetch();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const unreadCount = notifications.filter(n => !isReadNotification(n)).length;

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