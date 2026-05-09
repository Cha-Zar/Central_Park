# Plan de presentation - Central Park IoT

Ce document indique quoi ajouter ou modifier dans la presentation pour qu'elle soit plus forte et plus orientee IoT.

## 1. Slide titre

### Garder

```text
Smart Agriculture
Central Park
Systeme de Surveillance et Controle Intelligent
```

### Ajouter

Ajouter une petite phrase sous le titre :

```text
Projet IoT base sur ESP32, capteurs, actionneurs, MQTT et dashboard web.
```

### Pourquoi

Le jury comprend directement que ce n'est pas seulement une application web, mais une chaine IoT complete.

## 2. Slide problematique

### Garder

- L'agriculture necessite une surveillance continue.
- Controle manuel difficile.
- Consommation excessive d'eau.
- Manque de suivi a distance.

### Ajouter

```text
Absence de reaction automatique en cas de conditions critiques.
Difficulte de conserver un historique des mesures.
Besoin de relier le monde physique au monde numerique.
```

### Version conseillee

```text
Problematique

- Surveillance manuelle non continue.
- Difficultes de controle de l'humidite, temperature, gaz et lumiere.
- Consommation d'eau parfois excessive.
- Absence d'historique fiable.
- Besoin de suivi a distance.
- Besoin d'une reaction automatique via actionneurs.
```

## 3. Slide objectifs

### Garder et reformuler

```text
Objectifs

- Mesurer les parametres environnementaux.
- Automatiser l'irrigation.
- Detecter les gaz nocifs.
- Afficher les donnees localement sur LCD/OLED.
- Envoyer les donnees vers une plateforme web.
- Visualiser les courbes en temps reel.
- Controler les actionneurs automatiquement et manuellement.
```

### Correction importante

Si la simulation utilise un LCD I2C et non un vrai OLED, dire :

```text
Afficher les donnees localement sur afficheur LCD/OLED.
```

Comme ca, tu restes correct meme si le composant exact change.

## 4. Nouvelle slide a ajouter : principe IoT

### Titre

```text
Principe IoT du projet
```

### Contenu

```text
Monde physique -> Capteurs -> ESP32 -> Wi-Fi/MQTT -> Base de donnees -> Dashboard
                                      |
                                      v
                                Actionneurs
```

### Message a dire

```text
Le projet relie le monde physique au monde numerique. Les capteurs mesurent l'environnement, l'ESP32 transforme les mesures en donnees, MQTT transporte les messages, et le dashboard permet la supervision.
```

## 5. Slide diagramme bloc

### Changer

Le diagramme doit montrer clairement deux cartes :

```text
Capteurs
  |
  v
ESP32 Master
  |
  v
Broker MQTT
  |-----------------> ESP32 Slave -> Actionneurs
  |
  v
Worker MQTT -> PostgreSQL -> Dashboard Web
```

### Ajouter dans le schema

- DHT22.
- LDR.
- MQ135.
- Soil moisture.
- Water level.
- ESP32 Master.
- MQTT Broker.
- ESP32 Slave.
- Fan.
- Light.
- Pump.
- Valve.
- MQTT Worker.
- Database.
- Web dashboard.

## 6. Slide composants materiels

### Garder ESP32

```text
ESP32
- Wi-Fi integre.
- Bluetooth.
- ADC 12 bits.
- Compatible Wokwi.
- Adapte a MQTT.
```

### Ajouter

```text
Pourquoi ESP32 et pas Arduino Uno ?
- Wi-Fi deja integre.
- Plus adapte a l'IoT.
- Pas besoin de module reseau externe.
- Permet l'envoi direct des donnees vers MQTT.
```

## 7. Slide capteurs utilises

### Corriger / clarifier

Pour chaque capteur, afficher :

```text
Nom du capteur
Grandeur mesuree
Type de sortie
Role dans le systeme
Reaction possible
```

### Exemple conseille

```text
DHT22
- Mesure : temperature et humidite.
- Role : surveiller le climat.
- Reaction : ventilation si temperature elevee.

LDR
- Mesure : luminosite.
- Role : detecter le manque de lumiere.
- Reaction : allumer la lumiere.

MQ135
- Mesure : qualite de l'air / gaz.
- Role : detecter les gaz nocifs.
- Reaction : activer le ventilateur.

Soil moisture
- Mesure : humidite du sol.
- Role : detecter un sol sec.
- Reaction : activer la pompe.

Water level
- Mesure : niveau d'eau.
- Role : surveiller le reservoir.
- Reaction : ouvrir ou fermer la vanne.
```

## 8. Slide actionneurs

### Remplacer la slide trop courte

Au lieu de seulement :

```text
ventilateur / pompe a eau / valve d'eau intelligente
```

mettre :

```text
Actionneurs

- Ventilateur : ameliore la qualite de l'air et reduit la temperature.
- Lumiere : compense une faible luminosite.
- Pompe : automatise l'irrigation si le sol est sec.
- Vanne : controle le remplissage ou le passage d'eau.
- Alarme LED : signale une condition critique.
```

## 9. Nouvelle slide a ajouter : logique automatique

### Titre

```text
Logique de controle automatique
```

### Contenu

```text
Si soilMoisture < 40% -> Pompe ON
Si waterLevel < 30% -> Vanne ouverte
Si light < 35% -> Lumiere ON
Si airQuality > 350 -> Ventilateur ON
Si temperature > 30 degC -> Ventilateur ON
```

### Pourquoi

Cette slide prouve que le projet ne fait pas seulement de l'affichage. Il agit sur le monde physique.

## 10. Nouvelle slide a ajouter : communication MQTT

### Titre

```text
Communication MQTT
```

### Contenu

```text
Master publie :
green-garden/sensors/AA:BB:CC:DD:EE:01

Slave publie :
green-garden/actuators/AA:BB:CC:DD:EE:02

Dashboard envoie :
green-garden/commands/AA:BB:CC:DD:EE:02
```

### Message a dire

```text
MQTT est utilise car il est leger et adapte a la communication M2M. Le Master publie les donnees, le Slave les recoit et le worker les stocke dans la base.
```

## 11. Slide plateforme web de monitoring

### Garder

La slide est utile, mais elle doit etre plus precise.

### Ajouter

```text
Fonctionnalites du dashboard

- Selection du device Master ou Slave.
- Affichage des donnees capteurs.
- Score de sante.
- Courbes temps reel.
- Etat des actionneurs.
- Commandes manuelles.
- Historique et alertes.
```

### Ajouter capture conseillee

Mettre une capture du dashboard Central Park avec :

- les cartes capteurs ;
- les courbes ;
- la section Slave/actionneurs.

## 12. Nouvelle slide a ajouter : demonstration

### Titre

```text
Scenario de demonstration
```

### Contenu

```text
1. Lancer le dashboard.
2. Lancer le worker MQTT.
3. Lancer Wokwi Master.
4. Lancer Wokwi Slave.
5. Modifier l'humidite du sol.
6. Observer l'activation de la pompe.
7. Verifier l'etat dans le dashboard.
```

### Pourquoi

Cette slide montre que tu sais exactement quoi demontrer.

## 13. Nouvelle slide a ajouter : correspondance avec le cours

### Titre

```text
Lien avec le cours IoT
```

### Contenu

| Notion du cours | Dans le projet |
| --- | --- |
| Objet connecte | ESP32 Master / Slave |
| Capteurs | DHT22, LDR, MQ135, soil, water |
| Actionneurs | Fan, lumiere, pompe, vanne |
| M2M | MQTT entre Master et Slave |
| Communication sans fil | Wi-Fi |
| Gateway | Broker MQTT + worker |
| Cloud / stockage | PostgreSQL |
| Application metier | Dashboard Central Park |

### Pourquoi

C'est une slide tres importante. Elle montre que le projet respecte le module IoT.

## 14. Nouvelle slide a ajouter : limites et ameliorations

### Titre

```text
Limites et perspectives
```

### Contenu

```text
Limites :
- Simulation Wokwi.
- Actionneurs representes par LED.
- Pas encore d'alimentation reelle.
- Pas encore d'authentification.

Perspectives :
- Passage au materiel reel.
- Ajout de LoRaWAN ou ZigBee.
- Optimisation energie.
- Alertes mobiles.
- Mode automatique configurable depuis le dashboard.
```

## 15. Slide conclusion

### Remplacer "merci" seul par une conclusion

```text
Conclusion

Central Park montre une chaine IoT complete :
Mesurer -> Transmettre -> Stocker -> Visualiser -> Agir

Le systeme permet la surveillance environnementale, l'automatisation de l'irrigation, la detection de gaz, l'affichage local et la supervision web en temps reel.

Merci.
```

## Ordre final conseille

1. Titre.
2. Problematique.
3. Objectifs.
4. Principe IoT du projet.
5. Diagramme bloc.
6. Composants materiels : ESP32.
7. Capteurs utilises.
8. Actionneurs.
9. Logique automatique.
10. Communication MQTT.
11. Plateforme web de monitoring.
12. Scenario de demonstration.
13. Lien avec le cours IoT.
14. Limites et perspectives.
15. Conclusion.

## Phrase de presentation courte

```text
Central Park est un systeme IoT de smart agriculture. Il mesure l'environnement avec des capteurs, transmet les donnees par Wi-Fi/MQTT, stocke les mesures dans une base, affiche les courbes sur un dashboard web et controle automatiquement les actionneurs comme la pompe, la lumiere, le ventilateur et la vanne.
```
