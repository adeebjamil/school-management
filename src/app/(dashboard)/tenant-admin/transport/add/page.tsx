'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Bus, ArrowLeft, Save } from 'lucide-react';
import api from '@/lib/api';

export default function AddTransportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stops, setStops] = useState<string[]>(['']);
  
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'bus',
    capacity: '',
    driver_name: '',
    driver_phone: '',
    driver_license: '',
    monthly_fee: '',
    status: 'active',
    start_point: '',
    end_point: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const addStop = () => {
    setStops([...stops, '']);
  };

  const removeStop = (index: number) => {
    if (stops.length > 1) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.vehicle_number || !formData.capacity || !formData.driver_name || !formData.monthly_fee) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload: any = {
        vehicle_number: formData.vehicle_number,
        vehicle_type: formData.vehicle_type,
        capacity: parseInt(formData.capacity),
        driver_name: formData.driver_name,
        driver_phone: formData.driver_phone,
        driver_license: formData.driver_license,
        monthly_fee: parseFloat(formData.monthly_fee),
        status: formData.status,
        route_data: {
          start_point: formData.start_point,
          end_point: formData.end_point,
          stops: stops.filter(stop => stop.trim() !== ''),
        },
      };

      await api.post('/transport/vehicles/', payload);
      
      setSuccess('Vehicle added successfully!');
      setTimeout(() => {
        router.push('/tenant-admin/transport');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to add vehicle:', err);
      setError(err.response?.data?.error || 'Failed to add vehicle');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={tenantAdminNav} tenantName="Sunshine High School" title="Add Vehicle">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transport
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
            <p className="text-sm text-gray-600">Register a new bus/van for transport service</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" className="mb-4">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-6">
            {/* Vehicle Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    placeholder="e.g., AP-09-XY-1234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                    <option value="mini_bus">Mini Bus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seating Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Route Details Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Point <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="start_point"
                      value={formData.start_point}
                      onChange={handleChange}
                      placeholder="e.g., School Main Gate"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Point <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="end_point"
                      value={formData.end_point}
                      onChange={handleChange}
                      placeholder="e.g., Last Stop Location"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stops (In Between Points)
                  </label>
                  <div className="space-y-2">
                    {stops.map((stop, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={stop}
                          onChange={(e) => handleStopChange(index, e.target.value)}
                          placeholder={`Stop ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                          disabled={stops.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addStop}
                    className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-300"
                  >
                    + Add Stop
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    Add all stops between start and end points in order
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Details Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleChange}
                    placeholder="e.g., Rajesh Kumar"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    name="driver_phone"
                    value={formData.driver_phone}
                    onChange={handleChange}
                    placeholder="e.g., 9876543210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver License Number
                  </label>
                  <input
                    type="text"
                    name="driver_license"
                    value={formData.driver_license}
                    onChange={handleChange}
                    placeholder="e.g., DL1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthly_fee"
                    value={formData.monthly_fee}
                    onChange={handleChange}
                    placeholder="e.g., 2500"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be the default monthly fee for all students assigned to this vehicle
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loading size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Vehicle
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
