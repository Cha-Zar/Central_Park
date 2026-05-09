# Wokwi + MQTT + Neon Presentation Guide

## 1. What replaced ISIS

ISIS/Proteus is no longer needed.

The hardware side is now represented by two Wokwi ESP32 simulations:

- `wokwi-master-esp32` - sensor board.
- `wokwi-slave-esp32` - actuator board.

## 2. Full architecture

```text
Wokwi Master ESP32
  reads sensors
  publishes MQTT sensor JSON
        |
        v
MQTT broker
        |
        +--> Wokwi Slave ESP32
        |      receives sensor JSON
        |      controls LEDs automatically
        |      publishes actuator status
        |
        +--> mqtt-worker
               stores sensor/status data in Neon
                    |
                    v
              Next.js dashboard
```

## 3. MQTT broker

The Wokwi sketches currently use:

```text
broker.hivemq.com:1883
```

Your `.env` should use the same broker:

```env
MQTT_URL="mqtt://broker.hivemq.com:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
```

For a more private/serious demo, use HiveMQ Cloud, EMQX Cloud, Mosquitto on VPS, or another MQTT broker.

## 4. Topics

Master publishes sensor data:

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

Slave subscribes to Master data and publishes actuator status:

```text
green-garden/actuators/AA:BB:CC:DD:EE:02
```

Dashboard commands are published to:

```text
green-garden/commands/AA:BB:CC:DD:EE:02
```

## 5. Start the web/database side

The database is Neon through `DATABASE_URL`.

Run:

```bash
npm run db:push
npm run dev
```

In another terminal:

```bash
npm run mqtt:worker
```

The worker is the bridge between MQTT and Neon.

## 6. Start Wokwi

Open the Master folder:

```text
wokwi-master-esp32
```

Start the Wokwi simulator.

Open the Slave folder in another VS Code window:

```text
wokwi-slave-esp32
```

Start the Wokwi simulator.

## 7. What to demonstrate

### Master

Change simulated values:

- temperature/humidity on DHT;
- light on LDR;
- gas level;
- soil moisture potentiometer;
- water tank potentiometer.

The Master publishes JSON to MQTT.

### Slave

The Slave receives the Master data and reacts:

- low soil moisture -> pump LED ON;
- low water level -> valve LED ON;
- high temperature/VPD/air quality -> fan LED ON;
- low light -> light LED ON.

### Dashboard

The MQTT worker receives both Master and Slave messages and stores them in Neon.

Refresh:

```text
http://localhost:3000
```

Select:

- Master device for sensor data;
- Slave device for actuator status.

## 8. What to say in presentation

> I replaced the ISIS simulation with Wokwi. The Master ESP32 reads simulated sensors and publishes them to an MQTT broker. The Slave ESP32 subscribes to the sensor topic, applies automatic control logic, and publishes actuator states. A Node.js MQTT worker receives all MQTT messages and stores them in the Neon PostgreSQL database. The Next.js dashboard reads from Neon and displays real-time plant monitoring data, actuator states, alerts and history.

## 9. Important limitation

Wokwi cannot directly reach your local `localhost:3000` from the browser simulation. That is why MQTT is the best bridge for local demos.

For HTTP from Wokwi, deploy the Next.js app to Vercel or expose localhost with a tunnel, then set `HTTP_API_URL` in `wokwi-master-esp32.ino`.
