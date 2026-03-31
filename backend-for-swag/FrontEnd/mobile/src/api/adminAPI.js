import apiClient from './client';

const adminAPI = {
  getPendingVendors: async () => {
    try {
      const response = await apiClient.get('/admin/vendors/pending');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load pending vendors' };
    }
  },

  getAllVendors: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/vendors', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load vendors' };
    }
  },

  getVendorById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/vendors/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load vendor' };
    }
  },

  approveVendor: async (id) => {
    try {
      const response = await apiClient.put(`/admin/vendors/${id}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to approve vendor' };
    }
  },

  rejectVendor: async (id, reason = '') => {
    try {
      const response = await apiClient.put(`/admin/vendors/${id}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to reject vendor' };
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load stats' };
    }
  },
};

export default adminAPI;
