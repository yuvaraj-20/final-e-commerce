// src/pages/Chat.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Send, Paperclip, X, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const bubbleVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.995 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16 } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.12 } },
};

export default function ChatPage() {
  const { sellerId } = useParams(); // sellerId or conversationId
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const meId = user?.id ?? "guest-user";

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const prefillItem = qs.get("item") || "";

  // Helper: stable check before navigate
  const safeNavigateToConv = (convId) => {
    const targetPath = `/chat/${convId}`;
    // only navigate if pathname differs exactly to avoid triggering loops
    if (window.location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  };

  // Create a blob URL for a File only once and revoke previous one
  useEffect(() => {
    if (!attachment) {
      if (attachmentUrl) {
        URL.revokeObjectURL(attachmentUrl);
        setAttachmentUrl(null);
      }
      return;
    }

    if (attachment instanceof File) {
      const url = URL.createObjectURL(attachment);
      setAttachmentUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setAttachmentUrl(null);
      };
    } else {
      // it's already a URL string
      setAttachmentUrl(attachment);
      return () => setAttachmentUrl(null);
    }
  }, [attachment]); // runs only when attachment changes

  // 1) Load or create conversation (canonicalize when sellerId provided)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!sellerId) {
          // if no param, try to load user's convs and pick first
          const convs = await api.getChatConversations(meId).catch(() => []);
          if (!mounted) return;
          const first = convs?.[0] ?? null;
          setConversation(first || null);
          setLoading(false);
          return;
        }

        // If sellerId present, try to get canonical conversation once
        // If sellerId already looks like a canonical conv id (starts with "conv-"), treat it as conv id
        const isConvId = String(sellerId).startsWith("conv-");
        if (isConvId) {
          // If param is a conversation id, load it via getConversationById if available
          if (api.getConversationById) {
            try {
              const conv = await api.getConversationById(sellerId);
              if (mounted) setConversation(conv || { id: sellerId, title: "Conversation", participants: [meId] });
            } catch {
              if (mounted) setConversation({ id: sellerId, title: "Conversation", participants: [meId] });
            } finally {
              if (mounted) setLoading(false);
            }
            return;
          }
        }

        // Otherwise sellerId is likely a seller identifier: try createOrGetConversationWithSeller
        if (api.createOrGetConversationWithSeller) {
          try {
            const conv = await api.createOrGetConversationWithSeller(sellerId, prefillItem || null, meId);
            if (!mounted) return;
            if (conv) {
              setConversation({ ...conv, unreadCount: conv.unreadCount ?? 0 });
              safeNavigateToConv(conv.id);
              setLoading(false);
              return;
            }
          } catch (err) {
            // fallthrough to synth
            console.warn("canonicalization failed:", err);
          }
        }

        // fallback: synthesize conversation so user can type immediately
        const synthId = sellerId.startsWith("conv-") ? sellerId : `conv-seller-${sellerId}`;
        const synth = {
          id: synthId,
          title: "Chat with seller",
          participants: [meId, sellerId],
          avatar: null,
          messages: [],
          unreadCount: 0,
          isSeller: true,
          contextItem: prefillItem || null,
        };
        if (mounted) {
          setConversation(synth);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) toast.error("Failed to initialize conversation");
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // NOTE: intentionally not adding `conversation` to deps to avoid loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, meId, prefillItem]);

  // 2) Load messages when conversation changes
  useEffect(() => {
    let mounted = true;
    if (!conversation?.id) {
      setMessages([]);
      return;
    }

    (async () => {
      setLoadingMsgs(true);
      try {
        // If we have a synthetic conv id like "conv-seller-<id>", try canonical upgrade once
        if (String(conversation.id).startsWith("conv-seller-") && api.createOrGetConversationWithSeller) {
          const sid = String(conversation.id).replace("conv-seller-", "");
          try {
            const conv = await api.createOrGetConversationWithSeller(sid, conversation.contextItem || null, meId);
            if (conv && mounted) {
              setConversation({ ...conv, unreadCount: conv.unreadCount ?? 0 });
              // navigate to canonical path only if different
              safeNavigateToConv(conv.id);
              // If canonical id differs, allow next effect run to fetch messages for canonical id
              if (conv.id !== conversation.id) {
                setLoadingMsgs(false);
                return;
              }
            }
          } catch {
            /* proceed to load messages for synthetic conv */
          }
        }

        // normal message load
        const msgs = await api.getChatMessages(conversation.id).catch(() => []);
        if (mounted) setMessages(msgs || []);
        // locally clear unread count for active conv
      } catch (err) {
        console.error(err);
        if (mounted) toast.error("Failed to load messages");
      } finally {
        if (mounted) {
          setLoadingMsgs(false);
          setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 60);
        }
      }
    })();

    if (conversation?.contextItem) {
      setText(`Hi — I'm interested in item ${decodeURIComponent(String(conversation.contextItem))}. Is it available?`);
      setTimeout(() => inputRef.current?.focus(), 120);
    }

    return () => { mounted = false; };
  }, [conversation, meId]);

  // small typing demo (not critical)
  useEffect(() => {
    if (!conversation?.id) return;
    const id = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 800 + Math.random() * 900);
    }, 7000);
    return () => clearInterval(id);
  }, [conversation]);

  // Send message (optimistic)
  const handleSend = async () => {
    if ((!text || !text.trim()) && !attachment) return;
    if (!user) {
      toast.error("Please sign in to send messages");
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // canonicalize if needed before send
    let targetConv = conversation;
    if (targetConv?.id && String(targetConv.id).startsWith("conv-seller-") && api.createOrGetConversationWithSeller) {
      const sid = String(targetConv.id).replace("conv-seller-", "");
      try {
        const conv = await api.createOrGetConversationWithSeller(sid, targetConv.contextItem || null, meId);
        if (conv) {
          targetConv = conv;
          setConversation({ ...conv, unreadCount: conv.unreadCount ?? 0 });
          safeNavigateToConv(conv.id);
        }
      } catch {
        // continue with synthetic conv
      }
    }

    const att = attachmentUrl || null;
    const payload = {
      conversationId: targetConv?.id || `conv-temp-${Date.now()}`,
      senderId: meId,
      content: text.trim(),
      attachment: att,
    };

    const optimistic = { ...payload, id: `optimistic-${Date.now()}`, timestamp: new Date().toISOString(), isOptimistic: true };
    setMessages((m) => [...m, optimistic]);
    setText("");
    setAttachment(null);

    setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight + 200, behavior: "smooth" }), 80);

    try {
      const sent = await api.sendChatMessage(payload);
      setMessages((m) => m.map((msg) => (msg.id === optimistic.id ? sent : msg)));
      setConversation((c) => c ? { ...c, lastMessage: sent.content } : c);
    } catch (err) {
      console.error(err);
      setMessages((m) => m.map((msg) => (msg.id === optimistic.id ? { ...msg, failed: true } : msg)));
      toast.error("Failed to send message");
    } finally {
      setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight + 200, behavior: "smooth" }), 220);
    }
  };

  const handleRetry = async (msg) => {
    if (!msg.failed) return;
    try {
      const sent = await api.sendChatMessage({ conversationId: msg.conversationId, senderId: meId, content: msg.content });
      setMessages((m) => m.map((x) => (x.id === msg.id ? sent : x)));
      toast.success("Message resent");
    } catch {
      toast.error("Resend failed");
    }
  };

  // handle local file selection
  const onFileChange = (file) => {
    if (!file) return;
    setAttachment(file);
  };

  // UI guards
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-items-center">
        <div className="animate-pulse text-gray-500">Loading chat…</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
          <p className="text-sm text-gray-600 mb-6">Start a chat from a listing or create a new conversation.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate("/thrift")} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Browse Thrift</button>
            <button onClick={() => {
              const id = `conv-new-${Date.now()}`;
              const newConv = { id, title: "New conversation", participants: [meId], messages: [] };
              setConversation(newConv);
              navigate(`/chat/${id}`, { replace: true });
              setTimeout(() => inputRef.current?.focus(), 120);
            }} className="px-4 py-2 rounded-lg border">New chat</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f3f5]">
      {/* header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-gray-100"><X className="w-5 h-5 text-gray-700" /></button>

          <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img src={conversation.avatar || "/avatar-placeholder.png"} alt="avatar" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{conversation.title || "Chat"}</div>
            <div className="text-xs text-gray-500">{conversation.isSeller ? "Seller" : "Conversation"}</div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-gray-100" title="More">
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="max-w-3xl mx-auto h-[calc(100vh-144px)] overflow-auto py-6 px-4" ref={messagesRef}>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {loadingMsgs && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-sm text-gray-400">Loading messages…</motion.div>}
            {messages.map(m => {
              const mine = String(m.senderId) === String(meId);
              return (
                <motion.div key={m.id} variants={bubbleVariants} initial="hidden" animate="show" exit="exit" className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] ${mine ? "text-right" : "text-left"}`}>
                    <div className={`${mine ? "bg-[#dcf8c6] text-gray-900" : "bg-white text-gray-900 border"} inline-block px-4 py-2 rounded-3xl shadow-sm`}>
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                      {m.attachment && (
                        <div className="mt-2">
                          <img src={m.attachment} alt="attachment" className="rounded-lg max-h-56 object-cover border" />
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {m.isOptimistic && <span className="ml-2 italic">sending…</span>}
                      {m.failed && <button onClick={() => handleRetry(m)} className="ml-2 text-red-500 text-xs">Retry</button>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* composer */}
      <div className="sticky bottom-0 z-30 bg-transparent px-4 pb-6 pt-3">
        <div className="max-w-3xl mx-auto bg-white rounded-full shadow-lg px-3 py-2 flex items-center gap-2">
          <label className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
            <Paperclip className="w-5 h-5 text-gray-600" />
            <input type="file" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0])} />
          </label>

          <div className="flex-1">
            {attachmentUrl && (
              <div className="mb-2 flex items-center gap-2">
                <img src={attachmentUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{attachment?.name || "Attachment"}</div>
                  <div className="text-xs text-gray-500">Preview</div>
                </div>
                <button onClick={() => setAttachment(null)} className="text-xs text-red-500">Remove</button>
              </div>
            )}

            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message"
              className="w-full resize-none outline-none text-sm bg-transparent"
            />
          </div>

          <button onClick={handleSend} disabled={!text.trim() && !attachment} className={`p-3 rounded-full ${text.trim() || attachment ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
