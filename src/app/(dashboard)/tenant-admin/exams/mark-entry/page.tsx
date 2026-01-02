'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import examService, { Exam } from '@/services/examService';
import { studentService } from '@/services/studentService';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';

interface StudentMark {
  student_id: string;
  student_name: string;
  roll_number: string;
  marks_obtained: number | null;
  is_absent: boolean;
}

export default function MarkEntryPage() {
  const searchParams = useSearchParams();
  const examIdFromUrl = searchParams.get('exam');
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (examIdFromUrl && exams.length > 0) {
      setSelectedExam(examIdFromUrl);
    }
  }, [examIdFromUrl, exams]);

  const loadExams = async () => {
    try {
      const data = await examService.getAll();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const handleExamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExam(e.target.value);
    setSelectedSubject('');
    setMarks([]);
  };

  const handleSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setSuccess(false);
    const exam = exams.find(ex => ex.id === selectedExam);
    if (!exam) return;

    try {
      setLoading(true);
      const students = await studentService.getAll();
      const classStudents = students.filter((s: any) => 
        s.class_name === exam.class_name && s.section === exam.section
      );
      setMarks(classStudents.map((s: any) => ({
        student_id: s.id,
        student_name: s.full_name,
        roll_number: s.roll_number,
        marks_obtained: null,
        is_absent: false,
      })));
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedExam || !selectedSubject) return;

    const exam = exams.find(e => e.id === selectedExam);
    const subject = exam?.subjects.find(s => s.subject_code === selectedSubject);

    try {
      setSubmitting(true);
      setSuccess(false);
      await examService.submitMarks({
        exam_id: selectedExam,
        subject_code: selectedSubject,
        marks: marks.map(m => ({
          student_id: m.student_id,
          marks_obtained: m.marks_obtained,
          is_absent: m.is_absent,
        })),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit marks:', error);
      alert('Failed to submit marks. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const exam = exams.find(e => e.id === selectedExam);
  const subject = exam?.subjects.find(s => s.subject_code === selectedSubject);

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="School Management"
      title="Mark Entry"
    >
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <p className="text-green-800 font-medium">Marks submitted successfully!</p>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Exam and Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select id="exam" value={selectedExam} onChange={handleExamChange}>
                <option value="">Select exam</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.class_name} {exam.section}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select id="subject" value={selectedSubject} onChange={handleSubjectChange} disabled={!selectedExam}>
                <option value="">Select subject</option>
                {exam?.subjects.map(subject => (
                  <option key={subject.subject_code} value={subject.subject_code}>
                    {subject.subject_name} - Max: {subject.max_marks}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {marks.length > 0 && subject && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Student Marks</h3>
                <p className="text-sm text-gray-600 mt-1">Max Marks: {subject.max_marks} | Pass Marks: {subject.passing_marks}</p>
              </div>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Marks'}
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table
                columns={[
                  { key: 'roll_number', label: 'Roll No' },
                  { key: 'student_name', label: 'Student Name' },
                  { key: 'marks', label: 'Marks' },
                  { key: 'absent', label: 'Absent' },
                  { key: 'status', label: 'Status' },
                ]}
                data={marks.map((mark, idx) => ({
                  roll_number: mark.roll_number,
                  student_name: mark.student_name,
                  marks: (
                    <Input
                      type="number"
                      min="0"
                      max={subject.max_marks}
                      value={mark.marks_obtained ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newMarks = [...marks];
                        newMarks[idx].marks_obtained = e.target.value === '' ? null : parseFloat(e.target.value);
                        newMarks[idx].is_absent = false;
                        setMarks(newMarks);
                      }}
                      disabled={mark.is_absent}
                      className="w-24"
                    />
                  ),
                  absent: (
                    <Checkbox
                      checked={mark.is_absent}
                      onCheckedChange={(checked: boolean) => {
                        const newMarks = [...marks];
                        newMarks[idx].is_absent = checked;
                        if (checked) newMarks[idx].marks_obtained = null;
                        setMarks(newMarks);
                      }}
                    />
                  ),
                  status: mark.is_absent ? (
                    <Badge variant="default">Absent</Badge>
                  ) : mark.marks_obtained !== null && mark.marks_obtained >= subject.passing_marks ? (
                    <Badge variant="success">Pass</Badge>
                  ) : mark.marks_obtained !== null ? (
                    <Badge variant="danger">Fail</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  ),
                }))}
              />
            </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedExam && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Select an exam and subject to start entering marks</p>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
