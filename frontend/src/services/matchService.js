import api from './api';

export const matchService = {
  // Fetch AI matches for current user or filtered
  getMatches: async (params = {}) => {
    const response = await api.get('/matches', { params });
    return response.data;
  },

  // Fetch single match side-by-side comparison payload
  getMatchById: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  // Trigger manual AI matching engine run
  runMatchingEngine: async (reportId = null) => {
    const params = reportId ? { report_id: reportId } : {};
    const response = await api.post('/matches/run', null, { params });
    return response.data;
  },

  // Confirm or reject match recommendation
  confirmMatchDecision: async (matchId, action) => {
    const response = await api.post(`/matches/${matchId}/confirm`, null, {
      params: { action }
    });
    return response.data;
  }
};

export default matchService;
