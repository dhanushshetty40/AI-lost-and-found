import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getAdminUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async toggleUserStatus(userId) {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  async getUserDashboardStats() {
    const response = await api.get('/users/dashboard-stats');
    return response.data;
  }
};

export default authService;
