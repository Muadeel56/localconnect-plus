import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { chatService, messageService, wsManager } from '../services/chatService';
import ChatRoomList from '../components/chat/ChatRoomList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import CreateChatRoom from '../components/chat/CreateChatRoom';
import ParticipantManager from '../components/chat/ParticipantManager';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Chat = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showParticipantManager, setShowParticipantManager] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('member');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize WebSocket connection for notifications
  useEffect(() => {
    if (user) {
      const notificationSocket = wsManager.connectToNotifications();
      
      notificationSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_notification') {
          showToastMessage(`New message in ${data.notification.chat_room.name}`);
        }
      };

      return () => {
        wsManager.disconnectFromNotifications();
      };
    }
  }, [user]);

  // WebSocket message handling
  const setupWebSocketForRoom = useCallback((roomId) => {
    if (!roomId || !user) return;

    // Disconnect from previous room if exists
    if (socket) {
      wsManager.disconnectFromRoom(selectedRoom?.id);
      setSocket(null);
    }

    try {
      const newSocket = wsManager.connectToRoom(roomId);
      
      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'chat_message':
            // Add new message to the list
            setMessages(prev => [...prev, {
              id: data.message.id,
              content: data.message.content,
              message_type: data.message.message_type,
              sender: data.message.sender,
              created_at: data.message.created_at,
              reply_to: data.message.reply_to,
              is_edited: false,
              is_deleted: false
            }]);
            break;
            
          case 'typing':  // Fixed: should be 'typing'
            if (data.user !== user.username) {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.is_typing) {
                  newSet.add(data.user);
                } else {
                  newSet.delete(data.user);
                }
                return newSet;
              });
            }
            break;
            
          case 'connection_established':
            console.log(`Connected to chat room ${roomId}`);
            break;
            
          case 'error':
            console.error('WebSocket error:', data.message);
            showToastMessage('Connection error occurred');
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        showToastMessage('Failed to connect to chat. Using fallback mode.');
        // Don't set error state, just log it
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setTypingUsers(new Set());
      };

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      showToastMessage('Chat connection failed. Some features may not work.');
    }
  }, [socket, selectedRoom, user]);

  // Handle room selection
  const handleRoomSelect = useCallback(async (room) => {
    if (room.type === 'create') {
      setShowCreateRoom(true);
      return;
    }

    if (!room || !room.id) {
      console.error('Invalid room object:', room);
      return;
    }

    setSelectedRoom(room);
    setMessages([]);
    setError(null);
    setTypingUsers(new Set());
    // Close mobile menu when room is selected
    setIsMobileMenuOpen(false);

    try {
      setLoading(true);
      
      // Load messages for the selected room
      const messagesData = await messageService.getMessagesByRoom(room.id);
      setMessages(messagesData.results || messagesData);

      // Get user's role in this room
      const participants = await chatService.getParticipants(room.id);
      const userParticipant = participants.find(p => p.user.id === user.id);
      setCurrentUserRole(userParticipant?.role || 'member');

      // Mark messages as read
      await chatService.markAsRead(room.id);
      
      // Setup WebSocket connection for this room
      setupWebSocketForRoom(room.id);
      
    } catch (err) {
      console.error('Error loading room:', err);
      setError('Failed to load chat room');
      showToastMessage('Failed to load chat room');
    } finally {
      setLoading(false);
    }
  }, [setupWebSocketForRoom, user]);

  // Handle sending message via WebSocket
  const handleSendMessage = useCallback((messageData) => {
    if (!selectedRoom || !selectedRoom.id) {
      console.error('No room selected');
      showToastMessage('Cannot send message - no room selected');
      return;
    }

    try {
      if (replyingTo) {
        // For replies, we'll still use HTTP API for now
        messageService.replyToMessage(replyingTo.id, messageData.content)
          .then(newMessage => {
            // Message will be received via WebSocket
            setReplyingTo(null);
          })
          .catch(err => {
            console.error('Error sending reply:', err);
            showToastMessage('Failed to send reply');
          });
      } else {
        // Try WebSocket first, fallback to HTTP API
        if (socket && socket.readyState === WebSocket.OPEN) {
          wsManager.sendMessage(selectedRoom.id, messageData.content, messageData.message_type);
        } else {
          // Fallback to HTTP API
          messageService.createMessage(messageData)
            .then(newMessage => {
              setMessages(prev => [...prev, newMessage]);
            })
            .catch(err => {
              console.error('Error sending message:', err);
              showToastMessage('Failed to send message');
            });
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showToastMessage('Failed to send message');
    }
  }, [selectedRoom, socket, replyingTo]);

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle room creation
  const handleRoomCreated = (newRoom) => {
    showToastMessage('Chat room created successfully!');
    // Optionally select the new room
    if (newRoom && newRoom.id) {
      handleRoomSelect(newRoom);
    }
  };

  // Handle reply to message
  const handleReply = (message) => {
    setReplyingTo(message);
    showToastMessage(`Replying to ${message.sender.username}`);
  };

  // Handle typing indicators
  const handleTyping = useCallback((isTyping) => {
    if (selectedRoom && socket && socket.readyState === WebSocket.OPEN) {
      wsManager.sendTyping(selectedRoom.id, isTyping);
    }
  }, [selectedRoom, socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket && selectedRoom) {
        wsManager.disconnectFromRoom(selectedRoom.id);
      }
    };
  }, [socket, selectedRoom]);

  return (
    <div 
      className="flex h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar - Chat Room List */}
      <div 
        className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative z-40 w-80 lg:w-80 border-r flex flex-col
          transition-transform duration-300 ease-in-out h-full
        `}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            LocalConnect+ Chat
          </h2>
        </div>
        
        <ChatRoomList
          onRoomSelect={handleRoomSelect}
          selectedRoomId={selectedRoom?.id}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div 
              className="border-b p-4 flex-shrink-0"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h2 
                    className="text-lg font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedRoom.name}
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {selectedRoom.participant_count} participant{selectedRoom.participant_count !== 1 ? 's' : ''}
                    {typingUsers.size > 0 && (
                      <span className="ml-2 text-blue-600">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Participant management button */}
                  <button
                    onClick={() => setShowParticipantManager(true)}
                    className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Manage participants"
                  >
                    👥
                  </button>
                  
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      selectedRoom.room_type === 'community' 
                        ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                        : selectedRoom.room_type === 'private' 
                          ? isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                          : isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedRoom.room_type_display}
                  </span>
                  
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Close chat"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loading />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  loading={loading}
                  error={error}
                  onReply={handleReply}
                />
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              roomId={selectedRoom.id}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              disabled={loading}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h2 
                className="text-2xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Welcome to LocalConnect+ Chat
              </h2>
              <p 
                className="mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                Select a chat room from the sidebar to start messaging with your community.
              </p>
              <div 
                className="space-y-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <p>• Join community discussions</p>
                <p>• Share files and images</p>
                <p>• Connect with neighbors</p>
                <p>• Stay updated on local events</p>
              </div>
              
              {/* Mobile: Show sidebar button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Chat Rooms
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Create Chat Room Modal */}
      {showCreateRoom && (
        <CreateChatRoom
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}

      {/* Participant Manager Modal */}
      {showParticipantManager && selectedRoom && (
        <ParticipantManager
          roomId={selectedRoom.id}
          isAdmin={currentUserRole === 'admin'}
          onClose={() => setShowParticipantManager(false)}
        />
      )}
    </div>
  );
};

export default Chat; 