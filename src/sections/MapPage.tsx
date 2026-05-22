// ============================================
// Map Page - Leaflet Map Integration
// ============================================

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Layers, Navigation } from 'lucide-react';
import { useApp } from '@/App';

// Fix Leaflet marker icons in bundler
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const { state } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Central Park, NYC
  const center: [number, number] = [40.775, -73.98];

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add route polyline
    const routeCoords: [number, number][] = [
      [40.768, -73.981],
      [40.770, -73.978],
      [40.773, -73.975],
      [40.776, -73.974],
      [40.779, -73.973],
      [40.782, -73.974],
      [40.784, -73.976],
      [40.786, -73.978],
      [40.787, -73.981],
      [40.788, -73.985],
      [40.787, -73.989],
      [40.785, -73.992],
      [40.782, -73.995],
      [40.779, -73.997],
      [40.776, -73.998],
      [40.773, -73.997],
      [40.770, -73.995],
      [40.768, -73.991],
      [40.767, -73.987],
      [40.768, -73.981],
    ];

    const routeLine = L.polyline(routeCoords, {
      color: '#FC4C02',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Start and end markers
    L.circleMarker(routeCoords[0], {
      radius: 6,
      fillColor: '#10B981',
      color: '#fff',
      weight: 2,
      fillOpacity: 1,
    }).addTo(map).bindPopup('Start');

    L.circleMarker(routeCoords[routeCoords.length - 1], {
      radius: 6,
      fillColor: '#FC4C02',
      color: '#fff',
      weight: 2,
      fillOpacity: 1,
    }).addTo(map).bindPopup('Finish');

    map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] relative">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Top Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 z-[400] md:left-8 md:right-auto md:w-80"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <MapIcon className="w-5 h-5 text-strava-orange" />
            <h2 className="text-sm font-bold text-gray-900">Route Explorer</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">Central Park Loop — 12.5km</p>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-strava-orange text-white rounded-lg text-xs font-medium">
              <Navigation className="w-3.5 h-3.5" />
              Navigate
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              Layers
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Activity Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 left-4 right-4 z-[400] md:left-auto md:right-8 md:w-80"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 card-shadow max-h-48 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Routes</h3>
          <div className="space-y-2">
            {state.activities.slice(0, 3).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                {activity.mapImage && (
                  <img
                    src={activity.mapImage}
                    alt=""
                    className="w-12 h-8 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{activity.title}</p>
                  <p className="text-[11px] text-gray-400">{activity.distance.toFixed(1)}km · {Math.floor(activity.elevationGain)}m elev</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
