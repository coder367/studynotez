import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface ChatMessageListProps {
  messages: any[];
  currentUser: string | null;
}

export const ChatMessageList = ({ messages, currentUser }: ChatMessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea 
      className="flex-1 p-4" 
      ref={scrollAreaRef}
    >
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            <ChatMessage
              content={msg.content}
              senderId={msg.sender_id}
              senderName={msg.sender?.full_name}
              currentUserId={currentUser}
              fileUrl={msg.file_url}
              fileType={msg.file_type}
              createdAt={msg.created_at}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};