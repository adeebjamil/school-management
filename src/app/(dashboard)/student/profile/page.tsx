'use client';

import { useState, useEffect, FormEvent } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { studentNav } from '@/config/navigation';
import { User, Mail, Phone, Calendar, MapPin, BookOpen, Edit2, Save, X } from 'lucide-react';

interface StudentProfile {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  admission_number: string;
  roll_number: string;
  class_name: string;
  section: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  emergency_contact: string;
  medical_conditions?: string;
  profile_photo?: string;
}

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergency_contact: '',
    medical_conditions: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await studentService.getMyProfile();
      
      // Mock data
      const mockProfile: StudentProfile = {
        id: '1',
        user: {
          id: 'user1',
          email: 'adeeb.jamil@student.school.com',
          first_name: 'Adeeb',
          last_name: 'Jamil',
          phone: '7894563214',
        },
        admission_number: '1254',
        roll_number: '21',
        class_name: '8 - C',
        section: 'C',
        date_of_birth: '2010-05-15',
        gender: 'Male',
        blood_group: 'A+',
        address: '123 Green Valley, Sunrise Colony',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        parent_name: 'Ramesh Jamil',
        parent_phone: '+91 9876543210',
        parent_email: 'ramesh.jamil@email.com',
        emergency_contact: '+91 9876543211',
        medical_conditions: 'None',
      };

      setProfile(mockProfile);
      setFormData({
        phone: mockProfile.user.phone || '',
        address: mockProfile.address || '',
        city: mockProfile.city || '',
        state: mockProfile.state || '',
        pincode: mockProfile.pincode || '',
        emergency_contact: mockProfile.emergency_contact || '',
        medical_conditions: mockProfile.medical_conditions || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await studentService.updateMyProfile(formData);
      
      // Mock update
      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            phone: formData.phone,
          },
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          emergency_contact: formData.emergency_contact,
          medical_conditions: formData.medical_conditions,
        });
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        phone: profile.user.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        emergency_contact: profile.emergency_contact || '',
        medical_conditions: profile.medical_conditions || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={studentNav}
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
        sidebarItems={studentNav}
        tenantName="Sunshine High School"
        title="Profile"
      >
        <Alert type="error">Failed to load profile</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="Profile"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <p className="text-gray-600 mt-1">View and manage your profile information</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              icon={<Edit2 className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{profile.user.first_name} {profile.user.last_name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{profile.user.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admission Number
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span>{profile.admission_number}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <span className="text-lg font-semibold">{profile.roll_number}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class & Section
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{profile.class_name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{new Date(profile.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{profile.gender}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <span className="font-semibold text-red-600">{profile.blood_group}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditing ? (
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{profile.user.phone}</span>
                      </div>
                    </div>
                  )}
                  {isEditing ? (
                    <Input
                      label="Emergency Contact"
                      name="emergency_contact"
                      type="tel"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{profile.emergency_contact}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  {isEditing ? (
                    <Textarea
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="flex items-start gap-2 text-gray-900">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{profile.address}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {isEditing ? (
                    <>
                      <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                      <Input
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                      <Input
                        label="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <span className="text-gray-900">{profile.city}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <span className="text-gray-900">{profile.state}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode
                        </label>
                        <span className="text-gray-900">{profile.pincode}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Parent Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Name
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{profile.parent_name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Phone
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{profile.parent_phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{profile.parent_email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    label="Medical Conditions"
                    name="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="List any medical conditions, allergies, or special requirements"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </label>
                    <p className="text-gray-900">
                      {profile.medical_conditions || 'None reported'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {isEditing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      icon={<X className="w-4 h-4" />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      icon={<Save className="w-4 h-4" />}
                      loading={submitting}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
