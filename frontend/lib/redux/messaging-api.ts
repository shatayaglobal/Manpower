import axiosInstance from './axios';
import { Message, Conversation } from '@/lib/messaging-types';

export const messagingApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await axiosInstance.get<Conversation[]>('/messaging/conversations/');
    return response.data;
  },

  getMessages: async (otherUserId: string): Promise<Message[]> => {
    const response = await axiosInstance.get<{ results: Message[] }>(`/messaging/messages/?other_user=${otherUserId}`);
    return response.data.results;
  },

  sendMessage: async (data: {
    receiver: string;
    message: string;
    message_type?: string;
  }): Promise<Message> => {
    const response = await axiosInstance.post<Message>('/messaging/messages/', data);
    return response.data;
  },

  markAsRead: async (otherUserId: string): Promise<{ message: string; marked_count: number }> => {
    const response = await axiosInstance.post('/messaging/messages/mark-read/', {
      other_user_id: otherUserId,
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number; unread_by_type: Record<string, number> }> => {
    const response = await axiosInstance.get('/messaging/messages/unread-count/');
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string; marked_count: number }> => {
    const response = await axiosInstance.post('/messaging/messages/mark-all-read/');
    return response.data;
  },
};
