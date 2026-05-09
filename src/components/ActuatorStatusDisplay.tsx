'use client';

import { Wind, Sun, Droplets, Zap } from 'lucide-react';

interface ActuatorStatusProps {
  fanSpeed: number;
  lightIntensity: number;
  pumpState: boolean;
  waterValveOpen: boolean;
}

export function ActuatorStatusDisplay({ 
  fanSpeed, 
  lightIntensity, 
  pumpState, 
  waterValveOpen 
}: ActuatorStatusProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Fan Speed */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wind className="w-6 h-6 text-blue-400" />
            <h3 className="font-semibold">Fan</h3>
          </div>
          <span className="text-2xl font-bold text-blue-400">{fanSpeed}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${fanSpeed}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {fanSpeed === 0 ? 'Off' : fanSpeed < 50 ? 'Low' : fanSpeed < 100 ? 'Medium' : 'High'}
        </p>
      </div>

      {/* Light Intensity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sun className="w-6 h-6 text-yellow-400" />
            <h3 className="font-semibold">Light</h3>
          </div>
          <span className="text-2xl font-bold text-yellow-400">{lightIntensity}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${lightIntensity}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {lightIntensity === 0 ? 'Off' : lightIntensity < 50 ? 'Dim' : 'Bright'}
        </p>
      </div>

      {/* Pump Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className={`w-6 h-6 ${pumpState ? 'text-cyan-400' : 'text-gray-500'}`} />
            <div>
              <h3 className="font-semibold">Pump</h3>
              <p className="text-sm text-gray-400">Water distribution</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            pumpState ? 'bg-cyan-400/20 text-cyan-400' : 'bg-gray-700 text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${pumpState ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
            {pumpState ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>

      {/* Water Valve Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className={`w-6 h-6 ${waterValveOpen ? 'text-green-400' : 'text-gray-500'}`} />
            <div>
              <h3 className="font-semibold">Valve</h3>
              <p className="text-sm text-gray-400">Water flow control</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            waterValveOpen ? 'bg-green-400/20 text-green-400' : 'bg-gray-700 text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${waterValveOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            {waterValveOpen ? 'OPEN' : 'CLOSED'}
          </div>
        </div>
      </div>
    </div>
  );
}
