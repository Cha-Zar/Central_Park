# Cahier des charges - Central Park IoT

## 1. Identification du projet

**Nom du projet :** Central Park IoT  
**Type :** Plateforme de supervision et de controle d'un environnement de culture connecte  
**Domaine :** Internet des Objets, agriculture intelligente, monitoring temps reel  
**Version du document :** 1.0  
**Date :** 2026-05-01  

Central Park IoT est une solution complete permettant de surveiller les conditions d'une zone de culture et de piloter des actionneurs a distance. Le systeme combine une application web, une base de donnees, des API, un worker MQTT et des cartes ESP32. L'objectif est de rendre l'etat de la plante ou de la zone de culture lisible, mesurable et pilotable.

## 2. Contexte et problematique

Dans un systeme de culture classique, l'utilisateur doit verifier manuellement la temperature, l'humidite, la lumiere, l'humidite du sol, la qualite de l'air et le niveau d'eau. Cette surveillance manuelle est lente, imprecise et ne permet pas toujours d'intervenir au bon moment.

Le projet Central Park IoT repond a cette problematique en automatisant la collecte des donnees et en centralisant les informations dans une interface web. Le dashboard donne une vision claire de la situation actuelle, tandis que les pages d'historique, d'alertes, de configuration et de profil plante permettent d'analyser, comprendre et ajuster le systeme.

## 3. Objectifs generaux

- Mesurer les grandeurs environnementales importantes pour la culture.
- Afficher les mesures en temps reel dans une interface web.
- Enregistrer les donnees dans une base PostgreSQL.
- Controler les actionneurs : ventilation, lumiere, pompe et vanne.
- Generer des alertes en cas de valeurs critiques.
- Donner une lecture simple de l'etat global grace a un score de sante.
- Fournir une architecture claire, evolutive et demonstrable.

## 4. Objectifs pedagogiques

Le projet permet de comprendre une chaine IoT complete :

- Interaction entre monde physique et monde numerique.
- Role des capteurs dans l'acquisition de donnees.
- Role des actionneurs dans la reaction du systeme.
- Transmission des donnees par HTTP et MQTT.
- Stockage structure avec PostgreSQL et Prisma.
- Visualisation dans une application Next.js.
- Validation des donnees avec Zod.
- Separation entre frontend, API, base de donnees et microcontroleurs.

## 5. Perimetre fonctionnel

### 5.1 Inclus dans le projet

- Dashboard principal.
- Selection d'un device.
- Affichage des donnees capteurs.
- Affichage du score de sante.
- Graphiques d'evolution.
- Statut des actionneurs.
- Commandes vers les actionneurs.
- Historique des mesures.
- Liste des alertes.
- Page de configuration des seuils.
- Page de profil plante.
- API REST Next.js.
- Communication MQTT pour les commandes et donnees IoT.
- Persistance avec PostgreSQL via Prisma.
- Simulation Wokwi pour ESP32.

### 5.2 Hors perimetre actuel

- Authentification utilisateur avancee.
- Gestion multi-utilisateur avec roles.
- Application mobile native.
- IA predictive avancee.
- Paiement, abonnement ou SaaS public.
- Calibration automatique complete des capteurs.

Ces elements sont exclus pour garder un perimetre coherent avec un projet IoT demonstrable et realisable dans le temps disponible.

## 6. Acteurs du systeme

### 6.1 Utilisateur

L'utilisateur consulte le dashboard, surveille les valeurs, configure les seuils et peut envoyer des commandes aux actionneurs.

### 6.2 ESP32 Master

La carte Master est responsable de la collecte des donnees capteurs. Elle represente la partie "observation" du systeme.

### 6.3 ESP32 Slave

La carte Slave est responsable des actionneurs. Elle represente la partie "reaction" du systeme.

### 6.4 Application web

L'application web centralise l'affichage, les commandes, l'historique et la configuration.

### 6.5 Base de donnees

La base conserve les devices, mesures, etats d'actionneurs, commandes, alertes et parametres.

### 6.6 Worker MQTT

Le worker MQTT fait le lien entre les messages du broker et la base de donnees.

## 7. Architecture generale

Central Park IoT suit une architecture en couches :

1. **Couche physique :** capteurs et actionneurs relies aux ESP32.
2. **Couche communication :** HTTP et MQTT pour transporter les donnees.
3. **Couche backend :** API Next.js, validation Zod, Prisma.
4. **Couche stockage :** PostgreSQL.
5. **Couche presentation :** interface Next.js avec React, Tailwind et Recharts.

Cette separation permet de modifier une partie du systeme sans casser tout le reste. Par exemple, il est possible de remplacer un capteur sans changer le dashboard, ou de changer le theme graphique sans modifier la base.

## 8. Architecture technique

### 8.1 Frontend

Le frontend est construit avec Next.js et React. Next.js est choisi car il permet de combiner interface web, routage, pages et API dans un seul projet. React est adapte a une interface dynamique car chaque composant peut recevoir des donnees et se mettre a jour.

### 8.2 Styling

Tailwind CSS est utilise pour styliser rapidement l'interface avec des classes utilitaires. Ce choix evite de creer beaucoup de fichiers CSS separes et facilite la coherence visuelle.

La nouvelle identite "Central Park" utilise :

- Fond sombre zinc/stone pour un aspect tableau de bord professionnel.
- Accent amber pour le nom, la navigation active et les elements importants.
- Tons sky, emerald, amber et indigo pour differencier les familles de mesures.
- Cartes sobres avec bordures et leger flou pour donner une interface plus moderne.

### 8.3 Backend

Les routes API sont dans `src/app/api`. Elles gerent les devices, donnees capteurs, actionneurs, commandes, alertes et settings.

### 8.4 Base de donnees

PostgreSQL est utilise car il est fiable, relationnel et adapte aux donnees structurees. Prisma sert d'ORM pour manipuler les tables avec des types TypeScript.

### 8.5 MQTT

MQTT est utilise pour la communication IoT car il est leger, adapte aux microcontroleurs et efficace pour publier/souscrire a des topics.

### 8.6 Simulation

Wokwi permet de simuler les ESP32 et les composants sans devoir disposer immediatement de tout le materiel physique.

## 9. Structure du projet

```text
green_garden-main/
  src/
    app/
      api/
      alerts/
      devices/[id]/
      history/
      plant-profile/
      settings/
      page.tsx
      layout.tsx
      globals.css
    components/
      ActuatorControl.tsx
      ActuatorStatusDisplay.tsx
      DeviceSelector.tsx
      HealthScore.tsx
      Navigation.tsx
      SensorCard.tsx
      SensorChart.tsx
    lib/
      mqtt.ts
      prisma.ts
      utils.ts
      validators.ts
  prisma/
    schema.prisma
    seed.ts
  scripts/
    mqtt-worker.ts
  wokwi-master-esp32/
  wokwi-slave-esp32/
```

Cette structure separe clairement :

- `app` pour les pages et routes Next.js.
- `components` pour les blocs reutilisables de l'interface.
- `lib` pour les utilitaires techniques.
- `prisma` pour le schema et la base de donnees.
- `scripts` pour les processus annexes.
- `wokwi-*` pour la simulation des cartes ESP32.

## 10. Justification des composants frontend

### 10.1 `Navigation.tsx`

Ce composant gere la barre de navigation principale. Il affiche le nom Central Park et les liens vers les pages importantes.

Pourquoi un composant separe :

- La navigation est commune a plusieurs pages.
- Le changement de marque se fait a un seul endroit.
- Le lien actif peut etre calcule avec `usePathname`.

Pourquoi lucide-react :

- Les icones sont coherentes.
- Elles restent legeres car ce sont des SVG React.
- Elles rendent les liens plus rapides a identifier.

### 10.2 `DeviceSelector.tsx`

Ce composant permet de choisir le device a surveiller. Il evite de coder la logique de selection directement dans chaque page.

Pourquoi un select :

- Le nombre de devices peut grandir.
- L'utilisateur comprend rapidement l'action.
- Le composant reste simple et fiable.

### 10.3 `SensorCard.tsx`

Ce composant affiche une mesure : titre, valeur, unite et icone.

Pourquoi des cartes :

- Les mesures sont independantes.
- La lecture est rapide.
- Le meme composant peut afficher temperature, humidite, lumiere, VPD, niveau d'eau, etc.

Pourquoi une prop `color` :

- Chaque type de mesure garde une identite visuelle.
- Le code evite la duplication.
- Le dashboard reste coherent.

### 10.4 `HealthScore.tsx`

Ce composant transforme plusieurs conditions en un score lisible.

Pourquoi un cercle de progression :

- Le score est visible immediatement.
- La forme circulaire indique une evaluation globale.
- Le badge texte complete la lecture numerique.

Pourquoi ne pas afficher seulement les capteurs :

- Les mesures brutes peuvent etre difficiles a interpreter.
- Le score donne une synthese rapide.
- L'utilisateur peut ensuite regarder les details.

### 10.5 `SensorChart.tsx`

Ce composant affiche l'evolution des mesures sur une periode.

Pourquoi Recharts :

- Bibliotheque stable et adaptee a React.
- Graphiques responsives.
- Bonne integration avec les donnees JSON.

Pourquoi des lignes :

- Les donnees capteurs sont temporelles.
- Les tendances sont plus importantes qu'une valeur isolee.
- Les anomalies deviennent visibles.

### 10.6 `ActuatorStatusDisplay.tsx`

Ce composant affiche l'etat actuel des actionneurs.

Pourquoi separer status et controle :

- Le status est une lecture de l'etat reel.
- Le controle est une action utilisateur.
- La separation reduit les erreurs d'interpretation.

### 10.7 `ActuatorControl.tsx`

Ce composant permet d'envoyer des commandes.

Pourquoi des boutons et sliders :

- Le ventilateur et la lumiere ont des valeurs progressives.
- La pompe et la vanne ont des etats binaires.
- Les controles correspondent donc a la nature physique de chaque actionneur.

### 10.8 Pages `history`, `alerts`, `settings`, `plant-profile`

Ces pages evitent de surcharger le dashboard.

- `history` sert a analyser les tendances.
- `alerts` sert a voir les problemes.
- `settings` sert a definir les seuils.
- `plant-profile` sert a comparer valeurs actuelles et objectifs.

## 11. Dashboard Central Park

Le dashboard a ete modifie pour devenir un vrai centre de controle :

- Hero compact avec titre, description et indicateurs rapides.
- Cartes de resume : mode, device, zone, actionneurs actifs.
- Palette sombre plus professionnelle.
- Accent amber pour la marque Central Park.
- Cartes capteurs plus contrastees.
- Badges Master/Slave sans caracteres mal encodes.
- Graphiques harmonises avec les nouvelles couleurs.

Cette refonte garde la logique existante mais ameliore la perception visuelle et la hierarchie de l'information.

## 12. Modele de donnees

### 12.1 `Device`

Represente une carte ou un equipement connecte.

Champs principaux :

- `id` : identifiant unique.
- `name` : nom lisible.
- `type` : master ou slave.
- `macAddress` : adresse physique unique.
- `location` : emplacement.
- `isActive` : activation du device.

Pourquoi ce modele :

- Les capteurs et actionneurs sont lies a des devices.
- La MAC permet de reconnaitre une carte.
- Le type permet d'adapter l'affichage.

### 12.2 `SensorData`

Stocke les mesures envoyees par le Master.

Mesures :

- Temperature.
- Humidite.
- Qualite de l'air.
- Lumiere.
- Niveau d'eau.
- Humidite du sol.
- VPD.
- Score de sante.

Pourquoi stocker chaque mesure :

- Historique.
- Graphiques.
- Analyse.
- Detection de problemes.

### 12.3 `ActuatorStatus`

Stocke l'etat des actionneurs du Slave.

Etats :

- `fanSpeed`.
- `lightIntensity`.
- `pumpState`.
- `waterValveOpen`.

Pourquoi un modele separe :

- Les actionneurs ne sont pas des capteurs.
- Les valeurs representent l'etat du systeme de controle.
- Le dashboard peut lire l'etat actuel rapidement.

### 12.4 `Command`

Stocke les commandes envoyees aux actionneurs.

Pourquoi enregistrer les commandes :

- Tracabilite.
- Debug.
- Verification de l'execution.
- Historique des interventions.

### 12.5 `Alert`

Stocke les alertes du systeme.

Pourquoi :

- L'utilisateur doit connaitre les incidents.
- Les alertes peuvent etre resolues.
- Les niveaux `info`, `warning`, `critical` permettent de prioriser.

### 12.6 `Settings`

Stocke les seuils de culture.

Pourquoi :

- Les plantes n'ont pas toutes les memes besoins.
- Les seuils doivent etre modifiables sans changer le code.
- Le score de sante depend des objectifs.

## 13. API

### 13.1 `/api/devices`

Permet de recuperer la liste des devices.

Utilisation :

- Alimenter le select de device.
- Identifier les cartes disponibles.

### 13.2 `/api/devices/[id]`

Permet de recuperer le detail d'un device avec ses donnees recentes.

Utilisation :

- Alimenter le dashboard.
- Afficher le type, la localisation et la derniere mesure.

### 13.3 `/api/data`

Permet de recuperer les donnees capteurs, souvent avec une limite.

Utilisation :

- Alimenter les graphiques.
- Construire l'historique.

### 13.4 `/api/actuators`

Permet de lire ou mettre a jour l'etat des actionneurs.

Utilisation :

- Le Slave publie son etat.
- Le dashboard affiche la situation actuelle.

### 13.5 `/api/commands`

Permet de creer une commande et de la publier en MQTT.

Pourquoi passer par l'API :

- Validation des donnees.
- Enregistrement en base.
- Publication MQTT centralisee.
- Gestion des erreurs.

### 13.6 `/api/alerts`

Permet de recuperer et gerer les alertes.

### 13.7 `/api/settings`

Permet de lire et modifier les seuils de configuration.

## 14. Communication IoT

### 14.1 Topics MQTT

Topics typiques :

```text
green-garden/sensors/{masterMacAddress}
green-garden/actuators/{slaveMacAddress}
green-garden/commands/{slaveMacAddress}
```

Le nom des topics garde actuellement l'ancien prefixe technique `green-garden` afin de ne pas casser les ESP32 et le worker. Le rebranding visuel devient Central Park, mais les topics peuvent etre migres plus tard vers `central-park/*` si toutes les cartes sont mises a jour.

### 14.2 Pourquoi MQTT

MQTT est adapte a l'IoT car :

- Il est leger.
- Il fonctionne bien avec des microcontroleurs.
- Il supporte le modele publish/subscribe.
- Il reduit le couplage entre cartes et application.

### 14.3 Pourquoi HTTP existe aussi

HTTP est utile pour :

- Les appels directs depuis le dashboard.
- Les API REST.
- Les integrations simples.
- Les tests manuels.

## 14.4 Role des fichiers `.ino` et des ESP32

Le projet utilise des fichiers `.ino`. Un fichier `.ino` est un sketch ecrit avec le style Arduino. Cela ne signifie pas que le projet utilise obligatoirement une carte Arduino Uno. Dans ce projet, les fichiers `.ino` sont utilises pour programmer des cartes **ESP32**.

La distinction importante est la suivante :

| Element | Role |
| --- | --- |
| Arduino Uno | Carte microcontroleur classique, sans Wi-Fi integre |
| ESP32 | Carte microcontroleur plus puissante avec Wi-Fi et Bluetooth |
| Fichier `.ino` | Format de code Arduino utilise pour programmer des cartes comme Arduino ou ESP32 |
| Wokwi | Simulateur permettant de tester les circuits ESP32 sans materiel physique |

Ainsi, Central Park IoT utilise principalement des **ESP32**, mais leur code est ecrit sous forme de fichiers `.ino`.

### 14.5 Pourquoi ESP32 et pas Arduino Uno

Le choix de l'ESP32 est plus adapte a ce projet car :

- L'ESP32 possede le Wi-Fi integre.
- Le projet doit envoyer des donnees vers MQTT et l'application web.
- L'ESP32 est plus puissant qu'un Arduino Uno classique.
- L'ESP32 est bien supporte par Wokwi.
- Il peut lire plusieurs capteurs et controler plusieurs actionneurs.

Un Arduino Uno pourrait lire des capteurs simples, mais il aurait besoin d'un module Wi-Fi externe pour communiquer avec le dashboard. Cela ajouterait de la complexite materielle et logicielle. L'ESP32 permet donc de faire un systeme IoT plus direct.

### 14.6 Role du Master ESP32

Le Master ESP32 represente la partie "observation" du systeme. Il lit les capteurs, calcule certaines valeurs, puis publie les donnees.

Fichier principal :

```text
wokwi-master-esp32/wokwi-master-esp32.ino
```

Le Master lit :

- temperature ;
- humidite ;
- lumiere ;
- qualite de l'air ;
- humidite du sol ;
- niveau d'eau ;
- VPD ;
- score de sante.

Ensuite, il publie un message MQTT au format JSON, par exemple :

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

Le Master envoie ce message sur le topic :

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

Son role peut etre resume ainsi :

```text
Capteurs -> ESP32 Master -> MQTT
```

### 14.7 Role du Slave ESP32

Le Slave ESP32 represente la partie "reaction" du systeme. Il recoit les mesures envoyees par le Master et decide automatiquement quels actionneurs activer.

Fichier principal :

```text
wokwi-slave-esp32/wokwi-slave-esp32.ino
```

Le Slave controle :

- ventilateur ;
- lumiere ;
- pompe ;
- vanne d'eau ;
- LED d'alarme.

Il ecoute le topic des capteurs :

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

Puis il publie son etat sur :

```text
green-garden/actuators/AA:BB:CC:DD:EE:02
```

Son role peut etre resume ainsi :

```text
MQTT -> ESP32 Slave -> Actionneurs
```

### 14.8 Logique automatique du Slave

Le Slave applique une logique simple :

- Si l'humidite du sol est faible, la pompe s'allume.
- Si le niveau d'eau est faible, la vanne s'ouvre.
- Si la lumiere est faible, la lumiere artificielle s'allume.
- Si la temperature, le VPD ou la qualite de l'air sont mauvais, le ventilateur s'allume.

Exemples de conditions :

```cpp
if (soilMoisture < 40) pumpState = true;
if (waterLevel < 30) waterValveOpen = true;
if (lightLevel < 35) lightIntensity = 90;
if (temperature > 30 || vpd > 1.6 || airQuality > 350) fanSpeed = 80;
```

Cette logique permet de montrer que le systeme ne fait pas seulement de l'affichage. Il peut aussi reagir automatiquement a l'etat de l'environnement.

### 14.9 Role du worker MQTT

Le dashboard ne lit pas directement les messages Wokwi. Pour relier Wokwi a l'application, le projet utilise un worker MQTT.

Fichier :

```text
scripts/mqtt-worker.ts
```

Le worker fait trois choses :

1. Il se connecte au broker MQTT.
2. Il ecoute les topics capteurs et actionneurs.
3. Il enregistre les donnees dans PostgreSQL avec Prisma.

Il doit etre lance avec :

```bash
npm run mqtt:worker
```

Sans ce worker, les ESP32 peuvent publier des messages MQTT, mais le dashboard ne recevra pas les nouvelles donnees car elles ne seront pas stockees en base.

### 14.10 Fonctionnement complet du projet

Le fonctionnement complet est le suivant :

```text
Wokwi Master ESP32
  lit les capteurs
  publie les donnees MQTT
        |
        v
Broker MQTT
        |
        +--> Wokwi Slave ESP32
        |      recoit les donnees
        |      controle les actionneurs
        |      publie son etat
        |
        +--> Worker MQTT
               enregistre dans PostgreSQL
                    |
                    v
              Dashboard Central Park
```

En termes simples :

| Partie | Explication simple |
| --- | --- |
| ESP32 Master | Les yeux du systeme |
| ESP32 Slave | Les mains du systeme |
| MQTT | Le messager |
| PostgreSQL | La memoire |
| Dashboard | L'ecran de controle |

Le Master observe, le Slave agit, MQTT transporte les messages, la base garde l'historique et le dashboard affiche la situation.

## 15. Capteurs

### 15.1 Temperature et humidite

Ces mesures sont essentielles car elles influencent directement la croissance.

### 15.2 Lumiere

La lumiere permet de savoir si la plante recoit assez d'energie.

### 15.3 Humidite du sol

Elle permet de savoir si l'arrosage est necessaire.

### 15.4 Niveau d'eau

Il indique si le reservoir peut continuer a alimenter le systeme.

### 15.5 Qualite de l'air

Elle donne une indication sur la composition ou la pollution de l'air ambiant.

### 15.6 VPD

Le VPD aide a comprendre la relation entre temperature et humidite. Il donne une lecture plus agronomique que les valeurs separees.

## 16. Actionneurs

### 16.1 Ventilateur

Role :

- Reguler la temperature.
- Ameliorer la circulation d'air.

Pourquoi PWM :

- La vitesse doit etre progressive.
- Le systeme peut ajuster finement la ventilation.

### 16.2 Lumiere

Role :

- Apporter ou simuler un eclairage.

Pourquoi intensite variable :

- Toutes les plantes n'ont pas besoin de la meme intensite.
- Le systeme peut adapter selon les conditions.

### 16.3 Pompe

Role :

- Distribuer l'eau.

Pourquoi etat ON/OFF :

- Une pompe simple fonctionne souvent en binaire.
- La duree peut etre geree par commande.

### 16.4 Vanne

Role :

- Controler le flux d'eau ou le remplissage.

Pourquoi servo :

- Une vanne peut etre ouverte ou fermee.
- Le servo donne un controle mecanique simple.

## 17. Choix technologiques

### 17.1 Next.js

Choisi car il combine frontend et backend dans un meme projet. Cela reduit la complexite pour un projet academique ou demonstratif.

### 17.2 React

Choisi pour construire une interface reactive par composants.

### 17.3 TypeScript

Choisi pour reduire les erreurs de types et rendre le code plus maintenable.

### 17.4 Tailwind CSS

Choisi pour styliser rapidement, garder une coherence visuelle et eviter une grande quantite de CSS manuel.

### 17.5 Prisma

Choisi pour manipuler PostgreSQL avec des types et un schema clair.

### 17.6 PostgreSQL

Choisi pour sa fiabilite, ses relations et sa compatibilite avec des projets en production.

### 17.7 Zod

Choisi pour valider les donnees entrantes avant insertion ou commande.

### 17.8 Recharts

Choisi pour afficher des graphiques React sans developper un moteur graphique maison.

### 17.9 Lucide React

Choisi pour des icones lisibles, legeres et coherentes.

### 17.10 MQTT

Choisi pour la communication entre monde IoT et application.

### 17.11 Wokwi

Choisi pour simuler le materiel, tester le flux et presenter le projet sans dependance totale au hardware.

## 18. Exigences fonctionnelles

| ID | Exigence | Priorite |
| --- | --- | --- |
| F01 | L'utilisateur peut selectionner un device | Haute |
| F02 | Le dashboard affiche les dernieres donnees capteurs | Haute |
| F03 | Le dashboard se met a jour automatiquement | Haute |
| F04 | Les donnees sont stockees en base | Haute |
| F05 | Les graphiques affichent l'evolution | Moyenne |
| F06 | L'utilisateur peut voir les alertes | Haute |
| F07 | L'utilisateur peut configurer les seuils | Moyenne |
| F08 | L'utilisateur peut envoyer des commandes | Haute |
| F09 | Les commandes sont enregistrees | Haute |
| F10 | Les actionneurs affichent leur etat actuel | Haute |

## 19. Exigences non fonctionnelles

### 19.1 Performance

- Le dashboard doit rester fluide.
- Les donnees sont rechargees toutes les 5 secondes.
- Les composants doivent etre reutilisables pour eviter un code lourd.

### 19.2 Maintenabilite

- Les composants sont separes.
- Les routes API sont organisees par domaine.
- Le schema Prisma documente la structure de donnees.

### 19.3 Lisibilite

- Le code utilise TypeScript.
- Les noms de composants sont explicites.
- L'interface montre clairement les informations importantes.

### 19.4 Robustesse

- Les donnees entrantes sont validees.
- Les erreurs API sont gerees.
- Les devices inconnus peuvent etre crees a partir de la MAC.

### 19.5 Evolutivite

- Ajout possible de nouveaux capteurs.
- Ajout possible de nouveaux actionneurs.
- Migration possible vers authentification.
- Migration possible vers topics `central-park`.

## 20. Design et identite visuelle

Le nom "Green Garden" est remplace par "Central Park" dans l'interface et les metadonnees. Le style evolue vers une interface plus professionnelle :

- Fond sombre : meilleure concentration et lecture dashboard.
- Amber : couleur de marque, chaude et visible.
- Sky : donnees liees a l'air ou humidite.
- Emerald : vie, sol, sante.
- Indigo : indicateurs techniques.
- Cartes avec bordures : separation claire des blocs.

Pourquoi ne pas garder un vert dominant :

- Le nom Central Park evoque un espace vert, mais l'interface doit rester un outil technique.
- Trop de vert rend les statuts difficiles a distinguer.
- La palette actuelle donne plus de hierarchie.

## 21. Securite et validation

### 21.1 Validation Zod

Les donnees d'actionneurs et commandes sont validees avant traitement. Cela evite :

- Valeurs hors limites.
- MAC invalide.
- Types incorrects.
- Commandes mal formees.

### 21.2 Limites actuelles

- Pas encore d'authentification.
- Pas encore de gestion de roles.
- Les commandes doivent etre protegees avant une mise en production reelle.

### 21.3 Ameliorations recommandees

- Ajouter une authentification.
- Proteger les routes de commande.
- Ajouter un journal d'audit.
- Ajouter un rate limiting.
- Chiffrer les secrets dans l'environnement.

## 22. Tests et validation

### 22.1 Tests fonctionnels

- Selection d'un device.
- Affichage des mesures.
- Affichage des graphiques.
- Affichage des actionneurs.
- Creation d'une commande.
- Reception des donnees MQTT.
- Creation d'alertes.

### 22.2 Tests techniques

- Validation Zod avec donnees invalides.
- Verification de connexion PostgreSQL.
- Verification Prisma generate/build.
- Test du worker MQTT.
- Test Wokwi Master et Slave.

### 22.3 Tests UI

- Lisibilite desktop.
- Lisibilite mobile.
- Navigation active.
- Couleurs des badges.
- Absence de chevauchement des textes.

### 22.4 Tests pratiques avec Wokwi

Les simulations Wokwi permettent de tester le projet sans materiel physique complet. Deux simulations sont utilisees :

- **Master ESP32** : lit les capteurs et publie les mesures.
- **Slave ESP32** : recoit les mesures, applique la logique automatique et publie l'etat des actionneurs.

Le Master publie les donnees capteurs sur :

```text
green-garden/sensors/AA:BB:CC:DD:EE:01
```

Le Slave ecoute ce topic, puis publie l'etat des actionneurs sur :

```text
green-garden/actuators/AA:BB:CC:DD:EE:02
```

Pour que le dashboard recoive les donnees, il faut lancer le worker MQTT :

```bash
npm run mqtt:worker
```

Sans ce worker, les simulations Wokwi peuvent fonctionner entre elles, mais les donnees ne seront pas stockees dans PostgreSQL et ne seront donc pas visibles dans le dashboard.

#### 22.4.1 Modifier la lumiere depuis le Master

La lumiere est mesuree par le capteur LDR du Master sur la pin `34`.

Dans le code Master :

```cpp
#define LDR_PIN 34
int light = percentFromAnalog(analogRead(LDR_PIN));
```

Pour tester une faible luminosite, il faut diminuer la valeur du capteur LDR dans Wokwi. Le Master publie alors une valeur `light` plus basse. Le Slave recoit cette valeur et active l'actionneur lumiere si la luminosite est trop faible.

Logique cote Slave :

```cpp
if (lightLevel < 35) lightIntensity = 90;
else if (lightLevel < 55) lightIntensity = 50;
else lightIntensity = 0;
```

Resultat attendu :

- Si `light < 35`, la lumiere du Slave passe a `90%`.
- Si `light` est entre `35` et `55`, la lumiere passe a `50%`.
- Si `light >= 55`, la lumiere s'eteint.

#### 22.4.2 Modifier la qualite de l'air depuis le Master

La qualite de l'air est mesuree par le capteur gaz du Master sur la pin `35`.

Dans le code Master :

```cpp
#define GAS_PIN 35
int airQuality = map(analogRead(GAS_PIN), 0, 4095, 0, 500);
```

Pour tester un air mauvais, il faut augmenter la valeur du capteur gaz dans Wokwi. Le Master publie alors une valeur `airQuality` plus elevee. Le Slave recoit cette valeur et active le ventilateur si l'air est considere mauvais.

Logique cote Slave :

```cpp
if (temperature > 30 || vpd > 1.6 || airQuality > 350) fanSpeed = 80;
else if (temperature > 27) fanSpeed = 40;
else fanSpeed = 0;
```

Resultat attendu :

- Si `airQuality > 350`, le ventilateur passe a `80%`.
- Si la temperature est superieure a `27`, le ventilateur passe a `40%`.
- Si les conditions redeviennent normales, le ventilateur s'arrete.

#### 22.4.3 Modifier l'humidite du sol depuis le Master

L'humidite du sol est mesuree par le capteur soil du Master sur la pin `32`.

Dans le code Master :

```cpp
#define SOIL_PIN 32
int soilMoisture = percentFromAnalog(analogRead(SOIL_PIN));
```

Logique cote Slave :

```cpp
if (soilMoisture < SOIL_DRY) pumpState = true;
if (soilMoisture >= SOIL_WET) pumpState = false;
```

Avec les seuils actuels :

```cpp
const int SOIL_DRY = 40;
const int SOIL_WET = 60;
```

Resultat attendu :

- Si `soilMoisture < 40`, la pompe s'allume.
- Si `soilMoisture >= 60`, la pompe s'eteint.

#### 22.4.4 Modifier le niveau d'eau depuis le Master

Le niveau d'eau est mesure par le capteur water du Master sur la pin `33`.

Dans le code Master :

```cpp
#define WATER_PIN 33
int waterLevel = percentFromAnalog(analogRead(WATER_PIN));
```

Logique cote Slave :

```cpp
if (waterLevel < WATER_LOW) waterValveOpen = true;
if (waterLevel >= WATER_HIGH) waterValveOpen = false;
```

Avec les seuils actuels :

```cpp
const int WATER_LOW = 30;
const int WATER_HIGH = 90;
```

Resultat attendu :

- Si `waterLevel < 30`, la vanne s'ouvre.
- Si `waterLevel >= 90`, la vanne se ferme.

#### 22.4.5 Scenario de demonstration recommande

Le meilleur scenario de demonstration est le suivant :

1. Lancer `npm run dev`.
2. Lancer `npm run mqtt:worker`.
3. Lancer la simulation Wokwi Master.
4. Lancer la simulation Wokwi Slave.
5. Ouvrir le dashboard Central Park.
6. Selectionner le device Master et observer les donnees capteurs.
7. Diminuer l'humidite du sol dans Wokwi Master.
8. Verifier que le Slave active la pompe.
9. Selectionner le device Slave dans le dashboard.
10. Verifier que `pumpState` passe a ON.
11. Augmenter l'humidite du sol.
12. Verifier que la pompe repasse a OFF.

Ce scenario montre toute la chaine du projet : capteur, publication MQTT, reaction automatique, stockage en base et affichage dashboard.

## 23. Contraintes

### 23.1 Contraintes materielles

- Disponibilite des ESP32.
- Fiabilite des capteurs.
- Alimentation adaptee aux actionneurs.
- Connexion Wi-Fi stable.

### 23.2 Contraintes logicielles

- Variables d'environnement correctes.
- Base PostgreSQL accessible.
- Broker MQTT disponible.
- Compatibilite Next.js et Prisma.

### 23.3 Contraintes projet

- Temps de developpement limite.
- Besoin de demonstration claire.
- Documentation complete.
- Interface comprehensible par un jury ou utilisateur non technique.

## 24. Risques

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Capteur mal calibre | Donnees fausses | Calibration et tests |
| Broker MQTT indisponible | Pas de commandes temps reel | Gestion d'erreur et retry |
| Base inaccessible | Pas de stockage | Verifier env et connexion |
| Commande non protegee | Risque securite | Ajouter auth avant production |
| Trop de donnees | Performance | Pagination et limitation |
| Perte Wi-Fi ESP32 | Donnees manquantes | Reconnexion et affichage offline |

## 25. Planning indicatif

| Phase | Contenu |
| --- | --- |
| Analyse | Besoins, capteurs, actionneurs, architecture |
| Conception | Schema DB, routes API, structure UI |
| Implementation backend | Prisma, API, validations |
| Implementation frontend | Dashboard, composants, pages |
| Integration IoT | ESP32, MQTT, worker |
| Tests | Simulation Wokwi, tests API, tests UI |
| Documentation | Cahier des charges, guide de presentation |
| Soutenance | Demo et explication des choix |

## 26. Criteres d'acceptation

Le projet est considere comme valide si :

- L'interface affiche le nom Central Park.
- Le dashboard charge les devices.
- Les mesures capteurs sont visibles.
- Les graphiques affichent les tendances.
- Les actionneurs sont visibles pour le device Slave.
- Les commandes peuvent etre creees.
- Les donnees sont stockees en base.
- Le cahier des charges explique la structure et les choix.
- La demonstration peut montrer le lien capteur -> base -> dashboard.

## 27. Evolutions futures

- Renommer les topics MQTT en `central-park/*`.
- Ajouter authentification et roles.
- Ajouter un mode automatique base sur les seuils.
- Ajouter notifications email ou mobile.
- Ajouter export CSV/PDF.
- Ajouter predictions par IA.
- Ajouter plusieurs zones de culture.
- Ajouter un mode maintenance.
- Ajouter calibration depuis l'interface.

## 28. Conclusion

Central Park IoT est une plateforme complete de supervision et de controle pour une culture connectee. Le projet ne se limite pas a afficher des valeurs : il organise une vraie chaine IoT, depuis les capteurs physiques jusqu'a une interface web moderne.

Le choix de Next.js, React, Tailwind, Prisma, PostgreSQL, MQTT et ESP32 permet de construire un systeme clair, modulaire et evolutif. Chaque composant a un role precis : mesurer, transmettre, stocker, afficher, analyser ou agir.

La refonte visuelle vers Central Park donne une identite plus professionnelle au projet tout en conservant son objectif principal : rendre l'environnement de culture comprehensible, pilotable et ameliorable.
