import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  displayName, 
  email, 
  size = 'sm' 
}) => {
  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || undefined} alt={displayName || email || 'Avatar'} />
      <AvatarFallback className="bg-gradient-primary text-white font-medium">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};