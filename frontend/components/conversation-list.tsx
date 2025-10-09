"use client";

import { useMessaging } from "@/lib/redux/use-messaging";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";
import { Conversation } from "@/lib/messaging-types";

export default function ConversationList() {
  const { conversations, selectedUser, selectUser, markAsRead, loadMessages } =
    useMessaging();

  const handleSelectConversation = async (otherUser: User) => {
    selectUser(otherUser);
    await loadMessages(otherUser.id);
    await markAsRead(otherUser.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500 text-center text-sm">
          No conversations yet. <br />
          Apply to jobs or post jobs to start messaging!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation: Conversation) => {
        const otherUser = conversation.other_user;
        const isSelected = selectedUser?.id === otherUser.id;

        return (
          <div
            key={otherUser.id}
            onClick={() => handleSelectConversation(otherUser)}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">
                  {otherUser.name?.[0]?.toUpperCase() ||
                    otherUser.email[0].toUpperCase()}
                  {otherUser.name?.split(" ")[1]?.[0]?.toUpperCase() || ""}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {otherUser.name && otherUser.name.trim()
                      ? otherUser.name
                      : otherUser.email}
                  </h4>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(conversation.last_message_time)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {conversation.last_message_type ===
                      "APPLICATION_ACCEPTED" && "🎉 "}
                    {conversation.last_message_type ===
                      "APPLICATION_REJECTED" && "❌ "}
                    {conversation.last_message}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conversation.unread_count > 0 && (
                      <Badge
                        variant="destructive"
                        className="text-xs h-5 min-w-[1.25rem] px-1"
                      >
                        {conversation.unread_count}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        otherUser.account_type === "BUSINESS"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {otherUser.account_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
