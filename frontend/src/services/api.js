import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Geocode an address
  geocodeAddress: async (address) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/maps/geocode`, { address });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to geocode address');
    }
  },

  // Detect roof surfaces
  detectRoof: async (address, lat, lng) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/solar/detect-roof`, {
        address,
        lat,
        lng
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to detect roof');
    }
  },

  // Get solar irradiance data
  getSolarIrradiance: async (lat, lng) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/solar/irradiance`, {
        lat,
        lng
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get solar data');
    }
  },

  // Calculate energy production
  calculateEnergy: async (panels, irradianceData, timeRange = 'monthly') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/solar/calculate`, {
        panels,
        irradianceData,
        timeRange
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to calculate energy');
    }
  }
};

export default api;
