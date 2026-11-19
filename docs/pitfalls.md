# Les erreurs déjà commises, et les scénarios à rejouer

**Ce fichier ne contient que des erreurs et leur cause.** Chaque point a coûté au moins une
version du prototype. Les règles de course sont dans `regles-operateur.md`, les chiffres
dans `mesures.md`, le code dans `architecture.md`, l'index dans `cas-de-course.md`.

Les choix retenus ont été validés avec l'opérateur : **ne pas les remettre en cause sans
lui**.

---

## A. Modèle de course

**A1. Replier les positions sur un tour de piste.** Première version : chaque coureur placé
à `(leader − pos) mod TRACK`. Un coureur 4 m devant le leader sur la piste apparaissait
« 246 m derrière ». Puis un attaquant qui rattrape des retardataires avait l'air d'être avec
eux. Retenu : la distance de course est **continue**, du leader jusqu'à la queue, même
au-delà d'un tour ; les groupes sont les paquets physiques ; un paquet dont les membres ont
un tour d'écart est affiché en deux blocs.

**A2. Confondre position, tours mesurés et tours crédités.** Trois notions distinctes : la
position mesurée par les boucles ; le nombre de passages de plus ou de moins que le peloton
(`implied`) ; les compteurs validés par l'opérateur (`laps`). Retenu : la position
d'affichage tient compte des tours crédités **dans la limite de ce que les boucles
mesurent**. Un tour crédité à la main sans mesure ne déplace personne et ne déclenche aucune
contre-proposition.

**A3. Un coureur non validé terminait la course un tour trop tôt.** L'arrivée s'ouvrait sur
`ka − lapStatus ≥ LAPS`, donc au dernier passage d'un coureur qui avait bouclé un tour sans
être crédité, alors que le peloton en était au tour d'avant. Retenu : l'arrivée s'ouvre sur
le tour **mesuré** de la tête de course (`kn = ka − implied`), et se ferme quand chaque
coureur encore en course a passé la ligne.

**A4. Compenser un tour perdu par un tour gagné.** Interdit : les deux compteurs servent au
départage. Toute logique de « net » doit rester dérivée.

**A5. Le peloton simulé qui ralentit tout seul.** Le ressort qui tient le peloton visait une
position cible décalée en moyenne ; la vitesse chutait de 2 m/s et tous les événements du
scénario se produisaient à de faux tours. Retenu : décalages centrés sur la moyenne.
**Vérifier la vitesse du peloton après tout changement de simulation.**

**A6. Le leader ne doit pas être figé.** Un leader désigné reste la référence jusqu'à ce
qu'un autre coureur le dépasse physiquement ; les relais dans un peloton changent donc le
leader, c'est accepté. S'il disparaît des lectures, l'application reprend le leader sur la
piste et le journalise.

**A7. Grouper sur l'ovale au lieu de la timeline.** En calculant les groupes sur
`pos mod TRACK`, deux retardataires se retrouvaient dans le même groupe que le coureur qui
était en train de les doubler. Retenu : **les groupes se définissent dans la timeline**, sur
la distance de course continue. C'est l'énoncé de l'opérateur, et c'est aussi A1 appliqué aux
groupes.

**A8. Le seuil de groupe est un temps, pas une distance.** `GROUP_GAP_S` se multiplie par la
vitesse médiane : 2 s valaient environ 28 m, pas 2 mètres. Passer à la cassure (1,000 s)
coupe donc les groupes **deux fois plus tôt**, pas quinze fois. **Vérifier l'unité avant
d'annoncer un ordre de grandeur à l'opérateur.**

**A9. Mesurer un tour gagné à la distance au lieu de la cassure — l'erreur la plus
instructive du projet.**

Le symptôme, signalé par l'opérateur : il envoie deux coureurs prendre un tour et un
troisième en perdre un ; dès que les deux premiers arrivent sur le troisième — qui est au
même endroit qu'eux sur la piste, à deux tours près — le système leur propose un tour gagné,
alors qu'ils n'ont rattrapé personne. La cause : `detect()` décidait « ce coureur a un tour
d'écart » avec `Math.round(écart / TRACK)`, et `Math.round(0.5)` vaut 1, donc un coureur à
un demi-tour devant le peloton était déjà marqué « un tour devant ».

**La première correction était fausse, et pour une raison qui compte plus que le bug** : un
seuil inventé (« à moins d'un quart de tour d'un tour entier »), justifié par la marge que
porte `S.headLap` — qui n'est le réglage de personne et que, de surcroît, **plus rien ne
lit** (voir A10). La règle de l'opérateur était écrite depuis le 25 octobre dans
`regles-operateur.md`, et elle ne parle d'aucune distance.

**Retenu, et conforme à l'énoncé** : la cassure dit **quand**, les passages disent
**combien** (`regles-operateur.md` §4). Aucun seuil, aucune tolérance.

**La leçon n'est pas technique : la règle était écrite et je ne l'avais pas lue.** Avant de
toucher aux tours, aux groupes, au merge ou à l'éligibilité, lire `regles-operateur.md` du
§1 au §7. Un seuil qui n'y figure pas n'a rien à faire dans le code.

**A10. `S.headLap` est calculé et lu par personne.** Il est écrit à chaque image dans
`computeGroups`, avec une marge d'un quart de tour, et plus aucun appelant ne le lit depuis
que l'éligibilité est passée à `S.inelig` (build 53, voir H6). Il a quand même servi de
caution à un seuil inventé (A9). À retirer, ou à rebrancher sciemment — **mais ne pas s'en
servir pour justifier une règle.**

**A11. Le scénario de la simulation tournait sur toute course neuve.**
`S.useScript` valait `true` dans `reset()`, donc trois coureurs du scénario bougeaient
**pendant que l'opérateur pilotait les siens** — trois vitesses qui changent pour une raison
qu'il n'a pas demandée. Retenu : une course neuve est un peloton nu, et le scénario arrive
avec la simulation, qui se charge depuis l'onglet Files. **Conséquence pour les
tests : la simulation ne se mesure plus sur un `reset()`, il faut la charger
d'abord.**

⚠️ **Le correctif n'a pas tenu**, et le 28 octobre 2026 l'opérateur a signalé que le scénario
tournait encore sur une course neuve. `reset()` mettait bien `useScript: false`, mais le
bouton Restart et `rewind30()` le remettaient après coup, chacun par un `const keep`.

✅ **Résolu à la build 74, en supprimant la chose plutôt que le symptôme.** Il n'y a plus de
`SCRIPT`, plus de `useScript`, plus de mode `away` : la simulation est une course
enregistrée comme les autres, deux ordres sur l'horloge. Aucun drapeau ne peut donc survivre à
un `reset()`, parce qu'il n'y a plus de drapeau. **La conséquence pour les tests ne change
pas** : la simulation se charge depuis l'onglet Files avant d'être mesurée, et c'est
désormais vrai pour la même raison que pour n'importe quelle autre course enregistrée.

**A12. Les précisions de l'opérateur ne sont pas des demandes.** Il a donné les longueurs
réelles des tape switches ; elles ont été codées à la build 61, et il a demandé de les
retirer : « mais pourquoi tu as ajouté la largeur des bandes ? il e faut pas le faire ».
Retiré à la build 62. Un fait qu'il énonce est du contexte ; une demande est une demande.
Quand c'est ambigu, **demander**.

**A13. Modifier le moteur parce qu'un bug y a été signalé.** L'opérateur a signalé une fausse
proposition de tour ; le moteur des tours a été réécrit deux fois, sans rien lui montrer,
dans la zone qu'il avait le plus expliquée. Sa réaction : « dis-moi pourquoi tu as modifié
l'application ? » Un rapport de bug n'est pas une autorisation de récrire la règle : on
montre le diagnostic, on cite la règle telle qu'elle est écrite, on propose, **et on code
après son accord.**

**A14. Chercher dans le calcul un défaut qui était dans le décor.** L'opérateur signale que
les deux Pursuits ne sont pas en face l'une de l'autre sur l'ovale. On a soupçonné
la conversion d'une distance en point sur un contour arrondi. C'était faux : le contour a
une symétrie de rotation d'un demi-tour, donc deux points séparés d'une demi-piste y tombent
**toujours** diamétralement opposés — ils l'étaient déjà. Ce que l'œil voyait, c'est qu'ils
n'étaient pas au **milieu de leur ligne droite**, et cela parce que le tracé commençait à la
ligne d'arrivée, posée à 12 m du milieu de la ligne droite d'arrivée. Ce 12 m n'était la
mesure de personne : il venait du point de départ du chemin SVG, écrit à la main.

Retenu : **ancrer le dessin sur ce que la règle impose** — Pursuit A au milieu de la ligne
droite (`regles-operateur.md` §9) — et laisser la ligne d'arrivée se placer à ses `gap`
mètres réels. Corrigé build 69, chiffres dans `mesures.md` §14.

Deux leçons au-delà du dessin. **« En face » et « diamétralement opposé » ne sont pas la
même chose** : sur un ovale, deux points opposés par rotation ne sont alignés que s'ils sont
au milieu des lignes droites. Et **une piste suspectée n'est pas une cause** : celle-ci a été
vérifiée avant d'être suivie, et elle était fausse. Un défaut signalé donne ce qu'on a vu, pas
le verdict.

## B. Propositions

**B1. Un bloc à part jusqu'à validation, puis fusion.** Le coureur qui venait de prendre ou
de perdre un tour restait dans son bloc jusqu'à la validation. Ce comportement a été modifié
une fois sans accord et a dû être rétabli.

> **Remplacé le 25 octobre 2026, par l'opérateur lui-même** (`regles-operateur.md` §3). Il
> rejoint le bloc du peloton dès qu'il n'y a plus de cassure entre lui et le peloton, sans
> attendre la validation. C'est la seule façon dont ce comportement pouvait changer :
> l'opérateur l'énonce, on le consigne mot à mot, on le code. **L'interdiction d'y toucher
> de sa propre initiative reste entière** (voir D10 et A13).

**B2. Proposer sur un écart de compteur.** Le détecteur proposait dès que compteur ≠ mesure,
donc un « lap lost? » aussitôt après un « +1 lap » réglé à la main. Retenu : proposer
seulement ce que les boucles mesurent.

**B3. Une proposition affichée deux fois**, dans chaque bloc contenant l'un de ses coureurs.
Retenu : une seule fois, dans le premier bloc.

**B4. Deux coches pour la même chose.** Pour un seul coureur, la coche est sur sa ligne ; la
ligne de proposition ne garde que ✕ ; « ✓ all » n'apparaît qu'avec plusieurs coureurs. Pas
de bouton « Later ».

**B5. Une proposition apparue pendant une pause n'était affichée qu'au rafraîchissement
suivant.** Si `detect` change le nombre de propositions, recalculer les blocs dans la même
image.

**B6. Les marques +1 / −1 de la timeline.** Retirées de la timeline et de l'ovale (build
50), sur demande de l'opérateur, qui ne veut pas de mention « +1? ».

## C. Vue Crossings

**C1. Ranger par le tour du compteur à l'instant du passage** fait glisser les coureurs
d'une ligne à l'autre dès qu'ils ne sont plus dans le tour du leader. Faux.

**C2. Ranger par le N-ième passage brut de chaque coureur** est exact mais inutile pour le
jury : un coureur 5e au sprint doit être annoncé 5e sur la ligne de ce sprint, pas 16e un
tour plus tard. Retenu : **méthode du re-rangement**, ligne N = tour de course tel que jugé ;
un coureur crédité est rangé sur le compte du peloton ; pastille du nombre réel de passages
sur le dossard.

**C3. Le re-rangement marque chaque passage et crée un trou.** Un tour gagné ajoute un
passage dans une ligne, un tour perdu en retire un. Retenu : la marque « lap gained / lap
lost » une seule fois, sur le passage concerné ; la ligne où un coureur doublé n'a pas de
passage porte « lapped, no crossing ».

**C4. Validation avant le passage suivant.** Si l'opérateur valide avant que le coureur ne
repasse la ligne, rien n'est à re-ranger : poser la marque sur le prochain passage
(`markPending`).

**C5. Le passage de la ligne au départ** n'est pas un tour : les coureurs partent avant la
ligne.

## D. Interface et navigateur

**D1. Reconstruire la timeline à chaque image tue le glisser-déposer** et rend tout fuyant.
Retenu : reconstruction sur changement seulement, ou une fois par seconde en simulation,
**jamais pendant un glisser**.

**D2. L'ovale est redessiné toutes les 50 ms : un clic n'arrive jamais.** Entre l'appui et le
relâchement, l'élément cliqué est remplacé ; le navigateur n'émet pas de `click`. Retenu :
sélection et actions de groupe **au relâchement du pointeur**, à partir de ce qui a été noté
à l'appui.

**D3. Le drag natif HTML5** est fragile et inopérant au doigt. Retenu : glisser au pointeur,
étiquette fantôme, zone survolée allumée, zones de dépôt à hauteur fixe pour ne pas bouger
sous le curseur.

**D4. `requestAnimationFrame` s'arrête quand la page est en arrière-plan** : la course restait
figée au départ. Retenu : un `setInterval` de 50 ms, avec capture des erreurs pour ne jamais
arrêter la boucle. Afficher le numéro de build dans l'en-tête.

**D5. Les boutons de survol recouvraient la marque de tours** et sa coche. Retenu : colonne
des tours à l'extrémité droite, boutons de survol limités au nom et à l'écart.

**D6. Les emojis de drapeaux ne s'affichent pas sous Windows.** Retenu : drapeaux en SVG
intégrés.

**D7. Corriger depuis le journal** a été jugé inutilisable : on corrige sur l'objet, le
journal enregistre.

**D8. Un même nom pour tout** (« Group ») et un peloton renommé dès qu'on ouvre ses actions.
Retenu : noms par position, stables — Bunch, Break n, Chase n.

**D9. Deux rangées d'actions** faisaient doublon. Retenu : une barre sur la sélection ; le
nom d'un groupe sélectionne ses coureurs.

**D10. Modifier un comportement approuvé sans le dire.** Voir A13 : tout écart par rapport à
un comportement validé se propose **avant** d'être codé.

**D11. Restart ne relançait pas les propositions.** `reset()` ne remettait pas à zéro
`lastDetect` ni `lastTl` : après un Restart, `detect` attendait encore l'ancien instant.
Retenu : `reset()` remet les deux à −1.

**D12. La détection des tours dépendait de la vitesse.** `detect` n'était appelé qu'une fois
par image, et une image avance de `0,05 s × vitesse` : 0,8 s de course à ×16, alors que la
fenêtre de détection ne faisait que 0,3 s. Une proposition pouvait donc être manquée à ×16 et
apparaître à ×1. Retenu (build 51) : la course avance par pas fixes de 0,05 s quelle que soit
la vitesse, et `detect` est appelé à chaque pas. **Ne pas revenir à un appel par image.**

**D13. `blur()` ne déclenche pas `focusout` dans le panneau de prévisualisation.** Un test
qui vidait un champ puis appelait `blur()` concluait à un bug de la page alors que la page
allait bien. Retenu : `Entrée` valide par lui-même (`dataset.done` évite la double
validation), et un test de saisie passe par un vrai événement.

**D14. `renderOval` à chaque image, même immobile, ralentissait à 24 coureurs.** Contrairement
à `detect` (D12, qui doit rester appelé à chaque pas), dessiner l'ovale est un travail
d'affichage pur : il coûte plus cher à mesure que le nombre de coureurs grandit (chaque
coureur place sa pastille en la comparant à toutes celles déjà placées, §14 d'`architecture.md`),
et était refait 20 fois par seconde que la course avance ou non. Retenu (build 88) :
`renderStrip`/`renderOval` ne redessinent que si `dirty`, si `ovalDirty`, ou tant que la
course avance (`S.started && S.factor > 0 && !S.finished`) ; **ne pas réutiliser `dirty`
pour le survol timeline → ovale**, car cela redéclenchait aussi la reconstruction complète de
la timeline à chaque passage de souris — d'où le fanion séparé `ovalDirty`. **Mesuré
insuffisant seul** : à ×1 avec 24 coureurs la course avance en continu, donc cette condition
est de toute façon vraie à chaque image — voir D15 pour la vraie cause du ralenti mesuré par
l'opérateur.

**D15. `pt(s)` interrogeait le tracé SVG en direct (`path.getPointAtLength`) à chaque appel —
mesuré à environ 350 fois par image à 24 coureurs, 93 % du temps de `render()` (~46 ms sur un
budget de 50 ms), pour placer chaque coureur sans chevauchement et tracer chaque bande de
groupe (§14 d'`architecture.md`). La course elle-même ne retardait pas (le temps de course
mesuré restait à moins de 1 % du temps réel écoulé), mais le fil principal était occupé en
quasi-continu : un clic de l'opérateur attendait alors 1 à 2,5 secondes avant d'être pris en
compte. Retenu (build 89) : le tracé `#trackpath` ne change jamais une fois la page chargée
(son `d` est figé dans le HTML) — ses points sont donc échantillonnés **une seule fois**, au
chargement (`pathTable`, 2000 points), et `pt(s)` interpole dans cette table au lieu
d'interroger le SVG en direct. **Ne pas revenir à `path.getPointAtLength()` dans `pt(s)` ou
dans une boucle appelée par image** : c'est exactement ce qui rendait l'ovale coûteux à mesure
que le nombre de coureurs grandissait.

**D16. `serve.js` ne connaissait pas le type `.css`.** En sortant le style dans
`styles.css` (build 90), le serveur local le servait en `application/octet-stream` (son
repli par défaut pour toute extension qu'il ne reconnaît pas) — un navigateur strict refuse
d'appliquer une feuille de style sous ce type, et la page apparaîtrait sans aucun style, sans
erreur bien visible. Retenu : `serve.js` sert `.css` en `text/css`. **Tout nouveau fichier
statique extrait du prototype (un autre `.js`, une image, …) doit vérifier que `serve.js` lui
donne le bon type** avant de le charger par balise.

**D17. Vérifier une classe au lieu de la couleur qu'elle produit.** Le bouton `ARM FINISH`
armait correctement — `S.finArm` passait à `true`, la classe `armed` était posée — et ne
changeait pas d'aspect d'un pixel : l'opérateur a signalé qu'il « ne fonctionne pas », et de son
point de vue c'était exact. La cause est une règle de style : `.startb.finb`, qui pose son
apparence neutre, est déclarée **après** `.startb.armed` et a la **même spécificité**, donc elle
l'emporte et annule le vert en silence. Retenu : **un test d'interface affirme la couleur
calculée, pas la classe**. `document.querySelector(x)` puis `getComputedStyle(...).backgroundColor`
coûte une ligne de plus et attrape ce que `classList.contains` laissera toujours passer. Et quand
deux règles décrivent le même élément dans deux états, celle de l'état particulier doit mordre
plus fort que celle du repos, pas seulement venir après.

**D18. Une `font-family` écrite dans un attribut SVG, sans repli.** Le nom d'un groupe sur
l'ovale portait `font-family="IBM Plex Sans"` **seul**, alors que toute l'interface passe par
`var(--sans)`, c'est-à-dire `'IBM Plex Sans', system-ui, sans-serif`. Partout où la police du
projet n'est pas chargée — réseau coupé, feuille de Google Fonts bloquée, premier affichage —
ces textes-là, et eux seuls, retombent sur la **serif** par défaut du navigateur, au milieu
d'une interface sans serif. L'opérateur l'a vu avant moi : « il faut utiliser une police qui
correspond à notre projet ». Retenu : **un texte SVG prend sa police par une classe CSS**, donc
par la variable du projet et sa liste de repli, jamais par un attribut `font-family` nu. Il
reste un cas du même défaut, les dossards tracés dans les pastilles (`IBM Plex Mono` nu) : il
n'a pas été corrigé parce qu'il n'a pas été demandé.

**D19. `getBBox()` renvoie des zéros sur un élément non affiché.** En vérifiant que deux noms de
groupes ne se recouvrent jamais, la mesure a annoncé **338 recouvrements sur 724 paires** et une
distance minimale de **0** — deux étiquettes exactement au même point. C'était la mesure qui
était fausse : la carte du sprint recouvre l'ovale par moments, et `getBBox()` sur un élément
qui n'est pas rendu renvoie `{0,0,0,0}`, si bien que **toutes** les étiquettes se retrouvaient à
l'origine, donc toutes « superposées ». Reprise sur les attributs `x`/`y`, en sautant les images
où l'ovale n'est pas affiché, elle donne **zéro recouvrement**. Retenu : avant de corriger un
code sur une mesure accablante, **vérifier que la mesure a regardé quelque chose de visible** —
et, dans le doute, lire les coordonnées posées par le code plutôt que celles calculées par le
moteur de rendu.

**D20. Une classe courte redéclarée plus bas pour un autre panneau.** `.trow` désigne à la
fois une ligne de coureur de la timeline et une ligne du panneau des transpondeurs. La règle
du second, écrite une centaine de lignes plus bas dans `styles.css` avec **la même
spécificité**, l'emportait : les lignes de la timeline tiraient leurs colonnes
(`44px 34px …`), leur fond et leur barre de gauche d'un panneau qui n'a rien à voir avec
elles, et la règle écrite pour elles ne servait à rien. Rien ne le signalait, puisque le
résultat restait lisible. Découvert en resserrant la colonne : la grille ne bougeait pas.
Corrigé en préfixant les règles du panneau par `#simtp`. Même famille que F5, et même leçon
que D17 : **la cascade tranche par l'ordre à spécificité égale**, donc une classe courte se
porte sur un conteneur, et on vérifie la valeur calculée, jamais la règle écrite.

**D21. Mesurer des chiffres sans regarder l'écran.** Trois builds de suite ont été livrées sur
des mesures correctes — aucun débordement, rien qui défile, la bonne hauteur partout — alors
que l'écran, lui, montrait deux grands rectangles vides de part et d'autre de la piste.
L'opérateur : « je veux qu'avant de faire des commits à tout va, tu regardes le résultat et te
pose la question si le résultat est correct ». Les mesures disent qu'une règle est respectée ;
elles ne disent pas que l'écran est bon. **Retenu : prendre la capture, la regarder, et se
demander ce qu'un opérateur en penserait, avant de commiter.**

**D22. `grid-row` ne survit pas au passage en boîte flexible.** La colonne centrale est passée
d'une grille à un `flex-direction:column` ; les `grid-row:1` et `grid-row:2` qui ordonnaient
l'ovale et la zone du bas sont devenus inertes, et l'ordre du document a repris la main. La
zone du bas est repassée **au-dessus** de l'ovale sans qu'aucune erreur ne soit levée et sans
que les mesures de hauteur ne bougent. Retenu : **en changeant de mode de disposition, relever
les positions, pas seulement les tailles.**

**D23. Une garde écrite pour un cas devenue fausse quand le cas change.** Le gestionnaire de
clic de la carte du sprint commençait par `if (S.sprintOpen == null) return` -- juste, tant que
la carte n'existait que pendant un sprint. Dès que la carte est devenue permanente, cette ligne
a rendu **toute** la carte inerte hors sprint : le tri de la liste de départ par dossard ou par
pays ne répondait plus, sans aucune erreur. Retenu : **en rendant permanent ce qui était
conditionnel, relire les gardes qui portaient sur la condition.**

**D25. `innerText` rend une chaîne vide dans un sous-arbre `visibility:hidden`.** La version
alternative `timeline-prototype_new_look_3a_3d.html` garde l'ancien écran dans le document
pour que le moteur continue d'y écrire, et il avait d'abord été mis en `visibility:hidden`.
Les actions passaient bien, mais le moteur construit son libellé d'annulation avec
`b.innerText.trim()` du bouton pressé : le journal écrivait « Undone:  · BIB 9 », sans le mot
*DNF*, et aucune erreur n'était levée. `innerText` suit le rendu, `textContent` suit le
document. Retenu : **pour garder un écran mesurable mais invisible, le sortir du champ
(`left:-20000px`), pas le cacher** — `getComputedTextLength`, `getBoundingClientRect` et
`innerText` veulent tous un élément rendu.

**D26. Retoucher le fichier produit au lieu du script qui le produit.** Les deux versions
alternatives sont fabriquées par un petit script qui part de `timeline-prototype.html` et
pose ses ajouts sur des ancres. Pour corriger un débordement d'une ligne de filtres, le
`<span class="sp"></span>` de trop a été retiré **du fichier produit**, par une expression
régulière — qui a emporté du même coup **cinq autres ressorts légitimes** du balisage
d'origine, dans la barre du haut et dans l'en-tête du simulateur. Aucune erreur, aucun
symptôme visible sur l'écran regardé : le compte est passé de 9 à 4, et c'est le seul
signe. Retenu : **un fichier produit ne se retouche pas — on corrige le script et on
régénère**, et on vérifie la régénération en comparant le balisage à l'original, pas en
regardant l'écran.

## F. Sprints

**F1. L'écran du sprint a été dessiné dix fois avant d'être codé.** Chaque maquette a été
reprise sur un point précis : Hold doublonnait le mode Check ; les points n'ont rien à faire
dans la carte ; cinq lignes et pas une de plus ; flèches ↑↓ remplacées par le glisser ;
photo = fond rouge et caméra, pas de texte ni de bouton swap ; non éligibles repliés ; liste
de départ entière, une colonne, jamais partielle. **Retenu : proposer, laisser critiquer, ne
coder qu'après l'accord explicite.**

**F2. Live n'attend rien.** Première lecture fausse : envoyer quand les quatre places sont
lues. Retenu : chaque place part à l'instant où son coureur est lu, dans l'ordre des places ;
une place posée d'avance part quand la place suivante est remplie par un passage lu — le seul
fait qui prouve qu'il est passé — ou au clic sur son bouton Send.

**F3. Une place posée d'avance devenait première.** `spHold` bornait la place à la longueur
de la liste : 3e sur une liste vide → 1er. Retenu : la place tenue est exacte, les places
avant restent vides et se remplissent au fil des lectures.

**F4. Flag photo sur un écart négatif.** Un coureur remonté à la main devant un coureur lu
plus tôt donnait un écart négatif, donc « < 15 ms ». Retenu : le flag demande un écart ≥ 0 ;
l'écart négatif s'affiche, il dit que l'ordre contredit les temps.

**F5. `.hd` dans `.log`.** L'en-tête du classement portait la classe `hd`, qu'une règle d'un
autre conteneur écrasait : colonnes décalées. Retenu : `sthd`. **Attention aux classes
courtes réutilisées ailleurs.**

**F6. Coureurs à un tour à l'arrivée.** Première version : une marque « −1 lap » sur la ligne
et un tri qui les mettait à part. Retenu, validé par l'opérateur : chaque coureur est classé
**selon son passage sur la ligne**, y compris un coureur à un tour, et peut prendre des
points s'il est dans les quatre premiers. Le classement général le place ensuite en bas grâce
à ses −20. Pas de marque de tour sur la ligne.

**F7. La carte figée quand la simulation est en pause.** Elle n'est reconstruite que sur
`dirty` ou une fois par seconde (D1) ; un script qui fait avancer la course sans passer par
les actions ne la rafraîchit pas. Sans conséquence en course ; dans les tests, forcer
`dirty`.

**F8. Le sprint final n'a pas de ligne jugée.** La dernière ligne de Crossings ne suffit pas :
un coureur à un tour arrive sur son passage suivant. Retenu : le premier passage de chaque
coureur depuis `finishOpen`, pris dans `S.passes`.

**F9. Crossings et sprint en désaccord à quelques millisecondes.** Deux coureurs franchissant
la ligne dans le même pas de simulation étaient listés dans Crossings dans l'ordre de
détection (ordre de la liste de départ), alors que la carte trie par l'heure interpolée.
Retenu : chaque ligne de Crossings est triée par l'heure ; le sprint avait raison. Dans le
logiciel réel, l'horodatage de la boucle fait foi partout.

**F10. Griser un passage rétroactivement.** Première version de l'affichage grisé : à chaque
image, tout coureur inéligible ayant un passage dans le sprint était ajouté à la liste
grisée. Deux coureurs lus alors qu'ils étaient éligibles se retrouvaient donc grisés dix
secondes plus tard, quand la règle les rattrapait — un passage parfaitement régulier perdait
sa place après avoir été lu. Retenu : **chaque passage est jugé une seule fois, à l'instant
où il est lu** ; une liste des coureurs déjà jugés sert de verrou. Corollaire dans l'autre
sens : un passage lu pendant l'inéligibilité reste grisé jusqu'à la fermeture du sprint — le
coureur reprend une place par une **seconde** ligne, il ne transforme pas la première.

**F12. Le filtre qui rejugeait les passages après coup.** La règle F10 dit que chaque passage
est jugé **une seule fois**, à l'instant où il est lu, et que le verrou est la liste des
coureurs déjà jugés. Le code posait bien ce verrou (`s.greyed`) pour **griser** la ligne, mais
le filtre qui construit le classement portait, lui, sur `s.lapped` -- l'inéligibilité de
**l'instant présent**. Conséquence : un coureur lu alors qu'il était éligible **disparaissait
du classement** dès qu'il devenait inéligible plus tard dans le sprint, sans rang et sans ligne
grisée, puisqu'il n'était pas dans le verrou. Écarté du résultat et annoncé nulle part.
Constaté par l'opérateur le 29 octobre 2026 : « des coureurs non éligibles ont été ignorés (ce
qui est correct pour le classement) mais jamais annoncés comme non éligibles ». **Retenu : le
verrou doit servir aux deux usages, l'affichage et le classement ; un seul des deux qui lit
l'instant présent suffit à rejuger le passé.**

**F11. L'affichage grisé n'est que de l'affichage.** La tentation était de passer le sprint
d'un modèle « un coureur, une place » à un modèle « un passage, une ligne ». L'opérateur a
cadré la demande lui-même (`regles-operateur.md` §8). Retenu : le sprint continue
d'enregistrer des coureurs ; les lignes grisées sont ajoutées **au rendu**, et la conséquence
de rang reste exactement ce qu'elle était.

## H. Cassures, groupes, merge et éligibilité

Chaque point est une **lecture fausse** de la règle, corrigée par l'opérateur. La règle
elle-même est dans `regles-operateur.md` ; ici on garde **pourquoi** la lecture était fausse.

**H1. Lire « devant sur la piste » comme une comparaison de position.** 242,2 m et
250 − 242,2 sont le même écart lu dans les deux sens du cercle : une position seule ne dit
rien. La condition porte sur la **distance qu'il reste à parcourir jusqu'à la ligne**. Le
code faisait déjà le bon calcul ; seul son nom, `crossesBeforeAhead`, induisait en erreur.
**Un nom de fonction n'est pas une spécification.**

**H2. Lire « derrière le peloton » comme « un tour de retard sur le leader ».** Avec
`headLap <= -1`, des coureurs du peloton devenaient candidats et produisaient une
contradiction qui n'existait pas. Le coureur doit être **positionné derrière le peloton dans
la timeline**, et rattrapé par le **groupe de tête**.

**H3. Prendre la ligne d'arrivée comme référence.** L'opérateur : « on va prendre le 12, on
va pas prendre la distance depuis la ligne, c'est ridicule ». La référence est le groupe de
tête, à 0 par construction.

**H4. Mélanger les deux référentiels dans un même tableau.** Timeline et ovale sont deux
lectures de la même course, **jamais à aplatir en une seule mesure**. Un tableau qui dit
« derrière » pour l'une et « devant » pour l'autre sans le préciser est illisible. Et le
leader est le premier : personne n'est devant lui.

**H5. Comparer dans les deux sens, ou prendre le groupe 1 comme référence.** Comparer un
coureur aux groupes au-dessus **et** en dessous du sien rend tout le peloton inéligible.
Prendre le groupe 1 comme référence rend tout le peloton inéligible dès que l'échappé est
physiquement derrière eux. Retenu : le groupe 1 est toujours éligible et n'est jamais une
référence ; la comparaison commence au groupe 3 contre le groupe 2.

**H6. Laisser un ancien chemin d'éligibilité branché.** La règle par groupes alimentait la
timeline et l'ovale, mais la carte des sprints lisait encore l'ancien test
`headLap`/`lapStatus`. Résultat vu par l'opérateur : « NOT ELIGIBLE » sur trois coureurs du
peloton. Dès qu'un coureur gagne un tour, les coureurs du peloton ont `headLap = −1` par
rapport à lui et `lapStatus = 0`, donc l'ancien test les retient. **Retenu : un seul calcul
d'éligibilité, `S.inelig`, et tout ce qui juge l'éligibilité le lit. Chercher tous les
appelants avant de croire une règle branchée.**

**H7. Compter les tours propres à chaque coureur dans la distance au sprint.**
`distance = tour_du_sprint × TRACK − distance de course` redonne exactement l'ordre de la
timeline, donc aucun coureur n'est jamais plus proche qu'un groupe au-dessus : **la règle est
désactivée sans erreur visible.** Retenu : la distance d'un groupe au prochain sprint est
`(piste du groupe de tête − piste du groupe) mod TRACK`, indépendamment du nombre de tours de
retard.

**H8. Mesurer la distance jusqu'à la ligne du tour en cours.** Les groupes changeaient de
statut plusieurs fois par tour, ce qui est incompréhensible pour l'utilisateur. Avec la
distance jusqu'au **prochain sprint**, la règle attrape toujours les mêmes coureurs et le
clignotement disparaît (chiffres dans `mesures.md` §3).

**H9. Oublier la longueur de vélo dans la cassure.** La règle se mesure de l'arrière de la
roue arrière à l'avant de la roue avant ; les boucles mesurent d'axe à axe. Il faut
retrancher une longueur de vélo. Même raison pour le coureur sans transpondeur : il se place
à **une longueur de vélo** derrière son host, pas à 1,5 m, qui faisait se chevaucher les deux
vélos.

**H10. Un coureur distancé qui dépasse le leader sur la route.** Sa distance au prochain
sprint bascule de 0 à presque un tour d'une image à l'autre, par le `mod TRACK`. Observé 2 à
4 dixièmes de seconde à la fois. Ce n'est pas une erreur de la règle mais un bord du calcul,
et c'est ce que le délai de confirmation doit absorber. **Ne pas conclure d'un instantané
pris sur ce bord.**

**H11. Croire une mesure prise en appelant `computeGroups` hors du cycle.** La fonction a des
effets de bord. L'appeler une fois de plus dans la même image donne un résultat différent de
celui affiché. Retenu : mesurer avec le même nombre d'appels par pas que la boucle réelle, ou
lire `lastG`, ou lire le DOM.

**H12. Le peloton coupé en deux pendant qu'un coureur lui prend un tour.** Mécanisme et
chiffres dans `mesures.md` §5. **Ne pas corriger de sa propre initiative** : c'est la règle de
l'opérateur appliquée à la lettre, et le cas qu'il doit trancher est celui d'un groupe
physiquement devant le groupe de tête (`regles-operateur.md` §15).

**H13. Mesurer le peloton par une médiane.** `S.bunchRaw` était la médiane des positions
lues du peloton, et elle servait de référence à trois endroits : le merge, la détection des
tours et l'ouverture de l'arrivée. Signalé par l'opérateur le 28 octobre 2026 : « ça tu dois
impérativement arrêter d'utiliser la médiane ! On ne veut pas connaitre cette médiane ! » Sa
règle ne mesure jamais d'un coureur à un groupe, toujours **d'un coureur à un autre**
(`regles-operateur.md` §3, §5). Une médiane paraît prudente — elle résiste aux valeurs
aberrantes — mais elle répond à une question que personne ne pose : le peloton n'a pas de
centre, il a un premier coureur.

**Corrigé à la build 67**, et la fonction `median()` est supprimée du fichier. Deux pièges
se sont révélés en la remplaçant, à garder en tête si on y retouche :

- **Le coureur qui fusionne redéfinissait la référence.** Prendre « le premier coureur du
  peloton » comme le coureur le plus avancé de l'amas est faux à chaque **tour perdu** :
  l'attardé arrive **devant** le peloton, se retrouve en tête de l'amas, et le tour du
  peloton chutait d'un tour à l'image même où on mesurait l'attardé contre lui. Le premier
  coureur se prend donc parmi ceux qui étaient **déjà dans le peloton à l'image précédente**.
- **Le coureur qui le suit n'est pas toujours son voisin immédiat.** D'autres attardés ou
  échappés peuvent rouler entre le coureur mesuré et le peloton, dans le même amas, tout en
  étant à un tour. Mesurer contre le voisin immédiat donnerait `delta = 0` et aucune
  proposition. `facingPos()` s'écarte donc d'un cran à la fois jusqu'au premier voisin qui
  appartenait au peloton.

**H14. Expliquer une mesure avec un peloton inventé.** Pour justifier les 31 m entre un
coureur et la médiane du peloton, un « peloton de 45 coureurs étalé sur 60 m » a été avancé.
Le plateau fait 16 coureurs dans le prototype et **24 au maximum** en course. Un chiffre
donné à l'opérateur se lit dans le code ou se mesure — jamais il ne s'estime.

**H15. Un seul seuil de cassure pour tout le plateau.** Le seuil se calculait une fois par
image, sur la vitesse **médiane** du plateau, et servait à toutes les paires. La règle veut
la vitesse du coureur **qui suit** (`regles-operateur.md` §1) : c'est sa roue avant qui doit
couvrir l'écart, donc une seconde de *son* temps. Le piège est que l'erreur est invisible
tant que tout le monde roule à la même vitesse — c'est-à-dire pendant presque toute la
course — et qu'elle apparaît **exactement quand la mesure décide quelque chose** : au moment
où un coureur décroche (il ralentit, le seuil doit baisser, la cassure doit être déclarée
plus tôt) ou rattrape (il accélère, le seuil doit monter, il reste accroché plus longtemps).
Une erreur qui ne se voit qu'aux instants qui comptent se mesure sur ces instants-là, jamais
sur une moyenne de course. **Corrigé à la build 68** (`gapThr(suiveur)`), chiffres dans
`mesures.md` §13.

### Les contraintes à respecter dans l'implémentation réelle

1. **Un seul calcul d'éligibilité**, posé au même endroit que les groupes, lu par tous (H6).
2. **Les groupes se définissent dans la timeline**, jamais sur l'ovale (A7).
3. **Le merge précède l'éligibilité.** Les deux dépendent de « un tour de retard » tel qu'il
   se lit dans la timeline ; coder l'éligibilité avant le merge, c'est la coder sur une
   timeline fausse.
4. **La validation de l'opérateur ne gouverne que les points**, jamais la place d'un coureur
   dans la timeline (B1 remplacé).
5. **Le seuil de cassure est un temps**, multiplié par la vitesse du coureur qui suit, moins
   une longueur de vélo (A8, H9).
6. **Toute mesure va d'un coureur à un autre**, jamais d'un coureur à une statistique de
   groupe (H13, H15).
7. **Rien ne se décide sur un seul instantané** (H8, H10, H11).

---

## Les scénarios à rejouer après tout changement

Tous se jouent avec le harnais (`window.__proto`, voir `architecture.md`) ou à la souris. Les
chiffres attendus sont dans `mesures.md` — ils ne sont **pas** recopiés ici, pour qu'une
valeur périmée ne survive pas dans deux fichiers.

**Avant toute mesure de la simulation : la charger depuis l'onglet Files** (A11).

| # | Scénario | Ce qu'on vérifie |
|---|---|---|
| 1 | **Échappée et gain de tour** | une seule proposition `lap:12:1`, à l'instant attendu ; ✓ → le 12 rejoint le peloton ; sa ligne de Crossings est rangée sur le peloton |
| 2 | **Décrochage et perte de tour** | une seule proposition pour les deux coureurs repris, pas deux ; validation tardive → re-rangement et « lapped, no crossing » sur la ligne sautée |
| 3 | **Compteurs à la main** | +1 sur un coureur du peloton → aucun déplacement, aucune proposition, aucune marque ; −1 puis +1 → net 0 |
| 4 | **Sans aucune validation** | la course dure `LAPS` tours du peloton, l'arrivée s'ouvre au bon passage, se ferme quand tous ont passé |
| 5 | **Incident** | sélection → Crash ; en-tête « Lap N · k laps ago · m laps left to rejoin » ; au retour des lectures, Back in race |
| 6 | **Retraits et corrections** | ABD → section Withdrawn ; flèche → réintégré, journal « reinstated · reversal » ; Undo défait la dernière action |
| 7 | **Leader** | armer Finish → le prochain coureur lu devient leader ; un dépassement change le leader ; Auto rend la main |
| 8 | **Ovale** | clic → sélection partagée ; glisser sur une bande → rejoint le groupe ; hors bande → nouveau groupe ; aucun point à moins de 32 px d'un autre dans le virage |
| 9 | **Sprint en live** | à la cloche le mode sprint s'ouvre ; chaque place part à la lecture de son coureur ; caméra rouge sous `PHOTO_MS` ; clic caméra → flag levé et message « photo confirmed » ; la carte se ferme deux tours plus tard |
| 10 | **Éligibilité et photo** | un coureur crédité est classé avec le peloton ; les retirés sont dans « Not eligible » avec leur place brute ; ↩ le reclasse par le temps |
| 11 | **Sans transpondeur** | bandeau à la cloche ; clic 3rd → ligne 3 tenue, 1 et 2 vides ; la place tenue part quand la suivante est lue |
| 12 | **Saisie manuelle** | plusieurs dossards + Entrée = tout l'ordre ; un dossard + Entrée = la place cible ; Detected order revient au mesuré ; glisser depuis la liste de départ |
| 13 | **Envoi manuel, décalage, Clear and record** | Live éteint → rien ne part ; Send → vert ; ← change la ligne jugée et le bouton redevient « Send correction » ; Clear and record range les passages dans l'ordre d'arrivée |
| 14 | **Arrivée** | tous classés selon leur passage, coureurs à un tour compris ; en-tête qui compte en clair ; un coureur sans transpondeur rappelé « to place by hand » ; Standings = points des sprints ± 20 × compteurs |
| 15 | **Cassures et groupes** | trois blocs numérotés, l'écart une seule fois par en-tête, aucun écart sur les lignes de coureurs |
| 16 | **Pas de faux positif aux sprints** | les quatre sprints sortent sans aucun inéligible. Un « NOT ELIGIBLE » sur un coureur du peloton signale qu'un ancien chemin est encore branché (H6) |
| 17 | **Tape switches** | contacts reproduits au millième de seconde près après `Load` et `Rewind 30s` ; le nombre de vélos sans transpondeur d'un groupe annoncé une seule fois |
| 18 | **Deux transpondeurs inversés** | `Swap` n'écrit rien au journal ; `Swapped` remet les deux positions d'aplomb tout de suite ; Undo défait vraiment |

### Les deux scénarios qui manquent encore

**La conséquence de rang et les lignes grisées n'ont jamais été exercées au cours des tests** : aucune fenêtre d'inéligibilité ne tombe sur une ouverture de sprint. Les deux
n'ont été vérifiées que sur cas forcé (`mesures.md` §6 et §7).

**À construire** : décaler le décrochage des deux coureurs lâchés pour qu'ils se trouvent
entre le peloton et la ligne **au moment précis** où un sprint s'ouvre. Un seul scénario
exercerait les deux règles.


### D24 · Recopier une position sans se demander ce qu'elle fait là

Le bloc des coureurs sans transpondeur était émis entre le titre `ORDER` et l'en-tête de
colonnes de l'ordre (build 147, `renderCard`, ligne 2134). En redessinant la carte, je l'ai
repris **tel quel**, avec son commentaire d'origine, dans quatre maquettes successives. Il a
fallu que l'opérateur demande « pourquoi tu positionnes le cadre jaune du coureur GBR27 là où
tu l'as positionné ? » pour que je regarde : il repoussait tout l'ordre et séparait un titre de
son propre en-tête.

**La règle** : une maquette qui reprend du code existant hérite aussi de ses défauts. Chaque
élément recopié se justifie à nouveau, ou se déplace.

### A13 · Répondre à une question par une modification

À cette même question -- « pourquoi est-il là ? » -- j'ai répondu en le **supprimant**, et en
inventant au passage une interaction (cliquer un coureur de la liste pour le placer) que
personne n'avait demandée et qui effaçait une distinction réelle : la place donnée à un coureur
sans transpondeur est **retenue** jusqu'au passage suivant ou jusqu'à `Send`.

**La règle** : une question sur un comportement n'est pas une autorisation de le changer. On
explique, on propose, on attend (`regles-operateur.md` §14.3).

### A14 · Écrire du texte que personne n'a demandé

Sous les boutons du bloc, j'avais ajouté « la place est retenue jusqu'au passage suivant, ou
jusqu'à Send ». Deux fautes d'un coup : du texte inventé dans une interface où chaque libellé
est décidé, et **du français dans une interface entièrement en anglais**. Même faute pour
« déposer ici » dans la zone de dépôt.

**La règle** : avant de livrer, relire tous les textes visibles d'une maquette et vérifier
qu'ils viennent de la documentation ou de la build en cours, et qu'ils sont dans la langue de
l'interface.

### D27 · Trois lignes de commentaire posées hors de leur commentaire

En ajoutant les poignées (build 149), un paragraphe d'explication a été inséré **après** le
`*/` du commentaire qui le précédait, en gardant son propre `*/` à la fin. Les trois lignes
orphelines ont donc été lues comme un sélecteur, qui a avalé la règle suivante : la timeline
gardait obstinément ses 174 px alors que `--w-tl` valait bien 420 px, et la poignée paraissait
ne rien faire. Aucune erreur, aucun avertissement — une feuille de style ignore ce qu'elle ne
comprend pas et passe à la suite.

Ce qui a permis de le voir : avoir comparé **la variable et la valeur calculée** plutôt que la
variable seule. `getComputedStyle(el).width` disait `174px` quand
`getPropertyValue('--w-tl')` disait `420px` ; les deux ensemble désignent la cascade, l'une
seule n'aurait rien dit. Même leçon que D17 et D20 : **on affirme la valeur calculée, jamais la
règle écrite.**

### D26 bis · Le script qui produisait les deux versions n'existe plus

D26 dit qu'un fichier produit ne se retouche pas, qu'on corrige le script et qu'on régénère.
Le script qui fabriquait `timeline-prototype_mixed.html` et
`timeline-prototype_new_look_3a_3d.html` à partir de `timeline-prototype.html` était jetable :
il n'est pas dans le dépôt, et il n'y a donc plus rien à corriger ni à régénérer. **Les deux
fichiers sont devenus leur propre source** et s'éditent directement.

Ce que D26 garde de valable : les trois fichiers partagent `styles.css` et une copie du même
moteur. Une correction utile aux trois se fait donc **trois fois**, ou dans `styles.css` quand
elle est purement visuelle — et une modification propre à une version n'a rien à faire dans
`styles.css`, qui les sert toutes.

### D28 · Un plancher calculé sur la taille courante n'est pas un plancher

La poignée de l'ovale (build 149) refusait un sens entier. Son plancher était
`Math.ceil($('.acts').getBoundingClientRect().height)` — écrit pour tenir la règle de
l'opérateur du 29 octobre 2026, « la barre d'actions ne doit jamais avoir à défiler pour être
vue en entier ». La règle est juste ; la mesure ne l'était pas.

La barre d'actions est un élément de grille **étiré à la hauteur de sa ligne**. Sa hauteur
mesurée n'est donc pas celle dont elle a besoin : c'est celle de la zone, exactement la
grandeur que la poignée essayait de changer. Plancher = taille courante, et le glissé est
refusé dès le premier pixel, dans un seul sens — l'autre marchait, ce qui fait croire à une
poignée « à moitié cassée » plutôt qu'à un plancher faux.

La même forme de butée existait sur la colonne du sprint, pour une autre raison : sa largeur
d'origine vaut déjà son plancher documenté. Là, le plancher est juste et rien n'était à
corriger — ce qui montre que **le symptôme ne désigne pas la cause** : deux poignées à sens
unique, deux histoires différentes.

Ce qui l'a fait voir : avoir tiré les quatre poignées **dans les deux sens** et relevé les
quatre tailles, plutôt que d'en essayer une. Le tableau rend la régularité évidente — chaque
sens refusé partait d'une taille égale à son plancher.

**La leçon** : un plancher se relève sur ce que le contenu *demande*, jamais sur ce que la
boîte *occupe*. Quand les deux risquent de se confondre, on mesure le contenu dans un état où
la boîte ne le contraint pas — ici, la barre à son propre plancher de resserrement.

### D29 · Poser un objet flottant sans regarder qui habite déjà l'adresse

L'étiquette de taille de la build 150 a été posée sur la barre d'actions à
`position:absolute; top:9px; right:10px`. C'est **exactement** l'adresse de `#layseg` dans
`styles.css`, écrite le 29 octobre. Les deux objets se sont superposés au pixel près, et le
`Clear`, dont le `margin-right` avait été réduit de 62 à 44 px pour faire de la place à
l'étiquette, est passé sous les deux. Trois objets sur 77 px, et c'est l'opérateur qui l'a vu :
« regarde ici ce chaos ».

Ce qui l'a laissé passer : les cinq étiquettes ont été vérifiées **sur leur propre zone** —
chacune apparaissait, affichait la bonne valeur, répondait au clic. Aucune n'a été vérifiée
**contre ce qui occupait déjà le coin**. Un élément en `position:absolute` ne pousse rien et ne
déclenche aucun chevauchement visible dans les mesures de taille : il faut comparer les
rectangles deux à deux pour le voir, et c'est ce qui manquait.

**La leçon** : avant de poser un élément flottant dans un coin, on relève ce que ce coin porte
déjà — `getBoundingClientRect()` des voisins, pas seulement du nouveau — et on compare les
rectangles. Un coin de panneau est une ressource partagée, et aucun des deux objets ne se
plaindra.

Corollaire, celui-là payé deux fois : un dégagement écrit en pixels (`margin-right:62px` pour
un bouton de 52) est un lien invisible entre deux règles éloignées. Quand on retire ou déplace
ce que le dégagement dégageait, il faut le suivre. Ici il en restait un vers un objet qui
n'était plus là, et il en manquait un vers celui qui y était.

### D30 · D2 payé une deuxième fois, deux ans après, sur d'autres boutons

D2 avait été compris pour l'ovale et appliqué là. Trois conteneurs que le moteur réécrit une
fois par seconde — `#tbar`, `#propcard`, `#ledgerbox` — ont gardé leurs écouteurs en `click`
jusqu'à la build 154, et l'audit du 31 octobre 2026 a dû redécouvrir le même défaut sur les
boutons qui portent ✓, +1 lap, DNF, DSQ et les compteurs de tours. **Mesuré** : 6
reconstructions en 6 s de course, et un appui à cheval sur l'une d'elles n'émettait rien.

Ce qui l'a laissé passer : D2 était écrit comme une leçon sur *l'ovale*, pas comme une règle
sur *tout conteneur réécrit*. Une leçon rangée sous l'objet où on l'a apprise ne se retrouve
pas quand le même piège revient ailleurs.

Retenu, et c'est la forme générale : **tout conteneur que le moteur réécrit pendant que la
course avance ne peut pas porter d'écouteur `click`.** Il écoute le relâchement du pointeur, et
la garde compare le CONTENEUR de l'appui à celui du relâchement — le conteneur survit à la
reconstruction, le bouton non. Un relâchement nu ne suffit pas : sans cette garde, un coureur
lâché depuis la timeline ou une poignée relâchée au-dessus de la zone presse un bouton que
personne n'a visé.

## A13. L'écran qu'on regarde n'est pas celui du dépôt

**Constaté le 1er novembre 2026**, l'opérateur devant une page « bizarre » : la mise en page
effondrée, les listes empilées sans style, et le numéro de build affichant **166** alors que le
dépôt était au **169**. Deux causes, indépendantes.

**1. La feuille de style n'est pas appliquée.** `serve.js` répond `styles.css` avec le bon type
`text/css`, mais le serveur qui tenait le port **servait `application/octet-stream`** : c'était
un processus lancé depuis un ancien état du dépôt, resté en vie. Un navigateur **refuse** une
feuille de style servie avec ce type, et la page s'affiche sans style. Elle n'est pas cassée :
elle est nue.

Le signe qui ne trompe pas : l'ovale reste dessiné correctement — c'est du SVG, qui porte ses
attributs — pendant que tout le HTML autour perd sa mise en page.

**2. Le numéro de build était écrit à deux endroits.** La balise de l'en-tête portait `169`, et
`syncSub()` l'écrasait avec un `'166'` littéral à chaque rendu. L'écran a donc annoncé 166
pendant trois builds. Il n'y a plus qu'une source, la constante `BUILD`, et la balise ne sert
plus que de valeur de départ.

**Ce qui a été ajouté pour que ça ne se reproduise pas** : `serve.js` répond désormais
`Cache-Control: no-store, must-revalidate`. Sans cet en-tête, le navigateur garde la page d'un
build précédent et on discute d'un écran qui n'existe plus.

**À vérifier avant de conclure qu'un écran est cassé** : le type servi pour `styles.css`, et le
numéro de build affiché comparé à celui du dépôt.

## A14. Le voisin dans la timeline n'est pas le coureur qui vous suit sur la piste

Un groupe, c'est une **chaîne** : chaque coureur est à moins d'une seconde de celui qui le suit.
Rien n'oblige les deux **bouts** de la chaîne à être proches. Au palier 2, le peloton de seize
mesurait jusqu'à **218,9 m** de long sur une piste de 250 m.

Prendre « le voisin dans la timeline » pour « le coureur qui le suit sur la piste » a donc fait compter un tour
pris contre un coureur à **126,6 m**, soit un demi-tour : l'arrondi a transformé 0,506 en 1, et un
+20 a été proposé au tour 12 à un coureur qui venait de s'échapper.

**La vérification** : quand une décision se prend « entre deux coureurs », retirer les tours
entiers de leur écart et regarder **ce qui reste**. C'est leur distance l'un de l'autre sur la
piste. Si ce reste n'est pas de l'ordre de la longueur d'un groupe, les deux coureurs ne se
suivent pas et la décision ne tient pas.


## A15. Une grille de départ écrite pour un nombre de coureurs donné

`dist = −40 + i × 2,2` plaçait la grille 40 m avant la ligne. Juste pour seize coureurs — 33 m — et
faux pour vingt-quatre : 50,6 m, dont **10,6 m après la ligne**. Les cinq derniers de la liste de
départ partaient du mauvais côté, la boucle d'arrivée ne les lisait qu'un tour plus tard, et ce tour
de retard se figeait dans `took.v0` : un bloc de cinq coureurs à l'arrière pour toute la course
(`mesures.md` §81).

Retenu : **une grille de départ se compte depuis la ligne, vers l'arrière**, jamais depuis un point
fixe en amont. Le nombre de coureurs est un réglage de l'opérateur, pas une constante. Au build 236
elle se range en plus **par dossard** (point 229), donc l'ordre de la liste n'y entre plus du tout.

**Et l'ordre d'une liste n'est pas l'ordre où on la regarde.** Le panneau du simulateur se trie par
dossard d'un clic sur l'en-tête ; `RIDERS`, lui, garde l'ordre où les coureurs ont été ajoutés, et
c'est `RIDERS` que la grille lisait. L'opérateur voyait le 24 GER sur sa dernière ligne pendant que
la fin de sa liste était le 16 MAS, et ne pouvait pas reconnaître les cinq dossards du bloc du bas
(`mesures.md` §82). Quand un comportement dépend du rang dans une liste, **dire lequel des deux
ordres il lit** — et le mieux est qu'il n'en lise aucun.

Et plus largement : **un départ hors de la zone que les boucles mesurent ne se voit pas tout de
suite**. Il se voit un tour plus tard, sous la forme d'un groupe que rien n'explique. Quand un bloc
apparaît sans cause de course, regarder d'abord **où les coureurs ont été posés**.


## A16. Un coureur de test codé en dur survit à la liste de départ

`TIGHT = {lap: 20, bibs: [52, 7]}` serrait deux coureurs sur la ligne du sprint 2. Le BIB 52 était
dans la liste de départ d'origine ; dès que l'opérateur a fait la sienne, il n'y était plus.
`S.riders.find(...)` rendait `undefined` et `step()` levait une erreur **à chaque image** à partir
du tour 18 (`mesures.md` §81).

Ce qui rend l'erreur méchante, c'est **où** elle tombe : au milieu de la boucle sur les coureurs. Les
coureurs déjà traités avançaient, les autres restaient sur place, et le repère d'allure continuait
tout seul. Un plantage a donc ressemblé à une course : deux échappés, un peloton arrêté, puis un
peloton qui accélère. Aucun des trois n'était vrai.

Retenu, deux choses. **Un scénario de test ne nomme pas un dossard** : la liste de départ est à
l'opérateur, et un dossard écrit dans le code n'y est pas garanti. Et **une boucle sur les coureurs
ne doit pas pouvoir s'interrompre au milieu** : un pas de simulation à moitié joué est pire qu'un pas
non joué, parce qu'il se lit comme un fait de course.

Ces deux-là sont à moi, pas à lui : voir `regles-operateur.md` point 193, « d'abord retirer ce qui
est à moi ».


### D31 · Un champ de la barre du haut ne peut pas se tenir à jour depuis le rail

Le type de course (build 211) est un réglage de course, comme `Laps` et `Sprints` : il se bloque
dès que la course est partie. Son verrou a d'abord été posé où ceux de `Laps` et de `Sprints` sont
posés, dans `syncSub()`, appelé par `renderRail()`. Mesuré au palier 2 : course partie, rail du
simulateur **replié**, le mot-clé et ses deux pas restaient cliquables — et `#cfglaps` restait
`disabled: false` lui aussi.

La cause est dans `render()` : `if (railDirty && !$('#rail').hidden) renderRail();`. Le rail replié,
`renderRail` ne tourne pas, donc `syncSub` non plus. Pour `Laps` et `Sprints` cela ne se voit pas —
ils sont **dans** le rail, et un contrôle qu'on ne voit pas n'a pas besoin d'être grisé. Pour un
champ de la barre du haut, qui est toujours à l'écran, le verrou ne venait jamais.

Retenu : **un contrôle rendu hors du rail se synchronise depuis `render()`**, pas depuis
`renderRail`. Et plus généralement, quand on copie le mécanisme d'un contrôle voisin, vérifier que
la fonction qui le tient à jour tourne aussi là où le nouveau contrôle vit. Le test qui l'a attrapé
lisait `disabled` **le rail replié** : rail ouvert, tout paraissait juste.


### D32 · Une place visible se mesure, elle ne s'estime pas

Le graphe de la vue Évolution se dimensionne sur la place que le panneau lui laisse. Au premier jet,
cette place était **calculée** : largeur du panneau moins le panneau latéral, moins les gouttières ;
hauteur du panneau moins l'en-tête, la légende et la note. Mesuré au palier 2 avec **quatre**
coureurs suivis : la dernière ligne du tableau du bas passait **sous le bord** du panneau. L'erreur
était de quelques dizaines de pixels, et elle ne se voyait pas à deux coureurs.

Retenu : poser le bloc, **lire sa boîte** (`clientWidth`, `clientHeight`), et refaire le rendu une
fois — et une seule — quand la place lue n'est pas celle qu'on avait prise. Un second passage coûte
un rendu ; une addition de marges se trompe à chaque changement de contenu.

**Et la barre de défilement est de la place en moins** (build 213, son écran de 1920 × 1080). La
boîte lue ne suffisait pas : le graphe défile latéralement, et sa barre de défilement, haute de
15 px, se prend **sur** la hauteur du bloc. Le tableau débordait donc encore de ces 15 px, et rien
ne permettait d'aller voir dessous — un bloc qui ne défile pas verticalement coupe ce qui dépasse,
sans rien dire. Elle se mesure comme le reste, `offsetHeight - clientHeight`, et se réserve. Après
correction, le tableau finit **15 px au-dessus** du bord, à quatre coureurs comme à deux, à 1440
comme à 1920.


### D33 · Une fenêtre dont on n'a pas vérifié la taille ne mesure rien

Pour voir si la bande des sprints défile bien quand les colonnes ne tiennent plus, la fenêtre a été
réduite à **700 px** de large, et la mesure a répondu : bande large de 1 571 px, aucune flèche, donc
rien ne défile. Conclusion tirée dans la foulée : le tableau pousse le panneau au lieu de défiler.

**C'était faux.** `innerWidth` valait **1 621 px** : la réduction n'avait pas pris. Les six colonnes
— 948 px — tenaient donc largement, et l'absence de flèches était le comportement voulu, pas une
panne. Un correctif a été écrit contre un défaut qui n'existait pas.

Retenu : **lire `innerWidth` dans le même relevé que ce qu'on mesure**, et comparer. Une mesure de
largeur sans la largeur de la fenêtre qui l'a produite ne prouve rien. Et pour juger un
débordement, mieux vaut la vraie course qui déborde — ici une course à **vingt sprints** — qu'une
fenêtre qu'on croit avoir rétrécie.


### D34 · `hidden` ne cache rien contre un `display` qui le précède

La bascule `Live / Evolution` du classement se posait bien son attribut `hidden` sur tous les autres
onglets — c'est ce que le code faisait, et ce que le relevé confirmait : `hidden` valait `true`.
Elle restait pourtant **visible**, large de 104 px, sur Crossings, Decisions, Passings et sur le
tableau de tous les sprints. `.seg` lui donne un `display:flex`, et un `display` explicite passe
devant le `display:none` que le navigateur attache à `[hidden]`.

Retenu : un contrôle qui se cache par `hidden` a besoin de **sa propre règle** `[hidden]{display:none}`
dès que sa classe lui pose un `display` — c'est la convention écrite dans `mockups/INTEGRATION.md` §7,
que `.pfilt` et `.spnav` suivent déjà. Et pour vérifier qu'une chose est cachée, **mesurer sa boîte**
plutôt que lire son attribut : `hidden: true` et 104 px de large coexistaient très bien.


### D35 · Un nom qui porte un rang ne reconnaît rien

Les colonnes de Lap by lap groupent les coureurs par bloc. Le bloc était reconnu par son **nom**,
`1-Bunch`, `2-Chase` — celui que `groupName()` affiche. Mesuré au palier 3, tour 24 : le peloton
était coupé en **cinq boîtes**, séparées par de faux écarts de 20 à 25 s. La raison : le nom porte
le **rang** du bloc, et le rang change pendant que les seize coureurs franchissent la ligne — un
bloc de tête qui se forme le temps de deux lectures fait passer le peloton de `1-Bunch` à `2-Bunch`.
La couleur ne vaut pas mieux : elle se calcule, elle aussi, sur le rang et sur le nombre de blocs.

Retenu : pour reconnaître une chose d'une lecture à l'autre, graver ce qui ne bouge pas avec
l'affichage — ici `blkid`, le plus petit dossard du bloc. Le nom et la couleur restent ce qu'ils
sont, de l'affichage, pris sur le premier passage de la boîte.

**Et l'ordre d'une liste n'est pas celui d'un tableau de boîtes.** La même colonne rangeait d'abord
par rang de timeline, comme l'ancienne rangée de pastilles le faisait. Des boîtes demandent que les
coureurs d'un même bloc se suivent, donc l'ordre de la **ligne**, à l'heure du passage : sans lui,
les boîtes se fragmentent et les écarts affichés ne veulent rien dire.


### D36 · Une pastille qui se colore est plus large qu'une pastille qui ne l'est pas

La colonne des tours faits de Lap by lap était dimensionnée sur le nombre : 22 px, assez pour deux
chiffres. Mais la pastille ne porte sa bordure et ses marges **que lorsqu'elle se colore** — verte
pour un tour gagné, rouge pour un tour perdu — et elle passe alors à 32 px. Tant qu'aucun tour
n'était crédité, rien ne se voyait ; dès le premier tour gagné, elle débordait sur le temps au tour
et le tronquait en « 16. ». C'est l'opérateur qui l'a vu, sur sa capture.

Retenu : dimensionner une colonne sur **l'état le plus large** de ce qu'elle contient, pas sur son
état au repos. Et un essai qui ne produit jamais l'état coloré ne prouve rien de cette colonne — ce
build-là avait été livré en disant que les pastilles n'étaient pas mesurées, ce qui était exact et
n'a pas suffi.


### D37 · Corriger le chemin qu'on sait reproduire, pas celui que l'opérateur emprunte

Le second passage d'un coureur qui vient de prendre un tour portait le mauvais bloc. La correction du
build 219 a été écrite — et **vérifiée** — sur le seul chemin que l'essai produisait : un tour validé
**après** le franchissement, où `refile()` déplace des passages déjà enregistrés. L'essai passait.
L'opérateur, lui, valide **avant** le franchissement : là `refile()` ne déplace rien, le tour attend
dans `markPending`, et le second passage est **enregistré** après coup, par un tout autre chemin. Le
défaut était donc entier chez lui et réparé chez moi.

Deux choses retenues. La première : quand une correction dépend d'un geste de l'opérateur, **refaire
son geste**, au moment où il le fait — ici valider la proposition dès qu'elle paraît, et non une fois
la ligne franchie. La seconde : un même fait peut être écrit par deux chemins (`refile()` à la
validation, l'enregistrement du passage ensuite) ; corriger l'un ne dit rien de l'autre, et les deux
se cherchent avant de livrer.


### D38 · Ranger le passé avec le classement du présent

La colonne d'un tour était rangée par `S.tlRank`, le rang de la timeline **maintenant**. Un tour
regardé à l'arrivée s'y retrouvait rangé avec un classement vieux de vingt tours de trop : le 12,
seul en tête au tour 19, paraissait au milieu du peloton parce qu'il y était rentré depuis. Le bloc
gravé sur chaque passage ne vaut pas mieux dans l'autre sens : il est juste à l'instant du passage,
mais un tour dure une demi-minute et la timeline renumérote ses blocs pendant ce temps, si bien que
la colonne additionne seize vérités d'instants différents.

Ce qu'il fallait : **un relevé, une fois, daté du tour** — l'ordre des blocs pris à l'ouverture du
tour, rangé avec le tour et plus jamais recalculé. Un affichage qui raconte un moment passé garde
le relevé de ce moment ; il ne le reconstruit ni avec l'état d'aujourd'hui, ni morceau par morceau.


### D39 · `el.click()` ne valide rien : la carte écoute `pointerup`

Les propositions se valident sur `pointerup`, par `pressed(e)` — pas sur `click`. Un `el.click()`
lancé depuis un essai automatique ne déclenche donc **rien**, et il ne lève aucune erreur : la carte
reste à l'écran, l'essai croit avoir validé. Plusieurs comptes rendus de cette session ont annoncé
« validé » alors que `S.lapStatus` valait toujours 0 ; ce qui se voyait ensuite était le merge
automatique du §3, pas une validation. Il faut envoyer un vrai `pointerdown` puis `pointerup`
(`PointerEvent`, `button: 0`, `bubbles: true`), **et vérifier que la carte a disparu** avant d'écrire
qu'un tour a été validé. Plus généralement : un essai qui pilote l'écran prouve son geste par son
effet dans l'état, jamais par le fait d'avoir appelé une fonction.

### D40 · Un repère de peloton pris sur un coureur qui n'y était pas encore

Le tour du peloton se lit sur son premier coureur (§5), et le code écartait du repère ceux qui
tiennent un tour retranché. Mais ce tour est relevé **à la détection** et gardé entre deux passages :
un coureur qui vient d'entrer dans l'amas porte encore le relevé d'avant, où il n'en faisait pas
partie, donc zéro. Le 46, à un tour de retard, est ainsi devenu le repère à 296,25 s ; `bunchRaw` a
reculé d'un tour et cinq coureurs du peloton se sont retrouvés dans le bloc de tête. Le relevé garde
maintenant **où il a été pris** (`dedans`), et le repère n'accepte qu'un coureur dont le dernier
relevé a été fait à l'intérieur du paquet. Une valeur mise en cache doit dire dans quelles conditions
elle a été prise, sinon elle se relit dans un contexte où elle ne veut plus rien dire.


### D41 · Un fait validé ne se remesure pas sur une position

Le tour retranché à un coureur était calculé `dedans ? Math.round((lu - bunchRaw) / TRACK) : 0` : tant
qu'il roule dans l'amas on compte les tours qui le séparent du peloton, sinon **zéro**. Or l'opérateur
a validé ce tour : c'est un fait posé, qui ne dépend plus d'où le coureur se trouve. Un coureur qui
rattrape le peloton et prend aussitôt une longueur d'avance sortait de l'amas, perdait son
retranchement et remontait d'un tour entier — en tête de la timeline, un tour devant le peloton qu'il
venait de rejoindre. Hors de l'amas, c'est le compte validé qui tient.

La leçon dépasse ce cas : **une valeur que l'opérateur a validée ne se recalcule pas à partir d'une
mesure**. La mesure sert à la proposer ; une fois tranchée, elle vit dans le compte qu'il a posé.


### D42 · Un arrondi qui ne décidait de rien, et qui s'est mis à décider

L'écart en tours entre un coureur et le peloton se calculait `Math.round((lu - bunchRaw) / TRACK)`,
et c'était exact **parce qu'on ne le calculait que dans l'amas** : les deux coureurs sont alors au même
endroit de la piste, la différence est à quelques mètres d'un tour entier, et l'arrondi ne décide de
rien. En sortant ce calcul de l'amas (build 226) l'arrondi s'est mis à décider : un coureur à 130 m du
peloton était compté un tour en dessous, le peloton se cassait en six blocs et leurs en-têtes
affichaient des écarts négatifs. Le build 227 lui a rendu la marge d'un quart de tour, et le build 228 a
retiré les mètres pour de bon : l'écart se lit sur les passages comptés et datés par la boucle
d'arrivée (règle 223), et il n'y a plus d'arrondi à régler.

La leçon : **un arrondi n'est anodin que dans les conditions où il a été écrit.** Déplacer le calcul
hors de ces conditions, c'est changer ce que l'arrondi décide, même si la ligne ne bouge pas.


### D43 · Chercher dans le moteur une faute qui est dans l'affichage

L'opérateur montrait un coureur affiché « leader » au tour qui suivait sa validation. J'ai cherché
trois builds durant dans `computeGroups` — l'écart en tours, le repère du peloton, l'arrondi — et j'ai
cassé la timeline en chemin. Sa troisième capture donnait la réponse : **la timeline, elle, était
juste** ; elle montrait le coureur en dernière position du peloton. Seule la colonne se trompait.

Deux choses à en garder. La première : quand deux vues du même fait se contredisent, **celle qui est
juste désigne l'autre** — il n'y a rien à corriger du côté qui dit vrai. La seconde : un affichage qui
fige un relevé doit dire ce qu'il advient des faits qui changent **après**. Ici le relevé d'un tour est
pris à son ouverture (règle 218), et une validation faite plus tard déplace les passages sans toucher
au relevé : il fallait reconnaître ces passages déplacés — leur pastille ne vaut plus le tour de la
colonne — et les ranger avec le peloton.


### D44 · Un rang figé dans un relevé n'est plus le rang de ce qu'on affiche

Le relevé d'un tour garde les blocs **tels qu'ils étaient** à son ouverture, nom compris — et le nom
porte le rang (`1-Leaders`, `2-Chase`). Quand un bloc du relevé ne s'affiche pas, parce qu'aucun de
ses coureurs n'a de passage sur ce tour-là, les rangs des suivants deviennent faux : le premier bloc
affiché s'annonce `2-Chase` alors qu'il est en tête.

Ce qu'il faut garder d'un relevé, c'est ce qui ne se recalcule pas — **l'ordre** —, et refaire sur
ce qui reste ce qui se déduit de l'ordre : le rang et le rôle. Un identifiant qui contient un rang
ne survit pas à un filtrage.


### D45 · La fenêtre entre la jonction et le passage suivant sur la ligne

L'écart en tours se lit sur les passages de la boucle d'arrivée (règle 223), et c'est juste. Mais la
jonction, elle, se produit **n'importe où sur la piste** (§3) : entre le moment où un coureur rattrape
le peloton et son passage suivant sur la ligne, la boucle ne l'a pas encore vu une fois de plus que
lui. L'écart lu vaut donc zéro pendant presque un tour entier — et c'est exactement le tour pendant
lequel l'opérateur regarde sa carte et décide.

Une mesure prise à des instants discrets a toujours une fenêtre où elle ne sait pas encore. Quand un
affichage doit dire la vérité **pendant** cette fenêtre, il lui faut une autre source : ici la carte
en attente, qui est précisément ce que l'opérateur a sous les yeux.


### D33 · Une constante redéclarée éteint toute la page, sans rien dire

Au build 237, une constante nouvelle a été appelée `LKEY` — le nom était déjà pris, mille lignes plus
bas, par la clé de la mise en page. Le navigateur a levé `Identifier 'LKEY' has already been
declared` **au chargement**, donc **aucune** ligne du script n'a tourné : écran dessiné, panneaux
vides, pas une erreur à l'exécution puisqu'il n'y a pas eu d'exécution.

Ce qui trompe, c'est que la page a l'air de marcher : le HTML est là, le CSS est là, et le défaut
ressemble à un panneau qu'on aurait mal rempli. **Un panneau entièrement vide se vérifie d'abord
dans la console du navigateur**, pas dans la fonction qui devait le remplir.


### A17 · Un repère tenu coureur par coureur ne peut pas ranger deux coureurs l'un par rapport à l'autre

La timeline se rangeait sur la lecture des boucles **plus** les tours entiers comptés sur la dérive
de chaque coureur. La dérive est une quantité propre à un coureur : rien ne garantit que deux
voisins en aient compté le même nombre. Un tour ajouté à l'un et pas à l'autre les écarte d'un tour
entier — 13,44 s sur la course du §88 — alors qu'ils se touchent.

**Deux coureurs se rangent sur une quantité qui les concerne tous les deux**, ici leur place sur
l'anneau depuis la tête. Dès qu'un classement additionne, par élément, une correction calculée
séparément pour chaque élément, il est faux entre deux éléments voisins, même si chaque correction
prise seule est défendable.

Même famille que A15 : la correction était juste pour un coureur, et fausse pour la paire.


### D34 · Un test qui ne dessine pas l'écran ne mesure pas ce que l'écran produit

La vue Lap by lap recopie la photo de la timeline **au moment où la timeline est dessinée**. Un test
qui avance la course sans appeler le dessin la laisse recopier la photo du départ à chaque tour : un
seul bloc avec tous les coureurs, du premier tour au dernier, sur une course où deux coureurs ont
presque deux tours d'avance. Le relevé ressemble à un défaut grave et n'est que l'artefact du test.

**Avant de lire un relevé, vérifier qu'il a été produit par le même chemin que l'écran de
l'opérateur.** Ce qui est alimenté par le dessin ne se mesure pas sans dessiner — quitte à ne
dessiner qu'une image sur quarante, ce qui suffit ici puisqu'un tour dure 269 images.


### D35 · Un réglage qui change en cours de mesure rend toute la comparaison fausse, sans un mot

Le 18 novembre 2026, l'allure du simulateur est passée de 18,6 à 18 m/s pendant une série de
mesures — l'opérateur réglait sa course dans la même page. Le script de mesure, lui, portait 18,6
en dur. Trois relevés de suite sont sortis de là : une modification du moteur a paru faire passer
les inversions de 2,81 % à 4,27 %, puis le retour en arrière a laissé 4,27 %. Rien de tout cela
n'était vrai : ce n'était pas la même course, et la vitesse servant à convertir les mètres en
secondes n'était plus la bonne.

Ce qui trompe, c'est qu'un chiffre qui empire ressemble exactement à une modification ratée. Le
seul signe était que le **retour en arrière n'a rien ramené**.

**Un script de mesure ne porte jamais en dur un réglage que l'écran peut changer.** Il le lit où
l'application le lit — ici `tct.sim.setup`. Et quand un retour en arrière ne restaure pas les
chiffres d'avant, ce n'est pas la modification qu'il faut regarder : c'est ce qui a bougé par
ailleurs.

## D36 · Lire un rang de course sur l'anneau

**L'erreur.** Chercher le groupe de tête et le groupe de queue dans l'ordre que le moteur donne.

**Pourquoi c'est faux.** L'anneau range les coureurs sur un tour. Un groupe lâché d'un tour se lit
donc juste DEVANT le peloton, et un groupe qui a pris un tour juste derrière. Mesuré le 19 novembre
2026 : à 360 s, la timeline montre « 1.2 | 3…22 | 23.24 » et l'anneau montre « 1.2 | 23.24 | 3…22 ».
Les deux sont cohérents avec les mêmes lectures de boucles ; seule la timeline a raison, parce
qu'elle sait les tours que l'opérateur a validés.

**Ce qu'il faut faire.** L'écran pose les blocs et dit lequel est le peloton (`MC.rangs`). Le moteur
ne les cherche pas. C'est le même partage que pour la tête de la timeline, que l'opérateur désigne.

## D37 · Verrouiller un constat sur l'écart qui l'a déclenché

**L'erreur.** Ne rejouer un constat que si l'écart est repassé au-dessus de la seconde.

**Pourquoi c'est faux.** L'écart est mesuré contre « le dernier du peloton », et ce coureur-là
change d'identité dès que l'ordre du peloton bouge. L'écart saute alors d'un coureur à l'autre.
Mesuré le 19 novembre 2026 : l'écart entre le BIB 1 et le dernier du peloton descend régulièrement
de 1,19 s à zéro entre 240 s et 256 s, sans jamais repasser au-dessus de la seconde — et le constat
est sorti trois fois. Dans une autre version du même garde, le BIB 1 a reçu douze tours gagnés.

**Ce qu'il faut faire.** Verrouiller sur les COUREURS rattrapés, et lever le verrou quand la
timeline les montre dans le bloc du peloton. Ses mots : « Hop, il est dans le groupe, c'est fini. »
