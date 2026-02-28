const axios = require('axios');

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * Free, no API key required
 */
async function geocodeAddress(address) {
  try {
    const url = 'https://nominatim.openstreetmap.org/search';
    const params = {
      q: address,
      format: 'json',
      limit: 1,
      addressdetails: 1
    };

    // Nominatim requires a User-Agent header
    const headers = {
      'User-Agent': 'Solar-Estimator-App/1.0'
    };

    const response = await axios.get(url, { params, headers });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Address not found');
    }

    const result = response.data[0];
    return {
      formattedAddress: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      bounds: result.boundingbox ? {
        northeast: { 
          lat: parseFloat(result.boundingbox[1]), 
          lng: parseFloat(result.boundingbox[3]) 
        },
        southwest: { 
          lat: parseFloat(result.boundingbox[0]), 
          lng: parseFloat(result.boundingbox[2]) 
        }
      } : null,
      placeId: result.place_id
    };
  } catch (error) {
    console.error('Geocoding error:', error.response?.data || error.message);
    throw new Error('Failed to geocode address');
  }
}

module.exports = {
  geocodeAddress
};
