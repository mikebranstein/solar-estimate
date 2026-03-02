import React, { useState, useRef } from 'react';
import { getPropertySummary, exportProperties, importProperties } from '../utils/propertyStorage';

function PropertyManager({ 
  properties, 
  activeProperty, 
  onSelectProperty, 
  onCreateProperty, 
  onDeleteProperty,
  onRenameProperty,
  onReloadProperty,
  onPropertiesImported,
  autoSaveEnabled,
  onAutoSaveToggle
}) {
  const [showManager, setShowManager] = useState(false);
  const [showNewPropertyDialog, setShowNewPropertyDialog] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const fileInputRef = useRef(null);

  const handleCreateProperty = () => {
    if (newPropertyName.trim()) {
      onCreateProperty(newPropertyName.trim());
      setNewPropertyName('');
      setShowNewPropertyDialog(false);
    }
  };

  const handleRename = (propertyId) => {
    if (editingName.trim()) {
      onRenameProperty(propertyId, editingName.trim());
      setEditingPropertyId(null);
      setEditingName('');
    }
  };

  const startRename = (property) => {
    setEditingPropertyId(property.id);
    setEditingName(property.name);
  };

  const cancelRename = () => {
    setEditingPropertyId(null);
    setEditingName('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleExportToFile = () => {
    try {
      const jsonData = exportProperties();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `solar-properties-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting properties:', error);
      alert('Failed to export properties. Please try again.');
    }
  };

  const handleImportFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target.result;
        const success = importProperties(jsonData);
        
        if (success) {
          if (onPropertiesImported) {
            onPropertiesImported();
          }
          alert('Properties imported successfully!');
        } else {
          alert('Failed to import properties. Please check the file format.');
        }
      } catch (error) {
        console.error('Error importing properties:', error);
        alert('Failed to import properties. Please check the file format.');
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="property-manager">
      {/* Property Selector Bar */}
      <div className="property-bar">
        <div className="property-selector">
          <button
            className="property-toggle"
            onClick={() => setShowManager(!showManager)}
            title="Manage Properties"
          >
            🏠 {activeProperty ? activeProperty.name : 'Select Property'}
            <span className="dropdown-arrow">{showManager ? '▲' : '▼'}</span>
          </button>
          {properties.length > 0 && (
            <span className="property-count">
              {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>
        <div className="property-actions-bar">
          {activeProperty && onReloadProperty && (
            <button
              className="btn-reload-property"
              onClick={onReloadProperty}
              title="Reload current property data"
            >
              🔄 Reload
            </button>
          )}
          <button
            className="btn-new-property"
            onClick={() => setShowNewPropertyDialog(true)}
            title="Add New Property"
          >
            + New Property
          </button>
        </div>
      </div>

      {/* Property Manager Dropdown */}
      {showManager && (
        <div className="property-dropdown">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Your Properties</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoSaveEnabled || false}
                  onChange={(e) => onAutoSaveToggle && onAutoSaveToggle(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span title="Automatically save to file when changes are made">🔄 Auto-save</span>
              </label>
              <button
                onClick={handleExportToFile}
                className="btn-export"
                title="Save all properties to file"
                disabled={properties.length === 0}
              >
                💾 Save to File
              </button>
              <button
                onClick={triggerFileInput}
                className="btn-import"
                title="Load properties from file"
              >
                📂 Load from File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFromFile}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          {properties.length === 0 ? (
            <div className="empty-state">
              <p>No properties saved yet.</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>
                Click "New Property" to get started!
              </p>
            </div>
          ) : (
            <div className="property-list">
              {properties.map(property => {
                const summary = getPropertySummary(property);
                const isActive = activeProperty?.id === property.id;
                const isEditing = editingPropertyId === property.id;

                return (
                  <div
                    key={property.id}
                    className={`property-item ${isActive ? 'active' : ''} ${!isActive && !isEditing ? 'clickable' : ''}`}
                  >
                    <div className="property-header">
                      {isEditing ? (
                        <div className="rename-input-group">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(property.id);
                              if (e.key === 'Escape') cancelRename();
                            }}
                            autoFocus
                            className="rename-input"
                          />
                          <button
                            onClick={() => handleRename(property.id)}
                            className="btn-icon"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelRename}
                            className="btn-icon"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="property-title">
                            <h4>
                              {property.name}
                              {isActive && <span className="active-badge">Current</span>}
                            </h4>
                            {!isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProperty(property.id);
                                }}
                                className="btn-select-property"
                              >
                                ⚡ Load Property
                              </button>
                            )}
                          </div>
                          <div className="property-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(property);
                              }}
                              className="btn-icon"
                              title="Rename"
                            >
                              ✎
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete "${property.name}"? This cannot be undone.`)) {
                                  onDeleteProperty(property.id);
                                }
                              }}
                              className="btn-icon btn-delete"
                              title="Delete"
                            >
                              🗑
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div 
                        className="property-details"
                        onClick={() => !isActive && onSelectProperty(property.id)}
                      >
                        <div className="detail-row">
                          <span className="detail-label">📍 Location:</span>
                          <span className="detail-value">{summary.address}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">🏘️ Roof Sections:</span>
                          <span className="detail-value">{summary.roofSectionCount}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">⚡ Total Capacity:</span>
                          <span className="detail-value">{summary.totalCapacity.toFixed(1)} kWp</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📐 Total Area:</span>
                          <span className="detail-value">{summary.totalArea.toFixed(1)} m²</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">🕐 Last Updated:</span>
                          <span className="detail-value">{formatDate(summary.lastUpdated)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New Property Dialog */}
      {showNewPropertyDialog && (
        <div className="modal-overlay" onClick={() => setShowNewPropertyDialog(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Property</h3>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>
              Give your property a name (you can change this later)
            </p>
            <input
              type="text"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProperty();
                if (e.key === 'Escape') setShowNewPropertyDialog(false);
              }}
              placeholder="e.g., My Home, Rental Property, Beach House"
              autoFocus
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowNewPropertyDialog(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProperty}
                className="btn-primary"
                disabled={!newPropertyName.trim()}
              >
                Create Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyManager;
