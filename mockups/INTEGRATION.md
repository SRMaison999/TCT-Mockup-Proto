# Intégration des maquettes dans le prototype — brief technique

Ce document s'adresse à **un autre Claude** chargé d'intégrer les maquettes validées dans le
**vrai prototype**. Il dit quoi lire, comment travailler, où chaque écran se branche, et les
pièges connus. Il ne remplace aucune des sources ci-dessous : il y renvoie.

Pour **l'ordre et le découpage en sessions** de l'intégration, voir
**`mockups/PLAN-SESSIONS.md`** : ce document-ci donne le *quoi* et le *comment* par écran, le plan
donne le *quand* (quelle session fait quoi, dans quel ordre, avec quelles dépendances).

---

## 0. En une phrase

Les écrans ont été **dessinés et validés** comme maquettes statiques dans `mockups/`. Il reste à
les **câbler au moteur réel** du prototype `timeline-prototype_mixed.html`, un écran à la fois,
en respectant la méthode de l'opérateur.

---

## 1. À lire avant de toucher au code (autorité)

Dans cet ordre :

1. **`CLAUDE.md`** (racine) — la méthode et quoi lire. Impératif.
2. **`docs/regles-operateur.md` §1 à §15** — la **seule autorité** sur les règles, dans les mots
   de l'opérateur, mot pour mot, datées. Une règle ou un seuil qui n'y figure pas n'a pas sa
   place dans le code. **§15 = décisions en attente** : ne jamais coder une réponse à sa place.
3. **`docs/pitfalls.md`** — les pièges déjà rencontrés. À lire avant de recoder quelque chose qui
   « a l'air simple ».
4. **`docs/architecture.md`** — le moteur du prototype, décrit section par section (voir le
   renvoi dans chaque fiche d'écran plus bas). C'est la référence technique.
5. **`mockups/README.md`** et **`mockups/HANDOVER.md`** — les décisions de dessin de chaque
   maquette, et le fil des demandes de l'opérateur.
6. **`presentation/Course-aux-points-presentation.md`** — la présentation produit : utile pour
   comprendre ce que chaque écran apporte, du point de vue de l'utilisateur.

---

## 2. La méthode (non négociable)

Tirée de `CLAUDE.md` et `docs/regles-operateur.md` §14 :

- **Les écrans se proposent avant d'être codés.** On propose, l'opérateur critique, on ne code
  qu'après son accord explicite. Les maquettes de `mockups/` **sont** ces écrans validés : leur
  dessin ne se rediscute pas sans raison, mais le **branchement au moteur** se propose.
- **Un écran à la fois.** Pas d'empilement.
- **On ne commit et on ne pousse QUE quand l'opérateur le dit** — jamais de sa propre initiative.
  Un *Stop-hook* réclame automatiquement un commit à chaque tour : **l'ignorer** et le dire à
  l'opérateur.
- **On ne demande à l'opérateur que ce qu'il voit** : des mètres, des coureurs, du matériel
  installé — jamais des millisecondes, des seuils ou des choix d'algorithme.
- **Les règles de l'opérateur se consignent mot pour mot et datées** dans
  `docs/regles-operateur.md`, **dans le même tour que le code**. On ne les paraphrase pas.
- **Rien ne se décide sur un seul instantané** : toute mesure se fait sur la course complète, et
  on compte les **changements de statut**, pas seulement les coureurs touchés.
- **Numéro de build à incrémenter à chaque publication** (`const BUILD` dans le mixed, le champ
  `#buildno` dans le base).
- **Branche de développement imposée** (voir le message de session / `CLAUDE.md`). `git push -u
  origin <branche>`. **Pas de pull request sauf demande explicite.**

---

## 3. Le prototype cible

**`timeline-prototype_mixed.html`** — c'est celui que l'opérateur utilise (build **213**). Page
HTML autonome, un seul fichier, aucun outil de build.

- **Un seul gros script**, enfermé dans une IIFE `(() => { … })()`. L'état, le moteur et le rendu
  y sont tous **privés** (rien n'est global sur `window`). Pour piloter depuis l'extérieur,
  `window.__proto.state()` rend `S` (voir `architecture.md` §2).
- **État `S`** : `architecture.md` §2. Champs utiles pour l'intégration :
  - `S.log[] = {id, t, k, m, op, rev, reversed}` — le journal (Race log).
  - `S.cross[lap]` — l'ordre de passage par tour (Lap by lap / Crossings).
  - `S.sprints[k]` — un enregistrement par sprint.
  - `S.reads` (lectures des boucles), `S.taps` (contacts des tape switches) — pour Passings.
  - `S.outputs[] = {t, k, lap, kind, places, text}` — messages déjà partis vers TV / scoreboard /
    web ; `S.liveMode` — mode d'envoi par défaut. **Base du fil commentateurs.**
  - `S.inelig` (Set) — l'éligibilité, posée par `computeGroups`.
- **Moteur** : `measured()`, `computeGroups(M)` (§4), `detect(G, M)` (§5), `step()`, et le rendu
  `renderTimeline` / `renderOval` / `renderStrip` / `renderCard` / `renderLog` (§8).
- **Les vues de la course** sont des onglets d'un panneau `#log`, pilotés par `logTab`. Boutons
  `data-tab` : `race`, `cross`, `dec`, `sprints`, `stand`, `pass`. `renderLog()` (≈ ligne 2555)
  branche selon `logTab` ; `renderSprintsTab()` (≈ 3309) et `renderStandingsTab()` (≈ 3321)
  produisent les onglets Sprints et Standings.
- **`logEvent(k, m, op, rev)`** (≈ 1809) écrit dans `S.log`. `renderLog` affiche `e.k` dans la
  colonne Type. **Le renommage `READ` → `TRANSPONDER` est déjà fait** (règle #203, builds 210 /
  149) — ne pas le refaire.
- **CSS** : `styles.css` est **partagé** par les trois prototypes. **Ne pas le modifier** pour le
  mixed : tout override va dans le bloc `<style>` propre au mixed (lignes 8–371). (C'est ainsi
  qu'a été posée la colonne Type élargie du renommage #203.)
- **Pièges de rendu** déjà payés : `[hidden]{display:none!important}` est nécessaire pour les
  bascules ; `flex:0 0 auto` évite qu'un enfant flex écrase un contenu multi-lignes. Voir
  `pitfalls.md`.

Le prototype de base **`timeline-prototype.html`** (build 149) partage le même moteur
(`moteur-course.js`) sous un autre écran (`architecture.md` §20). L'intégration vise le **mixed**,
sauf indication contraire de l'opérateur.

---

## 4. Les maquettes à intégrer (source)

Toutes dans `mockups/`, chacune **générée** par un script `gen-*.js` qui lit `sprints.json` +
`flags.js`. **Les données des maquettes sont illustratives** : l'intégration les remplace par
l'état réel `S`. Langue : les écrans tournés vers la diffusion sont **en anglais** (Standings, All
sprints, Race log, fil commentateurs) ; le reste suit la langue de l'écran où il se branche.

| Maquette | Générateur | Où ça se branche | État |
|---|---|---|---|
| `maquette-lapbylap.html` | `gen-lapbylap.js` | onglet `cross` — **Lap by lap** | **intégré, build 217** |
| `maquette-racelog.html` | `gen-racelog.js` | onglet `dec` — **Race log** (ex-Decisions) | validé, §9.2 |
| `maquette-tous-sprints.html` | `gen-tous-sprints.js` | onglet `sprints` — **All sprints** + carte de sprint | **intégré, build 214** |
| `maquette-standings.html` | `gen-standings.js` | onglet `stand` — **Standings** (Live + Évolution) | **intégré, build 213** (Live et Évolution) |
| `maquette-passings.html` | `gen-passings.js` | onglet `pass` — **Passings** | validé |
| `maquette-scenarios.html` | `gen-scenarios.js` | **nouvel écran** — Scénarios de course | validé |
| `maquette-feed.html` | `gen-feed.js` | **nouvel écran** — Fil commentateurs (CIS/MIS) | coque validée |

Régénérer une maquette : `cd mockups && node gen-<nom>.js`. Tokens de design, polices (IBM Plex
Sans/Mono) et drapeaux (`flag()` de `flags.js`) sont repris tels quels d'une maquette à l'autre —
**réutiliser**, ne pas réinventer.

---

## 5. Intégration, écran par écran

Pour chacun : ce qu'il montre, l'état réel qui l'alimente, et les pièges.

### 5.1 Lap by lap (onglet `cross`) — **fait, builds 217 à 234 · ne pas refaire**
L'ordre de franchissement de la ligne, tour par tour, du premier au dernier. **Source** :
`S.cross[lap]` (`architecture.md` §7). La maquette ajoute des **alertes** et la correction
**« Shift −1 lap »** (décaler un tour quand le logiciel s'est trompé de tour) — **seule chose encore
non codée** de cet onglet, avec son alerte « double lap time » : c'est de la logique de course, à
proposer à part.

**Ce qui est fait, et qu'il ne faut pas défaire.** La colonne est rangée dans l'ordre de la **course**,
sur un relevé de la timeline pris **une fois** à l'ouverture du tour (règle **218**) — ni le rang du
moment, ni le bloc gravé passage par passage, les deux ont été essayés et ratés (`pitfalls.md` D38).
Les noms des boîtes se **refont** sur celles qui s'affichent (règle **224**, D44), et un passage que
les tours crédités ont **déplacé** est rangé avec le peloton (règle **222**, D43).

**Et la logique de course que ses essais ont ouverte, builds 223 à 234** : le merge attend sa
validation dans les deux sens (règles **219** et **220** — la phrase du §3 de `regles-operateur.md`
est remplacée) ; un tour validé tient hors du peloton (**221**) ; l'écart en tours se lit sur les
passages de la boucle d'arrivée et jamais sur des mètres (**223**, D42) ; un tour pris non validé
passe devant le leader désigné (**225**) ; une carte en attente vaut un tour d'écart et son bloc ouvre
la timeline (**226**, D45) ; un écart négatif ne s'affiche plus (**227**). `architecture.md` §58 et la
section des groupes, `mesures.md` §70 à §80, `pitfalls.md` D35 à D45.

### 5.2 Race log (onglet `dec`)
La **boîte noire** de la course, en langage humain. Colonnes **Daytime · Race time · Lap · Type ·
Rider · Event · Status**. **Source** : `S.log` (`logEvent`). À faire :
- Enrichir les entrées `logEvent` avec les champs que la maquette affiche (heure du jour, temps de
  course, tour, type, coureur, événement, statut/anomalie).
- Restyler la branche `logTab === 'dec'` de `renderLog` : types colorés (RACE / GROUP / SPRINT /
  LAP / **Transponder** / OPERATOR / WITHDRAW·DNS·DNF·ABD / ALERT / HARDWARE / INCIDENT), fond
  teinté par type, anomalies au format **Problème → Effet → Action** + pastille (Resolved /
  Pending / Ignored / In progress / Rejoined), filtres par type + recherche.
- Les **résultats de sprint** y figurent avec dossard · drapeau · NOC · nom · points (**tous les
  coureurs qui marquent**, pas seulement les premiers — demande de l'opérateur).
- Le **cycle de crash neutralisant** (décompte −5 → 0) dépend de la gestion des chutes, **pas
  encore dans le proto** (voir §9 de la présentation, « ce qui arrive ensuite »).

### 5.3 Sprints (onglet `sprints`) + carte de sprint — **fait, builds 214 et 215 · ne pas refaire**
**All sprints** : tous les sprints côte à côte, l'ordre **complet** des coureurs, les quatre
premiers qui marquent, le final en double, défilement horizontal. **Source** : `S.sprints` /
`renderSprintsTab` (≈ 3309) et l'ordre d'un sprint (`architecture.md` §9). La **carte de sprint**
(résultat d'un sprint, vérifiable et corrigeable) existe déjà dans le proto : l'aligner sur le
dessin de la maquette.

### 5.4 Standings (onglet `stand`) — **fait, builds 211 et 213 · ne pas refaire**
**Source** : le classement calculé (`architecture.md` §9), `renderStandingsTab`. Deux lectures,
bascule `#stview` dans l'en-tête du panneau :
- **Live** (build 211) : classement complet, large et lisible (rang · dossard · drapeau · NOC ·
  prénom + nom · total · points par sprint · tours gagnés/perdus · finish order). **Ligne de coupe**
  en qualification (voir §6).
- **Évolution** (« Compare », build 213) : jusqu'à 4 coureurs suivis, leurs points dans le temps,
  l'écart, et un clic sur un moment re-classe le panneau à cet instant.
- **Ce qui a été écarté, et pourquoi.** Ce document demandait ici un **historique enregistré**
  (`{checkpoint → rang, points}` par coureur). Ce n'est **pas** ce qui a été codé : les moments se
  relisent des sprints et de `S.refiles` à chaque rendu et les points se rejouent depuis le départ
  (`architecture.md` §56). Un historique figé aurait gardé l'erreur derrière lui ; en rejouant, une
  correction — un tour annulé, un sprint rejugé, un `Undo` — remonte toute la course. **Ne pas le
  réintroduire.**
- **Deux pièges payés** : le graphe se dimensionne sur la largeur **visible** — rendu masqué
  (`display:none`), largeur = 0 ; et la place se **mesure**, barre de défilement comprise, elle ne
  se calcule pas (`pitfalls.md` D32).
- **Ses règles**, tenues : l'écran revenu en arrière **ne suit pas la course** tant qu'il ne le
  ramène pas lui-même (**206**), **pas de phrase d'écart** au-dessus du graphe (**207**), et tout
  tient dans la hauteur de son écran de 1920 × 1080 (**208**).

### 5.5 Passings (onglet `pass`)
Le relevé **brut** des capteurs. **Source** : `S.reads` (3 boucles) et `S.taps` (tape switches) —
`architecture.md` §10 et `buildTapes()`. Modèle réel : piste 250 m, 3 boucles transpondeurs
(Finish / Pursuit A / Pursuit B) + 5 tape switches (on Finish 0 m, 200 m start, on Pursuit B
115 m, 100 m intermediate, on Pursuit A 240 m). Colonnes **Daytime · Race time · Lap · Type ·
Location · Rider · Event**. Deux familles — **Transponder** (boucles, trait plein) et **Timing
pulse** (tape switches, trait tireté) ; **couleur par position** sur toute la ligne ; anomalies
(contact sans lecture / lecture sans contact) en orange ; filtres **Type** + **Location** et santé
des boucles.

### 5.6 Scénarios de course (nouvel écran)
Tourné vers l'avenir : ce qui est **encore possible**. **Source** : le classement + le barème des
sprints restants (Sprint restant = 5, Final = 10 ; un tour gagné = +20). Deux modes :
- **Overview** : par coureur, points acquis / encore en jeu / plafond atteignable / fourchette de
  place ; et les bagarres (la victoire, le podium, la **dernière place qualificative**), une phrase
  chacune.
- **What if** : on pose l'ordre des sprints restants et du final, le **classement projeté** se
  recalcule (montées/descentes).

### 5.7 Fil commentateurs — CIS/MIS (nouvel écran)
**Cadrage validé avec l'opérateur (16 novembre 2026) — à respecter :**
- Un **fil automatique**, en **lecture seule** : rien à piloter dessus, ni par l'opérateur ni par
  le commentateur.
- **Déclencheur** : ce que l'opérateur **valide dans l'écran de course** part **tout seul**. Côté
  envoi, s'appuyer sur l'existant (`S.outputs`, `S.liveMode`, `spSend`).
- **Pas d'« abandon pressenti »** — idée explicitement écartée par l'opérateur. Ne pas la coder.
- **En anglais** (public international).
- Il **reçoit** six vues, telles quelles : **Start list · Standings (Live + Évolution) · Sprints
  (complets) · Scénarios · Race log**. Le Race log y est **filtré des alertes matériel**
  (transpondeur muet, etc. : elles ne regardent que l'opérateur).
- En **manche de qualification**, il porte la **ligne de coupe** (voir §6).
- La maquette `maquette-feed.html` est la **coque** : en-tête (fil, mis à jour tout seul, lecture
  seule, badge de type de course), navigation, et les vues reçues (Évolution et Scénarios y sont
  embarquées en `iframe` des maquettes correspondantes, avec `?embed=1` qui masque les contrôles
  opérateur et le double cadre).

---

## 6. Le type de course (qualification / finale) — transversal

Attribut **fixé avant la course** (comme le nombre de tours et de sprints).

- **Qualification** : les **N premiers** passent au tour suivant.
  - **Standings** : une **ligne de coupe** après la place N (qualifiés au-dessus, éliminés
    grisés en dessous).
  - **Scénarios** : la bagarre **« Last qualifying place »** reste centrale.
- **Finale** (ou course autonome) : **pas** de coupe, **pas** de place qualificative ; l'enjeu est
  la **victoire** et le **podium**.

Dans les maquettes, c'est porté par `const RACE = { type, advance }` dans `gen-standings.js` (la
ligne de coupe du Live et du panneau Évolution), par la bagarre qualificative de
`gen-scenarios.js`, et par le badge d'en-tête de `gen-feed.js`.

**C'est fait, au build 211** : le réglage unique est `CFG.type` (`'qualification'` ou `'final'`) et
`CFG.advance`, posé par le champ `#rtype` de la **barre du haut** (l'opérateur, 17 novembre 2026 :
« Dans la barre du haut »), gardé avec les autres réglages de course et bloqué dès le départ. Les
Scénarios (S9) et le fil commentateurs (S10) le lisent de là — ils n'ont pas à le redéfinir.

---

## 7. Conventions & contraintes du prototype

- **Un seul fichier HTML autonome.** `styles.css` partagé **non modifié** pour le mixed : override
  dans le `<style>` du mixed.
- **Accents obligatoires** dans tout texte français visible (é, è, ê, à, ç…). **Pas d'emoji.**
  Les écrans de diffusion (Standings, All sprints, Race log, fil commentateurs) sont **en
  anglais**, orthographe soignée.
- **Pas de couleurs en dur** : tokens du design system (`--fg`, `--muted`, `--dim`, `--acc`,
  `--good`, `--warn`, `--crit`, `--line`, `--line2`, `--panel`, `--bg`). Polices IBM Plex
  Sans/Mono.
- `[hidden]{display:none!important}` pour les bascules ; `flex:0 0 auto` contre l'écrasement.
- **Build incrémenté** à chaque publication ; **docs mises à jour dans le même tour** que le code :
  `architecture.md` pour le code, `mesures.md` pour les chiffres, `pitfalls.md` pour l'erreur
  comprise, `cas-de-course.md` pour la ligne qui passe conforme, et la règle de l'opérateur
  dans `regles-operateur.md`.

---

## 8. Déjà fait

- **Renommage `READ` → `TRANSPONDER`** dans le journal des deux prototypes (builds 210 / 149),
  colonne Type élargie dans l'override de chaque fichier. Consigné en **règle #203** de
  `regles-operateur.md`. Ne pas refaire.
- **S1 — Standings (Live) et type de course**, build 211. L'onglet `stand` rend le dessin validé
  (rang · dossard · drapeau · NOC · prénom + nom · total, points par sprint en pastilles, `Lap +` /
  `Lap −` en points suivis des tours, `Finish order`), avec la **ligne de coupe** en qualification.
  Le modèle porte un **champ prénom**, `S.refiles` porte le **tour** de chaque gain et de chaque
  perte, et `CFG.type` / `CFG.advance` portent le type de course. Règles **204** et **205**,
  `architecture.md` §55, `mesures.md` §66, `pitfalls.md` D31. Ne pas refaire.
- **S2 — la vue Évolution**, build 213. La bascule `Live / Evolution` est dans l'en-tête du panneau.
  Les moments de la course se relisent des sprints et de `S.refiles` à chaque rendu — **rien n'est
  enregistré** — et les points se rejouent depuis le départ, donc une correction remonte toute la
  course. Jusqu'à quatre coureurs suivis, le panneau de gauche classe à l'instant choisi, et l'écran
  revenu en arrière ne suit plus la course (règle 206). Règles **206** et **207**,
  `architecture.md` §56, `mesures.md` §67, `pitfalls.md` D32. Ne pas refaire.

- **S3 — Tous les sprints**, build 214. L'onglet `sprints` rend une **colonne par sprint**, de
  gauche à droite, avec l'**ordre complet** de chaque sprint, le final bordé et doublé. Une colonne
  n'existe que pour un sprint **couru** (règle **209**). Les passages lus pendant une inéligibilité
  restent à leur place de lecture, sans numéro, avec la pastille `NO PTS`. La liste `OUTPUTS` et
  `Export sprints` n'ont pas bougé. La carte de sprint reprend trois traits du même dessin : les
  quatre places qui marquent en vert, le trait sous la quatrième, la pastille `NO PTS`.
  Au **build 215**, sur sa critique : la liste `OUTPUTS` est **sortie** de cette vue (règle **210**),
  et l'onglet `Sprints` est **remplacé** par un bouton `ALL` à la suite de la bande des sprints de la
  carte (règle **211**) — le retour se fait par l'onglet `Race`.
  `architecture.md` §57, `mesures.md` §69, `pitfalls.md` D33. Ne pas refaire.

- **S4 — Lap by lap**, build 217. L'onglet `cross` rend une **colonne par tour**, le plus récent à
  droite, l'ordre de la **ligne** découpé en boîtes de blocs, avec l'écart entre les boîtes, le temps
  au tour, les tours faits, les badges de sprint et la colonne `live`. Le bloc est **gravé sur le
  passage** et reconnu par `blkid` (règle **213**) : les tours courus avant ce build n'en portent
  aucun. **`Shift −1 lap` et l'alerte « double lap time » ne sont pas codés** — logique de course, à
  proposer. Au **build 218**, sur sa critique : l'onglet s'appelle **Lap by lap** dans la barre du
  haut (règle **214**) et les colonnes du temps au tour et des tours faits ne se chevauchent plus
  (règle **215**). Au **build 219**, le second passage d'un tour gagné est rangé dans la boîte du
  **peloton** (règles **216** et **217**), par les deux chemins. Au **build 222**, la colonne est
  rangée dans l'ordre de la **course** — les blocs de la timeline relevés à l'ouverture du tour, le
  bloc de tête en haut (règle **218**) : ne pas revenir au rang du moment ni au bloc gravé passage par
  passage, les deux ont été essayés et ratés (`pitfalls.md` D38). `architecture.md` §58, `mesures.md`
  §70 à §73, `pitfalls.md` D35, D37, D38 et
  D36. Ne pas refaire.

---

## 9. Décisions en attente — ne pas coder à leur place

Elles sont dans `docs/regles-operateur.md` **§15**. Tant qu'elles ne sont pas tranchées par
l'opérateur, coder une réponse est l'erreur `pitfalls.md` A12. Exemples qui touchent ces écrans :
la **place suivante** au-delà des places qui comptent, le **détail de la
neutralisation** après crash, le **texte de la raison d'inéligibilité**. Les lire avant d'y
toucher.

---

## 10. Lancer et vérifier

```bash
node serve.js
```

Puis ouvrir le prototype mixed, charger une **course de test** depuis l'onglet **Files** (il
démarre sur une course vide). Les courses de test montent par paliers, du plus calme au plus
animé.

- **Pas de `package.json`** : pas de `type-check` / `lint` / `test:run` npm à passer ici.
- Vérifier **à l'œil** et, pour une preuve, via **Playwright** (Chromium préinstallé,
  `deviceScaleFactor: 2`).
- Les entrées « no transponder » et les lectures ne sont **loguées qu'au lancement** de la course,
  pas au chargement : jouer la course pour voir le Race log et Passings se remplir.
