import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const MessageInput = ({ 
  roomId, 
  onSendMessage, 
  onTyping,
  disabled = false, 
  replyingTo = null, 
  onCancelReply 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { isDark } = useTheme();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (onTyping) {
      if (message.trim() && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (isTyping && onTyping) {
        onTyping(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) {
      return;
    }

    const messageData = {
      content: message.trim(),
      message_type: 'text',
      chat_room: roomId
    };

    onSendMessage(messageData);
    setMessage('');
    
    // Stop typing indicator
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div 
      className="border-t p-4 flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-primary)'
      }}
    >
      {/* Reply indicator */}
      {replyingTo && (
        <div 
          className="mb-3 p-3 rounded-lg border-l-4 border-blue-500"
          style={{
            backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                Replying to {replyingTo.sender?.username || 'Unknown'}
              </div>
              <div 
                className="text-sm truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {replyingTo.content || 'Message content unavailable'}
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 ml-2 rounded transition-colors hover:bg-opacity-20 hover:bg-gray-500"
              style={{ color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            style={{
              backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-card)',
              borderColor: isDark ? 'var(--border-secondary)' : 'var(--border-primary)',
              color: 'var(--text-primary)',
              opacity: disabled ? 0.5 : 1
            }}
            rows={1}
            maxLength={2000}
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0"
          style={{
            backgroundColor: !message.trim() || disabled
              ? isDark ? 'var(--bg-tertiary)' : '#e5e7eb'
              : '#2563eb',
            color: !message.trim() || disabled
              ? 'var(--text-secondary)'
              : 'white',
            cursor: !message.trim() || disabled ? 'not-allowed' : 'pointer'
          }}
        >
          <span className="flex items-center">
            {disabled ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="hidden sm:inline">Send</span>
            )}
            <span className="sm:hidden">📤</span>
          </span>
        </button>
      </form>

      {/* Character count */}
      {message.length > 0 && (
        <div 
          className="mt-2 text-xs text-right"
          style={{ 
            color: message.length > 1800 
              ? 'var(--color-warning)' 
              : 'var(--text-tertiary)' 
          }}
        >
          {message.length}/2000
        </div>
      )}
    </div>
  );
};

export default MessageInput; 