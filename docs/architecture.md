# Architecture du prototype

**Ce fichier décrit le code, et seulement le code.** Il ne contient aucune règle de course
— celles-ci sont dans `regles-operateur.md` — et aucun chiffre de mesure — ceux-là sont
dans `mesures.md`. L'index « quelle règle, codée où, quel statut » est
`cas-de-course.md`.

**Le prototype est `timeline-prototype_mixed.html`**, build 249 au 19 novembre 2026. Il charge
quatre fichiers statiques par balise, sans empaquetage, qui partagent la portée globale du
navigateur (aucun module ES, aucun `import`) ; l'ordre des balises `<script>` est ce qui
garantit que chacun existe quand le script principal en a besoin :
- `moteur-course.js` : **le moteur de course**, reconstruit le 1er novembre 2026 (§50 et
  suivants). Il ne lit que les détections des boucles.
- `styles.css` : le CSS **partagé par les trois versions** du prototype. Une règle propre à la
  version mixte va dans son bloc `<style>`, jamais ici.
- `flags.js` : les drapeaux SVG des nations (`FLAGS`, `flag()` et leurs helpers), une donnée
  pure.
- le fichier HTML lui-même : le HTML, puis le script principal dans une fermeture immédiate.
  C'est lui qui contient l'état et la logique de la course. Tout l'état vit dans l'objet `S`,
  recréé par `reset()`.

**Comment lire ce fichier.** Les sections 1 à 19 décrivent le socle, écrit pour
`timeline-prototype.html` jusqu'au build 149 et repris tel quel par la version mixte ; les
sections 20 et suivantes décrivent ce que la version mixte a reçu depuis, build par build.
**Quand une section récente contredit une ancienne, c'est la récente qui décrit le code** : le
moteur de course (§50 à §52, §59, §62) remplace la plus grande part du §4 et du §5, l'ouverture
d'un sprint (§63) remplace celle du §7, et les sections 21 à 29 remplacent la mise en page du
§8. Les deux autres fichiers, `timeline-prototype.html` (build 149) et
`timeline-prototype_new_look_3a_3d.html` (build 148, §20), ne chargent pas le moteur de course
et n'ont rien reçu depuis ; `timeline-prototype-autonome.html` est la version mixte au build 209
avec ses trois fichiers inlinés.

**Le harnais de test.** Le script expose

```js
window.__proto = { state: () => S, step, measured, computeGroups, render, detect, tapeCount,
                   sp, spOrder, spFull, spSend, spInsert, spHold, standings, dispLap,
                   noTpToggle, markDirty }
```

`state` est une **fonction** : `window.__proto.state()` renvoie `S`. Pour piloter une
course pas à pas : cliquer `#simplay`, poser `S.factor = 0`, puis boucler

```js
p.step(0.05); const M = p.measured(); p.detect(p.computeGroups(M), M);
```

`p.noTpToggle` prend un **tableau** de dossards. Cette boucle n'appelle pas `render()`,
donc ni `spTick()` ni les cartes de sprint : une mesure de sprint demande de laisser
tourner la boucle d'affichage.

---

## 1. Deux mondes séparés

| Monde | Rôle | Fonctions |
|---|---|---|
| **Simulation** (vérité) | Déplace les coureurs, produit les lectures aux trois boucles et les contacts aux tape switches. N'existe pas dans le logiciel réel : les lectures et les contacts viendront du matériel. | `step(dt)`, `raceLap()` |
| **Logiciel** | Ne voit que les lectures (`r.rec`, `S.reads`), les contacts (`S.taps`) et les décisions de l'opérateur. | `measured()`, `computeGroups()`, `tapeCount()`, `detect()`, actions, rendu |

**Règle de développement** : rien dans le monde « logiciel » ne doit lire `r.dist`,
`r.lapTrue`, `r.mode === 'away'`, `S.tapeTruth` ni `r.tp`. Ce sont les champs de la vérité
simulée.

Les tape switches reposent sur cette séparation et la tiennent **par la structure** :
`S.taps[i]` ne contient **que des instants**, sans dossard, parce que c'est tout ce qu'une
bande de contact produit ; qui a fait le contact vit dans `S.tapeTruth[i]`, au même titre
que `r.dist`. Un `grep tapeTruth` dans un chemin logiciel saute donc aux yeux.

**Vérifié (investigation du 28 octobre 2026) : la séparation est tenue partout, sauf un seul
endroit.** `measured()` (c'est elle qui construit ce que l'écran affiche à partir de ce que
le logiciel sait) ne lit jamais `r.dist` ni `r.spd` directement, à une exception : la ligne
`if (!r.rec) { out.set(r.bib, { pos: r.dist, spd: r.spd, read: true }); continue; }`. Elle ne
joue que pour un coureur qui n'a **encore jamais eu de lecture de boucle**, et seulement
dans deux cas :

1. **Au tout début de la course**, avant que chaque coureur ait franchi sa première boucle
   (0 à environ 2 s de course selon sa place sur la grille).
2. **Après un « Reinstate »** (un coureur remis en course après un ABD/DNF), qui remet
   `r.rec` à vide jusqu'à sa prochaine lecture.

**Ce n'est pas une fuite à corriger.** L'opérateur, 28 octobre 2026 : dans le cas 1, la
position de départ (deux colonnes, entre Pursuit A et la ligne) est un fait que l'opérateur
connaît et pourrait saisir lui-même (un ordre d'appel), pas un secret du simulateur — et rien
ne se décide (ni groupe, ni tour, ni points) sur ces quelques secondes. Dans le cas 2, la
position se corrige dès la lecture suivante, sans conséquence sur l'intervalle. **À garder en
tête pour le jour où le matériel réel remplace le simulateur** : ce sera le seul endroit à
revoir — la position de départ viendra alors d'une saisie opérateur (ordre d'appel), pas de
`r.dist` ; partout ailleurs, `measured()`, `computeGroups()` et `detect()` consomment déjà
exactement le type de données (lectures de boucles, contacts de tape switch) que le matériel
réel produira.

## 2. État `S`

```
t, factor, finished, started        temps de course (s), vitesse de simulation (0 = pause), fin, départ donné
riders[]                            {bib, name, nat, color, dk, dist, offset, lapTrue, mode, spd, rec,
                                     lastRel, inBunchSince, inBunchPrev}
                                    rec = dernière lecture {d: distance cumulée du point, t, loop, spd}
                                    inBunchPrev = était-il dans l'amas du peloton à l'image précédente ?
                                                  l'événement de tour est l'image qui passe false → true
laps[bib] = {gained, lost}          compteurs de tours, FAITS
lapStatus[bib]                      net dérivé = gained − lost (toujours via syncLap)
refiles[bib] = {gained:[], lost:[]} re-rangements de passages faits à chaque hausse d'un compteur, pour les défaire
groups[]                            groupes de l'opérateur {id, bibs, type:'manual'|'crash'|'mech', lap, t, open}
sprintOut (Set)                     coureurs ignorés au prochain sprint
withdrawn (Map bib→{code, lap})     ABD / DNF / DSQ
selection (Set), ledger, hover      interface : sélection partagée timeline/ovale, panneau de compteurs, survol
leader                              {bib, how, lap} désigné par l'opérateur ou par dépassement ; null = pris sur la piste
arm                                 boucle armée (une position de LOOPS) ou null
replay                              actes à rejouer (loadRace, Restart, rewind30)
r.tp (sur le coureur)               VÉRITÉ SIMULÉE : l'id du transpondeur réellement monté sur son vélo.
                                    S.tp dit ce que le logiciel CROIT ; les deux ne coïncident plus dès que
                                    deux transpondeurs sont inversés, et c'est la table qui nomme la lecture
taps[i] = [{t}]                     contacts d'un tape switch : des instants, rien d'autre
tapeTruth[i] = [{t, bib, merged}]   VÉRITÉ SIMULÉE derrière ces contacts ; merged = pas d'impulsion propre
reads[li] = [{bib, t}]              toutes les lectures d'une boucle, li = index dans LOOPS
tapePass[]                          un passage de groupe jugé {tape, loop, lap, t0, t1, n, read[], lone, short}
tapeCut[i]                          premier contact pas encore jugé, par tape switch
tapeGroup[key]                      par groupe (clé = plus petit dossard lu) : {key, read, recent[], members,
                                    tape, diffs[], stated, short} ; members = union des trois derniers passages
proposals[]                         {id, key, kind:'lap'|'missing'|'back'|'tape'|'alone', bibs, delta, text, actions[]}
snoozed, dismissed                  clés de propositions écartées
cross[k] = [{bib, t, n, mark}]      vue Crossings : ligne k, passages dans l'ordre, n = passages réels du coureur
holes[k] = [bib]                    lignes où un coureur doublé n'a pas de passage
markPending[bib]                    ±1 à poser sur le prochain passage après une validation précoce
finishOpen, finishCrossed           instant d'ouverture de l'arrivée, coureurs passés depuis
passes[]                            tous les passages lus sur la ligne, bruts {bib, t, n}
sprints[k]                          un enregistrement par sprint (§9) ; sprintOpen = k affiché, null sinon
outputs[]                           messages partis vers TV, scoreboard, web {t, k, lap, kind, places, text}
liveMode                            mode d'envoi par défaut du prochain sprint
noTp (Map bib→host)                 coureurs sans transpondeur, portés par le coureur host
noTpRec[bib] = {d, t, spd}          position fixée par un contact de bande attribué : il roule alors SEUL
inelig (Set)                        LE calcul d'éligibilité, posé par computeGroups — tout le monde le lit
log[]                               journal {id, t, k, m, op, rev, reversed}
undo[]                              instantanés pour l'Undo
bunchRaw, inBunch, bunchSeq         position de référence du peloton, ses membres, et l'amas du peloton rangé
                                    de l'arrière vers l'avant dans le sens de la marche. Posés par computeGroups.
                                    bunchRaw = la position du PREMIER coureur du peloton (regles-operateur.md §5)
```

Variables de module hors de `S` : `lastDetect` et `lastTl` (instants du dernier `detect` et
de la dernière reconstruction de la timeline, remis à −1 par `reset()` : sans cela un
Restart empêchait les propositions de réapparaître), `lastG` (les blocs de la dernière
image, pour que rien n'ait à rappeler `computeGroups`), `lastFactor`, `REC` (les actes
enregistrés), `simTab`, `simCols`, `railDirty`, `ovalDirty` (un survol de ligne de la
timeline demande un redessin de l'ovale même course à l'arrêt, §3).

## 3. Flux d'une image

`setInterval(frame, 50)` — pas `requestAnimationFrame`, voir `pitfalls.md` D4 :

1. **`advance(dt)`** : le temps de course avance par pas **fixes** de 0,05 s (`FIXED`) si
   `factor > 0`, quelle que soit la vitesse d'affichage. 1x, 4x et 16x font donc la même
   course ; seule la cadence change. À chaque pas : `step(0.05)`, puis `detectNow()`
   (`measured`, `computeGroups`, `detect`).
2. **`render()`** :
   - `M = measured()` : position de chaque coureur telle que le logiciel la voit = dernière
     lecture extrapolée à sa vitesse mesurée ; non lu depuis plus de `MISSING_S` →
     `read:false`, porté à l'écart où il a été vu ; en incident → `off:true`.
   - `G = computeGroups(M)` (§4).
   - `detect(G, M)` n'est rappelé ici que si plus de 0,1 s de temps de course s'est écoulé
     depuis le dernier appel, ce qui n'arrive qu'à l'arrêt. Si le nombre de propositions
     change, `G` est recalculé dans la même image.
   - `renderTimeline(G)` et `renderLog()` seulement si `dirty`, ou une fois par seconde en
     simulation, **jamais pendant un glisser**.
   - `renderStrip` et `renderOval` seulement si `dirty`, si `ovalDirty` (survol d'une ligne
     de la timeline, qui met en relief le coureur sur l'ovale sans rien faire d'autre), ou
     tant que la course avance (`S.started && S.factor > 0 && !S.finished`) — jamais à
     l'arrêt sans raison : à 24 coureurs, redessiner l'ovale (ses trois files sans
     chevauchement, §14) à chaque image même immobile coûtait cher pour rien (`pitfalls.md`
     D14).
   - `spTick()` ouvre, envoie et ferme les sprints (§9).

Toute action de l'opérateur met `dirty = true` puis appelle `render()`.

## 4. `computeGroups(M)` : du mesuré aux blocs

> **État au build 249.** `computeGroups(M)` n'est plus qu'un cache : elle rend les blocs de la
> dernière image tant qu'aucune boucle n'a rien détecté de neuf (`tlSign()`, son point 191), et
> appelle `computeGroupsVraiment(M)` sinon. Dans celle-ci, l'ordre des coureurs, la découpe en
> groupes et l'écart d'un bloc viennent du **moteur de course** (§52, §59, §62) ; le tour d'écart
> non validé vient de `S.took` (§58) ; l'éligibilité se lit sur `mcRetard` (§53). Des huit étapes
> ci-dessous, écrites pour le build 68, restent vraies : la référence du peloton (2, précisée au
> §49 et `pitfalls.md` D40), le leader (4, précisé aux §37 et §51), la numérotation (7) et les
> noms (8, corrigés ci-dessous). Les étapes 1, 3, 5 et 6 décrivent l'ancien calcul sur les
> positions interpolées ; il ne subsiste que comme **repli**, `pairGap()` et `cassure()`, quand
> aucune boucle n'a vu les deux coureurs d'une paire.

1. **Amas physiques.** Coureurs vivants triés par position sur la piste (`pos mod TRACK`).
   Un nouvel amas quand l'écart entre deux voisins dépasse
   `gapThr(suiveur) = GROUP_GAP_S × vitesse du suiveur + BIKE_L`, et que ce dépassement
   **tient** `CASS_DELAY_S` — c'est `cassure(clé, dépassé)`, où la clé est la paire de
   dossards voisins. Le dernier amas est joint au premier à travers la ligne si l'écart le
   permet. Le plus gros amas est `bunchCluster`.

   La cassure se mesure **de roue à roue, d'un coureur au suivant** — jamais d'un coureur à
   un groupe entier. C'est pour cela que la clé porte une paire, et que **le seuil se
   calcule paire par paire** (build 68) : `regles-operateur.md` §1 veut la vitesse du
   coureur **qui suit**, « puisque c'est sa roue avant qui doit couvrir l'écart ». En
   remontant la piste, le suiveur d'une paire est le coureur **déjà dans l'amas**, celui
   que `cur.rows` finit par le dernier ; à la jonction par la ligne c'est celui qui ne l'a
   pas encore franchie. Il n'y a donc **plus de seuil unique** : `computeGroups` ne renvoie
   plus de `thr`.

   **Les `rows` d'un amas sont rangées de l'arrière vers l'avant**, dans le sens de la
   marche : c'est de là que se lisent son premier et son dernier coureur. À la jonction par
   la ligne, les coureurs qui n'ont pas encore franchi la ligne sont donc **préfixés**
   (`unshift`, build 67) et non ajoutés à la fin — ils roulent derrière ceux qui viennent de
   la passer. Les blocs d'affichage se retrient ensuite par `behind`, ce rangement-ci ne sert
   qu'à savoir qui est devant qui sur la piste.

2. **Référence du peloton.** `bunchRaw` est la position du **premier coureur du peloton**
   (`regles-operateur.md` §5), pris parmi ceux qui étaient **déjà dans le peloton à l'image
   précédente** (`r.inBunchPrev`) : sinon un coureur qui fusionne à cette image même
   redéfinirait le tour contre lequel on est en train de le mesurer — ce qui arrive à chaque
   tour perdu, où l'attardé arrive **devant** le peloton. `S.inBunch` = les membres de
   `bunchCluster` ; `S.bunchSeq` = les mêmes, rangés de l'arrière vers l'avant.
   **Aucune statistique de position**, ni médiane ni moyenne : elle est interdite.

3. **Distance de course** `np(r) = pos − TRACK × impliedOf(r)`, où
   `impliedOf(r) = round((pos − bunchRaw) / TRACK)` pour les membres de l'amas du peloton,
   0 sinon. C'est le merge : le coureur rejoint le tour du peloton dès qu'il est dans le
   même amas que lui, sans passer par `lapStatus`, donc sans attendre aucune validation.
   L'arrondi ne décide rien — être dans l'amas veut dire être au même endroit de la piste,
   donc l'écart est à quelques mètres près un nombre entier de tours.

4. **Leader** : `S.leader` s'il est lisible, sinon le `np` maximal. Un coureur qui passe
   devant le leader désigné le remplace (`designateLeader(…, 'passed …')`).

5. **Écart** `behind = np(leader) − np(r)`, continu, sans repli ; puis tri.

6. **Blocs** : dans chaque amas, les coureurs libres sont découpés en blocs quand deux
   voisins sont à plus d'un demi-tour de distance de course (un tour d'écart dans le même
   paquet). Les groupes de l'opérateur (`S.groups`) forment leurs propres blocs. Tri :
   incidents en bas, sinon par tête de bloc.

7. **Numérotation et éligibilité.** Les blocs non-incident sont numérotés 1, 2, 3… en
   descendant. Pour chacun, `x.dS = (piste du groupe de tête − piste du coureur) mod TRACK`,
   et 0 pour le groupe 1. Puis `S.inelig` : à partir du groupe 3, un coureur est inéligible
   si son `dS` est inférieur au **minimum** des `dS` du groupe immédiatement au-dessus.

   **Contraintes que ce code doit respecter**, chacune payée par une erreur de lecture (voir
   `pitfalls.md` section H) :

   - les groupes se forment **dans la timeline**, pas sur l'ovale ;
   - la distance au sprint se mesure **en remontant depuis le groupe de tête**, qui est à 0
     par construction — jamais depuis la ligne d'arrivée, jamais en comptant les tours
     propres à chaque coureur, ce qui désactive la règle entièrement et sans erreur
     visible ;
   - la distance est celle qu'il reste **jusqu'au prochain sprint**, pas jusqu'à la ligne du
     tour en cours ;
   - un coureur ne se compare qu'au groupe **immédiatement au-dessus** du sien, jamais à un
     groupe en dessous ;
   - le groupe 1 n'est **ni candidat ni référence** : la comparaison commence au groupe 3
     contre le groupe 2 ;
   - `every` et non `some` (`dS < min`) : lecture retenue, à confirmer ;
   - `S.inelig` est posé **ici**, donc tout chemin qui juge l'éligibilité doit passer par
     lui — timeline, ovale et carte de sprint comprises.

8. Noms : `groupName(g, G)` → le rang du bloc depuis la tête, puis son rôle — `1-Leader` ou
   `1-Leaders`, `n-Chase` devant le peloton, `n-Bunch`, `n-Behind` derrière lui, et le tout
   dernier toujours `n-Last` (`regles-operateur.md` §17, points 22 et 23). Un groupe d'incident
   s'appelle `CRASH` ou `MECHANICAL`, sans numéro.

**`computeGroups` a des effets de bord** (`S.inelig`, `S.bunchRaw`,
`S.posOf`, désignation du leader) : ne jamais l'appeler une fois de plus pour prendre une
mesure. Lire `lastG`, que `render()` pose.

## 5. `detect(G, M)` : les propositions

**Tours gagnés et perdus.** Depuis le build 194 (`mesures.md`, « Build 194 · les ±20 viennent du
moteur de course »), ce n'est plus `detect()` qui constate un tour : c'est le moteur de course,
`examiner()` et `annoncer()` dans `moteur-course.js`, sur les règles des points 180 et 241 à 246
— un écart qui se referme sous la seconde contre le dernier du peloton pour un groupe LEADERS,
contre le premier du peloton pour un groupe LAST, les deux rangs étant posés par l'écran
(`MC.rangs`, §62). `detect()` reprend chaque constat nouveau (`mcPointsVus`) et en fait une
proposition de la forme qu'il a toujours eue, `{kind: 'lap', bibs, delta}`. Les coureurs d'un
même constat font **une seule** proposition ; une proposition déjà ouverte pour un coureur
l'exclut.

L'ancien calcul — l'entrée dans l'amas du peloton (`r.inBunchPrev`) puis un `Math.round` de
l'écart de distance contre le coureur du peloton le plus proche (`pairOf`, build 174) — a été
retiré avec le branchement du moteur ; `pitfalls.md` A9, A21 et H13 gardent pourquoi il était
faux. `r.bunchSide`, plus ancien encore, a été retiré à la build 66.

Une proposition est **ajoutée** au constat et n'est **retirée** qu'à la validation ou au rejet
(`regles-operateur.md` §4). Les propositions de tour n'ajoutent aucune marque sur l'ovale ; sur
la timeline, la ligne du coureur porte une marque bleue sans bouton (§17, point 76), et une carte
qui attend passe en orange (§34) et vaut un tour d'écart (§58).

**Non lus** (`missing`) : coureurs sans lecture depuis plus de `MISSING_S`, groupés quand
ils ont disparu ensemble (lectures à moins de 4 s). Actions : Crash, Mech. (groupe
d'incident daté), No transponder, Keep in bunch. Le balayage saute les coureurs de
`S.noTp` : « pas lu » ne veut rien dire pour un coureur qui n'a pas de transpondeur.

**Retour** (`back`) : coureurs d'un incident lus à nouveau. Actions : Back in race, DNF.

**Vélo en trop** (`tape`) : `tapeAttribute()`. Un groupe dont les bandes comptent plus de
vélos que les boucles ne lisent de transpondeurs, et un coureur dont on sait qu'il n'en a
pas. Actions : Place BIB n there / Not him, ou Keep him there quand c'est l'inverse.

**Vélo seul** (`alone`) : `tapeLone()`. Un passage de bande où **aucun** transpondeur n'a
répondu : les coureurs sans transpondeur que rien ne porte sont proposés, un bouton par
dossard. Tant que cette carte est ouverte, la proposition `tape` du même coureur est
supprimée — c'est la même question posée deux fois.

Une proposition se rend dans le bloc où se trouve l'un de ses coureurs, **une seule fois**
(`shownProps`).

## 6. Actions de l'opérateur (faits)

| Fonction | Effet | Journal |
|---|---|---|
| `addLap(bib, 'gained'\|'lost', who, since)` | compteur +1, re-rangement des passages depuis `since` (`refile`), marque sur le premier passage re-rangé ou sur le prochain (`markPending`) | `laps gained 1 → 2` |
| `subLap(bib, kind, who)` | compteur −1, défait le dernier re-rangement de ce compteur | `laps gained 2 → 1` |
| `applyLap(bibs, delta, who, since)` | enveloppe : `addLap` pour chaque coureur | |
| `withdraw(bibs, code)` / `reinstate(bib)` | retrait ABD/DNF/DSQ, mode `out` ; réintégration | réversible l'un par l'autre |
| `newGroup`, `joinGroup`, `mergeUp`, `dissolve`, `backInRace` | groupes de l'opérateur et incidents | `rev` restaure `S.groups` |
| `sprintToggle(bibs)` | ignoré / repris au prochain sprint | |
| `designateLeader(bib, how)` | tête de course | |
| `selectGroup(gi)` | sélectionne / désélectionne tous les coureurs d'un bloc | |
| `noTpToggle(bibs)` | coureur sans transpondeur ↔ normal | |
| `swapTp(bibs)` | échange deux lignes de la table des transpondeurs et les `rec` mesurés sous ces noms | |

Chaque action d'interface appelle `pushUndo(label)` avant d'agir ; `undo()` restaure un
instantané (`snapshot()`), tronque le journal et laisse les propositions de tour se
redétecter. L'instantané porte `tp`, `recs` et `noTpRec` : sans eux, Undo écrivait
« Undone » sans rien défaire.

## 7. Vue Crossings

Dans `step()`, à chaque lecture sur la ligne (`L === 0`) : `k = ka − lapStatus[bib]`, où
`ka` est le nombre réel de passages. Un coureur crédité est donc rangé sur le compte du
peloton. `addLap` re-range les passages déjà faits depuis la jonction (`refile`), `subLap`
les remet.

L'arrivée s'ouvrait, jusqu'au build 248, quand `kn = ka − implied ≥ LAPS`, un tour reconstruit
par rapport au peloton (`pitfalls.md` D46). **Depuis le build 249 elle s'ouvre comme les autres
sprints, au passage d'un coureur du bloc de tête de la timeline** (`S.spFrom`, §63), et se ferme
quand tous les coureurs en course ont passé la ligne depuis.

**Le décodeur lit un transpondeur, pas un coureur.** `step()` prend
`nb = tpById(r.tp).bib`, le nom que la **table** donne au transpondeur monté sur ce vélo,
et classe tout sous ce nom : `o.rec`, `S.reads`, la vue Crossings, `S.passes`, l'ouverture
de l'arrivée, la boucle armée. Un transpondeur que la table ne nomme pour personne ne
produit aucune lecture.

## 8. Rendu

- **`renderTimeline(G)`** : blocs, lignes (`.trow`, grille BIB · drapeau · NOC · marque de
  proposition), zones de dépôt (`.tgap`, toujours lisibles), section Withdrawn, barre de
  sélection (`#tbar`). La colonne fait **176 px** (§17, points 93 et 96 ; elle en a fait 118 un
  jour) : la ligne d'un coureur ne porte ni son nom ni de bouton, tout est dans son infobulle et
  dans la colonne des actions. L'en-tête du bloc
  (`.gh`) est une bande à la couleur du groupe, sur deux lignes, cliquable en entier pour
  sélectionner le groupe (`data-selgroup`). La marque de tours n'apparaît que sur les coureurs en attente
  de validation. **Attention** : `.trow` est aussi le nom des lignes du panneau des
  transpondeurs, dont les règles sont portées par `#simtp` (`pitfalls.md` D20).
- **`renderOval(G, M)`** : bandes (`#bands`), coureurs sur trois files (dossards de rayon
  `DOT_R` = 10, files à `LANE` = 19, sans marque de tours) avec un pas minimal de `DOT_GAP` = 24, bulle de groupe à la couleur du
  groupe et badge de nom **à l'intérieur** de la piste, à marge constante. `pt(s)` et `normalAt(s)` projettent
  une distance de course sur le tracé SVG `#trackpath`, qui **commence au milieu de la ligne
  droite d’arrivée**, là où se trouve Pursuit A (§14) ; sens de course : bas vers la droite. `renderMarks()` calcule les repères des boucles et des bandes depuis
  la distance de course, ils ne sont plus dessinés en dur.
- **Inéligibles sur l'ovale** : rien ne les marque depuis le build 94 (§14) ; le badge de leur
  groupe dit `NO PTS` (§17, point 103), et la timeline porte la pastille rouge `no pts`.
- **Interactions** : clics délégués sur `#tlbody` et `#logrows` ; `#tbar`, `#propcard` et
  `#ledgerbox` répondent au **relâchement** du pointeur avec la garde `pressed()` (§28) ; glisser
  au pointeur (`pointerdown/move/up`) sur la timeline et sur l'ovale, avec une étiquette fantôme ;
  sur l'ovale, sélection et actions de groupe **au relâchement** du pointeur.

### Le panneau des vues

`#log` est un panneau par-dessus la page de course, ouvert par les onglets de la barre du haut
— Lap by lap, Decisions, Standings, Passings — et par le bouton `ALL` de la carte de sprint pour
tous les sprints ; l'onglet `Race` le ferme, Échap aussi (§21, §57). `renderLog()` sort
immédiatement quand il est caché, pour ne pas reconstruire ses lignes à chaque image.

### La barre d'actions

Sous l'ovale, `.below` prend la hauteur dont la barre a besoin et l'ovale prend le reste (§17,
point 92) ; elle contient la fenêtre d'actions (`#tbar`, dans `.acts`), à sa droite le registre
`Laps…` quand il est ouvert (`#ledgerbox`, §24), et les cartes de proposition (`#propcard`).
**Une seule disposition**, côte à côte, depuis le build 155 (§29) ; la classe `lay-side` reste
parce que `styles.css`, partagé, s'en sert.

`#tbar` ne porte que les dossards de la sélection (§17, point 132) et les boutons d'action ;
`Laps…` ouvre le registre pour toute la sélection et `Leader` ne vaut que pour un seul coureur
(§26). Les actions individuelles étaient sur la ligne du coureur, au survol, et ont disparu avec
la timeline étroite (§17, point 70).

### La colonne de droite

`#scard`, la carte du sprint, vit dans `.right`, à droite de l'ovale, **en permanence** (§17,
point 79) : hors sprint elle montre le prochain sprint non jugé, avec toutes ses commandes sauf
`Send` et `Close` (point 97). La carte est en trois colonnes — l'ordre, la liste de départ, les
commandes (point 104, build 148). Pendant un sprint, l'ovale et le journal restent affichés
(point 62).

## 9. Sprints

**Enregistrement** `sp(k)` : `{lap, live, manual, recordFrom, order, held, removed,
excluded, reinstated, photoOk, sent, sentAt, closed, opened, target, notpDismiss, lapped,
judged, greyed}`. `order` est null tant que l'opérateur n'a rien arrangé ; `held` = bib →
place posée d'avance ; `sent` = bib → place envoyée ; `lapped` = bibs inéligibles ;
`judged` = bibs dont le passage a déjà été jugé ; `greyed` = bibs dont le passage a été lu
pendant l'inéligibilité. Les trois dernières listes sont vidées à l'ouverture et ne font que
grandir.

**Passages qui comptent** `spCrossings(k)` : la ligne jugée `S.cross[lap]` ; pour le final,
le premier passage de chaque coureur depuis `finishOpen` ; après *Clear and record*, tous
les passages bruts depuis l'instant du clic.

**Éligibilité** `lappedNow()` renvoie `S.inelig`. `spWhy(k, bib)` ne couvre plus que le
retrait (ABD/DNF/DSQ), le retrait de l'ordre par la croix et l'exclusion de l'opérateur
(`S.sprintOut`, photographiée dans `excluded` à l'ouverture puis vidée : l'exclusion ne vaut
que pour ce sprint). `reinstated` lève tout sauf le retrait. Un coureur que la règle de course a
rendu inéligible au moment de son passage est annoncé sous « Not eligible » avec le motif
« no points · not eligible when he crossed » (§17, point 103).

**Jugement d'un passage.** À chaque image d'un sprint ouvert, `spTick` relit les passages et,
pour tout coureur qui n'est pas encore dans `judged`, l'y ajoute et le met dans `greyed`
s'il est inéligible **à cet instant**. Un passage est donc jugé **une seule fois, au moment
où il est lu**.

**Ordre** `spOrder(k)` → `{seq, notEligible, read, greyed}` : `read` = passages avec leur
rang brut (`raw`) ; les éligibles par temps, réarrangés selon `order` (les lus non listés
s'ajoutent à la fin), puis les `held` insérés exactement à leur place, les places
précédentes vides (`empty`) tant que personne n'est lu. Chaque entrée porte place, gap (vers
le précédent lu), photo (gap ≥ 0 et < `PHOTO_MS`, sauf les confirmés), sent, manual, held.
La **conséquence de rang** s'applique ici, après la construction de `seq`.

**Lignes grisées.** Les coureurs de `greyed` sont exclus de `seq` tant qu'ils sont
inéligibles, donc ils ne prennent aucune place et ne décalent personne ; `renderCard` les
insère entre les places, à l'heure de leur passage, sous `.srow.grey` : colonne de place
vide, dossard et nom en gris, « no points » à droite, aucun écart. Dès qu'un coureur grisé
redevient éligible, il reparaît **en plus** dans `seq`, avec une place et un affichage
normal. Un même coureur peut donc figurer deux fois.

**Gestes** : `spInsert` (double-clic, saisie d'un dossard, glisser depuis la liste) remplit
la place vide ou décale ; `spMove` (glisser une ligne) ; `spRemove` (croix) ; `spReinstate`
(↩) ; `spHold` (bandeau 1st…5th) ; `spDetected` ; `spClearRecord` ; `spShift` ; `spPhotoOk`
(confirme tout le groupe serré contigu). Chaque geste matérialise l'ordre (`spSetFull`) et
s'inscrit au journal, après `pushUndo`.

**Envoi** `spSend(k, 'live' | 'send', force)` : parcourt les places 1…N (N =
`SEND_PLACES`, ou tout au final) et s'arrête à la première qui ne peut pas partir — vide,
non lue et non saisie, ou tenue (`held`) sans que la place suivante soit lue (sauf `force`,
le bouton Send de la ligne). Live n'envoie que les places nouvelles ou changées ; Send
renvoie tout, en « correction » si un envoi a déjà eu lieu. Un message par appel dans
`S.outputs`, une ligne au journal.

**Points et classement** : `spPoints(k)` applique `POINTS` aux quatre premiers (×2 au final ;
une place tenue ou vide ne compte pas) ; `standings()` cumule, ajoute ±`LAP_PTS` par
compteur, trie par total puis place au final, retirés en bas.

**Carte** `renderCard()` dans `#scard`, rendue avec la timeline (jamais pendant un glisser) ;
elle est permanente et ne masque plus rien (§8, « La colonne de droite »). Clics délégués sur
`data-sact`, double-clic sur `.slrow`, Entrée dans `#sinp` (focus conservé au re-rendu), glisser
au pointeur entre `.srow`, `.slrow` et `.sdrop`. Tous les sprints en colonnes par le bouton `ALL`
(`renderSprintsTab`, §57) et le classement (`renderStandingsTab`, §55) ; exports par
`download()`.

**La bande des sprints (point 201, build 207).** En tête de `#scard`, `renderCard` pose une
`.sprow` : une pastille `.sptab[data-spjump=k]` par sprint (`1…NSPRINTS`, `F` pour `isFinal`),
le sprint affiché en `.on`. La bande défile en `overflow-x`, et le sprint affiché est ramené en
vue (`scrollIntoView`) **au seul changement** — `lastCardSprint` évite de contrarier un défilement
manuel. Un deuxième écouteur de `#scard` capte `data-spjump` et appelle `spOpen(k)` : la carte de
n'importe quel sprint, fermé compris, s'ouvre dans la vue Race sans passer par l'onglet Sprints,
qui continue d'y mener (`data-spopen` → `spOpen`). Tient de 4 sprints à 20 et plus.

**Sans transpondeur** : `measured()` place le coureur à `BIKE_L` derrière son host
(`read: true, notp: true`) ; `step()` ne produit aucune lecture pour lui ; l'arrivée n'attend
pas son passage. S'il a été fixé par une bande (`S.noTpRec`), c'est ce point qui le porte
(`fixed: true`) tant qu'il a moins de `MISSING_S` ; passé ce délai **il n'est pas remis
derrière son hôte** — plus rien ne l'a compté, il passe `read: false` et garde l'écart où il
a été mesuré.

## 10. Les tape switches

`TAPES`, construit par `buildTapes()` depuis la longueur de piste et le seul réglage libre
`gap`. Trois bandes sont au même endroit que les trois boucles, donc les deux regardent le
même point sur le même passage : la comparaison ne demande **aucune extrapolation**. Les
deux autres n'ont aucune boucle en face.

Côté simulation, `step()` produit un contact par vélo qui franchit une bande — transpondeur
ou non, muet ou non — dans `S.taps[i]`. Deux vélos à moins de `TAPE_MIN_GAP` l'un de l'autre
ne font **qu'un** contact ; la vérité des deux reste dans `S.tapeTruth[i]`.

Côté logiciel, `tapeCount()` découpe le flux de contacts d'une bande en rafales séparées par
`GROUP_GAP_S` — la même cassure d'une seconde sur laquelle les groupes sont coupés — et une
rafale est un passage de groupe. Elle est comparée aux lectures de la boucle au même point
sur la même fenêtre (`S.reads`, à `TAPE_MATCH_S` près).

**L'appariement est un parcours à deux pointeurs, pas un plus-proche.** Dans une rafale,
chaque contact cherche **sa** lecture à `TAPE_SYNC_S` près ; une lecture ne répond que pour
un contact. Les deux listes sont les passages des mêmes vélos **dans le même ordre**, donc
elles se lisent ensemble comme deux listes triées. Apparier au plus proche laisserait un
contact voler la lecture du vélo derrière lui et inventerait un vélo sans transpondeur à
partir de deux coureurs à 30 cm l'un de l'autre.

- un contact qui ne trouve aucune lecture **est** un vélo sans transpondeur (`lone`) ;
- une lecture qu'aucun contact n'a payée est une roue que la bande n'a pas su séparer de la
  précédente (`short`).

`tapeAttribute()` rapproche ces comptes de `S.noTp` (§5, proposition `tape`).
`tapeLone()`/`tapeFix()`/`tapeTrack()` portent un coureur sans transpondeur par ses contacts
(§5, proposition `alone`) ; `tapeTrack` n'avance le point fixé que si la vitesse impliquée
est celle d'un vélo (`TAPE_MIN_SPD` à `TAPE_MAX_SPD`).

## 11. Ce qui est en dur

`RIDERS` (dossard, nom, NOC, couleur, teinte sombre, prénom — six champs depuis le build 211,
§55), `CALM_RACE` (la course de test déposée à la première ouverture, §43), `FLAGS` (drapeaux SVG
simplifiés), `PALETTE` (plus rien ne l'atteint à l'écran depuis le build 151, §24), `NOTP = []`
(tous les coureurs ont un transpondeur au départ ; le statut se pose à la main).

`TIGHT` est **retiré** à la build 235. Il nommait le BIB 52, qui n'existe plus dès que l'opérateur
fait sa propre liste de départ, et faisait planter `step()` à chaque image à partir du tour 18
(`pitfalls.md` A16, `mesures.md` §81). **Un scénario codé en dur ne nomme plus aucun dossard.**

**La grille de départ** (`reset()`, `gridRank`) se compte depuis la ligne d'arrivée, vers l'arrière,
et **dans l'ordre des dossards** : `dist = −7 − gridRank[bib] × 2,2`, où `gridRank` est le rang du
dossard dans l'ordre croissant. Le plus petit dossard est à 7 m de la ligne, les suivants s'empilent
tous les 2,2 m. Elle tient avant la ligne quel que soit le nombre de coureurs — ce qu'elle ne faisait
pas quand elle était comptée depuis 40 m en amont (`pitfalls.md` A15) — et **l'ordre de `RIDERS` n'y
entre plus** (points 228 et 229). L'ordre de `S.riders` reste celui de la liste de départ : c'est lui
qui porte la course.

| Constante | Valeur | Rôle |
|---|---|---|
| `DEF` | `{track: 250, laps: 40, sprints: 4, gap: 10, pace: 15, type: 'final', advance: 10}` | réglages par défaut, copiés dans `CFG` ; `type` et `advance` depuis le build 211 (§55) |
| `GROUP_GAP_S` | 1.0 | la cassure, en secondes |
| `BIKE_L` | 1.65 | longueur de vélo, en mètres |
| `NEUTRAL_LAPS` | 5 | tours de neutralisation |
| `MISSING_S` | 22 | au-delà, un coureur n'est plus « lu » |
| `TAPE_MIN_GAP` | 0.05 | deux roues plus proches ne font qu'un contact |
| `TAPE_MATCH_S` | 0.2 | fenêtre bande ↔ boucle pour un même passage de groupe |
| `TAPE_SYNC_S` | 0.02 | marge sur l'heure d'un vélo, décodeur contre bande |
| `TAPE_WINDOW` | 6 | passages gardés par groupe pour lire le compte |
| `TAPE_MIN_SPD` / `TAPE_MAX_SPD` | 1 / 25 | un vélo qui roule, et pas plus vite qu'un sprinter |
| `PHOTO_MS` | 15 | seuil du drapeau photo |
| `SEND_PLACES` | 5 | places envoyées par sprint |
| `POINTS` | `[5, 3, 2, 1]` | barème, doublé au final |
| `LAP_PTS` | 20 | ±20 par tour gagné ou perdu |
| `RAIL_FULL` / `RAIL_MIN` | 460 / 346 | bornes de la largeur de la colonne du simulateur |

`TRACK`, `LAPS`, `NSPRINTS` et `LOOPS` sont dérivés de `CFG` par `applyCfg()` :
`a = TRACK − gap` (Pursuit A), `b = a − TRACK/2` (Pursuit B), `LOOPS = [0, b, a]` — index 0
Finish, 1 Pursuit B, 2 Pursuit A, et `S.reads` est indexé de la même façon.

**`LAP_TOUCH_S` n'existe plus** : c'était la fenêtre de 0,3 s de l'ancienne détection de
tour, retirée avec elle. Si un document la mentionne, il est périmé.

## 12. Le simulateur de course

Une colonne à droite (`aside.rail`), masquable par `Hide ›`. L'opérateur n'y touche pas en
course réelle : colonne masquée, l'écran est celui de l'opérateur, inchangé. Masquée, un
bouton **Simulator** apparaît dans la barre du haut pour la rappeler.

**La vitesse d'un coureur ne bouge que si quelque chose la bouge (build 63).** Le modèle
portait trois oscillations inventées — le peloton respirait de ±0,3 m/s, chaque coureur
flottait de ±6 m autour de son créneau, l'échappé du script ondulait de ±0,1 m/s — et les
chiffres de la colonne dansaient en permanence, illisibles. Les trois sont retirées. Il
reste le seul terme qui a un sens physique, le rappel vers son créneau
(`0,12 × (cible − position)`, borné à ±1,6 m/s). Au départ, le créneau de chacun **est** sa
position de départ (`r.offset` recalculé après `reset()`), donc personne n'a à traverser le
peloton dans les premières secondes : tout le monde affiche exactement la pace dès le
premier pas. Conséquence : pour produire deux roues trop proches, il faut maintenant le
vouloir — `↑` / `↓` sur un coureur.

**Cinq onglets** : Simulation, Transponders, Track, Start list, Files. Le bandeau est centré,
sur sa propre ligne sous l'en-tête.

- **Simulation** : par coureur, la vitesse au dixième (`−` / `+` **ou saisie directe au
  clavier**, Entrée valide ; **champ vidé = retour au peloton**), `↑` et `↓` le font
  rejoindre à un rythme crédible le groupe devant ou derrière lui, `+lap` et `−lap` lui font
  prendre ou perdre un tour. `−lap` sur un coureur du peloton veut dire que son propre
  groupe lui prend un tour. La liste montre **Dossard, Nation, Nom** ; la ligne **Columns**
  au-dessus masque la Nation et le Nom (`simCols`, la grille CSS se recalcule, une colonne
  masquée ne prend aucune largeur). **Le dossard ne se masque pas** : c'est lui qui nomme le
  coureur, il n'est pas une option. En en-tête : le champ **Pace** et le bouton **Sync all
  to bunch pace**.
- **Pace** (`CFG.pace`) est la vitesse du peloton et le **seul réglage qui vaut pendant la
  course** : il ne remet rien à zéro, il s'applique au pas suivant. Tours, sprints, piste et
  distance des boucles définissent la course : ils se verrouillent au départ.
- **Sync all to bunch pace** rend au peloton **tous** les coureurs : ceux que l'opérateur
  pilote comme ceux que la course scriptée a envoyés devant ou laissés derrière (`r.done =
  true`, sinon le script les relançait au pas suivant et le bouton paraissait mort). Chacun
  garde la place où il est — son créneau devient sa position du moment — et roule à la pace.
- **Transponders** : transpondeur muet, changement de vélo (le nouveau vélo porte un autre
  transpondeur, inconnu du logiciel), attribution et libération, et `Swap` (deux coureurs
  sélectionnés) qui **n'écrit rien** : c'est la panne, le système ne peut pas la connaître.
  La correction, elle, est un geste d'opérateur (`Swapped`, §6).
- **Track** : longueur de piste 166 / 200 / 250 / 333 m, et **un seul réglage libre**,
  `gap`, l'écart entre la ligne d'arrivée et Pursuit A. Tout le reste en découle, bandes
  comprises, et affiche son nombre de contacts depuis le départ. Réglable avant le départ
  seulement.
- **Start list** : la liste des coureurs engagés (`RIDERS`, muté directement — `const`
  empêche de réassigner le tableau, pas de modifier ses éléments). `Add` ajoute un coureur ;
  `Edit` fait apparaître par coureur une pastille de couleur et des champs dossard / nom /
  NOC, plus une croix. Toute modification déclenche `reset()`.
- **Files** : la course en cours d'enregistrement, la simulation qui reste intacte,
  puis les courses enregistrées, chacune avec un bouton `Load`. Chaque course s'auto-nomme
  d'après ce qu'on y a fait (`raceName`) et s'enregistre **automatiquement** dans
  `localStorage` (`tct.sim.races`) quand on ouvre une course neuve avec `+` (`commitRec()`).
  `Open file…` relit un `.json` externe. **Une course neuve est un peloton nu** : elle n'a
  aucun ordre, donc rien ne peut l'animer toute seule (§15).

**La largeur de la colonne suit son onglet (build 64).** `railWidth()` additionne les
colonnes affichées et les cinq commandes toujours présentes, borne le résultat entre
`RAIL_MIN` et `RAIL_FULL`, et l'écrit dans `--railw`. Les quatre autres onglets gardent
`RAIL_FULL` : ils ont été dessinés pour.

**Le transport** — `⏮ 30s`, lecture, pause, `×1`/`×4`/`×16` (**×1 par défaut**), l'horloge du
simulateur, le champ `REC` / `PLAYING RACE n`, puis `Replay` et `New` — vit **dans la barre du
haut, en permanence**, depuis le 29 octobre 2026 (§17, point 53 ; ses libellés sont ceux du §16
des règles, §15 et §17 de ce fichier). Masquer le rail ne déplace plus rien : il se réduit à son
bouton `Simulator`. Dans le rail restent Laps, Sprints et le reste des réglages, éditables au
clavier. (De la build 63 à la build 112, `railHide()` déplaçait le bloc `#simtransport` entre le
rail et la barre ; ce va-et-vient n'existe plus.)

**Rewind 30s** (`rewind30()`) ne fait pas de retour arrière « vidéo » ni d'instantanés
périodiques : il relit la course depuis zéro avec les actes enregistrés tronqués à l'instant
visé (`S.t − 30`, borné à 0), par le même mécanisme que `loadRace()` (`reset()` + `S.replay`
+ boucle `replayTick()`/`step()`/`detectNow()`). Tout ce qui s'est passé après l'instant visé
disparaît — propositions, journal, validations compris.

Chaque acte est enregistré avec son heure de course (`REC.acts`) ; au rejeu, `replayTick()`
les rend à l'identique puisque la course avance par pas fixes. Le fichier d'une course
contient `cfg` (piste, tours, sprints, boucles, bandes, pace), `script` et `acts`.

**La colonne ne se reconstruit que sur `railDirty`** ; `tickRail()` écrit les vitesses,
l'horloge et les boutons allumés dans les nœuds existants, pour que les clics ne tombent
jamais dans un redessin. Les champs texte valident sur `Entrée` **et** sur la perte de focus
(`focusout`, délégué sur `#rail` car `blur` ne remonte pas), et ne sont resynchronisés que
s'ils n'ont pas le focus. `Entrée` valide **par lui-même** (`dataset.done` évite la double
validation au `blur` qui suit). Le champ de vitesse d'un coureur **ne porte pas**
`data-sim="free"` : c'était le gestionnaire de clic de la colonne qui happait le clic destiné
à la saisie, rendait le coureur au peloton et redessinait la ligne sous le curseur — on ne
pouvait pas taper dedans.

## 13. `mockups/maquette-groupes.html`

La maquette des décisions du 25 octobre 2026, construite à partir du prototype par un script
de patch. **Dépassée depuis la build 53**, qui code tout cela dans le prototype même. Elle
reste à la build 52 patchée, comme point de comparaison, et n'a plus d'autre usage. Les
mesures qui en viennent sont marquées comme telles dans `mesures.md`.

## 14. Le dessin de l'ovale

**Le tracé est ancré sur Pursuit A, pas sur la ligne d'arrivée (build 69).** Le contour
`#trackpath` **commence au milieu de la ligne droite d'arrivée**, et `pt(s)` décale la
distance de course de `CFG.gap` avant de la poser dessus :

```js
pt(s) = pathPoint(((((s + CFG.gap) % TRACK) + TRACK) % TRACK) / TRACK * PATHLEN)
```

**`pt(s)` n'interroge plus le SVG en direct (build 89).** Le `d` de `#trackpath` est figé
dans le HTML et ne change jamais pendant une session : ses points sont donc échantillonnés
une seule fois au chargement (`pathTable`, 2000 points sur toute la longueur du tracé), et
`pathPoint(len)` interpole dans cette table. Avant la build 89, chaque appel passait par
`path.getPointAtLength()`, une méthode native qui, appelée plusieurs centaines de fois par
image à 24 coureurs (chaque coureur essaie jusqu'à 15 positions candidates avant de trouver la
sienne sans chevauchement, chaque bande de groupe trace plusieurs points), occupait 93 % du
temps de `render()` — mesuré, `pitfalls.md` D15.

Pursuit A vaut `TRACK − gap`, donc `s + gap` y vaut exactement un tour : il tombe à
l'origine du tracé, au milieu de la ligne droite. Le contour ayant une symétrie de
rotation d'un demi-tour, Pursuit B — une demi-piste plus loin — tombe au point diamétralement
opposé, c'est-à-dire au milieu de l'autre ligne droite. Les deux boucles sont donc **face à
face par construction, pour toute longueur de piste et tout `gap`**, ce qu'exige
`regles-operateur.md` §9. La ligne d'arrivée se place à ses `gap` mètres réels après
Pursuit A, au lieu d'être posée à 12 m du milieu de la ligne droite comme elle l'était
jusqu'à la build 68.

**La forme du décor vient de l'opérateur** (`regles-operateur.md` §9, 28 octobre 2026) :
une seule forme pour les quatre longueurs de piste, celle dont les lignes droites font 55 m
sur une 250 m. En pixels, les trois rectangles concentriques et le tracé font **340 de haut
pour 760 de large**, soit un rayon de virage de 170 et 420 de ligne droite — 44,0 % du tour.
Les chiffres par longueur de piste sont dans `mesures.md` §14.

**La largeur dessinée de la piste a une seule source**, `OVAL_W` (60 unités SVG, demi-largeur
`HW`), écrite dans le décor lui-même au chargement (`#trackband`). Tout ce qui se pose sur la
piste la lit : les traits en travers, qui vont d'un bord à l'autre (`−HW` → `+HW`, build 72,
sans débord), la moitié que couvre la ligne des 100 m, les deux bords de la bande d'un
groupe et son épaisseur
(`OVAL_W+2`). Changer ce seul nombre suffit, et rien ne peut diverger.

**Les marquages sont donnés en mètres, pas en pixels.** `renderMarks()` pose
`PXM = PATHLEN / TRACK`, l'échelle du dessin, et un trait peint s'écrit avec sa cote réelle
dès qu'il en a une. Les quatre lignes longitudinales sont des rectangles du décor, posés à
leur distance du bord intérieur. Un trait tracé **en travers** de la piste a son épaisseur
dans le sens de la marche, ce qu'une simple `<line>` suffit à rendre.

**La ligne d'arrivée fait exception et se donne en unités**, sur décision de l'opérateur du
28 octobre 2026 : `FIN_BLACK` vaut 2, la largeur des deux lignes de poursuite contre
lesquelles le trait noir se lit, et la bande blanche vaut `FIN_BLACK * 5`. Ses 4 cm réels
vaudraient 0,3 unité, qu'aucun écran ne rend, et ses 60 cm de bande seraient alors trop
minces autour de lui pour se lire comme une bande.

**Les tape switches ne sont pas dessinés** (même décision). Ce sont des capteurs, pas de la
peinture : les deux qui ne sont pas dans une boucle tombent sous les lignes des 200 m et
des 100 m, les trois autres sous un trait de boucle. `tapeCount()` continue de les compter —
c'est un retrait de dessin, pas de mesure.

**Les champs d'état sont à l'intérieur de l'ovale, et ils ne sont jamais reconstruits** (`regles-operateur.md`
§17, build 92). La bande `#strip` au-dessus de l'ovale n'existe plus. Le panneau `#ifpanel`, la
boîte des tours restants `#togofo` — qui porte aussi le compteur de tours — et les **deux**
boutons de leader `#armfo1` et `#armfo2` sont des
`<foreignObject>` **posés une fois dans le HTML**, à l'intérieur du SVG, donc en unités de piste :
ils restent à l'intérieur de l'ovale à toute taille de fenêtre. `renderStrip()` n'y écrit que du texte et
des classes — **jamais d'`innerHTML`** —, parce qu'un bouton remplacé entre l'appui et le
relâchement n'émet aucun clic (`pitfalls.md` D2), et que ce panneau porte des boutons. Leur place
est calculée par `renderMarks()`, qui ne tourne qu'au réglage de la piste, et non à chaque image.

Deux pièges s'y sont révélés, tous deux mesurés et non vus :

- **Un `foreignObject` capte le pointeur sur tout son rectangle**, transparent ou non. Laissé
  tel quel, le cadre du panneau avalait les clics destinés aux boutons de la piste et à la piste
  elle-même. Les cadres sont donc en `pointer-events:none`, et seules les boîtes et les boutons
  reprennent le pointeur.
- **La profondeur des boutons de leader se dérive de leur hauteur**, jamais à la main :
  `HW + hauteur/2 + 6`. Les poser à une profondeur choisie à l'œil a déjà mis le bouton du bas
  **sur la piste** le jour où on l'a rapproché du bord pour gagner de la hauteur. Le dégagement
  vaut 6 unités de chaque côté, et il reste vrai si la hauteur du bouton change.
- **`syncArm()` tourne à chaque image.** Il ne cherche donc rien dans le document : les trois
  boutons sont trouvés une fois, les trois lignes vertes seulement quand `renderMarks()` vient de
  reconstruire `#marks`, et un bouton dont l'état n'a pas changé n'est pas touché. C'est la même
  discipline que les builds 88 et 89.

**Aucune annotation n'est tracée sur l'ovale** (`regles-operateur.md` §17, points 19 et 20,
build 93). `renderOval()` ne produit plus que des bandes et des pastilles ; `#ovlabels` reste
vide, et `putLabel()`, qui écartait les étiquettes les unes des autres, est supprimé avec elles.
Ce qui est parti : le libellé du leader, le nom de chaque groupe avec son effectif et son statut,
l'écart entre groupes, et l'étiquette « No points » avec son pointillé. **Build 94** : les deux
marques rouges qui disaient la même chose sur la pastille — contour épaissi et anneau clignotant
— partent avec elle, et avec elles le `Set` `noPts`, la classe `.blink` et son animation.
`S.inelig` est **inchangé** : l'éligibilité se calcule toujours et la carte du sprint grise
toujours la ligne du coureur. C'est le dessin qui est retiré, pas la règle. **Les annotations
sont à refaire entièrement** : ne pas en remettre une au passage.

**La largeur d'un nom de groupe se mesure, elle ne s'estime pas.** `labelWidth()` interroge
`getComputedTextLength()` sur `#gmeas`, un élément de texte laissé hors cadre, **une seule fois
par nom distinct**, et garde le résultat dans une `Map`. `renderOval()` tourne vingt fois par
seconde : il lit la table, il ne mesure jamais. C'est la même discipline que `pathTable` (D15).

**Aucun repère de l'ovale n'est nommé** (`regles-operateur.md` §9, 29 octobre 2026, build 91).
`renderMarks()` ne pose plus que des `<line>` : l'assistant `label()` qui écrivait « Finish »,
« Pursuit A », « Pursuit B », « 200 m start » et « 100 m intermediate » est supprimé, et `#marks` ne
contient plus un seul `<text>`. `LOOPNAME` et `T.name` restent lus ailleurs — l'en-tête du
leader, les propositions, l'onglet Track — et ne bougent pas.

Les lignes du 200 m lancé suivent la même règle que `buildTapes()` et en reprennent les deux
cas particuliers : rien sur une piste de **166 m**, et sur une **200 m** le départ du 200
tombe sur la ligne d'arrivée, qui porte déjà sa marque. La ligne des 200 m traverse toute la
largeur, celle des 100 m la moitié.

`pt()` et `normalAt()` ne sont lus que par `renderMarks()` et `renderOval()` : **le dessin
de l'ovale n'entre dans aucune mesure**. Changer la forme, la largeur ou les marquages ne
peut donc rien déplacer dans les groupes, les tours, les sprints ou les bandes.

---

## 15. La simulation, et les trois boutons de la barre

**Il n'y a plus de scénario dans le simulateur (build 74).** La table `SCRIPT`, le drapeau
`S.useScript` et le mode `away` ont été supprimés ; ils ne sont pas remplacés. Une
simulation est une **course enregistrée** comme les autres : `CALM_RACE` porte une `cfg` et une
liste d'`acts`, que `loadRace()` met dans `S.replay` et que `replayTick()` applique sur
l'horloge, exactement comme pour une course que l'opérateur a jouée lui-même.

**Et à la build 75 elle quitte le code.** `CALM_RACE` n'est plus une ligne que l'onglet Files
ajoute à la liste : c'est un **modèle de départ**. Au chargement de la page, `localStorage`
est lu ; si la clé `tct.sim.races` est **absente** — le prototype n'a jamais tourné sur ce
poste — une copie de `CALM_RACE` est déposée dans `RACES` et la liste est écrite. Si la clé
existe, même vide, elle fait foi : c'est la liste que l'opérateur a laissée. La distinction
compte, parce que c'est elle qui fait qu'**une simulation effacée reste effacée**.
Rien en aval ne sait d'où vient cette ligne : plus d'indice `-1`, plus de drapeau `ref`, plus
de bordure verte sur sa ligne.

**Renommer et effacer.** Chaque ligne porte *Load*, *Rename* et
*Delete*. Deux variables d'écran suffisent : `renaming` tient l'indice de la ligne en cours
d'édition, `delArmed` celui de la ligne dont *Delete* a été cliqué une fois. Le gabarit d'une
ligne lit les deux et se dessine en conséquence — champ + *Save*/*Cancel*, ou *Delete?* en
rouge. Les deux écritures passent par `saveRaces()`, donc la liste entière est réécrite dans
`localStorage` : c'est ce qui fait tenir le renommage comme l'effacement au rechargement. Un
nom vide est refusé en silence ; Entrée valide, Échap annule.

C'est ce qui ferme `pitfalls.md` A11 : un drapeau ne peut plus survivre à un `reset()`,
puisqu'il n'y a plus de drapeau.

**La roue, dans l'ordre `lose`.** Un ordre de perdre un tour peut porter un `wheel` et un
`wheelLaps` : `pilotStep()` cherche alors le coureur nommé, note le tour où l'écart au coureur
qui le double tombe sous une longueur de vélo, et **copie sa vitesse** pendant le nombre de
tours donné. C'est la règle de l'opérateur du 28 octobre 2026, §16 des règles, et c'est la
seule façon dont ce comportement existe : il n'y a pas de bouton pour lui, parce qu'il n'en a
pas demandé. Le coureur continue de perdre son tour pendant ce temps — la condition de fin de
l'ordre n'est pas touchée.

**Les trois boutons.**

| Bouton | Ce qu'il fait | Ce qu'il ne fait pas |
|---|---|---|
| *Replay* | remet l'horloge à zéro et **remet les ordres de la course en file** | n'enregistre rien, n'ouvre rien |
| *New* | `commitRec()` puis `reset()` : la course en cours est **enregistrée**, une course vide s'ouvre sur la configuration affichée | ne rejoue rien |
| `●` REC | un point rouge dans la barre, allumé quand la course est en **lecture** | ne suit pas la course : il s'éteint en pause (décision de l'opérateur) |

*New* fait ce que faisait Restart jusqu'à la build 73. *Replay* est donc le bouton dont le
comportement a changé, et c'est voulu : « le bouton Restart doit redémarrer la course ». Les
libellés *Replay* et *New*, leur voisinage, et « ⏮ 30s » placé **à gauche de Play**, sont ceux
que l'opérateur a dictés le 28 octobre 2026 (§16 des règles). Tous les composants de cette
ligne — boutons, groupes de boutons, horloge et point REC — prennent une hauteur unique,
donnée une fois par `--tph` pour la barre du haut et une fois pour le rail.

Le point REC se pilote dans `syncSeg()`, à côté des boutons lecture et pause, sur le même
`playing` qu'eux — une seule source, donc il ne peut pas désaccorder.

---

## 16. Comment le peloton tient sa vitesse

**Le repère est un point, pas une moyenne (build 76).** `S.anchor` est posé au `reset()` à
l'endroit où le peloton démarre, et `step()` l'avance de `CFG.pace * dt` à chaque pas. Rien
d'autre ne le touche. Chaque coureur hors ordre vise `anchor + TRACK * lapTrue + offset` et
corrige sa vitesse proportionnellement à l'écart, bornée à ±1,6 m/s.

Jusqu'à la build 75, ce repère était la **moyenne des coureurs encore dans le peloton**. Un
départ déplaçait donc la moyenne, et l'écart ainsi créé ne se refermait jamais : le champ
entier roulait en permanence sous l'allure demandée (`mesures.md` §17). Une moyenne sur un
ensemble qui change ne peut pas servir de repère fixe ; un point qui roule l'allure, si.

**`syncAllToBunchPace()`** libère les ordres, puis, pour chaque coureur encore dans le
peloton, pose sa place là où il se trouve déjà et sa vitesse à l'allure. Personne ne bouge,
tout le monde roule l'allure — ce que dit le libellé, et rien de plus (§16 des règles).

**Les flèches ↑ et ↓** interrogent `neighbourGroup()` à chaque tic de `tickRail()` et sont
désactivées quand il ne rend rien, c'est-à-dire pour le groupe de tête vers l'avant et pour le
dernier groupe vers l'arrière. Un coureur déjà sous ordre garde ses boutons actifs : ils
montrent son ordre en cours.

**La progression d'un ordre (build 77).** `progress(po, now, goal)` pose `po.gap0` au premier
pas de l'ordre et tient `po.prog` entre 0 et 1 : `1 - gap / gap0`. Elle se mesure sur
**l'écart qui reste**, jamais sur le terrain parcouru, parce que le but d'un ordre `up` ou
`down` bouge lui aussi — un groupe qui remonte de derrière dépasse le terrain déjà couvert, et
une jauge comptant les mètres du coureur se remplissait pendant qu'il était encore loin
(`mesures.md` §18). `tickRail()` lit `po.prog` et le pose en `--prog` sur le bouton allumé,
dont un `::before` large de `--prog` remplit le fond.

**Le mode `follow` (build 77).** `endPilot(r, mates)` regarde le groupe visé : s'il n'est fait
que de coureurs du peloton ordinaire, le coureur y est rendu comme avant ; sinon il reçoit
`{ kind: 'follow', bibs }` et `pilotStep` lui **copie la vitesse moyenne du groupe** à chaque
pas, jusqu'à ce que ce groupe n'existe plus. Aucun bouton n'est allumé pour `follow` : la
mission est finie, c'est un état, pas un ordre.

---

## 17. Enregistrer et rejouer

**`REC` ou `LOADED`, jamais les deux (build 78).** `REC` est la course que l'opérateur mène
lui-même ; `LOADED` est une course prise dans la liste et rejouée. `loadRace()` pose `LOADED`
et met `REC` à `null` ; `recAct()` n'écrit que si `REC` existe, donc **une course chargée
n'enregistre rien**, y compris les ordres que l'opérateur donne pendant sa relecture.
Jusqu'à la build 77 `loadRace()` ouvrait un `REC` contenant déjà les ordres de la course
chargée, et le `commitRec()` du Load suivant en déposait une copie dans la liste
(`mesures.md` §19). `curActs()` rend les ordres de l'un ou de l'autre, pour `Replay` et pour
le retour de 30 s.

**`saveRec()` remplace `commitRec()`.** Chaque `REC` porte un `id` ; `saveRec()` cherche cet
`id` dans `RACES` et **remplace la ligne** au lieu d'en ajouter une. Elle est appelée à chaque
ordre enregistré, à chaque pause, au retour de 30 s et à l'arrivée. La course de l'opérateur
est donc dans la liste dès son premier ordre et s'y tient à jour toute seule — il n'y a ni
bouton *Save*, ni rien à cliquer pour garder une course (§16 des règles). Le nom suit les
ordres donnés, sauf si l'opérateur a renommé la course lui-même : `commitRename()` pose alors
`named` et `saveRec()` n'y touche plus.

**L'écran.** `syncSeg()` allume le point `REC` sur `playing && REC`, et `#simplaying` sur
`LOADED` seul. Les deux occupent la même place et s'excluent.

**Play et Pause sont des dessins.** Deux `<svg>` de 12 × 12 dans le bouton, `fill:currentColor`,
à la place des caractères `&#9654;` et `&#10073;&#10073;`. Un glyphe de police porte ses propres
approches et ne tombe pas au centre de son cadre quel que soit le `padding` ; un dessin carré
centré dans le bouton ne peut pas être décalé. Le triangle porte une correction optique de
0,4 unité vers la droite, parce qu'un triangle plein pointant à droite paraît à gauche
(`mesures.md` §19).

**Le numéro de course (build 79).** `raceNo()` rend le plus grand numéro de la liste plus un ;
`numberRaces()` en donne un à toute course qui n'en a pas, au chargement de `localStorage` —
c'est ce qui rattrape les courses enregistrées avant la build 79. `saveRec()` garde le numéro
de la ligne qu'elle remplace et n'en attribue un que pour une course neuve. Rien ne
renumérote : effacer une course ne touche pas les autres. Le numéro est le nom stable d'une
course, là où son rang dans la liste bouge tout le temps.

**Le vert de la relecture** est le jeton `--play`, #1CC634, donné par l'opérateur. Il ne sert
qu'à « Playing race *x* » ; `--acc` reste le bleu de l'interface.

**Le centrage sur l'encre (build 80).** `centreInk()` mesure, bouton par bouton, de combien
l'**encre** d'un libellé tombe à côté du milieu de son bouton — la boîte englobante des
`path`/`rect` pour un dessin, `actualBoundingBoxLeft/Right` lu sur un canevas pour du texte —
et décale d'autant **le libellé, jamais le bouton** : déplacer le bouton emporte son cadre et
son encre ensemble et ne change rien. Un libellé sans élément propre reçoit un
`<span class="ink">` pour avoir une boîte à déplacer. Deux conditions, apprises à la dure
(`mesures.md` §21) : la mesure attend `document.fonts.ready`, sans quoi elle lit les lettres
d'une police de secours et pose une correction fausse ; et elle est gardée en cache, les
libellés de cette barre ne changeant jamais.

**Les deux lignes de la barre (build 81).** La ligne du transport porte ⏮ 30s, ▶, ❚❚ et les
trois vitesses — 361 px pour 460. La ligne de l'horloge porte l'horloge, le point REC ou
« PLAYING RACE *x* », puis *Replay* et *New* — environ 360 px pour 460. Les deux groupes
`.seg` ne sont plus comprimés, donc aucun bouton ne déborde sous son voisin
(`mesures.md` §22). Toute addition à l'une de ces deux lignes doit se remesurer : c'est la
compression d'un `.seg`, invisible en soi, qui décale les symboles.

**Le champ d'état (build 81).** `#simstate` est seul à dire ce qui se passe : `syncSeg()` lui
met la classe `playing` et « Playing race *x* » si `LOADED`, la classe `recdot` et le point
rouge si une course est menée et jouée, la classe `off` sinon. Les classes `.recdot` et
`.playing` ne sont plus que deux habillages du même élément. Deux champs voisins, dont l'un
seulement s'affiche, retiennent la place des deux dès que le champ caché garde sa boîte —
c'est ce qui élargissait la ligne de l'horloge (`mesures.md` §22).

**Sa grandeur est fixe (build 82).** `#simstate` fait `flex:0 0 120px`, et `.off` le rend
invisible **sans lui reprendre sa place** : un champ qui disparaît ferait glisser l'horloge et
les boutons à chaque départ et à chaque pause. 120 px tiennent « PLAYING RACE 888 », le plus
long des trois contenus (`mesures.md` §22).

---

## 18. L'ordre d'affichage de la liste des coureurs

`simSort` vaut `null` tant qu'aucun en-tête n'a été cliqué, puis `{key, dir}`.
`sortedRiders()` rend `S.riders` tel quel, ou une **copie** triée — jamais le tableau
lui-même : `S.riders` porte la course, et le réordonner reviendrait à changer la course pour
changer un affichage. Un clic sur un en-tête trie sur sa colonne, un second clic sur le même
en-tête retourne `dir`. `railRows` reste indexé par dossard, donc les commandes d'une ligne
vont au coureur de cette ligne quel que soit l'ordre affiché (`mesures.md` §23).

**Les deux vues partagent l'ordre (build 85).** `simCmp()` écrit la comparaison une fois ;
`sortedRiders()` s'en sert pour la vue Simulation, `sortedRoster()` pour la vue Start list.
`sortedRoster()` rend des paires `{e, i}` où `i` est le **rang d'origine dans `RIDERS`** :
c'est lui que portent `data-ri` et `data-rosterdel`, donc éditer ou retirer un coureur ne
dépend jamais de l'ordre dans lequel la liste est regardée (`mesures.md` §23).

**Sans tri, la vue Start list suit la grille (build 238, point 231).** `sortedRoster()` range alors
ses lignes selon `gridOrder()`, c'est-à-dire exactement ce que montre le sous-onglet `Start order`.
L'ordre interne de `RIDERS` — celui où les coureurs ont été ajoutés — ne s'affiche plus nulle part
et ne commande plus rien. Un tri posé dans la vue Simulation prime toujours (`mesures.md` §84).

---

## 19. Les réglages du simulateur

`tct.sim.setup` garde trois choses : `cfg` (longueur du tour, tours, sprints, distance
Finish → Pursuit A, allure), `riders` (la liste de départ entière) et l'appairage
transpondeur ↔ dossard, plus les transpondeurs libres. `loadSetup()` est appelé **avant**
`applyCfg()` au démarrage ; les valeurs écrites dans le fichier ne servent donc que la
première fois, quand il n'y a rien de gardé.

`saveSetup()` tient l'appairage **en mémoire** (`TPMAP`, `TPSPARE`) en même temps que sur le
disque, parce que c'est lui que `reset()` relit et qu'une course neuve ne recharge pas la
page : sans cela, le premier *New* ramenait l'appairage d'origine (`mesures.md` §24).
`reset()` donne à chaque coureur le transpondeur gardé, ou le premier numéro libre s'il vient
d'être ajouté, et refuse deux fois le même numéro.

`saveTpIfSetup()` n'enregistre l'appairage que si la course n'a pas commencé : ce que
l'opérateur change avant le départ est un réglage, ce qu'il change pendant est un fait de
cette course.

**Les drapeaux (build 87).** Ils restent dessinés en SVG dans le fichier : les emoji de
drapeaux ne s'affichent pas sous Windows, et la raison n'a pas changé. Huit fonctions —
`fv`, `fh`, `fb`, `fd`, `fn`, `ft`, `fstar`, `fu` — écrivent les bandes, les disques, les
croix nordiques, les triangles de guindant, les étoiles et le pavillon du Commonwealth, de
sorte qu'une nation tienne sur une ligne. Les bandes et les croix sont exactes ; un emblème —
aigle, armoiries, cèdre — est ramené à une forme de la bonne couleur au bon endroit.
`flag(noc)` rend le rectangle gris pour un code inconnu, comme avant.

## 20. `timeline-prototype_new_look_3a_3d.html` : le même moteur sous un autre écran

Une **version alternative** du prototype, demandée le 31 octobre 2026 : le moteur de
`timeline-prototype.html`, présenté sous le dessin des pages **3a, 3b, 3c et 3d** de
`TCT Points Race - mockups.html` — un seul écran, quatre onglets (Race, Results, Log,
Passings), le bandeau d'état au-dessus des quatre, de sorte qu'il ne quitte jamais l'écran.

**Le moteur n'est pas réécrit.** L'ancien écran reste entier dans le document, dans un
`<div id="legacy">`, **déplacé hors champ** (`left:-20000px`) et non caché : toutes les
fonctions de rendu continuent d'y écrire et d'y mesurer, donc `renderTimeline`,
`renderOval`, `renderStrip`, `renderMarks`, `centreInk` et `labelWidth` travaillent encore
sur des boîtes réelles. La couche de présentation est ajoutée à la fin de l'IIFE et
s'accroche à `render()` par une seule ligne :

```js
const nlBaseRender = render;
render = function () { nlBaseRender(); try { nlRender(); } catch (e) { console.error(e); } };
```

**Ce qui est déplacé, et non redessiné.** `#scard` (la carte du sprint) et `#rail` (le
simulateur) sont `appendChild`és dans la nouvelle disposition au démarrage : ce sont les
vrais, avec leur glisser-déposer, leurs boutons et leurs fichiers.

**Ce qui est transmis, et non réimplémenté.** Chaque commande de la barre d'actions presse le
bouton que le moteur écoute déjà (`#startbtn`, `#armfinish`, `[data-pick]`, `[data-arm]`,
`#undo`, `#railshow`/`#railhide`). La colonne des faits reproduit le protocole `data-pid` /
`data-pact` du moteur et confie ses clics à `onStripClick` : un fait se valide ici exactement
comme sur l'ancien écran. La ligne « Enter a fact » écrit les dossards tapés dans
`S.selection`, puis presse le bouton correspondant de `#tbar` ; si le moteur l'a laissé
désactivé, rien ne se passe.

**Un seul ajout au moteur**, purement additif : `logEvent()` écrit désormais `lap` sur la
ligne du journal (`dispLap()` sous `try`), parce que l'onglet Log a une colonne Lap. Aucune
autre fonction ne lit ce champ.

**SET NEXT LEADER** est un seul bouton pour les deux boucles que le moteur arme : un clic
parcourt Pursuit B → Pursuit A → éteint, et la pastille dit laquelle est armée. Chaque clic
est **un** clic du moteur, donc le journal enregistre un armement, pas deux.

**NEUTRALISE RACE** est dessiné comme la maquette le montre et **n'est branché sur rien** :
l'opérateur n'a énoncé aucune règle de neutralisation (`pitfalls.md` A12).

**Trois endroits où la maquette demande ce que le moteur ne mesure pas**, et ce qui y est
mis à la place :
- 3a, « The result this produces » : la maquette donne des écarts en secondes. Ici c'est
  l'échelle d'éligibilité relue dans l'ordre, et l'écart est **le mètre que cette échelle
  porte déjà** — pas un temps que personne n'a chronométré.
- 3c, les filtres *Layer* et *Origin* : le journal ne porte ni l'un ni l'autre. Ce sont une
  **lecture** de ce qu'il porte (`op` pour *Official* / *Decided*, le type d'événement pour
  *Measured* / *Inferred*). Ces trois mots viennent de la maquette, pas de l'opérateur ; si
  l'opérateur en donne d'autres, ils changent dans `nlOriginOf()` et nulle part ailleurs.
- 3d, « Time of day » et le niveau de signal : le prototype n'a ni horloge murale ni dBm. La
  colonne porte le **temps de course** à la milliseconde, et la colonne Signal porte ce qui
  existe vraiment — les comptages du tape switch face aux lectures de la boucle.

Le fichier est autonome comme l'original : il charge `styles.css` et `flags.js`, et tout le
CSS du nouvel écran est dans un `<style>` de l'en-tête, préfixé `nl-`.


## 21. `timeline-prototype_mixed.html` : l'écran du prototype, plus deux choses

Demandée le 31 octobre 2026. **L'écran et les fonctions de `timeline-prototype.html` sont
conservés tels quels** — la timeline, l'ovale, les propositions, la barre d'actions, la carte
du sprint et le simulateur ne changent ni de dessin ni de comportement. Hors la feuille de
style ajoutée, le balisage ne diffère de l'original que par **cinq endroits**, et le moteur
n'est pas retouché : tout l'ajout tient à la fin de l'IIFE et n'enveloppe que deux fonctions,
`render()` et `renderLog()`.

### La taille de l'ovale

L'ovale est dessiné dans un `viewBox` fixe (`63 49 854 492`) ; le réglage ouvre ou resserre ce
viewBox **autour de son centre**, et rien d'autre. Mesuré sur la simulation à 60 %,
140 % et retour : la timeline, `.mid`, la boîte de l'ovale, la zone du bas, la colonne de
droite et la carte du sprint rendent **exactement les mêmes rectangles**, au pixel près. C'est
le dessin qui grandit ou rapetisse, pas sa place.

Rien d'autre n'en dépend : `renderOval`, `renderMarks` et les étiquettes travaillent en unités
du viewBox, et la sélection comme le glisser-déposer passent par le DOM (`closest`,
`elementFromPoint`), jamais par une conversion de coordonnées — vérifié, un clic sur un point
de l'ovale à 130 % sélectionne bien son coureur.

Le bouton du milieu porte la taille et ramène à 100 %. La plage est 60 %–180 %, par pas de
10 %. Le réglage ne vit que le temps de la page : il n'est pas gardé sur le disque, personne ne
l'a demandé.

**Ce que l'arithmétique impose, et qu'il faut savoir.** Avec `preserveAspectRatio="…meet"`, le
dessin est toujours borné par le plus contraignant des deux côtés de sa boîte. Quand la boîte
est plus étroite que le rapport 854:492 — c'est le cas sur un écran de 1800 px, où l'ovale fait
612 × 621 et le dessin 612 × 352 —, **la largeur est déjà saturée** : au-delà de 100 % les deux
bouts des virages sortent du cadre, et un coureur qui s'y trouve n'est plus visible. Sur un
écran plus large la boucle devient bornée par la hauteur, il reste du jeu horizontal, et
l'agrandissement est alors sans perte. Agrandir sans rien rogner et sans toucher au reste est
**géométriquement impossible** dans une boîte fixe : c'est un fait, pas un choix de code.

### Les six onglets, disponibles en tout temps

**La page de course est un onglet comme les autres.** La barre d'onglets ne vit plus dans
l'en-tête du journal : elle est posée sous la barre du haut, entre elle et `.main`, et elle ne
quitte jamais l'écran. Six onglets : **Race**, puis Crossings, Decisions, Sprints, Standings
et **Passings**. L'écran s'ouvre sur Race.

C'est le **même `#logtabs`** qu'avant, déplacé dans le balisage, avec un bouton de plus devant
les autres. Le gestionnaire du moteur n'est donc pas touché : il pose `logTab`, les classes et
l'indice comme il l'a toujours fait, et appelle `render()`. Il ne reste ici que deux choses à
faire : écrire l'indice des deux onglets que sa table ne connaît pas (`race` et `pass`), et
ouvrir ou fermer le journal selon l'onglet.

Le bouton **Race log** de la barre du haut et le **Close** du journal n'ont plus d'objet : les
onglets les remplacent, et ils sont retirés de la vue. Ils restent dans le document avec leurs
écouteurs, et la touche **Échap** appelle toujours `logOpen(false)` — c'est pourquoi
`syncTabs()` refait l'accord entre l'onglet et l'écran **à chaque image** plutôt qu'au seul
changement d'onglet : un appel égaré se rattrape en 50 ms au lieu de laisser l'écran dans un
état que l'onglet dément. Échap ramène en outre l'onglet sur Race, pour que les deux disent la
même chose.

**Le journal garde sa position d'avant** — par-dessus la page de course, et non à sa place ;
seul son bord haut descend sous la barre d'onglets. Ce n'est pas un détail de dessin : c'est ce
qui laisse `.main` **dessiné et mesurable**. `#gmeas` y mesure la largeur des étiquettes de
l'ovale, et dans un `display:none` il rendrait 0 pour toujours, car `labelWidth()` garde ce
qu'il a mesuré (`pitfalls.md` D25).

**Les onglets reprennent le dessin de la page de course (build 209, 15 novembre 2026).**
L'opérateur a demandé que Standings, Crossings, Decisions, Sprints et Passings aient le même
dessin et les mêmes couleurs que la page de course. Le seul écart tenait au panneau du journal,
`.log` (`styles.css:253`), posé sur le bleu `--deep` avec une bordure `--acc` : ce fond
remplissait de bleu tout l'espace autour et sous les lignes, et donnait aux onglets l'air d'un
autre écran. L'override, dans le bloc `<style>` de ce fichier, le pose sur le gris `--panel` à
bordure `--line`, comme la timeline (`.tl`) et la barre d'actions ; et l'en-tête du tableau
Passings (`.rows.pass .ph`), lui aussi en `--deep`, passe à `--panel`. Le reste était déjà la
page de course : cartes `#17191c` à bord `--line2`, données en ambre `--fg`, nombres en `--mono`
alignés, noms et libellés en `--sans`. Rien n'entre dans `styles.css` : le journal superposé du
prototype de référence garde son dessin. Les changements de couleur sont les seuls ; aucun
comportement n'est touché.

### L'onglet Passings

Il reprend la page 3d. `renderLog()` est **enveloppée, pas réécrite** : les onglets `race` et
`pass` sont traités avant elle, les quatre autres lui reviennent inchangés. Sa table est
relevée de l'installation telle que le moteur l'a enregistrée — le journal de passage propre à
chaque boucle (`S.reads`) et le comptage que le passage d'un groupe a produit sur chaque tape
switch (`S.tapePass`) — avec les filtres *Source* et *Unmatched only*, et le relevé de santé
des trois boucles.

Comme dans `timeline-prototype_new_look_3a_3d.html` : le prototype n'a ni horloge murale ni
niveau de signal, donc la colonne Time porte le **temps de course** à la milliseconde, et la
colonne Signal porte ce qui existe vraiment, les comptages.

## 22. Les poignées, la timeline élastique et les réglages par zone (build 149)

Demandés le 31 octobre 2026, consignés mot pour mot dans `regles-operateur.md` §17,
points 110 à 120. Tout vit dans `timeline-prototype_mixed.html` — son bloc `<style>` et la fin
de son IIFE. **Rien n'entre dans `styles.css`** : cette feuille sert aussi à
`timeline-prototype.html` et à `timeline-prototype_new_look_3a_3d.html`, qui ne changent pas.
Chaque surcharge porte son parent dans le sélecteur (`.main > .tl`, `.mid > .below`) : à
spécificité égale c'est l'ordre qui tranche, et c'est ce qui a coûté D17 et D20.

### L'ovale calé en haut à gauche

`preserveAspectRatio` passe de `xMidYMin` à `xMinYMin`, et le réglage ne déplace plus l'origine
du `viewBox` : `x` et `y` restent à 63 et 49, seules la largeur et la hauteur changent.

Le maximum n'est plus 180 % : `ovalMax()` le calcule à partir de ce que l'opérateur a défini
comme « rogné » (§17 point 111) — à droite le bord peint du ruban, en haut et en bas les bords
extérieurs des deux boutons `SET NEXT AS LEADER`. Les quatre cotes sont **relevées du dessin**
(`#trackband`, `#armfo1`, `#armfo2`), jamais écrites à la main.

**Ce que l'arithmétique impose.** La zone à garder visible mesure 837 × 488 unités dans un
cadre de 854 × 492 : il reste 2 % de marge en largeur et 0,8 % en hauteur. Le maximum vaut donc
au mieux 1,02 **sur n'importe quel écran**, et avec un pas de 10 % le `+` est grisé dès 100 %.
C'est voulu et ce n'est pas un bouton mort : il sert à remonter après un `−` (§17 point 113).
Agrandir réellement l'ovale passe par les poignées, qui agrandissent sa zone.

La limite se recalcule par un `ResizeObserver` sur `.oval` — il couvre la fenêtre, les poignées
et le simulateur qu'on montre ou qu'on cache, et il règle aussi le premier affichage, où la
boîte mesure encore zéro (D19). La relire à chaque image coûterait une disposition forcée vingt
fois par seconde (D15).

### Les quatre poignées

Sur les quatre coutures qui existaient déjà : timeline ↔ milieu, milieu ↔ colonne du sprint,
ovale ↔ zone du bas, et actions ↔ propositions (verticale en disposition « côte à côte »,
horizontale en « empilée »). Chacune n'écrit **qu'une variable CSS** — `--w-tl`, `--w-right`,
`--h-below`, `--w-acts`, `--h-props` — que la zone lit avec sa valeur d'origine en repli :
sans variable, l'écran est au pixel près celui d'avant.

> **Dépassé en build 155** (§29) : la disposition empilée est retirée. La poignée des actions
> est toujours verticale, et `--h-props` n'existe plus.

Le glissé passe par le pointeur, jamais par le drag natif (D3), et pose le fanion `drag` du
moteur pendant toute sa durée, celui-là même qui garde le glisser-déposer des coureurs : la
timeline n'est pas reconstruite tant qu'on glisse (D1). **Mesuré** : 2 reconstructions en 1,6 s
hors glissé, 0 pendant. Un double-clic rend à la zone la taille de la feuille de style.

**Les planchers.** La colonne du sprint ne descend pas sous 500 px. La timeline ne descend pas
sous 160 px — elle doit garder dossard, drapeau, NOC et `no pts` (§17 point 114 et la demande du
31 octobre). La zone du bas ne descend pas sous la hauteur de la barre d'actions, parce que
« la barre d'actions ne doit jamais avoir à défiler pour être vue en entier » (29 octobre
2026) ; les propositions, elles, défilent plutôt que d'être rognées. La poignée de l'ovale
**marque d'un cran** la hauteur en dessous de laquelle le dessin cesse d'être borné par sa
largeur et commence à rapetisser : une information, pas une interdiction.

### La timeline qui se met à la hauteur

Deux choses distinctes. Le **bouton** pose la taille de référence de l'opérateur, de 60 % à
180 %, et elle est gardée. Le **resserrement** est automatique et ne va que vers le bas : après
chaque reconstruction, `tlFit()` baisse `--tlz` par pas de 0,05 jusqu'à ce que la colonne tienne
ou jusqu'au plancher de 0,8 — 22 px par ligne, en dessous le dossard n'est plus lisible d'un
coup d'œil. Au-delà elle déroule, et c'est voulu (§17 point 116).

Le bouton du milieu affiche la taille **appliquée**, pas celle demandée, et le `+` est grisé
quand la colonne est pleine : un bouton qui ne peut rien faire se montre comme tel.

`tlFit()` est appelée en enveloppant `renderTimeline`, pas dans `render()` : une fois par
reconstruction au lieu de vingt fois par seconde (D15). Un `ResizeObserver` sur `#tlbody`
rattrape les changements de hauteur qui ne passent pas par une reconstruction — la fenêtre et
la poignée.

**Les deux bandes « new group » sont épinglées** en haut et en bas de la colonne
(`position:sticky`), et gardent leur hauteur : une zone de dépôt ne bouge pas sous le curseur
(D3). Elles restent donc atteignables même quand la colonne déroule — c'est exactement le cas
où l'opérateur en a besoin.

**L'en-tête de groupe passe sur une ligne** quand les trois textes y tiennent, et se resserre
dans tous les cas : 39,6 px avant, **17,8 px** mesurés après. Ce qui ne tient pas — une pastille
d'état, la longue ligne d'un groupe d'incident — passe dessous, et cet en-tête-là reste haut.

### Les réglages par zone

Trois de plus, pour la carte du sprint, les propositions et la barre d'actions, dessinés comme
celui de l'ovale. Ils agissent par `zoom` sur le contenu de leur zone : `#scard`,
`.below > .props > *`, `.acts > .tbar`. La zone, elle, se règle à la poignée — la poignée donne
de la place, le réglage donne de la taille.

Chacun est posé **hors** du conteneur que le moteur réécrit : `#propcard` et `#scard` sont
refaits une fois par seconde, et un bouton remplacé entre l'appui et le relâchement n'émet pas
de clic (D2). Ils ne paraissent qu'au survol de leur zone, comme celui de la timeline : la place
verticale est justement ce qui manque, et une barre permanente en prendrait.

### Le drapeau dans l'ordre du sprint

Sept colonnes au lieu de six, **sans élargir la colonne** : les 27 px du drapeau sont pris sur
l'écart, qui réservait 62 px pour 43,2 d'encre, et sur le NOC, qui en réservait 38 pour 23,4.
Mesuré après : la colonne de l'écart garde 46,7 px pour 43,2 d'encre. L'en-tête porte la même
grille, sinon les deux ne sont plus alignés.

### Ce qui est gardé

Une seule clé, `tct.layout` : les cinq variables des poignées, le réglage de l'ovale, celui de
la timeline et les trois réglages de zone. Relue au chargement, réécrite à chaque geste.
« TOUT DOIT RESTER IDENTIQUE SI PERSONNE NE TOUCHE LES POIGNEES OU LES BOUTONS » (§17
point 119). Une nouvelle course ne remet rien à zéro : la disposition est celle du poste, pas
celle de la course, et rien de tout cela n'entre dans une course enregistrée.


## 23. La fenêtre d'actions fixe, CTRL + molette, et la poignée qui va dans les deux sens (build 150)

Demandés le 31 octobre 2026 après essai de la build 149, consignés mot pour mot dans
`regles-operateur.md` §17, points 121 à 125. Tout vit dans `timeline-prototype_mixed.html`,
comme le §22 : **rien n'entre dans `styles.css`**, et chaque surcharge porte son parent dans le
sélecteur.

### Pourquoi la poignée de l'ovale n'allait que dans un sens

Son plancher était `Math.ceil($('.acts').getBoundingClientRect().height)` — la hauteur que la
barre d'actions **occupe à cet instant**. En disposition « côte à côte » la barre est étirée à
la hauteur de sa ligne de grille, donc cette hauteur vaut toujours celle de la zone : le
plancher était égal à la taille courante, et le glissé était refusé au premier pixel. La
poignée de la colonne du sprint a la même forme de butée pour une autre raison — sa largeur
d'origine vaut déjà son plancher documenté de 500 px — mais là c'est le plancher qui est juste,
et rien n'a été changé.

Le plancher est maintenant `actsMin`, **la hauteur que la barre demande au plancher de son
propre resserrement**, relevée de la barre elle-même. **Mesuré** sur l'écran de référence
(centre de 679 px, colonne d'actions de 290 px) : 351 px à 100 %, **167 px à 60 %**. La poignée
rend donc à l'ovale 184 px de plus que sa hauteur d'origine, et le double-clic reste là
(§17 point 121).

### Le resserrement de la barre d'actions

Même mécanisme que `tlFit()` et même sens unique vers le bas : `actsFit()` baisse `--z-acts`
par pas de 0,05 tant que la barre dépasse sa zone, jusqu'au plancher. **Le plancher n'est pas
un chiffre neuf** : c'est `OVZ_MIN`, les 60 % que le réglage manuel de cette zone avait déjà.
Mesuré en tirant la poignée : 100 % puis **85 %** à mi-course de la poignée, **60 %** au
plancher, et jamais de rognage.

Pour que le resserrement se déclenche, la ligne de la grille devait cesser d'être `auto` :
`body.lay-side .mid > .below{grid-template-rows:minmax(0,1fr)}` et `.acts{min-height:0}`. Sans
cela la barre gardait sa hauteur, débordait d'une zone resserrée et se faisait rogner par
`.mid{overflow:hidden}` — le resserrement ne voyait jamais qu'il manquait de la place.

### La hauteur posée de la fenêtre d'actions

Trois choses, et aucune n'ajoute un objet à l'écran :

- **les deux boutons du coureur seul sont toujours là**, désactivés quand la sélection n'est
  pas un seul coureur — c'est déjà ce que font tous les autres boutons de cette barre ;
- **le registre sort de la barre** : `ledgerbox.innerHTML` au lieu de la fin de
  `tbar.innerHTML`, dans son propre conteneur placé à droite (§17 point 125) ;
- **la hauteur de la zone est posée** : `--h-acts-nat`, relevée de la barre, et non plus celle
  dont elle a besoin à cet instant.

`--h-acts-nat` se relève **registre fermé** seulement. En disposition empilée le registre ouvert
rétrécit la barre, qui se remet alors sur plus de lignes ; la relever là donnerait une hauteur
posée plus grande et l'ovale remonterait, c'est-à-dire exactement ce qu'il faut faire cesser.
C'est le resserrement qui absorbe ce rétrécissement — mesuré : 100 % puis **70 %**, sans
rognage.

La clé de relevé est `largeur | disposition | taille posée` : elle couvre la fenêtre, les
poignées, la bascule des deux dispositions et le réglage de zone. Le relevé se fait en
enveloppant `renderTimeline`, et par un `ResizeObserver` sur `.acts` (D15), plus un appel direct
après la bascule de disposition — sinon la zone garde un instant la hauteur de l'autre
disposition et la barre s'y fait rogner.

> **Dépassé en build 155** (§29) : la clé n'est plus que la largeur de la zone. Il n'y a plus
> de disposition à distinguer ni de taille posée, et le registre a sa propre colonne.

### Le registre à droite

Une colonne de plus dans la grille de la zone du bas, immédiatement à droite de la fenêtre
d'actions dans les deux dispositions. Fermé, le conteneur est vide, `:empty{display:none}`, et
la colonne vaut zéro : l'écran est au pixel près celui d'avant. Ouvert, la zone prend la classe
`hasledger` et les deux colonnes restantes passent à `1fr 1fr` — **le registre partage à parts
égales la place laissée par la fenêtre d'actions**. Sans cette borne il réclamait 343 px sur
359 et les propositions tombaient à **16,5 px** (mesuré, centre de 679 px).

Les écouteurs du registre suivent son conteneur : `onStripClick` et le `input` de la pipette
sont posés sur `#ledgerbox` comme ils l'étaient sur `#tbar`.

### CTRL + molette, et l'étiquette

Les cinq groupes de boutons sont retirés du HTML (§17 point 123). Un seul écouteur `wheel`,
**non passif** — sinon la page entière zoomerait par-dessus — sur le document : la touche tenue,
puis `e.target.closest('.oval,.tl,.right,.acts,.props')` dit quelle zone. La molette seule garde
son rôle, elle déroule la timeline et les propositions, et c'est pourquoi la touche est tenue.

`zlab(zone, appliquée, posée)` **crée l'étiquette quand la zone quitte 100 % et la retire quand
elle y revient** : rien dans le DOM le reste du temps. Elle affiche la taille **appliquée**, pas
celle demandée. Elle est posée hors des conteneurs que le moteur réécrit (D2), et elle est son
propre bouton : un clic ramène sa zone à 100 %.

Ce qui disparaît avec les boutons : les quatre infobulles françaises du réglage de l'ovale,
point 17 de `audit-ux.md`. Celle du filtre de Passings reste.

**Ce qui n'a pas changé** : `tct.layout` garde les mêmes clés, et le `+` muet de l'ovale à
100 % est devenu une molette muette — la limite de §22 tient, agrandir réellement l'ovale passe
par sa poignée, qui marche maintenant.

## 24. Le registre debout (build 151)

Demandé le 31 octobre 2026 après essai de la build 150, consigné mot pour mot dans
`regles-operateur.md` §17, points 126 à 128. Trois changements, tous dans le bloc `<style>` de
`timeline-prototype_mixed.html` sauf un, et **rien n'entre dans `styles.css`** : la carte
`.ledger` y garde exactement les règles qu'elle avait quand elle vivait dans la barre, parce
que les deux autres prototypes s'en servent encore.

### Debout

`#ledgerbox .ledger` passe en colonne, à la largeur de son contenu (`width:max-content`), et
ses `.lh` passent en colonne aussi. Le **✕ monte dans le coin** de la carte en absolu : il la
ferme, il n'est pas une ligne de plus à lire. Les deux compteurs prennent toute la largeur
(`justify-content:space-between`), donc les − et les + tombent au même endroit d'une ligne à
l'autre.

Conséquence sur la grille : la colonne du registre reprend `auto` et **la règle `.hasledger`
disparaît**, avec la classe que le moteur posait. `auto` et non `minmax(0,auto)` : un plancher
à zéro laisse la colonne s'écraser à 0 px dès que le centre manque de place, et le registre
s'ouvre alors sans rien montrer — la carte est dans le DOM, large de rien. Le partage à parts égales
n'existait que pour empêcher un registre couché de 343 px d'écraser les propositions ; un
registre de 137 px n'écrase rien.

### Sans la palette

La ligne « Colour » sort du gabarit. `PALETTE` et `setColor()` **restent dans le moteur**,
intacts, sans rien qui les atteigne à l'écran : la couleur revient en une ligne si l'opérateur
la redemande, et les écouteurs `[data-color]` / `[data-colorpick]` n'ont rien à recevoir en
attendant. La variable `r` du gabarit, qui ne servait qu'à la palette, est retirée avec elle.

### Sans le cadre

`#ledgerbox` perd `background`, `border`, `padding` et `border-radius` — il ne garde que
`min-width`, `overflow`, `align-self` et `max-height`, c'est-à-dire ce qui tient la place et
rien qui se voie. C'étaient **deux boîtes emboîtées**, chacune avec son trait, son fond et son
arrondi : la carte porte les siens depuis toujours, le conteneur a été habillé par erreur en
build 150.

## 25. Le registre reprend le style de la page (build 152)

Demandé le 31 octobre 2026, consigné mot pour mot dans `regles-operateur.md` §17 point 129.
Tout est dans le bloc `<style>` de `timeline-prototype_mixed.html`, et **rien dans
`styles.css`** : la carte `.ledger` y garde ses règles pour les deux autres prototypes.

### Pourquoi les boutons étaient deux fois plus petits

« Les actions présentent beaucoup de boutons tous très rapprochés les uns des autres, et alors
même qu'il y a beaucoup de place sur la page » (l'opérateur, 29 octobre 2026) a été appliqué à
`.tbar .grpb .btn` (`styles.css:197`). Les boutons du registre ne sont pas dans un `.grpb` :
ils n'ont jamais été touchés, et depuis que le registre a quitté la barre en build 150, plus
rien ne les atteignait. Les **trois mêmes déclarations** sont reprises pour
`#ledgerbox .ledger .btn`, pas d'autres, pour que les deux ne puissent plus diverger sans
qu'on le voie.

### L'alignement sans largeur écrite à la main

Chaque `.ctr` passe en `display:contents` : ses quatre éléments deviennent ceux de la grille de
la `.lh` au-dessus, et les deux lignes partagent donc **une seule grille**. La colonne du
libellé est la même pour les deux, dimensionnée par le plus long — aucun nombre à maintenir si
un libellé change. Le `<b>` du titre prend `grid-column:1 / -1` pour garder sa ligne entière.

**Mesuré** : le −, le chiffre et le + à **597 / 643 / 673** sur les deux lignes, contre
590/617/635 et 574/601/619 avant. Boutons du registre **36 × 33**, boutons de la fenêtre
d'actions **67 × 33** — même hauteur, même corps, même arrondi. Même fond `--panel` et même
trait `--line` des deux côtés.

## 26. Le registre à plusieurs coureurs (build 153)

Demandé le 31 octobre 2026, consigné mot pour mot dans `regles-operateur.md` §17 point 130.

### `S.ledger` n'appartient plus à un dossard

Il valait le dossard dont le registre était ouvert, et se remettait à `null` dès que la
sélection n'était plus un seul coureur. Il vaut maintenant **ouvert ou fermé** : `Laps…`
bascule (`data-ledger="1"`), le ✕ ferme (`data-ledger="0"`), et la seule remise à zéro
automatique est la sélection vidée. Le registre suit donc la sélection sans se refermer quand
elle change — c'est ce qui permet d'ajouter un coureur en le regardant.

### Une ligne par coureur, une seule grille

`.lgt` porte **sept colonnes** — pastille, puis − chiffre + pour les gagnés, idem pour les
perdus — et **toutes les lignes sont dans la même grille**, donc les colonnes sont communes.
**Mesuré** à seize coureurs : une seule abscisse pour les seize − de `gained` (583 px) et une
seule pour les seize + de `lost` (780 px).

Les deux mots `gained` et `lost` sont portés **une fois**, en en-tête de colonne, et non
répétés à chaque ligne : c'est ce qui permet à la carte de tenir à seize. L'identité du coureur
est sa **pastille colorée**, celle de la timeline, de l'ovale et de la carte du sprint — aucun
repère neuf n'est introduit.

Les attributs n'ont pas changé : chaque bouton porte `data-ladd` / `data-lsub` et son
`data-bib`, donc `onStripClick` agit déjà sur le bon coureur sans une ligne de plus.
**Vérifié** : le + de la deuxième ligne (BIB 3) ne touche que la deuxième ligne.

### Ce que cela coûte, et ce que cela ne coûte pas

Environ **40 px par coureur**. Au-delà de sept, la carte défile dans sa colonne : la règle du
29 octobre 2026 interdit le défilement à la **barre d'actions**, pas au registre. À seize
coureurs la carte fait 299 × 719 px dans une boîte de 314 × 352, et **l'ovale ne bouge pas** —
513 px, comme à un coureur et comme registre fermé.


## 27. Le coin déblayé, et la fenêtre d'actions qui remplit sa zone (build 154)

Demandés le 31 octobre 2026, consignés mot pour mot dans `regles-operateur.md` §17, points 131
à 133. Tout vit dans `timeline-prototype_mixed.html`.

### Trois objets à la même adresse

Le coin haut-droit de la barre portait trois objets **empilés**, pas rangés côte à côte.
Mesuré, barre de 290 px : `Clear` de 421 à 462, le sélecteur de disposition de 435 à 498,
l'étiquette de taille de 458 à 498. Le sélecteur porte `#layseg{position:absolute;top:9px;
right:10px}` dans `styles.css` depuis le 29 octobre ; l'étiquette de la build 150 a été posée à
`top:9px; right:10px` — **la même adresse, au pixel près**. Et le `margin-right` du `Clear`,
réduit de 62 à 44 px pour l'étiquette, ne dégageait plus le sélecteur.

Les deux partent (§17 point 131). Le `Clear` reste et n'a plus rien à dégager :
`margin-right:0`. Le sélecteur **ne va pas dans la barre du haut** : « le sélecteur est DANS la
zone qu'il commande, pas dans la barre du haut » (29 octobre 2026), et l'opérateur n'a pas dit
où le mettre. Les deux dispositions restent entières dans la feuille de style et dans
`setLayout()`, qui tolère maintenant l'absence de `#layseg` ; **la disposition empilée n'a donc
plus de commande**, et `lay-side` est la seule atteignable.

> **Suite en build 155** (§29) : il l'a dit le lendemain de la question — la disposition
> empilée part pour de bon, et `setLayout()` avec elle.

### La ligne de sélection

`tbar.innerHTML` ne compose plus que `bibList(bibs)` (§17 point 132). Sans sélection la ligne
est vide, le `Clear` désactivé. Le nom du groupe et l'effectif restent lisibles là où ils sont
déjà, sur l'en-tête du bloc dans la timeline. Le point 3 de `audit-ux.md` tombe par là : il n'y
a plus de texte à tronquer.

### La fenêtre remplit sa zone

`actsFit()` cherche maintenant la **plus grande** taille qui tient, et non plus seulement la
plus grande qui ne dépasse pas : il part de la taille courante et marche dans le sens qui
manque — d'un état stable cela coûte une mesure, et la boucle ne fait plusieurs pas que juste
après un coup de poignée (D15). Plancher et plafond restent `OVZ_MIN` et `OVZ_MAX`, 60 % et
180 %.

Le pas passe de 5 % à **1 %**, et c'est lui qui décide du vide restant : la barre se remet sur
un nombre entier de lignes, donc elle grandit par sauts. Mesuré sur une zone de 551 px : 68 px
de vide à 5 %, **0 px à 1 %**. C'est un pas d'ajustement, pas un seuil de l'opérateur.

**La zone porte le panneau**, et non plus la barre posée dedans :
`body.lay-side .below > .acts` prend le fond, la bordure et le rayon, `.acts > .tbar` les perd.
La fenêtre d'actions fait ainsi exactement la taille qu'on lui donne à la poignée ; sans cela
il restait un bord de panneau avec du fond nu en dessous, « perdu pour tout le monde ».

En disposition empilée rien ne change : `.acts` y a déjà la hauteur `--h-acts-nat`, donc la
barre la remplit par construction, et la poignée y donne sa place aux propositions. *(Cette
disposition est retirée en build 155 — §29.)*

### Ce que la barre d'actions perd

Elle sort de `ZCSS` / `ZV` et de la liste des zones de CTRL + molette : **sa taille ne se pose
plus**, elle se déduit de la place qu'on lui donne. `--z-acts` n'est plus écrite que par
`actsFit()`. Les quatre autres zones — ovale, timeline, carte du sprint, propositions — gardent
CTRL + molette et leur étiquette.

## 28. Les boutons qui tranchent répondent au relâchement (build 154)

Demandé le 31 octobre 2026, consigné mot pour mot dans `regles-operateur.md` §17 point 134.
C'est le **point 1 de `audit-ux.md`**, qui sort de la liste.

### Pourquoi un clic se perdait

`renderTimeline` réécrit `#tbar`, `#propcard` et `#ledgerbox` une fois par seconde pendant que
la course avance. Un `click` n'existe que si l'appui **et** le relâchement tombent sur le même
élément ; entre les deux, le bouton a été détruit et recréé, donc le navigateur n'émet rien et
l'appui est perdu. Sur le `+` d'un tour, cela vaut ±20 points. C'est `pitfalls.md` **D2**, payé
une deuxième fois.

### Le relâchement, mais pas nu

Les trois zones écoutent maintenant `pointerup` : la cible est résolue **au relâchement**, sur
le bouton qui est alors là. C'est ce que l'ovale, la timeline et la carte du sprint font déjà.

Un relâchement nu ferait trop : un coureur lâché depuis la timeline, ou une poignée relâchée
au-dessus des propositions, presseraient un bouton que personne n'a visé. La garde `pressed()`
exige donc que **l'appui ait commencé dans la même zone** — et c'est là qu'est l'astuce : la
zone survit à la reconstruction, c'est son contenu qui est refait. La garde compare des
**conteneurs**, là où `click` comparait des **boutons**. Elle rejette aussi le bouton droit et
le bouton grisé, que `click` écartait tout seul.

Un `pointerdown` en capture sur le document tient `pressZone` à jour ; il n'y a pas de
désinscription à gérer, et aucune zone n'a besoin de connaître les autres.

### Ce qui n'a pas changé

`tlbody` garde son `click` : il porte le glisser-déposer des coureurs, et rien ne l'a demandé.
`#scard` aussi — le point 1 ne le nomme pas. Les écouteurs `input` de la pipette restent en
l'état.


## 29. Une seule disposition sous l'ovale (build 155)

« Le sélecteur de disposition part pour de bon, retire les deux dispositions et garde seulement
côte à côte » (l'opérateur, 31 octobre 2026, `regles-operateur.md` §17 point 135). Il avait
offert le choix le 29 octobre ; il l'a repris deux jours plus tard, le lendemain du jour où la
commande avait quitté la barre d'actions (§27).

Ce qui disparaît :

- **`setLayout()`** et son appel. À sa place, une ligne : `document.body.classList.add(
  'lay-side')`. La classe reste **parce que `styles.css` s'en sert** — `.acts{flex-direction:
  column}`, `.props{grid-column:2}` — et cette feuille sert aussi aux deux autres prototypes,
  qui ne changent pas. Retirer la classe obligerait à la toucher.
- **Les cinq règles `body:not(.lay-side)`** du bloc `<style>` de la version mixte, et la règle
  de curseur `row-resize` de la poignée du bas.
- **`rzKey()`**, qui ne servait qu'à envoyer la poignée des actions sur `--h-props` en
  disposition empilée. Les deux appels prennent `h.dataset.rsz` directement.
- **L'entrée `props` de `RZ`**, et **`--h-props`** de `LAY` / `CSSVAR`. Une disposition
  enregistrée qui porterait encore cette clé est simplement ignorée au chargement.
- **La disposition dans la clé de `actsFit()`** : il ne reste que la largeur de la zone.

Ce qui ne change pas : le réglage de taille des propositions (`--z-props`) n'a rien à voir avec
la poignée `props` qui disparaît — l'un règle la taille du contenu à CTRL + molette, l'autre
réglait une hauteur en disposition empilée. Et les quatre poignées restent quatre : timeline,
colonne du sprint, ovale et actions.

**Mesuré après** (fenêtre 1900 × 1000, centre de 679 px) : fenêtre d'actions 349 px, ovale
516 px, vide 0. Poignée de l'ovale, zone portée à 501 px : la barre suit à 481 px, soit 125 %,
19 px de reste. Poignée des actions, colonne portée de 290 à 380 px : la barre perd un rang de
boutons, tombe à 308 px, et l'ovale gagne 41 px. Registre ouvert : 299 × 104 à droite de la
fenêtre, qui ne bouge pas. Simulation à ×16 jusqu'à 2:31.9, trois groupes formés :
**une seule taille relevée** sur 22, 516/349, et aucun vide.

---

## 30. `maquette-design-b.html` : les cinq points de design posés (31 octobre 2026)

**Ce fichier n'est pas du prototype.** C'est une **planche de propositions**, construite le
31 octobre 2026 sur sa demande d'attaquer les derniers points de design — les points **A, B, C,
E et F** de `audit-ux.md` section B, les seuls qui n'aient jamais reçu d'accord (le point D est
sorti de la liste en build 149). Elle ne modifie rien : le prototype reste à la build 155.

**Ce qu'elle contient.** Cinq sections, une par point. Chacune montre l'écran **tel qu'il est
aujourd'hui**, dans un cadre tireté, puis **une ou deux réponses posées**, chacune avec ce
qu'elle apporte et **ce qu'elle coûte**. Les deux points de catégorie B — E et F — rappellent
en tête le principe qu'ils contredisent, avec sa date et ses mots.

**Comment elle est faite.** Même convention que les autres maquettes : pas de `doctype`, le
`serve.js` l'enveloppe. Elle charge `styles.css` et montre les composants avec **leurs vraies
classes** — `.ifcols`, `.ifcol`, `.ifb`, `.srcrow`, `.startb`, `.chip`, `.lgtab`, `.pill` —
pour que ce soit la vraie taille et la vraie couleur qui se jugent, et non une imitation. Son
bloc `<style>` ne porte que la mise en page de la planche, le cadre de 446 × 92 px du panneau
de l'ovale, et la ligne `TO GO` (qui porte un `id` dans le prototype, pas une classe).

Le script en fin de fichier ne sert qu'à dessiner les trois jeux de couleurs du point B : les
pastilles, et un peloton de douze dossards à `r = 10`, la taille réelle sur l'ovale. Les
couleurs y sont écrites en dur, telles qu'elles sortiraient du code.

**Les chiffres qu'elle avance** — contrastes des gris, écarts ΔE entre couleurs de dossard —
sont dans `mesures.md` §31. Elle n'en invente aucun.

**Ce qu'il faut en faire.** Une réponse qu'il choisit entre dans `regles-operateur.md` §17,
mot pour mot, puis dans le code. Un point qu'il laisse où il est reste dans
`audit-ux.md`. Quand les cinq sont tranchés, la planche n'a plus d'objet et se retire.

**À savoir pour la relire** : un `node serve.js` lancé avant que le serveur ne sache servir le
CSS rend la planche — et le prototype — sans style, tout en blanc. Le `serve.js` du dépôt le
sait ; il suffit de relancer.

**Mise à jour du 31 octobre 2026, même jour.** Le point B de la planche a été **redessiné** :
il ne porte plus la roue calculée ni le remplacement des doublons — l'opérateur a écarté les
deux et en a demandé trois autres (`regles-operateur.md` §17 point 137). La planche montre
donc maintenant, à côté de l'état d'aujourd'hui, ses trois options : **tout en blanc**, **blanc
avec le NOC attaché**, et **la couleur du drapeau du pays**. Chacune est dessinée dans la
timeline avec le badge réel et sur l'ovale à `r = 10`, la taille réelle.

Deux choses que le dessin a révélées, et qui sont dites sur la planche :

- l'option 2 ne tient pas dans le dossard de l'ovale — trois lettres ne rentrent pas à 7 px, le
  NOC est donc écrit **sous** le dossard et double la hauteur de chaque coureur sur la piste ;
- l'option 3 **sépare moins bien qu'aujourd'hui** : la règle du drapeau donne cinq rouges au
  lieu de quatre, et `GER` et `BEL` exactement la même couleur. Les écarts sont dans
  `mesures.md` §31.

**Une question reste ouverte dans l'option 3** : un drapeau a deux ou trois couleurs, et
laquelle est « la » couleur du pays n'est écrit nulle part. Le dessin prend la dominante — le
rouge pour le Portugal, le vert pour l'Italie — et le dit à l'écran pour qu'il corrige.

Les cinq points de la planche sont **tranchés** depuis (`regles-operateur.md` §17, points 136 à
143) et codés aux builds 156 à 159 (§31 à §34). La planche n'a donc plus d'objet ; elle est
gardée dans `mockups/` comme témoin, et rien ne la lit.

---

## 31. Les dossards en blanc, et le NOC sur l'ovale (build 156)

Son option 2, essayée sur sa demande du 31 octobre 2026 (`regles-operateur.md` §17 points 137
et 142). **Quatre endroits dessinaient la couleur d'un coureur, et c'est tout** : `chip()`, la
case `LEADER` du panneau de l'ovale, et les deux lignes qui dessinent un dossard sur la piste —
celui qui roule et celui qui est hors piste.

Un seul jeton les remplace, `BIB_FILL = '#ECEAE4'`, et le texte du dossard passe au noir
partout. **`r.color` n'est pas retiré des données** : il reste dans `RIDERS`, dans `S.riders`,
et il est toujours chargé et enregistré avec la liste de départ. Il n'est simplement plus
dessiné. Comme plus rien ne le change depuis que la sélection des couleurs est sortie du
registre (build 151, point 127), revenir en arrière tient en remettant `x.r.color` aux quatre
endroits.

**Le NOC est attaché au dossard sur l'ovale, et nulle part ailleurs.** `nocText(cx, cy, nat)`
écrit les trois lettres sous le dossard, à `DOT_R + 9` ; le texte est cerné de noir avant
d'être rempli (`paint-order="stroke"`), parce qu'il tombe tantôt sur le gris de la piste,
tantôt sur le marron du ruban. **La timeline, elle, ne change que de couleur** : « dans la
timeline tout reste comme précédemment sauf les couleurs ». Sa colonne de drapeaux et sa
colonne de NOC existaient déjà et n'ont pas bougé.

**Le défaut que le dessin produit, et qui n'est pas corrigé** : dans un peloton groupé, **13
étiquettes NOC sur 16 tombent sur le dossard d'un autre coureur**. Les trois files de coureurs
sont espacées de 19 unités, les dossards en font 20 de diamètre, et il reste 9 unités pour une
étiquette qui en fait 10,4. Les chiffres sont dans `mesures.md` §32. **Rien n'a été inventé
pour le contourner** : il attend sa décision.

---

## 32. Le badge s'en va, le numéro reste (build 157)

Sa demande du 31 octobre 2026 (`regles-operateur.md` §17 point 143), venue en regardant une
ligne de timeline : le carré blanc autour du dossard part, le chiffre reste.

**Ce qui change, en trois règles de `styles.css` et une ligne de script.** `.chip` perd son
fond, ses coins et son ombre portée, et prend `--fg` ; `chip()` n'écrit plus de fond en ligne ;
la case `LEADER` du panneau de l'ovale perd le sien aussi. **La boîte garde sa largeur et sa
hauteur** — c'est elle qui aligne les colonnes d'un bout à l'autre de l'écran, et la vérifier
l'a confirmé : le numéro, le drapeau et le NOC restent centrés sur la même ligne.

**Ce que le carré portait, et qui n'a pas été perdu.** Son cadre tireté disait trois choses, et
elles passent sur le numéro dans les mêmes couleurs — mesuré dans la page, sur une sonde posée
hors de la course :

| État | Avant | Maintenant |
|---|---|---|
| transpondeur muet (`silent`) | cadre tireté orange | **numéro orange** `#F2A33A` |
| pas de transpondeur (`notp`) | cadre tireté bleu | **numéro bleu** `#8FB4FF` |
| hors piste (`off`) | cadre tireté rouge, 75 % | **numéro rouge** `#FF5C5C`, 75 % |

C'est le seul point de cette build qu'il n'a pas énoncé : il a demandé le retrait du carré, pas
le sort de ce que le carré portait. Effacer les trois états sans rien dire aurait été pire.

**Le dossard rond de l'ovale ne bouge pas.** Ce n'est pas un badge : c'est la place du coureur
sur la piste, et son cercle blanc porte le numéro plus le NOC de la build 156. `BIB_FILL` ne
sert donc plus qu'à lui.

**Une marque reste encadrée, et c'est voulu** : la place vide de la carte de sprint, le `·`
dans son cadre tireté. Elle ne désigne aucun coureur — elle dit qu'une place n'est pas prise.

---

## 33. Le drapeau change de colonne, et la start list se resserre (build 158)

Ses deux demandes du 31 octobre 2026 (`regles-operateur.md` §17 points 144 et 145).

**Le drapeau passe de l'ordre à la start list.** Dans l'ordre, les sept colonnes que la build
149 avait faites pour le loger redeviennent les **six d'origine** : la surcharge
`#scard .sleft .shd,#scard .sleft .srow` est retirée, et la règle de `styles.css` reprend la
main. Le NOC y **retrouve ses 38 px**, qu'il avait cédés au drapeau — mesuré après coup :
`22px 32px 38px 22,4px 22px 22px`.

Dans la start list, la grille passe de deux colonnes à trois, `32px 22px minmax(0,1fr)`, et
l'en-tête `.shd.sl` suit — sans quoi `BIB` et `NOC` ne sont plus au-dessus de leur colonne.

**La colonne de la start list s'élargit de 78 à 105 px, et la carte ne bouge pas.** Le drapeau
emporte sa largeur d'une colonne à l'autre : 22 px et son écart de 5, soit les 27 px que
l'ordre vient de rendre. La carte reste à 500 px, vérifié : elle ne déborde pas.

**Les lignes de la start list sont à 28 px fixes.** Elles étaient en `flex:1 1 26px` entre 26 et
34 px, donc elles s'étiraient pour remplir la colonne et se tassaient quand la liste
s'allongeait. Elles sont maintenant `flex:0 0 28px` avec `box-sizing:border-box`, pour que le
filet du haut tienne **dans** les 28 px : sans cela le pas aurait fait 29, et le pas est ce
qu'il a demandé d'aligner. Mesuré dans la page sur la simulation menée à l'arrivée :
**pas de 28 px dans la start list, pas de 28 px dans la timeline.**

**Ce que cela coûte, et qu'il verra** : la start list ne remplit plus sa colonne. À seize
coureurs il reste du vide sous la dernière ligne, là où les lignes s'étiraient pour le prendre.
C'est la contrepartie directe d'un pas fixe, et c'est le pas qu'il a demandé.

---

## 34. Les trois points de design tranchés entrent dans le code (build 159)

Ses points 136, 138, 139 et 140 de `regles-operateur.md` §17, codés ensemble sur sa demande
— « Attaque ça ! ». Les chiffres sont dans `mesures.md` §33.

### La proposition qui attend passe en orange

La carte `.gq` porte `hot`, et une règle lui donne l'ambre `--warn` que le champ du prochain
sprint portait déjà : **aucun signal nouveau n'est inventé**. Tout ce qui est écrit dessus passe
au brun foncé, les numéros de dossard compris — ils sont blancs depuis la build 157, et blanc
sur ambre ne se lit pas.

L'autre moitié est dans `syncInfield` : `IF.next` garde `acc` mais perd `hot` tant qu'une
proposition de tour attend, par `lapProposalWaiting()`. Cette fonction compte la mise en
sommeil comme partout ailleurs — une proposition endormie n'est pas affichée, donc elle
n'allume rien.

**Ce que le code ne fait pas** : seules les propositions de **tour** s'allument. Les autres
(`alone`, `back`, `missing`, `spd`, `tape`…) gardent leur ligne bleue. C'est la carte qu'il a
vue et choisie, et allumer les sept en même temps aurait défait le foyer unique.

### Les gris et les capitales

Un seul jeton change, `--dim`, et les treize règles qui le portent suivent. L'indice d'onglet
quitte `.lbl` pour une classe à lui, `.loghint`, sans capitales : c'est une phrase, et une
phrase en capitales se lit lettre par lettre. **Les en-têtes de colonne gardent les leurs.**

### Le panneau de l'ovale, et la barre du haut

Le panneau garde cinq champs sur deux lignes : l'horloge et `LAP` à gauche, `TO GO` et `LEADER`
au milieu, le prochain sprint à droite sur toute la hauteur — c'est le seul des cinq qui doit
s'attraper du coin de l'œil. Le `foreignObject` passe de 92 à 64 px et descend de 14, pour que
son milieu ne bouge pas. **`PANELS`, qui écarte les badges de groupe, lit ces attributs dans le
DOM** : l'évitement suit tout seul, sans rien à changer.

Partent dans `#barctl`, dans la barre du haut : `ARM START`, `ARM FINISH`, et la paire
`AUTO` / `LAP COUNTER` avec ses boutons de choix, son bascule `M` et ses pas `− / +`. **Les
mêmes éléments, les mêmes identifiants.** La paire s'empile sur deux lignes de 15 px, parce que
la barre fait 36 px et que chaque ligne en faisait 22 dans le panneau.

**Le piège, et comment il est évité** : le gestionnaire de ces commandes était posé sur
`#infield`. Déplacées, elles en sortaient et ne répondaient plus à rien. Il est donc **nommé**,
`onRaceControl`, et posé sur `#infield` — pour `TO GO`, qui reste dans l'ovale — et sur
`#barctl`. La double confirmation du faux départ n'est pas touchée : elle est dans
`startClick`, que le gestionnaire appelle.

**Ce qui cède quand la barre est pleine** : le groupe ne se resserre jamais ; c'est le
sous-titre, qui a déjà ses points de suspension, qui s'efface. Avec le simulateur ouvert, le
titre et le sous-titre disparaissent — ils disparaissaient déjà avant cette build, à cette
largeur.

---

## 35. Sa refonte de la page — **commencée, build 160**

Sa maquette du 31 octobre 2026 (`regles-operateur.md` §17 points 148 et 149). **Ce qui est fait
à ce jour, et ce qui ne l'est pas**, pour qu'on reprenne sans deviner.

### Fait

- **La timeline court du haut en bas de l'écran.** `.app` est devenu une rangée : la colonne de
  la timeline et sa poignée d'un côté, une colonne `.work` de l'autre, qui porte la barre puis
  la scène `.stage` — l'ovale, sa poignée et la colonne de sprint. Deux sélecteurs ont suivi le
  déménagement, `.main > .right` devenu `.stage > .right`, et la poignée de droite avec.
- **Les six onglets sont dans la barre**, et la deuxième ligne a disparu. Le journal s'ouvrait
  sous la barre d'onglets ; il s'ouvre maintenant sous la barre elle-même (`placeLog`).
- **Le titre, le sous-titre, `Race leader` et `Auto` ont quitté la barre.** Le bouton `Auto`
  reste dans le document avec son écouteur, caché par `.gone`, comme `Race log` avant lui : le
  retirer casserait `$('#leaderauto')`.
- **Le sous-titre est descendu dans l'ovale**, en noir, dans `#ovtitle`, et il porte les tours,
  les sprints et la longueur de piste — « Men's Points Race - 40 laps - 4 sprints - 250m ».
  `syncSub` l'écrit là au lieu de `#subtitle`, qui n'existe plus.
- **Le numéro de build est seul**, à droite : `160`.
- **Les deux bandes « new group » sont visables** : 28 px de haut, la hauteur d'une ligne de
  coureur, et 9 px séparent celle du haut du premier bloc (point 150, `mesures.md` §34).

### Ce qui restait, et qui est fait au build 163

Les quatre points qui manquaient — les boîtes blanches et leur disposition, le drapeau et le NOC
dans `LEADER`, l'horloge à deux formats, les boutons renommés — sont livrés. Le détail est au
§38.

## 36. Le groupe posé à la main (build 161)

Sa règle est au point 153 de `regles-operateur.md`, ses mesures dans `mesures.md` §35.

- **Le geste** — `tlbody` `pointerdown` : si l'appui ne tombe pas sur une `.trow`, il regarde
  l'en-tête `.gh` et attrape le `.tgrp` entier (`pd.gi`). Un groupe d'incident ne se prend pas.
  L'étiquette qui suit le curseur porte alors le nom du groupe. Au relâchement, un groupe ne
  répond qu'à une bande `.tgap` : lâché sur un autre groupe, rien ne se passe.
- **La pose** — `placeByHand(gi, band)`. Elle ne retient pas des mètres mais les **deux voisins**
  du groupe au moment du dépôt, `{above, below}`, nommés par `handKey` : `'g' + id` pour un
  groupe de l'opérateur, `'b' + dossard de tête` pour un bloc mesuré. Un bloc mesuré devient à
  cette occasion un groupe de l'opérateur (`newGroup(bibs, 'manual')`) — c'est la seule manière
  qu'il a de porter quoi que ce soit, un bloc mesuré se refaisant à chaque image.
- **Le rangement** — dans `computeGroups`, juste après `groups.sort(...)` : chaque groupe qui
  porte `op.hand` est retiré puis réinséré contre celui de ses deux voisins qui est encore là.
  Si aucun des deux n'y est, la mesure reprend la place **pour cette image-là** et l'étiquette ne
  tombe pas : le groupe retrouve sa place dès qu'un voisin revient.
- **Ce qu'on voit** — `by hand`, une `.pill.warn.hand` dans l'en-tête, au fond sombre pour rester
  lisible sur n'importe quelle couleur de groupe ; l'écart mesuré reste affiché à côté. En haut
  de la colonne, `.tmode` compte les groupes posés et porte `Back to automatic`
  (`backToAutomatic`, `data-autogroups`), qui efface les `hand` sans dissoudre les groupes.
- **Undo** — `placeByHand` et `backToAutomatic` passent par `pushUndo` et par `groupRev`, comme
  les autres actions de groupe. `hand` est toujours **remplacé**, jamais modifié en place, pour
  que la copie de surface de `snapshot()` reste juste.

**Ce que la pose coûte, et qu'il faut savoir** : poser un bloc mesuré le transforme en groupe de
l'opérateur. Un groupe de l'opérateur n'absorbe plus les coureurs rattrapés tout seul — le merge
automatique du §3 ne s'y applique pas. C'est déjà vrai de tout groupe créé à la main depuis le
début du prototype ; le geste nouveau le rend seulement plus facile à déclencher, y compris sur
le peloton. **Rien n'a été inventé pour l'empêcher** : la question lui est posée.

## 37. Le leader et la première position, une seule décision (build 162)

Sa règle est au point 158 de `regles-operateur.md`, son accord au point 160, les mesures dans
`mesures.md` §38. Les deux sens passent par le mécanisme du §36, celui qu'il a approuvé : le
groupe est **posé à la main**, il porte son étiquette, et `Back to automatic` le rend à la
mesure.

- **Du leader vers la timeline** — `designateLeader` appelle `leadFirst(bib)` quand, et
  seulement quand, `byOperator` est vrai : les trois boutons de la piste et le bouton `Leader`
  d'un coureur sélectionné. `leadFirst` cherche le bloc du coureur dans `lastG.groups` et, s'il
  n'est pas déjà en tête, appelle `placeByHand(gi, 0)`.
- **De la timeline vers le leader** — `placeByHand` désigne `g.bibs[0]`, le coureur de tête du
  bloc, dès que le bloc est posé en **première** position (`above` nul).
- **La reprise automatique ne pose rien** : `byOperator` vaut `!/passed/.test(how)`, et la
  reprise s'annonce « passed BIB n on the track ». C'est sa règle du point 159 — « l'appli doit
  continuer à refléter ce qu'elle voit ».
- **Un bloc posé à la main gèle le leader (point 171, build 205)** : dans `computeGroups`, avant la
  boucle de reprise, `frozen = S.groups.some(g => g.hand && g.bibs.includes(leaderR.bib))`. Tant que
  le bloc qui **porte le leader** est posé à la main, la reprise « passed on the track » ne tourne
  pas ; le test porte sur le bloc du leader, un autre bloc rangé à la main ne gèle rien. Hors forçage
  elle tient toujours (point 159). Le `prevRel` reste tenu à jour même gelé, pour qu'aucune reprise
  ne saute au dégel sur une valeur périmée.
- **Le drapeau `leadLinking`** empêche les deux sens de se rappeler l'un l'autre. Il est
  nécessaire, pas défensif : le coureur qu'il désigne n'est pas forcément le coureur de tête de
  son groupe, et le second appel lui reprendrait son choix pour le donner à un autre.
- **`placeByHand` lit `lastG.groups`**, l'ordre **affiché**, celui auquel renvoient les
  `data-gi` et `data-newgroup` des bandes — et non `groupsNow()`, qui recalculerait tout et
  ferait avancer deux fois le détecteur de dépassement (H11).

**Les tours à faire suivent sans rien ajouter** : `dispLap()` comptait déjà sur `S.leader`.

## 38. Le panneau de l'ovale, sur son croquis (build 163)

Son croquis du 1er novembre 2026 et ses mots sont aux points 148, 149 et 161 de
`regles-operateur.md`.

- **La disposition** — `#ifpanel` passe de 64 à **76 px** de haut et remonte de 5 px, à `y=258`,
  pour garder son milieu. Trois colonnes : l'horloge puis `LEADER` ; `LAP` puis `TO GO` ; le
  prochain sprint seul, sur les deux hauteurs. Les deux lignes font 34 px, `TO GO` comprise —
  elle faisait 38 et dépassait.
- **Les boîtes** — `#ifpanel .ifb` passe en **blanc à texte noir**, étiquettes en gris foncé.
  `TO GO` garde son vert, c'est le seul champ coloré ; le sprint garde son ambre à deux tours,
  qui est sa règle du 29 octobre 2026.
- **`LEADER` porte trois choses** — le dossard, le drapeau et le NOC : `#ifleadflag` reçoit
  `flag(lead.nat)` et `#ifleadnoc` le code pays.
- **Le prochain sprint s'écrit sur deux lignes** — `SPRINT 1` puis `5 LAPS`, dans une `.ifline`
  posée au-dessus de l'unité ; le tiret de « - 5 LAPS » est tombé avec elle.
- **L'horloge a sa propre fonction**, `fmtClock(s, stopped)` : deux chiffres de minutes
  toujours, **une** décimale en marche, **deux** à l'arrêt. `fmtT` ne bouge pas — c'est elle qui
  écrit les heures du journal, et il n'a rien demandé là-dessus.
- **Les deux boutons** portent `SET` / `LEADER` sur deux lignes, à la place exacte qu'ils
  occupaient (point 149) ; le libellé de retour `BIB n` est inchangé.

**Et le mot de l'étiquette change partout** : `by hand` devient `manual`, la bande du haut dit
`1 manual group` / `2 manual groups`, et le journal écrit `Placed manually`. Les noms internes
(`placeByHand`, `op.hand`, `.pill.hand`) ne changent pas : ils ne se lisent pas à l'écran.

## 39. L'écart d'un groupe se mesure depuis le groupe précédent (build 164)

Sa règle est aux points 164 et 165 de `regles-operateur.md`, les mesures dans `mesures.md` §41.

- **Où** — dans `computeGroups`, juste après le rangement à la main, une passe sur les blocs non
  incident dans l'ordre affiché. Le premier reçoit `g.gap = null`, les autres
  `g.gap = g.head − précédent.head`, de tête à tête.
- **Aucun écart n'est négatif.** Quand l'ordre forcé contredit la mesure, la soustraction sort
  négative ; on lui ajoute alors autant de tours qu'il faut : `d += TRACK * Math.ceil(-d / TRACK)`.
  31 m devant devient 219 m derrière, qui est son chiffre.
- **L'addition se fait sur la distance de course**, pas sur la position sur la piste : un bloc
  qui a réellement un tour de retard garde ses 250 m et quelques au lieu de retomber à zéro.
- **L'en-tête** affiche `leader` pour le premier bloc et `219 m` pour les suivants. Le signe
  `−`, qui disait « en arrière », est tombé avec le `+` : plus rien n'est devant, le signe ne
  distinguait plus rien.

**Ce que cela ne touche pas** : `x.dS`, qui sert à l'éligibilité, mesurait déjà en arrière du
groupe de tête autour de la piste. Les deux calculs disent maintenant la même chose.

**Corrigé au build 165** : l'écart du §39 se mesure `g.head − précédent.tail`, de la queue du
bloc au-dessus à la tête du bloc en dessous (point 167), et non plus de tête à tête. La même
ligne donne ses deux chiffres : **2 m** pour le bloc du 12 et du 52 sous le peloton, et
**217 m** pour le peloton une fois ce bloc posé en tête.

## 40. L'ordre de la course se lit dans la timeline (build 166)

Sa règle est au point 170 de `regles-operateur.md`, la mesure au §46 de `mesures.md`.

- **`S.tlRank`** — construit à la fin de `computeGroups`, après le rangement à la main : le rang
  de chaque dossard dans la colonne, blocs dans l'ordre affiché et coureurs dans l'ordre du
  bloc. C'est la seule source d'ordre pour les vues qui montrent la course.
- **L'onglet Crossings** trie chaque tour sur `S.tlRank`, l'heure de passage ne servant plus que
  de départage pour un coureur absent de la timeline (retiré, hors piste).
- **Sans forçage, rien ne change** : les blocs sont alors rangés par la mesure, et le rang de la
  timeline coïncide avec l'ordre des passages.

**Ce qui ne suit pas encore** : l'ordre **jugé** d'un sprint, qui vient toujours des boucles.
Son point 168 veut le coureur en tête de la timeline. En attente du point 169, dont il dépend.

## 41. La cassure se mesure en temps, d'un coureur à celui qui le suit (build 167)

**Sa demande, le 1er novembre 2026** : « Nous n'avons pas besoin de faire un calcul spécial afin
de connaitre le nombre de mètres séparant les coureurs et les groupes. Ce qui nous intéresse, ce
sont les écarts en temps entre les coureurs. Et entre les groupes. »

**Ce qui est codé.** `computeGroups` ne convertit plus la seconde en mètres. Elle applique la
reformulation de son §1, **z − (x + y)** :

- **z** est lu sur les boucles : la différence des deux temps de passage **sur une même boucle**.
  Chaque coureur garde son dernier temps de passage par boucle dans `r.lastAt[li]`, écrit au
  moment de la lecture, à côté de `r.rec`. La boucle retenue pour une paire est **celle que le
  coureur qui suit a franchie en dernier**, à condition que le coureur de devant y soit passé
  avant lui — sinon c'est qu'il a déjà repassé, et la boucle est écartée.
- **x + y** est le temps que met **le coureur qui suit** à couvrir une longueur de vélo,
  `BIKE_L / spd`, « puisque c'est sa roue avant qui doit couvrir l'écart » (§1).
- Au-dessus de `GROUP_GAP_S` (1,000 s), cassure. Le délai de confirmation de 0,3 s ne change pas.

L'écart se prend à chaque fois d'un coureur à celui qui le suit, puis du suivant au suivant,
jusqu'au dernier : `pairGap(x, back, …)` dans la marche le long de la piste, et la même fonction
pour la paire qui enjambe la ligne d'arrivée.

**Le repli.** Tant qu'aucune boucle n'a vu les deux coureurs — un coureur sans transpondeur, un
coureur qui vient d'entrer en course — la même formule se calcule sur les positions. Son §1 le
dit : « ce n'est pas une seconde méthode indépendante : c'est le même calcul écrit autrement ».

Les mesures sont au `mesures.md`, « La cassure lue sur les boucles ».

## 42. L'écart d'un groupe s'affiche en temps (build 168)

**Sa demande, le 1er novembre 2026** : « oui il faut remplacer l'écart en mètres par l'écart en
temps dans les en-tête des groupes ».

C'est la **même mesure que la cassure**, sur la **même paire** : la queue du bloc du dessus et
la tête du bloc du dessous — les deux coureurs qui se suivent, son point 167 — passées à
`pairGap`, donc z − (x + y) lu sur les boucles. L'en-tête affiche une seconde avec une décimale,
`3.9 s`, là où il affichait `74 m`. Le premier bloc affiche toujours `leader`.

Les mètres restent calculés dans `g.gapM` : ils portent la correction du tour quand l'opérateur
a forcé un bloc en tête — un bloc qui paraît 31 m devant est 219 m derrière — et ils servent de
repli tant qu'aucune boucle n'a vu les deux coureurs.

## 43. Les courses de test montent par paliers (build 168)

L'ancienne simulation — 40 tours, le 4 et le 11 perdant un tour au tour 4, le 12 en
prenant un au tour 5 — est **sortie du dépôt**. L'opérateur, le 1er novembre 2026 : « Ce
scénario est le scénario le plus ridicule qui soit ! Il n'a aucun sens sportif, technologique,
ou conceptuel. »

À sa place, `CALM_RACE`, déposée dans la liste à la première ouverture comme l'était l'autre :

- **Palier 1 — peloton groupé, aucun tour pris ni perdu.** 250 m, **60 tours**, **6 sprints**,
  seize coureurs, aucun ordre rejoué. La distance est celle du règlement UCI 3.2.117 pour une
  qualification Hommes Élite sur 250 m, et les sprints tombent tous les 10 tours (3.2.116).

Les paliers suivants s'ajouteront à cette liste, du plus calme au plus animé, « avec comme
objectif de valider l'efficacité de notre système à chaque pallier de difficulté affronté ».

## 44. Le palier 2, et les fluctuations de vitesse (build 169)

**Sa description, le 1er novembre 2026**, reprise mot pour mot dans le code à côté de la course :
départ à 13,5 m/s pour tous, fluctuations aléatoires de 0,1 à 0,3 m/s par coureur à partir du
tour 2, deux coureurs à +1,0 m/s au tour 5, trois à +1,4 m/s au tour 11, deux à −0,9 m/s au
tour 12, « pas d'autres inputs ».

**Les attaques et les lâchés sont des `acts` ordinaires**, du genre `spd` qui existait déjà :
`{ t, lap, kind: 'spd', bibs, v }`, rejoués sur l'horloge par `replayTick`. Les dossards ne sont
pas de lui : il a dit combien de coureurs, pas lesquels. Ce sont le 12 et le 52 au tour 5, le 7,
le 18 et le 61 au tour 11, le 46 et le 70 au tour 12.

**Les fluctuations appartiennent à la course, pas au moteur.** La course chargée porte un champ
`wobble: { fromLap, min, max, every }` que `loadRace` met dans `S.wobble` ; `step()` ne l'ajoute
que s'il est là, donc une course sans `wobble` roule exactement comme avant — « no invented
wobble », la règle posée au build 74 tient. `wobbleOf()` tire la différence de vitesse d'un
coureur par tranche de `every` secondes, **de façon déterminée par le dossard et le numéro de
tranche** : la même simulation rejoue toujours la même course, ce qui permet de comparer deux
builds. La tranche de 5 s est un choix, pas une mesure.

Le correcteur qui tient un coureur à sa place dans le peloton rattrape cette différence, donc
une fluctuation de 0,3 m/s déplace le coureur de quelques mètres dans la timeline sans casser le
groupe : il faut plus d'une seconde, soit une quinzaine de mètres, pour une cassure.

## 45. La trace : ce que l'application a vu, et à quel instant (build 171)

**Sa demande, le 1er novembre 2026** : « tu vas commencer par implémenter un système qui
surveille l'appli et crée des logs. Suite à quoi on pourra mettre le doigt sur le problème plus
facilement ».

**Elle note les changements, pas les états.** Les défauts qu'il a relevés sont des
basculements — une timeline qui s'inverse, un écart qui saute, des points qui reculent. Un
instantané ne les montre pas, deux instantanés consécutifs si. `traceTick(G)` est appelée par
`detectNow()`, donc à chaque pas fixe de la course, et compare l'image à la précédente.

Sept sortes de lignes :

| Sorte | Écrite quand |
|---|---|
| `LEADER` | le coureur de tête change — `avant`, `apres` |
| `TIMELINE` | la composition ou l'ordre des blocs change ; la ligne porte les blocs, leurs coureurs et leurs écarts |
| `ECART` | l'écart d'un bloc bouge d'au moins **1 s** depuis la dernière valeur notée — `avant`, `apres`, `saut` |
| `PROPOSITION` | une proposition apparaît ou disparaît — sa clé, son genre, ses coureurs, son delta |
| `SPRINT` | un sprint s'ouvre ou se ferme |
| `ORDRE` | l'ordre jugé d'un sprint change — `avant`, `apres` |
| `POINTS` | les points d'un coureur changent ; le drapeau `recule` est mis quand un total **baisse** |
| `RESET` | la course repart : `S.t` a reculé, la trace recommence |

`ORDRE` et `POINTS` ne se regardent **qu'au passage du tour** : `standings()` et `spOrder()`
refont tout le calcul, et les appeler vingt fois par seconde ne dirait rien de plus.

**Elle ne touche à rien.** Le journal `S.log` reste ce qu'il est — les faits et les décisions,
pour l'opérateur, 120 lignes au plus. La trace est pour le diagnostic : elle garde tout, jusqu'à
40 000 lignes, et sort par le bouton **Export trace** de l'onglet Standings, à côté des deux
autres exports. `window.__proto.trace()` la rend aussi lisible sans passer par le fichier.

## 46. Les logs du code : pourquoi une décision a été prise (build 172)

**Sa demande, le 1er novembre 2026** : « mais bon ta TRACE, ce ne sont pas des logs ? Il faut
les logs du code pour comprendre ».

La trace du §45 dit **ce qui** a changé à l'écran. Ces logs-ci disent **pourquoi** le code l'a
décidé : chaque ligne porte les **valeurs d'entrée** de la décision, pas son résultat. Et chaque
ligne n'est écrite que lorsque la décision **change** — `dbgChanged(clé, valeur)` garde la
dernière valeur écrite par clé, sans quoi un log répété vingt fois par seconde ne se lit pas.

Six points de décision sont instrumentés, là où ils sont pris :

| Tag | Où | Ce que la ligne porte |
|---|---|---|
| `CASSURE` | `pairCass()`, dans la marche le long de la piste | les deux dossards, **z**, sa source (boucle ou positions), les mètres, la vitesse du suiveur, le temps d'une longueur de vélo, l'écart obtenu, le seuil, et la décision |
| `TOUR` | `impliedOf()` | le dossard, le nombre de tours retranchés, sa position brute, celle du paquet, et s'il est dans le paquet |
| `LEADER` | après le choix du leader | le dossard, **la source** — `désigné` ou `mesure` —, les trois meilleurs `np()` et l'avance du premier sur le second |
| `ECART-NEGATIF` | la boucle des écarts | le bloc, celui du dessus, les mètres lus, et les deux coureurs de la paire avec la boucle où chacun a été lu |
| `PROPOSITION-REFUS` | `detect()` | le dossard, le coureur le plus proche de lui dans le paquet, le reste après les tours entiers, et la marge |
| `PROPOSITION-JOINT` | `detect()` | les dossards qui arrivent, ceux de la proposition déjà ouverte, et le nombre de tours |
| `PROPOSITION-CALCUL` | `detect()` | le dossard, sa distance de course, celle du coureur de sa paire, leur différence en mètres, **le quotient avant arrondi**, le delta retenu |
| `PAQUET` | `detect()` | un coureur entre dans le paquet ou en sort |

`DBG.on` est vrai par défaut, la liste est bornée à 200 000 lignes, et elle repart avec la
course. Les logs sortent par le **même bouton Export trace** que la trace : le fichier porte
`trace` et `logsDuCode` côte à côte. `window.__proto.dbg()` les rend lisibles sans le fichier.

## 47. Le coureur qui le suit sur la piste (build 174)

C'est **la mesure** d'un ±20. Ses mots au point 167 : « **l'écart se mesure entre le dernier du
groupe des leaders et le premier du groupe du peloton. Concrètement entre le n° 52 et le n°15** ».
Le dernier d'un groupe et le premier du suivant : **deux coureurs qui se suivent**, l'un derrière
l'autre sur la piste, à quelques mètres.

(La formule « les deux coureurs qui se font face », qui traînait dans ces documents et dans le
code, n'était pas de lui : je l'avais écrite moi-même. Il l'a relevée le 1er novembre 2026 :
« **se faire face ça signifie une chose différente** ». Elle est retirée partout.)

Jusqu'à la build 173, `facingPos()` prenait le **voisin dans la timeline du paquet** : on partait de
l'index du coureur dans `S.bunchSeq` et on s'écartait d'un cran à gauche, d'un cran à droite,
jusqu'à tomber sur un coureur déjà dans le paquet à l'image précédente. Or la timeline du paquet n'est
pas une timeline serrée : au palier 2, les seize coureurs s'étirent jusqu'à **218,9 m** de long. Le
voisin dans la timeline pouvait donc être à un demi-tour de distance, et c'est contre lui qu'on comptait les
tours.

`pairOf()` le remplace et choisit le coureur du paquet **le plus proche sur la piste** : pour
chacun, on retire de l'écart de distance de course le nombre entier de tours, et ce qui reste est
leur distance l'un de l'autre sur la piste. Le plus petit reste gagne.

Et ce reste doit tenir dans une marge, sans quoi **rien n'est proposé** : un coureur entre dans le
paquet parce que son écart de temps est tombé sous la **seconde du §1**, donc à sa vitesse il est à
`GROUP_GAP_S × sa vitesse` du coureur devant lui, plus une **longueur de vélo** (§1 encore). Les
deux seules longueurs qui entrent dans ce calcul sont les siennes. À 13,5 m/s cela fait 15,2 m.

Le refus s'écrit : `PROPOSITION-REFUS` porte le dossard, celui du coureur le plus proche, le reste
et la marge. Et `PROPOSITION-CALCUL` porte désormais `voisinBib`, `voisinPos`, `reste`, `marge` et `seSuivent`
à côté du quotient.

**Deux autres changements de la même build, dont la mesure dit qu'ils ne suffisent pas** — les
chiffres sont dans `docs/mesures.md`, « Build 174 » :

- `impliedOf()` ne recalcule plus le tour retranché à chaque image. Prendre le tour du paquet est
  un **événement** (§2, « au moment où »), mesuré une fois et gardé dans `S.took` tant que le
  coureur est dans le paquet. Et le repère du paquet, `bunchFront`, ne peut plus être un coureur
  qui tient déjà un tour retranché : il est par construction à un tour du tour du paquet.
- La tête ne passe plus d'un coureur à l'autre pour **moins d'une longueur de vélo** :
  `S.lastLeadBib` garde le coureur en tête, et la mesure ne le détrône qu'au-delà de `BIKE_L`.

## 48. L'ordre est relevé aux boucles, il ne se calcule pas (build 178)

**Sa règle, le 1er novembre 2026** (point 177) : « La seule façon certaine de savoir l'ordre de
passage des coureurs, c'est les détections des boucles. A chaque tour. 3 boucle par tour. »

Jusqu'à la build 176, l'ordre de la timeline venait de `np()` — la position **interpolée** entre
deux détections. Entre deux passages l'appli n'a plus de mesure : elle calcule où les coureurs
devraient être, et c'est ce calcul qui classait les coureurs. D'où une tête qui changeait 67 fois,
dont 65 pour 3 m ou moins.

**Deux grandeurs, deux usages, qu'il ne faut plus confondre :**

| | d'où elle vient | à quoi elle sert |
|---|---|---|
| `np(r)` | la position interpolée, moins les tours retranchés | les **distances** : la découpe des blocs, les mètres d'un écart |
| `ndOf(r)` | `r.rec.d`, la distance que la **dernière détection** a donnée, moins les tours retranchés | l'**ordre** : la timeline, l'intérieur d'un bloc, le rang des blocs, la tête |

`r.rec.d` vaut `ka × 250 + la boucle franchie`. Elle ne change qu'au passage, donc l'ordre ne
change qu'au passage. Deux coureurs lus sur la **même boucle au même tour** portent la **même**
distance : c'est alors l'**heure** du passage qui les sépare, et le premier passé est le premier —
son point 174, « le premier qui passe est le premier, l'ordre de passage, rien d'autre ».

Le comparateur `cmpRead` porte ces trois clés — distance lue, puis heure du passage, puis le
dossard pour que deux coureurs jamais lus ne s'échangent pas — et il range **quatre** choses : la
file, les coureurs libres d'un amas, les coureurs d'un bloc, et les blocs entre eux (« ils
composent la timeline dans l'ordre chronologique de leurs groupes », point 174). La tête est le
premier de cet ordre ; la retenue d'une longueur de vélo de la build 174 est retirée, elle n'a
plus d'objet.

**Le tour retranché suit la même règle.** `impliedOf()` ne se recalcule plus à chaque image : la
valeur est relevée au dernier passage du coureur et **tient** jusqu'au suivant, quoi que fasse
l'amas calculé entre-temps. C'est son point 177 appliqué au merge du §2. Et le repère du paquet,
`bunchRaw`, est lui aussi une distance **lue**, pour que les deux termes de la soustraction
viennent du même endroit.

**Une échappée ne se propose qu'une fois.** Ses coureurs ne franchissent pas la boucle au même
dixième : le 12 et le 52 entrent dans le paquet à deux détections différentes, et deux
propositions séparées s'ouvraient pour le même fait de course. Si une proposition du même nombre
de tours est déjà ouverte, le coureur la **rejoint** — `PROPOSITION-JOINT` le dit dans les logs.

## 49. La tête et la queue d'un bloc viennent des détections (build 180)

**Son instruction, le 1er novembre 2026** : « Attaque l'écart des blocs : g.head et g.tail doivent
venir des détections eux aussi. »

`behindRead(x)` est le retard d'un coureur tel que les détections le donnent — la distance lue du
leader moins la sienne. `g.head` et `g.tail` en sortent, et avec eux l'écart `d = g.head −
prevG.tail`.

**Et le tour ajouté d'office disparaît.** Tant que l'ordre venait des mètres interpolés et l'écart
des mêmes mètres, un écart pouvait sortir négatif, et le code y ajoutait autant de tours qu'il en
fallait pour que le bloc repasse derrière. C'était le saut de 18,3 s que l'opérateur voyait, et il
se produisait 164 fois au palier 2. Les deux grandeurs viennent maintenant du même endroit : un
bloc rangé derrière un autre a, par construction, une distance lue plus petite. Il reste
**9 écarts légèrement négatifs** sur toute la course, de **−115 m** et **−125 m** — exactement le
pas entre deux boucles, quand les deux coureurs de la paire n'ont pas été lus sur la même. Cela ne
s'invente plus en tour : `ECART-NEGATIF` le **note**, et c'est tout.

**Trois grandeurs maintenant, pas deux**, et chacune répond à une question différente :

| | d'où elle vient | la question à laquelle elle répond |
|---|---|---|
| `behind` | la position interpolée | **où est-il sur la piste ?** — l'ovale, qui doit avancer en continu ; et **est-il à un tour de son voisin ?** — la découpe d'un amas en blocs |
| `behindRead` | la distance lue à la dernière détection | **de combien est-il en retard dans la course ?** — la tête et la queue d'un bloc, l'écart entre deux blocs |
| `cmpRead` | distance lue, puis heure du passage | **qui est devant qui ?** — la timeline, les blocs, la tête |

La découpe est restée sur les mètres interpolés **à dessein** : elle pose une question physique —
ces deux coureurs sont-ils à un tour l'un de l'autre ? —, à laquelle l'interpolation répond sans
ambiguïté, 0 m ou 250 m. Mesuré à la build 179 : posée sur les mètres lus, dont le pas atteint
125 m, elle coupait un amas en deux blocs fantômes et les bascules de tour remontaient de 104 à
142. C'est le seul endroit où la mesure interpolée est meilleure, et c'est parce qu'on ne lui
demande pas un ordre.

## 50. Le moteur de course, reconstruit (build 181)

**Sa demande, le 1er novembre 2026** : « Ce serait pas plus simple de reconstruire cet algorithme
depuis le début, avec les erreurs que nous savons qu'il ne faut pas commettre....? »

**Pourquoi.** Le moteur portait deux idées de « où est un coureur » qui se contredisent : ce que
les boucles ont **mesuré**, et ce que le logiciel **devine** entre deux détections. Chaque
correction déplaçait le défaut de l'une vers l'autre. L'opérateur a lui-même redressé la
description : les boucles et l'ordre de passage ne sont pas deux choses, c'est la même — une
détection porte une boucle **et** une heure.

**Le fichier** : `moteur-course.js`, chargé avant le prototype. Il tourne **à côté** du moteur
actuel : aucun écran ne le lit encore, le temps qu'on compare les deux sur les deux paliers.

**Son unique entrée** : `detection({ bib, boucle, t })`. Il n'existe aucune entrée pour une
position. C'est le garde de l'erreur E1 — on ne peut pas lui donner une position devinée, même par
accident.

**Ce qu'il calcule, et rien d'autre** :

- la distance d'un coureur, **comptée** boucle après boucle depuis son premier passage, jamais
  devinée (deux passages sur la même boucle font un tour entier) ;
- l'ordre : distance décroissante, puis l'heure du passage — « le premier qui passe est le
  premier » (point 174) ;
- l'écart entre deux coureurs qui se suivent : le temps lu sur la dernière boucle que les **deux**
  ont franchie, moins le temps d'une longueur de vélo à la vitesse du suiveur (§1) ;
- les groupes : on descend la timeline, et une cassure confirmée sur 0,3 s ouvre un groupe (§3) ;
- les tours pris ou perdus : la différence des distances comptées entre deux coureurs du même
  groupe, acceptée seulement si ce qui reste après les tours entiers tient dans la distance que la
  seconde du §1 représente à sa vitesse.

Les sept erreurs à ne pas refaire sont écrites en tête du fichier, chacune avec le garde qui
l'empêche. Elles viennent de `pitfalls.md` et des mesures des builds 166 à 180.

**Ce qui n'y est pas encore** : l'attribution du tour au bon coureur. L'article UCI 3.2.017 quater
veut qu'un tour se perde quand on est rejoint **par le plus gros peloton**, et se gagne quand on
rattrape l'arrière de ce peloton. Le moteur de course mesure la paire sans regarder quel groupe est le plus
gros, et attribue donc un tour **perdu** à des coureurs du peloton là où ce sont les échappés qui
en **gagnent** un. C'est le poste 26.

### Le tour va à celui qui rejoint le peloton (build 183)

**Sa règle, point 178** : « les tours se gagnent lorsqu'on rattrape le peloton, et se perdent
lorsqu'on se fait rattraper par le peloton ».

L'événement est donc : **un coureur qui n'était pas dans le peloton y est maintenant**. Le peloton
est le groupe le plus nombreux. Le **nombre** de tours se lit sur la paire — lui et le coureur du
peloton le plus proche de lui sur la piste, parmi ceux qui y étaient déjà — et le **sens** vient de
lui seul : plus de distance, il a rattrapé ; moins, il a été rattrapé. Un même nombre ne se
réannonce pas (`annonce`).

**Ce que le moteur de course relève au palier 2**, chaque ligne une seule fois :

| Coureurs | Ce qui est relevé |
|---|---|
| 18 POR, 61 COL, 7 NED | +1 à 296 s, +2 à 498 s, +4 à 833 s, +5 à 1 017 s |
| 12 SUI, 52 ITA | +1 à 453 s, +2 à 498 s, +3 à 740 s, +4 à 998 s |
| 46 BEL, 70 BRA | −1 à 362 s, −2 à 640 s, −3 à 918 s |

Les ordres de grandeur sont ceux de la simulation : partis avec 1,4 m/s de plus, les trois premiers
prennent environ 1 400 m sur la course, soit cinq tours et demi ; le 12 et le 52, avec 1 m/s de
plus, quatre tours ; les deux lâchés, avec 0,9 m/s de moins, trois tours et demi. Au palier 1,
**aucun tour n'est relevé**, et le groupe unique ne se coupe jamais.

**Un trou mesuré** : le 18, le 61 et le 7 passent de +2 à +4 sans que le +3 soit annoncé. Le
passage où il aurait dû l'être n'a pas satisfait la vérification du face-à-face.

**Ce qui N'est PAS décidé, et qui ne doit pas l'être par moi.** Le moteur de course **constate** le tour ; il
ne le **crédite** pas. J'ai essayé deux fois de créditer automatiquement, et les deux fois la
mesure l'a démenti : en partant des distances, 198 constats pour 16 coureurs ; en comptant les
passages sur la ligne d'arrivée et en prenant le tour du plus grand nombre, 960 constats au
palier 1, où personne ne prend ni ne perd un tour — parce que les coureurs d'un même groupe ne
franchissent pas la ligne au même instant, et que le premier à la franchir paraît avoir un tour de
plus. Le moment où un tour compte pour de bon est une question à poser à l'opérateur, pas à
deviner.

## 51. La tête de la timeline est désignée, pas calculée (build 188)

Son point 183. `moteur-course.js` porte une seule variable de tête, `ancre`, et une seule façon de
la poser :

```js
let ancre = null;
function designer(bib) { ... ancre = bib; }
function tete() {
  if (ancre != null) { const c = coureurs.get(ancre); if (c && c.n) return c; }
  for (const c of coureurs.values()) if (c.n) { ancre = c.bib; return c; }  // au départ
  return null;
}
```

Tout le reste en découle, et plus rien ne bascule :

| quantité | ce qu'elle est | d'où elle vient |
|---|---|---|
| `retard` | le décalage d'un coureur sur l'ancre, en secondes | la dernière boucle que les deux ont franchie |
| l’ordre de la timeline | les `retard` triés | — |
| l'écart d'un bloc | la différence de deux `retard`, moins une longueur de vélo | son §1 |
| `derive` | la somme des déplacements relatifs d'un coureur sur l'ancre | elle ne nomme que le **côté** (E8) |

**Pourquoi le décalage se replie sur un demi-tour.** Son point 182 : « chacun est toujours dans le
même tour que les autres du point de vue de la timeline ». Sur un anneau, un coureur à 18 s
derrière, sur un tour de 19 s, **est** une seconde devant — et aucune détection ne distingue les
deux. Le décalage est donc ramené dans le demi-tour autour de zéro. C'est ce que les boucles
donnent, et c'est tout ce qu'on en sait.

**Pourquoi la dérive existe quand même.** Parce que « échappé d'une seconde à l'avant » et « lâché
d'un tour moins une seconde » sont la même lecture, et que son point 174 les paie à l'envers l'un
de l'autre. La dérive retient le chemin qu'on l'a vu prendre, elle ne sert qu'à nommer le côté, et
elle retombe à zéro dès qu'un ±20 est constaté.

**Le constat du ±20.** Ni une appartenance à un groupe, ni une distance : **une paire nommée qui se
referme**, ses mots du point 180. Sorti par l'avant, la paire est (le dernier du peloton, lui) ;
lâché par l'arrière, elle est (lui, le premier du peloton). L'écart doit être positif — il est bien
derrière celui qu'il rattrape — et passer sous le seuil du §1, confirmé 0,3 s. Le « dernier du
peloton » exclut les coureurs qui ont eux aussi fait le tour : sinon, quand le 12 et le 52
reviennent ensemble, le dernier du groupe devient le 12.

Le moteur de course tourne toujours **à côté** de l'ancien moteur : aucun écran ne le lit.

## 52. Le moteur de course branché (build 190)

`MC` naît dans `reset()`, avec la piste, les boucles et les trois mesures du §1 (`GROUP_GAP_S`,
`BIKE_L`, `CASS_DELAY_S`). Il reçoit chaque détection là où elle est enregistrée, à côté de
`S.reads[li].push(...)`, et **rien d'autre** : ni position, ni vitesse, ni tour.

`computeGroups(M)` lui prend trois choses :

| ce que l'écran prend | ce que le moteur donne | le repli quand il ne connaît pas le coureur |
|---|---|---|
| `cmpRead`, l’ordre de la timeline et des blocs | le rang dans `chaine()` | les mètres lus, `ndOf` puis l'heure de passage |
| la découpe des blocs | deux `groupes()` différents = deux blocs | « sont-ils à un tour l'un de l'autre ? », sur `behind` |
| `g.gap`, l'écart en temps d'un bloc | la différence des décalages, moins une longueur de vélo | `pairGap`, la même formule sur les mètres lus |

Et son point 183 : `if (MC && S.leader) MC.designer(S.leader.bib)`. Tant qu'il n'a désigné personne,
le moteur garde sa propre ancre — le premier coureur détecté — et c'est elle qui mène la timeline.

**Ce que l'écran ne lui prend pas.** Les positions sur la piste : le moteur de course ne connaît
pas les mètres. L'ovale lit donc toujours `x.behind`, la mesure interpolée, pour dessiner — mais
les **blocs** qu'il dessine sont ceux du moteur, puisqu'ils viennent de `G.groups`.

Les ±20 que le moteur constate n'étaient **pas** branchés à cette build : ils le sont depuis le
build 194 (§5, `mesures.md` « Build 194 »), et leurs règles ont été refaites par ses points 241 à
246 aux builds 243 à 248 (§62).

## §53 · L'éligibilité se lit dans la timeline

`computeGroupsVraiment`, juste après le calcul des groupes. `x.dS` — ce qui reste à parcourir
jusqu'à la ligne du prochain sprint — ne vient plus de `M.get(bib).pos`, la position interpolée que
dessine l'ovale, mais de `mcRetard`, la **place** que le moteur de course tire des boucles. On
ramène les places sur le premier de la timeline (`placeTete`, le minimum : l'ancre peut avoir
quelqu'un devant elle, donc des places négatives), puis on replie sur `MC.tour()`, la durée d'un
tour de la tête, que le moteur expose pour cela.

La règle du §6 n'a pas changé : après les membres du groupe *n*, seuls ceux du groupe *n+1* peuvent
être éligibles ; tout membre d'un groupe plus bas qui est plus proche de la ligne qu'eux est
inéligible. Seule la mesure a changé. Son point 194.

## §54 · L'inéligibilité voyage avec le passage

Trois endroits. Dans `step`, le passage sur la ligne naît avec `inelig`, vrai si `S.inelig` tient
son dossard à cet instant. Dans `refile`, le passage emporte cette marque quand le tour perdu le
reclasse sur le tour du peloton. Dans `spTick`, `spIneligLus(k)` relit la marque du premier passage
de chaque coureur et c'est elle, et non l'inéligibilité du moment, qui décide du grisage ; le
jugement tourne maintenant dès que le sprint est ouvert, fermé ou non, parce que le passage d'un
coureur en retard n'entre dans le sprint qu'après la fermeture. `s.judged` garde le verrou : un
passage n'est jugé qu'une fois.

Un sprint enregistré à la main et le sprint final lisent `S.passes`, qui ne porte pas la marque :
ces deux cas retombent sur l'inéligibilité de l'instant, comme avant. Son point 195.


## §55 · Le classement au dessin validé, et le type de course (build 211)

Première session d'intégration des maquettes (`mockups/PLAN-SESSIONS.md`, S1). Elle rebranche
l'onglet `Standings` sur le dessin validé le 16 novembre 2026 et pose le **type de course**. Ses
règles sont les points **204** et **205** de `regles-operateur.md` ; les mesures, `mesures.md` §66.

**Le type de course.** `CFG` porte deux champs de plus : `type` (`'qualification'` ou `'final'`) et
`advance` (le nombre de qualifiés). Ils naissent sur `final` / `10` dans `DEF`, se gardent avec les
autres réglages (`saveSetup` / `loadSetup`, clé `tct.sim.setup`) et voyagent donc d'une course à la
suivante comme la piste et la liste de départ. Le champ de la barre du haut est `#rtype`, bâti sur
les classes `srcrow` / `ifk` / `srcv` / `ifstep` / `ifsb` déjà posées pour les provenances des tours
restants ; son style vit dans le bloc `<style>` du mixed, jamais dans `styles.css`, partagé.

`syncRaceType()` le tient à jour et il est appelé depuis **`render()`**, à côté de `syncArm()` — et
non depuis `renderRail`/`syncSub` comme `Laps` et `Sprints`. La raison est mesurée : `render()`
n'appelle `renderRail()` que si le rail du simulateur est **ouvert** (`if (railDirty &&
!$('#rail').hidden)`), si bien qu'un champ posé dans la barre du haut, elle toujours à l'écran,
n'aurait jamais reçu son verrou une fois le rail replié (`pitfalls.md` D31).

**Le tour d'un gain ou d'une perte.** `S.refiles[bib][kind]` — le registre qui sert déjà à défaire
un gain de tour — porte un champ `lap` de plus. `addLap(bib, kind, who, since, lap)` l'inscrit, et
`applyLap` le transmet ; les deux actions de proposition passent `p.lap`, le tour de la **jonction**
que la proposition porte, tandis qu'une action prise à la main sur la timeline n'a pas de tour à
elle et retombe sur `dispLap()`. `subLap` dépile le registre, donc la liste des tours reste juste
après une correction : il n'y a pas de second endroit à tenir.

**Le modèle.** `RIDERS` passe à six champs, `[dossard, nom, nation, couleur, sombre, prénom]`, et
le coureur de `S.riders` porte `first`. Les prénoms sont ceux de la maquette validée. `loadSetup`
repêche le prénom par dossard pour une liste de départ gardée **avant** que le champ n'existe :
sans cela, l'opérateur qui a déjà réglé sa liste n'en verrait aucun.

**Le rendu.** `renderStandingsTab()` rend un `.sttbl` qui porte `--ns`, le nombre de sprints, d'où
la grille tire la largeur de sa bande de sprints. Les points par sprint viennent de `spPoints(k)`
pour les sprints ouverts, les tours de `standings()`, qui rend maintenant `gainedLaps` et
`lostLaps`. La ligne de coupe est une ligne de plus, posée après le rang `CFG.advance`, et les
lignes au-delà portent `elim`. Les coureurs retirés restent en bas, sans rang, comme avant.


## §56 · La vue Évolution du classement (build 212)

`standView` dit laquelle des deux lectures de l'onglet `stand` est à l'écran, `'live'` ou `'evo'`. La
bascule est le `#stview` de l'en-tête du panneau, à gauche de la ligne d'indice ; elle ne paraît que
sur cet onglet et se synchronise depuis `renderLog`, jamais depuis le rail (`pitfalls.md` D31).

**Rien n'est gardé en mémoire.** `evoMoments()` relit les moments de la course à chaque rendu : le
départ, chaque sprint commencé (`spStarted`), et chaque tour gagné ou perdu, pris de `S.refiles`.
Deux coureurs qui prennent un tour au même tour de piste font **une seule colonne** : c'est un seul
fait de course. L'ordre est celui des tours, puis celui du temps quand deux moments tombent au même
tour. `evoHistory()` rejoue ensuite les points **depuis le départ** et range les coureurs à chaque
moment avec la comparaison du classement Live — les retirés en dernier et sans numéro, puis les
points, puis la place à l'arrivée, puis le dossard.

Ce choix est la raison d'être de la vue : une correction — un tour annulé, un sprint rejugé, un
`Undo` — **remonte toute la course d'un coup**, parce qu'il n'y a pas de passé figé à corriger. Des
instantanés enregistrés auraient gardé l'erreur derrière eux et n'auraient réparé que le présent.
`subLap` dépile déjà l'entrée de `S.refiles`, donc le moment disparaît avec elle.

`evoAt` porte le moment regardé : `null` veut dire que l'écran **suit le présent**. Un clic sur une
colonne le pose, un clic sur la **dernière** le remet à `null` (règle 206). `evoSel` porte les
coureurs suivis, quatre au plus, et se garnit des deux premiers du classement tant que l'opérateur
n'a rien choisi.

Le graphe se dimensionne sur la place **mesurée**, pas estimée : `renderLog` pose la vue, lit le
`.ev-body` qui vient d'être posé **et la barre de défilement du `.ev-scroll`** (`offsetHeight -
clientHeight`, 15 px, qui se prend sur la hauteur), et refait le rendu **une fois** si l'une des
trois n'est pas celle qu'on avait prise (`evoW`, `evoH`, `evoSb`). La colonne de gauche du graphe
fait 152 px — l'échelle des points et les noms des coureurs suivis y tiennent tous les deux. C'est ce second passage qui tient le tableau du bas dans le panneau
(`pitfalls.md` D32). Le dessin et ses classes viennent de la maquette, préfixés `ev-` parce que ses
noms — `.side`, `.lb`, `.cc`, `.leg` — sont des mots courts que `styles.css`, partagé par les trois
prototypes, pourrait déjà porter.

**La bascule se cache par une règle à elle** (build 216, règle 212). `renderLog` lui pose bien son
attribut `hidden` hors de Standings, mais le `display:flex` de `.seg` passait devant : elle se
voyait sur tous les onglets. `.log .hd .seg[hidden]{display:none}`, dans le `<style>` du mixed, lui
rend l'effet attendu (`pitfalls.md` D34).


## §57 · Tous les sprints, en colonnes (build 214)

L'onglet `Sprints` rendait **une ligne par sprint**, du dernier au premier, et de chaque sprint
seulement les **quatre premiers**. Il rend maintenant le dessin de
`mockups/maquette-tous-sprints.html` : **une colonne par sprint, de gauche à droite**, et dans
chaque colonne l'**ordre complet**.

`renderSprintsTab()` ne calcule rien. Chaque colonne se lit de l'état réel :

| Ce qu'on voit | D'où ça vient |
|---|---|
| L'ordre, place par place | `spOrder(k).seq` — déjà l'ordre entier, pas seulement les quatre premiers |
| Les lignes rouges `NO PTS`, sans place | `spOrder(k).greyed` — les passages **lus pendant une inéligibilité** |
| Les points `+5 +3 +2 +1`, doublés à la finale | `spPoints(k)` |
| La pastille `live` / `sent` / `not sent` | `spSendState(k)`, avec les mêmes mots qu'avant |
| `LAP 30` | `sp(k).lap` — un sprint décalé d'un tour change donc de tour ici aussi |
| La colonne existe ou non | `spStarted(k)`, **sa règle 209** |

Les lignes grisées s'**entrelacent par l'heure de lecture**, exactement comme la carte de sprint le
fait déjà : un coureur lu pendant son inéligibilité reste entre les deux coureurs entre lesquels il
est passé. Les deux écrans racontent ainsi la même chose du même sprint.

**Le défilement se garde.** La bande se reconstruit à chaque rendu, comme tout le reste de l'onglet.
Son `scrollLeft` est donc gardé dans `spScroll` et reposé après coup, sinon le tableau reviendrait
au premier sprint à chaque image. Les deux flèches `‹ ›` se montrent uniquement quand il y a quelque
chose à atteindre (`scrollWidth > clientWidth`) : à six sprints, jamais.

**Où le branchement vit.** La classe `spr` sur `#logrows` — qui fait de lui une bande horizontale —
se pose dans le **dernier** maillon de la chaîne de `renderLog`, le seul qui tourne pour tous les
onglets ; les maillons des Passings et de l'Évolution rendent la main avant pour les onglets qui ne
sont pas les leurs. Les noms de classes portent le préfixe `sp` : `styles.css` est partagé par les
trois prototypes, donc tout le dessin vit dans le `<style>` du mixed.

**La liste `OUTPUTS` est sortie de cette vue au build 215** (sa règle 210) : le tableau ne montre que
les colonnes. Les envois restent au journal et dans `Export sprints`, inchangés. Un clic sur une
colonne ouvre la carte de ce sprint par `data-spopen`, le mécanisme qui existait déjà.

**Par où on y entre, depuis le build 215** (sa règle 211) : l'onglet `Sprints` n'existe plus dans la
barre du haut. Le bouton **`ALL`**, à la suite de la bande `Sprint 1 2 3 … F` de la carte, pose
`logTab = 'sprints'` et ouvre le panneau. Le retour se fait par l'onglet `Race`, comme pour les
autres vues : le panneau couvre la carte, donc le bouton n'est plus atteignable une fois le tableau
ouvert. L'onglet n'étant plus dans la barre, l'indice du panneau et le bouton `Export sprints`
s'écrivent dans ce même geste.

**La carte de sprint** reprend trois traits du même dessin, et rien d'autre : les quatre places qui
marquent sur fond vert (`spPoints`), un trait sous la quatrième, et la pastille rouge `NO PTS` là où
la ligne grisée disait « no points » en texte. Les trois colonnes, la bande des sprints, les
commandes de droite et le glisser-déposer sont intacts.


## §58 · Lap by lap, en colonnes (build 217)

L'onglet `Crossings` rendait **une ligne par tour**, du plus récent au plus ancien, avec une rangée
de pastilles. Il rend le dessin de `mockups/maquette-lapbylap.html` : **une colonne par tour, le plus
récent à droite**, et la bande s'ouvre défilée à droite.

`renderCrossTab()` ne calcule rien de neuf. Chaque colonne se lit de `S.cross[k]` :

| Ce qu'on voit | D'où ça vient |
|---|---|
| L'ordre, numéroté de 1 au dernier | `S.cross[k]` rangé **par l'heure du passage** |
| Les boîtes de blocs, avec leur couleur | `blk`, `blkc`, `blkid` gravés sur le passage (règle 213) |
| L'écart entre deux boîtes | la différence des heures de passage, de part et d'autre |
| Le temps au tour | l'écart avec le **passage précédent du même coureur**, tous tours confondus |
| La pastille des tours faits, verte ou rouge | `c.n`, son compte réel de passages, comparé au tour de la colonne |
| `SPRINT 4` en bleu | `sprintNumOf(k)` |
| La colonne verte `live` | le dernier tour tant que la course avance |
| Les alertes | `c.mark > 0` (tour gagné) et `S.holes[k]` (doublé, pas de passage) |

**Un tour gagné reclasse le bloc avec le passage** (builds 219 et 220, règles 216 et 217). Deux
chemins y mènent, et il a fallu les deux. **Quand le tour est validé avant le franchissement** — ce
que fait l'opérateur — rien n'est déplacé : le tour attend dans `S.markPending`, et le premier passage
qui suit est enregistré avec la marque `pm > 0`. C'est **ce passage-là** qui retombe sur un tour où le
coureur figure déjà, et c'est à l'enregistrement qu'il prend le bloc du **peloton** (build 220). Les
passages suivants reprennent le bloc lu : s'il repart seul, il redevient un bloc de tête. **Quand le
tour est validé après le franchissement** (build 219), `refile()` déplace les
passages d'un coureur crédité d'un tour ; ceux-là prennent le bloc du **peloton**, celui sur le tour
duquel ils viennent d'être reclassés, et non le bloc qu'ils portaient à la lecture — où le tour
n'était pas encore validé et où le coureur était encore un bloc derrière. Le bloc d'origine est gardé
dans `blk0` / `blkc0` / `blkid0` : reprendre le tour le rend. Un tour **perdu** ne touche à rien de ce
côté, le coureur y perd un passage au lieu d'en gagner un.

**Ce qui identifie un bloc, c'est `blkid`** — le plus petit dossard du bloc à la lecture — et non son
nom ni sa couleur. Les deux portent son **rang** (`1-Bunch`, `2-Bunch`), et ce rang change pendant
que les coureurs franchissent la ligne : le peloton se retrouvait coupé en cinq boîtes au même tour.
Le nom et la couleur affichés sont ceux du **premier** passage de la boîte.

**L'ordre dans la colonne est celui de la ligne**, à l'heure du passage. L'ancienne liste rangeait
par rang de timeline (`S.tlRank`) : bon pour une rangée de pastilles, faux pour des boîtes, où les
coureurs d'un même bloc doivent se suivre et où l'écart affiché doit être un vrai écart de temps.

**Le défilement suit le direct.** `crScroll` garde la position et `crAtEnd` dit si l'opérateur est
resté au bout droit : tant qu'il y est, la bande suit le tour qui se joue ; dès qu'il remonte vers
les tours anciens, elle ne bouge plus sous lui. La classe `lbl` sur `#logrows` se pose dans le
dernier maillon de la chaîne de `renderLog`, comme `spr` (§57).

**Le merge attend la validation, dans les deux sens** (builds 223 à 225, règles 219, 220 et 221). `impliedOf()` garde deux
valeurs côte à côte dans `S.took` : `v0`, le nombre de tours que les boucles donnent au coureur sur le
paquet, et `v`, celui qu'on lui retranche vraiment — borné par `S.lapStatus`, le compte validé. Avant
validation `v` vaut 0 : le coureur reste où les boucles l'ont lu, un tour devant pour un gain, un tour
derrière pour une perte. **L'écart en tours se lit sur les passages de la boucle
d'arrivée** (build 228, règle 223) : `finN`, combien de fois elle a vu le coureur, et `finAt`, quand
elle l'a vu la dernière fois, avec `finPrev` pour sa durée de tour. `Math.round((finN − finN du repère)
− (finAt − finAt du repère) / T)`. Aucune distance n'y entre, et un tour validé ne se remesure pas sur
une position (`pitfalls.md` D41 et D42).

**L'en-tête d'un bloc a trois états** (build 234, règle 227) : `leader` pour le premier, l'écart en
secondes quand il est mesuré, `—` quand il ne l'est pas encore. `g.gap` à `null` avec `g.gapNone`
distingue le second cas du premier. Un écart négatif n'est jamais affiché.

**Une carte de tour en attente vaut un tour d'écart** (build 232, règle 226) : `ecEff()` est l'écart lu
sur les passages, ou, à défaut, le `delta` de la proposition en attente — elle comble la fenêtre d'un
tour entre la jonction et le passage suivant sur la ligne (`pitfalls.md` D45). Parmi les blocs en
avance, **celui dont la carte attend passe devant** (build 233).

**Un bloc qui tient un tour pris non validé est mis en tête de la timeline** (build 231, règle 225),
après le rangement à la main : c'est lui, et non le bloc du leader désigné, qui ouvre la timeline. À la
validation l'écart tombe à zéro, le bloc redescend de lui-même et le suivant devient la tête.

**Les noms des boîtes se refont sur celles qui s'affichent** (build 230, règle 224) : le relevé donne
l'ordre, le rang et le rôle se déduisent des boîtes non vides, comme `groupName()` les déduit sur la
timeline (`pitfalls.md` D44).

**Un passage déplacé par un tour crédité est rangé avec le peloton** (build 229, règle 222). Le relevé
d'un tour est pris à son ouverture et ne connaît pas les validations faites après ; `renderCrossTab()`
reconnaît ces passages à leur compte — `c.n !== k` — et les met dans la boîte du peloton, celle où le
coureur est l'égal des autres (`pitfalls.md` D43). Leur différence est
`avanceOf()`, l'avance non validée ; elle passe devant tout le reste dans `cmpRead` et force une coupe
entre deux coureurs qui ne la portent pas pareil, si bien que le bloc de tête ne se mélange pas au
peloton. `S.lapStatus` entre dans la clé du cache, pour que le merge se fasse au clic et non à la
détection suivante. Le repère du paquet, lui, n'accepte qu'un
coureur dont le dernier relevé a été pris **à l'intérieur** du paquet (`dedans`, `pitfalls.md` D40).

**L'ordre de la colonne vient d'un relevé du tour** (build 222, règle 218). `S.crossG[k]` garde, pour
chaque tour, les blocs de la timeline dans leur ordre — `{ n: nom, c: couleur, b: dossards }` — pris à
l'ouverture du tour, sur le premier passage enregistré, et jamais recalculés. `renderCrossTab()` monte
ses boîtes dessus : un bloc du relevé, une boîte, dans l'ordre du relevé ; dedans, les passages du
tour rangés par l'heure. Le second passage d'un tour gagné (`mark > 0`) descend dans la boîte du
peloton (règle 216), un coureur absent du relevé finit dans une dernière boîte sans nom, et une course
enregistrée avant le build 222, qui n'a pas de relevé, retombe sur le bloc gravé passage par passage.
`S.crossG` entre dans le cliché d'annulation avec `S.cross`.

**Les largeurs de la ligne de coureur** (build 218, règle 215) : 24 px le dossard, 18 px le drapeau,
le pays au reste, **34 px** le temps au tour et **30 px** la pastille des tours faits. Cette dernière
ne porte sa bordure et ses marges que lorsqu'elle se colore, et passait alors devant le temps au
tour (`pitfalls.md` D36).

**Ce qui n'est pas codé.** Le bouton **`Shift −1 lap`** de la maquette et son alerte « double lap
time » : ils corrigent une détection manquée sans rien créditer, ce que le décalage existant — celui
de `refile()`, qui accompagne un tour crédité — ne sait pas faire. C'est de la logique de course et
elle attend sa propre proposition.

## 11 bis. L'onglet Start list et ses trois sous-onglets

`slTab` dit lequel est ouvert, `renderStartList()` les dessine tous les trois (build 237, point 230).

- **`Riders`** : `sortedRoster()`, qui suit `gridOrder()` tant qu’aucun tri n’est demandé (build 238, point 231) et le tri de `simSort` sinon, et `applyRosterEdit(i, field, value)`, qui connaît maintenant le
  champ `first`. Le prénom est `RIDERS[i][5]` ; il n'est pas mis en capitales et peut rester vide.
  `addRosterRider()` crée une ligne à six colonnes, prénom compris.
- **`Start order`** : `gridOrder()` rend la suite des dossards, de la place 1 à la dernière —
  `GRIDORDER` s'il y a un ordre posé à la main, l'ordre des dossards sinon. Un coureur retiré sort de
  l'ordre, un coureur ajouté va à la fin. `dropGridOrder(from, to)` place la ligne déposée à la place
  de celle qu'elle recouvre ; `setGridOrder(null)` revient à l'ordre des dossards. `reset()` lit
  `gridOrder()` pour poser `dist` et `offset`.
- **`Files`** : `LISTS`, gardé sous `tct.sim.lists` (`saveLists()`, `loadLists()`, `listNo()`), avec
  `saveCurrentList()` et `loadList(l)`. Une liste porte `{id, no, name, riders, order}`.

`GRIDORDER` est gardé avec le reste des réglages, sous `order` dans `tct.sim.setup`.


## §59 · L'anneau : l'ordre de la timeline vient des boucles seules (build 239)

Son point 235 : « remets l'ordre à l'endroit ».

`moteur-course.js`, `chaine()`. Chaque coureur portait deux quantités, et en porte maintenant trois :

- `retard` — la lecture des boucles depuis la tête, repliée sur un **demi-tour**. Elle dit si deux
  coureurs se touchent **sur la piste**, donc elle sert le constat des ±20. Inchangée.
- `anneau` — la même lecture ramenée **entre zéro et un tour** : `((retard % T) + T) % T`. **Elle
  range la timeline**, et c'est elle que `ecartEntre()` soustrait pour l'écart de deux coureurs qui
  se suivent. Nouvelle.
- `place` — la lecture à laquelle `placeS()` ajoute les tours entiers comptés sur la **dérive** du
  coureur. **Elle ne range plus rien.** Elle reste, parce que la dérive nomme toujours le côté par
  où un coureur est sorti du peloton (E8).

La chaîne part de la tête, descend la piste, et rencontre chaque coureur une fois avant de revenir
sur elle. Les écarts entre coureurs consécutifs sont donc **positifs par construction** et leur
somme vaut un tour. Aucun tour n'est ajouté nulle part.

Le garde porte le numéro **E13** dans l'en-tête du fichier, avec la mesure qui l'a imposé
(mesures.md §88) et celle qui a refusé une idée à moi sur le choix de la boucle lue.

Dans `timeline-prototype_mixed.html`, un seul mot change : `mcRetard` se remplit de `x.anneau` et
non plus de `x.place`. C'est elle qui porte l'écart affiché en en-tête de bloc — du dernier coureur
du bloc du dessus au premier du sien (son point 234) — et l'ordre et l'écart viennent donc enfin de
la même lecture.

**Ce qui n'est pas touché.** La couche de l'écran, dans `computeGroups`, trie **avant** le moteur
sur `ecEff` — le tour d'écart non validé, proposition en attente comprise — et coupe un bloc dès que
deux voisins n'ont pas le même. C'est elle, et non l'ordre, qui met le BIB 22 seul dans un bloc du
tour 16 au tour 40 sur la course du §88 (mesures.md §89).


## §60 · L'onglet Passings : tri, filtres, arrêt (build 240)

Ses points 236, 237 et 238. Tout tient dans `renderPassingsTab()` et la barre `#pfilt`.

**Quatre variables d'état.** `passK1` / `passK2` — la colonne qui range et celle d'avant, chacune
avec son sens ; `passBib` / `passLap` — les deux filtres, `null` = tout passe ; `passHold` /
`passHoldAt` — l'arrêt et l'heure de course à laquelle il a été demandé.

**Le tour d'une détection, `lapAt(bib, t, surLaLigne)`.** Les heures des passages de la boucle
d'arrivée sont relevées une fois par rendu depuis `S.passes`, par dossard ; une recherche
dichotomique donne combien sont derrière l'heure demandée. Un passage **sur la ligne** porte ce
nombre — le tour qu'il ferme ; les autres boucles portent ce nombre **plus un** — le tour en cours.
Et `S.lapStatus` est retranché dans les deux cas, son point 233. C'est le même classement que la
colonne Lap by lap, qui range un franchissement sur `ka − lapStatus`.

**Le rangement.** `ord` porte la position de la boucle **sur la piste** (0, 115, 240), et non son
rang dans `LOOPS` : un tri sur POINT suit donc l'ordre dans lequel un coureur les rencontre. Les
contacts de ruban prennent `1000 + leur position`, pour rester groupés après les boucles. Un
contact n'a pas de dossard : `VAL.bib` lui donne `1e9`, il part en fin de tri, et un filtre par
dossard le retient forcément dehors.

**L'arrêt ne touche à rien d'autre que l'affichage.** `coupe = passHoldAt` enlève de la liste ce qui
a été lu après ; `S.reads` continue de se remplir, le moteur de course continue de recevoir ses
détections, et le bandeau compte ce qui attend. Le bouton dit `Resume` tant que l'arrêt tient.

Le clic sur un titre est posé sur `#logrows`, et il ne fait quelque chose que sur l'onglet `pass` :
le journal réécrit son contenu à chaque rendu, donc rien ne peut être attaché aux titres eux-mêmes.
Les deux champs, eux, sont dans `#pfilt`, qui n'est pas réécrit — ils gardent le curseur pendant
qu'on tape.

**Le second clic range PAR-DESSUS le premier**, et non à l'intérieur : la dernière colonne cliquée
devient `passK1`, l'ancienne descend en `passK2`. Les deux lectures de son point 236 se défendaient ;
la question lui a été posée le 18 novembre 2026 et il a répondu « je m'en fous ». Le choix est donc
de moi, il est celui-ci, et il n'y a rien à rouvrir.


## §61 · Les lectures d'avant la ligne (build 242)

Son point 240. Deux endroits, et un seul mot de règle entre les deux.

**`detect`** ne refuse plus une lecture de boucle quand la distance du coureur est négative : le
`&& r.dist >= 0` est retiré du test de franchissement. Les contacts de ruban gardent le leur — il
n'en a pas parlé. Un coureur placé derrière −10 m sur la grille produit donc une lecture de
Pursuit A au coup de pistolet, et elle entre dans `S.reads[2]` comme n'importe quelle autre.

**`moteur-course.js`, `detection()`** refuse un dossard qu'il ne connaît pas encore quand la
détection n'est pas sur `R.arrivee` : `{ refus: 'pas encore passé la ligne de départ' }`. Un
coureur naît donc dans le moteur à son premier passage sur la ligne, et pas avant. C'est sa règle
239 écrite dans le moteur, et **ce n'est pas un seuil** — c'est la ligne de départ, qu'aucun
coureur ne franchit deux fois.

Sans ce refus, ces lectures auraient désigné la tête : l'ancre est le **premier coureur détecté**
(E9), et le premier détecté serait devenu le BIB 3, lu à 0:00,025 — un coureur du fond de la
grille, et de surcroît lu sur une boucle que les autres n'ont pas encore passée.

La colonne Lap de l'onglet Passings les laisse vides (§60) : elles n'appartiennent à aucun tour.

## §62 · Qui dit quoi sur les groupes · build 246

Trois choses, et chacune a un seul propriétaire.

**Le moteur** (`moteur-course.js`) dit **qui roule avec qui** : il range les coureurs sur l'anneau —
la lecture des boucles ramenée sur un tour depuis la tête — et il coupe là où l'écart dépasse la
seconde. Il ne sait rien des tours gagnés ou perdus, et il ne peut pas les savoir : sur un anneau,
un groupe lâché d'un tour se lit juste DEVANT le peloton.

**La timeline** (`computeGroupsVraiment`) dit **dans quel ordre les groupes courent**. Elle le peut
parce qu'elle connaît `S.lapStatus`, les tours que l'opérateur a validés. Son rangement : d'abord le
tour d'écart non validé (`ecEff`), puis **le groupe du moteur**, puis le rang sur l'anneau. L'ordre
du groupe avant le rang est ce qui empêche un groupe de se couper en deux (mesures.md §99).

**La timeline dit au moteur** quels sont ses blocs et lequel est le peloton, par `MC.rangs(blocs,
iPeloton)`, posé à chaque image à la fin de `computeGroupsVraiment`. Le moteur s'en sert pour ses
deux constats de ±20 : seul le groupe de tête peut gagner un tour, seul le groupe de queue peut en
perdre un. C'est le même partage que pour la tête de la timeline, que l'opérateur désigne et que le
moteur ne cherche jamais.


## §63 · L'ouverture d'un sprint · build 249

Son point 248 : « un sprint ne peut s'ouvrir qu'au passage des LEADERS et de personne d'autre », et
« cela est valable pour tous les sprints ».

**`estDesLeaders(bib)`** répond si ce dossard est dans le bloc de tête de la timeline, c'est-à-dire
le premier bloc de `lastG.groups` qui n'est pas un incident. Tant que la timeline n'a pas de blocs
— au tout premier passage de la course — il répond oui, et le coureur lu ouvre, comme avant.

**`S.spFrom`** garde, pour chaque sprint, l'instant de son ouverture : sprint → temps de course.
Dans la boucle de détection, sur la ligne d'arrivée seule, un passage de `estDesLeaders` estampille
tout sprint dont le tour est atteint. Le tour lu est `k = ka - S.lapStatus[bib]`, le compte de
passages du coureur moins ses tours crédités : le tour de la course, celui de l'onglet Crossings.
L'arrivée est le sprint `NSPRINTS`, dont le tour vaut `LAPS` : `S.finishOpen` prend donc
`S.spFrom[NSPRINTS]` et rien d'autre.

**`spCrossings(k)`** lit les passages depuis `S.spFrom[k]`, et garde le premier de chaque coureur.
C'est la même fenêtre pour les quatre sprints. Les deux anciens chemins restent derrière :
l'enregistrement à la main de l'opérateur (« Clear and record », `s.recordFrom`) passe devant, et le
rangement par tour (`S.cross[s.lap]`) ne sert plus que si aucun passage des LEADERS n'a été lu.

**`spTick`** ouvre la carte du sprint sur `S.spFrom[k]`, au même instant que la fenêtre. Le tour du
leader désigné (`dispLap()`) n'ouvre plus rien ; il sert encore à fermer un sprint intermédiaire,
deux tours plus tard.


## §64 · Ce qui attend une validation clignote, et sonne une fois · build 250

Son point 250. Trois endroits, et une règle de style.

**La règle de style**, dans le bloc `<style>` de la version mixte : `@keyframes attente`, un
battement d'une seconde entre l'opacité pleine et 0,3, posé sur `.tl .gh.attente`,
`.tl .trow.attente`, `#bands path.attente` et `#oval .dot.attente`. Aucune couleur nouvelle : la
carte orange qui attend ne change pas, et les éléments gardent leurs couleurs.

**La timeline** (`renderTimeline`) : l'en-tête `.gh` d'un bloc prend `attente` quand `g.pending`
— au moins un de ses coureurs a une carte de tour en attente —, et la ligne `.trow` d'un coureur
quand `x.pending`. Ces deux drapeaux existaient déjà : `pendingOf()` les pose dans
`computeGroupsVraiment`, et ils servaient à la bordure du bloc et au rangement.

**L'ovale** (`renderOval`) : la pastille `g.dot` d'un coureur prend `attente` sur le même
`x.pending`, et les trois tracés de la bulle de son groupe sur `g.pending`. Une bulle n'est
dessinée que pour un bloc qui ne roule pas dans l'amas du peloton (§14) : un échappé qui vient de
rattraper la queue du peloton n'en a donc pas, et ce sont ses pastilles qui clignotent.

**Le battement est calé sur l'horloge du poste.** L'ovale est redessiné vingt fois par seconde et
la timeline une fois par seconde, et une animation CSS repart de zéro à chaque élément recréé :
sans précaution, les pastilles ne clignoteraient jamais. Chaque élément reçoit donc en ligne
`animation-delay:-(performance.now() % 1000) ms`, et tous les redessins retombent sur la même
phase. C'est la même famille de piège que D2 : un conteneur réécrit ne garde rien de ce que le
navigateur attache à ses enfants.

**Le son** (`sonValidation`, appelée par `addProposal` pour une proposition de tour) : un la de
880 Hz pendant un tiers de seconde, par l'audio du navigateur, sans fichier — un oscillateur et une
enveloppe de gain. Il ne retentit que si `S.factor > 0` : le retour de 30 s et le chargement d'une
course rejouent les propositions à l'arrêt, dans une boucle serrée, et ne doivent pas sonner. Un
poste sans audio ne lève aucune erreur : tout est sous `try`.

### L'anneau vert, et la carte en vert (build 251)

Sur l'ovale, l'atténuation de la pastille « ne se voit presque pas » (point 250). La pastille
reprend donc son aspect plein, et `renderOval` pose devant elle, quand `x.pending`, un cercle
`.attring` de rayon `DOT_R + 4`, trait de 3, dans le vert `--play` (#1CC634) : `@keyframes anneau`
le fait apparaître et disparaître une fois par seconde, par pas (`steps(1)`), avec le même
`animation-delay` négatif que le reste. Vert parce que l'orange « est proche de la couleur de la
piste » et que la piste ne porte aucune ligne verte.

La carte qui attend, `.props .gq.hot`, prend le même vert à la place de l'ambre du §34, avec son
texte en vert très sombre ; la règle vit dans le bloc `<style>` de la version mixte, par-dessus
`styles.css`. `IF.next` continue de perdre `hot` pendant qu'une carte attend : un seul foyer, et il
est vert maintenant. Le champ du prochain sprint garde son ambre.

## §65 · La carte du sprint n'a plus de bouton Close · build 252

Son point 251. `renderCard` n'émet plus le bouton `data-sact="close"` ; le gestionnaire `close`
d'`onCardClick` et `spClose()` restent, pour le harnais et pour ne rien casser, mais rien à
l'écran ne les atteint. La fermeture d'un sprint intermédiaire ne vient plus que de `spTick` :
deux tours après la ligne, toutes les places parties, aucune photo en attente. Le final, que
`spTick` exclut, ne se ferme jamais — c'est ce que la règle du 15 novembre 2026 demandait, et la
seule façon de le fermer vient de partir.

## §66 · La photo-finish en orange · build 253

Son point 252. Trois lignes dans le bloc `<style>` de la version mixte — `.srow.cam` et
`.sprk.cam` sur un orange sombre (#4a3410), l'écart `.gp` en `--warn` — par-dessus le rouge de
`styles.css`, partagé, qui ne change pas. L'icône `CAM` passe d'un trait rouge à un trait blanc.
`renderSprintsTab` pose la classe `cam` sur la ligne d'un coureur dont `e.photo` est vrai, ce
qu'il ne faisait pas : la colonne d'« All sprints » ne marquait pas la photo du tout.

## §67 · Un coureur qui manque à l'appel : la carte en trois questions · build 254

Son point 253. Quatre choses dans le code.

**Une lecture de boucle a un seul chemin, `lireBoucle(o, li, d, t, spdFallback, placed)`.** Le
bloc qui enregistrait une lecture dans `step()` — `rec`, `lastAt`, `finN`, `S.reads`, le moteur de
course, la ligne (`S.cross`, `S.passes`, `S.spFrom`, l'arrivée), la boucle armée — en est sorti tel
quel. `step()` l'appelle avec la distance de la simulation ; un passage que l'opérateur pose
l'appelle avec `placed` à vrai, et la distance se déduit de la dernière lecture du coureur : la
boucle suivante est à `(L' − L) mod TRACK` mètres, un tour entier si c'est la même. Dans `S.reads`
l'entrée porte alors `placed: true`, et la passing list l'écrit « placed · operator » avec la
mention « not read ».

**La détection**, dans `detect()`, section 2, à la place de l'ancienne carte « not read » à 22 s.
Pour chaque coureur d'un bloc de la timeline qui n'est ni retiré, ni sans transpondeur, ni en
incident : sa dernière lecture est à la boucle `li0`, à `t0`. Les deux boucles suivantes dans le
sens de course sont `li1` et `li2`. `lastOn(li)` est l'heure du **dernier** coureur de son bloc sur
cette boucle, après `t0`. Si les deux existent, dans l'ordre, et que `ABSENT_S` (2,5 s) s'est
écoulé depuis la seconde, la carte `absent` naît, avec `t0`, les deux boucles et les deux heures.
Elle meurt d'elle-même si le coureur est lu entre-temps. `t0` est relevé à `S.absentFrom[bib]`
quand il est plus récent : `backInRace` le pose, pour qu'un coureur remis en course ne reçoive pas
la même question une seconde plus tard — mesuré, elle revient deux boucles après.

**La carte à trois temps.** Une seule proposition, dont `run()` réécrit `text` et `actions` aux
deux NO et renvoie `'keep'` : le gestionnaire `data-pact` ne la retire alors pas, c'est la seule
retouche qu'il a reçue. YES à la première question appelle `placerPassages(p)` ; YES à « Crash ? »
appelle `ouvrirCrash(p)` ; YES à « Transponder KO ? » appelle `noTpToggle` ; ✕ marque la clé
`dismissed`, et la question ne revient pour ce coureur que s'il est lu puis manque de nouveau.

**La carte du crash.** `ouvrirCrash` ouvre le groupe d'incident par `newGroup(…, 'crash')`, comme
avant, et pose une proposition `crash` qui porte les trois issues : `Back in race` (`backInRace`),
`Back on another bike` (`backInRace` puis `noTpToggle`), `Abandons` (`withdraw … 'ABD'`). Tant
qu'elle est là, la carte `back` des lectures qui reviennent ne se pose pas pour ce groupe, et
`dissolve()` l'emporte avec le groupe. Le compte des 5 tours reste celui de l'en-tête du bloc.

## §68 · La carte de crash à plusieurs coureurs · build 255

Son point 254. **Le groupe `CRASH` est la vérité, la carte se refait dessus.** `carteCrash(g)`
crée la proposition `crash:<id du groupe>` si elle n'existe pas, et sinon réaligne ses `bibs` et
ses actions sur ceux du groupe : `crashActions(g)` donne, par coureur, `Back in race`,
`Another bike` (`backInRace` puis `noTpToggle`) et `Abandons` (`withdraw … 'ABD'`), chacun portant
son `bib`. `detect()`, section 3, l'appelle à chaque pas pour chaque groupe de type `crash`, ce qui
couvre le coureur glissé sur le bloc (`joinGroup`) comme celui qui en sort ; `newGroup(…, 'crash')`
l'appelle aussi, pour que la carte soit là au même instant que le groupe, que celui-ci vienne de la
question « Crash ? » (`ouvrirCrash`, qui n'est plus qu'un appel à `newGroup`) ou du bouton `Crash`
de la barre d'actions.

**Une issue par coureur.** Chaque action rend `'keep'` tant que le groupe a encore un coureur
(`resteCrash`), et rien quand il est vide : la carte tombe avec le dernier. `withdraw` retire déjà
toute proposition qui porte le dossard, carte comprise ; `detect()` la refait au pas suivant pour
ceux qui restent.

**Le rendu** est une branche propre de `renderTimeline` : une `.gq.crash`, la liste des dossards
à gauche avec, au bout de chaque ligne, ses trois boutons — les `data-pact` sont les index de
`liveActions(p)`, comme partout — et le titre `CRASH · Lap n · 5 laps to rejoin` à droite. La carte
des coureurs lus à nouveau (`back`) ne se pose plus pour un groupe `crash` ; elle reste pour les
groupes `mech`, qui n'ont pas été redemandés.

## §69 · Une carte pour ceux qui manquent ensemble, et le compte à rebours du crash · build 256

Son point 255 et sa remarque sur la capture. Dans `detect()`, section 2, les coureurs d'un bloc
qui remplissent la condition sont d'abord rangés par **paire de boucles manquées** (`lots`, clé
`li1:li2`), puis une carte `absent` naît par lot : `bibs` triés, `t0` par dossard, les deux heures
du dernier du groupe. `texteAbsent(p)` écrit le texte des trois temps à partir de la liste, et se
rappelle quand elle change : un coureur lu entre-temps (`r.rec.t > p.t0[b]`) sort de `p.bibs`, la
carte reste pour les autres et tombe avec le dernier. `placerPassages`, `ouvrirCrash` et
`noTpToggle` agissent sur toute la liste.

`texteCrash(g)` écrit « CRASH · Lap n · still k laps to rejoin », `k = NEUTRAL_LAPS − (tour
courant − tour du crash)`, et « neutralisation over » à zéro ; `carteCrash` le réécrit à chaque pas
quand il change. L'action `Abandons` refait la carte des autres tout de suite, parce que `withdraw`
retire toute proposition qui porte le dossard.

## §70 · Plus de délai, plus de tour par rapport à la tête · build 257

Son point 256. `CASS_DELAY_S` et `cassure()` sont retirés : dans `pairCass`, le repli sur les
positions — la seule paire qu'aucune boucle n'a encore vue ensemble — déclare la cassure sur la
mesure du moment, comme le moteur de course depuis le build 192 ; `S.cass` ne garde plus que la
dernière réponse par paire, pour le journal du code. `S.headLap`, écrit à chaque image et lu par
personne depuis la build 53 (`pitfalls.md` A10), n'est plus calculé. Le tableau des constantes du
§11 et l'état du §2 ne les portent plus.


## §71 · Le panneau de l'ovale reprend FINAL, les armements et les provenances · build 258

Son point 258. Le `<span id="rtype">` et le `<span id="barctl">` quittent `.bar` ; le `<text
id="ovtitle">` disparaît ; le `<foreignObject id="ifpanel">` (désormais x 247, y 220, 486 × 118
unités du viewBox) porte un `.ifrows` de trois `.ifrow` : `#ovtitle` devenu un `<span>` suivi de
`#rtype` ; `.togopair` (`#srcapp`, `#srccnt`), la boîte `LAP` et `#iftogo` ; `#barctl` qui ne
contient plus que `#startbtn`, `#armfinish` et l'horloge `#iftime`. Un quatrième bloc, `.ifgone`
en `display:none`, garde les boîtes `LEADER` et `#ifnext` : `IF.leadchip`, `IF.nextv` et les autres
sont encore écrits à chaque image par `renderStrip()`, et un `$()` sur rien casserait au chargement.

**Un seul écouteur.** `#barctl` est maintenant dans `#infield`, qui porte déjà `onRaceControl` :
la ligne `$('#barctl').addEventListener` est retirée, sinon chaque clic d'armement comptait deux
fois. `hitsPanel()` lit les attributs du `foreignObject`, donc l'évitement des étiquettes de groupe
suit la nouvelle boîte sans rien changer.

**Les styles**, dans le `<style>` du fichier : `.ifrows`, `#ifpanel .ifrow`, les tailles des
boîtes blanches (28 px, horloge 96 px de large), de `#iftogo` (32 px), des boutons d'armement
(26 px, comme dans la barre) et de la paire de provenances (deux lignes de 15 px, comme dans la
barre). Les règles `#barctl …` de `styles.css` ne s'appliquent plus à rien, et restent pour les
autres prototypes. Les règles `.bar #rtype{order:2}` et `.bar #barctl{order:3}` sont retirées.


## §72 · La poignée de la carte du sprint pilote le zoom de la carte · build 259 — **retiré au build 260, §73**

Son point 259. `applyLayout()` appelle `syncSprintZoom()`, qui écrit `--z-sprint` = `ZV.sprint` ×
`LAY.right / natRight()`. `natRight()` est la largeur que `styles.css` donne à `.right` sans poignée,
`clamp(500px, 29%, 560px)` de `.stage`, recalculée sur la scène mesurée ; scène non rendue, le rapport
vaut 1 (D19). Comme `#scard{zoom:var(--z-sprint)}` était déjà là pour CTRL + molette, la largeur de
mise en page de la carte reste `nat / ZV.sprint` quelle que soit la poignée : la grille
`minmax(0,1fr) 105px 172px` de `.sbody` ne voit rien changer, et tout grandit du même rapport.

`syncZone('sprint')` passe par la même fonction, pour que la molette et la poignée ne s'écrasent pas ;
l'étiquette de zoom ne montre toujours que `ZV.sprint`. Un `ResizeObserver` sur `.stage` refait le
calcul quand la fenêtre ou le rail du simulateur change la largeur de la scène (D15). Le double-clic
sur la poignée remet `LAY.right` à `null`, donc le rapport à 1. `tct.layout` garde les mêmes clés.


## §73 · Les colonnes de la carte du sprint, proportionnelles à tous les étages · build 260

Son point 260. **Tout le §72 est retiré** : `syncSprintZoom()`, `natRight()`, l'observateur sur
`.stage` et l'appel dans `applyLayout()` n'existent plus ; `syncZone()` écrit de nouveau `--z-sprint`
directement, et la poignée ne pose que `--w-right`, comme au build 258.

À la place, trois règles dans le `<style>` du fichier, qui remplacent les colonnes fixes de
`styles.css` par des fractions dans le rapport mesuré à 500 px de colonne — donc au pixel près l'écran
d'avant sans poignée :

- `#scard .sbody` : `minmax(0,187fr) minmax(0,105fr) minmax(0,172fr)` au lieu de `minmax(0,1fr)
  105px 172px` — l'ordre, la liste de départ, les commandes ;
- `#scard .shd, #scard .srow` : `22 · 32 · 38 · 22 · 22 · 22` fr au lieu de `22px 32px 38px
  minmax(0,1fr) 22px 22px` — place, BIB, NOC, gap, deux icônes ; l'en-tête suit les mêmes colonnes ;
- `#scard .shd.sl, #scard .slrow` : `32 · 22 · 37` fr au lieu de `32px 22px minmax(0,1fr)` — BIB,
  drapeau, NOC.

`minmax(0, Nfr)` plutôt que `Nfr` seul : la taille minimale automatique d'une piste `fr` est celle de
son contenu, et un contenu qui ne tient pas forcerait la piste au lieu de la laisser suivre.
`styles.css` n'est pas touché : les autres prototypes le partagent.


## §74 · Le panneau de l'ovale, aligné · build 261

Son point 261, sur `mockups/maquette-panneau-ovale.html`. Dans `#ifpanel` (x 247, y 218, 486 × 124
unités), `.ifrows` porte `.ifhead` — `#ovtitle` et `#rtype` — puis `.ifgrid`, une grille
`124px 104px 124px` × `32px` à 8 px d'écart, dont les six cases sont, dans l'ordre : `.togopair`
(`#srcapp`, `#srccnt`), la boîte `LAP`, `#iftogo`, `#startbtn`, `#armfinish`, l'horloge `#iftime`.
Chaque case prend `width:100%;height:100%` de sa cellule : c'est la grille qui aligne, pas le
contenu. L'identifiant `barctl` n'existe plus — rien ne le lisait depuis le build 258. `.ifgone` garde
`LEADER` et `#ifnext` hors écran, comme au build 258.

**L'habillage**, dans le `<style>` du fichier : la paire de provenances devient une boîte blanche
(`.togopair`) dont les deux `.srcrow` n'ont plus ni fond ni bordure, le `M` et les pas en gris clair,
la pastille de choix noire quand elle est prise (`.srcrow.on .pick`) ; `#rtype` est une boîte blanche
de 24 px, `QUALIF` en brun foncé (`#9a5a00`) au lieu de l'ambre, qui ne se lisait pas sur blanc ;
`#armfinish` (`.startb.finb`) est blanc au repos et garde le vert armé de `styles.css`. `#startbtn`,
`#iftogo` et leurs états ne changent pas. Les règles `#ifpanel .ifrow …` du build 258 sont retirées.


## §75 · La barre d'actions sous l'ovale, deux cases de dossards · build 262

Son point 262, sur `mockups/maquette-barre-actions.html`.

**L'état.** `S.selB` (un `Set`) et `S.selBox` (`'A'` ou `'B'`) rejoignent `S.selection`. **`S.selection` est
toujours la case active** : choisir l'autre case permute les deux ensembles et change `S.selBox`, de sorte que
tout ce qui lit `S.selection` — la timeline, l'ovale, les actions, Échap — suit sans rien savoir. La case A
montre `S.selBox === 'A' ? S.selection : S.selB`, la case B l'inverse. Ni `snapshot()` ni `tct.layout` ne
portent la sélection : rien à y ajouter.

**La barre.** Le rendu écrit dans `#tbar` un `.abar` : `.clears` (deux boutons `data-clear="A|B"`), `.cases`
(deux boutons `.bibs[data-box]`, `.on` pour l'active, huit dossards en `<i>`), `.rest` — une grille
`repeat(7, minmax(0,1fr))` × 2 rangs de 32 px : Group, Merge ↑, +1 lap, −1 lap, Laps…, Leader, puis No Pts
(`data-act="sprint"`, libellé « Back in sprint N » quand tous sont déjà hors sprint), No TRA (`data-act="notp"`,
« Transponder back » dans l'autre sens), Swapped, ABD, DNF, DSQ ; Crash (`data-act="group" data-type="crash"`)
en `.tall`, septième colonne sur les deux rangs. Les boutons Mech. et Back in race ne sont plus rendus ;
`data-act="back"` reste dans le gestionnaire, sans bouton. Le gestionnaire `pointerup` de `#tbar` traite
`[data-box]` et `[data-clear]` avant `[data-act]`.

**La zone du bas.** La poignée `data-rsz="acts"` n'est plus dans le HTML (`RZ.acts` et `--w-acts` restent, sans
rien qui les atteigne). `.below` est une grille `minmax(0,1fr) auto 0` — la barre, le registre, rien — et
`minmax(0,1fr) auto minmax(260px,38%)` quand elle porte la classe `withprops`, posée par le rendu dès que
`propcard` a un contenu : les propositions prennent alors leur colonne et la barre se resserre. `actsFit()` ne
zoome plus la barre : il relève sa hauteur (deux étages + les bords de la zone, 88 px) dans `--h-acts-nat` et
`actsMin`, donc la zone du bas vaut cette hauteur sans poignée et c'est son plancher. `--z-acts` reste à 1.

**Les styles**, dans le `<style>` du fichier : `.abar` (flex, 70 px), `.clears` 62 px, `.cases` 236 px qui
cèdent jusqu'à 150, `.rest` qui prend le reste ; `.abar .btn` à 100 % de sa cellule, 12 px, points de suspension ;
`.abar .bibs` blanc à texte noir, cadre bleu `.on`. Les règles `.tbar .grpb`, `.tbar .selinfo` de `styles.css`
ne s'appliquent plus à rien ici.


## §76 · La barre collée en bas · build 263

Son point 263. `body.lay-side .below > .acts{align-self:end}` : la ligne de la grille vaut toujours la hauteur de
la zone, posée ou d'usine, mais la barre ne s'y étire plus et se cale en bas. `tct.layout` porte une clé `v: 2` ;
`loadLayout()` remet `LAY.below` à `null` quand elle manque, une fois, et `saveLayout()` l'écrit ensuite.
Mesuré en 1920 × 1080 avec `{below: 250}` en stockage : zone de 88 px au chargement, barre à 982–1070 ; poignée
tirée de 150 px, zone de 238 px et barre toujours à 982–1070.


## §77 · Les commandes du simulateur à gauche · build 264

Son point 264. Seuls les `order` de la barre changent : `#undo` 4, `.bld` 5, `#simtransport` 6, `#railshow` 7,
et le ressort `.sp` passe à 9, en bout de barre. Mesuré en 1920 × 1080, simulateur masqué : onglets 228–647,
Undo 655–708, build 716–740, commandes 748–1171, Simulator 1179–1258, puis rien jusqu'à 1904.


## §78 · Les cartes au-dessus de la barre, en deux moitiés · build 266

Ses points 265 à 269 (le 265 est le build 265, resté en copie de travail : les cartes empilées sur toute la largeur).

**La zone du bas.** `.below` est une grille de deux lignes : les cartes (`#propcard`, `grid-column: 1 / -1`), puis
la barre et le registre côte à côte. Elle n'a plus de hauteur posée mais un plancher, `min-height: var(--h-below,
var(--h-acts-nat))`, et `align-content:end` : elle grandit avec les cartes, l'ovale cède, la barre reste en bas
(point 263). `#propcard` ne défile plus.

**Les deux moitiés.** `repartirCartes(html)` découpe la chaîne des cartes rendues, met les `.gq.hot` (les tours) à
gauche et les autres à droite, puis répartit rangée par rangée : chaque moitié a `cap` colonnes — autant de fois
236 + 6 px que sa largeur en contient, lue sur `propcard.clientWidth` —, une chute pèse deux colonnes, et les places
qu'un côté laisse libres sur une rangée vont aux cartes en trop de l'autre côté avant qu'une rangée de plus
s'ouvre. Le résultat est `<div class="half hg">…</div><div class="half hd">…</div>`, `#propcard` étant
`grid-template-columns: 1fr 1fr`, chaque `.half` `repeat(auto-fill, 236px)` aligné par le bas, la droite
`justify-content:end`. Le vide du milieu est le jeu des poignées (point 268).

**La forme des cartes.** Un seul gabarit, `carte(cls, head, headBtns, rows)` : `.hd > .q` porte le texte et les
boutons de carte, `.rows` une `.pb` par coureur (`rowOf(bib, btns)`) — pastille, drapeau, NOC, boutons à droite.
Le tour : titre « Lap gained? · Lap N », « ✓ all » et « ✕ » en tête, un ✓ par coureur. La chute : son titre, trois
boutons par coureur, `span 2`. Le transpondeur (`kind: 'absent'`) : `texteAbsent()` écrit deux lignes séparées
d'un `<br>` sans le dossard, et les réponses YES / NO (puis YES / ✕) sont répétées sur la ligne de chaque coureur
avec `data-bib` ; `onStripClick` appelle alors `scinderAbsent(p, bib)`, qui sort ce coureur dans une carte à lui,
au même pas, et lui applique la réponse — les autres restent dans la carte d'origine. Les cartes dont les réponses
portent un dossard (un vélo seul à une bande, « It is BIB 12 ») ont une ligne par coureur avec sa réponse ; les
autres gardent texte et boutons en tête, et une ligne par coureur sans bouton. Les `.prop` n'existent plus.

**Les couleurs** restent celles de `styles.css` et du build 151 : `.gq` bleu `#1a2238` à bord `--acc`, `.gq.hot`
vert `--play` à texte `#07290f`, `.gq.crash` `#2b1818` à bord `--crit`. Les boutons ✓ de la carte verte sont en
vert sombre plein pour rester lisibles sur le vert.


## §79 · Une carte par groupe, une chute par tour, et le plafond des moitiés · build 267

Son point 270. **La détection des coureurs non lus** (section 2 de `detect`) ne fait plus un lot par paire de
boucles mais un lot par groupe : pour chaque coureur sans lecture, `miss` liste toutes les boucles que son groupe
a passées sans lui depuis sa dernière lecture, chacune à l'heure du dernier coureur du groupe sur cette boucle ; il
en faut au moins deux, et 2,5 s depuis la dernière. S'il existe déjà une carte `absent` au pas `with` pour ce
groupe (`gname`), les coureurs la rejoignent ; sinon elle est créée avec `loops` = les deux dernières boucles du
coureur manqué le plus récemment, ce qu'écrit `texteAbsent()`. `placerPassages()` pose un passage par entrée de
`p.miss[bib]`, dans l'ordre ; `scinderAbsent()` emporte `miss` du coureur scindé.

**`ouvrirCrash(p)`** cherche un groupe `crash` du tour courant encore peuplé ; s'il existe, les coureurs y sont
déplacés (`removeFromGroups`, `rehost`, `carteCrash(g)`), sinon `newGroup` comme avant.

**`repartirCartes()`** empile chaque côté en rangées et n'envoie une carte de l'autre côté que si son côté ne peut
plus empiler sans dépasser le plafond, la moitié de la hauteur de `.mid` ; la hauteur d'une carte s'estime à
34 + 27 × ses lignes de coureurs, avant qu'elle soit dessinée.

**Vérifié ensuite** (mesures.md §118) : la carte vient 12 s après la coupure et les coureurs restent dans le peloton
en attendant la réponse ; le faux relevé d'une régression a été retiré des règles.


## §80 · La poignée sous l'ovale, visible · build 268

Son point 271. Trois règles de style : la poignée du bas passe de 6 à 8 px, son ::after prend le gris --line2 à
55 % au repos et l'accent au survol et pendant le glissé. Rien d'autre ne change : même élément, même RZ.below,
même double-clic.


## §81 · La poignée sous le dessin : elle pose la hauteur de l'ovale · build 269

Son point 272. La zone de l'ovale, .mid > .oval, passe de flex:1 1 auto à flex:0 1 auto avec aspect-ratio 854 / 492
— le rapport du viewBox — et height: var(--h-oval, auto) : sans poignée sa hauteur est celle du dessin borné par
la largeur, exactement ce que l'ancienne zone étirée dessinait (668 px pour 1160 de large), et elle se resserre si
la hauteur manque. La zone du bas prend le reste (flex:1 1 auto, min-height --h-acts-nat, align-content:end). La
poignée, data-rsz="ovh", pilote --h-oval : clé ovh dans LAY et CSSVAR, plancher 120 px, plafond la zone moins la
barre et ses écarts ; sign +1, le double-clic l'efface. Le cran belowDetent() n'a plus d'objet. Une valeur below
gardée dans tct.layout n'est plus lue. Mesuré en 1920 × 1080 : dessin 668 px, poignée à 738, tirée de 200 px le
dessin fait 468 et la barre reste à 982–1070 ; double-clic, 668 de nouveau.
