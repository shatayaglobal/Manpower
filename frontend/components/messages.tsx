"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthState } from "@/lib/redux/redux";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";
import { setCurrentUserId } from "@/lib/redux/messagingSlice";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, ArrowLeft, Inbox } from "lucide-react";
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
    if (selectedUser) setShowMobileChat(true);
  }, [selectedUser]);

  const handleBackToList = () => {
    setShowMobileChat(false);
    selectUser(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm w-full mx-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Access Required
          </h2>
          <p className="text-gray-500 text-sm">
            Please sign in to access your messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    // Lock to viewport — nothing outside should scroll
    <div
      className="bg-gray-50 -ml-4 -mt-5 -mr-4 overflow-hidden"
      style={{ height: "calc(100vh - 0px)" }}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        {/* ── Page header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-4 shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">
              Messages
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Stay connected with employers
            </p>
          </div>
        </div>

        {/* ── Two-panel chat layout — fills remaining height exactly ── */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
          {/* ── Sidebar ── */}
          <div
            className={`w-full md:w-80 border-r border-gray-100 flex flex-col shrink-0 ${
              showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Sidebar header */}
            <div className="px-4 py-3.5 border-b border-gray-100 shrink-0">
              <h2 className="text-sm font-semibold text-gray-900">
                Conversations
              </h2>
            </div>

            {loading.conversations ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Loading...</p>
                </div>
              </div>
            ) : (
              // ConversationList must be overflow-y-auto internally
              <ConversationList />
            )}
          </div>

          {/* ── Main chat area ── */}
          <div
            className={`flex-1 min-w-0 flex flex-col ${
              showMobileChat ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedUser ? (
              <>
                {/* Mobile back */}
                <div className="md:hidden px-4 py-2.5 border-b border-gray-100 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-8 px-2 gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Conversations
                  </Button>
                </div>
                {/* ChatWindow fills remaining space — it handles its own scroll */}
                <ChatWindow />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-xs">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <Inbox
                      className="h-10 w-10 text-blue-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    No conversation selected
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Choose a conversation from the sidebar to start messaging.
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
