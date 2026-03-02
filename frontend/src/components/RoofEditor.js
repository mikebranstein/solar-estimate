import React, { useState } from 'react';

function RoofEditor({ roofData, panels, roofSections = [], onPanelUpdate, onCalculate, onAddPanel, onRemovePanel, onEditRoofSection, location }) {
  // Determine hemisphere from location
  const hemisphere = location && location.lat >= 0 ? 'Northern' : 'Southern';
  const optimalDirection = hemisphere === 'Northern' ? 'South (180°)' : 'North (0°)';
  
  // Track which panel name is being edited
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  
  const handleStartEditName = (panelId, currentName) => {
    setEditingNameId(panelId);
    setEditingNameValue(currentName || `Roof Surface ${panelId + 1}`);
  };
  
  const handleSaveName = (panelId) => {
    onPanelUpdate(panelId, { name: editingNameValue });
    setEditingNameId(null);
    setEditingNameValue('');
  };
  
  const handleCancelEditName = () => {
    setEditingNameId(null);
    setEditingNameValue('');
  };
  
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
          panels.map((panel, panelIndex) => (
            <div key={panel.id} className="panel-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  {editingNameId === panel.id ? (
                    // Editing mode: show text input with save/cancel buttons
                    <div>
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(panel.id);
                          if (e.key === 'Escape') handleCancelEditName();
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '2px solid #667eea',
                          borderRadius: '4px',
                          fontSize: '0.95rem',
                          margin: 0,
                          marginBottom: '0.5rem'
                        }}
                        placeholder="Enter roof section name"
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSaveName(panel.id)}
                          style={{
                            flex: 1,
                            padding: '0.4rem',
                            fontSize: '0.85rem',
                            background: '#28a745'
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          style={{
                            flex: 1,
                            padding: '0.4rem',
                            fontSize: '0.85rem',
                            background: '#6c757d'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode: show label with edit icon
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.35rem 0'
                      }}
                    >
                      <h4 style={{ 
                        margin: 0, 
                        fontWeight: '600', 
                        fontSize: '1.05rem', 
                        color: '#333',
                        flex: 1
                      }}>
                        {panel.name || `Roof Surface ${panel.id + 1}`}
                      </h4>
                      <button
                        onClick={() => handleStartEditName(panel.id, panel.name)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ddd',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="Rename section"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
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
              {roofSections[panelIndex] && onEditRoofSection && (
                <button
                  onClick={() => onEditRoofSection(panelIndex)}
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
