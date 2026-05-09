'use client';

import { useEffect, useState } from 'react';

interface Device {
  id: string;
  name: string;
  type: string;  // 'master' or 'slave'
  macAddress: string;
  location: string;
  isActive: boolean;
}

interface DeviceSelectorProps {
  onDeviceChange: (deviceId: string) => void;
}

export function DeviceSelector({ onDeviceChange }: DeviceSelectorProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await fetch('/api/devices');
        if (!response.ok) throw new Error('Failed to fetch devices');
        const data = await response.json();
        setDevices(data.data || []);
        
        // Auto-select first device
        if (data.data?.[0]) {
          const firstDeviceId = data.data[0].id;
          setSelectedId(firstDeviceId);
          onDeviceChange(firstDeviceId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []); // Remove onDeviceChange from dependency array

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedId(newId);
    onDeviceChange(newId);
  };

  if (loading) {
    return <div className="text-stone-400">Loading devices...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  if (devices.length === 0) {
    return (
      <div className="text-stone-400">
        No devices found. Configure your ESP32 to connect to the system.
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Device</label>
      <select
        value={selectedId}
        onChange={handleSelectChange}
        className="w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-white focus:outline-none focus:border-amber-400"
      >
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.type === 'master' ? '🔵 Master' : '🟢 Slave'} - {device.name} - {device.location}
          </option>
        ))}
      </select>
    </div>
  );
}
