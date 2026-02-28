import React from 'react';

function RoofEditor({ roofData, panels, onPanelUpdate, onCalculate }) {
  const handleTogglePanel = (panelId) => {
    const panel = panels.find(p => p.id === panelId);
    onPanelUpdate(panelId, { enabled: !panel.enabled });
  };

  const handleKwpChange = (panelId, value) => {
    onPanelUpdate(panelId, { kWp: parseFloat(value) || 0 });
  };

  return (
    <div className="roof-editor">
      <h3>Configure Solar Panels</h3>
      
      {roofData.message && (
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {roofData.message}
        </p>
      )}

      {roofData.solarPotential && (
        <div style={{ 
          background: '#e8f4f8', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Solar Potential</h4>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
            <strong>Max Panels:</strong> {roofData.solarPotential.maxArrayPanelsCount || 'N/A'}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
            <strong>Max Area:</strong> {Math.round(roofData.solarPotential.maxArrayAreaMeters2 || 0)} m²
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
            <strong>Sunshine Hours/Year:</strong> {Math.round(roofData.solarPotential.maxSunshineHoursPerYear || 0)}
          </p>
        </div>
      )}

      <div className="panel-list">
        {panels.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
            No roof segments detected. You can still manually configure panels.
          </p>
        ) : (
          panels.map(panel => (
            <div key={panel.id} className="panel-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Roof Segment {panel.id + 1}</h4>
                <label>
                  <input
                    type="checkbox"
                    checked={panel.enabled}
                    onChange={() => handleTogglePanel(panel.id)}
                  />
                  {' '}Enable
                </label>
              </div>
              
              <p><strong>Azimuth:</strong> {Math.round(panel.azimuth)}° (South = 180°)</p>
              <p><strong>Pitch:</strong> {Math.round(panel.pitch)}°</p>
              {panel.area > 0 && <p><strong>Area:</strong> {Math.round(panel.area)} m²</p>}
              
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Panel Capacity (kWp):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={panel.kWp}
                  onChange={(e) => handleKwpChange(panel.id, e.target.value)}
                  disabled={!panel.enabled}
                  style={{ margin: 0 }}
                  placeholder="e.g., 5.0"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onCalculate}
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={panels.filter(p => p.enabled && p.kWp > 0).length === 0}
      >
        Calculate Energy Production
      </button>
    </div>
  );
}

export default RoofEditor;
