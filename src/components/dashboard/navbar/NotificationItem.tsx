import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    data: any;
    created_at: string;
    read_at: string | null;
  };
  onNotificationClick: (notification: any) => void;
}

const NotificationItem = ({
  notification,
  onNotificationClick,
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
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card">
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