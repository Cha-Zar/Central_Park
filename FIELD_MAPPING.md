# Field Mapping Reference

## Complete Sensor & Actuator to Database Schema Mapping

### 🎯 Coherence Verification - Everything Matches!

---

## 📊 SENSOR DATA (ESP32 Master → Database)

| ESP32 Pin | Sensor | Variable | Database Field | Unit | Range |
|-----------|--------|----------|-----------------|------|-------|
| Pin 4 | DHT11 | `t` | `temperature` | °C | 0-50 |
| Pin 4 | DHT11 | `h` | `humidity` | % | 0-100 |
| Pin 34 | MQ135 | `air` | `airQuality` | Raw | 0-4095 |
| Pin 35 | LDR | `light` | `light` | % | 0-100 |
| Pin 32 | WATER | `waterLevel` | `waterLevel` | % | 0-100 |
| Pin 33 | SOIL | `soil` | `soilMoisture` | % | 0-100 |
| — | Calculated | `vpd` | `vpd` | kPa | 0-5 |
| — | Algorithm | — | `healthScore` | Points | 0-100 |

**Database Model**: `SensorData`
**Relationship**: Many SensorData → One Device (Master)

---

## 🎛️ ACTUATOR STATUS (ESP32 Slave → Database)

| ESP32 Pin | Actuator | Control | Variable | Database Field | Unit | Range |
|-----------|----------|---------|----------|-----------------|------|-------|
| Pin 25 | FAN | PWM (ledcWrite) | `fanPWM` | `fanSpeed` | % | 0-100 |
| Pin 26 | LIGHT | PWM (ledcWrite) | `lightPWM` | `lightIntensity` | % | 0-100 |
| Pin 27 | PUMP | Digital (digitalWrite) | `pumpState` | `pumpState` | Boolean | ON/OFF |
| Pin 18 | VALVE | Servo (servo.write) | `valveOpen` | `waterValveOpen` | Boolean | OPEN/CLOSE |

**Database Model**: `ActuatorStatus`
**Relationship**: One ActuatorStatus ↔ One Device (Slave)

---

## 🚨 STATUS INDICATORS (for reference, stored via actuator status)

| ESP32 Pin | Component | Indicates | Source |
|-----------|-----------|-----------|--------|
| Pin 14 | LED_FAN | `fanPWM > 0` | FAN status |
| Pin 12 | LED_VALVE | `valveOpen == true` | VALVE status |
| Pin 13 | LED_PUMP | `pumpState == true` | PUMP status |

**Note**: LEDs are physical indicators only, not stored in database

---

## 📥 DATA FLOW

### Master → Slave Communication
```
ESP32_MASTER (Sensors)
    ↓ (UART Serial2, pins 16-17)
String packet: "24.5,65.3,1200,75,85,55,0.85"
    ↓ (Parsed in Slave)
ESP32_SLAVE (Actuators)
    ├─ Adjusts FAN based on temperature & VPD
    ├─ Adjusts LIGHT based on light level
    ├─ Triggers PUMP based on soil moisture
    └─ Triggers VALVE based on water level
```

### Database Insertion
```
SensorData {
  temperature, humidity, airQuality, light, 
  waterLevel, soilMoisture, vpd, healthScore,
  deviceId: "master_device_id"
}

ActuatorStatus {
  fanSpeed, lightIntensity, pumpState, waterValveOpen,
  deviceId: "slave_device_id"
}
```

---

## 🎲 TEST DATA RANGES (from test-data/)

**Sensor Readings**:
- Temperature: 22.9-26.0°C ✓
- Humidity: 60.5-70.1% ✓
- Air Quality: 1100-1320 ✓
- Light: 68-80% ✓
- Water Level: 79-92% ✓ (NEW - now tracked)
- Soil Moisture: 48-61% ✓
- VPD: 0.72-0.98 ✓
- Health Score: 88-95 ✓

**Actuator States**:
- Fan Speed: 30-65% ✓
- Light Intensity: 60-90% ✓
- Pump: OFF/ON ✓ (NEW - now tracked)
- Valve: OPEN/CLOSE ✓

---

## ✅ Database Schema Status

- ✅ All ESP32 sensor pins mapped
- ✅ All ESP32 actuator pins mapped
- ✅ `waterLevel` field added to SensorData
- ✅ `pumpState` field added to ActuatorStatus
- ✅ Proper indexing for performance
- ✅ Cascade delete for data integrity
- ✅ Timestamp tracking enabled

**Everything is now coherent and ready for production!**
