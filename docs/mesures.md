# Les mesures

**Tous les chiffres du projet sont ici, et nulle part ailleurs.** Aucun autre document ne
cite un temps, un nombre de passages ni une durée : ils renvoient à ce fichier. C'est la
seule façon qu'une mesure périmée ne survive pas dans cinq fichiers à la fois — ce qui
était le cas avant le 28 octobre 2026, avec cinq durées différentes pour la même course.

Chaque mesure porte **le numéro de build où elle a été prise**. Une mesure d'une build
antérieure n'est pas fausse : elle décrit cette build. Ne la mettez pas à jour, ajoutez la
nouvelle en dessous.

---

## 1. La course de référence

Le scénario de référence, tel qu'il se charge depuis l'onglet **Files** du simulateur
(bouton `Load` de la ligne « 250 m · 40 laps »). 16 coureurs, 40 tours sur 250 m, sprint
tous les 10 tours, dernier sprint doublé.

Le scénario : BIB 4 et 11 décrochent au tour 4 ; BIB 12 attaque au tour 5, les rattrape,
prend leur roue puis gagne un tour sur le peloton ; 4 et 11 sont repris plus tard ; au
sprint 2, BIB 7 et 52 passent la ligne à 11 ms d'écart.

**Attention** (voir `pitfalls.md` A10 et A11) : il n'y a plus de scénario depuis la build 74.
Une course neuve est un peloton nu, parce qu'elle ne porte aucun ordre. Pour mesurer la course
de référence, il faut la **charger** depuis Files — c'est une course enregistrée comme une
autre (§15).

### État courant — builds 66 à 68, pace 15 m/s

Mesuré le 28 octobre 2026 à la build 66 et reconfirmé aux builds 67 et 68, en pilotant le moteur pas à pas (`factor = 0`, puis
`step(0.05)` + `detect(computeGroups(measured()), measured())` jusqu'à `S.finished`).

| Grandeur | Valeur |
|---|---|
| Durée de la course | **674,2 s** (13 485 pas de 0,05 s) |
| Coureurs | 16 |
| Tours | 40 |
| Propositions de tour | **deux, et deux seulement** : `lap:12:1` à **165,5 s**, `lap:4,11:-1` à **458,1 s** |
| Passages de bande jugés | 185 |
| Contacts par tape switch | 637 · 621 · 619 · 621 · 620 |
| Contacts sans lecture (`lone`) | 0 |
| Lectures sans contact (`short`) | 56 |
| Lignes de Crossings | 41 |
| Lignes de journal | 9 |
| Sprints enregistrés | 4 |
| Fenêtres d'inéligibilité | **trois**, 3,0 s en tout : 164,9→165,5 (BIB 11) · 170,6→171,8 (BIB 4) · 171,8→173,0 (BIB 4 et 11) |

**Non mesurable en pas-à-pas** : le jugement des cartes de sprint et le classement final.
Le pas-à-pas ci-dessus n'appelle pas `spTick()`, qui vit dans `render()` : les sprints ne
s'ouvrent donc pas et leur ordre n'est pas jugé. Toute mesure de sprint demande de laisser
tourner la boucle d'affichage — ce qui a été fait à la build 67, voir §12.

### Historique

| Build | Durée | Propositions | Note |
|---|---|---|---|
| 51 | 716 s | gain 206,2 s · perte 342,9 s (une seule, « 4 and 11 ») | avant la cassure dans le clustering |
| 53 | 716 s | — | cassure, merge, inéligibilité par groupes codés |
| 54 | 716 s | `lap:12:1` 144,5 s · `lap:11:-1` 342,6 s · `lap:4:-1` 342,7 s | la perte sortait en deux propositions |
| 60 | 717 s | les deux mêmes | 173 passages jugés, 28 lignes de journal, 41 lignes de Crossings |
| 62 | 716,5 s | les deux mêmes | 173 passages, contacts 643·622·617·620·623, zéro `lone` faux |
| 63 | 728 s | les deux mêmes | les trois oscillations du simulateur retirées ; contacts 638·622·624·624·623, 180 passages, un `short` maximum au lieu de trois |
| 66 | 674,2 s | `lap:12:1` 165,5 s · `lap:4,11:-1` 458,0 s | pace par défaut passée à 15 m/s ; détection des tours réécrite |
| 67 | 674,2 s | les deux mêmes, aux mêmes instants | médiane supprimée ; tour du peloton = son premier coureur, delta contre le coureur d'en face (§12) |
| 68 | 674,2 s | les deux mêmes, aux mêmes instants | seuil de cassure paire par paire, vitesse du coureur qui suit (§13) |
| 74 | 674,2 s | `lap:12:1` 165,5 s · `lap:4,11:-1` **458,1 s** | le scénario câblé devient une course enregistrée ; la perte de tour se propose **un dixième plus tard** (§15) |
| 75 | 674,2 s | les deux mêmes, aux mêmes instants | la course de référence quitte le code et devient une ligne de la liste enregistrée ; renommer et effacer (§16) |

Les durées bougent avec la **pace par défaut** et avec le modèle de vitesse du simulateur,
pas avec les règles de course. Comparer deux builds de part et d'autre d'un de ces
changements n'a pas de sens.

---

## 2. Ce qui a fixé le délai de confirmation des cassures

Mesuré à la build 53, course complète rejouée : 40 tours, 716 s, 14 320 images, 16
coureurs, seuil à 1,000 s avec la correction d'une longueur de vélo.

**Variation de l'écart d'une image à l'autre**, pour les paires situées à moins de 0,5 s
du seuil : médiane 0,5 ms, p90 5 ms, p99 15 ms, **maximum 394 ms**. Le maximum est le saut
de recalage au passage d'une boucle, pas du bruit continu. Seules 0,7 % des images ont une
paire à moins de 50 ms du seuil.

**Franchissements de seuil par paire sur la course** : 65 sans délai, 59 avec 0,2 s, 55
avec 0,5 s, 53 avec 1,0 s — et **aucun aller-retour** d'une même paire en moins d'une
seconde, quel que soit le délai.

**Conclusion, et c'est elle qui a fixé 0,3 s** : une marge en distance ne sert à rien, le
saut de 394 ms dépassant toute marge raisonnable ; un délai de confirmation couvre ce saut
et coûte peu. Chiffres d'une simulation aux lectures propres ; des données réelles seront
plus bruitées et le délai pourra être relevé.

---

## 3. Ce qui a fixé la distance au prochain sprint

Mesuré à la build 52/53, course complète.

| Façon de mesurer la distance | Changements de statut sur la course |
|---|---|
| jusqu'à la ligne du tour en cours | **59** |
| jusqu'au prochain sprint | **6** |

Dans les deux cas la règle attrape les mêmes coureurs, les BIB 4 et 11. Avec le tour en
cours, les groupes changent de statut plusieurs fois par tour, ce qui est illisible pour
l'utilisateur. Le clignotement disparaît sans que la règle perde quoi que ce soit, et la
question du moment d'évaluation (gel à l'ouverture ou jugement au franchissement) tombe
d'elle-même.

**Avec la mesure abandonnée** (tour en cours seulement) : BIB 4 inéligible 37 fenêtres,
112,1 s, 15,7 % de la course ; BIB 11, 34 fenêtres, 111,1 s, 15,5 %. **Avec la mesure
retenue** : 3 fenêtres, 27,0 s pour le 4 et 26,6 s pour le 11, soit 3,8 % et 3,7 %.

---

## 4. Ce que le merge a changé

Mesuré dans `maquette-groupes.html` le 25 octobre 2026, course complète, cassure à 1,000 s
plus une longueur de vélo.

- **Sans le merge** : 3 fenêtres d'inéligibilité — 144,5→149,3 · 191,7→209,8 · 350,5→354,7
  — soit environ 27 s.
- **Avec le merge** : 2 fenêtres — 144,5→149,3 · 191,7→200,2 — soit environ 13 s. La
  troisième disparaît entièrement.

La raison est directe : une fois le BIB 12 rentré dans le peloton, il ne reste que deux
groupes. Le peloton devient le groupe 1, les distancés le groupe 2, et les membres du
groupe 2 sont toujours éligibles. Le merge réduit donc de moitié les cas d'inéligibilité.

---

## 5. L'inéligibilité à la build 53

Course complète, 40 tours, 716 s. **Aux quatre ouvertures de sprint, l'ensemble gelé est
vide** : la règle ne retire personne. Classement final 12 (25 pts), 52 (12), 61 (7), 7 (7),
18 (4).

Six fenêtres, 16,3 s en tout :

| de → à | durée | coureurs |
|---|---|---|
| 144,9 → 149,5 | 4,6 s | 4, 11 |
| 192,4 → 195,8 | 3,4 s | 4, 11 |
| 198,1 → 201,3 | 3,2 s | 4, 11 |
| 346,4 → 348,3 | 1,9 s | 4, 11 |
| 350,7 → 352,7 | 2,0 s | **onze coureurs du peloton** |
| 358,4 → 359,6 | 1,2 s | 4 |

**La cinquième fenêtre est le cas à trancher** du peloton coupé en deux
(`regles-operateur.md` §15). Composition relevée aux deux instants concernés :

    t = 220,7 s   1:[12] · 2:[52 15 3 61 7 9] · 3:[18 67 1 58 46 70 23] · 4:[11 4]
    t = 350,5 s   1:[12] · 2:[7 52 15]        · 3:[11 1 18 61 3 9 58 70 46 67 23] · 4:[4]

### Le cas limite de t = 144,5 s

Le groupe 3 est formé du 11 TANAKA et du 4 WALSH, à environ 1 m l'un de l'autre sur la
route : le 11 est 1 m devant le leader, le 4 à sa hauteur. Avec `(piste_tête −
piste_groupe) mod 250`, le 11 ressort à 249 m du prochain sprint et le 4 à 0 m. Les deux
ont un tour de retard et les deux sont devant le peloton, mais seul le 4 devient
inéligible. C'est l'effet de bord du « toujours considérer le groupe de tête comme le plus
proche » : un coureur qui dépasse le leader de quelques mètres bascule de 0 à 249.

---

## 6. La conséquence sur le rang, vérifiée sur cas forcé

La course de référence ne fait jamais tomber une fenêtre d'inéligibilité sur l'ouverture
d'un sprint, donc elle n'exerce **jamais** cette règle. Vérifiée en forçant le cas, à la
build 53 :

Sprint 1, ordre lu `12 52 7 61 1 18 3 9 58 70 46 67 23 11 4` ; le 61 déclaré inéligible et
placé à un tour dans la timeline : il passe de la **4ᵉ à la 15ᵉ place**, et **tous les
autres coureurs gardent exactement leur place**. Avec deux inéligibles à 250 m et 240 m de
retard, ils finissent tous deux derrière le peloton et dans l'ordre de la timeline entre
eux. Avec un ordre arrangé par l'opérateur, rien ne bouge.

**Le scénario qui l'exercerait pour de bon reste à construire** (`travaux.md` §2) : décaler le décrochage des
BIB 4 et 11 pour qu'ils soient entre le peloton et la ligne à l'ouverture d'un sprint. Il
exercerait du même coup les lignes grisées (§8 ci-dessous).

---

## 7. Les lignes grisées à la build 54

Course complète, 40 tours, 716 s. Les quatre sprints s'ouvrent et se jugent **sans aucune
ligne grisée** ; 15, 13, 15 et 15 passages jugés, chacun une seule fois. Le BIB 12 est
éligible aux quatre sprints (1er, 3e, 1er, 1er) : il est le groupe de tête, donc éligible
par construction, et une mesure qui le montrerait inéligible serait une mesure faussée.

Avec son tour validé à la main, classement final : 12 → 42 pts (22 de sprints + 20 de
tour), 52 → 13, 7 → 9, 61 → 7, 18 → 4.

Les lignes grisées n'ont donc été vues que sur cas forcé, où elles sortent dans l'ordre
attendu : ligne grisée sans rang avec « no points » à l'heure du passage, puis les places
normales, puis les grisés lus après la dernière place.

---

## 8. Les tape switches

**Comptage par passage de groupe** — course de référence complète à la build 57, 40 tours,
BIB 15 passé sans transpondeur par l'opérateur au bout de 30 s : 172 passages de groupe
jugés. Sur les 118 passages du peloton, 80 comptent bien un vélo de plus que de
transpondeurs lus, 35 n'en comptent pas un de plus parce qu'une fusion le masque, et 3 sont
comptés court. Le nombre retenu pour le groupe est annoncé **une seule fois** sur toute la
course et ne bouge plus.

**Appariement des heures à 20 ms** — build 60. Avant l'appariement, deux coureurs de front
cachaient le vélo en trop : BIB 4 et 11 roulent côte à côte, la bande ne voit qu'un contact
pour les deux, BIB 12 les rattrape à 9 m, et les comptes disaient « 2 contacts, 2
transpondeurs, rien à signaler » à chaque tour. Les heures disent `lone: 1, short: 1` à
**chaque passage** : le contact de BIB 12 arrive 570 ms après les deux autres, donc il n'est
ni l'un ni l'autre.

**Contacts perdus par fusion** : sur la course de référence à la build 60, 45 passages sur
173 perdent au moins un contact parce que deux roues sont trop proches (règle des 5 cm). Un
contact manquant n'est donc pas un incident rare mais l'ordinaire d'un peloton groupé, et il
peut **masquer** un vélo sans transpondeur sur un passage donné. C'est pourquoi il y a trois
points de comparaison par tour et pourquoi leurs réponses sont gardées séparées plutôt que
moyennées.

**Les quatre longueurs de piste** donnent bien 83 / 100 / 125 / 166,5 m entre les Pursuits et
3 / 4 / 5 / 5 tape switches. La course rejouée reproduit les contacts **au millième de
seconde près**, donc `Rewind 30s` et `Load` sont intacts.

---

## 9. Un coureur sans transpondeur qui roule seul

Build 59, scénario de référence, BIB 12 déclaré sans transpondeur pendant son attaque.

**Position mesurée contre la vérité du simulateur**, un relevé toutes les 10 s :
1506/1506, 1665/1664, 1821/1820, 1976/1976, 2133/2132, 2289/2286 — **moins de 3 m sur cinq
tours**, alors que le modèle d'avant ne savait que le coller à 1,65 m derrière un autre
coureur.

**Toute la course** : 40 tours joués d'un bout à l'autre, la carte approuvée dès qu'elle
s'ouvre, aucune erreur, 13 lignes de journal, une seule carte « vélo seul ».

---

## 10. Deux transpondeurs inversés

Build 60, course de référence, BIB 12 (échappé) et BIB 52 (peloton), à 20 s d'intervalle,
tout par clic réel dans le DOM.

- **La panne se voit.** Après `Swap`, BIB 12 est affiché à 1973 m alors qu'il roule à 2084,
  et BIB 52 à 2085 alors qu'il roule à 1971 : les deux ont échangé leur place sur la
  timeline.
- **La correction remet tout d'aplomb, tout de suite.** Après `Swapped` : BIB 12 à 2085
  pour 2084 de vérité, BIB 52 à 1973 pour 1971. La table lit `1042→12, 1043→52`.
- **Undo défait vraiment.** Les deux repassent à leur place échangée et la table revient à
  `1042→52, 1043→12`.
- **Aucune régression.** Les 40 tours sans inversion donnent exactement la course d'avant.

---

## 11. La largeur de la colonne du simulateur

Build 64, largeurs mesurées sans débordement d'aucune ligne : Dossard + Nation + Nom
461 px · sans la Nation 359 px · Nom seul 429 px · dossard seul 347 px. Le plancher
(346 px) est la largeur du bandeau d'onglets et de la ligne Pace, mesurée.

---

## 12. La correction de la médiane, build 67

Mesuré le 28 octobre 2026, course de référence chargée depuis Files, dans les deux
régimes : le pas-à-pas (`factor = 0`) et la boucle d'affichage réelle à ×16.

**La course ne bouge pas.** Durée **674,2 s**, 16 coureurs, 185 passages de bande — les
mêmes qu'à la build 66. Les deux propositions tombent **aux mêmes instants et avec les
mêmes deltas** : `lap:12:1` à **165,5 s**, `lap:4,11:-1` à **458,1 s**. Aucune troisième
proposition, aucune erreur de console, `bunchRaw` fini à chacun des 13 485 pas.

**Ce que le coureur d'en face a donné.** Les deux jonctions, relevées à l'image où la
proposition naît :

| | Tour gagné, 165,5 s | Tour perdu, 458,1 s |
|---|---|---|
| Coureur mesuré | BIB 12 | BIB 4 |
| Sa place dans l'amas | **arrière** | **avant** |
| L'amas, de l'arrière vers l'avant | 12 · 4 · 11 · 52 · 7 · 61 · 18 · 3 · 9 · 1 · 67 · 58 · 70 · 46 · 23 · 15 | 52 · 12 · 7 · 61 · 18 · 3 · 9 · 1 · 67 · 58 · 70 · 46 · 23 · 15 · 11 · 4 |
| Coureur d'en face retenu | **BIB 52**, 3 crans devant lui | **BIB 15**, 2 crans derrière lui |
| Ce qu'il est pour la règle | le **dernier** coureur du peloton | le **premier** coureur du peloton |
| Positions brutes | 2 608,5 m contre 2 428,5 m | 6 580,6 m contre 6 814,3 m |
| `delta` | **+1** | **−1** |

**Les deux pièges que la mesure a mis au jour** sont décrits dans `pitfalls.md` H13. Les
chiffres qui les montrent :

- **165,5 s** : les voisins immédiats de BIB 12 dans l'amas sont BIB 4 puis BIB 11, deux
  attardés à un tour qui roulent entre lui et le peloton. Mesurer contre le voisin immédiat
  aurait donné `delta = 0` et **aucune proposition**. Il faut sauter jusqu'au premier
  coureur qui appartenait au peloton, trois crans plus loin.
- **458,1 s** : le coureur le plus avancé de l'amas est **BIB 4 lui-même**, l'attardé qu'on
  est en train de mesurer. `bunchRaw` vaut pourtant **6 814,3 m**, la position de BIB 15 :
  le filtre « déjà dans le peloton à l'image précédente » a bien écarté BIB 4 et BIB 11.
  Sans ce filtre, le tour du peloton aurait chuté d'un tour à cette image même.

**Le jugement des sprints et le classement final, enfin remesurés.** C'est ce que la
build 66 n'avait pas pu faire. Boucle d'affichage réelle à ×16, course menée jusqu'à
674,2 s, aucune proposition validée :

| Rang | BIB | Points sprints | Place au final |
|---|---|---|---|
| 1 | 15 | 19 | 1 |
| 2 | 12 | 15 | 15 |
| 3 | 23 | 8 | 4 |
| 4 | 4 | 6 | 2 |
| 5 | 11 | 4 | 3 |
| 6 | 46 | 3 | 5 |

Les dix autres finissent à 0 point, classés de la 6e à la 16e place au sprint final. Les
26 lignes de journal et les deux propositions restées ouvertes confirment qu'aucun ±20 n'a
été appliqué : ces totaux sont ceux des quatre sprints seuls.

---

## 13. La vitesse de conversion de la cassure, build 68

Mesuré le 28 octobre 2026, course de référence chargée depuis Files, pas-à-pas
(`factor = 0`), 14 001 pas de 0,05 s. Les deux règles ont été appliquées **sur les mêmes
données mesurées**, image par image : celle du code (vitesse du coureur qui suit, paire par
paire) et l'ancienne (vitesse médiane du plateau, un seul seuil).

**L'étendue des seuils.** Le seuil d'une paire a varié de **15,65 m à 18,35 m** sur la
course, soit des vitesses de 14,0 à 16,7 m/s. L'écart maximal de vitesse entre deux coureurs
au même instant : **2,70 m/s**.

**Combien de verdicts changent.** Sur **224 016** tests de paire :

| Grandeur | Valeur |
|---|---|
| Verdicts différents | **73**, soit **0,033 %** |
| Paires concernées | **deux seulement** : `4\|52` (60 fois) et `12\|11` (13 fois) |

**Les deux paires sont exactement les moments de rattrapage et de décrochage** — BIB 4 par
rapport au peloton, BIB 12 par rapport à BIB 11 pendant son attaque. Ailleurs, quand tout le
monde roule à la même vitesse, les deux règles donnent le même résultat. C'est la
démonstration de `pitfalls.md` H15 : l'erreur ne se voyait qu'aux instants qui décident.

**Le cas le plus franc, à 190,2 s**, paire `4|52` :

| | |
|---|---|
| Écart mesuré entre les deux axes | 16,58 m |
| Vitesse de BIB 4, le coureur qui suit | 16,70 m/s (il revient) |
| Vitesse médiane du plateau | 14,89 m/s |
| Seuil de la paire (règle de l'opérateur) | **18,35 m** → **pas de cassure** |
| Seuil médian (ancien code) | 16,54 m → cassure |

L'écart de 16,58 m tombe entre les deux. BIB 4 revient à 16,7 m/s : sa roue avant couvre les
16,58 m en 0,99 s, donc **moins d'une seconde**, donc pas de cassure. L'ancien seuil le
déclarait décroché alors qu'il était en train de recoller.

**Ce que cela change à l'écran.** Les amas reconstruits sous les deux règles diffèrent sur
**73 images sur 14 001 (0,52 %)**, réparties en **quatre épisodes** :

| Épisode | Durée |
|---|---|
| 104,9 → 105,9 s | 1,05 s |
| 158,1 → 158,7 s | 0,65 s |
| 189,2 → 190,2 s | 1,00 s |
| 247,5 → 248,5 s | 1,00 s |

Au premier, 104,9 s, c'est l'inverse du cas ci-dessus : la règle de l'opérateur voit **trois
groupes** (cassure à `4|52`) là où l'ancienne n'en voyait que deux. BIB 4 est alors plus lent
que la médiane — il décroche — donc son seuil est plus bas et la cassure se déclare plus tôt.
La correction joue donc **dans les deux sens**, et chaque fois du bon côté.

Les quatre épisodes dépassent le délai de confirmation de 0,3 s, donc les blocs affichés
diffèrent brièvement. **Les deux propositions de tour, elles, ne bougent pas** : `lap:12:1` à
165,5 s et `lap:4,11:-1` à 458,0 s, les mêmes qu'aux builds 66 et 67, avec les mêmes coureurs
d'en face (BIB 52 et BIB 15). *(La seconde est passée à 458,1 s à la build 74 ; le §15 dit
pourquoi.)*

**Course complète à ×16**, boucle d'affichage réelle : 674,2 s, 185 passages de bande, aucune
erreur de console, et le classement identique à celui de la build 67 — 15 (19 pts) · 12 (15)
· 23 (8) · 4 (6) · 11 (4) · 46 (3). Le journal compte 25 lignes contre 26 à la build 67 : la
ligne de différence est un relevé de contacts de tape switch, qui dépend du découpage en
images de la boucle d'affichage et non des règles. Le pas-à-pas, lui, est déterministe et
donne exactement la même chose aux deux builds.

---

## 14. La forme de l'ovale et les deux Pursuits face à face, build 69

Mesuré le 28 octobre 2026 en lisant les repères **dans le DOM** du prototype, pour les
quatre longueurs de piste et pour deux valeurs de `gap`. Le milieu des lignes droites
peintes est à **x = 490** dans le `viewBox` de l'ovale ; un repère est en face de l'autre
quand les deux y tombent.

**Ce que la build 68 dessinait.** Piste 250 m, `gap` 10 m : Pursuit A à **x = 505,9**,
Pursuit B à **x = 474,1**. Chacun à **2 m du milieu de sa ligne droite**, des côtés
opposés, soit **4 m d'écart** à l'œil. L'erreur venait de la ligne d'arrivée, dessinée à
**12 m avant le milieu** de la ligne droite d'arrivée — un chiffre qui n'était la mesure de
personne. Elle grandissait avec le `gap` : sur une 333 m à `gap` 80 m, Pursuit A tombait à
**x = 141,8** et Pursuit B à **x = 838,2**, à l'opposé l'un de l'autre sur la largeur.

**Ce que la build 69 dessine.** Pursuit A et Pursuit B à **x = 490,0** dans les cinq cas
mesurés — 166, 200, 250 et 333 m à `gap` 10 m, et 250 m à `gap` 25 m. La ligne d'arrivée
suit le `gap` : x = 566,3 à 10 m, x = 574,0 à 25 m sur une 250 m.

**La distance Pursuit A – Finish, relue sur le dessin** le 28 octobre 2026 à la demande de
l'opérateur, piste 250 m : Pursuit A à **x = 490,0**, Finish à **x = 566,3**, soit
**76,3 unités**. À 7,633 unités par mètre, cela fait **9,996 m**, l'écart venant de
l'arrondi d'affichage à une décimale. C'est exactement le `gap` du simulateur : le dessin ne
pose plus cette distance lui-même, il la lit.

**La forme retenue**, celle de `regles-operateur.md` §9 : 760 px de large, **340 px de
haut**, donc un rayon de virage de 170 px et 420 px de ligne droite. Le tour fait
**1 908,3 px**, dont **44,02 %** en lignes droites, contre 36,4 % à la build 68.

| Piste | Ligne droite | Rayon de virage |
|---|---|---|
| 166 m | 36,54 m | 14,79 m |
| 200 m | 44,02 m | 17,82 m |
| **250 m** | **55,02 m** | **22,27 m** |
| 333 m | 73,29 m | 29,67 m |

Les 55 m demandés par l'opérateur tombent donc à **3 cm près**, le reste de l'écart venant
de l'arrondi de la hauteur à 340 px entiers. Pour mémoire, la build 68 valait 45,5 m de
ligne droite et 25,3 m de rayon sur une 250 m, et Saint-Quentin-en-Yvelines a un rayon
constant de 23 m, qui donnerait 52,7 m de ligne droite.

**La largeur de la piste dessinée**, portée de 40 à **60 unités SVG** à la demande de
l'opérateur. Comme une seule forme sert aux quatre longueurs de piste, ce que vaut cette
largeur en mètres dépend de la longueur affichée :

| Piste | 40 unités, build 68 | **60 unités, build 69** |
|---|---|---|
| 166 m | 3,48 m | **5,22 m** |
| 200 m | 4,19 m | **6,29 m** |
| **250 m** | 5,24 m | **7,86 m** |
| 333 m | 6,98 m | **10,47 m** |

Sur la 250 m, les 7,86 m tombent entre les deux largeurs réelles énoncées par l'opérateur,
7,5 m et 8 m (`regles-operateur.md` §9). Les trois coureurs de front sont posés à **±24
unités** de l'axe : ils étaient hors de la bande tant qu'elle ne faisait que ±20, ils sont
dedans à ±30.

**Les marquages, relus dans le DOM après tracé**, piste 250 m, où 1 m vaut 7,633 unités.
Les distances sont comptées depuis le **bord intérieur** de la piste :

| Marquage | Cote demandée | Cote mesurée dans le dessin |
|---|---|---|
| Côte d'azur | ≥ 10 % de 7,86 m, sous le bord intérieur | **0,79 m** d'épaisseur, de 0 à −0,79 m |
| Ligne noire (mensuration) | 0,20 m | **0,20 m** |
| Ligne rouge (sprinteurs) | 1,05 m | **1,05 m** |
| Ligne bleue (stayers) | tiers supérieur, soit 5,24 m | **5,24 m** |
| Bande blanche de l'arrivée | pas de cote donnée | **2,10 m** dans le sens de la marche, build 71 |
| Trait noir de l'arrivée | la largeur d'une ligne de poursuite | **0,26 m**, comme Pursuit A et B |

**La ligne d'arrivée ne garde aucune de ses deux cotes réelles**, sur décision de
l'opérateur du 28 octobre 2026 : le trait noir prend la largeur des deux lignes de
poursuite, contre lesquelles il se lit, parce que ses 4 cm vaudraient 0,3 unité qu'aucun
écran ne rend ; et la bande blanche, trop mince autour de lui à ses 60 cm, est portée à
**huit fois le trait noir** à la build 71, après deux élargissements. L'épaisseur des lignes longitudinales, que la norme ne donne
pas, est posée à 0,20 m.

**Les couleurs, après ses deux relectures du 28 octobre 2026.** Aucune n'a été énoncée ; ce sont
les valeurs retenues, à confirmer à l'œil :

| Élément | Build 69 | Build 70 | Build 71 | Build 72 | **Build 73** |
|---|---|---|---|---|---|
| Piste | `#9a7140` | **`#b5884e`**, plus clair | inchangée | inchangée | inchangée |
| Côte d'azur | `#7ec8e3` | `#2e86ab` | `#1a5f80` | `#1d4ed8` | **`#3b6ae8`**, éclaircie |
| Ligne des sprinteurs | `#e05555`, 1,5 unité | inchangée | **`#a32020`**, foncée | inchangée | inchangée |
| Ligne des stayers | `#3b7fae`, 1,5 unité | `#4aa8e0`, 2 unités | `#1668a0` | **`#1d4ed8`**, le dossard du n° 3 | **validée telle quelle** |
| Trait noir de l'arrivée | 1 unité | **2 unités** | inchangé | inchangé | inchangé |
| Bande blanche de l'arrivée | 0,60 m, soit 4,58 unités | 10 unités | **16 unités**, soit 2,10 m | inchangée | inchangée |
| Bandes de tape | 3 unités, `#F2A33A` | **plus dessinées** | — | — | — |

Les deux lignes longitudinales ont été éclaircies à la build 70 puis foncées à la build 71,
parce qu'elles se lisaient mal sur la piste devenue plus claire. À la **build 72**, la côte
d'azur et la ligne des stayers prennent le seul bleu que l'opérateur ait jamais nommé, celui
du dossard du coureur n° 3 : `#1d4ed8`, lu dans la table `RIDERS`. À la **build 73** il
valide ce bleu pour la ligne des stayers et demande la côte d'azur « un peu » plus claire :
elle passe à `#3b6ae8`, le même bleu éclairci, pour que les deux restent de la même famille.
Seule l'épaisseur de la ligne des stayers a bougé depuis la build 69, et elle reste à
2 unités.

**L'étendue des traits en travers, build 72.** Relue dans le DOM : la bande de piste de la
ligne droite d'arrivée va de **y = 435 à y = 495**, et le trait d'arrivée comme celui de
Pursuit A vont désormais de **435 à 495** eux aussi — la largeur roulable exactement. La
côte d'azur occupe **429 à 435**, donc son haut est bien le point de départ des traits. Ils
débordaient de **1 unité de chaque côté** depuis la build 69. La ligne des 100 m garde sa
moitié de largeur, de la côte d'azur au milieu de la piste.

**Les lignes du 200 m lancé, par longueur de piste.** Comptées sur les traits blancs
transversaux réellement tracés, course non démarrée :

| Piste | Traits blancs | Lesquels |
|---|---|---|
| 166 m | **1** | la bande d'arrivée seule — pas de 200 m lancé |
| 200 m | **2** | arrivée et 100 m ; le départ du 200 tombe sur la ligne |
| 250 m | **3** | arrivée, 200 m, 100 m |
| 333 m | **3** | arrivée, 200 m, 100 m |

La bande d'arrivée fait désormais **16 unités quelle que soit la longueur de piste**, ce
qui lui donne 1,39 m sur une 166 m, 1,68 m sur une 200 m, 2,10 m sur une 250 m et 2,79 m
sur une 333 m. Elle est lue comme un repère à l'écran, plus comme une cote.

**Les tape switches ne sont plus dessinés** (`regles-operateur.md` §9). Vérifié dans le
DOM après le tracé : **zéro** trait `#F2A33A` dans `#marks`. Les deux qui ne sont pas dans
une boucle gardent leur étiquette, « départ du 200 m » et « intermédiaire du 200 m », et
leurs contacts continuent d'être comptés dans l'onglet Track.

**Le reste de la course ne bouge pas.** `pt()` et `normalAt()` ne sont lus que par
`renderMarks()` et `renderOval()` : aucune mesure ne les traverse. Vérifié sur la course de
référence chargée depuis Files, dans les deux régimes :

- **Pas-à-pas** (`factor = 0`) : **13 485 pas**, durée **674,2 s**, deux propositions et
  deux seulement — `lap:12:1` à **165,5 s** et `lap:4,11:-1` à **458,1 s**. Exactement les
  builds 66, 67 et 68.
- **Boucle d'affichage réelle à ×16** : course menée à son terme en 42 s de temps réel,
  **aucune erreur de console**, quatre sprints jugés, deux propositions laissées ouvertes,
  26 lignes de journal. Classement par les points des sprints seuls : **15 (19) · 12 (15) ·
  23 (8) · 4 (6) · 11 (4) · 46 (3)** — identique aux builds 67 et 68.

---

## 15. La course de référence devenue une course enregistrée, build 74

Mesuré le 28 octobre 2026 en pilotant le prototype pas à pas, course de référence chargée
depuis l'onglet Files.

**Ce qui a disparu du code** : la table `SCRIPT`, le drapeau `S.useScript`, le mode `away`
et les deux `const keep` qui ressuscitaient le drapeau après un `reset()`. Un `grep` des
trois noms dans le fichier ne rend **plus rien**.

**Ce qui les remplace** : deux ordres dans `REF_RACE.acts`, rejoués sur l'horloge comme ceux
de n'importe quelle course enregistrée.

| Ordre | Instant | Ce qu'il fait |
|---|---|---|
| `lose` sur BIB 4 et 11 | t = 50,49 s (tour 4) | ils décrochent, et **la roue du 12** leur est donnée pour trois tours |
| `gain` sur BIB 12 | t = 67,39 s (tour 5) | il attaque, les rattrape, puis prend un tour au peloton |

Les deux instants sont ceux auxquels le scénario câblé se déclenchait, relevés sur la course
elle-même. Ils sont posés **un centième avant** le pas de 0,05 s (50,49 et non 50,50) parce
que `replayTick()` compare `a.t <= S.t` sur un `S.t` qui s'accumule par additions
flottantes : à 50,50 pile, la comparaison tombait du mauvais côté et l'ordre partait un pas
trop tard.

**La course rejouée, événement par événement**, comparée au scénario câblé de la build 73 :

| Événement | Build 73, câblé | Build 74, rejoué |
|---|---|---|
| 4 et 11 décrochent | 50,55 s | **50,55 s** |
| 12 attaque | 67,45 s | **67,45 s** |
| 11 prend la roue du 12 | 161,75 s, tour 11 | **161,75 s, tour 11** |
| 4 prend la roue du 12 | 162,55 s, tour 11 | **162,55 s, tour 11** |
| 12 a pris son tour | 201,80 s | **201,80 s** |
| 11 a perdu le sien | 473,55 s | **473,55 s** |
| 4 a perdu le sien | 473,60 s | **473,60 s** |
| Fin de course | 674,2 s · 13 485 pas | **674,2 s · 13 485 pas** |
| Classement | 15(19)·12(15)·23(8)·4(6)·11(4)·46(3) | **identique** |
| Sprints jugés | 4 | **4** |

**Le seul écart : la proposition de tour perdu passe de 458,0 s à 458,1 s**, soit deux pas de
simulation. La cause est connue et mesurée : l'ordre est appliqué par `replayTick()` **avant**
`step()`, donc les coureurs 4 et 11 quittent le mode `bunch` un pas plus tôt qu'avec le
scénario câblé, qui changeait leur mode à l'intérieur de `step()` une fois la position moyenne
du peloton déjà calculée. Ce pas d'écart déplace cette moyenne une seule fois, de très peu, et
la proposition sort un dixième plus tard. **Rien d'autre ne bouge** : ni la durée, ni les sept
événements physiques ci-dessus, ni le classement. Le choix a été de ne pas tordre le code pour
récupérer ce dixième, et de l'écrire ici.

**Les trois boutons**, vérifiés sur le prototype, `localStorage` vidé au départ :

| Action | Horloge | Ordres à rejouer | Courses enregistrées |
|---|---|---|---|
| Au chargement | 0,0 s | — | **0** |
| Course de référence chargée, jouée 150 s | 150,0 s | 0 restant | 0 |
| `↺` **Restart** | **0,0 s** | **2, de nouveau** | **0** — rien n'a été enregistré |
| rejouée 150 s, puis `+` **Nouvelle course** | **0,0 s** | **0** | **1** — la course est enregistrée |

Donc : Restart rejoue sans rien enregistrer ni ouvrir, et `+` enregistre puis ouvre une course
vide. Une course ouverte par `+` ne porte aucun ordre, donc **ne bouge pas toute seule**,
quelle que soit la course chargée avant — ce qui est le premier critère du poste `travaux.md`
§7a.

**Le point REC**, relevé sur la classe de `#simrec` : **allumé** quand la course est en
lecture, **éteint** en pause, éteint tant qu'aucune course n'est partie. C'est la lecture que
l'opérateur a tranchée le 28 octobre 2026 : « Le point REC s'éteint dès qu'on met en pause. »

**Dans l'onglet Files**, la course de référence est désormais une ligne comme les autres :
« Reference — 4 and 11 lose a lap, 12 takes a lap · 250 m · 40 laps · **11:14.2** ». Elle
n'avait pas de durée tant qu'elle était un scénario. Et une course enregistrée depuis le
prototype après avoir rejoué la référence se nomme toute seule d'après ses ordres — « 4 and 11
lose a lap at 4 · 12 takes a lap at 5 » — preuve que `raceName()` la décrit par ses actions,
comme n'importe quelle autre.

---

## 16. Renommer et effacer une course, build 75

Mesuré le 28 octobre 2026 sur le prototype en marche, `localStorage` vidé avant chaque
série.

**Le dépôt du modèle.** Clé `tct.sim.races` absente, page ouverte : la liste contient
**une** ligne, « Reference — 4 and 11 lose a lap, 12 takes a lap », et la clé est écrite. La
ligne porte *Load*, *Rename* et *Delete*.

**Les quatre gestes, et ce qu'ils laissent après un rechargement de la page :**

| Geste | Ce qu'on voit | Dans la liste enregistrée | Après rechargement |
|---|---|---|---|
| *Rename*, puis *Save* | le nom devient un champ, *Save* / *Cancel* remplacent les trois boutons | « Essai 24 coureurs — 2 novembre » | **le nouveau nom** |
| *Rename*, nom vidé, *Save* | — | le nom d'avant, inchangé | le nom d'avant |
| *Rename*, puis Échap | la ligne redevient une ligne | le nom d'avant, inchangé | le nom d'avant |
| *Delete*, un clic | le bouton devient **Delete?** en rouge | **1 course**, rien n'a bougé | — |
| *Delete*, deuxième clic | la ligne disparaît ; « No saved race. Play one and press New. » | **0 course** | **toujours 0** |

La dernière ligne est celle qui compte : la clé existe et vaut `[]`, donc le modèle n'est pas
redéposé. **Une course de référence effacée reste effacée.**

**La course de référence rejouée après tout cela n'a pas bougé.** Liste reconstituée,
course chargée depuis Files, course menée jusqu'au bout pas à pas :

| | Build 74 | Build 75 |
|---|---|---|
| Pas | 13 485 | **13 485** |
| Durée | 674,2 s | **674,2 s** |
| `lap:12:1` | 165,5 s, tour 11 | **165,5 s, tour 11** |
| `lap:4,11:-1` | 458,1 s, tour 28 | **458,1 s, tour 28** |
| Classement | 15(19) · 12(15) · 23(8) · 4(6) · 11(4) · 46(3) | **le même** |
| Sprints gagnés | 4 | **4** |
| Erreurs console | aucune | **aucune** |
