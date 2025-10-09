import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { messagingApi } from "./messaging-api";
import { MessagingState, Message } from "@/lib/messaging-types";
import { User } from "@/lib/types";

export const fetchConversations = createAsyncThunk(
  "messaging/fetchConversations",
  async () => {
    return await messagingApi.getConversations();
  }
);

export const fetchMessages = createAsyncThunk(
  "messaging/fetchMessages",
  async (otherUserId: string) => {
    return await messagingApi.getMessages(otherUserId);
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "messaging/markAsRead",
  async (otherUserId: string) => {
    return await messagingApi.markAsRead(otherUserId);
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "messaging/fetchUnreadCount",
  async () => {
    return await messagingApi.getUnreadCount();
  }
);

const initialState: MessagingState = {
  conversations: [],
  messages: [],
  selectedUser: null,
  isConnected: false,
  socket: null,
  unreadCount: 0,
  currentUserId: null,
  loading: {
    conversations: false,
    messages: false,
  },
  error: null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<WebSocket | null>) => {
      state.socket = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setCurrentUserId: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const messageExists = state.messages.some(
        (msg) => msg.id === action.payload.id
      );

      if (!messageExists) {
        // Add to messages if it's for current conversation
        if (state.selectedUser) {
          const isRelevantToConversation =
            action.payload.sender.toString() === state.selectedUser.id ||
            action.payload.receiver.toString() === state.selectedUser.id;

          if (isRelevantToConversation) {
            state.messages.push(action.payload);
          }
        }
      }

      // Determine the other user in this conversation
      const otherUserId =
        action.payload.sender.toString() === state.currentUserId
          ? action.payload.receiver.toString()
          : action.payload.sender.toString();

      // Find the conversation index
      const convIndex = state.conversations.findIndex(
        (conv) => conv.other_user.id === otherUserId
      );

      if (convIndex !== -1) {
        const conversation = state.conversations[convIndex];
        conversation.last_message = action.payload.message;
        conversation.last_message_time = action.payload.created_at;
        conversation.last_message_type = action.payload.message_type;

        const isSentByOther =
          action.payload.sender.toString() !== state.currentUserId;
        const isDifferentConversation =
          !state.selectedUser || state.selectedUser.id !== otherUserId;

        if (isSentByOther && isDifferentConversation) {
          conversation.unread_count = (conversation.unread_count || 0) + 1;
        }

        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conversation);
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    markConversationRead: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (conv) => conv.other_user.id === action.payload
      );
      if (conversation) {
        conversation.unread_count = 0;
      }

      if (state.selectedUser?.id === action.payload) {
        state.messages.forEach((message) => {
          if (message.sender.toString() === action.payload) {
            message.is_read = true;
          }
        });
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error = action.error.message || "Failed to fetch conversations";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error = action.error.message || "Failed to fetch messages";
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unread_count;
      })
      .addCase(markMessagesAsRead.fulfilled, (state) => {
        if (state.selectedUser) {
          state.messages.forEach((message) => {
            if (message.sender.toString() === state.selectedUser!.id) {
              message.is_read = true;
            }
          });
        }
      });
  },
});

export const {
  setSocket,
  setConnected,
  setSelectedUser,
  setCurrentUserId,
  addMessage,
  updateUnreadCount,
  markConversationRead,
  clearMessages,
  setError,
} = messagingSlice.actions;

export default messagingSlice.reducer;
