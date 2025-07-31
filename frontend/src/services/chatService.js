import api from './api';

// Chat Room API
export const chatService = {
  // Get all chat rooms for the current user
  getChatRooms: async () => {
    const response = await api.get('/chat/rooms/');
    return response.data;
  },

  // Get a specific chat room with messages
  getChatRoom: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/`);
    return response.data;
  },

  // Create a new chat room
  createChatRoom: async (roomData) => {
    const response = await api.post('/chat/rooms/', roomData);
    return response.data;
  },

  // Update a chat room
  updateChatRoom: async (roomId, roomData) => {
    const response = await api.put(`/chat/rooms/${roomId}/`, roomData);
    return response.data;
  },

  // Delete a chat room
  deleteChatRoom: async (roomId) => {
    const response = await api.delete(`/chat/rooms/${roomId}/`);
    return response.data;
  },

  // Join a chat room
  joinChatRoom: async (roomId) => {
    const response = await api.post(`/chat/rooms/${roomId}/join/`);
    return response.data;
  },

  // Leave a chat room
  leaveChatRoom: async (roomId) => {
    const response = await api.post(`/chat/rooms/${roomId}/leave/`);
    return response.data;
  },

  // Get participants of a chat room
  getParticipants: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/participants/`);
    return response.data;
  },

  // Get online users in a chat room
  getOnlineUsers: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/online_users/`);
    return response.data;
  },

  // Mark messages as read in a chat room
  markAsRead: async (roomId) => {
    const response = await api.post(`/chat/rooms/${roomId}/mark_as_read/`);
    return response.data;
  },

  // Add participant to chat room
  addParticipant: async (roomId, userId) => {
    const response = await api.post(`/chat/rooms/${roomId}/add_participant/`, { user_id: userId });
    return response.data;
  },
};

// Message API
export const messageService = {
  // Get messages by chat room
  getMessagesByRoom: async (roomId) => {
    const response = await api.get(`/chat/messages/by_room/?room_id=${roomId}`);
    return response.data;
  },

  // Create a new message
  createMessage: async (messageData) => {
    const response = await api.post('/chat/messages/', messageData);
    return response.data;
  },

  // Update a message
  updateMessage: async (messageId, messageData) => {
    const response = await api.put(`/chat/messages/${messageId}/`, messageData);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}/`);
    return response.data;
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    const response = await api.post(`/chat/messages/${messageId}/edit/`, { content });
    return response.data;
  },

  // Reply to a message
  replyToMessage: async (messageId, content) => {
    const response = await api.post(`/chat/messages/${messageId}/reply/`, { content });
    return response.data;
  },
};

// Chat Participant API
export const participantService = {
  // Get all participants
  getParticipants: async () => {
    const response = await api.get('/chat/participants/');
    return response.data;
  },

  // Update participant role
  updateRole: async (participantId, role) => {
    const response = await api.post(`/chat/participants/${participantId}/update_role/`, { role });
    return response.data;
  },
};

// Chat Notification API
export const chatNotificationService = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/chat/notifications/');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.post(`/chat/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.post('/chat/notifications/mark_all_as_read/');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/chat/notifications/unread_count/');
    return response.data;
  },
};

// WebSocket connection management
export class WebSocketManager {
  constructor() {
    this.socket = null;
    this.roomConnections = new Map();
    this.notificationConnection = null;
  }

  // Get token from localStorage
  getAuthToken() {
    return localStorage.getItem('access_token');
  }

  // Connect to a chat room
  connectToRoom(roomId) {
    if (this.roomConnections.has(roomId)) {
      return this.roomConnections.get(roomId);
    }

    // Connect to Django backend (port 8000) instead of Vite dev server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = this.getAuthToken();
    const wsUrl = `${protocol}//localhost:8000/ws/chat/${roomId}${token ? `?token=${token}` : ''}`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log(`Connected to chat room ${roomId}`);
    };

    socket.onclose = () => {
      console.log(`Disconnected from chat room ${roomId}`);
      this.roomConnections.delete(roomId);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for room ${roomId}:`, error);
    };

    this.roomConnections.set(roomId, socket);
    return socket;
  }

  // Connect to notifications
  connectToNotifications() {
    if (this.notificationConnection) {
      return this.notificationConnection;
    }

    // Connect to Django backend (port 8000)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = this.getAuthToken();
    const wsUrl = `${protocol}//localhost:8000/ws/notifications${token ? `?token=${token}` : ''}`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('Connected to notifications');
    };

    socket.onclose = () => {
      console.log('Disconnected from notifications');
      this.notificationConnection = null;
    };

    socket.onerror = (error) => {
      console.error('WebSocket error for notifications:', error);
    };

    this.notificationConnection = socket;
    return socket;
  }

  // Send message to a room
  sendMessage(roomId, message, messageType = 'text', fileData = null) {
    const socket = this.roomConnections.get(roomId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'chat_message',
        message: message,
        message_type: messageType,
        ...(fileData && {
          file_url: fileData.url,
          file_name: fileData.name,
          file_size: fileData.size
        })
      };
      socket.send(JSON.stringify(messageData));
    }
  }

  // Send typing indicator
  sendTyping(roomId, isTyping) {
    const socket = this.roomConnections.get(roomId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));
    }
  }

  // Mark messages as read
  markMessagesAsRead(roomId) {
    const socket = this.roomConnections.get(roomId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'read_messages'
      }));
    }
  }

  // Disconnect from a room
  disconnectFromRoom(roomId) {
    const socket = this.roomConnections.get(roomId);
    if (socket) {
      socket.close();
      this.roomConnections.delete(roomId);
    }
  }

  // Disconnect from notifications
  disconnectFromNotifications() {
    if (this.notificationConnection) {
      this.notificationConnection.close();
      this.notificationConnection = null;
    }
  }

  // Disconnect from all connections
  disconnectAll() {
    this.roomConnections.forEach((socket, roomId) => {
      socket.close();
    });
    this.roomConnections.clear();
    
    if (this.notificationConnection) {
      this.notificationConnection.close();
      this.notificationConnection = null;
    }
  }
}

// Create a singleton instance
export const wsManager = new WebSocketManager(); 