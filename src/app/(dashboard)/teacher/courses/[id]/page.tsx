'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Calendar, Users, BookMarked, GraduationCap, Clock, FileText, Target, AlertCircle, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { teacherNav } from '@/config/navigation';
import courseAPI from '@/lib/courseAPI';
import { Course } from '@/types';

export default function TeacherCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'students'>('overview');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getCourse(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSemesterLabel = (semester: string) => {
    const labels: Record<string, string> = {
      '1': 'Semester 1',
      '2': 'Semester 2',
      'summer': 'Summer',
      'annual': 'Annual'
    };
    return labels[semester] || semester;
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={teacherNav} title="Course Details">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout sidebarItems={teacherNav} title="Course Details">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Course not found</h3>
            <p className="text-red-700 mb-4">The course you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.push('/teacher/courses')}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              ← Back to My Courses
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={teacherNav} title={course.course_name}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/teacher/courses')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.course_name}</h1>
              <p className="text-gray-600 mt-1">{course.course_code}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/teacher/courses/${courseId}/content`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Manage Content
          </button>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {course.school_class_details && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <GraduationCap size={16} />
                <span className="text-sm font-medium">Class</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{course.school_class_details.class_name}</p>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar size={16} />
              <span className="text-sm font-medium">Academic Year</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{course.academic_year}</p>
            <p className="text-sm text-gray-600">{getSemesterLabel(course.semester)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <BookMarked size={16} />
              <span className="text-sm font-medium">Modules</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{course.total_modules || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users size={16} />
              <span className="text-sm font-medium">Students</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{course.enrolled_students_count || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'modules'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Modules ({course.total_modules || 0})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Students ({course.enrolled_students_count || 0})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {course.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {course.course_objectives && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={18} className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Course Objectives</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{course.course_objectives}</p>
                    </div>
                  )}

                  {course.prerequisites && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={18} className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Prerequisites</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{course.prerequisites}</p>
                    </div>
                  )}
                </div>

                {course.syllabus && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={18} className="text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Syllabus</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{course.syllabus}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Credits</p>
                    <p className="text-lg font-semibold text-gray-900">{course.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{course.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      course.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modules Tab */}
            {activeTab === 'modules' && (
              <div className="space-y-4">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                              {module.module_number || index + 1}
                            </span>
                            <h4 className="text-lg font-semibold text-gray-900">{module.title}</h4>
                          </div>
                          {module.description && (
                            <p className="text-gray-600 ml-11">{module.description}</p>
                          )}
                          {module.contents && module.contents.length > 0 && (
                            <div className="ml-11 mt-3 text-sm text-gray-600">
                              <p>{module.contents.length} content item(s)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookMarked size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No modules added yet</p>
                    <button
                      onClick={() => router.push(`/teacher/courses/${courseId}/content`)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add modules →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <p className="text-gray-600 text-center py-12">
                  Student roster management coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
