'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { parentNav } from '@/config/navigation';
import { User, Mail, Phone, MapPin, Users, Edit2, Key, Save, X } from 'lucide-react';
import api from '@/lib/api';

interface ParentProfile {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  relation: string;
  occupation?: string;
  address?: string;
  emergency_contact?: string;
  children_count: number;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ParentProfile>>({});
  
  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Get user details
      const userResponse = await api.get('/auth/profile/');
      
      // Get parent-specific details
      const parentsResponse = await api.get('/parents/');
      const parentData = Array.isArray(parentsResponse.data) 
        ? parentsResponse.data.find((p: any) => p.user?.id === userResponse.data.id)
        : parentsResponse.data.results?.find((p: any) => p.user?.id === userResponse.data.id);
      
      // Fetch children count
      const childrenResponse = await api.get('/parents/my-children/');
      const childrenCount = childrenResponse.data?.length || 0;
      
      setProfile({
        id: parentData?.id || userResponse.data.id,
        user: {
          first_name: userResponse.data.first_name,
          last_name: userResponse.data.last_name,
          email: userResponse.data.email,
          phone: userResponse.data.phone || '',
        },
        relation: parentData?.relation || 'guardian',
        occupation: parentData?.occupation || '',
        address: parentData?.address || '',
        emergency_contact: userResponse.data.phone || '',
        children_count: childrenCount,
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/auth/profile/', {
        first_name: editedProfile.user?.first_name,
        last_name: editedProfile.user?.last_name,
        phone: editedProfile.user?.phone,
        occupation: editedProfile.occupation,
        address: editedProfile.address,
        emergency_contact: editedProfile.emergency_contact,
      });
      await fetchProfile();
      setIsEditing(false);
      setEditedProfile({});
      setSaving(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      await api.post('/auth/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess('Password changed successfully');
      setPasswordError('');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
      setPasswordSuccess('');
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Profile">
        <Loading />
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Profile">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Failed to load profile'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={parentNav} title="Profile">
      <div className="space-y-6 max-w-4xl">
        {/* Profile Header */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                name={`${profile.user.first_name} ${profile.user.last_name}`}
                size="xl"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.user.first_name} {profile.user.last_name}
                </h2>
                <p className="text-sm text-gray-600 capitalize">{profile.relation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {profile.children_count} {profile.children_count === 1 ? 'Child' : 'Children'}
                  </span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.user?.first_name || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        user: { ...editedProfile.user!, first_name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.user.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.user?.last_name || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        user: { ...editedProfile.user!, last_name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.user.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <p className="text-gray-900">{profile.user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.user?.phone || ''}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      user: { ...editedProfile.user!, phone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.user.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.occupation || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, occupation: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.occupation || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.address || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.address || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-2" />
                Emergency Contact
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.emergency_contact || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, emergency_contact: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.emergency_contact || 'Not provided'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Account Security */}
        <Card title="Account Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-600">
                  Change your password to keep your account secure
                </p>
              </div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>

            {showChangePassword && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {passwordSuccess}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm_password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
