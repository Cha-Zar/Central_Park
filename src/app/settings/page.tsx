'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DeviceSelector } from '@/components/DeviceSelector';

interface Settings {
  id: string;
  plantType: string;
  humidityTarget: number;
  lightTarget: number;
  temperatureMin: number;
  temperatureMax: number;
  vpdTarget: number;
  soilMoistureMin: number;
}

export default function SettingsPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [_settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    plantType: '',
    humidityTarget: 60,
    lightTarget: 500,
    temperatureMin: 18,
    temperatureMax: 28,
    vpdTarget: 1.0,
    soilMoistureMin: 30,
  });

  useEffect(() => {
    if (!selectedDeviceId) return;

    async function fetchSettings() {
      setLoading(true);
      try {
        const response = await fetch(`/api/settings?deviceId=${selectedDeviceId}`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
          setFormData({
            plantType: data.data.plantType,
            humidityTarget: data.data.humidityTarget,
            lightTarget: data.data.lightTarget,
            temperatureMin: data.data.temperatureMin,
            temperatureMax: data.data.temperatureMax,
            vpdTarget: data.data.vpdTarget,
            soilMoistureMin: data.data.soilMoistureMin,
          });
        } else {
          // Default settings for new devices
          setFormData({
            plantType: 'Generic Plant',
            humidityTarget: 60,
            lightTarget: 500,
            temperatureMin: 18,
            temperatureMax: 28,
            vpdTarget: 1.0,
            soilMoistureMin: 30,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [selectedDeviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      const data = await response.json();
      setSettings(data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Configure plant monitoring parameters</p>
          </div>

          {/* Device Selector */}
          <div className="mb-8 max-w-xs">
            <DeviceSelector onDeviceChange={setSelectedDeviceId} />
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading settings...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Plant Configuration */}
              <div className="card p-6">
                <h2 className="text-2xl font-semibold mb-6">Plant Configuration</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plant Type</label>
                    <select
                      name="plantType"
                      value={formData.plantType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Generic Plant">Generic Plant</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Lettuce">Lettuce</option>
                      <option value="Basil">Basil</option>
                      <option value="Mint">Mint</option>
                      <option value="Pepper">Pepper</option>
                      <option value="Cucumber">Cucumber</option>
                      <option value="Herb Mix">Herb Mix</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Environmental Targets */}
              <div className="card p-6">
                <h2 className="text-2xl font-semibold mb-6">Environmental Targets</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Humidity Target (%)
                    </label>
                    <input
                      type="number"
                      name="humidityTarget"
                      value={formData.humidityTarget}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Optimal humidity level</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Light Target (lux)
                    </label>
                    <input
                      type="number"
                      name="lightTarget"
                      value={formData.lightTarget}
                      onChange={handleChange}
                      min="0"
                      step="10"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Optimal light intensity</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Temperature Min (°C)
                    </label>
                    <input
                      type="number"
                      name="temperatureMin"
                      value={formData.temperatureMin}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum temperature</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Temperature Max (°C)
                    </label>
                    <input
                      type="number"
                      name="temperatureMax"
                      value={formData.temperatureMax}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum temperature</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      VPD Target (kPa)
                    </label>
                    <input
                      type="number"
                      name="vpdTarget"
                      value={formData.vpdTarget}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Vapor Pressure Deficit target</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Soil Moisture Min (%)
                    </label>
                    <input
                      type="number"
                      name="soilMoistureMin"
                      value={formData.soilMoistureMin}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum soil moisture</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg text-green-300">
                  Settings saved successfully!
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
