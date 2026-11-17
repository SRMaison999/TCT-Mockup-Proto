# Maquettes — session du 15 novembre 2026

Maquettes **statiques** (pas de moteur), produites pour fixer le dessin de deux écrans avec
l'opérateur **avant** intégration dans `timeline-prototype_mixed.html`. Données réelles de la
course de test (palier 1) récupérées dans `sprints.json`, plus des cas illustratifs inventés
pour montrer les anomalies. **Ces écrans ne sont pas encore codés dans le prototype.**

## Fichiers

| Fichier | Rôle |
|---|---|
| `maquette-tous-sprints.html` | Écran **« All sprints »** : tous les sprints côte à côte. **Validé.** |
| `maquette-tous-sprints-20.html` | Même écran avec **20 sprints** — montre le défilement horizontal et les flèches. |
| `maquette-lapbylap.html` | Écran **« Lap by lap »** (ex-onglet « Crossings »), état **avant** correction, avec alertes. **Validé.** |
| `maquette-lapbylap-shift.html` | « Lap by lap » **après** que l'opérateur a cliqué « Shift −1 lap ». |
| `maquette-standings.html` | Écran **« Standings »**, une page, deux vues basculables (hand-off §9.4), **validé le 16 novembre 2026** : **Live** (le classement complet finalisé, en anglais : points par sprint, tours gagnés/perdus en points, Finish order, exports) et **Evolution** (vue « Compare » : le classement à l'instant choisi sert de sélecteur, on suit jusqu'à 4 coureurs, le graphe montre leurs points dans le temps et l'écart, clic sur un moment pour re-classer ; axe + noms figés au défilement). Rendu client (JS embarqué). En manche de **qualification**, une **ligne de coupe** sépare qualifiés et éliminés (Live et Évolution) ; mode `?embed=1` : masque les exports pour l'affichage dans la console commentateurs. |
| `maquette-passings.html` | Écran **« Passings »** (relevé brut des capteurs) repensé, **validé le 16 novembre 2026**. Colonnes reprises de la feuille Race log : **Daytime · Race time · Lap · Type · Location · Rider · Event**. Deux familles — *Transponder* (3 boucles, trait plein) et *Timing pulse* (5 tape switches, trait tireté) ; **couleur par position** sur toute la ligne (Finish / 200 m / Pursuit B / 100 m / Pursuit A) ; anomalies (contact sans lecture / lecture sans contact) en orange ; filtres cliquables **Type** + **Location** et Loop health. |
| `maquette-racelog.html` | Écran **« Race log »** (ex-Decisions, renommage §9.1), **validé le 16 novembre 2026**. Le journal « boîte noire » de la course en langage humain. Colonnes **Daytime · Race time · Lap · Type · Rider · Event · Status**. Types réels colorés (RACE / GROUP / SPRINT / LAP / Transponder / OPERATOR / WITHDRAW·DNS·DNF·ABD / ALERT / HARDWARE / INCIDENT), fond teinté par type. Anomalies au format **Problème → Effet → Action** + pastille (Resolved / Pending / Ignored / In progress / Rejoined). Cycle de **crash neutralisant** (décompte −5 → 0). Résultats de sprint complets (place · dossard · drapeau · NOC · nom · points). Filtres par type + recherche. Entrées illustratives sur les vrais coureurs. |
| `maquette-scenarios.html` | Écran **« Possible scenarios »** (ex-Race situation, §9.1), **validé le 16 novembre 2026**. Vue tournée vers l'avenir (ce qui est encore possible). Deux modes : **Overview** — bannière des points en jeu, **barres de portée** (plancher = acquis, hachuré = encore en jeu, plafond chiffré, fourchette de place), et **bagarres ciblées** (la victoire / le podium / la dernière place qualifiante, une phrase chacune) ; **What if** — on pose l'ordre du Sprint 5 et du Final, le **classement projeté** se recalcule (montées/descentes, points gagnés). Scénario illustratif, rendu client. |
| `maquette-feed.html` | Écran **« Commentator feed »** (fil CIS/MIS), **coque validée**. Console **en anglais**, **lecture seule**, alimentée tout seul par la vue Course. Six vues reçues : Start list · Standings (Live + Evolution) · Sprints complets · Scenarios (Overview + What if) · Race log (sans alertes matériel). En-tête : badge de **type de course** ; en qualification, **ligne de coupe**. Évolution et Scénarios y sont embarquées en `iframe` (`?embed=1`). |
| `gen-tous-sprints.js` | Génère les deux maquettes de sprints depuis `sprints.json` + `flags.js`. |
| `gen-lapbylap.js` | Génère les deux maquettes « Lap by lap » (`buildPage(false)` = avant, `buildPage(true)` = après shift). |
| `gen-standings.js` | Génère la maquette Standings (Live + Evolution/Compare) depuis `sprints.json` + `flags.js`. |
| `gen-passings.js` | Génère la maquette Passings. Les lectures sont **illustratives** (bâties sur les coureurs réels + temps de tour réalistes + deux anomalies posées à la main) : le prototype n'expose pas de relevé brut dans un fichier. |
| `gen-racelog.js` | Génère la maquette Race log. Entrées **illustratives** (vrais coureurs, un crash neutralisant et des anomalies posées à la main). |
| `gen-scenarios.js` | Génère la maquette Possible scenarios. Scénario **illustratif** (fin de course serrée, 2 sprints restants), coureurs réels. |
| `gen-feed.js` | Génère la coque du fil commentateurs `maquette-feed.html`. Embarque Standings et Scenarios en `iframe` (`?embed=1`). Données illustratives (course de test). |
| `sprints.json` | Résultats réels des 6 sprints de la course de test (palier 1), récupérés via Playwright. |

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
```

Les chemins sont relatifs (`__dirname`) : les scripts lisent `flags.js` à la racine du dépôt et
`sprints.json` ici même, et réécrivent les `.html`. Aucune dépendance hors `flags.js` et Google
Fonts (lien CDN dans chaque page). Les drapeaux sont inlinés à la génération via `flag()` de
`flags.js`.

## Décisions de dessin

Elles sont consignées dans le handover de session (`mockups/HANDOVER.md`, copie locale dans
`.claude/handoff/active.md`), avec les règles de l'opérateur à reporter dans
`docs/regles-operateur.md` au moment de l'intégration.

## Intégration dans le prototype

Le brief technique pour câbler ces maquettes au moteur réel du prototype est dans
**`mockups/INTEGRATION.md`** (à destination d'un autre Claude) : quoi lire, la méthode, l'état `S`
et le rendu des onglets, et l'intégration écran par écran.

### Demandes de l'opérateur du 16 novembre 2026 (mot pour mot)

- **Standings** : « Finaliser l'existante. Mais y intégrer également une vue Standings Évolution
  qui indique l'évolution du classement tout au long de la course. »
- **Passings** : « Il faut des démarcations colorées pour différencier les différents types de
  Passings (dans le même style que la vue Race logs). »
