import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/notifications";
import { toast } from "sonner";

export const useNotificationActions = (refetch: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);

      if (error) throw error;
      
      await refetch();
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleNotificationClick,
    markAllAsRead,
    isLoading,
  };
};