# Diagrammes - Central Park IoT

Ce fichier regroupe les diagrammes utiles pour la presentation et le cahier des charges. Les diagrammes sont ecrits en Mermaid pour etre faciles a copier, modifier et exporter en image.

## 1. Diagramme Bloc Simple

Utilise ce diagramme dans la presentation. Il est simple et facile a comprendre.

```mermaid
flowchart LR
    A[Capteurs] --> B[ESP32 Master]
    B --> C[MQTT Broker]
    C --> D[ESP32 Slave]
    D --> E[Actionneurs]
    C --> F[Worker MQTT]
    F --> G[Base de donnees]
    G --> H[Dashboard Web]
```

Version texte si Mermaid n'est pas accepte :

```text
Capteurs -> ESP32 Master -> MQTT Broker -> ESP32 Slave -> Actionneurs
                                |
                                v
                         Worker MQTT -> Base de donnees -> Dashboard Web
```

## 2. Architecture IoT Complete

Ce diagramme montre le lien entre le monde physique et le monde numerique.

```mermaid
flowchart TB
    subgraph Physique["Monde physique"]
        P1[Temperature]
        P2[Humidite air]
        P3[Lumiere]
        P4[Gaz / qualite air]
        P5[Humidite sol]
        P6[Niveau eau]
    end

    subgraph Capteurs["Capteurs"]
        C1[DHT22 / DHT11]
        C2[LDR]
        C3[MQ135]
        C4[Soil moisture]
        C5[Water level]
    end

    subgraph Master["ESP32 Master"]
        M1[Lecture capteurs]
        M2[Calcul VPD]
        M3[Calcul health score]
        M4[Publication MQTT]
    end

    subgraph Communication["Communication"]
        Q[MQTT Broker]
    end

    subgraph Slave["ESP32 Slave"]
        S1[Reception donnees]
        S2[Decision automatique]
        S3[Publication etat actionneurs]
    end

    subgraph Actionneurs["Actionneurs"]
        A1[Ventilateur]
        A2[Lampe]
        A3[Pompe]
        A4[Vanne]
        A5[Alarme LED]
    end

    subgraph Web["Plateforme web"]
        W1[Worker MQTT]
        W2[PostgreSQL]
        W3[Dashboard Central Park]
    end

    P1 --> C1
    P2 --> C1
    P3 --> C2
    P4 --> C3
    P5 --> C4
    P6 --> C5

    C1 --> M1
    C2 --> M1
    C3 --> M1
    C4 --> M1
    C5 --> M1

    M1 --> M2 --> M3 --> M4 --> Q

    Q --> S1 --> S2
    S2 --> A1
    S2 --> A2
    S2 --> A3
    S2 --> A4
    S2 --> A5
    S2 --> S3 --> Q

    Q --> W1 --> W2 --> W3
```

## 3. Diagramme Master / Slave

Ce diagramme explique pourquoi il y a deux ESP32.

```mermaid
flowchart LR
    subgraph Master["ESP32 Master - Acquisition"]
        C1[DHT22]
        C2[LDR]
        C3[MQ135]
        C4[Soil sensor]
        C5[Water sensor]
        M[Lecture et envoi donnees]
    end

    subgraph MQTT["MQTT Broker"]
        T1[Topic sensors]
        T2[Topic actuators]
        T3[Topic commands]
    end

    subgraph Slave["ESP32 Slave - Controle"]
        S[Reception et decision]
        A1[Ventilateur]
        A2[Lampe]
        A3[Pompe]
        A4[Vanne]
    end

    C1 --> M
    C2 --> M
    C3 --> M
    C4 --> M
    C5 --> M

    M --> T1
    T1 --> S
    S --> A1
    S --> A2
    S --> A3
    S --> A4
    S --> T2
    T3 --> S
```

## 4. Diagramme Des Topics MQTT

Ce diagramme montre les messages MQTT utilises.

```mermaid
flowchart TB
    Master[ESP32 Master] -->|Publie donnees capteurs| TopicSensors["green-garden/sensors/AA:BB:CC:DD:EE:01"]

    TopicSensors -->|Recoit donnees| Slave[ESP32 Slave]
    TopicSensors -->|Stocke mesures| Worker[Worker MQTT]

    Slave -->|Publie etat actionneurs| TopicActuators["green-garden/actuators/AA:BB:CC:DD:EE:02"]
    TopicActuators --> Worker

    Dashboard[Dashboard / API] -->|Publie commande| TopicCommands["green-garden/commands/AA:BB:CC:DD:EE:02"]
    TopicCommands --> Slave

    Worker --> DB[(PostgreSQL)]
    DB --> Dashboard
```

## 5. Flux Des Donnees Capteurs

Ce diagramme montre comment une valeur capteur arrive jusqu'au dashboard.

```mermaid
flowchart LR
    A[Grandeur physique] --> B[Capteur]
    B --> C[Signal electrique]
    C --> D[ESP32 Master]
    D --> E[JSON]
    E --> F[MQTT Broker]
    F --> G[Worker MQTT]
    G --> H[(PostgreSQL)]
    H --> I[API Next.js]
    I --> J[Dashboard]
    J --> K[Cartes + Courbes]
```

## 6. Flux De Controle Des Actionneurs

Ce diagramme montre comment le systeme agit sur la serre.

```mermaid
flowchart LR
    A[Donnees capteurs] --> B[ESP32 Slave]
    B --> C{Condition critique ?}
    C -->|Sol sec| D[Pompe ON]
    C -->|Lumiere faible| E[Lampe ON]
    C -->|Gaz eleve| F[Ventilateur ON]
    C -->|Niveau eau bas| G[Vanne ouverte]
    C -->|Normal| H[Actionneurs OFF ou stables]
    D --> I[Etat publie MQTT]
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J[Dashboard]
```

## 7. Logique Automatique

Ce diagramme est tres utile pour expliquer la partie controle.

```mermaid
flowchart TB
    Start[Reception donnees capteurs] --> Soil{soilMoisture < 40 ?}
    Soil -->|Oui| PumpOn[Pompe ON]
    Soil -->|Non| SoilWet{soilMoisture >= 60 ?}
    SoilWet -->|Oui| PumpOff[Pompe OFF]
    SoilWet -->|Non| WaterCheck
    PumpOn --> WaterCheck{waterLevel < 30 ?}
    PumpOff --> WaterCheck

    WaterCheck -->|Oui| ValveOpen[Vanne ouverte]
    WaterCheck -->|Non| WaterHigh{waterLevel >= 90 ?}
    WaterHigh -->|Oui| ValveClose[Vanne fermee]
    WaterHigh -->|Non| LightCheck
    ValveOpen --> LightCheck{light < 35 ?}
    ValveClose --> LightCheck

    LightCheck -->|Oui| LightHigh[Lampe 90%]
    LightCheck -->|Non| LightMid{light < 55 ?}
    LightMid -->|Oui| Light50[Lampe 50%]
    LightMid -->|Non| LightOff[Lampe OFF]

    LightHigh --> AirCheck{airQuality > 350 ou temp > 30 ?}
    Light50 --> AirCheck
    LightOff --> AirCheck

    AirCheck -->|Oui| FanHigh[Ventilateur 80%]
    AirCheck -->|Non| TempMid{temperature > 27 ?}
    TempMid -->|Oui| FanMid[Ventilateur 40%]
    TempMid -->|Non| FanOff[Ventilateur OFF]

    FanHigh --> Publish[Publier etat actionneurs]
    FanMid --> Publish
    FanOff --> Publish
```

## 8. Diagramme De Sequence - Fonctionnement Normal

Ce diagramme montre l'ordre des actions pendant l'execution.

```mermaid
sequenceDiagram
    participant Capteurs
    participant Master as ESP32 Master
    participant MQTT as MQTT Broker
    participant Slave as ESP32 Slave
    participant Worker as Worker MQTT
    participant DB as PostgreSQL
    participant Web as Dashboard

    Capteurs->>Master: Mesures environnementales
    Master->>Master: Calcul VPD + health score
    Master->>MQTT: Publie donnees capteurs
    MQTT->>Slave: Transmet donnees capteurs
    Slave->>Slave: Applique logique automatique
    Slave->>MQTT: Publie etat actionneurs
    MQTT->>Worker: Envoie donnees capteurs + actionneurs
    Worker->>DB: Enregistre donnees
    Web->>DB: Lit les donnees
    Web->>Web: Affiche cartes et courbes
```

## 9. Diagramme De Sequence - Commande Manuelle

Utilise ce diagramme seulement si tu parles du controle manuel.

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Web as Dashboard
    participant API as API Commands
    participant MQTT as MQTT Broker
    participant Slave as ESP32 Slave
    participant Worker as Worker MQTT
    participant DB as PostgreSQL

    User->>Web: Clique sur Fan / Light / Pump / Valve
    Web->>API: POST /api/commands
    API->>DB: Enregistre commande
    API->>MQTT: Publie commande
    MQTT->>Slave: Transmet commande
    Slave->>Slave: Applique commande
    Slave->>MQTT: Publie nouvel etat
    MQTT->>Worker: Transmet etat actionneurs
    Worker->>DB: Met a jour etat
    Web->>DB: Recharge statut
```

## 10. Diagramme De Cas D'utilisation

Ce diagramme montre ce que l'utilisateur peut faire.

```mermaid
flowchart TB
    U[Utilisateur]

    U --> A[Consulter le dashboard]
    U --> B[Voir les donnees capteurs]
    U --> C[Voir les courbes]
    U --> D[Voir les alertes]
    U --> E[Voir l'etat des actionneurs]
    U --> F[Modifier les parametres]
    U --> G[Envoyer une commande manuelle]

    A --> B
    A --> C
    A --> E
    D --> H[Identifier un probleme]
    F --> I[Adapter les seuils]
    G --> J[Tester les actionneurs]
```

## 11. Diagramme De Base De Donnees

Ce diagramme explique les tables principales.

```mermaid
erDiagram
    Device ||--o{ SensorData : possede
    Device ||--o{ Command : recoit
    Device ||--o{ Alert : genere
    Device ||--o| ActuatorStatus : a
    Device ||--o| Settings : configure

    Device {
        string id
        string name
        string type
        string macAddress
        string location
        boolean isActive
    }

    SensorData {
        string id
        float temperature
        float humidity
        float airQuality
        float light
        float waterLevel
        float soilMoisture
        float vpd
        int healthScore
        string deviceId
    }

    ActuatorStatus {
        string id
        int fanSpeed
        int lightIntensity
        boolean pumpState
        boolean waterValveOpen
        string deviceId
    }

    Command {
        string id
        string action
        int duration
        int value
        string status
        string deviceId
    }

    Alert {
        string id
        string type
        string severity
        string message
        boolean resolved
        string deviceId
    }

    Settings {
        string id
        string plantType
        float humidityTarget
        float lightTarget
        float temperatureMin
        float temperatureMax
        float vpdTarget
        float soilMoistureMin
        string deviceId
    }
```

## 12. Diagramme Dashboard

Ce diagramme montre ce que contient l'interface web.

```mermaid
flowchart TB
    Dashboard[Dashboard Central Park]

    Dashboard --> DeviceSelector[Selection device]
    Dashboard --> SensorCards[Cartes capteurs]
    Dashboard --> HealthScore[Score de sante]
    Dashboard --> Charts[Courbes temps reel]
    Dashboard --> ActuatorStatus[Etat actionneurs]
    Dashboard --> ManualControls[Commandes manuelles]

    SensorCards --> Temp[Temperature]
    SensorCards --> Humidity[Humidite]
    SensorCards --> Light[Lumiere]
    SensorCards --> Air[Qualite air]
    SensorCards --> Soil[Humidite sol]
    SensorCards --> Water[Niveau eau]

    ActuatorStatus --> Fan[Ventilateur]
    ActuatorStatus --> Lamp[Lampe]
    ActuatorStatus --> Pump[Pompe]
    ActuatorStatus --> Valve[Vanne]
```

## 13. Diagramme De Demonstration

Ce diagramme resume le scenario a montrer pendant la soutenance.

```mermaid
flowchart LR
    A[Lancer Wokwi Master] --> B[Lancer Wokwi Slave]
    B --> C[Lancer dashboard]
    C --> D[Lancer worker MQTT]
    D --> E[Modifier humidite sol]
    E --> F[Master publie nouvelle valeur]
    F --> G[Slave active pompe]
    G --> H[Dashboard affiche pompe ON]
    H --> I[Remonter humidite sol]
    I --> J[Pompe OFF]
```

## 14. Diagramme Minimal Pour Slide

Si tu ne veux mettre qu'un seul diagramme dans la presentation, utilise celui-ci.

```mermaid
flowchart LR
    Sensors[Capteurs] --> Master[ESP32 Master]
    Master --> MQTT[MQTT]
    MQTT --> Slave[ESP32 Slave]
    Slave --> Actuators[Actionneurs]
    MQTT --> Web[Dashboard Web]
```

## 15. Conseils D'utilisation

- Pour la presentation, utilise surtout les diagrammes 1, 4, 7 et 13.
- Pour le cahier des charges, utilise les diagrammes 2, 8, 10 et 11.
- Pour expliquer rapidement le projet, utilise le diagramme 14.
- Pour expliquer MQTT, utilise le diagramme 4.
- Pour expliquer la reaction automatique, utilise le diagramme 7.

## 16. Diagrammes Les Plus Importants

Si tu veux rester minimal, garde seulement :

1. **Diagramme bloc simple**.
2. **Topics MQTT**.
3. **Logique automatique**.
4. **Demonstration**.

Ces quatre diagrammes suffisent pour une presentation claire.
