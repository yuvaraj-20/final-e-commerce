import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, MessageCircle, Image, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';

const ChatWidget = ({ conversation, onClose, isMinimized = false, onToggleMinimize }) => {
  const { user, addChatMessage } = useStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const chatMessages = await api.getChatMessages(conversation.id);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      const message = await api.sendChatMessage(conversation.id, messageContent, user.id);
      setMessages(prev => [...prev, message]);
      addChatMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const otherParticipant = conversation.participants.find(p => p !== user?.id);

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
          {conversation.unreadCount > 0 && (
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
          <div>
            <h3 className="font-medium">Chat</h3>
            {conversation.itemName && (
              <p className="text-xs opacity-90">About: {conversation.itemName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Item Info */}
      {conversation.itemId && conversation.itemName && (
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center space-x-3">
          {conversation.itemImage && (
            <img
              src={conversation.itemImage}
              alt={conversation.itemName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {conversation.itemName}
            </p>
            <p className="text-xs text-gray-600">Thrift Item</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-2xl ${
                message.senderId === user?.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === user?.id ? 'text-white/70' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
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
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
