import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { NotificationType } from "@/types/notifications";

interface NotificationItemProps {
  notification: NotificationType;
  onNotificationClick: (notification: NotificationType) => void;
}

const NotificationItem = ({ notification, onNotificationClick }: NotificationItemProps) => {
  const getNotificationContent = () => {
    const data = notification.data;
    switch (notification.type) {
      case "new_message":
        return `${data.sender_name || 'Someone'} sent you a message`;
      case "new_follower":
        return "Someone started following you";
      case "new_note":
        return `New note: ${data.title || 'Untitled'}`;
      default:
        return "New notification";
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
      onClick={() => onNotificationClick(notification)}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={notification.data.avatar_url} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm">{getNotificationContent()}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;