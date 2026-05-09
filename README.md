# � Central Park - Production-Ready IoT Plant Monitoring Platform

A complete, scalable IoT system for monitoring and controlling growing environments. Central Park combines real-time sensor monitoring with automated controls, featuring a responsive Next.js dashboard, PostgreSQL persistence, MQTT communication, and ESP32-based hardware integration.

**Status:** Production-ready | **Language:** TypeScript/Next.js | **Database:** PostgreSQL (Neon) | **Hardware:** ESP32 Master/Slave

## 📋 Features

### 📊 Dashboard & Visualization
- **Real-time sensor display** with live data cards (Temperature, Humidity, Light, Soil Moisture, Air Quality)
- **Health score indicator** with color-coded status system (Green/Yellow/Orange/Red)
- **24-hour interactive charts** for all sensors using Recharts
- **Last update timestamp** for data freshness verification
- **Dark mode UI** optimized for monitoring stations

### 🎮 Device Control & Actuators
- **Water valve control** with configurable duration and flow rate
- **Fan speed adjustment** with real-time PWM slider control
- **Light intensity control** with brightness adjustment
- **Real-time actuator status display** and feedback
- **Command queue management** for sequential operations

### 🚨 Alerts & Monitoring System
- **Automatic alert generation** for out-of-range conditions
- **Multi-level severity** (Critical, Warning, Info)
- **Alert resolution tracking** with timestamps
- **Device-based filtering** and search capabilities
- **Historical alert archive** for trend analysis

### 📈 Data Management & Analytics
- **Historical data views** with flexible time windows (24h/7d/30d)
- **Comprehensive time-series charts** with data export
- **Time-indexed queries** for fast retrieval of large datasets
- **6-month data retention** optimized for long-term analysis

### ⚙️ Configuration & Customization
- **Plant type selection** with default profiles (Tomato, Lettuce, Basil, etc.)
- **Environmental target setup** (Humidity, Light, Temperature, VPD ranges)
- **Soil moisture threshold configuration** per device
- **Actuator calibration** and sensitivity tuning

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript | Modern, type-safe UI framework |
| **Styling** | Tailwind CSS, Lucide React icons | Responsive design system |
| **Database** | PostgreSQL (Neon), Prisma ORM | Scalable data persistence |
| **Backend** | Next.js API Routes | RESTful API endpoints |
| **Real-time** | MQTT 5.x, mqtt.js library | IoT device communication |
| **Charts** | Recharts | Interactive data visualization |
| **Validation** | Zod | TypeScript-first schema validation |
| **Hardware** | ESP32 (Master + Slave), DHT22 | Sensor/actuator controllers |
| **Deployment** | Vercel | Zero-config serverless hosting |

## 📦 Project Structure

```
central-park/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # REST API endpoints
│   │   ├── devices/           # Device detail pages
│   │   ├── alerts/            # Alerts management
│   │   ├── history/           # Historical data views
│   │   ├── settings/          # Configuration pages
│   │   └── plant-profile/     # Plant profile management
│   ├── components/            # Reusable React components
│   └── lib/                   # Utilities (mqtt, prisma, validators)
├── prisma/
│   ├── schema.prisma          # Database models
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database version history
├── scripts/
│   └── mqtt-worker.ts         # MQTT subscription handler
├── wokwi-*/                   # ESP32 simulation projects
└── public/                    # Static assets
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ with npm/yarn
- **PostgreSQL** database (free Neon account: https://neon.tech)
- **Git** for version control
- Optional: **ESP32 board** or Wokwi simulator for hardware testing

### Installation (5-10 minutes)

1. **Clone and Install**
   ```bash
   git clone https://github.com/Cha-Zar/Central_Park.git
   cd Central_Park
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit with your values (database URL, MQTT broker, etc.)
   nano .env.local  # or use your editor
   ```
   
   Required variables:
   ```env
   DATABASE_URL=postgresql://user:pass@neon.tech/dbname
   MQTT_BROKER=mqtt://localhost:1883
   MQTT_TOPIC_PREFIX=central-park
   ```

3. **Setup Database Schema**
   ```bash
   # Generate Prisma client and apply migrations
   npm run db:push
   
   # Optional: seed with sample data
   npm run db:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

5. **Access Dashboard**
   - Main dashboard: `/`
   - Devices: `/devices`
   - Alerts: `/alerts`
   - History: `/history`
   - Settings: `/settings`

### Useful Commands

```bash
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint checks
npm run db:studio     # Open Prisma Studio (visual DB editor)
npm run db:generate   # Regenerate Prisma client
npm run mqtt:worker   # Start MQTT message worker
```

## � Hardware Architecture

Central Park uses a distributed IoT architecture with master/slave ESP32 boards for robust sensor collection and actuator control.

### System Overview

```
┌─────────────────────────┐
│  ESP32 Master          │
│  • DHT22 (Temp/Humidity)│
│  • LDR (Light)         │
│  • Soil Moisture       │
│  • Air Quality Sensor  │
└────────────┬────────────┘
             │ HTTP POST /api/data
             │ (every 5 seconds)
    ┌────────▼───────────────────┐
    │   Central Park Backend      │
    │   (Next.js + PostgreSQL)    │
    │                             │
    │  ✓ Stores sensor data       │
    │  ✓ Generates alerts         │
    │  ✓ Processes commands       │
    │  ✓ Manages actuators        │
    └─┬────────────────┬──────────┘
      │                │
 ┌────▼──────┐  ┌─────▼──────────┐
 │ Web UI     │  │ ESP32 Slave    │
 │ (Browser)  │  │ • Water Pump   │
 │            │  │ • Fan (PWM)    │
 │ Dashboard  │  │ • LED Strip    │
 │ Controls   │  │ • Solenoid     │
 │ Alerts     │  └────────────────┘
 └────────────┘
```

### ESP32 Master (Data Collection)

**Sensors Connected:**
- **DHT22** - Temperature & Relative Humidity
- **LDR/Photodiode** - Light intensity (0-4095 ADC)
- **Capacitive Soil Moisture** - Soil water content
- **MQ-135/BME680** - Air quality/CO₂ equivalent
- **Water Level** - Optional tank level sensor

**Communication:**
- WiFi 2.4GHz for HTTP POST to backend
- Data sent every 5 seconds
- JSON payload with all sensor readings
- Built-in reconnection and data buffering

**Firmware:** [ESP32_MASTER.ino](ESP32_MASTER.ino)

### ESP32 Slave (Actuator Control)

**Actuators Connected:**
- **Water Pump** - 12V relay with PWM control (duration: 0-60s)
- **Ventilation Fan** - PWM-controlled EC fan (speed: 0-255)
- **LED Strip** - Programmable RGB or single-color lighting
- **Solenoid Valve** - On/off water distribution valve

**Communication:**
- MQTT subscription for commands from backend
- Real-time acknowledgment of executed commands
- Status feedback for all actuators
- Failsafe modes if connection lost

**Firmware:** [ESP32_SLAVE.ino](ESP32_SLAVE.ino)

### MQTT Message Format

**Sensor Data (Master → Backend):**
```json
{
  "device_id": "ESP32_MASTER_001",
  "timestamp": 1715277453,
  "sensors": {
    "temperature": 22.5,
    "humidity": 65,
    "light_intensity": 850,
    "soil_moisture": 45,
    "air_quality": 320
  }
}
```

**Commands (Backend → Slave):**
```json
{
  "command": "pump",
  "duration": 30,
  "intensity": 100
}
```

### Wokwi Simulation

Test the ESP32 firmware without hardware using Wokwi (https://wokwi.com):

- **Master Simulator:** [wokwi-master-esp32/](wokwi-master-esp32/)
- **Slave Simulator:** [wokwi-slave-esp32/](wokwi-slave-esp32/)
- **Full Garden:** [wokwi-green-garden/](wokwi-green-garden/) (optional alternative layout)

Run simulations directly in VS Code or online at Wokwi.com

## 🔌 API Documentation

Central Park exposes RESTful endpoints for sensor data, device management, and command execution.

### Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/api/data` | Submit sensor readings from ESP32 Master |
| **GET** | `/api/data?deviceId=X` | Retrieve historical sensor data |
| **GET** | `/api/devices` | List all connected devices |
| **GET** | `/api/devices/[id]` | Get device details and status |
| **POST** | `/api/commands` | Send command to ESP32 Slave |
| **GET** | `/api/alerts` | Fetch active/historical alerts |
| **DELETE** | `/api/alerts/[id]` | Resolve an alert |
| **PUT** | `/api/settings` | Update configuration thresholds |

### Example: Submit Sensor Data

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32_MASTER_001",
    "temperature": 22.5,
    "humidity": 65,
    "light_intensity": 850,
    "soil_moisture": 45,
    "air_quality": 320
  }'
```

### Example: Send Actuator Command

```bash
curl -X POST http://localhost:3000/api/commands \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32_SLAVE_001",
    "command": "pump",
    "duration": 30,
    "intensity": 100
  }'
```

## 📚 Documentation & Guides

- **[QUICK_START.md](QUICK_START.md)** - Step-by-step setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and component overview
- **[NEON_MQTT_SETUP.md](NEON_MQTT_SETUP.md)** - Database and MQTT configuration
- **[FIELD_MAPPING.md](FIELD_MAPPING.md)** - Sensor/actuator pin assignments
- **[cahier_de_charges.md](cahier_de_charges.md)** - Project specifications (French)
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Cloud deployment instructions

## 🌐 Deployment

### Local Development
```bash
npm run dev    # Runs on http://localhost:3000
```

### Production Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com/import
   - Select this repository
   - Set environment variables in Vercel dashboard:
     - `DATABASE_URL` (Neon PostgreSQL connection string)
     - `MQTT_BROKER` (MQTT broker URL)
     - `API_KEY` (optional security key)

3. **Deploy**
   ```bash
   vercel deploy
   ```

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

### Docker Deployment

Build and run with Docker:

```bash
docker-compose up -d
```

Check [docker-compose.yml](docker-compose.yml) for service configuration.

## 🧪 Testing & Simulation

### Option 1: Wokwi Simulator (No Hardware Needed)

1. **Master Simulation:**
   - Open [wokwi-master-esp32/](wokwi-master-esp32/) in VS Code
   - Install Wokwi extension
   - Click "Simulate" or visit [Wokwi.com](https://wokwi.com)
   - Simulated data is sent to your backend API

2. **Slave Simulation:**
   - Open [wokwi-slave-esp32/](wokwi-slave-esp32/)
   - Subscribe to MQTT commands
   - Test actuator responses

### Option 2: Real ESP32 Hardware

1. **Upload Master Firmware:**
   ```bash
   # Configure WiFi and API URL in ESP32_MASTER.ino
   # Upload using Arduino IDE or platformio
   ```

2. **Upload Slave Firmware:**
   ```bash
   # Configure MQTT broker in ESP32_SLAVE.ino
   # Upload using Arduino IDE or platformio
   ```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test Neon connection
npx prisma db push

# Open Prisma Studio to inspect data
npm run db:studio
```

### MQTT Connection Failed
- Verify `MQTT_BROKER` URL in `.env.local`
- Check MQTT broker is running (default: localhost:1883)
- Test with: `mqtt-spy` or `mosquitto_sub -t "central-park/#"`

### ESP32 Not Sending Data
- Verify WiFi SSID/password in firmware
- Check API endpoint URL matches your deployment
- Monitor serial output: `Serial Monitor @ 115200 baud`
- Test HTTP POST: `curl -v http://ESP32_IP/api/data`

### Charts Not Displaying
- Verify data exists in PostgreSQL
- Check browser console for API errors (F12)
- Ensure time range query is correct

### Missing Environment Variables
```bash
# List required variables
cat .env.example

# Copy and fill them in
cp .env.example .env.local
```

## 📊 Database Schema

Central Park uses 6 main Prisma models:

- **Device** - ESP32 board registration and status
- **Sensor** - Raw sensor readings with timestamps
- **SensorReading** - Time-series data points
- **Actuator** - Water pump, fan, light, etc.
- **Command** - Commands sent to ESP32 Slave
- **Alert** - Auto-generated alerts for out-of-range conditions

View schema: [prisma/schema.prisma](prisma/schema.prisma)

## 🎯 Project Objectives

✅ Monitor growing environments in real-time  
✅ Collect and visualize multi-sensor data  
✅ Automate alerts for critical conditions  
✅ Control environmental actuators remotely  
✅ Store 6 months of historical data  
✅ Provide educational IoT reference implementation  
✅ Support multiple growing zones  
✅ Enable data export for analysis  

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 📞 Support

- **Issues:** GitHub Issues (documentation, bugs, feature requests)
- **Discussions:** GitHub Discussions (questions, ideas)
- **Documentation:** See markdown files in repository root

## 🔗 Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs/)
- [ESP32 Arduino Guide](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [MQTT Protocol](https://mqtt.org/)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Wokwi Simulator](https://wokwi.com/docs)

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Maintainer:** Cha-Zar
}

float calculateVPD(float temp, float humidity) {
  // Simplified VPD calculation
  float vpd_sat = 0.6108 * exp((17.27 * temp) / (temp + 237.7));
  return vpd_sat * (1.0 - (humidity / 100.0));
}

int calculateHealth(float temp, float humidity, float light, float soil) {
  // Calculate health score (0-100)
  int score = 50;
  
  if (temp >= 18 && temp <= 28) score += 15;
  if (humidity >= 50 && humidity <= 80) score += 15;
  if (light >= 400) score += 15;
  if (soil >= 40) score += 5;
  
  return min(score, 100);
}
```

### Slave Device (Command Receiver)

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";

#define WATER_PIN 5
#define FAN_PIN 18
#define LIGHT_PIN 19

WebServer server(80);

void setup() {
  Serial.begin(115200);
  pinMode(WATER_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  server.on("/command", HTTP_POST, handleCommand);
  server.begin();
}

void loop() {
  server.handleClient();
}

void handleCommand() {
  DynamicJsonDocument doc(256);
  deserializeJson(doc, server.arg("plain"));
  
  String action = doc["action"];
  int value = doc["value"] | 0;
  int duration = doc["duration"] | 0;
  
  if (action == "water") {
    digitalWrite(WATER_PIN, HIGH);
    delay(duration * 1000);
    digitalWrite(WATER_PIN, LOW);
  } 
  else if (action == "fan") {
    analogWrite(FAN_PIN, value * 255 / 100);
  }
  else if (action == "light") {
    analogWrite(LIGHT_PIN, value * 255 / 100);
  }
  
  server.send(200, "application/json", "{\"success\":true}");
}
```

## 📊 API Routes

### Data Endpoints

#### POST `/api/data`
Send sensor data from ESP32 Master
```json
{
  "temperature": 25.5,
  "humidity": 65,
  "light": 500,
  "airQuality": 100,
  "soilMoisture": 55,
  "vpd": 1.2,
  "healthScore": 85,
  "macAddress": "AA:BB:CC:DD:EE:FF"
}
```

#### GET `/api/data?deviceId={id}&limit={limit}`
Get sensor readings history

### Device Endpoints

#### GET `/api/devices`
Get all devices with latest sensor data

#### GET `/api/devices/{id}`
Get specific device details

#### PATCH `/api/devices/{id}`
Update device information

### Command Endpoints

#### POST `/api/commands`
Send command to device
```json
{
  "deviceId": "device_id",
  "action": "water|fan|light",
  "value": 50,
  "duration": 30
}
```

#### GET `/api/commands?deviceId={id}&status={status}`
Get command history

### Alert Endpoints

#### GET `/api/alerts?resolved={true|false}`
Get alerts

#### PATCH `/api/alerts/{id}`
Mark alert as resolved
```json
{
  "resolved": true
}
```

### Settings Endpoints

#### POST `/api/settings`
Create/update device settings
```json
{
  "deviceId": "device_id",
  "plantType": "Tomato",
  "humidityTarget": 65,
  "lightTarget": 500,
  "temperatureMin": 18,
  "temperatureMax": 28,
  "vpdTarget": 1.0,
  "soilMoistureMin": 40
}
```

#### GET `/api/settings?deviceId={id}`
Get device settings

## 🗄️ Database Schema

### Models

**Device**
- Stores ESP32 Master/Slave information
- MAC address as unique identifier
- Active status tracking

**SensorData**
- Time-series sensor readings
- Indexed by `createdAt` and `deviceId`
- Stores: temperature, humidity, light, airQuality, soilMoisture, vpd, healthScore

**ActuatorStatus**
- Current state of actuators
- Stores: waterValveOpen, fanSpeed, lightIntensity

**Command**
- Action log for sent commands
- Status tracking: pending, executing, completed, failed

**Alert**
- System notifications
- Severity levels: critical, warning, info
- Resolution tracking

**Settings**
- Plant-specific configuration
- Environmental targets and thresholds

## 🚀 Deployment to Vercel

### Prerequisites
- Vercel account
- Git repository (GitHub/GitLab/Bitbucket)

### Steps

1. **Push to Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Green Garden IoT System"
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com/import](https://vercel.com/import)
   - Select your repository
   - Click "Import"

3. **Configure environment variables**
   - Set `DATABASE_URL` to your Neon PostgreSQL connection string
   - Set `NEXT_PUBLIC_API_URL` to your Vercel domain

4. **Deploy**
   - Vercel automatically deploys on push to `main`
   - First deployment may take 2-3 minutes

5. **Initialize database**
   - Connect to Vercel via CLI: `vercel env pull`
   - Run: `npx prisma db push`

### Post-Deployment

Update your ESP32 devices to use the Vercel domain:
```cpp
const char* API_URL = "https://your-project.vercel.app/api/data";
```

## 🔐 Security Notes

- Change default sensor values and thresholds
- Use HTTPS only (Vercel provides SSL by default)
- Validate all API inputs with Zod
- Consider adding API key authentication
- Implement rate limiting for production
- Secure your ESP32 WiFi credentials

## 🧪 Development

### Local Database Setup
```bash
# Push schema to database
npm run db:push

# Open Prisma Studio to view data
npm run db:studio

# Generate Prisma client
npm run db:generate
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
npm start
```

## 📦 Project Structure

```
green-garden/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Dashboard
│   │   ├── globals.css             # Global styles
│   │   ├── api/
│   │   │   ├── data/route.ts       # Sensor data endpoints
│   │   │   ├── devices/route.ts    # Device management
│   │   │   ├── commands/route.ts   # Commands
│   │   │   ├── alerts/route.ts     # Alerts
│   │   │   └── settings/route.ts   # Settings
│   │   ├── devices/[id]/page.tsx   # Device control page
│   │   ├── history/page.tsx        # Historical data
│   │   ├── alerts/page.tsx         # Alerts page
│   │   └── settings/page.tsx       # Settings page
│   ├── components/
│   │   ├── Navigation.tsx          # Main navigation
│   │   ├── SensorCard.tsx          # Sensor display card
│   │   ├── HealthScore.tsx         # Health score gauge
│   │   ├── SensorChart.tsx         # Chart component
│   │   └── DeviceSelector.tsx      # Device dropdown
│   └── lib/
│       ├── validators.ts           # Zod schemas
│       ├── prisma.ts               # Prisma client
│       └── utils.ts                # Utility functions
├── prisma/
│   └── schema.prisma               # Database schema
├── public/                         # Static files
├── .env.local                      # Environment variables
├── .env.example                    # Example env file
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.js                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── postcss.config.js               # PostCSS config
└── README.md                       # This file
```

## 🐛 Troubleshooting

### ESP32 Connection Issues
- Ensure WiFi SSID and password are correct
- Check that the API URL is reachable from your network
- Verify MAC address format: `AA:BB:CC:DD:EE:FF`

### Database Connection Errors
- Verify `DATABASE_URL` in `.env.local`
- Check Neon dashboard for connection status
- Ensure SSL mode is enabled

### Sensor Data Not Appearing
- Check browser console for API errors
- Verify POST requests to `/api/data`
- Confirm device creation with `GET /api/devices`

### Deployment Issues
- Check Vercel build logs
- Ensure all environment variables are set
- Verify Prisma migrations ran successfully

## 📝 License

MIT

## 🤝 Support

For issues or questions, please refer to the documentation or create an issue in your repository.

---

**Happy monitoring! 🌿**
