import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
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
    refetchInterval: 30000,
  });

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Invalidate the notifications query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
      // Mark the notification as read
      await markAsRead(notification.id);

      // Navigate based on notification type
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

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        return `New message from ${notification.sender?.full_name || 'Someone'}`;
      case 'new_follower':
        return `${notification.sender?.full_name || 'Someone'} started following you`;
      case 'new_note':
        return `${notification.sender?.full_name || 'Someone'} uploaded a new note: ${notification.data?.title || ''}`;
      default:
        return 'New notification';
    }
  };

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{getNotificationText(notification)}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};