import React, { useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Role-based UI component that conditionally renders content based on user permissions
 */
const RoleBasedUI = ({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback = null,
  showForRoles = [],
  hideForRoles = [],
  className = ""
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, show fallback
  if (!isAuthenticated) {
    return fallback;
  }

  // Check role-based visibility
  if (showForRoles.length > 0 && !showForRoles.includes(user?.role)) {
    return fallback;
  }

  if (hideForRoles.length > 0 && hideForRoles.includes(user?.role)) {
    return fallback;
  }

  // Check specific role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return fallback;
  }

  // Check specific permission requirement
  if (requiredPermission && user?.permissions && !user.permissions[requiredPermission]) {
    return fallback;
  }

  return <div className={className}>{children}</div>;
};

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    return user.permissions?.[permission] || false;
  };

  const hasRole = (role) => {
    if (!isAuthenticated || !user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isVolunteer = () => hasRole('VOLUNTEER');
  const isUser = () => hasRole('USER');
  const isModerator = () => hasAnyRole(['ADMIN', 'VOLUNTEER']);

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    isVolunteer,
    isUser,
    isModerator,
    user,
    isAuthenticated
  };
};

/**
 * Permission-based button component
 */
export const PermissionButton = ({ 
  children, 
  permission, 
  role, 
  onClick, 
  className = "", 
  disabled = false,
  ...props 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  const canShow = () => {
    if (permission && !hasPermission(permission)) return false;
    if (role && !hasRole(role)) return false;
    return true;
  };

  if (!canShow()) return null;

  return (
    <button 
      className={className} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Role-based navigation link component
 */
export const RoleBasedLink = ({ 
  children, 
  to, 
  permission, 
  role, 
  className = "", 
  ...props 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  const canShow = () => {
    if (permission && !hasPermission(permission)) return false;
    if (role && !hasRole(role)) return false;
    return true;
  };

  if (!canShow()) return null;

  return (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  );
};

/**
 * Permission-based content wrapper
 */
export const PermissionContent = ({ 
  children, 
  permission, 
  role, 
  fallback = null,
  className = "" 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  const canShow = () => {
    if (permission && !hasPermission(permission)) return false;
    if (role && !hasRole(role)) return false;
    return true;
  };

  if (!canShow()) return fallback;

  return <div className={className}>{children}</div>;
};

/**
 * Role-based navigation menu component
 */
export const RoleBasedNav = ({ children, className = "" }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className={className}>
      {children}
    </nav>
  );
};

/**
 * Admin-only content wrapper
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedUI requiredRole="ADMIN" fallback={fallback}>
    {children}
  </RoleBasedUI>
);

/**
 * Moderator-only content wrapper (Admin + Volunteer)
 */
export const ModeratorOnly = ({ children, fallback = null }) => (
  <RoleBasedUI showForRoles={['ADMIN', 'VOLUNTEER']} fallback={fallback}>
    {children}
  </RoleBasedUI>
);

/**
 * Authenticated user content wrapper
 */
export const AuthenticatedOnly = ({ children, fallback = null }) => (
  <RoleBasedUI fallback={fallback}>
    {children}
  </RoleBasedUI>
);

export default RoleBasedUI; 