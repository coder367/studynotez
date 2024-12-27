import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive animate-in fade-in" />
      )}
    </Button>
  );
};

export default NotificationBadge;