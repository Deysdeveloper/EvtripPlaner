import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function BatteryChart({ curve }) {
  if (!curve || curve.length === 0) return null;

  return (
    <div data-testid="battery-chart-section">
      <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
        Battery Level Over Distance
      </p>
      <div
        className="p-4 rounded-md border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCharge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0055FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0055FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="distance" 
              tick={{ fontSize: 9, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              unit=" km"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}
              formatter={(value) => [`${value}%`, 'Battery']}
              labelFormatter={(label) => `${label} km`}
            />
            <Area 
              type="monotone" 
              dataKey="charge" 
              stroke="#0055FF" 
              fillOpacity={1} 
              fill="url(#colorCharge)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
