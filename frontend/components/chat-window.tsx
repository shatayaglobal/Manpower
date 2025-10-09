"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useMessaging } from "@/lib/redux/use-messaging";
import { useAuthState } from "@/lib/redux/redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Message } from "@/lib/messaging-types";
import { useDispatch } from "react-redux";
import { websocketActions } from "@/lib/redux/websocket-actions";

export default function ChatWindow() {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const { user } = useAuthState();
  const { selectedUser, messages, loading } = useMessaging();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    setIsSending(true);
    try {
      // Send via WebSocket instead of REST API
      dispatch(
        websocketActions.sendMessage({
          receiverId: selectedUser.id,
          message: newMessage.trim(),
          messageType: "CHAT",
        })
      );

      setNewMessage("");

      // Messages will be added to state automatically via WebSocket response
      // No need to manually reload
    } catch  {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {selectedUser.first_name?.[0] ||
                selectedUser.email[0].toUpperCase()}
              {selectedUser.last_name?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {selectedUser.name ? `${selectedUser.name}` : selectedUser.email}
            </h3>
            <Badge
              variant={
                selectedUser.account_type === "BUSINESS"
                  ? "default"
                  : "secondary"
              }
              className="text-xs"
            >
              {selectedUser.account_type}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading.messages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message: Message) => {
              const isOwnMessage = message.sender.toString() === user?.id;
              const isSystemMessage = message.message_type !== "CHAT";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isSystemMessage
                        ? "bg-yellow-50 border border-yellow-200 text-yellow-900"
                        : isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    {isSystemMessage && (
                      <div className="text-xs font-medium mb-1">
                        {message.message_type === "APPLICATION_ACCEPTED" &&
                          "🎉 Application Accepted"}
                        {message.message_type === "APPLICATION_REJECTED" &&
                          "❌ Application Update"}
                        {message.message_type === "SYSTEM" &&
                          "🔔 System Message"}
                      </div>
                    )}
                    <p className="text-sm break-words">{message.message}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span
                        className={`text-xs ${
                          isOwnMessage && !isSystemMessage
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </span>
                      {isOwnMessage && !isSystemMessage && (
                        <span className="text-xs text-blue-100">
                          {message.is_read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="default"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
