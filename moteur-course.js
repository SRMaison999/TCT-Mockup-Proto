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

   E8. Ne jamais constater un ±20 sur un seul écart, ni sur un coureur du mauvais groupe.
       Ses mots, point 174 : un coureur « qui s'échappe à l'avant » et revient gagne 20 points ; un
       coureur « se faisant lâcher à l'arrière » et repris en perd 20. Et son point 181 : « Rien :
       ils sont lâchés d'un tour, revenir au contact de la queue du peloton ne leur fait rien
       gagner. » Sur un anneau, les deux gestes se ressemblent.
       → Le garde, son point 242 : DEUX écarts, contre deux coureurs nommés — celui qu'il referme
         sur le dernier du peloton, et celui que le premier du peloton referme sur lui. Et le
         groupe tranche : le tour gagné n'est proposé qu'au groupe de tête, le tour perdu qu'au
         groupe de queue. Rien n'est gardé d'une image à l'autre (E17).
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
    });

    /* ------------------------------------------------------------------ 1. une détection */
    // UN COUREUR N'EXISTE POUR LE MOTEUR QU'À PARTIR DE SON PREMIER PASSAGE SUR LA LIGNE.
    // Son point 239 : « Le lap 1 débute après le passage de la boucle Finish après le start », et
    // son point 240 : « le simulateur doit les produire, mais le moteur doit les ignorer ».
    // La grille est collée à la ligne et déborde en amont ; la boucle Pursuit A est à 10 m de la
    // ligne. Au coup de pistolet, les coureurs placés derrière −10 m roulent donc dessus, et la
    // boucle les lit vraiment. Mais ces lectures sont d'AVANT la course : elles diraient que ces
    // coureurs sont presque un tour devant ceux qui n'ont pas encore été lus, et c'est elles qui
    // auraient désigné la tête, puisque l'ancre est le premier coureur détecté (E9).
    // Ce n'est pas un seuil : c'est la ligne de départ, qu'aucun coureur ne franchit deux fois.
    function detection(d) {
      if (!RANG.has(d.boucle)) return { refus: 'boucle inconnue', boucle: d.boucle };
      let c = coureurs.get(d.bib);
      if (!c) {
        if (d.boucle !== R.arrivee) return { refus: 'pas encore passé la ligne de départ', bib: d.bib, boucle: d.boucle };
        c = neuf(d.bib); coureurs.set(d.bib, c);
      }
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
    // LA BOUCLE LUE EST CELLE OÙ LA TÊTE EST PASSÉE LE PLUS RÉCEMMENT, et elle le reste. Essayé le
    // 18 novembre 2026 : la choisir sur la plus fraîche des DEUX lectures, pour qu'aucune n'ait plus
    // d'un tiers de tour d'âge, a fait passer les inversions entre coureurs à roue de 2,81 % à 3,12 %.
    // L'idée était de moi, la mesure l'a refusée, elle est partie (mesures.md §88).
    function decalageS(ref, c) {
      let tref = -Infinity, tc = null;
      for (const b of BOUCLES) {
        const a = ref.parBoucle.get(b), x = c.parBoucle.get(b);
        if (a == null || x == null) continue;
        if (a > tref) { tref = a; tc = x; }
      }
      if (tc == null) return null;
      let d = tc - tref;
      const T = tourS(ref) || tourS(c);
      if (T) { while (d > T / 2) d -= T; while (d <= -T / 2) d += T; }
      return d;
    }

    // LA CHAÎNE. On part de la tête et on descend la piste, et on rencontre chaque coureur une fois
    // avant de revenir sur la tête : c'est l'ANNEAU, la lecture des boucles ramenée entre zéro et un
    // tour. Un coureur dont on ne peut pas lire le décalage n'entre pas dans la chaîne (E5).
    //
    // E13. NE JAMAIS RANGER LA TIMELINE SUR LA DÉRIVE. La timeline se rangeait sur `place` — la lecture
    //      des boucles à laquelle on ajoutait les tours entiers comptés sur la dérive de chaque coureur.
    //      Or la dérive est propre à un coureur : un tour ajouté à l'un et pas à son voisin écartait les
    //      deux de 13,44 s d'un coup. Mesuré à la build 238, sur la course aux deux échappés et deux
    //      lâchés : la timeline montrait le 22 au-dessus du 3 alors que le 3 était 2,247 s DEVANT le 22,
    //      les deux dans le même tour, et elle l'a montré ainsi 44 secondes d'affilée. Sur les 229 027
    //      fois où deux coureurs du même tour se sont suivis dans la timeline, 6 161 étaient à l'envers,
    //      et 3 355 cassures sortaient sur un écart qui n'existait pas. L'opérateur : « ok c'est
    //      clairement le moteur qui est complètement faux ! »
    //      → Le garde : l'ordre et l'écart de deux coureurs qui se suivent viennent de `anneau`, la
    //        lecture seule. Et le ±20 ne se lit plus sur une dérive accumulée, mais sur deux écarts
    //        du moment contre deux coureurs nommés (E14, E17).
    //
    // DEUX QUANTITÉS, DEUX USAGES. `retard` est la lecture repliée sur un demi-tour ; elle ne sert plus
    // qu'aux journaux. `anneau` est la même lecture ramenée entre zéro et un tour depuis la tête : elle
    // range la timeline, elle mesure l'écart de deux coureurs qui se suivent, et elle mesure les deux
    // paires des ±20.
    function chaine() {
      const t0 = tete();
      if (!t0) return [];
      const T = tourS(t0);
      const liste = [{ c: t0, retard: 0, anneau: 0 }];
      for (const c of coureurs.values()) {
        if (c === t0 || c.n === 0) continue;
        const d = decalageS(t0, c);
        if (d == null) continue;
        const Tc = T || tourS(c);
        liste.push({ c, retard: d, anneau: Tc ? ((d % Tc) + Tc) % Tc : d });
      }
      liste.sort((a, b) => (a.anneau - b.anneau) || (a.c.bib - b.c.bib));
      return liste;
    }

    // L'ÉCART ENTRE DEUX COUREURS QUI SE SUIVENT, son §1 : « le temps entre la roue arrière du
    // coureur 1 et la roue avant du coureur 2 ». La différence de leurs décalages, moins le temps
    // qu'il faut au suiveur pour couvrir une longueur de vélo, à sa vitesse.
    // Il se lit sur l'anneau : c'est lui qui range la timeline, donc c'est lui qui dit l'écart de
    // deux coureurs qui s'y suivent.
    function ecartAnneau(devant, suiveur) {
      if (devant == null || suiveur == null) return null;
      const z = suiveur.anneau - devant.anneau;
      const v = vitesse(suiveur.c);
      return v ? z - R.veloM / v : z;
    }

    // L'ÉCART DE DEUX COUREURS NOMMÉS, LU ENTRE EUX DEUX ET SUR PERSONNE D'AUTRE. Pour les ±20, la
    // paire n'est pas deux voisins de la timeline : c'est un coureur et le dernier — ou le premier —
    // du peloton, qui peuvent être n'importe où l'un par rapport à l'autre. L'anneau ne sert à rien
    // ici, parce qu'il est coupé sur le coureur de tête : celui-là y vaut zéro pour toujours, et ne
    // pourrait donc JAMAIS revenir sur la queue du peloton. Mesuré le 18 novembre 2026 : avec
    // l'anneau, la course de 24 coureurs sortait ZÉRO constat, les deux échappés étant précisément
    // le coureur de tête et son compagnon.
    // On lit donc directement les deux heures de passage sur une boucle que les deux ont franchie.
    function ecartPaire(devant, suiveur) {
      if (!devant || !suiveur) return null;
      const z = decalageS(devant, suiveur);      // positif : le suiveur est derrière
      if (z == null) return null;
      const v = vitesse(suiveur);
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
          ec = ecartAnneau(devant, x);
          coupe = ec == null ? false : ec > R.cassureS;
        }
        if (coupe || !g) { g = { coureurs: [], ecartS: devant ? ec : null }; gs.push(g); }
        g.coureurs.push(x.c.bib);
      }
      // LA CHAÎNE EST UN ANNEAU : ON LA REFERME. La timeline est une liste, donc il faut bien la
      // couper quelque part, et on la coupe sur le coureur de tête. Mais la piste n'a pas de bout :
      // quand le dernier de la liste roule à moins d'une seconde du premier, les deux sont DANS LE
      // MÊME GROUPE, et la coupure de la liste ne doit pas les séparer.
      //
      // E16. NE JAMAIS LAISSER LA COUPURE DE LA LISTE CASSER UN GROUPE. Cela arrive dès que des
      //      coureurs prennent un tour : le peloton et eux occupent alors tout le tour, et la
      //      coupure tombe forcément dedans. Mesuré à la build 243, à 264,2 s, sur la course de
      //      24 coureurs : le BIB 19 roulait à 0,70 s du BIB 1 et la liste les mettait aux deux
      //      bouts ; le peloton sortait en deux morceaux, `1,20,2` d'un côté et `3…19` de l'autre,
      //      et le 20 se retrouvait « sorti du peloton » sans avoir rien fait.
      //      L'opérateur : « Mais le peloton c'est toujours le peloton ! »
      if (gs.length > 1) {
        const prem = ch[0], der = ch[ch.length - 1], T = tourS(prem.c) || tourS(der.c);
        if (T) {
          const v = vitesse(prem.c);
          let z = T - der.anneau + prem.anneau;          // le pas qui referme l'anneau
          if (v) z -= R.veloM / v;
          if (z <= R.cassureS) {
            const queue = gs.pop();
            gs[0].coureurs = queue.coureurs.concat(gs[0].coureurs);
            gs[0].ecartS = null;
          }
        }
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
    // LE RATTRAPAGE SE LIT SUR UN ÉCART QUI SE REFERME. Ses mots, 19 novembre 2026 :
    //   « * Si un coureur qui se trouvait il y a quelques secondes encore à disons 3 secondes
    //       derrière le dernier coureur du peloton, et que maintenant il se retrouve tout proche de
    //       lui, à moins d'une seconde > il a rattrapé le peloton
    //     * Si un coureur qui se trouvait il y a quelques secondes encore à disons 3 secondes devant
    //       le premier coureur du peloton, et que maintenant il se retrouve tout proche de lui, à
    //       moins d'une seconde > il s'est fait rattraper par le peloton
    //     * Le groupe qui peut être crédité d'un tour gagné ne peut être QUE le groupe LEADER, ou
    //       LEADERS !
    //     * Le groupe qui peut être sanctionné d'un tour perdu ne peut être QUE le groupe LAST »
    //
    // Donc deux écarts, contre deux coureurs nommés, et rien d'autre :
    //   l'écart au DERNIER du peloton, qu'il referme en venant de derrière → il a rattrapé → +20 ;
    //   l'écart au PREMIER du peloton, qui le referme en venant de derrière → il est rattrapé → −20.
    // Et deux gardes, qui sont ses deux derniers points : le +20 n'est proposé qu'au groupe de tête,
    // le −20 qu'au groupe de queue.
    //
    // E14. NE JAMAIS RECALCULER LE CÔTÉ EN PERMANENCE. Jusqu'à la build 242, le côté était déduit
    //      d'une dérive accumulée image après image contre l'ANCRE — le coureur en tête de la
    //      timeline. Quand c'est lui qui s'échappe, tout le peloton dérive de lui et se lit comme
    //      lâché : mesuré sur une course de 24 coureurs dont deux s'échappent au tour 5 et deux
    //      sont lâchés au tour 12, cela donnait NEUF constats, tous des pertes de 20 points, pas
    //      un seul gain — dix-neuf coureurs du peloton pénalisés à 182,1 s alors qu'ils étaient à
    //      sept secondes du premier, et le BIB 4 nommé comme rattrapant les coureurs dont il
    //      faisait partie (mesures.md §93). L'opérateur : « toutes ces complications, qui me
    //      semblent totalement inutiles et visiblement non fonctionnelles ».
    //
    // E15. LE NOMBRE DE PASSAGES D'UN COUREUR NE DIT RIEN À LUI SEUL. Essayé le 18 novembre 2026 :
    //      lire le tour gagné sur la différence des passages. Ses mots : « Un coureur qui cherche à
    //      gagner un tour sur le peloton, peut tout-à-fait avoir fait moins de tours que le
    //      peloton, il peut déjà avoir perdu deux tours précédemment. » L'essai est mort là.
    //
    // E17. NE RIEN RETENIR DU RATTRAPAGE PRÉCÉDENT, ET NE RIEN DÉDUIRE D'UN FAIT PASSÉ. Jusqu'à la
    //      build 244, le côté par lequel un coureur sortait du peloton était noté à la séparation et
    //      gardé avec lui (`sorti`, `etaitDedans`). C'était à moi, et c'était faux : à 364,6 s, une
    //      seconde après que le peloton a repris un tour au BIB 23, la lecture des boucles le donnait
    //      « 1,05 s devant le premier du peloton » alors qu'il était 13,03 s derrière lui — un tour
    //      entier. Le décalage lu est ramené à plus ou moins un demi-tour : il ne peut PAS distinguer
    //      « un tour derrière le peloton » de « une seconde devant le peloton ». Le côté noté était
    //      « avant », et le tour perdu à 363,4 s lui était rendu à 437,0 s (mesures.md §97). Ses mots
    //      sur mes explications de ce jour-là : « ARRETE DE DIRE N'IMPORTE QUOI ».
    //      → Le garde : plus aucun côté gardé. Deux écarts lus au moment présent contre deux coureurs
    //        nommés, et le groupe du coureur décide lequel des deux constats est possible.
    //
    // E18. NE JAMAIS CHERCHER LE GROUPE DE TÊTE NI LE GROUPE DE QUEUE SUR L'ANNEAU. L'anneau range
    //      les coureurs sur un tour, et sur un tour un groupe lâché d'un tour se lit juste DEVANT le
    //      peloton. Mesuré à la build 245 : à 360 s, la timeline montre « 1.2 | 3…22 | 23.24 » — les
    //      BIB 23 et 24 en queue de course, c'est juste — et l'anneau montre « 1.2 | 23.24 | 3…22 »,
    //      les mêmes coureurs au milieu. En lisant l'anneau, le groupe de queue était le peloton
    //      lui-même : le tour perdu des 23 et 24 à 363,4 s ne sortait plus du tout, et les deux tours
    //      gagnés des BIB 1 et 2 tombaient à un seul.
    //      → Le garde : l'écran pose les deux rangs à chaque image par `rangs()`. La timeline a juste
    //        parce qu'elle sait les tours que l'opérateur a validés ; l'anneau ne peut pas les
    //        connaître. C'est le même partage qu'en E9 pour la tête.

    // CE QUI EST EN ATTENTE D'ÊTRE ANNONCÉ. Le constat porte sur TOUT le groupe (son point 241), et
    // les coureurs d'un même constat sont annoncés ensemble s'ils ne sont pas éloignés de plus d'une
    // seconde, séparément au-delà (son point 180).
    let attente = null;

    // LES BLOCS QUE LA TIMELINE MONTRE, dans son ordre, et lequel d'entre eux est le peloton. Posés
    // à chaque image par l'écran, jamais calculés ici (E18). Tant que l'écran n'a rien dit, aucun
    // ±20 ne sort.
    let blocs = null, iPeloton = -1;

    // UN COUREUR RATTRAPÉ EST DANS LE GROUPE, ET C'EST FINI. Ses mots, 19 novembre 2026 : « Il
    // n'était avant pas dans le groupe, maintenant il est dans le groupe parce qu'il s'est fait
    // rattraper. Hop, il est dans le groupe, c'est fini. » Donc plus aucun constat sur lui jusqu'à ce
    // que la timeline le montre DANS le bloc du peloton — c'est-à-dire jusqu'à ce qu'elle ait fini de
    // le remettre avec les autres.
    //   Ce n'est pas l'écart qui lève le verrou. Mesuré à la build 245 : l'écart lu entre le BIB 1 et
    // le dernier du peloton descend régulièrement de 1,19 s à zéro entre 240 s et 256 s — il ne
    // repasse jamais au-dessus de la seconde — et pourtant le constat sortait trois fois, à 240,1 s,
    // 246,2 s et 252,8 s. La raison : le dernier du peloton CHANGE DE COUREUR quand l'ordre du
    // peloton bouge, et l'écart saute d'un coureur à l'autre. Un verrou posé sur l'écart ne tient pas ;
    // posé sur les coureurs, il tient.
    const rattrapes = new Set();

    // L'ENTRÉE D'UN COUREUR DANS LA CHAÎNE, pour ranger les coureurs d'un même constat.
    let chaineVue = null, chaineA = null;
    function entreeDe(bib) {
      if (chaineA !== maintenant) { chaineA = maintenant; chaineVue = new Map(chaine().map(x => [x.c.bib, x])); }
      return chaineVue.get(bib);
    }

    function examiner() {
      // LES BLOCS QUE LA TIMELINE MONTRE, dans son ordre, et lequel est le peloton. Le moteur ne les
      // cherche pas : sur l'anneau, un groupe lâché d'un tour se lit juste DEVANT le peloton (E18).
      if (!blocs || blocs.length < 2 || iPeloton < 0 || iPeloton >= blocs.length) return;
      const pel = blocs[iPeloton];
      if (pel.length < 2) return;
      const premierPel = coureurs.get(pel[0]);                 // le premier du peloton
      const dernierPel = coureurs.get(pel[pel.length - 1]);    // le dernier du peloton
      if (!premierPel || !dernierPel) return;
      // LA TIMELINE L'A REMIS DANS LE PELOTON : son rattrapage est consommé, il peut en vivre un autre.
      for (const b of pel) rattrapes.delete(b);

      // DEUX CONSTATS, UN PAR BOUT DE LA COURSE, ET CHACUN PORTE SUR TOUT LE GROUPE. Son point 241 :
      // « Le tour gagné est une histoire de GROUPES, pas de coureurs. »
      //   LE GROUPE DE TÊTE referme son écart sur le DERNIER du peloton → tour gagné.
      //   LE PREMIER du peloton referme son écart sur le GROUPE DE QUEUE → tour perdu.
      const essais = [];
      if (iPeloton !== 0) {
        const g = blocs[0], c = coureurs.get(g[0]);            // celui du groupe de tête le plus proche
        if (c) essais.push({ cle: 'tete', g, delta: 20, avec: dernierPel.bib, e: ecartPaire(dernierPel, c) });
      }
      if (iPeloton !== blocs.length - 1) {
        const g = blocs[blocs.length - 1], c = coureurs.get(g[g.length - 1]);   // le dernier de la course
        if (c) essais.push({ cle: 'queue', g, delta: -20, avec: premierPel.bib, e: ecartPaire(c, premierPel) });
      }

      for (const essai of essais) {
        const { g, delta, avec, e } = essai;
        // C'EST L'ÉCART QUI SE REFERME SOUS LA SECONDE, ses deux premiers points : « il y a quelques
        // secondes encore à disons 3 secondes […], et maintenant à moins d'une seconde ».
        if (e == null || e <= 0 || e > R.cassureS) continue;
        const membres = g.filter(b => !rattrapes.has(b)).map(b => coureurs.get(b)).filter(Boolean)
          .map(c => ({ c, ecart: e, r: (entreeDe(c.bib) || { anneau: 0 }).anneau }));
        if (!membres.length) continue;
        attente = { delta, avec, ouvertA: maintenant, membres };
        annoncer();
        for (const m of membres) rattrapes.add(m.c.bib);
      }
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
             // LA TIMELINE DIT QUI EST EN TÊTE ET QUI EST EN QUEUE DE COURSE. Son point 242 : seul
             // le groupe de tête peut gagner un tour, seul le groupe de queue peut en perdre un. Le
             // moteur ne peut pas le lire sur l'anneau (E18), l'écran le lui pose à chaque image.
             rangs: (bl, ip) => { blocs = bl || null; iPeloton = ip == null ? -1 : ip; },
             pointsVus: () => points, reglage: R, _coureurs: coureurs };
  }

  const API = { creer };
  if (typeof window !== 'undefined') window.MoteurCourse = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
