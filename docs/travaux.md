# Les travaux à faire

**La liste de ce qui reste à construire, et de ce qui est cassé.** Ouverte le 28 octobre
2026, parce qu'il n'en existait aucune : jusque-là les travaux en attente étaient dispersés
entre cinq documents, chacun sous la forme d'une remarque au passage.

Ce fichier ne contient **ni règle ni mesure** : une règle est dans `regles-operateur.md`, un
chiffre dans `mesures.md`. Ici on dit seulement **ce qui n'est pas fait, et à quoi on saura
que c'est fini**.

**Ce fichier n'est pas une liste de souhaits.** Rien n'y entre que l'opérateur n'ait demandé
ou qui ne soit un écart constaté entre sa règle et le code. Une idée que personne n'a
demandée n'a pas sa place ici.

---

## Ce qui attend une décision de l'opérateur, pas du code

Dix points, dans `regles-operateur.md` §15. **Ils ne sont pas recopiés ici.** Tant qu'ils ne
sont pas tranchés, le travail correspondant n'existe pas : coder une réponse à sa place est
l'erreur `pitfalls.md` A12.

Deux d'entre eux bloquent un travail de cette liste et sont signalés à l'endroit voulu.

---

## 1. La mise en place et le tour de lancement

**Demandé le 27 octobre 2026. Rien n'est codé** : ni la phase dans le simulateur, ni la
vérification des transpondeurs, ni les propositions. C'est le plus gros poste de la liste, et
il est en attente depuis plusieurs sessions.

La règle, mot pour mot, est dans `regles-operateur.md` §12 — le déroulé, l'exigence
d'infaillibilité, et les cinq précisions qui changent la lecture de la phase. **La lire avant
de dessiner quoi que ce soit** : trois de ces précisions retournent complètement ce qu'on
croit mesurer.

### Ce qu'il faut construire

| | Travail | Fini quand |
|---|---|---|
| a | **La phase elle-même dans le simulateur** : montée sur la piste près de Pursuit A, tour lent, arrêt derrière la boucle Finish en deux files, coup de sifflet, tour de lancement, coup de pistolet | On peut rejouer la phase entière et voir ce que les boucles lisent à chaque étape |
| b | **L'exploitation des passages sur Pursuit A à la montée** | Un transpondeur lu à la montée est confirmé, et l'écran le dit |
| c | **L'écran de vérification des transpondeurs**, avec les quatre cas du tableau de `concept.md` (attendu détecté, attendu absent, inconnu, transpondeur d'un autre partant). Il répond à **« qui est confirmé ? »**, pas à « qui manque ? » — voir le piège 1 ci-dessous | Chaque cas produit sa proposition, l'opérateur l'approuve d'un clic, la table est corrigée pour la course et le journal en garde la trace |
| d | **Le départ proposé au franchissement de la boucle Finish** à la fin du tour de lancement | Le logiciel propose l'instant du départ ; l'opérateur confirme ou corrige |
| e | **Les trois clics de l'opérateur** dans cette phase, et rien de plus | La phase se mène en trois gestes |
| f | **Oublier le clic du tour de lancement ne doit pas empêcher la course de partir** | On lance une course sans avoir cliqué, et elle part correctement |

### Les trois pièges de cette phase, déjà écrits

Ils viennent des précisions du 27 octobre et ne sont **pas** des choix d'implémentation :

1. **Le tour lent n'est pas un inventaire.** Les coureurs roulent souvent sur le béton plat à
   l'intérieur de l'ovale, que ni les boucles ni les tape switches ne couvrent. Une lecture
   prouve qu'un transpondeur marche ; une absence de lecture ne prouve rien. Un écran qui
   affiche « 3 transpondeurs manquants » pendant le tour lent est faux.
2. **À l'arrêt, le matériel est incertain.** « Un transpondeur sur un vélo pas en mouvement
   peut soit détecté une fois, soit pas détecter. » Rien ne se conclut de l'attente avant le
   départ.
3. **Il n'y a pas d'heure limite pour le verdict.** La vérification n'est pas une barrière
   avant le coup de pistolet : c'est un état qui se précise et qui reste corrigeable en pleine
   course.

Conséquence : **le premier moment où une absence de lecture devient une information est le
tour de lancement**, parce que c'est le premier moment où tout le monde est certainement sur
la piste et franchit toutes les boucles. Tout l'écran se construit autour de cette asymétrie.

### Avant de coder

L'opérateur veut **voir les écrans proposés et les critiquer tour par tour avant toute
ligne de code** (`regles-operateur.md` §14). Le premier livrable de ce poste est donc une
proposition d'écrans, pas un commit.

---

## 2. Le scénario de test qui exerce la conséquence sur le rang

La conséquence sur le rang (`regles-operateur.md` §7) et les lignes grisées (§8) **ne sont
vérifiées que sur cas forcé** : la course de référence ne les exerce jamais, parce qu'aucune
de ses fenêtres d'inéligibilité ne tombe sur l'ouverture d'un sprint. Les chiffres sont dans
`mesures.md` §6 et §7.

**Le travail** : construire un second scénario où les BIB 4 et 11 décrochent assez tôt pour
se trouver entre le peloton et la ligne à l'ouverture d'un sprint. Il exercerait les deux
règles d'un coup.

**Fini quand** le scénario se charge depuis l'onglet Files comme la course de référence, et
que `mesures.md` porte ce qu'il donne.

---

## 3. `S.headLap`, calculé et lu par personne

Écrit à chaque image dans `computeGroups`, plus aucun appelant ne le lit depuis la build 53.
Il a servi de caution à un seuil inventé — c'est `pitfalls.md` A10, et A9 raconte ce que
cela a coûté.

**Le travail** : le retirer, ou le rebrancher sciemment. Les deux sont acceptables ; le
laisser tel quel ne l'est pas, parce qu'un calcul qui traîne finit par justifier une règle.

---

## 4. L'alerte de passage manqué adoucie par le tape switch

Décrit dans `concept.md` (tableau de l'inférence des positions), **pas codé** : quand un
coureur n'est pas lu mais que le tape switch a compté un vélo de plus que la boucle, sa
présence dans le groupe est confirmée et l'alerte devrait s'adoucir. Tout ce qu'il faut est
déjà mesuré par `tapeCount()`.

---

## 4 bis. Ce que l'écran de course montre sans que rien ne le serve

Proposé et codé à la build 92 sur la demande du 29 octobre 2026 (`regles-operateur.md` §17).
Deux commandes sont à l'écran sans avoir de source derrière elles, et c'est assumé pour le
moment (`cas-de-course.md`) — mais ce n'est pas fini :

| | Travail | Fini quand |
|---|---|---|
| a | **L'impulsion externe du départ.** « faire en sorte qu'une impulsion externe (comme un bouton pressoir) connectée à l'appli trig le départ de la course » | Une entrée extérieure déclenche le départ, et l'écran le montre comme s'il venait du bouton |
| b | **Le départ de course distinct du `Play` du simulateur.** Aujourd'hui le même geste lance la course et l'horloge ; le tour de lancement, qui sépare les deux, n'est pas construit (§1 ci-dessus) | `START` part au coup de pistolet, et les coureurs peuvent rouler avant |
| c | **La provenance `LAP COUNTER`.** Elle s'affiche, mais le lap counter relié n'est pas simulé (§5 ci-dessous) | Le nombre affiché vient vraiment du compteur, et un désaccord est signalé avec les deux valeurs (`regles-operateur.md` §13) |
| c bis | **La valeur du lap counter.** Elle s'affiche, mais aucun compteur relié ne l'alimente : elle reprend le comptage de l'application, donc les deux provenances sont toujours d'accord tant que l'opérateur ne compte pas à la main | Le compteur relié donne sa propre valeur, et un désaccord qu'il n'a pas provoqué lui-même se voit |
| d | **La retenue à l'export.** Le bouton bascule et la valeur se barre, mais les exports sont des fichiers qui ne la lisent pas encore (§5 ci-dessous) | Aucune sortie ne porte les tours restants quand l'opérateur les retient |

---

## 4 ter. Refaire les annotations de l'ovale

Annoncé par l'opérateur le 29 octobre 2026 : « Pour la suite il va falloir refaire complètement
les annotations qui suivent les coureurs sur l'ovale » (`regles-operateur.md` §17).

**Le déblaiement est fait** à la build 93 : plus aucun texte n'est tracé sur l'ovale. Ce qui a
été retiré est listé dans `architecture.md`.

**Ce que l'intérieur de l'ovale porte** est tranché depuis la build 109 : la rangée du départ
et le champ `LEADER`, et rien d'autre (`regles-operateur.md` §17, point 43).

**Ce qui vient ensuite n'est pas défini** : ni ce qu'une annotation doit dire, ni où elle se
pose, ni quand elle apparaît. Rien ne se code avant qu'il le dise ou qu'un écran lui soit
proposé et approuvé (`pitfalls.md` A12, `regles-operateur.md` §14).

---

## 5. Ce que le prototype ne simule pas du tout

Aucun de ces points n'est un bug : ils n'ont jamais été construits.

- **La chute** et, avec elle, la neutralisation d'un coureur et ses trois issues.
- **Le lap counter relié**, et donc le recalage du compteur sur lui.
- **La réception de la photo-finish.** Le flag part du chrono et se lève à la main ; le retour
  n'existe pas.
- **Le sprint tombé pendant une course neutralisée.**
- **La liste de départ réelle** : couleurs et NOC sont en dur dans le fichier.
- **Les exports sont des fichiers**, pas un flux vers TV, scoreboard et web.
- **La Madison, la course tempo et le scratch.**

---

## 6. Le simulateur et l'application

Demandé par l'opérateur le 28 octobre 2026.

### a. Supprimer et renommer une course dans l'onglet Files

> « dans l'onglet Files il faut pouvoir supprimer des courses et renommer les courses »

**Constaté dans le code à la build 68** : la suppression **existe** (`data-del` est traité) mais
le gabarit d'une ligne de course ne dessine qu'un bouton *Load* — il n'y a donc aucun moyen de
l'atteindre. Le renommage n'existe pas du tout.

**Fini quand** chaque ligne de l'onglet Files porte de quoi supprimer et de quoi renommer, et
que les deux survivent à un rechargement de la page.

✅ **Fait à la build 75.** Chaque ligne porte *Load*, *Rename* et *Delete*. Le renommage se
fait **sur place** — le nom devient un champ, *Save* et *Cancel* prennent la place des trois
boutons, Entrée valide, Échap annule, un nom vide est refusé sans rien dire. La suppression
**demande deux clics** : le bouton devient *Delete?* en rouge, le second clic efface. Aucune
fenêtre de dialogue. La course de référence est une ligne comme les autres (§16 des règles) :
elle se renomme, elle s'efface, et l'un comme l'autre tiennent au rechargement — vérifié.

### b. Trier la liste des coureurs

> « il faut pouvoir trier la liste des coureurs par BIB, NOC alphabétique, ou nom
> alphabétique. un clic sur l'en-tête inverse l'ordre »

✅ **Fait à la build 83.** Les trois en-têtes — **BIB**, **Nat**, **Name** — se cliquent. Un
clic trie la liste sur cette colonne ; un second clic sur le même en-tête inverse l'ordre.
BIB trie par numéro, Nat et Name alphabétiquement. Tant qu'aucun en-tête n'a été cliqué, la
liste reste dans l'ordre de la liste de départ.

C'est un **ordre d'affichage** et rien d'autre : `S.riders` n'est jamais réordonné, parce que
c'est lui qui porte la course. Vérifié qu'un ordre donné depuis une ligne va bien au coureur
de cette ligne, liste triée par nom à l'envers : le +lap de la troisième ligne est parti au
BIB 70, et c'est la jauge de cette ligne-là qui s'est allumée.

### c. Une course de 24 coureurs

> « il faut pouvoir créer une course avec 24 coureurs max. L'app doit le permettre »

24 est le maximum d'un peloton (`regles-operateur.md` §5). **Constaté à la build 68** :
`addRosterRider()` ne contient **aucune limite** de nombre — ce qui empêche d'arriver à 24 est
donc ailleurs, et n'a pas été cherché.

**Fini quand** une course de 24 coureurs se crée, se joue de bout en bout et s'affiche
correctement — timeline, ovale et carte de sprint.

---

## 7. À déboguer

### a. Le scénario de la course de référence repart sur une course neuve

Signalé par l'opérateur le 28 octobre 2026, mot pour mot :

> « quand je commence une nouvelle course, à partir du lap 4 ou 5 la vitesse des coureurs 12,
> 4 et 11 est encore et toujours automatiquement (comme dans la course de référence).
> Peut-être que le système ne me laisse pas créer de nouvelle course et redémarre toujours sur
> le modèle de la course de référence ? Si c'est le cas il ne faut pas que la course de
> référence soit une course de référence, il faut que ce soit une course que l'on peut rejouer
> comme les autres. »

**Corrigé à la build 74**, non pas en colmatant le drapeau mais en supprimant la chose :
`SCRIPT`, `useScript` et le mode `away` n'existent plus. La course de référence est une
course enregistrée ordinaire — une configuration et **deux ordres sur l'horloge** —, et plus
rien dans le code ne la connaît au-delà du fait que l'onglet Files l'offre toujours. Le détail
est dans `architecture.md` §15, les mesures dans `mesures.md` §15.

Avant d'y toucher, deux questions ont été posées à l'opérateur ; ses réponses sont au §16 des
règles et ont décidé du reste. Les trois tours que les coureurs 4 et 11 passent dans la roue
du 12 sont **une règle**, et le moyen est le sien : leur vitesse s'ajuste sur celle du 12.
`↺` **Restart rejoue la course chargée** ; un **bouton +** ouvre une course neuve ; un **point
rouge REC** s'allume en lecture et s'éteint en pause.

✅ **Les trois critères sont remplis à la build 75.** Une course neuve ne bouge plus toute
seule, quelle que soit la course chargée avant ; la course de référence est une ligne comme
les autres dans l'onglet Files, avec sa durée ; et « le poste 6a s'applique à elle aussi » —
elle se renomme et s'efface comme les autres, et l'un comme l'autre survivent au
rechargement. **Ce poste est clos.**

À la build 75 elle a quitté le code pour de bon : elle n'y est plus qu'un **modèle de
départ**, déposé dans la liste enregistrée la première fois que le prototype s'ouvre, et plus
jamais relu ensuite.

### b. Deux étiquettes de l'ovale sortent du cadre

**Constaté à la build 69**, en mesurant le dessin, pas signalé par l'opérateur.

Quand le leader et son groupe sont dans le **virage de gauche**, deux étiquettes sont
tracées à gauche du cadre et se retrouvent coupées : « LEADER · BIB n » et le nom du groupe,
par exemple « Break 1 · 1 · lap gained? ». Le `viewBox` de l'ovale commence à x = 0 ; les
deux textes sont posés à x = −24 et x = −48.

**Ce n'est pas nouveau.** La build 68 les posait déjà à x = −20 et x = −44 au même instant
de course : la largeur de piste de la build 69 ajoute 4 unités, elle n'a pas créé le défaut.

**Pour le reproduire** : charger la course de référence, la jouer jusqu'au **tour 11** — BIB
12 est alors seul en échappée dans le virage de gauche.

**Fini quand** aucune étiquette de l'ovale n'est tracée hors du cadre, à aucun moment de la
course de référence.

### Le reste

Les bandes de tape dessinées du mauvais côté de la piste — un poste que ce fichier a porté
le 28 octobre 2026 — n'ont plus d'objet : l'opérateur a demandé le même jour que **les tape
switches ne soient pas dessinés du tout** (`regles-operateur.md` §9). Ils restent comptés.

Les deux boucles de poursuite pas en face l'une de l'autre sur l'ovale — le poste que ce
fichier portait jusqu'au 28 octobre 2026 — sont **corrigées à la build 69**, en même temps
que la forme de l'ovale et sa largeur, que l'opérateur a tranchées le même jour
(`regles-operateur.md` §9). La cause était ailleurs que là où ce fichier la cherchait :
c'est `pitfalls.md` A14, et les chiffres sont dans `mesures.md` §14.

Aucun autre bug connu au 28 octobre 2026. La course de référence tourne de bout en bout sans
erreur de console, les deux propositions de tour tombent aux instants attendus, les quatre
sprints sont jugés et le classement sort (`mesures.md` §12, §13 et §14).

Les écarts connus entre le code et la règle ne sont **pas** ici : ils sont dans le tableau de
`cas-de-course.md`, chacun avec son statut et sa date. Au 28 octobre 2026 ce tableau ne porte
aucune non-conformité.

**Si un bug apparaît, il vient ici**, avec ce qu'on a vu, le build, et comment le reproduire —
pas dans `pitfalls.md`, qui ne garde que les erreurs **comprises et corrigées**.

---

## 8. Les vitesses du simulateur

Signalé par l'opérateur le 28 octobre 2026 après essai. Ses mots et ses décisions sont au §16
des règles ; les mesures sont au §17 de `mesures.md`.

### a. Le peloton ralentissait tout seul

✅ **Corrigé à la build 76.** Le peloton se repérait sur **son propre milieu**, qui se déplace
dès qu'un coureur le quitte en emportant sa place ; ceux qui restaient corrigeaient alors un
écart que personne n'avait ouvert, et ne le rattrapaient jamais. Mesuré : allure demandée
15,0 m/s, peloton à **14,888 m/s** à partir de la 50ᵉ seconde, définitivement. Le peloton se
repère maintenant sur un point qui roule **l'allure affichée**, posé au départ et que rien
d'autre ne fait bouger.

### b. « Sync all to bunch pace »

✅ **Corrigé à la build 76.** Le bouton fait ce que dit son libellé : tous les coureurs
roulent à la vitesse du peloton, chacun **là où il est**, sans être déplacé ni remis en place.

### c. Les flèches qui ne menaient nulle part

✅ **Corrigé à la build 76.** ↑ est éteinte pour un coureur du groupe de tête, ↓ pour un
coureur que personne ne suit. Elles ne répondaient rien du tout avant.

### d. La progression d'un ordre

> « je voudrais aussi que quand on utilise les touche haut, bas, lap+ et lap- ces boutons
> s'allument mais doivent afficher une progression jusqu'à l'accomplissement de leur mission,
> et une fois la mission accomplie ils s'éteignent et la vitesses de leurs coureurs se
> synchronise sur le groupe qu'ils cherchait à atteindre (et qu'ils ont atteint) »

La maquette a été proposée le 28 octobre 2026, avec deux formes au choix et la question de la
vitesse d'arrivée. L'opérateur a pris la **jauge dans le bouton** et la **vitesse du groupe
réellement rejoint** (§16 des règles).

✅ **Codé à la build 77.** Le bouton allumé se remplit sur la distance qui reste à couvrir,
s'éteint quand la mission est accomplie, et le coureur prend alors la vitesse du groupe qu'il
vient de rejoindre et la tient tant que ce groupe existe. Mesuré au §18 de `mesures.md`.

**Ce qui n'est vrai que pour ↑ et ↓.** Pour `+lap` et `−lap`, le groupe rejoint est le
peloton, et le coureur y revient **en une trentaine de secondes** au lieu d'instantanément :
il doit rouler jusqu'à sa place dans le peloton, et sa vitesse descend progressivement vers
l'allure pendant ce temps. Le lui donner instantanément a été essayé et **retiré** : en le
laissant à l'endroit exact où il a bouclé son tour, le logiciel proposait la perte de tour des
BIB 4 et 11 au tour 14 alors que la simulation ne la constate qu'au tour 25 — 195 secondes
d'avance. À confirmer avec l'opérateur (`regles-operateur.md` §15).

---

## 9. Rejouer une course de la liste

Signalé par l'opérateur le 28 octobre 2026 : « Je ne parviens pas à rejouer celles de la
liste. » Ses mots et ses décisions sont au §16 des règles, les mesures au §19 de
`mesures.md`.

✅ **Corrigé à la build 78.** Une course chargée se rejoue et **n'enregistre rien**. Avant,
elle était rejouée et réenregistrée en même temps : chaque Load déposait une copie en haut de
la liste, et au bout de trois essais l'opérateur chargeait des copies au lieu de sa course.

✅ **Une course menée à la main s'enregistre toute seule**, dès le premier ordre donné, et se
tient à jour dans la liste à chaque ordre, à chaque pause et à l'arrivée. Il n'y a rien à
cliquer, et pas de bouton *Save* : « Il faut soit qu'elle s'enregistre toute seule soit un
bouton "Save" ».

✅ **L'écran dit laquelle des deux choses se passe** : le point rouge *REC* pour une course
que l'opérateur mène, « Playing · *nom* » pour une course de la liste qu'on rejoue. Jamais les
deux.

✅ **Les symboles Play et Pause sont dessinés**, plus écrits : ils sont au centre de leurs
boutons.

✅ **Chaque course porte un numéro** (build 79), visible sur sa ligne, et la relecture affiche
« Playing race *x* » en #1CC634. Le numéro est **celui de la course**, pas son rang dans la
liste : une course le garde quand une autre est effacée au-dessus d'elle ou quand une
nouvelle la repousse vers le bas, pour que « Playing race 3 » désigne toujours la même course.
Si l'opérateur voulait le rang dans la liste, c'est une ligne à changer.

✅ **« PLAYING RACE *x* » s'écrit d'une seule taille, en majuscules** (build 80). Le numéro
était à 14 px contre 11 px pour les mots : il dépassait de la ligne.

✅ **Les drapeaux couvrent 205 nations** (build 87), contre 16 jusque-là. Un code NOC inconnu
garde le rectangle gris.

✅ **Les réglages du simulateur sont gardés** (build 86) : liste de départ, piste et appairage
des transpondeurs. Ils survivent à *New* et au rechargement de la page.

✅ **Le tri est reporté sur la vue Start list** (build 85) : l'ordre choisi sur les en-têtes
de la vue Simulation est celui des deux vues. L'édition et le retrait d'un coureur continuent
de viser le bon : chaque ligne garde son rang d'origine dans la liste de départ, quel que soit
l'ordre dans lequel on la regarde.

✅ **La ligne Pace est passée sous la liste des coureurs** (build 84), après le dernier
participant. Les deux commandes marchent au même endroit qu'avant : le pas de 0,1 m/s sur
*Pace*, et *Sync all to bunch pace* qui arrête les ordres en cours.

✅ **Le champ est de grandeur fixe** (build 82) : 120 px, de la course vide à la relecture,
sans jamais bouger de place.

✅ **« REC » et « PLAYING RACE *x* » sont un seul champ** (build 81). En deux champs, celui
qui ne s'affichait pas gardait quand même sa boîte — 39,3 px retenus pour rien — et la ligne
de l'horloge sortait 48 px plus large que celle du transport.

✅ **Les boutons ne se chevauchent plus** (build 81). C'était **ça**, le défaut que l'opérateur
signalait depuis la build 78 : les huit boutons demandaient 476 px pour 460, les trois groupes
étaient écrasés et leurs boutons débordaient **sous leurs voisins** — ❚❚ sous ×1 de 12,3 px,
×16 sous Replay de 16,6 px. Un symbole paraît décentré quand le bouton d'à côté lui recouvre
un bord. Sur sa décision, **Replay et New sont passés sur la ligne de l'horloge**.

✅ **Les symboles de la barre de transport sont centrés sur leur encre** (build 80), vérifié
**simulateur déplié**, comme l'opérateur l'a demandé. Ce qui tenait le défaut en vie : la
correction était mesurée au démarrage, **avant que la police soit chargée**, donc sur les
lettres d'une police de secours — elle poussait « ×4 », « Replay » et « New » de 0,9 px vers
la gauche, c'est-à-dire qu'elle **créait** le décalage qu'elle devait corriger. La mesure
attend maintenant `document.fonts.ready`.

---

## Comment tenir cette liste

1. **Un poste entre ici quand l'opérateur l'a demandé**, ou quand on constate un écart entre
   sa règle et le code.
2. **Un poste dit à quoi on saura que c'est fini.** Sans cela ce n'est pas un travail, c'est
   une intention.
3. **Un poste sort d'ici quand c'est codé et mesuré.** L'opérateur l'a posé en règle le
   28 octobre 2026 : « lorsque ces points seront implémentés il faudra que tu mettes à jour
   les docs en conséquence ». Donc, dans le même tour que le code : la ligne de
   `cas-de-course.md` passe conforme, les chiffres vont dans `mesures.md`, le code se décrit
   dans `architecture.md`, l'erreur comprise va dans `pitfalls.md`, et **le poste disparaît
   d'ici**. On ne garde pas d'historique dans ce fichier — il est dans `mesures.md` et dans
   `pitfalls.md`.
4. **Ce qui attend une décision de l'opérateur reste dans `regles-operateur.md` §15**, jamais
   ici.


## 10. La « place suivante » compte au-delà des places qui comptent

**Constaté en jouant quatre sprints, le 29 octobre 2026**, à la demande de l'opérateur
(« essaie peut-être d'enregistrer quelques sprints et tu verras toi même ce qui est confortable
et ce qui ne l'est pas »).

La rangée `NEXT PLACE` annonce **6th, 8th, 5th, 7th, 10th, 12th** selon les sprints, alors que
la carte ne montre que **cinq places** et que les boutons n'offrent que `1st` à `4th`. Le
champ compte les positions de l'ordre mesuré **complet** -- tous les coureurs lus sur la
ligne -- et non les places qui rapportent des points.

Deux lectures possibles, à trancher par l'opérateur :

- **la carte juge cinq places** : la place suivante ne devrait jamais dépasser la cinquième, et
  quand les cinq sont prises, le champ devrait le dire plutôt qu'annoncer une douzième place ;
- **la carte suit tout l'ordre de passage** : alors ce sont les boutons qu'il faut compléter,
  et la liste de départ qui affiche déjà des rangs jusqu'au onzième est cohérente.

**Rien n'est codé en attendant.** Le sprint final n'est pas concerné : il classe tout le
peloton, et la place suivante y est juste.


## 11. Le déclencheur d'inéligibilité — **construit et vérifié, build 147**

Quatre tentatives le 29 octobre 2026 : deux coureurs lâchés pendant quarante tours, deux
coureurs privés d'un tour par le bouton `−1 lap`, deux coureurs lancés assez vite pour en
prendre un, et une course menée jusqu'au sprint final. **`S.inelig` est resté vide dans tous
les cas** : les attardés sont absorbés par le peloton au moment où ils seraient devant lui.

**Le scénario a été construit le même jour** et il fonctionne : la recette est dans
`mesures.md` §50. L'erreur des quatre tentatives était d'attendre que la fenêtre
d'inéligibilité tombe d'elle-même sur un sprint ; il faut **amener le sprint sur la fenêtre**,
avec la flèche ← de la carte, puis couper `Live` et appuyer sur `Clear and record` pour que le
sprint reste ouvert jusqu'au passage du coureur à un tour.

La pastille `no pts` de la timeline, le suffixe `· NO PTS` du badge de l'ovale, la ligne grisée
sans rang et le compteur `Not eligible` sont donc **vérifiés en course**, et non plus en
apparence. Le manque signalé par `mesures.md` §6 et `travaux.md` §2 depuis la build 53 est
comblé.


## 12. La carte de sprint en trois colonnes — **livrée, build 148**

L'opérateur a redessiné la carte le 29 octobre 2026, par-dessus une capture, et ses règles sont
consignées dans `regles-operateur.md` §104 à §109. Ce qui est en place :

- **trois colonnes** : l'ordre, les coureurs, les commandes. Plus de pied de carte ;
- **aucune colonne souple vide** : la ligne de l'ordre porte place, dossard, nation, écart calé
  à droite et ses deux icônes ; la liste porte dossard et nation, sans colonne de rang ;
- **les commandes dans leur colonne**, dans l'ordre voulu : tour jugé, envoi, source de
  l'ordre, place suivante, saisie manuelle ;
- **les coureurs sans transpondeur** dans la bande libre, sous la saisie manuelle, avec leurs
  cinq places et sans `not placed` ;
- **`Not eligible` au bas de la colonne**, puisque c'est une commande et non une ligne de
  classement ;
- la carte fait **500 px à 1440** et prend sa largeur sur l'ovale, avec l'accord de
  l'opérateur.

Mesures et contrôles : `mesures.md` §51. Les trois pièges nés de ce travail : `pitfalls.md`
D24, A13 et A14.

**Ce qui reste décidé mais non remis en cause** (« laisse comme ça », 29 octobre 2026) : le
titre `SENDING` au-dessus de `Live` et `Send`, la place suivante écrite en petit dans le titre
de son pavé, les boutons `1st` à `4th` même quand la place annoncée dépasse la quatrième (voir
§10, toujours ouvert), et la disparition du pavé `Judged on` au sprint final.

**Non modifié au sprint final** : la place suivante y reste un champ libre, comme avant, car
il faut pouvoir viser n'importe quel rang jusqu'au vingt-quatrième. La maquette montrait les
quatre boutons ; les remplacer aurait retiré une possibilité que personne n'a demandé de
retirer.

---

## 13. Les trois points de design qu'il a tranchés le 31 octobre 2026

Ils viennent de `audit-ux.md` section B, reposés un par un et tranchés le même jour. Ses mots
sont dans `regles-operateur.md` §17, points 136, 138, 139 et 140 — **ils ne sont pas recopiés
ici**. Les trois sont **dessinés et approuvés, pas codés** : le prototype est à la build 155.
Le point F a été refusé par lui et ne laisse aucun travail ; le point B est rouvert et attend
son choix entre ses trois options, donc il n'entre pas dans cette liste.

### 13a. La proposition qui attend passe en orange

Une carte de proposition en attente prend l'orange du champ du prochain sprint, et **le champ
du sprint redevient bleu pendant ce temps**. Le traitement existe déjà — c'est `.ifb.hot`,
posé par `syncInfield` à deux tours du sprint.

**On saura que c'est fini quand** : sur la course de référence, à l'apparition de la
proposition « Lap gained? · BIB 12 », la carte est orange et le champ `SPRINT` est bleu ; dès
qu'elle est validée ou rejetée, la carte disparaît et le champ reprend son orange s'il est
encore à deux tours ou moins.

### 13b. Les petits textes gris s'éclaircissent, et les phrases quittent les capitales

Deux choses dans le même poste. Le jeton `--dim` monte au premier gris qui passe 4,5 : 1 sur
les trois fonds de la page — la valeur et les mesures sont dans `mesures.md` §31. Et les
**phrases** passent en minuscules : l'indice d'onglet, la raison d'inéligibilité, les notes du
registre. **Les en-têtes de colonne gardent leurs capitales.**

**On saura que c'est fini quand** : aucune règle de `styles.css` ne porte plus l'ancien
`--dim`, et les trois endroits nommés ci-dessus se lisent en minuscules pendant que `BIB`,
`NAME`, `NOC` et `GAP` restent en capitales.

### 13c. Le panneau de l'ovale ne garde que ce qui se lit en course

Restent dans le panneau : l'horloge, `LAP`, `TO GO`, `LEADER` et le prochain sprint. Partent
vers **la barre du haut** : la paire `AUTO` / `LAP COUNTER` et ses boutons de choix, le bascule
`M`, les pas `−` / `+`, `ARM START` et `ARM FINISH`.

**Attention, trois choses à ne pas casser** : les boutons `SET NEXT AS LEADER` ne bougent pas
et continuent de fixer le plafond du réglage de l'ovale (§17 point 112) ; le badge du sprint et
le `LAP 21 / 40` restent dans l'ovale, il l'a dit deux fois ; et la double confirmation du faux
départ doit survivre au déménagement de `ARM START`.

**On saura que c'est fini quand** : le panneau ne porte plus que cinq champs, la barre du haut
porte les commandes sorties sans rien perdre d'autre, et la course de référence se lance et
s'arrête depuis la barre comme elle le faisait depuis l'ovale.

---

## 13 bis. Les trois postes du §13 sont livrés — **build 159, 31 octobre 2026**

Les trois sont codés et vérifiés dans la page (`architecture.md` §34, `mesures.md` §33) :

- **13a** — la carte d'une proposition de tour passe en ambre tant qu'elle attend, et le champ
  du prochain sprint redescend en bleu pendant ce temps. Vérifié aux deux moments : tour 8 sans
  proposition, champ ambre ; tour 40 avec proposition, carte ambre et champ bleu.
- **13b** — `--dim` éclairci, et l'indice d'onglet sorti des capitales. C'était la seule phrase
  en capitales de l'écran.
- **13c** — le panneau de l'ovale réduit à cinq champs et 64 px ; `ARM START`, `ARM FINISH` et
  la paire de provenances dans la barre du haut. Vérifié à la souris depuis leur nouvelle
  place : les cinq commandes répondent.

**Ce que ces trois postes n'ont pas touché, et qui tient toujours** : le point 9 de
`audit-ux.md` — `LAP COUNTER` affiche encore le compte de l'application, puisque
`counterValue()` le recopie. Le déménagement n'a pas changé ce qu'il montre, seulement où il
est. Le point reste entier dans la liste A.

---

## 14. Créer un groupe au-dessus de la timeline — **constaté, décision reportée**

Sa demande et ses mots sont dans `regles-operateur.md` §17 point 151 ; ils ne sont pas recopiés
ici. Ce qui a été **constaté** et **mesuré** est dans `mesures.md` §34.

**L'état** : les deux bandes « new group » reçoivent bien le dépôt, mais la bande choisie n'a
aucun effet — `z.dataset.newgroup` est lu et jamais transmis, et le groupe se range d'après la
position mesurée de ses coureurs. **La taille de la bande, elle, est corrigée** (build 160) ;
c'est la seule partie livrée.

**Pourquoi c'est en attente et non en cours** : donner une place à un groupe demande une
position que le logiciel n'a pas. Pour un coureur sans transpondeur le mécanisme existe déjà —
`S.noTpRec`, qui le porte seul à sa vitesse. Pour un coureur que les boucles lisent trois fois
par tour, toute place posée à la main est écrasée à la lecture suivante. Sa vraie demande — une
course où **personne** ne porte de transpondeur, et où la timeline est entièrement la sienne —
est une pièce à dessiner avant d'être codée. Il a répondu « On remet à plus tard » le
31 octobre 2026.

**On saura que c'est fini quand** : il aura tranché la forme, et pas avant. La partie « poser un
groupe où on veut » est, elle, livrée au §15.

---

## 15. Le groupe posé à la main — **livré, build 161**

Sa règle est au point 153 de `regles-operateur.md`, la planche qu'il a approuvée est
`maquette-groupe-force.html`, le code est dans `architecture.md` §36 et les mesures dans
`mesures.md` §35.

**Livré** : un groupe s'attrape par son en-tête et se pose sur une bande « new group » ; il y
reste ; il porte `by hand` ; la bande du mode compte les groupes posés et `Back to automatic`
rend toutes les places à la mesure.

**Ce que cela règle du §14** : sa demande du point 151 — créer un groupe **au-dessus** du
peloton pour un échappé sans transpondeur — se fait maintenant en deux gestes, créer le groupe
puis le poser. La bande visée, elle, **ne place toujours pas** le groupe à la création : c'est
la position mesurée qui décide, et le §14 reste ouvert sur ce point précis.

**Ce qui attend sa réponse** : poser le **peloton** à la main le transforme en groupe de
l'opérateur, qui n'absorbe plus les coureurs rattrapés tout seul (§3). Faut-il que le geste
refuse le peloton ?

**On saura que c'est fini quand** : il aura répondu à cette question.

**Ajouté le 1er novembre 2026, deux questions ouvertes sur ce même poste** :

1. Poser le **peloton** à la main le transforme en groupe de l'opérateur, qui n'absorbe plus les
   coureurs rattrapés tout seul (§3). Le geste doit-il refuser le peloton ?
2. Un groupe posé en tête devient le **groupe 1** pour l'éligibilité, sans être le premier
   détecté au sprint (`mesures.md` §37). Est-ce bien ce qu'il veut, ou l'éligibilité doit-elle
   rester sur les positions mesurées ?

**Le 1er novembre 2026, la première de ces deux questions est tranchée** : le geste ne refuse
pas le peloton (point 155). Rien à coder, le comportement livré est celui qu'il veut. La
seconde devient le poste §16.

---

## 16. Les tours à faire sur le groupe forcé — **à trancher**

Sa pensée et ses mots sont au point 156 de `regles-operateur.md`, la mesure qui l'a amenée dans
`mesures.md` §37.

**L'état du code** : les tours à faire se comptent sur le **leader désigné** — `dispLap()` lit
`S.leader`, et retombe sur la position mesurée s'il n'y en a pas. Ils ne se comptent pas sur le
groupe 1 de la timeline. Et le leader désigné est **repris automatiquement** par tout coureur
qui le dépasse sur la piste (`computeGroups`), ce qui défait un forçage en quelques secondes.

**Ce qui lui a été répondu** : sa logique tient, mais l'application a déjà le levier qu'il
décrit — le leader — et deux leviers qui peuvent se contredire valent moins qu'un seul.

**On saura que c'est fini quand** : il aura dit si poser un groupe en tête doit aussi désigner
son premier coureur comme leader de la course.
