'use client';

import { useState, useEffect } from 'react';
import {
  Wind,
  Sun,
  Droplets,
  Zap,
} from 'lucide-react';

interface ActuatorStatus {
  fanSpeed: number;
  lightIntensity: number;
  pumpState: boolean;
  waterValveOpen: boolean;
}

interface ActuatorControlProps {
  deviceId: string;
}

export function ActuatorControl({ deviceId }: ActuatorControlProps) {
  const [actuatorStatus, setActuatorStatus] = useState<ActuatorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>('');

  useEffect(() => {
    fetchActuatorStatus();
    const interval = setInterval(fetchActuatorStatus, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const fetchActuatorStatus = async () => {
    try {
      const response = await fetch(`/api/actuators?deviceId=${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        setActuatorStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching actuator status:', error);
    }
  };

  const sendCommand = async (action: string, value?: number, duration?: number) => {
    setLoading(true);
    try {
      const commandData: any = {
        action,
        deviceId,
      };

      if (value !== undefined) commandData.value = value;
      if (duration !== undefined) commandData.duration = duration;

      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commandData),
      });

      if (response.ok) {
        setUpdateMessage('Command sent!');
        setTimeout(() => setUpdateMessage(''), 2000);
        fetchActuatorStatus();
      }
    } catch (error) {
      setUpdateMessage('Failed to send command');
      console.error('Error sending command:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!actuatorStatus) {
    return <div className="text-gray-400">Loading actuator status...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Fan Control */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wind className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Fan Control</h3>
          </div>
          <span className="text-2xl font-bold text-blue-400">{actuatorStatus.fanSpeed}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={actuatorStatus.fanSpeed}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            setActuatorStatus({ ...actuatorStatus, fanSpeed: newValue });
            sendCommand('fan', newValue);
          }}
          disabled={loading}
          className="w-full accent-blue-500"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => sendCommand('fan', 0)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Off
          </button>
          <button
            onClick={() => sendCommand('fan', 50)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-sm"
          >
            50%
          </button>
          <button
            onClick={() => sendCommand('fan', 100)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-sm"
          >
            Max
          </button>
        </div>
      </div>

      {/* Light Control */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sun className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold">Light Control</h3>
          </div>
          <span className="text-2xl font-bold text-yellow-400">{actuatorStatus.lightIntensity}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={actuatorStatus.lightIntensity}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            setActuatorStatus({ ...actuatorStatus, lightIntensity: newValue });
            sendCommand('light', newValue);
          }}
          disabled={loading}
          className="w-full accent-yellow-500"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => sendCommand('light', 0)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Off
          </button>
          <button
            onClick={() => sendCommand('light', 50)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded text-sm"
          >
            50%
          </button>
          <button
            onClick={() => sendCommand('light', 100)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded text-sm"
          >
            Max
          </button>
        </div>
      </div>

      {/* Pump Control */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold">Pump (Irrigation)</h3>
          </div>
          <span
            className={`text-lg font-bold ${
              actuatorStatus.pumpState ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            {actuatorStatus.pumpState ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => sendCommand('water', 0)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Stop
          </button>
          <button
            onClick={() => sendCommand('water', 1, 10)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-600 rounded"
          >
            Water (10s)
          </button>
          <button
            onClick={() => sendCommand('water', 1, 30)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-600 rounded"
          >
            Water (30s)
          </button>
        </div>
      </div>

      {/* Valve Control */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-semibold">Water Valve (Tank Refill)</h3>
          </div>
          <span
            className={`text-lg font-bold ${
              actuatorStatus.waterValveOpen ? 'text-cyan-400' : 'text-gray-400'
            }`}
          >
            {actuatorStatus.waterValveOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => sendCommand('valve', 0)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Close
          </button>
          <button
            onClick={() => sendCommand('valve', 1)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded"
          >
            Open (Fill)
          </button>
        </div>
      </div>

      {/* Update Message */}
      {updateMessage && (
        <div className="text-center py-2 px-4 bg-gray-700 rounded text-sm">
          {updateMessage}
        </div>
      )}
    </div>
  );
}
