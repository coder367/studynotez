import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBadgeProps {
  unreadCount: number;
}

export const NotificationBadge = ({ unreadCount }: NotificationBadgeProps) => {
  return (
    <Button variant="ghost" size="icon" className="relative">
      <BellRing className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Button>
  );
};