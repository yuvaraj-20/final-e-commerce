// src/components/chat/ChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, X, Minimize2, MessageCircle, Smile } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../../../services/api";
import { useStore } from "../../../store/useStore";
import { me } from "../../lib/apiClient";
import { useNavigate } from "react-router-dom";

const POLL_MS = 5000;

const ChatWidget = ({
  conversation = {},
  onClose,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const navigate = useNavigate();
  const { user, addChatMessage } = useStore();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const convoId = conversation?.id;

  // Build "next" param for post-login redirect
  const nextPath =
    (window.location && window.location.pathname + window.location.search) ||
    "/";

  const ensureAuth = async () => {
    try {
      await me(); // 200 if authenticated (Sanctum cookie or Bearer)
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  // Initial & polling load
  useEffect(() => {
    if (!convoId) return;

    let mounted = true;

    const firstLoad = async () => {
      try {
        const chatMessages = await api.getChatMessages(convoId);
        if (mounted) setMessages(Array.isArray(chatMessages) ? chatMessages : []);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Could not load chat messages");
      } finally {
        if (mounted) setIsBootLoading(false);
      }
    };

    firstLoad();

    // Polling
    pollRef.current = setInterval(async () => {
      try {
        const newer = await api.getChatMessages(convoId);
        if (!mounted) return;
        if (Array.isArray(newer)) {
          // Optional: only update if changed
          setMessages((prev) => {
            const prevLast = prev?.[prev.length - 1]?.id;
            const newLast = newer?.[newer.length - 1]?.id;
            return prevLast === newLast ? prev : newer;
          });
        }
      } catch {
        /* silent */
      }
    }, POLL_MS);

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [convoId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = (newMessage || "").trim();
    if (!content) return;
    if (!convoId) {
      toast.error("Conversation not available");
      return;
    }

    const ok = await ensureAuth();
    if (!ok) return;

    setIsLoading(true);
    setNewMessage("");

    // Optimistic message
    const optimistic = {
      id: `local-${Date.now()}`,
      content,
      senderId: user?.id,
      timestamp: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = await api.sendChatMessage(convoId, content, user?.id);
      // Replace optimistic with server message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? sent : m))
      );
      addChatMessage(sent);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Rollback optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error("Failed to send message");
      setNewMessage(content); // restore text for user to retry
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Derive other participant if your shape is ids array
  const otherParticipant =
    Array.isArray(conversation?.participants) && user?.id
      ? conversation.participants.find((p) => p !== user.id)
      : null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={onToggleMinimize}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow relative"
        >
          <MessageCircle className="h-6 w-6" />
          {conversation?.unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium truncate">
              {conversation?.title || "Chat"}
            </h3>
            {conversation?.itemName && (
              <p className="text-xs opacity-90 truncate">
                About: {conversation.itemName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Item Info */}
      {conversation?.itemId && conversation?.itemName ? (
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center space-x-3">
          {conversation?.itemImage ? (
            <img
              src={conversation.itemImage}
              alt={conversation.itemName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {conversation.itemName}
            </p>
            <p className="text-xs text-gray-600">Thrift Item</p>
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isBootLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-start">
                <div className="max-w-xs px-3 py-2 rounded-2xl bg-gray-100">
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </>
        ) : (
          messages.map((message) => {
            const mine = message?.senderId === user?.id;
            return (
              <div
                key={message?.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl ${
                    mine
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm break-words">{message?.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      mine ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message?.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
              disabled={isLoading || !convoId}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              title="Emoji"
              onClick={() => toast("Emoji picker coming soon ✨")}
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading || !convoId}
            className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatWidget;
