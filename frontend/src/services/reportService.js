import api from './api';

export const reportService = {
  async getCategories() {
    const response = await api.get('/reports/categories');
    return response.data;
  },

  async getReports(params = {}) {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  async getReportById(id) {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  async createReport(reportData) {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  async updateReport(id, reportData) {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },

  async deleteReport(id) {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/reports/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default reportService;
