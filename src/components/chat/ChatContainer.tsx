import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChatMessages } from "./useChatMessages";
import { handleSendMessage } from "./ChatHandlers";

interface ChatContainerProps {
  activeChat: "public" | { id: string; full_name: string } | null;
  currentUser: string | null;
}

export const ChatContainer = ({ activeChat, currentUser }: ChatContainerProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], refetch: refetchMessages } = useChatMessages(activeChat, currentUser);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        refetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchMessages]);

  // Focus input when chat changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    await handleSendMessage({
      message,
      selectedFile,
      currentUser,
      activeChat,
      setMessage,
      setSelectedFile,
      refetchMessages,
    });
    setIsUploading(false);
  };

  return (
    <>
      <ChatMessageList messages={messages} currentUser={currentUser} />
      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        onFileSelect={(e) => setSelectedFile(e.target.files?.[0] || null)}
        selectedFile={selectedFile}
        isUploading={isUploading}
        inputRef={inputRef}
      />
    </>
  );
};