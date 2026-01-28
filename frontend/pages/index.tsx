import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { incidentAPI } from '@/services/api';
import { FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

interface Incident {
  id: number;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await incidentAPI.getPublicIncidents();
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">IT Incident Management System</h1>
              <p className="text-xl mb-8">
                Track and manage IT incidents efficiently
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition">
              <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">
                {incidents.filter((i) => i.status === 'OPEN').length}
              </h3>
              <p className="text-gray-600">Open Incidents</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition">
              <FiClock className="text-yellow-500 text-5xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">
                {incidents.filter((i) => i.status === 'IN_PROGRESS').length}
              </h3>
              <p className="text-gray-600">In Progress</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition">
              <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">
                {incidents.filter((i) => i.status === 'RESOLVED').length}
              </h3>
              <p className="text-gray-600">Resolved</p>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Recent Incidents</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading incidents...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No incidents reported yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            incident.status
                          )}`}
                        >
                          {incident.status.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
                            incident.priority
                          )}`}
                        >
                          {incident.priority}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {incident.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Created: {new Date(incident.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
