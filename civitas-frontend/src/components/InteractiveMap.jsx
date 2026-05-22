import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// FIX: Use CDN URLs instead of require() to avoid webpack issues with leaflet images
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function LocationMarker({ onLocationChange }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) onLocationChange(e.latlng);
    },
  });
  return null;
}

function InteractiveMap({ onLocationChange, position }) {
  const defaultCenter = [12.9716, 77.5946]; // Bengaluru
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    if (position && position.lat && position.lon) {
      setMarkerPosition({ lat: position.lat, lng: position.lon });
    }
  }, [position]);

  const handleInternalLocationChange = (latlng) => {
    setMarkerPosition(latlng);
    if (onLocationChange) onLocationChange(latlng);
  };

  return (
    <div className="map-container" style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', marginTop: '8px' }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        {markerPosition && <ChangeView center={markerPosition} zoom={16} />}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationChange={handleInternalLocationChange} />
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default InteractiveMap;