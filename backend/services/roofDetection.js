const geocodingService = require('./google-maps');

/**
 * Initialize roof configuration for manual setup
 * Returns location data - user will manually configure roof surfaces
 */
async function detectRoof(address, lat, lng) {
  try {
    let coordinates = { lat, lng };
    let formattedAddress = address;
    
    // If address provided, geocode it first
    if (address && (!lat || !lng)) {
      const geocoded = await geocodingService.geocodeAddress(address);
      coordinates = {
        lat: geocoded.lat,
        lng: geocoded.lng
      };
      formattedAddress = geocoded.formattedAddress;
    }

    // Return basic structure - user will manually configure roof surfaces
    return {
      location: coordinates,
      formattedAddress: formattedAddress,
      roofSegments: [],
      message: 'Use the map to view your roof, then manually add roof surfaces below.'
    };
  } catch (error) {
    console.error('Roof detection error:', error);
    throw error;
  }
}

module.exports = {
  detectRoof
};
