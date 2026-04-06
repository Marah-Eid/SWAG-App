import apiClient from './client';

const searchAPI = {
  search: async (q, params = {}) => {
    try {
      const response = await apiClient.get('/search', { params: { q, ...params } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Search failed' };
    }
  },
};

export default searchAPI;
