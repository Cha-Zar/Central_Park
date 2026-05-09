import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SensorDataSchema } from '@/lib/validators';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate incoming data
    const validatedData = SensorDataSchema.parse(data);
    
    // Find or create device
    let device = await prisma.device.findUnique({
      where: { macAddress: validatedData.macAddress },
    });
    
    if (!device) {
      device = await prisma.device.create({
        data: {
          name: `Device-${validatedData.macAddress}`,
          type: 'master',
          macAddress: validatedData.macAddress,
          location: 'Unknown',
        },
      });
    }
    
    // Create sensor data record
    const sensorData = await prisma.sensorData.create({
      data: {
        temperature: validatedData.temperature,
        humidity: validatedData.humidity,
        light: validatedData.light,
        airQuality: validatedData.airQuality,
        waterLevel: validatedData.waterLevel,
        soilMoisture: validatedData.soilMoisture,
        vpd: validatedData.vpd,
        healthScore: validatedData.healthScore,
        deviceId: device.id,
      },
    });
    
    // Update actuator status timestamp
    await prisma.actuatorStatus.upsert({
      where: { deviceId: device.id },
      update: { updatedAt: new Date() },
      create: {
        deviceId: device.id,
      },
    });
    
    // Check for alert conditions
    const settings = await prisma.settings.findUnique({
      where: { deviceId: device.id },
    });
    
    if (settings) {
      const alerts = [];
      
      if (validatedData.humidity < settings.humidityTarget - 10) {
        alerts.push({
          type: 'humidity',
          severity: 'warning',
          message: `Humidity is ${validatedData.humidity.toFixed(0)}%, target is ${settings.humidityTarget}%`,
        });
      }
      
      if (validatedData.light < settings.lightTarget * 0.8) {
        alerts.push({
          type: 'light',
          severity: 'warning',
          message: `Light intensity is ${Math.round(validatedData.light)} lux, target is ${settings.lightTarget} lux`,
        });
      }
      
      if (validatedData.temperature < settings.temperatureMin || validatedData.temperature > settings.temperatureMax) {
        alerts.push({
          type: 'temperature',
          severity: 'critical',
          message: `Temperature ${validatedData.temperature.toFixed(1)}°C is outside range (${settings.temperatureMin}-${settings.temperatureMax}°C)`,
        });
      }
      
      if (validatedData.healthScore < 50) {
        alerts.push({
          type: 'health',
          severity: 'critical',
          message: `Plant health score is critically low: ${validatedData.healthScore}%`,
        });
      }
      
      // Create alerts without duplicates (check for recent unresolved alerts)
      for (const alert of alerts) {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            deviceId: device.id,
            type: alert.type,
            resolved: false,
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
        });
        
        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              ...alert,
              deviceId: device.id,
            },
          });
        }
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data received',
        dataId: sensorData.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error processing sensor data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const query: any = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    const data = await prisma.sensorData.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
