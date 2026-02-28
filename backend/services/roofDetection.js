const googleMapsService = require('./google-maps');

/**
 * Detect roof surfaces using Google Solar API
 * This provides automated roof detection with pitch, azimuth, and area data
 */
async function detectRoof(address, lat, lng) {
  try {
    let coordinates = { lat, lng };
    
    // If address provided, geocode it first
    if (address && (!lat || !lng)) {
      const geocoded = await googleMapsService.geocodeAddress(address);
      coordinates = {
        lat: geocoded.lat,
        lng: geocoded.lng
      };
    }

    // Get building insights from Google Solar API
    const buildingData = await googleMapsService.getBuildingInsights(coordinates.lat, coordinates.lng);
    
    if (!buildingData) {
      // Fallback: return simplified data structure
      return {
        location: coordinates,
        roofSegments: [],
        message: 'No automated roof detection available for this location. Manual tracing will be required.'
      };
    }

    return {
      location: coordinates,
      buildingInfo: {
        center: buildingData.center,
        boundingBox: buildingData.boundingBox,
        imageryDate: buildingData.imageryDate
      },
      solarPotential: buildingData.solarPotential,
      roofSegments: buildingData.roofSegments.map(segment => ({
        id: segment.id,
        pitch: segment.pitchDegrees,
        azimuth: segment.azimuthDegrees,
        area: segment.stats?.areaMeters2 || 0,
        sunshineHours: segment.stats?.sunshineQuantiles || [],
        groundArea: segment.stats?.groundAreaMeters2 || 0
      }))
    };
  } catch (error) {
    console.error('Roof detection error:', error);
    throw error;
  }
}

module.exports = {
  detectRoof
};
