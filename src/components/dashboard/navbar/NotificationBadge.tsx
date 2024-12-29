import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBadgeProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationBadge = ({ unreadCount, onClick }: NotificationBadgeProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative hover:bg-accent/10 transition-colors"
      onClick={onClick}
    >
      <Bell className="h-5 w-5 text-foreground" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
          <span className="text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </Button>
  );
};

export default NotificationBadge;