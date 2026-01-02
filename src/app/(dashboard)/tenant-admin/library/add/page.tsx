'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { ArrowLeft, BookPlus } from 'lucide-react';
import api from '@/lib/api';

export default function AddBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    total_copies: 1,
    shelf_location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_copies' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Book title is required');
      return;
    }
    if (!formData.author.trim()) {
      setError('Author name is required');
      return;
    }
    if (!formData.isbn.trim()) {
      setError('ISBN is required');
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    if (formData.total_copies < 1) {
      setError('Total copies must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.post('/library/books/', formData);
      
      setSuccess('Book added successfully!');
      setTimeout(() => {
        router.push('/tenant-admin/library');
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to add book:', err);
      setError(err.response?.data?.detail || err.response?.data?.isbn?.[0] || 'Failed to add book');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Add New Book"
    >
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
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
              <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
              <p className="text-gray-600">Enter book details to add to library</p>
            </div>
          </div>

          <Card>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter book title"
                      required
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Enter author name"
                      required
                    />
                  </div>

                  {/* ISBN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="978-0-123456-78-9"
                      required
                    />
                  </div>

                  {/* Publisher */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher
                    </label>
                    <Input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                      placeholder="Enter publisher name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Literature">Literature</option>
                      <option value="Biography">Biography</option>
                      <option value="Reference">Reference</option>
                      <option value="Children">Children</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Total Copies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Copies <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="total_copies"
                      value={formData.total_copies}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  {/* Shelf Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shelf Location
                    </label>
                    <Input
                      type="text"
                      name="shelf_location"
                      value={formData.shelf_location}
                      onChange={handleChange}
                      placeholder="e.g., A-12, B-05"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    icon={<BookPlus className="w-4 h-4" />}
                    disabled={loading}
                  >
                    {loading ? 'Adding Book...' : 'Add Book'}
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
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
