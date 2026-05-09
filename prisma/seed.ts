import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Create Devices
    const masterDevice = await prisma.device.upsert({
      where: { macAddress: 'AA:BB:CC:DD:EE:01' },
      update: {},
      create: {
        id: 'master001',
        name: 'ESP32 Master - Sensors',
        type: 'master',
        macAddress: 'AA:BB:CC:DD:EE:01',
        location: 'Growing Chamber Main',
        isActive: true,
      },
    });
    console.log('✅ Master device created:', masterDevice.id);

    const slaveDevice = await prisma.device.upsert({
      where: { macAddress: 'AA:BB:CC:DD:EE:02' },
      update: {},
      create: {
        id: 'slave001',
        name: 'ESP32 Slave - Actuators',
        type: 'slave',
        macAddress: 'AA:BB:CC:DD:EE:02',
        location: 'Growing Chamber Control',
        isActive: true,
      },
    });
    console.log('✅ Slave device created:', slaveDevice.id);

    // 2. Create Sensor Data
    const sensorReadings = [
      { temperature: 24.5, humidity: 65.3, airQuality: 1200, light: 75, waterLevel: 85, soilMoisture: 55, vpd: 0.85, healthScore: 92 },
      { temperature: 25.1, humidity: 62.8, airQuality: 1150, light: 78, waterLevel: 82, soilMoisture: 58, vpd: 0.78, healthScore: 94 },
      { temperature: 23.8, humidity: 68.2, airQuality: 1280, light: 72, waterLevel: 88, soilMoisture: 52, vpd: 0.91, healthScore: 90 },
    ];

    for (let i = 0; i < sensorReadings.length; i++) {
      await prisma.sensorData.create({
        data: {
          ...sensorReadings[i],
          deviceId: masterDevice.id,
        },
      });
    }
    console.log('✅ Sensor data created: 3 readings');

    // 3. Create Actuator Status
    await prisma.actuatorStatus.upsert({
      where: { deviceId: slaveDevice.id },
      update: {},
      create: {
        fanSpeed: 45,
        lightIntensity: 80,
        pumpState: false,
        waterValveOpen: false,
        deviceId: slaveDevice.id,
      },
    });
    console.log('✅ Actuator status created');

    // 4. Create Settings
    await prisma.settings.upsert({
      where: { deviceId: masterDevice.id },
      update: {},
      create: {
        plantType: 'tomato',
        humidityTarget: 65,
        lightTarget: 500,
        temperatureMin: 20,
        temperatureMax: 28,
        vpdTarget: 0.8,
        soilMoistureMin: 50,
        deviceId: masterDevice.id,
      },
    });
    console.log('✅ Settings created');

    // 5. Create Sample Alerts
    await prisma.alert.create({
      data: {
        type: 'temperature',
        severity: 'info',
        message: 'Temperature within optimal range',
        resolved: false,
        deviceId: masterDevice.id,
      },
    });

    await prisma.alert.create({
      data: {
        type: 'soilMoisture',
        severity: 'warning',
        message: 'Soil moisture approaching minimum threshold',
        resolved: false,
        deviceId: masterDevice.id,
      },
    });
    console.log('✅ Alerts created: 2 alerts');

    console.log('✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
