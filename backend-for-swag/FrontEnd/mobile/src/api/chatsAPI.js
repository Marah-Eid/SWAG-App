import apiClient from './client';

const chatsAPI = {
  getConversations: async () => {
    try {
      const response = await apiClient.get('/chats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load chats' };
    }
  },

  startConversation: async (otherUserId, otherUserType) => {
    try {
      const response = await apiClient.post('/chats', { otherUserId, otherUserType });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to start conversation' };
    }
  },

  getMessages: async (conversationId, page = 1) => {
    try {
      const response = await apiClient.get(`/chats/${conversationId}/messages`, { params: { page } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load messages' };
    }
  },

  sendMessage: async (conversationId, data) => {
    try {
      const response = await apiClient.post(`/chats/${conversationId}/messages`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to send message' };
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await apiClient.get('/chats/search-users', { params: { query } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Search failed' };
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      const response = await apiClient.delete(`/chats/${conversationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete conversation' };
    }
  },

  markAsRead: async (conversationId) => {
    try {
      const response = await apiClient.put(`/chats/${conversationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to mark as read' };
    }
  },

  heartbeat: async () => {
    try {
      await apiClient.put('/auth/heartbeat');
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};

export default chatsAPI;
