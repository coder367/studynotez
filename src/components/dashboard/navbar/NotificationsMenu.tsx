import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationItem from "./NotificationItem";
import NotificationBadge from "./NotificationBadge";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: any) => {
    // Handle notification click
    console.log("Notification clicked:", notification);
  };

  const handleMarkAsRead = async (notification: any) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notification.id);

    if (error) throw error;
    
    // Invalidate the notifications query to refresh the data
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    
    if (open) {
      // Mark all notifications as read when opening the dialog
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      // Invalidate the notifications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  return (
    <div className="relative">
      {unreadCount > 0 ? (
        <NotificationBadge unreadCount={unreadCount} onClick={() => handleDialogOpen(true)} />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDialogOpen(true)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                No notifications yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsMenu;