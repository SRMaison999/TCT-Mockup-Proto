# Passation — session du 15 novembre 2026

Travail sur **`timeline-prototype_mixed.html`** (la version à six onglets). Tout ce qui suit est
**scopé à la version mixte** : `styles.css` et le prototype de référence ne sont pas touchés —
l'opérateur l'a choisi explicitement.

Deux choses très différentes dans cette session : **du code livré** (le restyle des onglets) et
**des maquettes validées mais pas encore intégrées** (deux écrans). Ne pas confondre.

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

## 4. Règles de l'opérateur à consigner dans `docs/regles-operateur.md`

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
- **Toute l'interface est en anglais.**

---

## 5. Méthode (rappels, cf. CLAUDE.md §14 et docs/regles-operateur.md §14)

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

## 6. Prochaine étape probable

Soit **intégrer** l'un des deux écrans validés (All sprints ou Lap by lap) dans
`timeline-prototype_mixed.html` — en proposant d'abord, puis en consignant les règles du §4 — soit
**maquetter le point suivant** de la liste initiale (Standings à resserrer, journal Decisions avec
trace des groupes / tri / filtres). Demander à l'opérateur.
