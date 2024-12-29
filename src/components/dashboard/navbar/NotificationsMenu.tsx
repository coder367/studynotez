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

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications = [], refetch } = useNotifications();
  const { markAllAsRead, handleNotificationClick: handleClick } = useNotificationActions(refetch);

  const handleNotificationClick = async (notification: NotificationType) => {
    await handleClick(notification);
    if (notification.type === "new_message") {
      navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
      setIsOpen(false);
    } else if (notification.type === "new_note") {
      navigate(`/dashboard/notes?note=${notification.data.note_id}`);
      setIsOpen(false);
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
          <NotificationHeader 
            notificationCount={notifications.length}
            onMarkAllAsRead={markAllAsRead}
          />

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