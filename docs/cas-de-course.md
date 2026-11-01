# Index des cas de course

**Ce fichier est un index, rien d'autre.** Pour chaque situation de course que l'opérateur
a tranchée : où sa règle est écrite, où elle est codée, comment on sait qu'elle est
respectée, et son statut. **La règle elle-même n'est pas recopiée ici** — elle est dans
`regles-operateur.md`, mot pour mot, et c'est le seul endroit où elle vit.

C'est la page à lire **avant** de toucher à une règle de course, pour savoir si elle existe
déjà et où. Ne pas la lire a coûté une session entière sur le tour gagné/perdu.

**Si le code dévie de sa règle, le statut le dit**, avec la date. Jamais un statut
silencieusement optimiste.

| # | Cas | La règle | Le code | Vérifié par | Statut |
|---|---|---|---|---|---|
| 1 | **Cassure** — ce qui définit un groupe | `regles-operateur.md` §1 | `GROUP_GAP_S`, `BIKE_L`, `CASS_DELAY_S`, `cassure()`, `gapThr()`, clustering de `computeGroups()` | `pitfalls.md` A8, H9, H15 · `mesures.md` §2 et §13 | **Conforme.** Seuil et délai figés build 53 ; vitesse de conversion prise **paire par paire**, celle du coureur qui suit, build 68 |
| 2 | **Rejoindre un groupe par l'arrière** | `regles-operateur.md` §2 | la mesure du cas 1, contre le **dernier** coureur du groupe rejoint ; clustering de `computeGroups()` | `pitfalls.md` A7 et H5 | **Conforme**, figé build 53 |
| 3 | **Se faire rejoindre par un groupe** | `regles-operateur.md` §2 | la mesure du cas 1, contre le **premier** coureur du groupe qui rattrape | `pitfalls.md` A7 et H5 | **Conforme**, figé build 53 |
| 4 | **Merge dans la timeline** | `regles-operateur.md` §3 | `np(r) = pos − TRACK × impliedOf(r)` dans `computeGroups()` | `pitfalls.md` B1 · `mesures.md` §4 | **Conforme** pour le moment de la fusion, figé build 53 ; sa référence l'est depuis la build 67 (cas 5) |
| 5 | **Le tour du peloton** | `regles-operateur.md` §5 | `S.bunchRaw` et `S.bunchSeq`, posés par `computeGroups()`, lus par `impliedOf`, par `detect()` et par la vue Crossings | `pitfalls.md` H13 · `mesures.md` §12 | **Conforme**, corrigé build 67. `bunchRaw` est la position du **premier** coureur du peloton, pris parmi ceux qui y étaient déjà à l'image précédente. La médiane est supprimée du fichier |
| 6 | **Tour gagné** | `regles-operateur.md` §4 | `detect()`, via `r.inBunchPrev` pour le *quand*, `pairOf()` pour le *combien* | `pitfalls.md` A9, H13 · `mesures.md` §1 et §12 | **Conforme**. *Quand* : build 66. *Combien*, contre le coureur qui le suit : build 67 |
| 7 | **Tour perdu** | `regles-operateur.md` §4 | la même chose, lue de l'autre côté | `pitfalls.md` A9, H13 · `mesures.md` §1 et §12 | idem cas 6 |
| 8 | **Éligibilité aux sprints** | `regles-operateur.md` §6 | `S.inelig`, calculé avant le `return` de `computeGroups()` | `pitfalls.md` H4, H5, H7, H8 · `mesures.md` §3 et §5 | **Conforme**, figé build 53. Un cas reste à trancher (§15 des règles) |
| 9 | **Conséquence sur le rang** | `regles-operateur.md` §7 | `spOrder`, après la construction de `seq` | `mesures.md` §6 | **Vérifié sur cas forcé seulement** — la simulation ne l'exerce jamais |
| 10 | **Affichage d'un passage inéligible** | `regles-operateur.md` §8 | `spTick` (`judged`, `greyed`), `renderCard` (`.srow.grey`) | `pitfalls.md` F10, F11 · `mesures.md` §7 | **Conforme**, codé build 54. Vu sur cas forcé seulement |
| 11 | **Tape switches** — comptage par passage de groupe | `regles-operateur.md` §9 et §10 | `TAPES`, `buildTapes()`, `tapeCount()`, `TAPE_SYNC_S` | `mesures.md` §8 | **Codé build 57**, appariement des heures build 60. La largeur des bandes n'est **pas modélisée**, volontairement (voir ci-dessous) |
| 12 | **Qui est le vélo en trop** | `regles-operateur.md` §11 | `tapeAttribute()` | `mesures.md` §8 | **Codé build 58** |
| 13 | **Coureur sans transpondeur qui roule seul** | `regles-operateur.md` §11 | `tapeLone()`, `tapeFix()`, `tapeTrack()`, `S.noTpRec` | `mesures.md` §9 | **Codé build 59** |
| 14 | **Deux transpondeurs inversés** | `regles-operateur.md` §11 | `tpById()` dans `step()`, `swapTp()` | `mesures.md` §10 | **Codé build 60** |
| 15 | **Mise en place et tour de lancement** | `regles-operateur.md` §12 | — | — | **Pas codé.** Ni la phase dans le simulateur, ni la vérification des transpondeurs, ni les propositions. Le travail à faire est détaillé dans `travaux.md` §1 |
| 16 | **Les deux Pursuits face à face sur l'ovale** | `regles-operateur.md` §9 | `#trackpath` ancré au milieu de la ligne droite d'arrivée, `pt()` décalé de `CFG.gap` | `pitfalls.md` A14 · `mesures.md` §14 | **Conforme**, corrigé build 69. Les deux repères tombent au milieu de leur ligne droite pour les quatre longueurs de piste et tout `gap` |
| 17 | **Les marquages de la piste** | `regles-operateur.md` §9, tableau de la norme UCI | les quatre rectangles longitudinaux du décor, et `renderMarks()` pour les traits en travers | `mesures.md` §14 | **Conforme**, codé build 69, couleurs, épaisseurs et étendue des traits revues builds 70 à 73 sur ses quatre relectures du 28 octobre 2026. Côte d'azur, lignes noire, rouge et bleue à leur cote ; arrivée en trait noir sur bande blanche, ni l'un ni l'autre à sa cote réelle ; 200 m et 100 m en blanc ; tape switches **pas dessinés**. **Build 91** : plus aucun repère n'est nommé — les cinq étiquettes de l'ovale sont retirées sur sa demande du 29 octobre 2026, les traits restent |
| 18 | **La simulation est une course enregistrée** | `regles-operateur.md` §16 | `CALM_RACE.acts`, `replayTick()`, `pilotStep()` pour la roue | `pitfalls.md` A11 · `mesures.md` §15 | **Conforme**, codé build 74. Plus de `SCRIPT`, plus de `useScript`, plus de mode `away`. **Build 75** : elle quitte le code, déposée dans la liste enregistrée à la première ouverture, puis renommable et effaçable comme les autres |
| 20 | **Le peloton tient l'allure affichée** | `regles-operateur.md` §16 | `S.anchor`, `step()`, `syncAllToBunchPace()` | `mesures.md` §17 · `architecture.md` §16 | **Conforme**, corrigé build 76. Un coureur qui quitte le peloton ne change plus l'allure de ceux qui restent |
| 21 | **La progression d'un ordre, et la vitesse d'arrivée** | `regles-operateur.md` §16 | `progress()`, `po.prog`, `--prog`, `endPilot(r, mates)`, mode `follow` | `mesures.md` §18 · `architecture.md` §16 | **Conforme**, codé build 77 pour ↑ et ↓. Pour `+lap` et `−lap` le retour au peloton prend une trentaine de secondes : point ouvert au §15 des règles |
| 22 | **Rejouer une course sans l'enregistrer** | `regles-operateur.md` §16 | `LOADED`, `REC`, `curActs()`, `saveRec()`, `#simplaying` | `mesures.md` §19 · `architecture.md` §17 | **Conforme**, corrigé build 78. Une relecture n'ajoute plus de copie à la liste ; une course menée à la main s'enregistre toute seule |
| 23 | **Le numéro d'une course** | `regles-operateur.md` §16 | `raceNo()`, `numberRaces()`, `r.no`, `--play` | `mesures.md` §20 | **Conforme**, codé build 79. Numéro propre à la course, jamais renuméroté ; « Playing race *x* » en #1CC634 |
| 24 | **Le centrage des symboles de la barre de transport** | `regles-operateur.md` §16 | `centreInk()`, `inkShift`, `.ink` | `mesures.md` §21 | **Conforme**, corrigé build 80. Vérifié simulateur déplié : écart restant sous 0,004 px |
| 25 | **La place des boutons de la barre** | `regles-operateur.md` §16 | la ligne du transport et la ligne de l'horloge | `mesures.md` §22 | **Conforme**, corrigé build 81. Replay et New sur la ligne de l'horloge ; plus aucun chevauchement |
| 26 | **Trier la liste des coureurs** | `travaux.md` §6b | `simSort`, `sortedRiders()`, `[data-sort]` | `mesures.md` §23 · `architecture.md` §18 | **Conforme**, codé build 83. BIB, Nat et Name ; un second clic inverse |
| 27 | **Les réglages gardés d'une course à l'autre** | `regles-operateur.md` §16 | `saveSetup()`, `loadSetup()`, `TPMAP`, `tct.sim.setup` | `mesures.md` §24 · `architecture.md` §19 | **Conforme**, codé build 86. Liste de départ, piste et appairage ; *New* et rechargement vérifiés |
| 28 | **Le drapeau d'une nation entrée à la main** | `regles-operateur.md` §16 | `FLAGS`, `flag()` | `mesures.md` §25 | **Conforme**, codé build 87. 205 nations ; code inconnu = rectangle gris |
| 19 | **Renommer et effacer une course** | `regles-operateur.md` §16 | le gabarit d'une ligne de l'onglet Files, `renaming`, `delArmed`, `commitRename()`, `saveRaces()` | `mesures.md` §16 | **Conforme**, codé build 75. Renommage sur place, effacement en deux clics, les deux tiennent au rechargement |
| 29 | **Les champs d'état à l'intérieur de l'ovale** | `regles-operateur.md` §17 | `#infield`, `#ifpanel`, `renderStrip()` qui écrit en place | `mesures.md` §26 | **Proposé build 92, en attente de sa critique.** La bande au-dessus de l'ovale est supprimée. Sur sa deuxième lecture : le champ des propositions est retiré, l'horloge et le bouton de départ sont côte à côte sans titre, le leader ne porte que son dossard, et le prochain sprint devient immanquable à deux tours. Sur sa troisième : le compteur de tours rejoint les tours restants près de la ligne d'arrivée |
| 30 | **La provenance des tours restants** | `regles-operateur.md` §17 | `S.togoSrc`, `S.togoManual`, `S.togoExport`, `togoValue()` | `mesures.md` §26 | **Proposé build 92.** Les **deux provenances s'affichent ensemble avec leurs deux valeurs**, et un sélecteur choisit celle qui alimente `TO GO` — la règle du §13 sur le désaccord. Un petit bouton bascule l'application entre comptage propre et comptage à la main, ± visibles en manuel seulement. `TO GO` est vert, et **rouge** quand les tours restants sont retenus des sorties : **la zone elle-même se clique**, il n'y a pas de bouton. Chaque provenance porte sa valeur, celle du compteur comprise. Le lap counter relié n'est toujours pas simulé (`travaux.md` §5) : c'est une provenance affichée, sans flux derrière |
| 33 | **`ARM FINISH`** — l'horloge s'arrête sur le vainqueur | `regles-operateur.md` §17, point 17 | `S.finArm`, `S.winT`, posés à l'ouverture de l'arrivée dans `step()` | `mesures.md` §26 | **Conforme**, codé build 92. La ligne se désarme d'elle-même au passage du vainqueur, et le temps affiché reste le sien pendant que les autres franchissent |
| 34 | **Les annotations de l'ovale** | `regles-operateur.md` §17, points 19 à 21 | `renderOval()`, `#ovlabels` vide | `mesures.md` §26 | **Toutes retirées**, build 93, et les marques rouges de l'inéligibilité avec elles à la build 94. `S.inelig` est intact : le cas 10 continue de griser la ligne du sprint. À refaire entièrement : `travaux.md` §4 ter |
| 31 | **Le départ de la course** | `regles-operateur.md` §17 | `S.startState`, `S.fsConfirm`, `startClick()`, `syncStart()` | `mesures.md` §26 | **Proposé build 92, partiel.** Les quatre états et leurs couleurs y sont ; l'impulsion externe n'existe pas, et le départ s'appuie sur celui du simulateur — voir l'écart assumé ci-dessous |
| 32 | **Désigner le prochain leader depuis la piste** (Pursuit A et B seulement) | `regles-operateur.md` §17 | `.armb`, `#armfo0..2` placés par `renderMarks()`, `#lpg0..2`, `syncArm()`, `S.armDone` | `mesures.md` §26 | **Proposé build 92.** « SET NEXT AS LEADER » sur deux lignes ; bouton et ligne de la boucle au vert à l'armement, dossard du nouveau leader ensuite. **La boucle Finish n'a plus de bouton**, sur sa demande du 29 octobre. Le délai d'affichage est un choix, voir ci-dessous |

---

## Les écarts assumés

Ce que le code ne fait **pas**, et pourquoi c'est volontaire. Un écart non listé ici est un
bug.

**La largeur des bandes n'est pas modélisée.** Les longueurs sont dans
`regles-operateur.md` §9. Elles ont été codées à la build 61 puis retirées à la build 62 :
l'opérateur les avait données comme une précision sur le matériel, il n'avait pas demandé
de les simuler. Le code n'a donc ni largeur de bande ni position en largeur du coureur, et
tout le monde franchit toutes les bandes. Les longueurs restent écrites pour le jour où il
en demandera quelque chose.

**Le départ de la course n'a pas d'impulsion externe, et s'appuie sur celui du simulateur.**
La règle du §17 décrit le **futur logiciel** : l'opérateur l'a dit lui-même. Le prototype en
montre les quatre états et les enchaîne, mais il n'a pas d'entrée matérielle, et il n'a pas non
plus de départ de course distinct de `Play` — aujourd'hui le même geste lance la course et
l'horloge. Le tour de lancement, qui est ce qui sépare les deux, n'est pas construit
(`travaux.md` §1). `START` déclenche donc le départ du simulateur, et un faux départ validé
remet la course à zéro sans rien enregistrer.

**Le dossard du nouveau leader reste affiché 5 secondes.** L'opérateur a dit « pendant quelques
secondes » et aucune cote ne lui a été demandée, conformément au §14 (on ne lui demande que ce
qu'il voit). `ARM_SHOW_S` vaut 5 : c'est un choix d'affichage, pas une règle.

**La place du coureur dans son groupe ne se tire pas de l'horodatage du contact.** Tranché
par l'opérateur, `regles-operateur.md` §11. Il n'y a rien à implémenter.

**Un vélo de plus que de transpondeurs n'émet pas de proposition en soi** : c'est
`tapeAttribute()` (cas 12) qui propose, et seulement quand il sait **qui** pourrait être ce
vélo.

**Ce qui n'est pas construit du tout** — la chute, le lap counter relié, la réception de la
photo-finish, l'alerte de passage manqué adoucie par le tape switch — n'est pas un écart à
une règle : c'est du travail qui n'a pas été fait. La liste est dans `travaux.md`.

---

## Les choix d'implémentation qui ne sont pas dans la règle

À confirmer avec l'opérateur. Ils ont été ajoutés parce que la règle, appliquée telle
quelle, produisait des fausses alertes — mais ils ne viennent pas de lui.

1. **Le nombre de vélos sans transpondeur retenu pour un groupe est le plus haut qu'ont
   montré ses `TAPE_WINDOW` derniers passages.** Un passage est une mesure qui ne peut être
   que **trop basse** : un vélo sans transpondeur qui franchit la bande à moins de 20 ms
   d'un coureur lu passe pour lui ; rien, en revanche, n'invente un vélo. Le compte monte
   dès le premier passage qui voit le vélo et ne retombe que quand six passages d'affilée
   ont cessé de le voir. Sans cela il alterne entre 1 et 0 et le journal se remplit de la
   même constatation.
2. **L'appartenance d'un coureur à un groupe est lue sur ses trois derniers passages**, pour
   qu'un coureur que les boucles ratent une fois n'ait pas l'air d'avoir quitté son groupe.
3. **Un groupe qui n'a qu'un seul passage mesuré n'a pas encore d'avis.**
4. **« Plus proche que les membres du groupe 2 » est lu comme « plus proche que *tous* »**
   (`every`, soit `dS < min`). Signalé comme à confirmer dans `regles-operateur.md` §15.
5. **Chaque passage de sprint est jugé une seule fois, à l'instant où il est lu.** Celui-ci
   découle de l'énoncé lui-même, mais il n'a pas été dicté.
6. **L'épaisseur des lignes longitudinales de la piste**, posée à 0,20 m. La norme fournie
   par l'opérateur donne leur position, jamais leur épaisseur.
7. **La moitié de piste que couvre la ligne des 100 m** : dessinée depuis la côte d'azur
   vers le haut. La norme dit « la moitié de la largeur » sans dire laquelle ; le sens
   retenu est celui du §9, où les bandes partent du bas de la piste.
8. **Les deux cotes de la ligne d'arrivée sont celles de l'écran, pas celles de la norme.**
   Le trait noir prend la largeur des lignes de poursuite, contre lesquelles il se lit, et
   la bande blanche vaut cinq fois ce trait. Tranché par l'opérateur le 28 octobre 2026
   après avoir vu le premier tracé, mais il a demandé un rendu, pas des chiffres : les
   chiffres sont de nous (`mesures.md` §14).
9. **Les couleurs de la piste, de la côte d'azur et de la ligne des stayers.** L'opérateur
   a demandé « plus clair », « plus foncé », « plus visible » ; les valeurs retenues sont
   dans `mesures.md` §14 et n'ont pas été dictées.
10. **La façon de renommer et d'effacer une course.** Il a demandé de pouvoir le faire, pas
    une manière de le faire. Trois choses sont de nous : le renommage se fait **sur place**
    plutôt que dans une fenêtre ; l'effacement **demande deux clics** plutôt qu'une
    confirmation ; et l'ordre des boutons est *Load*, *Rename*, *Delete*, le destructif en
    dernier.
11. **Le modèle de départ n'est déposé qu'une fois.** Il a demandé que la course déposée
    s'efface « comme on le désire » ; pour qu'un effacement tienne, il fallait
    décider que la liste enregistrée fait foi dès qu'elle existe, même vide. Ce choix est
    de nous, et c'est lui qui fait qu'une simulation effacée ne revient pas.

---

## Comment ajouter un cas

1. **La règle de l'opérateur, mot pour mot, va dans `regles-operateur.md`**, avec sa date.
   Jamais ici : ce fichier n'est qu'un index.
2. **Les mesures qui la valident vont dans `mesures.md`**, avec le numéro de build. Jamais
   ici non plus.
3. **Le code qui l'applique se décrit dans `architecture.md`.**
4. Une fois codée, **une ligne du tableau ci-dessus** : le cas, le renvoi vers la règle, le
   renvoi vers le code, le renvoi vers la vérification, le statut.
5. Si le code **dévie** de la règle, le statut le dit, avec la date — comme le cas 5
   aujourd'hui.
