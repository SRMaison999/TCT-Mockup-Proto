# Architecture du prototype `timeline-prototype.html`

**Ce fichier décrit le code, et seulement le code.** Il ne contient aucune règle de course
— celles-ci sont dans `regles-operateur.md` — et aucun chiffre de mesure — ceux-là sont
dans `mesures.md`. L'index « quelle règle, codée où, quel statut » est
`cas-de-course.md`.

**Trois fichiers statiques, chargés par balise, sans empaquetage** (`styles.css` et
`flags.js` extraits à la build 90, pour que le HTML reste maniable) :
- `styles.css` : tout le CSS, repris sans changement.
- `flags.js` : les drapeaux SVG des nations (`FLAGS`, `flag()`, et leurs sept helpers
  `fv`/`fh`/`fb`/`fd`/`ft`/`fstar`/`fu`) — une donnée pure, sans dépendance, chargée avant
  le script principal pour que `flag()` existe quand celui-ci en a besoin.
- `timeline-prototype.html` : le HTML, puis le script principal dans une fermeture
  immédiate. C'est le seul des trois à contenir l'état et la logique de la course.

Les trois partagent la portée globale du navigateur (aucun module ES, aucun `import`) :
l'ordre des balises `<script>` est ce qui garantit que `flags.js` s'exécute avant le script
principal. Tout l'état de la course vit dans l'objet `S`, recréé par `reset()`.

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
headLap[bib]                        tours de position par rapport au coureur de tête.
                                    ⚠️ CALCULÉ À CHAQUE IMAGE ET LU PAR PERSONNE depuis la build 53
                                    (voir pitfalls.md A11) : à retirer ou à rebrancher sciemment
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

8. Noms : `groupName(g, G)` → Bunch, Break n, Chase n, Crash, Mechanical.

**`computeGroups` a des effets de bord** (`S.inelig`, `S.headLap`, `S.bunchRaw`,
`S.posOf`, désignation du leader) : ne jamais l'appeler une fois de plus pour prendre une
mesure. Lire `lastG`, que `render()` pose.

## 5. `detect(G, M)` : les propositions

**Tours gagnés et perdus** — le *quand* réécrit à la build 66, le *combien* à la build 67.

L'événement est l'image où le coureur **entre dans l'amas du peloton** : `r.inBunchPrev`
était faux, il est vrai maintenant. L'appartenance à l'amas *est* le test de cassure (§4.1),
donc il n'y a aucune mesure séparée, aucune distance au peloton testée et aucune tolérance.

Le nombre de tours se mesure contre **le coureur d'en face** (`regles-operateur.md` §4) :
`delta = Math.round((m.pos − face) / TRACK)`, où `face` est la position du coureur d'en
face. `delta` non nul → proposition, `0` → rien, il a seulement refermé un écart ordinaire.
Les deux positions sont **brutes** (`m.pos`, jamais la position repliée de l'affichage). Un
coureur non lu à cet instant ne produit rien : on ne propose que ce que les boucles
montrent.

**Qui est le coureur d'en face.** `facingPos(bib)` part de la place du coureur dans
`S.bunchSeq` et s'écarte d'un cran à la fois, vers l'arrière puis vers l'avant, jusqu'au
premier voisin qui était **déjà dans le peloton** à l'image précédente. Le voisin ainsi
trouvé est bien celui que la règle désigne : le **dernier** coureur du peloton pour un
coureur qui le rattrape par l'arrière, le **premier** coureur du peloton pour un coureur que
le peloton rattrape — ce sont précisément les deux coureurs consécutifs à la frontière des
deux groupes. Les attardés ou les échappés qui roulent entre les deux sont sautés, parce
qu'ils ne sont pas le peloton. Si aucun voisin du peloton n'est lu, on retombe sur
`S.bunchRaw`, qui est le premier coureur du peloton : même famille de mesure.

Les coureurs qui arrivent avec le même `delta` sont regroupés dans **une seule**
proposition. Une proposition déjà ouverte pour un coureur l'exclut.

Le mécanisme précédent, `r.bunchSide` (le camp mémorisé avant la fusion), a été **retiré** à
la build 66. S'il réapparaît dans un document, ce document est périmé.

Une proposition est **ajoutée** à la fusion et n'est **retirée** qu'à la validation ou au
rejet. Les propositions de tour n'ajoutent aucune marque sur la timeline ni sur l'ovale.

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

L'arrivée s'ouvre quand `kn = ka − implied ≥ LAPS` — **mesuré, pas crédité** — et se ferme
quand tous les coureurs en course ont passé la ligne depuis. `implied` se calcule ici aussi
contre `S.bunchRaw`, donc contre le premier coureur du peloton — ce qui est exactement le
tour du peloton au sens de `regles-operateur.md` §5.

**Le décodeur lit un transpondeur, pas un coureur.** `step()` prend
`nb = tpById(r.tp).bib`, le nom que la **table** donne au transpondeur monté sur ce vélo,
et classe tout sous ce nom : `o.rec`, `S.reads`, la vue Crossings, `S.passes`, l'ouverture
de l'arrivée, la boucle armée. Un transpondeur que la table ne nomme pour personne ne
produit aucune lecture.

## 8. Rendu

- **`renderTimeline(G)`** : blocs, lignes (`.trow`, grille BIB · drapeau · NOC · nom ·
  écart · tours), boutons de survol (`.ra`), panneau de compteurs et de couleur
  (`.ledger`), zones de dépôt (`.tgap`), section Withdrawn, barre de sélection (`#tbar`).
  L'écart est dans l'en-tête du bloc (`.gno`, `.ggap`), pas sur les lignes de coureurs. La
  marque de tours n'apparaît que sur les coureurs en attente de validation.
- **`renderOval(G, M)`** : bandes (`#bands`), coureurs sur trois files (dossards de rayon
  15, sans marque de tours) avec un pas minimal de 32 px, étiquettes à l'extérieur avec
  évitement de collisions (`putLabel`), leader nommé. `pt(s)` et `normalAt(s)` projettent
  une distance de course sur le tracé SVG `#trackpath`, qui **commence au milieu de la ligne
  droite d’arrivée**, là où se trouve Pursuit A (§14) ; sens de course : bas vers la droite. `renderMarks()` calcule les repères des boucles et des bandes depuis
  la distance de course, ils ne sont plus dessinés en dur.
- **Inéligibles sur l'ovale** : `noPts` = `S.inelig`, plus les coureurs du sprint ouvert
  dont le rang brut est 1 à 4 et la raison `lap down`. Dessinés en rouge (`#FF5C5C`), anneau
  clignotant (`class="blink"`, sous `@media (prefers-reduced-motion: no-preference)`), et
  une étiquette « No points » hors de la piste reliée au dossard par un pointillé.
- **Interactions** : clics délégués sur `#tlbody`, `#tbar`, `#logrows` ; glisser au pointeur
  (`pointerdown/move/up`) sur la timeline et sur l'ovale, avec une étiquette fantôme ; sur
  l'ovale, sélection et actions de groupe **au relâchement** du pointeur.

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
que pour ce sprint). `reinstated` lève tout sauf le retrait. ⚠️ `spWhy` renvoie encore le
texte `lap down`, dont le libellé est à trancher.

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
`body.sprintmode` masque l'ovale et le panneau bas. Clics délégués sur `data-sact`,
double-clic sur `.slrow`, Entrée dans `#sinp` (focus conservé au re-rendu), glisser au
pointeur entre `.srow`, `.slrow` et `.sdrop`. Onglets Sprints (`renderSprintsTab`) et
Standings (`renderStandingsTab`) ; exports par `download()`.

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

`RIDERS` (dossard, nom, NOC, couleur), `REF_RACE` (la course de référence : une configuration
et deux ordres, §15), `FLAGS` (drapeaux SVG simplifiés), `PALETTE`, `NOTP = []` (tous les coureurs ont un
transpondeur au départ ; le statut se pose à la main), `TIGHT` (deux coureurs à 11 ms au
sprint 2).

| Constante | Valeur | Rôle |
|---|---|---|
| `DEF` | `{track: 250, laps: 40, sprints: 4, gap: 10, pace: 15}` | réglages par défaut, copiés dans `CFG` |
| `GROUP_GAP_S` | 1.0 | la cassure, en secondes |
| `BIKE_L` | 1.65 | longueur de vélo, en mètres |
| `CASS_DELAY_S` | 0.3 | délai de confirmation d'une cassure |
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
- **Files** : la course en cours d'enregistrement, la course de référence qui reste intacte,
  puis les courses enregistrées, chacune avec un bouton `Load`. Chaque course s'auto-nomme
  d'après ce qu'on y a fait (`raceName`) et s'enregistre **automatiquement** dans
  `localStorage` (`tct.sim.races`) quand on ouvre une course neuve avec `+` (`commitRec()`).
  `Open file…` relit un `.json` externe. **Une course neuve est un peloton nu** : elle n'a
  aucun ordre, donc rien ne peut l'animer toute seule (§15).

**La largeur de la colonne suit son onglet (build 64).** `railWidth()` additionne les
colonnes affichées et les cinq commandes toujours présentes, borne le résultat entre
`RAIL_MIN` et `RAIL_FULL`, et l'écrit dans `--railw`. Les quatre autres onglets gardent
`RAIL_FULL` : ils ont été dessinés pour.

**Section Race** : trois lignes centrées, en bas de colonne. `▶` / `❙❙` / `↺` ;
`×1`/`×4`/`×16`, **×1 par défaut** ; une horloge en gros caractères (`#simclock`) ;
**Rewind 30s**. Juste en dessous : Laps et Sprints, éditables au clavier.

**Ces commandes survivent au repli de la colonne (build 63).** `railHide()` **déplace** le
bloc `#simtransport` dans la barre du haut au lieu de le cacher avec la colonne, et le remet
dans `#railtransport` quand la colonne revient : ce sont les mêmes nœuds, donc un seul
bouton Play et une seule horloge dans la page, et aucun écouteur à redoubler. `tickRail()`
écrit l'horloge **avant** de sortir quand la colonne est masquée, sinon elle se figeait dans
la barre. La barre prend la classe `withtransport`, qui cache le titre pour faire la place.

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

## 13. `maquette-groupes.html`

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
(`OVAL_W+2`), et le retrait que gardent les étiquettes de boucle dans l'anneau intérieur.
Changer ce seul nombre suffit, et rien ne peut diverger.

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
des 100 m, les trois autres sous un trait de boucle. Seules leurs étiquettes restent, et
`tapeCount()` continue de les compter — c'est un retrait de dessin, pas de mesure.

Les lignes du 200 m lancé suivent la même règle que `buildTapes()` et en reprennent les deux
cas particuliers : rien sur une piste de **166 m**, et sur une **200 m** le départ du 200
tombe sur la ligne d'arrivée, qui porte déjà sa marque. La ligne des 200 m traverse toute la
largeur, celle des 100 m la moitié.

`pt()` et `normalAt()` ne sont lus que par `renderMarks()` et `renderOval()` : **le dessin
de l'ovale n'entre dans aucune mesure**. Changer la forme, la largeur ou les marquages ne
peut donc rien déplacer dans les groupes, les tours, les sprints ou les bandes.

---

## 15. La course de référence, et les trois boutons de la barre

**Il n'y a plus de scénario dans le simulateur (build 74).** La table `SCRIPT`, le drapeau
`S.useScript` et le mode `away` ont été supprimés ; ils ne sont pas remplacés. La course de
référence est une **course enregistrée** comme les autres : `REF_RACE` porte une `cfg` et une
liste d'`acts`, que `loadRace()` met dans `S.replay` et que `replayTick()` applique sur
l'horloge, exactement comme pour une course que l'opérateur a jouée lui-même.

**Et à la build 75 elle quitte le code.** `REF_RACE` n'est plus une ligne que l'onglet Files
ajoute à la liste : c'est un **modèle de départ**. Au chargement de la page, `localStorage`
est lu ; si la clé `tct.sim.races` est **absente** — le prototype n'a jamais tourné sur ce
poste — une copie de `REF_RACE` est déposée dans `RACES` et la liste est écrite. Si la clé
existe, même vide, elle fait foi : c'est la liste que l'opérateur a laissée. La distinction
compte, parce que c'est elle qui fait qu'**une course de référence effacée reste effacée**.
Rien en aval ne sait d'où vient cette ligne : plus d'indice `-1`, plus de drapeau `ref`, plus
de bordure verte sur sa ligne.

**Renommer et effacer (poste `travaux.md` §6a).** Chaque ligne porte *Load*, *Rename* et
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