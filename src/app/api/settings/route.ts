import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SettingsSchema } from '@/lib/validators';
import { z } from 'zod';

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

    const settings = await prisma.settings.findUnique({
      where: { deviceId },
    });

    if (!settings) {
      return NextResponse.json(
        { success: false, message: 'Settings not found for this device' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate incoming settings
    const validatedData = SettingsSchema.parse(data);
    
    if (!data.deviceId) {
      return NextResponse.json(
        { success: false, message: 'Device ID is required' },
        { status: 400 }
      );
    }
    
    // Check if device exists
    const device = await prisma.device.findUnique({
      where: { id: data.deviceId },
    });
    
    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Create or update settings
    const settings = await prisma.settings.upsert({
      where: { deviceId: data.deviceId },
      update: validatedData,
      create: {
        ...validatedData,
        deviceId: data.deviceId,
      },
    });
    
    return NextResponse.json(
      { success: true, message: 'Settings updated', data: settings },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating/updating settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
