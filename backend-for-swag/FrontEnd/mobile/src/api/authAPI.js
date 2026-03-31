import apiClient from './client';

const authAPI = {
  // Register new user
  register: async (data) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  // Change password (authenticated)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change password',
      };
    }
  },

  // Logout user (client-side only, clears storage)
  logout: async () => {
    try {
      // If you have a backend logout endpoint, call it here
      // await apiClient.post('/auth/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },
};

export default authAPI;