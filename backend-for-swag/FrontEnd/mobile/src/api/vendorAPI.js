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

  getEventCoordinators: async (limit = 10) => {
    try {
      const response = await apiClient.get('/vendors/event-coordinators', { params: { limit } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load event coordinators' };
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

  getSavedPosts: async () => {
    try {
      const response = await apiClient.get('/vendors/me/saved-posts');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load saved posts' };
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

  getVendorFollowingById: async (id) => {
    try {
      const response = await apiClient.get(`/vendors/${id}/following`);
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

  createCollection: async ({ name, description, postIds = [] }) => {
    try {
      const response = await apiClient.post('/vendors/me/collections', {
        name,
        description,
        postIds,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create collection' };
    }
  },

  updateCollection: async (collectionId, { name, description, postIds }) => {
    try {
      const body = {};
      if (name !== undefined) body.name = name;
      if (description !== undefined) body.description = description;
      if (postIds !== undefined) body.postIds = postIds;
      const response = await apiClient.put(`/vendors/me/collections/${collectionId}`, body);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update collection' };
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

  getVendorCollections: async (vendorId) => {
    try {
      const response = await apiClient.get(`/vendors/${vendorId}/collections`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load collections' };
    }
  },
};

export default vendorAPI;
