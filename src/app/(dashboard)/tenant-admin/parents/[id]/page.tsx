'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { parentService } from '@/services/parentService';
import { studentService } from '@/services/studentService';
import { Parent } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Briefcase, UserPlus, X, Users } from 'lucide-react';

export default function ParentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [parent, setParent] = useState<Parent | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadParentData();
  }, [id]);

  useEffect(() => {
    // Filter students based on search
    if (studentSearch) {
      const filtered = allStudents.filter((student: any) =>
        `${student.user.first_name} ${student.user.last_name}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.admission_number?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.class_name?.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(allStudents);
    }
  }, [studentSearch, allStudents]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      const [parentData, childrenData] = await Promise.all([
        parentService.getById(id),
        parentService.getParentChildren(id),
      ]);
      setParent(parentData);
      setChildren(childrenData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load parent');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForLinking = async () => {
    try {
      const students = await studentService.getAll();
      // Filter out already linked students
      const linkedStudentIds = children.map((c) => c.id);
      const availableStudents = students.filter((s: any) => !linkedStudentIds.includes(s.id));
      setAllStudents(availableStudents);
      setFilteredStudents(availableStudents);
      setStudentSearch('');
      setShowLinkModal(true);
    } catch (err: any) {
      alert('Failed to load students');
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    try {
      setLinking(true);
      await parentService.linkStudentToParent({
        student_id: selectedStudent,
        parent_id: id,
        is_primary: isPrimary,
      });
      setShowLinkModal(false);
      setSelectedStudent('');
      setStudentSearch('');
      setIsPrimary(false);
      await loadParentData();
      alert('Student linked successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to link student');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkStudent = async (linkId: string) => {
    if (!confirm('Are you sure you want to unlink this student?')) return;

    try {
      await parentService.unlinkStudentFromParent(linkId);
      await loadParentData();
      alert('Student unlinked successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unlink student');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this parent?')) return;

    try {
      await parentService.delete(id);
      router.push('/tenant-admin/parents');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete parent');
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Parent Details"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (error || !parent) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Parent Details"
      >
        <Alert type="error">{error || 'Parent not found'}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Parent Details"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Back to Parents
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => router.push(`/tenant-admin/parents/${parent.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <Badge variant={parent.user.is_active ? 'success' : 'danger'}>
                {parent.user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {parent.user.first_name} {parent.user.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{parent.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{parent.user.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Relation</dt>
                <dd className="mt-1 text-sm text-gray-900">{parent.relation || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Occupation
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{parent.occupation || 'N/A'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{parent.address || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(parent.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(parent.updated_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Linked Children */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Linked Children</h3>
              </div>
              <Button
                variant="primary"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={loadStudentsForLinking}
              >
                Link Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No students linked yet. Click &quot;Link Student&quot; to add.
              </p>
            ) : (
              <div className="space-y-3">
                {children.map((child: any) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {child.first_name} {child.last_name}
                        </p>
                        {child.is_primary && (
                          <Badge variant="info">Primary</Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>Admission: {child.admission_number}</span>
                        <span className="mx-2">•</span>
                        <span>Class: {child.class_name}-{child.section}</span>
                        <span className="mx-2">•</span>
                        <span>Roll: {child.roll_number}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tenant-admin/students/${child.id}`)}
                      >
                        View
                      </Button>
                      <button
                        onClick={() => handleUnlinkStudent(child.link_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Unlink"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link Student Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Link Student</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Student
                </label>
                <input
                  type="text"
                  placeholder="Search by name, admission number, or class..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size={Math.min(filteredStudents.length + 1, 8)}
                >
                  <option value="">-- Select a student --</option>
                  {filteredStudents.length === 0 && studentSearch ? (
                    <option disabled>No students found</option>
                  ) : (
                    filteredStudents.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.user.first_name} {student.user.last_name} - {student.admission_number} (Class {student.class_name}-{student.section})
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Showing {filteredStudents.length} of {allStudents.length} students
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">
                  Mark as primary guardian
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleLinkStudent}
                loading={linking}
              >
                Link Student
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
