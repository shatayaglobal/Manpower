"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useMessaging } from "@/lib/redux/use-messaging";
import { useAuthState } from "@/lib/redux/redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Message } from "@/lib/messaging-types";
import { useDispatch } from "react-redux";
import { websocketActions } from "@/lib/redux/websocket-actions";

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(firstName?: string, lastName?: string, email?: string) {
  if (firstName) return (firstName[0] + (lastName?.[0] || "")).toUpperCase();
  return (email?.[0] || "?").toUpperCase();
}

export default function ChatWindow() {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  // Ref to the messages scroll container — only this scrolls, not the page
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { user } = useAuthState();
  const { selectedUser, messages, loading } = useMessaging();

  // Scroll only the messages container to bottom, never the page
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;
    setIsSending(true);
    try {
      dispatch(websocketActions.sendMessage({
        receiverId: selectedUser.id,
        message: newMessage.trim(),
        messageType: "CHAT",
      }));
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedUser) return null;

  const displayName = selectedUser.name?.trim() ||
    `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() ||
    selectedUser.email;

  const isBusiness = selectedUser.account_type === "BUSINESS";

  return (
    // This flex column fills the parent exactly — header + scroll area + input
    <div className="flex flex-col h-full min-h-0">

      {/* ── Chat header — fixed, never scrolls ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-blue-50 text-blue-700 text-xs font-semibold">
            {getInitials(selectedUser.first_name, selectedUser.last_name, selectedUser.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          <span className={`text-xs font-medium ${isBusiness ? "text-blue-600" : "text-gray-400"}`}>
            {isBusiness ? "Business" : "Worker"}
          </span>
        </div>
      </div>

      {/* ── Messages area — ONLY this div scrolls ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-3 bg-gray-50/50"
      >
        {loading.messages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isOwn = msg.sender.toString() === user?.id;
            const isSystem = msg.message_type !== "CHAT";
            const isWorker = user?.account_type === "WORKER";

            if (isSystem && !isWorker) return null;

            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    isSystem
                      ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-xl"
                      : isOwn
                      ? "bg-blue-100 text-blue-900 rounded-2xl"
                      : "bg-white border border-gray-200 text-gray-800 rounded-2xl shadow-sm"
                  }`}
                >
                  {isSystem && (
                    <p className="text-xs font-semibold mb-1">
                      {msg.message_type === "APPLICATION_ACCEPTED" && "🎉 Application Accepted"}
                      {msg.message_type === "APPLICATION_REJECTED" && "❌ Application Update"}
                      {msg.message_type === "SYSTEM" && "🔔 System"}
                    </p>
                  )}
                  <p className="break-words leading-relaxed">{msg.message}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className={`text-xs ${isOwn && !isSystem ? "text-blue-400" : "text-gray-400"}`}>
                      {formatTime(msg.created_at)}
                    </span>
                    {isOwn && !isSystem && (
                      <span className="text-xs text-blue-400">{msg.is_read ? "✓✓" : "✓"}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input — fixed at bottom, never moves ── */}
      <form
        onSubmit={handleSend}
        className="px-5 py-3.5 border-t border-gray-100 bg-white shrink-0 flex gap-2.5 items-center"
      >
        <Input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-10 border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm"
          disabled={isSending}
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 rounded-xl shrink-0"
        >
          {isSending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
