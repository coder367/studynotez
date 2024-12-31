import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { PremiumFeatureGuard } from "@/components/premium/PremiumFeatureGuard";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<"public" | { id: string; full_name: string } | null>("public");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Handle direct chat navigation from URL params
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      // Fetch user profile
      const fetchUser = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", userId)
          .single();
        
        if (data) {
          setActiveChat(data);
        }
      };
      fetchUser();
    }
  }, [searchParams]);

  return (
    <PremiumFeatureGuard>
      <div className="h-screen flex">
        <ChatSidebar 
          users={[]}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          currentUserId={currentUser}
        />

        <div className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold">
              {activeChat === "public"
                ? "Public Chat"
                : (activeChat as any)?.full_name || "Select a chat"}
            </h2>
          </div>
          
          <ChatContainer activeChat={activeChat} currentUser={currentUser} />
        </div>
      </div>
    </PremiumFeatureGuard>
  );
};

export default Chat;