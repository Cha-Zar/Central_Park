#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// Use the same broker in your app .env:
// MQTT_URL="mqtt://broker.hivemq.com:1883"
#define MQTT_HOST "broker.hivemq.com"
#define MQTT_PORT 1883

#define SLAVE_MAC "AA:BB:CC:DD:EE:02"
#define SENSOR_TOPIC "green-garden/sensors/AA:BB:CC:DD:EE:01"
#define STATUS_TOPIC "green-garden/actuators/AA:BB:CC:DD:EE:02"
#define COMMAND_TOPIC "green-garden/commands/AA:BB:CC:DD:EE:02"

#define FAN_LED 25
#define LIGHT_LED 26
#define PUMP_LED 27
#define VALVE_LED 14
#define ALARM_LED 12

const int SOIL_DRY = 40;
const int SOIL_WET = 60;
const int WATER_LOW = 30;
const int WATER_HIGH = 90;

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
LiquidCrystal_I2C lcd(0x27, 16, 2);

float temperature = 24.5;
float humidity = 65;
float vpd = 0.85;
int airQuality = 100;
int lightLevel = 75;
int waterLevel = 80;
int soilMoisture = 55;

int fanSpeed = 0;
int lightIntensity = 0;
bool pumpState = false;
bool waterValveOpen = false;
bool manualFan = false;
bool manualLight = false;
unsigned long lastStatusPublish = 0;

void publishStatus() {
  StaticJsonDocument<192> doc;
  doc["fanSpeed"] = fanSpeed;
  doc["lightIntensity"] = lightIntensity;
  doc["pumpState"] = pumpState;
  doc["waterValveOpen"] = waterValveOpen;
  doc["macAddress"] = SLAVE_MAC;

  String payload;
  serializeJson(doc, payload);
  mqtt.publish(STATUS_TOPIC, payload.c_str());

  Serial.print("Published actuator status: ");
  Serial.println(payload);
}

void applyOutputs() {
  digitalWrite(FAN_LED, fanSpeed > 0);
  digitalWrite(LIGHT_LED, lightIntensity > 0);
  digitalWrite(PUMP_LED, pumpState);
  digitalWrite(VALVE_LED, waterValveOpen);

  bool alarm = soilMoisture < 25 || waterLevel < 20 || airQuality > 400 || temperature > 35;
  digitalWrite(ALARM_LED, alarm);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("F:");
  lcd.print(fanSpeed);
  lcd.print(" L:");
  lcd.print(lightIntensity);
  lcd.setCursor(0, 1);
  lcd.print("P:");
  lcd.print(pumpState ? "ON " : "OFF");
  lcd.print(" V:");
  lcd.print(waterValveOpen ? "OPEN" : "CLOSE");
}

void autoControl() {
  if (!manualFan) {
    if (temperature > 30 || vpd > 1.6 || airQuality > 350) fanSpeed = 80;
    else if (temperature > 27) fanSpeed = 40;
    else fanSpeed = 0;
  }

  if (!manualLight) {
    if (lightLevel < 35) lightIntensity = 90;
    else if (lightLevel < 55) lightIntensity = 50;
    else lightIntensity = 0;
  }

  if (soilMoisture < SOIL_DRY) pumpState = true;
  if (soilMoisture >= SOIL_WET) pumpState = false;

  if (waterLevel < WATER_LOW) waterValveOpen = true;
  if (waterLevel >= WATER_HIGH) waterValveOpen = false;

  applyOutputs();
}

void handleSensorMessage(const JsonDocument &doc) {
  temperature = doc["temperature"] | temperature;
  humidity = doc["humidity"] | humidity;
  airQuality = doc["airQuality"] | airQuality;
  lightLevel = doc["light"] | lightLevel;
  waterLevel = doc["waterLevel"] | waterLevel;
  soilMoisture = doc["soilMoisture"] | soilMoisture;
  vpd = doc["vpd"] | vpd;

  Serial.print("Received sensors: ");
  serializeJson(doc, Serial);
  Serial.println();

  autoControl();
  publishStatus();
}

void handleCommandMessage(const JsonDocument &doc) {
  const char *action = doc["action"] | "";
  int value = doc["value"] | 0;

  if (strcmp(action, "fan") == 0) {
    fanSpeed = constrain(value, 0, 100);
    manualFan = true;
  } else if (strcmp(action, "light") == 0) {
    lightIntensity = constrain(value, 0, 100);
    manualLight = true;
  } else if (strcmp(action, "water") == 0) {
    pumpState = value > 0;
  } else if (strcmp(action, "valve") == 0) {
    waterValveOpen = value > 0;
  }

  Serial.print("Received command: ");
  serializeJson(doc, Serial);
  Serial.println();

  applyOutputs();
  publishStatus();
}

void onMqttMessage(char *topic, byte *payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("JSON error: ");
    Serial.println(error.c_str());
    return;
  }

  if (strcmp(topic, SENSOR_TOPIC) == 0) {
    handleSensorMessage(doc);
  } else if (strcmp(topic, COMMAND_TOPIC) == 0) {
    handleCommandMessage(doc);
  }
}

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void connectMqtt() {
  while (!mqtt.connected()) {
    String clientId = "green-garden-slave-" + String(random(0xffff), HEX);
    Serial.print("MQTT connecting...");
    if (mqtt.connect(clientId.c_str())) {
      Serial.println("connected");
      mqtt.subscribe(SENSOR_TOPIC);
      mqtt.subscribe(COMMAND_TOPIC);
      Serial.println("Subscribed to sensor and command topics");
    } else {
      Serial.print("failed rc=");
      Serial.println(mqtt.state());
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0));

  pinMode(FAN_LED, OUTPUT);
  pinMode(LIGHT_LED, OUTPUT);
  pinMode(PUMP_LED, OUTPUT);
  pinMode(VALVE_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Slave Actuators");
  lcd.setCursor(0, 1);
  lcd.print("Connecting...");

  connectWifi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMqttMessage);
  connectMqtt();

  autoControl();
  publishStatus();
}

void loop() {
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();

  if (millis() - lastStatusPublish > 5000) {
    publishStatus();
    lastStatusPublish = millis();
  }
}
