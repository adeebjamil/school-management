'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { ArrowLeft, BookOpen, Save, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publication_year: number | null;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState<Book>({
    id: '',
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: null,
    category: '',
    total_copies: 1,
    available_copies: 1,
    shelf_location: '',
  });

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/library/books/${bookId}/`);
      setFormData(response.data);
      setLoadingData(false);
    } catch (err: any) {
      console.error('Failed to load book:', err);
      setError('Failed to load book details');
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author) {
      setError('Title and Author are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put(`/library/books/${bookId}/`, formData);
      
      setSuccess('Book updated successfully!');
      setTimeout(() => {
        router.push('/tenant-admin/library');
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to update book:', err);
      setError(err.response?.data?.error || 'Failed to update book');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      
      await api.delete(`/library/books/${bookId}/`);
      
      setSuccess('Book deleted successfully!');
      setTimeout(() => {
        router.push('/tenant-admin/library');
      }, 1000);
      
    } catch (err: any) {
      console.error('Failed to delete book:', err);
      setError(err.response?.data?.error || 'Failed to delete book. It may be issued to students.');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav} tenantName="Sunshine High School" title="Edit Book">
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
      title="Edit Book"
    >
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Book</h2>
                <p className="text-gray-600">Update book information</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              Delete Book
            </Button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <Card className="border-red-200 bg-red-50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Confirm Delete</h3>
                <p className="text-red-700 mb-4">
                  Are you sure you want to delete "{formData.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Book Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter book title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Enter author name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="Enter ISBN"
                      required
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      title="ISBN cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">ISBN cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      placeholder="Enter publisher name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      value={formData.publication_year || ''}
                      onChange={(e) => setFormData({ ...formData, publication_year: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Enter year"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Science">Science</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="History">History</option>
                      <option value="Biography">Biography</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Literature">Literature</option>
                      <option value="Reference">Reference</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Copies <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.total_copies}
                      onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) })}
                      placeholder="Enter total copies"
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Copies
                    </label>
                    <input
                      type="number"
                      value={formData.available_copies}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      title="Available copies are automatically managed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically managed by the system</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shelf Location
                    </label>
                    <input
                      type="text"
                      value={formData.shelf_location}
                      onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                      placeholder="e.g., A-12, Section B Shelf 3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="submit"
                icon={<Save className="w-4 h-4" />}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Book'}
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
