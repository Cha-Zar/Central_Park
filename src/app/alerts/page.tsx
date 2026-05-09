'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getAlertSeverityColor } from '@/lib/utils';
import { format } from 'date-fns';

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  device: {
    name: string;
    id: string;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('/api/alerts');
        if (!response.ok) throw new Error('Failed to fetch alerts');
        const data = await response.json();
        setAlerts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  async function handleResolveAlert(alertId: string) {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true }),
      });

      if (!response.ok) throw new Error('Failed to resolve alert');
      
      // Update local state
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, resolved: true, resolvedAt: new Date().toISOString() }
            : alert
        )
      );
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Alerts</h1>
            <p className="text-gray-400">System notifications and warnings</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(['all', 'active', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading alerts...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-12">Error: {error}</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No {filter !== 'all' ? filter : ''} alerts
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`card p-6 border-l-4 ${
                    alert.severity === 'critical'
                      ? 'border-l-red-500'
                      : alert.severity === 'warning'
                      ? 'border-l-yellow-500'
                      : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {alert.resolved ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                        )}
                        <span className={`badge ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="font-semibold mb-1">{alert.type.toUpperCase()}</p>
                      <p className="text-gray-300 mb-2">{alert.message}</p>
                      <p className="text-sm text-gray-500">Device: {alert.device.name}</p>
                      {alert.resolved && alert.resolvedAt && (
                        <p className="text-xs text-green-400 mt-2">
                          Resolved: {format(new Date(alert.resolvedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="btn-primary whitespace-nowrap"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
