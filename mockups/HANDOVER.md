# Passation — session du 15 novembre 2026

Travail sur **`timeline-prototype_mixed.html`** (la version à six onglets). Tout ce qui suit est
**scopé à la version mixte** : `styles.css` et le prototype de référence ne sont pas touchés —
l'opérateur l'a choisi explicitement.

Deux choses très différentes dans cette session : **du code livré** (le restyle des onglets) et
**des maquettes validées mais pas encore intégrées** (trois écrans : All sprints, Lap by lap,
Standings). Ne pas confondre.

---

## 1. Livré et poussé — restyle des onglets (build 209)

Commit `192c4d3` sur la branche `ccr-57a6f86a-chr46r`, déjà poussé.

Les cinq onglets (Crossings, Decisions, Sprints, Standings, Passings) donnaient l'air d'un autre
écran à cause du **fond bleu du panneau du journal** (`.log`, `styles.css:253`, posé sur `--deep`
avec bordure `--acc`). Override dans le bloc `<style>` du fichier mixte : `.log` passe sur le gris
`--panel` à bordure `--line`, comme la timeline et la barre d'actions ; l'en-tête du tableau
Passings (`.rows.pass .ph`) passe de `--deep` à `--panel`. **Couleurs seulement, aucun
comportement touché.** Consigné dans `docs/architecture.md` §21. Build 209.

---

## 2. Validé mais PAS codé — écran « All sprints »

Maquette : `mockups/maquette-tous-sprints.html` (et `-20.html` pour 20 sprints). **Validée par
l'opérateur.** Reste à intégrer dans le prototype.

Le plan d'intégration convenu (rien n'a été commencé — une première tentative a été **annulée**
car l'opérateur n'avait pas donné le feu vert) :

1. **Bouton « All sprints »** dans la bande de sprint (`renderCard`, la `.sprow` construite vers
   `timeline-prototype_mixed.html:3156`) → ouvre un écran **plein** (même panneau gris que les
   onglets). Fermeture par Close / Échap.
2. **Supprimer l'onglet « Sprints »** de la barre (`#logtabs`, ligne 395 ; le clic lit `data-tab`
   directement, pas d'indice — retrait sans risque). L'« Export sprints » déménage sur le board.
3. **La carte sprint par sprint ne bouge pas.**
4. **Sprint final toujours ouvert** (voir §4, règle à consigner). Aujourd'hui le final ne
   s'auto-ferme jamais (`spTick` exclut `isFinal`) ; seul le **Close manuel** (`spClose`,
   ligne 3101) le ferme → le désactiver pour le final et cacher son bouton.
5. **Photo-finish** : dans la carte de sprint, la ligne d'un départage photo passe du **rouge au
   orange** (`.srow.cam`, `styles.css:319`, override dans le fichier mixte) et l'**icône caméra
   (`CAM`, ligne 3106, stroke `#FF5C5C`) passe au blanc**.
6. **Non éligible = rouge + « NO PTS »** partout : dans la carte de sprint (`.srow.grey`,
   `styles.css:327`, aujourd'hui gris → rouge + badge « NO PTS ») ET dans le board. Réutiliser la
   convention `.npts` de la page de course.
7. **Deux tooltips français → anglais** (les seuls textes français visibles du prototype) :
   - `timeline-prototype_mixed.html:553` → `Passings where the tape and the loop did not agree`
   - ligne 2555 (bouton Export trace) → `The trace: every change the prototype saw, for diagnostics`

Dessin du board (dans la maquette) : une colonne par sprint, de gauche (S1) à droite (Final ×2),
**ordre complet**, rang + dossard + **drapeau** + nation, les **4 qui marquent** surlignés vert +
points (final doublé). Non éligible = fond rouge + badge « NO PTS ». **Flèches ‹ ›** de navigation
(jusqu'à 20 sprints). Tout en **anglais**.

Données utiles pour coder : `spOrder(k)` → `{seq, read, greyed, notEligible}` ; `spPoints(k)` →
`{bib: points}` (4 premiers, ×2 au final) ; `spFull(k)` ; `isFinal(k)` ; `spSendState(k)`.

---

## 3. Validé mais PAS codé — écran « Lap by lap » (ex « Crossings »)

Maquettes : `mockups/maquette-lapbylap.html` (avant correction, avec alertes) et
`maquette-lapbylap-shift.html` (après « Shift »). **Validé.** La logique exacte (gain/perte/
détection ratée) est encodée dans `mockups/gen-lapbylap.js` — **c'est la référence pour coder**.

Ce que l'écran doit faire :

- **Renommer l'onglet « Crossings » en « Lap by lap ».**
- **Horizontal** : un **tour = une colonne**, chronologique, **plus récent à droite** (la vue
  s'ouvre calée à droite, sur le tour en cours).
- Dans chaque colonne : rang + dossard + drapeau + nation, dans l'ordre de passage.
- **Groupes de la timeline** : fond de couleur par groupe, en-tête de groupe, **écart mesuré
  entre les groupes**. **Vrais noms** (`groupName`, `timeline-prototype_mixed.html:2082`) :
  **Leader** (un seul en tête) / **Leaders** (plusieurs) / **Chase** / **Bunch** / **Behind** /
  **Last**. *(Il n'y a PAS de « Breakaway ».)*
- **Deux chiffres par coureur**, avec en-têtes de colonnes **« LAP TIME »** et **« LAPS DONE »** :
  - **lap time** = temps mis pour boucler le tour (≈ 16,7 s à 250 m / 15 m/s).
  - **laps done** = nombre **absolu** de tours bouclés (jamais un « ±1 ») ; **vert** s'il est
    au-dessus du peloton, **rouge** s'il est en dessous.
- **Gagner un tour** (le coureur est seul échappé avant) : au tour où il prend le tour, il
  **apparaît deux fois à ses vraies positions** — une fois **seul en tête** (il franchit la ligne
  bien avant le peloton) avec son compte N, puis une fois **au milieu du peloton** où il se
  replace, avec N+1. Avant, il roule seul en tête (groupe Leader) ; après, il est dans le peloton
  (+1, vert). Les deux lignes portent un repère.
- **Perdre un tour** (le coureur est décroché, dernier) : le tour où il se fait doubler, **il
  n'apparaît pas** ; avant il est dernier (Last), après il est **replacé dans le peloton** avec un
  compte diminué (rouge).
- **Détection ratée (transpondeur)** — important :
  - Le signal est un **lap time ≈ 2×** la normale, affiché dans une **pastille orange**.
  - Le logiciel **ne décale JAMAIS tout seul** (ça pourrait être un tour vraiment lent) : il
    **propose** à l'opérateur, bouton **« Shift −1 lap »**.
  - **Après** que l'opérateur a cliqué : la détection est recalée, le tour raté affiche le coureur
    **tout en bas de son groupe** (celui où l'opérateur l'a confirmé) avec une **légende**, et le
    lap time redevient normal.
- **Alertes** : un tour qui a des événements à vérifier (gain, perte, détection ratée) est
  **entouré en orange**, avec **« N alerts »** à côté du nom du tour. Les alertes sont écrites **en
  bas de la colonne**, en grand (on a toute la hauteur), et le **bouton Shift y vit**.
- **Remplissage en direct** : si l'opérateur ouvre la vue en course, la colonne du tour en cours
  se **remplit au fil des passages** (pas d'un coup en fin de tour). Montré par une colonne
  « LAP N · live », partiellement remplie.

Données utiles : `S.cross[k]` (ordre de passage par tour), `S.holes[k]` (coureurs lapés sans
passage), `S.tlRank`, `lapsOf(bib)`, `computeGroups`/`lastG` et `groupColor`/`groupName`.
**Point de faisabilité à vérifier** : colorer les groupes **tour par tour dans le passé** suppose
que le moteur garde l'historique des groupes — à confirmer avant de coder.

---

## 4. Validé mais PAS codé — écran « Standings »

Maquette : `mockups/maquette-standings.html`. **Validé.** C'est le **classement général**. Logique
exacte dans `mockups/gen-standings.js`.

- **Bloc de gauche, resserré** (l'info qu'on ne va pas chercher loin ; les colonnes se suivent
  collées — le vide part à **droite**, jamais au milieu) : **rang · dossard · drapeau · NOC ·
  prénom + nom · TOTAL**. Le total juste après le nom, en gros.
- **Points par sprint** : une colonne par sprint (**S1 … F**, le final), chaque score dans une
  **pastille ambrée** ; « · » pour 0. Défile pour 15–20 sprints.
- **Lap + / Lap −** : les **points** (pas le nombre de tours) dans une **pastille** — **+60** verte,
  **−20** rouge — suivis des **tours** où c'est arrivé (ex. `L17, L34, L48`). La cellule s'étale (la
  liste des tours passe sur deux lignes si besoin).
- **Finish order** : la place à l'arrivée (ordre du sprint final), en ordinal. Nom de colonne
  **confirmé par l'opérateur = « Finish order »** (terme UCI).
- **Export PDF / Export CSV** en haut à droite.
- Tout est **grand et lisible** (l'opérateur tient à la taille), pastilles comme « Lap by lap ».

À savoir pour coder :
- **Le modèle n'a que le nom de famille** — pas de prénom. Dans la maquette les prénoms sont
  **illustratifs** ; à l'intégration il faut un **champ prénom** (il vient de la vraie startlist).
- Données : `standings()` donne l'essentiel ; points par sprint = `spPoints(k)[bib]` ; le **tour**
  de chaque gain / perte se lit dans le journal (`logEvent`) ; `LAP_PTS = 20`.

---

## 5. Règles de l'opérateur à consigner dans `docs/regles-operateur.md`

À faire **au moment de l'intégration** (mot pour mot, datées du 15 novembre 2026), pas avant :

- **Le sprint final ne se ferme jamais** ; il reste toujours ouvert.
- **Non éligible à un sprint** : affiché en **rouge avec « NO PTS »**, pas en gris — carte de
  sprint comme « All sprints ».
- **Photo-finish** : bande **orange** (pas rouge), icône caméra **blanche**.
- **Pastille du nombre de tours** = compte **absolu** de tours bouclés ; couleur **verte**
  au-dessus du peloton, **rouge** en dessous.
- **Détection ratée / transpondeur manquant** : ne jamais décaler automatiquement ; le logiciel
  **propose** à l'opérateur de décaler. Après acceptation, le coureur est placé **en bas de son
  groupe** au tour raté, avec légende.
- **Classement (Standings)** : la colonne d'arrivée s'appelle **« Finish order »** ; les colonnes
  Lap affichent les **points** (±20 par tour) avec les tours, pas le nombre de tours ; points de
  sprint et de tour en **pastilles** ; le classement affiche **prénom + nom** (le modèle doit
  porter un champ prénom).
- **Toute l'interface est en anglais.**

---

## 6. Méthode (rappels, cf. CLAUDE.md §14 et docs/regles-operateur.md §14)

- **Proposer avant de coder.** On a appris cette session : une intégration lancée sans feu vert a
  dû être annulée. Les maquettes se montrent, l'opérateur critique, on ne code qu'après son
  **accord explicite**.
- Les maquettes se font en **captures** (Playwright + fichier serve / file://), l'opérateur
  travaille à l'œil sur les images.
- Documents mis à jour **dans le même tour** que le code ; **build incrémenté** à chaque
  publication.
- Pas de `package.json` dans ce dépôt : les scripts npm des préférences n'existent pas, rien à
  exécuter avant commit.
- **Ne jamais inventer** un nom, un seuil, une couleur hors de ce que l'opérateur a dit. (Erreurs
  de cette session : groupe « Breakaway » inexistant, placements/compteurs du gain de tour faux
  avant correction. L'opérateur tient beaucoup à la cohérence et au réalisme.)

---

## 7. Maquettes restant à faire

La liste vient de la **« note de travail du 15 novembre 2026 »** en tête de
`presentation/Course-aux-points-presentation.md` (quatre points de lisibilité relevés) et de la
demande initiale de l'opérateur. Sur ces quatre points :

| Point de la note | État |
|---|---|
| **Vue par sprint** (le Sprints répète le même sprint, mélange résultat et diffusion) | **Fait** (maquette « All sprints »). |
| **Ordre de passage tour par tour** (difficile à lire) | **Fait** (maquette « Lap by lap »). |
| **Standings** | **Fait** (maquette « Standings »). |
| **Journal Decisions** | **À maquetter.** |
| **Passings** (relevé brut des boucles) | **À maquetter** (la note groupait « Passings et ordre de passage » ; seul l'ordre de passage est fait). |

Ce qui reste, avec les demandes déjà exprimées :

- **Journal Decisions** — plusieurs demandes :
  - consigner aussi la **formation automatique d'un groupe** (pas seulement les comptages de
    contacts capteurs) ; les groupes ne se forment que de temps à autre, ça ne noierait pas le
    journal et ça mérite une trace ;
  - des **repères colorés** : un groupe qui se forme reçoit un **fond plus marqué** que de simples
    contacts ;
  - pouvoir **trier et filtrer** les entrées : par couleur, par type d'événement, par niveau
    d'alerte, etc.
- **Passings** — **présentation plus claire** du relevé brut des boucles (la note le juge, comme
  les vues tour par tour, « difficile à lire, ne rend pas assez »).

## 8. Prochaine étape

Deux voies possibles, à proposer à l'opérateur :

1. **Maquetter** l'un des deux écrans restants ci-dessus (**Journal Decisions** ou **Passings**) ;
   ou
2. **Intégrer** dans `timeline-prototype_mixed.html` l'un des trois écrans déjà validés (All sprints,
   Lap by lap ou Standings) — en **proposant d'abord**, puis en **consignant les règles du §5** dans
   `docs/regles-operateur.md` dans le même tour que le code, build incrémenté.

Demander à l'opérateur lequel il veut attaquer. **Ne rien coder dans le prototype sans son accord
explicite.**

---

## Addendum — session du 16 novembre 2026

L'opérateur a demandé de **finir les maquettes manquantes de Passings et de Standings**. Deux
précisions données en séance (mot pour mot, reportées aussi dans `mockups/README.md`) :

- **Standings** : « Finaliser l'existante. Mais y intégrer également une vue Standings Évolution
  qui indique l'évolution du classement tout au long de la course. »
- **Passings** : « Il faut des démarcations colorées pour différencier les différents types de
  Passings (dans le même style que la vue Race logs). »

Livré ce tour :

- **`mockups/maquette-passings.html`** (+ `gen-passings.js`) — relevé brut repensé, **VALIDÉ par
  l'opérateur le 16 novembre 2026**. Colonnes reprises de la feuille **Race log** : **Daytime ·
  Race time · Lap · Type · Location · Rider · Event**. Deux familles — *Transponder* (les 3
  boucles, trait plein) et *Timing pulse* (les 5 tape switches, trait tireté) — modèle de capteurs
  repris TEL QUEL du prototype (`buildTapes` : Finish 0 m, 200 m start 50 m, Pursuit B 115 m,
  100 m intermediate 150 m, Pursuit A 240 m). **Couleur par position** sur toute la ligne (style
  Race log) ; anomalies *contact sans lecture* / *lecture sans contact* en orange dans Event ;
  filtres cliquables **Type** + **Location** et Loop health. Lectures **illustratives** (cf. README).
- **`mockups/maquette-standings.html`** (+ `gen-standings.js`) — **une page, toggle `Live` /
  `Evolution`, VALIDÉE le 16 novembre 2026** (le bump chart rejeté §9.4 a été supprimé) :
  - **Live** : le classement complet finalisé (anglais, « Finish order » tient à l'écran). Vue par
    défaut à l'ouverture.
  - **Evolution** : la vue **Compare** validée, cadrée en mots avec l'opérateur. Le classement à
    l'instant choisi (panneau gauche) sert de **sélecteur** et se re-classe au moment cliqué ; on
    suit **jusqu'à 4** coureurs (au-delà c'est illisible — testé) ; le graphe est en **points**
    (l'écart = la distance verticale), avec à 2 coureurs la bande d'écart + les valeurs + la ligne
    Gap ; tableau rang+points par mise à jour, aligné sous le graphe ; noms au bout des lignes ;
    **axe des points et colonne de noms figés** pendant le défilement d'une longue course. Rendu
    client (JS + données embarqués).

### État des maquettes — à jour

| Écran | État |
|---|---|
| All sprints, Lap by lap | **Fait** (sessions précédentes). |
| **Passings** | **Validé** le 16 novembre 2026 (colonnes Race log, couleur par position). |
| **Standings** | **Validé** le 16 novembre 2026 : une page, toggle **Live** (classement complet) + **Evolution** (Compare). |
| **Race log (ex-Decisions)** | **Validé** le 16 novembre 2026 (`maquette-racelog.html` + `gen-racelog.js`), recréé depuis la capture retrouvée + §9.2 : colonnes Daytime·Race time·Lap·Type·Rider·Event·Status, anomalies Problème→Effet→Action, cycle de crash neutralisant (−5→0), résultats de sprint complets (drapeau + NOC), filtres + recherche. |
| **Possible scenarios (ex-Race situation)** | **À refaire** depuis le besoin §9.4. |

### Prochaine étape

À proposer à l'opérateur, après sa critique de Passings et Standings : soit **maquetter le
Journal Decisions** (dernier écran), soit **intégrer** l'un des écrans validés dans
`timeline-prototype_mixed.html` — en proposant d'abord, en consignant les règles de l'opérateur
dans `docs/regles-operateur.md` dans le même tour que le code, build incrémenté.
