'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ChartDataPoint {
  createdAt: string;
  [key: string]: string | number;
}

interface SensorChartProps {
  data: ChartDataPoint[];
  title: string;
  dataKey: string;
  unit?: string;
  color?: string;
}

export function SensorChart({ data, title, dataKey, unit, color = '#3b82f6' }: SensorChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-stone-400">No data available</p>
      </div>
    );
  }

  // Format data for chart
  const formattedData = data.map((item) => ({
    ...item,
    time: format(new Date(item.createdAt), 'HH:mm'),
  }));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData.reverse()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
          <XAxis dataKey="time" stroke="#a8a29e" />
          <YAxis stroke="#a8a29e" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #57534e' }}
            labelStyle={{ color: '#fafaf9' }}
            formatter={(value) => `${value}${unit ? ` ${unit}` : ''}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
            isAnimationActive={false}
            name={`${title}${unit ? ` (${unit})` : ''}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
