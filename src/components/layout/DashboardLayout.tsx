'use client';

import { ReactNode } from 'react';
import { Sidebar, SidebarItem } from './Sidebar';
import { Header } from './Header';

export interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  tenantName?: string;
  title?: string;
}

export function DashboardLayout({ children, sidebarItems, tenantName, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar items={sidebarItems} tenantName={tenantName} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
