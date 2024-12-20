import { useNavigate } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NotificationItemProps {
  notification: any;
  onNotificationClick: (notification: any) => Promise<void>;
}

export const NotificationItem = ({ notification, onNotificationClick }: NotificationItemProps) => {
  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        return `New message from ${notification.sender?.full_name || 'Someone'}`;
      case 'new_follower':
        return `${notification.sender?.full_name || 'Someone'} started following you`;
      case 'new_note':
        return `${notification.sender?.full_name || 'Someone'} uploaded a new note: ${notification.data?.title || ''}`;
      default:
        return 'New notification';
    }
  };

  return (
    <DropdownMenuItem
      key={notification.id}
      className="cursor-pointer"
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex flex-col">
        <span className="font-medium">{getNotificationText(notification)}</span>
        <span className="text-sm text-muted-foreground">
          {new Date(notification.created_at).toLocaleDateString()}
        </span>
      </div>
    </DropdownMenuItem>
  );
};