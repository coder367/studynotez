import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/notifications";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("Fetching notifications...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [notificationsData, messagesData] = await Promise.all([
        supabase
          .from("notifications")
          .select(`
            *,
            sender:profiles!notifications_user_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq("user_id", user.id)
          .eq("read", false) // Only fetch unread notifications
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq("receiver_id", user.id)
          .is("read_at", null) // Only fetch unread messages
          .order("created_at", { ascending: false })
      ]);

      console.log("Notifications data:", notificationsData);
      console.log("Messages data:", messagesData);

      if (notificationsData.error) {
        console.error("Error fetching notifications:", notificationsData.error);
        throw notificationsData.error;
      }
      if (messagesData.error) {
        console.error("Error fetching messages:", messagesData.error);
        throw messagesData.error;
      }

      const messageNotifications = messagesData.data.map(message => ({
        id: `message-${message.id}`,
        type: "new_message" as const,
        user_id: message.receiver_id!,
        data: {
          sender_name: message.sender?.full_name || "Anonymous",
          sender_id: message.sender_id!,
          avatar_url: message.sender?.avatar_url,
          message: message.content
        },
        created_at: message.created_at,
        read_at: message.read_at,
        sender: message.sender
      }));

      const dbNotifications = notificationsData.data.map(notification => ({
        ...notification,
        data: notification.data as NotificationType['data'],
        sender: notification.sender || undefined
      }));

      return [...dbNotifications, ...messageNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};