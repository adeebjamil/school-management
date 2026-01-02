'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import examService, { Exam } from '@/services/examService';
import { studentService } from '@/services/studentService';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Alert } from '@/components/ui/Alert';
import { Download, FileText, CheckCircle, XCircle, Users, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';

interface Student {
  id: string;
  full_name: string;
  roll_number: string;
  class_name: string;
  section: string;
  admit_card_generated: boolean;
}

export default function AdmitCardsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (examId) {
      loadData();
    }
  }, [examId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const examData = await examService.getById(examId);
      setExam(examData);

      const studentsData = await studentService.getAll();
      const classStudents = studentsData.filter(
        (s: any) => s.class_name === examData.class_name && s.section === examData.section
      );
      setStudents(classStudents.map((s: any) => ({
        ...s,
        admit_card_generated: false, // This should come from backend
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleGenerateAdmitCards = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    try {
      setGenerating(true);
      // API call to generate admit cards
      // await examService.generateAdmitCards(examId, selectedStudents);
      
      // Simulate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Admit cards generated for ${selectedStudents.length} students`);
      setSelectedStudents([]);
      loadData();
    } catch (error) {
      console.error('Failed to generate admit cards:', error);
      alert('Failed to generate admit cards');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAll = () => {
    alert('Downloading all admit cards...');
  };

  const handlePrintAll = () => {
    window.print();
  };

  const stats = {
    total: students.length,
    generated: students.filter(s => s.admit_card_generated).length,
    pending: students.filter(s => !s.admit_card_generated).length,
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="School Management"
        title="Admit Cards"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="School Management"
        title="Admit Cards"
      >
        <Alert>
          <p>Exam not found</p>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="School Management"
      title="Admit Cards"
    >
      <div className="space-y-6">
        <div className="flex justify-end items-center">
          <Button variant="secondary" onClick={() => router.push(`/tenant-admin/exams/${examId}`)}>
            Back to Exam
          </Button>
        </div>

        {/* Exam Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Exam Name</p>
                <p className="font-semibold">{exam.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="font-semibold">{exam.class_name} - {exam.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{new Date(exam.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-semibold">{new Date(exam.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Generated</p>
                  <div className="text-2xl font-bold text-green-600">{stats.generated}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                </div>
                <XCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Bulk Actions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedStudents.length} student(s) selected
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleGenerateAdmitCards}
                  disabled={selectedStudents.length === 0 || generating}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Selected'}
                </Button>
                <Button variant="secondary" onClick={handleDownloadAll}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button variant="secondary" onClick={handlePrintAll}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Students</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Select All</span>
              </label>
            </div>
            <div className="overflow-x-auto">
              <Table
                columns={[
                  {
                    key: 'select',
                    label: 'Select',
                  },
                  { key: 'roll_number', label: 'Roll No' },
                  { key: 'student_name', label: 'Student Name' },
                  { key: 'class', label: 'Class' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' },
                ]}
                data={students.map(student => ({
                  select: (
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  ),
                  roll_number: student.roll_number,
                  student_name: student.full_name,
                  class: `${student.class_name} - ${student.section}`,
                  status: student.admit_card_generated ? (
                    <Badge variant="success">Generated</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  ),
                  actions: (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        className="p-1 text-xs"
                        title="Download"
                        disabled={!student.admit_card_generated}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        className="p-1 text-xs"
                        title="Preview"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  ),
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
