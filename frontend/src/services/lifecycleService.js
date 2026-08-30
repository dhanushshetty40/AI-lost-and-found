import api from './api';

const lifecycleService = {
  // Get generated QR code and printable tag data
  getReportQRCode: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/qr`);
    return response.data;
  },

  // Get complete 7-stage item lifecycle history
  getReportLifecycle: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/lifecycle`);
    return response.data;
  },

  // Confirm physical item handover and award reputation
  confirmHandover: async (reportId, payload = {}) => {
    const response = await api.post(`/reports/${reportId}/handover-confirm`, payload);
    return response.data;
  }
};

export default lifecycleService;
