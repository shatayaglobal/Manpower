"use client";

import { useMessaging } from "@/lib/redux/use-messaging";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { Conversation } from "@/lib/messaging-types";
import { useAuthState } from "@/lib/redux/redux";
import { MessageCircle } from "lucide-react";

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | undefined, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return email[0].toUpperCase();
}

function getLastMessage(conversation: Conversation, isWorker: boolean): string {
  const type = conversation.last_message_type;
  if (isWorker && type === "APPLICATION_ACCEPTED") return "🎉 " + conversation.last_message;
  if (isWorker && type === "APPLICATION_REJECTED") return "❌ " + conversation.last_message;
  if (type === "CHAT" || isWorker) return conversation.last_message;
  return "";
}

export default function ConversationList() {
  const { conversations, selectedUser, selectUser, markAsRead, loadMessages } = useMessaging();
  const { user } = useAuthState();
  const isWorker = user?.account_type === "WORKER";

  const handleSelect = async (otherUser: User) => {
    selectUser(otherUser);
    await loadMessages(otherUser.id);
    await markAsRead(otherUser.id);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">No conversations yet</p>
          <p className="text-xs text-gray-400">Messages will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv: Conversation) => {
        const other = conv.other_user;
        const isSelected = selectedUser?.id === other.id;
        const displayName = other.name?.trim() || other.email;
        const lastMsg = getLastMessage(conv, isWorker);
        const isBusiness = other.account_type === "BUSINESS";

        return (
          <div
            key={other.id}
            onClick={() => handleSelect(other)}
            className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
              isSelected
                ? "bg-blue-50 border-l-2 border-l-blue-500"
                : "hover:bg-gray-50 border-l-2 border-l-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`text-xs font-semibold ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                  {getInitials(other.name, other.email)}
                </AvatarFallback>
              </Avatar>
              {conv.unread_count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {conv.unread_count > 9 ? "9+" : conv.unread_count}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                  {displayName}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(conv.last_message_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-xs truncate flex-1 ${conv.unread_count > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                  {lastMsg || "No messages yet"}
                </p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                  isBusiness ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {isBusiness ? "Business" : "Worker"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
