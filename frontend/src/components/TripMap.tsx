import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TripMapProps {
  lat: number;
  lng: number;
}

const carIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 14px; height: 14px; border-radius: 9999px;
    background: #4FA8FF; border: 2px solid #0A0E14;
    box-shadow: 0 0 0 4px rgba(79,168,255,0.25);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export function TripMap({ lat, lng }: TripMapProps) {
  const [trail, setTrail] = useState<[number, number][]>([]);

  useEffect(() => {
    setTrail((prev) => [...prev, [lat, lng] as [number, number]].slice(-200));
  }, [lat, lng]);

  return (
    <div className="h-full min-h-[280px] overflow-hidden rounded-lg border border-line">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#12171F' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={trail} pathOptions={{ color: '#4FA8FF', weight: 3, opacity: 0.7 }} />
        <Marker position={[lat, lng]} icon={carIcon} />
        <Recenter lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
