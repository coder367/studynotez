import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/notifications";

export const useNotificationActions = (refetch: () => Promise<any>) => {
  const { toast } = useToast();

  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark database notifications as read
      const { error: notificationError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (notificationError) {
        console.error("Error marking notifications as read:", notificationError);
        throw notificationError;
      }

      // Mark messages as read
      const { error: messageError } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", user.id)
        .is("read_at", null);

      if (messageError) {
        console.error("Error marking messages as read:", messageError);
        throw messageError;
      }

      // Force refetch to update the UI immediately
      await refetch();
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      console.log("Handling notification click:", notification);
      if (notification.type === "new_message") {
        if (notification.id.startsWith('message-')) {
          const messageId = notification.id.replace('message-', '');
          const { error } = await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", messageId);
            
          if (error) {
            console.error("Error marking message as read:", error);
            throw error;
          }
        }
      } else {
        // Mark regular notification as read
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notification.id);
          
        if (error) {
          console.error("Error marking notification as read:", error);
          throw error;
        }
      }
      
      // Force refetch to update the UI immediately
      await refetch();
    } catch (error: any) {
      console.error("Error handling notification click:", error);
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive",
      });
    }
  };

  return {
    markAllAsRead,
    handleNotificationClick,
  };
};