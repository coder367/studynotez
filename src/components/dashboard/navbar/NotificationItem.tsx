import { formatDistanceToNow } from "date-fns";
import { NotificationType } from "@/types/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationType;
  onNotificationClick: (notification: NotificationType) => void;
  isExiting?: boolean;
}

const NotificationItem = ({
  notification,
  onNotificationClick,
  isExiting = false
}: NotificationItemProps) => {
  const getNotificationContent = () => {
    switch (notification.type) {
      case "new_message":
        return `New message from ${notification.data.sender_name}`;
      case "new_follower":
        return "Someone started following you";
      case "new_note":
        return `New note: ${notification.data.title}`;
      default:
        return "New notification";
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col gap-2 p-4 rounded-lg border border-border bg-card notification-item",
        isExiting && "notification-item-exit"
      )}
    >
      <div 
        className="cursor-pointer"
        onClick={() => onNotificationClick(notification)}
      >
        <p className="text-sm font-medium">{getNotificationContent()}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;