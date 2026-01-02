'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Users, BookMarked, GraduationCap, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { teacherNav } from '@/config/navigation';
import courseAPI from '@/lib/courseAPI';
import { Course } from '@/types';

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
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

  return (
    <DashboardLayout sidebarItems={teacherNav} title="My Courses">
      <div className="p-6 space-y-6">{/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Courses you're teaching this semester</p>
        </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses assigned</h3>
          <p className="text-gray-600">You haven't been assigned to any courses yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/teacher/courses/${course.id}`)}
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {course.course_name}
                </h3>
                <p className="text-sm text-gray-600">{course.course_code}</p>
                
                {course.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{course.description}</p>
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
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{course.academic_year} - {getSemesterLabel(course.semester)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{course.duration_weeks} weeks • {course.credits} credits</span>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <BookMarked size={16} />
                    <span>{course.total_modules} modules</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Users size={16} />
                    <span>{course.enrolled_students_count} students</span>
                  </div>
                </div>
              </div>

              {/* View Details Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View Course Details →
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
