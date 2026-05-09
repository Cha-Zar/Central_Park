import { z } from 'zod';

// Sensor data validation
export const SensorDataSchema = z.object({
  temperature: z.number().min(-50).max(50),
  humidity: z.number().min(0).max(100),
  light: z.number().min(0),
  airQuality: z.number().min(0).max(500),
  waterLevel: z.number().min(0).max(100),
  soilMoisture: z.number().min(0).max(100),
  vpd: z.number().min(0).max(10),
  healthScore: z.number().min(0).max(100).int(),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
});

export type SensorDataPayload = z.infer<typeof SensorDataSchema>;

// Command validation
export const CommandSchema = z.object({
  action: z.enum(['water', 'fan', 'light', 'valve']),
  duration: z.number().int().positive().optional(),
  value: z.number().int().min(0).max(100).optional(),
  deviceId: z.string().min(1),
});

export type CommandPayload = z.infer<typeof CommandSchema>;

// Settings validation
export const SettingsSchema = z.object({
  plantType: z.string().min(1),
  humidityTarget: z.number().min(0).max(100),
  lightTarget: z.number().min(0),
  temperatureMin: z.number(),
  temperatureMax: z.number(),
  vpdTarget: z.number().min(0),
  soilMoistureMin: z.number().min(0).max(100),
});

export type SettingsPayload = z.infer<typeof SettingsSchema>;

// Alert resolution
export const AlertResolutionSchema = z.object({
  alertId: z.string().min(1),
});

export type AlertResolutionPayload = z.infer<typeof AlertResolutionSchema>;
