import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NotificationHeaderProps {
  notificationCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationHeader = ({ notificationCount, onMarkAllAsRead }: NotificationHeaderProps) => {
  return (
    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <DialogTitle>Notifications ({notificationCount})</DialogTitle>
      {notificationCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onMarkAllAsRead}
          className="text-xs"
        >
          <Check className="h-4 w-4 mr-1" />
          Mark all as read
        </Button>
      )}
    </DialogHeader>
  );
};

export default NotificationHeader;