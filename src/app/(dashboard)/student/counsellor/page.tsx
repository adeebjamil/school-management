'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { studentNav } from '@/config/navigation';
import api from '@/lib/api';
import { 
  UserCheck, 
  Mail, 
  Phone, 
  Building, 
  Award,
  Calendar,
  MessageCircle,
  Clock
} from 'lucide-react';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
  department?: string;
  qualification?: string;
}

interface ClassInfo {
  id: string;
  className: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacher?: Teacher;
}

export default function StudentCounsellorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [counsellor, setCounsellor] = useState<Teacher | null>(null);

  useEffect(() => {
    loadCounsellorInfo();
  }, []);

  const loadCounsellorInfo = async () => {
    try {
      setLoading(true);
      setError('');

      // Get student profile to find their class
      const profileResponse = await api.get('/students/profile/');
      const studentData = profileResponse.data;

      if (studentData.school_class) {
        // Get class details with teacher information
        const classResponse = await api.get(`/classes/${studentData.school_class}/`);
        const classData = classResponse.data;

        setClassInfo({
          id: classData.id,
          className: classData.class_name,
          grade: classData.grade,
          section: classData.section,
          academicYear: classData.academic_year,
        });

        if (classData.class_teacher_details) {
          const teacher = classData.class_teacher_details;
          setCounsellor({
            id: teacher.id,
            firstName: teacher.first_name || teacher.firstName,
            lastName: teacher.last_name || teacher.lastName,
            email: teacher.email,
            phoneNumber: teacher.phone_number || teacher.phoneNumber,
            employeeId: teacher.employee_id || teacher.employeeId,
            department: teacher.department,
            qualification: teacher.qualification,
          });
        }
      } else {
        setError('You are not assigned to any class yet.');
      }
    } catch (err: any) {
      console.error('Error loading counsellor info:', err);
      setError(err.response?.data?.error || 'Failed to load counsellor information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="My Counsellor"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Counsellor</h1>
          <p className="text-gray-600 mt-2">Connect with your class teacher and counsellor</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading counsellor information...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-red-600">
              <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </CardContent>
          </Card>
        ) : counsellor ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Counsellor Profile Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {counsellor.firstName} {counsellor.lastName}
                      </h2>
                      <p className="text-gray-600">Class Teacher & Counsellor</p>
                      {classInfo && (
                        <p className="text-sm text-blue-600 mt-1">
                          {classInfo.className} • {classInfo.academicYear}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{counsellor.email}</p>
                        </div>
                      </div>
                      
                      {counsellor.phoneNumber && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">{counsellor.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {counsellor.employeeId && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Award className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Employee ID</p>
                            <p className="font-medium text-gray-900">{counsellor.employeeId}</p>
                          </div>
                        </div>
                      )}
                      
                      {counsellor.department && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Building className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Department</p>
                            <p className="font-medium text-gray-900">{counsellor.department}</p>
                          </div>
                        </div>
                      )}
                      
                      {counsellor.qualification && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-2">
                          <Award className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Qualification</p>
                            <p className="font-medium text-gray-900">{counsellor.qualification}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Class Information */}
              {classInfo && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Your Class</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Class Name</p>
                      <p className="font-bold text-blue-900">{classInfo.className}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Grade</p>
                        <p className="font-medium text-gray-900">{classInfo.grade}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Section</p>
                        <p className="font-medium text-gray-900">{classInfo.section}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Academic Year</p>
                      <p className="font-medium text-gray-900">{classInfo.academicYear}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Counselling Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Counselling Support</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Academic Guidance</p>
                      <p className="text-sm text-gray-600">Get help with your studies and academic goals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Personal Support</p>
                      <p className="text-sm text-gray-600">Discuss any concerns or challenges</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Career Planning</p>
                      <p className="text-sm text-gray-600">Explore future career opportunities</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Your class teacher serves as your counsellor. 
                      Feel free to reach out for academic or personal guidance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-gray-500">
              <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No counsellor assigned to your class yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
