'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DeviceSelector } from '@/components/DeviceSelector';
import {
  CheckCircle,
  AlertCircle,
  Wind,
  Droplets,
  Sun,
  Leaf,
  Gauge,
} from 'lucide-react';

interface Settings {
  id: string;
  plantType: string;
  temperatureMin: number;
  temperatureMax: number;
  humidityTarget: number;
  lightTarget: number;
  soilMoistureMin: number;
  vpdTarget: number;
}

interface CurrentData {
  temperature: number;
  humidity: number;
  light: number;
  soilMoisture: number;
  vpd: number;
  waterLevel: number;
}

interface ComparisonMetric {
  name: string;
  current: number;
  target: number | { min: number; max: number };
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

export default function PlantProfilePage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentData, setCurrentData] = useState<CurrentData | null>(null);
  const [metrics, setMetrics] = useState<ComparisonMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDeviceId) return;

    async function fetchData() {
      try {
        // Fetch settings (target values)
        const settingsRes = await fetch(`/api/settings?deviceId=${selectedDeviceId}`);
        const settingsData = await settingsRes.json();
        setSettings(settingsData.data);

        // Fetch latest sensor data
        const dataRes = await fetch(`/api/data?deviceId=${selectedDeviceId}&limit=1`);
        const dataList = await dataRes.json();
        setCurrentData(dataList.data[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  // Calculate metrics when data changes
  useEffect(() => {
    if (!settings || !currentData) return;

    const newMetrics: ComparisonMetric[] = [];

    // Temperature comparison
    const tempStatus =
      currentData.temperature >= settings.temperatureMin &&
      currentData.temperature <= settings.temperatureMax
        ? 'good'
        : currentData.temperature < settings.temperatureMin - 2 ||
          currentData.temperature > settings.temperatureMax + 2
        ? 'critical'
        : 'warning';

    newMetrics.push({
      name: 'Temperature',
      current: Math.round(currentData.temperature * 10) / 10,
      target: {
        min: settings.temperatureMin,
        max: settings.temperatureMax,
      },
      unit: '°C',
      status: tempStatus,
      icon: <Wind className="w-6 h-6" />,
    });

    // Humidity comparison
    const humidityStatus =
      Math.abs(currentData.humidity - settings.humidityTarget) <= 10
        ? 'good'
        : Math.abs(currentData.humidity - settings.humidityTarget) <= 20
        ? 'warning'
        : 'critical';

    newMetrics.push({
      name: 'Humidity',
      current: Math.round(currentData.humidity * 10) / 10,
      target: settings.humidityTarget,
      unit: '%',
      status: humidityStatus,
      icon: <Droplets className="w-6 h-6" />,
    });

    // Light comparison
    const lightStatus =
      currentData.light >= settings.lightTarget * 0.8
        ? 'good'
        : currentData.light >= settings.lightTarget * 0.6
        ? 'warning'
        : 'critical';

    newMetrics.push({
      name: 'Light Intensity',
      current: Math.round(currentData.light),
      target: settings.lightTarget,
      unit: 'lux',
      status: lightStatus,
      icon: <Sun className="w-6 h-6" />,
    });

    // Soil Moisture comparison
    const soilStatus =
      currentData.soilMoisture >= settings.soilMoistureMin
        ? 'good'
        : currentData.soilMoisture >= settings.soilMoistureMin - 10
        ? 'warning'
        : 'critical';

    newMetrics.push({
      name: 'Soil Moisture',
      current: Math.round(currentData.soilMoisture),
      target: settings.soilMoistureMin,
      unit: '%',
      status: soilStatus,
      icon: <Gauge className="w-6 h-6" />,
    });

    // VPD comparison
    const vpdStatus =
      Math.abs(currentData.vpd - settings.vpdTarget) <= 0.2
        ? 'good'
        : Math.abs(currentData.vpd - settings.vpdTarget) <= 0.4
        ? 'warning'
        : 'critical';

    newMetrics.push({
      name: 'VPD',
      current: Math.round(currentData.vpd * 100) / 100,
      target: settings.vpdTarget,
      unit: 'kPa',
      status: vpdStatus,
      icon: <Leaf className="w-6 h-6" />,
    });

    setMetrics(newMetrics);
  }, [settings, currentData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-600 bg-green-900/20';
      case 'warning':
        return 'border-yellow-600 bg-yellow-900/20';
      case 'critical':
        return 'border-red-600 bg-red-900/20';
      default:
        return 'border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'good') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Plant Profile</h1>
            <p className="text-gray-400">
              Compare actual vs target values for optimal growth
            </p>
          </div>

          {/* Device Selector */}
          <div className="mb-8 max-w-xs">
            <DeviceSelector onDeviceChange={setSelectedDeviceId} />
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : !settings ? (
            <div className="card p-8 text-center">
              <p className="text-gray-400 mb-4">No settings configured for this device</p>
              <a
                href="/settings"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
              >
                Configure Plant Settings
              </a>
            </div>
          ) : (
            <>
              {/* Plant Info */}
              <div className="card p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{settings.plantType}</h2>
                    <p className="text-gray-400">Configured plant type</p>
                  </div>
                  <Leaf className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className={`card border-2 ${getStatusColor(metric.status)} p-6`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">{metric.name}</p>
                        <p className="text-2xl font-bold">
                          {metric.current} <span className="text-sm text-gray-400">{metric.unit}</span>
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {metric.icon}
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>

                    {/* Target Value */}
                    <div className="border-t border-gray-700 pt-3 text-sm">
                      <p className="text-gray-400 mb-1">Target:</p>
                      {typeof metric.target === 'number' ? (
                        <p className="font-semibold text-gray-300">
                          {metric.target} {metric.unit}
                        </p>
                      ) : (
                        <p className="font-semibold text-gray-300">
                          {metric.target.min} - {metric.target.max} {metric.unit}
                        </p>
                      )}
                    </div>

                    {/* Status Message */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      {metric.status === 'good' && (
                        <p className="text-green-400 text-xs">✓ Within optimal range</p>
                      )}
                      {metric.status === 'warning' && (
                        <p className="text-yellow-400 text-xs">⚠ Slightly off target</p>
                      )}
                      {metric.status === 'critical' && (
                        <p className="text-red-400 text-xs">✕ Action required</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Water Level (informational only) */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Other Sensors</h3>
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 mb-2">Water Tank Level</p>
                      <p className="text-3xl font-bold">
                        {currentData?.waterLevel || 0}
                        <span className="text-xl text-gray-400 ml-2">%</span>
                      </p>
                    </div>
                    <Droplets className="w-12 h-12 text-blue-400 opacity-50" />
                  </div>
                  {(currentData?.waterLevel || 0) < 30 && (
                    <p className="text-yellow-400 text-sm mt-4">⚠ Water level running low</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
