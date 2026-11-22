# Course aux points — concept du nouveau module

Rédigé le 21 octobre 2026 · @Silvio · tenu à jour depuis.

**Ce fichier décrit le produit visé** : la vision, le contexte, les écrans, les intégrations,
ce que le logiciel doit faire. Il ne contient **aucune règle de course** — elles sont dans
`regles-operateur.md`, mot pour mot — et **aucun chiffre de mesure** — ils sont dans
`mesures.md`. Le code du prototype est dans `architecture.md`.

---

## Vision

Le nouveau module de course aux points cesse d'être un outil de saisie piloté par l'opérateur
pour devenir un système qui entretient en permanence **sa propre lecture de la course** et la
montre à l'opérateur, qui confirme ou corrige. Le logiciel actuel enregistre ce qu'on lui
dit, calcule un classement et l'exporte. Toutes les données disponibles sur la piste doivent
être utilisées, structurées et exploitées, au lieu de passer sous le nez de l'opérateur.

Quatre idées directrices portent le concept.

1. **Le logiciel déduit, il ne se contente pas de mesurer.** Un passage manqué entre deux
   passages dans le peloton est un passage dans le peloton. Un coureur qui n'apparaît plus là
   où sa vitesse le place est un incident probable. Une détection inconnue pendant qu'un
   dossard est muet est le transpondeur de ce dossard.
2. **Le logiciel propose, l'opérateur dispose.** Chaque déduction est affichée avec son
   origine — mesuré, déduit ou décidé — et l'opérateur peut la valider, la corriger ou la
   remplacer par une saisie manuelle. Cela vaut jusqu'aux cas où le règlement semble
   automatique : même quand un retrait à N tours perdus a été annoncé avant le départ, le
   logiciel le propose et ne l'exécute jamais. **Jamais de retrait automatique d'un coureur.**
3. **Toute décision est rattachée au tour où elle s'applique et reste modifiable.** Le plus
   souvent c'est le tour courant, l'opérateur saisissant à l'instant où le président du jury
   tranche. Quand l'information arrive en retard, l'opérateur désigne le tour, et tout l'aval
   se recalcule — points, éligibilité, classement — avec la conséquence affichée avant
   validation.
4. **La vue de piste et le journal sont les deux faces de la même réalité.** L'ovale montre
   où chacun se trouve maintenant, le journal montre comment on en est arrivé là, tour par
   tour, et sert de preuve face aux réclamations.

**Deux principes de forme, non négociables.** On corrige **sur l'objet**, pas dans un journal :
la marque de tours d'un coureur, la flèche de réintégration, la croix d'un groupe — le journal
n'a pas de bouton, il enregistre. Et c'est **un logiciel de chronométrage, pas un
PowerPoint** : interface dense, en anglais, vocabulaire fixe — *BIB*, *Lap*, *Rider*,
*gaining a lap*, *losing a lap*.

Le point de départ est le test en shadow mené pendant les Championnats du monde de Shanghai,
en octobre 2026 : la nouvelle console a reçu un coup de neuf visuel, mais la logique
sous-jacente reste celle du logiciel de 20 ans. Ce document décrit ce que la logique doit
devenir.

---

## Contexte

Le module s'appuie sur une installation de piste déjà riche en capteurs, dont le logiciel
actuel n'exploite qu'une petite partie. **Les positions et les caractéristiques de cette
installation sont dans `regles-operateur.md` §9** : trois boucles qui identifient le coureur,
cinq tape switches qui comptent les vélos sans les nommer, et la géométrie qui lie les deux.

Chaque coureur produit donc **trois pointages identifiés par tour**, à des positions connues,
plus deux passages anonymes. Un tape switch compte les vélos sans les nommer, une boucle
nomme les vélos qu'elle voit : rapprocher les deux dit combien de vélos sans transpondeur sont
passés là.

**Le lap counter.** Opéré par un commissaire, relié au logiciel en série ou en réseau. C'est
la référence officielle du nombre de tours restants.

**Les commissaires.** Le président du jury (PCP) prend les décisions : tours gagnés et perdus,
neutralisations, retraits, déclassements. Le starter désigne en permanence le leader **sur la
piste**, pas le leader au classement. L'opérateur du lap counter, lui aussi humain, décrémente
le compteur pour ce leader — et pas à son passage exact sur la ligne, voir
`regles-operateur.md` §13.

**Le déroulement avant le départ** est décrit, mot pour mot, dans `regles-operateur.md` §12.
C'est une phase à part entière, avec sa propre exigence de fiabilité, et elle n'est pas encore
construite.

**Le logiciel actuel.** Timing Manager pour Quantum, version 1.7 de décembre 2024, manuel
3493.508.02. Pour la course aux points il offre : armement d'un sprint (F5) avec ordre de
passage par transpondeur, saisie manuelle par double-clic ou dossard, tour gagné ou perdu par
clic droit, barème des 20 points paramétrable, cases de groupes remplies à la main, marquage
photo-finish, décrémentation des tours sur le premier détecté ou manuelle, points d'omnium, et
sorties TV, scoreboard et web. Les groupes, les tours gagnés, les incidents, les
neutralisations et les changements de vélo sont entièrement manuels ou absents. Le lap counter
est affiché mais ne pilote rien.

---

## Le règlement UCI appliqué

Règlement UCI piste, partie 3, chapitre II, course aux points, articles 3.2.095 et suivants,
édition 01.01.2026. Le classement final se fait **aux points**, cumul des sprints
intermédiaires et des tours gagnés ou perdus, jamais à l'ordre d'arrivée seul. Les distances
et le nombre de sprints sont libres pour les organisateurs nationaux : ce sont des paramètres
de course, pas des constantes.

| Règle            | Valeur                                                                                                                      | Conséquence pour le logiciel                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Sprint           | tous les 10 tours sur les pistes de moins de 333,33 m (3.2.117)                                                             | les tours de sprint sont connus d'avance ; la cloche annonce le dernier tour  |
| intermédiaire    |                                                                                                                             | avant chaque sprint                                                           |
| Points par       | 5, 3, 2, 1 aux quatre premiers (3.2.118)                                                                                    | l'ordre des quatre premiers suffit en cours de course                         |
| sprint           |                                                                                                                             |                                                                               |
| Dernier sprint   | points doublés : 10, 6, 4, 2                                                                                                | l'ordre **complet** compte, il départage les égalités                         |
| Tour gagné       | +20 points (3.2.118)                                                                                                        | décision du PCP, souvent connue en retard                                     |
| Tour perdu       | −20 points                                                                                                                  | décision du PCP ; retrait possible selon un seuil annoncé                     |
| Tours gagnés et  | **comptés séparément** par coureur                                                                                          | ils servent au départage ; on ne compense jamais l'un par l'autre             |
| perdus           |                                                                                                                             |                                                                               |
| Cloche et        | la cloche sonne au passage de la **tête de course** ; les points sont attribués, ou la course se termine, à son passage     | la tête de course est désignée par le président du jury                       |
| arrivée          | suivant (3.2.017 ter)                                                                                                       |                                                                               |
| Coureur à un ou  | ne dispute pas les sprints, peut être retiré par le jury (3.2.127)                                                          | voir l'éligibilité, `regles-operateur.md` §6                                  |
| plusieurs tours  |                                                                                                                             |                                                                               |
| Égalité          | place au dernier sprint                                                                                                     | l'ordre d'arrivée de **tous** les coureurs est nécessaire                     |
| Incident reconnu | neutralisation d'environ 1 250 m, 5 tours sur 250 m, reprise à la même place                                                | compte de tours aligné sur le groupe réintégré                                |
| Incident dans    | pas de retour, classé avec points et tours acquis                                                                           | statut final sans passage d'arrivée                                           |
| les 5 derniers   |                                                                                                                             |                                                                               |
| tours            |                                                                                                                             |                                                                               |
| Course           | drapeau jaune, groupe compact, relance avec les mêmes écarts de tours                                                       | compteur figé, sprint tombé pendant la neutralisation redonné après           |
| neutralisée      |                                                                                                                             |                                                                               |
| Retraits         | **ABD** (le coureur se retire), **DNF** (mis hors course), **DSQ** (disqualifié)                                            | statut explicite avec tour d'effet                                            |
| Distances élite  | 40 km hommes, 25 km femmes ; omnium 25 et 20 km ; juniors 25 et 20 km                                                       | paramètres de course                                                          |
| championnats     |                                                                                                                             |                                                                               |

Sources ouvertes : [UCI, About Track cycling](https://www.uci.org/discipline/track/1du7QkAFLchuURUZw3eool),
[Wikipedia, Points race](https://en.wikipedia.org/wiki/Points_race). **La version en vigueur
du règlement reste la référence à vérifier avant implémentation.**

**Quand des échappés reprennent un tour au peloton, le compteur ne saute pas** : le peloton
aura physiquement parcouru un tour de moins sur l'ensemble de la course, et la course se
termine quand le compteur atteint zéro.

---

## Inventaire des données

Chaque donnée est rangée selon **sa nature**, pas selon le câble par lequel elle arrive. Le
câble ne dit rien de ce qu'on peut en faire.

| Famille     | Donnée                                                          | Identifie           | Précision  | Fiabilité                                   | Latence               | Autorité                |
| ----------- | --------------------------------------------------------------- | ------------------- | ---------- | ------------------------------------------- | --------------------- | ----------------------- |
| Mesure      | Passage transpondeur (boucle, heure, force du signal)           | oui                 | ms         | un passage peut manquer                     | immédiate             | indicative              |
| Mesure      | Impulsion tape switch (entrée, heure)                           | non                 | supérieure | deux roues collées peuvent compter pour une | immédiate             | indicative              |
| Mesure      | Signal de départ                                                | course              | ms         | fiable                                      | immédiate             | officielle              |
| Mesure      | Horodatage et ordre photo-finish                                | oui, après jugement | 1/1000 s   | fiable                                      | 30 s à 3 min          | officielle              |
| Décision    | Lap counter                                                     | course              | tour       | fiable, mais peut dériver d'un tour         | quelques secondes     | officielle              |
| Décision    | Résultat de sprint confirmé                                     | oui                 | rang       | fiable                                      | 30 s à 3 min          | officielle              |
| Décision    | Tour gagné ou perdu, avec tour d'effet                          | oui                 | tour       | fiable                                      | 5 s à plusieurs tours | officielle              |
| Décision    | Neutralisation d'un coureur, début et issue                     | oui                 | tour       | fiable                                      | quelques secondes     | officielle              |
| Décision    | Course neutralisée, début et relance                            | course              | tour       | fiable                                      | quelques secondes     | officielle              |
| Décision    | Abandon, retrait, disqualification, déclassement, avertissement | oui                 | tour       | fiable                                      | variable              | officielle              |
| Décision    | Changement de vélo                                              | oui                 | instant    | fiable                                      | quelques secondes     | officielle              |
| Décision    | Geste de l'opérateur sur la vue                                 | oui                 | position   | fiable                                      | immédiate             | correction locale       |
| Décision    | Points d'omnium antérieurs                                      | oui                 | points     | fiable                                      | avant départ          | officielle              |
| Référentiel | Startlist (dossard, nom, nation ou équipe, couleur)             | oui                 |            |                                             | avant départ          | officielle              |
| Référentiel | Table des transpondeurs                                         | oui                 |            | peut être fausse pour un vélo               | avant départ          | officielle, corrigeable |
| Référentiel | Géométrie de piste                                              |                     | m          | fiable                                      | installation          | officielle              |
| Référentiel | Règles de l'épreuve (distance, tours de sprint, barème, seuils) |                     |            | fiable                                      | avant départ          | officielle              |

Trois principes d'exploitation en découlent.

- **Une mesure est une preuve, pas une vérité.** Le nombre de passages d'un transpondeur n'est
  pas le compte de tours officiel du coureur. Il sert à proposer et à vérifier, jamais à
  décider seul.
- **Une décision peut s'appliquer à un autre tour que celui de sa saisie.**
- **Chaque donnée affichée porte son origine**, et pour une déduction, les mesures qui l'ont
  fondée. L'opérateur sait toujours à quoi il fait confiance.

---

## Modèle de course

Le logiciel entretient un état de course **recalculé à chaque événement** à partir d'un
journal d'événements datés, jamais modifié en place. C'est ce qui rend toute décision
rétroactive possible sans fragilité, et c'est aussi ce qui permet de rejouer une course
entière après coup.

**Les trois nombres de tours**, qui ne se confondent jamais, sont définis dans
`regles-operateur.md` §13.

**Les deux lectures de la course**, qu'il faut garder toutes les deux en tête — les confondre
est l'erreur qui a coûté le plus de versions au prototype :

- **La timeline : l'ordre de la course.** Du premier coureur jusqu'au dernier, dans l'ordre
  des groupes et, dans un groupe, dans l'ordre des passages. C'est la lecture qui dit **qui est
  devant qui dans la course**. Elle ne compte aucun tour : l'opérateur l'a posé le 1er novembre
  2026, « chacun est toujours dans le même tour que les autres du point de vue de la timeline »
  (`regles-operateur.md` points 174 et 182) — un tour gagné ou perdu est un événement de
  20 points, et le coureur revient l'égal des autres dans le peloton.
- **L'ovale : la position sur le tour de piste.** Où chacun se trouve physiquement maintenant,
  les uns par rapport aux autres. C'est une aide visuelle (point 185) : rien de ce que la
  timeline décide ne s'appuie dessus.

Un coureur peut être plus bas dans la timeline et pourtant plus près de la ligne sur l'ovale :
c'est précisément la situation que la règle d'éligibilité existe pour traiter
(`regles-operateur.md` §6 et point 196).

**Position et groupes.** L'ordre, les groupes et les écarts se lisent sur les **détections des
boucles**, trois par tour, et sur rien d'autre (`regles-operateur.md` points 177 et 191) ; entre
deux détections la timeline ne bouge pas, seul l'ovale avance, par extrapolation de la vitesse.
Les groupes sont détectés par les **cassures** (`regles-operateur.md` §1), **dans la timeline**,
jamais sur la position repliée. Le peloton est le groupe où tous les coureurs sont ensemble au
départ, et il garde cette identité ; ce n'est pas le groupe le plus nombreux de l'instant
(point 174). Un groupe garde le côté par lequel il a quitté le peloton (point 246), et sa
composition est mémorisée après fusion : c'est ce qui permet d'attacher une décision à « ce
groupe-là » avant que la jonction ne le rende illisible.

**Les groupes portent leur rang dans la course, puis leur rôle** (`regles-operateur.md` §17,
points 22 et 23) : `1-Leader` ou `1-Leaders`, `n-Chase` pour un groupe entre la tête et le
peloton, `n-Bunch`, `n-Behind` pour un groupe derrière le peloton qui en a encore un derrière
lui, et le tout dernier toujours `n-Last`. Chaque groupe a sa couleur — vert en tête, bleu au
peloton, rouge en queue (point 31) — la même sur sa bulle de l'ovale et sur sa boîte de
timeline, et son **écart** au groupe qui le précède, une seule fois, dans son en-tête.

**État d'un coureur.** En attente, en course, neutralisé, sans transpondeur, retiré, abandon,
disqualifié. Chaque transition est un événement avec tour d'effet. Un coureur sans
transpondeur **reste en course** : le logiciel cesse d'attendre ses passages et le suit par
inférence, tape switches et gestes de l'opérateur.

---

## Vue de piste

L'écran principal montre la piste en ovale avec chaque coureur comme un badge animé en temps
réel, lisible, éditable, et honnête sur ce qu'il sait.

**L'ovale.** La piste à l'échelle, avec les trois boucles et les tape switches à leur vraie
position. Orientation choisie par l'opérateur selon sa place, infield ou cabine.

**Le badge.** Dossard, nation ou équipe, couleur de maillot. Autour du badge, l'état : mesuré
il y a moins d'un demi-tour, déduit, placé à la main, transpondeur muet, neutralisé, sans
transpondeur. Les points du coureur sont lisibles sur le badge ou au survol. **Le statut de
tours n'est affiché ni sur la timeline ni sur le badge** (`regles-operateur.md` §8).

**Le mouvement.** Chaque badge avance à la vitesse estimée de son coureur et se recale à
chaque pointage. Les coureurs d'un même groupe sont dessinés en paquet, dans leur ordre de
passage, **sans jamais se chevaucher** : la lisibilité prime sur la position au mètre près.

**L'inférence des positions.**

| Situation                                                               | Ce que fait le logiciel                                      | Ce que voit l'opérateur                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Passage manqué, coureur vu dans le peloton avant et après               | le place dans le peloton pour ce tour, sans alerte bloquante | badge marqué déduit, journal annoté                                               |
| Passage manqué, pas encore de passage suivant                           | continue son badge au rythme du groupe où il était           | alerte immédiate : transpondeur muet                                              |
| Passage manqué et le tape switch a compté un vélo de plus que la boucle | confirme la présence dans le groupe                          | alerte adoucie *(pas codé)*                                                       |
| Passage manqué et le coureur était en train d'attaquer                  | garde l'écart estimé et le signale comme incertain           | badge incertain, demande de confirmation                                          |
| Deux passages manqués de suite                                          | passe le coureur en transpondeur muet                        | alerte forte, propositions : chute, changement de vélo, confirmer dans le peloton |

**L'édition.** L'opérateur prend un badge et le déplace : dans le peloton, 20 m devant, dans
l'échappée. Le geste devient un événement du journal, l'inférence repart de là. L'affichage et
le classement reposent sur la même estimation, donc une correction corrige les deux.

**Deux affichages de la même chose.** À côté de l'ovale, une bande linéaire déroule la course
comme une ligne : groupes et écarts de gauche à droite, utile quand le peloton occupe tout
l'ovale.

---

## Repères, sprints et éligibilité

Décidé le 24 octobre 2026 avec l'opérateur, écran par écran. Les **règles** d'éligibilité et
de rang sont dans `regles-operateur.md` §6 à §8 ; ce qui suit est l'écran.

Le résultat d'un sprint **existe toujours**, que l'opérateur ait touché l'écran ou non : le
logiciel enregistre l'ordre de passage complet à chaque tour et sait lesquels sont des tours de
sprint.

**Repères permanents.** Tour en cours, tours restants, prochain sprint et tours restants
jusqu'à lui, temps de course, tête de course et sa vitesse. Toujours visibles. À deux tours du
sprint puis à un tour, le champ du sprint passe en surbrillance.

**La carte du sprint est permanente.** Elle occupe la colonne de droite de l'écran, à côté de
l'ovale, pendant toute la course (`regles-operateur.md` §17, points 61, 62 et 79) : hors sprint
elle annonce le prochain et montre la liste de départ entière ; à la cloche elle s'ouvre, et
l'ovale et la timeline restent visibles. Le mode sprint qui masquait l'ovale (24 octobre 2026) a
été remplacé par son dessin du 29 octobre. La carte se ferme d'elle-même deux tours plus tard
quand tout est parti et qu'aucun contrôle photo ne reste ouvert, ou sur *Close* ; un sprint
passé se rouvre depuis la bande des sprints en tête de la carte (point 201).

**La carte du sprint.** En-tête `SPRINT k · ← Lap L →` — les flèches jugent le sprint sur la
ligne précédente ou suivante, **ce qui remplace l'armement**, abandonné. Puis *Manual*,
*Detected order*, *Clear and record*, *Live*, *Send*.

À gauche le classement, **cinq lignes et pas une de plus** : place, dossard, nation, nom,
écart au précédent. **Pas de points dans la carte** : l'opérateur les connaît par cœur. Fond
rouge et icône caméra sous le seuil photo, croix pour retirer, glisser pour déplacer. Un
bouton *Not eligible · n* déplie les coureurs passés mais non classés, avec leur place brute et
↩ pour les classer quand même si le jury en décide ainsi.

À droite la **liste de départ entière**, une seule colonne, **jamais partielle ni défilante**,
triable par dossard ou par nation ; un coureur déjà classé y porte sa place. La place cible est
affichée en grand au-dessus de la liste avec les boutons 1 à 4, ou une case de saisie au sprint
final.

**Deux boutons d'envoi, rien d'autre.**

- *Live* est un **interrupteur**, par sprint, mémorisé pour le suivant. Allumé, chaque place
  part à l'instant où le coureur est lu sur la ligne, dans l'ordre des places : la place n ne
  part que si les places 1 à n−1 sont parties.
- *Send* est l'envoi manuel. Gris tant que rien n'est parti, vert *Sent · h:mm* au clic, puis
  *Send correction* dès que l'ordre change.

Il n'y a **ni mode « contrôle » ni mode « retenir »** : ne pas être en Live, c'est contrôler.
Un bouton « Hold » avait été dessiné puis supprimé comme doublon. **Cinq places** sont
envoyées, points aux quatre premières ; la cinquième sert au logiciel de résultats en cas de
relégation. Le dernier sprint envoie tout le monde. **Une correction repart sous la même
identité de sprint**, pour que les sorties remplacent au lieu de dupliquer.

**Saisie manuelle.** *Manual* ouvre une case unique. Plusieurs dossards séparés d'espaces puis
Entrée : c'est tout l'ordre, affiché et envoyé. Un seul dossard puis Entrée : il prend la place
cible, marquée ▸, et la case se vide pour le suivant. Les deux rythmes se mélangent. Un
dossard inconnu ou déjà placé reste dans la case, en rouge. Même cible pour le double-clic dans
la liste de départ ; le glisser vise la place où l'on lâche.

**Clear and record est le secours.** Si le logiciel s'est emmêlé et n'est plus calé sur la tête
de course, ce bouton vide l'ordre et range chaque passage lu dans l'ordre où il arrive, quoi
que dise le compteur. Le filtre d'éligibilité reste.

**La photo-finish est un signal, pas une commande.** Deux passages à moins du seuil font passer
les lignes en rouge avec une icône caméra, sur toutes les sorties. Si la photo contredit
l'ordre, on glisse les lignes ; un clic sur la caméra lève le drapeau de tout le groupe serré et
une correction part. **Pas de bouton d'échange.** Un écart négatif — un coureur remonté à la
main devant un coureur lu plus tôt — s'affiche tel quel, parce qu'il dit que l'ordre contredit
les temps, mais il ne déclenche pas de drapeau.

**Coureur sans transpondeur.** Décision *No transponder* sur la timeline : dossard en
pointillé, porté par son groupe, déplaçable à la main. À chaque sprint où il est éligible, un
bandeau en tête de la carte le rappelle avec les boutons *1st* à *5th* et *not placed*. Une
place posée d'avance est **tenue, pas envoyée** : elle part quand la place suivante est remplie
par un passage lu — le seul fait qui prouve qu'il est passé — ou sur le petit *Send* de sa
ligne. Les places avant la sienne restent vides jusqu'aux lectures. **Une place tenue est
exacte** : la 3e place posée sur une liste vide reste la 3e.

**Exclure un coureur d'un sprint ne vaut que pour ce sprint** : l'exclusion est photographiée à
l'ouverture et ne se reporte pas au suivant. **Un sprint fermé garde le jugement qu'il a
reçu** ; un sprint ouvert suit la situation tant qu'il n'est pas fermé.

**Ce qui est sorti du périmètre.** L'armement d'un sprint, la question « devant ou derrière » au
passage d'un voisin de groupe (jugée peu claire), le sprint tombé pendant une neutralisation.

---

## Ranger les passages : la méthode du re-rangement

**Le problème.** Si on range les passages par le tour du compteur à l'instant du passage, les
coureurs glissent d'une ligne à l'autre dès qu'ils ne sont plus dans le tour du leader. Si on
les range par leur N-ième passage réel, c'est exact mais inutile au jury.

**La solution retenue.** Chaque ligne correspond au **tour de course tel qu'il est jugé** : un
coureur crédité d'un tour est rangé sur le compte du peloton, et son nombre réel de passages
reste visible sur une pastille. Un échappé crédité d'un tour est donc déjà classé avec le
peloton au sprint suivant.

**Le trou que cela crée.** Un tour gagné ajoute un passage dans une ligne, un tour perdu en
retire un. La marque « tour gagné » ou « tour perdu » n'apparaît qu'**une seule fois**, sur le
passage concerné, et la ligne où un coureur doublé n'a pas de passage porte « lapped, no
crossing » — on voit qu'il n'est pas passé au lieu de se demander où il est.

---

## Les propositions

**Une proposition reste jusqu'à validation ou rejet.** Elle ne disparaît pas parce que la
condition a cessé d'être vraie : sinon elle s'efface avant que l'opérateur ne l'ait vue. Il n'y
a pas de bouton « plus tard ». **On ne propose que ce que les boucles ont mesuré.** Une
proposition ne s'affiche qu'**une fois**, dans le premier groupe concerné.

Le détail de chaque proposition — tour gagné ou perdu, coureur non lu, retour en piste, vélo en
trop, vélo seul — est dans `architecture.md` §5 ; la règle qui la déclenche, dans
`regles-operateur.md`.

**Les groupes préparés.** L'opérateur sélectionne un groupe sur l'ovale pendant qu'il est encore
distinct, **avant la jonction qui le rendra illisible**, et lui attache une action en attente :
tour gagné, tour perdu. Quand le PCP tranche, un clic applique la décision à la liste exacte des
coureurs de ce groupe, avec le tour d'effet. Plusieurs groupes peuvent être préparés en même
temps, un coureur peut être déplacé d'un groupe à l'autre à la main. C'est l'évolution des cases
de groupes remplies à la main dans le logiciel actuel.

---

## Incidents et neutralisations

**Détection d'anomalie.** Le logiciel connaît la vitesse de chaque coureur et de chaque groupe
sur les derniers passages, donc l'heure attendue du prochain pointage. Un coureur absent au-delà
d'une marge calculée **sur sa propre régularité** — 1,5 fois l'écart-type de ses derniers temps
de demi-tour, avec un plancher de 2 s — déclenche une alerte. **Un seul absent : transpondeur
muet probable. Deux ou trois du même groupe : chute probable.** Le tape switch suivant aide à
trancher.

**Qualification.** Dès l'alerte, des options apparaissent sur les badges concernés : chute,
pépin mécanique, autre, fausse alerte. Le choix crée un événement d'incident avec tour d'effet,
et le coureur passe en état neutralisé, avec ses tours de récupération restants affichés et le
tour auquel il doit être de retour.

**Trois issues.**

| Issue                          | Ce que fait le logiciel                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Reprend sa place avec son vélo | aligne son compte de tours sur le groupe réintégré, reprend l'attente de ses passages, ignore les sprints tombés pendant la neutralisation |
| Reprend avec un autre vélo     | passe en sans transpondeur, cesse d'attendre ses passages, le suit par inférence ; propose d'attribuer tout transpondeur inconnu détecté   |
| Ne repart pas                  | statut final avec points et tours acquis, badge retiré de l'ovale, ligne conservée au classement                                           |

**Le compte de tours d'un coureur réintégré est celui de son groupe**, même s'il a physiquement
manqué des passages. Les passages manqués restent dans la couche factuelle du journal.

**Course neutralisée.** Un bouton global : le compteur se fige, les passages continuent d'être
enregistrés mais ne décrémentent plus, les groupes et les statuts de tours sont gelés. À la
relance, le logiciel propose de redonner le sprint tombé pendant l'arrêt.

**Incident dans les 5 derniers tours.** Le logiciel le sait par le compteur et propose
directement le statut final, sans retour.

---

## Décisions des commissaires et effets rétroactifs

Une décision est un événement rattaché au tour où elle s'applique. Il n'y a pas de règle de
retard : le plus souvent l'opérateur, qui scrute le PCP, saisit au tour courant à l'instant où
la décision tombe.

**Exemple du cas tardif.** On est au tour 54, le PCP confirme un tour gagné acquis au tour 52.
Le logiciel montre : statut du coureur remis à 0 dès le tour 52, +20 points, et le sprint du
tour 53 qui change d'ordre parce que tout le peloton redevient éligible. L'opérateur valide ou
ajuste. Le tour d'effet reste modifiable plus tard.

**Décalage d'un tour de sprint.** Quand la coordination entre PCP, starter et lap counter
produit un tour de trop ou de moins, l'opérateur déplace le sprint au tour précédent ou suivant.
Le classement est repris sur l'ordre de passage enregistré à ce tour-là, les points sont
recalculés, rien n'est perdu.

**Retrait pour tours perdus.** Un préréglage par course déclenche une **proposition** quand un
coureur atteint le seuil. Jamais une exécution, même quand le seuil a été annoncé avant le
départ : les commissaires gardent leur discrétion, en particulier dans les derniers tours.

**Statuts.** Chaque coureur porte un statut explicite avec tour d'effet : en course,
neutralisé, sans transpondeur, retiré, abandon, disqualifié, déclassé sur un sprint, averti. Un
déclassement sur un sprint retire le coureur de ce seul sprint et recalcule les points.

**Annulation.** Toute décision peut être annulée ; l'annulation est elle-même un événement du
journal, l'état est recalculé, et **la trace des deux reste**.

---

## Journal à deux couches

**Couche officielle.** Ce qui sort sur les résultats : à l'arrivée tous les coureurs ont le même
nombre de tours, les tours gagnés et perdus sont convertis en points, les statuts sont ceux
décidés par les commissaires.

**Couche factuelle.** Ce qui s'est passé sur la piste, tour par tour, **sans lissage** : le
coureur a physiquement fait 100 passages quand les autres en ont fait 99, il a attaqué au tour
47, l'écart s'est ouvert au tour 48, il a recollé au tour 49, le PCP a validé le tour gagné avec
effet au tour 49.

**Chaque entrée porte** son heure, son tour d'effet, son type, le coureur ou le groupe, son
origine (mesuré, déduit, décidé), son auteur, et pour une déduction les mesures qui la fondent.

| Type d'entrée        | Origine            | Exemple                                                                           |
| -------------------- | ------------------ | --------------------------------------------------------------------------------- |
| Passage              | mesuré             | tour 48, boucle B, dossard 12, 14:31:52.417, signal fort                          |
| Passage manqué       | déduit             | tour 45, arrivée, dossard 46 absent, placé dans le peloton d'après tours 44 et 46 |
| Début d'attaque      | déduit             | tour 47, dossard 12 à 1,2 s devant le peloton, écart en hausse                    |
| Échappée établie     | déduit             | tour 48, dossard 12 à 2,0 s, écart stable sur deux pointages                      |
| Jonction             | déduit             | tour 49, plus de cassure entre le dossard 12 et la queue du peloton               |
| Décrochage           | déduit             | tour 61, dossards 23, 31, 44 à 3,5 s derrière le peloton                          |
| Résultat de sprint   | mesuré puis décidé | sprint 5, tour 50, 7-3-15-12, flag photo sur 3 et 15, confirmé 14:33:10           |
| Décision             | décidé             | tour gagné dossard 12, effet tour 49, saisi tour 51, validé par l'opérateur       |
| Geste de l'opérateur | décidé             | badge 46 déplacé dans le peloton, tour 46                                         |
| Anomalie             | déduit             | tour 62, dossards 23 et 31 absents sur A, attendus depuis 4 s                     |

**Le journal est la preuve.** Face à la réclamation d'un entraîneur sur une éligibilité ou un
résultat de sprint, l'opérateur répond avec les lignes du journal — dates, tours, écarts
mesurés, décision et tour d'effet. Rien ne repose sur sa mémoire.

**Modifier le tour d'effet d'une décision rejoue le journal.** Tout l'aval se recalcule, et la
différence entre l'état actuel et l'état recalculé est affichée **avant** validation.

**Consultation.** Un panneau latéral toujours accessible, filtrable par coureur, par tour, par
type et par origine. Un clic sur un tour montre l'ordre de passage complet de ce tour et la
carte des groupes à ce moment ; un clic sur une décision montre ce qu'elle a changé.

**Le journal est la seule chose à synchroniser** entre le poste primaire et le secondaire :
chacun recalcule le même état, et le secondaire peut reprendre la main sans resynchronisation.
C'est aussi ce qui permet de rejouer une course pour un test.

---

## Transpondeurs

Le logiciel compare en permanence ce qu'il détecte à ce qu'il attend — startlist croisée avec la
table des transpondeurs — et **propose la correction** au lieu de laisser l'opérateur la
chercher. Les règles qui gouvernent ce chapitre sont dans `regles-operateur.md` §10 à §12.

**Check-in au tour de reconnaissance.** Dès que les coureurs montent en piste, chaque passage
sur une boucle est confronté à la liste des transpondeurs attendus.

| Situation                                          | Proposition                                                  |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Transpondeur attendu détecté                       | aucune                                                       |
| Transpondeur attendu absent après un tour complet  | vérifier le vélo du dossard concerné                         |
| Transpondeur inconnu, attribué à aucun partant     | l'attribuer au dossard qui n'a pas de transpondeur détecté ? |
| Transpondeur d'un autre partant sur un second vélo | désigner lequel est le vrai                                  |

L'opérateur regarde la piste, voit que le coureur près de la boucle est bien le bon, et valide
d'un clic. La table est corrigée **pour cette course**, avec trace dans le journal. Plus de
recherche ni d'édition de table en pleine compétition.

**Attention** : le tour de reconnaissance n'est **pas un inventaire**
(`regles-operateur.md` §12). Une lecture prouve qu'un transpondeur fonctionne ; une absence de
lecture ne prouve rien.

**Pendant la course.** Deux passages manqués de suite font passer le coureur en transpondeur
muet, avec alerte forte. Un transpondeur inconnu qui apparaît après un changement de vélo est
proposé au coureur sans transpondeur le plus proche de sa position.

**Bruit et santé des antennes.** Les niveaux de bruit par boucle sont surveillés et une boucle
dégradée est signalée **avant** qu'elle ne produise des passages manqués en série.

---

## Intégrations

**Photo-finish, dans les deux sens.**

- *De la photo-finish vers le chrono* : quand l'opérateur photo a posé ses curseurs et obtenu
  un ordre, il l'exporte ; le chrono le reçoit, l'applique au sprint concerné, lève les flags et
  pousse la correction vers toutes les sorties. L'ordre reçu est une décision du journal,
  origine photo-finish.
- *Du chrono vers la photo-finish* : l'opérateur demande le passage d'un tour à un instant
  donné, et la photo-finish s'y cale grâce à la base de temps commune, sans recherche manuelle
  dans les images. **Le flag posé par le chrono est lui-même une demande** : la photo-finish
  sait quels passages sont à juger et dans quel ordre d'urgence.

**Lap counter.** Reçu en série ou en réseau, **toujours prioritaire** quand il est relié : le
compteur interne s'aligne sur lui, et un écart est seulement signalé, avec les deux valeurs,
jamais corrigé en silence. Sans lap counter relié, l'application passe en mode auto —
décrémenté sur le passage de la tête de course — ou manuel. Dans tous les cas la sortie du
compteur vers les affichages peut être masquée.

**Sorties.** Scoreboard, graphiques TV, site web, live timing. Chaque résultat part avec :
numéro de sprint, tour, ordre, points, flags photo, statut provisoire ou confirmé. Une
correction après coup part sur les mêmes canaux avec la **même identité de sprint**, pour que le
client remplace et ne duplique pas.

---

## Lecture de course

Le logiciel produit en direct de quoi parler de la course, pour l'opérateur, le speaker et la
TV : écarts en secondes et en mètres entre groupes et entre coureurs, classement provisoire avec
ce qu'il manque à chacun, prétendants séparés de peu au classement et ce qui les sépare sur la
piste.

| Moment             | Exemple de ligne                                                                      |
| ------------------ | ------------------------------------------------------------------------------------- |
| Avant-dernier tour | 1 coureur en tête, 4,2 s et 55 m devant un groupe de 6, peloton à 9,8 s               |
| Duel au classement | 12 et 7 à 1 point l'un de l'autre, 12 a 30 m d'avance sur 7 à 3 tours de l'arrivée    |
| Avant un sprint    | sprint 9 dans 1 tour, 23 a besoin de la 2e place pour passer devant 12                |
| Échappée           | 4 coureurs à un demi-tour du peloton, à 18 s de reprendre un tour à vitesse constante |
| Fin de course      | 7 l'emporte si rien ne change, 12 à 2 points avec le dernier sprint doublé            |

**Les lignes sont des données structurées avant d'être des phrases** : les sorties TV et web
reçoivent les champs, pas seulement le texte.

---

## Arrivée et classement final

Le dernier sprint n'est pas un sprint comme les autres, **c'est l'arrivée** : tout le monde est
classé et envoyé, dans la même carte, avec les mêmes gestes.

**Quel passage est l'arrivée.** Elle s'ouvre sur le tour **mesuré** de la tête de course,
comptée dans le tour du peloton une fois ses tours crédités (UCI 3.2.017 ter) ; chaque coureur
encore en course arrive à son passage suivant, et le protocole est complet quand tous ont passé.
Le logiciel retient ce passage pour chacun ; **l'opérateur n'a plus à armer au bon moment.** Une
version antérieure ouvrait l'arrivée sur le compte de tours non crédité et terminait la course
un tour trop tôt (`pitfalls.md` A3).

**Ordre complet.** Chaque coureur en course est classé selon son passage sur la ligne, y compris
un coureur à un ou deux tours, qui peut prendre des points s'il est dans les quatre premiers.
C'est le **classement général** qui le place en bas, grâce à ses tours perdus. **Pas de marque
de tour sur la ligne** : ses points le disent déjà. Les retirés sont listés sous l'ordre, non
classés. L'en-tête compte en clair : `16 started · 1 ABD · 15 to rank · 13 across`, puis
`15 ranked · finish complete` ; un coureur sans transpondeur y est rappelé « to place by hand ».

**Présentation du classement.**

| Rang | Dossard | Nom     | Nation | Points sprints | Tours gagnés | Tours perdus | Points tours | Total | Place au dernier sprint | Statut       |
| ---- | ------- | ------- | ------ | -------------- | ------------ | ------------ | ------------ | ----- | ----------------------- | ------------ |
| 1    | 12      | exemple | SUI    | 22             | 1            | 0            | +20          | 42    | 1                       |              |
| 2    | 52      | exemple | ITA    | 13             | 0            | 0            | 0            | 13    | 3                       |              |
| 16   | 23      | exemple | DEN    | 0              | 0            | 0            | 0            | 0     |                         | ABD · Lap 31 |

**Le nombre de tours gagnés et perdus est affiché même quand les points le disent déjà.**
Départage par la place au dernier sprint. Le nombre de sprints gagnés est disponible dans
l'export. Les points d'omnium antérieurs s'ajouteront dans une colonne séparée.

**Tous les sprints, et les sorties.** Le bouton `ALL` de la carte ouvre tous les sprints courus
en colonnes, l'ordre complet de chacun, les quatre qui marquent, le final doublé (points 209 à
211) ; un clic sur une colonne rouvre le sprint. Chaque message parti vers TV, scoreboard et
web est consigné au journal et dans l'export des sprints : heure, sprint, tour, places, flags,
nature.

**Export : trois fichiers séparés.** Les sprints avec leur détail (JSON), le classement (CSV),
le journal factuel (JSON) — ce dernier servant aux réclamations et à l'analyse. Ce sont des
fichiers ; le flux live vers les sorties est autre chose.

---

## Le moteur de lecture de course

Validé dans `console-course-aux-points.html` et **à reprendre dans l'implémentation réelle** :
passage manqué supposé à l'heure attendue, avec la marge décrite plus haut ; transpondeur muet
suivi à la vitesse de son groupe, borné au groupe où il a été vu ; vitesse toujours mesurée
**entre deux passages réels** ; recalage de tour par vitesse impliquée, jamais derrière le
dernier passage mesuré ; détection de chute par coureurs en retard au même point, confrontée aux
comptes de contacts des tapes ; neutralisation qui gèle le temps de course ; compteur de tours
relié prioritaire, avec recalage.

---

## Décisions prises

Les questions posées à la première rédaction ont été tranchées. Celles qui concernent une
**règle de course** sont dans `regles-operateur.md` et ne sont pas répétées ici ; ce tableau ne
garde que les décisions de produit.

| Question        | Décision                                                                                                                                                                  | Date |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Marge d'alerte  | mesurée sur la régularité propre du coureur, voir « Incidents et neutralisations »                                                                                        | 21   |
| d'anomalie      |                                                                                                                                                                           | oct. |
| Compteurde      | Un lap counter relié est toujours prioritaire. Sans lui, mode auto ou manuel. La sortie peut être masquée dans tous les cas                                               | 21   |
| course          |                                                                                                                                                                           | oct. |
| Retrait à N      | Jamais de retrait sans validation de l'opérateur, quel que soit le préréglage                                                                                             | 21   |
| tours perdus    |                                                                                                                                                                           | oct. |
| Coureur sans    | Rappel de l'absence de transpondeur à chaque sprint où il est éligible à marquer                                                                                          | 21   |
| transpon deur   |                                                                                                                                                                           | oct. |
| Languede        | Anglais ; toute langue supplémentaire bienvenue. Les documents de travail restent en français                                                                             | 21   |
| l'interf ace    |                                                                                                                                                                           | oct. |
| Madison         | Même modèle par équipe de deux, avec le relais comme événement ; second temps                                                                                             | 21   |
|                 |                                                                                                                                                                           | oct. |
| Tempo race et   | Même modèle, autre barème ; troisième temps                                                                                                                               | 21   |
| scratch         |                                                                                                                                                                           | oct. |
| Protocole       | À voir à l'implémentation                                                                                                                                                 | 21   |
| photo-fi nish   |                                                                                                                                                                           | oct. |
| Carte du        | Cinq lignes sans points, liste de départ entière, non éligibles repliés, photo = fond rouge et caméra, glisser pour réordonner. L'ovale masqué pendant le sprint est      | 24   |
|                 | revenu le                                                                                                                                                                 |      |
| sprint          | 29 oct. : la carte est permanente, en colonne de droite, et l'ovale reste visible (`regles-operateur.md` §17, points 62 et 79)                                            | oct. |
|                 |                                                                                                                                                                           | ,    |
|                 |                                                                                                                                                                           | revu |
|                 |                                                                                                                                                                           | le29 |
| Envoi d'un      | Deux boutons : *Live*, interrupteur ; *Send*, envoi manuel, vert une fois parti puis « Send correction ». Ni mode contrôle ni retenue                                     | 24   |
| sprint          |                                                                                                                                                                           | oct. |
| Places envoyées | Cinq, points aux quatre premières ; tout le monde au dernier sprint                                                                                                       | 24   |
|                 |                                                                                                                                                                           | oct. |
| Saisie          | Une case : dossards séparés d'espaces + Entrée = tout l'ordre ; un dossard + Entrée = place cible ▸. Double-clic et glisser depuis la liste de départ. *Clear and record* | 24   |
|                 | en                                                                                                                                                                        |      |
| manuelle        | secours                                                                                                                                                                   | oct. |
| Armement d'un   | Abandonné ; le décalage de la ligne jugée (← Lap L →) le remplace                                                                                                         | 24   |
| sprint          |                                                                                                                                                                           | oct. |
| Arrivée         | Tous classés et envoyés ; un coureur à un tour est classé selon son passage et marque s'il est dans les quatre premiers ; le classement général le place en bas ; retirés | 24   |
|                 | non classés                                                                                                                                                               | oct. |

**Ce qui reste à trancher est dans `regles-operateur.md` §15**, en une seule liste.
