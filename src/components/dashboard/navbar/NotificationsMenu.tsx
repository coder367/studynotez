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
    refetchInterval: 10000,
  });

  const markAsRead = async (notification: any) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      setIsProcessing(true);
      await markAsRead(notification);

      switch (notification.type) {
        case 'new_message':
          if (!notification.data?.sender_id) {
            throw new Error("Message sender not found");
          }
          navigate(`/dashboard/chat?user=${notification.data.sender_id}`);
          break;
        case 'new_follower':
          if (!notification.data?.follower_id) {
            throw new Error("Follower not found");
          }
          navigate(`/dashboard/profile/${notification.data.follower_id}`);
          break;
        case 'new_note':
          if (!notification.data?.note_id) {
            throw new Error("Note not found");
          }
          navigate(`/dashboard/notes`);
          break;
        default:
          throw new Error("Invalid notification type");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not process notification",
        variant: "destructive",
      });
    }
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load notifications",
      variant: "destructive",
    });
  }

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