import apiClient from './client';

const customerAPI = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/customers/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load profile' };
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/customers/me', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  },

  getInterests: async () => {
    try {
      const response = await apiClient.get('/customers/me/interests');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load interests' };
    }
  },

  setInterests: async (itemIds) => {
    try {
      const response = await apiClient.post('/customers/me/interests', { itemIds });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to save interests' };
    }
  },

  getFollowing: async () => {
    try {
      const response = await apiClient.get('/customers/me/following');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load following' };
    }
  },

  followVendor: async (vendorId) => {
    try {
      const response = await apiClient.post(`/customers/me/following/${vendorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to follow vendor' };
    }
  },

  unfollowVendor: async (vendorId) => {
    try {
      const response = await apiClient.delete(`/customers/me/following/${vendorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to unfollow vendor' };
    }
  },

  getSavedPosts: async () => {
    try {
      const response = await apiClient.get('/customers/me/saved-posts');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load saved posts' };
    }
  },
};

export default customerAPI;
