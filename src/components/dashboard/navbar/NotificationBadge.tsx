import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBadgeProps {
  unreadCount: number;
}

export const NotificationBadge = ({ unreadCount }: NotificationBadgeProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative hover:bg-accent/10 transition-colors"
    >
      <BellRing className="h-5 w-5 text-foreground" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-in fade-in">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
};