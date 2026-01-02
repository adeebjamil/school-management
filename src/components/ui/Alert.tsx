'use client';

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type = 'info', title, children, onClose, className }: AlertProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: 'text-green-800',
      text: 'text-green-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      title: 'text-red-800',
      text: 'text-red-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      title: 'text-yellow-800',
      text: 'text-yellow-700',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: 'text-blue-800',
      text: 'text-blue-700',
    },
  };

  const style = styles[type];

  return (
    <div className={cn('p-4 rounded-lg border', style.container, className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="flex-1">
          {title && <h3 className={cn('font-medium mb-1', style.title)}>{title}</h3>}
          <div className={cn('text-sm', style.text)}>{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
