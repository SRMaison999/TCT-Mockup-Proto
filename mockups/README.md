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
| `gen-tous-sprints.js` | Génère les deux maquettes de sprints depuis `sprints.json` + `flags.js`. |
| `gen-lapbylap.js` | Génère les deux maquettes « Lap by lap » (`buildPage(false)` = avant, `buildPage(true)` = après shift). |
| `sprints.json` | Résultats réels des 6 sprints de la course de test (palier 1), récupérés via Playwright. |

## Regénérer

```bash
cd mockups
node gen-tous-sprints.js
node gen-lapbylap.js
```

Les chemins sont relatifs (`__dirname`) : les scripts lisent `flags.js` à la racine du dépôt et
`sprints.json` ici même, et réécrivent les `.html`. Aucune dépendance hors `flags.js` et Google
Fonts (lien CDN dans chaque page). Les drapeaux sont inlinés à la génération via `flag()` de
`flags.js`.

## Décisions de dessin

Elles sont consignées dans le handover de session (`mockups/HANDOVER.md`, copie locale dans
`.claude/handoff/active.md`), avec les règles de l'opérateur à reporter dans
`docs/regles-operateur.md` au moment de l'intégration.
