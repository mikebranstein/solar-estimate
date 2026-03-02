/**
 * Solar Panel Auto-Fitting Utility
 * Automatically fits solar panels onto roof sections based on polygon geometry
 */

// Standard solar panel dimensions (in meters)
export const PANEL_SPECS = {
  width: 1.0,      // 1.0 meter
  height: 1.7,     // 1.7 meters
  area: 1.7,       // Square meters
  wattage: 400,    // Watts per panel (modern standard)
  kWp: 0.4         // kWp per panel
};

/**
 * Convert latitude/longitude to meters (approximate, for small distances)
 * @param {number} lat - Latitude
 * @returns {Object} - Conversion factors for lat/lng to meters
 */
function getMetersPerDegree(lat) {
  const latRad = lat * Math.PI / 180;
  return {
    lat: 111320, // meters per degree of latitude (constant)
    lng: 111320 * Math.cos(latRad) // meters per degree of longitude (varies by latitude)
  };
}

/**
 * Convert polygon coordinates to a local coordinate system in meters
 * @param {Array} coordinates - Array of {lat, lng} points
 * @returns {Object} - {points: converted points, origin: reference point, conversion: factors}
 */
function convertToLocalMeters(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return { points: [], origin: null, conversion: null };
  }

  // Use first point as origin
  const origin = coordinates[0];
  const conversion = getMetersPerDegree(origin.lat);

  // Convert all points to meters relative to origin
  const points = coordinates.map(coord => ({
    x: (coord.lng - origin.lng) * conversion.lng,
    y: (coord.lat - origin.lat) * conversion.lat
  }));

  return { points, origin, conversion };
}

/**
 * Convert local meter coordinates back to lat/lng
 * @param {Object} point - {x, y} in meters
 * @param {Object} origin - Reference lat/lng point
 * @param {Object} conversion - Conversion factors
 * @returns {Object} - {lat, lng}
 */
function convertToLatLng(point, origin, conversion) {
  return {
    lat: origin.lat + (point.y / conversion.lat),
    lng: origin.lng + (point.x / conversion.lng)
  };
}

/**
 * Calculate the bounding box of a polygon
 * @param {Array} points - Array of {x, y} points
 * @returns {Object} - {minX, maxX, minY, maxY, width, height}
 */
function calculateBoundingBox(points) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Find the primary orientation of the roof section
 * @param {Array} points - Array of {x, y} points
 * @returns {number} - Rotation angle in radians
 */
function findPrimaryOrientation(points) {
  // Find the longest edge
  let maxLength = 0;
  let longestEdgeAngle = 0;
  
  for (let i = 0; i < points.length; i++) {
    const next = (i + 1) % points.length;
    const dx = points[next].x - points[i].x;
    const dy = points[next].y - points[i].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length > maxLength) {
      maxLength = length;
      longestEdgeAngle = Math.atan2(dy, dx);
    }
  }
  
  return longestEdgeAngle;
}

/**
 * Rotate a point around origin
 * @param {Object} point - {x, y}
 * @param {number} angle - Rotation angle in radians
 * @returns {Object} - Rotated {x, y}
 */
function rotatePoint(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

/**
 * Check if a point is inside a polygon (ray casting algorithm)
 * @param {Object} point - {x, y}
 * @param {Array} polygon - Array of {x, y} points
 * @returns {boolean}
 */
function isPointInPolygon(point, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
                     (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Check if a rectangle (panel) is fully inside the polygon
 * @param {Object} rect - {x, y, width, height, angle}
 * @param {Array} polygon - Array of {x, y} points
 * @returns {boolean}
 */
function isRectangleInPolygon(rect, polygon) {
  // Get the four corners of the rectangle
  const cos = Math.cos(rect.angle);
  const sin = Math.sin(rect.angle);
  
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width * cos, y: rect.y + rect.width * sin },
    { x: rect.x + rect.width * cos - rect.height * sin, y: rect.y + rect.width * sin + rect.height * cos },
    { x: rect.x - rect.height * sin, y: rect.y + rect.height * cos }
  ];
  
  // Check if all corners are inside the polygon
  return corners.every(corner => isPointInPolygon(corner, polygon));
}

/**
 * Fit solar panels into a roof section polygon
 * @param {Array} coordinates - Array of {lat, lng} points defining the roof section
 * @param {number} requestedPanelCount - Optional: specific number of panels to fit (null for maximum)
 * @returns {Object} - {panels: array of panel positions, count: number, kWp: total capacity}
 */
export function fitPanelsToRoof(coordinates, requestedPanelCount = null) {
  // Convert to local meter coordinate system
  const { points, origin, conversion } = convertToLocalMeters(coordinates);
  
  if (points.length < 3) {
    return { panels: [], count: 0, kWp: 0 };
  }
  
  // Find primary orientation of the roof
  const primaryAngle = findPrimaryOrientation(points);
  
  // Calculate centroid for rotation center
  const centroid = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length
  };
  
  // Rotate polygon to align with primary edge
  const rotatedPoints = points.map(p => {
    const translated = { x: p.x - centroid.x, y: p.y - centroid.y };
    const rotated = rotatePoint(translated, -primaryAngle);
    return { x: rotated.x + centroid.x, y: rotated.y + centroid.y };
  });
  
  // Recalculate bounding box for rotated polygon
  const rotatedBbox = calculateBoundingBox(rotatedPoints);
  
  // Try both orientations (landscape and portrait)
  const orientations = [
    { width: PANEL_SPECS.width, height: PANEL_SPECS.height },
    { width: PANEL_SPECS.height, height: PANEL_SPECS.width }
  ];
  
  let bestFit = { panels: [], count: 0 };
  
  for (const orientation of orientations) {
    const panelWidth = orientation.width;
    const panelHeight = orientation.height;
    const panels = [];
    
    // Grid spacing with small gap between panels
    const gap = 0.05; // 5cm gap
    const stepX = panelWidth + gap;
    const stepY = panelHeight + gap;
    
    // Calculate how many panels can fit
    const cols = Math.floor(rotatedBbox.width / stepX);
    const rows = Math.floor(rotatedBbox.height / stepY);
    
    // Try to fit panels in a grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const panelX = rotatedBbox.minX + col * stepX;
        const panelY = rotatedBbox.minY + row * stepY;
        
        // Check if this panel fits inside the polygon
        const rect = {
          x: panelX,
          y: panelY,
          width: panelWidth,
          height: panelHeight,
          angle: 0 // Already rotated the polygon
        };
        
        if (isRectangleInPolygon(rect, rotatedPoints)) {
          panels.push(rect);
          
          // If we have a requested count, stop when we reach it
          if (requestedPanelCount && panels.length >= requestedPanelCount) {
            break;
          }
        }
      }
      
      // If we have a requested count, stop when we reach it
      if (requestedPanelCount && panels.length >= requestedPanelCount) {
        break;
      }
    }
    
    // Keep the orientation that fits more panels
    if (panels.length > bestFit.count) {
      bestFit = { panels, count: panels.length };
    }
    
    // If we achieved the requested count, no need to try other orientation
    if (requestedPanelCount && bestFit.count >= requestedPanelCount) {
      break;
    }
  }
  
  // Convert panels back to lat/lng coordinates
  const panelsInLatLng = bestFit.panels.map(panel => {
    // Rotate back to original orientation
    const corners = [
      { x: panel.x, y: panel.y },
      { x: panel.x + panel.width, y: panel.y },
      { x: panel.x + panel.width, y: panel.y + panel.height },
      { x: panel.x, y: panel.y + panel.height }
    ];
    
    const rotatedBackCorners = corners.map(corner => {
      const translated = { x: corner.x - centroid.x, y: corner.y - centroid.y };
      const rotated = rotatePoint(translated, primaryAngle);
      return { x: rotated.x + centroid.x, y: rotated.y + centroid.y };
    });
    
    // Convert to lat/lng
    const latLngCorners = rotatedBackCorners.map(corner =>
      convertToLatLng(corner, origin, conversion)
    );
    
    return {
      corners: latLngCorners,
      width: panel.width,
      height: panel.height
    };
  });
  
  // Calculate total kWp
  const totalKWp = bestFit.count * PANEL_SPECS.kWp;
  
  return {
    panels: panelsInLatLng,
    count: bestFit.count,
    kWp: totalKWp,
    panelSpec: PANEL_SPECS
  };
}

/**
 * Get estimated panel count for a given roof area
 * @param {number} area - Roof area in square meters
 * @returns {number} - Estimated panel count (accounting for ~70% usable area)
 */
export function estimatePanelCount(area) {
  const usableAreaFactor = 0.7; // Assume 70% of roof area is usable
  const usableArea = area * usableAreaFactor;
  return Math.floor(usableArea / PANEL_SPECS.area);
}
