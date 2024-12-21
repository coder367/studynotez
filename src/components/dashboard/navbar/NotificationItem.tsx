import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NotificationItemProps {
  notification: any;
  onNotificationClick: (notification: any) => Promise<void>;
  onMarkAsRead: (notification: any) => Promise<void>;
}

export const NotificationItem = ({ notification, onNotificationClick, onMarkAsRead }: NotificationItemProps) => {
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
      className="cursor-pointer p-0"
    >
      <div className="flex items-center justify-between w-full p-2">
        <div 
          className="flex flex-col flex-1 mr-2"
          onClick={() => onNotificationClick(notification)}
        >
          <span className="font-medium">{getNotificationText(notification)}</span>
          <span className="text-sm text-muted-foreground">
            {new Date(notification.created_at).toLocaleDateString()}
          </span>
        </div>
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification);
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </DropdownMenuItem>
  );
};