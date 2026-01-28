import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => api.post('/auth/register', data),
};

// Incident API
export const incidentAPI = {
  getPublicIncidents: () => api.get('/incidents/public'),
  
  createIncident: (data: {
    title: string;
    description: string;
    priority: string;
    category: string;
  }) => api.post('/incidents', data),
  
  getAllIncidents: () => api.get('/incidents'),
  
  getMyIncidents: () => api.get('/incidents/my'),
  
  getAssignedIncidents: () => api.get('/incidents/assigned'),
  
  getIncidentById: (id: number) => api.get(`/incidents/${id}`),
  
  updateStatus: (id: number, status: string, resolution?: string) =>
    api.put(`/incidents/${id}/status`, null, {
      params: { status, resolution },
    }),
  
  assignIncident: (id: number, technicianId: number) =>
    api.put(`/incidents/${id}/assign`, null, {
      params: { technicianId },
    }),
  
  deleteIncident: (id: number) => api.delete(`/incidents/${id}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  
  getTechnicians: () => api.get('/admin/technicians'),
  
  updateUserRoles: (id: number, roles: string[]) =>
    api.put(`/admin/users/${id}/roles`, roles),
  
  toggleUserStatus: (id: number) =>
    api.put(`/admin/users/${id}/toggle-status`),
  
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};

export default api;
