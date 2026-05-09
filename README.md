# 🌱 Green Garden - IoT Plant Monitoring System

A production-ready web application for monitoring and controlling IoT plant systems using Next.js 14, TypeScript, PostgreSQL, and Prisma ORM.

## 📋 Features

### Dashboard
- **Real-time sensor display** with live data cards
- **Health score indicator** with color-coded status (Green/Yellow/Orange/Red)
- **24-hour charts** for temperature, humidity, light, and health score
- **Last update timestamp**

### Device Control
- **Water valve control** with duration settings
- **Fan speed adjustment** with slider
- **Light intensity control** with slider
- **Real-time actuator status display**

### Alerts & Monitoring
- **Automatic alert generation** for abnormal conditions
- **Severity levels** (Critical, Warning, Info)
- **Alert resolution tracking**
- **Device-based filtering**

### Data Management
- **Historical data views** with 24h/7d/30d filters
- **Comprehensive charts** using Recharts
- **Time-series indexing** for fast queries

### Configuration
- **Plant type selection** (Tomato, Lettuce, Basil, etc.)
- **Environmental target setup** (Humidity, Light, Temperature, VPD)
- **Soil moisture thresholds**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Charts**: Recharts
- **Validation**: Zod
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon account)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   # Copy the example
   cp .env.example .env.local
   
   # Edit with your database URL
   nano .env.local
   ```

3. **Configure Prisma and push schema**
   ```bash
   npm run db:push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 ESP32 Integration

### Master Device (Data Sender)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <ArduinoJson.h>

// Configuration
const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";
const char* API_URL = "http://YOUR_SERVER/api/data";
const char* MAC_ADDRESS = "AA:BB:CC:DD:EE:FF"; // Replace with your ESP32 MAC

// Sensor pins
#define DHT_PIN 4
#define LIGHT_PIN 34
#define SOIL_PIN 35
#define AIR_PIN 32

DHT dht(DHT_PIN, DHT22);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void loop() {
  // Read sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  float light = analogRead(LIGHT_PIN) / 4095.0 * 10000; // Convert to lux
  float soilMoisture = analogRead(SOIL_PIN) / 4095.0 * 100;
  float airQuality = analogRead(AIR_PIN) / 4095.0 * 500; // AQI
  float vpd = calculateVPD(temperature, humidity);
  int healthScore = calculateHealth(temperature, humidity, light, soilMoisture);

  // Create JSON
  DynamicJsonDocument doc(256);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["light"] = light;
  doc["airQuality"] = airQuality;
  doc["soilMoisture"] = soilMoisture;
  doc["vpd"] = vpd;
  doc["healthScore"] = healthScore;
  doc["macAddress"] = MAC_ADDRESS;

  // Send to server
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  
  String payload;
  serializeJson(doc, payload);
  int httpCode = http.POST(payload);
  
  Serial.print("HTTP Code: ");
  Serial.println(httpCode);
  
  http.end();
  
  delay(5000); // Send every 5 seconds
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
