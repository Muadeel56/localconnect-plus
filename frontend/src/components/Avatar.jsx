import React from 'react';

const Avatar = ({ 
  user, 
  size = 'md', 
  className = '', 
  showBorder = false,
  onClick = null 
}) => {
  // Safe function to get user initial with proper capitalization
  const getUserInitial = (username) => {
    if (!username || username.length === 0) return 'U';
    return username.charAt(0).toUpperCase();
  };

  // Safe function to get display name with proper capitalization
  const getDisplayName = (user) => {
    if (!user) return '';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase();
    }
    
    return '';
  };

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Border classes
  const borderClass = showBorder ? 'ring-2 ring-white dark:ring-gray-800' : '';

  // Click handler
  const handleClick = () => {
    if (onClick) onClick();
  };

  // Debug logging
  console.log('Avatar component - user:', user);
  console.log('Avatar component - profile_picture:', user?.profile_picture);
  
  // Validate profile picture URL
  const isValidProfilePicture = user?.profile_picture && (
    user.profile_picture.startsWith('http://') || 
    user.profile_picture.startsWith('https://') ||
    user.profile_picture.startsWith('/')
  );
  
  console.log('Avatar component - isValidProfilePicture:', isValidProfilePicture);
  
  return (
    <div 
      className={`relative inline-block ${sizeClass} ${borderClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {isValidProfilePicture ? (
        // Profile picture
        <img
          src={user.profile_picture}
          alt={getDisplayName(user)}
          className="w-full h-full rounded-full object-cover shadow-sm"
          onError={(e) => {
            console.error('Profile picture failed to load:', user.profile_picture);
            console.error('Error details:', e);
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          onLoad={(e) => {
            console.log('Profile picture loaded successfully:', user.profile_picture);
            console.log('Image element:', e.target);
            // Hide the fallback initials when image loads successfully
            e.target.nextSibling.style.display = 'none';
          }}
        />
      ) : null}
      
      {/* Fallback initials */}
      <div 
        className={`w-full h-full rounded-full flex items-center justify-center font-semibold text-[var(--color-dark-text)] shadow-sm ${
          isValidProfilePicture ? 'hidden' : 'flex'
        }`}
        style={{ background: 'var(--gradient-primary)' }}
      >
        {getUserInitial(user?.username)}
      </div>
      
      {/* Online status indicator (optional) */}
      {user?.is_online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full" style={{ 
          backgroundColor: 'var(--color-success-500)',
          borderColor: 'var(--bg-card)'
        }}></div>
      )}
    </div>
  );
};

export default Avatar; 