import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminOnly, usePermissions } from '../components/RoleBasedUI';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const RoleManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [changingRole, setChangingRole] = useState(null);

  // Redirect if not admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h2>
              <p className="text-text-secondary mb-6">
                You don't have permission to access the role management page. Only administrators can manage user roles.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        page_size: 20
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await api.get(`/accounts/users/?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.total_pages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setChangingRole(userId);
      const response = await api.post('/accounts/change-role/', {
        user_id: userId,
        new_role: newRole
      });
      
      toast.success(response.data.message);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error(error.response?.data?.error || 'Failed to change role');
    } finally {
      setChangingRole(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await api.post('/accounts/toggle-user-status/', {
        user_id: userId
      });
      
      toast.success(response.data.message);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error(error.response?.data?.error || 'Failed to toggle user status');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-[var(--color-error-500)]';
      case 'VOLUNTEER': return 'bg-[var(--color-warning-500)]';
      case 'USER': return 'bg-[var(--color-primary)]';
      default: return 'bg-[var(--color-text-muted)]';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'VOLUNTEER': return 'Volunteer';
      case 'USER': return 'User';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-warning)' }}>
            <svg className="w-12 h-12 text-[var(--color-dark-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Role Management</h1>
          <p className="text-text-secondary">
            Manage user roles and permissions for the LocalConnect+ community
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Search Users</label>
                <input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Filter by Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="VOLUNTEER">Volunteers</option>
                  <option value="USER">Users</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('');
                    setCurrentPage(1);
                  }}
                  className="btn btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-text-tertiary to-text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No Users Found</h3>
                <p className="text-text-secondary">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-primary">
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Email Verified</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="border-b border-border-primary hover:bg-bg-secondary transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                              <span className="text-[var(--color-dark-text)] font-medium text-sm">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">{userItem.username}</div>
                              <div className="text-sm text-text-secondary">{userItem.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium text-[var(--color-dark-text)] ${getRoleColor(userItem.role)}`}>
                            {getRoleDisplay(userItem.role)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userItem.is_active 
                              ? 'bg-[var(--color-success-500)] text-[var(--color-dark-text)]' 
                              : 'bg-[var(--color-error-500)] text-[var(--color-dark-text)]'
                          }`}>
                            {userItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userItem.email_verified 
                              ? 'bg-[var(--color-success-500)] text-[var(--color-dark-text)]' 
                              : 'bg-[var(--color-warning-500)] text-[var(--color-dark-text)]'
                          }`}>
                            {userItem.email_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-text-secondary">
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {/* Role Change Dropdown */}
                            <select
                              value={userItem.role}
                              onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                              disabled={changingRole === userItem.id || userItem.id === user?.id}
                              className="form-select text-sm"
                            >
                              <option value="USER">User</option>
                              <option value="VOLUNTEER">Volunteer</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            
                            {/* Toggle Status Button */}
                            <button
                              onClick={() => handleToggleStatus(userItem.id)}
                              disabled={userItem.id === user?.id}
                              className="btn btn-sm btn-secondary"
                              title={userItem.is_active ? 'Deactivate User' : 'Activate User'}
                            >
                              {userItem.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-sm btn-secondary"
                >
                  Previous
                </button>
                
                <span className="text-text-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement; 