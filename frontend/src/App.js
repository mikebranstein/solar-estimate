import React, { useState, useEffect, useRef } from 'react';
import AddressSearch from './components/AddressSearch';
import MapView from './components/MapView';
import RoofEditor from './components/RoofEditor';
import EnergyChart from './components/EnergyChart';
import PropertyManager from './components/PropertyManager';
import api from './services/api';
import { fitPanelsToRoof, PANEL_SPECS } from './utils/panelFitting';
import { 
  createProperty, 
  getAllProperties, 
  saveProperty, 
  deleteProperty, 
  getPropertyById,
  setActivePropertyId,
  getActivePropertyId,
  clearActiveProperty,
  exportProperties
} from './utils/propertyStorage';

function App() {
  // Property Management State
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  
  // Current Property State
  const [location, setLocation] = useState(null);
  const [roofData, setRoofData] = useState(null);
  const [panels, setPanels] = useState([]);
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPanelId, setNextPanelId] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [zoom, setZoom] = useState(12);
  const [drawingMode, setDrawingMode] = useState(false);
  const [roofSections, setRoofSections] = useState([]);
  const [editingRoofIndex, setEditingRoofIndex] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [fileHandle, setFileHandle] = useState(null);
  const autoSaveTimeoutRef = useRef(null);

  // Load properties and active property on mount
  useEffect(() => {
    const loadedProperties = getAllProperties();
    setProperties(loadedProperties);
    
    const activeId = getActivePropertyId();
    if (activeId) {
      const active = getPropertyById(activeId);
      if (active) {
        loadPropertyData(active);
      }
    }
    
    // Get user's geolocation for new properties
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation not available or denied, using Auckland, NZ as default');
          setUserLocation({ lat: -36.8485, lng: 174.7633 });
        },
        {
          timeout: 5000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } else {
      setUserLocation({ lat: -36.8485, lng: 174.7633 });
    }
  }, []);

  // Auto-save active property whenever data changes
  useEffect(() => {
    if (activeProperty && location) {
      const updatedProperty = {
        ...activeProperty,
        location,
        roofSections,
        panels,
        energyData,
        zoom,
        nextPanelId
      };
      saveProperty(updatedProperty);
      
      // Update in properties list
      setProperties(prev => 
        prev.map(p => p.id === updatedProperty.id ? updatedProperty : p)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, roofSections, panels, energyData, zoom, nextPanelId]);

  // Auto-save to file when properties change (debounced)
  useEffect(() => {
    if (!autoSaveEnabled || !fileHandle || properties.length === 0) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout to save after 2 seconds of no changes
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const jsonData = exportProperties();
        const writable = await fileHandle.createWritable();
        await writable.write(jsonData);
        await writable.close();
        console.log('Properties auto-saved to file');
      } catch (error) {
        console.error('Auto-save failed:', error);
        // If write fails, disable auto-save
        setAutoSaveEnabled(false);
        setFileHandle(null);
        alert('Auto-save failed. Please re-enable and select a file again.');
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [properties, autoSaveEnabled, fileHandle]);

  // Load property data into state
  const loadPropertyData = (property) => {
    setActiveProperty(property);
    setActivePropertyId(property.id);
    setLocation(property.location || null);
    setRoofData(property.location ? {
      location: property.location,
      formattedAddress: property.location.formattedAddress,
      roofSegments: [],
      message: 'Property loaded. Use the map to view your roof.'
    } : null);
    setRoofSections(property.roofSections || []);
    setPanels(property.panels || []);
    setEnergyData(property.energyData || null);
    setZoom(property.zoom || 21);
    setNextPanelId(property.nextPanelId || 0);
    setDrawingMode(false);
    setError(null);
  };

  // Property Management Functions
  const handleCreateProperty = (name) => {
    const newProperty = createProperty(name, location || null);
    const saved = saveProperty(newProperty);
    setProperties([...properties, saved]);
    loadPropertyData(saved);
  };

  const handleSelectProperty = (propertyId) => {
    const property = getPropertyById(propertyId);
    if (property) {
      loadPropertyData(property);
    }
  };

  const handleReloadProperty = () => {
    if (activeProperty) {
      const property = getPropertyById(activeProperty.id);
      if (property) {
        loadPropertyData(property);
      }
    }
  };

  const handleDeleteProperty = (propertyId) => {
    deleteProperty(propertyId);
    setProperties(properties.filter(p => p.id !== propertyId));
    
    if (activeProperty?.id === propertyId) {
      // Clear current property
      setActiveProperty(null);
      clearActiveProperty();
      setLocation(null);
      setRoofData(null);
      setRoofSections([]);
      setPanels([]);
      setEnergyData(null);
      setNextPanelId(0);
    }
  };

  const handleRenameProperty = (propertyId, newName) => {
    const property = getPropertyById(propertyId);
    if (property) {
      const updated = { ...property, name: newName };
      saveProperty(updated);
      setProperties(properties.map(p => p.id === propertyId ? updated : p));
      if (activeProperty?.id === propertyId) {
        setActiveProperty(updated);
      }
    }
  };

  const handlePropertiesImported = () => {
    const loadedProperties = getAllProperties();
    setProperties(loadedProperties);
    
    // Clear active property since imported data might not include it
    setActiveProperty(null);
    clearActiveProperty();
    setLocation(null);
    setRoofData(null);
    setRoofSections([]);
    setPanels([]);
    setEnergyData(null);
    setNextPanelId(0);
  };

  const handleAutoSaveToggle = async (enabled) => {
    if (enabled) {
      // Check if File System Access API is supported
      if (!('showSaveFilePicker' in window)) {
        alert('Auto-save to file is not supported in your browser. Your data is still saved in the browser automatically.');
        return;
      }

      try {
        // Let user choose where to save the file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').split('.')[0];
        const handle = await window.showSaveFilePicker({
          suggestedName: `solar-properties-${timestamp}.json`,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        });

        setFileHandle(handle);
        setAutoSaveEnabled(true);

        // Immediately save to the selected file
        const jsonData = exportProperties();
        const writable = await handle.createWritable();
        await writable.write(jsonData);
        await writable.close();
        
        console.log('Auto-save enabled and initial save completed');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to enable auto-save:', error);
          alert('Failed to enable auto-save. Please try again.');
        }
      }
    } else {
      // Disable auto-save
      setAutoSaveEnabled(false);
      setFileHandle(null);
    }
  };

  const handleAddressSelect = async (address) => {
    setLoading(true);
    setError(null);
    
    try {
      // Geocode address using Nominatim
      const geocodeResult = await api.geocodeAddress(address);
      setLocation(geocodeResult);

      // Get basic roof data (no automated detection)
      const roofResult = await api.detectRoof(address, geocodeResult.lat, geocodeResult.lng);
      setRoofData(roofResult);

      // Auto-create property if none exists
      if (!activeProperty) {
        const propertyName = geocodeResult.formattedAddress.split(',')[0] || 'New Property';
        handleCreateProperty(propertyName);
      }
    } catch (err) {
      setError(err.message || 'Failed to process address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  const handleMapClick = async (lat, lng) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use clicked coordinates directly
      const locationData = {
        lat: lat,
        lng: lng,
        formattedAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      setLocation(locationData);

      // Get basic roof data
      const roofResult = await api.detectRoof(null, lat, lng);
      setRoofData({
        ...roofResult,
        formattedAddress: locationData.formattedAddress
      });

      // Auto-create property if none exists
      if (!activeProperty) {
        handleCreateProperty('Location Property');
      }
    } catch (err) {
      setError(err.message || 'Failed to process location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPanel = () => {
    // Use hemisphere-aware default azimuth
    const defaultAzimuth = location && location.lat < 0 ? 0 : 180; // North for Southern, South for Northern
    
    const newPanel = {
      id: nextPanelId,
      name: `Roof Section ${nextPanelId + 1}`,
      kWp: 0,
      azimuth: defaultAzimuth,
      pitch: 20, // Default: 20° pitch
      area: 0
    };
    setPanels([...panels, newPanel]);
    setNextPanelId(nextPanelId + 1);
  };

  const handlePolygonComplete = (sectionData) => {
    // Add the roof section to the list
    setRoofSections([...roofSections, sectionData]);
    
    // Automatically create a panel with the calculated values
    const newPanel = {
      id: nextPanelId,
      name: `Roof Section ${nextPanelId + 1}`,
      kWp: 0, // User will set this
      azimuth: sectionData.azimuth,
      pitch: 20, // Default pitch, user can adjust
      area: sectionData.area
    };
    setPanels([...panels, newPanel]);
    setNextPanelId(nextPanelId + 1);
    
    // Show success message
    console.log(`Created roof section facing ${sectionData.direction} (${sectionData.azimuth}°) with area ${sectionData.area} m²`);
  };

  const handleEditRoofSection = (sectionIndex) => {
    setEditingRoofIndex(sectionIndex);
    setDrawingMode(false); // Disable drawing while editing edges
  };

  const handleEdgeSelectionComplete = (sectionIndex, updatedData) => {
    // Update the roof section with new data
    setRoofSections(prevSections =>
      prevSections.map((section, idx) =>
        idx === sectionIndex 
          ? { ...section, ...updatedData }
          : section
      )
    );

    // Update the corresponding panel
    if (panels[sectionIndex]) {
      setPanels(prevPanels =>
        prevPanels.map((panel, idx) =>
          idx === sectionIndex
            ? { 
                ...panel, 
                azimuth: updatedData.azimuth,
                pitch: updatedData.pitch
              }
            : panel
        )
      );
    }

    // Exit edge selection mode
    setEditingRoofIndex(null);
    
    console.log(`Updated roof section ${sectionIndex} - Direction: ${updatedData.direction} (${updatedData.azimuth}°), Pitch: ${updatedData.pitch}°`);
  };

  const handleCancelEdgeSelection = () => {
    setEditingRoofIndex(null);
  };

  const handleRemovePanel = (panelId) => {
    // Find the index of the panel being removed
    const panelIndex = panels.findIndex(p => p.id === panelId);
    
    // Remove the panel
    setPanels(panels.filter(p => p.id !== panelId));
    
    // Remove the corresponding roof section if it exists
    if (panelIndex >= 0 && panelIndex < roofSections.length) {
      setRoofSections(roofSections.filter((_, idx) => idx !== panelIndex));
    }
  };

  const handlePanelUpdate = (panelId, updates) => {
    setPanels(prevPanels =>
      prevPanels.map(panel =>
        panel.id === panelId ? { ...panel, ...updates } : panel
      )
    );
  };

  const handleAutoFitPanels = (panelId, requestedPanelCount = null) => {
    // Find the corresponding roof section
    const panelIndex = panels.findIndex(p => p.id === panelId);
    if (panelIndex === -1 || !roofSections[panelIndex]) {
      console.error('No roof section found for this panel');
      return;
    }

    const roofSection = roofSections[panelIndex];
    
    // Fit panels to the roof section
    const result = fitPanelsToRoof(roofSection.coordinates, requestedPanelCount);
    
    // Update the panel with the layout and calculated kWp
    handlePanelUpdate(panelId, {
      panelLayout: result.panels,
      panelCount: result.count,
      kWp: result.kWp
    });
    
    console.log(`Auto-fitted ${result.count} panels (${result.kWp} kWp) to roof section`);
  };

  const handleCalculateEnergy = async () => {
    if (!location || panels.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Get irradiance data from NREL
      const irradianceResult = await api.getSolarIrradiance(location.lat, location.lng);

      // Calculate energy production with panels that have capacity
      const validPanels = panels.filter(p => p.kWp > 0);
      if (validPanels.length === 0) {
        setError('Please add at least one panel with capacity > 0 kWp');
        setLoading(false);
        return;
      }

      const energyResult = await api.calculateEnergy(validPanels, irradianceResult, 'monthly');
      setEnergyData(energyResult);
    } catch (err) {
      setError(err.message || 'Failed to calculate energy production');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>☀️ Solar Energy Estimator</h1>
        <p>Estimate your solar panel energy generation - No API keys required! {userLocation && '📍 Using your current location'}</p>
      </header>

      <PropertyManager
        properties={properties}
        activeProperty={activeProperty}
        onSelectProperty={handleSelectProperty}
        onCreateProperty={handleCreateProperty}
        onDeleteProperty={handleDeleteProperty}
        onRenameProperty={handleRenameProperty}
        onReloadProperty={handleReloadProperty}
        onPropertiesImported={handlePropertiesImported}
        autoSaveEnabled={autoSaveEnabled}
        onAutoSaveToggle={handleAutoSaveToggle}
        fileHandle={fileHandle}
      />

      <div className="main-content">
        <div className="sidebar">
          {!(activeProperty && location) && (
            <AddressSearch onAddressSelect={handleAddressSelect} />
          )}
          
          {/* Show change location button when location is set */}
          {location && activeProperty && (
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => {
                  setLocation(null);
                  setRoofData(null);
                  setRoofSections([]);
                  setPanels([]);
                  setEnergyData(null);
                  setNextPanelId(0);
                }}
                style={{
                  width: '100%',
                  background: '#6c757d',
                  padding: '0.75rem',
                  fontSize: '0.9rem'
                }}
              >
                📍 Change Property Location
              </button>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
                {location.formattedAddress}
              </p>
            </div>
          )}

          {loading && (
            <div className="loading">
              <p>Loading...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {location && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
              <button
                onClick={() => setDrawingMode(!drawingMode)}
                style={{
                  width: '100%',
                  background: drawingMode ? '#dc3545' : '#007bff',
                  color: 'white',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                {drawingMode ? '✓ Done Drawing' : '✏️ Draw Roof Sections'}
              </button>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
                {drawingMode 
                  ? 'Click the polygon tool on the map to draw roof outlines. Direction will be calculated automatically!'
                  : 'Draw the outline of each roof section to automatically calculate its direction and area'
                }
              </p>
            </div>
          )}

          {roofData && (
            <RoofEditor
              roofData={roofData}
              panels={panels}
              roofSections={roofSections}
              onPanelUpdate={handlePanelUpdate}
              onAddPanel={handleAddPanel}
              onRemovePanel={handleRemovePanel}
              onCalculate={handleCalculateEnergy}
              onEditRoofSection={handleEditRoofSection}
              onAutoFitPanels={handleAutoFitPanels}
              location={location}
            />
          )}

          {energyData && (
            <div className="chart-section">
              <h3>Energy Production</h3>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Annual Production:</strong> {Math.round(energyData.summary.yearlyProduction)} kWh
              </div>
              <EnergyChart energyData={energyData} />
            </div>
          )}
        </div>

        <div className="map-container">
          <MapView 
            location={location} 
            roofData={roofData} 
            onLocationSelect={!location ? handleMapClick : null}
            userLocation={userLocation}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            drawingMode={drawingMode}
            onPolygonComplete={handlePolygonComplete}
            roofSections={roofSections}
            panels={panels}
            editingRoofIndex={editingRoofIndex}
            onEdgeSelectionComplete={handleEdgeSelectionComplete}
            onCancelEdgeSelection={handleCancelEdgeSelection}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
