// Health score color mapping
export const getHealthColor = (score: number): string => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score >= 70) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (score >= 50) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-red-100 text-red-800 border-red-300';
};

export const getHealthBgColor = (score: number): string => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

export const getHealthLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
};

export const formatTemp = (temp: number): string => {
  return `${temp.toFixed(1)} degC`;
};

export const formatHumidity = (humidity: number): string => {
  return `${humidity.toFixed(0)}%`;
};

export const formatLight = (light: number): string => {
  return `${Math.round(light)} lux`;
};

export const formatAirQuality = (aq: number): string => {
  return `${aq.toFixed(0)} AQI`;
};

export const formatSoilMoisture = (moisture: number): string => {
  return `${moisture.toFixed(0)}%`;
};

export const formatVPD = (vpd: number): string => {
  return `${vpd.toFixed(2)} kPa`;
};

export const getAlertSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    default:
      return 'bg-sky-100 text-sky-800 border-sky-300';
  }
};

export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};
