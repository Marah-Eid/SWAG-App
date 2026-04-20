import apiClient from './client';

const notificationsAPI = {
  getNotifications: async (page = 1) => {
    try {
      const response = await apiClient.get('/notifications', { params: { page } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load notifications' };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to mark notification as read' };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to mark all as read' };
    }
  },

  deleteNotification: async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete notification' };
    }
  },

  clearAll: async () => {
    try {
      await apiClient.delete('/notifications/clear-all');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to clear notifications' };
    }
  },

  registerPushToken: async (token) => {
    try {
      const response = await apiClient.post('/notifications/push-token', { token });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to register push token' };
    }
  },

  unregisterPushToken: async (token) => {
    try {
      await apiClient.delete('/notifications/push-token', { data: { token } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to unregister push token' };
    }
  },
};

export default notificationsAPI;
