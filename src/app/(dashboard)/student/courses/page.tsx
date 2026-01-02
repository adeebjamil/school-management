'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { studentNav } from '@/config/navigation';
import { BookOpen, Calendar, User, Clock, BookMarked, GraduationCap } from 'lucide-react';
import courseAPI from '@/lib/courseAPI';
import { Course } from '@/types';

export default function StudentCoursesPage() {
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
    <DashboardLayout sidebarItems={studentNav}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Courses you are enrolled in</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses enrolled</h3>
            <p className="text-gray-600">You haven not been enrolled in any courses yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/student/courses/${course.id}`)}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.course_name}
                      </h3>
                      <p className="text-sm text-gray-600">{course.course_code}</p>
                    </div>
                    {course.is_published && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  {course.school_class_details && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap size={16} />
                      <span>
                        {course.school_class_details.class_name}
                        {course.section && ` - Section ${course.section}`}
                      </span>
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
                    <span>{course.duration_weeks} weeks - {course.credits} credits</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <BookMarked size={16} />
                    <span>{course.total_modules || 0} modules</span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                    View Course Content
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
