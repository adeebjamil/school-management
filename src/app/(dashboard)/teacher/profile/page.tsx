'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { teacherNav } from '@/config/navigation';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, BookOpen, Save, X, Edit2, Award } from 'lucide-react';

interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  joiningDate: string;
  department: string;
  designation: string;
  qualification: string;
  experience: number;
  subjects: string[];
  salary: number;
  bloodGroup: string;
  emergencyContact: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  photo?: string;
}

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await profileService.getMyProfile();
      
      // Mock data
      const mockProfile: TeacherProfile = {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        employeeId: 'EMP001',
        email: 'sarah.johnson@school.com',
        phone: '+1 234-567-8900',
        alternatePhone: '+1 234-567-8901',
        dateOfBirth: '1985-06-15',
        gender: 'Female',
        address: '123 Main Street, Apartment 4B',
        city: 'New York',
        state: 'NY',
        pincode: '10001',
        joiningDate: '2015-08-01',
        department: 'Mathematics',
        designation: 'Senior Mathematics Teacher',
        qualification: 'M.Sc Mathematics, B.Ed',
        experience: 12,
        subjects: ['Mathematics', 'Algebra', 'Calculus', 'Trigonometry'],
        salary: 65000,
        bloodGroup: 'O+',
        emergencyContact: '+1 234-567-8902',
        emergencyContactName: 'John Johnson',
        emergencyContactRelation: 'Spouse',
      };

      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile(profile);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile(profile);
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // TODO: Replace with actual API call
      // await profileService.updateProfile(editedProfile);

      setProfile(editedProfile);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof TeacherProfile, value: any) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={teacherNav}
        tenantName="Sunshine High School"
        title="Profile"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout
        sidebarItems={teacherNav}
        tenantName="Sunshine High School"
        title="Profile"
      >
        <Alert type="error">Failed to load profile</Alert>
      </DashboardLayout>
    );
  }

  const displayProfile = editing ? editedProfile! : profile;

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="Profile"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <p className="text-gray-600 mt-1">View and manage your profile information</p>
          </div>
          {!editing ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Profile Photo and Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {displayProfile.firstName[0]}{displayProfile.lastName[0]}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {displayProfile.firstName} {displayProfile.lastName}
                </h3>
                <p className="text-lg text-gray-600 mt-1">{displayProfile.designation}</p>
                <p className="text-sm text-gray-500 mt-1">Employee ID: {displayProfile.employeeId}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{displayProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{displayProfile.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                {editing ? (
                  <Input
                    type="date"
                    value={displayProfile.dateOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">
                    {new Date(displayProfile.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                {editing ? (
                  <select
                    value={displayProfile.gender}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{displayProfile.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                {editing ? (
                  <Input
                    value={displayProfile.bloodGroup}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bloodGroup', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.bloodGroup}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{displayProfile.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {editing ? (
                  <Input
                    value={displayProfile.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone
                </label>
                {editing ? (
                  <Input
                    value={displayProfile.alternatePhone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('alternatePhone', e.target.value)}
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.alternatePhone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {editing ? (
                  <Input
                    value={displayProfile.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{displayProfile.address}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.state}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.pincode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pincode', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.pincode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <p className="text-gray-900">{displayProfile.employeeId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <p className="text-gray-900">{displayProfile.department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <p className="text-gray-900">{displayProfile.designation}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <p className="text-gray-900">
                  {new Date(displayProfile.joiningDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <p className="text-gray-900">{displayProfile.experience} years</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <p className="text-gray-900">{displayProfile.qualification}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <p className="text-gray-900">
                  ${displayProfile.salary.toLocaleString()} / year
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Academic Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects Teaching
                </label>
                <div className="flex flex-wrap gap-2">
                  {displayProfile.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contact
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.emergencyContactName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('emergencyContactName', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.emergencyContactName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relation
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.emergencyContactRelation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('emergencyContactRelation', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.emergencyContactRelation}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {editing ? (
                    <Input
                      value={displayProfile.emergencyContact}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('emergencyContact', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{displayProfile.emergencyContact}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
