const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_SOLAR_API_KEY = process.env.GOOGLE_SOLAR_API_KEY || GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to get coordinates
 */
async function geocodeAddress(address) {
  try {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      address: address,
      key: GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('Address not found');
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      bounds: result.geometry.bounds,
      placeId: result.place_id
    };
  } catch (error) {
    console.error('Geocoding error:', error.response?.data || error.message);
    throw new Error('Failed to geocode address');
  }
}

/**
 * Get building insights from Google Solar API
 * This API provides roof segments, solar potential, and more
 */
async function getBuildingInsights(lat, lng) {
  try {
    const url = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';
    const params = {
      'location.latitude': lat,
      'location.longitude': lng,
      key: GOOGLE_SOLAR_API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (!response.data) {
      throw new Error('No building insights found');
    }

    return parseBuildingInsights(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('No solar data available for this location');
      return null;
    }
    console.error('Google Solar API error:', error.response?.data || error.message);
    throw new Error('Failed to get building insights from Google Solar API');
  }
}

/**
 * Parse and structure building insights data
 */
function parseBuildingInsights(data) {
  const roofSegments = data.solarPotential?.roofSegmentStats || [];
  
  return {
    name: data.name,
    center: data.center,
    boundingBox: data.boundingBox,
    imageryDate: data.imageryDate,
    imageryQuality: data.imageryQuality,
    solarPotential: {
      maxArrayPanelsCount: data.solarPotential?.maxArrayPanelsCount || 0,
      maxArrayAreaMeters2: data.solarPotential?.maxArrayAreaMeters2 || 0,
      maxSunshineHoursPerYear: data.solarPotential?.maxSunshineHoursPerYear || 0,
      carbonOffsetFactorKgPerMwh: data.solarPotential?.carbonOffsetFactorKgPerMwh || 0,
      panelCapacityWatts: data.solarPotential?.panelCapacityWatts || 400,
      panelHeightMeters: data.solarPotential?.panelHeightMeters || 1.65,
      panelWidthMeters: data.solarPotential?.panelWidthMeters || 1.0,
      panelLifetimeYears: data.solarPotential?.panelLifetimeYears || 25
    },
    roofSegments: roofSegments.map((segment, index) => ({
      id: index,
      pitchDegrees: segment.pitchDegrees || 0,
      azimuthDegrees: segment.azimuthDegrees || 0,
      stats: segment.stats || {},
      center: segment.center,
      boundingBox: segment.boundingBox,
      planeHeightAtCenterMeters: segment.planeHeightAtCenterMeters || 0
    }))
  };
}

module.exports = {
  geocodeAddress,
  getBuildingInsights
};
