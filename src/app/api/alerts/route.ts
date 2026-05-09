import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const resolved = searchParams.get('resolved');
    
    const query: any = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    if (resolved !== null) {
      query.resolved = resolved === 'true';
    }
    
    const alerts = await prisma.alert.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        device: true,
      },
    });
    
    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
