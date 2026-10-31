# L'audit de l'écran, et ce qu'il propose

Mené le **31 octobre 2026** sur `timeline-prototype_mixed.html`, les six onglets, course de
référence chargée et rejouée en entier. Les numéros de ligne sont ceux de la **build 149**.

**Rien de ce qui suit n'est codé, et rien ne le sera sans l'accord de l'opérateur.** C'est sa
règle du 31 octobre 2026, dans `regles-operateur.md` §14 : « Quand je demande un audit ou un
avis, la réponse peut contenir ce que je n'ai pas demandé — mais elle reste une liste de
propositions, et chaque point attend mon accord avant d'entrer dans le code. »

Ce fichier n'est donc **pas** une liste de travaux : `travaux.md` ne reçoit un poste qu'une
fois qu'il est décidé. Un point qui sort d'ici part dans `travaux.md` ou directement dans le
code, et disparaît de cette liste.

L'ordre est celui de la gêne **en course** : le cosmétique est en bas. Pas de note, pas de
score — l'ordre porte déjà la priorité.

Les sept angles et les deux catégories sont ceux du skill `.claude/skills/audit-ux`. Un point
de **catégorie B** contredit un principe écrit : il le nomme, le date, dit ce qu'il coûte, et
dit pourquoi il est formulé quand même.

---

## État au 31 octobre 2026

La build 149 n'a résolu **aucun** de ces points : elle répondait à une autre demande — l'ovale
calé, les poignées, la timeline élastique, les réglages de zone et le drapeau du sprint
(`architecture.md` §22). Deux liens tout de même :

- les commandes ajoutées par la build 149 sont posées **hors** des conteneurs que le moteur
  réécrit, donc elles n'ont pas le défaut du point 1 — les boutons existants l'ont toujours ;
- la poignée de la barre d'actions et son réglage de taille **atténuent** le point 3 sans le
  corriger : la ligne reste coupée à la largeur d'origine.

La **build 150** répond à une demande de l'opérateur, pas à cette liste : la fenêtre d'actions
de taille fixe, CTRL + molette à la place des cinq groupes de boutons, et la poignée de l'ovale
qui va dans les deux sens (`architecture.md` §23, `regles-operateur.md` §17 points 121 à 125).
Elle touche cette liste sur trois points, sans en résoudre aucun en entier :

- **point 17** : les quatre infobulles françaises du réglage de l'ovale **ont disparu** avec les
  boutons. Il en reste une, celle du filtre de Passings, et le point est réécrit plus bas ;
- **point 3** : la ligne qui dit sur quoi on agit gagne 18 px — le `Clear` dégageait 62 px pour
  le groupe de boutons retiré, il n'en dégage plus que 44 pour l'étiquette. Elle reste coupée ;
- **point 1** : la barre d'actions est toujours reconstruite une fois par seconde. Les deux
  boutons du coureur seul y sont maintenant en permanence, donc reconstruits eux aussi.

La **build 154** répond elle aussi à une demande de l'opérateur, pas à cette liste — le coin de
la barre d'actions déblayé, la ligne réduite aux dossards et la fenêtre d'actions qui remplit
sa zone (`architecture.md` §27, `regles-operateur.md` §17 points 131 à 133). Elle **sort le
point 3 de la liste** : il n'y a plus de texte à tronquer. Et elle résout la moitié restante
du **point 17** côté ovale, la dernière infobulle française étant celle de Passings.

**Attention pour la suite de cette liste** : les numéros de ligne donnés plus bas sont ceux de
la build 149. Les builds 150 à 154 ont déplacé le fichier ; les repères nommés
(`renderTimeline`, `counterValue`, `#tbar`) restent justes, les numéros non.

---

# A. Les dix-sept points

## 1. Les boutons qui tranchent sont reconstruits une fois par seconde

**Ce que c'est** — Le ✓ d'une proposition et les boutons de la barre d'actions sont détruits et
recréés toutes les secondes pendant que la course avance ; un appui à cheval sur la
reconstruction n'émet aucun `click`, et rien ne se passe.

**Où** — `timeline-prototype_mixed.html:1496` et `:1514` (`propcard.innerHTML`,
`tbar.innerHTML` dans `renderTimeline`), déclenchées depuis `render()` ligne `:1855` sur
`S.t - lastTl >= 1`. Écouteurs en `click` lignes `:1884` et `:1885`.

**Mesuré** — observateur de mutations, course à ×1 : 6 reconstructions complètes en 6 s de
`#tbar` et `#scard`, 5 en 5 s de `#propcard` avec la carte « Lap gained? · BIB 12 » affichée.

**Angle** — 1, retour au clic et appui unique. C'est `pitfalls.md` **D2**, déjà payé une fois :
le panneau central y a échappé parce qu'il est *écrit en place et jamais reconstruit*. La carte
des propositions et la barre d'actions n'ont pas eu ce traitement, et ce sont elles qui portent
✓, ✕, +1 lap, DNF, DSQ.

**Ce que cela changerait** — passer ces deux zones au relâchement du pointeur comme l'ovale
(`:1662` d'origine), la timeline et la carte de sprint le font déjà, ou n'en réécrire que ce
qui a changé.

---

## 2. Aucun bouton ne montre qu'il a été pressé

**Ce que c'est** — Il n'existe pas une seule règle `:active` dans tout le prototype. Au moment
de l'appui, rien ne bouge : le retour n'arrive qu'après, quand l'action a produit son effet —
et quand elle n'en produit pas (point 1), il n'arrive jamais.

**Où** — `styles.css` : 0 occurrence de `:active`. Bloc `<style>` de la version mixte : 0 non
plus. Seul `:focus-visible` existe (`styles.css:21`).

**Angle** — 1.

**Ce que cela changerait** — un état d'appui sur `.btn`, `.startb`, `.lgtab`, `.pf`. C'est la
moitié manquante de la référence `Send` : elle dit « c'est parti », elle ne dit pas « j'ai senti
ton doigt ».

---

## 3. ~~La ligne qui dit sur quoi on agit est coupée~~ — **sorti de la liste, build 154**

Le point n'a plus d'objet : « il ne faut afficher que les BIB, rien d'autre » (l'opérateur,
31 octobre 2026, `regles-operateur.md` §17 point 132). Le nom du groupe, l'effectif et la
phrase d'invite ont quitté la ligne, et il ne reste donc rien à tronquer. Le nom et l'effectif
se lisent sur l'en-tête du bloc, dans la timeline. Voir `architecture.md` §27.

Le numéro est **gardé vide** plutôt que réattribué : le reste de la liste, l'état plus haut et
le point B plus bas y renvoient par leur numéro, et renuméroter quatorze points pour en retirer
un casserait tous ces renvois pour rien.

---

## 4. Un onglet ouvert cache la course, et rien ne rappelle qu'elle tourne — **catégorie B**

**Ce que c'est** — Les cinq onglets autres que *Race* couvrent l'écran de course. Si une
proposition « Lap gained? » apparaît pendant qu'on est sur Passings ou Standings, aucun signe
n'arrive : la barre d'onglets ne porte que `on` / `quiet`.

**Où** — barre d'onglets `:235`, bascule `:3493` (`syncTabs`), classes posées par le
gestionnaire du moteur.

**Angle** — 1 et 7.

**Catégorie B**, parce que ce point propose d'**ajouter** :

1. **Le principe contredit** — `regles-operateur.md` §14, 31 octobre 2026 : « Par défaut, on
   dessine ce que j'ai décrit, on retire ce que je rejette, **on n'ajoute rien**. » Et la
   méthode de la carte de sprint, dessinée dix fois, chaque tour en **retirant**.
2. **Ce qui est proposé** — une marque sur l'onglet *Race* quand une proposition est en
   attente, ou le retour automatique sur *Race*.
3. **Ce que cela coûterait** — un élément de plus dans une barre voulue nue, et un
   clignotement de plus dans le champ de vision.
4. **Pourquoi le dire quand même** — avant la version mixte, le journal s'ouvrait exprès et se
   refermait ; maintenant un onglet peut rester ouvert toute la course. La proposition d'un
   tour gagné vaut ±20 points et §4 dit qu'elle reste affichée jusqu'à validation ou rejet —
   affichée derrière un panneau, elle ne l'est pas.

---

## 5. « Sent · live » est un bouton qui n'agit pas

**Ce que c'est** — En mode *Live*, le bouton à droite de *Live* est vert, actif, pas désactivé,
et son appui ne fait rien : ni état, ni ligne au journal, ni un pixel qui bouge.

**Où** — rendu `:2403` (`data-sact="send"`), garde `:2450` :
`else if (act === 'send') { if (!s.live) { … } }`. Vérifié en page, sprint 2 ouvert :
`{label:"Sent · live", disabled:false, cls:"btn sentok"}`.

**Angle** — 1.

**Ce que cela changerait** — ou bien c'est un état, et il prend la forme d'un état comme les
`pill` de l'onglet Sprints ; ou bien c'est un bouton, et il est `disabled`. Aujourd'hui il porte
exactement l'habit que la référence `Send` donne à « c'est parti », sans en être un.

---

## 6. La carte du sprint perd son texte d'état à l'instant où le sprint s'ouvre

**Ce que c'est** — Avant la cloche : « SPRINT 2 · 1 lap to go · waiting for the bell ». À la
cloche, le sous-titre devient **vide** — le seul mot qui décrivait la situation disparaît au
moment où elle devient chaude.

**Où** — `:2365` : `${open ? cnt : …}`, et `cnt` n'est rempli que `if (fin)`. Vérifié en page
sur le sprint 2 ouvert.

**Angle** — 1 et 7.

**Ce que cela changerait** — garder une phrase pendant le sprint, comme la finale en a une
(« 16 ranked · finish complete »). Le bord accentué et le titre qui s'allume restent les seuls
signaux aujourd'hui.

---

## 7. La proposition n'affiche pas d'où elle vient — alors que le texte est calculé

**Ce que c'est** — La carte dit « Lap gained? · BIB 12 SUI · Lap 11 » et rien de plus. La
raison est construite ligne `:1140` — « *caught the bunch from behind at Lap 11 · one crossing
more than the bunch* » — puis **jamais rendue** : la branche `p.kind === 'lap'` (`:1447`)
n'utilise pas `p.text`. Il n'est affiché que pour les autres propositions.

**Angle** — 4, origine affichée. `concept.md` § Vision, idée 2 : « Chaque déduction est affichée
avec son origine ».

**Ce que cela changerait** — la mesure qui fonde la proposition redevient visible au moment de
la valider. Rien à calculer, c'est déjà là.

---

## 8. Undo détruit la proposition, et efface la ligne du journal

**Ce que c'est** — Deux choses dans le même geste.

- `undo()` fait `S.proposals = S.proposals.filter(p => p.kind !== 'lap')` (`:1184`). Vérifié en
  page : ✓ sur « Lap gained? BIB 12 », puis Undo — le tour est bien repris, et **la proposition
  ne revient jamais**. Elle n'a été ni validée ni rejetée : §4 dit « elle reste affichée
  jusqu'à validation ou rejet ».
- `S.log.splice(0, S.log.length - s.logLen)` (`:1306`) supprime la ligne écrite par l'action.
  Après l'annulation, l'onglet Decisions ne porte plus que « *Undone: +1 lap · BIB 12 · BIB 12
  (Lap 19)* ». Le crédit du tour n'a plus de trace, et la seule ligne restante le date du
  **tour 19**, le tour du geste (`u.lap`, `:1309`), quand la proposition parlait du **tour 11**.

**Angle** — 5, réversibilité et rattachement au tour. Et `concept.md` : « Le journal est la
preuve. »

**Ce que cela changerait** — l'annulation remet la proposition en attente, et marque la ligne
« corrected » au lieu de l'effacer — le mécanisme existe déjà pour les corrections faites sur
l'objet (`e.reversed`). Les deux chemins ne se comportent pas pareil aujourd'hui.

---

## 9. `LAP COUNTER` affiche une origine qui n'existe pas

**Ce que c'est** — Le panneau montre deux provenances côte à côte, `AUTO 21` et
`LAP COUNTER 21`, avec un bouton pour choisir laquelle sort. Mais `counterValue()` renvoie **le
même compte que l'application** : rien ne vient de la piste. Les deux nombres sont identiques
par construction, et le désaccord que §13 décrit ne peut jamais s'afficher.

**Où** — `:1537` : `function counterValue(autoVal) { return autoVal; }`. Le code le dit
lui-même, et `travaux.md` §4 bis aussi.

**Angle** — 4. Une valeur présentée avec une origine qui n'est pas la sienne est le cas le plus
coûteux : c'est celle sur laquelle on s'appuie quand les deux divergent.

**Ce que cela changerait** — tant qu'aucun compteur n'est branché, la ligne dit qu'il n'y a pas
de source (le `—` existe déjà dans le code) plutôt qu'un chiffre recopié.

---

## 10. La colonne `GAP` mélange un écart mesuré et une décision, et ne dit pas par rapport à qui

**Ce que c'est** — Deux défauts dans la même colonne.

- Son contenu est, selon les cas, un écart en secondes, **ou le mot `held`, ou le mot
  `manual`** (`:2389`). Du mesuré et du décidé dans la même case, et l'écart d'un coureur placé
  à la main n'est plus lisible du tout.
- L'écart est l'intervalle avec **le coureur précédent** (`:2194`, `e.gap = e.t - prev.t`), pas
  avec le vainqueur. Sur la finale rejouée, les quinze coureurs affichent tous `+0.147` —
  juste, et illisible comme « écart », mot qui en cyclisme désigne l'écart au vainqueur (c'est
  ce que dit §1).

**Où** — en-tête `:2372`, valeur `:2389`, calcul `:2194`.

**Angle** — 4 et 3.

**Ce que cela changerait** — un en-tête qui nomme ce qui est mesuré, et `held` / `manual` sortis
de la colonne des chiffres. La build 149 a resserré cette colonne à 46,7 px pour 43,2 d'encre :
« manual » y tient encore, tout juste.

---

## 11. Crossings : la pastille blanche porte le comptage mesuré, sans un mot et en 9 px

**Ce que c'est** — Chaque dossard de l'onglet Crossings porte une petite pastille blanche. Elle
vaut `ka`, le **nombre de passages physiques** du coureur (`:699`), tandis que la ligne où il
est rangé vaut `ka − lapStatus`, son **tour crédité**. C'est la couche factuelle et la couche
officielle côte à côte — et rien ne le dit : ni l'indice de l'onglet, ni un en-tête, ni une
infobulle.

**Où** — `:1342` (`chipN`), valeur posée `:699`, style `styles.css:40` — 14 px de diamètre,
police 9 px.

**Angle** — 4, et 7 pour la taille.

**Ce que cela changerait** — la pastille nommée une fois, dans l'indice de l'onglet qui existe
déjà. Ce point **ajoute un mot** à l'écran : c'est à l'opérateur de dire si le mot vaut la
place.

---

## 12. L'onglet *Decisions* annonce « facts only » et montre aussi les décisions

**Ce que c'est** — L'indice sous la barre dit « FACTS ONLY · NEWEST FIRST ». La vue rend
`S.log` en entier, décisions de l'opérateur comprises — la classe `op` est posée précisément
pour les distinguer. Vérifié : la ligne « UNDO · Undone: +1 lap · BIB 12 » s'affiche sous cet
indice.

**Où** — indice dans la table du moteur, rendu `:1848`.

**Angle** — 3, vocabulaire visible.

**Ce que cela changerait** — l'indice dit ce que la vue contient. Les deux couches que décrit
`concept.md` sont déjà présentes dans les données ; seul leur nom à l'écran est faux.

---

## 13. `NEXT PLACE 17th` quand les 16 sont classés

**Ce que c'est** — La finale est complète, « 16 ranked · finish complete », et la case de
saisie annonce une cible qui n'existe pas. Le champ porte `max="16"` : l'indice et le champ se
contredisent.

**Où** — `:2410`.

**Angle** — 1, cible mobile et appui sans suite.

---

## 14. `ARM START` reste vivant pendant une course rejouée

**Ce que c'est** — Sur une course chargée, `S.startState` reste à `idle` : le bouton rouge
affiche **ARM START** pendant que l'horloge tourne à 5:12. L'écran et le bouton se
contredisent, et la suite des appuis mène à `FALSE START` puis à `reset()`.

**Où** — `:2017` (`syncStart`), `:1943` (`startClick`). La double confirmation du faux départ
est bien là ; c'est l'état de départ qui ne suit pas la course rejouée.

**Angle** — 1 et 5.

---

## 15. Passings : la colonne `SIGNAL / COUNT` dit « read » sur toutes les lignes de boucle

**Ce que c'est** — Sur chaque lecture de boucle, la colonne porte le mot `read`, identique
partout ; seules les lignes de ruban y portent un comptage. Une colonne qui dit la même chose à
toutes les lignes n'aide aucune décision.

**Où** — `:3429` (`renderPassingsTab`).

**Angle** — 2, densité utile.

**Ce que cela changerait** — la colonne ne garde que ce qui varie. La même vue a un autre point
à regarder : à l'étroit, le bloc `LOOP HEALTH` est coupé au bord droit, et la phrase
d'explication des *Unmatched* disparaît avant lui.

---

## 16. Standings : quatre colonnes vides sur onze

**Ce que c'est** — Sur la course de référence menée jusqu'au bout, `GAIN`, `LOST`, `LAPS` et
`STATUS` sont vides pour les seize coureurs. Elles ne portent quelque chose que si un tour a
été validé ou un coureur retiré.

**Où** — `:2520` (`renderStandingsTab`).

**Angle** — 2.

**Ce que cela changerait** — ces colonnes n'apparaissent que lorsqu'elles ont quelque chose à
dire. À l'inverse de l'ajout du point 4, celui-ci va dans le sens de la méthode de l'opérateur :
retirer.

---

## 17. Une infobulle en français dans une interface anglaise

**Ce que c'est** — Un filtre de Passings parle français, et sans accents.

**Où** — « Les passages ou le ruban et la boucle ne sont pas tombes d'accord ».

**Résolu en partie, build 150** — les quatre autres étaient portées par le réglage de taille de
l'ovale (« La taille du dessin de l'ovale. Le reste de l'ecran ne bouge pas. », « Reduire
l'ovale », « Revenir a la taille d'origine », « Agrandir l'ovale »), retiré avec les cinq
groupes de boutons. Il n'en reste qu'une.

**Angle** — 3. `concept.md` § Décisions prises, 21 octobre : « Langue de l'interface : Anglais ;
[…] Les documents de travail restent en français. » `timeline-prototype.html` n'en porte
aucune : elles sont arrivées avec la version mixte. Les commandes ajoutées en build 149, et
l'étiquette de taille de la build 150, sont en anglais.

**Ce que cela changerait** — le texte restant passe en anglais.

---

# B. L'avis sur le design, demandé le 31 octobre 2026

Même règle : des propositions, pas des décisions.

## Ce que le design réussit

- **La double lecture est la bonne idée, et elle est bien tenue.** La timeline répond « qui est
  devant qui dans la course », l'ovale « qui est où sur la piste » — deux questions réellement
  différentes, et c'est ce que dit §6. Le survol qui allume la ligne depuis la pastille relie
  les deux sans les mélanger.
- **Un coureur a une identité, et elle est la même partout.** La pastille dossard colorée se
  retrouve à l'identique dans la timeline, sur l'ovale, dans la carte du sprint, dans
  Crossings, Sprints, Standings et Passings.
- **Le bloc de groupe est la bonne unité**, nommé par position, avec la couleur de sa bulle sur
  l'ovale.
- **La carte du sprint a une structure solide** : l'ordre à gauche, le plateau au milieu, les
  commandes à droite, et aucune commande ne peut repousser l'ordre.

## Ce qui la freine

### A. La hiérarchie est plate : rien ne dit où regarder

Huit zones de même poids visuel. Le mécanisme existe pourtant — le champ du prochain sprint
devient `hot` à deux tours, et il marche — mais il n'est utilisé qu'une fois. Une proposition
« Lap gained? », la décision la plus lourde de la course, est une petite boîte bleue du même
poids que la barre d'actions à côté.

**Proposition** : un seul foyer à la fois, qui se déplace selon ce qui est le plus urgent, en
réutilisant le `hot` déjà approuvé plutôt qu'en inventant un signal.

### B. Les couleurs des coureurs ne tiennent pas à 24

Les seize coureurs par défaut (`:415` et suivantes) portent quatre rouges (`#c8102e` SUI,
`#ef4444` DEN, `#d62828` ESP, `#9f1239` POR), trois verts, trois bleus et deux quasi-noirs. Sur
la timeline la pastille fait 34 px et porte le chiffre : ça passe. **Sur l'ovale elle fait
environ 7 px de rayon**, et deux rouges voisins dans le même peloton sont le même point.

**Angle** — 7. **Proposition** : une attribution qui garantit un écart minimal entre deux
couleurs du même groupe, et qui tient à 24.

**Depuis la build 151**, ce point ne se corrige plus à la main en course : l'opérateur a retiré
la sélection des couleurs du registre (`regles-operateur.md` §17 point 127), et c'était le seul
endroit où la couleur d'un coureur se changeait. La douzaine de couleurs qu'elle proposait pour
un peloton fixé à 24 n'est plus le sujet ; l'attribution, elle, l'est entièrement.

### C. Une seule voix typographique pour quatre métiers, et trop pâle

Le même traitement — 10 px, majuscules, interlettrage `.07em`, `--muted` ou `--dim` — sert
d'en-tête de colonne, de titre de bloc, d'indice d'onglet et d'étiquette de champ.

**Mesuré** sur les jetons de `styles.css:3-4` : `--dim` (`#5f5c55`) sur `--deep` (`#0f1113`)
donne **≈ 2,9 : 1**, et sur le fond des lignes (`#17191c`) **≈ 2,6 : 1**. Le plancher habituel
pour du texte est 4,5 : 1, et il s'agit ici de 10 px en capitales. `--muted` est à 7,4 : 1 et ne
pose aucun problème : c'est `--dim` seul qui est en cause.

### D. Le réglage de taille de l'ovale ne pouvait pas tenir sa promesse

**Traité et codé en build 149** (`architecture.md` §22) : l'ovale est calé en haut à gauche, et
le `+` s'arrête là où la piste commencerait à être rognée au sens de l'opérateur. Ce point est
le seul de l'audit qui soit sorti de cette liste.

### E. Le panneau à l'intérieur de l'ovale est trop chargé — **catégorie B**

1. **Le principe contredit** — `regles-operateur.md` §17, « Les champs ressortent de l'ovale »,
   sa page redessinée du **29 octobre 2026**, suivie de son deuxième dessin de l'intérieur.
2. **Ce qui est proposé** — sortir du panneau ce qui n'est pas lu en course : la paire
   AUTO / LAP COUNTER avec ses deux boutons de choix, le bascule M/A, les pas − / +. Garder
   l'horloge, LAP, TO GO, LEADER et le prochain sprint.
3. **Ce que cela coûterait** — la perte du regroupement voulu : tout l'état de la course au
   même endroit, au centre du regard. Et un réglage sorti du panneau est un réglage qu'il faut
   aller chercher quand il sert vraiment, c'est-à-dire quand le compteur de piste se trompe.
4. **Pourquoi le dire quand même** — 446 × 92 px, environ 4 % de l'écran, qui portent douze
   commandes en corps 11, au centre exact du seul dessin où l'on lit des positions. Et la
   moitié de ce qu'elle contient — le choix de provenance des tours — ne sert à rien
   aujourd'hui (point 9).

### F. La barre d'onglets fait de la course un écran parmi six — **catégorie B**

1. **Le principe contredit** — la demande du **31 octobre 2026**, `architecture.md` §21 :
   « **six onglets disponibles en tout temps** », et « La page de course est un onglet comme
   les autres ».
2. **Ce qui est proposé** — que *Race* ne soit pas dessiné comme ses cinq voisins : un retour,
   pas un pair.
3. **Ce que cela coûterait** — la régularité demandée, et le dessin propre des pages 3a–3d.
4. **Pourquoi le dire quand même** — pendant une course il n'y a pas six écrans, il y en a un
   et cinq documents. Quatre des cinq — Crossings, Decisions, Sprints, Standings — ne servent
   à aucune décision à prendre dans la seconde. C'est le point 4 vu par la forme.

---

**Rien n'a été modifié pour produire cet audit.** Les mesures ont été prises dans la page en
mémoire, sur une course rejouée qui n'enregistre rien, et la page a été remise dans son état.
