#include <Wire.h>
#include <U8g2lib.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ===== WiFi CONFIGURATION =====
#define WIFI_SSID "Galaxy S23"
#define WIFI_PASSWORD "youssef12345"
#define DASHBOARD_URL "https://green-garden-green.vercel.app/"  // Change to Vercel URL when deployed

// ===== SERIAL2 =====
HardwareSerial mySerial(2);

// ===== OLED =====
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// ===== SERVOS & ACTUATORS =====
Servo valve;
Servo pumpServo;

#define FAN 25
#define LIGHT 26
#define PUMP_PIN 27       // ← only once
#define SERVO_PIN 18
#define PUMP_STOP 93      // ← tune this (88–95) until motor truly stops

#define LED_FAN 14
#define LED_VALVE 12
#define LED_PUMP 13

// ===== SENSOR DATA FROM MASTER =====
String data = "";
float t, h, vpd;
int air, light, waterLevel, soil;

// ===== ACTUATOR STATES =====
bool pumpState     = false;
bool valveOpen     = false;
bool lastPumpState = false;  // ← state-change guards
bool lastValveState= false;
bool connected     = false;

// ===== TIMING =====
unsigned long lastDataTime = 0;
const unsigned long TIMEOUT = 3000;
unsigned long lastUploadTime = 0;
const unsigned long UPLOAD_INTERVAL = 5000;  // Send data every 5 seconds

// ===== THRESHOLDS =====
const int SOIL_DRY  = 40;
const int SOIL_WET  = 60;
const int WATER_LOW = 30;
const int WATER_HIGH= 90;

// ===== GET MAC ADDRESS =====
String getMacAddress() {
  return WiFi.macAddress();
}

// ===== SEND ACTUATOR STATUS TO BACKEND =====
bool sendActuatorStatusToBackend(int fanPWM, int lightPWM, bool pump, bool valve) {
  HTTPClient http;
  String endpoint = String(DASHBOARD_URL) + "api/actuators";
  
  // Build JSON payload
  String jsonPayload = "{";
  jsonPayload += "\"fanSpeed\":" + String(map(fanPWM, 0, 255, 0, 100)) + ",";
  jsonPayload += "\"lightIntensity\":" + String(map(lightPWM, 0, 255, 0, 100)) + ",";
  jsonPayload += "\"pumpState\":" + String(pump ? "true" : "false") + ",";
  jsonPayload += "\"waterValveOpen\":" + String(valve ? "true" : "false") + ",";
  jsonPayload += "\"macAddress\":\"" + getMacAddress() + "\"";
  jsonPayload += "}";
  
  Serial.println("Sending to backend: " + endpoint);
  Serial.println("Payload: " + jsonPayload);
  
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonPayload);
  
  Serial.print("Backend response code: ");
  Serial.println(httpResponseCode);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Response: " + response);
  }
  
  http.end();
  
  return (httpResponseCode == 200 || httpResponseCode == 201);
}

void setup() {
  Serial.begin(115200); // debug
  mySerial.begin(115200, SERIAL_8N1, 16, 17); // RX, TX

  pinMode(LED_FAN,   OUTPUT);
  pinMode(LED_VALVE, OUTPUT);
  pinMode(LED_PUMP,  OUTPUT);

  // Servos first — before ledcAttach
  valve.attach(SERVO_PIN);
  pumpServo.attach(PUMP_PIN);
  pumpServo.write(PUMP_STOP);  // true stop on boot
  valve.write(0);              // closed on boot

  ledcAttach(FAN,   5000, 8);
  ledcAttach(LIGHT, 5000, 8);

  u8g2.begin();

  // ===== WiFi CONNECTION =====
  Serial.println("\n\nStarting WiFi connection...");
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x10_tr);
  u8g2.setCursor(0, 20);
  u8g2.print("WiFi: Connecting...");
  u8g2.sendBuffer();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    u8g2.clearBuffer();
    u8g2.setCursor(0, 20);
    u8g2.print("WiFi: OK");
    u8g2.setCursor(0, 35);
    u8g2.print("Starting...");
    u8g2.sendBuffer();
    delay(2000);
  } else {
    Serial.println("\nFailed to connect to WiFi!");
    u8g2.clearBuffer();
    u8g2.setCursor(0, 20);
    u8g2.print("WiFi: FAILED");
    u8g2.setCursor(0, 35);
    u8g2.print("Check credentials");
    u8g2.sendBuffer();
  }
}

void loop() {
  if (millis() - lastDataTime > TIMEOUT) connected = false;

  while (mySerial.available()) {
    char c = mySerial.read();
    if (c == '\n') {
      sscanf(data.c_str(), "%f,%f,%d,%d,%d,%d,%f",
             &t, &h, &air, &light, &waterLevel, &soil, &vpd);
      data = "";
      connected = true;
      lastDataTime = millis();
    } else {
      data += c;
    }
  }

  int fanPWM = 0;
  int lightPWM = 0;

  if (soil < SOIL_DRY)        pumpState = true;
  else if (soil >= SOIL_WET)  pumpState = false;

  if (waterLevel < WATER_LOW)        valveOpen = true;
  else if (waterLevel >= WATER_HIGH) valveOpen = false;

  if (t > 35)                        fanPWM = 255;
  if (vpd > 2.0)                     fanPWM = 180;
  if (air > 1000 && fanPWM < 128)    fanPWM = 128;

  lightPWM = map(100 - light, 0, 100, 0, 255);

  ledcWrite(FAN,   fanPWM);
  ledcWrite(LIGHT, lightPWM);

  // Only write servo on state change
  if (pumpState != lastPumpState) {
    pumpServo.write(pumpState ? 180 : PUMP_STOP);
    lastPumpState = pumpState;
  }

  if (valveOpen != lastValveState) {
    valve.write(valveOpen ? 90 : 0);
    lastValveState = valveOpen;
  }

  digitalWrite(LED_FAN,   fanPWM > 0);
  digitalWrite(LED_PUMP,  pumpState);
  digitalWrite(LED_VALVE, valveOpen);

  // ===== SEND ACTUATOR STATUS TO BACKEND =====
  if (millis() - lastUploadTime > UPLOAD_INTERVAL && connected && WiFi.status() == WL_CONNECTED) {
    sendActuatorStatusToBackend(fanPWM, lightPWM, pumpState, valveOpen);
    lastUploadTime = millis();
  }

  // ===== DEBUG TO USB SERIAL =====
  Serial.println("===== ACTUATOR STATUS =====");
  Serial.print("Fan PWM: "); Serial.println(fanPWM);
  Serial.print("Light PWM: "); Serial.println(lightPWM);
  Serial.print("Pump: "); Serial.println(pumpState ? "ON" : "OFF");
  Serial.print("Valve: "); Serial.println(valveOpen ? "OPEN" : "CLOSED");
  Serial.println("=============================\n");

  // ===== OLED DISPLAY =====
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x10_tr);

  if (!connected) {
    u8g2.setCursor(20, 30); u8g2.print("NO DATA!");
    u8g2.setCursor(10, 45); u8g2.print("WAITING MASTER");
  } else {
    u8g2.setCursor(0,  10); u8g2.print("FAN:");   u8g2.print(map(fanPWM,   0,255,0,100)); u8g2.print("%");
    u8g2.setCursor(64, 10); u8g2.print("LIGHT:"); u8g2.print(map(lightPWM, 0,255,0,100)); u8g2.print("%");
    u8g2.setCursor(0,  25); u8g2.print("PUMP:");  u8g2.print(pumpState  ? "ON"   : "OFF");
    u8g2.setCursor(64, 25); u8g2.print("VALVE:"); u8g2.print(valveOpen  ? "FILL" : "STOP");
    u8g2.setCursor(0,  45); u8g2.print("Soil:");  u8g2.print(soil);        u8g2.print("%");
    u8g2.setCursor(64, 45); u8g2.print("Water:"); u8g2.print(waterLevel);  u8g2.print("%");
  }

  u8g2.sendBuffer();
  delay(1500);
}