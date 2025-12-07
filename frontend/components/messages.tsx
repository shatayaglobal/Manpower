"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthState } from "@/lib/redux/redux";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";
import { setCurrentUserId } from "@/lib/redux/messagingSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, ArrowLeft, Inbox } from "lucide-react";
import ConversationList from "@/components/conversation-list";
import ChatWindow from "@/components/chat-window";

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { user } = useAuthState();
  const { selectedUser, loadConversations, loading, selectUser } = useMessaging();
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="p-10 text-center max-w-md w-full bg-white border border-gray-200 shadow-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 text-sm">Please sign in to access your messages</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-8xl mx-auto h-full">
        <Card className="h-full border border-gray-200/80 bg-white/95">
          <div className="h-full flex">
            {/* Sidebar - Conversation List */}
            <div
              className={`w-full md:w-96 bg-white/50 backdrop-blur-sm border-r border-gray-200/80 flex flex-col transition-all duration-300 ${
                showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-200/80 bg-gradient-to-r from-blue-50/50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Messages
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Stay connected</p>
                  </div>
                </div>
              </div>

              {/* Conversations */}
              {loading.conversations ? (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-50/30">
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse mx-auto mb-3"></div>
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 absolute top-3 left-1/2 -ml-3" />
                    </div>
                    <p className="text-sm text-gray-500">Loading conversations...</p>
                  </div>
                </div>
              ) : (
                <ConversationList />
              )}
            </div>

            {/* Main Chat Area */}
            <div
              className={`flex-1 flex flex-col bg-gradient-to-br from-gray-50/30 to-white transition-all duration-300 ${
                showMobileChat ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedUser ? (
                <>
                  {/* Mobile Back Button */}
                  <div className="md:hidden p-3 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToList}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="font-medium">Conversations</span>
                    </Button>
                  </div>
                  <ChatWindow />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <div className="relative inline-block mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center shadow-sm">
                        <Inbox className="h-12 w-12 text-blue-500" strokeWidth={1.5} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <MessageCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Choose a conversation from the sidebar to start messaging and stay connected
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
