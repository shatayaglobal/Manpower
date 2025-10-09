"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthState } from "@/lib/redux/redux";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";
import { setCurrentUserId } from "@/lib/redux/messagingSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import ConversationList from "@/components/conversation-list";
import ChatWindow from "@/components/chat-window";

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { user } = useAuthState();
  const { selectedUser, loadConversations, loading, selectUser } =
    useMessaging();
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(setCurrentUserId(user.id));
      loadConversations();
      dispatch(websocketActions.connect());

      return () => {
        dispatch(websocketActions.disconnect());
      };
    }
  }, [user?.id, dispatch, user, loadConversations]);

  useEffect(() => {
    if (selectedUser) {
      setShowMobileChat(true);
    }
  }, [selectedUser]);

  const handleBackToList = () => {
    setShowMobileChat(false);
    selectUser(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <p className="text-gray-500">Please sign in to access messages</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-7xl mx-auto h-full">
        <div className="h-full flex border-x border-gray-200">
          {/* Sidebar - Conversation List */}
          <div
            className={`
              w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col
              ${showMobileChat ? "hidden md:flex" : "flex"}
            `}
          >
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Messages
                </h1>
              </div>
            </div>
            {loading.conversations ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <ConversationList />
            )}
          </div>

          {/* Main Chat Area */}
          <div
            className={`
              flex-1 flex flex-col bg-white
              ${showMobileChat ? "flex" : "hidden md:flex"}
            `}
          >
            {selectedUser ? (
              <>
                {/* Mobile back button */}
                <div className="md:hidden p-4 border-b border-gray-200 bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to conversations
                  </Button>
                </div>
                <ChatWindow />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-sm">
                  <MessageCircle className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Choose a conversation from the sidebar to start messaging or
                    view your notifications
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
