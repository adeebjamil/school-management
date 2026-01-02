'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { User, Mail, Phone, Calendar, Building, Shield, Edit, Save, X, Lock, Key } from 'lucide-react';
import api from '@/lib/api';

interface TenantInfo {
  id: string;
  name: string;
  school_code: string;
  address: string;
  contact_email: string;
  contact_phone: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone: string;
  profile_picture: string | null;
  is_active: boolean;
  date_joined: string;
  tenant: string;
  tenant_info?: TenantInfo;
}

export default function TenantAdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Forgot Password OTP Flow
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpExpiryTime, setOtpExpiryTime] = useState(10);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
    loadTenantInfo();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile/');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile information');
      setLoading(false);
    }
  };

  const loadTenantInfo = async () => {
    try {
      const response = await api.get('/tenants/me/');
      setTenantInfo(response.data);
    } catch (err: any) {
      console.error('Failed to load tenant info:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await api.put('/auth/profile/', formData);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      await loadProfile();
      setSaving(false);
      
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      
      await api.post('/auth/change-password/', passwordData);
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
      
      setPasswordLoading(false);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setPasswordError(err.response?.data?.error || 'Failed to change password');
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Forgot Password - Step 1: Send OTP
  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const response = await api.post('/auth/forgot-password/', {
        email: forgotPasswordData.email || profile?.email
      });

      setForgotPasswordSuccess(response.data.message);
      setOtpExpiryTime(response.data.expires_in_minutes || 10);
      setForgotPasswordStep(2);
    } catch (err: any) {
      setForgotPasswordError(err.response?.data?.error || err.response?.data?.email?.[0] || 'Failed to send OTP');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (forgotPasswordData.otp.length !== 6) {
      setForgotPasswordError('OTP must be 6 digits');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/verify-otp/', {
        email: forgotPasswordData.email || profile?.email,
        otp: forgotPasswordData.otp
      });

      setForgotPasswordSuccess(response.data.message);
      setForgotPasswordStep(3);
    } catch (err: any) {
      setForgotPasswordError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Forgot Password - Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (forgotPasswordData.newPassword.length < 8) {
      setForgotPasswordError('Password must be at least 8 characters');
      setForgotPasswordLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password/', {
        email: forgotPasswordData.email || profile?.email,
        otp: forgotPasswordData.otp,
        new_password: forgotPasswordData.newPassword,
        confirm_password: forgotPasswordData.confirmPassword
      });

      setForgotPasswordSuccess(response.data.message);
      
      setTimeout(() => {
        handleCloseForgotPasswordModal();
        setSuccess('Password reset successfully!');
      }, 2000);
    } catch (err: any) {
      setForgotPasswordError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordStep(1);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleOpenForgotPassword = () => {
    setShowPasswordModal(false);
    setShowForgotPasswordModal(true);
    setForgotPasswordData({
      ...forgotPasswordData,
      email: profile?.email || ''
    });
  };


  if (loading) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav} tenantName="Loading..." title="My Profile">
        <div className="flex items-center justify-center h-full">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName={tenantInfo?.name || "School"}
      title="My Profile"
    >
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <p className="text-gray-600">Manage your account information</p>
            </div>
            
            {!isEditing ? (
              <Button
                icon={<Edit className="w-4 h-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  icon={<X className="w-4 h-4" />}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{profile?.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600 uppercase">{profile?.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-900">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{profile?.first_name || '-'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-900">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{profile?.last_name || '-'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile?.email}</span>
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profile?.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '-'}</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </Card>

          {/* School/Tenant Information */}
          {tenantInfo && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">School Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">School Name</p>
                      <p className="font-medium text-gray-900">{tenantInfo.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">School Code</p>
                      <p className="font-medium text-gray-900 font-mono">{tenantInfo.school_code}</p>
                    </div>
                    
                    {tenantInfo.contact_email && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">School Email</p>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{tenantInfo.contact_email}</p>
                        </div>
                      </div>
                    )}
                    
                    {tenantInfo.contact_phone && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">School Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{tenantInfo.contact_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {tenantInfo.address && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-gray-900">{tenantInfo.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Account Security */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Keep your account secure</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      icon={<Key className="w-4 h-4" />}
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForgotPasswordModal(true);
                        setForgotPasswordData({ ...forgotPasswordData, email: profile?.email || '' });
                      }}
                    >
                      Forgot Password
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('2FA setup coming soon!')}
                  >
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  </div>
                  <button
                    onClick={handleClosePasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={passwordLoading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {passwordError && <Alert type="error" className="mb-4">{passwordError}</Alert>}
                {passwordSuccess && <Alert type="success" className="mb-4">{passwordSuccess}</Alert>}
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      placeholder="Enter current password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Password Requirements:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>At least 8 characters long</li>
                        <li>Different from current password</li>
                        <li>Use a strong, unique password</li>
                      </ul>
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      icon={<Key className="w-4 h-4" />}
                      disabled={passwordLoading}
                      className="flex-1"
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClosePasswordModal}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm pt-3 border-t">
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot your current password? Use OTP verification →
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
        
        {/* Forgot Password OTP Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Reset Password (OTP)</h3>
                  </div>
                  <button
                    onClick={handleCloseForgotPasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={forgotPasswordLoading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex justify-center space-x-2 mb-4">
                  <div className={`h-2 w-16 rounded ${forgotPasswordStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 w-16 rounded ${forgotPasswordStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 w-16 rounded ${forgotPasswordStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                </div>
                
                {forgotPasswordError && <Alert type="error" className="mb-4">{forgotPasswordError}</Alert>}
                {forgotPasswordSuccess && <Alert type="success" className="mb-4">{forgotPasswordSuccess}</Alert>}
                
                {/* Step 1: Email Confirmation */}
                {forgotPasswordStep === 1 && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Your Email
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">OTP will be sent to:</p>
                        <p className="font-medium text-gray-900">{profile?.email}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-xs text-blue-800">
                        We'll send a 6-digit OTP to your email. The OTP will be valid for 10 minutes.
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={forgotPasswordLoading}
                        className="flex-1"
                      >
                        {forgotPasswordLoading ? 'Sending OTP...' : 'Send OTP'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseForgotPasswordModal}
                        disabled={forgotPasswordLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
                
                {/* Step 2: OTP Verification */}
                {forgotPasswordStep === 2 && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        We've sent a 6-digit OTP to <strong>{profile?.email}</strong>
                        <br />
                        <span className="text-orange-600">Valid for {otpExpiryTime} minutes</span>
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                        value={forgotPasswordData.otp}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, otp: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={forgotPasswordLoading || forgotPasswordData.otp.length !== 6}
                        className="flex-1"
                      >
                        {forgotPasswordLoading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSendOTP()}
                        disabled={forgotPasswordLoading}
                      >
                        Resend
                      </Button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(1)}
                      className="w-full text-sm text-gray-600 hover:text-gray-800"
                    >
                      ← Change Email
                    </button>
                  </form>
                )}
                
                {/* Step 3: New Password */}
                {forgotPasswordStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                        placeholder="Enter new password (min 8 characters)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmPassword: e.target.value })}
                        placeholder="Confirm your new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {forgotPasswordData.newPassword && forgotPasswordData.confirmPassword && 
                     forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Password Requirements:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>At least 8 characters long</li>
                          <li>Use a strong, unique password</li>
                        </ul>
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={forgotPasswordLoading || !forgotPasswordData.newPassword || 
                               !forgotPasswordData.confirmPassword || 
                               forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword}
                      className="w-full"
                    >
                      {forgotPasswordLoading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
