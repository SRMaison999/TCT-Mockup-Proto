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

## 9. Continuation (15–16 novembre 2026) — Race log, Possible scenarios, Standings evolution

Travail poursuivi en **maquettes de scratchpad** (générateurs node + captures Playwright),
**non commitées** (le scratchpad est éphémère) : `gen-decisions.js`, `gen-situation.js`,
`gen-standings-evo.js`. Les **exigences** sont consignées ci-dessous pour refaire sans repartir
de zéro.

### 9.1. Renommages demandés par l'opérateur
- **« Decisions » → « Race log »** (la boîte noire : les faits de la course).
- **« Race situation » → « Possible scenarios »** (l'analyse sportive).
- **« READ » → « Transponder »** partout dans l'appli (changement de code à **proposer** avant de
  coder). L'opérateur y tient : « read » n'a aucun sens pour lui.

### 9.2. Race log (ex-Decisions) — exigences (maquette plutôt bien reçue)
Journal « boîte noire » en langage humain, tableau à colonnes alignées : **Daytime · Race time ·
Lap · Type · Rider · Event · Status**. Anomalies au format **Problème → Effet → Action** avec
pastille de statut (Resolved / Pending / Ignored), sur les vrais composants.
- Types **réels** de l'appli (ne rien inventer) : RACE / GROUP / SPRINT / LAP / TRANSPONDER /
  OPERATOR / WITHDRAW / ALERT / HARDWARE / **INCIDENT**.
- Pannes matérielles à tracer : tape switch défectueux, transpondeur non détecté, boucle
  défectueuse, perte réseau décodeur. Retraits : DNS (pas de départ), DNF (sorti par les
  commissaires), ABD (abandon volontaire).
- Résultat de sprint : infos **complètes** par place — place · dossard · **drapeau** · NOC · nom.
- **Cycle d'un crash** (chaque changement d'état = une ligne) :
  crash signalé (par l'opérateur **ou** détecté par le système, transpondeurs qui ne bougent
  plus) · **cause** (chute, ou mécanique : dérailleur / pneu crevé) · **fenêtre de 5 tours** pour
  reprendre · **course neutralisée ou non** (si neutralisée : décompte **−5 / −4 / −3 (le coureur
  repart) / −2 / −1 (a repris sa place) / 0 (l'arbitre relance)**, + X tours jusqu'au prochain
  sprint) · **issues** : reprend / reprend **sans transpondeur** (changement de vélo) / **abandon**
  à la suite du crash. Couleur du type INCIDENT **à définir** (rouge provisoire).

### 9.3. Fil CIS/MIS commentateurs — à concevoir séparément (PAS fait)
Sortie vers le système central (Commentator / Monitor Infosystem) : start list, classement final,
dernier sprint, standings, et le **journal** (pas les alertes hardware). Idée forte : un **abandon
pressenti** saisi tôt (le coureur souffre, avant qu'il lève le pied) **poussé aux commentateurs
avant l'officialisation**. Dépend des crashs/abandon dans le prototype. À maquetter ensuite.

### 9.4. Possible scenarios (ex-Race situation) + Standings evolution — **REJETÉ, À REFAIRE**

> **Verdict de l'opérateur (16 novembre 2026) :** le résultat est jugé **« de la merde »**,
> **inutilisable, à refaire** — et, selon ses mots, **par quelqu'un « capable de réfléchir et de
> comprendre le besoin », pas par l'assistant qui a produit ça**. Plusieurs itérations ont **toutes
> été rejetées**. **Ne pas réutiliser les maquettes de scratchpad ; repartir du besoin ci-dessous.**

Le besoin, tel que l'opérateur l'a exprimé :

**(A) Standings — une page, toggle `Live standings` / `Standings evolution` (ou `progression`).**
- **Live** : le classement général, **large et lisible** (rang · dossard · drapeau · NOC · nom ·
  total), **pas comprimé**.
- **Evolution** : montrer comment le classement bouge **à chaque entrée** (chaque sprint, chaque
  tour gagné / perdu). Pistes demandées successivement (toutes jugées illisibles en l'état) :
  en-têtes de colonnes **« lap N / événement »** (« lap 34 / lap gained · 3 FRA ») ; **graphe de
  lignes** du rang dans le temps avec **noms au bout des lignes** ; **ne pas** afficher un coureur
  tant qu'il a 0 point ; **axe des rangs gradué** ; **axe des tours à l'échelle réelle**. Le besoin
  réel reste à **cadrer en mots** avec l'opérateur avant tout dessin.
- **Filtrer par coureur** (clic), suivre **2–3** coureurs, lire **l'écart de rang et de points**
  entre eux.

**(B) Possible scenarios — l'analyse sportive, à refaire aussi.**
- **Points encore en jeu** : Sprint 5 = 5, Final = 10 → **15 pts** par les sprints (**+20** avec un
  tour gagné).
- **Par coureur** : total actuel, **maximum atteignable** (actuel + 15, variante +20 avec un tour),
  **meilleure place** que ce plafond permet.
- Qui peut **gagner**, qui peut **prendre la place** de qui, qui peut être **relégué** — en **vrais
  mots, courts**, **sans** notation cryptique, **sans** prendre tout l'écran.
- **Race Insights** (séries, montées, luttes rapprochées) : **utile au commentateur, pas à
  l'opérateur** → ne pas l'imposer dans la vue opérateur.

**Méthode à tenir** : **cadrer le besoin en mots avec l'opérateur et le faire valider AVANT de
dessiner** ; un écran = un seul job ; ne rien empiler ; ne rien inventer ; **relire son travail
avant de le montrer**. L'enchaînement de maquettes produites sans cadrage préalable a fait perdre
la session.

### 9.5. Prochaine étape
Reprendre **(A) Standings evolution** et **(B) Possible scenarios** **à zéro**, en cadrant le
besoin **en mots** d'abord. Le **Race log** (9.2) est en bon état mais son générateur est en
scratchpad éphémère : le re-créer depuis les exigences. Les trois écrans validés (§2–4) restent à
intégrer.
