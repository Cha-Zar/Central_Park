# Neon + MQTT + HTTP Setup

## 1. What stays the same

HTTP still works:

- `POST /api/data` receives Master sensor data.
- `POST /api/actuators` receives Slave actuator status.
- `GET /api/devices` feeds the dashboard.

MQTT is optional. If `MQTT_URL` is empty, the app still works with HTTP.

## 2. Neon database

Create a Neon PostgreSQL database and copy its connection string.

Put it in `.env` and `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Then run:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Check:

```text
http://localhost:3000/api/devices
```

If JSON appears, the app is connected to Neon.

## 3. HTTP mode

Master sends sensor readings to:

```text
POST /api/data
```

Slave sends actuator state to:

```text
POST /api/actuators
```

## 4. MQTT mode

Add broker settings:

```env
MQTT_URL="mqtt://localhost:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
MQTT_SENSOR_TOPIC="green-garden/sensors/+"
MQTT_ACTUATOR_STATUS_TOPIC="green-garden/actuators/+"
```

For a cloud broker, use `mqtts://...:8883` with username/password.

Topics:

```text
green-garden/sensors/{masterMacAddress}
green-garden/actuators/{slaveMacAddress}
green-garden/commands/{slaveMacAddress}
```

Run the MQTT worker:

```bash
npm run mqtt:worker
```

The worker subscribes to sensor and actuator topics, then stores incoming MQTT messages in PostgreSQL using Prisma.

## 5. Important deployment note

Vercel is good for the Next.js dashboard and HTTP API.

The MQTT worker is a long-running process, so it should run somewhere that stays alive:

- your PC during a demo;
- a VPS;
- Railway worker;
- Render background worker;
- Fly.io machine.

Vercel serverless functions are not ideal for a permanent MQTT subscriber.
