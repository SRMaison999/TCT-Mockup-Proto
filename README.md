# TCT · Track Cycling Timing — Course aux points

Travail de conception du nouveau module **Course aux points** (Points Race) du logiciel de
chronométrage piste, destiné à remplacer celui de l'ancien logiciel (« Timing Manager for
Quantum », une vingtaine d'années). Ce dossier contient un **prototype HTML, pas le logiciel
final** : il sert à fixer les comportements avec l'opérateur avant tout développement.

**Ce fichier n'est que la carte du dossier et le mode de lancement.** Il ne contient aucune
règle de course, aucune mesure, aucune liste de fonctions : chaque information vit dans un
seul document, listé ci-dessous.

---

## Par où commencer

**Un nouveau développeur — ou un nouveau Claude Code — lit les documents dans cet ordre :**

1. **`docs/regles-operateur.md`** — les règles de course dans les mots de l'opérateur, mot pour
   mot, datées. **C'est la seule autorité.** Une règle ou un seuil qui n'y figure pas n'a pas
   sa place dans le code. À lire **avant** de toucher aux tours, aux groupes, au merge ou à
   l'éligibilité : les §1 à §7, puis les points numérotés du §17, qui les ont précisés ou
   remplacés depuis. Ne pas l'avoir lu a déjà coûté des sessions entières.
2. **`docs/cas-de-course.md`** — l'index : pour chaque situation tranchée, où est sa règle, où
   est son code, comment on sait qu'elle est respectée, et son statut. Le statut dit **si le
   code dévie**, avec la date.
3. **`docs/pitfalls.md`** — les erreurs déjà commises et leurs causes. À lire avant de recoder
   quelque chose qui « a l'air simple ».
4. **`docs/architecture.md`** — le code du prototype : état, fonctions, flux, constantes.
5. **`docs/concept.md`** — le produit visé : vision, contexte, écrans, intégrations.
6. **`docs/mesures.md`** — tous les chiffres du projet, chacun avec le numéro de build où il a
   été mesuré.

### Qui possède quoi

Un fait n'est écrit qu'**une seule fois**, dans le document qui le possède. Les autres y
renvoient. Ne recopiez jamais un fait d'un document dans un autre.

| Document | Possède |
|---|---|
| `docs/regles-operateur.md` | les énoncés de l'opérateur, mot pour mot, datés, et ce qui reste à trancher |
| `docs/cas-de-course.md` | l'index règle → code → vérification → statut, et les écarts assumés |
| `docs/architecture.md` | le code du prototype et ses constantes |
| `docs/pitfalls.md` | les erreurs, leurs causes, les contraintes d'implémentation, les scénarios de test |
| `docs/mesures.md` | tous les nombres mesurés, avec leur build |
| `docs/concept.md` | la vision et le produit visé : contexte, écrans, intégrations |
| `README.md` | la carte du dossier et comment lancer |

---

## Contenu du dossier

### Le prototype

| Fichier | Rôle |
|---|---|
| `timeline-prototype_mixed.html` | **Le prototype que l'opérateur utilise.** Il porte tout le travail depuis le 31 octobre 2026 : les onglets Race, Lap by lap, Decisions, Standings et Passings dans la barre du haut, l'écran que l'opérateur dimensionne, le moteur de course reconstruit, le classement et ses deux vues, tous les sprints en colonnes. Le numéro de build est la constante `BUILD` du fichier, incrémentée à chaque publication (249 au 19 novembre 2026). Décrit dans `docs/architecture.md`, §21 et suivants |
| `moteur-course.js` | **Le moteur de course**, reconstruit le 1er novembre 2026 : il ne lit que les détections des boucles et répond à trois questions — qui est devant qui, qui roule avec qui, qui gagne ou perd 20 points. Chargé par la version mixte seulement. `docs/architecture.md` §50 et suivants |
| `styles.css` | La feuille de style **partagée par les trois versions** du prototype : une modification propre à la version mixte va dans son bloc `<style>`, jamais ici |
| `flags.js` | Les drapeaux SVG des nations, une donnée pure |
| `timeline-prototype.html` | La version de référence d'avant le 31 octobre 2026, **arrêtée au build 149**. Même écran que la mixte à cette date, sans le moteur de course ni rien des builds 150 à 249. Gardée comme témoin |
| `timeline-prototype_new_look_3a_3d.html` | Une version alternative du même écran, dessinée sous les pages 3a à 3d de `mockups/TCT Points Race - mockups.html`, **arrêtée au build 148**. `docs/architecture.md` §20 |
| `timeline-prototype-autonome.html` | La version mixte **en un seul fichier** — `styles.css`, `flags.js` et `moteur-course.js` inlinés — faite au build 208 pour être transférée sans serveur ni Node, puis portée au build 209. Elle n'a pas suivi les builds 210 à 249 |
| `serve.js` | Serveur statique local minimal (voir ci-dessous) |
| `.claude/launch.json` | Configuration du serveur pour l'aperçu intégré |

### Les documents

| Fichier | Rôle |
|---|---|
| `docs/` | Les six documents du projet, décrits ci-dessus |
| `docs/audit-ux.md` | **Pas un des six.** L'audit de l'écran mené le 31 octobre 2026 sur `timeline-prototype_mixed.html` et l'avis sur le design : une **liste de propositions en attente de l'accord de l'opérateur**, rien de plus. Un point qui obtient son accord part dans le code, et disparaît de ce fichier. Ne possède aucun fait |
| `docs/La course aux points.txt` | **Pas un des six.** Le fonctionnement de la course aux points tel que l'opérateur l'a énoncé le 1er novembre 2026, qu'il a posé lui-même dans le dossier. Ses mots sont consignés au point 174 de `docs/regles-operateur.md`, qui reste l'autorité |
| `docs/UCI/` | **Le règlement officiel de l'UCI** pour la course aux points (`UCI-Rules_PointsRace.pdf`) et deux présentations UCI sur le compteur de tours et les tours gagnés aux sprints. C'est la référence réglementaire du sport ; les règles auxquelles le code se conforme restent celles de `docs/regles-operateur.md`, qui y renvoie |
| `CLAUDE.md` | Ce que lit automatiquement une session d'assistance : l'ordre de lecture et la manière de travailler. **Aucun fait, aucune règle, aucune mesure** — il ne fait que renvoyer aux documents qui les possèdent |
| `.claude/skills/audit-ux/` | Le skill qui produit un audit de l'écran : une liste de propositions, jamais une modification |

### Les maquettes et la présentation

| Fichier | Rôle |
|---|---|
| `mockups/` | Les maquettes **statiques** des écrans dessinés avec l'opérateur les 15 et 16 novembre 2026 (All sprints, Lap by lap, Standings, Passings, Race log, Possible scenarios, fil commentateurs, Race facts), leurs générateurs, le brief d'intégration `INTEGRATION.md` et le catalogue `MAQUETTES OUTPUTS.pdf` (les maquettes des **sorties** — fil commentateurs, analyses d'approche intégrées, écran des entraîneurs — en images, ce qu'elles montrent et comment on les obtient). L'état de chaque écran — codé ou pas encore — est dans `mockups/README.md` |
| `mockups/maquette-groupes.html` | Maquette des décisions du 25 octobre 2026, dérivée du prototype, **conservée comme témoin** : les décisions ont depuis été codées. `maquette-groupes.jpg` en est une capture |
| `mockups/maquette-groupe-force.html` | La planche du groupe posé à la main, approuvée le 1er novembre 2026 et codée au build 161 |
| `mockups/maquette-design-b.html` | La planche des cinq points de design du 31 octobre 2026, tous tranchés depuis (`docs/architecture.md` §30) |
| `mockups/maquette-simulateur.html` | Maquette de l'écran de **simulateur de courses de test**. Maquette seule, pas de moteur |
| `mockups/TCT Points Race - mockups.html` | Les pages 3a à 3d dont la version alternative et les onglets de la version mixte reprennent le dessin |
| `presentation/` | La présentation du produit, en Markdown et en PDF, avec ses captures. `node presentation/capture.js` refait les captures — il joue une course complète dans un Chrome en arrière-plan, puis photographie chaque vue, prototype et fils compris ; le serveur doit tourner. `node presentation/gen-pdf.js` réécrit le PDF depuis le Markdown |
| `console-course-aux-points.html` | Première maquette, abandonnée pour son interface, mais dont le **moteur d'inférence** a été validé et doit être repris dans l'implémentation réelle (voir `docs/concept.md`) |
| `canvas/project/*.dc.html` | Trois écrans statiques (`Main`, `Course`, `Arrivee`) dessinés avant le prototype. Dépassés, conservés pour référence |

---

## Lancer le prototype

```bash
node serve.js
```

Puis ouvrir **http://localhost:8765/timeline-prototype_mixed.html**

Le port est `8765` par défaut, surchargeable par la variable d'environnement `PORT`. La racine
`/` sert `console-course-aux-points.html`, la première maquette — **ce n'est pas le
prototype**, il faut l'URL complète ci-dessus. Tous les fichiers du dossier sont servis à leur
nom, sans cache : `serve.js` répond `Cache-Control: no-store`, sans quoi le navigateur garde la
page d'un build précédent.

Aucune installation, aucune dépendance : `serve.js` n'utilise que les modules de Node.

### Sans serveur

Le prototype s'ouvre aussi directement depuis le système de fichiers, en `file://`, pourvu que
`styles.css`, `flags.js` et `moteur-course.js` soient à côté de lui. `timeline-prototype-autonome.html`
n'a pas même besoin de cela, mais il est arrêté au build 209. Le serveur n'existe que pour l'aperçu
intégré et pour servir les autres fichiers du dossier.

### Charger une course de test

Un prototype qui vient de démarrer tourne sur une course **vide** : une course de test doit être
**chargée depuis l'onglet Files**, sans quoi il ne se passe rien.

Les courses de test vont de la plus calme à la plus animée. L'opérateur l'a posé le 1er novembre
2026 : « il faut commencer par des scénarios, plutôt simples, pour simuler des courses peu animées
[...] et puis petit à petit nous testerons des simulations de courses un peu plus animées avec
comme objectif de valider l'efficacité de notre système à chaque pallier de difficulté affronté ».
La première — **le peloton qui reste groupé**, aucun tour pris ni perdu, 60 tours sur 250 m — est
déposée dans la liste à la première ouverture. On nomme une course de test par ce qu'elle
contient (« la course aux deux échappés et deux lâchés »), jamais par un numéro.

Une course de test est une course enregistrée ordinaire : elle se renomme et s'efface comme
n'importe quelle autre. Si la liste est vide, vider la clé `tct.sim.races` du stockage du
navigateur et recharger la page redépose la première.

---

## La manière de travailler

Elle est dictée par l'opérateur et consignée mot pour mot dans **`docs/regles-operateur.md`
§14**. En trois points, pour qui ne lirait que ce fichier :

1. **Proposer avant de coder.** Les écrans et les changements sont décrits, critiqués, révisés,
   puis codés. Jamais l'inverse.
2. **Ne jamais ajouter ce qui n'a pas été demandé.** Une précision que l'opérateur donne sur
   le matériel ou sur la course est un **fait**, pas une demande de l'implémenter.
3. **Ne jamais inventer un seuil.** S'il n'est pas dans `docs/regles-operateur.md`, il faut le
   demander — en mètres, en coureurs, en équipement installé. Jamais en millisecondes ni en
   choix d'algorithme.
