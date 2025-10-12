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
      dispatch(
        websocketActions.sendMessage({
          receiverId: selectedUser.id,
          message: newMessage.trim(),
          messageType: "CHAT",
        })
      );
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {selectedUser.first_name?.[0] || selectedUser.email[0].toUpperCase()}
              {selectedUser.last_name?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {selectedUser.name ? selectedUser.name : selectedUser.email}
            </h3>
            <Badge
              variant={selectedUser.account_type === "BUSINESS" ? "default" : "secondary"}
              className="text-xs mt-1"
            >
              {selectedUser.account_type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading.messages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message: Message) => {
              const isOwnMessage = message.sender.toString() === user?.id;
              const isSystemMessage = message.message_type !== "CHAT";

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isSystemMessage && user?.account_type === "WORKER"
                        ? "bg-amber-50 border border-amber-200 text-amber-900"
                        : isOwnMessage
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {user?.account_type === "WORKER" && isSystemMessage && (
                      <div className="text-xs font-medium mb-1">
                        {message.message_type === "APPLICATION_ACCEPTED" && "🎉 Application Accepted"}
                        {message.message_type === "APPLICATION_REJECTED" && "❌ Application Update"}
                        {message.message_type === "SYSTEM" && "🔔 System Message"}
                      </div>
                    )}
                    {(!isSystemMessage || user?.account_type === "WORKER") && (
                      <p className="text-sm break-words">{message.message}</p>
                    )}
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span
                        className={`text-xs ${
                          isOwnMessage && !isSystemMessage ? "text-blue-100" : "text-gray-400"
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

      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm border-gray-300 rounded-md"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
