import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface ChatMessageListProps {
  messages: any[];
  currentUser: string | null;
}

export const ChatMessageList = ({ messages, currentUser }: ChatMessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      // Set scroll to bottom immediately and after a short delay to handle dynamic content
      scrollArea.scrollTop = scrollArea.scrollHeight;
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
    }
  }, [messages]);

  return (
    <ScrollArea 
      className="flex-1 p-4" 
      ref={scrollAreaRef}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="space-y-4 min-h-full">
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
  );
};