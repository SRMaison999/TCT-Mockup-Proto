# Index des cas de course

**Ce fichier est un index, rien d'autre.** Pour chaque situation de course que l'opérateur
a tranchée : où sa règle est écrite, où elle est codée, comment on sait qu'elle est
respectée, et son statut. **La règle elle-même n'est pas recopiée ici** — elle est dans
`regles-operateur.md`, mot pour mot, et c'est le seul endroit où elle vit.

C'est la page à lire **avant** de toucher à une règle de course, pour savoir si elle existe
déjà et où. Ne pas la lire a coûté une session entière sur le tour gagné/perdu.

**Si le code dévie de sa règle, le statut le dit**, avec la date. Jamais un statut
silencieusement optimiste.

Le code visé est `timeline-prototype_mixed.html` et `moteur-course.js`, au build 249 du
19 novembre 2026. Les builds cités avant 150 valent aussi pour `timeline-prototype.html`, arrêté
au build 149.

| # | Cas | La règle | Le code | Vérifié par | Statut |
|---|---|---|---|---|---|
| 1 | **Cassure** — ce qui définit un groupe | `regles-operateur.md` §1, points 223 et 232 | `moteur-course.js` : `ecartPaire()`, `ecartAnneau()`, `groupes()` sur `GROUP_GAP_S` et `BIKE_L` ; dans l'écran, `pairGap()` et le repli `cassure()` | `pitfalls.md` A8, H9, H15 · `mesures.md` §2, §13, « La cassure lue sur les boucles » (build 167), « Build 196 · la timeline seule, mesurée en cassures » | **Conforme** : la cassure se lit en temps, sur les heures de passage de la même boucle, moins le temps d'une longueur de vélo à la vitesse du coureur qui suit (build 167 pour l'écran, 181 à 190 pour le moteur), et se déclare sur la mesure du moment partout : le délai de 0,3 s qui restait dans le repli de l'écran est retiré au build 257 (point 256) |
| 2 | **Rejoindre un groupe par l'arrière** | `regles-operateur.md` §2, point 242 | la mesure du cas 1, contre le **dernier** coureur du groupe rejoint ; `moteur-course.js` `examiner()` | `pitfalls.md` A7, H5 · `mesures.md` §98 | **Conforme**, build 245 : le rattrapage se lit sur un écart qui se referme contre le dernier du peloton, et seul le groupe LEADERS peut gagner un tour |
| 3 | **Se faire rejoindre par un groupe** | `regles-operateur.md` §2, point 242 | la mesure du cas 1, contre le **premier** coureur du groupe qui rattrape ; `moteur-course.js` `examiner()` | `pitfalls.md` A7, H5 · `mesures.md` §98 | **Conforme**, build 245 : seul le groupe LAST peut perdre un tour |
| 4 | **Merge dans la timeline** | `regles-operateur.md` §3, remplacé par les points 219 et 220 | `impliedOf()` et `S.took` : `v0` ce que les boucles donnent, `v` ce qu'on retranche, borné par `S.lapStatus` | `pitfalls.md` B1, D41 · `mesures.md` §74 et §75 | **Conforme**, builds 223 à 225, et **confirmé par lui le 19 novembre 2026** (point 250) : le coureur garde son bloc LEADERS ou LAST jusqu'au clic, et prend le tour du peloton à la validation. Le clignotement de ce qui attend une validation, demandé au même point, est le cas 43 |
| 5 | **Le tour du peloton** | `regles-operateur.md` §5 | `S.bunchRaw`, une distance **lue** (build 178), prise sur un coureur dont le dernier relevé a été fait dans le paquet (`dedans`) | `pitfalls.md` H13, D40 · `mesures.md` §12, « Build 178 » | **Conforme**. Position du **premier** coureur du peloton, jamais une médiane |
| 6 | **Tour gagné** | `regles-operateur.md` §4, points 178, 180, 241 à 246 | `moteur-course.js` : `examiner()` constate, `annoncer()` propose ; `detect()` reprend les constats par `mcPointsVus` | `pitfalls.md` A9, H13, D51 · `mesures.md` §98 à §101 | **Conforme**, builds 245 à 248 : le constat se fait sur la paire que la règle nomme, le groupe LEADERS seul peut gagner, le côté d'un groupe par rapport au peloton se garde. Ce qu'il a constaté depuis et qui attend sa décision est au §15 des règles (le tour du sprint, les places du sprint final) |
| 7 | **Tour perdu** | `regles-operateur.md` §4, points 180, 242 à 246 | la même chose, lue de l'autre côté | idem cas 6 | idem cas 6 : le groupe LAST seul peut perdre un tour, et il reste LAST quand les LEADERS le dépassent (point 244, build 246) |
| 8 | **Éligibilité aux sprints** | `regles-operateur.md` §6, points 194 à 198 | `computeGroupsVraiment` : `x.dS` tiré de `mcRetard`, la place lue sur les boucles ; la marque `inelig` gravée sur le passage ; `spIneligLus(k)` | `pitfalls.md` H4 à H8 · `mesures.md` « Build 199 », « Build 201 », « Build 203 — plus un seul NO PTS à tort » | **Conforme**, build 203 : jugée sur les boucles, jamais sur la piste, et un passage lu pendant l'inéligibilité se grise et s'annonce. Un cas reste à trancher (§15 des règles, « plus proche que *tous* ») |
| 9 | **Conséquence sur le rang** | `regles-operateur.md` §7 | `spOrder`, après la construction de `seq` | `mesures.md` §6 | **Vérifié sur cas forcé**, puis en course sur la course qui met un lâché inéligible sur la ligne du sprint (`mesures.md`, « Build 200 ») |
| 10 | **Affichage d'un passage inéligible** | `regles-operateur.md` §8, point 195 | `spTick` (`judged`, `greyed`), `renderCard` (`.srow.grey`), pastille `NO PTS` | `pitfalls.md` F10, F11 · `mesures.md` §7, « Build 201 » | **Conforme**. Grisé sans rang, codé build 54 ; la pastille rouge `NO PTS` depuis le build 214 |
| 11 | **Tape switches** — comptage par passage de groupe | `regles-operateur.md` §9 et §10 | `TAPES`, `buildTapes()`, `tapeCount()`, `TAPE_SYNC_S` | `mesures.md` §8 | **Codé build 57**, appariement des heures build 60. La largeur des bandes n'est **pas modélisée**, volontairement (voir ci-dessous) |
| 12 | **Qui est le vélo en trop** | `regles-operateur.md` §11 | `tapeAttribute()` | `mesures.md` §8 | **Codé build 58** |
| 13 | **Coureur sans transpondeur qui roule seul** | `regles-operateur.md` §11 | `tapeLone()`, `tapeFix()`, `tapeTrack()`, `S.noTpRec` | `mesures.md` §9 | **Codé build 59** |
| 14 | **Deux transpondeurs inversés** | `regles-operateur.md` §11 | `tpById()` dans `step()`, `swapTp()` | `mesures.md` §10 | **Codé build 60** |
| 15 | **Mise en place et tour de lancement** | `regles-operateur.md` §12 | — | — | **Pas codé.** Ni la phase dans le simulateur, ni la vérification des transpondeurs, ni les propositions. Aucune maquette n'existe pour cette phase |
| 16 | **Les deux Pursuits face à face sur l'ovale** | `regles-operateur.md` §9 | `#trackpath` ancré au milieu de la ligne droite d'arrivée, `pt()` décalé de `CFG.gap` | `pitfalls.md` A14 · `mesures.md` §14 | **Conforme**, corrigé build 69. Les deux repères tombent au milieu de leur ligne droite pour les quatre longueurs de piste et tout `gap` |
| 17 | **Les marquages de la piste** | `regles-operateur.md` §9, tableau de la norme UCI | les quatre rectangles longitudinaux du décor, et `renderMarks()` pour les traits en travers | `mesures.md` §14 | **Conforme**, codé build 69, couleurs, épaisseurs et étendue des traits revues builds 70 à 73 sur ses quatre relectures du 28 octobre 2026. Tape switches **pas dessinés**. Depuis la build 91 plus aucun repère n'est nommé, sur sa demande du 29 octobre 2026 |
| 18 | **La simulation est une course enregistrée** | `regles-operateur.md` §16 | `CALM_RACE.acts`, `replayTick()`, `pilotStep()` pour la roue | `pitfalls.md` A11 · `mesures.md` §15 | **Conforme**, codé build 74. Plus de `SCRIPT`, plus de `useScript`, plus de mode `away`. Depuis la build 75 la course de test est déposée dans la liste enregistrée à la première ouverture, puis renommable et effaçable comme les autres ; depuis la build 168 c'est **la course où le peloton reste groupé** qui est déposée (`architecture.md` §43) |
| 19 | **Renommer et effacer une course** | `regles-operateur.md` §16 | le gabarit d'une ligne de l'onglet Files, `renaming`, `delArmed`, `commitRename()`, `saveRaces()` | `mesures.md` §16 | **Conforme**, codé build 75. Renommage sur place, effacement en deux clics, les deux tiennent au rechargement |
| 20 | **Le peloton tient l'allure affichée** | `regles-operateur.md` §16 | `S.anchor`, `step()`, `syncAllToBunchPace()` | `mesures.md` §17 et §81 · `architecture.md` §16 | **Conforme**, corrigé build 76. Un coureur qui quitte le peloton ne change plus l'allure de ceux qui restent. Le coureur de test codé en dur qui interrompait `step()` est retiré au build 235 (`pitfalls.md` A16) |
| 21 | **La progression d'un ordre, et la vitesse d'arrivée** | `regles-operateur.md` §16 | `progress()`, `po.prog`, `--prog`, `endPilot(r, mates)`, mode `follow` | `mesures.md` §18 · `architecture.md` §16 | **Conforme**, codé build 77 pour ↑ et ↓. Pour `+lap` et `−lap` le retour au peloton prend une trentaine de secondes : point ouvert au §15 des règles |
| 22 | **Rejouer une course sans l'enregistrer** | `regles-operateur.md` §16 | `LOADED`, `REC`, `curActs()`, `saveRec()`, `#simplaying` | `mesures.md` §19 · `architecture.md` §17 | **Conforme**, corrigé build 78. Une relecture n'ajoute plus de copie à la liste ; une course menée à la main s'enregistre toute seule |
| 23 | **Le numéro d'une course** | `regles-operateur.md` §16 | `raceNo()`, `numberRaces()`, `r.no`, `--play` | `mesures.md` §20 | **Conforme**, codé build 79. Numéro propre à la course, jamais renuméroté ; « Playing race *x* » en #1CC634 |
| 24 | **Le centrage des symboles de la barre de transport** | `regles-operateur.md` §16 | `centreInk()`, `inkShift`, `.ink` | `mesures.md` §21 | **Conforme**, corrigé build 80 |
| 25 | **La place des boutons de la barre** | `regles-operateur.md` §16, point 53 du §17 | la barre du haut, où le transport vit en permanence depuis le 29 octobre 2026, à la suite des onglets depuis le build 264 (point 264) | `mesures.md` §22 et §27 | **Conforme**, corrigé build 81 puis déménagé dans la barre du haut (build 113) |
| 26 | **Trier la liste des coureurs** | `regles-operateur.md` §17 | `simSort`, `sortedRiders()`, `[data-sort]` | `mesures.md` §23 · `architecture.md` §18 | **Conforme**, codé build 83. BIB, Nat et Name ; un second clic inverse ; sans tri, la vue Start list suit la grille (build 238, point 231) |
| 27 | **Les réglages gardés d'une course à l'autre** | `regles-operateur.md` §16 | `saveSetup()`, `loadSetup()`, `TPMAP`, `tct.sim.setup` | `mesures.md` §24 · `architecture.md` §19 | **Conforme**, codé build 86. Liste de départ, piste, appairage, et depuis le build 211 le type de course |
| 28 | **Le drapeau d'une nation entrée à la main** | `regles-operateur.md` §16 | `FLAGS`, `flag()` | `mesures.md` §25 | **Conforme**, codé build 87. 205 nations ; code inconnu = rectangle gris |
| 28 bis | **La poignée de la carte du sprint** | `regles-operateur.md` §17, points 110 à 125, 259 et **260** | `#scard .sbody`, `#scard .srow`, `#scard .slrow` dans le `<style>` du prototype | `mesures.md` §114 · `architecture.md` §73 | **Conforme**, build 260 : les colonnes suivent la largeur de la carte à tous les étages, rien d'autre ne grandit. Le zoom du build 259 était la mauvaise lecture, retiré |
| 28 quater | **Les cartes de proposition au-dessus de la barre** | `regles-operateur.md` §17, points 253, 254, 265 à 269 | `repartirCartes()`, `carte()`, `rowOf()`, `texteAbsent()`, `scinderAbsent()` | `mesures.md` §117 · `architecture.md` §78 | **Conforme à la maquette approuvée** pour la chute (build 266) ; une carte par groupe et une chute par tour au build 267 (point 270). la question du coureur non lu vient 12 s après la coupure et se répond coureur par coureur (mesures.md §118) |
| 28 quinquies | **La poignée sous l'ovale** | `regles-operateur.md` §17, points 121, 271, **272** | `RZ.ovh`, `--h-oval`, `.mid > .oval{aspect-ratio}` | `architecture.md` §81 | **Conforme**, build 269 : invisible au repos, juste sous le dessin, elle pose la hauteur de l'ovale |
| 28 ter | **La barre d'actions et ses deux cases de dossards** | `regles-operateur.md` §17, points 120, 122, 124, 125 et **262** (qui remplace 122) | `S.selB`, `S.selBox`, le rendu de `#tbar` (`.abar`), `actsFit()`, `.below.withprops` | `mesures.md` §116 · `architecture.md` §75 | **Conforme à sa maquette du 19 novembre 2026**, build 262 : deux Clear, deux cases A et B de huit dossards, douze boutons de même taille sur deux étages et Crash sur les deux ; la barre suit la largeur, jamais la hauteur, et reste collée en bas de sa zone (point 263, build 263). À 1366 px les libellés se coupent |
| 29 | **Les champs d'état à l'intérieur de l'ovale** | `regles-operateur.md` §17, points 1 à 18, 43 à 52, 148, 149, 162, **258** (qui remplace 139 et 140), **261** | `#ifpanel`, `renderStrip()` qui écrit en place, `#barctl` dans l'ovale | `mesures.md` §26, §33 et §112 · `architecture.md` §34, §38, §71 et §74 | **Conforme à sa maquette du 19 novembre 2026 et à l'alignement du point 261**, build 261. Sous le titre et `FINAL`, une grille de trois colonnes et deux lignes : `AUTO` / `LAP COUNTER`, `LAP`, `TO GO` ; `ARM START`, `ARM FINISH` et l'horloge. Boîtes blanches sauf `TO GO` et `ARM START`. `LEADER` et le prochain sprint ne sont plus dessinés (« Oui, elles partent ») |
| 30 | **La provenance des tours restants** | `regles-operateur.md` §17, points 11 à 16 | `S.togoSrc`, `S.togoManual`, `S.togoExport`, `togoValue()`, `counterValue()` | `mesures.md` §26 | **Conforme pour l'affichage**, build 92 ; la paire `AUTO` / `LAP COUNTER` est au centre de l'ovale depuis le build 258 (point 258), après la barre du haut (build 159). **Le lap counter relié n'est pas simulé** : `counterValue()` recopie le compte de l'application, donc le désaccord de son §13 ne peut pas s'afficher (`audit-ux.md` point 9) |
| 31 | **Le départ de la course** | `regles-operateur.md` §17 | `S.startState`, `S.fsConfirm`, `startClick()`, `syncStart()` | `mesures.md` §26 | **Partiel.** Les quatre états et leurs couleurs y sont ; l'impulsion externe n'existe pas, et le départ s'appuie sur celui du simulateur — voir l'écart assumé ci-dessous |
| 32 | **Désigner le prochain leader depuis la piste** (Pursuit A et B seulement) | `regles-operateur.md` §17, points 8, 35, 112, 149, 158, 160 | `.armb`, `#armfo1`, `#armfo2`, `syncArm()`, `S.armDone`, `leadFirst()` | `mesures.md` §26 et §38 · `architecture.md` §37 | **Conforme**, build 163 : deux boutons `SET` / `LEADER` hors de la piste, à la place exacte qu'il a fixée ; désigner un leader pose son groupe en première position (build 162). Le dossard du nouveau leader reste affiché 5 s, un choix d'affichage, voir ci-dessous |
| 33 | **`ARM FINISH`** — l'horloge s'arrête sur le vainqueur | `regles-operateur.md` §17, point 17 | `S.finArm`, `S.winT`, posés à l'ouverture de l'arrivée dans `step()` | `mesures.md` §26 | **Conforme**, codé build 92. La ligne se désarme d'elle-même au passage du vainqueur, et le temps affiché reste le sien pendant que les autres franchissent |
| 34 | **Les annotations de l'ovale** | `regles-operateur.md` §17, points 19 à 40, 103, 142, 147 | `renderOval()` : bulles de groupe, badges de nom à l'intérieur de la piste, `nocText()` | `mesures.md` §26 et §32 · `architecture.md` §14 et §31 | **Conforme.** Les anciennes annotations sont parties aux builds 93 et 94 ; depuis, un groupe a sa bulle et son badge de nom (points 22 à 40), un coureur porte son NOC sous le dossard (build 156), et le badge du groupe dit `NO PTS` (point 103). Le recouvrement des NOC dans un peloton groupé est **accepté** par lui (point 147) |
| 35 | **Tous les sprints, en colonnes** | `regles-operateur.md` §17, points 209 à 211 | `renderSprintsTab()`, `spScroll`, `spNavSync()`, classe `spr` sur `#logrows`, bouton `ALL` | `mesures.md` §69 · `pitfalls.md` D33 · `architecture.md` §57 | **Conforme**, builds 214 et 215. Une colonne par sprint couru, l'ordre complet, le final en double ; la liste `OUTPUTS` sortie de la vue et l'onglet remplacé par le bouton `ALL`. Le défilement latéral et les deux flèches ne sont **pas mesurés** |
| 36 | **Lap by lap, en colonnes** | `regles-operateur.md` §17, points 213 à 227 | `renderCrossTab()`, `S.crossG` relevé à l'ouverture du tour, `blk` / `blkc` / `blkid` gravés sur le passage, `crScroll`, `lbNavSync()` | `mesures.md` §70 à §80 · `pitfalls.md` D35 à D45 · `architecture.md` §58 | **Conforme**, builds 217 à 234 : la colonne est rangée dans l'ordre de la course sur un relevé pris à l'ouverture du tour (règle 218), les boîtes se nomment sur celles qui s'affichent (224), un passage déplacé par un tour crédité est rangé avec le peloton (222), l'écart en tours se lit sur les passages de la boucle d'arrivée (223), un écart négatif ne s'affiche plus (227). **Pas codés** : `Shift −1 lap` et l'alerte « double lap time », logique de course à proposer. Les numéros des boîtes d'une même colonne peuvent encore se répéter — relevé, pas corrigé |
| 37 | **L'ordre de la timeline** | `regles-operateur.md` §17, points 234 et 235 | `moteur-course.js` : `chaine()`, `anneau`, `ecartEntre()`, garde **E13** ; `mcRetard` dans `computeGroups()` | `mesures.md` §88 et §89 · `pitfalls.md` A17 · `architecture.md` §59 | **Conforme pour l'ordre**, build 239 : la timeline se range sur la seule lecture des boucles, ramenée entre zéro et un tour depuis la tête, et l'écart de deux coureurs qui se suivent se lit sur la même chose. Restent 0,25 à 0,59 s d'inversion entre coureurs à roue : l'âge d'une lecture de boucle, pas un défaut (son point 235). **Pas conforme** sur deux points de la timeline relevés au §89 et non corrigés : un coureur peut rester seul dans un bloc parce que l'écran trie d'abord sur le tour d'écart non validé ; et une proposition « Lap lost? » faite au peloton quand deux échappés lui prennent un tour contredit son point 181 |
| 38 | **L'ouverture d'un sprint** | `regles-operateur.md` §17, point 248 | `estDesLeaders()`, `S.spFrom`, l'estampille dans la boucle de détection, `spCrossings()`, `spTick()` | `mesures.md` §102 · `pitfalls.md` D46 · `architecture.md` §63 | **Conforme**, build 249. Les quatre sprints, l'arrivée comprise, s'ouvrent au passage d'un coureur du bloc de tête de la timeline, et les places se comptent depuis cet instant. Sur les trois courses mesurées au §102 le résultat est identique au build 248 : le cas qu'il a vu n'est pas reproduit, sa course à lui le dira |
| 39 | **L'ordre des coureurs dans un bloc** | `regles-operateur.md` §17, point 249 | `renderTimeline()` : l'ordre croissant des dossards dans un bloc | `mesures.md` §103 | **Accepté par lui** : l'ordre des dossards est l'un des deux ordres qu'il admet. L'ovale n'est pas mesuré |
| 40 | **Le type de course et le classement** | `regles-operateur.md` §17, points 204 à 208, 212 | `CFG.type`, `CFG.advance`, `#rtype`, `renderStandingsTab()`, `renderEvoTab()`, `evoMoments()` | `mesures.md` §66 à §68 · `pitfalls.md` D31, D32, D34 · `architecture.md` §55 et §56 | **Conforme**, builds 211 à 216 : classement Live au dessin validé avec la ligne de coupe en qualification, vue Évolution rejouée depuis le départ à chaque rendu, bascule visible sur Standings seulement |
| 41 | **La grille de départ et la liste de départ** | `regles-operateur.md` §17, points 228 à 231 | `gridOrder()`, `GRIDORDER`, `renderStartList()`, `LISTS` | `mesures.md` §81 à §84 · `pitfalls.md` A15, A16 · `architecture.md` §11 et §11 bis | **Conforme**, builds 235 à 238 : la grille se compte depuis la ligne vers l'arrière, par dossard, et se réordonne en glissant une ligne du sous-onglet `Start order` ; les listes s'enregistrent. **Pas tranché** : ce que devient un ordre posé à la main d'une course à l'autre (§15 des règles) |
| 42 | **La passing list** | `regles-operateur.md` §17, points 236 à 240 | `renderPassingsTab()`, `passK1` / `passK2`, `passBib` / `passLap`, `passHold`, `lapAt()` ; `detection()` du moteur refuse une lecture d'avant la ligne | `mesures.md` §90 à §92 · `architecture.md` §60 et §61 | **Conforme**, builds 240 à 242 : tri par boucle, dossard et tour, deux filtres, un bouton qui arrête le défilement, un tour qui se lit Pursuit B, Pursuit A, Finish, et les lectures d'avant la ligne produites puis ignorées. Le dessin de la maquette Passings (couleur par position, colonnes de la feuille Race log) **n'est pas intégré** : le dessin de `maquette-passings.html`, catalogué dans `mockups/MAQUETTES OUTPUTS.pdf` |
| 48 | **Ceux qui manquent ensemble, une seule carte ; le crash compte ce qui reste** | `regles-operateur.md` §17, point 255 | `lots` dans `detect()`, `texteAbsent()`, `texteCrash()` | `mesures.md` §110 · `architecture.md` §69 | **Conforme**, build 256 : six coureurs du même bloc absents sur les deux mêmes boucles font une carte, un coureur lu en sort, et la carte de crash dit « still n laps to rejoin », tour après tour |
| 47 | **La carte de crash à plusieurs coureurs** | `regles-operateur.md` §17, point 254 | `carteCrash()`, `crashActions()`, `resteCrash`, branche `crash` de `renderTimeline()`, `newGroup()` | `mesures.md` §109 · `architecture.md` §68 | **Conforme**, build 255 : une ligne par coureur avec ses trois issues, la même carte par la question, par le bouton `Crash` de la barre et par un coureur glissé sur le bloc. Le glisser n'est pas essayé à la souris |
| 46 | **Un coureur qui manque à l'appel** | `regles-operateur.md` §17, point 253 | `detect()` section 2, `ABSENT_S`, `placerPassages()`, `ouvrirCrash()`, `lireBoucle()`, `S.absentFrom` | `mesures.md` §108 · `architecture.md` §67 · `pitfalls.md` D52 | **Conforme**, build 254 : deux boucles de suite sans lecture, puis 2,5 s, et la carte en trois questions ; YES pose les passages, Crash ouvre le groupe et sa carte à trois issues, Transponder KO le passe sans transpondeur. **À lui de confirmer** la valeur de 2,5 s, prise entre ses « 2-3 secondes » |
| 45 | **La photo-finish en orange, caméra blanche** | `regles-operateur.md` §17, point 252 | `.srow.cam`, `.sprk.cam`, `CAM` ; `renderSprintsTab()` pose `cam` sur `e.photo` | `mesures.md` §107 · `architecture.md` §66 | **Conforme**, build 253, vérifié sur une sonde de style, pas sur un vrai départage : la course de test n'en produit pas |
| 44 | **La carte du sprint n'a plus de bouton Close** | `regles-operateur.md` §17, point 251, et la règle du 15 novembre sous le point 204 | `renderCard()` n'émet plus le bouton ; la fermeture ne vient que de `spTick()` | `mesures.md` §106 · `architecture.md` §65 | **Conforme**, build 252 : aucun sprint n'a de bouton Close ; le final ne se ferme jamais, les autres se ferment seuls deux tours après leur ligne quand tout est parti |
| 51 | **Le fil commentateurs reçoit la course en direct** | `regles-operateur.md` §17, points 301 à 304 et 316 à 319, cadrage du 16 novembre, et `mockups/INTEGRATION.md` §5.7 | `fil.html`, `fil-standings.html`, `fil-evolution.html`, `fil-scenarios.html`, `fil-racefacts.html`, `fil-approche.html`, `feedSnap()` / `feedPush()`, `BroadcastChannel("tct-feed")`, bouton `#feedopen` | `mesures.md` §123 et §124 · `architecture.md` §84 et §85 | **Conforme**, build 282, pour les **neuf écrans** : Start list, Standings Live, Standings Evolution, Sprints, Scenarios Overview, Scenarios What if, Race facts, Sprint approach et Sprint approach · Lap gained. Chaque vue est la **maquette validée telle quelle**, dont seule la donnée figée est remplacée par un constructeur qui lit l'instantané (ses points 317 et 318). Seconde fenêtre du même poste, lecture seule, en anglais, nourrie toutes les 1 000 ms. Plus aucune étiquette « not fed by the race yet » Build 283 : les onglets sont dans son ordre — Start list, Standings, Sprints, Sprint approach, Race facts, Scenarios (point 320) — et la ligne de noms au-dessus du graphe de l'évolution est retirée Build 285 : le temps des tours d approche est mesure sur les passages de ligne, sprint par sprint, et ecrit en mm:ss.xxx (point 322) Build 286 : toute duree affichee en secondes est ecrite en mm:ss.xxx, l ecart entre deux tours excepte (point 323) |
| 52 | **Le fil entraîneurs** | `regles-operateur.md` §17, points 274 à 278, 301 et 319, et `mockups/MAQUETTES OUTPUTS.pdf` | `coachs.html`, écrit par `mockups/gen-fil-approche.js`, bouton `#coachopen` | `mesures.md` §124 · `architecture.md` §85 | **Conforme**, build 282, pour les **cinq écrans** : Charts By rider, Charts By sprint, Before the sprint, After the sprint et Lap gained. Même principe que le fil commentateurs : la maquette `maquette-approches-coachs.html` telle quelle, branchée sur l'instantané Build 283 : les trois vues qui suivent des coureurs ne s'ouvrent plus sur les dossards de la course figée de la maquette ; sans cette garde elles restaient vides sur une autre liste de départ (point 320, `pitfalls.md` D64, `mesures.md` §125) Build 284 : l en-tete dit ou en est la course — avant le depart, pendant, une fois finie (point 321, `mesures.md` §126) Build 286 : la colonne RIDERS est dans l ordre des dossards, et les quatre coureurs suivis a l ouverture sont les quatre premiers du classement a cet instant (point 324, `mesures.md` §128) Build 287 : les etiquettes du graphe disent les tours reellement courus de part et d autre du sprint, l ecart s ecrit lui aussi en mm:ss.xxx, et les dossards d exemple sont effaces du code (point 325, `mesures.md` §129) |
| 50 | **Race log et Passings : la même table et la même barre de filtres** | `regles-operateur.md` §17, points 310 à 315, et `mockups/maquette-coherence.html` | `decSplit` / `decKeepRow` / `decRow` / `renderRaceLogTab`, `logEvent(k,m,op,rev,ex)` et `places` posés par `spSend`, `passType` / `passLoc` / `passNoc` / `passRid` / `passQ`, `LOCN`, barres `#dfilt` et `#pfilt` à deux étages | `mesures.md` §122 · `architecture.md` §83 | **Conforme**, build 277 : colonnes communes dans les deux onglets, une ligne par coureur, un sprint en autant de lignes que de places servies (« Sprint 1 · 3rd 2 points »), filtres rangés comme les colonnes et recherche qui ne touche que le texte. **Pas codé** : l'emplacement *Push button*, que l'installation n'a pas |
| 49 | **Le Race log : sept colonnes, et le décompte de la chute au journal** | `regles-operateur.md` §17, point 305, et la maquette validée le 16 novembre 2026 | `logEvent()` enrichi de `e.dt` et `e.lap`, `dayStamp()`, `logLap()`, `S.wall0`, `crashCount()`, `S.crashSaid`, `renderRaceLogTab()` et `decType` / `decRider` / `decStatus` / `decKeep`, barre `#dfilt`, classe `rlog` | `mesures.md` §119 · `pitfalls.md` D54 · `architecture.md` §82 | **Conforme**, build 270, mesuré sur la course complète aux deux échappés et deux lâchés : les sept colonnes de la maquette, les types colorés et trois familles au fond teinté, les filtres par famille et la recherche, l'heure du jour lue au coup de pistolet, le tour pris sur le compteur de l'ovale, et le décompte des cinq tours écrit au journal une ligne par tour. **Pas codés** : les types ALERT et HARDWARE, que le moteur n'écrit pas, et les anomalies au format Problème → Effet → Action, qui demandent de réécrire des phrases déjà à l'écran — à proposer ; le **filtre par dossard**, abandonné le 22 novembre — la recherche déjà en place suffit (point 307) ; le **filtre par tour**, codé au build 273 en reprenant le contrôle de la barre des Passings (points 308 et 238) — `#dflap`, mesuré au `mesures.md` §120, erreur comprise au `pitfalls.md` D55 ; et le **filtre par dossard** au build 274 (point 309), `#dfbib` et `decBibs`, mesuré au `mesures.md` §121. Build 271 : l'onglet de la barre s'appelle **Race log**, comme le bouton qui ouvre le panneau |
| 43 | **Ce qui attend une validation clignote, et sonne une fois** | `regles-operateur.md` §17, point 250 | `@keyframes attente`, classes `attente` posées par `renderTimeline()` et `renderOval()` sur `g.pending` / `x.pending` ; `sonValidation()` dans `addProposal()` | `mesures.md` §104 et §105 · `architecture.md` §64 | **Conforme**, builds 250 et 251 : dans la timeline l'en-tête du bloc et les lignes des coureurs dont une carte de tour attend battent une fois par seconde ; sur l'ovale un **anneau vert** apparaît et disparaît autour de leurs pastilles ; la carte qui attend est **verte** (l'orange du point 136 est remplacé) ; un son retentit à l'apparition de la carte, entendu par lui. La bulle ne bat que si le bloc en a une |

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
l'horloge. Le tour de lancement, qui est ce qui sépare les deux, n'est pas construit.
`START` déclenche donc le départ du simulateur, et un faux départ validé
remet la course à zéro sans rien enregistrer.

**Le dossard du nouveau leader reste affiché 5 secondes.** L'opérateur a dit « pendant quelques
secondes » et aucune cote ne lui a été demandée, conformément au §14 (on ne lui demande que ce
qu'il voit). `ARM_SHOW_S` vaut 5 : c'est un choix d'affichage, pas une règle.

**La place du coureur dans son groupe ne se tire pas de l'horodatage du contact.** Tranché
par l'opérateur, `regles-operateur.md` §11. Il n'y a rien à implémenter.

**Un vélo de plus que de transpondeurs n'émet pas de proposition en soi** : c'est
`tapeAttribute()` (cas 12) qui propose, et seulement quand il sait **qui** pourrait être ce
vélo.

**Le lap counter relié n'est pas simulé.** La provenance `LAP COUNTER` est affichée avec sa
valeur, mais `counterValue()` recopie le compte de l'application : il n'y a pas de flux derrière
(cas 30, `audit-ux.md` point 9).

**Ce qui n'est pas construit du tout** — la chute, la neutralisation, la réception de la
photo-finish, l'alerte de passage manqué adoucie par le tape switch, les écrans Race log,
Possible scenarios et le fil commentateurs — n'est pas un écart à une règle : c'est du travail
qui n'a pas été fait. Les écrans qui restent à intégrer sont catalogués dans `mockups/MAQUETTES OUTPUTS.pdf`.

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
12. **Le second clic sur un titre de la passing list range par-dessus le premier**, et non à
    l'intérieur. La question lui a été posée le 18 novembre 2026 et il a répondu « je m'en
    fous » : le choix est de nous (`architecture.md` §60).
13. **Trois choses du sous-onglet Start order** (build 237) : un coureur ajouté va à la fin de
    la grille, l'ordre et les listes se bloquent dès que la course est partie, et `Save` écrit
    dans le prototype, pas sur le disque. Posées sans qu'il les ait dites, elles se défont s'il
    le veut (point 230 des règles).

---

## Comment ajouter un cas

1. **La règle de l'opérateur, mot pour mot, va dans `regles-operateur.md`**, avec sa date.
   Jamais ici : ce fichier n'est qu'un index.
2. **Les mesures qui la valident vont dans `mesures.md`**, avec le numéro de build. Jamais
   ici non plus.
3. **Le code qui l'applique se décrit dans `architecture.md`.**
4. Une fois codée, **une ligne du tableau ci-dessus** : le cas, le renvoi vers la règle, le
   renvoi vers le code, le renvoi vers la vérification, le statut.
5. Si le code **dévie** de la règle, le statut le dit, avec la date — comme le cas 37
   aujourd'hui.
