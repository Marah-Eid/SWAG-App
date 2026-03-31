import apiClient from './client';

const otpAPI = {
  sendOtp: async (recipient, purpose = 'signup') => {
    try {
      const response = await apiClient.post('/auth/send-otp', { recipient, purpose });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to send OTP' };
    }
  },

  verifyOtp: async (recipient, code, purpose = 'signup') => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { recipient, code, purpose });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid or expired code' };
    }
  },
};

export default otpAPI;
