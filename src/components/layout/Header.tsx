'use client';

import { Bell, LogOut, Settings, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useAuth } from '@/hooks/useAuth';
import { getRoleLabel } from '@/lib/utils';

export interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();

  const userMenuItems: DropdownItem[] = [
    {
      label: 'Profile',
      value: 'profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => {
        // Navigate to profile
      },
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        // Navigate to settings
      },
    },
    {
      label: 'Logout',
      value: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: logout,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title */}
        <div>
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          {user && (
            <Dropdown
              align="right"
              trigger={
                <div className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                  <Avatar name={user.first_name + ' ' + user.last_name} size="sm" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
              }
              items={userMenuItems}
            />
          )}
        </div>
      </div>
    </header>
  );
}
