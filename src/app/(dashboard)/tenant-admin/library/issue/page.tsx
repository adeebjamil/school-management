'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { ArrowLeft, BookOpen, User, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available_copies: number;
}

interface Student {
  id: string;
  admission_number: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  class_name: string;
  section: string;
}

export default function IssueBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [book, setBook] = useState<Book | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    book_id: bookId || '',
    user_id: '',
    duration_weeks: 1,
    remarks: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Load book details if book_id is provided
      if (bookId) {
        const bookResponse = await api.get(`/library/books/${bookId}/`);
        setBook(bookResponse.data);
        setFormData(prev => ({ ...prev, book_id: bookId }));
      }
      
      // Load students list
      const studentsResponse = await api.get('/students/');
      const studentsData = Array.isArray(studentsResponse.data) 
        ? studentsResponse.data 
        : (Array.isArray(studentsResponse.data.results) ? studentsResponse.data.results : []);
      setStudents(studentsData);
      
      setLoadingData(false);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.book_id) {
      setError('Please select a book');
      return;
    }
    if (!formData.user_id) {
      setError('Please select a student');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.post('/library/issues/issue_book/', formData);
      
      setSuccess('Book issued successfully!');
      setTimeout(() => {
        router.push('/tenant-admin/library');
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to issue book:', err);
      setError(err.response?.data?.error || 'Failed to issue book');
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.user.first_name} ${student.user.last_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.admission_number.toLowerCase().includes(searchLower) ||
      `${student.class_name} ${student.section}`.toLowerCase().includes(searchLower)
    );
  });

  const getIssueDate = () => new Date().toLocaleDateString();
  const getDueDate = () => {
    const today = new Date();
    const dueDate = new Date(today.getTime() + (formData.duration_weeks * 7 * 24 * 60 * 60 * 1000));
    return dueDate.toLocaleDateString();
  };

  if (loadingData) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav} tenantName="Sunshine High School" title="Issue Book">
        <div className="flex items-center justify-center h-full">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Issue Book"
    >
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Issue Book to Student</h2>
              <p className="text-gray-600">Select student and issue duration</p>
            </div>
          </div>

          {/* Book Information */}
          {book && (
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">ISBN: <span className="font-mono">{book.isbn}</span></span>
                      <span className="text-green-600 font-medium">
                        Available: {book.available_copies} copies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Student Selection */}
            <Card>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, admission number, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  
                  <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No students found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <label
                            key={student.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                              formData.user_id === student.user.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="student"
                              value={student.user.id}
                              checked={formData.user_id === student.user.id}
                              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <User className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {student.user.first_name} {student.user.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Admission: {student.admission_number} | Class: {student.class_name} {student.section}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Issue Duration */}
            <Card>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Issue Duration <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { weeks: 1, days: 7, label: '7 Days (1 Week)' },
                    { weeks: 2, days: 14, label: '14 Days (2 Weeks)' },
                    { weeks: 3, days: 21, label: '21 Days (3 Weeks)' },
                    { weeks: 4, days: 30, label: '30 Days (4 Weeks)' },
                  ].map((option) => (
                    <label
                      key={option.weeks}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.duration_weeks === option.weeks
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={option.weeks}
                        checked={formData.duration_weeks === option.weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="font-bold text-lg text-gray-900">{option.days}</p>
                        <p className="text-xs text-gray-600 mt-1">Days</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* Date Summary */}
            <Card className="bg-gray-50">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Issue Summary</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Issue Date</p>
                    <p className="font-medium text-gray-900">{getIssueDate()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Due Date</p>
                    <p className="font-medium text-gray-900">{getDueDate()}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Note:</span> Late fine of ₹1 per day will be charged after the due date.
                  </p>
                </div>
              </div>
            </Card>

            {/* Remarks */}
            <Card>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                icon={<BookOpen className="w-4 h-4" />}
                disabled={loading || !formData.user_id}
              >
                {loading ? 'Issuing...' : 'Issue Book'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
