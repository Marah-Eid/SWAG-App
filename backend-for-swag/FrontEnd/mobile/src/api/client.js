import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Change this to your backend URL
const BASE_URL = 'https://swag-backend-api-e7awewcqgyfqewdc.uaenorth-01.azurewebsites.net/api';
// For Android emulator
// For iOS simulator: 'http://localhost:5000/api'
// For physical device: 'http://YOUR_IP_ADDRESS:5000/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Retry once on timeout or network error (handles Azure cold start)
    if (!config._retried && (error.code === 'ECONNABORTED' || !error.response)) {
      config._retried = true;
      return apiClient(config);
    }
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };