#include <Arduino.h>
#include <Wire.h>
#include <math.h>

// Wokwi Green Garden simulation based on the Proteus/ISIS schematic.
// One Arduino UNO sketch represents the ARD1 sensor side and ARD2 actuator side.

const uint8_t DHT_PIN = 2;
const uint8_t FAN_LED = 3;
const uint8_t PUMP_LED = 4;
const uint8_t VALVE_LED = 5;
const uint8_t LIGHT_LED = 6;
const uint8_t ALARM_LED = 7;

const uint8_t LDR_PIN = A0;
const uint8_t MQ_PIN = A1;
const uint8_t SOIL_PIN = A2;
const uint8_t WATER_PIN = A3;

const uint8_t LCD_SENSORS_ADDR = 0x27;
const uint8_t LCD_ACTUATORS_ADDR = 0x3f;

const int SOIL_DRY = 40;
const int SOIL_WET = 60;
const int WATER_LOW = 30;
const int WATER_HIGH = 90;

bool pumpState = false;
bool valveOpen = false;

struct DhtReading {
  float temperature;
  float humidity;
  bool ok;
};

void lcdWriteNibble(uint8_t addr, uint8_t nibble, bool rs) {
  uint8_t data = (nibble & 0xF0) | 0x08 | (rs ? 0x01 : 0x00);
  Wire.beginTransmission(addr);
  Wire.write(data | 0x04);
  Wire.endTransmission();
  delayMicroseconds(1);
  Wire.beginTransmission(addr);
  Wire.write(data & ~0x04);
  Wire.endTransmission();
  delayMicroseconds(50);
}

void lcdWriteByte(uint8_t addr, uint8_t value, bool rs) {
  lcdWriteNibble(addr, value & 0xF0, rs);
  lcdWriteNibble(addr, (value << 4) & 0xF0, rs);
}

void lcdCommand(uint8_t addr, uint8_t value) {
  lcdWriteByte(addr, value, false);
}

void lcdPrint(uint8_t addr, const char *text) {
  while (*text) {
    lcdWriteByte(addr, *text++, true);
  }
}

void lcdSetCursor(uint8_t addr, uint8_t col, uint8_t row) {
  static const uint8_t offsets[] = {0x00, 0x40};
  lcdCommand(addr, 0x80 | (col + offsets[row]));
}

void lcdClear(uint8_t addr) {
  lcdCommand(addr, 0x01);
  delay(2);
}

void lcdInit(uint8_t addr) {
  delay(50);
  lcdWriteNibble(addr, 0x30, false);
  delay(5);
  lcdWriteNibble(addr, 0x30, false);
  delayMicroseconds(150);
  lcdWriteNibble(addr, 0x30, false);
  lcdWriteNibble(addr, 0x20, false);
  lcdCommand(addr, 0x28);
  lcdCommand(addr, 0x0C);
  lcdCommand(addr, 0x06);
  lcdClear(addr);
}

bool waitForLevel(uint8_t level, unsigned long timeoutMicros) {
  unsigned long start = micros();
  while (digitalRead(DHT_PIN) != level) {
    if (micros() - start > timeoutMicros) {
      return false;
    }
  }
  return true;
}

DhtReading readDht22() {
  uint8_t data[5] = {0, 0, 0, 0, 0};

  pinMode(DHT_PIN, OUTPUT);
  digitalWrite(DHT_PIN, LOW);
  delay(2);
  digitalWrite(DHT_PIN, HIGH);
  delayMicroseconds(40);
  pinMode(DHT_PIN, INPUT_PULLUP);

  if (!waitForLevel(LOW, 100)) return {24.0, 60.0, false};
  if (!waitForLevel(HIGH, 100)) return {24.0, 60.0, false};
  if (!waitForLevel(LOW, 100)) return {24.0, 60.0, false};

  for (uint8_t i = 0; i < 40; i++) {
    if (!waitForLevel(HIGH, 100)) return {24.0, 60.0, false};
    unsigned long highStart = micros();
    if (!waitForLevel(LOW, 120)) return {24.0, 60.0, false};
    unsigned long highLength = micros() - highStart;

    data[i / 8] <<= 1;
    if (highLength > 45) {
      data[i / 8] |= 1;
    }
  }

  uint8_t checksum = data[0] + data[1] + data[2] + data[3];
  if (checksum != data[4]) {
    return {24.0, 60.0, false};
  }

  uint16_t rawHumidity = (data[0] << 8) | data[1];
  uint16_t rawTemperature = ((data[2] & 0x7F) << 8) | data[3];
  float humidity = rawHumidity / 10.0;
  float temperature = rawTemperature / 10.0;
  if (data[2] & 0x80) {
    temperature = -temperature;
  }

  return {temperature, humidity, true};
}

float calculateVpd(float temperature, float humidity) {
  float es = 0.6108 * exp((17.27 * temperature) / (temperature + 237.3));
  float ea = es * (humidity / 100.0);
  return es - ea;
}

int percentFromAnalog(int raw) {
  return constrain(map(raw, 0, 1023, 0, 100), 0, 100);
}

int calculateHealth(float temp, float humidity, int light, int soil, int water, int air) {
  int score = 40;
  if (temp >= 18 && temp <= 28) score += 15;
  if (humidity >= 50 && humidity <= 80) score += 15;
  if (light >= 35) score += 10;
  if (soil >= 40 && soil <= 80) score += 10;
  if (water >= 30) score += 5;
  if (air < 700) score += 5;
  return constrain(score, 0, 100);
}

void printPaddedInt(uint8_t lcd, int value, uint8_t width) {
  char buffer[8];
  snprintf(buffer, sizeof(buffer), "%*d", width, value);
  lcdPrint(lcd, buffer);
}

void setup() {
  Serial.begin(9600);
  Wire.begin();

  pinMode(FAN_LED, OUTPUT);
  pinMode(PUMP_LED, OUTPUT);
  pinMode(VALVE_LED, OUTPUT);
  pinMode(LIGHT_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);

  lcdInit(LCD_SENSORS_ADDR);
  lcdInit(LCD_ACTUATORS_ADDR);

  lcdSetCursor(LCD_SENSORS_ADDR, 0, 0);
  lcdPrint(LCD_SENSORS_ADDR, "Green Garden");
  lcdSetCursor(LCD_SENSORS_ADDR, 0, 1);
  lcdPrint(LCD_SENSORS_ADDR, "Sensors ready");

  lcdSetCursor(LCD_ACTUATORS_ADDR, 0, 0);
  lcdPrint(LCD_ACTUATORS_ADDR, "Actuators ready");

  Serial.println("Green Garden Wokwi simulation started");
  delay(1500);
}

void loop() {
  DhtReading dht = readDht22();
  int lightRaw = analogRead(LDR_PIN);
  int airRaw = analogRead(MQ_PIN);
  int soilRaw = analogRead(SOIL_PIN);
  int waterRaw = analogRead(WATER_PIN);

  int light = percentFromAnalog(lightRaw);
  int air = percentFromAnalog(airRaw);
  int soil = percentFromAnalog(soilRaw);
  int water = percentFromAnalog(waterRaw);
  float vpd = calculateVpd(dht.temperature, dht.humidity);
  int health = calculateHealth(dht.temperature, dht.humidity, light, soil, water, air);

  if (soil < SOIL_DRY) pumpState = true;
  if (soil >= SOIL_WET) pumpState = false;

  if (water < WATER_LOW) valveOpen = true;
  if (water >= WATER_HIGH) valveOpen = false;

  bool fanOn = dht.temperature > 30 || vpd > 1.6 || air > 70;
  bool lightOn = light < 45;
  bool alarm = health < 60 || water < 20 || soil < 25 || air > 80;

  digitalWrite(FAN_LED, fanOn);
  digitalWrite(PUMP_LED, pumpState);
  digitalWrite(VALVE_LED, valveOpen);
  digitalWrite(LIGHT_LED, lightOn);
  digitalWrite(ALARM_LED, alarm);

  lcdClear(LCD_SENSORS_ADDR);
  lcdSetCursor(LCD_SENSORS_ADDR, 0, 0);
  lcdPrint(LCD_SENSORS_ADDR, "T:");
  printPaddedInt(LCD_SENSORS_ADDR, (int)dht.temperature, 2);
  lcdPrint(LCD_SENSORS_ADDR, " H:");
  printPaddedInt(LCD_SENSORS_ADDR, (int)dht.humidity, 2);
  lcdPrint(LCD_SENSORS_ADDR, " L:");
  printPaddedInt(LCD_SENSORS_ADDR, light, 2);
  lcdSetCursor(LCD_SENSORS_ADDR, 0, 1);
  lcdPrint(LCD_SENSORS_ADDR, "S:");
  printPaddedInt(LCD_SENSORS_ADDR, soil, 2);
  lcdPrint(LCD_SENSORS_ADDR, " W:");
  printPaddedInt(LCD_SENSORS_ADDR, water, 2);
  lcdPrint(LCD_SENSORS_ADDR, " AQ:");
  printPaddedInt(LCD_SENSORS_ADDR, air, 2);

  lcdClear(LCD_ACTUATORS_ADDR);
  lcdSetCursor(LCD_ACTUATORS_ADDR, 0, 0);
  lcdPrint(LCD_ACTUATORS_ADDR, fanOn ? "FAN:ON " : "FAN:OFF");
  lcdPrint(LCD_ACTUATORS_ADDR, lightOn ? " L:ON" : " L:OFF");
  lcdSetCursor(LCD_ACTUATORS_ADDR, 0, 1);
  lcdPrint(LCD_ACTUATORS_ADDR, pumpState ? "PUMP:ON " : "PUMP:OFF");
  lcdPrint(LCD_ACTUATORS_ADDR, valveOpen ? " V:OPEN" : " V:STOP");

  Serial.print("ARD1 packet -> ");
  Serial.print(dht.temperature, 1);
  Serial.print(",");
  Serial.print(dht.humidity, 1);
  Serial.print(",");
  Serial.print(air);
  Serial.print(",");
  Serial.print(light);
  Serial.print(",");
  Serial.print(water);
  Serial.print(",");
  Serial.print(soil);
  Serial.print(",");
  Serial.print(vpd, 2);
  Serial.print(",");
  Serial.println(health);

  Serial.print("ARD2 states -> fan=");
  Serial.print(fanOn ? "ON" : "OFF");
  Serial.print(" light=");
  Serial.print(lightOn ? "ON" : "OFF");
  Serial.print(" pump=");
  Serial.print(pumpState ? "ON" : "OFF");
  Serial.print(" valve=");
  Serial.print(valveOpen ? "OPEN" : "CLOSED");
  Serial.print(" dht=");
  Serial.println(dht.ok ? "OK" : "FALLBACK");

  delay(1500);
}
