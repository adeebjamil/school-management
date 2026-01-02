'use client';

import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Bell, Lock, Globe, Database, Mail, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your application preferences and configurations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Notifications" subtitle="Configure notification preferences">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Activity Alerts</p>
                  <p className="text-sm text-gray-600">Get notified about important activities</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
          </div>
        </Card>

        <Card title="Security" subtitle="Manage security settings">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
              </div>
              <Button disabled size="sm">Enable</Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-gray-600">Manage active sessions</p>
                </div>
              </div>
              <Button disabled size="sm">View</Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Password Policy</p>
                  <p className="text-sm text-gray-600">Configure password requirements</p>
                </div>
              </div>
              <Button disabled size="sm">Configure</Button>
            </div>
          </div>
        </Card>

        <Card title="System" subtitle="System configuration and preferences">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Database Backup</p>
                  <p className="text-sm text-gray-600">Schedule automatic backups</p>
                </div>
              </div>
              <Button disabled size="sm">Configure</Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Language & Region</p>
                  <p className="text-sm text-gray-600">Set language and timezone</p>
                </div>
              </div>
              <Button disabled size="sm">Change</Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Data Export</p>
                  <p className="text-sm text-gray-600">Export your data</p>
                </div>
              </div>
              <Button disabled size="sm">Export</Button>
            </div>
          </div>
        </Card>

        <Card title="Appearance" subtitle="Customize the look and feel">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-600">Select light or dark mode</p>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Sidebar Position</p>
                <p className="text-sm text-gray-600">Left or right sidebar</p>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Compact Mode</p>
                <p className="text-sm text-gray-600">Use compact layout</p>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" disabled>Reset to Defaults</Button>
        <Button disabled>Save Changes</Button>
      </div>
    </div>
  );
}
