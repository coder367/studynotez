import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationItem } from "./NotificationItem";
import { useIsMobile } from "@/hooks/use-mobile";

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
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
            full_name
          )
        `)
        .eq("user_id", session.user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const handleNotificationClick = async (notification: any) => {
    try {
      setIsProcessing(true);
      switch (notification.type) {
        case 'new_message':
          navigate(`/dashboard/chat?user=${notification.sender?.id}`);
          break;
        case 'new_follower':
          navigate(`/dashboard/profile/${notification.data?.follower_id}`);
          break;
        case 'new_note':
          navigate(`/dashboard/notes?note=${notification.data?.note_id}`);
          break;
        default:
          console.log('Unknown notification type:', notification.type);
      }
      await markAsRead(notification);
    } catch (error: any) {
      console.error("Error handling notification click:", error);
      toast({
        title: "Error",
        description: "Could not process notification",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const markAsRead = async (notification: any) => {
    try {
      setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu>
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
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={markAsRead}
            />
          ))
        ) : (
          <DropdownMenuItem disabled className="text-center p-4">
            No new notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};