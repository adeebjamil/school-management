'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { teacherNav } from '@/config/navigation';
import { Bus, MapPin, Clock, Users, Phone } from 'lucide-react';
import api from '@/lib/api';

interface TransportAssignment {
  id: string;
  vehicle_details: {
    id: string;
    vehicle_number: string;
    vehicle_type: string;
    capacity: number;
    driver_name: string;
    driver_phone: string;
  };
  route_details: {
    id: string;
    route_number: string;
    route_name: string;
    stops: string[];
    pickup_time: string | null;
    drop_time: string | null;
  };
  pickup_point: string;
  monthly_fee: number;
  status: string;
  effective_from: string;
}

export default function TeacherTransportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignment, setAssignment] = useState<TransportAssignment | null>(null);

  useEffect(() => {
    loadTransportData();
  }, []);

  const loadTransportData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/transport/assignments/my_transport/');
      setAssignment(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load transport data:', err);
      if (err.response?.status === 404) {
        // No assignment found
        setAssignment(null);
      } else {
        setError('Failed to load transport information');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={teacherNav}
        tenantName="Sunshine High School"
        title="Transport"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="Transport"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transport</h2>
          <p className="text-gray-600 mt-1">View your transport route and schedule</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {!assignment ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Transport Assignment
              </h3>
              <p className="text-gray-600">
                You don't have an active transport assignment yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Contact the administration office if you need transport services.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              My Transport Details
            </h3>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Bus className="w-10 h-10 text-blue-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {assignment.route_details.route_name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {assignment.route_details.route_number && `Route ${assignment.route_details.route_number} • `}
                        {assignment.vehicle_details.vehicle_number}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : assignment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timing */}
                  {(assignment.route_details.pickup_time || assignment.route_details.drop_time) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                      {assignment.route_details.pickup_time && (
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Pickup Time</p>
                            <p className="font-medium text-gray-900">{assignment.route_details.pickup_time}</p>
                          </div>
                        </div>
                      )}
                      {assignment.route_details.drop_time && (
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Drop Time</p>
                            <p className="font-medium text-gray-900">{assignment.route_details.drop_time}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pickup Point */}
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Your Pickup Point</p>
                      <p className="font-medium text-gray-900">{assignment.pickup_point}</p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Driver</p>
                        <p className="font-medium text-gray-900">{assignment.vehicle_details.driver_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium text-gray-900">{assignment.vehicle_details.driver_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Fee */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Fee</p>
                      <p className="text-2xl font-bold text-gray-900">₹{assignment.monthly_fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Effective From</p>
                      <p className="font-medium text-gray-900">
                        {new Date(assignment.effective_from).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Route Stops */}
                  {assignment.route_details.stops && assignment.route_details.stops.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Route Stops</p>
                      <div className="space-y-2">
                        {assignment.route_details.stops.map((stop, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              stop === assignment.pickup_point
                                ? 'bg-blue-50 border-2 border-blue-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                stop === assignment.pickup_point
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{stop}</p>
                              {stop === assignment.pickup_point && (
                                <p className="text-xs text-blue-600 font-medium">Your Stop</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vehicle Information</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium text-gray-900 capitalize">{assignment.vehicle_details.vehicle_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Capacity</p>
                        <p className="font-medium text-gray-900">{assignment.vehicle_details.capacity} seats</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
