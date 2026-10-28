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
| 6 | **Tour gagné** | `regles-operateur.md` §4 | `detect()`, via `r.inBunchPrev` pour le *quand*, `facingPos()` pour le *combien* | `pitfalls.md` A9, H13 · `mesures.md` §1 et §12 | **Conforme**. *Quand* : build 66. *Combien*, contre le coureur d'en face : build 67 |
| 7 | **Tour perdu** | `regles-operateur.md` §4 | la même chose, lue de l'autre côté | `pitfalls.md` A9, H13 · `mesures.md` §1 et §12 | idem cas 6 |
| 8 | **Éligibilité aux sprints** | `regles-operateur.md` §6 | `S.inelig`, calculé avant le `return` de `computeGroups()` | `pitfalls.md` H4, H5, H7, H8 · `mesures.md` §3 et §5 | **Conforme**, figé build 53. Un cas reste à trancher (§15 des règles) |
| 9 | **Conséquence sur le rang** | `regles-operateur.md` §7 | `spOrder`, après la construction de `seq` | `mesures.md` §6 | **Vérifié sur cas forcé seulement** — la course de référence ne l'exerce jamais |
| 10 | **Affichage d'un passage inéligible** | `regles-operateur.md` §8 | `spTick` (`judged`, `greyed`), `renderCard` (`.srow.grey`) | `pitfalls.md` F10, F11 · `mesures.md` §7 | **Conforme**, codé build 54. Vu sur cas forcé seulement |
| 11 | **Tape switches** — comptage par passage de groupe | `regles-operateur.md` §9 et §10 | `TAPES`, `buildTapes()`, `tapeCount()`, `TAPE_SYNC_S` | `mesures.md` §8 | **Codé build 57**, appariement des heures build 60. La largeur des bandes n'est **pas modélisée**, volontairement (voir ci-dessous) |
| 12 | **Qui est le vélo en trop** | `regles-operateur.md` §11 | `tapeAttribute()` | `mesures.md` §8 | **Codé build 58** |
| 13 | **Coureur sans transpondeur qui roule seul** | `regles-operateur.md` §11 | `tapeLone()`, `tapeFix()`, `tapeTrack()`, `S.noTpRec` | `mesures.md` §9 | **Codé build 59** |
| 14 | **Deux transpondeurs inversés** | `regles-operateur.md` §11 | `tpById()` dans `step()`, `swapTp()` | `mesures.md` §10 | **Codé build 60** |
| 15 | **Mise en place et tour de lancement** | `regles-operateur.md` §12 | — | — | **Pas codé.** Ni la phase dans le simulateur, ni la vérification des transpondeurs, ni les propositions. Le travail à faire est détaillé dans `travaux.md` §1 |

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
