import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../Avatar';

const MessageList = ({ messages, loading, error, onReply }) => {
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return 'Unknown time';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid time';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return 'Invalid time';
    }
  };

  const isOwnMessage = (message) => {
    return message.sender && message.sender.id === user?.id;
  };

  const renderMessageContent = (message) => {
    if (message.is_deleted) {
      return (
        <div className={`italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          [Message deleted]
        </div>
      );
    }

    switch (message.message_type) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
      
      case 'image':
        return (
          <div>
            <img
              src={message.file_url}
              alt={message.file_name || 'Image'}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file_url, '_blank')}
            />
            {message.content && (
              <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {message.content}
              </div>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className={`flex items-center space-x-2 p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="text-blue-500">
              📎
            </div>
            <div className="flex-1">
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {message.file_name}
              </a>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {(message.file_size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div className={`text-center text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {message.content}
          </div>
        );
      
      default:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg mb-2">⚠️</div>
          <div className={isDark ? 'text-red-400' : 'text-red-500'}>Failed to load messages</div>
          <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="text-4xl mb-2">💬</div>
          <div>No messages yet</div>
          <div className="text-sm mt-1">Start the conversation!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const ownMessage = isOwnMessage(message);
        
        return (
          <div
            key={message.id}
            className={`flex ${ownMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-xs lg:max-w-md ${ownMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {!ownMessage && message.sender && (
                <div className="flex-shrink-0 mr-3">
                  <Avatar
                    user={message.sender}
                    size="sm"
                    className="w-8 h-8"
                  />
                </div>
              )}
              
              {/* Message Content */}
              <div className={`flex flex-col ${ownMessage ? 'items-end' : 'items-start'}`}>
                {/* Message Header */}
                {!ownMessage && message.sender && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {message.sender.first_name || message.sender.username} {message.sender.last_name || ''}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                )}
                
                {/* Reply indicator */}
                {message.reply_to && message.reply_to.sender && message.reply_to.sender.username && (
                  <div className={`mb-2 p-2 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                    <div className="font-medium">
                      Replying to {message.reply_to.sender.username}
                    </div>
                    <div className="truncate">{message.reply_to.content || 'Message content unavailable'}</div>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div
                  className={`
                    px-4 py-2 rounded-lg max-w-full
                    ${ownMessage 
                      ? 'bg-blue-600 text-white' 
                      : isDark
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 text-gray-900'
                    }
                    ${message.message_type === 'system' 
                      ? isDark 
                        ? 'bg-yellow-900 text-yellow-200' 
                        : 'bg-yellow-100 text-yellow-800'
                      : ''
                    }
                  `}
                >
                  {renderMessageContent(message)}
                </div>
                
                {/* Message Footer */}
                <div className={`flex items-center space-x-2 mt-1 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
                  {ownMessage && (
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatMessageTime(message.created_at)}
                    </span>
                  )}
                  
                  {message.is_edited && (
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      (edited)
                    </span>
                  )}
                  
                  {ownMessage && (
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {message.is_deleted ? 'deleted' : 'sent'}
                    </span>
                  )}
                  
                  {/* Reply button */}
                  <button
                    onClick={() => onReply && onReply(message)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                    title="Reply to this message"
                  >
                    Reply
                  </button>
                </div>
              </div>
              
              {/* Avatar for own messages */}
              {ownMessage && message.sender && (
                <div className="flex-shrink-0 ml-3">
                  <Avatar
                    user={message.sender}
                    size="sm"
                    className="w-8 h-8"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 