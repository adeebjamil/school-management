'use client';

import { User } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  if (name) {
    return (
      <div
        className={cn(
          'rounded-full bg-blue-600 text-white flex items-center justify-center font-medium',
          sizes[size],
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 text-gray-600 flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  );
}
