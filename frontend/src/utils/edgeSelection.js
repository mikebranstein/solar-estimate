/**
 * Enhanced roof calculations with manual edge specification
 */

/**
 * Calculate azimuth from a specified ridge edge
 * @param {object} edge - {start: {lat, lng}, end: {lat, lng}}
 * @param {number} latitude - Latitude for hemisphere detection
 * @returns {number} - Azimuth perpendicular to ridge
 */
export function calculateAzimuthFromRidge(edge, latitude) {
  const { start, end } = edge;
  
  // Calculate bearing of the ridge line
  const φ1 = start.lat * Math.PI / 180;
  const φ2 = end.lat * Math.PI / 180;
  const Δλ = (end.lng - start.lng) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const ridgeBearing = (θ * 180 / Math.PI + 360) % 360;

  // Get hemisphere to determine optimal direction
  const hemisphere = latitude >= 0 ? 'northern' : 'southern';
  const optimalAzimuth = hemisphere === 'northern' ? 180 : 0;

  // Calculate both perpendiculars
  const perp1 = (ridgeBearing + 90) % 360;
  const perp2 = (ridgeBearing + 270) % 360;

  // Choose the perpendicular closer to optimal direction
  const diff1 = Math.min(Math.abs(perp1 - optimalAzimuth), 360 - Math.abs(perp1 - optimalAzimuth));
  const diff2 = Math.min(Math.abs(perp2 - optimalAzimuth), 360 - Math.abs(perp2 - optimalAzimuth));

  return Math.round(diff1 < diff2 ? perp1 : perp2);
}

/**
 * Calculate pitch/tilt from ridge and eave edges
 * @param {object} ridgeEdge - {start: {lat, lng}, end: {lat, lng}}
 * @param {object} eaveEdge - {start: {lat, lng}, end: {lat, lng}}
 * @returns {number} - Pitch in degrees (0-90)
 */
export function calculatePitchFromEdges(ridgeEdge, eaveEdge) {
  // Calculate midpoints of each edge
  const ridgeMid = {
    lat: (ridgeEdge.start.lat + ridgeEdge.end.lat) / 2,
    lng: (ridgeEdge.start.lng + ridgeEdge.end.lng) / 2
  };
  
  const eaveMid = {
    lat: (eaveEdge.start.lat + eaveEdge.end.lat) / 2,
    lng: (eaveEdge.start.lng + eaveEdge.end.lng) / 2
  };

  // Calculate horizontal distance between ridge and eave (in meters)
  const R = 6371000; // Earth's radius in meters
  const φ1 = ridgeMid.lat * Math.PI / 180;
  const φ2 = eaveMid.lat * Math.PI / 180;
  const Δφ = (eaveMid.lat - ridgeMid.lat) * Math.PI / 180;
  const Δλ = (eaveMid.lng - ridgeMid.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const horizontalDistance = R * c;

  // For typical residential roofs, assume a standard roof slope
  // This is an approximation since we don't have elevation data
  // Common pitches: 4/12 (18.4°), 6/12 (26.6°), 8/12 (33.7°), 12/12 (45°)
  
  // We'll estimate based on building type heuristics
  // For now, return a reasonable default that can be manually adjusted
  // In a future version, this could use elevation APIs or user input
  
  // Typical residential roof pitch range: 15-35 degrees
  // We'll default to a common 22.5° (5/12 pitch) if ridge-to-eave distance suggests a standard roof
  
  if (horizontalDistance > 3 && horizontalDistance < 15) {
    // Typical residential roof span
    return 22; // Common residential pitch
  } else if (horizontalDistance < 3) {
    // Very short span - might be steeper
    return 35;
  } else {
    // Larger building - might be flatter
    return 15;
  }
}

/**
 * Get edge information from polygon coordinates
 * @param {Array} coordinates - Array of {lat, lng} points
 * @returns {Array} - Array of edge objects with metadata
 */
export function getPolygonEdges(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return [];
  }

  const edges = [];
  
  for (let i = 0; i < coordinates.length; i++) {
    const start = coordinates[i];
    const end = coordinates[(i + 1) % coordinates.length];
    
    // Calculate edge length
    const R = 6371000;
    const φ1 = start.lat * Math.PI / 180;
    const φ2 = end.lat * Math.PI / 180;
    const Δφ = (end.lat - start.lat) * Math.PI / 180;
    const Δλ = (end.lng - start.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const length = R * c;

    // Calculate bearing
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const bearing = (θ * 180 / Math.PI + 360) % 360;

    edges.push({
      index: i,
      start,
      end,
      length,
      bearing,
      midpoint: {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2
      }
    });
  }

  return edges;
}

/**
 * Find the likely ridge line (longest edge) automatically
 * @param {Array} edges - Array of edge objects
 * @returns {object} - The edge object that's likely the ridge
 */
export function findLikelyRidge(edges) {
  if (!edges || edges.length === 0) return null;
  
  let maxLength = 0;
  let ridgeEdge = edges[0];
  
  edges.forEach(edge => {
    if (edge.length > maxLength) {
      maxLength = edge.length;
      ridgeEdge = edge;
    }
  });
  
  return ridgeEdge;
}

/**
 * Find likely eave edge (opposite to ridge)
 * @param {Array} edges - Array of edge objects
 * @param {object} ridgeEdge - The ridge edge
 * @returns {object} - The edge object that's likely the eave
 */
export function findLikelyEave(edges, ridgeEdge) {
  if (!edges || edges.length === 0 || !ridgeEdge) return null;
  
  // Find edge that's roughly parallel to ridge and on opposite side
  let bestCandidate = null;
  let minAngleDiff = Infinity;
  
  edges.forEach(edge => {
    if (edge.index === ridgeEdge.index) return;
    
    // Check if edges are roughly parallel (bearing difference close to 0 or 180)
    const angleDiff = Math.abs(edge.bearing - ridgeEdge.bearing);
    const parallelDiff = Math.min(angleDiff, 360 - angleDiff);
    
    if (parallelDiff < 30 && parallelDiff < minAngleDiff) {
      minAngleDiff = parallelDiff;
      bestCandidate = edge;
    }
  });
  
  return bestCandidate;
}

/**
 * Create edge markers for visualization
 * @param {Array} edges - Array of edge objects
 * @param {number} selectedIndex - Index of selected edge (-1 for none)
 * @param {string} type - 'ridge' or 'eave' or null
 * @returns {Array} - Array of marker data for rendering
 */
export function createEdgeMarkers(edges, selectedIndex = -1, type = null) {
  return edges.map(edge => ({
    ...edge,
    isSelected: edge.index === selectedIndex,
    selectionType: edge.index === selectedIndex ? type : null
  }));
}
