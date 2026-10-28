# TCT · Track Cycling Timing — Course aux points

Travail de conception du nouveau module **Course aux points** (Points Race) du logiciel de
chronométrage piste, destiné à remplacer celui de l'ancien logiciel (« Timing Manager for
Quantum », une vingtaine d'années). Ce dossier contient un **prototype HTML autonome, pas le
logiciel final** : il sert à fixer les comportements avec l'opérateur avant tout
développement.

**Ce fichier n'est que la carte du dossier et le mode de lancement.** Il ne contient aucune
règle de course, aucune mesure, aucune liste de fonctions : chaque information vit dans un
seul document, listé ci-dessous.

---

## Par où commencer

**Un nouveau développeur — ou un nouveau Claude Code — lit les documents dans cet ordre :**

1. **`docs/regles-operateur.md`** — les règles de course dans les mots de l'opérateur, mot pour
   mot, datées. **C'est la seule autorité.** Une règle ou un seuil qui n'y figure pas n'a pas
   sa place dans le code. À lire **avant** de toucher aux tours, aux groupes, au merge ou à
   l'éligibilité. Ne pas l'avoir lu a déjà coûté des sessions entières.
2. **`docs/cas-de-course.md`** — l'index : pour chaque situation tranchée, où est sa règle, où
   est son code, comment on sait qu'elle est respectée, et son statut. Le statut dit **si le
   code dévie**, avec la date.
3. **`docs/pitfalls.md`** — les erreurs déjà commises et leurs causes. À lire avant de recoder
   quelque chose qui « a l'air simple ».
4. **`docs/architecture.md`** — le code du prototype : état, fonctions, flux, constantes.
5. **`docs/concept.md`** — le produit visé : vision, contexte, écrans, intégrations.
6. **`docs/mesures.md`** — tous les chiffres du projet, chacun avec le numéro de build où il a
   été mesuré.
7. **`docs/travaux.md`** — ce qui reste à construire et ce qui est cassé, avec, pour chaque
   poste, à quoi on saura que c'est fini. **C'est ici qu'on prend le travail suivant.**

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
| `docs/travaux.md` | ce qui reste à construire, ce qui est cassé, et à quoi on saura que c'est fini |
| `docs/concept.md` | la vision et le produit visé : contexte, écrans, intégrations |
| `README.md` | la carte du dossier et comment lancer |

---

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `timeline-prototype.html` | **Le prototype** (un seul fichier, aucune dépendance). L'en-tête affiche « build N », incrémenté à chaque publication ; actuellement **build 75**. Publié sur https://claude.ai/artifact/4dcfPEf9XmK7xQ4QDVfcJ4 |
| `maquette-groupes.html` | Maquette des décisions du 25 octobre 2026, dérivée du prototype, **conservée comme témoin** : les décisions ont depuis été codées dans le prototype. `maquette-groupes.jpg` en est une capture |
| `maquette-simulateur.html` | Maquette de l'écran de **simulateur de courses de test** (composer un scénario). Maquette seule, pas de moteur |
| `console-course-aux-points.html` | Première maquette, abandonnée pour son interface, mais dont le **moteur d'inférence** a été validé et doit être repris dans l'implémentation réelle (voir `docs/concept.md`) |
| `canvas/project/*.dc.html` | Trois écrans statiques (`Main`, `Course`, `Arrivee`) dessinés avant le prototype. Dépassés, conservés pour référence |
| `serve.js` | Serveur statique local minimal (voir ci-dessous) |
| `.claude/launch.json` | Configuration du serveur pour l'aperçu intégré |
| `.claude/handoff/` | Passations entre sessions d'assistance : `active.md` quand une attend, `archive/` ensuite |
| `docs/` | Les sept documents du projet, décrits ci-dessus |
| `CLAUDE.md` | Ce que lit automatiquement une session d’assistance : l’ordre de lecture et la manière de travailler. **Aucun fait, aucune règle, aucune mesure** — il ne fait que renvoyer aux documents qui les possèdent |

---

## Lancer le prototype

```bash
node serve.js
```

Puis ouvrir **http://localhost:8765/timeline-prototype.html**

Le port est `8765` par défaut, surchargeable par la variable d'environnement `PORT`. La racine
`/` sert `console-course-aux-points.html`, la première maquette — **ce n'est pas le
prototype**, il faut l'URL complète ci-dessus. Tous les fichiers du dossier sont servis à leur
nom.

Aucune installation, aucune dépendance : `serve.js` n'utilise que les modules de Node.

### Le prototype n'a pas besoin de serveur

`timeline-prototype.html` est autonome et fonctionne aussi en l'ouvrant directement depuis le
système de fichiers. Le serveur n'existe que pour l'aperçu intégré et pour servir les autres
fichiers du dossier.

### Charger la course de référence

Un prototype qui vient de démarrer tourne sur une course **vide**. La course de référence —
celle que décrit `docs/mesures.md` — est une course enregistrée ordinaire depuis la build 74,
et doit être **chargée depuis l'onglet Files**. Sans ce
chargement, aucun des événements décrits dans la documentation ne se produit. C'est une erreur
classique, consignée dans `docs/pitfalls.md`.

Depuis la build 75 elle est **déposée dans la liste à la première ouverture seulement**, et
elle s'y renomme et s'y efface comme n'importe quelle autre. Si elle n'apparaît plus, c'est
qu'elle a été effacée : vider la clé `tct.sim.races` du stockage du navigateur, puis
recharger la page, la redépose.

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
