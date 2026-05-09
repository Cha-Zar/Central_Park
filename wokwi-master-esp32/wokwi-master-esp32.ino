#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// Use the same broker in your app .env:
// MQTT_URL="mqtt://broker.hivemq.com:1883"
#define MQTT_HOST "broker.hivemq.com"
#define MQTT_PORT 1883

// Optional. Leave empty for MQTT-only demo.
#define HTTP_API_URL ""

#define MASTER_MAC "AA:BB:CC:DD:EE:01"
#define SENSOR_TOPIC "green-garden/sensors/AA:BB:CC:DD:EE:01"

#define DHT_PIN 15
#define DHT_TYPE DHT22
#define LDR_PIN 34
#define GAS_PIN 35
#define SOIL_PIN 32
#define WATER_PIN 33

DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

unsigned long lastPublish = 0;
const unsigned long PUBLISH_INTERVAL = 3000;

float calculateVpd(float temperature, float humidity) {
  float es = 0.6108 * exp((17.27 * temperature) / (temperature + 237.3));
  float ea = es * (humidity / 100.0);
  return es - ea;
}

int percentFromAnalog(int raw) {
  return constrain(map(raw, 0, 4095, 0, 100), 0, 100);
}

int calculateHealth(float temp, float humidity, int light, int soil, int water, int airQuality) {
  int score = 40;
  if (temp >= 18 && temp <= 28) score += 15;
  if (humidity >= 50 && humidity <= 80) score += 15;
  if (light >= 35) score += 10;
  if (soil >= 40 && soil <= 80) score += 10;
  if (water >= 30) score += 10;
  if (airQuality < 350) score += 10;
  return constrain(score, 0, 100);
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
    String clientId = "green-garden-master-" + String(random(0xffff), HEX);
    Serial.print("MQTT connecting...");
    if (mqtt.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed rc=");
      Serial.println(mqtt.state());
      delay(1000);
    }
  }
}

void sendHttp(const String &payload) {
  if (String(HTTP_API_URL).length() == 0) return;

  HTTPClient http;
  http.begin(HTTP_API_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  Serial.print("HTTP code: ");
  Serial.println(code);
  http.end();
}

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0));

  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Master Sensors");
  lcd.setCursor(0, 1);
  lcd.print("Connecting...");

  connectWifi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  connectMqtt();

  lcd.clear();
  lcd.print("MQTT ready");
}

void loop() {
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();

  if (millis() - lastPublish < PUBLISH_INTERVAL) return;
  lastPublish = millis();

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature)) temperature = 24.5;
  if (isnan(humidity)) humidity = 65.0;

  int light = percentFromAnalog(analogRead(LDR_PIN));
  int airQuality = map(analogRead(GAS_PIN), 0, 4095, 0, 500);
  int soilMoisture = percentFromAnalog(analogRead(SOIL_PIN));
  int waterLevel = percentFromAnalog(analogRead(WATER_PIN));
  float vpd = calculateVpd(temperature, humidity);
  int healthScore = calculateHealth(temperature, humidity, light, soilMoisture, waterLevel, airQuality);

  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["airQuality"] = airQuality;
  doc["light"] = light;
  doc["waterLevel"] = waterLevel;
  doc["soilMoisture"] = soilMoisture;
  doc["vpd"] = vpd;
  doc["healthScore"] = healthScore;
  doc["macAddress"] = MASTER_MAC;

  String payload;
  serializeJson(doc, payload);

  mqtt.publish(SENSOR_TOPIC, payload.c_str());
  sendHttp(payload);

  Serial.print("Published sensor data: ");
  Serial.println(payload);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print((int)temperature);
  lcd.print(" H:");
  lcd.print((int)humidity);
  lcd.print(" L:");
  lcd.print(light);
  lcd.setCursor(0, 1);
  lcd.print("S:");
  lcd.print(soilMoisture);
  lcd.print(" W:");
  lcd.print(waterLevel);
  lcd.print(" AQ:");
  lcd.print(airQuality);
}
