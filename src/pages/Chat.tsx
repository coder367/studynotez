import { useState, useEffect } from "react";
import { ArrowLeft, Users, User, Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

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

  // Fetch available users for chat
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

  // Subscribe to new messages
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

  // Fetch messages when active chat changes
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
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setActiveChat(user)}
                >
                  <User className="mr-2 h-4 w-4" />
                  {user.full_name || "Anonymous"}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Profile Section at Bottom */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => navigate("/dashboard/profile")}
          >
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
              : (activeChat as ChatUser)?.full_name || "Select a chat"}
          </h2>
        </div>
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === supabase.auth.user()?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.sender_id === supabase.auth.user()?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                  <p>{msg.content}</p>
                  {msg.file_url && (
                    <div className="mt-2">
                      {msg.file_type?.startsWith('image/') ? (
                        <img 
                          src={msg.file_url} 
                          alt="Shared image" 
                          className="max-w-full rounded"
                        />
                      ) : (
                        <a 
                          href={msg.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Download attachment
                        </a>
                      )}
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-1 block">
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <form 
            onSubmit={handleSendMessage}
            className="flex gap-2"
          >
            <Input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isUploading}
            />
            <Button type="submit" size="icon" disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          {selectedFile && (
            <div className="mt-2 text-sm text-muted-foreground">
              Selected file: {selectedFile.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;