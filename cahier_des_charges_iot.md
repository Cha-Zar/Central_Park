# Cahier des charges IoT - Central Park

## 1. Presentation generale

### 1.1 Nom du projet

**Central Park IoT**

### 1.2 Nature du projet

Central Park IoT est un systeme d'Internet des Objets destine a surveiller et controler un environnement de culture connecte. Le projet met en relation le monde physique, represente par les plantes, les capteurs et les actionneurs, avec le monde numerique, represente par les ESP32, le reseau, la base de donnees et le dashboard web.

Ce cahier des charges est volontairement oriente **IoT**. Il ne se concentre pas seulement sur la maniere dont l'application a ete codee, mais surtout sur la logique objet connecte, les interactions physiques, la communication sans fil, le traitement des donnees et le controle automatique.

### 1.3 Idee principale

Le projet repond a la question suivante :

> Comment un objet connecte peut-il mesurer un environnement physique, transmettre ces mesures a travers un reseau, stocker les donnees, les afficher, puis agir automatiquement sur ce meme environnement ?

Central Park IoT repond a cette question avec :

- des capteurs ;
- deux ESP32 ;
- une communication Wi-Fi/MQTT ;
- une base de donnees ;
- un dashboard ;
- des actionneurs ;
- une logique de decision automatique.

## 2. Contexte IoT

### 2.1 Definition d'un objet connecte

Un objet connecte est un objet physique capable de collecter, transmettre ou recevoir des donnees. Il peut communiquer avec d'autres objets, un serveur, une application ou un utilisateur.

Dans ce projet, les objets connectes sont les cartes ESP32 :

- l'ESP32 Master collecte les donnees capteurs ;
- l'ESP32 Slave controle les actionneurs.

### 2.2 Definition de l'Internet des Objets

L'Internet des Objets, ou IoT, est l'extension d'Internet vers des objets et lieux du monde physique. Il permet de relier des objets, capteurs, machines et environnements physiques a des systemes informatiques.

Central Park IoT correspond a cette definition car il relie :

- un environnement de culture reel ou simule ;
- des capteurs physiques ;
- des actionneurs ;
- un reseau de communication ;
- une base de donnees ;
- une application web de supervision.

### 2.3 M2M dans le projet

Le M2M signifie **Machine to Machine**. Il designe l'echange d'informations entre machines sans intervention humaine directe.

Dans Central Park IoT, le M2M est present lorsque :

- le Master ESP32 publie les donnees capteurs ;
- le Slave ESP32 recoit ces donnees ;
- le Slave decide automatiquement d'activer ou desactiver les actionneurs.

Exemple :

```text
Master detecte soilMoisture = 20%
        |
        v
Message MQTT
        |
        v
Slave active la pompe
```

L'utilisateur n'a pas besoin d'appuyer sur un bouton pour que cette reaction automatique ait lieu.

## 3. Problematique

Dans une culture classique, l'utilisateur doit verifier lui-meme :

- la temperature ;
- l'humidite ;
- la luminosite ;
- le niveau d'eau ;
- l'humidite du sol ;
- la qualite de l'air.

Cette surveillance manuelle pose plusieurs problemes :

- elle demande du temps ;
- elle n'est pas continue ;
- elle peut etre imprecise ;
- elle ne permet pas toujours de reagir rapidement ;
- elle ne donne pas d'historique fiable ;
- elle ne permet pas d'automatiser les corrections.

La problematique du projet est donc :

> Comment concevoir un systeme IoT capable de surveiller automatiquement un environnement de culture, de transmettre les donnees, de les stocker, de les afficher et d'agir sur l'environnement grace a des actionneurs ?

## 4. Objectifs IoT du projet

### 4.1 Objectif principal

Concevoir un systeme IoT complet permettant de connecter un environnement de culture au monde numerique.

### 4.2 Objectifs specifiques

- Mesurer des grandeurs physiques avec des capteurs.
- Numeriser ces grandeurs via un microcontroleur ESP32.
- Transmettre les donnees via une communication sans fil.
- Utiliser MQTT comme protocole M2M.
- Stocker les donnees dans une base.
- Afficher les donnees dans une application de supervision.
- Controler des actionneurs a partir des donnees mesurees.
- Montrer une boucle complete : mesurer, transmettre, analyser, agir.

### 4.3 Objectifs fonctionnels retenus pour la presentation

Les objectifs presentes dans la soutenance doivent etre formules de maniere simple, orientee IoT et directement lies a la demonstration :

| Objectif | Explication IoT | Element du projet |
| --- | --- | --- |
| Mesurer les parametres environnementaux | Transformer les grandeurs physiques en donnees numeriques | DHT22, LDR, capteur soil, capteur water |
| Automatiser l'irrigation | Reagir automatiquement a un sol sec | Pompe commandee par le Slave ESP32 |
| Detecter les gaz nocifs | Surveiller la qualite de l'air | Capteur gaz / MQ135 |
| Afficher les donnees localement | Donner une lecture directe sans dashboard | LCD/OLED dans la simulation Wokwi |
| Envoyer les donnees vers une plateforme web | Relier l'objet physique a une application numerique | MQTT, worker, PostgreSQL, dashboard |
| Visualiser les courbes en temps reel | Suivre l'evolution des mesures | Recharts sur le dashboard Central Park |

### 4.4 Objectif pedagogique

Le projet sert a illustrer les concepts fondamentaux du cours IoT :

- monde physique et monde numerique ;
- capteurs ;
- actionneurs ;
- processeur embarque ;
- chaine de communication ;
- reseaux sans fil ;
- objet connecte ;
- architecture avec gateway/cloud/application ;
- communication M2M ;
- automatisation.

## 5. Monde physique et monde numerique

### 5.1 Monde physique

Le monde physique correspond a l'environnement de culture :

- plante ;
- air ;
- sol ;
- eau ;
- lumiere ;
- temperature ;
- humidite.

Dans ce monde physique, les grandeurs changent continuellement. Le role des capteurs est de transformer ces changements en signaux exploitables.

### 5.2 Monde numerique

Le monde numerique correspond aux systemes qui manipulent les donnees :

- ESP32 ;
- code embarque `.ino` ;
- MQTT ;
- worker ;
- base PostgreSQL ;
- API ;
- dashboard Central Park.

### 5.3 Lien entre les deux mondes

Le projet relie ces deux mondes de la facon suivante :

```text
Grandeur physique
      |
      v
Capteur
      |
      v
Signal electrique
      |
      v
ESP32
      |
      v
Donnee numerique
      |
      v
Reseau / MQTT / Base / Dashboard
```

## 6. Composants IoT du systeme

### 6.1 Capteurs

Les capteurs servent a detecter les valeurs de l'environnement. Ils traduisent une grandeur physique en une information exploitable par le systeme.

Dans Central Park IoT, les capteurs principaux sont :

| Capteur | Grandeur mesuree | Role IoT |
| --- | --- | --- |
| DHT22 | Temperature et humidite | Surveiller le climat |
| LDR | Luminosite | Detecter le manque de lumiere |
| Capteur gaz | Qualite de l'air | Detecter un air degrade |
| Capteur soil | Humidite du sol | Detecter le besoin d'arrosage |
| Capteur water | Niveau d'eau | Surveiller le reservoir |

### 6.2 Actionneurs

Les actionneurs permettent au systeme d'agir sur le monde physique.

Dans Central Park IoT, les actionneurs sont :

| Actionneur | Grandeur influencee | Role |
| --- | --- | --- |
| Ventilateur | Air, temperature, qualite de l'air | Ventiler et refroidir |
| Lumiere | Luminosite | Ajouter de la lumiere |
| Pompe | Eau dans le sol | Irriguer |
| Vanne | Flux d'eau | Ouvrir ou fermer l'alimentation |
| Alarme LED | Signal visuel | Indiquer un danger |

### 6.3 Processeur embarque

Le processeur embarque est l'ESP32. Il execute le code, lit les capteurs, traite les valeurs et communique avec le reseau.

Le projet utilise deux ESP32 :

- **Master ESP32** : collecte les donnees.
- **Slave ESP32** : controle les actionneurs.

### 6.4 Chaine de communication

La chaine de communication permet aux objets de transmettre les donnees.

Dans le projet :

```text
ESP32 Master -> Wi-Fi -> Broker MQTT -> Worker -> Base -> Dashboard
```

Et aussi :

```text
ESP32 Master -> Wi-Fi -> Broker MQTT -> ESP32 Slave
```

## 7. Architecture IoT globale

### 7.1 Schema global

```text
                         Monde physique
                              |
                              v
                   Capteurs de l'environnement
                              |
                              v
                       ESP32 Master
                              |
                              v
                       Wi-Fi + MQTT
                              |
             +----------------+----------------+
             |                                 |
             v                                 v
        ESP32 Slave                      Worker MQTT
             |                                 |
             v                                 v
       Actionneurs                       PostgreSQL
                                               |
                                               v
                                      Dashboard Central Park
```

### 7.2 Interpretation IoT

Cette architecture respecte le modele IoT vu en cours :

| Modele du cours | Projet Central Park |
| --- | --- |
| Objet connecte | ESP32 Master et ESP32 Slave |
| Capteurs | DHT22, LDR, gaz, soil, water |
| Actionneurs | Fan, lampe, pompe, vanne |
| Gateway / passerelle | Broker MQTT + worker |
| Cloud / stockage | PostgreSQL / Neon |
| Application metier | Dashboard Central Park |
| Communication | Wi-Fi + MQTT |

## 8. Choix du microcontroleur

### 8.1 Pourquoi utiliser ESP32

L'ESP32 est choisi car il est adapte aux projets IoT :

- Wi-Fi integre ;
- puissance suffisante ;
- support de plusieurs capteurs ;
- support de MQTT ;
- compatible avec Wokwi ;
- programmable avec des fichiers `.ino` ;
- cout raisonnable ;
- commun dans les projets IoT.

### 8.2 Pourquoi pas Arduino Uno

Un Arduino Uno peut lire des capteurs et controler des actionneurs, mais il ne possede pas de Wi-Fi integre. Pour un projet IoT, il faudrait ajouter un module reseau externe.

Cela rendrait le projet :

- plus complexe ;
- plus cher ;
- moins direct ;
- moins adapte a une demonstration IoT.

L'ESP32 permet d'avoir directement :

```text
capteurs + traitement + Wi-Fi + MQTT
```

### 8.3 Role des fichiers `.ino`

Les fichiers `.ino` sont des sketches Arduino. Ils peuvent etre utilises pour programmer des cartes Arduino, mais aussi des ESP32.

Dans ce projet, les fichiers `.ino` ne signifient pas que l'on utilise une carte Arduino Uno. Ils signifient que l'ESP32 est programme avec l'environnement et le style Arduino.

Fichiers utilises :

```text
wokwi-master-esp32/wokwi-master-esp32.ino
wokwi-slave-esp32/wokwi-slave-esp32.ino
```

## 9. Role du Master ESP32

### 9.1 Fonction principale

Le Master ESP32 est la partie acquisition du systeme.

Il :

- lit les capteurs ;
- convertit les mesures ;
- calcule le VPD ;
- calcule un score de sante ;
- cree un message JSON ;
- publie ce message sur MQTT.

### 9.2 Donnees publiees

Exemple de message publie :

```json
{
  "temperature": 24.5,
  "humidity": 65,
  "airQuality": 120,
  "light": 75,
  "waterLevel": 80,
  "soilMoisture": 55,
  "vpd": 0.85,
  "healthScore": 90,
  "macAddress": "AA:BB:CC:DD:EE:01"
}
```

### 9.3 Topic MQTT

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

### 9.4 Interpretation

Le Master est l'equivalent des **yeux** du systeme. Il observe l'environnement et transmet ce qu'il mesure.

## 10. Role du Slave ESP32

### 10.1 Fonction principale

Le Slave ESP32 est la partie reaction du systeme.

Il :

- ecoute les donnees du Master ;
- analyse les valeurs ;
- applique une logique automatique ;
- active ou desactive les actionneurs ;
- publie l'etat des actionneurs.

### 10.2 Topic ecoute

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

### 10.3 Topic publie

```text
green-garden/actuators/AA:BB:CC:DD:EE:02
```

### 10.4 Message publie

```json
{
  "fanSpeed": 80,
  "lightIntensity": 0,
  "pumpState": true,
  "waterValveOpen": false,
  "macAddress": "AA:BB:CC:DD:EE:02"
}
```

### 10.5 Interpretation

Le Slave est l'equivalent des **mains** du systeme. Il agit sur le monde physique en fonction des donnees recues.

## 11. Logique de decision automatique

### 11.1 Ventilation

Le ventilateur s'active si :

- la temperature est trop elevee ;
- le VPD est trop eleve ;
- la qualite de l'air est mauvaise.

Logique :

```cpp
if (temperature > 30 || vpd > 1.6 || airQuality > 350) fanSpeed = 80;
else if (temperature > 27) fanSpeed = 40;
else fanSpeed = 0;
```

### 11.2 Lumiere

La lumiere s'active si la luminosite est trop faible.

```cpp
if (lightLevel < 35) lightIntensity = 90;
else if (lightLevel < 55) lightIntensity = 50;
else lightIntensity = 0;
```

### 11.3 Pompe

La pompe s'active si le sol est sec.

```cpp
if (soilMoisture < 40) pumpState = true;
if (soilMoisture >= 60) pumpState = false;
```

### 11.4 Vanne

La vanne s'ouvre si le niveau d'eau est bas.

```cpp
if (waterLevel < 30) waterValveOpen = true;
if (waterLevel >= 90) waterValveOpen = false;
```

### 11.5 Pourquoi cette logique est IoT

Cette logique montre une boucle de controle :

```text
Mesure -> Transmission -> Decision -> Action
```

Cela correspond exactement a un systeme IoT intelligent : il ne se contente pas de mesurer, il agit.

## 12. Communication sans fil

### 12.1 Wi-Fi dans le projet

Le projet utilise le Wi-Fi car l'ESP32 le possede directement.

Avantages :

- connexion facile a Internet ;
- debit suffisant ;
- support MQTT ;
- integration simple avec Wokwi ;
- pratique pour une demonstration avec dashboard.

### 12.2 Comparaison avec d'autres technologies du cours

| Technologie | Avantages | Limites | Adaptation au projet |
| --- | --- | --- | --- |
| Wi-Fi | Debit eleve, Internet direct, ESP32 compatible | Consommation plus elevee | Tres adapte |
| Bluetooth | Simple, courte distance | Pas ideal pour dashboard cloud | Moins adapte |
| BLE | Basse consommation | Portee courte, gateway necessaire | Possible mais plus complexe |
| ZigBee | Basse consommation, reseau maillage | Materiel specifique | Possible mais non choisi |
| 6LoWPAN | IPv6 basse consommation | Plus technique | Non necessaire |
| LoRaWAN | Tres longue portee | Faible debit, gateway necessaire | Utile pour agriculture distante |
| Sigfox | Longue portee, bas debit | Limites messages, dependance reseau | Pas adapte au controle temps reel |
| GSM/4G/5G | Couverture large | Module SIM, cout, complexite | Non necessaire pour demo locale |

### 12.3 Justification du choix

Le Wi-Fi est choisi parce que le projet vise une demonstration claire d'un systeme IoT connecte a un dashboard web. Les donnees ne sont pas envoyees sur de tres longues distances, et la consommation energetique n'est pas la contrainte principale dans la simulation.

## 13. Protocole MQTT

### 13.1 Role de MQTT

MQTT est un protocole de messagerie leger, tres utilise en IoT. Il fonctionne avec un modele publish/subscribe.

Dans ce modele :

- un objet publie un message sur un topic ;
- d'autres objets ou services s'abonnent a ce topic ;
- le broker MQTT distribue les messages.

### 13.2 Pourquoi MQTT dans Central Park

MQTT est choisi car :

- il est leger ;
- il est adapte aux ESP32 ;
- il permet le M2M ;
- il permet au Master de parler au Slave ;
- il permet au worker de recevoir les memes donnees ;
- il evite que le dashboard communique directement avec Wokwi.

### 13.3 Topics utilises

| Topic | Emetteur | Recepteur | Role |
| --- | --- | --- | --- |
| `green-garden/sensors/AA:BB:CC:DD:EE:01` | Master | Slave + Worker | Donnees capteurs |
| `green-garden/actuators/AA:BB:CC:DD:EE:02` | Slave | Worker | Etat actionneurs |
| `green-garden/commands/AA:BB:CC:DD:EE:02` | Dashboard/API | Slave | Commandes manuelles |

### 13.4 Broker MQTT

Le broker utilise est :

```text
broker.hivemq.com:1883
```

Il joue le role de point central pour distribuer les messages.

## 14. Gateway, Cloud et application metier

### 14.1 Idee du cours

Dans l'architecture IoT classique :

```text
Objets -> Gateway -> Cloud -> Application metier
```

### 14.2 Adaptation dans le projet

Dans Central Park IoT :

```text
ESP32 -> Broker MQTT + Worker -> PostgreSQL -> Dashboard
```

| Element du cours | Element du projet |
| --- | --- |
| Objets | ESP32 Master et Slave |
| Gateway | Broker MQTT et worker |
| Cloud / stockage | PostgreSQL / Neon |
| Application metier | Dashboard Central Park |

### 14.3 Role du worker MQTT

Le worker MQTT est indispensable.

Il :

- ecoute les messages MQTT ;
- verifie leur contenu ;
- cree les devices si necessaire ;
- enregistre les capteurs ;
- enregistre les etats actionneurs ;
- rend les donnees disponibles au dashboard.

Commande :

```bash
npm run mqtt:worker
```

Sans worker :

```text
Wokwi fonctionne
MQTT fonctionne
mais le dashboard ne recoit pas les nouvelles donnees
```

## 15. Dashboard comme interface IoT

### 15.1 Role du dashboard

Le dashboard est l'interface de supervision. Il permet a l'utilisateur de comprendre l'etat du systeme.

Il affiche :

- les devices ;
- les donnees capteurs ;
- les graphes ;
- le score de sante ;
- les alertes ;
- l'etat des actionneurs ;
- les commandes.

### 15.2 Pourquoi un dashboard est important en IoT

Un systeme IoT produit beaucoup de donnees. Sans interface, ces donnees sont difficiles a interpreter.

Le dashboard transforme les donnees brutes en informations lisibles :

```text
24.5, 65, 75, 55
```

devient :

```text
Temperature normale
Humidite correcte
Lumiere suffisante
Sol assez humide
Score de sante bon
```

### 15.3 Difference entre supervision et controle

La supervision consiste a observer :

- temperature ;
- humidite ;
- qualite de l'air ;
- niveau d'eau.

Le controle consiste a agir :

- allumer le ventilateur ;
- allumer la lumiere ;
- demarrer la pompe ;
- ouvrir la vanne.

Central Park IoT fait les deux.

## 16. Donnees IoT

### 16.1 Nature des donnees

Les donnees IoT sont principalement temporelles. Chaque mesure est associee a un instant.

Exemple :

```text
2026-05-01 14:00 -> temperature = 24.5
2026-05-01 14:05 -> temperature = 25.1
2026-05-01 14:10 -> temperature = 26.0
```

### 16.2 Importance de l'historique

L'historique permet :

- d'analyser l'evolution ;
- de detecter les tendances ;
- de comprendre les anomalies ;
- d'ameliorer les seuils ;
- de presenter des graphes.

### 16.3 Score de sante

Le score de sante est une synthese des conditions environnementales.

Il permet de transformer plusieurs mesures en un indicateur simple :

```text
0-49   -> mauvais
50-69  -> moyen
70-89  -> bon
90-100 -> excellent
```

## 17. Simulation Wokwi

### 17.1 Pourquoi Wokwi

Wokwi est utilise pour simuler le systeme avant ou sans materiel physique.

Avantages :

- pas besoin de tout le materiel ;
- test rapide ;
- demonstration facile ;
- simulation des capteurs ;
- simulation des ESP32 ;
- affichage du comportement des actionneurs.

### 17.2 Ce que Wokwi simule

Wokwi simule :

- l'ESP32 Master ;
- l'ESP32 Slave ;
- les capteurs ;
- les LED/actionneurs ;
- l'ecran LCD ;
- la connexion Wi-Fi ;
- la publication MQTT.

### 17.3 Ce que Wokwi ne remplace pas completement

Wokwi ne remplace pas totalement le monde reel car :

- les capteurs reels peuvent etre bruités ;
- les connexions physiques peuvent avoir des erreurs ;
- l'alimentation peut poser probleme ;
- les actionneurs reels consomment du courant ;
- le comportement reel peut differer de la simulation.

## 18. Tests IoT a realiser

### 18.1 Test de collecte

Objectif : verifier que le Master lit et publie les donnees.

Action :

- lancer Wokwi Master ;
- observer le moniteur serie.

Resultat attendu :

```text
Published sensor data: {...}
```

### 18.2 Test M2M Master vers Slave

Objectif : verifier que le Slave recoit les donnees du Master.

Action :

- lancer Master ;
- lancer Slave ;
- modifier les valeurs capteurs.

Resultat attendu :

```text
Received sensors: {...}
```

### 18.3 Test lumiere

Action :

- diminuer la luminosite dans le Master.

Resultat attendu :

- `lightIntensity = 90` si `light < 35`.

### 18.4 Test air

Action :

- augmenter la valeur du capteur gaz.

Resultat attendu :

- `fanSpeed = 80` si `airQuality > 350`.

### 18.5 Test sol sec

Action :

- diminuer l'humidite du sol.

Resultat attendu :

- `pumpState = true` si `soilMoisture < 40`.

### 18.6 Test niveau d'eau

Action :

- diminuer le niveau d'eau.

Resultat attendu :

- `waterValveOpen = true` si `waterLevel < 30`.

### 18.7 Test dashboard

Action :

- lancer `npm run dev` ;
- lancer `npm run mqtt:worker` ;
- lancer Wokwi Master et Slave ;
- ouvrir le dashboard.

Resultat attendu :

- les devices apparaissent ;
- les donnees capteurs sont visibles ;
- l'etat des actionneurs est visible ;
- les graphes se remplissent.

## 19. Scenario de demonstration

### 19.1 Scenario recommande

1. Lancer l'application web.
2. Lancer le worker MQTT.
3. Lancer Wokwi Master.
4. Lancer Wokwi Slave.
5. Ouvrir le dashboard Central Park.
6. Selectionner le Master.
7. Montrer les donnees capteurs.
8. Diminuer l'humidite du sol.
9. Montrer que le Slave active la pompe.
10. Selectionner le Slave dans le dashboard.
11. Montrer que la pompe est ON.
12. Remonter l'humidite du sol.
13. Montrer que la pompe s'arrete.

### 19.2 Message a dire pendant la presentation

> Le Master ESP32 joue le role de l'objet connecte qui observe le monde physique. Il mesure la temperature, l'humidite, la lumiere, le sol, l'eau et la qualite de l'air. Ces donnees sont transmises par Wi-Fi au broker MQTT. Le Slave ESP32 recoit les donnees et agit automatiquement sur les actionneurs. En parallele, un worker MQTT enregistre les messages dans la base de donnees, ce qui permet au dashboard Central Park d'afficher l'etat du systeme en temps reel.

## 20. Correspondance avec le cours IoT

| Notion du cours | Application dans Central Park |
| --- | --- |
| Objet connecte | ESP32 Master / ESP32 Slave |
| M2M | Master communique avec Slave via MQTT |
| Capteurs | DHT22, LDR, gaz, sol, eau |
| Actionneurs | Ventilateur, lumiere, pompe, vanne |
| Processeur | ESP32 |
| Chaine de communication | Wi-Fi + MQTT |
| Gateway | Broker MQTT + worker |
| Cloud / stockage | PostgreSQL / Neon |
| Application metier | Dashboard |
| Monde physique | Environnement de culture |
| Monde numerique | Donnees, API, base, interface |
| Services intelligents | Controle automatique |

## 21. Limites du projet

### 21.1 Limites techniques

- Le systeme est simule dans Wokwi.
- Les actionneurs sont representes par des LED.
- Les seuils automatiques sont fixes dans le code du Slave.
- Les topics utilisent encore le prefixe historique `green-garden`.
- Il n'y a pas encore d'authentification avancee.

### 21.2 Limites IoT

- Pas de LoRaWAN ou ZigBee.
- Pas d'etude d'autonomie energetique.
- Pas de capteurs industriels reels.
- Pas de communication cellulaire 4G/5G.
- Pas de gateway physique separee.

### 21.3 Pourquoi ces limites sont acceptables

Le but du projet est de demontrer les bases d'un systeme IoT complet. Il n'est pas necessaire d'utiliser toutes les technologies du cours dans un seul projet. Le plus important est de montrer :

- acquisition ;
- communication ;
- traitement ;
- stockage ;
- affichage ;
- action.

## 22. Evolutions IoT possibles

### 22.1 Passage au materiel reel

Remplacer les composants simules par :

- vrais capteurs ;
- vraie pompe ;
- vrai ventilateur ;
- relais ;
- alimentation adaptee.

### 22.2 Optimisation energetique

Ajouter :

- mode deep sleep ESP32 ;
- envoi moins frequent ;
- alimentation batterie ;
- mesure de consommation.

### 22.3 Autres reseaux IoT

Comparer ou migrer vers :

- LoRaWAN pour longue portee ;
- ZigBee pour reseau local basse consommation ;
- BLE pour courte distance ;
- 4G/5G pour zone sans Wi-Fi.

### 22.4 Intelligence plus avancee

Ajouter :

- seuils dynamiques ;
- profils plantes ;
- prediction ;
- automatisation configurable depuis le dashboard ;
- alertes intelligentes.

## 23. Conclusion

Central Park IoT est un projet conforme aux principes fondamentaux de l'Internet des Objets. Il relie un environnement physique a une application numerique grace a des capteurs, des actionneurs, des ESP32, une communication sans fil, un protocole M2M, une base de donnees et un dashboard.

Le projet montre clairement la chaine IoT complete :

```text
Mesurer -> Transmettre -> Stocker -> Visualiser -> Agir
```

Il respecte donc les notions essentielles vues dans le cours :

- objet connecte ;
- M2M ;
- capteurs ;
- actionneurs ;
- processeur embarque ;
- communication sans fil ;
- passerelle ;
- stockage ;
- application metier.

Ce deuxieme cahier des charges complete le premier document en mettant l'accent sur la dimension IoT du projet plutot que sur la seule implementation logicielle.
