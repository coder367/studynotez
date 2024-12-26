import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useChatMessages = (activeChat: "public" | { id: string; full_name: string } | null, currentUser: string | null) => {
  return useQuery({
    queryKey: ["messages", activeChat],
    queryFn: async () => {
      const query = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: true });

      if (activeChat === "public") {
        query.is("receiver_id", null);
      } else if (activeChat) {
        query.or(
          `and(sender_id.eq.${currentUser},receiver_id.eq.${(activeChat as any).id}),and(sender_id.eq.${(activeChat as any).id},receiver_id.eq.${currentUser})`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser,
  });
};