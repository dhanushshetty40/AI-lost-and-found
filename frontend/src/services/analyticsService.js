import api from './api';

const analyticsService = {
  // Fetch dataset for interactive Campus Map
  getCampusMapData: async (params = {}) => {
    const response = await api.get('/analytics/campus-map', { params });
    return response.data;
  },

  // Fetch comprehensive intelligence overview with filters
  getAnalyticsOverview: async (params = {}) => {
    const response = await api.get('/analytics/overview', { params });
    return response.data;
  },

  // Fetch heatmap density points
  getHeatmapData: async () => {
    const response = await api.get('/analytics/heatmap');
    return response.data;
  },

  // Fetch registered campus locations catalog
  getCampusLocations: async () => {
    const response = await api.get('/analytics/locations');
    return response.data;
  }
};

export default analyticsService;
