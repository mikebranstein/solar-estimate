/**
 * Calculate the bearing (azimuth) between two geographic points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} - Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  
  return bearing;
}

/**
 * Calculate distance between two geographic points (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} - Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Determine hemisphere from latitude
 * @param {number} lat - Latitude
 * @returns {string} - 'northern' or 'southern'
 */
export function getHemisphere(lat) {
  return lat >= 0 ? 'northern' : 'southern';
}

/**
 * Get optimal azimuth for hemisphere
 * @param {string} hemisphere - 'northern' or 'southern'
 * @returns {number} - Optimal azimuth (180° for north, 0° for south)
 */
export function getOptimalAzimuth(hemisphere) {
  return hemisphere === 'northern' ? 180 : 0; // South for northern, North for southern
}

/**
 * Calculate the azimuth (compass direction) of a roof section from its polygon
 * Finds the longest edge (typically the ridge line) and calculates the perpendicular direction
 * Optimizes for the best solar direction based on hemisphere
 * @param {Array} coordinates - Array of {lat, lng} points defining the polygon
 * @param {number} latitude - Latitude to determine hemisphere (optional, uses centroid if not provided)
 * @returns {number} - Azimuth in degrees (0=North, 90=East, 180=South, 270=West)
 */
export function calculateRoofAzimuth(coordinates, latitude = null) {
  if (!coordinates || coordinates.length < 3) {
    // Default based on hemisphere
    const lat = latitude || (coordinates && coordinates[0] ? coordinates[0].lat : 0);
    return getOptimalAzimuth(getHemisphere(lat));
  }

  // Determine hemisphere from latitude
  const lat = latitude !== null ? latitude : coordinates[0].lat;
  const hemisphere = getHemisphere(lat);
  const optimalAzimuth = getOptimalAzimuth(hemisphere);

  // Find the longest edge (likely the ridge line)
  let maxDistance = 0;
  let longestEdgeIndex = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const next = (i + 1) % coordinates.length;
    const distance = calculateDistance(
      coordinates[i].lat,
      coordinates[i].lng,
      coordinates[next].lat,
      coordinates[next].lng
    );

    if (distance > maxDistance) {
      maxDistance = distance;
      longestEdgeIndex = i;
    }
  }

  // Get the bearing of the longest edge
  const p1 = coordinates[longestEdgeIndex];
  const p2 = coordinates[(longestEdgeIndex + 1) % coordinates.length];
  const edgeBearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);

  // The roof faces perpendicular to the ridge line
  // Calculate both perpendiculars and choose the one closer to optimal direction
  const perp1 = (edgeBearing + 90) % 360;
  const perp2 = (edgeBearing + 270) % 360;

  // Choose the perpendicular that's closer to the optimal direction for this hemisphere
  const diff1 = Math.min(Math.abs(perp1 - optimalAzimuth), 360 - Math.abs(perp1 - optimalAzimuth));
  const diff2 = Math.min(Math.abs(perp2 - optimalAzimuth), 360 - Math.abs(perp2 - optimalAzimuth));

  const azimuth = diff1 < diff2 ? perp1 : perp2;

  return Math.round(azimuth);
}

/**
 * Calculate the area of a polygon using the spherical excess method
 * @param {Array} coordinates - Array of {lat, lng} points defining the polygon
 * @returns {number} - Area in square meters
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return 0;
  }

  const R = 6371000; // Earth's radius in meters

  // Convert to radians
  const coords = coordinates.map(c => ({
    lat: c.lat * Math.PI / 180,
    lng: c.lng * Math.PI / 180
  }));

  // Use the shoelace formula adapted for geographic coordinates
  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i].lng * coords[j].lat;
    area -= coords[j].lng * coords[i].lat;
  }

  area = Math.abs(area) / 2;

  // Convert from radians squared to square meters
  // This is an approximation using the mean latitude
  const meanLat = coordinates.reduce((sum, c) => sum + c.lat, 0) / n;
  const metersPerDegreeLat = 111132.92;
  const metersPerDegreeLng = 111132.92 * Math.cos(meanLat * Math.PI / 180);

  area = area * metersPerDegreeLat * metersPerDegreeLng;

  return Math.round(area * 10) / 10; // Round to 1 decimal place
}

/**
 * Get cardinal direction from azimuth
 * @param {number} azimuth - Azimuth in degrees
 * @returns {string} - Cardinal direction (e.g., "South", "South-East")
 */
export function getCardinalDirection(azimuth) {
  const directions = [
    'North', 'North-East', 'East', 'South-East',
    'South', 'South-West', 'West', 'North-West'
  ];
  const index = Math.round(azimuth / 45) % 8;
  return directions[index];
}

/**
 * Get solar efficiency rating based on azimuth and hemisphere
 * @param {number} azimuth - Azimuth in degrees (0-360)
 * @param {string} hemisphere - 'northern' or 'southern'
 * @returns {object} - {rating: string, color: string, description: string}
 */
export function getSolarEfficiency(azimuth, hemisphere) {
  const optimalAzimuth = getOptimalAzimuth(hemisphere);
  const optimalDirection = hemisphere === 'northern' ? 'South' : 'North';
  
  // Calculate deviation from optimal
  const diff = Math.min(
    Math.abs(azimuth - optimalAzimuth),
    360 - Math.abs(azimuth - optimalAzimuth)
  );

  if (diff < 30) {
    return {
      rating: 'excellent',
      color: '#28a745',
      description: `${optimalDirection}-facing - Excellent for solar`
    };
  } else if (diff < 60) {
    return {
      rating: 'good',
      color: '#ffc107',
      description: 'Good for solar'
    };
  } else if (diff < 90) {
    return {
      rating: 'fair',
      color: '#fd7e14',
      description: 'Fair for solar'
    };
  } else {
    return {
      rating: 'poor',
      color: '#dc3545',
      description: 'Poor for solar - consider other sections'
    };
  }
}

/**
 * Calculate the centroid of a polygon
 * @param {Array} coordinates - Array of {lat, lng} points
 * @returns {Object} - {lat, lng} of centroid
 */
export function calculateCentroid(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  };
}
