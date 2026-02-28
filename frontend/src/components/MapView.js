import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

function MapView({ location, roofData }) {
  const center = location ? { lat: location.lat, lng: location.lng } : defaultCenter;

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={location ? 20 : 12}
        mapTypeId="satellite"
        options={{
          tilt: 0,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {location && (
          <Marker
            position={center}
            title="Your Location"
          />
        )}

        {/* TODO: Render roof segments as polygons */}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapView;
