import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, incidentAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiAlertCircle, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  active: boolean;
}

interface Incident {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdBy: any;
  assignedTo: any;
  createdAt: string;
}

export default function Admin() {
  const { isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'incidents'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !hasRole('ROLE_ADMIN')) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [usersRes, incidentsRes, techRes] = await Promise.all([
        adminAPI.getAllUsers(),
        incidentAPI.getAllIncidents(),
        adminAPI.getTechnicians(),
      ]);
      setUsers(usersRes.data);
      setIncidents(incidentsRes.data);
      setTechnicians(techRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success('User status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const updateStatus = async (incidentId: number, status: string) => {
    try {
      await incidentAPI.updateStatus(incidentId, status);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const assignIncident = async () => {
    if (!selectedIncident || !selectedTechnician) return;
    try {
      await incidentAPI.assignIncident(selectedIncident, selectedTechnician);
      toast.success('Incident assigned');
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign incident');
    }
  };

  const deleteIncident = async (incidentId: number) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    try {
      await incidentAPI.deleteIncident(incidentId);
      toast.success('Incident deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete incident');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <FiUsers className="text-4xl mb-2" />
            <h3 className="text-3xl font-bold">{users.length}</h3>
            <p>Total Users</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <FiCheck className="text-4xl mb-2" />
            <h3 className="text-3xl font-bold">{users.filter((u) => u.active).length}</h3>
            <p>Active Users</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <FiAlertCircle className="text-4xl mb-2" />
            <h3 className="text-3xl font-bold">{incidents.length}</h3>
            <p>Total Incidents</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <FiUsers className="text-4xl mb-2" />
            <h3 className="text-3xl font-bold">{technicians.length}</h3>
            <p>Technicians</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'incidents'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Incidents Management
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title={user.active ? 'Deactivate' : 'Activate'}
                        >
                          {user.active ? <FiX /> : <FiCheck />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {incident.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{incident.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {incident.status.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                        {incident.priority}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {incident.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Created by: {incident.createdBy?.fullName}</p>
                      {incident.assignedTo && (
                        <p>Assigned to: {incident.assignedTo.fullName}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedIncident(incident.id);
                        setShowAssignModal(true);
                      }}
                      className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Assign
                    </button>
                    <select
                      value={incident.status}
                      onChange={(e) => updateStatus(incident.id, e.target.value)}
                      className="block w-full px-4 py-2 border rounded text-sm"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <button
                      onClick={() => deleteIncident(incident.id)}
                      className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Assign Technician</h2>
            <select
              value={selectedTechnician || ''}
              onChange={(e) => setSelectedTechnician(Number(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg mb-4"
            >
              <option value="">Select Technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.fullName} - {tech.email}
                </option>
              ))}
            </select>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={assignIncident}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
