import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { useChatMessages } from "./useChatMessages";

interface ChatContainerProps {
  activeChat: "public" | { id: string; full_name: string } | null;
  currentUser: string | null;
}

export const ChatContainer = ({ activeChat, currentUser }: ChatContainerProps) => {
  const { toast } = useToast();
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
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('messages')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload file');
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
        fileType = selectedFile.type;
      }

      // Create the message
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          content: message.trim(),
          sender_id: currentUser,
          receiver_id: activeChat === "public" ? null : (activeChat as any).id,
          file_url: fileUrl,
          file_type: fileType,
        });

      if (messageError) {
        console.error('Message error:', messageError);
        throw messageError;
      }

      // Create notification for private messages
      if (activeChat !== "public") {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: (activeChat as any).id,
            type: "new_message",
            data: {
              sender_id: currentUser,
              message: message.trim()
            }
          });

        if (notificationError) {
          console.error('Notification error:', notificationError);
          // Don't throw here as the message was sent successfully
        }
      }

      setMessage("");
      setSelectedFile(null);
      
      // Refetch messages to show the new one
      refetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
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
      <ChatMessageList messages={messages} currentUser={currentUser} />
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