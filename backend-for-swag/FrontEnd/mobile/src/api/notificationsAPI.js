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
};

export default notificationsAPI;
