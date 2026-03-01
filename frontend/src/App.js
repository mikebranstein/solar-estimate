import React, { useState } from 'react';
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
    const newPanel = {
      id: nextPanelId,
      kWp: 0,
      azimuth: 180, // Default: South-facing
      pitch: 20, // Default: 20° pitch
      area: 0,
      enabled: true
    };
    setPanels([...panels, newPanel]);
    setNextPanelId(nextPanelId + 1);
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
        <h1>☀️ Solar Energy Estimator</h1>
        <p>Estimate your solar panel energy generation - No API keys required!</p>
      </header>

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
          />
        </div>
      </div>
    </div>
  );
}

export default App;
