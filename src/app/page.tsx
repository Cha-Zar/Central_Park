'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { SensorCard } from '@/components/SensorCard';
import { HealthScore } from '@/components/HealthScore';
import { SensorChart } from '@/components/SensorChart';
import { ActuatorStatusDisplay } from '@/components/ActuatorStatusDisplay';
import { ActuatorControl } from '@/components/ActuatorControl';
import { DeviceSelector } from '@/components/DeviceSelector';
import {
  formatTemp,
  formatHumidity,
  formatLight,
  formatAirQuality,
  formatSoilMoisture,
  formatVPD,
} from '@/lib/utils';
import {
  Droplets,
  Wind,
  Sun,
  Leaf,
  Gauge,
  Cloud,
  Calendar,
  Activity,
  Cpu,
  MapPin,
} from 'lucide-react';

interface SensorData {
  id: string;
  temperature: number;
  humidity: number;
  light: number;
  airQuality: number;
  soilMoisture: number;
  waterLevel: number;
  vpd: number;
  healthScore: number;
  createdAt: string;
}

interface ActuatorStatus {
  fanSpeed: number;
  lightIntensity: number;
  pumpState: boolean;
  waterValveOpen: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  sensorData: SensorData[];
  _count?: { alerts: number };
}

export default function DashboardPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [device, setDevice] = useState<Device | null>(null);
  const [actuatorStatus, setActuatorStatus] = useState<ActuatorStatus | null>(null);
  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!selectedDeviceId) return;

    async function fetchDeviceData() {
      try {
        const response = await fetch(`/api/devices/${selectedDeviceId}`);
        if (!response.ok) throw new Error('Failed to fetch device');
        const data = await response.json();
        setDevice(data.data);
        setLastUpdate(new Date());

        const chartResponse = await fetch(`/api/data?deviceId=${selectedDeviceId}&limit=100`);
        if (!chartResponse.ok) throw new Error('Failed to fetch sensor data');
        const chartResponseData = await chartResponse.json();
        setChartData(chartResponseData.data || []);

        const actuatorResponse = await fetch(`/api/actuators?deviceId=${selectedDeviceId}`);
        if (actuatorResponse.ok) {
          const actuatorData = await actuatorResponse.json();
          if (actuatorData.data) {
            setActuatorStatus(actuatorData.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchDeviceData();
    const interval = setInterval(fetchDeviceData, 5000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  const currentData = device?.sensorData?.[0];
  const activeActuators = actuatorStatus
    ? [
        actuatorStatus.fanSpeed > 0,
        actuatorStatus.lightIntensity > 0,
        actuatorStatus.pumpState,
        actuatorStatus.waterValveOpen,
      ].filter(Boolean).length
    : 0;

  return (
    <>
      <Navigation />
      <div className="park-shell p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 park-panel overflow-hidden">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
              <div>
                <p className="park-kicker mb-3">Central Park command center</p>
                <h1 className="text-4xl font-bold text-stone-50 sm:text-5xl">Dashboard</h1>
                <p className="mt-3 max-w-2xl text-stone-300">
                  Real-time monitoring for the connected growing zone: sensors, health score,
                  actuator state and trends in one operational view.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone-700/70 bg-stone-900/70 p-4">
                  <Activity className="mb-3 h-5 w-5 text-amber-300" />
                  <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Mode</p>
                  <p className="mt-1 text-lg font-semibold text-stone-50">Live</p>
                </div>
                <div className="rounded-lg border border-stone-700/70 bg-stone-900/70 p-4">
                  <Cpu className="mb-3 h-5 w-5 text-sky-300" />
                  <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Device</p>
                  <p className="mt-1 truncate text-lg font-semibold text-stone-50">
                    {device?.name || 'Pending'}
                  </p>
                </div>
                <div className="rounded-lg border border-stone-700/70 bg-stone-900/70 p-4">
                  <MapPin className="mb-3 h-5 w-5 text-emerald-300" />
                  <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Zone</p>
                  <p className="mt-1 truncate text-lg font-semibold text-stone-50">
                    {device?.location || 'Unknown'}
                  </p>
                </div>
                <div className="rounded-lg border border-stone-700/70 bg-stone-900/70 p-4">
                  <Gauge className="mb-3 h-5 w-5 text-indigo-300" />
                  <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Actuators</p>
                  <p className="mt-1 text-lg font-semibold text-stone-50">{activeActuators}/4 active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 max-w-xs rounded-lg border border-stone-700/70 bg-stone-950/50 p-4">
            <DeviceSelector onDeviceChange={setSelectedDeviceId} />
          </div>

          {loading && !device ? (
            <div className="py-12 text-center text-stone-400">Loading device data...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-400">Error: {error}</div>
          ) : !selectedDeviceId ? (
            <div className="py-12 text-center text-stone-400">Please select a device</div>
          ) : device ? (
            <>
              <div className="mb-8">
                <div className="card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold">{device.name}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            device.type === 'master'
                              ? 'bg-sky-400/20 text-sky-300'
                              : 'bg-emerald-400/20 text-emerald-300'
                          }`}
                        >
                          {device.type === 'master' ? 'Master' : 'Slave'}
                        </span>
                      </div>
                      <p className="text-stone-400">{device.location || 'Unknown location'}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {device.type === 'master' ? 'Showing sensor data' : 'Showing actuator controls'}
                      </p>
                    </div>
                    <Leaf className="h-12 w-12 flex-shrink-0 text-amber-300 opacity-70" />
                  </div>
                </div>
              </div>

              {device?.type === 'slave' && actuatorStatus && (
                <div className="mb-8">
                  <h3 className="mb-6 text-2xl font-bold">Actuator Status</h3>
                  <ActuatorStatusDisplay
                    fanSpeed={actuatorStatus.fanSpeed}
                    lightIntensity={actuatorStatus.lightIntensity}
                    pumpState={actuatorStatus.pumpState}
                    waterValveOpen={actuatorStatus.waterValveOpen}
                  />
                </div>
              )}

              {device?.type === 'slave' && actuatorStatus && (
                <div className="mb-8">
                  <h3 className="mb-6 text-2xl font-bold">Manual Controls</h3>
                  <ActuatorControl deviceId={device.id} />
                </div>
              )}

              {device?.type === 'slave' && !actuatorStatus && (
                <div className="py-12 text-center text-stone-400">
                  <p>Waiting for actuator data from slave device...</p>
                </div>
              )}

              {currentData && device?.type === 'master' && (
                <>
                  <h3 className="mb-6 text-2xl font-bold">Sensor Data</h3>
                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="card flex flex-col items-center justify-center p-8">
                      <HealthScore score={currentData.healthScore} size="lg" />
                      <p className="mt-4 text-sm text-stone-400">Overall Plant Health</p>
                    </div>

                    <div className="col-span-1 grid grid-cols-2 gap-4 md:col-span-2">
                      <SensorCard
                        icon={<Calendar className="h-6 w-6" />}
                        title="Last Update"
                        value={lastUpdate?.toLocaleTimeString() || 'N/A'}
                        color="orange"
                      />
                      <SensorCard
                        icon={<Leaf className="h-6 w-6" />}
                        title="Device"
                        value={device?.name || 'Unknown'}
                        color="green"
                      />
                    </div>
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <SensorCard
                      icon={<Wind className="h-6 w-6" />}
                      title="Temperature"
                      value={formatTemp(currentData.temperature)}
                      color="orange"
                    />
                    <SensorCard
                      icon={<Droplets className="h-6 w-6" />}
                      title="Humidity"
                      value={formatHumidity(currentData.humidity)}
                      color="blue"
                    />
                    <SensorCard
                      icon={<Sun className="h-6 w-6" />}
                      title="Light Intensity"
                      value={formatLight(currentData.light)}
                      color="orange"
                    />
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <SensorCard
                      icon={<Cloud className="h-6 w-6" />}
                      title="Air Quality"
                      value={formatAirQuality(currentData.airQuality)}
                      color="purple"
                    />
                    <SensorCard
                      icon={<Gauge className="h-6 w-6" />}
                      title="Soil Moisture"
                      value={formatSoilMoisture(currentData.soilMoisture)}
                      color="green"
                    />
                    <SensorCard
                      icon={<Droplets className="h-6 w-6" />}
                      title="Water Level"
                      value={`${Math.round(currentData.waterLevel || 0)}`}
                      unit="%"
                      color="blue"
                    />
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <SensorCard
                      icon={<Wind className="h-6 w-6" />}
                      title="VPD"
                      value={formatVPD(currentData.vpd)}
                      color="blue"
                    />
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <SensorChart
                      data={chartData as any}
                      title="Temperature (24h)"
                      dataKey="temperature"
                      unit="degC"
                      color="#f59e0b"
                    />
                    <SensorChart
                      data={chartData as any}
                      title="Humidity (24h)"
                      dataKey="humidity"
                      unit="%"
                      color="#38bdf8"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <SensorChart
                      data={chartData as any}
                      title="Light Intensity (24h)"
                      dataKey="light"
                      unit="lux"
                      color="#facc15"
                    />
                    <SensorChart
                      data={chartData as any}
                      title="Health Score Trend (24h)"
                      dataKey="healthScore"
                      unit="%"
                      color="#34d399"
                    />
                  </div>
                </>
              )}

              {!currentData && device?.type === 'master' && (
                <div className="py-12 text-center text-stone-400">
                  <p>Waiting for sensor data from master device...</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-stone-400">No device selected</div>
          )}
        </div>
      </div>
    </>
  );
}
