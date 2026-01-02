'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { Bus, Plus, FileText, Search, MapPin, Users, AlertCircle, CheckCircle, Settings, UserPlus, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface VehicleRecord {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  route_number: string;
  route_name: string;
  status: 'active' | 'maintenance' | 'inactive';
  students_assigned: number;
  monthly_fee: number;
  route?: {
    id: string;
    route_number: string;
    route_name: string;
    stops: string[];
    pickup_time: string | null;
    drop_time: string | null;
  };
}

interface Assignment {
  id: string;
  user_id: string;
  user_name: string;
  user_type: 'student' | 'teacher';
  class_section?: string;
  pickup_point: string;
  monthly_fee: number;
  status: 'active' | 'pending' | 'inactive';
}

export default function TransportPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    route: '',
    status: '',
    vehicle_type: '',
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleRecord | null>(null);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenance: 0,
    totalStudents: 0,
    totalRoutes: 0,
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('student');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [routeStops, setRouteStops] = useState<string[]>([]);
  const [assignmentForm, setAssignmentForm] = useState({
    pickup_point: '',
    monthly_fee: '',
    effective_from: '',
  });

  useEffect(() => {
    loadVehicles();
    loadStats();
  }, [filters.route, filters.status, filters.vehicle_type]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      if (filters.route) params.route = filters.route;
      if (filters.status) params.status = filters.status;
      if (filters.vehicle_type) params.vehicle_type = filters.vehicle_type;
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.get('/transport/vehicles/', { params });
      // Handle both paginated and non-paginated responses
      const vehiclesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setVehicles(vehiclesData);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load vehicles:', err);
      setError(err.response?.data?.error || 'Failed to load transport records');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/transport/vehicles/stats/');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const loadAssignments = async (vehicleId: string) => {
    try {
      const response = await api.get(`/transport/vehicles/${vehicleId}/assignments/`);
      const assignmentsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setAssignments(assignmentsData);
    } catch (err: any) {
      console.error('Failed to load assignments:', err);
      setError('Failed to load assignments');
    }
  };

  const loadAvailableUsers = async (userType: string, search: string = '') => {
    try {
      const response = await api.get('/transport/assignments/available_users/', {
        params: { user_type: userType, search }
      });
      const usersData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setAvailableUsers(usersData);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };

  const handleViewAssignments = (vehicle: VehicleRecord) => {
    setSelectedVehicle(vehicle);
    loadAssignments(vehicle.id);
    setShowAssignments(true);
  };

  const handleAssignUser = (vehicle: VehicleRecord) => {
    setSelectedVehicle(vehicle);
    setSelectedUser(null);
    // Load route stops from vehicle
    loadRouteStops(vehicle.id);
    setAssignmentForm({
      pickup_point: '',
      monthly_fee: vehicle.monthly_fee.toString(),
      effective_from: new Date().toISOString().split('T')[0],
    });
    setShowAssignModal(true);
    loadAvailableUsers(selectedUserType);
  };

  const loadRouteStops = async (vehicleId: string) => {
    try {
      const response = await api.get(`/transport/vehicles/${vehicleId}/`);
      // Extract stops from route if available
      if (response.data.route && response.data.route.stops) {
        setRouteStops(response.data.route.stops);
      } else {
        setRouteStops([]);
      }
    } catch (err: any) {
      console.error('Failed to load route stops:', err);
      setRouteStops([]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedUser || !assignmentForm.pickup_point) {
      setError('Please select a user and pickup point');
      return;
    }

    if (!selectedVehicle?.route?.id) {
      setError('Vehicle must have a route assigned before you can assign users');
      return;
    }

    try {
      await api.post('/transport/assignments/', {
        vehicle_id: selectedVehicle.id,
        route_id: selectedVehicle.route.id,
        user_type: selectedUserType,
        user_id: selectedUser.id,
        pickup_point: assignmentForm.pickup_point,
        monthly_fee: parseFloat(assignmentForm.monthly_fee),
        effective_from: assignmentForm.effective_from,
      });
      
      setShowAssignModal(false);
      setSelectedUser(null);
      loadVehicles(); // Refresh vehicles
      loadStats(); // Refresh stats
    } catch (err: any) {
      console.error('Failed to assign transport:', err);
      setError(err.response?.data?.error || 'Failed to assign transport');
    }
  };

  const handleUserTypeChange = (type: string) => {
    setSelectedUserType(type);
    setUserSearchTerm('');
    loadAvailableUsers(type);
  };

  const handleUserSearch = (search: string) => {
    setUserSearchTerm(search);
    if (search.length >= 2) {
      loadAvailableUsers(selectedUserType, search);
    } else if (search.length === 0) {
      loadAvailableUsers(selectedUserType);
    }
  };

  const handleDeleteClick = (vehicle: VehicleRecord) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      await api.delete(`/transport/assignments/${assignmentId}/`);
      // Reload assignments for the current vehicle
      if (selectedVehicle) {
        loadAssignments(selectedVehicle.id);
      }
      loadStats(); // Refresh stats
      loadVehicles(); // Refresh vehicle list
    } catch (err: any) {
      console.error('Failed to remove assignment:', err);
      setError(err.response?.data?.error || 'Failed to remove assignment');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    try {
      await api.delete(`/transport/vehicles/${vehicleToDelete.id}/`);
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      loadVehicles(); // Reload the list
    } catch (err: any) {
      console.error('Failed to delete vehicle:', err);
      setError('Failed to delete vehicle. It may have active assignments.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.route_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Transport Management"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transport & Vehicles</h2>
              <p className="text-gray-600">Manage school buses, routes, and transport assignments</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/transport/reports')}
              >
                Reports
              </Button>
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/transport/add')}
              >
                Add Vehicle
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Vehicles</p>
                  <Bus className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalVehicles}</p>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.activeVehicles}</p>
              </div>
            </Card>
            <Card className="border-l-4 border-l-yellow-500 shadow-sm">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Maintenance</p>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.maintenance}</p>
              </div>
            </Card>
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Students</p>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </Card>
            <Card className="border-l-4 border-l-indigo-500 shadow-sm">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Routes</p>
                  <MapPin className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalRoutes}</p>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-sm">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by vehicle, driver, route..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                  <select
                    name="route"
                    value={filters.route}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Routes</option>
                    <option value="R1">R1 - Downtown</option>
                    <option value="R2">R2 - Suburb</option>
                    <option value="R3">R3 - Hill Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    name="vehicle_type"
                    value={filters.vehicle_type}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                    <option value="mini_bus">Mini Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicles Table */}
          <Card>
            <div className="p-0">
              {loading ? (
                <div className="p-8"><Loading /></div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No vehicles found matching your criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Vehicle Details</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Route</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Driver</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Capacity</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Bus className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">{vehicle.vehicle_number}</span>
                                <span className="text-xs text-gray-500">₹{vehicle.monthly_fee}/month</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-900 capitalize">{vehicle.vehicle_type}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{vehicle.route_number}</p>
                                <p className="text-xs text-gray-500">{vehicle.route_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm text-gray-900">{vehicle.driver_name}</p>
                              <p className="text-xs text-gray-500">{vehicle.driver_phone}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-900">{vehicle.students_assigned}/{vehicle.capacity}</span>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${(vehicle.students_assigned / vehicle.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(vehicle.status)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewAssignments(vehicle)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Assignments"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAssignUser(vehicle)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Assign User"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/tenant-admin/transport/edit/${vehicle.id}`)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit Vehicle"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(vehicle)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Vehicle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {filteredVehicles.length > 0 && (
              <div className="p-4 border-t border-gray-100 text-xs text-gray-500 text-center">
                Showing {filteredVehicles.length} vehicles in fleet
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Assign Transport Modal */}
      {showAssignModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Assign Transport</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedVehicle.vehicle_number} - {selectedVehicle.route_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="user_type" 
                        value="student" 
                        checked={selectedUserType === 'student'}
                        onChange={() => handleUserTypeChange('student')}
                        className="text-blue-600" 
                      />
                      <span className="text-sm">Student</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="user_type" 
                        value="teacher" 
                        checked={selectedUserType === 'teacher'}
                        onChange={() => handleUserTypeChange('teacher')}
                        className="text-blue-600" 
                      />
                      <span className="text-sm">Teacher</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search & Select User
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, ID, or class..."
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {availableUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {userSearchTerm ? 'No users found' : 'Start typing to search'}
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {availableUsers.map((user) => (
                          <div 
                            key={user.id} 
                            onClick={() => setSelectedUser(user)}
                            className={`p-3 hover:bg-gray-50 rounded-lg cursor-pointer flex justify-between items-center ${
                              selectedUser?.id === user.id ? 'bg-blue-50 border-2 border-blue-500' : ''
                            }`}
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">
                                {user.type === 'student' ? `Student ID: ${user.user_id} • Class ${user.class_section}` : `Teacher ID: ${user.user_id}`}
                              </p>
                            </div>
                            {selectedUser?.id === user.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Point <span className="text-red-500">*</span></label>
                  {routeStops.length === 0 ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      No stops available for this route
                    </div>
                  ) : (
                    <select 
                      value={assignmentForm.pickup_point}
                      onChange={(e) => setAssignmentForm({...assignmentForm, pickup_point: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select pickup point...</option>
                      {routeStops.map((stop, idx) => (
                        <option key={idx} value={stop}>{stop}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={assignmentForm.monthly_fee}
                    onChange={(e) => setAssignmentForm({...assignmentForm, monthly_fee: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective From</label>
                  <input
                    type="date"
                    value={assignmentForm.effective_from}
                    onChange={(e) => setAssignmentForm({...assignmentForm, effective_from: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Alert type="info">
                  The monthly fee will be automatically added to the student&apos;s/teacher&apos;s billing. They will receive a notification once the assignment is confirmed.
                </Alert>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAssignment}
                    disabled={!selectedUser || !assignmentForm.pickup_point}
                    className="flex-1"
                  >
                    Assign Transport
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Assignments View Modal */}
      {showAssignments && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Current Assignments</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedVehicle.vehicle_number} - {selectedVehicle.route_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignments(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Assigned</p>
                    <p className="text-2xl font-bold text-blue-700">{assignments.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-700">
                      {assignments.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {assignments.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">User</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Pickup Point</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Monthly Fee</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{assignment.user_name}</p>
                              <p className="text-xs text-gray-500">ID: {assignment.user_id}</p>
                              {assignment.class_section && (
                                <p className="text-xs text-gray-500">Class: {assignment.class_section}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={assignment.user_type === 'student' ? 'info' : 'warning'}>
                              {assignment.user_type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{assignment.pickup_point}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">₹{assignment.monthly_fee}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                assignment.status === 'active' ? 'success' :
                                assignment.status === 'pending' ? 'warning' : 'danger'
                              }
                            >
                              {assignment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setShowAssignments(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && vehicleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Vehicle</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete vehicle <strong>{vehicleToDelete.vehicle_number}</strong>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Driver: {vehicleToDelete.driver_name}
                </p>
                {vehicleToDelete.students_assigned > 0 && (
                  <Alert type="warning" className="mt-3">
                    This vehicle has {vehicleToDelete.students_assigned} active assignment(s). 
                    Please remove all assignments before deleting.
                  </Alert>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={vehicleToDelete.students_assigned > 0}
                >
                  Delete Vehicle
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
