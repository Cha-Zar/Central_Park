# 🏗️ System Architecture

## Overview

Green Garden is a distributed IoT plant monitoring system with three main components:

```
┌──────────────────┐
│  ESP32 Master    │  Collects sensor data
│  (Temperature,   │  Sends to API every 5s
│   Humidity,      │
│   Light, etc)    │
└────────┬─────────┘
         │ HTTP POST /api/data
         │
    ┌────▼────────────────────┐
    │   Backend API            │
    │  (Next.js + Prisma)     │
    │  PostgreSQL Database     │
    │                          │
    │ - Stores 6 months data   │
    │ - Auto-alerts on issues  │
    │ - Processes commands     │
    └────┬───────────────┬─────┘
         │               │
    ┌────▼────┐    ┌────▼────────┐
    │ Web UI   │    │ ESP32 Slave  │
    │ (Next.js)    │ (Controls:   │
    │            │  Water,Fan,   │
    │ - Dashboard  │  Light)      │
    │ - Controls   │              │
    │ - Alerts     │              │
    │ - History    │              │
    └─────────┘    └──────────────┘
```

## Component Details

### 1. ESP32 Master (Data Collection)

**Purpose:** Collect sensor data and send to backend

**Sensors:**
- DHT22 (Temperature & Humidity)
- Light sensor (LDR/photodiode)
- Soil moisture sensor (capacitive)
- Air quality sensor (MQ-135/BME680)

**Communication:**
- WiFi (2.4 GHz)
- HTTP POST every 5 seconds
- Automatic retry on connection loss

**Data Sent:**
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

**Processing:**
1. Read from sensors
2. Calculate derived values (VPD, Health Score)
3. Format JSON payload
4. Send via HTTP POST
5. Retry on failure

### 2. Backend API (Next.js + Prisma)

**Purpose:** Store data, generate alerts, process commands

**Architecture:**
```
Next.js App Router
├── /app
│   ├── /api          ← API Routes (Route Handlers)
│   ├── /pages        ← UI Pages
│   ├── /components   ← Reusable Components
│   └── /lib          ← Utilities & Helpers
├── /prisma
│   └── schema.prisma ← Database Models
└── /public           ← Static Assets
```

**Technology Stack:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Validation:** Zod
- **Styling:** Tailwind CSS

**API Routes:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/data` | POST | Receive sensor data from ESP32 Master |
| `/api/data` | GET | Retrieve sensor history |
| `/api/devices` | GET | List all devices |
| `/api/devices` | POST | Create new device |
| `/api/devices/[id]` | GET | Get device details |
| `/api/devices/[id]` | PATCH | Update device |
| `/api/commands` | POST | Send command to ESP32 Slave |
| `/api/commands` | GET | Get command history |
| `/api/alerts` | GET | List alerts |
| `/api/alerts/[id]` | PATCH | Mark alert as resolved |
| `/api/settings` | POST | Save plant settings |
| `/api/settings` | GET | Get plant settings |

**Data Processing Flow:**

```
1. POST /api/data (from ESP32 Master)
   ↓
2. Validate with Zod schema
   ↓
3. Find/Create Device in database
   ↓
4. Store SensorData record
   ↓
5. Check alert conditions:
   - Temperature outside range?
   - Humidity too low/high?
   - Light insufficient?
   - Health score critical?
   ↓
6. Create Alert if threshold exceeded
   ↓
7. Return 201 success response
```

### 3. ESP32 Slave (Actuators)

**Purpose:** Execute commands from backend

**Actuators:**
- Water valve relay (GPIO 5)
- Fan PWM (GPIO 18) - Speed 0-100%
- Grow light PWM (GPIO 19) - Brightness 0-100%

**Communication:**
- WiFi HTTP/REST endpoint
- Listens on port 80
- Receives JSON commands

**Commands:**
```json
{
  "action": "water|fan|light",
  "duration": 30,    // seconds (water only)
  "value": 75        // 0-100% (fan/light)
}
```

**State Persistence:**
- Fan speed saved to EEPROM
- Light intensity saved to EEPROM
- Recovers state after power loss

**Web Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/command` | POST | Receive and execute command |
| `/status` | GET | Get current actuator state |
| `/health` | GET | Health check endpoint |

### 4. Web Frontend (React + Next.js)

**Purpose:** Display data and allow user control

**Pages:**

1. **Dashboard** (/) - Main real-time view
   - Device selector
   - Current sensor readings (cards)
   - Health score gauge
   - 24h trend charts

2. **Device** (/devices/[id]) - Detailed control
   - All sensor metrics
   - Actuator controls with sliders
   - Manual command buttons

3. **Alerts** (/alerts) - Notification center
   - Alert list with severity badges
   - Filter (active/resolved)
   - Mark as resolved

4. **History** (/history) - Data analysis
   - Time range selector (24h/7d/30d)
   - Historical charts
   - Export capability (future)

5. **Settings** (/settings) - Configuration
   - Plant type selection
   - Environmental targets
   - Threshold configuration

**Real-time Updates:**
- Polling every 5 seconds
- WebSocket support (future enhancement)
- Optimistic UI updates

## Database Schema

### Models

#### Device
- Represents an ESP32 (Master or Slave)
- Unique MAC address
- Active status tracking
- Relations to all data types

#### SensorData
- Time-series data points
- All sensor readings
- Indexed by deviceId and createdAt
- Retention: 6 months (configurable)

#### ActuatorStatus
- Current state of all actuators
- One per device
- Updated on each command

#### Command
- Action log for commands sent
- Status tracking (pending/executing/completed/failed)
- Used for automation history

#### Alert
- System notifications
- Severity levels (critical/warning/info)
- Resolved/unresolved state
- Linked to device that triggered it

#### Settings
- Plant-specific configuration
- Environmental targets
- Linked to one device
- User-configurable thresholds

### Indexing Strategy

For optimal time-series performance:

```prisma
@@index([deviceId])           // For device lookups
@@index([createdAt])          // For time-based queries
@@index([healthScore])        // For sorting
@@index([severity])           // For alert filtering
@@index([resolved])           // For unresolved alerts
```

## Communication Flows

### 1. Data Ingestion Flow

```
ESP32 Master
   │
   ├─ Read DHT22, LDR, soil, air sensors
   ├─ Calculate VPD and health score
   ├─ Create JSON payload
   └─ POST to /api/data
      │
      Backend API
      ├─ Validate payload with Zod
      ├─ Find or create Device
      ├─ Store SensorData
      ├─ Check alert thresholds
      ├─ Create Alert if needed
      └─ Return 201 response
         │
         Database
         ├─ Device table (upsert)
         ├─ SensorData table (insert)
         └─ Alert table (insert if triggered)
```

### 2. Command Execution Flow

```
Web Frontend (User clicks "Water Plant")
   │
   ├─ POST /api/commands
   │  ├─ action: "water"
   │  └─ duration: 30 seconds
   │
   Backend API
   ├─ Validate command
   ├─ Create Command record
   ├─ Post status as "pending"
   └─ Immediately execute (simulated):
      └─ Update to "completed"
      │
      Database
      └─ Command table (insert)
```

*Note: Real implementation would send to ESP32 Slave via HTTP POST*

### 3. Real-time Dashboard Update Flow

```
Web Frontend periodically (every 5s)
   │
   └─ GET /api/devices
      │
      Backend API
      ├─ Fetch all devices
      ├─ Include latest sensor data
      ├─ Include actuator status
      ├─ Include unresolved alerts
      └─ Return JSON
         │
         Database (Prisma)
         ├─ Query Device + relations
         ├─ SensorData (latest)
         ├─ ActuatorStatus (latest)
         └─ Alert (unresolved)
            │
      Web Frontend
      ├─ Update chart data
      ├─ Update sensor cards
      ├─ Update health score
      └─ Render UI
```

## Error Handling

### Validation Layer

```
Incoming Request
   │
   ├─ Zod Schema Validation
   │  ├─ Type checking
   │  ├─ Range validation
   │  └─ Format validation
   │
   ├─ If invalid → 400 Bad Request
   └─ If valid → Process
```

### Database Error Handling

```
Try {
  Database Operation
} Catch {
  Log error
  Return 500 server error
  Alert admin (future)
}
```

### Network Error Handling

**ESP32 → Backend:**
- Retry failed POST 3 times
- Exponential backoff
- Connection pooling

**Backend → Database:**
- Automatic retry on transient failure
- Connection pool management
- Timeout handling

## Scalability Considerations

### Current Capacity
- **Devices:** 10,000+ (no code changes)
- **Sample Rate:** Every 5 seconds
- **Data Retention:** 6 months (~4.3M rows per device)
- **Concurrent Users:** 100+

### Scaling Strategies

**Vertical:**
- Upgrade Vercel plan
- Increase database connections (Neon PRO)
- Optimize queries with caching

**Horizontal:**
- For massive scale: message queue (Kafka/Redis)
- Time-series database (InfluxDB) for sensor data
- Edge functions for data aggregation

**Database:**
- Implement data archival for >6 months
- Consider partitioning by time
- Optimize indexes for large datasets

## Security Architecture

### Authentication (Future)
- API key for ESP32 devices
- User login for web interface
- JWT tokens

### HTTPS/TLS
- All traffic encrypted (Vercel default)
- SSL certificates auto-managed

### Input Validation
- Zod schemas on all endpoints
- Prevent SQL injection (Prisma ORM)
- Rate limiting (future)

### Data Protection
- PII not stored
- Sensor data retention policy
- GDPR compliance ready

## Monitoring & Observability

### Metrics to Track
- API response times
- Database query performance
- Error rates
- Device connection status
- Alert frequency
- Data ingestion rate

### Tools
- Vercel Analytics (frontend/API)
- Neon dashboard (database)
- Custom logging (error tracking)

### Alerts (Future)
- No data received from device (>10 min)
- Critical plant health
- Database connection issues
- High API latency

---

## Deployment Architecture

```
GitHub Repository
      │
      ├─ Trigger on push
      │
Vercel CI/CD Pipeline
      ├─ Build Next.js app
      ├─ Run tests (optional)
      ├─ Deploy to edge network
      └─ Auto-migrate database
         │
      ┌──▼─────────────────┐
      │  Vercel Functions   │  (Serverless)
      │  - API routes       │
      │  - Page rendering   │
      └────┬────────────────┘
           │
      ┌────▼─────────────────┐
      │  PostgreSQL (Neon)   │  (Managed DB)
      │  - Connection pooling│
      │  - Auto-backups      │
      └─────────────────────┘
```

---

**This architecture ensures:** reliability, scalability, maintainability, and optimal performance for your IoT plant monitoring system.
