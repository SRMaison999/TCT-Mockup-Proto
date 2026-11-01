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

   E4. Ne jamais décider sur un instantané.
       Sa règle du §1 : une cassure se confirme sur 0,3 s avant de compter.
       → Le garde : `confirme()`, et rien ne change de statut sans passer par elle.

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
       → Le garde : `sorti` retient, pour chaque coureur hors du peloton, par où il est sorti.
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
      confirmationS: 0.3,    // §1 : le temps qu'une cassure doit tenir avant de compter
    }, reglage || {});

    const BOUCLES = [...R.boucles].sort((a, b) => a - b);
    const RANG = new Map(BOUCLES.map((b, i) => [b, i]));

    const coureurs = new Map();
    const cassures = new Map();
    const points = [];        // les ±20 constatés, dans l'ordre
    let pelotonAvant = null;
    let maintenant = 0;

    const neuf = bib => ({
      bib,
      n: 0,                   // combien de détections : rien d'autre ne dit qu'il est en course
      boucle: null, t: null,  // sa dernière détection
      pas: null, dt: null,    // de combien de mètres et en combien de temps il est venu : sa vitesse
      passages: 0,            // ses passages sur la ligne d'arrivée, moins ce qu'on a aligné. Ce
      aligne: 0,              //   n'est pas un tour (E3) : c'est le repère de l'anneau.
      parBoucle: new Map(),   // position de boucle → heure de son dernier passage dessus
      sorti: null,            // 'avant' ou 'arriere' : par où il a quitté le peloton (E8)
      dansPeloton: false,
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
    const anneau = c => c.passages - c.aligne;      // où il en est sur l'anneau, pas sa distance

    /* ------------------------------------------------------------------ 2. l'écart entre deux coureurs */
    // §1 : « le temps entre la roue arrière du coureur 1 et la roue avant du coureur 2 ». z est lu
    // sur la dernière boucle que les DEUX ont franchie, le suiveur après celui de devant ; on en
    // retire le temps qu'il faut au suiveur pour couvrir une longueur de vélo, à sa vitesse.
    function ecartS(devant, suiveur) {
      let z = null, dernier = -Infinity;
      for (const b of BOUCLES) {
        const ta = devant.parBoucle.get(b), tb = suiveur.parBoucle.get(b);
        if (ta == null || tb == null || tb < ta || tb <= dernier) continue;
        dernier = tb; z = tb - ta;
      }
      if (z == null) return null;                   // aucune boucle commune : on ne sait pas
      const v = vitesse(suiveur);
      return v ? z - R.veloM / v : z;
    }

    /* ------------------------------------------------------------------ 3. confirmer une cassure */
    function confirme(cle, depasse) {
      let e = cassures.get(cle);
      if (!e) { e = { etat: false, depuis: null }; cassures.set(cle, e); }
      if (depasse === e.etat) { e.depuis = null; return e.etat; }
      if (e.depuis == null) e.depuis = maintenant;
      if (maintenant - e.depuis >= R.confirmationS) { e.etat = depasse; e.depuis = null; }
      return e.etat;
    }

    /* ------------------------------------------------------------------ 4. la chaîne */
    // LA TÊTE. Sur un anneau, « devant » n'a de sens qu'à partir d'un coureur. C'est celui qui a
    // franchi la ligne le plus de fois ; à égalité, celui qui est le plus loin dans le tour — la
    // boucle la plus avancée —, et à boucle égale celui qui l'a franchie le premier : « le premier
    // qui passe est le premier » (point 174).
    function tete() {
      let t = null;
      for (const c of coureurs.values()) {
        if (c.n === 0) continue;
        if (!t) { t = c; continue; }
        const a = anneau(c) - anneau(t);
        if (a > 0 || (a === 0 && (RANG.get(c.boucle) > RANG.get(t.boucle)
          || (c.boucle === t.boucle && c.t < t.t)))) t = c;
      }
      return t;
    }

    // LA CHAÎNE. Chaque coureur porte son retard sur la tête, en secondes lues. Un coureur dont on
    // ne peut pas lire l'écart n'entre pas dans la chaîne (E5).
    function chaine() {
      const t0 = tete();
      if (!t0) return [];
      const liste = [{ c: t0, retard: 0 }];
      for (const c of coureurs.values()) {
        if (c === t0 || c.n === 0) continue;
        const e = ecartS(t0, c);
        if (e != null) liste.push({ c, retard: e });
      }
      liste.sort((a, b) => (a.retard - b.retard) || (a.c.bib - b.c.bib));
      return liste;
    }

    /* ------------------------------------------------------------------ 5. les groupes */
    // On descend la chaîne : entre deux coureurs qui se suivent, une cassure confirmée ouvre un
    // groupe. C'est le §3, et la règle qu'il a instaurée au point 174.
    function groupes() {
      const ch = chaine(), gs = [];
      let g = null;
      for (let i = 0; i < ch.length; i++) {
        const x = ch[i], devant = i ? ch[i - 1] : null;
        let coupe = !g, ec = null;
        if (devant) {
          ec = ecartS(devant.c, x.c);
          coupe = ec == null ? false : confirme(x.c.bib + '|' + devant.c.bib, ec > R.cassureS);
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

    /* ------------------------------------------------------------------ 6. les 20 points */
    function examiner() {
      const gs = groupes(), pel = peloton(gs);
      if (!pel || pel.coureurs.length < 2) return;
      const dedans = new Set(pel.coureurs);
      const tetePel = coureurs.get(pel.coureurs[0]);
      const queuePel = coureurs.get(pel.coureurs[pel.coureurs.length - 1]);
      const retardDe = new Map(chaine().map(x => [x.c.bib, x.retard]));
      const retardTete = retardDe.get(tetePel.bib);

      const gagnent = [], perdent = [];

      for (const c of coureurs.values()) {
        if (c.n === 0) continue;
        const est = dedans.has(c.bib);

        // IL SORT DU PELOTON : on retient par où (E8). Devant la tête du peloton, c'est par
        // l'avant ; sinon, c'est par l'arrière.
        if (!est && c.dansPeloton) {
          const r = retardDe.get(c.bib);
          c.sorti = (r != null && retardTete != null && r < retardTete) ? 'avant' : 'arriere';
        }

        // IL REVIENT DANS LE PELOTON. Point 180 : le gain se constate « au moment un coureur
        // rattrape le dernier coureur du peloton », la perte « au moment un coureur se fait
        // rattraper par le premier coureur du peloton ». Le côté par lequel il est sorti dit
        // lequel des deux c'est — et un coureur qu'on n'a jamais vu sortir ne constate rien.
        if (est && !c.dansPeloton && c.sorti) {
          const avant = c.sorti === 'avant';
          const e = avant ? ecartS(queuePel, c) : ecartS(c, tetePel);
          (avant ? gagnent : perdent).push({ c, avec: avant ? queuePel.bib : tetePel.bib, ecart: e });
          c.sorti = null;
        }

        c.dansPeloton = est;
      }

      // Point 180, ses deux dernières phrases : les coureurs d'un même constat sont annoncés
      // ENSEMBLE s'ils sont à moins d'une seconde l'un de l'autre, SÉPARÉMENT au-delà.
      const annoncer = (liste, delta) => {
        const restants = [...liste].sort((a, b) => (retardDe.get(a.c.bib) || 0) - (retardDe.get(b.c.bib) || 0));
        while (restants.length) {
          const chef = restants.shift(), ensemble = [chef];
          for (let i = restants.length - 1; i >= 0; i--) {
            const e = ecartS(chef.c, restants[i].c), f = ecartS(restants[i].c, chef.c);
            const ec = e != null ? e : f;
            if (ec != null && Math.abs(ec) <= R.cassureS) ensemble.push(...restants.splice(i, 1));
          }
          ensemble.sort((a, b) => a.c.bib - b.c.bib);
          points.push({ t: maintenant, points: delta, bibs: ensemble.map(x => x.c.bib), avec: chef.avec,
            sens: delta > 0 ? 'il a rattrapé le dernier du peloton' : 'le premier du peloton l’a rattrapé',
            ecarts: ensemble.map(x => x.ecart == null ? null : +x.ecart.toFixed(2)) });
          // « ils sont considérés avoir parcouru la même distance que leurs adversaires » (point
          // 174) : on remet son repère d'anneau sur celui du peloton, pour que la chaîne le range
          // avec lui. Ce n'est pas un tour retranché, c'est un repère qui redevient commun.
          for (const x of ensemble) x.c.aligne += anneau(x.c) - anneau(tetePel);
        }
      };
      if (gagnent.length) annoncer(gagnent, 20);
      if (perdent.length) annoncer(perdent, -20);
    }

    /* ------------------------------------------------------------------ 7. l'état */
    function etat() {
      const gs = groupes();
      return {
        t: maintenant,
        coureurs: chaine().map(x => ({ bib: x.c.bib, retard: +x.retard.toFixed(2), boucle: x.c.boucle, a: x.c.t, detections: x.c.n })),
        groupes: gs,
        tete: gs.length && gs[0].coureurs.length ? gs[0].coureurs[0] : null,
        points: points.slice(),
      };
    }

    return { detection, etat, groupes, chaine, ordre: () => chaine().map(x => x.c.bib),
             peloton: () => { const g = peloton(); return g ? g.coureurs.slice() : []; },
             pointsVus: () => points, reglage: R, _coureurs: coureurs };
  }

  const API = { creer };
  if (typeof window !== 'undefined') window.MoteurCourse = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
