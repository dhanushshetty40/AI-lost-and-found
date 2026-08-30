import api from './api';

const experimentService = {
  // Fetch documented AI/ML benchmarks across Text, Image, and Multimodal models
  getBenchmarks: async () => {
    const response = await api.get('/experiments/benchmark');
    return response.data;
  },

  // Run live side-by-side similarity evaluation simulator
  runLiveComparison: async (queryText, candidateText, category = "Electronics & Gadgets") => {
    const response = await api.post('/experiments/compare', {
      query_text: queryText,
      candidate_text: candidateText,
      category
    });
    return response.data;
  }
};

export default experimentService;
