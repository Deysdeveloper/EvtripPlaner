import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView({ tripResult, darkMode }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: darkMode
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
      center: [78.9629, 20.5937],
      zoom: 4,
      attributionControl: false,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.current.on('load', () => setMapLoaded(true));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style on theme change
  useEffect(() => {
    if (!map.current) return;
    const style = darkMode
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';
    map.current.setStyle(style);
    map.current.once('style.load', () => {
      if (tripResult) {
        addRouteToMap(tripResult);
      }
    });
  }, [darkMode]);

  // Draw route when tripResult changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !tripResult) return;
    addRouteToMap(tripResult);
  }, [tripResult, mapLoaded]);

  function addRouteToMap(result) {
    const m = map.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing layers/sources
    if (m.getLayer('route-line')) m.removeLayer('route-line');
    if (m.getLayer('route-line-bg')) m.removeLayer('route-line-bg');
    if (m.getSource('route')) m.removeSource('route');

    // Add route source
    m.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: result.routeGeometry,
      },
    });

    // Route background (wider, for glow effect)
    m.addLayer({
      id: 'route-line-bg',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#0055FF',
        'line-width': 8,
        'line-opacity': 0.25,
      },
    });

    // Route main line
    m.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#0055FF',
        'line-width': 4,
        'line-opacity': 0.9,
      },
    });

    // Start marker
    const startEl = createMarkerEl('#00C48C', 'A');
    const startMarker = new mapboxgl.Marker({ element: startEl })
      .setLngLat(result.startCoords)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Start'))
      .addTo(m);
    markersRef.current.push(startMarker);

    // End marker
    const endEl = createMarkerEl('#FF3B30', 'B');
    const endMarker = new mapboxgl.Marker({ element: endEl })
      .setLngLat(result.endCoords)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Destination'))
      .addTo(m);
    markersRef.current.push(endMarker);

    // Charging stop markers
    if (result.chargingStops) {
      result.chargingStops.forEach((stop, i) => {
        const el = createMarkerEl('#FFB020', (i + 1).toString());
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(stop.location)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>${stop.name}</strong><br/>Battery: ${stop.batteryAtStop}%<br/>${stop.distanceFromStart} km from start`
            )
          )
          .addTo(m);
        markersRef.current.push(marker);
      });
    }

    // Fit bounds
    const coords = result.routeGeometry.coordinates;
    const bounds = coords.reduce(
      (b, coord) => b.extend(coord),
      new mapboxgl.LngLatBounds(coords[0], coords[0])
    );
    m.fitBounds(bounds, { padding: 60, duration: 1000 });
  }

  function createMarkerEl(color, label) {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 32px; height: 32px; border-radius: 50%;
      background: ${color}; display: flex; align-items: center;
      justify-content: center; color: white; font-weight: 700;
      font-size: 13px; font-family: 'Chivo', sans-serif;
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    `;
    el.textContent = label;
    return el;
  }

  return (
    <div ref={mapContainer} className="w-full h-full" data-testid="mapbox-map">
      {!tripResult && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="glass-panel rounded-md px-6 py-4 text-center max-w-xs animate-fade-in">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Enter your trip details to see the route
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
