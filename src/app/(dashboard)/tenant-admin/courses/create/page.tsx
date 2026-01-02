'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import courseAPI from '@/lib/courseAPI';
import { Course, CourseModule, CourseContent, Teacher, SchoolClass } from '@/types';
import api from '@/lib/api';

export default function CreateEditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const isEditing = !!courseId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    description: '',
    school_class: '',
    section: '',
    credits: 0,
    duration_weeks: 16,
    academic_year: '',
    semester: '1' as '1' | '2' | 'summer' | 'annual',
    primary_teacher: '',
    additional_teachers: [] as string[],
    syllabus: '',
    course_objectives: '',
    prerequisites: '',
    is_active: true,
    is_published: false,
  });

  const [modules, setModules] = useState<Partial<CourseModule>[]>([]);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    if (isEditing) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        api.get('/classes/'),
        api.get('/teachers/'),
      ]);
      setClasses(classesRes.data.results || classesRes.data);
      setTeachers(teachersRes.data.results || teachersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const course = await courseAPI.getCourse(courseId);
      setFormData({
        course_code: course.course_code,
        course_name: course.course_name,
        description: course.description || '',
        school_class: course.school_class || '',
        section: course.section || '',
        credits: course.credits,
        duration_weeks: course.duration_weeks,
        academic_year: course.academic_year,
        semester: course.semester,
        primary_teacher: course.primary_teacher || '',
        additional_teachers: course.additional_teachers || [],
        syllabus: course.syllabus || '',
        course_objectives: course.course_objectives || '',
        prerequisites: course.prerequisites || '',
        is_active: course.is_active,
        is_published: course.is_published,
      });
      setModules(course.modules || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const courseData = {
        ...formData,
        credits: Number(formData.credits),
        duration_weeks: Number(formData.duration_weeks),
      };

      if (isEditing) {
        await courseAPI.updateCourse(courseId, courseData);
        alert('Course updated successfully!');
      } else {
        const newCourse = await courseAPI.createCourse(courseData);
        alert('Course created successfully!');
        router.push(`/tenant-admin/courses/${newCourse.id}`);
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save course. Please check all fields and try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        module_number: modules.length + 1,
        title: '',
        description: '',
        learning_objectives: '',
        duration_hours: 0,
        order: modules.length,
        is_active: true,
      },
    ]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, field: string, value: any) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], [field]: value };
    setModules(updated);
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav} title={isEditing ? 'Edit Course' : 'Create Course'}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={tenantAdminNav} title={isEditing ? 'Edit Course' : 'Create Course'}>
      <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Update course information and modules' : 'Fill in the details to create a new course'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., CS101"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be unique for the academic year and semester
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the course"
              />
            </div>
          </div>
        </div>

        {/* Class & Teacher Assignment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Class & Teacher Assignment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={formData.school_class}
                onChange={(e) => setFormData({ ...formData, school_class: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., A, B, C"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Teacher
              </label>
              <select
                value={formData.primary_teacher}
                onChange={(e) => setFormData({ ...formData, primary_teacher: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Primary Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.first_name} {teacher.user.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2024-2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="summer">Summer</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits
              </label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 16 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Required knowledge or courses"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Objectives
              </label>
              <textarea
                value={formData.course_objectives}
                onChange={(e) => setFormData({ ...formData, course_objectives: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Learning outcomes and objectives"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Syllabus
              </label>
              <textarea
                value={formData.syllabus}
                onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed course syllabus"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active Course</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Publish Course (make visible to students)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </DashboardLayout>
  );
}
