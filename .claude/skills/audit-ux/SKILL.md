---
name: audit-ux
description: Audite Timing/timeline-prototype_mixed.html, du prototype Course aux points — carte de sprint, timeline, ovale, console. Vérifie le retour au clic, la densité utile, le vocabulaire visible, l'origine affichée des déductions et la réversibilité, contre les principes de forme de docs/concept.md. Rend une liste de propositions, jamais une modification. Audite chacun des onglets.
---

# Auditer un écran du prototype

Ce skill produit **une liste de propositions**. Il ne modifie rien, jamais, même quand un défaut
est évident et la correction d'une ligne.

L'opérateur l'a posé en règle le 31 octobre 2026, consigné dans `docs/regles-operateur.md` §14 :
« Rien n'entre dans le prototype sans mon accord explicite. […] Quand je demande un audit ou un
avis, la réponse peut contenir ce que je n'ai pas demandé — mais elle reste une liste de
propositions, et chaque point attend mon accord avant d'entrer dans le code. »

## Avant de parler : trois lectures obligatoires

Sans elles, cet audit mesurerait le prototype à l'aune d'un site vitrine et sortirait des
recommandations déjà écartées. Les trois, à chaque fois :

1. **`docs/concept.md` § Vision** — les deux principes de forme non négociables.
2. **`docs/concept.md` § Décisions prises** — le tableau daté de ce qui est tranché.
3. **`docs/pitfalls.md` § D. Interface et navigateur** — les échecs déjà constatés.

Si l'écran audité touche aux tours, aux groupes, au merge ou à l'éligibilité, lire aussi
`docs/regles-operateur.md` §1 à §7 avant tout commentaire sur ce qu'il affiche.

## A. Ce qui ne se recommande jamais

Ce ne sont pas des opinions. Les proposer est une faute, pas une divergence de goût.

| Jamais | Pourquoi |
|---|---|
| `drag` HTML5 natif ; agir au `click` sur l'ovale ; reconstruire la timeline pendant un glisser | `pitfalls.md` **D1, D2, D3** — échecs constatés, pas préférences |
| Automatiser une décision, un retrait, une neutralisation | `concept.md` : « le logiciel propose, l'opérateur dispose », « **jamais de retrait automatique** ». Cela relève du jury, pas de l'ergonomie |
| Écrire un texte inventé, ou du français, dans une maquette | `pitfalls.md` **A14** — c'est un acte dans la maquette, pas une proposition |

## B. Ce qui se propose, en s'annonçant contre un principe posé

Tout le reste est ouvert, y compris ce qui contredit un principe écrit — l'opérateur veut
pouvoir l'entendre et trancher lui-même. Mais un tel point doit **se déclarer comme tel**.

Relèvent de cette catégorie : la densité et l'aération, le vocabulaire visible, la correction
sur l'objet plutôt que dans le journal, et même une ligne du tableau `Décisions prises`.

Un point de catégorie B énonce quatre choses, dans cet ordre :

1. **le principe qu'il contredit**, cité et daté, avec son document ;
2. **ce qu'il propose à la place** ;
3. **ce que cela coûterait** — ce que l'opérateur perd s'il accepte ;
4. **la raison de le dire quand même.**

Un point de catégorie B qui ne nomme pas le principe qu'il contredit est inutilisable : il force
l'opérateur à retrouver lui-même pourquoi il avait décidé l'inverse.

## Acte ou proposition

La distinction qui fait tenir tout le reste :

- **Proposer un libellé plus clair est une proposition.** Autorisé.
- **Écrire ce libellé dans la maquette est un acte.** Interdit sans accord.

Vaut pour tout : une couleur, une colonne retirée, un bouton déplacé. Le dire, oui. Le faire, non.

## Les sept angles

### 1. Retour au clic et appui unique

**Le plus important, parce qu'il produit des erreurs de course.** En course, un bouton n'a
parfois droit qu'à un seul appui ; sans retour visible, l'opérateur ne sait pas si quelque chose
s'est produit.

- **À l'appui** : le bouton montre-t-il immédiatement qu'il a été pressé ?
- **Après l'action** : quelque chose change-t-il à l'écran pour prouver qu'elle a eu lieu ? Une
  action qui réussit sans rien changer visuellement est un défaut, même si le code est juste.
- **Appui unique** : un bouton qui ne doit être pressé qu'une fois est-il désactivé ou transformé
  après le premier appui — pour qu'un second ne refasse pas l'action, et ne la fasse pas croire
  refaite ?
- **Le clic avalé** : sur l'ovale redessiné toutes les 50 ms (**D2**), le retour doit arriver même
  quand l'élément cliqué a été remplacé entre l'appui et le relâchement.
- **La cible mobile** : un élément qui se déplace entre l'intention et l'appui.

**La référence est dans le prototype** : le bouton `Send` — vert une fois parti, puis
« Send correction ». Tenir les autres boutons contre celui-là, plutôt qu'inventer un critère.

### 2. Densité utile contre bruit

Chercher ce qui **ne sert aucune décision de l'opérateur** : un libellé, une colonne, une ligne,
un compteur que personne ne lit pour agir.

C'est la méthode de l'opérateur lui-même : la carte de sprint a été dessinée dix fois, et chaque
tour **retirait** quelque chose. Un audit qui propose d'ajouter travaille contre cette histoire ;
il peut le faire, mais en catégorie B.

### 3. Vocabulaire visible

Relire **tous** les textes visibles de l'écran. Pour chacun : vient-il de la documentation ou de
la build en cours, et est-il dans la langue de l'interface ?

Le vocabulaire est fixe — *BIB*, *Lap*, *Rider*, *gaining a lap*, *losing a lap*. L'interface est
en anglais ; les documents de travail restent en français.

### 4. Origine affichée — mesuré, déduit, décidé

`concept.md` : chaque déduction est affichée avec son origine, et l'opérateur peut la valider, la
corriger ou la remplacer.

Chercher une valeur présentée sans dire d'où elle vient, ou qui mélange du mesuré et du déduit
dans la même colonne sans les distinguer.

### 5. Réversibilité et rattachement au tour

`concept.md` : toute décision est rattachée au tour où elle s'applique et reste modifiable.

Chercher une action sans retour, une décision non rattachée à un tour, ou une conséquence
appliquée avant d'avoir été affichée.

### 6. Correction sur l'objet

`concept.md` : on corrige **sur l'objet**, pas dans un journal. La marque de tours d'un coureur,
la flèche de réintégration, la croix d'un groupe. Le journal n'a pas de bouton, il enregistre.

Chercher une correction qui n'est pas possible là où l'objet se trouve.

### 7. Lisibilité sous pression

L'opérateur est seul, en course, et lit en un coup d'œil. Contraste, taille, ce qui se distingue
d'un regard, ce qui demande de chercher.

## Le livrable

Une liste, ordonnée par **ce qui gêne en course d'abord**, le cosmétique en dernier.

Par point :

- **Ce que c'est** — une phrase.
- **Où** — `fichier:ligne`, ou l'écran et l'élément.
- **Quel angle** — parmi les sept.
- **Catégorie** — A n'existe pas ici ; un point de catégorie B porte les quatre énoncés de la
  section B.
- **Ce que cela changerait** — concrètement, et en attente du go de l'opérateur.

Terminer par une phrase explicite : **rien n'a été modifié.**

Ne pas inventer de score, de note sur 100, ni de niveau de gravité numéroté. L'ordre de la liste
porte déjà la priorité ; un score ajoute un chiffre que personne n'a demandé.
