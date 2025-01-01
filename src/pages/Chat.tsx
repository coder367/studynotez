import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useIsMobile } from "@/hooks/use-mobile";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<"public" | { id: string; full_name: string } | null>("public");
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();

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
      const fetchUser = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", userId)
          .single();
        
        if (data) {
          setActiveChat(data);
          if (isMobile) {
            setShowSidebar(false);
          }
        }
      };
      fetchUser();
    }
  }, [searchParams, isMobile]);

  const handleChatSelect = (chat: typeof activeChat) => {
    setActiveChat(chat);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="h-screen flex">
      {(showSidebar || !isMobile) && (
        <div className={`${isMobile ? 'absolute inset-0 z-50 bg-background' : ''}`}>
          <ChatSidebar 
            users={[]}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            currentUserId={currentUser}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center">
          {isMobile && !showSidebar ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="font-semibold">
            {activeChat === "public"
              ? "Public Chat"
              : (activeChat as any)?.full_name || "Select a chat"}
          </h2>
        </div>
        
        <ChatContainer activeChat={activeChat} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Chat;