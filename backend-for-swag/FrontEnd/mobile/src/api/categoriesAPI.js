import apiClient from './client';

const categoriesAPI = {
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load categories' };
    }
  },

  getEventTypes: async () => {
    try {
      const response = await apiClient.get('/event-types');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load event types' };
    }
  },
};

export default categoriesAPI;
