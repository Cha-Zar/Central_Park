'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { SensorCard } from '@/components/SensorCard';
import { HealthScore } from '@/components/HealthScore';
import { ActuatorControl } from '@/components/ActuatorControl';
import {
  formatTemp,
  formatHumidity,
  formatLight,
  formatAirQuality,
  formatSoilMoisture,
  formatVPD,
} from '@/lib/utils';
import { Droplets, Wind, Sun, Gauge, Cloud } from 'lucide-react';

interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
  airQuality: number;
  soilMoisture: number;
  vpd: number;
  healthScore: number;
}

interface Device {
  id: string;
  name: string;
  location: string;
  sensorData: SensorData[];
}

export default function DevicePage() {
  const params = useParams();
  const deviceId = params.id as string;
  
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevice() {
      try {
        const response = await fetch(`/api/devices/${deviceId}`);
        if (!response.ok) throw new Error('Failed to fetch device');
        const data = await response.json();
        setDevice(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDevice();
    const interval = setInterval(fetchDevice, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const currentData = device?.sensorData?.[0];

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-gray-400">Loading device...</div>
        </div>
      </>
    );
  }

  if (error || !device) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-400">Error: {error || 'Device not found'}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{device.name}</h1>
            <p className="text-gray-400">{device.location}</p>
          </div>

          {currentData ? (
            <>
              {/* Health Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-8 flex flex-col items-center justify-center">
                  <HealthScore score={currentData.healthScore} size="lg" />
                </div>

                {/* Key Metrics */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                  <SensorCard
                    icon={<Wind className="w-6 h-6" />}
                    title="Temperature"
                    value={formatTemp(currentData.temperature)}
                    color="orange"
                  />
                  <SensorCard
                    icon={<Droplets className="w-6 h-6" />}
                    title="Humidity"
                    value={formatHumidity(currentData.humidity)}
                    color="blue"
                  />
                </div>
              </div>

              {/* All Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SensorCard
                  icon={<Sun className="w-6 h-6" />}
                  title="Light Intensity"
                  value={formatLight(currentData.light)}
                  color="orange"
                />
                <SensorCard
                  icon={<Cloud className="w-6 h-6" />}
                  title="Air Quality"
                  value={formatAirQuality(currentData.airQuality)}
                  color="purple"
                />
                <SensorCard
                  icon={<Gauge className="w-6 h-6" />}
                  title="Soil Moisture"
                  value={formatSoilMoisture(currentData.soilMoisture)}
                  color="green"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <SensorCard
                  icon={<Wind className="w-6 h-6" />}
                  title="VPD"
                  value={formatVPD(currentData.vpd)}
                  color="blue"
                />
              </div>

              {/* Actuator Controls */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Actuator Controls</h2>
                <ActuatorControl deviceId={deviceId} />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">No sensor data available</div>
          )}
        </div>
      </div>
    </>
  );
}
