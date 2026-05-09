# Green Garden Wokwi Simulation

This folder is the Wokwi replacement for the Proteus/ISIS design.

## Important mapping

Proteus/ISIS is a SPICE simulator. Wokwi is a microcontroller simulator, so power-stage parts such as capacitors, inductors, diodes and transistors are not simulated with the same analog behavior. In this Wokwi version, the important project behavior is preserved:

- sensor inputs are adjustable;
- two LCD1602 I2C screens are used;
- actuator outputs are shown with LEDs;
- the sketch calculates plant status and prints the same data flow that the two-Arduino ISIS design represented.

## ISIS to Wokwi mapping

| ISIS part | Wokwi equivalent | Notes |
|---|---|---|
| ARD1 Arduino UNO | `uno` | Main controller in Wokwi |
| ARD2 Arduino UNO | Simulated in same sketch | Wokwi VS Code is simpler/reliable with one compiled firmware |
| LCD1 16x2 + U2 PCF8574 | `lcdSensors` I2C LCD1602 at `0x27` | Sensor dashboard |
| LCD2 16x2 + U3 PCF8574 | `lcdActuators` I2C LCD1602 at `0x3f` | Actuator dashboard |
| U1 DHT11 | `dht` DHT22-compatible Wokwi part | Same style of temperature/humidity digital sensor |
| LDR1 | `ldr` photoresistor sensor | Connected to `A0` |
| MQ1 gas sensor | `mq` MQ gas sensor | Connected to `A1` |
| SOIL1 soil moisture | `soilPot` potentiometer | Connected to `A2`, adjustable 0-100% |
| WATER1 water sensor | `waterPot` potentiometer | Connected to `A3`, adjustable 0-100% |
| D1, D4, D5, D6 LEDs | `fanLed`, `pumpLed`, `valveLed`, `lightLed` | Actuator/status LEDs |
| R1, R2, R3 | Wokwi resistors | LED current limiters |
| C1, C2, C3, L1, L2, L3, D2, D3, Q1, Q2 | Not required in Wokwi logic simulation | Proteus analog/power-stage parts |
| RV1, RV2, RV3 | Covered by adjustable Wokwi sensor controls | Soil/water/light/gas are adjustable in the simulator |

## Files

- `wokwi-green-garden.ino` - Arduino UNO code.
- `diagram.json` - Wokwi circuit diagram.
- `wokwi.toml` - VS Code Wokwi configuration.

## How to run in VS Code

Wokwi for VS Code needs compiled firmware files. This project expects:

```text
build/wokwi-green-garden.ino.hex
build/wokwi-green-garden.ino.elf
```

If you use Arduino CLI, compile like this from inside `wokwi-green-garden`:

```bash
arduino-cli core install arduino:avr
arduino-cli compile --fqbn arduino:avr:uno --output-dir build .
```

Then press `F1` and run:

```text
Wokwi: Start Simulator
```

If Arduino CLI is not installed, install it first or compile the sketch with Arduino IDE and copy the generated `.hex`/`.elf` into the `build` folder.

## What to watch

- Change the DHT temperature/humidity in Wokwi.
- Change `ldr`, `mq`, `soilPot`, and `waterPot`.
- LCD1 shows sensor values.
- LCD2 shows fan/light/pump/valve states.
- Serial Monitor prints the packet that would normally pass between ARD1 and ARD2.
