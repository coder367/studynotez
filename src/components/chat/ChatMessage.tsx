import { format } from "date-fns";

interface ChatMessageProps {
  content: string;
  senderId: string | null;
  currentUserId: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  createdAt: string;
}

export const ChatMessage = ({ content, senderId, currentUserId, fileUrl, fileType, createdAt }: ChatMessageProps) => {
  const isOwnMessage = senderId === currentUserId;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
        <div className="flex flex-row items-center gap-2">
          <p>{content}</p>
          <span className="text-xs opacity-70">
            {format(new Date(createdAt), 'HH:mm')}
          </span>
        </div>
        {fileUrl && (
          <div className="mt-2">
            {fileType?.startsWith('image/') ? (
              <img 
                src={fileUrl} 
                alt="Shared image" 
                className="max-w-full rounded"
              />
            ) : (
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Download attachment
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};