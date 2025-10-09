// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// WebSocket Configuration
const getWebSocketURL = () => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  // In production, ensure we use wss:// for secure WebSocket
  if (process.env.NODE_ENV === "production" && wsUrl.startsWith("ws://")) {
    return wsUrl.replace("ws://", "wss://");
  }

  return wsUrl;
};

export const WS_URL = getWebSocketURL();

// Google OAuth
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Environment check
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
