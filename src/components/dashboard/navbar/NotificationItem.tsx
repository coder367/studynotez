import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    data: any;
    created_at: string;
    read: boolean;
  };
  onNotificationClick: (notification: any) => void;
  onMarkAsRead: (notification: any) => void;
}

const NotificationItem = ({
  notification,
  onNotificationClick,
  onMarkAsRead,
}: NotificationItemProps) => {
  const getNotificationContent = () => {
    switch (notification.type) {
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
      <div className="flex items-start justify-between gap-2">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onNotificationClick(notification)}
        >
          <p className="text-sm font-medium">{getNotificationContent()}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMarkAsRead(notification)}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;