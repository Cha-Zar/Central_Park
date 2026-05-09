'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { SensorChart } from '@/components/SensorChart';
import { DeviceSelector } from '@/components/DeviceSelector';

interface SensorData {
  id: string;
  temperature: number;
  humidity: number;
  light: number;
  airQuality: number;
  soilMoisture: number;
  vpd: number;
  healthScore: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    if (!selectedDeviceId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const limits = {
          '24h': 100,
          '7d': 500,
          '30d': 1000,
        };

        const response = await fetch(
          `/api/data?deviceId=${selectedDeviceId}&limit=${limits[timeRange]}`
        );
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setChartData(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDeviceId, timeRange]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">History</h1>
            <p className="text-gray-400">Historical sensor data and trends</p>
          </div>

          {/* Device Selector */}
          <div className="mb-8 max-w-xs">
            <DeviceSelector onDeviceChange={setSelectedDeviceId} />
          </div>

          {/* Time Range Selector */}
          <div className="mb-8 flex gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading data...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-12">Error: {error}</div>
          ) : (
            <>
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SensorChart
                  data={chartData as any}
                  title="Temperature"
                  dataKey="temperature"
                  unit="°C"
                  color="#f97316"
                />
                <SensorChart
                  data={chartData as any}
                  title="Humidity"
                  dataKey="humidity"
                  unit="%"
                  color="#3b82f6"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SensorChart
                  data={chartData as any}
                  title="Light Intensity"
                  dataKey="light"
                  unit="lux"
                  color="#eab308"
                />
                <SensorChart
                  data={chartData as any}
                  title="Soil Moisture"
                  dataKey="soilMoisture"
                  unit="%"
                  color="#84cc16"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SensorChart
                  data={chartData as any}
                  title="Air Quality"
                  dataKey="airQuality"
                  color="#a855f7"
                />
                <SensorChart
                  data={chartData as any}
                  title="Health Score"
                  dataKey="healthScore"
                  unit="%"
                  color="#10b981"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SensorChart
                  data={chartData as any}
                  title="VPD"
                  dataKey="vpd"
                  unit="kPa"
                  color="#06b6d4"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
