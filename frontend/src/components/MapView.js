import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polygon, Tooltip, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import { calculateRoofAzimuth, calculatePolygonArea, getCardinalDirection, calculateCentroid, getHemisphere, getSolarEfficiency } from '../utils/roofCalculations';
import EdgeSelector from './EdgeSelector';

// Fix for default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle location changes and preserve zoom
function MapController({ location, zoom }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (location) {
      const currentZoom = map.getZoom();
      // If zoomed in close (>= 19), keep current zoom; otherwise use provided zoom or default to 21
      const newZoom = currentZoom >= 19 ? currentZoom : (zoom || 21);
      map.setView([location.lat, location.lng], newZoom);
    }
  }, [location, zoom, map]);
  
  return null;
}

// Component to handle map clicks
function LocationMarker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to track zoom changes
function ZoomHandler({ onZoomChange }) {
  const map = useMap();
  
  React.useEffect(() => {
    const handleZoomEnd = () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    };
    
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);
  
  return null;
}

// Component to handle drawing tools
function DrawingControl({ onPolygonComplete, drawingMode }) {
  const map = useMap();
  const drawControlRef = React.useRef(null);
  const drawnItemsRef = React.useRef(new L.FeatureGroup());

  React.useEffect(() => {
    // Add the drawn items layer to the map
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    // Initialize drawing control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: drawingMode ? {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#3388ff',
            fillOpacity: 0.3,
            weight: 3
          }
        } : false,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: true
      }
    });

    if (drawingMode) {
      map.addControl(drawControl);
      drawControlRef.current = drawControl;
    }

    // Handle polygon creation
    const onDrawCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      // Extract coordinates from the polygon
      const latlngs = layer.getLatLngs()[0];
      const coordinates = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));

      // Calculate roof properties with hemisphere awareness
      const latitude = coordinates[0].lat;
      const hemisphere = getHemisphere(latitude);
      const azimuth = calculateRoofAzimuth(coordinates, latitude);
      const area = calculatePolygonArea(coordinates);
      const direction = getCardinalDirection(azimuth);
      const efficiency = getSolarEfficiency(azimuth, hemisphere);

      // Pass the data to parent component
      if (onPolygonComplete) {
        onPolygonComplete({
          coordinates,
          azimuth,
          area,
          direction,
          hemisphere,
          efficiency
        });
      }
    };

    // Handle polygon edits
    const onDrawEdited = (e) => {
      e.layers.eachLayer((layer) => {
        const latlngs = layer.getLatLngs()[0];
        const coordinates = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));
        const azimuth = calculateRoofAzimuth(coordinates);
        const area = calculatePolygonArea(coordinates);
        const direction = getCardinalDirection(azimuth);

        console.log('Polygon edited:', { azimuth, area, direction });
      });
    };

    map.on(L.Draw.Event.CREATED, onDrawCreated);
    map.on(L.Draw.Event.EDITED, onDrawEdited);

    return () => {
      map.off(L.Draw.Event.CREATED, onDrawCreated);
      map.off(L.Draw.Event.EDITED, onDrawEdited);
      
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      
      map.removeLayer(drawnItems);
    };
  }, [map, onPolygonComplete, drawingMode]);

  return null;
}

// Component to display roof sections with labels
function RoofSections({ sections, panels = [], location, editingRoofIndex = null }) {
  if (!sections || sections.length === 0) return null;

  // Determine hemisphere from location
  const hemisphere = location ? getHemisphere(location.lat) : 'northern';

  // Calculate label positions to avoid overlaps
  const calculateLabelOffset = (index, totalSections) => {
    // Distribute labels around the sections in a circular pattern
    const angle = (index / totalSections) * 360;
    const radiusLat = 0.00008; // Approximately 9 meters
    const radiusLng = 0.00012; // Adjust for longitude
    
    return {
      lat: Math.sin(angle * Math.PI / 180) * radiusLat,
      lng: Math.cos(angle * Math.PI / 180) * radiusLng
    };
  };

  return (
    <>
      {sections.map((section, index) => {
        const positions = section.coordinates.map(c => [c.lat, c.lng]);
        const centroid = calculateCentroid(section.coordinates);
        
        // Get efficiency rating based on hemisphere
        const efficiency = section.efficiency || getSolarEfficiency(section.azimuth, section.hemisphere || hemisphere);
        const color = efficiency.color;
        
        // Get panel name if available
        const panelName = panels[index]?.name || `Roof Section ${index + 1}`;
        
        // Hide label when this section is being edited
        const isBeingEdited = editingRoofIndex === index;
        
        // Calculate offset position for label
        const offset = calculateLabelOffset(index, sections.length);
        const labelPosition = centroid ? {
          lat: centroid.lat + offset.lat,
          lng: centroid.lng + offset.lng
        } : null;

        return (
          <React.Fragment key={index}>
            <Polygon
              positions={positions}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isBeingEdited ? 0.15 : 0.3,
                weight: isBeingEdited ? 2 : 3
              }}
            />
            
            {/* Label positioned away from roof with connecting line */}
            {centroid && labelPosition && !isBeingEdited && (
              <>
                {/* Connecting line from centroid to label */}
                <Polyline
                  positions={[
                    [centroid.lat, centroid.lng],
                    [labelPosition.lat, labelPosition.lng]
                  ]}
                  pathOptions={{
                    color: '#333',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '5, 5'
                  }}
                />
                
                {/* Small circle at centroid */}
                <CircleMarker
                  center={[centroid.lat, centroid.lng]}
                  radius={4}
                  pathOptions={{
                    color: '#333',
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 2
                  }}
                />
                
                {/* Label positioned away from roof */}
                <Marker
                  position={[labelPosition.lat, labelPosition.lng]}
                  icon={L.divIcon({
                    className: 'roof-label-marker',
                    html: `
                      <div class="roof-label-content" style="background-color: ${color}; border-color: ${color};">
                        <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">${panelName}</div>
                        <div style="font-size: 11px;">${section.direction} • ${section.azimuth}°</div>
                        <div style="font-size: 11px;">${section.area} m² • ${efficiency.rating.toUpperCase()}</div>
                      </div>
                    `,
                    iconSize: [120, 60],
                    iconAnchor: [60, 30]
                  })}
                />
              </>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

function MapView({ 
  location, 
  roofData, 
  onLocationSelect, 
  userLocation, 
  zoom, 
  onZoomChange,
  drawingMode = false,
  onPolygonComplete,
  roofSections = [],
  panels = [],
  editingRoofIndex = null,
  onEdgeSelectionComplete,
  onCancelEdgeSelection
}) {
  const defaultCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [-36.8485, 174.7633]; // Auckland, New Zealand fallback
  
  const center = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom || 12}
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Handle location changes and zoom preservation */}
        <MapController location={location} zoom={zoom} />
        
        {/* Track zoom changes */}
        {onZoomChange && <ZoomHandler onZoomChange={onZoomChange} />}
        
        {/* Click handler for manual location selection */}
        {onLocationSelect && !drawingMode && <LocationMarker onLocationSelect={onLocationSelect} />}
        
        {/* Drawing tools for roof sections */}
        {drawingMode && onPolygonComplete && (
          <DrawingControl 
            onPolygonComplete={onPolygonComplete}
            drawingMode={drawingMode}
          />
        )}
        
        {/* Display existing roof sections */}
        <RoofSections sections={roofSections} panels={panels} location={location} editingRoofIndex={editingRoofIndex} />
        
        {/* Edge selector for refining roof direction */}
        {editingRoofIndex !== null && roofSections[editingRoofIndex] && (
          <EdgeSelector
            roofSection={roofSections[editingRoofIndex]}
            sectionIndex={editingRoofIndex}
            onEdgeSelectionComplete={onEdgeSelectionComplete}
            onCancel={onCancelEdgeSelection}
          />
        )}
        
        {/* Satellite Imagery Tile Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          maxZoom={22}
          maxNativeZoom={19}
        />
        
        {/* Street Labels Overlay */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/only_labels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={22}
          maxNativeZoom={19}
        />

        {location && (
          <Marker position={center}>
            <Popup>
              {roofData?.formattedAddress || 'Your Location'}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: '0.9rem',
        maxWidth: '90%',
        textAlign: 'center'
      }}>
        {drawingMode ? (
          location ? (
            <span>
              ✏️ Click the polygon tool on the right to draw roof sections. 
              {getHemisphere(location.lat) === 'northern' 
                ? ' 🔷 South-facing roofs will be highlighted in green.' 
                : ' 🔶 North-facing roofs will be highlighted in green.'}
            </span>
          ) : (
            <span>✏️ Click the polygon tool on the right to draw roof sections. The direction will be calculated automatically!</span>
          )
        ) : location ? (
          <span>
            💡 View your roof from satellite imagery ({getHemisphere(location.lat) === 'northern' ? 'Northern' : 'Southern'} Hemisphere), then configure panels below
          </span>
        ) : (
          <span>🗺️ {userLocation ? 'Showing your current location - ' : ''}Click on the map to select a location or search by address above</span>
        )}
      </div>
    </div>
  );
}

export default MapView;
