import mqtt from 'mqtt';
import { prisma } from '../src/lib/prisma';
import { SensorDataSchema } from '../src/lib/validators';

const MQTT_URL = process.env.MQTT_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const SENSOR_TOPIC = process.env.MQTT_SENSOR_TOPIC || 'green-garden/sensors/+';
const ACTUATOR_TOPIC = process.env.MQTT_ACTUATOR_STATUS_TOPIC || 'green-garden/actuators/+';

if (!MQTT_URL) {
  console.error('MQTT_URL is required to run the MQTT worker.');
  process.exit(1);
}

const client = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
});

client.on('connect', () => {
  console.log(`Connected to MQTT broker: ${MQTT_URL}`);
  client.subscribe([SENSOR_TOPIC, ACTUATOR_TOPIC], { qos: 1 }, (error) => {
    if (error) {
      console.error('MQTT subscribe error:', error);
      process.exit(1);
    }

    console.log(`Subscribed to ${SENSOR_TOPIC}`);
    console.log(`Subscribed to ${ACTUATOR_TOPIC}`);
  });
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    if (topic.startsWith('green-garden/sensors/')) {
      const data = SensorDataSchema.parse(payload);

      let device = await prisma.device.findUnique({
        where: { macAddress: data.macAddress },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            name: `Device-${data.macAddress}`,
            type: 'master',
            macAddress: data.macAddress,
            location: 'Unknown',
          },
        });
      }

      await prisma.sensorData.create({
        data: {
          temperature: data.temperature,
          humidity: data.humidity,
          light: data.light,
          airQuality: data.airQuality,
          waterLevel: data.waterLevel,
          soilMoisture: data.soilMoisture,
          vpd: data.vpd,
          healthScore: data.healthScore,
          deviceId: device.id,
        },
      });

      console.log(`Stored MQTT sensor data for ${data.macAddress}`);
      return;
    }

    if (topic.startsWith('green-garden/actuators/')) {
      const {
        fanSpeed,
        lightIntensity,
        pumpState,
        waterValveOpen,
        macAddress,
      } = payload;

      let device = await prisma.device.findUnique({
        where: { macAddress },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            name: `Device-${macAddress}`,
            type: 'slave',
            macAddress,
            location: 'Unknown',
          },
        });
      }

      await prisma.actuatorStatus.upsert({
        where: { deviceId: device.id },
        update: {
          fanSpeed,
          lightIntensity,
          pumpState,
          waterValveOpen,
        },
        create: {
          deviceId: device.id,
          fanSpeed,
          lightIntensity,
          pumpState,
          waterValveOpen,
        },
      });

      console.log(`Stored MQTT actuator status for ${macAddress}`);
    }
  } catch (error) {
    console.error('Failed to process MQTT message:', error);
  }
});

client.on('error', (error) => {
  console.error('MQTT connection error:', error);
});
