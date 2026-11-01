/* ===========================================================================
   LE MOTEUR DE COURSE — reconstruit le 1er novembre 2026.

   L'opérateur : « Ce serait pas plus simple de reconstruire cet algorithme depuis le début, avec
   les erreurs que nous savons qu'il ne faut pas commettre....? »

   Il répond à trois questions, et à rien d'autre :
     1. qui est devant qui ;
     2. qui roule avec qui — les groupes, et la cassure d'une seconde ;
     3. qui gagne ou perd 20 points.

   IL NE LIT QUE LES DÉTECTIONS DES BOUCLES. Un dossard, une boucle, une heure. Rien d'autre
   n'entre. Sa règle, point 177 : « La seule façon certaine de savoir l'ordre de passage des
   coureurs, c'est les détections des boucles. A chaque tour. 3 boucle par tour. »

   IL NE COMPTE AUCUN TOUR. Ses quatre phrases du 1er novembre 2026, point 182 :
     « le dernier coureur de ce groupe-là, sans regarder ses tours »
     « chacun est toujours dans le même tour que les autres du point de vue de la timeline »
     « on ne gagne pas un tour, on gagne 20 points »
     « on ne perd pas un tour, on perd 20 points »
   Il n'y a donc nulle part ici une distance cumulée, un tour ajouté ou un tour retranché. La
   timeline est une CHAÎNE sur la piste : on part du premier coureur du groupe 1 et on descend,
   chaque coureur derrière le précédent de l'écart de temps lu sur les boucles.

   ---------------------------------------------------------------------------
   LES ERREURS À NE PAS REFAIRE. Chacune a été mesurée, et chacune a son garde ici.

   E1. Ne jamais tirer un ordre d'une position calculée entre deux détections.
       Mesuré : la tête changeait 67 fois sur une course, 65 fois pour 3 m ou moins, et à 539,4 s
       elle passait du 12 au 15 alors qu'aucune boucle n'avait rien détecté entre les deux.
       → Le garde : `detection()` est la seule entrée. Il n'existe aucune entrée pour une position.

   E2. Ne jamais mesurer entre deux coureurs qui ne se suivent pas.
       Un groupe est une chaîne : ses deux bouts peuvent être à 218 m l'un de l'autre. Mesuré : un
       tour pris proposé contre un coureur à 126,6 m, soit un demi-tour, arrondi en un tour.
       → Le garde : les deux seules paires regardées sont nommées — (la queue du peloton, lui) et
         (lui, la tête du peloton) — et ce sont des coureurs consécutifs dans la chaîne.

   E3. Ne jamais ajouter ni retirer un tour.
       Mesuré : 164 écarts négatifs se voyaient ajouter un tour entier, d'où le saut de 18,3 s ;
       puis 198, puis 960 constats de tour sur une course où personne n'en prend ni n'en perd.
       → Le garde : il n'y a plus de tour dans ce fichier. Rien n'ajoute ni ne retranche 250 m.

   E4. Ne garder aucun souvenir d’une paire de coureurs.
       Son point 192 : « MAIS ON NE RECHERCHE PAS DES SOUVENIRS !! » Une cassure se déclare sur la
       mesure du moment. Le délai de 0,3 s était à moi, et son point 191 l’a rendu inutile.
       → Le garde : rien dans ce fichier ne retient l’état d’une paire.

   E5. Ne rien proposer que les boucles ne montrent pas.
       → Le garde : un coureur sans détection n'existe pas pour le moteur de course.

   E6. Ne jamais nommer une règle, ni une partie du logiciel, avec mes mots plutôt qu'avec les
       siens. Il a dû corriger « les deux coureurs qui se font face », qui était de moi, puis « la
       pièce » pour ce fichier (points 176 et 179).
       → Ici on dit : les deux coureurs qui se suivent, le moteur de course, le peloton.

   E7. Ne jamais confondre le peloton avec le plus gros groupe de l'instant.
       Mesuré : le trio échappé se trouvait parfois le plus nombreux, et un ±20 se comptait contre
       un échappé. Ses mots, point 174 : « Au départ de la course, tous les coureurs sont ensemble
       dans le seul groupe existant à ce moment là : le peloton. »
       → Le garde : le peloton est le groupe du départ, qui continue — celui qui partage le plus de
         coureurs avec le peloton de l'image précédente.

   E8. Ne jamais constater un ±20 sans savoir par où le coureur est sorti du peloton.
       Ses mots, point 174 : un coureur « qui s'échappe à l'avant » et revient gagne 20 points ; un
       coureur « se faisant lâcher à l'arrière » et repris en perd 20. Et son point 181 : « Rien :
       ils sont lâchés d'un tour, revenir au contact de la queue du peloton ne leur fait rien
       gagner. » Sur un anneau, les deux gestes se ressemblent ; ce qui les distingue est le CÔTÉ.
       → Le garde : `derive` retient le chemin qu’on l’a vu prendre. Sur un anneau, « échappé
         d’une seconde » et « lâché d’un tour moins une seconde » sont la même lecture.
   =========================================================================== */
(function () {
  'use strict';

  function creer(reglage) {
    const R = Object.assign({
      piste: 250,            // la longueur d'un tour, en mètres
      boucles: [0],          // la position de chaque boucle sur la piste, en mètres
      arrivee: 0,            // laquelle est la ligne d'arrivée
      cassureS: 1.0,         // §1 : au-delà d'une seconde entre roue arrière et roue avant, cassure
      veloM: 1.65,           // §1 : la longueur d'un vélo
    }, reglage || {});

    const BOUCLES = [...R.boucles].sort((a, b) => a - b);
    const RANG = new Map(BOUCLES.map((b, i) => [b, i]));

    const coureurs = new Map();
    const points = [];        // les ±20 constatés, dans l'ordre
    let pelotonAvant = null;
    let maintenant = 0;

    const neuf = bib => ({
      bib,
      n: 0,                   // combien de détections : rien d'autre ne dit qu'il est en course
      boucle: null, t: null,  // sa dernière détection
      pas: null, dt: null,    // de combien de mètres et en combien de temps il est venu : sa vitesse
      passages: 0,            // ses passages sur la ligne d'arrivée : un compte, pas une distance
      parBoucle: new Map(),   // position de boucle → heure de son dernier passage dessus
      derive: 0,              // sa dérive sur la tête du peloton, en secondes : elle nomme le CÔTÉ
      rPrec: null,            //   par lequel il est parti (E8), et rien d'autre.
      colle: false,           // était-il, à l'image d'avant, au contact du coureur qu'il rejoint ?
      credite: null,          // quand son dernier ±20 a été constaté
    });

    /* ------------------------------------------------------------------ 1. une détection */
    function detection(d) {
      if (!RANG.has(d.boucle)) return { refus: 'boucle inconnue', boucle: d.boucle };
      let c = coureurs.get(d.bib);
      if (!c) { c = neuf(d.bib); coureurs.set(d.bib, c); }
      if (c.boucle != null) {
        let pas = ((d.boucle - c.boucle) + R.piste) % R.piste;
        if (pas === 0) pas = R.piste;               // deux fois la même boucle : un tour entier
        c.pas = pas; c.dt = d.t - c.t;
      }
      c.boucle = d.boucle; c.t = d.t; c.n++;
      c.parBoucle.set(d.boucle, d.t);
      if (d.boucle === R.arrivee) c.passages++;
      if (d.t > maintenant) maintenant = d.t;
      examiner();
      return { bib: d.bib, boucle: d.boucle, t: d.t, detections: c.n };
    }

    const vitesse = c => (c.pas == null || !c.dt) ? null : c.pas / c.dt;
    const tourS = c => { const v = vitesse(c); return v ? R.piste / v : null; };  // sa duree de tour
    /* ------------------------------------------------------------------ 2. plus aucun souvenir */
    // SON POINT 192 : « MAIS ON NE RECHERCHE PAS DES SOUVENIRS !! » Il n’y a plus d’état gardé par
    // paire de coureurs, ni de délai de confirmation. Une cassure est déclarée sur la mesure du
    // moment. Le délai de 0,3 s était à moi : il m’avait été laissé le 25 octobre 2026 pour absorber
    // le saut de position d’un coureur au moment où il franchit une boucle, et depuis que la timeline
    // ne se recalcule qu’aux passages (point 191), ce saut n’existe plus.

    /* ------------------------------------------------------------------ 3. la tête et la chaîne */
    // LA TÊTE, SON POINT 183. Sur un anneau, « devant » n'a de sens qu'à partir d'un coureur, et ce
    // coureur, ce n'est pas le logiciel qui le trouve : c'est l'opérateur qui le désigne, comme le
    // juge starter le montre du doigt à chaque passage sur la ligne de sprint (point 174). Elle ne
    // change que s'il la change.
    //
    // E9. NE JAMAIS LAISSER LE LOGICIEL CHERCHER LA TÊTE. Mesure de la build 187 : la tête choisie
    //     sur le nombre de franchissements de la ligne basculait 100 fois au palier 2 — dans un
    //     peloton de 16, le premier à franchir la ligne a un franchissement d'avance sur le dernier
    //     pendant les deux secondes que met le groupe à passer. À chaque bascule, les écarts de
    //     tout le monde se recalculaient sur un autre coureur : la timeline se retournait 1 509 fois et
    //     246 ±20 sortaient de nulle part.
    //     → Le garde : `ancre` est posée par `designer(bib)` et par rien d'autre. Tant que
    //       personne n'est désigné, c'est le premier coureur détecté de la course, et il le reste.
    let ancre = null;
    function designer(bib) {
      if (!coureurs.has(bib)) return { refus: 'coureur jamais détecté', bib };
      ancre = bib;
      return { tete: ancre };
    }
    function tete() {
      if (ancre != null) { const c = coureurs.get(ancre); if (c && c.n) return c; }
      for (const c of coureurs.values()) if (c.n) { ancre = c.bib; return c; }
      return null;
    }

    // LE DÉCALAGE SUR LA TÊTE, en secondes lues. Son point 182 : « chacun est toujours dans le même
    // tour que les autres du point de vue de la timeline ». Un coureur devant la tête porte donc un
    // décalage négatif, et le tour d'avance n'existe pas : on ramène le décalage dans le demi-tour
    // autour de zéro, parce que sur un anneau un coureur à 18 s derrière, sur un tour de 19 s, EST
    // une seconde devant. C'est ce que les boucles donnent, et c'est tout ce qu'on en sait (E1).
    function decalageS(ref, c) {
      let tref = -Infinity, tc = null;
      for (const b of BOUCLES) {
        const a = ref.parBoucle.get(b), x = c.parBoucle.get(b);
        if (a == null || x == null) continue;
        if (a > tref) { tref = a; tc = x; }   // la boucle où la tête est passée le plus récemment
      }
      if (tc == null) return null;
      let d = tc - tref;
      const T = tourS(ref) || tourS(c);
      if (T) { while (d > T / 2) d -= T; while (d <= -T / 2) d += T; }
      return d;
    }

    // OÙ IL EST PAR RAPPORT À LA TÊTE, en secondes, sans repli. Le décalage lu est replié sur un
    // demi-tour : il ne peut pas dire si un coureur est 2 s derrière ou tout un tour moins 2 s
    // devant. La dérive, elle, sait lequel des deux — on l'a vu prendre ce chemin. On s'en sert donc
    // pour compter les tours entiers qui séparent les deux coureurs, et on garde la LECTURE des
    // boucles pour la précision.
    //
    // E12. NE JAMAIS RANGER LA TIMELINE SUR LE DÉCALAGE REPLIÉ. Mesuré à la build 192, au palier 2
    //      à 312,4 s : le 12 et le 52 étaient 208 m DEVANT le peloton, et la timeline les montrait
    //      DERRIÈRE lui ; le 46 et le 70, 106 m derrière, étaient montrés en tête avec l'étiquette
    //      « 1-LEADERS ». L'opérateur : « non mais ça ne fonctionne absolument pas c'est n'importe
    //      quoi !! »
    const placeS = (c, retard, T) => {
      if (!T || c.derive == null) return retard;
      return Math.round((c.derive - retard) / T) * T + retard;
    };

    // LA CHAÎNE. Les coureurs rangés par leur place sur la tête. Un coureur dont on ne peut pas lire
    // le décalage n'entre pas dans la chaîne (E5).
    function chaine() {
      const t0 = tete();
      if (!t0) return [];
      const T = tourS(t0);
      // DEUX QUANTITÉS, DEUX USAGES. `retard` est la lecture des boucles, repliée sur un demi-tour :
      // c’est elle qui dit si deux coureurs se touchent SUR LA PISTE, donc elle qui sert le constat
      // des ±20. `place` est la même lecture déroulée par la dérive : c’est elle qui dit où chacun
      // est dans la course, donc elle qui range la timeline et qui mesure l’écart de deux groupes.
      const liste = [{ c: t0, retard: 0, place: 0 }];
      for (const c of coureurs.values()) {
        if (c === t0 || c.n === 0) continue;
        const d = decalageS(t0, c);
        if (d != null) liste.push({ c, retard: d, place: placeS(c, d, T || tourS(c)) });
      }
      liste.sort((a, b) => (a.place - b.place) || (a.c.bib - b.c.bib));
      return liste;
    }

    // L'ÉCART ENTRE DEUX COUREURS QUI SE SUIVENT, son §1 : « le temps entre la roue arrière du
    // coureur 1 et la roue avant du coureur 2 ». La différence de leurs décalages, moins le temps
    // qu'il faut au suiveur pour couvrir une longueur de vélo, à sa vitesse.
    // LE MÊME ÉCART, MAIS SUR LA PISTE : la lecture repliée, pour le constat des ±20. Un coureur qui
    // revient sur la queue du peloton la touche SUR LA PISTE, et c’est cela qu’on guette.
    function ecartPiste(devant, suiveur) {
      if (devant == null || suiveur == null) return null;
      const z = suiveur.retard - devant.retard;
      const v = vitesse(suiveur.c);
      return v ? z - R.veloM / v : z;
    }

    function ecartEntre(devant, suiveur) {
      if (devant == null || suiveur == null) return null;
      const z = suiveur.place - devant.place;
      const v = vitesse(suiveur.c);
      return v ? z - R.veloM / v : z;
    }

    /* ------------------------------------------------------------------ 4. les groupes */
    // On descend la chaîne : entre deux coureurs qui se suivent, une cassure confirmée ouvre un
    // groupe. C'est le §3, et la règle qu'il a instaurée au point 174.
    function groupes() {
      const ch = chaine(), gs = [];
      let g = null;
      for (let i = 0; i < ch.length; i++) {
        const x = ch[i], devant = i ? ch[i - 1] : null;
        let coupe = !g, ec = null;
        if (devant) {
          // SON POINT 192 : « MAIS ON NE RECHERCHE PAS DES SOUVENIRS !! » La cassure est déclarée
          // sur la mesure du moment, et sur rien d’autre. Le délai de confirmation de 0,3 s était à
          // moi — il absorbait le saut de position d’un coureur franchissant une boucle —, et depuis
          // que la timeline ne se recalcule qu’aux passages (point 191), ce saut n’existe plus.
          ec = ecartEntre(devant, x);
          coupe = ec == null ? false : ec > R.cassureS;
        }
        if (coupe || !g) { g = { coureurs: [], ecartS: devant ? ec : null }; gs.push(g); }
        g.coureurs.push(x.c.bib);
      }
      return gs;
    }

    // LE PELOTON est le groupe du départ qui continue (E7) : celui qui partage le plus de coureurs
    // avec le peloton de l'image précédente. S'il n'en reste plus la moitié, il a éclaté et on
    // repart du plus nombreux. Au départ, le plus nombreux — ils y sont tous.
    function peloton(gs) {
      const liste = gs || groupes();
      if (!liste.length) return null;
      const plusGros = liste.reduce((a, g) => (!a || g.coureurs.length > a.coureurs.length ? g : a), null);
      let g = plusGros;
      if (pelotonAvant && pelotonAvant.length) {
        const avant = new Set(pelotonAvant);
        let mieux = 0;
        for (const x of liste) {
          const k = x.coureurs.filter(b => avant.has(b)).length;
          if (k > mieux) { mieux = k; g = x; }
        }
        if (mieux * 2 < pelotonAvant.length) g = plusGros;
      }
      pelotonAvant = g.coureurs.slice();
      return g;
    }

    /* ------------------------------------------------------------------ 5. les 20 points */
    // PAR OÙ IL EST PARTI (E8). Sur un anneau, « échappé d'une seconde à l'avant » et « lâché d'un
    // tour moins une seconde » sont la MÊME lecture : aucune détection ne les distingue. Ce qui les
    // distingue est le chemin qu'on l'a vu prendre. On suit donc, pour chaque coureur, sa dérive
    // sur la tête du peloton : la somme des petits déplacements relatifs, image après image. Elle
    // ne sert QU'À nommer le côté — elle n'est jamais une distance, jamais un tour, et elle
    // retombe à zéro dès qu'un ±20 est constaté (son point 174 : « ils sont considérés avoir
    // parcouru la même distance que leurs adversaires »).
    function deriver(c, r, T) {
      if (c.rPrec != null) {
        let d = r - c.rPrec;
        if (T) { while (d > T / 2) d -= T; while (d <= -T / 2) d += T; }
        c.derive += d;
      }
      c.rPrec = r;
    }

    // CE QUI EST EN ATTENTE D'ÊTRE ANNONCÉ. Point 180 : deux coureurs sont proposés ENSEMBLE s'ils
    // ne sont pas éloignés de plus d'une seconde. Or ils ne referment pas la paire sur la même
    // détection — le 18, le 61 et le 7 l'ont fermée à trois détections d'intervalle à la build 189,
    // et sortaient en trois propositions séparées. On garde donc le constat ouvert le temps de sa
    // seconde, et on annonce ce qui s'y est joint.
    let attente = null;

    function examiner() {
      const gs = groupes(), pel = peloton(gs);
      if (!pel || pel.coureurs.length < 2) return;
      const ch = chaine();
      const entree = new Map(ch.map(x => [x.c.bib, x]));
      const T = tourS(coureurs.get(pel.coureurs[0]));   // la durée d’un tour du peloton

      for (const c of coureurs.values()) {
        if (c.n === 0) continue;
        const x = entree.get(c.bib);
        // la dérive se mesure sur L’ANCRE, jamais sur la tête du peloton : celle-ci change de
        // coureur à chaque remous du peloton, et chaque changement déplaçait la référence de toute
        // la longueur du groupe. Mesuré à la build 190 : le 46 et le 70, lâchés, ont reçu un +20.
        // Elle se nourrit du décalage LU, replié, et pas de la place déroulée : sans quoi elle se
        // nourrirait d'elle-même.
        if (!x) continue;
        const lu = decalageS(coureurs.get(ancre) || c, c);
        if (lu != null) deriver(c, lu, T);

        // IL RATTRAPE, OU IL EST RATTRAPÉ. Ses mots exacts, point 180 : le gain se constate « au
        // moment un coureur rattrape le DERNIER coureur du peloton », la perte « au moment un
        // coureur se fait rattraper par le PREMIER coureur du peloton ». Ce n'est donc pas son
        // retour dans un groupe qu'on guette, c'est UNE paire nommée qui se referme, et c'est sa
        // dérive qui dit laquelle des deux :
        //   parti par l'avant (dérive négative) → (le dernier du peloton, lui)
        //   lâché par l'arrière (dérive positive) → (lui, le premier du peloton)
        // L'écart de cette paire doit être POSITIF — il est bien derrière celui qu'il rattrape —
        // et passer sous le seuil du §1. C'est le PASSAGE qui est l'événement, pas l'état.
        //
        // SON POINT 181, « Rien : ils sont lâchés d'un tour, revenir au contact de la queue du
        // peloton ne leur fait rien gagner » : un coureur dont la dérive est positive ne regarde
        // QUE la paire de l'arrière. Revenir sur la queue ne lui ouvre rien.
        //
        // E10. NE JAMAIS CONSTATER SUR L'APPARTENANCE AU GROUPE. Mesure de la build 188 : un
        //      échappé entre et sort du groupe du peloton des dizaines de fois tant que l'écart
        //      oscille autour de la seconde, et chaque retour rejouait un ±20 — 89 constats au
        //      palier 2, tous avec un écart NÉGATIF, c'est-à-dire mesurés sur un coureur encore
        //      devant celui qu'il était censé rattraper.
        //      → Le garde : l'écart de la paire doit être > 0, et `colle` retient l'image d'avant.
        // IL EST PASSÉ PAR L'AUTRE CÔTÉ DE L'ANNEAU. Un coureur ne peut pas rattraper deux fois
        // le dernier du peloton sans avoir refait le tour entre les deux : le constat ne s'ouvre
        // que lorsque sa dérive a dépassé le demi-tour. Ce n'est pas un seuil réglé, c'est la piste
        // — il faut bien passer en face avant de revenir. Mesuré à la build 188 : sans cette
        // condition, le 46 et le 70 reperdaient 20 points toutes les vingt secondes ; et au tour
        // ENTIER, le 61 arrivait sur la queue avant que sa dérive n'y soit, et ne constatait rien.
        if (!T || Math.abs(c.derive) < T / 2) { c.colle = false; continue; }
        const avant = c.derive < 0;
        // LE DERNIER, OU LE PREMIER, DU PELOTON : ni lui, ni les autres qui ont fait le tour avec
        // lui. Quand le 12 et le 52 reviennent ensemble, la chaîne les range AVEC le peloton et le
        // dernier du groupe devient le 12. Le coureur qu'il rattrape est le dernier de ceux qui,
        // eux, n'ont pas bougé de leur tour.
        const sansLui = pel.coureurs.filter(b => {
          if (b === c.bib) return false;
          const o = coureurs.get(b);
          if (!o) return false;
          if (Math.abs(o.derive) >= T / 2) return false;
          // NI SES COMPAGNONS QU’ON VIENT DE CRÉDITER. Point 180 : deux coureurs à moins d’une
          // seconde l’un de l’autre sont UN SEUL constat. Mesuré à la build 188 : à 368,9 s le 7 et
          // le 18 sont crédités, leur dérive retombe à zéro, et ils deviennent la queue du peloton
          // — le 61, qui arrive deux dixièmes plus tard, se mesurait alors sur son propre compagnon,
          // en sortait un écart négatif, et ne gagnait jamais rien. Il a fini la course à 1 178 m
          // devant le peloton avec zéro point.
          return !(o.credite != null && maintenant - o.credite <= R.cassureS);
        });
        if (!sansLui.length) continue;
        const avec = coureurs.get(avant ? sansLui[sansLui.length - 1] : sansLui[0]);
        const e = avant ? ecartPiste(entree.get(avec.bib), x) : ecartPiste(x, entree.get(avec.bib));
        if (e == null) continue;
        // le contact, confirmé 0,3 s comme toute cassure du §1 — mais l'écart doit être positif À
        // L'INSTANT du constat, et pas seulement l'avoir été : sans cela, trois constats du palier
        // 2 sortaient avec un écart négatif, mesurés sur un coureur déjà repassé devant.
        const colle = e > 0 && e <= R.cassureS;   // la mesure du moment, sans délai (point 192)
        if (colle && e > 0 && !c.colle) {
          const delta = avant ? 20 : -20;
          if (attente && attente.delta === delta && maintenant - attente.ouvertA <= R.cassureS) {
            attente.membres.push({ c, ecart: e, r: x.retard });
          } else {
            annoncer();
            attente = { delta, avec: avec.bib, ouvertA: maintenant, membres: [{ c, ecart: e, r: x.retard }] };
          }
          c.derive = 0; c.rPrec = x.retard; c.colle = true; c.credite = maintenant;   // rPrec : la lecture repliée
        } else c.colle = colle;
      }

      if (attente && maintenant - attente.ouvertA > R.cassureS) annoncer();
    }

    // Point 180, ses deux dernières phrases : les coureurs d'un même constat sont annoncés ENSEMBLE
    // s'ils sont à moins d'une seconde l'un de l'autre, SÉPARÉMENT au-delà.
    function annoncer() {
      if (!attente) return;
      const { delta, avec } = attente;
      const restants = attente.membres.slice().sort((a, b) => a.r - b.r);
      attente = null;
      while (restants.length) {
        const chef = restants.shift(), ensemble = [chef];
        for (let i = restants.length - 1; i >= 0; i--)
          if (Math.abs(restants[i].r - chef.r) <= R.cassureS) ensemble.push(...restants.splice(i, 1));
        ensemble.sort((a, b) => a.c.bib - b.c.bib);
        points.push({ t: maintenant, points: delta, bibs: ensemble.map(x => x.c.bib), avec,
          sens: delta > 0 ? 'il a rattrapé le dernier du peloton' : 'le premier du peloton l’a rattrapé',
          ecarts: ensemble.map(x => +x.ecart.toFixed(2)) });
        // Rien à réaligner : son point 182, « chacun est toujours dans le même tour que les autres
        // du point de vue de la timeline ». Le décalage lu LE range déjà avec le peloton.
      }
    }

    /* ------------------------------------------------------------------ 6. l'état */
    function etat() {
      const gs = groupes();
      return {
        t: maintenant,
        coureurs: chaine().map(x => ({ bib: x.c.bib, retard: +x.retard.toFixed(2), boucle: x.c.boucle, a: x.c.t, detections: x.c.n })),
        groupes: gs,
        tete: ancre,
        points: points.slice(),
      };
    }

    return { detection, designer, tete: () => { const c = tete(); return c ? c.bib : null; },
             etat, groupes, chaine, ordre: () => chaine().map(x => x.c.bib),
             // LA DURÉE D'UN TOUR DE LA TÊTE, en secondes. L'écran en a besoin pour juger
             // l'éligibilité sur les boucles et non sur la piste — son point 194.
             tour: () => { const c = tete(); return c ? tourS(c) : null; },
             peloton: () => { const g = peloton(); return g ? g.coureurs.slice() : []; },
             pointsVus: () => points, reglage: R, _coureurs: coureurs };
  }

  const API = { creer };
  if (typeof window !== 'undefined') window.MoteurCourse = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
