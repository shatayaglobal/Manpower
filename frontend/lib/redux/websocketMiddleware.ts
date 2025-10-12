import {
  setSocket,
  setConnected,
  addMessage,
  updateUnreadCount,
  setCurrentUserId,
} from "./messagingSlice";

interface StoreAPI {
  getState: () => unknown;
  dispatch: (action: unknown) => unknown;
}

interface Action {
  type: string;
  payload?: unknown;
}

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimeout: NodeJS.Timeout | null = null;
let isIntentionalDisconnect = false;

const websocketMiddleware =
  (store: StoreAPI) =>
  (next: (action: unknown) => unknown) =>
  (action: Action) => {
    const { dispatch, getState } = store;

    // Connect WebSocket
    if (action.type === "websocket/connect") {
      const state = getState() as {
        auth: { accessToken: string; isAuthenticated: boolean };
        messaging: { socket: WebSocket | null; isConnected: boolean };
      };
      const token = state.auth.accessToken;
      const isAuthenticated = state.auth.isAuthenticated;


      if (!token || !isAuthenticated) {
        console.log("WebSocket: No token or not authenticated");
        return next(action);
      }

      if (state.messaging.socket?.readyState === WebSocket.OPEN) {
        console.log("WebSocket: Already connected");
        return next(action);
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      console.log("WebSocket: Connecting...");
      isIntentionalDisconnect = false;

      const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
      const socket = new WebSocket(`${WS_URL}/ws/chat/?token=${token}`);

      socket.onopen = () => {
        console.log("WebSocket: Connected successfully");
        dispatch(setConnected(true));
        dispatch(setSocket(socket));
        reconnectAttempts = 0;

        const state = getState() as {
          auth: { user: { id: string } };
        };

        if (state.auth.user?.id) {
          dispatch(setCurrentUserId(state.auth.user.id));
        }
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "new_message":
              dispatch(addMessage(data.message));
              if (data.unread_count !== undefined) {
                dispatch(updateUnreadCount(data.unread_count));
              }
              break;

            case "message_sent":
              dispatch(addMessage(data.message));
              break;

            case "messages_marked_read":
              if (data.unread_count !== undefined) {
                dispatch(updateUnreadCount(data.unread_count));
              }
              break;

            case "unread_count_update":
              dispatch(updateUnreadCount(data.count));
              break;

            case "error":
              console.error("WebSocket error message:", data.message);
              break;

            default:
              console.log("WebSocket: Unknown message type:", data.type);
              break;
          }
        } catch (error) {
          console.error("WebSocket: Error parsing message:", error);
        }
      };

      socket.onclose = (event: CloseEvent) => {
        console.log("WebSocket: Disconnected", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        dispatch(setConnected(false));
        dispatch(setSocket(null));


        if (
          isIntentionalDisconnect ||
          event.code === 4001 ||
          event.code === 1000 ||
          reconnectAttempts >= MAX_RECONNECT_ATTEMPTS
        ) {
          if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log("WebSocket: Max reconnect attempts reached");
          }
          reconnectAttempts = 0;
          return;
        }
        const currentState = getState() as {
          auth: { isAuthenticated: boolean };
        };

        if (!currentState.auth.isAuthenticated) {
          console.log("WebSocket: Not authenticated, skipping reconnect");
          return;
        }

        reconnectAttempts++;
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

        console.log(
          `WebSocket: Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
        );

        reconnectTimeout = setTimeout(() => {
          dispatch({ type: "websocket/connect" });
        }, backoffDelay);
      };

      socket.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
      };
    }
    if (action.type === "websocket/disconnect") {
      console.log("WebSocket: Intentional disconnect");
      isIntentionalDisconnect = true;
      reconnectAttempts = 0;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      const state = getState() as {
        messaging: { socket: WebSocket | null; isConnected: boolean }
      };

      if (state.messaging.socket) {
        state.messaging.socket.close(1000, "Client disconnect");
        dispatch(setConnected(false));
        dispatch(setSocket(null));
      }
    }

    if (action.type === "websocket/sendMessage") {
      const state = getState() as {
        messaging: { socket: WebSocket | null; isConnected: boolean };
      };
      const payload = action.payload as {
        receiverId: string;
        message: string;
        messageType?: string;
      };
      const { receiverId, message, messageType = "CHAT" } = payload;

      if (state.messaging.socket && state.messaging.isConnected) {
        try {
          state.messaging.socket.send(
            JSON.stringify({
              type: "send_message",
              receiver_id: receiverId,
              message: message,
              message_type: messageType,
            })
          );
        } catch (error) {
          console.error("WebSocket: Error sending message:", error);
        }
      } else {
        console.warn("WebSocket: Cannot send message - not connected");
      }
    }

    if (action.type === "auth/logout/fulfilled") {
      console.log("WebSocket: Logging out, disconnecting...");
      dispatch({ type: "websocket/disconnect" });
    }

    if (action.type === "auth/refreshToken/fulfilled") {
      console.log("WebSocket: Token refreshed, reconnecting...");
      const state = getState() as {
        messaging: { socket: WebSocket | null };
      };

      if (state.messaging.socket) {
        isIntentionalDisconnect = true;
        state.messaging.socket.close(1000, "Token refresh");

        setTimeout(() => {
          isIntentionalDisconnect = false;
          dispatch({ type: "websocket/connect" });
        }, 500);
      }
    }

    return next(action);
  };

export default websocketMiddleware;
