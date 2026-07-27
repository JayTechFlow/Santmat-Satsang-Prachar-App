import React from 'react';
import { User } from 'lucide-react';

export interface UserAvatarProps {
  avatarUrl?: string;
  fullName: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  fullName, 
  size = 40 
}) => {
  if (!avatarUrl) {
    const initials = fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        border: '1px solid rgba(37, 99, 235, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontSize: `${size * 0.4}px`,
        fontWeight: 600
      }}>
        {initials || <User size={size * 0.5} />}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={fullName}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        boxShadow: 'var(--shadow-sm)'
      }}
    />
  );
};
