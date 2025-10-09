import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { AppDispatch } from "./store";
import {
  fetchConversations,
  fetchUnreadCount,
  fetchMessages,
  markMessagesAsRead,
  setSelectedUser,
  setError,
  clearMessages,
} from "./messagingSlice";
import { User } from "@/lib/types";
import { MessagingState } from "@/lib/messaging-types";

interface RootState {
  messaging: MessagingState;
}

export const useMessaging = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    conversations,
    messages,
    selectedUser,
    unreadCount,
    isConnected,
    loading,
    error
  } = useSelector((state: RootState) => state.messaging);

  const loadConversations = useCallback(() => {
    return dispatch(fetchConversations());
  }, [dispatch]);

  const getUnreadCount = useCallback(() => {
    return dispatch(fetchUnreadCount());
  }, [dispatch]);

  const loadMessages = useCallback((otherUserId: string) => {
    return dispatch(fetchMessages(otherUserId));
  }, [dispatch]);

  const markAsRead = useCallback((otherUserId: string) => {
    return dispatch(markMessagesAsRead(otherUserId));
  }, [dispatch]);

  const selectUser = useCallback((user: User | null) => {
    dispatch(setSelectedUser(user));
  }, [dispatch]);

  const clearMessagingError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  const clearMessageHistory = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    conversations,
    messages,
    selectedUser,
    unreadCount,
    isConnected,
    loading,
    error,
    loadConversations,
    getUnreadCount,
    loadMessages,
    markAsRead,
    selectUser,
    clearMessagingError,
    clearMessageHistory,
  };
};
