import apiClient from './client';

const assistantAPI = {
  getConversations: async () => {
    try {
      const response = await apiClient.get('/assistant/conversations');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load conversations' };
    }
  },

  createConversation: async (vin) => {
    try {
      const response = await apiClient.post('/assistant/conversations', { vin });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create conversation' };
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await apiClient.get(`/assistant/conversations/${conversationId}/messages`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load messages' };
    }
  },

  sendMessage: async (conversationId, message) => {
    try {
      const response = await apiClient.post('/assistant/message', { conversationId, message });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to send message' };
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      await apiClient.delete(`/assistant/conversations/${conversationId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete conversation' };
    }
  },
};

export default assistantAPI;
