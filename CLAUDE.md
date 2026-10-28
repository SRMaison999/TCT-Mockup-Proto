# TCT · Course aux points — à lire avant de travailler

Ce dossier est un **prototype de conception**, pas le logiciel final. Il sert à fixer les
comportements avec l'opérateur avant tout développement.

**Ce fichier ne contient aucune règle, aucune mesure, aucune liste de fonctions.** Chaque fait
vit dans un seul document, qui le possède. Ce fichier ne dit que **quoi lire** et **comment
travailler**. Ne recopiez jamais un fait d'un document dans un autre — ni dans celui-ci.

## Avant de toucher au code

`docs/regles-operateur.md` est la **seule autorité**. Les règles y sont dans les mots de
l'opérateur, mot pour mot, datées. **Une règle ou un seuil qui n'y figure pas n'a pas sa place
dans le code.**

Avant de toucher aux **tours, aux groupes, au merge ou à l'éligibilité** : lire
`docs/regles-operateur.md` du §1 au §7. Ne pas l'avoir fait a déjà coûté des sessions entières.

Avant de recoder quelque chose qui « a l'air simple » : lire `docs/pitfalls.md`.

Pour prendre le travail suivant : `docs/travaux.md`.

L'ordre de lecture complet des sept documents, et qui possède quoi, sont dans le `README.md`.

## La manière de travailler

Elle est dictée par l'opérateur et consignée mot pour mot dans `docs/regles-operateur.md` §14.
Les six points, sans les paraphraser :

1. **Les écrans se proposent avant d'être codés.** On propose, l'opérateur critique, on ne code
   qu'après son accord explicite.
2. **On n'ajoute jamais ce qui n'a pas été demandé** : ni un contrôle, ni une ligne, ni un
   texte. Une précision que l'opérateur donne sur le matériel ou sur la course est un **fait**,
   pas une demande de le coder.
3. **On ne modifie jamais un comportement approuvé sans le dire.** Tout écart par rapport à un
   comportement validé se propose avant d'être codé.
4. **Les règles de l'opérateur se consignent mot pour mot.** On ne les paraphrase pas, on
   n'ajoute pas une condition qu'il n'a pas énoncée.
5. **On ne demande à l'opérateur que ce qu'il voit.** Les questions se posent en mètres, en
   coureurs et en matériel installé — jamais en millisecondes, en seuils ni en choix
   d'algorithme.
6. **Rien ne se décide sur un seul instantané.** Toute mesure se fait sur la course complète,
   et on compte les **changements de statut**, pas seulement les coureurs touchés.

Les dix points qui attendent une décision de l'opérateur sont dans `docs/regles-operateur.md`
§15. Tant qu'ils ne sont pas tranchés, **coder une réponse à sa place** est l'erreur
`docs/pitfalls.md` A12.

## Quand du code est livré

L'opérateur l'a posé en règle le 28 octobre 2026 : les documents se mettent à jour **dans le
même tour que le code**. La procédure exacte est dans `docs/travaux.md`, « Comment tenir cette
liste », point 3.

Le prototype porte un **numéro de build** dans son en-tête, à incrémenter à chaque publication.

## Lancer

```bash
node serve.js
```

Puis `http://localhost:8765/timeline-prototype.html` — la racine `/` sert une autre maquette,
pas le prototype. Un prototype qui démarre tourne sur une course **vide** : le scénario de
référence se charge depuis l'onglet Files, sans quoi aucun des événements décrits dans la
documentation ne se produit. Détails dans le `README.md`.
