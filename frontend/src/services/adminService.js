import api from './api';

export const adminService = {
  // Fetch executive analytics overview
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Fetch system health check
  getHealth: async () => {
    const response = await api.get('/admin/health');
    return response.data;
  },

  // List all registered users
  getUsers: async (search = '', role = '') => {
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Toggle user role (ADMIN <-> USER)
  updateUserRole: async (userId, newRole) => {
    const response = await api.put(`/admin/users/${userId}/role`, null, {
      params: { new_role: newRole }
    });
    return response.data;
  },

  // Toggle user active status (Enable / Disable)
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // List all item reports for moderation
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  // Admin force-delete item report
  deleteReport: async (reportId) => {
    const response = await api.delete(`/admin/reports/${reportId}`);
    return response.data;
  },

  // Fetch audit logs
  getAuditLogs: async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
  }
};

export default adminService;
