import { format, isToday, isYesterday } from "date-fns";

interface ChatMessageProps {
  content: string;
  senderId: string | null;
  senderName?: string;
  currentUserId: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  createdAt: string;
}

export const ChatMessage = ({ 
  content, 
  senderId, 
  senderName, 
  currentUserId, 
  fileUrl, 
  fileType, 
  createdAt 
}: ChatMessageProps) => {
  const isOwnMessage = senderId === currentUserId;
  
  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return `Today at ${format(messageDate, 'HH:mm')}`;
    } else if (isYesterday(messageDate)) {
      return `Yesterday at ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'MMM d, yyyy HH:mm');
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
        <div className="flex flex-col gap-1">
          {!isOwnMessage && senderName && (
            <p className="text-xs font-medium">{senderName}</p>
          )}
          {content && <p>{content}</p>}
          {fileUrl && fileType?.startsWith('image/') && (
            <img 
              src={fileUrl} 
              alt="Shared image" 
              className="max-w-full rounded mt-2"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          )}
          <span className="text-xs opacity-70">
            {formatMessageDate(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};