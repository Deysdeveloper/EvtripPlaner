import React from 'react';
import { BatteryCharging, Navigation } from 'lucide-react';

export default function ChargingStops({ stops }) {
  return (
    <div data-testid="charging-stops-section">
      <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
        Suggested Charging Stops
      </p>
      <div className="space-y-2">
        {stops.map((stop, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
            }}
            data-testid={`charging-stop-${i}`}
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: '#FFB02020' }}>
              <BatteryCharging size={16} style={{ color: '#FFB020' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {stop.name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Navigation size={10} />
                  {stop.distanceFromStart} km
                </span>
                <span className="text-[10px] font-medium" style={{ color: '#FFB020' }}>
                  Battery: {stop.batteryAtStop}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
