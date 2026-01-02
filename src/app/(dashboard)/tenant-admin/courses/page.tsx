'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Plus, Edit2, Trash2, Users, BookMarked, 
  Calendar, Clock, User, GraduationCap, CheckCircle, XCircle, FileText 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import courseAPI from '@/lib/courseAPI';
import { Course } from '@/types';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    academic_year: '',
    semester: '',
    is_published: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filter.academic_year) filterParams.academic_year = filter.academic_year;
      if (filter.semester) filterParams.semester = filter.semester;
      if (filter.is_published !== '') filterParams.is_published = filter.is_published === 'true';
      
      const data = await courseAPI.getCourses(filterParams);
      setCourses(data.results || data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await courseAPI.deleteCourse(courseId);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleAutoEnroll = async (courseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Enroll all students from the assigned class into this course?')) return;
    
    try {
      const result = await courseAPI.autoEnrollByClass(courseId);
      
      // Show detailed enrollment information
      let message = result.message || `Successfully enrolled ${result.enrolled_count} students!`;
      if (result.total_students === 0) {
        message = 'No students found in the assigned class/section.';
      } else if (result.already_enrolled > 0) {
        message += `\n\nDetails:\n- Newly enrolled: ${result.enrolled_count}\n- Already enrolled: ${result.already_enrolled}\n- Total students in class: ${result.total_students}`;
      }
      
      alert(message);
      fetchCourses();
    } catch (error: any) {
      console.error('Error enrolling students:', error);
      const errorMsg = error.response?.data?.error || 'Failed to enroll students';
      alert(errorMsg);
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

  return (
    <DashboardLayout sidebarItems={tenantAdminNav} title="Courses">
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Create and manage courses for students and teachers</p>
        </div>
        <button
          onClick={() => router.push('/tenant-admin/courses/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              placeholder="e.g., 2024-2025"
              value={filter.academic_year}
              onChange={(e) => setFilter({ ...filter, academic_year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={filter.semester}
              onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="summer">Summer</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter.is_published}
              onChange={(e) => setFilter({ ...filter, is_published: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({ academic_year: '', semester: '', is_published: '' })}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first course</p>
          <button
            onClick={() => router.push('/tenant-admin/courses/create')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-gray-600">{course.course_code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.is_published ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {course.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                )}
              </div>

              {/* Course Info */}
              <div className="p-6 space-y-3">
                {course.school_class_details && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap size={16} />
                    <span>{course.school_class_details.class_name}</span>
                  </div>
                )}
                
                {course.primary_teacher_details && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>
                      {course.primary_teacher_details.user.first_name} {course.primary_teacher_details.user.last_name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{course.academic_year} - {getSemesterLabel(course.semester)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{course.duration_weeks} weeks • {course.credits} credits</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-600">
                    <BookMarked size={16} />
                    <span>{course.total_modules} modules</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Users size={16} />
                    <span>{course.enrolled_students_count} students</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
                <button
                  onClick={(e) => handleAutoEnroll(course.id, e)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  title="Auto-enroll students from class"
                >
                  <Users size={16} />
                </button>
                <button
                  onClick={() => router.push(`/tenant-admin/courses/${course.id}/content`)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  title="Manage Course Content"
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => router.push(`/tenant-admin/courses/${course.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
