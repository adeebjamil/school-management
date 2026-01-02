'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { User, Mail, Building2, Calendar } from 'lucide-react';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = Cookies.get('user');
      if (userData) {
        setProfile(JSON.parse(userData));
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Personal Information" subtitle="Your basic account details">
          <div className="space-y-4 p-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{profile?.email?.split('@')[0] || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">{profile?.role || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">January 2025</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Security Settings" subtitle="Manage your password and authentication">
          <div className="space-y-4 p-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Password</p>
              <Button disabled className="w-full">
                Change Password
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mb-2">
                Add an extra layer of security to your account
              </p>
              <Button disabled className="w-full">
                Enable 2FA
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Active Sessions</p>
              <p className="text-xs text-gray-500">
                Currently logged in on 1 device
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Notification Preferences" subtitle="Choose what updates you want to receive">
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive email updates about your account</p>
            </div>
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-gray-600">Important system notifications and updates</p>
            </div>
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Activity Digest</p>
              <p className="text-sm text-gray-600">Weekly summary of your activity</p>
            </div>
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
