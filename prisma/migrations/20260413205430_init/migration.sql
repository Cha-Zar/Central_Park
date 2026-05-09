-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorData" (
    "id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "light" DOUBLE PRECISION NOT NULL,
    "airQuality" DOUBLE PRECISION NOT NULL,
    "soilMoisture" DOUBLE PRECISION NOT NULL,
    "vpd" DOUBLE PRECISION NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActuatorStatus" (
    "id" TEXT NOT NULL,
    "waterValveOpen" BOOLEAN NOT NULL DEFAULT false,
    "fanSpeed" INTEGER NOT NULL DEFAULT 0,
    "lightIntensity" INTEGER NOT NULL DEFAULT 0,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActuatorStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "duration" INTEGER,
    "value" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "plantType" TEXT NOT NULL DEFAULT 'generic',
    "humidityTarget" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "lightTarget" DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    "temperatureMin" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "temperatureMax" DOUBLE PRECISION NOT NULL DEFAULT 28.0,
    "vpdTarget" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "soilMoistureMin" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_macAddress_key" ON "Device"("macAddress");

-- CreateIndex
CREATE INDEX "Device_type_idx" ON "Device"("type");

-- CreateIndex
CREATE INDEX "Device_isActive_idx" ON "Device"("isActive");

-- CreateIndex
CREATE INDEX "Device_createdAt_idx" ON "Device"("createdAt");

-- CreateIndex
CREATE INDEX "SensorData_deviceId_idx" ON "SensorData"("deviceId");

-- CreateIndex
CREATE INDEX "SensorData_createdAt_idx" ON "SensorData"("createdAt");

-- CreateIndex
CREATE INDEX "SensorData_healthScore_idx" ON "SensorData"("healthScore");

-- CreateIndex
CREATE UNIQUE INDEX "ActuatorStatus_deviceId_key" ON "ActuatorStatus"("deviceId");

-- CreateIndex
CREATE INDEX "ActuatorStatus_deviceId_idx" ON "ActuatorStatus"("deviceId");

-- CreateIndex
CREATE INDEX "ActuatorStatus_updatedAt_idx" ON "ActuatorStatus"("updatedAt");

-- CreateIndex
CREATE INDEX "Command_deviceId_idx" ON "Command"("deviceId");

-- CreateIndex
CREATE INDEX "Command_status_idx" ON "Command"("status");

-- CreateIndex
CREATE INDEX "Command_createdAt_idx" ON "Command"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_deviceId_idx" ON "Alert"("deviceId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_resolved_idx" ON "Alert"("resolved");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_deviceId_key" ON "Settings"("deviceId");

-- CreateIndex
CREATE INDEX "Settings_deviceId_idx" ON "Settings"("deviceId");

-- AddForeignKey
ALTER TABLE "SensorData" ADD CONSTRAINT "SensorData_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActuatorStatus" ADD CONSTRAINT "ActuatorStatus_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
