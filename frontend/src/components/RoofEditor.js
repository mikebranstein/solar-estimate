import React from 'react';

function RoofEditor({ roofData, panels, roofSections = [], onPanelUpdate, onCalculate, onAddPanel, onRemovePanel, onEditRoofSection, location }) {
  // Determine hemisphere from location
  const hemisphere = location && location.lat >= 0 ? 'Northern' : 'Southern';
  const optimalDirection = hemisphere === 'Northern' ? 'South (180°)' : 'North (0°)';
  
  const handleFieldChange = (panelId, field, value) => {
    onPanelUpdate(panelId, { [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="roof-editor">
      <h3>Configure Solar Panels</h3>
      
      {location && (
        <p style={{ 
          color: '#666', 
          fontSize: '0.85rem', 
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#e3f2fd',
          borderRadius: '4px',
          borderLeft: '3px solid #2196f3'
        }}>
          <strong>📍 {hemisphere} Hemisphere</strong><br />
          Optimal direction: {optimalDirection}
        </p>
      )}
      
      {roofData?.message && (
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem', 
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#e8f4f8',
          borderRadius: '4px'
        }}>
          {roofData.message}
        </p>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={onAddPanel}
          style={{ 
            width: '100%', 
            background: '#28a745',
            marginBottom: '0.5rem'
          }}
        >
          + Add Roof Surface
        </button>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
          Add each roof surface facing a different direction
        </p>
      </div>

      <div className="panel-list">
        {panels.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#999',
            background: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <p style={{ margin: '0 0 1rem 0' }}>No roof surfaces added yet</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Click "Add Roof Surface" to get started
            </p>
          </div>
        ) : (
          panels.map(panel => (
            <div key={panel.id} className="panel-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '600', fontSize: '1rem', margin: 0, color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                    {panel.name || `Roof Surface ${panel.id + 1}`}
                  </label>
                  <input
                    type="text"
                    value={panel.name || `Roof Surface ${panel.id + 1}`}
                    onChange={(e) => onPanelUpdate(panel.id, { name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      margin: 0
                    }}
                    placeholder="Enter roof section name"
                  />
                </div>
                <button
                  onClick={() => onRemovePanel(panel.id)}
                  style={{
                    background: '#dc3545',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    marginLeft: '0.75rem'
                  }}
                >
                  Remove
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    Panel Capacity (kWp):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={panel.kWp}
                    onChange={(e) => handleFieldChange(panel.id, 'kWp', e.target.value)}
                    style={{ margin: 0 }}
                    placeholder="e.g., 5.0"
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>Total panel power</small>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    Azimuth (°):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="360"
                    value={panel.azimuth}
                    onChange={(e) => handleFieldChange(panel.id, 'azimuth', e.target.value)}
                    style={{ margin: 0 }}
                    placeholder="180"
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>0=N, 90=E, 180=S, 270=W</small>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    Pitch/Tilt (°):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="90"
                    value={panel.pitch}
                    onChange={(e) => handleFieldChange(panel.id, 'pitch', e.target.value)}
                    style={{ margin: 0 }}
                    placeholder="20"
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>0=flat, 90=vertical</small>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    Area (m²):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={panel.area}
                    onChange={(e) => handleFieldChange(panel.id, 'area', e.target.value)}
                    style={{ margin: 0 }}
                    placeholder="30"
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>Optional</small>
                </div>
              </div>

              {/* Edit Edges button - only show if this panel has a corresponding roof section */}
              {roofSections[panel.id] && onEditRoofSection && (
                <button
                  onClick={() => onEditRoofSection(panel.id)}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    background: '#6c757d',
                    padding: '0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  ✏️ Edit Roof Edges (Refine Direction)
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={onCalculate}
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={panels.filter(p => p.kWp > 0).length === 0}
      >
        Calculate Energy Production
      </button>

      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        background: '#fff3cd', 
        borderRadius: '4px',
        fontSize: '0.85rem'
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
          <li>South-facing (180°) is optimal in Northern Hemisphere</li>
          <li>Typical roof pitch: 15-30°</li>
          <li>Average residential system: 5-10 kWp</li>
        </ul>
      </div>
    </div>
  );
}

export default RoofEditor;
