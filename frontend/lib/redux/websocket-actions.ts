export const websocketActions = {
  connect: () => ({ type: 'websocket/connect' as const }),
  disconnect: () => ({ type: 'websocket/disconnect' as const }),
  sendMessage: (payload: {
    receiverId: string;
    message: string;
    messageType?: string;
  }) => ({
    type: 'websocket/sendMessage' as const,
    payload,
  }),
  markRead: (otherUserId: string) => ({
    type: 'websocket/markRead' as const,
    payload: { otherUserId },
  }),
};
