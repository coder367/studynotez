import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/notifications";
import { toast } from "sonner";

export const useNotifications = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:profiles!notifications_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return notifications as NotificationType[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as NotificationType;
          
          // Show toast notification based on type
          const title = newNotification.type === "new_message" 
            ? "New Message" 
            : newNotification.type === "new_follower"
            ? "New Follower"
            : "New Notification";
            
          const description = newNotification.type === "new_message"
            ? newNotification.data?.message || "You have a new message"
            : newNotification.type === "new_follower"
            ? "Someone started following you"
            : newNotification.data?.message || "You have a new notification";

          toast(title, {
            description: description,
            position: "bottom-right",
            duration: 4000,
          });
          
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};