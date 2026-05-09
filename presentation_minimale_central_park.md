# Presentation minimale - Central Park IoT

Ce document donne une version simple, claire et suffisante de la presentation. L'objectif est de ne pas trop charger les slides, tout en expliquant correctement le projet.

## 1. Titre

### Slide actuelle

```text
Smart Agriculture
Central Park
Systeme de Surveillance et Controle Intelligent
```

### Version conseillee

```text
Smart Agriculture
Central Park
Systeme de Surveillance et Controle Intelligent

Application IoT de monitoring et controle d'une serre connectee
```

### Ce qu'il faut dire

```text
Notre projet est un systeme IoT pour surveiller et controler automatiquement une serre ou un environnement de culture.
```

## 2. Problematique

### Version conseillee pour la slide

```text
Problematique

- L'agriculture necessite une surveillance continue.
- Le controle manuel de la temperature, humidite, lumiere et gaz est difficile.
- Une mauvaise irrigation peut gaspiller de l'eau ou abimer la plante.
- Le suivi a distance est limite sans plateforme web.
- L'utilisateur a besoin d'un systeme capable de mesurer, afficher et agir automatiquement.
```

### Ce qu'il faut dire

```text
Le probleme principal est que la surveillance manuelle n'est pas continue. Notre solution permet de mesurer automatiquement les conditions de la serre et de reagir avec des actionneurs.
```

## 3. Objectifs

### Version conseillee pour la slide

```text
Objectifs

- Mesurer les parametres environnementaux.
- Automatiser l'irrigation.
- Detecter les gaz nocifs.
- Afficher les donnees localement sur LCD/OLED.
- Envoyer les donnees vers une plateforme web.
- Visualiser les courbes en temps reel.
- Controler les actionneurs automatiquement.
```

### Detail rapide

| Objectif | Explication |
| --- | --- |
| Mesurer les parametres environnementaux | Lire temperature, humidite, lumiere, gaz, sol et eau |
| Automatiser l'irrigation | Activer la pompe si le sol est sec |
| Detecter les gaz nocifs | Utiliser le capteur MQ135 pour surveiller l'air |
| Afficher localement | Afficher les valeurs sur LCD/OLED dans la simulation |
| Envoyer vers le web | Transmettre les donnees au dashboard |
| Visualiser les courbes | Suivre l'evolution des mesures |
| Controler automatiquement | Le Slave active les actionneurs selon les seuils |

### Ce qu'il faut dire

```text
Le projet ne se limite pas a afficher les donnees. Il mesure, envoie les donnees, les affiche sous forme de courbes et agit automatiquement sur l'environnement.
```

## 4. Diagramme bloc

### Version conseillee pour la slide

```text
Capteurs
DHT / LDR / MQ135 / Soil / Water
        |
        v
ESP32 Master
        |
        v
MQTT
        |
        +------> ESP32 Slave -> Ventilateur / Lampe / Pompe / Vanne
        |
        +------> Dashboard Web -> Courbes / Historique / Etat
```

### Version plus complete si la slide a assez d'espace

```text
Capteurs -> ESP32 Master -> MQTT Broker
                         |
                         +--> ESP32 Slave -> Actionneurs
                         |
                         +--> Worker MQTT -> Base de donnees -> Dashboard
```

### Ce qu'il faut dire

```text
Le Master lit les capteurs et envoie les donnees. Le Slave recoit les donnees et controle les actionneurs. Le dashboard affiche les mesures et les courbes.
```

## 5. Composants materiels

### Slide conseillee

```text
Microcontroleur : ESP32

- Wi-Fi integre.
- Bluetooth.
- ADC 12 bits.
- Compatible avec Wokwi.
- Adapte aux projets IoT.
- Permet l'envoi des donnees vers MQTT et la plateforme web.
```

### Ce qu'il faut dire

```text
Nous avons choisi l'ESP32 parce qu'il possede deja le Wi-Fi. Il est donc plus pratique qu'un Arduino Uno pour un projet IoT connecte.
```

## 6. Capteurs utilises

### Slide conseillee

```text
Capteurs utilises

1. DHT22 / DHT11
- Mesure temperature et humidite de l'air.

2. Capteur d'humidite du sol
- Detecte si le sol est sec.
- Utilise pour activer la pompe.

3. MQ135
- Detecte les gaz nocifs / qualite de l'air.
- Utilise pour activer le ventilateur.

4. LDR
- Mesure l'intensite lumineuse.
- Utilise pour activer la lampe.

5. Capteur niveau d'eau
- Mesure le niveau du reservoir.
- Utilise pour controler la vanne.
```

### Ce qu'il faut dire

```text
Chaque capteur a un role precis. Les donnees mesurees permettent soit d'informer l'utilisateur, soit d'activer automatiquement un actionneur.
```

## 7. Actionneurs

### Slide conseillee

```text
Actionneurs

- Ventilateur : active si temperature ou gaz eleves.
- Lampe : active si la lumiere est faible.
- Pompe a eau : active si le sol est sec.
- Vanne d'eau : ouverte si le niveau d'eau est bas.
```

### Ce qu'il faut dire

```text
Les actionneurs permettent au systeme d'agir sur la serre. Par exemple, si le sol est sec, la pompe s'active automatiquement.
```

## 8. Logique automatique

### Slide a ajouter

```text
Logique automatique

- Si soilMoisture < 40% -> Pompe ON
- Si waterLevel < 30% -> Vanne ouverte
- Si light < 35% -> Lampe ON
- Si airQuality > 350 -> Ventilateur ON
- Si temperature > 30 degC -> Ventilateur ON
```

### Ce qu'il faut dire

```text
Le Slave ESP32 applique ces regles automatiquement. Cela permet de reguler l'environnement sans intervention humaine directe.
```

## 9. Plateforme web

### Slide conseillee

```text
Plateforme Web de Monitoring

- Affichage des donnees capteurs.
- Visualisation des courbes en temps reel.
- Affichage du score de sante.
- Etat des actionneurs.
- Historique des mesures.
- Alertes.
```

### Option si tu veux mentionner le controle manuel

```text
- Commandes manuelles possibles pour tester les actionneurs.
```

### Ce qu'il faut dire

```text
La plateforme web permet de suivre l'etat de la serre a distance. Elle affiche les valeurs actuelles et les courbes pour comprendre l'evolution.
```

## 10. Demonstration

### Slide a ajouter

```text
Demonstration

1. Lancer les deux simulations Wokwi.
2. Le Master lit les capteurs.
3. Les donnees sont envoyees vers la plateforme web.
4. Le Slave reagit automatiquement.
5. Les courbes et les etats sont visibles sur le dashboard.
```

### Scenario simple a montrer

```text
Scenario : sol sec

1. Diminuer l'humidite du sol dans Wokwi.
2. Le Master envoie la nouvelle valeur.
3. Le Slave active la pompe.
4. Le dashboard affiche le changement.
```

### Ce qu'il faut dire

```text
Pour la demonstration, on modifie une valeur capteur dans Wokwi. Le systeme reagit automatiquement et le dashboard montre le resultat.
```

## 11. Conclusion

### Slide conseillee

```text
Conclusion

Central Park permet de :

- mesurer l'environnement ;
- transmettre les donnees ;
- afficher localement et sur le web ;
- visualiser les courbes ;
- automatiser l'irrigation ;
- reagir aux gaz, a la lumiere et au niveau d'eau.

Le projet realise une chaine complete :
Mesurer -> Transmettre -> Visualiser -> Agir
```

### Ce qu'il faut dire

```text
Central Park est une solution de smart agriculture qui combine capteurs, ESP32, communication sans fil, dashboard et actionneurs pour surveiller et controler une serre.
```

## 12. Ordre final conseille des slides

```text
1. Titre
2. Problematique
3. Objectifs
4. Diagramme bloc
5. Composants materiels
6. Capteurs utilises
7. Actionneurs
8. Logique automatique
9. Plateforme web
10. Demonstration
11. Conclusion
```

## 13. Changements rapides a faire dans ta presentation actuelle

### A modifier

- Remplacer "OLED" par "LCD/OLED" si tu n'es pas sur du composant exact.
- Ajouter la lampe dans les actionneurs.
- Ajouter la logique automatique.
- Clarifier le diagramme bloc avec Master, Slave et MQTT.
- Ajouter une slide demonstration.

### A eviter

- Trop parler du code.
- Trop parler de Next.js, Prisma ou base de donnees dans les slides.
- Trop charger les slides avec de longs paragraphes.
- Dire que le projet utilise Arduino Uno si tu utilises ESP32.

## 14. Phrase courte a apprendre

```text
Central Park est un systeme IoT de smart agriculture. Il mesure les conditions de la serre avec des capteurs, envoie les donnees vers une plateforme web, affiche les courbes en temps reel et controle automatiquement les actionneurs comme la pompe, le ventilateur, la lampe et la vanne.
```

## 15. Questions possibles et reponses simples

### Pourquoi utiliser ESP32 ?

```text
Parce que l'ESP32 possede le Wi-Fi integre, ce qui le rend adapte a un projet IoT connecte.
```

### Pourquoi utiliser deux ESP32 ?

```text
Le Master s'occupe des capteurs et le Slave s'occupe des actionneurs. Cela separe la mesure et le controle.
```

### Que fait le Master ?

```text
Il lit les capteurs et envoie les donnees.
```

### Que fait le Slave ?

```text
Il recoit les donnees et active les actionneurs automatiquement.
```

### Que se passe-t-il si le sol est sec ?

```text
Le capteur d'humidite detecte une valeur basse, le Master envoie la donnee, le Slave active la pompe.
```

### Que montre la plateforme web ?

```text
Elle montre les valeurs des capteurs, les courbes, l'historique, les alertes et l'etat des actionneurs.
```
