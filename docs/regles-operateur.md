# Les règles de l'opérateur

**Ce fichier fait foi.** Le code s'y conforme, pas l'inverse. Tout ce qui suit est
énoncé par l'opérateur, repris **mot pour mot**, avec sa date. Une règle ne change que
parce qu'il l'énonce lui-même.

**Ce fichier ne contient que ses énoncés.** Les mesures qui les ont validés sont dans
`mesures.md`. Le code qui les applique est dans `architecture.md`. L'index « quelle règle,
codée où, quel statut » est dans `cas-de-course.md`. Les erreurs de lecture déjà commises
sont dans `pitfalls.md`. **Ne recopiez une règle d'ici dans aucun autre fichier** : c'est
exactement ce qui a produit onze contradictions entre les documents.

**Le règlement officiel de l'UCI** pour la course aux points est dans le dépôt :
`UCI-Rules_PointsRace.pdf`, à la racine. C'est la référence réglementaire du sport, et ce
n'est pas un énoncé de l'opérateur : ce fichier-ci reste ce qui fait foi pour le code.

## Sommaire

1. [La cassure : ce qui définit un groupe](#1-la-cassure--ce-qui-définit-un-groupe)
2. [Rejoindre un groupe, se faire rejoindre](#2-rejoindre-un-groupe-se-faire-rejoindre)
3. [Le merge dans la timeline](#3-le-merge-dans-la-timeline)
4. [Le tour gagné ou perdu : quand, et combien](#4-le-tour-gagné-ou-perdu--quand-et-combien)
5. [Le tour du peloton](#5-le-tour-du-peloton)
6. [L'éligibilité aux sprints](#6-léligibilité-aux-sprints)
7. [La conséquence sur le rang](#7-la-conséquence-sur-le-rang)
8. [L'affichage d'un passage inéligible](#8-laffichage-dun-passage-inéligible)
9. [L'installation mesurée](#9-linstallation-mesurée)
10. [Les tape switches](#10-les-tape-switches)
11. [Le vélo en trop, le coureur sans transpondeur, les transpondeurs inversés](#11-le-vélo-en-trop-le-coureur-sans-transpondeur-les-transpondeurs-inversés)
12. [La mise en place et le tour de lancement](#12-la-mise-en-place-et-le-tour-de-lancement)
13. [Les trois nombres de tours](#13-les-trois-nombres-de-tours)
14. [La manière de travailler](#14-la-manière-de-travailler)
15. [Ce qui reste à trancher](#15-ce-qui-reste-à-trancher)

---

## 1. La cassure : ce qui définit un groupe

**25 octobre 2026.** Il n'existe pas de définition précise pour déterminer qu'un ou
plusieurs coureurs rattrape(nt) ou se fait (font) rattraper par un ou plusieurs autres
coureurs. C'est pourquoi on utilise une règle du cyclisme sur route, celle des
**cassures**. Une cassure sanctionne un nouveau groupe et donc un nouveau gap avec le
vainqueur. Mot pour mot :

> Si l'écart entre l'arrière de la roue arrière d'un coureur (#1), et l'avant de la roue
> avant du coureur (#2) qui le suit est supérieure à 1,000 secondes, il y a une cassure,
> le coureur (#2) passe dans un autre groupe. En conséquence l'écart entre le vainqueur
> et le coureur (#2) se mesure entre l'avant de la roue avant du vainqueur et l'avant de
> la roue avant du coureur (#2).
>
> Si l'écart entre l'arrière de la roue arrière d'un coureur (#1), et l'avant de la roue
> avant du coureur (#2) qui le suit est inférieure à 1,000 secondes, il n'y a pas de
> cassure, le coureur (#2) reste dans le même groupe que le coureur (#1). En conséquence
> l'écart entre le vainqueur et le coureur (#2) se mesure entre l'avant de la roue avant
> du vainqueur et l'avant de la roue avant du coureur en première position du groupe dans
> lequel figure le coureur (#2).

Cette règle remplace le seuil de regroupement de 2 s du début du projet.

**Ce qu'on peut mesurer.** On ne pourra pas mesurer précisément le temps écoulé entre
l'arrière d'une roue arrière et l'avant d'une roue avant. On pourra en revanche calculer
le temps écoulé entre l'axe de la roue avant d'un coureur et l'axe de la roue avant du
coureur qui le suit, et en fonction de la vitesse (approximative) et des dimensions
(approximatives) des bicyclettes on pourra définir (approximativement) le temps écoulé
entre l'arrière d'une roue arrière et l'avant d'une roue avant.

**La correction vaut exactement une longueur de vélo.** Avec `x1` et `x2` les positions
des axes de roue avant, coureur #1 devant :

    arrière de la roue arrière de #1 = x1 − empattement − rayon
    avant de la roue avant de #2     = x2 + rayon
    écart                            = (x1 − x2) − (empattement + 2 × rayon)
                                     = écart entre axes − longueur du vélo

Longueur du vélo ≈ **1,65 m** (empattement ≈ 0,98 m, diamètre de roue ≈ 0,67 m). Le temps
écoulé vaut cet écart divisé par la vitesse.

**La vitesse de conversion est celle du coureur qui suit**, puisque c'est sa roue avant
qui doit couvrir l'écart.

**Le seuil est un temps, pas une distance**, donc il suit automatiquement la catégorie —
juniors, femmes, élites — sans qu'on touche à un réglage. Ce qui reste réglable n'est donc
pas une adaptation technique : c'est la **sévérité du commissaire**.

**Délai de confirmation : 0,3 s.** Accordé le 25 octobre 2026 (« vas-y comme tu le penses
le mieux »), valeur recommandée sur mesure. Quand un coureur franchit une boucle sa
position se recale d'un coup, et ce saut peut faire apparaître ou disparaître une cassure
pendant une fraction de seconde. Une cassure, et sa disparition, ne comptent donc que si
elles tiennent 0,3 s. La mesure qui a fixé la valeur est dans `mesures.md`.

**Une reformulation équivalente, proposée par l'opérateur.** À partir du temps de passage
des transpondeurs plutôt que d'une conversion en distance :

> On peut raisonnablement déterminer le temps que met un coureur pour parcourir une
> distance qui correspond à (longueur totale du vélo − rayon de la roue avant).
> Appelons-la « valeur x ».
> On peut raisonnablement déterminer le temps que met un coureur pour parcourir une
> distance qui correspond à (rayon de la roue avant). Appelons-la « valeur y ».
> On connaît avec précision le temps écoulé entre le passage des transpondeurs de deux
> vélos qui se suivent. Appelons-le « valeur z ».
> On obtient une donnée en temps par la formule suivante : **z − (x + y)**.
> Si la valeur obtenue est supérieure à 1,000 seconde → **CASSURE**.
> Si la valeur obtenue est inférieure à 1,000 seconde → **PAS DE CASSURE**.

Ce n'est pas une seconde méthode indépendante : c'est le même calcul écrit autrement, sur
les mêmes données approximatives. Elle ne permettrait donc pas de vérifier la première.

---

## 2. Rejoindre un groupe, se faire rejoindre

**C'est la mesure du §1, appliquée à une paire précise.** Dans les deux cas la mesure va
**d'un coureur à l'autre**, jamais d'un coureur à un groupe entier.

> Rattrapé par le groupe de tête veut dire que le groupe de tête lui a repris un tour et
> qu'il se trouve au mieux positionné avec le groupe de tête (mais avec un tour de retard)
> ou alors déjà distancé par le groupe de tête. Pour savoir si un coureur est rattrapé par
> un groupe, ce sera le cas s'il y a moins d'une seconde d'écart entre l'arrière de sa roue
> arrière et l'avant de la roue avant du premier coureur du groupe le rattrapant.

— 25 octobre 2026.

- **Il rejoint un groupe par l'arrière** quand l'écart entre l'arrière de sa propre roue
  arrière et l'avant de la roue avant du coureur en **dernière** position de ce groupe
  passe sous 1,000 s.
- **Il se fait rejoindre par un groupe** quand l'écart entre l'arrière de sa propre roue
  arrière et l'avant de la roue avant du coureur en **première** position du groupe qui le
  rattrape passe sous 1,000 s.

**C'est un événement, pas un état instantané.** « Ou alors déjà distancé par le groupe de
tête » : une fois rattrapé, il le reste, même quand le groupe de tête s'en va. Le
rattrapage se date et se retient.

**Confirmation du 28 octobre 2026.** Sur l'énoncé « ils ont rejoint le peloton quand ils
sont arrivés à moins de 15,65 m du dernier coureur de la queue — pas de son centre » :
« ça c'est correct ».

---

## 3. Le merge dans la timeline

**25 octobre 2026.** Mot pour mot, pour les deux sens :

> **Pour les gains de tours** : au moment où un ou plusieurs coureurs échappés à l'avant
> de la course rattrapent le peloton (et par là il faut comprendre que le ou les leaders
> se trouvent à une distance de moins de 2 mètres du coureur placé en dernière position
> du peloton, ils soient mergés dans le groupe du peloton > attention ici la mesure doit
> être entre le dernier coureur du peloton et le premier coureur du groupe des leaders,
> et ceci peu importe à quel endroit de la piste). Et soient donc de nouveau considérés
> dans le même tour que les autres coureurs du peloton.
>
> **Pour les pertes de tours** : au moment où un ou plusieurs coureurs lâchés à l'arrière
> de la course se font rattraper par le peloton (et par là il faut comprendre que le
> coureur en première position du peloton se trouve à une distance de moins de 2 mètres
> du coureur placé en dernière position du groupe des coureurs attardés, ou du coureur
> attardé si il est seul dans son groupe, ils soient mergés dans le groupe du peloton >
> attention ici la mesure doit être entre le dernier coureur du groupe des attardés et le
> premier coureur du peloton, et ceci peu importe à quel endroit de la piste). Et soient
> donc de nouveau considérés dans le même tour que les autres coureurs du peloton.
>
> **Et ceci même si le gain du tour, ou la perte du tour, n'a pas été validé par
> l'opérateur.** Cette validation fera gagner ou perdre 20 points à un coureur, mais pour
> qu'il soit, dans la timeline, de nouveau dans le même groupe des coureurs qu'il vient
> de rattraper ou par qui il vient d'être rattrapé, il n'y a pas besoin de validation par
> l'opérateur. Il faut donc que ce merge automatique se fasse au moment correct, le plus
> précis possible.

> **Seuil remplacé le 25 octobre 2026.** Le « moins de 2 mètres » de cet énoncé est
> remplacé par la règle des cassures du §1 : « rattrapé par le peloton » veut dire qu'il
> n'y a plus de cassure entre lui et le peloton. Le reste tient inchangé — la mesure
> entre les deux coureurs qui se font face (qui sont précisément la paire de coureurs
> consécutifs à la frontière des deux groupes), et le fait que le merge n'attend aucune
> validation.

**28 octobre 2026.** L'opérateur a repris le point de lui-même :

> Un coureur qui a gagné ou perdu un tour, lorsque ce gain ou cette perte est validé(e)
> redevient un coureur qu'il faut considérer dans le même tour que le peloton dans la
> timeline !
>
> Les gains ou pertes sont consignés dans le journal et comptabilisés dans le classement
> général. En revanche dans la timeline il est à nouveau considéré l'égal des autres
> coureurs dans la timeline.
>
> **C'est dans la timeline qu'on gagne ou perd un tour !**

Et, à la question de savoir si le merge attend la validation ou non : « Oui c'est
correct » — le merge ne l'attend pas, il rejoint le tour du peloton à la jonction, validé
ou pas, et la validation ne fait que les ±20 points et la ligne au journal.

**Conséquence, et c'est elle qui compte pour tout le reste** : dans la timeline, aucun
coureur à l'intérieur du peloton n'a un tour d'avance ou de retard. Dès qu'il est dans le
peloton, il est l'égal des autres.

**Le merge se calcule avant l'éligibilité.** Les deux reposent sur « qui est où dans la
timeline » ; calculer l'éligibilité avant le merge, c'est la calculer sur une timeline
fausse.

---

## 4. Le tour gagné ou perdu : quand, et combien

Deux questions distinctes, et le §3 répond aux deux.

**Quand.** À la jonction, et nulle part ailleurs : l'instant où il n'y a plus de cassure
entre le coureur et le peloton, **« et ceci peu importe à quel endroit de la piste »**.
Aucune distance au peloton n'est testée, aucune tolérance n'existe.

**Combien.** L'écart se compte entre lui et **le coureur d'en face** — le dernier coureur
du peloton quand il le rattrape, le premier coureur du peloton quand il se fait rattraper
(§3, « la mesure doit être entre… »). À cet instant les deux sont au même endroit de la
piste : la différence entre leurs deux comptes de passages vaut 0, +1 ou −1. **+1 il a
gagné un tour, −1 il en a perdu un, 0 il a seulement refermé un écart ordinaire** et rien
n'est proposé.

**Ce que le système ne propose jamais** : ce que les boucles n'ont pas mesuré. Un compteur
réglé à la main est l'affaire de l'opérateur.

**C'est une proposition, jamais une décision.** Elle reste affichée jusqu'à validation ou
rejet — elle ne disparaît pas parce que la condition a cessé d'être vraie, sinon elle
s'effacerait avant que l'opérateur ne l'ait vue. Il n'y a pas de bouton « plus tard ».

**27 octobre 2026**, mot pour mot :

> Un tour est remporté quand un coureur rattrape le peloton. Un tour est perdu quand le
> peloton rattrape un coureur.

---

## 5. Le tour du peloton

**28 octobre 2026.** Le peloton n'est pas un point sur la piste : ses coureurs s'étalent
sur plusieurs dizaines de mètres, et pendant qu'il franchit la ligne d'arrivée ses
premiers coureurs ont commencé le tour suivant tandis que ses derniers n'ont pas fini le
précédent. À la question « le tour du peloton, c'est celui de ses premiers coureurs ou
celui de ses derniers ? » :

> celui des premiers !!

**Et une interdiction explicite, le même jour**, sur l'emploi d'une médiane des positions
du peloton comme point de référence :

> ça tu dois impérativement arrêter d'utiliser la médiane ! On ne veut pas connaitre cette
> médiane !

Donc : le tour du peloton est celui de ses premiers coureurs. Aucune statistique de
position — ni médiane, ni moyenne — ne sert de référence, nulle part.

**Taille du peloton.** « c'est maximum 24 » coureurs (28 octobre 2026).

---

## 6. L'éligibilité aux sprints

**25 octobre 2026, formulation par groupes.** Elle remplace la formulation par conditions
du §6 bis et lui est équivalente en résultat. Il faut toujours avoir les deux mesures en
tête, la timeline et l'ovale.

- **Dans la timeline**, un groupe est composé de 1 ou plusieurs coureurs qui se tiennent
  dans les limites définies par ce qu'est une cassure. Dès qu'il y a cassure, le coureur
  suivant sera dans un nouveau groupe, et avec lui ceux qui restent dans son sillage sans
  cassure. S'il n'y a que lui, soit ; le suivant sera un autre groupe, et ainsi de suite.
- **Dans la timeline**, les groupes se numérotent en commençant par le n° 1 pour le groupe
  de tête, le n° 2 pour le groupe suivant en descendant dans la timeline, et ainsi de suite.
- **Dans l'ovale**, on regarde à tout moment la distance qu'il reste à parcourir à chaque
  groupe jusqu'à la ligne d'arrivée du prochain sprint : le nombre de mètres pour rejoindre
  la ligne du tour en cours, plus le nombre de tours éventuels encore à parcourir jusqu'au
  sprint.
- Il faut **toujours considérer le groupe de tête comme étant le plus proche** en distance
  à parcourir jusqu'au prochain sprint.
- Le groupe de tête est **forcément toujours éligible**, étant le groupe le plus proche du
  prochain sprint.
- Après les membres du groupe de tête, ne peuvent être éligibles que les membres du
  **groupe 2**. Tout membre d'un groupe autre que le groupe 2 se trouvant plus proche de la
  ligne d'arrivée du prochain sprint que les membres du groupe 2 eux-mêmes est **inéligible**.
- Après les membres du groupe 2, ne peuvent être éligibles que les membres du **groupe 3**.
  Tout membre d'un groupe autre que le groupe 3 se trouvant plus proche de la ligne que les
  membres du groupe 3 eux-mêmes est inéligible. Et ainsi de suite.

**Le prochain sprint, pour un groupe qui n'est pas le groupe de tête**, mot pour mot :

> Pour tous les groupes autres que le groupe de tête, le prochain sprint sera le moment du
> passage sur la ligne d'arrivée d'un groupe à partir du moment où le groupe de tête aura
> atteint le sprint, et ceci indépendamment du nombre de tours de retard que peuvent avoir
> les groupes sur le groupe de tête.

**Forme calculable** : `distance d'un groupe au sprint = écart sur la route mesuré en
remontant depuis le groupe de tête`, soit `(piste_tête − piste_groupe) mod longueur de
piste`. Le groupe de tête est donc à 0 par construction, ce qui donne directement
« toujours considérer le groupe de tête comme le plus proche ». C'est aussi, littéralement,
le « on va prendre le 12, on va pas prendre la distance depuis la ligne, c'est ridicule »
de l'opérateur.

### 6 bis. La même règle, formulation par conditions (équivalente)

Les trois conditions doivent être vraies **ensemble** pour qu'un coureur soit inéligible.

**Condition 1** — un coureur se trouvant positionné **derrière le peloton** dans la
timeline (c'est-à-dire plus bas dans la timeline) est rattrapé sur la piste par **le
groupe de tête** (c'est-à-dire formé d'un ou plusieurs membres, les leaders).

**Condition 2** — il doit se trouver positionné derrière d'autres coureurs dans la
timeline (c'est-à-dire plus bas dans la timeline), mais placé devant ces mêmes coureurs
sur la piste, c'est-à-dire que **la distance qui lui reste encore à parcourir pour
atteindre la ligne d'arrivée est inférieure à la distance qu'il reste encore à parcourir
à ces coureurs positionnés plus haut que lui dans la timeline** pour atteindre la ligne
d'arrivée.

**Condition 3** — le coureur n'a pas encore été rattrapé par le peloton.

La formulation par groupes est celle qui est codée : elle donne le même résultat sans
demander de dater ni de retenir un événement de rattrapage.

---

## 7. La conséquence sur le rang

**25 octobre 2026.** Dans le résultat complet d'un sprint intermédiaire **ou d'arrivée**,
un coureur inéligible prend **au mieux le rang juste après les coureurs placés devant lui
dans la timeline**. Il n'est pas effacé du résultat : il est déclassé derrière eux.

---

## 8. L'affichage d'un passage inéligible

**26 octobre 2026**, dicté sur la carte du sprint :

> Dans le résultat, les coureurs détectés qui sont inéligibles, on peut les mettre aussi,
> mais **en grisé**. En grisé, oui, il ne faut pas changer de couleur. Il reste en grisé.
> Comme ça, on voit tout de même qu'il y a eu passage de ces coureurs-là. Et puis là aussi,
> dans la partie grisée, on pourrait mettre « no points ». Ensuite, dès qu'il y a de nouveau
> des coureurs éligibles, on les remet en normal. Et puis, finalement, les non-éligibles,
> redevenus éligibles, on pourra les rafficher une deuxième fois dans le résultat du sprint.
> Et ce coup-là, ils ne seront plus grisés, ils seront normaux.

Précisions données ensuite :

1. La ligne grisée est **sans numéro** de rang.
2. « La ligne est grisée car elle indique un passage du coureur à un moment où il n'était pas
   éligible. Elle ne doit pas comporter de rang. **Si le sprint se referme avant que le
   coureur ne repasse en étant éligible, ça m'importe peu !** »
3. **L'écart se mesure entre les coureurs classés.**

Et le cadrage, qui vaut pour toute demande de ce genre :

> « On parle uniquement de ce qui est affiché dans la fenêtre de sprint, et c'est utile à
> l'utilisateur car ça lui permet de mieux comprendre la situation de course. Il ne faut
> [pas] commencer à modifier toute la logique derrière. »

**Un seul point n'a pas été dicté** : chaque passage est jugé une seule fois, à l'instant
où il est lu. Il découle de l'énoncé, qui parle d'« un passage du coureur à un moment où
il n'était pas éligible », et il a été ajouté parce que la première version grisait
rétroactivement (voir `pitfalls.md` F10).

**Écart affiché par groupe — 25 octobre 2026.** Un coureur dans un groupe porte l'écart du
**premier coureur de son groupe**, et non le sien. L'écart apparaît **une seule fois, dans
l'en-tête du groupe**, à côté de son numéro et de son nom ; il disparaît des lignes de
coureurs, où il répétait seize fois la même valeur. Le groupe de tête garde `leader`.

**Le statut de tours n'est affiché nulle part** — ni sur la timeline, ni sur l'ovale. Pas
de mention « +1 ? ». Il ne sert qu'aux points et à l'éligibilité.

---

## 9. L'installation mesurée

**27 octobre 2026.** Les positions sont celles des tape switches, mot pour mot :

> Il y a 5 tape switchs installés sur la piste : 3x > 1 au milieu de chacune des 3 boucles ;
> 1x > 50m après la boucle "Finish" ; 1x > 150m après la boucle "Finish".

Sur la géométrie des boucles :

> les deux Pursuits doivent être exactement face-à-face l'une de l'autre et au milieu de
> leur ligne droite respective. Sur une piste de 250m, il y a donc 125m entre les deux, sur
> une 200m il y a 100m d'écart, sur une 166m il y a 83m d'écart et sur une 333m il y a
> 166.5m d'écart.

**Aucune distance n'est imposée entre Finish et Pursuit A** : c'est le propriétaire de la
piste qui décide, le plus souvent 10 m. Ce qui est obligatoire, c'est que les deux Pursuits
soient face à face. Tout le reste en découle.

**28 octobre 2026 — la forme de l'ovale dessiné.** L'opérateur a jugé le dessin du prototype
faux à l'œil :

> il n'y a pas de vérité, c'est le constructeur de la piste qui décide de la forme. Ce qui
> est sûr c'est que je n'ai jamais vu une piste avec des lignes droites aussi courtes que
> celle de l'app !

Puis, sur ce qui donne la forme :

> pour trouver la bonne forme, je pense qu'il faut s'intéresser aux rayons des virages. 23°
> est un rayon utilisé sur des pistes appréciées des coureurs

Il a donné le Vélodrome National de Saint-Quentin-en-Yvelines comme référence : **250 m**,
**8 m de large**, inclinaison des virages **44° à 44,6°**, inclinaison des lignes droites
**13°**, et **rayon des virages constant de 23 m**. Ces chiffres sont une précision sur une
piste réelle ; seul le dernier a été demandé en dessin.

Et enfin la décision, qui est celle qui fait foi :

> Ecoute on va utiliser le même modèle pour toutes les longueurs de piste. Et ce sera un
> modèle où les lignes droites font 55m

Donc : **une seule forme pour les quatre longueurs de piste**, celle dont les lignes droites
mesurent **55 m sur une piste de 250 m**. Les 23 m de Saint-Quentin ne sont pas la mesure
retenue — ils ont servi à chercher, l'opérateur a tranché sur 55 m. Ce que cette forme donne
sur chaque longueur de piste est dans `mesures.md` §14.

Puis, sur la largeur de la piste dessinée :

> peux-tu rendre la piste un peu plus large ?

Aucune largeur n'a été énoncée. La bande dessinée a été portée à une largeur qui vaut
**7,86 m sur une piste de 250 m**, ce qui la place entre les deux largeurs réelles qu'il a
données lui-même : les **7,5 m** du haut de ce paragraphe et les **8 m** de
Saint-Quentin-en-Yvelines. Le chiffre est dans `mesures.md` §14 et reste à confirmer à l'œil.

**28 octobre 2026 — les marquages, et la norme UCI comme référence.** L'opérateur a fourni
le détail des marquages d'un vélodrome homologué UCI, puis a demandé :

> dessine la cote d'azur, les lignes longitudinales, les lignes de 200m et 100m en blanc et
> la ligne Finish telle que décrite dans les infos que je t'ai donné

**C'est donc la norme qu'il a fournie qui fait foi pour le dessin**, et elle est reprise ici
parce qu'il l'a versée au dossier lui-même :

| Marquage | Cote |
|---|---|
| Largeur de piste | 7 à 8 m sur une 250 m internationale ; 5 à 10 m autorisés ; **constante sur tout le périmètre** |
| Côte d'azur | bande plate **sous** le bord intérieur, largeur **≥ 10 %** de la largeur de piste |
| Ligne noire, dite de mensuration | **0,20 m** au-dessus de la côte d'azur ; c'est elle qui donne la longueur exacte de la piste |
| Ligne rouge, dite des sprinteurs | **0,85 m** au-dessus de la ligne noire, ou 1/3 de la largeur si la piste fait 8 m ou plus |
| Ligne bleue, dite des stayers | au **tiers supérieur** de la piste |
| Ligne d'arrivée | trait **noir de 4 cm** centré sur une bande **blanche de 60 cm** |
| Ligne des 200 m | blanche, **toute la largeur**, exactement 200 m avant l'arrivée |
| Ligne des 100 m | blanche, **la moitié de la largeur**, exactement 100 m avant l'arrivée |
| Lignes de poursuite | deux lignes **blanches** au milieu de chaque ligne droite |

Les deux dernières lignes de ce tableau confirment ce qui avait déjà été codé le même jour.
Ce que le dessin en fait, et à quelles cotes, est dans `mesures.md` §14.

**Ce qui n'est pas dans la norme fournie** : l'épaisseur des lignes longitudinales, et la
moitié de piste que couvre la ligne des 100 m. Elles sont dessinées respectivement à 0,20 m
et depuis la côte d'azur vers le haut — ce sont des choix de dessin, pas des règles, et ils
sont signalés comme tels dans `cas-de-course.md`.

**28 octobre 2026 — ce qu'il a corrigé sur le premier dessin.** Il a d'abord demandé ce
qu'étaient les marques orange en travers de la piste : ce sont les **tape switches**. Puis,
mot pour mot :

> * la cote d'azur doit être dans un bleu plus foncé
> * la ligne bleue des stayers doit être plus visible, on ne la voit pas bien.
> * peut-être que la piste devrait être plus claire
> * la ligne noire de Finish doit être de la même largeur que les lignes blanches des
>   Pursuit. La ligne blanche du Finish doit être élargie
> * il n'e faut pas dessiner les tape switch

Le dernier point est une règle de dessin, pas une suppression de mesure : **les tape
switches continuent d'être comptés** — l'onglet Track montre leurs contacts — ils ne sont
simplement plus peints sur l'ovale. Les quatre autres points sont des couleurs et des
épaisseurs ; aucune cote n'a été énoncée, et celles qui ont été retenues sont dans
`mesures.md` §14. Codé à la **build 70**.

**28 octobre 2026 — sa deuxième relecture.** Mot pour mot :

> * Les lignes longitudinales rouge et bleue doivent être plus foncées ! On ne les voit pas
>   bien !
> * La côte d'azur un peu plus foncée aussi
> * La ligne blanche du Finish doit être encore élargie

Trois réglages de plus, toujours sans cote énoncée. Codé à la **build 71** ; les valeurs
retenues sont dans `mesures.md` §14.

**28 octobre 2026 — sa troisième relecture.** Mot pour mot :

> * le bleu des lignes de stayers et cote d'azur doit être plutôt comme celui du badge du
>   coureur n°3
> * les lignes perpendiculaires doivent démarrer en haut de la cote d'azur et vont jusqu'en
>   haut de la piste, sans déborder

Le premier point donne enfin une couleur **énoncée** : celle du dossard du coureur n° 3,
`#1d4ed8`, prise telle quelle pour la côte d'azur et pour la ligne des stayers. Le second
fixe l'étendue des traits en travers — arrivée, deux poursuites, 200 m — **du haut de la
côte d'azur au haut de la piste**, c'est-à-dire exactement la largeur roulable, sans le
débord d'une unité qu'ils avaient de chaque côté depuis la build 69. Codé à la **build 72**.

**28 octobre 2026 — son dernier réglage.** Mot pour mot :

> ok c'est bien. maintenant il faut juste éclaircir un peu la côte d'azur. L'autre ligne
> bleue est très bien

Donc : la ligne des stayers **reste** au bleu du dossard du n° 3, validé, et seule la côte
d'azur s'en éclaircit. « Un peu » n'est pas une cote ; la valeur retenue est dans
`mesures.md` §14. Codé à la **build 73**.

**29 octobre 2026 — les repères de l'ovale ne portent plus leur nom.** Sur une capture de la
build 90, où il a entouré en rouge les cinq textes posés sur le dessin, mot pour mot :

> commençons par l'ovale :
>
> * retire tous les textes encerclés en rouge

Les cinq textes entourés sont **« Finish »**, **« Pursuit A »**, **« Pursuit B »**,
**« 200 m start »** — que sa capture montre coupé en « 200 m » — et **« 100 m intermediate »**.
Seuls les **textes** sont entourés : les traits qu'ils nommaient —
la ligne noire sur bande blanche de l'arrivée, les deux lignes blanches des poursuites, et les
lignes des 200 m et 100 m — restent peints, et les tape switches restent comptés. Codé à la
**build 91**.

Il a demandé le même jour **la distance Pursuit A – Finish telle que le dessin la montre**.
Elle vaut **10 m**, c'est-à-dire exactement le `gap` du simulateur : le dessin ne l'invente
plus depuis la build 69, il la suit (`mesures.md` §14).

Sur une piste de 250 m, dans le sens de course, repère 0 m = ligne d'arrivée :

| Point | Position | Identifie le coureur |
|---|---|---|
| Finish (boucle + tape) | 0 m | oui |
| Tape « départ du 200 m lancé » | 50 m | non (contact seulement) |
| Pursuit B (boucle + tape, ligne droite opposée) | ≈ 113 m | oui |
| Tape « intermédiaire du 200 m lancé » | 150 m | non |
| Pursuit A (boucle + tape, ligne droite d'arrivée) | ≈ 238 m | oui |

Les deux tapes isolés sont le départ et l'intermédiaire du **200 m lancé**, soit 200 m et
100 m **avant** la ligne — ce qui donne bien 50 m et 150 m après elle sur une 250 m, et les
replace tout seuls sur les autres longueurs. Une piste de **166 m n'a que les trois des
boucles** : le 200 m lancé n'y est pas disputé. Sur une **200 m**, le départ du 200 m lancé
tombe sur la ligne d'arrivée elle-même : une seule bande, donc quatre tape switches.

**Les bandes ne traversent pas la piste.** Mot pour mot :

> Les tapes switchs des pursuit A et B ne mesurent que 3m de long, celui de l'intermédiaire
> des 200m ne mesure que 2m de long, celui du départ des 200m ne fait que 4.5m. La piste
> elle fait environ 7,5m de longueur. Le tape switch de la boucle Finish couvre toute la
> largeur de la piste.

Et : « Les bandes partent du bas de la piste (côté corde / bande bleue) et montent vers
l'extérieur. » Donc un vélo n'est compté que tant qu'il roule **dans** la largeur de la
bande ; plus haut sur la piste il ne franchit rien. Les boucles, elles, lisent sur toute la
largeur. **Ces longueurs sont une précision sur le matériel, pas une demande** : elles ne
sont pas modélisées, voir `cas-de-course.md` §9.

Le compteur de tours est relié en série ou en réseau. Les sprints sont confirmés par
photo-finish. Des transpondeurs manquants ou muets sont fréquents.

---

## 10. Les tape switches

**La règle.** Un tape switch compte les vélos qui passent, sans les identifier. Une boucle
nomme les vélos qu'elle voit. Rapprocher les deux dit **combien** de vélos sans transpondeur
sont passés là.

**Corrigé par l'opérateur le 27 octobre 2026 : on n'oppose pas deux comptes, on apparie des
heures.** Mot pour mot :

> on connait l'heure de passage des deux transpondeurs sur la boucle (chaque décodeur de boucle
> est synchronisé avec le système) et on connait l'heure de passage du troisième coureur qui est
> en retard. Si on définit une marge d'erreur de détection de temps de passage des transpondeurs
> de l'ordre de 20 millisecondes, on peut savoir si un tape switch détecte deux roues plus tard
> que les autres (par "plus tard" je veux dire "plus que les 20 millisecondes") alors on saura
> que ce n'est pas un des deux vélos 4 et 11.

- un contact qui ne trouve aucune lecture **est** un vélo sans transpondeur ;
- une lecture qu'aucun contact n'a payée est une roue que la bande n'a pas su séparer de la
  précédente.

**Sur la capacité des bandes** : « je pense que les tape switch sont efficaces et capables de
détecter le passage de deux roues très proches, disons 5cm ».

---

## 11. Le vélo en trop, le coureur sans transpondeur, les transpondeurs inversés

**Qui est le vélo en trop — 27 octobre 2026**, mot pour mot :

> Quand le système détecte un vélo par les tape switchs de plus que les transpondeurs, que ce
> soit dans un groupe ou même en dehors d'un groupe, lors de cette détection des tape switch le
> système pourrait proposer le ou les coureurs dont on n'aurait pas les transpondeurs, et les
> placer dans le groupe détecté ou créer un nouveau groupe. Et ceci pourrait fonctionner presque
> tout au long de la course, et proposer si le système détecte qu'un coureur sans transpondeur
> ne fait plus partie d'un groupe il faudrait le proposer à l'utilisateur.

Et, sur le moment où ça doit marcher : « on doit pouvoir corriger un problème de transpondeur
n'importe quand, pas uniquement avant le coup de pistolet annonçant le début de la course ».

**Ce qu'un vélo de plus veut dire.** L'opérateur a corrigé la façon dont la question était
posée : il ne s'agit pas d'un vélo « inconnu » qui apparaîtrait — « s'il n'y a aucun coureur
sans transpondeur ça paraît difficile qu'un vélo inconnu apparaisse ». Un vélo de plus que de
transpondeurs lus veut dire qu'un transpondeur est absent, a cessé de fonctionner, ou n'est pas
celui que la table annonce : un coureur connu que les boucles ne nomment plus.

**Positionner un coureur sans transpondeur par un contact de bande — 27 octobre 2026** :

> « positionner un coureur sans transpondeur à partir d'un contact de bande » > OUI évidemment
> qu'il faut se servir de cette info, à chaque fois qu'elle est utile ! C'est-à-dire pendant la
> mise en place et pendant la course !

**La place du coureur dans son groupe ne se tire PAS de l'horodatage du contact.** Tranché le
27 octobre 2026 : « les tape switch ne t'apportent rien ici ». Il n'y a rien à implémenter sur
ce point ; un coureur sans transpondeur continue d'être placé à la main dans la carte de sprint.

**Un coureur sans transpondeur se place à une longueur de vélo derrière son host**, et non à
1,5 m, qui faisait se chevaucher les deux vélos.

**Deux transpondeurs inversés — 27 octobre 2026** :

> pour ce qui est de l'inversion de deux transpondeurs, effectivement le système ne peut pas le
> savoir. Mais l'opérateur oui ! Il doit donc avoir un moyen d'indiquer cette inversion au
> système, qui à son tour l'inversera dans l'attribution des transpondeurs aux coureurs.

Et sur ce que le prototype doit montrer : « L'erreur et le bouton qui la corrige. Mais l'erreur
ne peut être que vue par l'opérateur dans le cas de deux transpondeurs inversés. »

---

## 12. La mise en place et le tour de lancement

**27 octobre 2026**, mot pour mot :

> - Tous les coureurs de la course précédente sont descendus de la piste. Après 2-3 minutes :
> - Les coureurs de notre course montent sur la piste par une entrée proche de Pursuit A. Sur
>   certaines pistes les coureurs passent sur la boucle Pursuit A et sur d'autres ils n'y
>   passent pas au moment de monter sur la piste.
> - Les coureurs une fois montés sur la piste font un tour très lent et puis ensuite s'arrêtent
>   à leur place. La moitié des coureurs en file indienne derrière la boucle Finish, à la
>   barrière (c'est-à-dire côté extérieur de la piste) et l'autre moitié des coureurs en file
>   indienne derrière la boucle Finish, à la bande bleue (c'est-à-dire plutôt au centre de la
>   piste et soutenus par leurs entraineurs) en attendant le départ.
> - Après la vérification des participants de la part des commissaires, le start siffle ce qui
>   annonce le début du tour de lancement. Les coureurs s'élancent.
> - Lorsque les coureurs atteignent la boucle finish au terme du tour de lancement, le starter
>   tire au pistolet pour annoncer le départ de la course.

Et l'exigence, mot pour mot :

> dans cette phase de mise en place et de lancement, le système doit pratiquement être
> infaillible pour informer l'utilisateur sur l'absence ou non-fonctionnement d'un transpondeur,
> ou la présence de transpondeurs erronés par rapport à la table des transpondeurs. Et le système
> doit proposer les corrections que l'utilisateur doit approuver.

Précisions du même jour, qui changent la lecture de cette phase :

- **Le tour lent ne se fait pas forcément sur la piste.** « Lors du tour lent, les coureurs ne
  sont pas toujours effectivement sur la piste au sens propre du terme. Ils sont assez
  régulièrement sur la zone en béton, plate, immédiatement à l'intérieur de l'ovale de la piste
  en bois. Les tape switch et les boucles ne couvrent que la largeur de la piste, pas la zone
  en béton, plate, immédiatement à l'intérieur de l'ovale. » Donc **le tour lent n'est pas un
  inventaire** : un coureur non lu peut simplement rouler sur le béton. Une lecture prouve
  qu'un transpondeur fonctionne ; une absence de lecture ne prouve rien.
- **La montée sur la piste doit être exploitée.** « Il faut se servir des passages détectés sur
  Pursuit A. » Même asymétrie : là où ils passent sur la boucle en montant, c'est une
  confirmation gratuite et précoce ; là où ils n'y passent pas, il n'y a rien à conclure.
- **L'arrêt.** « Avant le départ ils s'arrêtent avant la boucle Finish, mais cela ne vaut que
  pour les deux coureurs placés en première position du côté à la barrière ("At the fence" tel
  que décrit dans les règlements UCI), et du côté à la bande bleue ("At the blue band" tel que
  décrit dans les règlements UCI). Tous les autres coureurs sont placés derrière, un par un. »
  Personne ne franchit donc la boucle Finish avant le tour de lancement.
- **À l'arrêt, le matériel est incertain.** « Un transpondeur sur un vélo pas en mouvement peut
  soit détecté une fois, soit pas détecter. »
- **Il n'y a pas d'heure limite pour le verdict.** « On doit pouvoir corriger un problème de
  transpondeur n'importe quand, pas uniquement avant le coup de pistolet annonçant le début de
  la course. » La vérification n'est donc pas une barrière avant le départ mais un état qui se
  précise, et qui reste corrigeable en course.

**Conséquence de la première précision** : le premier moment où tout le monde est certainement
sur la piste et franchit toutes les boucles est le **tour de lancement**, et c'est seulement là
qu'une absence de lecture devient une information.

---

## 13. Les trois nombres de tours

Jamais confondus :

- **Le compteur de course** — les tours restants. Un seul pour toute la course, tenu par le
  commissaire au lap counter.
- **Le statut de tours d'un coureur** — +1, 0, −1. Par coureur, relatif au groupe principal,
  changé par les décisions du jury. Il ne sert qu'aux points et à l'éligibilité.
- **Le compte de passages** — le nombre de fois où le transpondeur du coureur a réellement
  franchi la ligne. C'est un fait physique, pas un tour officiel.

**Le compteur suit la tête de course telle que le starter la voit**, pas le coureur qui a le
plus de passages. Un coureur qui a repris un tour et roule en queue de peloton a un passage de
plus que tout le monde : s'il ouvrait les tours, le compteur prendrait un tour d'avance sur le
lap counter et sur le peloton, et l'arrivée serait comptée un tour trop tôt.

**Le lap counter n'est pas un passage.** Le compteur est un petit écran que les coureurs doivent
pouvoir lire, donc le commissaire le décrémente un peu **avant** le passage du leader —
certains dans le dernier virage, d'autres quand le dernier coureur du groupe de tête a dépassé
le tableau. Le logiciel rapproche chaque décrémentation du passage du leader le plus proche,
avant ou après, et ne la prend jamais pour ce passage. L'information met souvent plusieurs
secondes à atteindre l'opérateur du chronométrage.

**Un lap counter relié est toujours prioritaire.** Le compteur interne s'aligne sur lui, et un
désaccord est signalé avec les deux valeurs plutôt que corrigé en silence.

**Un tour perdu ne se compense jamais par un tour gagné.** Les deux compteurs servent au
départage, donc on ne les additionne pas pour n'en garder qu'un. Une erreur se corrige en
baissant le compteur fautif, pas en ajoutant à l'autre.

---

## 14. La manière de travailler

**Les écrans se proposent avant d'être codés.** La carte du sprint a été dessinée dix fois et
critiquée point par point avant qu'une ligne ne soit écrite. On propose, l'opérateur critique,
on ne code qu'après son accord explicite.

**On n'ajoute jamais ce qui n'a pas été demandé** : ni un contrôle, ni une ligne, ni un texte.
Une précision que l'opérateur donne sur le matériel ou sur la course est un **fait**, pas une
demande de le coder.

**Rien n'entre dans le prototype sans l'accord explicite de l'opérateur.** Validé le
31 octobre 2026, dans ses mots : « Rien n'entre dans le prototype sans mon accord explicite.
Par défaut, on dessine ce que j'ai décrit, on retire ce que je rejette, on n'ajoute rien. Quand
je demande un audit ou un avis, la réponse peut contenir ce que je n'ai pas demandé — mais elle
reste une liste de propositions, et chaque point attend mon accord avant d'entrer dans le
code. »

Cette règle délimite la précédente. L'opérateur l'a posée en constatant que « on n'ajoute rien »
bloquait le cas où il demande lui-même un audit : la règle porte sur **ce qui entre dans le
prototype**, pas sur ce qui peut être dit en réponse à une demande d'avis.

**On ne modifie jamais un comportement approuvé sans le dire.** C'est arrivé plusieurs fois et
cela a coûté la confiance de l'opérateur. Tout écart par rapport à un comportement validé se
propose avant d'être codé. Cela vaut en particulier pour les tours, les groupes, le merge et
l'éligibilité : **avant d'y toucher, lire ce fichier du §1 au §7.** Un seuil qui n'y figure pas
n'a rien à faire dans le code.

**Les règles de l'opérateur se consignent mot pour mot.** On ne les paraphrase pas, on n'ajoute
pas une condition qu'il n'a pas énoncée.

**On ne demande à l'opérateur que ce qu'il voit.** Les questions se posent en mètres, en
coureurs et en matériel installé — jamais en millisecondes, en seuils ni en choix d'algorithme.

**Rien ne se décide sur un seul instantané.** Toute mesure se fait sur la course complète, et on
compte les **changements de statut**, pas seulement les coureurs touchés.

---

## 15. Ce qui reste à trancher

- **L'appairage des transpondeurs changé PENDANT une course.** La règle §16.28 dit que
  l'appairage se garde. Ce qui n'a pas été énoncé, c'est le sort d'un changement fait en pleine
  course — un vélo changé, deux transpondeurs échangés dans les boxes. Il a été codé comme un
  **fait de cette course-là**, qui ne suit pas dans la suivante ; seul ce qui est changé avant
  le départ est gardé. À confirmer ou à retourner.
- **Où placer le réglage du seuil de cassure.** L'opérateur ne veut pas voir l'indication de la
  seconde sur l'écran de course. L'intention d'en faire un contrôle à l'écran, notée le
  25 octobre, est donc en suspens.
- **Le texte affiché pour la raison d'inéligibilité**, encore « lap down » alors que la raison
  est devenue « plus proche de la ligne que le groupe au-dessus ».
- **Le bandeau « race leader » après un merge.** Un coureur qui a gagné un tour n'est plus en
  tête de la distance de course, et le bandeau donne le leader au premier coureur du peloton.
  Suit-il la timeline ou le classement par points ?
- **« Plus proche que les membres du groupe 2 »**, lu comme « plus proche que *tous* » : à
  confirmer.
- **Le peloton coupé en deux pendant qu'un coureur lui prend un tour.** À 1,000 s le peloton se
  sépare parfois lui-même en deux groupes, et le coureur qui lui prend un tour se trouve entre
  les deux moitiés sur la piste. Comme la distance se mesure en remontant depuis le groupe de
  tête, la moitié arrière ressort plus proche de la ligne que la moitié avant, donc inéligible.
  C'est la règle appliquée à la lettre ; c'est à l'opérateur de dire ce qui doit se passer quand
  un groupe est physiquement **devant** le groupe de tête.
- **Les passages déjà enregistrés sous un nom erroné** après correction de deux transpondeurs
  inversés : la règle dit d'inverser l'attribution, pas de refaire l'histoire. À confirmer.
- **Ce qui s'affiche quand le système a perdu un coureur sans transpondeur** : sa ligne dit « no
  transponder » et non « not read ».
- **Un sprint tombé pendant une course neutralisée** : redonné au tour suivant la relance ou au
  tour prévu suivant, à confirmer dans le règlement en vigueur.
- **Le protocole exact d'échange avec la photo-finish**, à voir à l'implémentation.
- **Le retour au peloton après un tour gagné ou perdu.** La règle du §16 dit que le coureur
  prend la vitesse du groupe rejoint. Pour `↑` et `↓` c'est immédiat ; pour `+lap` et
  `−lap` le coureur revient dans le peloton en une trentaine de secondes, parce qu'il doit
  rouler jusqu'à sa place dedans. Le rendre instantané déplace une proposition de perte de
  tour de 195 secondes (`travaux.md` §8d). À trancher.
- **La Madison, la course tempo et le scratch** : même modèle, autre barème.

### Cinq points tranchés le 29 octobre 2026

Ses réponses, mot pour mot, et ce qu'elles ferment :

| Question | Sa réponse | Ce qui est fait |
|---|---|---|
| Le bouton `Auto` du leader | « le bouton AUTO je m'en fous » | Il reste où il est, dans la barre du haut. Rien n'est codé. |
| Le simulateur dans une autre fenêtre | « tu m'as dit que ce n'était pas possible » | Abandonné. Le simulateur reste dans la page, derrière son bouton. |
| La place du badge du sprint | « le badge du sprint est dans l'ovale, il n'y a pas de problème ! » | Il reste dans l'intérieur de l'ovale. |
| Le compteur `LAP 21 / 40` | « le LAP 21 / 40 est dans l'ovale, il n'y a pas de problème ! » | Il reste dans l'intérieur de l'ovale. |
| Le nom des groupes d'incident | « le nom des groupes d'incident > CRASH » | `CRASH`, en capitales et sans numéro. |

**Ce qui n'a pas été demandé** : un groupe d'ennui mécanique garde son propre mot,
`MECHANICAL`, en capitales et sans numéro lui aussi. Il n'a rien dit à son sujet, et l'appeler
`CRASH` dirait une chose fausse sur la course.

**Où ce nom se lit** : dans l'en-tête du bloc de la timeline et dans la barre de sélection. Un
groupe d'incident n'a **pas de bulle sur l'ovale** -- ses coureurs sont dessinés avec les
autres (`renderOval`, filtre `drawn`) -- donc le nom n'y apparaît pas. La question portait sur
l'ovale ; la réponse s'applique partout où le nom s'affiche.

---

## 16. Le simulateur : courses enregistrées, Restart, REC

Cette section vient après le §15 pour ne renuméroter aucune autre : les six sections qui la
précèdent sont citées par leur numéro dans tous les autres documents. Elle porte sur le
**prototype lui-même**, pas sur la course.

**28 octobre 2026 — la simulation doit devenir une course ordinaire.** Le poste
`travaux.md` §7a demande que la simulation cesse d'être un cas particulier câblé
dans le code et devienne une course enregistrée comme les autres, qu'on charge, rejoue,
renomme et efface. Deux questions lui ont été posées avant d'y toucher. Ses réponses, mot
pour mot :

> oui les BIB 4 et 11 doivent rester au contact de 12 pendant les trois tours, i faut donc
> que leur vitesse s'ajuste sur celle de 12

> le bouton Restart doit redémarrer la course. Il faut ajouter un bouton pour faire une
> nouvelle course. Pendant qu'une course est en cours on devrait peut-être avoir un point
> rouge "REC" qui s'allume.

Ce que cela fixe :

1. **Le contact des coureurs 4 et 11 avec le 12 est une règle, pas un effet de bord.** Les
   trois tours passés dans sa roue doivent survivre à la conversion en course enregistrée,
   et le moyen est énoncé : **leur vitesse s'ajuste sur celle du 12**, elle n'est pas rejouée
   indépendamment.
2. **`↺` Restart redémarre la course en cours**, celle qui est chargée. Il ne l'efface pas et
   n'en ouvre pas une autre.
3. **Un deuxième bouton ouvre une course neuve.**
4. **Un point rouge « REC »** s'allume pendant qu'une course est en cours. Il a été proposé
   avec un « peut-être » : l'écran se propose avant d'être codé (§14).

**28 octobre 2026 — le point REC suit la lecture, pas la course.** La maquette montrait le
point allumé tant que la course n'est pas finie. Sa correction, mot pour mot :

> Le point REC s'éteint dès qu'on met en pause. Tu peux coder la maquette avec ça.

**28 octobre 2026 — les libellés des deux boutons de course, et la place du retour.** Mot
pour mot :

> Je pense que je préfèrerais un libellé "New" plutôt que "+" pour une nouvelle course, et
> "Replay" pour rejouer la course et ces deux boutons devraient être proches l'un de l'autre.
> Le bouton "< Rewind 30s" devrait s'appeler "< 30s"

> on va déplacer le bouton "< 30s" et le mettre à gauche du bouton "play"

**28 octobre 2026 — les composants de la barre doivent avoir la même taille.** Il l'a vu sur
une image, avant toute mesure. Mot pour mot :

> la ligne des boutons + horloges : est-ce que tous les composants sont de dimensions
> identiques ? sur l'image que tu me montres ce n'est pas le cas

Mesuré sur la barre : les six faisaient 22,8 · 25,2 · 24,4 · 24,4 · 22,4 · 14,4 pixels de
haut. Ils font maintenant la même hauteur, donnée une fois pour la barre du haut et une fois
pour le rail.

**28 octobre 2026 — la simulation s'efface et se renomme comme une autre.** La
maquette du poste 6a lui demandait ce que devient la simulation, puisqu'elle était
écrite dans le code et non dans la liste enregistrée. Sa réponse, mot pour mot :

> il faut pouvoir la supprimer et également pouvoir la renommer comme on le désire. Le fait
> qu'elle soit dans le code n'intéresse pas l'utilisateur ! D'ailleurs que fait-elle dans le
> code ?

Ce que cela fixe :

5. **Elle n'est plus une ligne à part.** Elle porte *Load*, *Rename* et *Delete* comme les
   autres, elle n'a plus de marque de couleur qui la distingue, et le nom qu'on lui donne
   comme l'effacement qu'on en fait **survivent au rechargement de la page**.
6. **Elle n'est plus dans le code.** Elle y est seulement comme **modèle de départ** : la
   toute première fois que le prototype s'ouvre sur un poste, la liste enregistrée est vide
   et il y dépose cette course. Ensuite il ne la regarde plus jamais — la liste est celle que
   l'opérateur a laissée.

**28 octobre 2026 — les vitesses qui se modifient toutes seules.** Il a essayé le simulateur
et signalé, mot pour mot :

> j'ai testé le simulateur. Il y a encore des comportements étranges. Les vitesses se
> modifient toutes seules à partir du moment où commence à utiliser les boutons "Sync all to
> bunch pace" et les flèches en haut et en bas

Trois choses distinctes ont été mesurées sur la simulation, et lui ont été
présentées (`mesures.md` §17). Ses décisions, mot pour mot :

> 1. ok

> 2. son libellé ne dis pas qu'il va les remettre dans le peloton, il dit que tous les
> coureurs doivent rouler à la vitesse du peloton. c'est ça que je veux

> 3. ok

> 4. je voudrais aussi que quand on utilise les touche haut, bas, lap+ et lap- ces boutons
> s'allument mais doivent afficher une progression jusqu'à l'accomplissement de leur mission,
> et une fois la mission accomplie ils s'éteignent et la vitesses de leurs coureurs se
> synchronise sur le groupe qu'ils cherchait à atteindre (et qu'ils ont atteint)

Et sur les chiffres de la simulation, qui changent forcément quand le peloton cesse
de ralentir :

> je me fous de la course de référence !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Ce que cela fixe :

7. **Le peloton roule l'allure affichée, et rien d'autre ne la change.** Un coureur qui
   décroche, qui prend un tour ou qui revient ne doit **pas** faire changer d'allure ceux qui
   restent.
8. **« Sync all to bunch pace » veut dire ce que son libellé dit** : tous les coureurs
   roulent à la vitesse du peloton. Il ne les déplace pas et ne les remet pas en place.
9. **Une flèche qui ne mène nulle part est éteinte.**
10. **Un ordre en cours montre où il en est**, et quand sa mission est accomplie le bouton
    s'éteint et le coureur prend **la vitesse du groupe qu'il visait et qu'il a rejoint**. La
    forme de cette progression est un écran : elle se propose avant d'être codée (§14).

**28 octobre 2026 — la maquette de la progression, tranchée.** Deux formes lui ont été
proposées, et la question de la vitesse d'arrivée posée. Ses réponses, mot pour mot :

> 1. option A

> 2. il faut qu'il prenne la vitesse du groupe qu'il vient réellement de rejoindre.

Ce que cela fixe :

11. **La jauge est dans le bouton.** Le bouton allumé se remplit de sa gauche vers sa droite.
    Pas de trait sous la ligne du coureur, qui était l'autre proposition.
12. **La vitesse d'arrivée est celle du groupe réellement rejoint**, pas celle du peloton. Un
    coureur envoyé sur une échappée prend la vitesse de l'échappée et la tient tant qu'elle
    tient.

**28 octobre 2026 — rejouer une course de la liste.** Il a essayé et signalé, mot pour mot :

> maintenant regarde le code des courses enregistrées. Je ne parviens pas à rejouer celles de
> la liste. En effet quand je load une course et la démarre il y a le bouton REC qui s'allume

Mesuré : une course chargée était rejouée **et** réenregistrée en même temps, donc chaque
relecture déposait une copie dans la liste — trois Load, trois copies (`mesures.md` §19). Ses
décisions sur ce qui lui a été proposé, mot pour mot :

> 1. Une course chargée se rejoue, point : rien ne s'enregistre, le point REC reste éteint >
> ok mais il pourrait y avoir un affichage "Playing Race xy"

> 2. « puis New pour l'enregistrer » > pourquoi tu as cliqué sur "New" pour l'enregistrer ? Il
> faut soit qu'elle s'enregistre toute seule soit un bouton "Save"

> 3. Vous rejouez une course et, en cours de route, vous donnez un ordre de votre cru. Est-ce
> que ça devient une course neuve, qui s'enregistre à partir de là ? > NON, rien ne
> s'enregistre jamais depuis une course chargée, quoi qu'on fasse.

> 4. Regarde la capture : mis à part pour le bouton "< 30s", les symboles ne sont pas au
> centre de leurs boutons. Fix cela car ce n'est pas beau

Ce que cela fixe :

13. **Une course chargée se rejoue et n'enregistre rien**, quoi que l'opérateur fasse pendant
    sa relecture — y compris s'il donne des ordres de son cru. Le point REC reste éteint.
14. **Pendant une relecture, l'écran dit « Playing · *nom de la course* »**, à la place du
    point REC.
15. **Une course menée par l'opérateur s'enregistre toute seule.** Il n'a rien à cliquer pour
    la garder. Pas de bouton *Save*.
16. **Les symboles des boutons sont au centre de leurs boutons.**

**28 octobre 2026 — le numéro de course, et le vert.** Mot pour mot :

> il faut que nous donnions un numéro de course aux courses de la liste. Et ensuite quand on
> la rejoue, à l'endroit où s'affiche "REC" pendant un enregistrement, il faut afficher
> "Playing race x", x étant le numéro de la course dans la liste. ET ce texte "Playing race x"
> doit être en vert.

Le vert a été donné par une capture de sa fiche : **Dark Pastel Green, #1CC634**,
RGB(28, 198, 52).

Ce que cela fixe :

17. **Chaque course de la liste porte un numéro**, visible sur sa ligne dans l'onglet Files.
18. **Pendant une relecture, l'écran dit « Playing race *x* »**, à la place du point REC, en
    **#1CC634**.

**28 octobre 2026 — le numéro, et où sont les boutons.** Sur une capture de la build 79, mot
pour mot :

> Dans ta capture d'écran le texte "Playing race 1" est bizarre. on dirait que le "1" est dns
> une taille plus grande que le reste du texte. Ajuste la taille du numéro avec le texte et
> mets le en majuscules.

> Pour info, dans le build 78, les symboles des boutons ne sont toujours pas centrés > dans le
> 79 non plus

Puis, deux fois, pour dire **de quels boutons il parle** :

> les boutons dont les symboles ne sont pas centrés sont ceux affichés dans le simulateur
> lorsqu'il est déplié

> mais je te parle des boutons de transport lorsque le simulateur est déplié !!!

Ce que cela fixe :

19. **Le numéro a la taille et l'espacement du texte qui l'entoure**, et « PLAYING RACE *x* »
    s'écrit **en majuscules**.
20. **Les boutons à regarder sont ceux de la barre de transport, telle qu'elle s'affiche quand
    le simulateur est déplié.** C'est là que se vérifie le centrage, pas ailleurs.

**28 octobre 2026 — où vont Replay et New.** Devant la cause enfin mesurée — huit boutons qui
demandent 476 px pour 460, donc des groupes écrasés et des boutons qui passent sous leurs
voisins —, deux corrections lui ont été proposées (des boutons moins larges, ou la barre sur
deux lignes). Il en a choisi une troisième, mot pour mot :

> place les boutons "Replay" et "New" sur la même ligne que l'horloge

Ce que cela fixe :

21. **Replay et New sont sur la ligne de l'horloge.** La ligne du transport ne porte plus que
    ⏮ 30s, ▶, ❚❚ et les trois vitesses.

**28 octobre 2026 — un seul champ.** Devant la ligne du bas plus large que celle du dessus,
mot pour mot :

> pourquoi le champ pour "PLAYING RACE 1" est aussi grand? Cela ne sert à rien et a pour
> conséquence de rendre la ligne du bas plus large que celle du dessus

> le champ pour afficher "REC" et "PLAYING RACE 1" doit être le même champ

Ce que cela fixe :

22. **« REC » et « PLAYING RACE *x* » sont un seul et même champ.** Il dit le point REC, ou
    « PLAYING RACE *x* », ou rien. Jamais deux champs dont l'un retient sa place pour rien.

Sur la build 80, qui portait encore les deux champs, il a redit, mot pour mot :

> Il faut un champ qui affiche soit REC soit PLAYING RACE 1 !!! et dont la grandeur est fixe !

23. **Ce champ est de grandeur fixe.** Il ne change pas de taille et ne bouge pas de place
    selon ce qu'il affiche.

**28 octobre 2026 — où va la ligne Pace.** Mot pour mot :

> la ligne "Pace −15.0 +m/s Sync all to bunch pace" place en dessous de la ligne du dernier
> participant de la liste

Ce que cela fixe :

24. **La ligne Pace est sous la liste des coureurs**, après la ligne du dernier participant.

**28 octobre 2026 — un seul ordre pour les deux vues.** Mot pour mot :

> si on réordre la liste dans la vue SIMULATION, il faut que ce soit reporté dans la vue
> START LIST

25. **L'ordre choisi dans la vue Simulation est celui de la vue Start list.** Un seul ordre
    pour les deux.

**28 octobre 2026 — ce qu'il règle lui reste.** Mot pour mot :

> Les paramètres du simulateur ne doivent pas se remettre sur des valeurs codées en dur à
> chaque nouvelle course. Si un utilisateur modifie des noms, des nations, des dossards, des
> distances de boucles dans TRACK, ou des changements dans TRANSPONDERS il faut qu'il les
> retrouve dans une prochaine course

Ce que cela fixe :

26. **La liste de départ est gardée** — dossards, noms, nations, couleurs.
27. **La piste est gardée** — longueur du tour, distance Finish → Pursuit A, tours, sprints,
    allure.
28. **L'appairage transpondeur ↔ dossard est gardé.**

Les trois se retrouvent dans la course suivante, et au rechargement de la page. Les valeurs
écrites dans le fichier ne servent plus que la toute première fois.

**28 octobre 2026 — les drapeaux des nations.** Mot pour mot :

> quand on ajoute des coureurs de nations nouvelles, leur emojis de drapeaux n'existent pas.
> il faut donc en créer une liste beaucoup plus importante

29. **Toute nation que l'opérateur entre a son drapeau.** La liste en couvre 205.

---

## 17. L'écran de course : l'intérieur de l'ovale, le départ, les tours restants

Cette section vient après le §16 pour la même raison que lui : ne renuméroter aucune autre.

**29 octobre 2026 — la bande d'état descend à l'intérieur de l'ovale.** Mot pour mot :

> Retirons la ligne des boutons au-dessus de l'ovale et plaçons les dans l'ovale

Sa maquette montrait quatre boîtes à l'intérieur de l'ovale, un bouton rouge **ARM START**, et
les boutons de désignation du leader posés **sur la piste**, chacun à sa boucle. Six points
qu'elle ne tranchait pas lui ont été soumis ; ses réponses, mot pour mot, font le reste de
cette section.

### Le compteur de tours de course

> oui tu as raison il faut l'afficher quelque part

C'est la réponse sur `LAP 2 / 40`, absent de sa maquette. Il reste affiché ; **où**, il ne l'a
pas dit.

### Les propositions

Sur la première maquette, il avait répondu « Attends la prochaine étape de mes propositions ».
L'étape est venue le même jour, et elle tranche : **le champ est retiré** (voir ci-dessous).

### D'où viennent les tours restants

> oui il faut trouver un moyen d'indiquer que "38" to go provient de la connexion avec le lap
> counter manuel ou si il provient de l'appli. Si il provient de l'appli i y a deux modes
> possibles : automatique (l'appli calcule et affiche le nombre de tours restants) ou manuel.
> En mode manuel il faut donc des boutons pour incrémenter et décrémenter. Et enfin il faut un
> moyen de ne pas exporter le nombre de laps to go sur aucune des outputs en cas de problèmes.

Trois provenances, donc : **le lap counter** relié à la piste, **l'application en automatique**,
**l'application à la main**. En manuel, deux boutons incrémentent et décrémentent. Et le nombre
peut être **retenu de toutes les sorties**.

### Le départ de la course

L'opérateur a confirmé la portée de ce qui suit, mot pour mot : « oui je t'ai décrit le
workflow de départ des courses **du futur logiciel** ». Ce n'est donc pas une description du
simulateur du prototype. Son énoncé, mot pour mot :

> Armer le départ de la course. Une fois armé le bouton passe en vert et le label devient
> "START ARMED" et on peut soit cliquer dessus pour trig le départ de la course ou faire en
> sorte qu'une impulsion externe (comme un bouton pressoir) connectée à l'appli trig le départ
> de la course. A ce moment là le running time de l'horloge démarre. Le bouton "START ARMED"
> devient FALSE START" en gris et si on clique dessus une première fois le bouton va devenir un
> peu plus grand et plus foncé et il faut recliquer une deuxième fois pour valider le faux
> départ. Quand un faux départ est validé, le bouton revient sur "ARM START" en rouge.

Quatre états, dans cet ordre : **ARM START** en rouge → **START ARMED** en vert → le départ,
par le bouton **ou par une impulsion externe**, et l'horloge part → **FALSE START** en gris →
un premier clic l'agrandit et le fonce, un second valide le faux départ et tout revient à
**ARM START** en rouge.

### Les trois boutons de désignation du leader

> je ne sais pas quoi faire avec ce bouton "Auto". En revanche, les 3 boutons "SET LEADER"
> doivent être renommés "SET NEXT AS NEW LEADER" et quand on a cliqué dessus le bouton et la
> ligne de Pursuit ou de finish affiliée passe en vert en attendant le passage d'un coureur.
> Dès qu'un coureur est passé, le bouton et la ligne redevienne de leur couleur normale mais
> dans le bouton s'affiche le n° de dossard du nouveau leader pendant quelques secondes

**Le sort du bouton `Auto` n'est pas tranché** — il reste où il est en attendant. « Quelques
secondes » n'est pas une cote et aucune ne lui a été demandée : la valeur retenue est un choix
d'affichage, signalé comme tel dans `cas-de-course.md`.

### Sa deuxième lecture, le même jour

Devant la première version codée, mot pour mot :

> ah non mais ça ne va pas du tout !
>
> * le champ "Proposals" tu le retire
> * le bouton qui arme le start et l'horloge doivent être côte à côte. Le texte "Race time" doit
>   être supprimé.
> * Les laps to go doivent être affichés près de la ligne Finish. Et il faut afficher les
>   commandes relatives au mode sélectionné sinon il y a des boutons inutiles
> * dans le champ LEADER, retire "56.9 km/h from the track"
> * Quand le nombre de tours jusqu'au prochain Sprint arrive à 2 il faut que le champ devienne
>   très visible et immanquable

Cinq décisions, donc :

1. **Le champ des propositions disparaît.**
2. **L'horloge et le bouton qui arme le départ sont côte à côte**, et l'horloge n'est plus
   titrée « RACE TIME ».
3. **Les tours restants s'affichent près de la ligne d'arrivée**, plus dans le panneau. Et
   **seules les commandes du mode choisi s'affichent** : les boutons `−` et `+` n'existent qu'en
   mode manuel.
4. **Le champ du leader ne porte que son dossard** : ni la vitesse, ni la façon dont il a été
   désigné.
5. **À deux tours du prochain sprint, le champ devient immanquable.** Aucune couleur n'a été
   énoncée ; celle qui est retenue est dans `mesures.md` §26.

### Un mot qui n'est pas le sien

Le 29 octobre 2026, devant une version où l'intérieur de l'ovale était appelé « gazon » jusque
dans le titre de cette section, mot pour mot :

> Et arrête avec ton "gazon" ! il n'y a pas de gazon dans un vélodrome !!!!!!

Le mot n'avait jamais été le sien. Le sien, le 27 octobre, est au §12 : « la zone en béton,
plate, immédiatement à l'intérieur de l'ovale de la piste en bois ». **On dit l'intérieur de
l'ovale.** Corrigé dans les quatre documents qui portaient le mot.

### Sa troisième lecture, le même jour

Mot pour mot :

> * Les tours "2/40" doivent être proches des "38 TO GO"
> * pour éviter de créer un champ EXPORTED, il faut plutôt que le zone des laps to go devienne
>   rouge. Pour changer entre exporté et non exporté il faut je pense un tout petit bouton
> * Les boutons "SET NEXT AS NEW LEADER" renomme les "SET NEXT AS LEADER" sur deux lignes.
>   supprime celui de la ligne Finish

Ce que cela fixe :

6. **Le compteur de tours de course est à côté des tours restants**, donc près de la ligne
   d'arrivée et non plus dans le panneau. Cela répond à la question laissée ouverte plus haut.
7. **Il n'y a pas de champ qui dit « exporté »** : c'est **la zone des tours restants qui
   devient rouge** quand ils sont retenus. Un **tout petit bouton** fait la bascule.
8. **Les boutons s'appellent « SET NEXT AS LEADER », sur deux lignes**, et **celui de la boucle
   Finish est supprimé** : il n'en reste que deux, Pursuit A et Pursuit B.

### Sa maquette du 29 octobre 2026

Devant une version qu'il jugeait encore ratée, il a dessiné lui-même ce qu'il voulait. Mot pour
mot :

> Quelquechose comme ça ...

Ce que la maquette montre, et qui fait foi :

9. **Trois rangées, chacune centrée**, et non une grille de cases égales :
   - `ARM START` · l'horloge · **`ARM FINISH`** ;
   - `LAP 5 / 40` · `NEXT SPRINT 1 in 5 laps` ;
   - `LEADER 15`, et à sa droite le bloc des tours restants.
10. **`ARM FINISH`** est un bouton **neuf**, posé à droite de l'horloge, en neutre et non en
    rouge. **Ce qu'il fait n'a pas été énoncé** (§15).
11. **Les deux provenances s'affichent ensemble, chacune avec sa valeur** — « AUTO / MANU − 36 »
    et « LAP COUNTER − 35 » — et **un sélecteur choisit celle qui alimente `TO GO`**. C'est
    exactement sa règle du §13 : un désaccord se signale avec les deux valeurs. Un petit bouton
    bascule l'application entre son propre comptage et le comptage à la main.
12. **`TO GO` est une boîte verte** sous les deux provenances. Elle devient rouge quand les tours
    restants sont retenus des sorties (point 7 ci-dessus).
13. **L'intérieur de l'ovale est gris clair** sur cette maquette, alors qu'il était noir. C'est
    la réponse au « Je ne sais pas encore » laissé plus haut.

### Sa relecture du bloc des tours restants

Sur une capture du bloc tel qu'il avait été codé, mot pour mot :

> je ne t'ai pas dessiné ça comme ça ! le bouton carré n'a pas besoin d'être là. Le mode
> export/non export change quand on clique dans la zone verte (ou rouge). A côté de LAP COUNTER
> il faut afficher le nombre de tours du lap counter que l'on récupère dans l'appli (en
> l'ocurrence 40)

Puis, le même jour :

> du coup le texte TO GO 40 peut être agrandi pour remplir sa place disponible

Ce que cela fixe :

14. **Il n'y a aucun bouton dans la boîte `TO GO`.** C'est **la zone elle-même qui se clique**
    pour retenir les tours restants des sorties, ou les y renvoyer.
15. **La ligne `LAP COUNTER` porte le nombre de tours reçu du compteur**, à côté de son nom,
    comme la ligne de l'application porte le sien.
16. **Le texte de `TO GO` remplit sa boîte**, la place n'étant plus disputée par un bouton.

### Ce que fait `ARM FINISH`, et l'échelle du panneau

Mot pour mot, le 29 octobre 2026 :

> arm finish arme la ligne d'arrivée pour que le running time de l'horloge s'arrête au passage
> du vainqueur à la toute fin de la course.

Et, sur la mise en page :

> Mais le layout est moche ! Mon croquis de mauvaise qualité que j'ai créé avec Paint et que je
> t'ai transmis est plus joli que le tien

Ce que cela fixe :

17. **`ARM FINISH` arme la ligne d'arrivée.** Armée, elle **arrête le running time de l'horloge
    au passage du vainqueur**, à la toute fin de la course. Les coureurs derrière lui continuent
    de franchir la ligne ; l'horloge, elle, ne compte plus.
18. **Le panneau se lit à l'échelle de son croquis.** Devant une version agrandie au jugé, et
    toujours fausse, il a renvoyé sa capture avec trois mots : « utilise cette échelle ». Sa
    capture est au rapport 1:1 avec le dessin, donc ses boîtes se **relèvent** au lieu de
    s'estimer ; les cotes relevées sont dans `mesures.md` §26. **Un croquis qu'il fournit à la
    taille de l'écran est une cotation**, pas une suggestion.

### Les annotations qui suivent les coureurs

**29 octobre 2026.** Mot pour mot :

> Pour la suite il va falloir refaire complètement les annotations qui suivent les coureurs sur
> l'ovale. Dans un premier temps on va retrier les annotations et textes actuels.
> Je les ai entourés en rose foncé sur ces captures. Regarde si il en existe d'autre encore et
> supprime les toutes

Les textes entourés sur ses deux captures sont **le libellé du leader** (« LEADER · BIB 1 »),
**le nom de chaque groupe avec son effectif et son statut** (« Chase 1 · 2 », « Break 1 · 3 »,
« Bunch · 13 · lap gained? ») et **l'écart entre deux groupes** (« 65 m · 3.9 s »).

Une quatrième de la même famille n'apparaissait sur aucune des deux, faute de coureur concerné :
l'étiquette **« No points »** reliée au dossard par un pointillé. Elle est retirée avec les
autres, au titre du « supprime les toutes ».

19. **Aucun texte n'est tracé sur l'ovale**, hors le dossard qui est dans la pastille du coureur.
    Les bandes de groupe restent, et un groupe se sélectionne toujours en cliquant sa bande.
20. **Les annotations sont à refaire entièrement.** Ce qui précède n'est que le déblaiement.

L'étiquette « No points » lui a été montrée, puisqu'il ne l'avait jamais vue à l'écran. Sa
réponse, mot pour mot : « ok supprime ça aussi ». Le texte était déjà parti ; ce qui restait de
cette étiquette, ce sont les **marques rouges sur la pastille** du coureur inéligible — un
contour épaissi et un anneau clignotant.

21. **Rien ne marque plus un coureur inéligible sur l'ovale** : ni texte, ni contour, ni anneau.
    **La mesure est intacte** — l'éligibilité continue d'être calculée et la carte du sprint
    continue de griser sa ligne (§8). C'est le dessin qui est retiré, pas la règle.

### Les groupes sur l'ovale : bulles, noms et couleurs

**29 octobre 2026.** Sur son croquis, mot pour mot :

> maintenant ce que l'on va faire pour représenter les groupe sur l'ovale, c'est créer une bulle
> autour des coureurs d'un groupe. Chaque bulle aura une autre couleur qui correspondra à la
> couleur de sa box dans la timeline.
>
> La dénomination actuelle des groupes ne va pas du tout. On va faire comme suit :
>
> * Si il y a un groupe en tête de course  > 1-Leader ou 1-Leaders (selon le nombre de membres
>   du groupe)
> * Si il y a un groupe autre que le peloton derrière les leaders  > 2-Chase
> * Si il y a encore un autre groupe autre que le peloton derrière 2-Chase  >  3-Chase
>
> et ainsi de suite si il y a d'autres groupes entre les leaders et le peloton....
>
> * Peloton > 4-Bunch (le numéro 4 est dans cet exemple utilisé car j'ai déjà les groupes 1 à 3
>   devant le peloton)
> * Si il y a un groupe derrière le peloton > 5-Behind
> * Si il y a un tout dernier groupe > 6-Last
>
> Pour indiquer les noms des groupe sur l'ovale il faudra que les groupes soient marqués par une
> bulle ou une sorte de halo autour des coureurs avec une ligne vers un texte indiquant le nom du
> groupe. Cette ligne qui sépare le groupe du nom du groupe devra toujours faire en sorte que le
> nom du groupe soit affiché à l'extérieur de la piste, en tout temps et avec la même marge tout
> autour du vélodrome.
>
> Tous les groupes doivent avoir le nom de leur groupe en dehors de la piste avec la même marge.
>
> Si un groupe en dépasse un autre, il faut momentanément que le group qui se fait dépasser
> allonge la ligne qui sépare la bulle du nom de groupe afin que les nom de groupes ne se
> chevauchent pas

Et sa correction, le même jour, sur un cas qui avait été mal lu :

> Un seul groupe derrière le peloton 5-Behind — jamais Last tout seul > FAUX ! Un seul groupe
> derrière le peloton ça doit être "x-Last"
>
> Les groupe d'incidents je n'y ai pas encore réfléchi, mais je pense que ce sera "CRASH" sans
> numéro

22. **Un groupe porte son rang dans la course, compté depuis la tête**, puis ce qu'il est.
23. **Le tout dernier groupe est toujours `Last`**, même s'il est seul derrière le peloton.
    `Behind` ne sert donc qu'à un groupe qui en a encore un derrière lui.
24. **Les groupes d'incident n'ont pas de numéro** et gardent leur nom. **Ce nom n'est pas
    tranché** : « je n'y ai pas encore réfléchi » (§15).
25. **Chaque groupe a sa couleur**, la même sur sa bulle et sur sa boîte de timeline.
26. **Le nom est à la même marge tout autour**, relié à sa bulle par une ligne, et **le groupe
    dépassé allonge la sienne** pour que deux noms ne se chevauchent pas. *(Le « hors de la
    piste » de cet énoncé est remplacé le même jour : voir le point 34.)*

Sur la première version codée, il a entouré en noir la taille qu'il veut pour les bulles :

> j'ai entouré en noir pour indiquer la taille des bulles telle que je les voudrais.

Puis, la bulle du dernier groupe restant trop grande :

> là c'est pas mal sauf la bulle 3-Last qui est encore trop grande

27. **La bulle serre les coureurs qu'elle contient.** Elle ne couvre ni toute la largeur de la
    piste ni plusieurs mètres au-delà du premier et du dernier : elle se mesure **sur ses propres
    membres**, en largeur comme en longueur. Les cotes retenues sont dans `mesures.md` §26.

Puis, sur la typographie de ces noms :

> Maintenant il faut utiliser une police qui correspond à notre projet pour les noms des groupes

28. **Le nom d'un groupe est écrit dans la police du projet**, la même que celle de son nom dans
    la boîte de timeline.

Sur une capture rapprochée, deux défauts relevés par lui :

> 1. la ligne qui sépare la bulle du nom passe derrière le texte au lieu de s'arrêter au moment
>    d'atteindre le texte. Cela a pour conséquence de rendre le texte flou
> 2. il reste encore le cercle vert indiquant le leader hérité de l'ancienne version

29. **La ligne s'arrête où le nom commence.** Elle ne passe jamais derrière lui.
30. **Rien ne marque le leader sur l'ovale.** L'anneau vert et la barre verte en travers de la
    piste faisaient partie des annotations retirées ; ils avaient été laissés derrière. Le champ
    `LEADER` du panneau le nomme.

### Les couleurs des groupes

**29 octobre 2026.** Mot pour mot :

> Et puis il faut aussi toujours utiliser les mêmes couleurs pour les groupes. Je propose les
> couleurs suivantes, dis-moi ce que tu en penses :
>
> Leader(s) - Vert
> Peloton - Bleu
> Last - Rouge
> tous les autres groupes dans l'ordre chronologiques de la course des nuances allant du vert au
> rouge

Devant la remarque que le peloton coupe un dégradé vert→rouge unique, sa correction :

> Dans ce cas étale un dégradé entre vert et bleu pour les groupes devant le peloton et un
> dégradé entre bleu et rouge pour les groupes derrière le peloton

Et la contrainte qui décide des teintes exactes :

> je ne sais pas quelles couleurs utiliser pour faire bien. ce que je sais c'est qu'il faut
> éviter les couleurs se rapprochant de celle de la piste

31. **La couleur d'un groupe dépend de son rôle, pas de son rang** : elle ne change donc pas
    parce qu'un autre groupe apparaît devant lui. **Vert** en tête, **bleu** au peloton,
    **rouge** en queue.
32. **Deux dégradés, pivotant sur le peloton** : vert → bleu devant lui, bleu → rouge derrière.
33. **Aucune teinte ne doit se rapprocher de celle de la piste.** Les valeurs retenues sont dans
    `mesures.md` §26 ; elles ne lui ont pas été demandées, il a seulement posé la contrainte.

### Les noms passent à l'intérieur de l'ovale

**29 octobre 2026.** D'abord le constat :

> regarde ici les textes sont trop éloignés de la piste

Puis sa question, qui a décidé de la suite :

> je me demandais > et si nous mettions les textes de groupes à l'intérieur de la piste plutôt
> qu'à l'extérieur ?

34. **Le nom d'un groupe s'affiche à l'intérieur de l'ovale**, et non plus à l'extérieur. Le
    §17 point 26 — « toujours hors de la piste » — est **remplacé** par celui-ci ; la marge
    constante tout autour, elle, reste.
35. **Les deux boutons `SET NEXT AS LEADER` passent à l'extérieur de la piste.** Ils étaient la
    seule chose qui occupait l'intérieur au milieu de chaque ligne droite, là où un nom doit
    pouvoir se poser. Ils ne bougent jamais, le nom suit son groupe : c'est au nom qu'il faut
    la place.

### Les noms dans des badges

**29 octobre 2026.** Mot pour mot :

> on peut voir que les lignes séparant les bulles des textes ne s'arrêtent pas au texte, elles
> continuent derrière le texte. Je me demande si ce ne serait pas mieux si les textes étaient
> insérés dans des sortes de badges...

36. **Le nom d'un groupe est posé dans un badge** à la couleur du groupe, et la ligne s'arrête
    au bord du badge.

Sur la première version, le badge du peloton se posait sur ses propres coureurs :

> Mais là ce n'est pas bien !

37. **Un badge ne recouvre jamais un coureur.** Il se tient au-delà de la **bulle** de son
    groupe, pas à une profondeur fixe depuis le bord de la piste.

Puis, les badges s'étant trouvés trop loin :

> maintenant les badges sont un peu trop éloignés des bulles je trouve

38. **Un badge se tient au plus près de sa bulle**, sans jamais couvrir un coureur.

Puis, sur une séquence de cinq images prises dans le même virage :

> Ca ne va pas bien. voici une séquence de 5 images dans le virage

39. **L'écart entre une bulle et son badge est le même en tout point du vélodrome**, et ne
    change pas d'une image à l'autre.

Sur sa question « et quid des groupes qui se dépassent ? » :

40. **Un badge qui gênerait un autre s'écarte**, d'abord en s'enfonçant vers le centre comme
    l'opérateur l'a décrit, et, **quand il n'y a plus de profondeur disponible avant le
    panneau**, en glissant le long de la piste. Sa ligne suit alors la direction réelle de sa
    bulle à lui.

### Les champs ressortent de l'ovale

**29 octobre 2026.** Devant la place manquante — l'anneau entre la piste et le bloc des champs
mesure 48 unités, et un badge en demande exactement 48 — mot pour mot :

> ok alors on va les sortir de l'ovale, et on verra plus tard si on peut y remettre quelquechose

41. **Le bloc des champs quitte l'intérieur de l'ovale** et se pose au-dessus de lui, dans sa
    forme actuelle. L'intérieur est rendu aux badges.
42. **Ce qui pourra y retourner n'est pas décidé** : « on verra plus tard ». Ne rien y remettre
    sans qu'il le dise.

Il l'a dit le même jour, mot pour mot :

> bon c'est pas trop mal comme ça.
>
> Je pense qu'on peut remettre à l'intérieur la ligne des boutons ARM START - HORLOGE - ARM
> FINISH et en dessous le champ LEADER

43. **Retournent à l'intérieur de l'ovale** : la rangée `ARM START` · horloge · `ARM FINISH`,
    et le champ `LEADER` en dessous. **Rien d'autre.** Le compteur de tours, le prochain sprint
    et les tours restants restent au-dessus de l'ovale.

Cela remplace le point 34 du même jour pour le bloc des champs seulement ; les **noms de
groupes**, eux, restent à l'intérieur de l'ovale, ce qui était tout l'objet de ce déplacement.

### Sa page redessinée

**29 octobre 2026.** Il a redessiné la page entière et l'a transmise : « J'ai redessiné toute la
page ». Ce qu'elle montre, et ses réponses aux cinq points qu'elle laissait ouverts :

44. **L'intérieur de l'ovale reste gris.** Il l'avait dessiné noir : « c'était pour voir ce que
    ça donnait. Peut-être que c'est plus lisible en gris ».
45. **La timeline ne porte plus les noms des coureurs** — dossard, drapeau et code pays
    seulement. « Confirmé ».
46. **Le badge du prochain sprint passe à l'orange à deux tours**, comme le champ qu'il
    remplace. **Sa place n'est pas acquise** : « il est possible que je le déplace plus tard ».
47. **L'horloge de course n'est que dans l'ovale.** Celle de la barre du haut est **celle du
    simulateur**, et elles ne montrent pas la même chose : depuis `ARM FINISH`, l'horloge de
    course se fige sur le vainqueur pendant que la lecture continue.
48. **Le simulateur ne s'ouvre que par son bouton**, et pourrait même s'ouvrir dans une autre
    fenêtre.
49. **L'intérieur de l'ovale reprend les tours restants** : la rangée du départ, puis les deux
    provenances à côté de `LAP` et `TO GO`, puis `LEADER` et le prochain sprint en badges. La
    barre au-dessus de l'ovale disparaît.

### Son deuxième dessin de l'intérieur

**29 octobre 2026.** Mot pour mot : « j'ai tenté de redessiné différemment l'intérieur d'ovale,
regarde la capture ». Elle montre **trois colonnes côte à côte** : le départ (armement, horloge,
arrivée) empilé verticalement ; les deux provenances et les tours restants ; puis le leader et
le prochain sprint.

Et, devant deux libellés qui passaient à la ligne :

> Si nécessaire on peut réduire la taille des polices, des boutons d'armage, de l'horloge

50. **L'intérieur de l'ovale est en trois colonnes**, dans cet ordre.
51. **Les tailles peuvent se réduire** pour que tout tienne : polices, boutons d'armage,
    horloge. Les valeurs retenues sont dans `mesures.md` §26.

**Le compteur de tours de course ne figure pas sur ce dessin.** Il est gardé, en tête de la
troisième colonne, parce qu'il avait demandé qu'il soit affiché quelque part (point 1 de cette
section). À confirmer ou à retirer.

Puis, sur le libellé de ce champ, mot pour mot :

> le champ "NEXT SPRINT 3 in 6 laps" peut se renommer ainsi "SPRINT 3 - 6 LAPS"

52. **Le prochain sprint s'écrit `SPRINT n - x LAPS`.** Le mot « NEXT » disparaît, et le nombre
    de tours est en majuscules. Au tour du sprint : `SPRINT n - THIS LAP`.

### Le simulateur dans une autre fenêtre

Sa proposition : « On peut même imaginer que le simulateur s'ouvre dans une autre fenêtre »,
puis « Cela supprimerait ces boutons ».

**Ce qui a été répondu, et qui reste à trancher par lui** : le prototype est un fichier autonome
qu'il ouvre souvent par double-clic, donc en `file://`, et deux fenêtres `file://` ne peuvent
pas se parler en JavaScript — Chrome leur donne des origines opaques. Il faudrait passer par le
serveur ou faire transiter l'état par le stockage du navigateur. La contre-proposition est de
garder le simulateur dans la page mais **en recouvrement**, refermable entièrement, ce qui donne
le même écran sans boutons de test. **Non tranché** (§15).

### La couleur de l'intérieur de l'ovale

Sur la question de savoir si l'intérieur de l'ovale doit s'éclaircir, puisque sa maquette le montrait blanc :

> Je ne sais pas encore

Il reste donc **tel qu'il est**, et la question est ouverte (§15).

### La barre du haut

**29 octobre 2026.** Son dessin de la page entière place dans l'en-tête ce qui vivait jusque-là
dans le rail du simulateur : le transport (`⏮ 30s`, lecture, pause, `×1`/`×4`/`×16`), l'horloge
du simulateur, le champ unique qui dit `REC` ou `PLAYING RACE n`, puis `Replay` et `New`.

53. **Le transport du simulateur est dans la barre du haut, en permanence.** Masquer le rail ne
    déplace plus rien : le rail se réduit à son bouton `Simulator` et les commandes de lecture
    restent là où elles sont. Le titre « Lap timeline · prototype » laisse la place ; le
    sous-titre, qui porte le numéro de build, reste.

### La timeline compacte

**29 octobre 2026.** Sa page redessinée montre une colonne de timeline resserrée : chaque bloc
de groupe porte **quatre choses** — son numéro, son nom, le nombre de coureurs et l'écart — et
chaque ligne de coureur **trois** : le dossard, le drapeau et le code pays.

54. **L'en-tête d'un bloc ne porte que ces quatre champs.** La mention « race leader » qui
    suivait le nombre de coureurs a été retirée : le champ de l'écart dit déjà « leader » pour
    le groupe de tête, et la colonne resserrée coupait le texte. **Écart par rapport à un
    comportement validé, signalé le 29 octobre 2026 ; à confirmer ou à rétablir.**
55. **Une ligne de coureur ne porte plus son nom.** Le nom reste dans l'infobulle de la ligne
    et dans le classement. Les marqueurs d'état — hors piste, sans transpondeur, non lu, hors
    sprint, sans points — restent sur la ligne : leur retrait n'a pas été demandé.

**29 octobre 2026, sur une capture annotée en rouge.** Trois choses de plus quittent la
timeline, et une reste :

56. **La colonne n'a plus d'en-tête.** Le titre « Lap timeline » et la note « measured
    positions · laps as validated » sont retirés.
57. **La pastille du numéro de groupe est retirée.** Le nom la contient déjà : `1-Leaders`,
    `2-Bunch`. Le numéro reste calculé, c'est son affichage en double qui disparaît.
58. **La bande entre deux blocs ne porte plus l'écart** « 2 m · 0,1 s ». L'écart d'un groupe
    est déjà dans son en-tête.
59. **La zone de dépôt reste, et devient permanente.** Mot pour mot : « on pourrait les laisser
    visibles en permanence ». Elle était écrite seulement pendant un glisser ; elle est
    maintenant lisible tout le temps, en gris, et passe à la couleur d'accent au glisser.
60. **Le nombre de coureurs n'est plus suivi de « with the bunch » ni de « with BIB … ».**

### La colonne de droite

**29 octobre 2026.** Sa page redessinée place la carte du sprint et la liste de départ
**côte à côte, à droite de l'ovale**, sur toute la hauteur.

61. **La carte du sprint s'ouvre dans une colonne de droite.** Elle n'existe que pendant un
    sprint ; hors sprint, l'ovale et le journal reprennent toute la largeur.
62. **L'ovale et le journal restent visibles pendant un sprint.** Jusqu'ici la carte les
    masquait tous les deux. **Écart par rapport à un comportement validé**, imposé par son
    dessin, qui montre les trois ensemble.

### La barre d'actions

**29 octobre 2026.** Mot pour mot : « La barre d'actions et la carte de proposition sont
prévues à gauche de l'ovale, à droite de la timeline, et non pas au-dessus de l'ovale ».

63. **Une colonne d'actions sépare la timeline de l'ovale.** Elle porte la barre de sélection
    en haut, et sous elle les cartes de proposition.
64. **Les propositions quittent les blocs de la timeline.** Elles s'écrivaient dans l'en-tête
    du groupe concerné ; elles sont maintenant rassemblées dans cette colonne. Ce qui reste
    sur la ligne du coureur : sa marque « +1 ? » / « −1 ? » et son ✓, qu'il avait demandés.
65. **Le journal passe sous les deux colonnes**, comme sur son dessin.

### Quatre dispositions à essayer pendant un sprint

**29 octobre 2026.** Devant le choix de la place de la carte du sprint, mot pour mot :

> je voudrais voir toutes les propositions, je ne peux pas me décider sans les essayer

Et sur la taille de fenêtre :

> Là je travaille depuis la maison et mon écran à une largeur de 1920, mais habituellement les
> ordinateurs de service ont une largeur de 1440. Mais les opérateurs peuvent s'adapter

Il a par ailleurs écarté la piste du bandeau du bas : « je n'aime pas beaucoup la vue du bas,
je la trouve beaucoup trop petite verticalement parlant ».

66. **Les quatre dispositions sont livrées comme des interrupteurs d'essai**, dans le rail du
    simulateur, combinables librement : carte resserrée, actions sous l'ovale, timeline
    repliée, passages repliés. **Elles sont temporaires** : une fois son choix fait, la
    disposition retenue est écrite en dur et les interrupteurs disparaissent.
67. **L'écran doit tenir en 1440 px de large.** C'est la taille des ordinateurs de service.

### La timeline étroite, et les actions au clic

**29 octobre 2026.** Il a redessiné la timeline et l'a transmise en deux captures. Mot pour
mot :

> je n'ai besoin de consulter les noms des coureurs qu'à un seul endroit : la liste
> "Standings". Pas besoin dans la carte Sprint.

> Replier la timeline ne me plait pas beaucoup, en revanche on peut la réduire de beaucoup
> dans la largeur. [...] Avec une timeline aussi étroite toutes les actions individuelles
> passent par un clic sur sur un coureur et la fenêtre d'option dans la colonne d'action
> disponible. Et je pense qu'on devrait aussi pouvoir sélectionner le groupe en cliquant dans
> son en-tête et là aussi les actions disponibles devraient être proposées pour application au
> groupe entier

68. **Le nom d'un coureur ne s'affiche que dans Standings.** Il quitte la carte du sprint :
    l'ordre, la liste de départ, les non éligibles, les retirés et le bandeau des coureurs sans
    transpondeur ne portent plus que le dossard et le code pays. Le nom reste dans l'infobulle
    de chaque ligne.
69. **La timeline fait 118 px de large.** Son en-tête de bloc est une bande à la couleur du
    groupe, sur deux lignes : le nom en capitales, puis le nombre de coureurs et l'écart. Une
    ligne de coureur porte son dossard, son drapeau et son code pays, rien d'autre.
70. **Les actions individuelles passent par un clic sur le coureur.** Les boutons qui
    apparaissaient au survol de sa ligne sont supprimés ; la colonne des actions propose
    `Laps…` et `Leader` dès qu'un seul coureur est sélectionné, et les compteurs de tours et
    le choix de couleur s'y ouvrent.
71. **Un clic sur l'en-tête d'un bloc sélectionne le groupe entier**, et les actions de la
    colonne s'appliquent alors à tout le groupe.

La bande et son texte sont **relevés sur son croquis**, pas décidés : le fond y est en
`rgb(51, 180, 244)`, qui est la couleur du peloton et celle de sa bulle sur l'ovale, et le
texte en noir. Le prototype rend `rgb(52, 180, 244)` sur du texte sombre. Rien n'est à
confirmer : c'est son dessin.

### Les passages quittent la page

**29 octobre 2026.** Sa décision, mot pour mot :

> Il faut retirer complètement la vue "Crossings" "Decisions" "Sprints" "Standings" de la page
> et l'offrir comme possibilité mais en allant l chercher dans un menu, éventuellement la barre
> tout en haut de la page par exemple.
> Et la barre d'action prend la place de cette vue. Elle n'a pas besoin d'être très haute

72. **Le bandeau des passages n'est plus affiché en permanence.** Il s'ouvre par le bouton
    `Race log` de la barre du haut, par-dessus l'écran de course, et se referme par `Close` ou
    par la touche Échap. Ses quatre onglets sont inchangés.
73. **La barre d'actions prend sa place, sous l'ovale, et reste courte** : 34 px en 1920, 60 px
    en 1440, où elle passe sur deux lignes.
74. **Le numéro de build a un champ à lui dans la barre du haut.** Le sous-titre se laisse
    couper quand la barre se resserre ; le numéro, jamais.

Les interrupteurs d'essai sont retirés : son choix est fait et la disposition est écrite en
dur.

### La carte d'une proposition

**29 octobre 2026.** Devant une carte qui alignait les dossards dans une phrase, mot pour mot :

> mais je n'aime pas la façon dont tu les présentes. je préfère ma façon car on a besoin de
> prendre connaissance des BIB impliqués très rapidement

Puis, sur son propre croquis :

> effectivement il faut ajouter le code nation et le drapeau à ma proposition

75. **Les dossards d'une proposition sont empilés, sous un en-tête `BIB`**, à gauche de la
    carte, chacun avec son drapeau et son code pays. Le titre, les boutons `✓ all` et `✕` et le
    tour concerné sont à droite.
76. **Le ✓ de chaque coureur est à côté du sien, dans la carte.** Il était sur sa ligne dans la
    timeline ; à 118 px de large, il lui mangeait son code pays (« 52 · I ✓ »). La ligne porte
    désormais une marque bleue, sans bouton, et le ✓ valide toujours ce coureur seul.

77. **L'ovale est collé en haut de l'écran, et les propositions ont une ligne à elles**, entre
    l'ovale et les actions. Mot pour mot : « Il y a beaucoup de place en hauteur au-dessus et
    en-dessous de l'ovale ! Monte l'ovale sur l'écran et place les propositions dans une ligne
    entre l'ovale et les actions ».
78. **Rien ne se laisse vide sous les actions.** Mot pour mot : « Pourquoi laisses-tu un espace
    vide en-dessous des actions ??? ». Une première version réservait en permanence la hauteur
    de la ligne des propositions, pour que l'ovale ne saute pas quand il en arrive une : **il
    l'a refusé**. L'ovale prend donc toute la hauteur que les deux lignes du bas lui laissent,
    et il se redimensionne à l'arrivée d'une proposition.

79. **La carte des sprints reste à l'écran en permanence.** Mot pour mot : « il faut conserver
    la carte des sprints en permanence ». Hors sprint elle annonce le prochain -- `SPRINT n ·
    x laps to go · waiting for the bell` -- garde ses places vides et la liste de départ
    entière, et ne porte aucune commande puisque rien n'est à juger.
**La carte reste sur deux colonnes.** Elle avait été empilée sur une seule, pour rendre de la
largeur à l'ovale : l'opérateur ne l'avait ni demandé ni vu proposer, et l'a refusé --
« qui t'a demandé de mettre la carte de sprint sur une colonne ? ». Remis en l'état à la
build 125. La largeur rendue à l'ovale ne justifie pas de changer un écran validé sans le
proposer (§14, point 1 et point 3).

81. **L'ovale est calé en haut de son panneau.** Mot pour mot : « REMONTE L'OVALE SUR LA
    PAGE ». Son dessin ne se centre plus verticalement : le haut de la piste est à 134 px du
    haut de la page en 1440, contre 250 px auparavant. Tout le vide passe donc sous l'ovale.

### Les deux dispositions de la zone sous l'ovale

**29 octobre 2026.** Deux croquis, et mot pour mot :

> On peut positionner les actions et propositions de deux manières différentes. Je trouve
> qu'offrir cette flexibilité à l'utilisateur est très intéressante

82. **La zone sous l'ovale prend toute la place que l'ovale laisse**, et se dispose de deux
    manières, au choix de l'utilisateur :
    - **les propositions au-dessus, les actions en dessous**, toutes deux sur toute la largeur ;
    - **les actions en colonne à gauche**, les propositions à leur droite.
83. **C'est un choix de l'utilisateur, pas un réglage d'essai.** Il ne disparaîtra pas.
    **Son sélecteur est dans le coin haut droit du panneau des actions**, c'est-à-dire dans la
    zone qu'il commande. Il avait d'abord été mis dans la barre du haut : « mais le sélecteur
    de disposition de actions et propositions se trouve dans la barre en haut de l'écran ? !
    C'est ridicule ! » (29 octobre 2026).

### Les commandes respirent

**29 octobre 2026.** Mot pour mot :

> je ne sais pas comment te faire comprendre qu'il ne faut PAS tout serrer ! Pour les humains
> c'est très difficile à s'y retrouver ! Les actions présentent beaucoup de boutons tous très
> rapprochés les uns des autres, et alors même qu'il y a beaucoup de place sur la page !

Puis, sur la carte de proposition : « et c'est la même chose pour les propositions ! ».

84. **Les boutons des actions et des propositions sont à taille normale**, pas en petit
    format : 13 px de texte, 7 px de marge intérieure verticale, 13 px horizontale.
85. **Ils sont espacés** : 8 px entre deux boutons d'une même famille, 10 px entre deux
    familles, qui vont chacune à la ligne. La ligne de sélection est séparée du reste par un
    trait.
86. **La place disponible se remplit, elle ne se laisse pas serrer.** C'est une règle générale
    de l'écran, pas un réglage de cette barre.

### La timeline à 24 coureurs

**29 octobre 2026.** Sur la hauteur de la colonne : « est-ce que la hauteur de la timeline sera
suffisante pour les courses avec 24 coureurs, répartis dans plusieurs groupes ? ». Devant les
mesures, son choix : **en-têtes collants, et réduire la hauteur de tous les éléments**.

87. **L'en-tête d'un bloc est collant.** Quand la colonne défile, le nom du groupe, son nombre
    de coureurs et son écart restent visibles au-dessus de ses coureurs.
88. **Tous les éléments de la timeline sont plus bas** : la ligne d'un coureur passe de 26 à
    22 px, l'en-tête d'un bloc de 35 à 30, la bande de dépôt de 32 à 16. Son libellé passe de
    « Drop here: new group » à « new group » -- à 118 px de large il tenait sur deux lignes, il
    en tient maintenant une. **Confirmé par l'opérateur le 29 octobre 2026** : « non c'est bien
    comme ça, garde "new group" ».

89. **Un dossard sur la piste ne doit pas en déborder.** Mot pour mot : « il faudrait réduire
    la taille des badges des coureurs sur la piste. De façon à ce qu'ils ne débordent pas de la
    piste ». Le rayon d'un dossard passe de 15 à 10 et l'écart des files de 24 à 19, si bien
    qu'un coureur de la file extérieure atteint 29 pour une demi-piste de 30. Il en atteignait
    **39** auparavant, soit 9 au-delà du bord.

90. **La bulle d'un groupe ne déborde pas non plus.** « oui rentre la bulle aussi ». Ses deux
    bords sont calculés puis ramenés dans la piste, et son milieu s'en déduit -- borner la
    seule largeur ne suffisait pas, une bulle décentrée dépassait encore d'un côté.

91. **La disposition en colonne est celle par défaut.** « je préfère la deuxième disposition,
    garde-la par défaut » : les actions à gauche, les propositions à droite. L'autre reste à un
    clic dans la barre du haut.

### L'équilibre entre l'ovale, la timeline et les actions

**29 octobre 2026.** Sur une capture en 1910 × 900 : « je ne suis pas satisfait du résultat
final ! l'ovale est beaucoup trop grand, la timeline beaucoup trop petite », puis « et il faut
éviter que action doive scroller pour être vue entièrement ! ».

92. **La zone du bas prend la hauteur dont elle a besoin, l'ovale prend ce qui reste.** La
    barre d'actions ne défile jamais : c'est elle qui fixe sa hauteur, pas l'inverse.
93. **La timeline passe de 118 à 168 px**, et ses éléments grandissent avec elle : la ligne
    d'un coureur de 22 à 28 px, son dossard de 19 à 24, son code pays de 12 à 14 px, l'en-tête
    d'un bloc de 30 à 38.
94. **L'ovale n'a ni plafond ni proportions imposées.** L'un et l'autre recréaient du vide. Il
    prend exactement la place laissée, son dessin calé en haut de son panneau.

95. **L'ovale n'a plus de cadre.** L'opérateur a entouré en rouge, le 29 octobre 2026, deux
    rectangles vides de part et d'autre de la piste : « toute cette place est inutilisée alors
    que dans le même temps la timeline est très serrée ». Ces rectangles étaient l'intérieur du
    panneau de l'ovale, que son dessin ne remplissait pas. Sans cadre ni fond, la place libre
    autour de la piste est le fond de la page.
96. **La timeline reste à sa largeur utile** (176 px). L'élargir à 290 px ne remplissait rien :
    une ligne ne porte qu'un dossard, un drapeau et un code pays, et la moitié droite restait
    vide. Essayé, regardé, abandonné.

97. **La carte permanente porte toutes les commandes du sprint.** « on ne peut pas trier les
    coureurs de la liste de la carte sprint par BIB ni par NOC. De plus il existait beaucoup
    plus d'options qu'actuellement dans les cartes de sprint. Il faut les restaurer ! » Hors
    sprint, la carte montre le **prochain** sprint, avec le tour jugé et ses flèches, la saisie
    manuelle, l'ordre mesuré, l'enregistrement, le mode Live, la place suivante, les non
    éligibles et le tri de la liste de départ. **Seuls `Send` et `Close` manquent avant la
    cloche** : il n'y a rien à envoyer et rien à fermer.

98. **La carte du sprint respire comme les actions.** « DONNE DE L'AIR ! Il y a énormément de
    place en-dessous du classement ». La ligne d'une place passe de 28 à 36 px, celle de la
    liste de départ de 26 à 30, les marges de la carte de 6 à 10 px.
99. **La rangée « place suivante » quitte la colonne étroite de la liste de départ** pour
    passer **sous l'ordre**, à gauche, où la place ne manque pas. Elle tient sur deux lignes
    voulues -- le libellé et la place en cours, puis les quatre boutons `1st` à `4th` à taille
    normale -- au lieu de passer à la ligne toute seule dans 170 px.

100. **Les commandes qui agissent sur l'ordre vivent avec l'ordre.** « Les boutons Manual,
     Detected order, Clear and record ne sont pas obligés d'être coincés tout en haut de la
     carte ». Ils passent sous l'ordre, dans la colonne de gauche, à taille normale et espacés.
     L'en-tête de la carte ne garde que l'identité du sprint -- son numéro, le tour jugé et ses
     flèches, le compte à rebours -- et `Live`, `Send` et `Close`.
101. **L'ordre porte son titre et le rappel du glisser.** « réordrer par drag est toujours
     possible non ? » -- oui, il l'est toujours : glisser une ligne de l'ordre la déplace,
     glisser un coureur de la liste de départ le place. Le rappel avait été retiré avec
     l'en-tête de colonne tronqué « D… » ; il est rendu, en clair, au-dessus de l'ordre :
     « ORDER · drag a line to reorder ».

102. **Un sprint fermé ne revient pas dans la carte.** Juste après `Close`, la carte
     réaffichait « SPRINT 1 · waiting for the bell » -- le sprint que l'on venait de clore.
     Elle montre maintenant le prochain sprint **non jugé**.

103. **Un coureur privé de points le dit partout où il apparaît.** « Il faut qu'ils y soient
     aussi. Il faut aussi que dans le timeline ils soient indiqués comme non éligible quand
     c'est le cas. Et dans l'ovale aussi. Je verrais bien une info dans le badge de leur
     groupe » (29 octobre 2026). Donc :
     - **dans la carte du sprint**, « Not eligible » compte et liste les deux sortes : ceux que
       l'opérateur a écartés, et ceux que la règle de course a rendus inéligibles au moment de
       leur passage, avec le motif « no points · not eligible when he crossed ». La flèche de
       reclassement n'est offerte que pour les premiers : elle ne dégriserait pas un passage ;
     - **dans la timeline**, sa ligne porte une pastille rouge `no pts` et son code pays passe
       au rouge ;
     - **sur l'ovale**, le badge de son groupe le dit : `1-Bunch · 2 NO PTS` quand une partie
       du groupe est concernée, `· NO PTS` quand tout le groupe l'est. C'est la seule marque
       qui revient sur la piste depuis le retrait des annotations.

104. **La carte de sprint se range en trois colonnes.** Le 29 octobre 2026, l'opérateur a
     redessiné la carte par-dessus une de mes captures : à gauche l'ordre, au milieu les
     coureurs, à droite **une colonne de commandes**, et non un pied de carte. Ses mots sur
     l'état précédent : « tes cartes sont nulles. regarde celle-ci ». Dans sa colonne de
     droite, de haut en bas : le tour jugé, l'envoi, la source de l'ordre, la place suivante,
     la saisie manuelle avec son champ.

105. **Aucune colonne ne porte du vide.** « il y a la zone jaune complètement inutilisée, et
     la zone encadrée en vert qui donne une info redondante (le classement qui est déjà
     affiché à gauche) » (29 octobre 2026). Donc : la ligne de l'ordre n'a plus de colonne
     souple -- place, dossard, nation, écart calé à droite, et les deux icônes -- et **la
     liste des coureurs perd sa colonne de rang** : le grisé dit qui est placé.

106. **La carte peut prendre sa largeur sur l'ovale.** « si prendre à l'ovale c'est bien car
     ça permet de disposer des éléments différemment » (29 octobre 2026). Elle fait donc 500
     px sur un écran de 1440, et la piste y passe de 705 × 315 à 634 × 283.

107. **Les coureurs sans transpondeur se placent depuis la colonne des commandes.** Leur bloc
     était au-dessus de l'ordre, où il repoussait les places et séparait le titre `ORDER` de
     son propre en-tête de colonnes. À la question « tu ne vois pas un autre endroit où il
     pourrait être sans gêner personne ? », la réponse de l'opérateur est **la bande libre au
     bas de la colonne des commandes** -- le seul endroit vide dans tous les états de la
     course, y compris quand les vingt-quatre places sont prises.

108. **`not placed` est supprimé.** « not placed est totalement inutile » (29 octobre 2026).
     Le bloc ne garde que les cinq places.

109. **L'interface est en anglais, et rien ne s'y explique.** J'avais écrit, de ma propre
     initiative, « la place est retenue jusqu'au passage suivant, ou jusqu'à Send » sous les
     boutons, et « déposer ici » dans la zone de dépôt. Sa réaction : « Qu'est-ce c'est que
     texte ??? ». Les deux sont retirés : du texte inventé, et en français dans une interface
     qui n'est qu'en anglais.

### Les poignées, et la taille des éléments · 31 octobre 2026

Demandé après l'audit de la version mixte. Mot pour mot :

> Ce que je voudrais, c'est que la partie supérieure de l'ovale soit toujours fixe en haut de
> sa zone, et la partie gauche fixe également près de la timeline, quelle que soit la taille
> qu'on lui applique.
>
> Ensuite je voudrais pouvoir agrandir/réduire les zones de la timeline, des boutons
> d'actions, des propositions, des sprints à l'aide de « poignées », comme c'est le cas dans
> cette interface Claude code pour resizer les différentes parties de la page.
>
> Et finalement pouvoir resizer les éléments de chaque zone, comme c'est déjà le cas pour
> l'ovale.

110. **L'ovale s'ouvre par son coin haut-gauche.** Le haut du dessin ne quitte pas le haut de
     sa zone, et son côté gauche ne quitte pas le bord de la timeline, à n'importe quelle
     taille.

111. **« La piste commence à être rognée » a une définition, et c'est la sienne** : « C'est
     sur les côtés le ruban marron, dessus et dessous ce sont les bords supérieurs et
     inférieurs respectivement des boutons "SET NEXT AS LEADERS" ». Le bouton `+` du réglage
     de l'ovale s'arrête là, et non à une valeur écrite d'avance.

112. **Les boutons `SET NEXT AS LEADER` ne bougent pas.** Ses mots : « Les boutons SET NEXT AS
     LEADER restent là où ils sont ! ». Le point 35 tient donc inchangé, et c'est lui qui
     fixe le plafond du réglage.

113. **Le `+` sert à revenir, pas à dépasser.** « Si j'utilise "-" peut-être que vais-je avoir
     envie de revenir en arrière et donc je vais avoir besoin de "+" !!! ». Le réglage est
     donc une plage 60 %–100 % sur l'écran de référence, et le `+` est grisé en haut de plage
     comme le `−` l'est en bas.

114. **Les titres de groupe sont réduits en hauteur.** « je pense que les titres des groupes
     devraient être réduits en hauteur ». Rien n'en est retiré : les quatre choses du point
     §17 y restent.

115. **Les deux bandes de dépôt restent atteignables.** « il faut bien s'assurer que les
     boutons permettant de créer un groupe au-dessus du groupe le plus haut et un groupe
     au-dessous du groupe le plus bas soient accessibles pour un drag'n'drop de coureurs ».
     Elles sont donc épinglées en haut et en bas de la colonne, y compris quand elle déroule.

116. **Le scroll se retarde, il ne se supprime pas.** « évidemment qu'on ne peut pas éviter le
     scroll indéfiniment ! Si il y a 24 groupes ça va forcément déborder. Mais le but est
     d'éviter le plus possible le scroll ». La timeline resserre donc ce qu'elle contient
     jusqu'à un plancher, et déroule au-delà.

117. **La timeline garde un bouton de taille.** « ?? Comment ça aucun bouton ? Et si
     l'opérateur souhaite l'agrandir ??? ». La taille qu'il pose est un plafond : le
     resserrement automatique ne va que vers le bas, et revient exactement à sa valeur dès
     qu'il y a la place.

118. **Un drapeau entre dans l'ordre du sprint, le nom n'y revient pas.** Sur la largeur de la
     colonne : « Je suis d'accord ! Je pense que le nom n'est pas vraiment nécessaire dans
     l'ordre, en revanche un drapeau serait utile ». Et, sur la place disponible, capture à
     l'appui : « je pense qu'il y a la place pour placer un drapeau dans la zone que j'ai
     encadré en rouge, non ? ». La colonne ne s'élargit pas pour autant.

119. **Rien ne bouge si personne n'y touche.** Ses mots, en capitales : « TOUT DOIT RESTER
     IDENTIQUE SI PERSONNE NE TOUCHE LES POIGNEES OU LES BOUTONS POUR AGRANDIR OU REDUIRE LES
     ELEMENTS !!!!!!!!!!!! ». Les tailles posées sont donc gardées sur le poste et relues au
     chargement, le réglage de l'ovale compris. La seule chose qui bouge sans lui est le
     resserrement du point 116, et il revient toujours à ce qu'il a posé.

120. **Il faut pouvoir régler la taille des éléments, zone par zone.** « Je ne sais pas, mais
     j'ai besoin de pouvoir ajuster la taille des éléments ! » — la forme était laissée
     ouverte, la capacité non.

### Les poignées, le zoom et la fenêtre d'actions · 31 octobre 2026, deuxième tour

Après avoir essayé la build 149, en réponse à l'audit `audit-ux.md`. Ses mots, entiers.

121. **Les poignées vont dans les deux sens, l'ovale compris.** « Les poignées ont été créées
     mais fonctionnent mal surtout celle de l'ovale qui ne va que dans un sens. » Et, sur la
     seule façon de récupérer l'ovale qu'il avait alors : « il faut pouvoir récupérer avec
     double clic ET avec la poignée ! ». Le double-clic ne remplace donc pas la poignée.

122. **La barre d'actions se resserre seule quand on serre sa zone.** Son choix entre deux
     réponses posées, le 31 octobre 2026 : « Elle se resserre seule ». Elle réduit la taille
     de son contenu juste ce qu'il faut pour tenir dans la place qu'on lui laisse, et revient
     à sa taille dès qu'il y a de nouveau la place — comme la timeline au point 116. C'est ce
     resserrement qui donne à la poignée de l'ovale de quoi aller dans l'autre sens, et la
     barre ne défile toujours jamais (sa règle du 29 octobre 2026).

123. **Les boutons de zoom sont remplacés par CTRL + molette.** « Les boutons de zoom ont eux
     aussi été créés mais ne fonctionnent pas tous. mais sont tous très mal placés, peut-être
     faut-il les remplacer par une fonctionnalité CTRL+scroll ? » Son choix entre trois
     réponses posées, le même jour : « Ils disparaissent ». CTRL + molette règle la zone sous
     le pointeur ; rien ne paraît à l'écran tant que tout est à 100 % ; dès qu'une zone n'y
     est plus, une étiquette paraît dans son coin, et un clic dessus la ramène à 100 %.

124. **La fenêtre des actions est de taille fixe.** « La fenêtre des actions change de taille
     selon qu'on sélectionne un coureur dans la timeline, et selon quelles actions on
     sélectionne. Cela a pour effet de bouger la zone de l'ovale. Il faut que cette fenêtre
     d'action soit de taille fixe. »

125. **Le registre « Laps… » s'affiche à droite de la fenêtre d'actions.** Sa réponse, écrite
     de sa main plutôt que choisie parmi celles posées, le 31 octobre 2026 : « le registre
     s'affiche à droite de la fenêtre d'actions ». Il ne pousse donc rien, ni la barre ni
     l'ovale.

### Le registre debout, et ce qu'on lui retire · 31 octobre 2026, troisième tour

Après avoir vu le registre sorti de la barre en build 150. Ses mots, entiers.

126. **Le registre se tient debout.** « le registre pourrait être positionné verticalement ».
     Couché il demandait toute la largeur laissée par la fenêtre d'actions ; debout il prend la
     forme de la colonne d'actions à sa gauche et rend cette largeur aux propositions.

127. **La sélection des couleurs sort du registre.** « il faut retirer la sélection des
     couleurs, c'est inutile ». Elle était le seul endroit du prototype où la couleur d'un
     coureur se changeait ; il l'a su avant de trancher, et il a tranché.

128. **Le registre n'a qu'une bordure, la sienne.** « je trouve bizarre cette espèce de bordure
     tout autour du registre ». Le conteneur qui le porte ne se montre pas : il ne sert qu'à
     tenir la place à droite de la fenêtre d'actions.

### Le registre doit être de la même page · 31 octobre 2026, quatrième tour

129. **Le registre porte le style du reste de la page, et ses options s'alignent.** « ce
     registre est de piètre qualité, il ne correspond pas au reste de la page au niveau du
     style des composants, et les options ne sont pas alignées ». Mesuré avant correction :
     boutons de 21 px contre 32 dans la fenêtre d'actions posée à 22 px de là, deux fonds de
     panneau différents, et les trois commandes décalées de 16 px d'une ligne à l'autre parce
     que « gained » est plus long que « lost ».

130. **Le registre porte toute la sélection.** Son choix entre deux réponses posées, le
     31 octobre 2026 : « Toute la sélection », une ligne par coureur avec son compte gagnés /
     perdus. Cela **ouvre son point 70 du 29 octobre**, qui réservait `Laps…` au coureur seul :
     le bouton s'allume maintenant dès qu'il y a une sélection, et un clic sur l'en-tête d'un
     bloc ouvre donc le registre du groupe entier. `Leader` reste à un seul coureur — il
     désigne le leader, et il n'y en a qu'un.

131. **Le coin de la barre d'actions est déblayé.** Capture à l'appui : « regarde ici ce chaos
     faut dans la barre de la fenêtre d'action !!! Il supprimer tout ce qui est superflu ! »
     Son choix entre trois objets posés, le 31 octobre 2026 : « l'étiquette de taille et le
     sélecteur de disposition s'en vont ». Le `Clear` reste — c'est le seul moyen visible de
     tout désélectionner d'un coup. Les deux dispositions restent dans le code ; c'est la
     commande qui a disparu, et il n'a pas dit où elle allait.

132. **La ligne de sélection ne porte que les dossards.** Sa réponse, écrite de sa main plutôt
     que choisie parmi celles posées, le 31 octobre 2026 : « il ne faut afficher que les BIB,
     rien d'autre ». Le nom du groupe, l'effectif et la phrase d'invite s'en vont.

133. **La fenêtre d'actions remplit la place qu'on lui donne.** « Et la position de la fenêtre
     d'action quand on lui agrandi sa zone : elle laisse du vide en-dessous d'elle, et ce vide
     est perdu pour tout le monde ! » Son choix entre deux réponses posées, le même jour :
     « La barre grandit pour le remplir ». Agrandir la zone grossit donc les commandes, la
     resserrer les resserre — le point 122 dans l'autre sens. Le réglage manuel de cette zone
     disparaît : deux commandes pour la même grandeur étaient une de trop.

134. **Les boutons qui tranchent répondent au relâchement.** « Oui, corrige la reconstruction
     du registre et de la barre d'actions (point 1 de l'audit) ». C'est le point 1 de
     `audit-ux.md`, qu'il a sorti de la liste ce jour-là.

135. **Il n'y a plus qu'une disposition sous l'ovale, côte à côte.** Sa réponse à la question
     de savoir où allait le sélecteur, le 31 octobre 2026 : « Le sélecteur de disposition part
     pour de bon, retire les deux dispositions et garde seulement côte à côte ». Le choix
     qu'il avait ouvert le 29 octobre (« On peut positionner les actions et propositions de
     deux manières différentes. Je trouve qu'offrir cette flexibilité à l'utilisateur est très
     intéressante ») est donc refermé par lui, et la disposition empilée sort du code.

### Les cinq points de design de l'audit · 31 octobre 2026, cinquième tour

Les cinq points de `audit-ux.md` section B, posés un par un après qu'il a écarté une première
fournée présentée en bloc : « **Mais je ne comprends rien à ce que tu me dis** », puis « **une
chose après l'autre ok ?** ». Les questions ont été reposées en montrant ce qui change à
l'écran, une à la fois.

136. **Une proposition qui attend passe en orange.** Son choix, le 31 octobre 2026 : « **La
     carte passe en orange** ». La carte prend l'orange vif du champ du prochain sprint tant
     qu'elle attend, et **pendant ce temps le champ du sprint redevient bleu** : une seule
     chose crie à la fois. C'est le point A de `audit-ux.md` section B.

137. **Les couleurs des coureurs : trois options à essayer, aucune des deux posées.** Il a
     écarté la roue calculée et le remplacement des doublons, et a écrit les siennes, le
     31 octobre 2026 : « **on va essayer trois options : 1. tout le monde en blanc, sans
     couleur, que le numéro 2 comme option 1 mais avec NOC attaché. 3. les numéros et les
     badges prennent la couleur du drapeau du pays** ». Les trois se **dessinent** avant
     d'être codées ; rien n'est tranché.

138. **Les petits textes gris s'éclaircissent, et les phrases quittent les capitales.** Son
     choix, le 31 octobre 2026 : « **Les éclaircir, et les phrases quittent les capitales** ».
     Les en-têtes de colonne gardent leurs capitales ; ce sont les **phrases** — l'indice
     d'onglet, la raison d'inéligibilité, les notes du registre — qui passent en minuscules.
     C'est le point C.

139. **Le panneau de l'ovale ne garde que ce qui se lit en course.** Son choix, le 31 octobre
     2026 : « **Sortir aussi les réglages du panneau** ». Restent l'horloge, `LAP`, `TO GO`,
     `LEADER` et le prochain sprint. Sortent la paire `AUTO` / `LAP COUNTER` et ses boutons de
     choix, le bascule `M`, les pas `−` / `+`, `ARM START` et `ARM FINISH`. C'est le point E,
     de catégorie B : il contredit sa page redessinée du 29 octobre 2026, et **c'est lui qui
     l'a rouverte**.

140. **Ce qui sort du panneau va dans la barre du haut.** Son choix, le 31 octobre 2026 :
     « **Dans la barre du haut** ». Le réglage des tours et les deux boutons d'armement
     rejoignent la barre qui court en haut de l'écran, toujours visibles, hors du dessin de la
     piste.

141. **La barre des six onglets ne bouge pas.** Son choix, le 31 octobre 2026 : « **On ne
     change rien** ». Ni le point orange sur `Race`, ni le détachement de `Race` des cinq
     documents. Le point F **sort de la liste**, et sa demande du 31 octobre — « six onglets
     disponibles en tout temps », « La page de course est un onglet comme les autres » — tient
     entière.

### L'option 2 des couleurs, et ce que la timeline garde · 31 octobre 2026, sixième tour

142. **C'est l'option 2 qu'il veut essayer, et la timeline garde ses badges.** Ses mots, le
     31 octobre 2026 : « **je veux essayer l'option 2 pour les couleurs. mais attention, dans
     la timeline les badges ne doivent pas être « 12 SUI » ! Dans la timeline tout reste comme
     précédemment sauf les couleurs, qui disparaissent au profit du blanc** ». Le dossard est
     donc **blanc partout**, avec le seul numéro, et le **NOC n'est attaché qu'à l'ovale**. La
     colonne du drapeau et celle du NOC de la timeline ne bougent pas — elles existaient déjà.

143. **Plus de badge : le dossard est le numéro, sans le carré.** Ses mots, le 31 octobre
     2026 : « **non je veux plus les badges ! Je veux les numéros de dossards sans le carré
     dans lequel ils sont enfermés** ». Le fond, les coins arrondis et l'ombre portée s'en
     vont ; il ne reste que le chiffre. **Ce qu'il n'a pas dit, et qui a donc été décidé en le
     disant** : le cadre tireté du badge portait trois états — transpondeur muet, pas de
     transpondeur, hors piste — et ces trois états passent sur le **numéro lui-même**, dans
     les mêmes trois couleurs. **Le dossard rond de l'ovale n'est pas touché** : ce n'est pas
     un badge, c'est la place du coureur sur la piste.

144. **Le drapeau quitte l'ordre du sprint et passe dans la start list.** Ses mots, le
     31 octobre 2026 : « **On va retirer le drapeau de la colonne de l'ordre, et on va
     l'afficher dans la colonne de la start list.** » Cela **referme son point 118 du même
     jour**, qui l'avait fait entrer dans l'ordre — « je pense que le nom n'est pas vraiment
     nécessaire dans l'ordre, en revanche un drapeau serait utile ». Le NOC reste des deux
     côtés ; c'est le drapeau seul qui se déplace.

145. **Les lignes de la start list sont serrées au pas de la timeline.** Ses mots, le
     31 octobre 2026 : « **on va également resserrer les lignes de la start list, l'espacement
     entre les lignes doit être le même que dans la timeline** ». La timeline tient ses lignes
     à 28 px ; la start list les tenait entre 26 et 34 selon la place, en s'étirant pour
     remplir sa colonne. Elle les tient maintenant à **28 px fixes**, et ne s'étire plus.

146. **Le vide sous la start list reste.** On lui a montré la contrepartie du pas fixe — les
     lignes ne s'étirent plus, donc il reste de la place sous la dernière. Sa réponse, le
     31 octobre 2026 : « **Laisse le vide sous la start list.** » Ce vide est donc **voulu** :
     il ne se rattrape ni en étirant les lignes, ni en remontant le bas de la colonne.

147. **Le NOC qui se recouvre sur l'ovale reste tel quel.** On lui a montré la mesure — dans un
     peloton groupé, 13 étiquettes sur 16 tombent sur le dossard d'un voisin (`mesures.md`
     §32). Sa réponse, le 31 octobre 2026 : « **on ne va rien changer ici !** » Ni l'écart des
     trois files, ni l'affichage du NOC, ni le dossard rond. Le recouvrement est **accepté**.

### La refonte de la page, et les bandes de dépôt · 31 octobre 2026, septième tour

148. **Il a refait le design de la page, et c'est celui-là qu'il veut.** Ses mots, le
     31 octobre 2026, capture à l'appui : « **J'ai refait le design de la page et c'est comme ça
     que je la veux** ». Treize changements ont été relevés sur son image et relus avec lui ; il
     en a corrigé trois (point 149). Les dix autres tiennent : les six onglets **dans** la barre,
     le titre et le sous-titre hors de la barre, `Race leader` et `Auto` retirés, le numéro de
     build seul, le sous-titre **descendu dans l'ovale** avec les tours, les sprints et la
     longueur de piste, les champs du panneau en **boîtes blanches à texte noir**, leur nouvelle
     disposition, `TO GO` seul en vert, `LEADER` portant le numéro **et** le drapeau **et** le
     NOC, et l'ovale plus grand.

149. **Ses trois corrections, mot pour mot.** « **la timeline occupe maintenant TOUTE la hauteur
     de l'écran !** » ; « **Il faut afficher 00:00.0, mais quand le chronomètre s'arrête il faut
     afficher 12:26.54** » — deux chiffres de minutes toujours, une décimale en marche, **deux à
     l'arrêt** ; « **les boutons SET LEADER gardent la place exacte qu'ils avaient** », ce qui
     laisse intact le plafond du réglage de l'ovale (point 112).

150. **La bande « new group » doit avoir de la place.** Ses mots, le 31 octobre 2026 : « **je
     voulais que tu laisse un peu de marge entre le bouton "new group" et la timeline.
     Actuellement c'est beaucoup trop serré. Je viens de tester et j'ai dû m'y reprendre à
     10 fois pour réussir à faire glisser un coureur dans la zone** ». Mesuré avant correction :
     la bande faisait 15,6 px de haut et 1 px la séparait du premier bloc.

151. **Créer un groupe au-dessus doit marcher pour tous les coureurs.** Ses mots, le 31 octobre
     2026 : « **Tous ! I faut aussi imaginer que parfois l'utilisateur n'aura aucun transpondeurs
     pour équiper les coureurs. Il devra pourtant créer des groupes dans sa timeline pour pouvoir
     suivre la course correctement. Il faut donc donner la flexibilité** ». Et son exemple :
     « **si par exemple un coureur s'échappe en tête et qu'il ne porte pas de transpondeur, je
     dois avoir la possibilité de créer un groupe au-dessus du bunch dans la timeline** ».
     **Rien n'est codé** : on lui a montré que la place donnée à la main est écrasée à la lecture
     suivante pour un coureur que les boucles voient, et sa réponse du même jour a été « **On
     remet à plus tard** ».

152. **Ce qu'il a constaté le 1er novembre 2026.** Mot pour mot : « **J'ai essayé de créer des
     nouveaux groupes en sélectionnant des coureurs et ensuite en cliquant sur "Group" de la
     fenêtre d'actions. J'ai essayé avec des coureurs en tête du peloton et avec des coureurs en
     queue de peloton. Dans les deux cas le groupe est créé derrière (en-dessous) le peloton dans
     la timeline** » ; en glissement, « **les groupes ont été répartis correctement, un devant et
     l'autre derrière le peloton** » et « **je peux créer plusieurs groupes sans problème des deux
     côtés du peloton** ». Et le manque : « **En revanche je ne peux pas glisser/déplacer un
     groupe créé. Ce qui est dommage car si un groupe en dépasse un autre, il faut que les
     groupes soient placés correctement. ET pour cela il est nécessaire ça fonctionne de façon
     automatique mais également manuelle** ». Ce qui a été mesuré sur ces trois constats est dans
     `mesures.md` §35 : le dernier est confirmé, les deux premiers décrivent la même chose, le
     rangement par la position mesurée.

153. **Un groupe posé à la main le dit, et on peut tout rendre à la mesure.** Ses mots, le
     1er novembre 2026, à la question de savoir jusqu'à quand un groupe reste où il a été posé :
     « **je pense que si on force pour déplacer un groupe manuellement, il faut une indication
     pour informer que l'utilisateur a forcé. Et avoir la possibilité de laisser te quel (forcé)
     mais aussi de retourner au mode automatique (qui replacerait tous les groupes dans l'ordre
     des transpondeurs)** ».

154. **La planche du 1er novembre 2026 est approuvée.** Elle lui a été proposée avant tout code,
     dans `maquette-groupe-force.html`, et sa réponse a été : « **La planche me va, code-la.** »

155. **Le geste ne refuse pas le peloton.** À la question « faut-il que le geste refuse le
     peloton, pour vous éviter ce piège ? », sa réponse du 1er novembre 2026 : « **NON** ». Le
     peloton se pose donc à la main comme n'importe quel autre groupe, et ce qu'il en coûte —
     un groupe de l'opérateur n'absorbe plus tout seul les coureurs rattrapés (§3) — est accepté.

156. **Ce qu'il pense du groupe forcé et des tours à faire.** Ses mots, le 1er novembre 2026,
     après la mesure de `mesures.md` §37 : « **je pense qu'au moment où on force une groupe à
     une position, en l'occurrence un groupe dernier placé premier, l'appli doit savoir que les
     laps to go se décrémentent sur le nouveau groupe N°1. De ce fait lorsque ce nouveau groupe
     N°1 "artificiel" sera le premier à se retrouver sur la ligne des sprints.** » Et la raison
     qu'il a donnée au forçage lui-même : « **par expérience je sais qu'il arrive parfois que
     les transpondeurs fonctionnent mal pour différentes raisons, et que dans ce genre de
     situations l'opérateur ne peut plus vraiment se fier aux infos indiquées à l'écran et,
     parfois, doit forcer les choses** ».
     **Ce point n'est pas tranché** : il l'a soumis par « Qu'en penses-tu ? », et rien n'est
     codé tant qu'il n'a pas arrêté la forme.

157. **Ce que « les transpondeurs fonctionnent mal » veut dire, et ce que ça n'atteint pas.**
     Ses mots, le 1er novembre 2026 : « **il faut comprendre que lorsque "les transpondeurs
     fonctionnent mal" cela signifie qu'ils gèrent mal des dépassements de groupes, des tours
     gagnés ou perdus, ce genre de chose. Mais sur un passage de sprint, il n'y aura pas de
     problème, en tout cas pas sur 4 coureurs d'un coup ! Et si il manquerait un des 4 coureurs
     marquant les points dans un résultat de sprint, l'opérateur ajuste manuellement.** »
     C'est un **fait sur le matériel**, pas une demande : l'ordre jugé d'un sprint reste celui
     que les boucles ont vu, et la reprise à la main reste ce qu'elle est.

158. **Désigner un leader, c'est forcer son groupe en première position.** Ses mots, le
     1er novembre 2026 : « **si l'opérateur force un nouveau groupe en tête en utilisant un des
     boutons "SET LEADER", à mes yeux c'est exactement la même chose que de forcer ce groupe en
     première position sur la timeline. C'est tout l'intérêt de ces boutons "SET LEADERS"** ».
     Les trois boutons dont il parle sont ceux posés sur la piste, à leurs boucles (§17,
     « Les trois boutons de désignation du leader »).

159. **Le leader désigné se fait reprendre sur la piste, et c'est voulu.** À la question
     « quand vous avez désigné un leader, l'application peut-elle le remplacer toute seule ? »,
     sa réponse du 1er novembre 2026 : « **Oui, laisse comme aujourd'hui : un coureur qui le
     dépasse sur la piste lui prend la tête.** » Rien à coder : c'est le comportement en place.

159. **Le leader désigné se fait reprendre sur la piste, et c'est voulu.** À la question
     « quand vous avez désigné un leader, l'application peut-elle le remplacer toute seule ? »,
     sa réponse du 1er novembre 2026 : « **Oui, laisse comme aujourd'hui : un coureur qui le
     dépasse sur la piste lui prend la tête.** » Et sa raison, le même jour, mot pour mot :
     « **il faut comprendre que si l'opérateur intervient pour corriger l'ordre des groupes de
     la timeline c'est parce qu'il constate que quelque chose ne fonctionne pas très bien. Il
     remet donc de l'ordre, et après évidemment les coureurs, eux, continuent leur compétition
     et à se dépasser les uns les autres, très très très souvent ! Donc oui, l'appli doit
     continuer à refléter ce qu'elle voit** ».
     Une intervention de l'opérateur **remet de l'ordre à un instant donné** ; elle ne met pas
     la course en pause. Rien à coder : c'est le comportement en place.

160. **Le lien est approuvé.** Sa réponse du 1er novembre 2026 à la forme proposée — le leader
     qu'il désigne monte son groupe en première position, et poser un groupe en première
     position désigne son premier coureur comme leader : « **Oui, code-le.** »

161. **Le mot est « manual », pas « by hand ».** Ses mots, le 1er novembre 2026 :
     « **"by hand" et "1 group by hand" n'est pas la bonne formule ! Utilisons "manual"** ».

162. **Son croquis du centre de l'ovale est à appliquer.** Ses mots, le 1er novembre 2026 :
     « **tu n'as pas encore implémenté les modifications demandées concernant le style des
     boutons et indications du centre de l'ovale. Je te rejoins la capture d'écran de mon
     croquis** ». Le croquis ne dit rien de neuf : il montre ce que les points 148 et 149
     disaient déjà — boîtes blanches à texte noir, horloge et `LAP` en haut, `LEADER` et
     `TO GO` en bas, `TO GO` seul en vert, `LEADER` avec son drapeau et son NOC, le prochain
     sprint à droite sur deux hauteurs, et les boutons `SET LEADER` à leur place.

163. **Ce qu'il attend d'un compte rendu de test.** Ses mots, le 1er novembre 2026 : « **Pour
     comprendre les résultats de ton test il me faut un peu plus d'info, là je dois deviner ce
     qui se passe.** » Un tableau de chiffres ne suffit pas : il faut dire quelle course, quels
     coureurs, quel geste, et ce qu'on voit à l'écran avant et après.

164. **L'écart d'un groupe se mesure depuis le groupe qui le précède, et le groupe 1 n'en a
     pas.** Ses mots, le 1er novembre 2026, devant le compte rendu du test :

     > Bon alors je constate qu'à l'instant T, notre système ne fonctionne pas du tout comme il
     > devrait ! L'appli n'a pas réagi correctement [...]
     >
     > Cependant, il faut aussi affirmer que ce que tu as essayé de faire n'est pas vraiment
     > plausible : Tu as définis que les deux derniers coureurs du peloton, 12 et 52, étaient
     > les leaders de la course, mais tu n'as pas du tout adapté la vitesse de ces coureurs, ni
     > de tous les autres. Ce qui signifie que ces deux coureurs se trouvaient toujours très
     > proches du reste du peloton. Tu m'as dit que tout d'abord, avant que tu les déclares
     > leaders, ces deux coureurs 12 et 52 formaient un groupe pointé à 31m du peloton. Et après
     > les avoir déclarés leaders, ils étaient encore et toujours à 31m du peloton, 31m d'avance
     > cette fois-ci. Alors là il y a quelque chose qui manifestement ne fonctionne pas !
     >
     > Je résume, si tu déclares les deux coureurs 12 et 52 comme leaders, ils doivent donc se
     > retrouver en haut de la timeline. Etant en haut de la time, ils ne doivent être pointés à
     > x mètres de tel ou tel groupe. Non, car ce sont les leaders, le groupe 1, et donc c'est
     > le groupe 2 qui doit être pointé à x mètres du groupe 1 des leaders. Et le groupe 3 doit
     > être pointé à x mètres du groupe, et ainsi de suite.
     >
     > Donc dans ton test, une fois que tu les a déclarés leaders, ils devenaient le groupe 1 et
     > le peloton le groupe 2. Si il y avait effectivement une distance de 31m entre les deux
     > groupes, alors en réalité l'appli aurait dû indiquer :
     >
     > Groupe 1 - Leaders / 12 SUI / 52 ITA
     > Groupe 2 - Bunch à 219m / 15 IRL / 4 GBR / 11 JPN / 23 DEN / 46 BEL / 70 BRA / 58 KAZ /
     > 67 GER / 1 ESP / 9 SLO / 3 FRA / 18 POR / 61 COL / 7 NED
     >
     > Et à partir de là c'est le groupe 1 qui est attendu au sprints en premier, et donc sans
     > nouvelle modification de position des groupes, les coureurs 12 et 52 se seraient partagé
     > les 2 premières places de chaque sprint

     **Les 219 m sont l'arithmétique de la piste** : 250 − 31. Sur un anneau fermé, dire que le
     12 et le 52 sont en tête, c'est dire que le peloton, qui est 31 m devant eux sur le
     revêtement, est 219 m **derrière** eux dans la course. Le signe `+` n'a donc pas sa place
     dans la timeline : aucun groupe n'est devant le groupe 1.

165. **La phrase coupée, complétée par lui.** Ses mots, le 1er novembre 2026 : « **je voulais
     dire que le groupe 3 doit être pointé "à x mètres du groupe 2"** ». L'écart se mesure donc
     de proche en proche, chaque bloc depuis celui qui le précède, et non depuis le groupe 1
     pour tout le monde.

166. **Les questions se posent avec les coureurs et les nombres, jamais en abstrait.** Ses mots,
     le 1er novembre 2026, devant la question « L'écart affiché doit-il devenir celui des deux
     coureurs qui se font face, même sans forçage ? » : « **mais j'ai l'impression que tu ne
     comprends strictement rien !! Maintenant il va falloir que tu sois beaucoup plus précis,
     dans tes explications et dans tes questions ! Ta question [...] posée comme ça elle n'a
     AUCUN SENS, incompréhensible !** » Et sa demande de cadrage : « **dans ton idée qu'est-ce
     que tu es en train de faire ? Tu confirme que tu forces les 12 et 52 comme étant les
     leaders ? ou autre chose ?** »
     Une question se pose donc sur **un nombre précis, à un endroit précis de l'écran, avec les
     dossards concernés** — « le bloc du 12 et du 52, sous le peloton, doit-il afficher 2 m ou
     31 m ? » — et jamais sur une règle énoncée en général.

167. **L'écart se mesure entre les deux coureurs qui se font face.** Ses mots, le 1er novembre
     2026 : « **l'écart se mesure entre le dernier du groupe des leaders et le premier du groupe
     du peloton. Concrètement entre le n° 52 et le n°15. Le résultat n'est pas 219m, c'est une
     certitude !** » Et sur le cas sans forçage, mis devant les deux chiffres : « **Effectivement
     l'écart qu'il faut afficher est celui entre le 7 et le 12, soit 2m.** »
     C'est donc, pour tout bloc, la distance de la **queue du bloc au-dessus** à la **tête du
     bloc en dessous**, et non de tête à tête.

168. **Au sprint, c'est celui qui est en tête dans la timeline.** Ses mots, le 1er novembre
     2026, à la question « au sprint du tour 30, qui doit être jugé premier, le 12 ou le 15 ? » :
     « **Je ne sais pas ! C'est celui qui est en tête dans la timeline !** »

169. **Un changement de leader doit se raconter dans la timeline.** Ses mots, le 1er novembre
     2026, devant une course où le 7 NED devient leader alors que le bloc de tête est à 217 m :

     > Mais alors explique-moi, par où est-il passé ? Car pour devenir leader, il a fallu qu'il
     > s'échappe par l'avant de son groupe qui est le peloton, et ensuite qu'il fasse un gros
     > effort seul pour rattraper les plus de 200m d'avance qu'avaient les leaders, à savoir les
     > n°12 et 52.
     >
     > Alors pendant cet effort, lorsqu'il n'est plus dans le peloton, il est devenu un groupe,
     > et ce groupe devait être le groupe n°2, positionnée dans la timeline entre le groupe 1,
     > les leaders, et le groupe 3, le peloton.
     >
     > Ensuite il a forcément rejoint les leaders, et donc son propre groupe 2 s'est fondu dans
     > le groupe 1 des leaders. La situation au moment où 7 a rattrapé 12 et 52, est donc
     > devenue : Groupe 1 - leaders / 7, 12, 52 — Groupe 2 - bunch / 15 et puis tous les autres
     > coureurs du peloton....
     >
     > Et apparemment ensuite le 7 a poursuivi son effort et s'est échappé seul en tête.
     > Nouvelle situation : Groupe 1 - leader / 7 — Groupe 2 - chase / 2, 52 — Groupe 3 - bunch
     > / 15 et puis tous les autres coureurs du peloton ....

     **Aucune de ces étapes n'a eu lieu** : ce qui a été mesuré est au §45 de `mesures.md`.

170. **La timeline est l'ordre de la course, et toutes les vues la suivent.** Ses mots, le
     1er novembre 2026, devant la liste des passages sur la ligne qui commençait encore par le
     15 : « **Cela est faux !! Puisque tu as déclaré que les n° 12 et 52 étaient els leaders,
     alors 12 et 52 doivent les premiers de la file : 17 | 12, 52 … 61, 7** ».
     Ce qu'il écrit vaut pour l'onglet Crossings, mais l'énoncé est général : une vue qui montre
     l'ordre de la course le prend dans la timeline, et non dans les heures de passage.

171. **Un bloc posé à la main gèle le leader.** Sa réponse du 1er novembre 2026, au cas du 7 et
     du 12 qui échangent 2,20 m dans la file alors que le bloc de tête affiche 217 m :
     « **Non : quand j'ai posé un bloc à la main, le leader ne change que si je le change
     moi-même.** »
     Cela ne retire rien au point 159 : hors forçage, l'application continue de donner la tête à
     un coureur qui en dépasse un autre sur la piste. **Rien n'est codé** : c'est le premier
     travail de la session suivante.

172. **Où se range un coureur par rapport à un autre.** Ses mots, le 1er novembre 2026, à la
     question « le bloc du 61 et du 7 posé en queue, si le 15 passe le 12 : le panneau reste
     sur 12 ou passe au 15 ? » :

     > Si 15 est dans un groupe mieux classé que celui de 12 alors il sera devant 12.
     >
     > Si 15 est dans le même groupe que 12, alors le premier des deux à passer la ligne de
     > sprint sera la mieux classé des deux.
     >
     > Si 15 est dans un groupe moins bien classé que celui de 12 alors il sera derrière 12.

173. **Dans un bloc, l'ordre affiché est celui des boucles, à chaque passage.** Ses mots, le
     1er novembre 2026, à la question « après le sprint du tour 30, où le 52 a passé la ligne
     avant le 12 : si le 12 roule ensuite devant le 52, le bloc affiche 52, 12 ou 12, 52 ? » :
     « **il faut afficher ce qui est mesuré par les boucles à chaque passage** ».
174. **La course aux points, par lui, le 1er novembre 2026.** Devant les phrases que j'avais
     ajoutées aux points 172 et 173 : « **tu interprètes ce qui te semble correct, et sans
     vérifier tu considères les choses validées** ». Puis son explication, mot pour mot :

     > Mais en fait c'est simple : à l'intérieur le premier qui passe est premier, le deuxième
     > est deuxième ... Pourquoi ce besoin de mètres mesurés ? Mais enfin tu comprends le
     > principe d'une course ? Ben ça s'applique là.
     >
     > Pour la première place d'un sprint, intermédiaire ou final, le commissaire affecté au
     > lap counter va sonner la cloche quand le premier coureur du groupe 1 passera la ligne au
     > tour précédent le sprint.
     > Suite à quoi, au prochain tour donc, le premier coureur du groupe 1 remportera la place 1
     > de ce sprint, suivi chronologiquement ainsi :
     > ordre de passage des autres coureurs du groupe 1
     > ordre de passage des coureurs du groupe 2
     > ordre de passage des coureurs du groupe 3
     > ordre de passage des coureurs du groupe 4
     > ordre de passage des coureurs du groupe 5
     > ordre de passage des coureurs du groupe 6
     > ordre de passage des coureurs du groupe 7
     > ordre de passage des coureurs du groupe 8
     > et ainsi de suite jusqu'à ce que tous les coureurs soient passés.
     >
     > Il se trouve que dans les sprints intermédiaires, seuls les 4 premières places remportent
     > des points.
     >
     > Lors du sprint final de la course, le même principe s'applique mais avec une nuance : en
     > cas d'égalité entre 2 ou plusieurs coureurs au classement général final de la course aux
     > points, c'est l'ordre final de sprint final qui départagera les cas. Le coureur mieux
     > classé dans le sprint final sera finalement classé devant au classement général final.
     >
     > IL faut bien comprendre que la distance totale parcourue par un coureur n'est pas
     > déterminante pour connaitre sa position dans la timeline.
     >
     > Pourquoi ?
     >
     > Tour gagné
     > Parce que un coureur qui s'échappe à l'avant de la course et parviens à rattraper et à
     > reprendre sa place dans le peloton duquel il s'était extirpé un peu plus tôt est crédité
     > de 20 points. On dit alors qu'il a gagné un tour. Mais il a gagné 20 points en réalité et
     > non pas gagné un tour, et il les a gagné en effectuant un tour de plus que les autres
     > coureurs. A des fins de facilité de calcul et de vérification du classement général
     > final, on va marquer pour chacun des coureurs le nombre de fois où il réussit à remporter
     > à 20 points.
     >
     > Tour perdu
     > A l'inverse un coureur se faisant lâcher à l'arrière de la course et rattrapé par le
     > peloton qui l'avait lâché un peu plus tôt, sera lui pénalisé de 20 points. On dit alors
     > qu'il a perdu un tour. Mais il a perdu 20 points en réalité et non pas perdu un tour, et
     > il les a perdu en effectuant un tour de moins que les autres coureurs. A des fins de
     > facilité de calcul et de vérification du classement général final, on va marquer pour
     > chacun des coureurs le nombre de fois où il seront pénalisés de 20 points.
     >
     > Au départ de la course, tous les coureurs sont ensemble dans le seul groupe existant à ce
     > moment là : le peloton.
     >
     > Ensuite des groupes se forment au gré des écarts qui se créent entre coureurs. Une règle
     > que j'ai instauré dans le projet est que si il y a plus d'une seconde d'écart entre 2
     > coureurs alors le groupe se scinde entre ces deux coureurs pour en former deux distincts.
     > Et le coureur qui avait donc plus d'une seconde de retard sur celui qui le précédait
     > devient instantanément le coureur en première position de son groupe. Si le coureur qui
     > le suit se trouve à moins de 1 seconde de retard, il fait partie du même groupe. Et
     > pareil pour celui qui suit jusqu'au dernier. A chaque fois qu'il y a plus d'une seconde
     > entre deux coureurs, on crée un nouveau groupe.
     >
     > Tous ces groupes forment la timeline, et ils la composent dans l'ordre chronologique de
     > leurs groupes.
     >
     > Le groupe 1 de la timeline, est toujours celui observé par le juge starter qui à chaque
     > passage sur la ligne de sprint montre du doigt le coureur de ce groupe 1 se trouvant en
     > première position du groupe. Et le juge de lap counter lui sonnera la cloche au passage
     > précédent l'enregsitrement de chaque sprint.
     >
     > A ce stade il faut comprendre que les coureurs remportant 20 points (du fait qu'ils
     > effectuent un tout de plus que les autres) au moment du gain de leurs 20 points on ne va
     > pas considérer qu'ils ont parcourus une distance plus importante (justement, on leur a
     > offert 20 points à la place), et donc ils sont considérés avoir parcouru la même distance
     > que leur adversaires mais avec la nuance qu'au classement général ils sont crédités de
     > 20 points.
     >
     > Cela explique donc que la timeline ne considère pas les tours effectués en plus pour
     > déterminer les positions des uns et des autres. Chacun est toujours dans le même tour que
     > les autres du point de vue la timeline.

     Il a posé la redite de cette explication dans `docs/La course aux points.txt`, le
     1er novembre 2026 : « **je pense que ça vaut la peine de le conserver en lieu sûr** ».
