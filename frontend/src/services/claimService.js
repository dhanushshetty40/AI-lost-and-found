import api from './api';

export const claimService = {
  // File new ownership claim
  createClaim: async (claimData) => {
    const response = await api.post('/claims', claimData);
    return response.data;
  },

  // Upload proof of ownership image/document
  uploadClaimProof: async (claimId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/claims/${claimId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // List claims (filed or received)
  getClaims: async (mode = 'filed', status = null) => {
    const params = { mode };
    if (status) params.status = status;
    const response = await api.get('/claims', { params });
    return response.data;
  },

  // Get single claim detail
  getClaimById: async (claimId) => {
    const response = await api.get(`/claims/${claimId}`);
    return response.data;
  },

  // Approve or Reject claim
  verifyClaim: async (claimId, action, ownerNotes = '') => {
    const response = await api.post(`/claims/${claimId}/verify`, {
      action,
      owner_notes: ownerNotes
    });
    return response.data;
  },

  // Confirm item exchange completed & boost reputation
  completeClaimExchange: async (claimId) => {
    const response = await api.post(`/claims/${claimId}/complete`);
    return response.data;
  }
};

export default claimService;
