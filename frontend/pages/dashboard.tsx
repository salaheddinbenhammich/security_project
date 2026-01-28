import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { incidentAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

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
  resolution?: string;
}

export default function Dashboard() {
  const { isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'SOFTWARE',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchIncidents();
  }, [isAuthenticated]);

  const fetchIncidents = async () => {
    try {
      const response = hasRole('ROLE_TECHNICIAN') || hasRole('ROLE_ADMIN')
        ? await incidentAPI.getAllIncidents()
        : await incidentAPI.getMyIncidents();
      setIncidents(response.data);
    } catch (error) {
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await incidentAPI.createIncident(formData);
      toast.success('Incident created successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'SOFTWARE',
      });
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to create incident');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      OPEN: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-200 text-red-900',
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      CRITICAL: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-green-500',
    };
    return colors[priority] || 'bg-gray-500';
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {hasRole('ROLE_TECHNICIAN') || hasRole('ROLE_ADMIN')
              ? 'All Incidents'
              : 'My Incidents'}
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-2 transform hover:scale-105"
          >
            <FiPlus />
            <span>New Incident</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">TOTAL</h3>
            <p className="text-3xl font-bold text-gray-800">{incidents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">OPEN</h3>
            <p className="text-3xl font-bold text-red-600">
              {incidents.filter((i) => i.status === 'OPEN').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">IN PROGRESS</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {incidents.filter((i) => i.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">RESOLVED</h3>
            <p className="text-3xl font-bold text-green-600">
              {incidents.filter((i) => i.status === 'RESOLVED').length}
            </p>
          </div>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No incidents found.</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(
                          incident.priority
                        )}`}
                      ></div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {incident.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{incident.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {incident.status.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {incident.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                        {incident.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Created by: {incident.createdBy?.fullName}</p>
                      {incident.assignedTo && (
                        <p>Assigned to: {incident.assignedTo.fullName}</p>
                      )}
                      <p>Created: {new Date(incident.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Create New Incident</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description of the incident"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="NETWORK">Network</option>
                    <option value="DATABASE">Database</option>
                    <option value="SECURITY">Security</option>
                    <option value="ACCESS">Access</option>
                    <option value="EMAIL">Email</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
