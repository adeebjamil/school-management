'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import courseAPI from '@/lib/courseAPI';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Save, X, 
  ChevronDown, ChevronRight, FileText, Video, 
  Link as LinkIcon, FileQuestion, Check
} from 'lucide-react';

interface Course {
  id: string;
  course_name: string;
  course_code: string;
}

interface Content {
  id: string;
  title: string;
  content_type: 'lesson' | 'assignment' | 'quiz' | 'resource' | 'video' | 'reading' | 'lab';
  order: number;
  url?: string;
  description?: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  contents: Content[];
}

export default function CourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  // Module form state
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    order: 1,
    module_number: 1
  });

  // Content form state
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentModuleId, setContentModuleId] = useState<string>('');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentFormData, setContentFormData] = useState<{
    title: string;
    content_type: 'lesson' | 'assignment' | 'quiz' | 'resource' | 'video' | 'reading' | 'lab';
    url: string;
    description: string;
    order: number;
  }>({
    title: '',
    content_type: 'lesson',
    url: '',
    description: '',
    order: 1
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, modulesData] = await Promise.all([
        courseAPI.getCourse(courseId),
        courseAPI.getModules(courseId)
      ]);
      setCourse(courseData);
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (error) {
      console.error('Error fetching course data:', error);
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

  // Module handlers
  const handleAddModule = () => {
    setEditingModule(null);
    setModuleFormData({
      title: '',
      description: '',
      order: modules.length + 1,
      module_number: modules.length + 1
    });
    setShowModuleForm(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleFormData({
      title: module.title,
      description: module.description || '',
      order: module.order,
      module_number: (module as any).module_number || module.order
    });
    setShowModuleForm(true);
  };

  const handleSaveModule = async () => {
    try {
      if (editingModule) {
        await courseAPI.updateModule(courseId, editingModule.id, moduleFormData);
      } else {
        await courseAPI.createModule(courseId, moduleFormData);
      }
      await fetchCourseData();
      setShowModuleForm(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its content?')) {
      return;
    }
    try {
      await courseAPI.deleteModule(courseId, moduleId);
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  // Content handlers
  const handleAddContent = (moduleId: string) => {
    setContentModuleId(moduleId);
    setEditingContent(null);
    const module = modules.find(m => m.id === moduleId);
    setContentFormData({
      title: '',
      content_type: 'lesson',
      url: '',
      description: '',
      order: (module?.contents?.length || 0) + 1
    });
    setShowContentForm(true);
  };

  const handleEditContent = (moduleId: string, content: Content) => {
    setContentModuleId(moduleId);
    setEditingContent(content);
    setContentFormData({
      title: content.title,
      content_type: content.content_type,
      url: content.url || '',
      description: content.description || '',
      order: content.order
    });
    setShowContentForm(true);
  };

  const handleSaveContent = async () => {
    try {
      if (editingContent) {
        await courseAPI.updateContent(courseId, contentModuleId, editingContent.id, contentFormData);
      } else {
        await courseAPI.createContent(courseId, contentModuleId, contentFormData);
      }
      await fetchCourseData();
      setShowContentForm(false);
      setEditingContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    }
  };

  const handleDeleteContent = async (moduleId: string, contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }
    try {
      await courseAPI.deleteContent(courseId, moduleId, contentId);
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={20} className="text-red-500" />;
      case 'lesson':
      case 'reading':
        return <FileText size={20} className="text-blue-500" />;
      case 'resource':
        return <LinkIcon size={20} className="text-green-500" />;
      case 'quiz':
      case 'assignment':
      case 'lab':
        return <FileQuestion size={20} className="text-purple-500" />;
      default:
        return <FileQuestion size={20} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={tenantAdminNav}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/tenant-admin/courses')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <ArrowLeft size={20} />
              <span>Back to Courses</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Course Content</h1>
            <p className="text-gray-600 mt-1">{course?.course_name} ({course?.course_code})</p>
          </div>
          <button
            onClick={handleAddModule}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Module
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">No modules yet</p>
              <button
                onClick={handleAddModule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Module
              </button>
            </div>
          ) : (
            modules.map((module, index) => (
              <div key={module.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Module Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(module.contents || []).length} content items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddContent(module.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Add Content"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={() => handleEditModule(module)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Module"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Module Content */}
                {expandedModules.has(module.id) && (
                  <div className="p-4 bg-gray-50">
                    {((module as any).contents || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-2">No content yet</p>
                        <button
                          onClick={() => handleAddContent(module.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Add Content
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {((module as any).contents || []).map((content: Content, contentIndex: number) => (
                          <div
                            key={content.id}
                            className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {getContentIcon(content.content_type)}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {contentIndex + 1}. {content.title}
                                </p>
                                {content.description && (
                                  <p className="text-sm text-gray-600">{content.description}</p>
                                )}
                                {content.url && (
                                  <p className="text-xs text-gray-500 mt-1">{content.url}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditContent(module.id, content)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteContent(module.id, content.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Module Form Modal */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h2>
                <button
                  onClick={() => setShowModuleForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Number *
                  </label>
                  <input
                    type="number"
                    value={moduleFormData.module_number}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, module_number: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    placeholder="Module number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of this module"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={moduleFormData.order}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModuleForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModule}
                  disabled={!moduleFormData.title}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {editingModule ? 'Update' : 'Create'} Module
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Form Modal */}
        {showContentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingContent ? 'Edit Content' : 'Add New Content'}
                </h2>
                <button
                  onClick={() => setShowContentForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Title *
                  </label>
                  <input
                    type="text"
                    value={contentFormData.title}
                    onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Variables and Data Types"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type *
                  </label>
                  <select
                    value={contentFormData.content_type}
                    onChange={(e) => setContentFormData({ ...contentFormData, content_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lesson">Lesson</option>
                    <option value="video">Video</option>
                    <option value="resource">Resource</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="reading">Reading Material</option>
                    <option value="lab">Lab/Exercise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL/Link
                  </label>
                  <input
                    type="text"
                    value={contentFormData.url}
                    onChange={(e) => setContentFormData({ ...contentFormData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={contentFormData.description}
                    onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of this content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={contentFormData.order}
                    onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowContentForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContent}
                  disabled={!contentFormData.title}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {editingContent ? 'Update' : 'Create'} Content
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
