import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/chatService';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../Avatar';
import Loading from '../Loading';

const ParticipantManager = ({ roomId, isAdmin, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchParticipants();
  }, [roomId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        console.log('Searching for users with term:', searchTerm);
        
        // Use the correct endpoint for user search
        const response = await api.get(`/accounts/users/?search=${encodeURIComponent(searchTerm)}`);
        console.log('Search response:', response.data);
        
        const users = response.data.results || response.data;
        
        // Filter out users who are already participants
        const participantIds = new Set(participants.map(p => p.user.id));
        const filteredUsers = users.filter(u => !participantIds.has(u.id));
        
        setSearchResults(filteredUsers);
      } catch (err) {
        console.error('Error searching users:', err);
        // If the search endpoint doesn't work, show a helpful message
        if (err.response?.status === 403) {
          setError('You do not have permission to search users');
        } else if (err.response?.status === 404) {
          setError('User search endpoint not available');
        } else {
          setError('Failed to search users');
        }
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, participants]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await chatService.getParticipants(roomId);
      setParticipants(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (userId) => {
    try {
      await chatService.addParticipant(roomId, userId);
      await fetchParticipants(); // Refresh the list
      setSearchTerm(''); // Clear search
      setSearchResults([]);
    } catch (err) {
      console.error('Error adding participant:', err);
      setError('Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      await api.delete(`/chat/participants/${participantId}/`);
      await fetchParticipants(); // Refresh the list
    } catch (err) {
      console.error('Error removing participant:', err);
      setError('Failed to remove participant');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return isDark ? 'bg-red-900/30 text-red-300 border-red-800' : 'bg-red-50 text-red-700 border-red-200';
      case 'moderator':
        return isDark ? 'bg-yellow-900/30 text-yellow-300 border-yellow-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          w-full max-w-md lg:max-w-lg rounded-lg shadow-xl max-h-[90vh] flex flex-col
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}
        style={{
          backgroundColor: isDark ? 'var(--bg-secondary)' : 'var(--bg-card)',
          borderColor: isDark ? 'var(--border-secondary)' : 'var(--border-primary)'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex-shrink-0"
          style={{
            borderColor: isDark ? 'var(--border-secondary)' : 'var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Manage Participants
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
              style={{ color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Section - Only show for admins */}
        {isAdmin && (
          <div 
            className="p-4 border-b flex-shrink-0"
            style={{
              borderColor: isDark ? 'var(--border-secondary)' : 'var(--border-primary)'
            }}
          >
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users to add..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                  borderColor: isDark ? 'var(--border-secondary)' : 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              {searching && (
                <div className="absolute right-3 top-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div 
                className="mt-2 max-h-32 overflow-y-auto border rounded-lg"
                style={{
                  borderColor: isDark ? 'var(--border-secondary)' : 'var(--border-primary)',
                  backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                }}
              >
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="flex items-center justify-between p-2 hover:bg-opacity-50 transition-colors"
                    style={{
                      '&:hover': {
                        backgroundColor: isDark ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar user={searchUser} size="sm" className="w-6 h-6" />
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {searchUser.first_name} {searchUser.last_name} (@{searchUser.username})
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddParticipant(searchUser.id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
              <div 
                className="mt-2 p-2 text-sm text-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 flex-shrink-0">
            <div 
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: isDark ? 'var(--color-error)/10' : '#fee2e2',
                borderColor: isDark ? 'var(--color-error)' : '#fecaca',
                color: isDark ? '#fca5a5' : '#dc2626'
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loading />
            </div>
          ) : (
            <div className="space-y-2">
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Participants ({participants.length})
              </h3>
              
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-opacity-50"
                  style={{
                    backgroundColor: isDark ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                  }}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar user={participant.user} size="sm" className="w-8 h-8 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div 
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {participant.user.first_name} {participant.user.last_name}
                      </div>
                      <div 
                        className="text-xs truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        @{participant.user.username}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(participant.role)}`}>
                      {participant.role}
                    </span>
                    
                    {isAdmin && participant.user.id !== user.id && participant.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="p-1 rounded transition-colors hover:bg-red-500/20"
                        style={{ color: 'var(--color-error)' }}
                        title="Remove participant"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {participants.length === 0 && (
                <div 
                  className="text-center py-8"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No participants found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantManager; 