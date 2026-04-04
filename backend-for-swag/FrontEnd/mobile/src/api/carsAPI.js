import apiClient from './client';

const carsAPI = {
  getMyCars: async () => {
    try {
      const response = await apiClient.get('/cars');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load cars' };
    }
  },

  addCar: async (data) => {
    try {
      const response = await apiClient.post('/cars', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add car' };
    }
  },

  getCarById: async (id) => {
    try {
      const response = await apiClient.get(`/cars/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load car' };
    }
  },

  updateCar: async (id, data) => {
    try {
      const response = await apiClient.put(`/cars/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update car' };
    }
  },

  deleteCar: async (id) => {
    try {
      const response = await apiClient.delete(`/cars/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete car' };
    }
  },

  getMaintenanceRecords: async (carId) => {
    try {
      const response = await apiClient.get(`/cars/${carId}/maintenance`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load maintenance records' };
    }
  },

  addMaintenanceRecord: async (carId, data) => {
    try {
      const response = await apiClient.post(`/cars/${carId}/maintenance`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add maintenance record' };
    }
  },

  updateMaintenanceRecord: async (carId, recordId, data) => {
    try {
      const response = await apiClient.put(`/cars/${carId}/maintenance/${recordId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update maintenance record' };
    }
  },

  deleteMaintenanceRecord: async (carId, recordId) => {
    try {
      const response = await apiClient.delete(`/cars/${carId}/maintenance/${recordId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete maintenance record' };
    }
  },
};

export default carsAPI;
