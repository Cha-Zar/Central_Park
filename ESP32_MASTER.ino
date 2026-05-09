#include <Wire.h>
#include <U8g2lib.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ===== WiFi CONFIGURATION =====
#define WIFI_SSID "Galaxy S23"
#define WIFI_PASSWORD "youssef12345"
#define DASHBOARD_URL "https://green-garden-green.vercel.app/"  // Change to Vercel URL when deployed

// ===== SERIAL2 =====
HardwareSerial mySerial(2);

// ===== DHT =====
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ===== SENSORS =====
#define MQ135 34
#define LDR   35
#define WATER 32
#define SOIL  33

// ===== OLED =====
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// ===== VPD =====
float calculateVPD(float T, float H) {
  float es = 0.6108 * exp((17.27 * T) / (T + 237.3));
  float ea = es * (H / 100.0);
  return es - ea;
}

// ===== GET MAC ADDRESS =====
String getMacAddress() {
  return WiFi.macAddress();
}

// ===== SEND SENSOR DATA TO BACKEND =====
bool sendSensorDataToBackend(float temp, float humidity, int air, int light, 
                               int waterLevel, int soil, float vpd) {
  HTTPClient http;
  String endpoint = String(DASHBOARD_URL) + "api/data";
  
  // Build JSON payload
  String jsonPayload = "{";
  jsonPayload += "\"temperature\":" + String(temp) + ",";
  jsonPayload += "\"humidity\":" + String(humidity) + ",";
  jsonPayload += "\"airQuality\":" + String(air) + ",";
  jsonPayload += "\"light\":" + String(light) + ",";
  jsonPayload += "\"waterLevel\":" + String(waterLevel) + ",";
  jsonPayload += "\"soilMoisture\":" + String(soil) + ",";
  jsonPayload += "\"vpd\":" + String(vpd, 2) + ",";
  jsonPayload += "\"healthScore\":75,";
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

// ===== VERIFY DASHBOARD CONNECTION =====
bool verifyDashboardConnection() {
  HTTPClient http;
  String healthCheck = String(DASHBOARD_URL) + "api/data";
  
  http.begin(healthCheck);
  int httpResponseCode = http.GET();
  
  bool connected = (httpResponseCode > 0 && httpResponseCode < 500);
  
  Serial.print("Dashboard health check: ");
  Serial.println(httpResponseCode);
  
  http.end();
  return connected;
}

void setup() {
  Serial.begin(115200); // debug
  mySerial.begin(115200, SERIAL_8N1, 16, 17); // RX, TX

  dht.begin();
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
    
    // ===== VERIFY DASHBOARD CONNECTION =====
    Serial.println("Verifying dashboard connection...");
    u8g2.clearBuffer();
    u8g2.setCursor(0, 20);
    u8g2.print("Dashboard: Checking...");
    u8g2.sendBuffer();
    
    if (verifyDashboardConnection()) {
      Serial.println("Dashboard connection verified!");
      u8g2.clearBuffer();
      u8g2.setCursor(0, 20);
      u8g2.print("Dashboard: OK");
      u8g2.setCursor(0, 35);
      u8g2.print("Starting...");
      u8g2.sendBuffer();
      delay(2000);
    } else {
      Serial.println("WARNING: Could not verify dashboard connection!");
      u8g2.clearBuffer();
      u8g2.setCursor(0, 20);
      u8g2.print("Dashboard: FAILED");
      u8g2.setCursor(0, 35);
      u8g2.print("Check URL/IP");
      u8g2.sendBuffer();
      delay(3000);
    }
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

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  int air = analogRead(MQ135);
  int lightRaw = analogRead(LDR);
  int waterRaw = analogRead(WATER);
  int soilRaw = analogRead(SOIL);

  int light = map(lightRaw, 0, 4095, 0, 100);
  int soil  = map(soilRaw, 4095, 0, 0, 100);
  int waterLevel = map(waterRaw, 0, 2000, 0, 100);

  float vpd = calculateVPD(t, h);

  // ===== SEND DATA TO NEON DATABASE =====
  sendSensorDataToBackend(t, h, air, light, waterLevel, soil, vpd);

  // ===== BUILD DATA STRING =====
  String packet = String(t) + "," +
                  String(h) + "," +
                  String(air) + "," +
                  String(light) + "," +
                  String(waterLevel) + "," +
                  String(soil) + "," +
                  String(vpd);

  // ===== SEND TO ESP32 #2 =====
  mySerial.println(packet);

  // ===== DEBUG TO USB SERIAL =====
  Serial.println("===== SENT PACKET =====");
  Serial.println(packet);

  Serial.println("Parsed Values:");
  Serial.print("Temp: "); Serial.println(t);
  Serial.print("Humidity: "); Serial.println(h);
  Serial.print("Air: "); Serial.println(air);
  Serial.print("Light: "); Serial.println(light);
  Serial.print("Water: "); Serial.println(waterLevel);
  Serial.print("Soil: "); Serial.println(soil);
  Serial.print("VPD: "); Serial.println(vpd);
  Serial.println("=======================\n");

  // ===== OLED DISPLAY =====
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x10_tr);

  u8g2.setCursor(0,10);
  u8g2.print("T:"); u8g2.print(t);

  u8g2.setCursor(64,10);
  u8g2.print("H:"); u8g2.print(h);

  u8g2.setCursor(0,25);
  u8g2.print("Soil:"); u8g2.print(soil); u8g2.print("%");

  u8g2.setCursor(64,25);
  u8g2.print("Water:"); u8g2.print(waterLevel); u8g2.print("%");

  u8g2.setCursor(0,45);
  u8g2.print("Light:"); u8g2.print(light); u8g2.print("%");

  u8g2.setCursor(64,45);
  u8g2.print("VPD:"); u8g2.print(vpd);

  u8g2.sendBuffer();

  delay(1500);
}