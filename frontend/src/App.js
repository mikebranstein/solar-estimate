import React, { useState, useEffect } from 'react';
import AddressSearch from './components/AddressSearch';
import MapView from './components/MapView';
import RoofEditor from './components/RoofEditor';
import EnergyChart from './components/EnergyChart';
import api from './services/api';

function App() {
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

  // Load saved location and zoom from localStorage, or use geolocation
  useEffect(() => {
    const savedData = localStorage.getItem('solarEstimatorLastView');
    
    if (savedData) {
      try {
        const { location: savedLocation, zoom: savedZoom, roofData: savedRoofData } = JSON.parse(savedData);
        if (savedLocation && savedLocation.lat && savedLocation.lng) {
          // Restore the selected location, zoom, and roof data
          setLocation(savedLocation);
          setZoom(savedZoom || 12);
          if (savedRoofData) {
            setRoofData(savedRoofData);
          }
          console.log('Restored last viewed location and zoom level');
          return; // Skip geolocation if we have saved location
        }
      } catch (e) {
        console.log('Failed to parse saved location data');
      }
    }
    
    // No saved location, try geolocation
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
      // Geolocation not supported, use Auckland
      setUserLocation({ lat: -36.8485, lng: 174.7633 });
    }
  }, []);

  // Save location, zoom, and roofData to localStorage whenever they change
  useEffect(() => {
    if (location) {
      const dataToSave = {
        location: { 
          lat: location.lat, 
          lng: location.lng,
          formattedAddress: location.formattedAddress 
        },
        zoom: zoom,
        roofData: roofData ? {
          formattedAddress: roofData.formattedAddress,
          lat: roofData.lat,
          lng: roofData.lng
        } : null
      };
      localStorage.setItem('solarEstimatorLastView', JSON.stringify(dataToSave));
      console.log('Saved location and zoom to localStorage');
    }
  }, [location, zoom, roofData]);

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

      // Reset panels when new location is selected
      setPanels([]);
      setNextPanelId(0);
      setEnergyData(null);
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

      // Reset panels when new location is selected
      setPanels([]);
      setNextPanelId(0);
      setEnergyData(null);
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
      kWp: 0,
      azimuth: defaultAzimuth,
      pitch: 20, // Default: 20° pitch
      area: 0,
      enabled: true
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
      kWp: 0, // User will set this
      azimuth: sectionData.azimuth,
      pitch: 20, // Default pitch, user can adjust
      area: sectionData.area,
      enabled: true
    };
    setPanels([...panels, newPanel]);
    setNextPanelId(nextPanelId + 1);
    
    // Show success message
    console.log(`Created roof section facing ${sectionData.direction} (${sectionData.azimuth}°) with area ${sectionData.area} m²`);
  };

  const handleRemovePanel = (panelId) => {
    setPanels(panels.filter(p => p.id !== panelId));
  };

  const handlePanelUpdate = (panelId, updates) => {
    setPanels(prevPanels =>
      prevPanels.map(panel =>
        panel.id === panelId ? { ...panel, ...updates } : panel
      )
    );
  };

  const handleCalculateEnergy = async () => {
    if (!location || panels.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Get irradiance data from NREL
      const irradianceResult = await api.getSolarIrradiance(location.lat, location.lng);

      // Calculate energy production with enabled panels only
      const enabledPanels = panels.filter(p => p.enabled && p.kWp > 0);
      if (enabledPanels.length === 0) {
        setError('Please enable at least one panel with capacity > 0 kWp');
        setLoading(false);
        return;
      }

      const energyResult = await api.calculateEnergy(enabledPanels, irradianceResult, 'monthly');
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
        <h1location && (
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

          {>☀️ Solar Energy Estimator</h1>
        <p>Estimate your solar panel energy generation - No API keys required! {userLocation && '📍 Using your current location'}</p>
      </header>
  drawingMode={drawingMode}
            onPolygonComplete={handlePolygonComplete}
            roofSections={roofSections}
          
      <div className="main-content">
        <div className="sidebar">
          <AddressSearch onAddressSelect={handleAddressSelect} />

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

          {roofData && (
            <RoofEditor
              roofData={roofData}
              panels={panels}
              onPanelUpdate={handlePanelUpdate}
              onAddPanel={handleAddPanel}
              onRemovePanel={handleRemovePanel}
              onCalculate={handleCalculateEnergy}
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
            onLocationSelect={handleMapClick}
            userLocation={userLocation}
            zoom={zoom}
            onZoomChange={handleZoomChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
