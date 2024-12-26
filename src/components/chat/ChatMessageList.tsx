import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface ChatMessageListProps {
  messages: any[];
  currentUser: string | null;
}

export const ChatMessageList = ({ messages, currentUser }: ChatMessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current;
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    };

    // Scroll immediately and after a short delay to handle dynamic content
    scrollToBottom();
    const scrollTimeout = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  return (
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
  );
};