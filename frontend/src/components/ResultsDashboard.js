import React from 'react';
import EnergyChart from './EnergyChart';
import ChargingStops from './ChargingStops';
import {
  ArrowLeft, Route, Clock, Thermometer, Wind,
  Battery, BatteryWarning, Zap, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function ResultsDashboard({ result, onReset }) {
  const isCritical = result.finalCharge < 0;
  const isWarning = result.finalCharge >= 0 && result.finalCharge < 20;
  const isGood = result.finalCharge >= 20;

  const statusColor = isCritical ? '#FF3B30' : isWarning ? '#FFB020' : '#00C48C';
  const StatusIcon = isCritical ? BatteryWarning : isWarning ? AlertTriangle : CheckCircle2;

  return (
    <div className="space-y-4 animate-fade-in" data-testid="results-dashboard">
      {/* Back Button */}
      <button
        data-testid="back-button"
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:-translate-x-0.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={14} />
        New Trip
      </button>

      {/* Status Banner */}
      <div
        className="p-4 rounded-md border flex items-center gap-3"
        style={{ borderColor: statusColor, background: `${statusColor}10` }}
        data-testid="trip-status-banner"
      >
        <StatusIcon size={22} style={{ color: statusColor }} />
        <div>
          <p className="text-sm font-bold" style={{ color: statusColor }}>
            {isCritical
              ? 'Charging Required'
              : isWarning
              ? 'Low Battery on Arrival'
              : 'Trip Feasible'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {isCritical
              ? 'You need to charge during this trip.'
              : isWarning
              ? `You'll arrive with only ${result.finalCharge}% charge.`
              : `You'll arrive with ${result.finalCharge}% charge.`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Route size={15} />}
          label="Distance"
          value={`${result.distance} km`}
          testId="stat-distance"
        />
        <StatCard
          icon={<Clock size={15} />}
          label="ETA"
          value={result.eta}
          testId="stat-eta"
        />
        <StatCard
          icon={<Thermometer size={15} />}
          label="Temperature"
          value={`${result.temperature}°C`}
          testId="stat-temperature"
        />
        <StatCard
          icon={<Wind size={15} />}
          label="Wind Speed"
          value={`${result.windSpeed} m/s`}
          testId="stat-wind"
        />
        <StatCard
          icon={<Zap size={15} />}
          label="Energy Required"
          value={`${result.energyRequired} kWh`}
          accent
          testId="stat-energy"
        />
        <StatCard
          icon={<Battery size={15} />}
          label="Final Charge"
          value={`${Math.max(result.finalCharge, 0)}%`}
          color={statusColor}
          testId="stat-final-charge"
        />
      </div>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="space-y-2" data-testid="warnings-section">
          {result.warnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-md border text-xs font-medium"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
                background: 'var(--surface)',
              }}
              data-testid={`warning-${i}`}
            >
              <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: '#FFB020' }} />
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Energy Chart */}
      {result.energyBreakdown && (
        <EnergyChart breakdown={result.energyBreakdown} />
      )}

      {/* Charging Stops */}
      {result.chargingStops && result.chargingStops.length > 0 && (
        <ChargingStops stops={result.chargingStops} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent, color, testId }) {
  return (
    <div
      className="p-3 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}
      data-testid={testId}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: color || (accent ? '#0055FF' : 'var(--text-secondary)') }}>{icon}</span>
        <span className="text-[10px] tracking-[0.15em] uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <p
        className="text-lg font-black font-heading"
        style={{ color: color || (accent ? '#0055FF' : 'var(--text-primary)') }}
      >
        {value}
      </p>
    </div>
  );
}
