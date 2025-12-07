"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/redux/axios";
import { useAuthState } from "@/lib/redux/redux";

interface WebSocketMessage {
  type: string;
  invitation_count?: number;
}

declare global {
  interface Window {
    chatWebSocket?: WebSocket;
  }

  interface WindowEventMap {
    "invitation-changed": CustomEvent;
  }
}

export function InvitationBadge() {
  const [count, setCount] = useState(0);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();

  const fetchInvitations = useCallback(async () => {
    if (!isAuthenticated || user?.account_type !== "WORKER") return;

    try {
      const response = await axiosInstance.get<unknown[]>(
        "/workforce/invitations/"
      );
      setCount(response.data.length);
    } catch {}
  }, [isAuthenticated, user?.account_type]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    if (!isAuthenticated || user?.account_type !== "WORKER") return;

    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;

        if (data.type === "counts" && data.invitation_count !== undefined) {
          setCount(data.invitation_count);
        }

        if (data.type === "invitation_update") {
          fetchInvitations();
        }
      } catch {}
    };

    const ws = window.chatWebSocket;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.addEventListener("message", handleWebSocketMessage);
      return () => ws.removeEventListener("message", handleWebSocketMessage);
    }
  }, [isAuthenticated, user?.account_type, fetchInvitations]);

  useEffect(() => {
    const handleInvitationChange = () => {
      fetchInvitations();
    };

    window.addEventListener("invitation-changed", handleInvitationChange);
    return () =>
      window.removeEventListener("invitation-changed", handleInvitationChange);
  }, [fetchInvitations]);

  if (!isAuthenticated || user?.account_type !== "WORKER" || count === 0) {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/invitations")}
      className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1 relative"
    >
      <Bell className="h-4 w-4" />
      <span className="hidden xl:inline">Invitations</span>
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px]">
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}
