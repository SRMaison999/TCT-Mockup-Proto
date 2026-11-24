# Maquettes — sessions des 15 et 16 novembre 2026

Maquettes **statiques** (pas de moteur), produites pour fixer le dessin des écrans avec
l'opérateur **avant** intégration dans `timeline-prototype_mixed.html`. Données réelles de la
course de test où le peloton reste groupé (60 tours, 6 sprints) récupérées dans `sprints.json`,
plus des cas illustratifs inventés pour montrer les anomalies.

**État de l'intégration** : All sprints (build 214), Lap by lap (build 217), Standings Live et
Évolution (builds 211 et 213) et Race log (build 270) sont **codés dans le prototype**. Passings,
Possible scenarios et le fil commentateurs sont validés et **pas encore codés** ; les deux écrans d'approche (S11) sont **proposés, pas validés** ; l'onglet Passings du
prototype a reçu le tri, les filtres et l'arrêt du défilement (build 240), pas le dessin de la
maquette. Le détail est dans `mockups/INTEGRATION.md` §4 et §8.

## Fichiers

| Fichier | Rôle |
|---|---|
| `maquette-tous-sprints.html` | Écran **« All sprints »** : tous les sprints côte à côte. **Validé.** |
| `maquette-tous-sprints-20.html` | Même écran avec **20 sprints** — montre le défilement horizontal et les flèches. |
| `maquette-lapbylap.html` | Écran **« Lap by lap »** (ex-onglet « Crossings »), état **avant** correction, avec alertes. **Validé.** |
| `maquette-lapbylap-shift.html` | « Lap by lap » **après** que l'opérateur a cliqué « Shift −1 lap ». |
| `maquette-standings.html` | Écran **« Standings »**, une page, deux vues basculables (hand-off §9.4), **validé le 16 novembre 2026** : **Live** (le classement complet finalisé, en anglais : points par sprint, tours gagnés/perdus en points, Finish order, exports) et **Evolution** (vue « Compare » : le classement à l'instant choisi sert de sélecteur, on suit jusqu'à 4 coureurs, le graphe montre leurs points dans le temps et l'écart, clic sur un moment pour re-classer ; axe + noms figés au défilement). Rendu client (JS embarqué). En manche de **qualification**, une **ligne de coupe** sépare qualifiés et éliminés (Live et Évolution) ; mode `?embed=1` : masque les exports pour l'affichage dans la console commentateurs. |
| `maquette-passings.html` | Écran **« Passings »** (relevé brut des capteurs) repensé, **validé le 16 novembre 2026**. Colonnes reprises de la feuille Race log : **Daytime · Race time · Lap · Type · Location · Rider · Event**. Deux familles — *Transponder* (3 boucles, trait plein) et *Timing pulse* (5 tape switches, trait tireté) ; **couleur par position** sur toute la ligne (Finish / 200 m / Pursuit B / 100 m / Pursuit A) ; anomalies (contact sans lecture / lecture sans contact) en orange ; filtres cliquables **Type** + **Location** et Loop health. |
| `maquette-coherence.html` | **Proposition du 22 novembre 2026, codée au build 277.** Ses points 310 et 311 : les onglets d un même écran se tiennent pareil. Colonnes communes **Daytime · Race time · Lap · Type · Bib · Noc (drapeau compris) · Rider name**, puis **Event** au Race log et **Location + Signal / count** aux Passings. Une seule barre de filtres : les boutons de l onglet (Type partout, Location aux Passings), puis Bib, Lap, la recherche et Clear. Un événement à trois coureurs fait **trois lignes**, et un sprint quatre — une par place servie (point 312). Les passages d avant le départ gardent Race time et Lap vides. **Charge `styles.css`** : aucune couleur à elle (`pitfalls.md` D57). Généré par `gen-coherence.js`. |
| `maquette-racelog.html` | Écran **« Race log »** (ex-Decisions, renommage §9.1), **validé le 16 novembre 2026**. Le journal « boîte noire » de la course en langage humain. Colonnes **Daytime · Race time · Lap · Type · Rider · Event · Status**. Types réels colorés (RACE / GROUP / SPRINT / LAP / Transponder / OPERATOR / WITHDRAW·DNS·DNF·ABD / ALERT / HARDWARE / INCIDENT), fond teinté par type. Anomalies au format **Problème → Effet → Action** + pastille (Resolved / Pending / Ignored / In progress / Rejoined). Cycle de **crash neutralisant** (décompte −5 → 0). Résultats de sprint complets (place · dossard · drapeau · NOC · nom · points). Filtres par type + recherche. Entrées illustratives sur les vrais coureurs. |
| `maquette-scenarios.html` | Écran **« Possible scenarios »** (ex-Race situation, §9.1), **validé le 16 novembre 2026**. Vue tournée vers l'avenir (ce qui est encore possible). Deux modes : **Overview** — bannière des points en jeu, **barres de portée** (plancher = acquis, hachuré = encore en jeu, plafond chiffré, fourchette de place), et **bagarres ciblées** (la victoire / le podium / la dernière place qualifiante, une phrase chacune) ; **What if** — on pose l'ordre du Sprint 5 et du Final, le **classement projeté** se recalcule (montées/descentes, points gagnés). Scénario illustratif, rendu client. |
| `maquette-racefacts.html` | Écran **« Race facts »**, **proposé et validé le 22 novembre 2026**. Il prend la place de Race log dans le fil ; le Race log de la vue Course ne change pas. Une ligne par fait — temps de course · tour · famille · phrase — écrite depuis ce que le moteur mesure déjà. Neuf familles : Sprint · Approach · Lap · Breakaway · Dropped · Standings · Cut line · Still possible · Crash. Bascule **All facts / Headlines** et filtre par famille. Pas d'alertes matériel. Faits **illustratifs**. |
| `maquette-feed.html` | Écran **« Commentator feed »** (fil CIS/MIS), **coque validée**. Console **en anglais**, **lecture seule**, alimentée tout seul par la vue Course. Six vues reçues : Start list · Standings (Live + Evolution) · Sprints complets · Scenarios (Overview + What if) · Race facts (sans alertes matériel). En-tête : badge de **type de course** ; en qualification, **ligne de coupe**. Évolution et Scénarios y sont embarquées en `iframe` (`?embed=1`). |
| `maquette-approches.html` | Écran **« Sprint approach »** — surface **médias** de la session S11, **proposée le 22 novembre 2026, puis critiquée et ajustée le même jour** (points 277, 278 et 301). Sort **dès qu'un sprint est jugé**. Lecture seule, en anglais. Le graphe montre la position de chaque coureur à **deux relevés par tour** — **back straight** puis la **ligne** — sur les tours qui précèdent le sprint, avec la bande des **quatre places qui donnent des points**. L'**échelle des rangs** est à gauche du tracé, et une **colonne de rangs** sépare la fin des courbes de la liste **Sprint result**, à droite, dans l'ordre d'arrivée : on **surligne deux coureurs ou plus** en cliquant dans cette liste. Seconde vue : **Lap gained**, une colonne par coureur qui a pris un tour. La colonne de droite écrit en clair ce que les relevés disent (l'approche du vainqueur, les quatre bagarres — victoire, 2ème, 3ème, 4ème place — en confrontant les coureurs qui se les disputent, la dernière place qualificative, la vivacité de l'approche, un tour en train d'être pris). Le **nombre de tours d'approche n'est pas tranché** : la maquette le montre en sélecteur 2·3·4·5. |
| `maquette-approches-coachs.html` | Écran **« Approach analysis »** — surface **entraîneurs** de la même session, **proposée le 22 novembre 2026, puis critiquée et ajustée le même jour** (points 277, 278 et 301). Plus dense. Quatre vues. **Charts** (ouverte par défaut) : le même graphe que chez les médias, mais couvrant les **n tours avant et après** chaque sprint — ligne jaune au sprint, attaques en pointillé orange, bande des quatre places seulement avant. Deux dispositions, gardées toutes les deux : **By rider** (une bande par coureur, ses sprints côte à côte, défilement latéral) et **By sprint** (une bande par sprint, les coureurs choisis dedans, bandes empilées). Le nombre de tours n'est écrit qu'une fois, dans l'en-tête. **Before the sprint** : sélecteur de coureurs à gauche, tableau de la **position à chaque relevé**, **deux par tour** — back straight puis ligne — sprint par sprint, places prises sur le dernier demi-tour et points ; colonne **Head to head** dès deux coureurs choisis. **After the sprint** : les mêmes relevés dans les tours qui suivent — sa **place dans le sprint** à gauche, puis les positions relevées, rien d'autre : les colonnes de résumé ont été retirées comme redondantes. Sans couleur : être devant après un sprint ne veut pas dire la même chose qu'avant. **Ce qui se passait dans la course** est écrit une seule fois en haut du panneau, sprint par sprint. Aucun jugement. **Lap gained** : la même chose que chez les médias, **une colonne par coureur**, lue de haut en bas. |
| `gen-tous-sprints.js` | Génère les deux maquettes de sprints depuis `sprints.json` + `flags.js`. |
| `gen-lapbylap.js` | Génère les deux maquettes « Lap by lap » (`buildPage(false)` = avant, `buildPage(true)` = après shift). |
| `gen-standings.js` | Génère la maquette Standings (Live + Evolution/Compare) depuis `sprints.json` + `flags.js`. Depuis le build 283 la ligne de dossards, drapeaux et noms au-dessus du graphe de l Evolution n est plus dessinee (son point 320). |
| `gen-passings.js` | Génère la maquette Passings. Les lectures sont **illustratives** (bâties sur les coureurs réels + temps de tour réalistes + deux anomalies posées à la main) : le prototype n'expose pas de relevé brut dans un fichier. |
| `gen-racelog.js` | Génère la maquette Race log. Entrées **illustratives** (vrais coureurs, un crash neutralisant et des anomalies posées à la main). |
| `gen-racefacts.js` | Génère la maquette **Race facts** — l'onglet du fil qui prend la place de Race log. Neuf familles de phrases, faits **illustratifs** repris de ceux du fil et du Race log. |
| `gen-scenarios.js` | Génère la maquette Possible scenarios. Scénario **illustratif** (fin de course serrée, 2 sprints restants), coureurs réels. |
| `outputs-catalogue.js` | Le catalogue des **sorties** : une entrée par vue du fil des commentateurs et de l'écran des entraîneurs — le fichier, les clics qui mènent à la vue, ce que l'écran montre, comment on l'obtient, où il en est. Les écrans de la vue Course n'y sont pas. |
| `gen-outputs.js` | Prend les captures du catalogue dans `outputs/`. Pilote le Chrome de la machine en mode headless ; une vue qui demande un clic est capturée depuis une copie temporaire de la page à laquelle on ajoute un script qui clique au chargement. Rien à installer. |
| `gen-outputs-pdf.js` | Assemble **`MAQUETTES OUTPUTS.pdf`** depuis les captures et le catalogue : couverture, sommaire, puis une page par écran. |
| `gen-fil.js` | Ecrit `../fil.html` (la coque, six onglets) et `../fil-standings.html` (Standings Live), **le fil commentateurs branche au moteur** (build 282). Il **lit le style de `maquette-feed.html`** et de `maquette-standings.html` et reprend leur balisage : seules les donnees changent, elles arrivent en direct du prototype par BroadcastChannel. Les quatre autres vues sont embarquees en iframe de leurs pages branchees, plus aucune maquette figee. Lancer `node gen-feed.js` et `node gen-standings.js` avant. |
| `gen-fil-evolution.js` | Ecrit `../fil-evolution.html`, **Standings Evolution branche au moteur** (build 282). Il prend `maquette-standings.html` telle quelle et remplace son `var DATA={...}` par un constructeur qui bati les moments de la course sur l instantane. Lancer `node gen-standings.js` avant. |
| `gen-fil-scenarios.js` | Ecrit `../fil-scenarios.html`, **Possible scenarios branche au moteur** : Overview et What if. Il lit le style de `maquette-scenarios.html`. Lancer `node gen-scenarios.js` avant. |
| `gen-fil-racefacts.js` | Ecrit `../fil-racefacts.html`, **Race facts branche au moteur**. Il lit le style de `maquette-racefacts.html`. Les faits se composent a l affichage sur l instantane. Lancer `node gen-racefacts.js` avant. |
| `gen-fil-approche.js` | Ecrit `../fil-approche.html` (Sprint approach et Lap gained, medias) et `../coachs.html` (les cinq vues entraineurs). Il prend `maquette-approches.html` et `maquette-approches-coachs.html` **telles quelles** et remplace leur seul `var D={...}` par un constructeur qui lit l instantane. Lancer `node gen-approches.js` avant. |
| `gen-approches.js` | Génère les **deux** maquettes d'approche. La donnée est un **relevé continu de toute la course** — 60 tours × 3 boucles, déterministe — calé sur le résultat de chaque sprint, et qui porte le repli dans le peloton après un sprint ; il sert l'avant **et** l'après. Course **illustrative** sur les vrais coureurs, en manche de **qualification** (huit qualifiés sur seize), avec **quatre attaques** — deux qui prennent le tour, deux reprises — et un sprint suivi d'aucune : les six sprints de la course de test sont identiques (le peloton reste groupé) et ne montreraient aucune approche. Les deux tours pris et leurs compagnons sont posés à la main. |
| `gen-feed.js` | Génère la coque du fil commentateurs `maquette-feed.html`. Embarque Standings et Scenarios en `iframe` (`?embed=1`). Données illustratives (course de test). |
| `sprints.json` | Résultats réels des 6 sprints de la course de test où le peloton reste groupé, récupérés via Playwright. |

## Regénérer

```bash
cd mockups
node gen-tous-sprints.js
node gen-lapbylap.js
node gen-standings.js
node gen-passings.js
node gen-racelog.js
node gen-scenarios.js
node gen-feed.js
node gen-approches.js
node gen-outputs.js
node gen-outputs-pdf.js
```

`gen-outputs.js` et `gen-outputs-pdf.js` se lancent **en dernier** : ils photographient les
maquettes telles qu'elles sont sur le disque.

Les chemins sont relatifs (`__dirname`) : les scripts lisent `flags.js` à la racine du dépôt et
`sprints.json` ici même, et réécrivent les `.html`. Aucune dépendance hors `flags.js` et Google
Fonts (lien CDN dans chaque page). Les drapeaux sont inlinés à la génération via `flag()` de
`flags.js`.

Les deux écrans d'approche suivent les points **274 à 299** de `docs/regles-operateur.md` : les
noms des boucles, deux relevés par tour chez les entraîneurs, le format `dossard · drapeau · NOC ·
prénom · NOM` partout, **aucune bande colorée** sur le côté d'une carte explicative, et ce que la
colonne de droite dit d'une approche. Les bandes ont aussi été retirées des cartes de bagarres de
`maquette-scenarios.html`, de la boîte d'alerte de `maquette-lapbylap.html` et de la note de
`maquette-feed.html`.

## Décisions de dessin

Les règles de l'opérateur relevées à la validation des maquettes sont consignées dans
`docs/regles-operateur.md`, point 204 ; celles des écrans pas encore codés y sont listées sous
« relevées, pas encore codées ». Le détail du dessin de chaque écran est dans le tableau ci-dessus
et dans le générateur `gen-*.js` correspondant, qui en est la référence.

## Le catalogue des sorties

**`MAQUETTES OUTPUTS.pdf`** montre les maquettes qui concernent les **sorties** — le fil des
commentateurs, où les analyses d'approche sont intégrées, et l'écran des entraîneurs. Vue par vue :
l'image, ce que l'écran montre, comment on l'obtient, comment on la branche au moteur, et où elle en est. Les écrans de la vue Course,
qui sont les outils de l'opérateur, n'y sont pas. Il **remplace** `PLAN-SESSIONS.md`,
qui découpait le travail en sessions S1 à S11 ; ce découpage reste dans l'historique git, et les
règles de l'opérateur, elles, n'ont jamais vécu que dans `docs/regles-operateur.md`.

## Intégration dans le prototype

Le brief technique pour câbler ces maquettes au moteur réel du prototype est dans
**`mockups/INTEGRATION.md`** (à destination d'un autre Claude) : quoi lire, la méthode, l'état `S`
et le rendu des onglets, et l'intégration écran par écran.

### Demandes de l'opérateur du 16 novembre 2026 (mot pour mot)

- **Standings** : « Finaliser l'existante. Mais y intégrer également une vue Standings Évolution
  qui indique l'évolution du classement tout au long de la course. »
- **Passings** : « Il faut des démarcations colorées pour différencier les différents types de
  Passings (dans le même style que la vue Race logs). »
