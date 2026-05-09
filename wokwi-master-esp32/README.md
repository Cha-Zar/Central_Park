# Wokwi Master ESP32 - Sensors to MQTT/HTTP

This Wokwi project replaces the ISIS Master board.

The Master reads simulated sensors and publishes plant data to MQTT:

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

It can also send HTTP to your deployed dashboard API if you set `HTTP_API_URL`.

## What it simulates

- DHT22 as DHT11-style temperature/humidity sensor.
- LDR/photoresistor for light.
- Gas sensor for air quality.
- Potentiometer for soil moisture.
- Potentiometer for water tank level.
- I2C LCD for live values.
- MQTT publishing to connect Wokwi with the web/database project.

## How to use

1. Open this folder in VS Code.
2. Start the Wokwi simulator.
3. In another terminal, run the project MQTT worker from the main app:

```bash
npm run mqtt:worker
```

4. Make sure `.env` has a broker, for example:

```env
MQTT_URL="mqtt://broker.hivemq.com:1883"
```

5. The worker receives MQTT data and stores it in Neon.

## Important

Wokwi cannot normally call your local `localhost:3000` API directly because Wokwi runs outside your machine. For HTTP mode, use a public URL such as Vercel or a tunnel. MQTT mode is easier for local demos.
