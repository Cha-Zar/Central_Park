import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const devices = await prisma.device.findMany({
      include: {
        sensorData: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        actuatorStatus: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        settings: true,
        alerts: {
          where: { resolved: false },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const device = await prisma.device.create({
      data: {
        name: body.name,
        type: body.type || 'master',
        macAddress: body.macAddress,
        location: body.location || 'Unknown',
      },
      include: {
        sensorData: true,
        actuatorStatus: true,
        settings: true,
      },
    });
    
    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
