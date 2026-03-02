/**
 * Property Storage Utilities
 * Manages multiple properties with their roof sections, panels, and settings
 */

const STORAGE_KEY = 'solarEstimator_properties';
const ACTIVE_PROPERTY_KEY = 'solarEstimator_activeProperty';

/**
 * Create a new property object
 * @param {string} name - Property name
 * @param {object} location - {lat, lng, formattedAddress}
 * @returns {object} - New property object
 */
export function createProperty(name, location) {
  return {
    id: Date.now().toString(),
    name: name || 'Unnamed Property',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    location: location,
    roofSections: [],
    panels: [],
    energyData: null,
    zoom: 21,
    nextPanelId: 0
  };
}

/**
 * Get all saved properties
 * @returns {array} - Array of property objects
 */
export function getAllProperties() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading properties:', error);
    return [];
  }
}

/**
 * Save a property (create or update)
 * @param {object} property - Property object to save
 * @returns {object} - Saved property
 */
export function saveProperty(property) {
  try {
    const properties = getAllProperties();
    const existingIndex = properties.findIndex(p => p.id === property.id);
    
    // Update timestamp
    property.updatedAt = new Date().toISOString();
    
    if (existingIndex >= 0) {
      // Update existing
      properties[existingIndex] = property;
    } else {
      // Add new
      properties.push(property);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    return property;
  } catch (error) {
    console.error('Error saving property:', error);
    throw error;
  }
}

/**
 * Delete a property
 * @param {string} propertyId - ID of property to delete
 * @returns {boolean} - Success status
 */
export function deleteProperty(propertyId) {
  try {
    const properties = getAllProperties();
    const filtered = properties.filter(p => p.id !== propertyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // If this was the active property, clear it
    const activeId = getActivePropertyId();
    if (activeId === propertyId) {
      clearActiveProperty();
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
}

/**
 * Get a property by ID
 * @param {string} propertyId - Property ID
 * @returns {object|null} - Property object or null
 */
export function getPropertyById(propertyId) {
  const properties = getAllProperties();
  return properties.find(p => p.id === propertyId) || null;
}

/**
 * Set the active property ID
 * @param {string} propertyId - Property ID to set as active
 */
export function setActivePropertyId(propertyId) {
  localStorage.setItem(ACTIVE_PROPERTY_KEY, propertyId);
}

/**
 * Get the active property ID
 * @returns {string|null} - Active property ID or null
 */
export function getActivePropertyId() {
  return localStorage.getItem(ACTIVE_PROPERTY_KEY);
}

/**
 * Clear the active property
 */
export function clearActiveProperty() {
  localStorage.removeItem(ACTIVE_PROPERTY_KEY);
}

/**
 * Export all properties as JSON (for backup)
 * @returns {string} - JSON string of all properties
 */
export function exportProperties() {
  const properties = getAllProperties();
  return JSON.stringify(properties, null, 2);
}

/**
 * Import properties from JSON (for restore)
 * @param {string} jsonData - JSON string of properties
 * @returns {boolean} - Success status
 */
export function importProperties(jsonData) {
  try {
    const properties = JSON.parse(jsonData);
    if (!Array.isArray(properties)) {
      throw new Error('Invalid data format');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    return true;
  } catch (error) {
    console.error('Error importing properties:', error);
    return false;
  }
}

/**
 * Get property summary for display
 * @param {object} property - Property object
 * @returns {object} - Summary info
 */
export function getPropertySummary(property) {
  return {
    id: property.id,
    name: property.name,
    address: property.location?.formattedAddress || 'Unknown location',
    roofSectionCount: property.roofSections?.length || 0,
    panelCount: property.panels?.length || 0,
    totalArea: property.roofSections?.reduce((sum, section) => sum + (section.area || 0), 0) || 0,
    totalCapacity: property.panels?.reduce((sum, panel) => sum + (panel.kWp || 0), 0) || 0,
    lastUpdated: property.updatedAt
  };
}
