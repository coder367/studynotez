import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationItem } from "./NotificationItem";
import { useIsMobile } from "@/hooks/use-mobile";

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const isMobile = useIsMobile();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:profiles!notifications_user_id_fkey (
            full_name,
            id
          )
        `)
        .eq("user_id", session.user.id)
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const handleNotificationClick = async (notification: any) => {
    try {
      switch (notification.type) {
        case 'new_message':
          navigate(`/dashboard/chat/${notification.sender?.id}`);
          break;
        case 'new_follower':
          navigate(`/dashboard/profile/${notification.data?.follower_id}`);
          break;
        case 'new_note':
          navigate(`/dashboard/notes/${notification.data?.note_id}`);
          break;
        default:
          console.log('Unknown notification type:', notification.type);
      }
      await markAsRead(notification);
      setIsOpen(false);
      setShowAllNotifications(false);
    } catch (error: any) {
      console.error("Error handling notification click:", error);
      toast({
        title: "Error",
        description: "Could not process notification",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notification: any) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Could not mark notification as read",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <NotificationBadge unreadCount={notifications.length} />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={`w-[300px] md:w-[400px] max-h-[80vh] overflow-y-auto ${isMobile ? 'mx-4' : ''}`}
        >
          {isLoading ? (
            <DropdownMenuItem disabled className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading notifications...
            </DropdownMenuItem>
          ) : error ? (
            <DropdownMenuItem disabled className="text-center p-4 text-destructive">
              Error loading notifications
            </DropdownMenuItem>
          ) : notifications.length > 0 ? (
            <>
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={markAsRead}
                />
              ))}
              {notifications.length > 5 && (
                <DropdownMenuItem
                  className="text-center text-primary cursor-pointer"
                  onClick={() => setShowAllNotifications(true)}
                >
                  View all notifications
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <DropdownMenuItem disabled className="text-center p-4">
              No new notifications
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
        <DialogContent className="max-w-[90vw] w-[800px] max-h-[80vh]">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};