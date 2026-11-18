# Plan des sessions d'intégration

Feuille de route pour câbler les maquettes validées (`mockups/`) au moteur réel du prototype
`timeline-prototype_mixed.html`. Le **détail technique** de chaque écran est dans
`mockups/INTEGRATION.md` ; **ici, l'ordre et le découpage en sessions**.

---

## Comment mener chaque session

- **Lire d'abord** `mockups/INTEGRATION.md`, puis l'autorité : `CLAUDE.md`,
  `docs/regles-operateur.md` §1–15 (dont §15 = décisions en attente, à ne pas trancher),
  `docs/pitfalls.md`, `docs/architecture.md`.
- **Un seul thème par session.** On **propose** le branchement, l'opérateur **valide**, puis on
  **code**. On ne demande à l'opérateur que ce qu'il voit (mètres, coureurs, matériel).
- **Consigner dans le même tour** : toute règle nouvelle (mot pour mot, datée) dans
  `docs/regles-operateur.md` ; le code décrit dans `architecture.md` ; le numéro de **build
  incrémenté**.
- **Commit/push seulement sur l'ordre de l'opérateur** (un Stop-hook le réclame
  automatiquement — l'ignorer).
- Si la session **déborde** le contexte, finir par un **HANDOVER** propre et reprendre.

## Ordre conseillé

```
S1 ─ Standings Live + type de course          LIVRÉ, build 211
 └─ S2 ─ Historique + Évolution               LIVRÉ, build 213
S3 ─ Sprints  LIVRÉ 214   S4 ─ Lap by lap  LIVRÉ 217   S5 ─ Passings ← la suivante
S6 ─ Chutes & neutralisations ──┐
S7 ─ Avant-course (indépendant) │
                                ├─ S8 ─ Race log  (a besoin de S6)
S1 ──────────────────────────── ┴─ S9 ─ Scénarios (a besoin de S1)
Tout le reste ───────────────────── S10 ─ Fil commentateurs
```

Jalon : après **S1–S5**, tous les écrans « en course » sont refaits. **S6–S7** et **S10** sont
les plus lourds et peuvent attendre leur tour.

---

## Phase 1 — Les écrans dont la donnée existe déjà

### S1 · Standings (Live) + type de course — **livré, build 211**
- **But.** Rebrancher l'onglet `stand` sur le dessin Live validé, et poser le **réglage type de
  course** (qualification top N / finale) avec la **ligne de coupe**.
- **Pourquoi en premier.** Self-contained, et le type de course sert ensuite aux Scénarios et au
  fil commentateurs.
- **Source.** Classement calculé (`architecture.md` §9), `renderStandingsTab`.
- **Fini quand.** Le classement s'affiche au nouveau dessin, lisible ; en qualification la ligne
  de coupe sépare qualifiés et éliminés ; le type de course est un réglage de course. **Fait.**
- **Livré.** Règles **204** et **205** de `regles-operateur.md`, code dans `architecture.md` §55,
  mesures dans `mesures.md` §66, l'erreur comprise dans `pitfalls.md` D31. Le type de course est
  dans la **barre du haut** (ses mots du 17 novembre 2026), se bloque au départ comme `Laps` et
  `Sprints`, et se garde d'une course à l'autre.
- **Ce qui reste ouvert et n'est pas de cette session.** La barre du haut déborde à 1440 px —
  elle débordait déjà avant ce build — et ce qui cède quand elle est pleine est à trancher avec
  lui (les chiffres sont dans `mesures.md` §66). L'export PDF de la maquette n'est pas fait :
  les exports CSV, journal et trace sont inchangés.

### S2 · Historique du classement + Évolution — **livré, build 213**
- **But.** Faire que le moteur **enregistre le classement à chaque étape** (chaque sprint, chaque
  tour gagné/perdu), puis construire la vue **Évolution** (Compare) dessus.
- **Dépend de** S1, **livré au build 211** : l'onglet `stand` rend un `.sttbl` au dessin validé,
  `standings()` rend en plus `gainedLaps` / `lostLaps`, et `CFG.type` / `CFG.advance` portent le
  type de course — la bascule **Live / Evolution** de la maquette n'est pas encore posée dans
  l'en-tête, c'est à S2 de l'y mettre.
- **Piège.** Le graphe se dimensionne sur la largeur visible : le (re)dessiner **à l'affichage**,
  pas quand il est masqué.
- **Un second piège, payé en S1** (`pitfalls.md` D31) : un contrôle rendu **hors** du rail du
  simulateur se synchronise depuis `render()`, jamais depuis `renderRail`, qui ne tourne que le
  rail ouvert.
- **Fini quand.** On suit jusqu'à 4 coureurs, le graphe montre leurs points dans le temps et
  l'écart, et un clic sur un moment re-classe le panneau à cet instant. **Fait.**
- **Livré.** La bascule `Live / Evolution` est dans l'en-tête du panneau. **Rien n'est enregistré** :
  les moments se relisent des sprints et de `S.refiles` à chaque rendu et les points se rejouent
  depuis le départ, donc une correction remonte toute la course (`architecture.md` §56). Règles
  **206** et **207**, mesures dans `mesures.md` §67, l'erreur comprise dans `pitfalls.md` D32.

### S3 · Sprints (All sprints) + carte de sprint — **livré, builds 214 et 215**
- **But.** Rebrancher l'onglet `sprints` sur le dessin All sprints (tous les sprints complets,
  défilement), et aligner la carte de sprint.
- **Source.** `S.sprints`, `renderSprintsTab` (`architecture.md` §9).
- **Fini quand.** Tous les sprints s'affichent en entier, le final en double, et la carte de
  sprint suit le dessin. **Fait.**
- **Livré.** Une colonne par sprint, de gauche à droite, l'ordre **complet** dans chaque colonne, le
  final bordé avec son badge `×2`. Une colonne n'existe que pour un sprint **couru** : sa règle
  **209**, tranchée le 18 novembre 2026. Les lignes rouges `NO PTS` restent à l'endroit où le
  passage a été lu. Code dans `architecture.md` §57, mesures dans `mesures.md` §69, l'erreur
  comprise dans `pitfalls.md` D33.
- **Sa critique du 18 novembre, codée au build 215.** La bande `OUTPUTS` est **sortie** de la vue
  (règle **210**), et l'onglet `Sprints` est **remplacé** par un bouton `ALL` à la suite de la bande
  des sprints de la carte (règle **211**).
- **Ce qui reste ouvert et n'est pas de cette session.** Le **défilement latéral** et les deux
  flèches ne sont pas mesurés : à six sprints il n'y a rien à atteindre, et la course à vingt
  sprints n'a pas pu être montée. L'export PDF reste non fait, comme après S1.

### S4 · Lap by lap — **livré, builds 217 à 234**
- **But.** Rebrancher l'onglet `cross` sur le dessin Lap by lap : ordre par tour, surlignage des
  sprints, alertes, et la correction **« Shift −1 lap »**.
- **Source.** `S.cross` (`architecture.md` §7).
- **Note.** Les **tours manquants** liés aux chutes s'ajoutent après S6.
- **Fini quand.** L'ordre de chaque tour s'affiche, le décalage d'un tour fonctionne. **Partiel.**
- **Livré.** Une colonne par tour, le plus récent à droite, l'ordre de la ligne découpé en boîtes de
  blocs, l'écart entre les boîtes, le temps au tour, les tours faits, les badges de sprint et la
  colonne `live`. Les blocs sont ceux du **moment du passage** (règle **213**). Code dans
  `architecture.md` §58, mesures dans `mesures.md` §70, l'erreur comprise dans `pitfalls.md` D35.
- **Ce qui reste ouvert.** **`Shift −1 lap`** et son alerte « double lap time » ne sont pas codés :
  ils corrigent une détection manquée sans rien créditer, ce que le décalage existant ne sait pas
  faire. C'est de la logique de course, à proposer à part. Les alertes « tour gagné » et « doublé,
  pas de passage » sont codées, et l'alerte du tour gagné a été vue au build 218 ; la pastille rouge
  d'un tour **perdu** n'a pas encore été produite.
- **Sa critique du 18 novembre, codée au build 218.** L'onglet s'appelle **Lap by lap** (règle 214),
  et les colonnes du temps au tour et des tours faits ne se chevauchent plus (règle 215). Au
  **build 219**, le **second** passage d'un coureur qui vient de prendre un tour est rangé dans la
  boîte du **peloton**, et non derrière lui (règle **216**) — complété au **build 220**, qui corrige
  le chemin que l'opérateur emprunte vraiment, celui du tour validé **avant** le franchissement
  (règle **217**, `pitfalls.md` D37).
- **Ses essais du 18 novembre ont ouvert la logique de course, builds 223 à 234.** Ce qu'il a vu dans
  la colonne venait presque toujours d'ailleurs. Dans l'ordre : le **merge attend sa validation**,
  pour le tour gagné comme pour le tour perdu (règles **219** et **220**, la phrase du §3 est
  remplacée) ; un tour validé **tient** quand le coureur ressort du peloton (règle **221**) ; un
  passage **déplacé** par un tour crédité est rangé avec le peloton (règle **222**) ; l'écart en tours
  se lit sur les **passages de la boucle d'arrivée**, jamais sur des mètres (règle **223**) ; les noms
  des boîtes se **refont** sur celles qui s'affichent (règle **224**) ; un tour pris non validé passe
  devant le **leader désigné** (règle **225**) ; une **carte qui attend** vaut un tour d'écart et son
  bloc ouvre la timeline (règle **226**) ; un **écart négatif** ne s'affiche plus, l'en-tête porte
  `leader`, l'écart, ou `—` (règle **227**).
- **À ne pas refaire, et à ne pas défaire.** Deux chemins ont été essayés et ratés pour l'ordre de la
  colonne — le rang du moment et le bloc gravé passage par passage (`pitfalls.md` D38) — et deux
  autres pour l'écart en tours : le calcul en mètres hors de l'amas (D42) et la recherche d'une faute
  de moteur là où elle était dans l'affichage (D43). Mesures dans `mesures.md` §73 à §80.
- **Corrigé au build 222** (règle **218**). La colonne est rangée dans l'ordre de la **course** : les
  blocs de la timeline, le bloc de tête en haut, relevés une fois à l'ouverture du tour. Les boîtes ne
  se répètent plus dans une colonne (`mesures.md` §73, `pitfalls.md` D38).

### S5 · Passings — *moyen*
- **But.** Assembler le **relevé brut** des capteurs : 3 boucles transpondeurs + 5 tape switches,
  couleur par position, anomalies (contact sans lecture / lecture sans contact), filtres Type +
  Location, santé des boucles.
- **Source.** `S.reads`, `S.taps`, `buildTapes()` (`architecture.md` §10).
- **Fini quand.** Chaque passage brut est listé, les deux familles sont distinguées, les anomalies
  ressortent, les filtres marchent.

---

## Phase 2 — Les deux chantiers de logique

### S6 · Chutes, ennuis mécaniques et neutralisations — *le plus gros, probablement 2 sessions*
De la logique de course, pas du dessin. **Débloque** le cycle de crash du Race log (S8) et les
tours manquants de Lap by lap (S4).
- **S6a · Chute / retrait.** Un coureur quitte la course ≤ 5 tours (sauf dans les 5 derniers) ;
  l'opérateur signale la chute et les coureurs concernés ; le logiciel les suit même **sans
  transpondeur ou vélo changé**, puis ils reprennent leur place. Statuts **ABD / DNF**.
- **S6b · Neutralisation.** Drapeau jaune, peloton compact, **relance aux mêmes écarts de tours**,
  le **décompte −5 → 0**, et le **sprint tombé pendant la neutralisation redonné** au tour prévu
  suivant.
- **Attention §15.** Le détail de la neutralisation et le texte de la raison d'inéligibilité sont
  des **décisions en attente** (`regles-operateur.md` §15) : les faire trancher par l'opérateur,
  ne pas les coder d'office.
- **Fini quand.** Une chute signalée sort les coureurs puis les réintègre proprement ; une
  neutralisation fige le compteur et redonne le sprint ; tout est tracé au journal.

### S7 · La phase avant la course — *moyen, indépendant*
- **But.** Le **tour de lancement** + la **vérification des transpondeurs** (§6 de la
  présentation) : le logiciel connaît la startlist et le transpondeur attendu, repère un
  **transpondeur manquant**, et permet d'**attribuer un transpondeur inconnu à un coureur en un
  geste** (sans aller chercher dans une liste).
- **Indépendant.** Ne bloque aucun écran en course ; se place où c'est commode dans la frise.
- **Fini quand.** Au tour de lancement, le logiciel signale qui n'est pas détecté et laisse
  attribuer un transpondeur inconnu en un geste.

---

## Phase 3 — Ce qui dépend du reste

### S8 · Race log (le journal) — *moyen, après S6*
- **But.** Enrichir chaque entrée (heure du jour, temps de course, tour, type, coureur,
  événement, statut) et refaire le style de la branche `dec` : types colorés, anomalies
  **Problème → Effet → Action** + pastille, filtres par type + recherche. Résultats de sprint
  complets.
- **Après S6** pour que le **cycle de crash neutralisant** (décompte −5 → 0) s'affiche pour de
  vrai.
- **Fini quand.** Le journal se lit en langage humain, coloré par type, filtrable ; le cycle de
  crash y apparaît.

### S9 · Scénarios de course — *moyen, après S1*
- **But.** Les **points encore en jeu**, le **plafond atteignable** par coureur, les **bagarres**
  (victoire / podium / dernière place qualificative), et le **projecteur « what if »** (poser un
  ordre, le classement projeté se recalcule). Inclut les alertes « où regarder / ce qui mérite
  vérification ».
- **Dépend de** S1 (classement + type de course).
- **Fini quand.** À l'approche de la fin, l'écran montre ce qui est encore possible en mots
  simples, et le what-if recalcule le classement.

### S10 · Fil commentateurs (CIS/MIS) — *après tout le reste*
- **But.** La **nouvelle surface** en **lecture seule** qui **reçoit** les vues (Start list,
  Standings Live + Évolution, Sprints complets, Scénarios, Race log **sans alertes matériel**),
  **alimentée tout seul** par ce que l'opérateur valide en vue Course, **en anglais**. En
  qualification, elle porte la ligne de coupe.
- **Cadrage validé (16 nov. 2026).** Fil automatique ; **pas d'« abandon pressenti »** ;
  s'appuyer sur l'envoi existant (`S.outputs`, `S.liveMode`, `spSend`).
- **En dernier** parce qu'il réutilise toutes les vues précédentes.
- **Fini quand.** Les commentateurs disposent des six vues, à jour toutes seules, sans aucune
  commande, et sans les alertes matériel.

---

## À part — matériel

- **Compteur de tours / cloche** (`regles-operateur.md`, présentation §9) : suivre le compteur du
  commissaire, sonner la cloche à 31/21/11 tours de la fin, prendre le sprint au passage suivant,
  et savoir compter seul si le compteur manque. Petite session à placer quand le matériel est
  disponible.

---

## Résumé

| Session | Thème | Poids | Dépend de |
|---|---|---|---|
| S1 | Standings Live + type de course | **livré, build 211** | — |
| S2 | Historique + Évolution | **livré, build 213** | S1 |
| S3 | Sprints (All sprints) + carte | **livré, builds 214-215** | — |
| S4 | Lap by lap | **livré, builds 217-234** | — (compléter après S6) |
| S5 | Passings | moyen | — |
| S6 | Chutes & neutralisations | gros (×2) | — |
| S7 | Avant-course (transpondeurs) | moyen | — |
| S8 | Race log | moyen | S6 |
| S9 | Scénarios + alertes | moyen | S1 |
| S10 | Fil commentateurs | moyen | S1–S9 |
