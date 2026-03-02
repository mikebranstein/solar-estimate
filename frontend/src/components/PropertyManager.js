import React, { useState } from 'react';
import { getPropertySummary } from '../utils/propertyStorage';

function PropertyManager({ 
  properties, 
  activeProperty, 
  onSelectProperty, 
  onCreateProperty, 
  onDeleteProperty,
  onRenameProperty 
}) {
  const [showManager, setShowManager] = useState(false);
  const [showNewPropertyDialog, setShowNewPropertyDialog] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingName, setEditingName] = useState('');

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
        <button
          className="btn-new-property"
          onClick={() => setShowNewPropertyDialog(true)}
          title="Add New Property"
        >
          + New Property
        </button>
      </div>

      {/* Property Manager Dropdown */}
      {showManager && (
        <div className="property-dropdown">
          <h3>Your Properties</h3>
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
