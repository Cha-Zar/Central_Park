import mqtt from 'mqtt';

type MqttPublishPayload = Record<string, unknown>;

const MQTT_URL = process.env.MQTT_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

export function isMqttConfigured() {
  return Boolean(MQTT_URL);
}

export async function publishMqttJson(topic: string, payload: MqttPublishPayload) {
  if (!MQTT_URL) {
    return { skipped: true, reason: 'MQTT_URL is not configured' };
  }

  return new Promise<{ skipped: false; topic: string }>((resolve, reject) => {
    const client = mqtt.connect(MQTT_URL, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: 0,
      connectTimeout: 8000,
    });

    client.on('connect', () => {
      client.publish(topic, JSON.stringify(payload), { qos: 1 }, (error) => {
        client.end(true);

        if (error) {
          reject(error);
          return;
        }

        resolve({ skipped: false, topic });
      });
    });

    client.on('error', (error) => {
      client.end(true);
      reject(error);
    });
  });
}
