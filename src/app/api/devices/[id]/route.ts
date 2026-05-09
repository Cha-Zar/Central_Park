import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const device = await prisma.device.findUnique({
      where: { id },
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const device = await prisma.device.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        isActive: body.isActive,
      },
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
      },
    });

    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
