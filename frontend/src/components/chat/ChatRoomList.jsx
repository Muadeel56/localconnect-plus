import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/chatService';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import Loading from '../Loading';

const ChatRoomList = ({ onRoomSelect, selectedRoomId }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const data = await chatService.getChatRooms();
      setChatRooms(data.results || data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    onRoomSelect(room);
  };

  const getRoomTypeIcon = (roomType) => {
    switch (roomType) {
      case 'community':
        return '🏘️';
      case 'private':
        return '🔒';
      case 'event':
        return '📅';
      default:
        return '💬';
    }
  };

  const getRoomTypeColor = (roomType) => {
    const baseClasses = 'px-2 py-1 text-xs rounded-full';
    
    switch (roomType) {
      case 'community':
        return `${baseClasses} ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`;
      case 'private':
        return `${baseClasses} ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`;
      case 'event':
        return `${baseClasses} ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`;
      default:
        return `${baseClasses} ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="mb-2" style={{ color: 'var(--color-error)' }}>{error}</p>
        <button
          onClick={fetchChatRooms}
          className="px-4 py-2 rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">💬</div>
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          No Chat Rooms
        </h3>
        <p 
          className="mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          You haven't joined any chat rooms yet.
        </p>
        <button
          onClick={() => onRoomSelect({ type: 'create' })}
          className="px-4 py-2 rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Chat Room
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <h2 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Chat Rooms
        </h2>
        <button
          onClick={() => onRoomSelect({ type: 'create' })}
          className="px-3 py-1 text-sm rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          + New
        </button>
      </div>
      
      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className={`
                flex items-center p-3 cursor-pointer transition-colors rounded-lg
                ${selectedRoomId === room.id 
                  ? 'border-l-4 border-blue-500' 
                  : ''
                }
              `}
              style={{
                backgroundColor: selectedRoomId === room.id 
                  ? isDark 
                    ? 'var(--color-primary)/10' 
                    : 'var(--color-primary)/5'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                }
              }}
            >
              {/* Room Icon */}
              <div className="flex-shrink-0 mr-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                  }}
                >
                  {getRoomTypeIcon(room.room_type)}
                </div>
              </div>
              
              {/* Room Details */}
              <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1">
                  <h3 
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {room.name}
                  </h3>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <span className={getRoomTypeColor(room.room_type)}>
                      {room.room_type_display}
                    </span>
                    {room.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {room.unread_count > 99 ? '99+' : room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Last Message */}
                {room.last_message && (
                  <div className="flex items-center justify-between mb-1">
                    <p 
                      className="text-xs truncate flex-1 mr-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span className="font-medium">{room.last_message.sender}:</span>{' '}
                      {room.last_message.content}
                    </p>
                    <span 
                      className="text-xs flex-shrink-0"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {formatDistanceToNow(new Date(room.last_message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
                
                {/* Footer Info */}
                <div className="flex items-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span>
                    {room.participant_count} participant{room.participant_count !== 1 ? 's' : ''}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomList; 