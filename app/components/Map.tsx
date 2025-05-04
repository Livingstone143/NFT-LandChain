'use client'
import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    surveyNumber: string;
    owner: string;
    area: string;
  }>;
}

const Map = ({ 
  center = [12.9716, 77.5946], // Default center (Bangalore)
  zoom = 13,
  markers = [
    {
      position: [12.9716, 77.5946],
      title: 'Example Land',
      surveyNumber: 'SRV001',
      owner: 'John Doe',
      area: '1000 sq.m'
    }
  ]
}: MapProps) => {
  useEffect(() => {
    // Fix the default icon issue by setting up leaflet icons 
    // this ensures markers show up correctly even without the physical icon files
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
    
    // Set our custom icon (optional)
    L.Marker.prototype.options.icon = icon;
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((marker, index) => (
        <Marker 
          key={index} 
          position={marker.position} 
          icon={icon}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{marker.title}</h3>
              <p>Survey #: {marker.surveyNumber}</p>
              <p>Owner: {marker.owner}</p>
              <p>Area: {marker.area}</p>
              <button className="mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map; 