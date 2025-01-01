import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleSendMessage = async ({
  message,
  selectedFile,
  currentUser,
  activeChat,
  setMessage,
  setSelectedFile,
  refetchMessages,
}: {
  message: string;
  selectedFile: File | null;
  currentUser: string | null;
  activeChat: "public" | { id: string; full_name: string } | null;
  setMessage: (message: string) => void;
  setSelectedFile: (file: File | null) => void;
  refetchMessages: () => void;
}) => {
  if ((!message.trim() && !selectedFile)) return;

  if (!currentUser) {
    toast({
      title: "Error",
      description: "You must be logged in to send messages",
      variant: "destructive",
    });
    return;
  }

  try {
    let fileUrl = null;
    let fileType = null;

    if (selectedFile) {
      console.log('Starting file upload...');
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('messages')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file');
      }

      console.log('File uploaded successfully:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(fileName);

      fileUrl = publicUrl;
      fileType = selectedFile.type;
      console.log('File URL generated:', fileUrl);
    }

    console.log('Creating message with file:', { fileUrl, fileType });

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
      }
    }

    setMessage("");
    setSelectedFile(null);
    refetchMessages();
  } catch (error: any) {
    console.error('Error sending message:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to send message",
      variant: "destructive",
    });
  }
};