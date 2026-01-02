'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import examService, { Exam, ExamSubject } from '@/services/examService';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    exam_type: '',
    class_name: '',
    section: '',
    start_date: '',
    end_date: '',
  });
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const data = await examService.getById(examId);
      setFormData({
        name: data.name,
        exam_type: data.exam_type,
        class_name: data.class_name,
        section: data.section,
        start_date: data.start_date,
        end_date: data.end_date,
      });
      setSubjects(data.subjects || []);
    } catch (err: any) {
      console.error('Failed to load exam:', err);
      setError('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, {
      subject_name: '',
      subject_code: '',
      exam_date: '',
      max_marks: 0,
      passing_marks: 0,
      duration_minutes: 0,
    }]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: keyof ExamSubject, value: string | number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.exam_type || !formData.class_name || !formData.section) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await examService.update(examId, {
        ...formData,
        exam_type: formData.exam_type as 'midterm' | 'final' | 'unit_test' | 'quarterly' | 'annual',
      });
      alert('Exam updated successfully!');
      router.push(`/tenant-admin/exams/${examId}`);
    } catch (err: any) {
      console.error('Failed to update exam:', err);
      setError(err.response?.data?.error || 'Failed to update exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Edit Exam"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Exam</h1>
            <p className="text-gray-600 mt-1">Update exam information</p>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Exam Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., First Terminal Exam 2025" 
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="exam_type">Exam Type *</Label>
                    <Select 
                      id="exam_type" 
                      value={formData.exam_type}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, exam_type: e.target.value })} 
                      required
                    >
                      <option value="">Select type</option>
                      <option value="midterm">Midterm</option>
                      <option value="final">Final</option>
                      <option value="unit_test">Unit Test</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class_name">Class *</Label>
                    <Input 
                      id="class_name" 
                      placeholder="e.g., 10" 
                      value={formData.class_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, class_name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="section">Section *</Label>
                    <Input 
                      id="section" 
                      placeholder="e.g., A" 
                      value={formData.section}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, section: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input 
                      id="start_date" 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start_date: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input 
                      id="end_date" 
                      type="date" 
                      value={formData.end_date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, end_date: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Subjects</h3>
                  <Button type="button" variant="primary" onClick={handleAddSubject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
                <div className="space-y-4">
                  {subjects.map((subject, index) => (
                    <Card key={subject.id || index} className="border border-gray-200">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Subject {index + 1}</h4>
                          {subjects.length > 1 && (
                            <Button 
                              type="button" 
                              variant="danger" 
                              onClick={() => handleRemoveSubject(index)} 
                              className="text-xs p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Subject Name *</Label>
                            <Input 
                              placeholder="e.g., Mathematics" 
                              value={subject.subject_name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubjectChange(index, 'subject_name', e.target.value)} 
                              required 
                            />
                          </div>
                          <div>
                            <Label>Subject Code *</Label>
                            <Input 
                              placeholder="e.g., MATH101" 
                              value={subject.subject_code}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubjectChange(index, 'subject_code', e.target.value)} 
                              required 
                            />
                          </div>
                          <div>
                            <Label>Exam Date *</Label>
                            <Input 
                              type="date" 
                              value={subject.exam_date}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubjectChange(index, 'exam_date', e.target.value)} 
                              required 
                            />
                          </div>
                          <div>
                            <Label>Max Marks *</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="100" 
                              value={subject.max_marks || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubjectChange(index, 'max_marks', parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </div>
                          <div>
                            <Label>Passing Marks *</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="40" 
                              value={subject.passing_marks || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubjectChange(index, 'passing_marks', parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </div>
                          <div>
                            <Label>Duration (minutes) *</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="180" 
                              value={subject.duration_minutes || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSubjectChange(index, 'duration_minutes', parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Exam'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
