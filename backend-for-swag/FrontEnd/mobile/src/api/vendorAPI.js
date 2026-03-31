import apiClient from './client';

const vendorAPI = {
  getVendors: async (params = {}) => {
    try {
      const response = await apiClient.get('/vendors', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load vendors' };
    }
  },

  getVendorById: async (id) => {
    try {
      const response = await apiClient.get(`/vendors/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load vendor' };
    }
  },

  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/vendors/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load profile' };
    }
  },

  updateMyProfile: async (data) => {
    try {
      const response = await apiClient.put('/vendors/me', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  },

  updateProfileDetails: async (data) => {
    try {
      const response = await apiClient.put('/vendors/me/profile-details', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update details' };
    }
  },

  getMyCategories: async () => {
    try {
      const response = await apiClient.get('/vendors/me/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load categories' };
    }
  },

  addCategory: async (itemId) => {
    try {
      const response = await apiClient.post('/vendors/me/categories', { itemId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add category' };
    }
  },

  removeCategory: async (itemId) => {
    try {
      const response = await apiClient.delete(`/vendors/me/categories/${itemId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to remove category' };
    }
  },

  getVendorReviews: async (id) => {
    try {
      const response = await apiClient.get(`/vendors/${id}/reviews`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load reviews' };
    }
  },

  getVendorFollowers: async (id) => {
    try {
      const response = await apiClient.get(`/vendors/${id}/followers`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load followers' };
    }
  },

  getMyFollowing: async () => {
    try {
      const response = await apiClient.get('/vendors/me/following');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load following' };
    }
  },

  followVendor: async (vendorId) => {
    try {
      const response = await apiClient.post(`/vendors/me/following/${vendorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to follow vendor' };
    }
  },

  unfollowVendor: async (vendorId) => {
    try {
      const response = await apiClient.delete(`/vendors/me/following/${vendorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to unfollow vendor' };
    }
  },

  getMyCollections: async () => {
    try {
      const response = await apiClient.get('/vendors/me/collections');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load collections' };
    }
  },

  createCollection: async (name) => {
    try {
      const response = await apiClient.post('/vendors/me/collections', { name });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create collection' };
    }
  },

  deleteCollection: async (collectionId) => {
    try {
      const response = await apiClient.delete(`/vendors/me/collections/${collectionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete collection' };
    }
  },
};

export default vendorAPI;
