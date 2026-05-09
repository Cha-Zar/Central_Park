import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        resolved: body.resolved !== undefined ? body.resolved : true,
        resolvedAt: body.resolved ? new Date() : null,
      },
    });
    
    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        device: true,
      },
    });
    
    if (!alert) {
      return NextResponse.json(
        { success: false, message: 'Alert not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
