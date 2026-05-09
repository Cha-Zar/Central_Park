import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CommandSchema } from '@/lib/validators';
import { publishMqttJson } from '@/lib/mqtt';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate incoming command
    const validatedData = CommandSchema.parse(data);
    
    // Check if device exists
    const device = await prisma.device.findUnique({
      where: { id: validatedData.deviceId },
    });
    
    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Create command
    const command = await prisma.command.create({
      data: {
        action: validatedData.action,
        duration: validatedData.duration,
        value: validatedData.value,
        deviceId: validatedData.deviceId,
        status: 'pending',
      },
    });
    
    const mqttTopic = `green-garden/commands/${device.macAddress}`;
    let commandStatus = 'completed';
    let mqttResult: unknown = null;

    try {
      mqttResult = await publishMqttJson(mqttTopic, {
        action: validatedData.action,
        value: validatedData.value,
        duration: validatedData.duration,
        deviceId: validatedData.deviceId,
        macAddress: device.macAddress,
      });
    } catch (mqttError) {
      commandStatus = 'failed';
      mqttResult = {
        error: mqttError instanceof Error ? mqttError.message : 'MQTT publish failed',
      };
    }

    const updatedCommand = await prisma.command.update({
      where: { id: command.id },
      data: { status: commandStatus },
    });
    
    return NextResponse.json(
      {
        success: commandStatus === 'completed',
        message: commandStatus === 'completed' ? 'Command created' : 'Command failed',
        data: updatedCommand,
        mqtt: mqttResult,
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
    
    console.error('Error creating command:', error);
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
    const status = searchParams.get('status');
    
    const query: any = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const commands = await prisma.command.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    
    return NextResponse.json({ success: true, data: commands });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
