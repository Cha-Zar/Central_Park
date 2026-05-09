import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for actuator status
const ActuatorStatusSchema = z.object({
  fanSpeed: z.number().min(0).max(100),
  lightIntensity: z.number().min(0).max(100),
  pumpState: z.boolean(),
  waterValveOpen: z.boolean(),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { success: false, message: 'Device ID is required' },
        { status: 400 }
      );
    }

    const actuatorStatus = await prisma.actuatorStatus.findUnique({
      where: { deviceId },
    });

    if (!actuatorStatus) {
      return NextResponse.json(
        { success: false, message: 'Actuator status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: actuatorStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching actuator status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate incoming data
    const validatedData = ActuatorStatusSchema.parse(data);

    // Find device by MAC address
    let device = await prisma.device.findUnique({
      where: { macAddress: validatedData.macAddress },
    });

    if (!device) {
      device = await prisma.device.create({
        data: {
          name: `Device-${validatedData.macAddress}`,
          type: 'slave',
          macAddress: validatedData.macAddress,
          location: 'Unknown',
        },
      });
    }

    // Update or create actuator status
    const actuatorStatus = await prisma.actuatorStatus.upsert({
      where: { deviceId: device.id },
      update: {
        fanSpeed: validatedData.fanSpeed,
        lightIntensity: validatedData.lightIntensity,
        pumpState: validatedData.pumpState,
        waterValveOpen: validatedData.waterValveOpen,
        updatedAt: new Date(),
      },
      create: {
        deviceId: device.id,
        fanSpeed: validatedData.fanSpeed,
        lightIntensity: validatedData.lightIntensity,
        pumpState: validatedData.pumpState,
        waterValveOpen: validatedData.waterValveOpen,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Actuator status updated', data: actuatorStatus },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating actuator status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
