'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { studentNav } from '@/config/navigation';
import { 
  BookOpen, Calendar, User, Clock, BookMarked, GraduationCap, 
  ChevronDown, ChevronRight, FileText, Video, Link as LinkIcon,
  CheckCircle, Circle, ArrowLeft
} from 'lucide-react';
import courseAPI from '@/lib/courseAPI';
import { Course, CourseModule } from '@/types';

export default function StudentCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseData, modulesData] = await Promise.all([
        courseAPI.getCourse(courseId),
        courseAPI.getModules(courseId)
      ]);
      setCourse(courseData);
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
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

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-red-600" />;
      case 'document':
        return <FileText size={16} className="text-blue-600" />;
      case 'link':
        return <LinkIcon size={16} className="text-green-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={studentNav}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout sidebarItems={studentNav}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Course not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={studentNav}>
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/student/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to My Courses</span>
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.course_name}</h1>
              <p className="text-gray-600 mt-1">{course.course_code}</p>
            </div>
            {course.is_published ? (
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Draft
              </span>
            )}
          </div>

          {course.description && (
            <p className="text-gray-700 mb-4">{course.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {course.school_class_details && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap size={18} />
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-medium text-gray-900">
                    {course.school_class_details.class_name}
                    {course.section && ` - ${course.section}`}
                  </p>
                </div>
              </div>
            )}

            {course.primary_teacher_details && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={18} />
                <div>
                  <p className="text-xs text-gray-500">Teacher</p>
                  <p className="font-medium text-gray-900">
                    {course.primary_teacher_details.user.first_name} {course.primary_teacher_details.user.last_name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={18} />
              <div>
                <p className="text-xs text-gray-500">Academic Year</p>
                <p className="font-medium text-gray-900">
                  {course.academic_year} - {getSemesterLabel(course.semester)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={18} />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">
                  {course.duration_weeks} weeks • {course.credits} credits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content - Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookMarked size={18} />
              <span>{modules.length} modules</span>
            </div>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-600">Your teacher hasn't added any modules to this course yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {(module as any).contents?.length || 0} items
                      </span>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown size={20} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Module Content */}
                  {expandedModules.has(module.id) && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {(module as any).contents && (module as any).contents.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {(module as any).contents.map((content: any) => (
                            <div
                              key={content.id}
                              className="px-6 py-4 hover:bg-white transition-colors cursor-pointer"
                              onClick={() => {
                                // TODO: Navigate to content detail page or open in modal
                                console.log('View content:', content.id);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {getContentIcon(content.content_type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">{content.title}</h4>
                                    {content.is_mandatory && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  {content.description && (
                                    <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                                  )}
                                  {content.estimated_duration && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {content.estimated_duration} minutes
                                    </p>
                                  )}
                                </div>
                                <Circle size={20} className="text-gray-300 mt-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                          No content available in this module
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Information Sections */}
        {(course.syllabus || course.course_objectives || course.prerequisites) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {course.syllabus && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Syllabus</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{course.syllabus}</p>
              </div>
            )}

            {course.course_objectives && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{course.course_objectives}</p>
              </div>
            )}

            {course.prerequisites && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Prerequisites</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{course.prerequisites}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
