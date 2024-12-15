import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
}

interface ChatUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<"public" | ChatUser | null>("public");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .neq("id", user.id);
      
      return data || [];
    }
  });

  useEffect(() => {
    const subscribeToMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: activeChat === "public" 
              ? undefined 
              : `receiver_id=eq.${user.id},sender_id=eq.${(activeChat as ChatUser)?.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToMessages();
  }, [activeChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const query = supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (activeChat !== "public") {
        query
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${(activeChat as ChatUser).id},receiver_id.eq.${(activeChat as ChatUser).id}`);
      }

      const { data } = await query;
      setMessages(data || []);
    };

    fetchMessages();
  }, [activeChat]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isUploading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = null;
      let fileType = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('messages')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileType = selectedFile.type;
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          content: message.trim(),
          sender_id: user.id,
          receiver_id: activeChat === "public" ? null : (activeChat as ChatUser).id,
          file_url: fileUrl,
          file_type: fileType,
        });

      if (error) throw error;

      setMessage("");
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen flex">
      <ChatSidebar 
        users={users || []}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
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
              : (activeChat as ChatUser)?.full_name || "Select a chat"}
          </h2>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                content={msg.content}
                senderId={msg.sender_id}
                currentUserId={currentUser}
                fileUrl={msg.file_url}
                fileType={msg.file_type}
                createdAt={msg.created_at}
              />
            ))}
          </div>
        </ScrollArea>

        <ChatInput
          message={message}
          onMessageChange={setMessage}
          onSend={handleSendMessage}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
};

export default Chat;
