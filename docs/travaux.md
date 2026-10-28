# Les travaux à faire

**La liste de ce qui reste à construire, et de ce qui est cassé.** Ouverte le 28 octobre
2026, parce qu'il n'en existait aucune : jusque-là les travaux en attente étaient dispersés
entre cinq documents, chacun sous la forme d'une remarque au passage.

Ce fichier ne contient **ni règle ni mesure** : une règle est dans `regles-operateur.md`, un
chiffre dans `mesures.md`. Ici on dit seulement **ce qui n'est pas fait, et à quoi on saura
que c'est fini**.

**Ce fichier n'est pas une liste de souhaits.** Rien n'y entre que l'opérateur n'ait demandé
ou qui ne soit un écart constaté entre sa règle et le code. Une idée que personne n'a
demandée n'a pas sa place ici.

---

## Ce qui attend une décision de l'opérateur, pas du code

Dix points, dans `regles-operateur.md` §15. **Ils ne sont pas recopiés ici.** Tant qu'ils ne
sont pas tranchés, le travail correspondant n'existe pas : coder une réponse à sa place est
l'erreur `pitfalls.md` A12.

Deux d'entre eux bloquent un travail de cette liste et sont signalés à l'endroit voulu.

---

## 1. La mise en place et le tour de lancement

**Demandé le 27 octobre 2026. Rien n'est codé** : ni la phase dans le simulateur, ni la
vérification des transpondeurs, ni les propositions. C'est le plus gros poste de la liste, et
il est en attente depuis plusieurs sessions.

La règle, mot pour mot, est dans `regles-operateur.md` §12 — le déroulé, l'exigence
d'infaillibilité, et les cinq précisions qui changent la lecture de la phase. **La lire avant
de dessiner quoi que ce soit** : trois de ces précisions retournent complètement ce qu'on
croit mesurer.

### Ce qu'il faut construire

| | Travail | Fini quand |
|---|---|---|
| a | **La phase elle-même dans le simulateur** : montée sur la piste près de Pursuit A, tour lent, arrêt derrière la boucle Finish en deux files, coup de sifflet, tour de lancement, coup de pistolet | On peut rejouer la phase entière et voir ce que les boucles lisent à chaque étape |
| b | **L'exploitation des passages sur Pursuit A à la montée** | Un transpondeur lu à la montée est confirmé, et l'écran le dit |
| c | **L'écran de vérification des transpondeurs**, avec les quatre cas du tableau de `concept.md` (attendu détecté, attendu absent, inconnu, transpondeur d'un autre partant). Il répond à **« qui est confirmé ? »**, pas à « qui manque ? » — voir le piège 1 ci-dessous | Chaque cas produit sa proposition, l'opérateur l'approuve d'un clic, la table est corrigée pour la course et le journal en garde la trace |
| d | **Le départ proposé au franchissement de la boucle Finish** à la fin du tour de lancement | Le logiciel propose l'instant du départ ; l'opérateur confirme ou corrige |
| e | **Les trois clics de l'opérateur** dans cette phase, et rien de plus | La phase se mène en trois gestes |
| f | **Oublier le clic du tour de lancement ne doit pas empêcher la course de partir** | On lance une course sans avoir cliqué, et elle part correctement |

### Les trois pièges de cette phase, déjà écrits

Ils viennent des précisions du 27 octobre et ne sont **pas** des choix d'implémentation :

1. **Le tour lent n'est pas un inventaire.** Les coureurs roulent souvent sur le béton plat à
   l'intérieur de l'ovale, que ni les boucles ni les tape switches ne couvrent. Une lecture
   prouve qu'un transpondeur marche ; une absence de lecture ne prouve rien. Un écran qui
   affiche « 3 transpondeurs manquants » pendant le tour lent est faux.
2. **À l'arrêt, le matériel est incertain.** « Un transpondeur sur un vélo pas en mouvement
   peut soit détecté une fois, soit pas détecter. » Rien ne se conclut de l'attente avant le
   départ.
3. **Il n'y a pas d'heure limite pour le verdict.** La vérification n'est pas une barrière
   avant le coup de pistolet : c'est un état qui se précise et qui reste corrigeable en pleine
   course.

Conséquence : **le premier moment où une absence de lecture devient une information est le
tour de lancement**, parce que c'est le premier moment où tout le monde est certainement sur
la piste et franchit toutes les boucles. Tout l'écran se construit autour de cette asymétrie.

### Avant de coder

L'opérateur veut **voir les écrans proposés et les critiquer tour par tour avant toute
ligne de code** (`regles-operateur.md` §14). Le premier livrable de ce poste est donc une
proposition d'écrans, pas un commit.

---

## 2. Le scénario de test qui exerce la conséquence sur le rang

La conséquence sur le rang (`regles-operateur.md` §7) et les lignes grisées (§8) **ne sont
vérifiées que sur cas forcé** : la course de référence ne les exerce jamais, parce qu'aucune
de ses fenêtres d'inéligibilité ne tombe sur l'ouverture d'un sprint. Les chiffres sont dans
`mesures.md` §6 et §7.

**Le travail** : construire un second scénario où les BIB 4 et 11 décrochent assez tôt pour
se trouver entre le peloton et la ligne à l'ouverture d'un sprint. Il exercerait les deux
règles d'un coup.

**Fini quand** le scénario se charge depuis l'onglet Files comme la course de référence, et
que `mesures.md` porte ce qu'il donne.

---

## 3. `S.headLap`, calculé et lu par personne

Écrit à chaque image dans `computeGroups`, plus aucun appelant ne le lit depuis la build 53.
Il a servi de caution à un seuil inventé — c'est `pitfalls.md` A10, et A9 raconte ce que
cela a coûté.

**Le travail** : le retirer, ou le rebrancher sciemment. Les deux sont acceptables ; le
laisser tel quel ne l'est pas, parce qu'un calcul qui traîne finit par justifier une règle.

---

## 4. L'alerte de passage manqué adoucie par le tape switch

Décrit dans `concept.md` (tableau de l'inférence des positions), **pas codé** : quand un
coureur n'est pas lu mais que le tape switch a compté un vélo de plus que la boucle, sa
présence dans le groupe est confirmée et l'alerte devrait s'adoucir. Tout ce qu'il faut est
déjà mesuré par `tapeCount()`.

---

## 5. Ce que le prototype ne simule pas du tout

Aucun de ces points n'est un bug : ils n'ont jamais été construits.

- **La chute** et, avec elle, la neutralisation d'un coureur et ses trois issues.
- **Le lap counter relié**, et donc le recalage du compteur sur lui.
- **La réception de la photo-finish.** Le flag part du chrono et se lève à la main ; le retour
  n'existe pas.
- **Le sprint tombé pendant une course neutralisée.**
- **La liste de départ réelle** : couleurs et NOC sont en dur dans le fichier.
- **Les exports sont des fichiers**, pas un flux vers TV, scoreboard et web.
- **La Madison, la course tempo et le scratch.**

---

## 6. Le simulateur et l'application

Demandé par l'opérateur le 28 octobre 2026.

### a. Supprimer et renommer une course dans l'onglet Files

> « dans l'onglet Files il faut pouvoir supprimer des courses et renommer les courses »

**Constaté dans le code à la build 68** : la suppression **existe** (`data-del` est traité) mais
le gabarit d'une ligne de course ne dessine qu'un bouton *Load* — il n'y a donc aucun moyen de
l'atteindre. Le renommage n'existe pas du tout.

**Fini quand** chaque ligne de l'onglet Files porte de quoi supprimer et de quoi renommer, et
que les deux survivent à un rechargement de la page.

### b. Trier la liste des coureurs

> « il faut pouvoir trier la liste des coureurs par BIB, NOC alphabétique, ou nom
> alphabétique. un clic sur l'en-tête inverse l'ordre »

**Fini quand** les trois tris marchent et qu'un second clic sur le même en-tête inverse
l'ordre.

### c. Une course de 24 coureurs

> « il faut pouvoir créer une course avec 24 coureurs max. L'app doit le permettre »

24 est le maximum d'un peloton (`regles-operateur.md` §5). **Constaté à la build 68** :
`addRosterRider()` ne contient **aucune limite** de nombre — ce qui empêche d'arriver à 24 est
donc ailleurs, et n'a pas été cherché.

**Fini quand** une course de 24 coureurs se crée, se joue de bout en bout et s'affiche
correctement — timeline, ovale et carte de sprint.

---

## 7. À déboguer

### a. Le scénario de la course de référence repart sur une course neuve

Signalé par l'opérateur le 28 octobre 2026, mot pour mot :

> « quand je commence une nouvelle course, à partir du lap 4 ou 5 la vitesse des coureurs 12,
> 4 et 11 est encore et toujours automatiquement (comme dans la course de référence).
> Peut-être que le système ne me laisse pas créer de nouvelle course et redémarre toujours sur
> le modèle de la course de référence ? Si c'est le cas il ne faut pas que la course de
> référence soit une course de référence, il faut que ce soit une course que l'on peut rejouer
> comme les autres. »

**Ce qui est vérifié dans le code à la build 68**, sans aller plus loin :

- `reset()` met bien `useScript: false` — c'est le correctif de la build 65, `pitfalls.md` A11.
- Mais **deux chemins le remettent à sa valeur d'avant après le `reset()`** : le bouton
  *Restart* et `rewind30()`, tous deux par un `const keep = S.useScript`. Une fois la course de
  référence chargée, le scénario reste donc actif à travers un Restart.
- Dans l'onglet Files, la course de référence est rendue **à part** des autres, avec l'indice
  `-1` et une classe `ref` : c'est bien un cas particulier et non une course ordinaire.

**La cause n'est pas diagnostiquée et rien n'a été corrigé.** Ce qui précède est une piste,
pas un verdict.

**La demande de l'opérateur va plus loin que le bug** : il ne veut pas qu'on colmate le
`useScript`, il veut que **la course de référence cesse d'être un cas particulier** et devienne
une course enregistrée comme les autres, qu'on charge, rejoue, renomme et supprime.

**Fini quand** : une course neuve ne bouge jamais toute seule, quel que soit ce qui a été
chargé avant ; la course de référence apparaît dans l'onglet Files comme les autres ; et le
poste 6a s'applique à elle aussi.

### b. Les deux boucles de poursuite ne sont pas en face l'une de l'autre sur l'ovale

> « sur l'ovale les lignes de poursuite doivent être exactement en face l'une de l'autre. Ce
> n'est pas le cas actuellement »

C'est la règle de `regles-operateur.md` §9 : les deux boucles sont **exactement à une
demi-longueur de piste** l'une de l'autre, chacune au milieu de sa ligne droite.

**Ce qui est vérifié à la build 68** : dans le modèle, les positions sont exactes —
`applyCfg()` calcule Pursuit B à exactement une demi-piste de Pursuit A. **Le défaut est donc
dans le dessin de l'ovale**, pas dans les distances : le tracé convertit une distance en point
sur un contour arrondi, et une demi-piste de distance n'y tombe pas en face.

**Fini quand** les deux repères sont visuellement en face l'un de l'autre sur l'ovale, pour
250 m comme pour les autres longueurs de piste.

### Le reste

Aucun autre bug connu au 28 octobre 2026. La course de référence tourne de bout en bout sans
erreur de console, les deux propositions de tour tombent aux instants attendus, les quatre
sprints sont jugés et le classement sort (`mesures.md` §12 et §13).

Les écarts connus entre le code et la règle ne sont **pas** ici : ils sont dans le tableau de
`cas-de-course.md`, chacun avec son statut et sa date. Au 28 octobre 2026 ce tableau ne porte
aucune non-conformité.

**Si un bug apparaît, il vient ici**, avec ce qu'on a vu, le build, et comment le reproduire —
pas dans `pitfalls.md`, qui ne garde que les erreurs **comprises et corrigées**.

---

## Comment tenir cette liste

1. **Un poste entre ici quand l'opérateur l'a demandé**, ou quand on constate un écart entre
   sa règle et le code.
2. **Un poste dit à quoi on saura que c'est fini.** Sans cela ce n'est pas un travail, c'est
   une intention.
3. **Un poste sort d'ici quand c'est codé et mesuré.** L'opérateur l'a posé en règle le
   28 octobre 2026 : « lorsque ces points seront implémentés il faudra que tu mettes à jour
   les docs en conséquence ». Donc, dans le même tour que le code : la ligne de
   `cas-de-course.md` passe conforme, les chiffres vont dans `mesures.md`, le code se décrit
   dans `architecture.md`, l'erreur comprise va dans `pitfalls.md`, et **le poste disparaît
   d'ici**. On ne garde pas d'historique dans ce fichier — il est dans `mesures.md` et dans
   `pitfalls.md`.
4. **Ce qui attend une décision de l'opérateur reste dans `regles-operateur.md` §15**, jamais
   ici.
