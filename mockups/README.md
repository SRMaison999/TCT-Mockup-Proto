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
| `maquette-standings.html` | Écran **« Standings »**, deux vues basculables : **Table** (classement général finalisé, en anglais : points par sprint, tours gagnés/perdus en points, Finish order, exports) et **Evolution** (bump chart de l'évolution du rang au fil de la course — un checkpoint par sprint et par tour gagné/perdu). |
| `maquette-passings.html` | Écran **« Passings »** (relevé brut des capteurs) repensé, **validé le 16 novembre 2026**. Colonnes reprises de la feuille Race log : **Daytime · Race time · Lap · Type · Location · Rider · Event**. Deux familles — *Transponder* (3 boucles, trait plein) et *Timing pulse* (5 tape switches, trait tireté) ; **couleur par position** sur toute la ligne (Finish / 200 m / Pursuit B / 100 m / Pursuit A) ; anomalies (contact sans lecture / lecture sans contact) en orange ; filtres cliquables **Type** + **Location** et Loop health. |
| `gen-tous-sprints.js` | Génère les deux maquettes de sprints depuis `sprints.json` + `flags.js`. |
| `gen-lapbylap.js` | Génère les deux maquettes « Lap by lap » (`buildPage(false)` = avant, `buildPage(true)` = après shift). |
| `gen-standings.js` | Génère la maquette Standings (Table + Evolution) depuis `sprints.json` + `flags.js`. |
| `gen-passings.js` | Génère la maquette Passings. Les lectures sont **illustratives** (bâties sur les coureurs réels + temps de tour réalistes + deux anomalies posées à la main) : le prototype n'expose pas de relevé brut dans un fichier. |
| `sprints.json` | Résultats réels des 6 sprints de la course de test (palier 1), récupérés via Playwright. |

## Regénérer

```bash
cd mockups
node gen-tous-sprints.js
node gen-lapbylap.js
node gen-standings.js
node gen-passings.js
```

Les chemins sont relatifs (`__dirname`) : les scripts lisent `flags.js` à la racine du dépôt et
`sprints.json` ici même, et réécrivent les `.html`. Aucune dépendance hors `flags.js` et Google
Fonts (lien CDN dans chaque page). Les drapeaux sont inlinés à la génération via `flag()` de
`flags.js`.

## Décisions de dessin

Elles sont consignées dans le handover de session (`mockups/HANDOVER.md`, copie locale dans
`.claude/handoff/active.md`), avec les règles de l'opérateur à reporter dans
`docs/regles-operateur.md` au moment de l'intégration.

### Demandes de l'opérateur du 16 novembre 2026 (mot pour mot)

- **Standings** : « Finaliser l'existante. Mais y intégrer également une vue Standings Évolution
  qui indique l'évolution du classement tout au long de la course. »
- **Passings** : « Il faut des démarcations colorées pour différencier les différents types de
  Passings (dans le même style que la vue Race logs). »
