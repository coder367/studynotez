import { useState } from "react";
import { ArrowLeft, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Chat = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<"public" | { id: string; name: string } | null>("public");

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="p-4">
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
          <ScrollArea className="h-[calc(100vh-150px)]">
            {/* This would be populated with actual users */}
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
        <div className="flex-1 p-4">
          {/* Chat messages would go here */}
          <div className="text-center text-muted-foreground">
            {activeChat
              ? "No messages yet. Start a conversation!"
              : "Select a chat to start messaging"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;