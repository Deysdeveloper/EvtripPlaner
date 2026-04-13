import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function EnergyChart({ breakdown }) {
  const data = [
    { name: 'Base', value: breakdown.base, fill: '#0055FF' },
    { name: 'Temp', value: breakdown.temperatureAdjustment, fill: '#FFB020' },
    { name: 'Speed', value: breakdown.speedAdjustment, fill: '#FF3B30' },
    { name: 'Wind', value: breakdown.windAdjustment, fill: '#A1A1AA' },
    { name: 'Total', value: breakdown.total, fill: '#00C48C' },
  ];

  return (
    <div data-testid="energy-chart-section">
      <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
        Energy Breakdown
      </p>
      <div
        className="p-4 rounded-md border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={35}
              unit=" kWh"
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              formatter={(value) => [`${value} kWh`, 'Energy']}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
