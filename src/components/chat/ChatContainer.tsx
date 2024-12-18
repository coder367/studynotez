import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ChatContainerProps {
  activeChat: "public" | { id: string; full_name: string } | null;
  currentUser: string | null;
}

export const ChatContainer = ({ activeChat, currentUser }: ChatContainerProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages", activeChat],
    queryFn: async () => {
      const query = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            full_name
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

      const { data } = await query;
      return data || [];
    },
    enabled: !!currentUser,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
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

    if (!currentUser) {
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
          sender_id: currentUser,
          receiver_id: activeChat === "public" ? null : (activeChat as any).id,
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
    <>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              content={msg.content}
              senderId={msg.sender_id}
              senderName={msg.sender?.full_name}
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
        inputRef={inputRef}
      />
    </>
  );
};
