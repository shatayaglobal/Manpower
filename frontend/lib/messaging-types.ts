import { User } from "./types";

export interface Message {
  id: number;
  sender: number;
  receiver: number;
  message: string;
  message_type:
    | "CHAT"
    | "APPLICATION_ACCEPTED"
    | "APPLICATION_REJECTED"
    | "SYSTEM";
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_info: User;
  receiver_info: User;
  time_ago: string;
  is_sender: boolean;
  job_application?: number;
}

export interface Conversation {
  other_user: User;
  last_message: string;
  last_message_time: string;
  last_message_type: string;
  unread_count: number;
  total_messages: number;
}

export interface MessagingState {
  conversations: Conversation[];
  messages: Message[];
  selectedUser: User | null;
  currentUserId: string | null; 
  isConnected: boolean;
  socket: WebSocket | null;
  unreadCount: number;
  loading: {
    conversations: boolean;
    messages: boolean;
  };
  error: string | null;
}

export interface WebSocketMessage {
  type: "new_message" | "message_sent" | "messages_marked_read" | "error";
  message?: Message;
  other_user_id?: number;
  error?: string;
}

export interface SendMessagePayload {
  receiver_id: number;
  message: string;
  message_type?: string;
}
