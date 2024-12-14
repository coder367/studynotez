import { useState } from "react";
import { ArrowLeft, Users, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Chat = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<"public" | { id: string; name: string } | null>("public");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Here you would implement the message sending logic
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start mb-4"
            onClick={() => setActiveChat("public")}
          >
            <Users className="mr-2 h-4 w-4" />
            Public Chat
          </Button>
          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Private Chats
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setActiveChat({ id: "1", name: "John Doe" })}
              >
                <User className="mr-2 h-4 w-4" />
                John Doe
              </Button>
              {/* Add more users here */}
            </div>
          </ScrollArea>
        </div>
        
        {/* Profile Section at Bottom */}
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard/profile")}>
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Button>
        </div>
      </div>

      {/* Chat Area */}
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
              : activeChat?.name || "Select a chat"}
          </h2>
        </div>
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="text-center text-muted-foreground">
            {activeChat
              ? "No messages yet. Start a conversation!"
              : "Select a chat to start messaging"}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;