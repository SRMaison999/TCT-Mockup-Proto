# Les mesures

**Tous les chiffres du projet sont ici, et nulle part ailleurs.** Aucun autre document ne
cite un temps, un nombre de passages ni une durée : ils renvoient à ce fichier. C'est la
seule façon qu'une mesure périmée ne survive pas dans cinq fichiers à la fois — ce qui
était le cas avant le 28 octobre 2026, avec cinq durées différentes pour la même course.

Chaque mesure porte **le numéro de build où elle a été prise**. Une mesure d'une build
antérieure n'est pas fausse : elle décrit cette build. Ne la mettez pas à jour, ajoutez la
nouvelle en dessous.

---

## 1. La simulation

La simulation, telle qu'elle se charge depuis l'onglet **Files** du simulateur
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
| 67 | 674,2 s | les deux mêmes, aux mêmes instants | médiane supprimée ; tour du peloton = son premier coureur, delta contre le coureur qui le suit (§12) |
| 68 | 674,2 s | les deux mêmes, aux mêmes instants | seuil de cassure paire par paire, vitesse du coureur qui suit (§13) |
| 74 | 674,2 s | `lap:12:1` 165,5 s · `lap:4,11:-1` **458,1 s** | le scénario câblé devient une course enregistrée ; la perte de tour se propose **un dixième plus tard** (§15) |
| 75 | 674,2 s | les deux mêmes, aux mêmes instants | la simulation quitte le code et devient une ligne de la liste enregistrée ; renommer et effacer (§16) |
| 76 | **669,3 s** | `lap:12:1` **165,2 s** · `lap:4,11:-1` **405,7 s** | le peloton cesse de ralentir quand un coureur le quitte : il roule l'allure affichée, donc la course est plus courte et la reprise plus précoce (§17) |

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

La simulation ne fait jamais tomber une fenêtre d'inéligibilité sur l'ouverture
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

**Comptage par passage de groupe** — simulation complète à la build 57, 40 tours,
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

**Contacts perdus par fusion** : sur la simulation à la build 60, 45 passages sur
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

Build 59, simulation, BIB 12 déclaré sans transpondeur pendant son attaque.

**Position mesurée contre la vérité du simulateur**, un relevé toutes les 10 s :
1506/1506, 1665/1664, 1821/1820, 1976/1976, 2133/2132, 2289/2286 — **moins de 3 m sur cinq
tours**, alors que le modèle d'avant ne savait que le coller à 1,65 m derrière un autre
coureur.

**Toute la course** : 40 tours joués d'un bout à l'autre, la carte approuvée dès qu'elle
s'ouvre, aucune erreur, 13 lignes de journal, une seule carte « vélo seul ».

---

## 10. Deux transpondeurs inversés

Build 60, simulation, BIB 12 (échappé) et BIB 52 (peloton), à 20 s d'intervalle,
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

Mesuré le 28 octobre 2026, simulation chargée depuis Files, dans les deux
régimes : le pas-à-pas (`factor = 0`) et la boucle d'affichage réelle à ×16.

**La course ne bouge pas.** Durée **674,2 s**, 16 coureurs, 185 passages de bande — les
mêmes qu'à la build 66. Les deux propositions tombent **aux mêmes instants et avec les
mêmes deltas** : `lap:12:1` à **165,5 s**, `lap:4,11:-1` à **458,1 s**. Aucune troisième
proposition, aucune erreur de console, `bunchRaw` fini à chacun des 13 485 pas.

**Ce que le coureur qui le suit a donné.** Les deux jonctions, relevées à l'image où la
proposition naît :

| | Tour gagné, 165,5 s | Tour perdu, 458,1 s |
|---|---|---|
| Coureur mesuré | BIB 12 | BIB 4 |
| Sa place dans l'amas | **arrière** | **avant** |
| L'amas, de l'arrière vers l'avant | 12 · 4 · 11 · 52 · 7 · 61 · 18 · 3 · 9 · 1 · 67 · 58 · 70 · 46 · 23 · 15 | 52 · 12 · 7 · 61 · 18 · 3 · 9 · 1 · 67 · 58 · 70 · 46 · 23 · 15 · 11 · 4 |
| Coureur retenu de la paire | **BIB 52**, 3 crans devant lui | **BIB 15**, 2 crans derrière lui |
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

Mesuré le 28 octobre 2026, simulation chargée depuis Files, pas-à-pas
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
de la paire (BIB 52 et BIB 15). *(La seconde est passée à 458,1 s à la build 74 ; le §15 dit
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
DOM après le tracé : **zéro** trait `#F2A33A` dans `#marks`. Leurs contacts continuent
d'être comptés dans l'onglet Track, où ils gardent leur nom.

**Aucun repère n'est nommé sur l'ovale**, build 91 (`regles-operateur.md` §9, 29 octobre
2026). Compté dans le DOM après le tracé, piste 250 m, les deux fois sur une course vide
**et** sur la simulation chargée depuis l'onglet Files :

| Build | `<text>` dans `#marks` | Lesquels |
|---|---|---|
| 90 | **5** | « Finish », « Pursuit B », « Pursuit A », « 200 m start », « 100 m intermediate » |
| 91 | **0** | — |

Les deux chiffres sont les mêmes course vide et course chargée : le tracé des repères ne
dépend pas de la course. Les traits, eux, sont tous encore là — la ligne noire sur
bande blanche de l'arrivée, les deux lignes blanches des poursuites, et les lignes des 200 m
et 100 m.

**Le reste de la course ne bouge pas.** `pt()` et `normalAt()` ne sont lus que par
`renderMarks()` et `renderOval()` : aucune mesure ne les traverse. Vérifié sur la simulation
chargée depuis Files, dans les deux régimes :

- **Pas-à-pas** (`factor = 0`) : **13 485 pas**, durée **674,2 s**, deux propositions et
  deux seulement — `lap:12:1` à **165,5 s** et `lap:4,11:-1` à **458,1 s**. Exactement les
  builds 66, 67 et 68.
- **Boucle d'affichage réelle à ×16** : course menée à son terme en 42 s de temps réel,
  **aucune erreur de console**, quatre sprints jugés, deux propositions laissées ouvertes,
  26 lignes de journal. Classement par les points des sprints seuls : **15 (19) · 12 (15) ·
  23 (8) · 4 (6) · 11 (4) · 46 (3)** — identique aux builds 67 et 68.

---

## 15. La simulation devenue une course enregistrée, build 74

Mesuré le 28 octobre 2026 en pilotant le prototype pas à pas, simulation chargée
depuis l'onglet Files.

**Ce qui a disparu du code** : la table `SCRIPT`, le drapeau `S.useScript`, le mode `away`
et les deux `const keep` qui ressuscitaient le drapeau après un `reset()`. Un `grep` des
trois noms dans le fichier ne rend **plus rien**.

**Ce qui les remplace** : deux ordres dans les `acts` de la simulation, rejoués sur l'horloge comme ceux
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
| Simulation chargée, jouée 150 s | 150,0 s | 0 restant | 0 |
| `↺` **Restart** | **0,0 s** | **2, de nouveau** | **0** — rien n'a été enregistré |
| rejouée 150 s, puis `+` **Nouvelle course** | **0,0 s** | **0** | **1** — la course est enregistrée |

Donc : Restart rejoue sans rien enregistrer ni ouvrir, et `+` enregistre puis ouvre une course
vide. Une course ouverte par `+` ne porte aucun ordre, donc **ne bouge pas toute seule**,
quelle que soit la course chargée avant — ce qui est le premier critère du poste `travaux.md`
§7a.

**Le point REC**, relevé sur la classe de `#simrec` : **allumé** quand la course est en
lecture, **éteint** en pause, éteint tant qu'aucune course n'est partie. C'est la lecture que
l'opérateur a tranchée le 28 octobre 2026 : « Le point REC s'éteint dès qu'on met en pause. »

**Dans l'onglet Files**, la simulation est désormais une ligne comme les autres :
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
redéposé. **Une simulation effacée reste effacée.**

**La simulation rejouée après tout cela n'a pas bougé.** Liste reconstituée,
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

---

## 17. Le peloton qui ralentissait tout seul, build 76

Mesuré le 28 octobre 2026 sur la simulation, menée pas à pas. L'opérateur avait
signalé que « les vitesses se modifient toutes seules » dès qu'il se servait de *Sync all to
bunch pace* et des flèches ↑ ↓.

**Ce qui se passait.** Chaque coureur du peloton tient une **place** — tant de mètres devant
ou derrière le milieu du peloton — et règle sa vitesse pour la retrouver. Le milieu était
calculé sur **les coureurs encore dans le peloton**. Un coureur qui le quitte emporte donc sa
place avec lui, le milieu se déplace, et tous les autres se retrouvent décalés d'un écart que
personne n'a ouvert. L'écart ne se referme jamais, puisque c'est le repère lui-même qui a
bougé.

**Mesuré, sur le BIB 15, qui n'a reçu aucun ordre de toute la course :**

| Instant | Sa vitesse | Ce qui venait de se passer |
|---|---|---|
| 50,0 s | 15,000 m/s | rien ; allure demandée 15,0 |
| 50,6 s | **14,774 m/s** | les BIB 4 et 11 viennent de décrocher |
| 70,6 s | **14,888 m/s** | — |
| 120,6 s | **14,888 m/s** | le BIB 12 est parti prendre son tour |

L'arithmétique tombe juste : les trois places parties valaient −14,3, +12,1 et +14,3 m, soit
**−12,1 m** pour les treize coureurs restants, donc **0,93 m** chacun. Un écart permanent de
0,93 m vaut, dans ce réglage, **11 cm/s** de trop peu. Allure demandée 15,0 — peloton à 14,89.

**Après correction**, le peloton se repère sur un point qui roule l'allure affichée, posé au
départ. Même course, mêmes instants : le BIB 15 roule **15,000 m/s** à 50,0 s, à 50,6 s, à
70,6 s et à 120,6 s, et les treize coureurs du peloton sont tous à 15,000 à la fin.

**Les deux autres constats, mesurés le même jour :**

| Constat | Mesuré | Après correction |
|---|---|---|
| *Sync all to bunch pace* annulait les ordres en cours | à 168 s, trois ordres tournaient (12 prenait un tour, 4 et 11 en perdaient un) : un clic, les trois ont disparu ; une vitesse posée à la main sur le 46 (15,1) retombait à 15,0 | le bouton met tout le monde à la vitesse du peloton **sans déplacer personne** ; trente secondes plus tard les seize coureurs sont toujours à 15,00 |
| La flèche ↓ ne faisait rien | BIB 52 à 30 s, un seul peloton : clic, aucun ordre créé, aucune réponse | les deux flèches sont **éteintes** quand il n'y a nulle part où aller, allumées dès qu'un deuxième groupe existe (vérifié à 100 s) |

**Ce que la correction change dans la simulation.** Elle la raccourcit, puisque le
peloton ne roule plus 0,75 % trop lentement :

| | Build 75 | Build 76 |
|---|---|---|
| Durée | 674,2 s · 13 485 pas | **669,3 s · 13 386 pas** |
| `lap:12:1` | 165,5 s, tour 11 | **165,2 s, tour 11** |
| `lap:4,11:-1` | 458,1 s, tour 28 | **405,7 s, tour 25** |
| Classement | 15(19) · 12(15) · 23(8) · 4(6) · 11(4) · 46(3) | **le même** |
| Sprints gagnés | 4 | **4** |
| Erreurs console | aucune | **aucune** |

La reprise des BIB 4 et 11 tombe trois tours plus tôt : le peloton qui les reprend roule
maintenant à l'allure demandée, pas 11 cm/s en dessous. L'opérateur a tranché l'arbitrage
avant la correction : « je me fous de la course de référence » (§16 des règles). Les chiffres
des builds antérieures ne sont pas réécrits.

---

## 18. La progression des ordres, build 77

Mesuré le 28 octobre 2026 sur la simulation, rail ouvert, course menée pas à pas.

**Un tour à prendre, BIB 12.** Le bouton `+lap` s'allume à 67,45 s et se remplit :

| Instant | Jauge |
|---|---|
| 70,0 s | 2 % |
| 100,0 s | 23 % |
| 130,0 s | 44 % |
| 160,0 s | 64 % |
| 190,0 s | 85 % |
| 211,2 s | le tour est pris, **le bouton s'éteint** |

**Un coureur envoyé sur le groupe de derrière, BIB 15 → le groupe des BIB 4 et 11.** Ordre
donné à 165,0 s, l'écart est alors de 106 m :

| Instant | Jauge | Écart | Sa vitesse | Celle du groupe visé |
|---|---|---|---|---|
| 166,0 s | 3 % | 103,3 m | 13,800 | 16,700 |
| 176,0 s | 31 % | 74,3 m | 13,800 | 16,700 |
| 186,0 s | 59 % | 45,3 m | 13,800 | 16,700 |
| 196,0 s | 87 % | 16,3 m | 13,800 | 16,700 |
| 201,0 s | **éteint** | 2,4 m | **16,700** | 16,700 |
| 211,0 s | éteint | 2,4 m | **14,000** | 14,000 |
| 215,0 s | éteint | — | **15,423** | 15,423 |

C'est la règle du §16 des règles, vérifiée : il ne reprend pas l'allure du peloton, il prend
**celle du groupe qu'il vient de rejoindre**, et il la tient quand ce groupe change de vitesse.
Les deux flèches de sa ligne restent éteintes tant qu'il est dans la roue du groupe, et se
rallument dès que le détecteur sépare les groupes (vérifié à 225 s).

**La jauge se mesure sur l'écart qui reste, pas sur les mètres parcourus.** Mesuré en premier
sur les mètres parcourus : pour un ordre de rejoindre un groupe qui vient de derrière plus
vite que lui, la jauge affichait **100 % alors que le coureur était encore à 69 m**, parce que
le but avançait plus vite que lui. Sur l'écart restant, elle suit l'approche réelle.

**Ce que la simulation donne à la build 77 :** 669,3 s · 13 386 pas, `lap:12:1` à
165,2 s tour 11, `lap:4,11:-1` à 405,7 s tour 25, classement 15(19) · 12(15) · 23(8) · 4(6) ·
11(4) · 46(3), 4 sprints, aucune erreur console — **inchangé depuis la build 76**.

**Un essai retiré.** Rendre la synchronisation instantanée pour `+lap` et `−lap`, en laissant
le coureur à l'endroit exact où il a bouclé son tour au lieu de le laisser revenir à sa place,
a été codé puis retiré : le logiciel proposait alors la perte de tour des BIB 4 et 11 **au
tour 14, à 220,1 s**, alors que la simulation ne la constate qu'à 415,8 s — 195 s d'avance, et
un classement final différent. Le comportement de la build 76 est conservé pour ces deux
ordres, et le point est au §15 des règles.

---

## 19. Rejouer une course de la liste, build 78

Mesuré le 28 octobre 2026, liste vidée avant chaque série.

**Ce qui se passait.** Charger une course mettait ses ordres en file pour les rejouer **et**
ouvrait en même temps un enregistrement contenant déjà ces mêmes ordres. Au Load suivant, ou
au clic sur *New*, cet enregistrement était sauvé comme une course neuve. Mesuré sur une
course menée à la main, « 46 takes a lap at 2 · 1 ordre · 50 s » :

| | La liste |
|---|---|
| au départ | `46 takes a lap at 2` · `Reference` |
| après un 2ᵉ Load | **`46 takes a lap at 2 (2)`** · l'originale · `Reference` |
| après un 3ᵉ Load | **`(3)`** · `(2)` · l'originale · `Reference` |

La relecture marchait — l'ordre partait au bon instant, le BIB 46 attaquait à 16,70 — mais au
bout de trois essais l'opérateur rechargeait des copies au lieu de sa course.

**Après correction, les trois mêmes Load :**

| Load | REC | L'écran | Ce que fait le 46 | La liste |
|---|---|---|---|---|
| 1 | éteint | « Playing · 46 takes a lap at 2 · 23 loses a lap at 4 » | `gain` à 16,70 | **2 courses** |
| 2 | éteint | la même | `gain` à 16,70 | **2 courses** |
| 3 | éteint | la même | `gain` à 16,70 | **2 courses** |

**Un ordre donné pendant une relecture n'enregistre rien.** Ordre `+lap` sur le BIB 70 au
milieu d'une relecture : il s'exécute à l'écran — le 70 attaque à 16,70 — et la liste ne
bouge pas, ni en nombre de courses (2 avant, 2 après) ni en nombre d'ordres de la course
rejouée (2 avant, 2 après). C'est la règle du §16 : « rien ne s'enregistre jamais depuis une
course chargée, quoi qu'on fasse ».

**Une course menée à la main s'enregistre toute seule.** Sans jamais cliquer sur *New* :

| | La liste |
|---|---|
| 20 s de course, aucun ordre | inchangée |
| un ordre donné | **`46 takes a lap at 2` [1 ordre, 20 s]** |
| un deuxième ordre, 30 s plus tard | **`46 takes a lap at 2 · 23 loses a lap at 4` [2 ordres, 50 s]** |

Une seule ligne, tenue à jour en place. Elle est aussi écrite à chaque pause et à l'arrivée,
pour qu'une course sans aucun ordre soit gardée elle aussi. Un nom donné à la main n'est
plus jamais recalculé.

**Le centrage des symboles.** Mesuré sur les huit boutons de la barre : la **boîte** du
contenu était déjà centrée partout, 16 px à gauche comme à droite. Ce qui n'était pas centré,
c'est **l'encre des glyphes** dans leur boîte, mesurée au canevas :

| Bouton | Décalage de l'encre |
|---|---|
| ⏮ 30s | 0,05 px |
| ▶ | 0,11 px, mais un triangle plein pointant à droite **paraît** à gauche : sa masse est sur son côté vertical |
| ❙❙ | −0,01 px |
| ×1 · ×4 · ×16 | 0,70 px |
| Replay | 0,89 px |
| New | 0,61 px |

Play et Pause sont maintenant **dessinés** et non écrits : un carré de dessin centré dans le
bouton, avec une correction optique de 0,4 unité sur 12 pour le triangle. Les autres sont du
texte, dont le décalage reste sous le pixel.

**La simulation est inchangée :** 669,3 s · 13 386 pas, `lap:12:1` à 165,2 s tour 11,
`lap:4,11:-1` à 405,7 s tour 25, classement 15(19) · 12(15) · 23(8) · 4(6) · 11(4) · 46(3),
4 sprints, aucune erreur console. Et une relecture complète n'ajoute **aucune** copie à la
liste.

---

## 20. Le numéro de course et le vert, build 79

Mesuré le 28 octobre 2026, liste vidée au départ.

| Ce qui est fait | La liste, par numéro |
|---|---|
| première ouverture du prototype | **n°1** Reference |
| une course menée à la main, un ordre donné | **n°2** · n°1 |
| *New*, une deuxième course menée | **n°3** · n°2 · n°1 |
| la **n°2 effacée** | **n°3 · n°1** |

Les numéros ne se renumérotent pas : la n°3 reste la n°3 après l'effacement de la n°2, et la
n°1 reste la n°1 bien qu'elle soit passée de la troisième à la deuxième ligne. C'est le
numéro **de la course**, pas son rang.

**L'affichage pendant la relecture**, course n°1 chargée et jouée :

| | Mesuré |
|---|---|
| Texte | **« Playing race 1 »** |
| Couleur calculée | **rgb(28, 198, 52)** — soit #1CC634, le vert donné |
| Point REC | **éteint** |

Le numéro est aussi sur chaque ligne de l'onglet Files, dans une pastille devant le nom.

---

## 21. Le centrage des symboles, build 80

Mesuré le 28 octobre 2026 **simulateur déplié**, sur l'écran que l'opérateur regarde.

**Ce qui n'était pas en cause.** La boîte de chaque libellé est centrée dans son bouton à
moins d'un pixel : `display:flex`, `justify-content:center`, 16 px de marge à gauche comme à
droite sur les huit boutons. Les boutons du simulateur déplié eux-mêmes (↑, ↓, +lap, −lap,
Sync all to bunch pace…) sont tous sous **0,4 px** d'écart d'encre.

**Deux erreurs à moi, mesurées :**

| | Mesuré |
|---|---|
| Le trait rouge de mes captures « preuve » | un trait de 1 px posé à `left:50%` : son milieu tombait **0,5 px à droite** du vrai centre |
| La correction de la build 80, au démarrage | mesurée **avant le chargement d'IBM Plex Sans**, donc sur une police de secours |

La seconde est celle que l'opérateur voyait : au lieu de corriger, elle décalait.

| Bouton | Correction posée (police de secours) | Écart restant |
|---|---|---|
| ×1 | −0,28 px | **0,42 px** |
| ×4 | −0,89 px | **−0,19 px** |
| ×16 | −0,53 px | **0,17 px** |
| Replay | −0,93 px | −0,05 px |
| New | −0,95 px | **−0,34 px** |

**Après correction**, la mesure attendant `document.fonts.ready`, simulateur déplié :

| Bouton | Correction posée | Écart restant |
|---|---|---|
| ⏮ 30s | −0,05 px | −0,003 px |
| ▶ | aucune | 0,000 px |
| ❚❚ | aucune | 0,000 px |
| ×1 · ×4 · ×16 | −0,70 px | 0,000 px |
| Replay | −0,88 px | 0,003 px |
| New | −0,61 px | −0,004 px |

**« PLAYING RACE *x* ».** Mesuré sur l'élément lui-même : texte et numéro à **11 px** tous les
deux (le numéro était à 14 px), `text-transform: uppercase`, couleur calculée
**rgb(28, 198, 52)**.

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur console.

---

## 22. Les boutons qui se chevauchent, build 81

Mesuré le 28 octobre 2026, simulateur déplié, après que l'opérateur a dit trois fois que les
symboles n'étaient pas au centre de leurs boutons.

**La cause.** Elle n'était pas dans les lettres, elle était dans la place :

| | Mesuré |
|---|---|
| Largeur de la ligne du transport | **460 px** |
| Largeur demandée par les huit boutons | **476 px** |
| Groupe ▶/❚❚ | comprimé de **6,6 px** |
| Groupe ×1 ×4 ×16 | comprimé de **11,8 px** |
| Groupe Replay/New | comprimé de **11,2 px** |
| **❚❚ sous ×1** | **12,3 px** |
| **×16 sous Replay** | **16,6 px** |

Un bouton comprimé ne rétrécit pas : il déborde **sous son voisin**. Le bord qu'on voit n'est
donc pas le bord du bouton, et le symbole, centré dans le bouton réel, tombe à côté du milieu
de ce qu'on voit. Les mesures d'encre des §19 et §21 portaient toutes sur la largeur réelle,
celle qu'on ne voit pas : elles étaient justes et ne répondaient pas à la question.

**Après correction**, Replay et New posés sur la ligne de l'horloge :

| Ligne | Largeur | Demandée | Éléments comprimés | Chevauchements |
|---|---|---|---|---|
| ⏮ 30s · ▶ ❚❚ · ×1 ×4 ×16 | 460 px | 460 px | **0** | **aucun** |
| 0:00.0 · PLAYING RACE 3 · Replay New | 460 px | 460 px | **0** | **aucun** |

Mesuré dans le cas le plus large, course chargée et « PLAYING RACE *x* » affiché (102,3 px).
*Replay* relance bien la course chargée et *New* ouvre bien une course vide.

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur console.

**Le champ unique.** Mesuré dans la foulée, même jour. Les deux champs se suivaient sur la
ligne de l'horloge, et `.recdot.off` posait `visibility:hidden` : caché, le point REC gardait
sa boîte de **39,3 px**, plus 8 px d'écart, devant « PLAYING RACE *x* ».

| | Ligne du transport | Ligne de l'horloge |
|---|---|---|
| Deux champs, course chargée | 356,0 px | **404,6 px** |
| **Un seul champ**, course chargée | 356,0 px | **357,3 px** |

Les deux lignes font maintenant la même largeur. Le champ dit **REC**, ou
**PLAYING RACE *x***, ou rien, et il n'y a plus qu'un seul élément à la place des deux. Aucun
chevauchement dans aucun des quatre états mesurés : au démarrage, course chargée, en
relecture, course menée.

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur console.

**La grandeur fixe, build 82.** Mesuré le 28 octobre 2026. Le champ unique changeait encore de
taille avec ce qu'il disait : **39,3 px** pour « REC », **102,3 px** pour « PLAYING RACE 1 »,
**117,7 px** pour « PLAYING RACE 888 ». Il est désormais large de **120 px**, assez pour le
plus long des trois.

| État | Ce que dit le champ | Bord gauche | Largeur |
|---|---|---|---|
| Au démarrage | *(rien)* | 712,1 px | **120 px** |
| Course menée | **REC** | 712,1 px | **120 px** |
| En pause | *(rien)* | 712,1 px | **120 px** |
| Course chargée | **PLAYING RACE *x*** | 712,1 px | **120 px** |

Le champ ne bouge pas d'un pixel et rien autour de lui ne glisse. Quand il n'a rien à dire il
se tait **sans rendre sa place**, sinon l'horloge et les boutons se déplaceraient à chaque
départ.

Les deux lignes, course chargée : **357,3 px** pour le transport, **375,9 px** pour l'horloge,
dans une barre de 460 px. L'écart de 18,6 px est la largeur fixe du champ ; il était de 48 px
avec les deux champs. Aucun élément comprimé, aucun chevauchement.

---

## 23. Le tri de la liste des coureurs, build 83

Mesuré le 28 octobre 2026, simulation chargée, quatre premières lignes à chaque fois.

| Ce qui est cliqué | Les quatre premières lignes |
|---|---|
| *(rien)* | 52 ROSSI · 12 HUBER · 7 BRAND · 61 NAVARRO |
| **BIB** | 1 RIVERA · 3 MOREAU · 4 WALSH · 7 BRAND |
| **BIB** à nouveau | 70 SILVA · 67 LEHMANN · 61 NAVARRO · 58 PETROV |
| **Nat** | BEL · BRA · COL · DEN |
| **Nat** à nouveau | SUI · SLO · POR · NED |
| **Name** | BRAND · DE WIT · HUBER · IVERSEN |
| **Name** à nouveau | WALSH · TANAKA · SILVA · SANTOS |

**Les ordres suivent la ligne, pas le rang.** Liste triée par nom à l'envers, donc l'ordre
affiché n'est plus celui de `S.riders` (52 ROSSI · 12 HUBER · 7 BRAND…). Un *+lap* cliqué sur
la **troisième ligne**, celle du BIB 70 :

| | Mesuré |
|---|---|
| Ordre reçu | **70 → gain** |
| Jauge allumée | sur la ligne du **70** |

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur console.

**La ligne Pace sous la liste, build 84.** Mesuré le 28 octobre 2026 : le bas du dernier
coureur de la liste — BIB 15 O'NEILL — est à **562,4 px**, le haut de la ligne Pace à
**564,4 px**. Elle est bien dessous.

Les deux commandes répondent toujours : *Pace* va de 15,0 à 15,1, puis à 14,9, puis revient à
15,0 par pas de 0,1 m/s ; *Sync all to bunch pace* fait tomber le nombre d'ordres en cours de
**1 à 0**, comme le veut le §16 des règles.

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur console.

**Le tri reporté sur la vue Start list, build 85.** Mesuré le 28 octobre 2026, quatre
premières lignes de chaque vue, à chaque ordre.

| Ordre | Vue Simulation | Vue Start list |
|---|---|---|
| *(rien)* | 52 · 12 · 7 · 61 | **les mêmes** |
| **BIB** | 1 · 3 · 4 · 7 | **les mêmes** |
| **Name** | BRAND · DE WIT · HUBER · IVERSEN | **les mêmes** |
| **Name** à l'envers | WALSH · TANAKA · SILVA · SANTOS | **les mêmes** |

**L'édition vise toujours le bon coureur.** Liste triée par nom à l'envers, donc la première
ligne affichée est le BIB 4, **rang 14** dans la liste de départ. Son nom changé en « ESSAI » :
c'est bien le BIB 4 qui porte le nouveau nom, et la ligne descend d'elle-même à sa place
alphabétique. Remis à WALSH ensuite.

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur console.

---

## 24. Les réglages gardés, build 86

Mesuré le 28 octobre 2026, réglages effacés au départ pour partir des valeurs du fichier.

**Ce qui a été changé à la main :** le premier coureur passé de *52 ITA ROSSI* à
**99 FRA DUPONT** (dossard, nation et nom), la piste de 250 m à **200 m**, la distance
Finish → Pursuit A de 10 m à **12 m**, et le transpondeur du 99 passé de 1042 à **2001**.

| | Premier coureur | Piste | Finish → Pursuit A | Transpondeur du 99 |
|---|---|---|---|---|
| Après les changements | 99 FRA DUPONT | 200 m | 12 m | 2001 |
| Après **New** | **les mêmes** | **200** | **12** | **2001** |
| Après **rechargement** | **les mêmes** | **200** | **12** | **2001** |

**Ce qui se passe pendant une course n'est pas un réglage.** Un changement de vélo donné au
BIB 99 en pleine course le fait passer sur le transpondeur 1042 **dans cette course**, et
l'appairage gardé ne bouge pas : il dit toujours 2001. C'est le partage qui a été retenu —
avant le départ, c'est un réglage ; pendant la course, c'est un fait de cette course-là.

**Un défaut trouvé en chemin, et corrigé.** La carte de sprint tombait à chaque image —
192 erreurs dans la console — quand un dossard de `S.noTp` n'existait plus dans la liste de
départ : `chip()` recevait `undefined`. Garder la liste d'une course à l'autre rend ce cas
atteignable, puisqu'un dossard peut changer entre deux courses. La carte passe maintenant ce
dossard-là. **Le chemin exact qui y mène n'a pas été reproduit à la demande** : la correction
supprime la chute, elle n'a pas été vérifiée sur le cas qui l'a provoquée.

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur nouvelle.

---

## 25. Les drapeaux, build 87

Mesuré le 28 octobre 2026.

| | Avant | Après |
|---|---|---|
| Nations dessinées | **16** | **205** |
| Codes en double | aucun | **aucun** |
| Drapeaux ne couvrant pas tout leur cadre | — | **aucun** |

Les 205 ont été regardés un par un sur une planche. Deux étaient à refaire : **KOR**, dont le
taegeuk ne se dessinait pas du tout, et **GUM**, pour la même raison — les deux étaient
tracés avec des arcs. Ils sont refaits avec des formes simples.

**Une nation entrée à la main sort bien son drapeau**, vérifié sur cinq codes qui n'existaient
pas avant — NOR, MAR, RSA, VIE, CAN — et sur un code inventé :

| Code entré | Ce qui s'affiche |
|---|---|
| NOR · MAR · RSA · VIE · CAN | **le drapeau de la nation** |
| XXX | le rectangle gris, comme avant |

**La simulation est inchangée :** 669,3 s · 13 386 pas, aucune erreur nouvelle.

---

## 26. Les champs d'état à l'intérieur de l'ovale — build 92

Proposé le 29 octobre 2026 sur la maquette de l'opérateur, puis repris sur sa deuxième lecture
du même jour (`regles-operateur.md` §17). Mesuré dans le navigateur, fenêtre 1700 × 1000,
piste 250 m, `gap` 10 m.

**Les trois défauts de la première version**, trouvés en pilotant la page, pas à l'œil :

| Défaut | Mesure | Cause |
|---|---|---|
| Le cadre coupait son contenu | contenu **164 px** dans un cadre de **143 px** | un `foreignObject` rogne ce qui dépasse |
| Le bouton de départ tombait sur celui de la boucle Finish | `ARM START` x 755→855, Finish x 818→923, y 426→452 contre 432→456 | les deux visaient le même bas de piste |
| Les clics n'atteignaient pas les boutons de la piste | — | un `foreignObject` capte le pointeur sur **tout son rectangle**, transparent ou non |

**Ce que la build 92 donne**, mêmes conditions. Tout ce qui se pose en bas de l'ovale est
empilé, et chaque étage dégage le suivant :

| Étage | Boîte | Dégagement |
|---|---|---|
| Bouton Pursuit B (en haut) | y 257 → 281 | **26 px** au-dessus du panneau |
| Panneau | y 307 → 399, contenu **389** | **plus de rognage**, 10 px de marge |
| Tours restants, sur la ligne d'arrivée | y 403 → 427 | 4 px sous le panneau |
| Bouton Finish | y 432 → 456 | 5 px sous les tours restants |
| Bouton Pursuit A | y 457 → 481 | 1 px sous le bouton Finish |

La profondeur différente des deux boutons du bas n'est pas un réglage à l'œil : Finish et
Pursuit A ne sont séparés que du `gap`, que l'opérateur règle, et à 10 m leurs deux boutons se
recouvrent de toute leur largeur. Les poser à deux profondeurs les dégage **pour tout `gap`**.

**Les trois provenances des tours restants** répondent : partant de `APP · AUTO` à 40 tours, un
clic sur la provenance donne `APP · MANUAL` **et fait apparaître les deux boutons `−` et `+`**,
qui n'existent pas dans les deux autres modes ; `−` donne **39** ; le bouton de sortie donne
`NOT EXPORTED` et la valeur se barre ; un clic de plus sur la provenance donne `LAP COUNTER`.

**Les quatre états du départ** s'enchaînent : `ARM START` → `START ARMED` → la course part et le
bouton dit `FALSE START` → un clic dit `CONFIRM FALSE START`. Aucune erreur de console sur tout
le parcours.

**Le champ du prochain sprint à deux tours.** Mesuré en course : à `in 2 laps`, la classe `hot`
est bien posée. Le champ passe alors sur le fond **`--warn`, #F2A33A**, texte en #2a1b05, sur
toute la largeur du panneau. Aucune couleur n'a été énoncée par l'opérateur : celle-ci est celle
que le projet réserve déjà à ce qui doit se voir.

**Deux défauts de la deuxième version, corrigés au même build** : le champ du sprint ne prenait
qu'une colonne et tronquait « in 2… », et la boîte des tours restants coupait son bouton à
« EX ». Le premier prend maintenant toute la largeur, la seconde est passée de 186 à 246 unités.

**La troisième lecture**, le même jour (`regles-operateur.md` §17). Le compteur de tours quitte
le panneau pour la ligne d'arrivée, la retenue à l'export cesse d'être un champ, et la boucle
Finish perd son bouton de leader. Mêmes conditions de mesure :

| Étage | Boîte | Dégagement |
|---|---|---|
| Bouton Pursuit B | y 256 → 281 | 26 px au-dessus du panneau |
| Panneau | y 307 → 395, contenu **379** | 16 px de marge |
| `LAP 7 / 40` + `TO GO 33`, centrés sur la ligne d'arrivée | y 429 → 452 | 34 px sous le panneau |
| Bouton Pursuit A | y 457 → 482 | 5 px sous eux |
| Bouton Finish | **supprimé** | — |

La place libérée par le bouton de Finish sert aux deux compteurs, qui se rapprochent de la ligne
de 30 unités de piste.

**Le défaut que la mesure a trouvé et que l'œil n'aurait pas expliqué** : la zone des tours
restants était bien rouge — `rgb(255, 92, 92)` relevé sur l'élément — mais **large de 19 px**,
donc invisible. Une règle plus ancienne, `#togofo .ifb{width:100%}`, écrite quand la boîte était
seule dans son cadre, donnait toute la largeur à la boîte `LAP` et affamait sa voisine. Les deux
se dimensionnent maintenant sur leur contenu : 81 px et 156 px.

**La quatrième lecture.** L'opérateur a jugé la disposition « horrible » et a demandé de relire
ses explications pour y trouver les incohérences. Quatre ont été trouvées, et aucune n'était un
problème de pixels :

| Incohérence | Ce qu'il avait dit | Ce qui avait été codé |
|---|---|---|
| Un libellé inventé | « le bouton va devenir un peu plus grand et plus foncé » | le bouton changeait **aussi** de texte, pour « CONFIRM FALSE START » |
| Une décision contournée | « dans le champ LEADER, retire "56.9 km/h from the track" » | le texte était passé en infobulle, donc gardé |
| Un mécanisme mort | « supprime celui de la ligne Finish » | la ligne verte de la boucle Finish continuait d'être tracée, alors que plus aucun bouton ne pouvait l'allumer |
| Le style empilé par retouches | — | **91 lignes** de style ajoutées en six fois, chaque bloc contredisant le précédent : hauteur de boîte définie deux fois, règles de grille devenues sans objet, sélecteurs visant des éléments supprimés |

La dernière est la cause de la disposition elle-même : une feuille de style écrite par ajouts
successifs ne donne pas une mise en page, elle donne la somme des hésitations. Réécrite d'un
seul tenant, **73 lignes**, et la disposition en est sortie seule.

**Ce que la build 92 donne finalement**, mêmes conditions :

| Étage | Boîte | Dégagement |
|---|---|---|
| Bouton Pursuit B | y 256 → 281 | 33 px au-dessus du panneau |
| Panneau, **quatre boîtes égales deux par deux** | centre (417, 296) dans un ovale de 833 × 620 | — |
| Bouton Pursuit A | y 426 → 451 | 24 px sous le panneau |
| `LAP` + `TO GO`, contre la piste, centrés sur la ligne d'arrivée | y 457 → 481 | 6 px sous lui |

Pursuit A recule d'un cran parce qu'il partage la ligne droite d'arrivée avec les deux
compteurs, qui prennent le bord de piste : ce sont eux qui doivent être « près de la ligne ».

**La cinquième lecture, et la faute qu'elle a révélée.** L'opérateur a redit que la disposition
ne allait pas. En comparant la capture à **sa propre maquette**, la cause était là : il avait
dessiné un **bloc compact de quatre boîtes, deux par deux**, et j'avais livré **trois bandes
pleine largeur empilées**. Ce n'était pas un défaut de réglage, c'était son dessin remplacé par
le mien sans que je m'en aperçoive. Le panneau est revenu à sa forme : `LEADER` et le prochain
sprint sur la première ligne, l'horloge et le bouton de départ sur la seconde.

**L'échelle, et comment elle a fini par être relevée au lieu d'être devinée.** Il a dit, le
29 octobre 2026, que son croquis fait à Paint était plus joli que l'écran codé, puis, l'écran
ayant été agrandi au jugé et jugé pire encore, il a renvoyé sa capture avec trois mots : « utilise
cette échelle ».

**Sa capture fait 962 px de large pour un `viewBox` de 980** : elle est donc à peu près au
rapport 1:1 avec les unités de piste, et ses boîtes se lisent **directement** dedans. Relevé sur
son image :

| Élément | Sur son croquis | Ce qui était codé avant |
|---|---|---|
| Hauteur d'une rangée | **≈ 40 u** | 34 puis 44 |
| Horloge | **≈ 24 px** | 20 puis 30 |
| Chiffre des tours restants | **≈ 28 px** | 27 puis 33 |
| Libellé d'un bouton | **≈ 13 px** | 12 puis 15 |
| Largeur de la première rangée | **≈ 400 u** | 570 |

Les deux essais précédents encadraient sa valeur sans jamais la toucher : d'abord trop petit,
puis **trop grand**. Ce n'était pas une question de goût mais une cote, et une cote se mesure.
La leçon vaut au-delà de ce panneau : un croquis que l'opérateur fournit à la taille de l'écran
**est une cotation**, pas une suggestion.

**Les boutons de leader mordaient sur la piste**, signalé par l'opérateur sur la capture. En les
rapprochant du bord pour gagner de la hauteur, leur profondeur avait été posée à la main à
`HW + 16` alors qu'ils mesurent 36 de haut : leur bord tombait donc **2 unités au-delà du bord
intérieur**. La profondeur se dérive maintenant de la hauteur du bouton, `HW + hauteur/2 + 6`,
et le défaut ne peut plus revenir. Dégagements relevés, en unités de piste :

| | Dégagement |
|---|---|
| Bouton Pursuit B au bord intérieur du haut | **6,0** |
| Bouton Pursuit A au bord intérieur du bas | **6,0** |
| Panneau sous le bouton Pursuit B | **6,0** |
| Panneau au-dessus du bouton Pursuit A | **6,0** |

Résultat : **184 unités de contenu dans un cadre de 184**, contre 236 dans 198 à l'essai
précédent, où le cadre rognait. La hauteur disponible n'est d'ailleurs pas bornée par l'ovale
mais par **les deux boutons de leader**, posés au milieu de chaque ligne droite, donc exactement
au-dessus et au-dessous du panneau.

**Aucune annotation ne subsiste sur l'ovale**, build 94. Compté dans le DOM en pleine course,
groupes séparés et écarts ouverts :

| Ce qui est compté | Relevé |
|---|---|
| `<text>` dans `#oval` hors les dossards des pastilles | **0** |
| Contenu de `#ovlabels` | **vide** |
| Anneaux clignotants `.blink` | **0** |
| Contours de pastille en `#FF5C5C` | **0** |
| `S.inelig`, la mesure | **toujours calculé** |

La dernière ligne est celle qui compte : le dessin est parti, la règle est intacte.

**La taille d'une bulle de groupe**, build 96. L'opérateur a entouré en noir sur une capture la
taille qu'il voulait, puis signalé que celle du dernier groupe restait trop grande. Deux erreurs
successives, et la seconde était la plus instructive :

| Essai | Ce qui dimensionnait la bulle | Ce que ça donnait |
|---|---|---|
| build 95 | toute la largeur de piste, et **7 m** au-delà de chaque extrémité | une bande qui déborde partout |
| premier correctif | le **couloir le plus écarté** occupé par un de ses membres | deux coureurs côte à côte héritaient de **la largeur du peloton** |
| build 96 | l'**étalement réel** de ses membres, et la bulle est centrée sur eux | elle serre le groupe |

Les cotes : demi-largeur = (couloir max − couloir min) / 2 + **15** (le rayon d'une pastille)
+ **4** de marge ; même marge le long de la piste, convertie en mètres. Une bulle n'est donc plus
centrée sur l'axe de la piste mais sur **ses propres coureurs**, ce qui a demandé un tracé
d'arc décalé (`arcPathOff`).

**La ligne du nom s'arrête au bord du texte**, build 98. Elle s'arrêtait à **9 unités du centre**
du nom, alors qu'un nom de huit caractères en occupe une quarantaine de part et d'autre : elle
traversait donc le texte, et son trait se mêlait au halo qui rend le nom lisible — d'où le flou
signalé. Elle s'arrête maintenant au bord de la boîte du nom, mesurée sur la chaîne elle-même
(4,3 unités par caractère à 15 px gras), quel que soit l'endroit de l'ovale. Vérifié dans le
DOM, trois groupes : le point d'arrivée de chaque ligne tombe **hors** du rectangle de son texte.

**Plus aucune marque de leader sur l'ovale**, build 98 : zéro ligne et zéro cercle en `#2ED47A`
dans `#riders`.

**Les couleurs des groupes, build 99** (`regles-operateur.md` §17, points 31 à 33). L'opérateur
a posé la contrainte — « il faut éviter les couleurs se rapprochant de celle de la piste » — et
n'a donné aucune teinte. La piste est le bois **#b5884e, teinte 33°** ; c'est exactement là que
passe un dégradé vert→rouge direct, par le jaune et l'orange. Les deux dégradés qu'il a demandés
l'évitent d'eux-mêmes :

| | Teinte | Chemin |
|---|---|---|
| Tête | **152°** vert | — |
| Devant le peloton | 152° → 200° | par le turquoise |
| Peloton | **200°** bleu cyan | écarté du bleu de la piste, #1d4ed8, teinte 222° |
| Derrière le peloton | 200° → 360° **en montant** | par le violet et le magenta |
| Queue | **360° = 0°** rouge | — |

Le sens de la seconde rampe n'est pas indifférent : en **descendant** de 200 vers 0, elle
repasserait par 120, c'est-à-dire par le vert de la tête de course — un groupe lâché prendrait
la couleur du leader.

Relevé sur quatre groupes forcés : `1-Leader` hsl(152 65% 51%), `2-Bunch` hsl(200 90% 58%),
`3-Behind` hsl(280 95% 63%), `4-Last` hsl(0 100% 68%).

**Les deux situations que l'opérateur a demandé de forcer**, build 99 :

1. **Quatre groupes et plus.** Deux échappés, le peloton, deux lâchés et un dernier très lâché :
   la course a montré `1-Leader · 2-Bunch · 3-Behind · 4-Last`, et à un autre moment
   `1-Bunch · 2-Behind · 3-Behind · 4-Last`, donc **deux groupes `Behind` à la fois**. Le dernier
   est bien `Last` dans tous les cas.
2. **Le croisement de deux noms.** Échantillonné sur **91 images** de cette course, **377 paires**
   de noms examinées : **zéro recouvrement**, et la distance minimale entre deux noms est tombée
   à **87 unités** — c'est-à-dire juste au-dessus du dégagement de 86 que le code impose, donc le
   décalage vers l'extérieur a bien joué.

**Les noms à l'intérieur de l'ovale**, build 100. L'opérateur les trouvait trop éloignés de la
piste et a demandé ce que donnerait l'intérieur. La place disponible, relevée sur le dessin :

| | Place libre |
|---|---|
| Dehors, jusqu'au bord du dessin | **80 à 95 unités** |
| Dedans, dans les virages | **105 unités** |
| Dedans, sur les lignes droites hors boutons | **48 unités** |
| Dedans, au milieu d'une ligne droite, sous un bouton de boucle | **6 unités** |

Un nom en demande environ 34. L'intérieur convenait donc partout sauf sous les deux boutons de
boucle, d'où l'échange : les noms, qui suivent leur groupe, prennent l'intérieur ; les boutons,
qui ne bougent jamais, prennent l'extérieur et ses marges étroites.

Mesuré avant et après, sur la même course à six groupes forcés :

| | Avant (dehors) | Après (dedans) |
|---|---|---|
| Ligne la plus longue | **177 unités** | **113** |
| Ligne typique | — | 22 à 46 |
| Recouvrements de noms, sur ~370 paires | 0 | **3** |

Deux défauts corrigés en chemin. La ligne partait du bord **extérieur** de la bulle alors que le
nom était désormais dedans : elle traversait la bulle et la piste. Et le test de chevauchement
comparait la **distance entre les centres** de deux noms, ce qui le déclenchait sur des noms qui
ne se gênaient pas et les projetait loin de la piste en traînant une longue ligne — c'était
l'autre moitié de ce que l'opérateur voyait. Il compare maintenant leurs **boîtes**.

**Les noms dans des badges**, build 101. L'opérateur voyait la ligne continuer derrière le nom
et a proposé le badge. La ligne s'arrêtait pourtant déjà au bord de la **boîte** du texte : le
calcul était juste, mais quand elle arrive en diagonale elle sort par le bord **haut** de cette
boîte, donc elle vient toucher les lettres et leur halo sombre — à l'œil, elle passe dessous. Un
bord franc règle la question.

La largeur du badge demandait la largeur **réelle** du nom : estimée à 4,3 unités par caractère,
elle se trompait assez pour étrangler le texte ou laisser du vide. Elle est mesurée une fois par
nom sur un élément de texte gardé hors cadre, puis retenue — `renderOval()` tourne vingt fois par
seconde et ne doit rien mesurer. Relevé : `1-Leaders` 73 unités de texte dans 91 de badge,
`2-Bunch` 63 dans 81, `3-Last` 48 dans 66.

Vérifié sur les trois groupes : **aucune ligne ne se termine à l'intérieur d'un badge**, et aucun
texte ne déborde du sien.

**Un badge ne recouvre jamais un coureur**, build 102. L'opérateur a vu celui du peloton posé sur
sa propre tête de peloton. Deux causes, et la seconde ne se voyait que dans les virages :

1. Le badge se posait à une profondeur **fixe depuis le bord de la piste**, alors que la bulle du
   peloton descend plus profond que cet anneau : le badge retombait dedans. Il se tient
   désormais au-delà de la **bulle**.
2. Un badge est un rectangle **aligné sur l'écran**, mais son dégagement se mesure **le long de
   la normale**. Ce qu'il avance vers la piste vaut `|nx| × demi-largeur + |ny| × demi-hauteur`,
   et non la demi-hauteur seule : sur une ligne droite les deux coïncident, mais dans un virage
   c'est la **largeur** qui pointe vers la piste, environ quatre fois plus. Premier correctif
   seul : **59** recouvrements sur 4 880 paires badge/coureur. Les deux ensemble : **0** sur
   4 832 paires, 93 images échantillonnées.

**Un badge au plus près de sa bulle**, build 103. Le dégagement se calculait sur le **coin** du
badge, son point le plus avancé vers la piste. Or le long de la ligne, qui passe par son milieu,
la distance est tout autre : dans la partie **oblique** d'un virage, le coin avance de **40
unités** là où le bord du badge n'en avance que **17**. L'écart paraissait donc énorme sans
l'être.

Le badge se pose maintenant sur la distance **le long de la ligne**, et ses coins sont rattrapés
par un test explicite contre les coureurs — ce qu'un badge ne doit jamais couvrir — qui le
repousse par pas de 12 unités seulement, autant de fois qu'il le faut. Resserré sans ce test, il
revenait **4** fois sur un coureur en 4 752 paires ; avec lui, **0**.

**L'écart bulle → badge, constant tout autour**, build 105. L'opérateur a fourni cinq images du
même virage où l'écart variait du simple au triple. Trois causes, toutes des erreurs de signe ou
de direction, et aucune n'était celle que les premières mesures désignaient :

| Cause | Effet |
|---|---|
| Le bout de la ligne se calculait `− normale × t`, hérité de l'époque où les badges étaient **dehors** et la profondeur positive. À l'intérieur elle est négative : la même soustraction envoyait le bout **au-delà** du badge | des lignes de 24 à 96 unités traversant tout |
| Le test contre le panneau servait de **motif à reculer**, alors que les pas vont vers l'intérieur et que le panneau **est** à l'intérieur : chaque pas aggravait le recouvrement | le badge s'enfonçait de six pas |
| Le rattrapage des coins par paliers de 12 unités | sauts de 22 unités en moyenne, 60 au pire |

Deux fausses pistes en chemin, écartées par la mesure : la largeur de la bulle, soupçonnée de
vaciller, est **rigoureusement constante** (86 unités, zéro variation sur 119 images) ; et
« l'écart au coureur le plus proche » est un mauvais indicateur, puisqu'il change dès qu'un
**autre** coureur devient le plus proche, même badge immobile.

Mesuré après correction, sur 150 images :

| | Avant | Après |
|---|---|---|
| Longueur de la ligne | 24,5 à 96,0 | **12,4 à 12,6** |
| Saut d'une image à l'autre | 20,8 en moyenne, 70,8 au pire | **0,03 en moyenne, 0,1 au pire** |
| Badge posé sur un coureur | 30 images sur 150 | **0** |

Il subsiste **1 effleurement sur 1 216 paires** badge/coureur dans le cas à plusieurs groupes :
un coin de badge frôle un coureur d'un autre groupe. L'éliminer demanderait de dégager le badge
sur son coin, ce qui ramènerait les sauts — c'est le compromis assumé.

**Deux groupes qui se dépassent**, build 106. L'opérateur a demandé ce que font leurs badges à
cet instant. La réponse a demandé de forcer le bon cas, car le plus fréquent ne le produit pas :

- **Le peloton qui double un lâché ne produit aucun croisement de badges.** Tant que le lâché
  roule dans l'amas du peloton, sa bulle n'est **pas tracée** — il n'est montré que par sa
  pastille, comportement antérieur à ce travail. Il n'y a donc pas deux badges à séparer.
- **Le vrai cas est une échappée qui double un lâché**, toutes deux hors du peloton. Forcé, il
  donne 21 images de rapprochement sur 224.

Mesuré sur ce cas :

| | Recouvrements | Distance minimale entre centres |
|---|---|---|
| Seuil vertical à 22 unités | **13** sur 30 rapprochements | 11 |
| Corrigé à 2·demi-hauteur + air | **10** sur 23 | 14 |
| Avec le glissement le long de la piste | **0** sur 21 | **37** |

Deux défauts trouvés là : le seuil vertical valait **22** alors que deux badges de 24 de haut se
touchent déjà à 24 — ils étaient déclarés dégagés en se recouvrant. Et la profondeur seule ne
suffit pas : sur une ligne droite il n'y a que 48 unités avant le panneau, donc deux ou trois
pas, après quoi le badge n'avait plus où aller. Le glissement latéral lui donne la seconde
liberté qui manquait, et un contrôle contre les coureurs a dû lui être ajouté, car glisser peut
porter un badge au-dessus des coureurs d'un **autre** groupe — 7 cas sur 4 784 avant ce
contrôle, **0** après.

**Il n'y avait pas la place pour les deux**, build 108. L'opérateur a signalé un badge manquant :
sa bulle et sa ligne étaient tracées, son nom avait disparu. Il était passé **sous le bloc des
champs**, qui est peint après les noms et les recouvre.

La mesure a montré que ce n'était pas un défaut de placement mais un manque de place :

| | |
|---|---|
| Anneau libre entre la piste et le bloc, en haut et en bas | **48 unités** |
| Ce qu'un badge y demande : débord de la bulle (13) + écart (14) + demi-badge le long de la ligne (12) + demi-hauteur (12) | **51 unités** |
| Anneau libre sur les côtés | 105 unités |

Trois tentatives pour loger les badges quand même, toutes mesurées :

| Tentative | Résultat |
|---|---|
| Interdire le bloc comme position | aucune position acceptable sur les lignes droites : le badge saute de repli en repli, **12,4 unités par image** |
| Repli sur la dernière position essayée | le badge part à l'extrême et **disparaît** sous le bloc — le défaut signalé |
| Repli sur la position normale | le badge reste visible, mais **77 images sur 204** le montrent partiellement sous le bloc |

D'où la décision de l'opérateur de sortir le bloc. Avec l'intérieur libre, la mesure devient
nette : ligne de **9,5 unités, saut de 0,00 d'une image à l'autre**, et **zéro** badge sur un
coureur en 1 760 paires.

**Ce qui est revenu à l'intérieur**, build 109 (`regles-operateur.md` §17, point 43). La
rangée du départ et le champ `LEADER` font **84 unités** de haut pour 280 disponibles, et un
badge se pose à **51 unités** du bord de piste : il reste une quarantaine d'unités de
dégagement de chaque côté, là où le bloc entier n'en laissait aucune. Mesuré sur 202 images :
**zéro** badge sous le bloc, **zéro** recouvrement entre badges, **zéro** hors du cadre.

Le bloc n'est jamais une raison de quitter la place normale, seulement un veto sur un badge
qu'on **pousse** : la ligne flotte alors de 2,5 unités en moyenne dans les parties obliques,
contre 0,00 avec l'intérieur entièrement vide.

**L'intérieur en trois colonnes**, build 111. Deux cadrages successifs ont été faux parce que
la largeur avait été estimée au lieu d'être mesurée : à **416** unités le contenu était rogné —
horloge coupée, `ARM FINISH` amputé — et à **480** deux libellés passaient à la ligne. Les
colonnes demandent **112 + 130 + 194** plus les écarts.

Sur l'offre de l'opérateur de réduire les tailles, le bloc est passé de **510 × 118** à
**446 × 92** : boutons d'armage et champs à 28 unités de haut au lieu de 32, horloge à 20 px au
lieu de 24, chiffre des tours restants à 24 au lieu de 28.

Ce que cela rend aux badges, mesuré sur ~200 images :

| Bloc | Badges partiellement couverts |
|---|---|
| 510 × 118 | **23 images**, 4 % du badge en moyenne, 14 % au pire |
| 446 × 92 | **0** |

**Les neuf couleurs d'état, relevées sur le rendu** et non sur les classes, après que
l'opérateur a signalé qu'`ARM FINISH` ne fonctionnait pas (`pitfalls.md` D17) :

| État | Fond relevé |
|---|---|
| `ARM START` au repos | `rgb(255, 92, 92)` |
| `START ARMED` | `rgb(28, 198, 52)` |
| `FALSE START` | `rgb(58, 64, 70)` |
| `ARM FINISH` au repos | `rgb(15, 17, 19)` |
| `ARM FINISH` armé | `rgb(28, 198, 52)` |
| `SET NEXT AS LEADER` armé | `rgb(28, 198, 52)` |
| Ligne de la boucle armée | `stroke-opacity` à **1** |
| `TO GO` exporté | `rgb(28, 198, 52)` |
| `TO GO` retenu | `rgb(255, 92, 92)` |

Avant correction, `ARM FINISH` armé relevait `rgb(15, 17, 19)` — la couleur du repos.

**L'horloge arrêtée sur le vainqueur**, mesurée sur une course de 2 tours, ligne armée avant le
départ : l'horloge s'est figée à **0:33.7** au passage du premier coureur sur la ligne, elle y
était encore 2,5 secondes plus tard pendant que la course continuait derrière lui, et la ligne
s'était désarmée d'elle-même.

**Un défaut trouvé à l'œil et non par la mesure** : le champ du leader s'était rangé à côté de
l'horloge, laissant le bouton de départ seul à la ligne suivante — alors que l'opérateur les
veut côte à côte. Le leader prend désormais la ligne entière. Une boîte peut être parfaitement
placée et parfaitement à la mauvaise place : les deux lectures restent nécessaires.

## 27. La barre du haut après le déménagement du transport — build 113

Fenêtre de 1920 px, prototype ouvert en `file://`, rail du simulateur ouvert puis masqué.

| Mesure | Valeur |
|---|---|
| Largeur de la barre | 1427 px |
| Hauteur de la barre | 38 px |
| Bloc du transport | 555,3 px de large, de x = 421,4 à x = 976,7 |
| Dépassement de la barre (`scrollWidth − clientWidth`) | 0 px, rail ouvert comme rail masqué |
| Dépassement de la page | 0 px (`scrollWidth` = `innerWidth` = 1920) |
| Position du bloc, rail masqué | identique : x = 421, largeur 555 px |

Le bloc ne bouge plus d'un pixel quand le rail se ferme, puisqu'il ne change plus de parent. Le
champ d'état garde ses 120 px même vide — c'est ce qui tient l'écart entre l'horloge et
`Replay`, et c'est voulu : un seul champ dit `REC` ou `PLAYING RACE n` (§17, 28 octobre 2026).

## 28. La timeline resserrée — build 114

Fenêtre de 1920 px, rail du simulateur masqué, course lancée puis un groupe de trois coureurs
créé à la main pour obtenir deux blocs.

| Mesure | Avant | Après |
|---|---|---|
| Largeur de la colonne | 360 px | 292 px |
| Colonnes d'une ligne de coureur | `34px 24px 36px 1fr 0 62px` | `34px 22px 36px 1fr 0 auto` |
| Barre d'actions au survol | `left:108px right:66px`, 158 px utiles | `left:40px right:3px`, 220 px utiles |
| Place demandée par les quatre boutons | 214 px | 214 px |
| Dépassement d'une ligne, d'un en-tête, du corps | — | 0 px, 0 px, 0 px |
| Dépassement de la page | — | 0 px |

La barre d'actions du survol laisse **40 px** au dossard, sans quoi plus aucune ligne n'est
sélectionnable : couvrant toute la largeur, elle interceptait le clic et le transformait en
« +1 lap ». C'est cette contrainte, et non l'esthétique, qui fixe la largeur de la colonne :
les quatre boutons demandent 214 px, donc la colonne ne peut pas descendre sous 292 px tant
qu'ils sont là.

Couleurs des bordures gauches relevées sur les deux blocs : `rgb(49, 211, 135)` pour
`1-Leaders`, `rgb(52, 180, 244)` pour `2-Bunch` — les couleurs de leurs bulles sur l'ovale.

## 29. Ce que l'en-tête d'un bloc porte après le nettoyage — build 115

Relevé sur les deux blocs de la même course qu'au §28 :

| Bloc | En-tête lu dans le DOM |
|---|---|
| Groupe de tête | `1-Leaders` · `3 riders` · `leader` |
| Peloton | `2-Bunch` · `13 riders` · `−7 m` |

Dépassement d'un en-tête, d'une ligne de coureur, du corps de la colonne : 0 px.

## 30. La colonne de droite — build 116

Fenêtre de 1920 px, rail du simulateur masqué, course menée jusqu'à l'ouverture du sprint 1.

| Mesure | Valeur |
|---|---|
| Colonne de droite | 700 px (`flex:0 1 700px`, plancher 560 px) |
| Ordre du sprint (`.sleft`) | 390 px, dont 120 px pour le nom |
| Liste de départ (`.sright`) | 270 px, dont 90 px pour le nom |
| En-tête de la carte | deux lignes, 58 px (il demande 706 px sur une seule) |
| En-tête du tableau de l'ordre | une ligne, 20 px |
| Ovale pendant le sprint | 874 px de large |
| Ovale une fois la carte fermée | 1584 px |
| Dépassement de la carte, de la liste, de la page | 0 px, 0 px, 0 px |

À 620 px la carte débordait de 88 px, l'en-tête n'ayant pas la place de ses boutons. À
700 px, il tient sur deux lignes et le nom d'un coureur garde 120 px dans l'ordre.

## 31. La colonne d'actions — build 117

Fenêtre de 1920 px, rail masqué, un coureur lancé 10 m/s plus vite que le peloton pour
obtenir une proposition de tour gagné.

| Mesure | Valeur |
|---|---|
| Timeline | 294 px |
| Colonne d'actions | 268 px |
| Barre de sélection | 168 px de haut, aucun dépassement |
| Cartes de proposition | 524 px de haut, aucun dépassement horizontal |
| Ovale | 1306 px hors sprint, 736 px pendant un sprint |
| Journal | 1014 px pendant un sprint, 1584 px hors sprint (il couvre les deux colonnes) |
| Propositions restées dans la timeline | 0 |
| Propositions dans la colonne | 1 — « Lap gained? · BIB 52 · Lap 17 » |
| Dépassement de la page | 0 px |

### Ce que donne une fenêtre de 1440 px

La colonne du sprint tombe à son plancher de 560 px. Le nom d'un coureur n'a plus que 30 px
dans l'ordre et 43 px dans la liste de départ, contre 120 et 90 à 1920 px. Rien ne déborde et
rien ne tombe à zéro, mais **les noms y sont coupés** : l'écran est dessiné pour une fenêtre
large.

## 32. Les seize combinaisons des quatre dispositions — build 118

Ovale dessiné (taille réelle du dessin, proportions gardées), pendant un sprint ouvert. Aucune
combinaison ne déborde, et la liste de départ reste entière dans toutes.

| Dispositions actives | 1920 × 1080 | 1440 × 900 |
|---|---|---|
| aucune (état livré) | 596 × 359 | 253 × 152 |
| carte resserrée | 736 × 443 | 296 × 178 |
| passages repliés seuls | 596 × 359 | 253 × 152 |
| actions sous l'ovale **ou** timeline repliée | 874 × 526 | 531 × 320 |
| carte resserrée + l'une des deux | 1014 × 610 | 574 × 346 |
| actions sous l'ovale + timeline repliée | 953 × 574 | 654 × 394 |
| les trois | 1014 × 610 | 654 × 394 |
| **les quatre** | **1292 × 778** | **852 × 513** |

Trois faits en ressortent :

- **Replier les passages ne sert à rien seul** : la largeur limite avant la hauteur. Cela ne
  compte qu'avec les trois autres, et le gain est alors considérable (1014 → 1292).
- **Replier la timeline et descendre les actions donnent exactement le même gain**, mais
  replier la timeline ne coûte aucune hauteur.
- **La carte resserrée ne vaut qu'au-dessus de son plancher** : 560 px en 1920, 520 en 1440.
  Le nom d'un coureur y passe de 120 à 66 px dans l'ordre et de 90 à 73 px dans la liste.

## 33. La timeline étroite et la carte sans noms — build 119

Ovale dessiné pendant un sprint ouvert, après le passage de la timeline à 118 px et le retrait
des noms de la carte.

| | 1920 × 1080 | 1440 × 900 |
|---|---|---|
| Avant (build 118, aucun essai actif) | 596 × 359 | 253 × 152 |
| **Build 119, aucun essai actif** | **1010 × 608** | **570 × 343** |
| avec les actions sous l'ovale | 953 × 574 | 654 × 394 |
| avec les actions sous l'ovale et sans les passages | 1288 × 775 | 848 × 511 |

La carte du sprint passe de 700 à **460 px** (420 en 1440). La colonne de la timeline passe de
292 à **120 px**. En 1440, l'ovale gagne ainsi **5,1 fois** sa surface d'avant.

Curiosité à connaître : en 1920, **descendre les actions sous l'ovale fait perdre** 1010 → 953.
La colonne ne valait plus que 278 px de largeur alors que la barre coûte 128 px de hauteur, et
l'ovale y était déjà limité par la hauteur. Les deux essais ne valent donc ensemble que si les
passages se replient aussi.

Vérifié au clic : un coureur sélectionné donne 13 actions dans la colonne, dont `Laps…` et
`Leader` ; un clic sur l'en-tête du bloc sélectionne les 16 coureurs et laisse les 11 actions
de groupe. Aucun débordement, et la liste de départ reste entière.

### La couleur de la bande d'en-tête

Relevée au pixel sur le croquis de l'opérateur du 29 octobre 2026 (`images/25.png`, bande des
28 premières lignes) : fond `rgb(51, 180, 244)` sur 2856 pixels, texte `rgb(0, 0, 0)`. Le
prototype rend `rgb(52, 180, 244)` -- la couleur du peloton, `hsl(200 90% 58%)`, la même que
sa bulle sur l'ovale.

## 34. L'écran de course sans le bandeau des passages — build 120

| | 1920 × 1080 | 1440 × 900 |
|---|---|---|
| Ovale hors sprint | 1611 × 970 | 1269 × 764 |
| Ovale pendant un sprint | 1288 × 775 | 848 × 511 |
| Hauteur de la barre d'actions | 34 px | 60 px (deux lignes) |
| Carte du sprint | 460 px | 420 px |
| Dépassement de la barre d'actions, de la page | 0 px, 0 px | 0 px, 0 px |

Le panneau `Race log` ouvert couvre l'écran de la barre du haut au bas de la page. Ses quatre
onglets donnent 10, 4, 4 et 17 lignes sur la course de contrôle, contre une dizaine de lignes
visibles dans le bandeau de 300 px qu'il remplace.

Rappel du chemin parcouru sur l'ovale pendant un sprint, en 1440 : **253 × 152** à la
build 118, **570 × 343** à la build 119, **848 × 511** à la build 120 — soit **dix-huit fois**
la surface de départ.

## 35. La carte d'une proposition dans la barre d'actions — build 121

Fenêtre de 1440, trois coureurs lancés 8 m/s plus vite que le peloton : ils prennent un tour
ensemble et donnent une proposition à trois dossards.

| Mesure | Valeur |
|---|---|
| Barre d'actions, proposition comprise | 94 px de haut, 848 px de large |
| Dépassement de la carte, de la page | 0 px, 0 px |
| Boutons ✓ posés sur les lignes de la timeline | 0 (contre 3 à la build 120, qui coupaient le code pays) |

Vérifié au clic : un ✓ de coureur fait passer la carte de trois dossards à deux et inscrit au
journal « BIB 7 · laps gained 0 → 1 · effect Lap 21 · validated proposal ». Les deux autres
restent en attente.

## 36. L'ovale collé en haut, rien de vide sous les actions — build 123

Fenêtre de 1440 × 900, rail masqué.

| | Sans proposition | Avec une proposition |
|---|---|---|
| Panneau de l'ovale | 1280 × 782 | 850 × 662 (sprint ouvert) |
| Ovale dessiné | **1280 × 771** | 850 × 512 |
| Place vide sous les actions | **10 px** (la marge de la page) | **10 px** |

La build 122 réservait la hauteur de la ligne des propositions pour que l'ovale ne saute pas :
95 px restaient vides sous les actions et l'opérateur l'a refusé. L'ovale prend maintenant
toute la hauteur disponible, son dessin calé en haut de son panneau
(`preserveAspectRatio="xMidYMin meet"`), et il se redimensionne quand une proposition arrive.

Hors sprint, le dessin gagne encore : 697 → **771 px** de haut en 1440. Pendant un sprint, il
reste limité par sa largeur, et les 150 px qui restent sont dans le panneau, sous la piste.

## 37. Le cadre du dessin — build 125

La piste dessinée, en 1440 × 900 : **755 × 338** contre **659 × 295** à la build 121, à carte
égale (420 px, deux colonnes). Le gain vient du seul cadre du dessin ; la carte empilée sur une
colonne, qui portait la piste à 886 × 397, a été refusée par l'opérateur et retirée.

1. **Le cadre du dessin était trop grand.** Relevé sur un tour complet, le dessin occupe
   `x 67..913` et `y 53..537` ; le cadre disait `0 0 980 590`. Il dit maintenant
   `63 49 854 492`, soit le contenu plus 4 unités de marge. Vérifié sur 70 images d'un tour :
   **0 fois** le dessin ne sort du cadre. Un premier essai à `84 38 832 514` coupait la bulle
   du peloton dans le virage gauche -- les bulles dépassent la piste de 13 unités, ce qu'une
   estimation ne donne pas et qu'un relevé sur un tour donne.
2. **Le reste du vide tient à la largeur de la carte, et il est irréductible.** L'ovale est
   limité par sa largeur dès que la carte est là : avec 420 px de carte il fait 850 px de
   large, donc 525 de haut pour 755 disponibles. Pour qu'il remplisse la hauteur il lui
   faudrait 1 222 px, c'est-à-dire une carte de 46 px. **Le vide en hauteur ne peut pas être
   supprimé tant que la carte est à droite.**

## 38. Ce que la refonte a changé, mesuré — build 125

Même fenêtre (1440 × 900), même script, trois états du prototype. « Piste » est la taille du
velodrome dessiné à l'écran.

| | En course | Pendant un sprint | Carte visible en course |
|---|---|---|---|
| Build 112, avant la refonte | 670 × 300 | **l'ovale disparaissait** | non |
| Build 118, sa page redessinée | 639 × 286 | 195 × 87 — **9 %** de sa surface | non |
| **Build 125** | **755 × 338** | **755 × 338 — 100 %** | **oui** |

Le gain n'est pas d'abord la taille : c'est que **l'écran ne bouge plus**. Jusqu'ici, ouvrir un
sprint faisait disparaître la piste, puis la réduisait à 9 % de sa surface. Elle garde
maintenant exactement la même taille, sprint ou pas, et la carte est là en permanence.

### L'ovale calé en haut — build 126

| | 1440 × 900 | 1920 × 1080 |
|---|---|---|
| Haut de la piste, depuis le haut de la page | 134 px | 174 px |
| Vide au-dessus de la piste, dans le panneau | 75 px (la bande du bouton `SET NEXT`) | 115 px |
| Vide sous la piste, dans le panneau | 341 px | 333 px |
| Piste dessinée | 755 × 338 | 1146 × 513 |

Le vide est désormais **entièrement sous l'ovale**, et non plus réparti de part et d'autre.

## 39. Les deux dispositions sous l'ovale — build 127

Une proposition de tour à trois dossards affichée, rail masqué.

| | 1440 × 900 | 1920 × 1080 |
|---|---|---|
| Piste dessinée | 755 × 338 | 1134 × 508 |
| Haut de la piste | y = 134 | y = 172 |
| Zone sous l'ovale | 848 × 333 | 1288 × 268 |
| · propositions, disposition empilée | 848 × 265 | 1288 × 226 |
| · actions, disposition empilée | 848 × 60 | 1288 × 34 |
| · actions, disposition en colonne | 268 × 333 | 268 × 268 |
| · propositions, disposition en colonne | 572 × 333 | 1012 × 268 |
| Place vide sous les actions | 10 px (la marge de la page) | 10 px |

La zone remplit exactement ce que l'ovale laisse : il n'y a plus de place vide nulle part,
dans l'une comme dans l'autre disposition.

## 40. Les commandes aérées — build 128

| | Avant | Après |
|---|---|---|
| Bouton d'action : texte | 12 px | 13 px |
| Bouton d'action : marges intérieures | 2 × 7 px | 7 × 13 px |
| Écart entre deux boutons | 4 px | 8 px |
| Écart entre deux familles de boutons | 5 px | 10 px, chaque famille à la ligne |
| Hauteur de la barre d'actions (1440, empilée) | 60 px | 182 px |
| Carte de proposition : marges intérieures | 5 × 7 px | 12 × 16 px |
| Carte de proposition : ✓ d'un coureur | 17 px de haut | 29 px |

La barre d'actions occupe maintenant 182 px des 333 px de la zone en 1440, et la carte de
proposition 143 px. Rien ne déborde dans aucune des deux dispositions, à 1440 comme à 1920.

## 41. La hauteur de la timeline à 24 coureurs — build 129

La hauteur demandée par la colonne se calcule exactement, et la formule a été vérifiée sur un
cas réel monté à 24 coureurs inscrits :

`hauteur = cadre_du_bloc × G + ligne × R + bande × (G + 1)`

| | Build 128 | Build 129 |
|---|---|---|
| Cadre d'un bloc | 43 px | 36 px |
| Ligne d'un coureur | 26 px | 22 px |
| Bande de dépôt | 32 px | 16 px |
| En-tête d'un bloc | 35 px | 30 px |
| **24 coureurs en 2 groupes** | 806 px (prédit et mesuré) | **648 px (prédit et mesuré)** |

Nombre de groupes qui tiennent sans défiler, avec 24 coureurs :

| | 1440 × 900 (830 px) | 1920 × 1080 (1010 px) |
|---|---|---|
| Build 128 | 2 groupes | 4 groupes |
| **Build 129** | **5 groupes** | **9 groupes** |

Au-delà, la colonne défile, mais l'en-tête du bloc reste collé en haut : vérifié en forçant le
défilement, après 150 px de défilement l'en-tête est à 3 px du haut de la colonne au lieu
d'être sorti de l'écran, et il porte toujours son nom, son nombre de coureurs et son écart.

## 42. Les dossards sur la piste — build 131

La piste fait `HW = 30` de demi-largeur dans le dessin. Un dossard posé sur la file extérieure
atteint `LANE + DOT_R` depuis l'axe.

| | Avant | Après |
|---|---|---|
| Rayon d'un dossard (`DOT_R`) | 15 | 10 |
| Écart des files (`LANE`) | 24 | 19 |
| Portée depuis l'axe | **39** pour 30 permis | **29** |
| Écart minimal demandé entre deux dossards | 32 | 24 |
| Décalages le long de la piste | 0, ±9, ±18 | 0, ±7, ±14 |
| Taille du numéro | 13 | 10 |

Relevé sur 60 images d'un tour, en mesurant la distance de chaque dossard au tracé de la piste :
**débordement maximal 29,2** pour 30 permis, et **0 paire de dossards qui se chevauchent**.

### La bulle rentrée dans la piste — build 132

La bulle se mesurait sur ses coureurs (`LANE + DOT_R + BUB_M`), soit 43 avant la build 131 et
33 après : elle dépassait encore. Ses deux bords sont maintenant **ramenés dans la piste**, et
son milieu s'en déduit.

Borner la seule demi-largeur ne suffit pas : une bulle décentrée -- un groupe sur la file du
milieu et la file extérieure -- dépasse encore du côté large. Et borner les bords à `HW` tout
rond laisse encore **31,2**, parce que le trait de 1,5 qui dessine le bord est centré dessus et
que la bande suit la courbe par segments. La borne est donc `HW − 2`.

Relevé sur 60 images d'un tour, distance au tracé de la piste, bord du trait compris :

| | Mesuré | Permis |
|---|---|---|
| Dossard le plus éloigné | 29,1 | 30 |
| Bord de bulle le plus éloigné | **29,3** | 30 |

## 43. La barre du haut en 1440 avec le rail ouvert — build 133

En rendant la disposition en colonne celle par défaut, trois défauts de la barre sont apparus à
la mesure, qu'aucune capture n'avait montrés :

| Défaut | Mesure | Correction |
|---|---|---|
| Le sélecteur de disposition était écrasé | **2 px** de large, incliquable | `flex:0 0 auto` |
| Le champ d'état vide gardait sa place | 120 px pour rien | il ne la prend que lorsqu'il a un texte |
| Le champ d'état réservait la place du plus long | 120 px pour « REC » qui en demande 44 | il prend la largeur de son texte |

État final, barre de 945 px (rail ouvert) et 1406 px (rail masqué) :

| Texte du champ d'état | Dépassement | `Race log` visible | Sélecteur visible |
|---|---|---|---|
| vide | 0 px | oui | oui |
| `REC` (44 px) | 0 px | oui | oui |
| `PLAYING RACE 2` (109 px) | 0 px | oui | oui |

Quand la barre est pleine, c'est le mot « RACE LEADER » qui cède — de 85 px à 0 dans le cas le
plus serré — et non le bouton `Race log`.

### Le sélecteur dans le panneau des actions — build 134

Vérifié dans les deux dispositions, en 1440 : le sélecteur est **dans** le panneau des actions
(coin haut droit, à 9 px du haut et 10 px de la droite), il ne recouvre jamais le bouton
`Clear` -- la ligne de sélection lui réserve 62 px -- et la bascule fonctionne dans les deux
sens. La barre du haut, débarrassée de lui, ne déborde plus dans aucun état.

## 44. L'équilibre de l'écran — build 136

La piste dessinée et la zone du bas, rail masqué :

| Fenêtre | Piste build 134 | **Piste build 136** | Zone du bas | La barre d'actions défile | Vide sous elle |
|---|---|---|---|---|---|
| 1910 × 900 | 1035 × 464 | **803 × 359** | 302 px | non | 10 px |
| 1440 × 900 | 886 × 397 | **710 × 318** | 302 px | non | 10 px |
| 1920 × 1080 | 1323 × 592 | **1081 × 484** | 302 px | non | 10 px |

La piste perd donc 40 % de sa surface, et la timeline gagne 42 % de largeur -- 118 → 168 px --
avec des éléments à l'échelle. Avec 24 coureurs en deux groupes la colonne demande 810 px pour
830 disponibles en 1440 : elle tient toujours sans défiler.

**Un piège rencontré en chemin** : en passant la colonne centrale d'une grille à une boîte
flexible, l'ordre du document reprend la main sur `grid-row`. La zone du bas, écrite avant
l'ovale dans le document et placée en seconde rangée par la grille, est repassée **au-dessus**
de l'ovale sans qu'aucune erreur ne soit levée. Corrigé en remettant le bloc dans l'ordre du
document.

## 45. L'écran sans cadre autour de l'ovale — build 139

Fenêtre de 1910 × 900, celle de l'opérateur, rail masqué :

| Disposition | Piste dessinée | Place libre de part et d'autre de la piste | La barre d'actions défile |
|---|---|---|---|
| Build 136 | 803 × 359 | **2 bandes encadrées de 190 px** | non |
| **139, empilée** | **979 × 438** | aucune : le dessin remplit la largeur | non |
| **139, en colonne** | 806 × 361 | aucune ; la place libre est celle des propositions, à droite des actions | non |

Deux essais faits, regardés et abandonnés en chemin, qui sont consignés pour ne pas être
refaits :

- **Élargir la timeline à 290 px** : une ligne ne porte qu'un dossard, un drapeau et un code
  pays ; la moitié droite de chaque ligne restait vide. Revenue à 176 px.
- **Sortir la barre d'actions de la zone du bas pour la mettre à côté de l'ovale** : en
  1440 × 900 la piste tombait à 438 × 196, soit le quart de sa surface. Abandonné.

## 46. Les commandes de la carte du sprint — build 140

Relevé des commandes de `#scard`, carte ouverte et carte en attente, et comparaison avec la
build 118 (avant que la carte devienne permanente) :

| | Build 118, sprint ouvert | Build 140, sprint ouvert | Build 140, hors sprint |
|---|---|---|---|
| Familles de commandes | clear, close, detected, live, manual, ne, send, shift, sort, target | **les mêmes** | les mêmes **sauf** close et send |
| Boutons | ← → Manual, Detected order, Clear and record, Live, Live · waiting, Close, Not eligible, 1 2 3 4, BIB, NOC | **les mêmes** | les mêmes sauf Live · waiting et Close |

Rien n'avait donc disparu de la carte **ouverte** ; c'est la carte **permanente** qui était
livrée sans aucune commande.

Vérifié au clic, hors sprint : le tri par pays réordonne la liste (`ESP FRA GBR NED SLO` →
`BEL BRA COL DEN ESP`) et le retour par dossard la rétablit ; la flèche → fait passer le tour
jugé de 10 à 11 et la flèche ← le ramène.

## 47. La carte du sprint aérée — build 143

| | Avant | Après |
|---|---|---|
| Ligne d'une place | 28 px | 36 px |
| Ligne de la liste de départ | 26 px | 30 px |
| Marges de la carte | 6 × 10 px | 10 × 12 px |
| Écart entre les deux colonnes | 18 px | 20 px |
| Rangée « place suivante » | 170 px de large, dans la colonne de droite, boutons `1` à `4` repliés sur deux lignes | **309 px, sous l'ordre**, boutons `1st` à `4th` sur une ligne |

Vérifié : les quatre boutons sont bien sur une seule ligne, la carte ne déborde ni en largeur
ni en hauteur, et la liste de départ reste entière.

## 48. Les passages inéligibles dans la carte — build 146

Cas forcé sur un sprint ouvert, par le harnais `window.__proto` : deux coureurs déclarés
inéligibles **avant** leur passage, et un coureur déjà classé déclaré inéligible **après** le
sien.

| | Avant la correction | Après |
|---|---|---|
| Coureur inéligible au moment de son passage | ligne grisée « no points », sans rang | **identique** : `12 SUI no points`, `52 ITA no points` |
| Coureur classé qui devient inéligible ensuite | **disparaît du classement**, sans rang et sans ligne grisée | **garde sa place** (`1:15` reste premier) |
| Compteur « Not eligible » | 0 | 0 -- il ne compte que les écartés par l'opérateur |

Les lignes grisées se placent dans l'ordre des passages : les deux coureurs ci-dessus ayant
franchi après les cinq premiers, leurs lignes suivent les cinq places.

## 49. L'annonce des coureurs sans points — build 147

**Vérifié en course**, sur un sprint ouvert avec deux passages jugés inéligibles :

| | Résultat |
|---|---|
| Compteur de la carte | `Not eligible · 2` |
| Lignes du bloc | `15th · 12 SUI · no points · not eligible when he crossed`, `16th · 52 ITA · …` |
| Flèche de reclassement | absente sur ces deux lignes, présente sur un écarté par l'opérateur |
| Lignes grisées de l'ordre | `12 SUI no points`, `52 ITA no points`, sans rang |

**Vérifié en apparence seulement** pour la timeline et le badge, l'état `S.inelig` ne se
produisant pas dans une course simulée (c'est le scénario que `travaux.md` §2 dit encore à
construire) : la pastille `no pts` tient dans la colonne de 174 px sans la faire déborder
(−5 px de marge), et le badge rend `1-Bunch · 2 NO PTS`, son fond s'élargissant avec le texte.

## 50. Le scénario qui force l'inéligibilité, et sa vérification en course — build 147

Construit le 29 octobre 2026, à la demande de l'opérateur. Il comble le manque que `mesures.md`
§6 et `travaux.md` §2 signalaient depuis la build 53.

### La recette, rejouable à la main

1. Dans le rail du simulateur, onglet **Simulation** : donner **+4 m/s** aux deux premiers
   coureurs de la liste -- ils feront l'échappée, donc le **groupe 1** -- et **−4 m/s** au
   dernier, qui sera lâché.
2. Lancer la course en ×16 et attendre. Vers **t = 353 s, au tour 22**, la règle déclare le
   coureur lâché inéligible : il a perdu un tour et se retrouve **physiquement devant le
   peloton**, donc plus près de la ligne que le groupe au-dessus de lui. Trois groupes sont
   alors en course : `1-Leaders`, `2-Bunch`, `3-Last`.
3. Sur la carte du sprint, ramener le prochain sprint sur le tour en cours avec la flèche
   **←**.
4. À la cloche, **couper `Live`** -- sans quoi les places partent et le sprint se referme deux
   tours plus tard -- puis appuyer sur **`Clear and record`**, qui enregistre tout passage à
   partir de cet instant, quel que soit le tour.
5. Attendre le passage du coureur à un tour : il arrive **vingt-cinq secondes plus tard**
   (t = 377,5 s).

### Ce que la course montre alors, relevé dans le DOM

| Où | Ce qui s'affiche |
|---|---|
| Ordre du sprint | les cinq places, puis `15 IRL · no points`, **grisé et sans rang** |
| Compteur de la carte | `Not eligible · 1` |
| Ligne du bloc | `16th · 15 IRL · no points · not eligible when he crossed`, sans flèche de reclassement |
| Timeline | `15 IRL` avec la pastille `no pts`, dans le bloc `3-LAST · 1 RIDER · −271 m` |
| Ovale | badge `3-Last · NO PTS` |

**La fenêtre d'inéligibilité dure quatorze tours** dans ce réglage (du tour 22 au tour 36), ce
qui laisse largement le temps d'ouvrir un sprint dessus. C'est pour cela que les quatre
tentatives précédentes échouaient : elles attendaient que la fenêtre tombe d'elle-même sur un
sprint, au lieu d'amener le sprint sur la fenêtre.


## §51 · La carte de sprint en trois colonnes (build 148)

Mesuré dans le prototype, rail du simulateur replié, simulation.

| | 1440 × 1080 | 1920 × 1080 |
|---|---|---|
| Carte | **500 px** | **548 px** |
| Colonne de l'ordre | 877 px de haut, **33 lignes de 26 px** | idem |
| Colonne des coureurs | 930 px de haut, **35 lignes** | idem |
| Piste, carte à 420 (avant) | 705 × 315 | — |
| Piste, carte à 500 (après) | **634 × 283**, soit 16 % de moins | — |

Les vingt-quatre coureurs d'une course pleine tiennent donc dans les deux colonnes **sans
défilement**, avec neuf lignes de marge dans l'ordre et onze dans la liste. Les lignes sont
élastiques : 26 px au plus serré, 34 px quand la course laisse de la place.

**Largeurs utiles**, qui expliquent pourquoi rien n'est souple pour rien : la ligne de l'ordre
demande 22 + 32 + 38 + l'écart + 22 + 22 ; la ligne de la liste, 32 + la nation. La colonne des
commandes fait 172 px, ce qui tient `1st` à `4th` sur une rangée et `1st` à `5th` sur deux.

**Contrôle automatique** : un script Playwright parcourt tous les éléments de la carte et
compare `scrollWidth` à `clientWidth`, puis `scrollHeight` à `clientHeight` pour les trois
zones défilantes. Il est à zéro dans les quatre états vérifiés -- avant la cloche, sprint
ouvert, coureur sans transpondeur, sprint final -- aux deux largeurs.

**Boutons essayés un par un en course** (×16 jusqu'à l'ouverture du sprint 1, tour 10), avec
l'état relu après chaque clic : `Live` (aller et retour), `1st`…`4th`, `←` et `→` du tour jugé,
`Manual` puis la saisie « 15 4 11 » validée par Entrée -- l'ordre devient `[15, 4, 11]` et la
place suivante passe à 4 --, `Detected` qui le rend aux boucles, `Clear and record`, les tris
`BIB` et `NOC`, `Not eligible`, le double-clic dans la liste qui place le coureur, le `×` qui
le retire, et `Close`. Aucune erreur JavaScript, aucun débordement après manipulation.


### §51 bis · La saisie manuelle dossard par dossard, et d'où vient l'écart entre les deux colonnes

**Saisie un par un**, la façon de travailler que l'opérateur a demandé de vérifier le
29 octobre 2026 : `Live` coupé, `Clear and record`, `Manual`, puis `15` ↵, `4` ↵, `11` ↵,
`52` ↵.

| Frappe | Ordre obtenu | Place suivante | Champ |
|---|---|---|---|
| `15` ↵ | 15 | 2ᵉ | vidé |
| `4` ↵ | 15, 4 | 3ᵉ | vidé |
| `11` ↵ | 15, 4, 11 | 4ᵉ | vidé |
| `52` ↵ | 15, 4, 11, 52 | 5ᵉ | vidé |

Chaque dossard se pose à la place en cours, la place suivante avance d'un rang, le champ se
vide et **le curseur y reste** -- on enchaîne sans toucher la souris. Les quatre lignes portent
la mention `manual` dans la colonne de l'écart, et les quatre coureurs grisent dans la liste.
Aucune erreur.

**L'écart entre les deux colonnes** : elles font toutes deux 949 px de haut, mais la colonne de
l'ordre en cède 72 à ce qu'elle porte en plus.

| | Colonne de l'ordre | Colonne des coureurs |
|---|---|---|
| Titre `ORDER` | 23 px | — |
| En-tête `BIB NOC GAP` | 19 px | 19 px |
| Zone des lignes | **877 px**, soit 33 lignes de 26 | **930 px**, soit 35 lignes |
| Bande de dépôt | 26 px (+ 4 de marge) | — |

Soit 23 + 19 + 877 + 30 = 949 d'un côté, 19 + 930 = 949 de l'autre. Les deux tiennent donc les
vingt-quatre coureurs d'une course pleine, avec neuf lignes de marge dans l'ordre et onze dans
la liste.

## 24. La timeline, l'ovale et l'ordre du sprint (build 149, 31 octobre 2026)

Relevé dans la page, écran de 1800 × 1000, simulateur caché, simulation.

### Ce que coûte la timeline

| Élément | Avant | Après |
|---|---|---|
| Une ligne de coureur | 28,0 px | 28,0 px (22,4 au plancher du resserrement) |
| Un en-tête de groupe | 39,6 px | **17,8 px** |
| Une bande « new group » | 15,6 px | 15,6 px, inchangée — c'est une zone de dépôt (D3) |
| Hauteur disponible | 886 px | 886 px |

**Avant**, vérifié en créant les groupes un à un : 16 coureurs tiennent jusqu'à **6 groupes**,
et la colonne déroule à partir du **7e**. Chaque groupe supplémentaire coûtait exactement
**64 px** (mesuré : 919 → 983 → 1047 → 1111).

**Après**, même vérification : 16 coureurs et **8 groupes** ne déroulent pas, et `--tlz` reste
à 1. À 620 px de haut la colonne se resserre d'elle-même à **0,95** et ne déroule pas.

À 24 coureurs — le maximum posé par l'opérateur — les deux constantes donnent **3 groupes**
avant, et **10** après, resserrement compris.

### La taille maximale de l'ovale

Condition : la piste peinte entière et les deux boutons `SET NEXT AS LEADER` restent visibles
(`regles-operateur.md` §17 point 111). Mesuré en déplaçant le cadre et en projetant les quatre
coins par `getScreenCTM()` — **et non par `getBoundingClientRect()` sur le ruban, qui ne compte
pas son trait de 60 et annonçait un cran de trop** (même famille que D19).

| Disposition | Zone de l'ovale | Maximum |
|---|---|---|
| Écran de référence | 1060 × 576 | 100 % |
| Colonne du sprint à 460 px | 1112 × 576 | 110 % |
| Ovale en pleine hauteur | 1012 × 888 | 100 % |
| Fenêtre de 2560 × 1400 | 2529 × 1461 | 100 % |

La zone à garder visible mesure 837 × 488 dans un cadre de 854 × 492 : il reste 2 % de marge en
largeur, 0,8 % en hauteur. **Le maximum ne dépasse donc jamais 1,02, sur aucun écran.** Donner
de la hauteur à l'ovale n'achète rien tant que la largeur borne, et inversement.

### Le glissé d'une poignée ne reconstruit pas la timeline

Course à ×1, observateur de mutations sur `#tlbody` : **2 reconstructions en 1,6 s** hors
glissé, **0** pendant un glissé de 1,6 s, la poignée toujours active. C'est le fanion `drag` du
moteur qui tient (D1).

### Le drapeau dans l'ordre du sprint

Ligne de 227 px. Avant : `22 · 32 · 38 · 62 · 22 · 22` + 5 px de gouttière, l'écart réservant
62 px pour **43,2 px** d'encre (« +0.147 », et « manual » vaut le même) et le NOC 38 px pour
**23,4** (« GBR »). Après : `22 · 32 · 22 · 26 · 46,7 · 22 · 22`, la colonne inchangée, l'écart
gardant 46,7 px pour 43,2 d'encre. Le drapeau mesure 22 × 15 px, comme dans la timeline.


## 25. La fenêtre d'actions et les poignées (build 150, 31 octobre 2026)

Fenêtre de 1900 × 1000, centre de 679 px, colonne d'actions de 290 px, simulation
chargée et rejouée à ×16 jusqu'à 3:37.5.

### Les quatre poignées, tirées dans les deux sens — avant (build 149)

| Poignée | Taille de départ | Tirée vers le + | Tirée vers le − |
|---|---|---|---|
| Timeline (largeur) | 175,6 px | 267,6 | 161,6 |
| Actions (largeur) | 290 px | 380 | 200 |
| Ovale (hauteur du bas) | 303,6 px | **304 — refusé** | 474 |
| Colonne du sprint (largeur) | 500 px | **500 — refusé** | 680 |

Deux poignées sur quatre butaient parce que leur plancher valait leur taille courante.

### La poignée de l'ovale — après (build 150)

| Geste | Zone du bas | Ovale | Taille appliquée de la barre |
|---|---|---|---|
| Départ | 351 px | 514 px | 100 % |
| Tirée à fond vers le bas | **167 px** | **698 px** | 60 % |
| Remontée de 100 px | 267 px | 598 px | 85 % |
| Double-clic | 351 px | 514 px | 100 % |

Jamais de rognage : la barre tient dans sa zone à chaque pas.

### La fenêtre d'actions ne bouge plus

Même écran, en « côte à côte ». Hauteur de la zone du bas / hauteur de l'ovale :

| État | Avant (build 149) | Après (build 150) |
|---|---|---|
| Sans sélection | 303,6 / 562 | 351 / 514 |
| Un coureur sélectionné | 303,6 / 562 | **351 / 514** |
| Registre « Laps… » ouvert | +51 px pris sur l'ovale | **351 / 514** |
| Registre refermé | 303,6 / 562 | **351 / 514** |

Et sur la course rejouée à ×16 jusqu'à 3:37.5, deux groupes formés et une proposition
« Lap gained? · BIB 12 » affichée : **une seule valeur relevée**, 514/351, sur 30 relevés
espacés de 400 ms.

Le coût de la taille fixe est la présence permanente des deux boutons du coureur seul :
**303,6 px à 351 px**, soit 47 px pris à l'ovale une fois pour toutes plutôt qu'au gré de la
sélection.

### Le registre à droite

Centre de 679 px, fenêtre d'actions de 290 px, 359 px restants. Sans borne le registre réclame
**342,5 px** et laisse **16,5 px** aux propositions. Avec le partage à parts égales :
**179,5 / 179,5**. En disposition empilée : barre de 671 px, puis **329 px** le registre ouvert,
et le resserrement passe la barre à **70 %** sans rognage.

### Les cinq réglages de taille, à la molette

| Zone | CTRL + molette | Étiquette | Clic sur l'étiquette |
|---|---|---|---|
| Ovale | 100 % à 80 % | « 80 % » | retour à 100 %, étiquette retirée |
| Timeline | 100 % à 110 % | « 110 % » | idem |
| Carte du sprint | 100 % à 110 % | « 110 % » | idem |
| Propositions | 100 % à 110 % | « 110 % » | idem |
| Actions | 100 % à 110 % | « 110 % » | idem |

Molette **sans** CTRL : aucun réglage ne bouge. Avec CTRL, l'événement est annulé, donc la page
entière ne zoome pas. À 100 % aucune étiquette n'existe dans le DOM.

## 26. Le registre debout (build 151, 31 octobre 2026)

Fenêtre de 1900 × 1000, simulateur masqué, centre de 1098 px, fenêtre d'actions de 290 px,
simulation chargée, un coureur sélectionné et le registre ouvert.

### Les trois étapes, mesurées l'une après l'autre

| | Registre | Sa colonne | Propositions | Ovale |
|---|---|---|---|---|
| Couché, encadré (build 150) | 363 × 58 px | 389 px | 389 px | 514 px |
| Debout, encadré | 150 × 148 | 176 | 602 | 514 |
| Debout, sans la palette | 137 × 83 | 163 | 616 | 514 |
| Debout, sans palette ni cadre | **137 × 83** | **137** | **642** | **514** |

Les propositions récupèrent **253 px** de largeur, et l'ovale ne bouge pas d'un pixel à aucune
étape.

### D'où venait la bordure

Deux boîtes emboîtées, chacune avec son trait de 0,8 px, son fond et son arrondi de 4 px :
conteneur **389 × 83**, carte **364 × 58** — soit **25 px de cadre muet sur chaque côté**.
Après : le conteneur mesure exactement la carte, 137 × 83, sans trait ni fond ni marge.

### Ce qui ne bouge toujours pas (build 151 vérifiée)

| État | Zone du bas | Ovale | Propositions |
|---|---|---|---|
| Registre fermé | 352 px | 513 px | 778 px |
| Registre ouvert | **352** | **513** | 640 |

En disposition empilée : barre d'actions à 952 px, registre posé à 1178 px pour une barre qui
finit à 1170 — à droite, et sans défilement. Poignée de l'ovale tirée à fond, registre ouvert :
zone du bas **168 px**, ovale **697 px**, barre resserrée à **60 %**, registre toujours entier
sans défiler (84 px dans 168). Les compteurs agissent dans leur nouveau conteneur : gagné 0 → 1
→ 0.

### Ce qu'il faut de largeur pour que le registre paraisse (build 151)

Fenêtre élargie pas à pas, simulateur masqué, colonne du sprint ouverte à son plancher de
500 px, fenêtre d'actions à 290 px, un coureur sélectionné et le registre ouvert.

| Fenêtre | Centre | Fenêtre d'actions | Registre | Propositions |
|---|---|---|---|---|
| 1024 px | 264 px | 290 — **déborde de 40** | **0** | **0** |
| 1200 | 440 | 290 | 120 | 0 |
| 1300 | 540 | 290 | **137** | 83 |
| 1400 | 640 | 290 | 137 | 183 |
| 1900 | 1099 | 290 | 137 | 642 |

En dessous de 1300 px de fenêtre, ce n'est pas le registre qui manque de place : c'est **toute
la zone à droite de la fenêtre d'actions**, propositions comprises, et à 1024 la fenêtre
d'actions elle-même déborde du centre de 40 px. Le registre n'y est pour rien, et les
propositions disparaissaient déjà avant lui.

La colonne du registre est passée de `minmax(0,auto)` à `auto` : un plancher à zéro la laissait
écraser à **0 px** alors que la carte était bien ouverte dans le DOM — le registre s'ouvrait
sans rien montrer. Avec `auto` elle ne descend pas sous la largeur minimale de la carte, 120 px.

## 27. Le registre aux mesures de la page (build 152, 31 octobre 2026)

Fenêtre de 1900 × 1000, simulateur masqué, un coureur sélectionné, registre ouvert.

| | Avant (build 151) | Après (build 152) |
|---|---|---|
| Bouton du registre | 23 × 21 px | **36 × 33** |
| Bouton de la fenêtre d'actions | 66 × 32 | 67 × 33 |
| Corps / marges / arrondi du registre | 12 px · 2/7 · 3 px | **13 px · 7/13 · 4 px** |
| Fond · trait du registre | `#141618` · `#3a4046` | **`#1b1e21` · `#2d3237`** |
| Fond · trait de la fenêtre d'actions | `#1b1e21` · `#2d3237` | inchangé |

### L'alignement des deux lignes

| | − | chiffre | + |
|---|---|---|---|
| « gained », avant | 590 | 617 | 635 |
| « lost », avant | 574 | 601 | 619 |
| **les deux, après** | **597** | **643** | **673** |

Le décalage valait 16 px, soit exactement l'écart entre les deux libellés (42 px et 26 px).

Carte **191 × 122 px**, propositions **587 px**, zone du bas **352** et ovale **513** : aucun
des deux n'a bougé.

## 28. Le registre à plusieurs coureurs (build 153, 31 octobre 2026)

Fenêtre de 1900 × 1000, simulateur masqué, simulation chargée.

| Coureurs sélectionnés | Carte | Boîte | Défile ? | Propositions | Ovale |
|---|---|---|---|---|---|
| aucun | — (`Laps…` grisé) | 0 | — | 778 px | 513 px |
| 1 | 299 × 104 px | 299 × 104 | non | 481 | **513** |
| 2 | 299 × 145 | 299 × 145 | non | 479 | **513** |
| 16 (clic sur l'en-tête du bloc) | 299 × 719 | 314 × 352 | **oui** | 464 | **513** |

Environ **40 px par coureur**. La zone du bas reste à 352 px et l'ovale à 513 dans les quatre
cas : la fenêtre d'actions ne bouge pas plus qu'avant.

### Les colonnes sont communes aux seize lignes

| | abscisse |
|---|---|
| les seize − de `gained` | **583 px**, une seule valeur |
| les seize + de `lost` | **780 px**, une seule valeur |

### Le bon coureur

Seize coureurs ouverts, appui sur le + de la **deuxième** ligne (BIB 3) : colonne `gained`
`0 · 1 · 0 · 0`. Appui sur le − de la même ligne : `0 · 0 · 0 · 0`. Aucune autre ligne touchée.


## 29. Le coin de la barre, et le vide sous la fenêtre d'actions (build 154, 31 octobre 2026)

Fenêtre de 1900 × 1000, centre de 679 px, fenêtre d'actions de 290 px.

### Trois objets sur 77 px

| Objet | Occupe | |
|---|---|---|
| `Clear` | 421 → 462 px | passe sous les deux autres |
| Sélecteur de disposition | 435 → 498 px | `#layseg`, `right:10px` |
| Étiquette de taille | 458 → 498 px | **même adresse** que le sélecteur |

Après : le `Clear` finit à 495 px, dans la ligne, et rien ne le recouvre. La ligne de sélection
porte « BIB 15 » et n'est plus tronquée (`scrollWidth` = `clientWidth`).

### Le vide sous la fenêtre, avant

Poignée de l'ovale tirée vers le haut, taille de la barre figée à 80 % :

| Zone du bas | Barre | **Vide** | Ovale |
|---|---|---|---|
| 255 px | 255 px | 0 | 610 px |
| 455 px | 255 px | **200 px** | 410 px |
| 605 px | 255 px | **350 px** | 260 px |

### Après : la barre remplit, et la zone porte le panneau

| Zone du bas | Fenêtre | Contenu | **Vide** | Ovale | Taille |
|---|---|---|---|---|---|
| 351 px (départ) | 351 | 349 | **1 px** | 514 px | 100 % |
| 551 px | 551 | 551 | **0** | 314 px | 129 % |
| 647 px | 647 | 608 | 38 px | 218 px | 144 % |
| 397 px | 397 | 397 | **0** | 468 px | 116 % |
| 165 px (plancher) | 165 | 164 | **0** | 700 px | 60 % |

Les 38 px d'un cas tiennent à un saut de ligne de la barre : entre deux tailles consécutives
elle se remet sur un rang de boutons de moins. Le pas de 1 % borne ce reste ; à 5 % le même
geste laissait **68 px**. Aucun débordement horizontal à aucune taille : le `zoom` garde la
barre à 290 px de large.

### Sur la course rejouée

Simulation, ×16 jusqu'à 2:45.7, trois groupes formés : **une seule valeur relevée**
sur 25, ovale 517 px / fenêtre 349 px, et un vide constant de 4 px. Avec le registre d'un
coureur ouvert : fenêtre 349 px, ovale 516 px, registre 299 px de large à droite de la fenêtre.

## 30. L'appui à cheval sur la reconstruction (build 154, 31 octobre 2026)

Fenêtre de 1900 × 1000, simulation rejouée, registre ouvert sur un coureur.

### La reconstruction, avant correction

Observateur de mutations sur `#tbar` et `#ledgerbox`, course à ×1 : **6 reconstructions en
6 secondes** de chacune des deux.

### L'appui à cheval

Appui enfoncé sur le `+` de `gained`, 1,7 s d'attente pendant que la course avance, puis
relâchement.

| | |
|---|---|
| Bouton d'origine encore dans la page ? | **non**, détaché |
| Ce qui est sous le pointeur au relâchement | le `+` de `gained`, **recréé** |
| `gained` avant | 0 |
| `gained` après | **1** |

Avant la correction, aucun `click` n'était émis dans ce cas — appui et relâchement ne tombaient
pas sur le même élément — et rien ne se passait. Même essai sur le **✓ d'une proposition**
« Lap gained? · BIB 12 » : ✓ d'origine détaché, relâchement sur celui recréé, proposition
**validée**, carte vidée et Undo disponible.

### Les trois gardes

| Geste | Effet |
|---|---|
| Relâchement dans la zone **sans appui** dans la zone (coureur lâché depuis la timeline) | aucun — 1 reste 1 |
| Appui et relâchement avec le **bouton droit** | aucun |
| Appui sur un bouton **grisé** (le `−` de `lost` à 0) | aucun — 0 reste 0 |

### Le clic ordinaire marche toujours

Vérifié à la souris, pas en synthétique : `Laps…` ouvre le registre, `+1 lap` crédite le tour
et vide la sélection, et Undo devient disponible.

---

## 31. Le contraste des gris, et l'écart des couleurs de dossard (31 octobre 2026)

Mesures prises pour la planche `maquette-design-b.html`, qui pose les cinq points de design
restants de `audit-ux.md` section B. **Rien n'a été modifié pour les prendre.**

### Les gris sur les trois fonds de la page

Rapports de contraste WCAG, calculés sur les jetons de `styles.css:3-4`. Les trois fonds sont
`--deep` `#0f1113` (le fond des blocs), `#17191c` (le fond des lignes de la timeline) et
`--panel` `#1b1e21` (le fond des panneaux).

| Gris | sur `#0f1113` | sur `#17191c` | sur `#1b1e21` |
|---|---|---|---|
| `--dim` `#5f5c55` **(aujourd'hui)** | 2,84 | 2,64 | 2,51 |
| `#6b6860` | 3,40 | 3,17 | 3,01 |
| `#74716a` | 3,89 | 3,62 | 3,44 |
| `#7c7972` | 4,36 | 4,06 | 3,85 |
| `#858178` | 4,87 | 4,54 | **4,31** |
| `#8a8780` | 5,28 | 4,91 | **4,67** |
| `--muted` `#9a9890` | 6,55 | 6,10 | 5,79 |

**`#8a8780` est le premier gris qui passe 4,5 : 1 sur les trois fonds** : `#858178` y échoue
sur `--panel`. `--dim` est porté par **13 règles** de `styles.css`.

**Correction d'un chiffre de l'audit** : `audit-ux.md` section B point C donnait `--muted` à
« 7,4 : 1 ». La mesure ne le retrouve sur aucun des fonds de la page — elle donne **6,55** au
mieux, sur `--deep`. La conclusion du point ne change pas : `--muted` passe 4,5 : 1 partout,
c'est `--dim` seul qui est en cause.

### L'écart entre les couleurs de dossard

Écart ΔE 76 dans CIELAB entre les deux couleurs **les plus proches** d'un jeu.

| Jeu | Coureurs | Écart minimal | La paire la plus proche |
|---|---|---|---|
| Les seize fournies (`RIDERS`) | 16 | **9,7** | `#d62828` ESP / `#ef4444` DEN |
| Les mêmes, poussées à 24 par `addRosterRider` | 24 | **0,0** | les huit derniers sont des **copies exactes** des huit premiers |
| Roue calculée de 24, trois clartés alternées | 24 | **12,5** | `#009fe6` / `#00bdff` |
| Les nations gardées, doublons remplacés | 24 | **14,8** | `#0284c7` ITA / `#007faa` |

Les quatre couleurs suivantes des seize sont à moins de ΔE 20 : `#c8102e` / `#d62828` (9,9),
`#c8102e` / `#ef4444` (13,0), `#16a34a` / `#22c55e` (14,1), `#16a34a` / `#15803d` (17,6).

**La taille réelle du dossard sur l'ovale** : `DOT_R = 10` unités SVG, environ **7 px à
l'écran** sur l'écran de référence. Le cercle porte bien le numéro, en `font-size` 10 et
`font-weight` 700 — c'est la couleur qui se lit sans lire, pas le numéro.

---

## 32. Le NOC attaché au dossard sur l'ovale (build 156, 31 octobre 2026)

Mesuré dans la page, simulation chargée et mise en pause au tour 1, les seize coureurs
dans le peloton. Les boîtes sont celles que le navigateur rend, pas un calcul.

| | |
|---|---|
| Dossards dessinés sur l'ovale | 16 |
| Dossards portant leur NOC | **16** |
| Hauteur d'une étiquette NOC | 10,4 px |
| NOC qui en recouvre un autre | **0** |
| **NOC qui tombe sur le dossard d'un autre coureur** | **13 sur 16** |

Les treize : SUI sur 7, COL sur 18, FRA sur 18 et sur 9, ESP sur 9 et sur 67, KAZ sur 67 et sur
70, BEL sur 70 et sur 23, JPN sur 23 et sur 4, IRL sur 4.

**Pourquoi.** Les coureurs sont rangés en **trois files** espacées de `LANE = 19` unités, et un
dossard a `DOT_R = 10` de rayon, donc 20 de diamètre. Entre le bas d'un dossard et le haut de
celui de la file voisine il reste **9 unités** ; l'étiquette en fait 10,4. Dans un peloton
compact il n'y a pas la place d'une deuxième ligne de texte sous chaque dossard, quelle que
soit sa taille de police.

Le défaut **ne se voit pas** quand les coureurs sont étalés : un échappé seul, ou deux groupes
séparés, portent leur NOC sans rien recouvrir. C'est le peloton groupé qui le produit, et le
peloton groupé est l'état normal de la course.

---

## 33. Les trois points de design tranchés (build 159, 31 octobre 2026)

Mesuré dans la page, simulation chargée et rejouée.

### Un seul foyer à la fois

| Moment | Proposition en attente | La carte | Le champ du prochain sprint |
|---|---|---|---|
| tour 8, sprint 1 à 2 tours | non | — | **ambre** (`ifb acc hot`) |
| tour 40, sprint 4 ce tour-ci | **oui** | **ambre** `rgb(242,163,58)` | **bleu** (`ifb acc`, **pas** `hot`) |

Sur la carte ambre, le titre, le tour et les numéros de dossard sont mesurés à
`rgb(42,27,5)` — le brun foncé du champ `hot`. Les deux cartes d'une même course (« Lap
gained? » et « Lap lost? ») s'allument **toutes les deux** quand elles attendent ensemble : le
foyer unique est posé entre la proposition et le sprint, pas entre deux propositions.

### Le gris et les capitales

| | Avant | Après |
|---|---|---|
| jeton `--dim` | `#5f5c55` | **`#8a8780`** |
| contraste sur `--deep` / lignes / `--panel` | 2,84 / 2,64 / 2,51 | **5,28 / 4,91 / 4,67** |
| indice d'onglet | `FACTS ONLY · NEWEST FIRST`, 11 px, capitales | **`facts only · newest first`**, 12 px, `text-transform: none` |

L'indice d'onglet était la **seule phrase en capitales** de l'écran : il portait `.lbl`, la voix
des en-têtes de colonne. Les autres textes en `--dim` — les raisons d'inéligibilité, les notes
barrées du registre, les indices de la carte de sprint — étaient déjà en minuscules et n'ont
reçu que l'éclaircissement.

### Le panneau de l'ovale

| | Avant | Après |
|---|---|---|
| hauteur du panneau | 92 px | **64 px** |
| commandes au centre de l'ovale | 12 | **5** |
| `y` du `foreignObject` | 249 | 263 — le milieu ne bouge pas |

Vérifié depuis la barre du haut, à la souris : le bascule `M` passe `#srcapp` en
`srcrow on manual`, l'étiquette devient `MANUAL` et les pas `− / +` paraissent ; le bouton de
choix du compteur passe `#srccnt` en `on` et retire `on` à `#srcapp` ; `ARM START` devient
`START ARMED`, et `ARM FINISH` prend `armed`. Les cinq commandes déplacées répondent donc au
même geste depuis leur nouvelle place.

---

## 34. Les deux bandes « new group » font la même chose (31 octobre 2026)

Vérifié sur sa remarque : « jusqu'à présent cela fonctionnait pour créer un groupe au-dessous de
la timeline mais au-dessus ça ne fonctionnait pas ». Mesuré dans la page, simulation
chargée, peloton de seize, gestes envoyés comme de vrais appuis-glissés.

| Ce qu'on fait | Ce qui arrive |
|---|---|
| Le coureur **de tête** (15) déposé sur la bande du **HAUT** | groupe créé, il paraît **en haut** : `1-Leader [15]` |
| Le coureur **de queue** (52) déposé sur la bande du **HAUT** | groupe créé, il paraît **en bas** : `2-Last [52]` |

**Les deux bandes sont atteignables** : `elementFromPoint` les rend toutes les deux, elles sont
épinglées en haut et en bas de la colonne, et chacune reçoit bien le dépôt.

**Ce qui ne se passe pas** : la bande choisie n'a **aucun effet**. `z.dataset.newgroup` porte
l'indice de la bande, il est lu dans le gestionnaire — `if (z.dataset.newgroup != null)` — puis
**jamais transmis** : `newGroup(drag, 'manual')` ne le reçoit pas. Le groupe est poussé dans
`S.groups` sans position, et la timeline le range d'après la place de ses coureurs **sur la
piste**.

Le dépôt sur la bande du **bas** paraît donc marcher, et celui du **haut** paraît ne rien faire :
dans les deux cas le groupe se range là où le coureur se trouve, et un coureur qu'on sort du
peloton est le plus souvent derrière.

**Ce qui place un groupe dans la timeline.** Les groupes sont rangés sur `g.head`, le plus petit
`behind` de leurs coureurs — leur retard **en mètres** sur le leader, calculé depuis la position
mesurée. Un groupe manuel n'a pas de place à lui : ses coureurs gardent celle que les boucles
leur donnent. C'est pourquoi la bande ne peut rien changer tant que le groupe n'a pas de
position propre.

**Ce qui existe déjà pour un coureur que les boucles ne voient pas.** Un coureur sans
transpondeur roule **derrière un hôte** (`S.noTp`, bib → hôte). Et s'il a sa propre position —
un contact de ruban que l'opérateur lui attribue — elle est gardée dans `S.noTpRec` et le porte
**seul**, à sa vitesse, sans hôte. Ce deuxième mécanisme est exactement la forme qu'aurait
« l'opérateur dit où il est ».

**Ce qui n'existe pas.** Un coureur **avec** un transpondeur est lu trois fois par tour, et sa
position est extrapolée de sa dernière lecture à chaque image. Une place qu'on lui donnerait à
la main serait écrasée à la lecture suivante, c'est-à-dire en une fraction de seconde.

### La bande de dépôt, avant et après (build 160)

| | Avant | Après |
|---|---|---|
| Hauteur d'une bande d'extrémité | **15,6 px** | **30 px** |
| Écart entre la bande du haut et le premier bloc | **1 px** | **9 px** |
| Hauteur d'une ligne de coureur, pour comparer | 28 px | 28 px |

Vérifié après correction : un coureur lâché sur le **bord haut** de la bande et un coureur lâché
sur son **bord bas** créent tous les deux le groupe. Les deux bandes restent atteignables.

### Le bouton « Group » et le glissement, mesurés (1er novembre 2026)

Sur ses trois constats du point 153. Mesuré sur la simulation, course lancée, en
dispatchant les événements sur les éléments réels de la page.

| Geste | Coureurs pris | Résultat |
|---|---|---|
| Bouton `Group` | les deux **premiers** du peloton (15, 4) | groupe créé **devant** : `1-LEADERS`, le peloton passe `2-BUNCH, −4 m` |
| Bouton `Group` | les deux **derniers** du peloton (12, 52) | groupe créé **derrière** : `2-LAST, −31 m` |
| Glissement sur une bande | les mêmes | **identique**, dans les deux cas |

**Les deux chemins appellent la même ligne** : `newGroup(bibs, 'manual')`, au bouton comme au
dépôt. Ce qui décide de la place, dans les deux cas, est la **position mesurée** des coureurs
pris, jamais la bande visée. Un groupe part donc derrière dès que les coureurs choisis ne sont
pas les premiers du bloc : leur écart au leader reste plus grand que celui du bloc, qui garde
son coureur de tête.

**Le troisième constat est confirmé** : un groupe ne s'attrapait pas du tout. Le glissement ne
démarrait que sur une ligne de coureur ; sur l'en-tête d'un groupe, pas même l'étiquette qui
suit le curseur n'apparaissait.

### Le groupe posé à la main tient (build 161)

Groupe des deux derniers coureurs (12, 52, **31 m** derrière le leader) posé sur la bande du
haut. Vérifié : il monte en tête de colonne, porte `by hand`, garde son écart mesuré `−31 m`,
et **y est encore après 1 min 30 de course** jouée à ×16. `Back to automatic` le remet derrière
le peloton et la bande du mode disparaît. Deux groupes posés font bien « 2 GROUPS BY HAND ».

### Ce qu'un groupe forcé change, et ce qu'il ne change pas (build 161)

Sa question du 1er novembre 2026 : un groupe posé en tête de la timeline alors qu'il est
deuxième sur la piste est-il détecté le premier au sprint ?

**Monté** : trois blocs sur la simulation — `1-LEADER` (15, le vrai leader),
`2-BUNCH` (13 coureurs), `3-LAST` (12 et 52, **31 m** derrière). Le bloc de queue a été posé à
la main tout en haut, puis la course a été jouée à ×16 jusqu'au sprint final.

**La timeline après la pose** : `1-LEADERS · −31 m · by hand` (12, 52), `2-CHASE · leader`
(15), `3-BUNCH · −2 m`. Le vrai leader est passé au numéro **2**, le groupe posé au numéro **1**.

**Les trois sprints joués avec ce forçage en place** — lus dans l'onglet Sprints :

| | Ordre jugé |
|---|---|
| Sprint 1, tour 10 | 15, 4, 11, 23, 46 |
| Sprint 2, tour 20 | 15, 4, 11, 23, 46 |
| Sprint 3, tour 30 | 15, 4, 11, 23, 46 |

Aucun des deux coureurs posés en tête (12, 52) n'apparaît. **L'ordre détecté vient des boucles**,
et la place donnée à la main dans la timeline n'y touche pas.

**Ce que le forçage change en revanche** : le **numéro** des groupes, qui se lit sur leur
en-tête, suit l'ordre de la colonne. Et c'est sur ce numéro qu'est calculée l'éligibilité
(`numbered` dans `computeGroups`, la règle du §6) : le groupe 1 est par construction « le plus
proche de la ligne », et c'est contre le groupe n que se juge le groupe n+1. Un groupe posé en
tête devient donc le groupe 1 pour les points, sans être le premier détecté.

### Le leader désigné et la première position, les deux sens (build 162)

Simulation, départ propre, un bloc de queue formé avec 12 et 52, **31 m** derrière.

| Geste | Ce qui se passe |
|---|---|
| `Leader` sur le 52, qui est dans le bloc de queue | son bloc monte en première position, porte `by hand`, et le peloton passe à `+31 m` |
| Le bloc de queue glissé sur la bande du haut | le champ `LEADER` passe de `15` à `12`, le coureur de tête du bloc |

**Et les tours à faire suivent.** Avec le 12 désigné de cette manière, joué à ×16 :

| Temps de course | `LAP` | `TO GO` | Leader |
|---|---|---|---|
| 1:40 environ | 5 | 35 | 12 |
| 3:40 environ | 13 | 27 | 12 |
| 5:35 | 20 | 20 | 12 |

**Quinze tours de course, et rien n'a bougé** : le groupe est resté premier avec son étiquette,
le 12 est resté leader, et les tours restants se sont décrémentés sur lui. La reprise
automatique ne s'est pas déclenchée — elle demande qu'un coureur **passe** le leader, et ceux
qui sont devant le restent.

**Ce que `Back to automatic` ne fait pas** : il rend les places à la mesure, il **ne reprend pas
le leader désigné**. Rien n'a été inventé là-dessus, il ne l'a pas demandé.

### L'horloge du panneau, les deux formats (build 163)

`fmtClock` vérifiée sur ses deux exemples et sur deux autres valeurs :

| Temps | En marche | À l'arrêt |
|---|---|---|
| 0 s | `00:00.0` | — |
| 5,2 s | `00:05.2` | — |
| 746,54 s | `12:26.5` | `12:26.54` |

Ses deux exemples — « `00:00.0` » en marche et « `12:26.54` » à l'arrêt — sortent tels quels.

### Le même test rejoué en détail, avec l'ordre sur la piste (build 163)

Il a demandé, le 1er novembre 2026, de dire **qui est devant et qui est derrière, avant et après
l'intervention** (point 163). Simulation, jouée jusqu'à **1:36.8**, tour 6.

**Avant.** Un seul bloc, `1-BUNCH`, 16 coureurs. Du premier au dernier :
15 IRL, 4 GBR, 11 JPN, 23 DEN, 46 BEL, 70 BRA, 58 KAZ, 67 GER, 1 ESP, 9 SLO, 3 FRA, 18 POR,
61 COL, 7 NED, 12 SUI, 52 ITA. L'ordre de passage sur la ligne au tour 5 est le même, coureur
pour coureur. **Devant : 15 IRL. Derrière : 52 ITA.** Leader `15`, `LAP 6 / 40`, `TO GO 34`.

**L'intervention, en deux gestes.** Le 12 et le 52 sélectionnés, bouton `Group` : un bloc
`2-LAST · −31 m` se forme **sous** le peloton. Puis ce bloc attrapé par son en-tête et lâché sur
la bande du haut.

**Après.** `1-LEADERS · 2 riders · leader · manual` (12 SUI, 52 ITA), puis
`2-BUNCH · 14 riders · +31 m` (15 IRL … 7 NED). La bande dit `1 MANUAL GROUP`. Le champ
`LEADER` passe de `15 IRL` à `12 SUI`.

**Sur la piste, rien n'a bougé.** L'ordre de passage sur la ligne au **tour 21**, après
l'intervention, est identique à celui du tour 5 : 15, 4, 11, 23, 46, 70, 58, 67, 1, 9, 3, 18,
61, 7, 12, 52. **Devant : toujours 15 IRL. Derrière : toujours 52 ITA.** Le `+31 m` de
l'en-tête du peloton le dit aussi : il est devant, et la timeline le montre dessous.

**Et la reprise du leader s'est produite.** Au bout de seize tours, à 5:53.4, le champ `LEADER`
dit `7 NED` : un coureur a dépassé le 12 sur la piste et lui a pris la tête, comme sa règle du
point 159 le veut. **Le groupe, lui, est resté premier avec son étiquette `manual`.** Les tours
restants ont continué de se décrémenter, `TO GO 18` au tour 22.

**Ce que cela corrige du §38** : il y était écrit que la reprise ne s'était pas déclenchée. Elle
ne s'était pas déclenchée **dans cette course-là, sur cette durée-là**. Elle se déclenche dès
qu'un coureur dépasse réellement le leader désigné, et c'est ce qu'il a demandé.

**Ce qui se voit alors, et qu'il n'a pas tranché** : le bloc posé en tête garde son nom
`1-LEADERS` pendant que la pastille `leader` est descendue sur le peloton.

### L'écart de proche en proche, et les 219 m (build 164)

Simulation, jouée jusqu'à 1:36.0, tour 6. Trois états successifs, lus sur les en-têtes.

| | Blocs et écarts |
|---|---|
| Avant | `1-BUNCH · leader` (16 coureurs) |
| Le 12 et le 52 groupés | `1-BUNCH · leader` · `2-LAST · 31 m` |
| Ce bloc posé en tête | `1-LEADERS · leader · manual` · `2-BUNCH · **219 m**` |

**219 m, à l'unité** — son chiffre, 250 − 31.

**La chaîne**, vérifiée en formant un troisième bloc avec le 61 COL, qui roule 26 m derrière le
15 IRL : `1-LEADERS · leader` · `2-BUNCH · 219 m` · `3-LAST · 26 m`. Le troisième se compte bien
depuis le deuxième, et non depuis le premier — sinon il aurait affiché 245 m.

### Où est réellement chaque coureur, au mètre (build 164)

Ses questions du 1er novembre 2026. Mesuré sur les **passages réels sur la ligne**, tour 6 de la
simulation (onglet Passings, source Finish), tous les coureurs à **15,0 m/s** — vérifié
sur les six tours du 15, dont les temps au tour tombent à 16,666 s, soit 250 m à 15,0 m/s.

| Coureur | Passage, tour 6 | Derrière le 15 |
|---|---|---|
| 15 IRL | 1:23.700 | **0 m** |
| 4 GBR | 1:23.847 | 2,2 m |
| 11 JPN | 1:23.993 | 4,4 m |
| 23 DEN | 1:24.140 | 6,6 m |
| 46 BEL | 1:24.287 | 8,8 m |
| 70 BRA | 1:24.433 | 11,0 m |
| 58 KAZ | 1:24.580 | 13,2 m |
| 67 GER | 1:24.727 | 15,4 m |
| 1 ESP | 1:24.873 | 17,6 m |
| 9 SLO | 1:25.020 | 19,8 m |
| 3 FRA | 1:25.167 | 22,0 m |
| 18 POR | 1:25.313 | 24,2 m |
| 61 COL | 1:25.460 | 26,4 m |
| 7 NED | 1:25.607 | 28,6 m |
| 12 SUI | 1:25.753 | 30,8 m |
| 52 ITA | 1:25.900 | **33,0 m** |

**Un seul peloton, en file**, 2,20 m entre deux coureurs consécutifs et **33,0 m** du premier au
dernier. Personne n'est détaché, ni devant ni derrière.

**Ce que les chiffres affichés mesuraient vraiment.** Le « 31 m » du bloc formé avec le 12 et le
52 est la distance **du 15 au 12** — de tête à tête, depuis le premier coureur du bloc précédent.
Le vrai écart entre le **dernier du peloton (7 NED)** et le **premier du bloc (12 SUI)** est de
**2,2 m**. De même, le « 26 m » du bloc formé avec le 61 est la distance **du 15 au 61** ; le 61
roule à **2,2 m** derrière le 18 POR, dans la file, treizième sur seize.

**Ce que donne sa règle.** Mesuré entre le **dernier du groupe de tête (52 ITA)** et le
**premier du groupe suivant (15 IRL)**, en faisant le tour de la piste : 250 − 33,0 =
**217,0 m**, et non 219. Les 219 venaient de 250 − 31, c'est-à-dire d'une mesure de tête à tête.

### L'écart entre les deux coureurs qui se suivent (build 165)

Même course, même tour 6. Les positions réelles sont au §42 : file de 33,0 m, 2,20 m entre
coureurs, du 15 IRL en tête au 52 ITA en queue.

| État | En-tête du bloc | Mesuré entre |
|---|---|---|
| Le bloc du 12 et du 52 **sous** le peloton | **2 m** | 7 NED → 12 SUI |
| Le même bloc **posé en tête** | le peloton à **217 m** | 52 ITA → 15 IRL, par l'autre côté de la piste |

Ses deux chiffres, sortis de la même ligne de code.

### La suite de la course, avec le bloc forcé en tête (build 165)

Course jouée du tour 6 au tour 26 avec le 12 et le 52 posés en tête.

| Tour | Leader affiché | `TO GO` | La timeline |
|---|---|---|---|
| 9 | 12 SUI | 31 | `1-LEADERS · leader · manual` · `2-BUNCH · 217 m` |
| 13 | 12 SUI | 27 | inchangée |
| 18 | 12 SUI | 22 | inchangée |
| 21 | **7 NED** | 19 | inchangée |
| 26 | 7 NED | 14 | inchangée |

**L'ordre forcé n'a pas bougé d'un tour** — le bloc est resté premier, avec son étiquette et ses
217 m. **Le leader, lui, a été repris** entre le tour 18 et le tour 21 par le 7 NED, qui a
dépassé le 12 sur la piste : c'est sa règle du point 159. Les tours restants ont continué de se
décrémenter sans à-coup.

**Les deux sprints traversés ont été jugés sur les boucles** : sprint 1 au tour 10 et sprint 2
au tour 20, tous deux `15, 4, 11, 23, 46`. **Ni le 12 ni le 52 n'y figurent**, alors qu'il
attend d'eux « les 2 premières places de chaque sprint » (point 164). Rien n'est codé de ce
côté-là.

**Ce qui se contredit à l'écran** : depuis le tour 21, le bloc du haut porte `leader` et
s'appelle `1-LEADERS`, pendant que le champ `LEADER` du panneau dit `7 NED`, qui est dans le
peloton.

### Par où le 7 est-il passé ? Par nulle part (build 165)

Sa question du 1er novembre 2026. Ordre de passage sur la ligne, course avec le 12 et le 52
posés en tête :

| Tour | Les quatre derniers de la file |
|---|---|
| 17 | … 61, **7**, **12**, 52 |
| 18 | … 61, **12**, **7**, 52 |
| 21 | … 61, **7**, **12**, 52 |

**Le 7 n'a jamais quitté le peloton.** Il est quatorzième sur seize au tour 17, quinzième au
tour 18, quatorzième de nouveau au tour 21. Lui et le 12 ont simplement **échangé leurs places**
à l'intérieur de la file, et deux coureurs consécutifs sont séparés de **2,20 m** (§42).

**C'est cet échange de deux mètres qui lui a donné la tête de la course.** La reprise
automatique du leader compare les positions **sur la piste** ; elle ne regarde pas la timeline.
Elle a donc vu le 7 repasser devant le 12 et lui a donné la tête, pendant que la timeline
affichait un bloc de tête à **217 m** devant le peloton. Les deux vérités tournent côte à côte,
et rien ne les relie.

### La liste des passages suit la timeline (build 166)

Simulation, le 12 et le 52 posés en tête au tour 6. Onglet Crossings, tours 4 et 5 :

> 12, 52, 15, 4, 11, 23, 46, 70, 58, 67, 1, 9, 3, 18, 61, 7

Sa ligne, à la virgule près. Avant le build 166 la même liste commençait par le 15 et finissait
par 12, 52.

### La cassure lue sur les boucles (build 167)

Simulation, course de 40 tours, piste de 250 m, seize coureurs.

**Ce que les boucles donnent pour une paire.** Au tour 40, le 12 SUI devant le 52 ITA :

| Boucle | Passage du 12 | Passage du 52 | z |
|---|---|---|---|
| Finish | 685,75 s | 685,90 s | **0,147 s** |
| Pursuit B | 693,42 s | 693,57 s | **0,147 s** |
| Pursuit A | 685,09 s | 685,23 s | **0,147 s** |

Les trois boucles donnent le **même z**. À 15,0 m/s, une longueur de vélo vaut
1,65 / 15,0 = **0,110 s**, donc z − (x + y) = **0,037 s** : très au-dessous de 1,000 s, les deux
coureurs sont dans le même groupe.

**La course entière, comparée au build 166.** Composition des groupes relevée à chacun des
**40 passages de tour** :

| | |
|---|---|
| Tours où la composition est identique | **38 sur 40** |
| Tours où elle diffère | **2** — les tours 7 et 14 |

Aux tours 7 et 14, la cassure mesurée sur les boucles apparaît une fraction de seconde plus tard
que celle calculée sur les positions interpolées : au tour 7 le 12 SUI est encore dans la file
au lieu d'être déjà seul devant, au tour 14 le 11 JPN et le 4 GBR sont encore accrochés au lieu
d'être déjà décrochés. Le leader est le même à chacun des 40 tours.

### Le palier 1 joué en entier (build 168)

Première course de test : 250 m, 60 tours, 6 sprints, seize coureurs, aucun ordre rejoué.

| | |
|---|---|
| Course menée à son terme | **oui**, 60 tours, 1003 s |
| Composition relevée à chacun des 60 passages de tour | **un seul groupe de 16**, aux 60 tours |
| Tours pris ou perdus | **aucun** |
| Nombre maximal de blocs dans la timeline | **1** |

**Le classement obtenu.** 15 IRL 35 points, 4 GBR 21, 11 JPN 14, 23 DEN 7 — et rien aux douze
autres. Les 35 points du 15 sont cinq sprints à 5 points plus le sprint final doublé : **il a
gagné les six sprints**, et les quatre premières places de chaque sprint sont à chaque fois les
quatre mêmes coureurs, dans le même ordre.

C'est la limite de ce palier : la file ne se mélange jamais, donc le même coureur passe la ligne
en tête aux six sprints. La course tourne juste, elle n'est pas encore vraisemblable.

### L'écart affiché en temps (build 168)

Ancienne simulation, tour 9, trois blocs. Les mêmes écarts, avant et après :

| Bloc | Affiché avant | Affiché après |
|---|---|---|
| 12 SUI, seul en tête | `leader` | `leader` |
| Le peloton, treize coureurs | `74 m` | **`3.9 s`** |
| 4 GBR et 11 JPN | `48 m` | **`2.6 s`** |

### Le palier 2 joué en entier (build 169)

250 m, 60 tours, 6 sprints, seize coureurs, départ à 13,5 m/s. Course menée à son terme en
1043 s. Aucune intervention de l'opérateur : « pas d'autres inputs ».

**La course, tour par tour.**

| Tours | Ce que la timeline montre |
|---|---|
| 1 à 8 | **un seul groupe de seize.** L'ordre dans la file change dès le tour 3 : les fluctuations déplacent les coureurs de quelques mètres sans casser le groupe |
| 5 à 8 | le 12 SUI et le 52 ITA, partis du fond, remontent la file et sont en tête au tour 7 |
| **9** | **première cassure** : le 12 et le 52 passent devant, le peloton à **2,0 s** |
| 10 à 13 | leur avance passe à 3,3 s, 4,7 s, 5,8 s, 6,4 s |
| 13 | le 18 POR, le 61 COL et le 7 NED, partis au tour 11, sont en tête du peloton |
| **14** | **deuxième cassure** : ils sortent à leur tour, à 5,9 s du 12 et du 52, le peloton à 2,3 s d'eux |
| **15** | **troisième cassure** : le 46 BEL et le 70 BRA, lâchés au tour 12, décrochent à 1,6 s. **Quatre blocs** |
| 20 | le 18, le 61 et le 7, plus rapides, ont repris puis dépassé le 12 et le 52 ; ceux-ci ont rejoint le peloton par l'arrière et figurent dedans |
| 30 | les cinq échappés roulent ensemble en tête, le peloton à 9,8 s |
| 40 à 60 | quatre blocs : 18-61-7, puis 12-52, puis le peloton de neuf, puis 46-70 |

**Les six sprints**, quatre premiers de chaque :

| Sprint | Tour | Ordre |
|---|---|---|
| 1 | 10 | 12, 52, 15, 4 |
| 2 | 20 | 12, 52, 18, 61 |
| 3 | 30 | 18, 61, 7, 12 |
| 4 | 40 | 18, 61, 7, 12 |
| 5 | 50 | 18, 61, 7, 12 |
| 6 | 60 | 18, 61, 7, 12 |

Les quatre premiers ne sont plus les mêmes qu'au palier 1 : l'ordre suit la course.

**Ce que l'application a détecté toute seule**, et qui attend l'opérateur — aucune de ces
propositions n'a été validée, donc **aucun ±20 n'est au classement** :

| Proposition | Coureurs |
|---|---|
| **+1 tour** | 12 SUI |
| **+1 tour** | 52 ITA |
| **+1 tour** | 7 NED, 18 POR, 61 COL |
| **−2 tours** | 46 BEL, 70 BRA |
| **−2 tours** | 4 GBR, 11 JPN, 15 IRL, 23 DEN, 58 KAZ, 67 GER |

**La dernière ligne est à regarder.** Le 4, le 11, le 15, le 23, le 58 et le 67 sont **dans le
peloton**, le plus gros groupe de la course avec neuf coureurs — avec le 1 ESP, le 9 SLO et le
3 FRA, que la même proposition ne nomme pas. Un coureur du peloton ne perd pas un tour sur le
peloton, et l'article UCI 3.2.017 quater le dit : un tour est perdu quand on est rejoint **par
le plus gros peloton en course**.

**Le classement final, sans les ±20 :** 18 POR 27 points, 61 COL 16, 12 SUI 15, 7 NED 10,
52 ITA 6, 15 IRL 2, 4 GBR 1.

### Ce que la trace relève sur le palier 2 (build 171)

Le palier 2 joué en entier, 60 tours, sans aucune intervention : **1296 lignes**.

| Sorte | Lignes |
|---|---|
| `FILE` — la file change | **873** |
| `ECART` — un écart bouge d'au moins 1 s | **289** |
| `LEADER` — le coureur de tête change | **90** |
| `POINTS` | 20 |
| `ORDRE` | 18 |
| `PROPOSITION` | 5 |

**Quatre-vingt-dix changements de leader en soixante tours**, et ils commencent avant toute
échappée : au tour 2, `Leader 15 → 4` puis `Leader 4 → 15` ; au tour 3, la même chose ; aux
tours 4, 5 et 6 encore. Le peloton est alors **un seul groupe de seize** : ce sont les
fluctuations de vitesse, de 0,1 à 0,3 m/s, qui font permuter deux coureurs de quelques mètres,
et la tête de la course suit ces mètres.

**L'inversion de la file, prise sur le fait**, trois lignes `FILE` en six dixièmes de seconde
au tour 21 :

```
353.90 s   [12,52] | [18,61,7] | [15] | [4,11,23,58,67,1,9,3] | [46,70]
354.20 s   [18,61,7] | [15,12,52,4,11,23,58,67,1,9,3] | [46,70]
354.50 s   [12,15,52,4,11,23,58,67,1,9,3] | [18,61,7] | [46,70]
```

Le 12 et le 52 mènent seuls, puis se retrouvent **au milieu du peloton**, puis en tête d'un bloc
qui contient tout le monde — pendant que le 18, le 61 et le 7 passent de la première à la
deuxième place.

**Les écarts sautent d'un tour entier.** Sur les 289 lignes `ECART`, **26 sautent de 18,4 s à
un dixième près** — et 250 m à 13,5 m/s font **18,52 s**. Exemples relevés :

| Instant | Ligne |
|---|---|
| 98,10 s, tour 6 | bloc de tête 18 : 18,3 s → **−0,1 s** |
| 185,20 s, tour 11 | bloc de tête 4 : 4,3 s → **18,3 s** |
| 334,15 s, tour 19 | bloc de tête 58 : −0,1 s → **18,4 s** |

Un écart **négatif** apparaît aussi, −0,1 s, que la règle de l'opérateur interdit : l'écart d'un
bloc se mesure depuis le bloc qui le précède.

### Ce que les logs du code disent du palier 2 (build 172)

Trace exportée par l'opérateur depuis l'application, palier 2 joué en entier :
**1296 lignes de trace** et **2560 lignes de logs du code**. La simulation étant déterminée par
le dossard, les mêmes chiffres sortent à chaque rejeu.

**1. La tête de la course est prise sur la mesure, et bascule sur un mètre.**

| | |
|---|---|
| Changements de leader | **90** |
| Dont la source est `mesure` | **90 sur 90** — jamais `désigné` |
| Avance médiane du nouveau leader sur le second | **1,4 m** |
| Changements avec 3 m ou moins d'avance | **88 sur 90** |

Le plus net, à 31,0 s : le 4 GBR et le 15 IRL sont à **410,9 m tous les deux**, avance **0,0 m**,
et la tête change. Puis 2,1 m à 36,75 s, 1,2 m à 46,1 s, 2,1 m à 46,25 s. Le peloton est alors
un seul groupe de seize.

**2. Le tour retranché s'allume et s'éteint, et c'est lui qui inverse la file.**

Au tour 21, trois images consécutives, six dixièmes en tout :

| Instant | Ligne `TOUR` | Position du 12 | Référence du paquet |
|---|---|---|---|
| 353,90 s | 12 et 52 : **plus de tour retranché** | 5021,9 m | 4769,6 m |
| 354,20 s | 12 et 52 : **ramenés de 1 tour** | 5026,3 m | 4773,7 m |
| 354,50 s | 12 et 52 : **plus de tour retranché** | 5030,6 m | 5030,6 m |

À 353,90 s le 12 est 252 m devant la référence — un tour. Trois dixièmes plus tard il est jugé
dans le paquet, **250 m lui sont retranchés**, et il tombe derrière. Trois dixièmes encore et le
tour revient. Au passage, à 354,50 s, la référence du paquet devient **5030,6 m**, c'est-à-dire
la position du 12 lui-même : neuf coureurs du peloton — 3, 9, 1, 67, 58, 23, 11, 4, 15 — sont
alors **ramenés de −1 tour**.

**Le 12 bascule 53 fois, le 52 également.** Un pas de 250 m appliqué puis retiré cinquante-trois
fois : c'est l'inversion de la file que l'opérateur a vue sur ses captures.

**3. Les ±20 arrivent tôt parce que le quotient est arrondi.**

Le nombre de tours vient de `Math.round((pos − enFace) / 250)`.

| Instant | Coureur | Écart mesuré | Quotient | Tours retenus |
|---|---|---|---|---|
| 209,85 s, tour 12 | 12 SUI | **126,6 m** | **0,506** | **+1** |
| 333,25 s, tour 19 | 7 NED | 201,6 m | 0,806 | +1 |
| 333,25 s, tour 19 | 61 COL | 203,8 m | 0,815 | +1 |
| 351,20 s, tour 20 | 70 BRA | −390,0 m | **−1,56** | **−2** |

**126,6 m, c'est la moitié d'un tour, et l'application en fait un tour pris.** Sur 192 calculs
de ce genre, **8 portent un quotient inférieur à 0,75** en valeur absolue, le plus petit étant
0,506. À l'autre bout, −1,56 devient −2 : un coureur à un tour et demi est pénalisé de 40 points.

## Build 174 · ce que les trois corrections ont changé, et ce qu'elles n'ont pas changé

**La course mesurée** : « Palier 2 — deux échappées, deux lâchés », 250 m, 60 tours, 16 coureurs,
rejouée du départ à l'arrivée (1 042,3 s, 20 846 images), puis « Palier 1 — peloton groupé » en
contrôle. Les deux courses rejouent à l'identique : le tirage des fluctuations est déterminé par le
dossard et la tranche de temps.

**1. Les ±20 : corrigé.**

| | build 173 | build 174 |
|---|---|---|
| Première proposition pour l'échappée 12-52 | **tour 12**, à 209,85 s | **tour 19**, à 326,20 s |
| Ce qu'on mesurait contre | un coureur à **126,6 m** · quotient **0,506** | le 3 ARG, à **8,1 m** sur la piste |
| Le 12 et le 52 proposés ensemble | non — le 12 seul | **oui** |
| Les deux lâchés 46-70 | **−2 tours** (quotient −1,56, −40 points) | **−1 tour** |
| Coureurs du peloton à qui on propose un tour perdu | **six** d'un coup, tour 32 | quatre, tour 32 |
| Calculs refusés, les deux coureurs ne se suivant pas | aucun — le refus n'existait pas | **91** |

Les sept tours et les 117 secondes gagnés sur la première proposition, c'est exactement ce qu'il
dit au point 175. La proposition tombe maintenant quand le reste vaut **8,1 m** puis **1,8 m** :
les deux coureurs sont côte à côte, et le tour est **constaté** au lieu d'être arrondi.

**Ce qui reste ouvert au poste 21** : la même échappée est encore proposée à plusieurs tours (19,
puis 21, 22, 31…), et quatre coureurs du plus gros peloton se voient encore proposer un tour perdu,
contre l'article UCI 3.2.017 quater.

**2. Le tour retranché : pas corrigé.** 494 bascules de `TOUR` sur la course, dont **52 pour le 12,
52 pour le 52, 61 pour le 18, 60 pour le 7**. Geler la valeur dans `S.took` n'a rien changé, et la
mesure dit pourquoi : ce n'est pas le **repère** qui oscille, c'est l'**appartenance au paquet**.
Elle oscille parce que l'ordre de la file se calcule sur les mètres interpolés, cet ordre décide
quelles **paires** de coureurs se suivent, et c'est sur ces paires que la cassure est confirmée. La
boucle se referme : tour retranché → `np()` → ordre → paires → cassure → paquet → tour retranché.

**3. La tête : pas corrigée.** 67 changements de tête (90 à la build 172), tous pris sur la mesure,
**marge médiane 1,7 m**, et **65 des 67 à 3 m ou moins**. Tenir la tête sur une longueur de vélo ne
suffit pas : les marges mesurées se tiennent juste au-dessus de 1,65 m.

**Le contrôle, palier 1** : un seul bloc d'un bout à l'autre, **un seul** coureur en tête de toute
la course, **zéro** proposition, **zéro** tour retranché, **zéro** saut d'écart, **zéro** point qui
recule. Aucune régression.

## Build 178 · l'ordre relevé aux boucles

**La course mesurée** : « Palier 2 — deux échappées, deux lâchés », 250 m, 60 tours, 16 coureurs,
rejouée du départ à l'arrivée (1 042,3 s), puis « Palier 1 — peloton groupé » en contrôle.

| | build 174 | build 178 |
|---|---|---|
| Tours retranchés, bascules sur la course | **494** | **104** |
| dont le 12 SUI | 52 | **15** |
| Coureurs à qui un tour est retranché un jour | les **16** | **8** |
| Changements de tête | **67** | **32** |
| Changements de composition de la file | 858 | **397** |
| Propositions ouvertes pour les cinq coureurs qui prennent un tour | 2 puis 3, séparées | **une seule**, qui les rassemble |
| Points qui reculent | 0 | 0 |
| Sauts d'écart de plus de 10 s | 141 | **164** |

**Ce que les logs montrent de l'ancien défaut.** À 539,4 s le 12 SUI est en tête : sa dernière
détection, à 532,73 s sur la boucle 115, a donné **7 615 m**. À 540,7 s le 15 IRL prend la tête :
sa détection, à 537,48 s sur la boucle 0, a donné **7 250 m** — moins que le 12. Ce n'est donc pas
une détection qui a fait changer la tête, c'est le tour retranché au 12, recalculé entre deux
passages. Sur 67 changements de tête, **9 seulement** tombaient dans les trois dixièmes d'une
détection du nouveau leader. D'où la build 177 : le tour retranché ne se décide, lui aussi, qu'à
une détection.

**Le contrôle, palier 1** : un seul bloc, **un seul** coureur en tête, la composition de la file
change **3 fois** sur toute la course (contre des centaines), zéro proposition, zéro tour
retranché, zéro saut d'écart, zéro point qui recule.

**Ce qui reste, et qui est maintenant le défaut dominant.** Les écarts de blocs sautent d'un tour
entier — « 18,3 s → −0,1 s » puis l'inverse, 164 fois. L'écart s'affiche bien en secondes lues sur
les boucles, mais la **place** du bloc vient désormais des détections tandis que `g.head` et
`g.tail`, qui servent la correction de tour, viennent encore des mètres interpolés. Les deux ne
disent pas toujours la même chose, et quand elles se contredisent un tour est ajouté à l'écart.
C'est le poste 18 et le poste 20 de `travaux.md`.
