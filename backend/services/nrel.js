const axios = require('axios');

const NREL_BASE_URL = 'https://developer.nrel.gov/api';
const API_KEY = process.env.NREL_API_KEY;

/**
 * Get solar irradiance data from NREL API
 * Uses the PVWatts V6 API for solar resource data
 */
async function getSolarIrradiance(lat, lng) {
  try {
    // Get solar resource data
    const solarResourceUrl = `${NREL_BASE_URL}/solar/solar_resource/v1.json`;
    const params = {
      api_key: API_KEY,
      lat: lat,
      lon: lng
    };

    const response = await axios.get(solarResourceUrl, { params });
    
    if (!response.data || !response.data.outputs) {
      throw new Error('Invalid response from NREL API');
    }

    const outputs = response.data.outputs;
    
    // Extract monthly average solar data (kWh/m²/day)
    const monthlyData = {
      jan: outputs.avg_dni?.annual || 0,
      feb: outputs.avg_dni?.annual || 0,
      mar: outputs.avg_dni?.annual || 0,
      apr: outputs.avg_dni?.annual || 0,
      may: outputs.avg_dni?.annual || 0,
      jun: outputs.avg_dni?.annual || 0,
      jul: outputs.avg_dni?.annual || 0,
      aug: outputs.avg_dni?.annual || 0,
      sep: outputs.avg_dni?.annual || 0,
      oct: outputs.avg_dni?.annual || 0,
      nov: outputs.avg_dni?.annual || 0,
      dec: outputs.avg_dni?.annual || 0
    };

    return {
      location: {
        lat,
        lng,
        elevation: outputs.elevation || 0
      },
      avgDNI: outputs.avg_dni?.annual || 0, // Direct Normal Irradiance
      avgGHI: outputs.avg_ghi?.annual || 0, // Global Horizontal Irradiance
      avgTilt: outputs.avg_lat_tilt?.annual || 0, // Irradiance at latitude tilt
      monthly: monthlyData
    };
  } catch (error) {
    console.error('NREL API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch solar irradiance data from NREL');
  }
}

/**
 * Get detailed hourly solar data for a specific location
 */
async function getHourlySolarData(lat, lng, year = new Date().getFullYear()) {
  try {
    // Using PVWatts API to get hourly production estimates
    const pvWattsUrl = `${NREL_BASE_URL}/pvwatts/v6.json`;
    const params = {
      api_key: API_KEY,
      lat: lat,
      lon: lng,
      system_capacity: 1, // 1 kW system for baseline
      azimuth: 180, // South-facing
      tilt: lat, // Tilt equals latitude for optimal year-round production
      array_type: 1, // Fixed (roof mount)
      module_type: 1, // Standard
      losses: 14, // System losses percentage
      timeframe: 'hourly'
    };

    const response = await axios.get(pvWattsUrl, { params });
    
    if (!response.data || !response.data.outputs) {
      throw new Error('Invalid response from NREL PVWatts API');
    }

    return response.data.outputs;
  } catch (error) {
    console.error('NREL PVWatts API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch hourly solar data from NREL');
  }
}

module.exports = {
  getSolarIrradiance,
  getHourlySolarData
};
