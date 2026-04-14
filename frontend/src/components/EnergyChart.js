import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function EnergyChart({ breakdown }) {
  const data = [
    { name: 'Base', value: breakdown.base, fill: '#0055FF' },
    { name: 'Temp', value: breakdown.temperature, fill: '#FFB020' },
    { name: 'Drag', value: breakdown.drag, fill: '#FF3B30' },
    { name: 'Elevation', value: breakdown.elevation, fill: '#8B5CF6' },
    { name: 'Traffic', value: breakdown.traffic, fill: '#F59E0B' },
    { name: 'Regen', value: breakdown.regen, fill: '#10B981' },
    { name: 'Aux', value: breakdown.auxiliary, fill: '#A1A1AA' },
  ];

  const total = breakdown.total;

  return (
    <div data-testid="energy-chart-section">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
          Energy Breakdown
        </p>
        <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
          TOTAL: {total} kWh
        </p>
      </div>
      <div
        className="p-4 rounded-md border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ left: -20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}
              formatter={(value) => [`${value} kWh (${((value/total)*100).toFixed(1)}%)`, 'Energy']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-2 gap-y-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {item.name}: <span className="font-bold text-primary" style={{ color: 'var(--text-primary)' }}>{((item.value/total)*100).toFixed(1)}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
