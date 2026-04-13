import React, { useState } from 'react';
import { Battery, Gauge, Loader2, AlertCircle } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

export default function TripForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    start: '',
    end: '',
    batteryCapacity: 60,
    efficiency: 0.15,
    initialCharge: 80,
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.start.trim() || !form.end.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in" data-testid="trip-form">
      {/* Location Inputs */}
      <div className="space-y-3">
        <label className="text-[10px] tracking-[0.2em] uppercase font-bold block" style={{ color: 'var(--text-secondary)' }}>
          Route
        </label>
        <AddressAutocomplete
          value={form.start}
          onChange={(val) => setForm((prev) => ({ ...prev, start: val }))}
          placeholder="Start location (e.g. New Delhi)"
          iconColor="#00C48C"
          testId="start-location-input"
        />
        <AddressAutocomplete
          value={form.end}
          onChange={(val) => setForm((prev) => ({ ...prev, end: val }))}
          placeholder="Destination (e.g. Mumbai)"
          iconColor="#FF3B30"
          testId="end-location-input"
        />
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: 'var(--border)' }} />

      {/* Vehicle Details */}
      <div className="space-y-3">
        <label className="text-[10px] tracking-[0.2em] uppercase font-bold block" style={{ color: 'var(--text-secondary)' }}>
          Vehicle Specs
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Battery size={13} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Battery (kWh)</span>
            </div>
            <input
              data-testid="battery-capacity-input"
              type="number"
              step="1"
              min="10"
              max="200"
              value={form.batteryCapacity}
              onChange={handleChange('batteryCapacity')}
              className="w-full px-3 py-2.5 text-sm font-semibold rounded-md border focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Gauge size={13} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Efficiency (kWh/km)</span>
            </div>
            <input
              data-testid="efficiency-input"
              type="number"
              step="0.01"
              min="0.05"
              max="1"
              value={form.efficiency}
              onChange={handleChange('efficiency')}
              className="w-full px-3 py-2.5 text-sm font-semibold rounded-md border focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Battery Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Starting Battery</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }} data-testid="battery-percentage-display">
              {form.initialCharge}%
            </span>
          </div>
          <input
            data-testid="initial-charge-input"
            type="range"
            min="10"
            max="100"
            value={form.initialCharge}
            onChange={handleChange('initialCharge')}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #0055FF ${form.initialCharge}%, var(--border) ${form.initialCharge}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>10%</span>
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>100%</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in" data-testid="error-message">
          <AlertCircle size={16} className="text-critical mt-0.5 shrink-0" />
          <p className="text-xs text-critical font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        data-testid="calculate-route-button"
        type="submit"
        disabled={loading || !form.start.trim() || !form.end.trim()}
        className="w-full py-3 rounded-md text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Calculating Route...
          </>
        ) : (
          'Calculate Trip'
        )}
      </button>

      {/* Quick Presets */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
          Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tesla Model 3', cap: 60, eff: 0.15 },
            { label: 'Nissan Leaf', cap: 40, eff: 0.17 },
            { label: 'BMW iX', cap: 105, eff: 0.20 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              data-testid={`preset-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setForm((prev) => ({ ...prev, batteryCapacity: preset.cap, efficiency: preset.eff }))}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-md border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
                background: 'var(--surface)',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
