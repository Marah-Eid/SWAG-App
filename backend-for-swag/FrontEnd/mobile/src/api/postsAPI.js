import apiClient from './client';

const postsAPI = {
  getPosts: async (params = {}) => {
    try {
      const response = await apiClient.get('/posts', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load posts' };
    }
  },

  getPostById: async (id) => {
    try {
      const response = await apiClient.get(`/posts/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load post' };
    }
  },

  createPost: async (data) => {
    try {
      const response = await apiClient.post('/posts', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create post' };
    }
  },

  updatePost: async (id, data) => {
    try {
      const response = await apiClient.put(`/posts/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update post' };
    }
  },

  deletePost: async (id) => {
    try {
      const response = await apiClient.delete(`/posts/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete post' };
    }
  },

  toggleLike: async (postId) => {
    try {
      const response = await apiClient.post(`/posts/${postId}/like`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to toggle like' };
    }
  },

  toggleSave: async (postId) => {
    try {
      const response = await apiClient.post(`/posts/${postId}/save`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to toggle save' };
    }
  },

  getComments: async (postId) => {
    try {
      const response = await apiClient.get(`/posts/${postId}/comments`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load comments' };
    }
  },

  addComment: async (postId, commentText) => {
    try {
      const response = await apiClient.post(`/posts/${postId}/comments`, { commentText });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add comment' };
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      const response = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete comment' };
    }
  },

  getMyLikes: async () => {
    try {
      const response = await apiClient.get('/posts/me/likes');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load liked posts' };
    }
  },

  getMyComments: async () => {
    try {
      const response = await apiClient.get('/posts/me/comments');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load comments' };
    }
  },

  addReview: async (vendorId, rating, feedback) => {
    try {
      const response = await apiClient.post('/reviews', { vendorId, rating, feedback });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to submit review' };
    }
  },
};

export default postsAPI;
