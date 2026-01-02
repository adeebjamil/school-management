'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import classService, { SchoolClass, Teacher } from '@/services/classService';
import { studentService } from '@/services/studentService';
import { Student } from '@/types';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Search,
  User,
  X
} from 'lucide-react';

export default function TenantAdminClassesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [formData, setFormData] = useState({
    grade: '',
    section: '',
    className: '',
    classTeacherId: '',
    academicYear: '2024-2025',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch classes and teachers from API
      const [classesData, teachersData] = await Promise.all([
        classService.getAllClasses(),
        classService.getAllTeachers()
      ]);
      
      setClasses(classesData);
      setTeachers(teachersData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setFormData({
      grade: '',
      section: '',
      className: '',
      classTeacherId: '',
      academicYear: '2024-2025',
    });
    setTeacherSearch('');
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleOpenEditModal = (classItem: SchoolClass) => {
    setEditingClass(classItem);
    setFormData({
      grade: classItem.grade,
      section: classItem.section,
      className: classItem.className,
      classTeacherId: classItem.classTeacherId || '',
      academicYear: classItem.academicYear,
    });
    // Set teacher search to selected teacher's name
    if (classItem.classTeacherDetails) {
      setTeacherSearch(`${classItem.classTeacherDetails.firstName} ${classItem.classTeacherDetails.lastName}`);
    } else {
      setTeacherSearch('');
    }
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleShowStudentSelection = async () => {
    if (!formData.grade || !formData.section) {
      setError('Please select Grade and Section first');
      return;
    }

    try {
      setLoadingStudents(true);
      const allStudents = await studentService.getAll();
      
      // Filter students by grade and section
      const matchingStudents = allStudents.filter(student => {
        const studentGrade = student.class_name?.toString();
        const studentSection = student.section?.toUpperCase();
        return studentGrade === formData.grade && studentSection === formData.section.toUpperCase();
      });

      setAvailableStudents(matchingStudents);
      setShowStudentModal(true);
      setLoadingStudents(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setLoadingStudents(false);
      setError('Failed to load students');
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      // Validate
      if (!formData.grade || !formData.section) {
        setError('Grade and Section are required');
        return;
      }

      // Check for duplicate section when creating new class
      if (!editingClass) {
        const duplicate = classes.find(
          c => c.grade === formData.grade && 
          c.section === formData.section && 
          c.academicYear === formData.academicYear
        );
        if (duplicate) {
          setError(`Class with Grade ${formData.grade}, Section ${formData.section} already exists for ${formData.academicYear}`);
          return;
        }
      }

      // Auto-generate className if not provided
      const className = formData.className || `Grade ${formData.grade}-${formData.section}`;

      if (editingClass) {
        // Update existing class
        const updatedClass = await classService.updateClass(editingClass.id, {
          grade: formData.grade,
          section: formData.section,
          className: className,
          academicYear: formData.academicYear,
          classTeacherId: formData.classTeacherId || undefined,
        });

        // Update students if any selected
        if (selectedStudents.length > 0) {
          console.log('Updating students with class ID:', updatedClass.id);
          await Promise.all(
            selectedStudents.map(async (studentId) => {
              console.log('Updating student:', studentId, 'with school_class:', updatedClass.id);
              return studentService.update(studentId, {
                class_name: formData.grade,
                section: formData.section,
                school_class: updatedClass.id,
              });
            })
          );
        }

        setClasses(classes.map(c => c.id === editingClass.id ? updatedClass : c));
        setSuccess(`Class updated successfully! ${selectedStudents.length} student(s) assigned.`);
        
        // Reload data to get fresh student counts
        await loadData();
      } else {
        // Create new class
        const newClass = await classService.createClass({
          grade: formData.grade,
          section: formData.section,
          className: className,
          academicYear: formData.academicYear,
          classTeacherId: formData.classTeacherId || undefined,
        });

        // Assign students to the new class
        if (selectedStudents.length > 0) {
          console.log('Assigning students to new class ID:', newClass.id);
          await Promise.all(
            selectedStudents.map(async (studentId) => {
              console.log('Assigning student:', studentId, 'to school_class:', newClass.id);
              return studentService.update(studentId, {
                class_name: formData.grade,
                section: formData.section,
                school_class: newClass.id,
              });
            })
          );
        }

        setClasses([...classes, newClass]);
        setSuccess(`Class created successfully! ${selectedStudents.length} student(s) assigned.`);
        
        // Reload data to get fresh student counts
        await loadData();
      }

      setShowAddModal(false);
      setShowStudentModal(false);
      setSelectedStudents([]);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save class');
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      await classService.deleteClass(classId);
      setClasses(classes.filter(c => c.id !== classId));
      setSuccess('Class deleted successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to delete class';
      setError(errorMsg);
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.grade.includes(searchQuery) ||
    classItem.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.classTeacherDetails?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.classTeacherDetails?.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalClasses: classes.length,
    withTeachers: classes.filter(c => c.classTeacherId).length,
    withoutTeachers: classes.filter(c => !c.classTeacherId).length,
    totalStudents: classes.reduce((sum, c) => sum + c.studentCount, 0),
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Classes"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
            <p className="text-gray-600 mt-1">Manage classes and assign class teachers</p>
          </div>
          <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Class
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Classes</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalClasses}</p>
                    </div>
                    <BookOpen className="w-12 h-12 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">With Teachers</p>
                      <p className="text-3xl font-bold text-green-600">{stats.withTeachers}</p>
                    </div>
                    <User className="w-12 h-12 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Without Teachers</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.withoutTeachers}</p>
                    </div>
                    <User className="w-12 h-12 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
                    </div>
                    <Users className="w-12 h-12 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search classes by name, grade, section, or teacher..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Classes List */}
            <div className="space-y-3">
              {filteredClasses.map((classItem) => (
                <div 
                  key={classItem.id}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Section - Class Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{classItem.className}</h3>
                          <div className="flex items-center gap-4 mt-1 flex-wrap">
                            <span className="text-sm text-gray-600">
                              Grade: <span className="font-medium text-gray-900">{classItem.grade}-{classItem.section}</span>
                            </span>
                            <span className="text-sm text-gray-600">
                              Year: <span className="font-medium text-gray-900">{classItem.academicYear}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Section - Teacher Info */}
                      <div className="hidden md:flex items-center gap-2 flex-1 min-w-0 px-4 border-l border-gray-200">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {classItem.classTeacherDetails ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {classItem.classTeacherDetails.firstName} {classItem.classTeacherDetails.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{classItem.classTeacherDetails.email}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-yellow-600">No teacher assigned</p>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Students & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <Users className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Students</p>
                            <p className="text-lg font-bold text-blue-600">{classItem.studentCount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(classItem)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit class"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(classItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete class"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile View - Teacher and Students */}
                    <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {classItem.classTeacherDetails ? (
                          <span className="text-sm text-gray-700 truncate">
                            {classItem.classTeacherDetails.firstName} {classItem.classTeacherDetails.lastName}
                          </span>
                        ) : (
                          <span className="text-sm text-yellow-600">No teacher</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">{classItem.studentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClasses.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No classes found</p>
                  <Button onClick={handleOpenAddModal} className="mt-4">
                    Create First Class
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade *
                      </label>
                      <Input
                        placeholder="e.g., 8, 9, 10"
                        value={formData.grade}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setFormData({ ...formData, grade: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section *
                      </label>
                      <Input
                        placeholder="e.g., A, B, C"
                        value={formData.section}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setFormData({ ...formData, section: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name (Optional)
                    </label>
                    <Input
                      placeholder="Auto-generated if empty"
                      value={formData.className}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({ ...formData, className: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to auto-generate as "Grade {formData.grade}-{formData.section}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Teacher
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Search teacher by name or email..."
                        value={teacherSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeacherSearch(e.target.value)}
                        className="mb-2"
                      />
                      <select
                        value={formData.classTeacherId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          setFormData({ ...formData, classTeacherId: e.target.value });
                          const selectedTeacher = teachers.find(t => t.id === e.target.value);
                          if (selectedTeacher) {
                            setTeacherSearch(`${selectedTeacher.firstName} ${selectedTeacher.lastName}`);
                          } else {
                            setTeacherSearch('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-48 overflow-y-auto"
                        size={6}
                      >
                        <option value="">No teacher assigned</option>
                        {teachers
                          .filter(teacher => {
                            if (!teacherSearch) return true;
                            const searchLower = teacherSearch.toLowerCase();
                            return (
                              teacher.firstName.toLowerCase().includes(searchLower) ||
                              teacher.lastName.toLowerCase().includes(searchLower) ||
                              teacher.email.toLowerCase().includes(searchLower)
                            );
                          })
                          .map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName} ({teacher.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This teacher will be the counselor for all students in this class
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <Input
                      placeholder="e.g., 2024-2025"
                      value={formData.academicYear}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({ ...formData, academicYear: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleShowStudentSelection}
                      variant="outline"
                      className="w-full"
                      disabled={!formData.grade || !formData.section}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Select Students to Assign ({selectedStudents.length} selected)
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowAddModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1"
                      >
                        {editingClass ? 'Update Class' : 'Create Class'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Selection Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Select Students for Grade {formData.grade}-{formData.section}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {availableStudents.length} students found
                  </p>
                </div>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {loadingStudents ? (
                  <Loading />
                ) : (
                  <div className="space-y-4">
                    {availableStudents.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={selectedStudents.length === availableStudents.length}
                            onChange={handleSelectAllStudents}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="select-all" className="font-medium text-gray-900 cursor-pointer">
                            Select All ({availableStudents.length})
                          </label>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {availableStudents.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleToggleStudent(student.id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleToggleStudent(student.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {student.user.first_name} {student.user.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Admission: {student.admission_number} | Roll: {student.roll_number || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {student.user.email}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No students found for Grade {formData.grade}-{formData.section}</p>
                        <p className="text-sm mt-2">Students must have matching grade and section to appear here.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="p-6 border-t flex gap-3">
                <Button
                  onClick={() => setShowStudentModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowStudentModal(false)}
                  className="flex-1"
                >
                  Done ({selectedStudents.length} selected)
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
