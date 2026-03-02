import React, { useState } from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { 
  getPolygonEdges, 
  findLikelyRidge, 
  findLikelyEave,
  calculateAzimuthFromRidge,
  calculatePitchFromEdges
} from '../utils/edgeSelection';
import { getCardinalDirection, getSolarEfficiency, getHemisphere } from '../utils/roofCalculations';

/**
 * EdgeSelector - Component for selecting ridge and eave edges on a roof polygon
 */
function EdgeSelector({ 
  roofSection, 
  sectionIndex,
  onEdgeSelectionComplete,
  onCancel 
}) {
  const [selectedRidgeIndex, setSelectedRidgeIndex] = useState(null);
  const [selectedEaveIndex, setSelectedEaveIndex] = useState(null);
  const [mode, setMode] = useState('ridge'); // 'ridge' or 'eave'

  const edges = getPolygonEdges(roofSection.coordinates);
  const suggestedRidge = findLikelyRidge(edges);

  const handleEdgeClick = (edgeIndex) => {
    if (mode === 'ridge') {
      setSelectedRidgeIndex(edgeIndex);
      setMode('eave');
    } else if (mode === 'eave') {
      setSelectedEaveIndex(edgeIndex);
    }
  };

  const handleUseSuggested = () => {
    if (suggestedRidge) {
      setSelectedRidgeIndex(suggestedRidge.index);
      const suggestedEave = findLikelyEave(edges, suggestedRidge);
      if (suggestedEave) {
        setSelectedEaveIndex(suggestedEave.index);
      }
      setMode('eave');
    }
  };

  const handleCalculate = () => {
    if (selectedRidgeIndex === null) return;

    const ridgeEdge = edges[selectedRidgeIndex];
    const latitude = roofSection.coordinates[0].lat;
    
    // Calculate azimuth from ridge
    const azimuth = calculateAzimuthFromRidge(
      { start: ridgeEdge.start, end: ridgeEdge.end },
      latitude
    );

    // Calculate pitch if eave is selected
    let pitch = roofSection.pitch || 20; // Default if no eave selected
    if (selectedEaveIndex !== null) {
      const eaveEdge = edges[selectedEaveIndex];
      pitch = calculatePitchFromEdges(
        { start: ridgeEdge.start, end: ridgeEdge.end },
        { start: eaveEdge.start, end: eaveEdge.end }
      );
    }

    const direction = getCardinalDirection(azimuth);
    const hemisphere = getHemisphere(latitude);
    const efficiency = getSolarEfficiency(azimuth, hemisphere);

    onEdgeSelectionComplete(sectionIndex, {
      azimuth,
      pitch,
      direction,
      efficiency,
      ridgeEdgeIndex: selectedRidgeIndex,
      eaveEdgeIndex: selectedEaveIndex
    });
  };

  const handleSkipEave = () => {
    handleCalculate();
  };

  return (
    <>
      {/* Edge overlay lines */}
      {edges.map((edge, idx) => {
        const isRidge = idx === selectedRidgeIndex;
        const isEave = idx === selectedEaveIndex;
        const isSuggested = suggestedRidge && idx === suggestedRidge.index && selectedRidgeIndex === null;
        
        let color = '#3388ff';
        let weight = 4;
        let opacity = 0.6;

        if (isRidge) {
          color = '#ff4444';
          weight = 6;
          opacity = 1;
        } else if (isEave) {
          color = '#44ff44';
          weight = 6;
          opacity = 1;
        } else if (isSuggested) {
          color = '#ffaa00';
          weight = 5;
          opacity = 0.8;
        }

        return (
          <React.Fragment key={`edge-${idx}`}>
            <Polyline
              positions={[[edge.start.lat, edge.start.lng], [edge.end.lat, edge.end.lng]]}
              pathOptions={{
                color,
                weight,
                opacity
              }}
              eventHandlers={{
                click: () => handleEdgeClick(idx)
              }}
            />
            {/* Midpoint marker for easier clicking */}
            <CircleMarker
              center={[edge.midpoint.lat, edge.midpoint.lng]}
              radius={8}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2
              }}
              eventHandlers={{
                click: () => handleEdgeClick(idx)
              }}
            >
              <Tooltip direction="top" permanent={false}>
                {isRidge ? '🔺 Ridge (Top)' : 
                 isEave ? '🔻 Eave (Bottom)' :
                 isSuggested ? '⚠️ Suggested Ridge' :
                 `Edge ${idx + 1} - ${edge.length.toFixed(1)}m`}
              </Tooltip>
            </CircleMarker>
          </React.Fragment>
        );
      })}

      {/* Control Panel */}
      <div className="edge-selector-panel">
        <div className="edge-selector-header">
          <h4>🎯 Refine Roof Direction</h4>
          <button onClick={onCancel} className="btn-close-selector">✕</button>
        </div>

        <div className="edge-selector-body">
          <div className="step-indicator">
            <div className={`step ${mode === 'ridge' ? 'active' : selectedRidgeIndex !== null ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Select Ridge (Top)</span>
            </div>
            <div className={`step ${mode === 'eave' ? 'active' : selectedEaveIndex !== null ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Select Eave (Bottom)</span>
            </div>
          </div>

          {mode === 'ridge' && (
            <div className="instruction">
              <p><strong>Step 1:</strong> Click the <span style={{color: '#ff4444'}}>red line</span> that represents the <strong>ridge</strong> (top/peak) of the roof.</p>
              {suggestedRidge && (
                <button onClick={handleUseSuggested} className="btn-use-suggested">
                  ⚡ Use Suggested Ridge (Longest Edge)
                </button>
              )}
            </div>
          )}

          {mode === 'eave' && selectedRidgeIndex !== null && (
            <div className="instruction">
              <p><strong>Step 2 (Optional):</strong> Click the <span style={{color: '#44ff44'}}>green line</span> that represents the <strong>eave</strong> (bottom edge) to calculate roof pitch.</p>
              <div className="edge-actions">
                <button onClick={handleSkipEave} className="btn-skip">
                  Skip & Use Default Pitch
                </button>
                {selectedEaveIndex !== null && (
                  <button onClick={handleCalculate} className="btn-calculate">
                    ✓ Calculate Direction & Pitch
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedRidgeIndex !== null && (
            <div className="selection-summary">
              <div className="summary-item">
                <span className="summary-label">Ridge:</span>
                <span className="summary-value">Edge {selectedRidgeIndex + 1} ({edges[selectedRidgeIndex].length.toFixed(1)}m)</span>
              </div>
              {selectedEaveIndex !== null && (
                <div className="summary-item">
                  <span className="summary-label">Eave:</span>
                  <span className="summary-value">Edge {selectedEaveIndex + 1} ({edges[selectedEaveIndex].length.toFixed(1)}m)</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="edge-selector-legend">
          <div className="legend-item">
            <span className="legend-color" style={{background: '#ff4444'}}></span>
            <span>Ridge (Top)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{background: '#44ff44'}}></span>
            <span>Eave (Bottom)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{background: '#ffaa00'}}></span>
            <span>Suggested</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{background: '#3388ff'}}></span>
            <span>Unselected</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default EdgeSelector;
