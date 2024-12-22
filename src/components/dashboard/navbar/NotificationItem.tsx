import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface NotificationItemProps {
  notification: any;
  onNotificationClick: (notification: any) => Promise<void>;
  onMarkAsRead: (notification: any) => Promise<void>;
}

export const NotificationItem = ({ notification, onNotificationClick, onMarkAsRead }: NotificationItemProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        return `New message from ${notification.sender?.full_name || 'Someone'}`;
      case 'new_follower':
        return `${notification.sender?.full_name || 'Someone'} started following you`;
      case 'new_note':
        return `${notification.sender?.full_name || 'Someone'} shared a new note: ${notification.data?.title || ''}`;
      case 'chat_mention':
        return `${notification.sender?.full_name || 'Someone'} mentioned you in chat`;
      default:
        return 'New notification';
    }
  };

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onNotificationClick(notification);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not load notification content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      await onMarkAsRead(notification);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not mark notification as read. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          onClick={handleClick}
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
            onClick={handleMarkAsRead}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </DropdownMenuItem>
  );
};