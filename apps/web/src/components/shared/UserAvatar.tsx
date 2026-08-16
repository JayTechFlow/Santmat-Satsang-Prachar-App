import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface UserAvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}

export function getSafeInitials(
  fullName?: string | null,
  displayName?: string | null,
  name?: string | null,
  email?: string | null
): string {
  const primaryName = (fullName || displayName || name || '').trim();
  
  if (primaryName) {
    const parts = primaryName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }

  const cleanEmail = (email || '').trim();
  if (cleanEmail) {
    const username = cleanEmail.split('@')[0].trim();
    if (username) {
      const emailParts = username.split(/[._-]/).filter(Boolean);
      if (emailParts.length >= 2) {
        return (emailParts[0][0] + emailParts[1][0]).toUpperCase();
      }
      return username.substring(0, 2).toUpperCase();
    }
  }

  return 'US';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  fullName,
  displayName,
  name,
  email,
  size = 40,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const displayNameToUse = (fullName || displayName || name || email || 'User').trim();
  const initials = getSafeInitials(fullName, displayName, name, email);

  if (!avatarUrl || imageError) {
    return (
      <div
        className={`user-avatar-initials ${className}`}
        aria-label={displayNameToUse}
        role="img"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size * 0.4}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontWeight: 600,
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        {initials || <User size={size * 0.5} aria-hidden="true" />}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={displayNameToUse}
      onError={() => setImageError(true)}
      className={`user-avatar-image ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0
      }}
    />
  );
};
