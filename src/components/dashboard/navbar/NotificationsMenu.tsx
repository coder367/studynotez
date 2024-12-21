import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
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
    refetchInterval: 10000, // Reduced polling interval for better performance
  });

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
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      await markAsRead(notification);

      switch (notification.type) {
        case 'new_message':
          navigate(`/dashboard/chat?user=${notification.data?.sender_id}`);
          break;
        case 'new_follower':
          navigate(`/dashboard/profile/${notification.data?.follower_id}`);
          break;
        case 'new_note':
          navigate(`/dashboard/notes`);
          break;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process notification",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NotificationBadge unreadCount={notifications.length} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {isLoading ? (
          <DropdownMenuItem disabled>Loading notifications...</DropdownMenuItem>
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
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};