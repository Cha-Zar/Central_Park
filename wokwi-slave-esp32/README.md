# Wokwi Slave ESP32 - MQTT Actuators

This Wokwi project replaces the ISIS Slave board.

The Slave subscribes to Master sensor data:

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

It controls simulated actuators:

- fan LED;
- light LED;
- pump LED;
- valve LED;
- alarm LED.

It publishes actuator status to:

```text
green-garden/actuators/AA:BB:CC:DD:EE:02
```

It also listens for dashboard/MQTT commands:

```text
green-garden/commands/AA:BB:CC:DD:EE:02
```

## How it behaves

Automatic mode:

- soil moisture low -> pump ON;
- water level low -> valve OPEN;
- temperature/VPD/air quality high -> fan ON;
- light low -> grow light ON.

Manual command mode:

If the dashboard publishes a command, the Slave applies it. The existing web app can publish commands through `/api/commands` when `MQTT_URL` is configured.
