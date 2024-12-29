import { Json } from "@/integrations/supabase/types";

export interface BaseNotification {
  id: string;
  type: string;
  data: NotificationData;
  created_at: string;
}

export type NotificationData = {
  sender_name?: string;
  sender_id?: string;
  avatar_url?: string;
  note_id?: string;
  title?: string;
  message?: string;
  follower_id?: string;
};

export interface MessageNotification extends BaseNotification {
  user_id: string;
  read_at: string | null;
}

export interface DatabaseNotification extends BaseNotification {
  user_id: string | null;
  read: boolean | null;
}

export type NotificationType = MessageNotification | DatabaseNotification;

export const isMessageNotification = (
  notification: NotificationType
): notification is MessageNotification => {
  return 'read_at' in notification;
};

export const isReadNotification = (notification: NotificationType): boolean => {
  if (isMessageNotification(notification)) {
    return notification.read_at !== null;
  }
  return notification.read === true;
};