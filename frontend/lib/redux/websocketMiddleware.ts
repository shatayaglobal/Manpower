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

const websocketMiddleware =
  (store: StoreAPI) =>
  (next: (action: unknown) => unknown) =>
  (action: Action) => {
    const { dispatch, getState } = store;

    if (action.type === "websocket/connect") {
      const state = getState() as {
        auth: { accessToken: string };
        messaging: { socket: WebSocket | null; isConnected: boolean };
      };
      const token = state.auth.accessToken;

      if (!token) return next(action);

      const socket = new WebSocket(
        `ws://localhost:8000/ws/chat/?token=${token}`
      );

      socket.onopen = () => {
        dispatch(setConnected(true));
        dispatch(setSocket(socket));

        const state = getState() as {
          auth: { user: { id: string } };
        };

        if (state.auth.user?.id) {
          dispatch(setCurrentUserId(state.auth.user.id));
        }
      };

      socket.onmessage = (event: MessageEvent) => {
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

          default:
            break;
        }
      };
      socket.onclose = () => {
        console.log("WebSocket disconnected");
        dispatch(setConnected(false));
        dispatch(setSocket(null));

        setTimeout(() => {
          dispatch({ type: "websocket/connect" });
        }, 3000);
      };

      socket.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
      };
    }

    if (action.type === "websocket/disconnect") {
      const state = getState() as { messaging: { socket: WebSocket | null } };
      if (state.messaging.socket) {
        state.messaging.socket.close();
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
        state.messaging.socket.send(
          JSON.stringify({
            type: "send_message",
            receiver_id: receiverId,
            message: message,
            message_type: messageType,
          })
        );
      }
    }

    return next(action);
  };

export default websocketMiddleware;
