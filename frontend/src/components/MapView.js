import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const defaultCenter = [37.7749, -122.4194]; // San Francisco

// Component to handle location changes and preserve zoom
function MapController({ location }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (location) {
      const currentZoom = map.getZoom();
      // If zoomed in close (>= 19), keep current zoom; otherwise zoom to 21
      const newZoom = currentZoom >= 19 ? currentZoom : 21;
      map.setView([location.lat, location.lng], newZoom);
    }
  }, [location, map]);
  
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

function MapView({ location, roofData, onLocationSelect }) {
  const center = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={12}
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Handle location changes and zoom preservation */}
        <MapController location={location} />
        
        {/* Click handler for manual location selection */}
        {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}
        
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
        {location ? (
          <span>💡 View your roof from satellite imagery, then configure panels below</span>
        ) : (
          <span>🗺️ Click on the map to select a location or search by address above</span>
        )}
      </div>
    </div>
  );
}

export default MapView;
