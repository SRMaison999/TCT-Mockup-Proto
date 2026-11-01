/* ===========================================================================
   LE MOTEUR DE COURSE — reconstruit le 1er novembre 2026.

   L'opérateur, ce jour-là : « Ce serait pas plus simple de reconstruire cet algorithme depuis
   le début, avec les erreurs que nous savons qu'il ne faut pas commettre....? »

   Elle répond à trois questions, et à rien d'autre :
     1. qui est devant qui ;
     2. qui roule avec qui — les groupes, et la cassure d'une seconde ;
     3. qui a pris ou perdu un tour.

   IL NE LIT QUE LES DÉTECTIONS DES BOUCLES. Un dossard, une boucle, une heure. Rien d'autre
   n'entre. Sa règle, le 1er novembre 2026 : « La seule façon certaine de savoir l'ordre de
   passage des coureurs, c'est les détections des boucles. A chaque tour. 3 boucle par tour. »

   ---------------------------------------------------------------------------
   LES ERREURS À NE PAS REFAIRE. Chacune a été mesurée, et chacune a son garde ici.

   E1. Ne jamais tirer un ordre d'une position calculée entre deux détections.
       Entre deux boucles personne ne mesure rien. Mesuré : la tête changeait 67 fois sur une
       course, 65 fois pour 3 m ou moins, et à 539,4 s elle passait du 12 au 15 alors qu'aucune
       boucle n'avait rien détecté entre les deux instants.
       → Le garde : ce fichier n'a pas d'entrée pour une position. `detection()` est la seule.

   E2. Ne jamais mesurer entre deux coureurs qui ne se suivent pas.
       Un groupe est une chaîne : ses deux bouts peuvent être à 218 m l'un de l'autre. Mesuré :
       un tour pris proposé contre un coureur à 126,6 m, soit un demi-tour, arrondi en un tour.
       → Le garde : `voisinDevant()` ne rend que le coureur immédiatement devant dans l'ordre, et
         toute mesure de tours vérifie que ce qui reste après les tours entiers est petit.

   E3. Ne jamais ajouter ni retirer un tour pour faire tenir un affichage.
       Mesuré : 164 fois sur une course, un écart négatif se voyait ajouter un tour entier, d'où
       le saut de 18,3 s à l'écran.
       → Le garde : aucun tour n'est ajouté nulle part ici. Un écart qui sort négatif est rendu
         tel quel, avec les deux dossards, pour qu'on voie d'où il vient.

   E4. Ne jamais décider sur un instantané.
       Sa règle du §1 : une cassure se confirme sur 0,3 s avant de compter.
       → Le garde : `confirme()`, et rien ne change de statut sans passer par elle.

   E5. Un tour pris se paie en points, il ne se compte pas en distance.
       Son point 174 : « Chacun est toujours dans le même tour que les autres du point de vue de
       la timeline. » Un tour pris vaut 20 points, pas 250 m d'avance.
       → Le garde : `tours[bib]` est retranché de la distance dès que le coureur a rejoint, et
         cette valeur n'est relue qu'à une nouvelle détection du coureur.

   E6. Ne rien proposer que les boucles ne montrent pas.
       → Le garde : un coureur sans détection n'existe pas pour le moteur de course. Il n'est ni classé,
         ni groupé, ni proposé.

   E8. Ne jamais attribuer un tour au coureur rejoint.
       Sa règle du point 178 : « les tours se gagnent lorsqu'on rattrape le peloton, et se perdent
       lorsqu'on se fait rattraper par le peloton ». La paire de coureurs qui se suivent donne le
       NOMBRE de tours ; c'est le peloton qui dit à QUI ce nombre revient. Mesuré : le moteur de course
       écrivait « 15 IRL : −1 tour » là où c'étaient le 7, le 18 et le 61 qui en prenaient un.
       → Le garde : un tour n'est relevé que pour le coureur qui vient de REJOINDRE le peloton,
         et seulement contre un coureur qui y était déjà.

   E7. Ne jamais nommer une règle avec mes mots plutôt qu'avec les siens.
       Il a dû corriger « les deux coureurs qui se font face », qui était de moi et voulait dire
       autre chose. Ici on dit : **les deux coureurs qui se suivent**.

   ---------------------------------------------------------------------------
   CE QU'ELLE REND. `etat()` donne la liste des groupes dans l'ordre, et pour chacun l'écart en
   secondes au groupe au-dessus — mesuré entre la queue de celui du dessus et la tête de celui-ci
   (son point 167 : « l'écart se mesure entre le dernier du groupe des leaders et le premier du
   groupe du peloton »).
   =========================================================================== */
(function () {
  'use strict';

  function creer(reglage) {
    const R = Object.assign({
      piste: 250,            // la longueur d'un tour, en mètres
      boucles: [0],          // la position de chaque boucle sur la piste, en mètres, dans l'ordre
      arrivee: 0,            // laquelle de ces boucles est la ligne d'arrivée : c'est elle qui compte les tours
      cassureS: 1.0,         // §1 : au-delà d'une seconde entre roue arrière et roue avant, c'est une cassure
      veloM: 1.65,           // §1 : la longueur d'un vélo
      confirmationS: 0.3,    // §1 : le temps qu'une cassure doit tenir avant de compter
    }, reglage || {});

    const BOUCLES = [...R.boucles].sort((a, b) => a - b);
    const NB = BOUCLES.length;

    const coureurs = new Map();   // dossard → ce que les détections ont appris de lui
    const cassures = new Map();   // "suiveur|devant" → { etat, depuis }
    const tours = new Map();      // dossard → tours retranchés, relevés quand il a rejoint (E5)
    let maintenant = 0;

    const neuf = bib => ({
      bib,
      n: 0,                 // combien de détections : rien d'autre ne dit qu'il est en course
      tours0: 0,            // combien de fois il a franchi la ligne d'arrivée : son tour, en entier
      d: null,              // sa distance, comptée boucle après boucle (jamais devinée)
      t: null,              // l'heure de sa dernière détection
      dAvant: null, tAvant: null,
      parBoucle: new Map(), // position de boucle → heure de son dernier passage sur celle-ci
      rejoint: null,        // l'heure de la détection où le tour retranché a été relevé
      dansPeloton: false,   // était-il dans le peloton à la détection précédente ? (point 178)
    });

    /* ------------------------------------------------------------------ 1. une détection */
    // C'EST LA SEULE ENTRÉE DU MOTEUR DE COURSE (E1). boucle est une position en mètres sur la piste,
    // prise dans `reglage.boucles` ; t est l'heure de course du passage.
    function detection(d) {
      const boucle = d.boucle, t = d.t, bib = d.bib;
      if (BOUCLES.indexOf(boucle) < 0) return { refus: 'boucle inconnue', boucle };
      let c = coureurs.get(bib);
      if (!c) { c = neuf(bib); coureurs.set(bib, c); }
      // sa distance se COMPTE : du dernier point lu au point lu maintenant, en avançant sur la
      // piste. Deux passages sur la même boucle font un tour entier, jamais zéro.
      let avance;
      if (c.d == null) avance = 0;
      else { avance = ((boucle - c.boucle) + R.piste) % R.piste; if (avance === 0) avance = R.piste; }
      c.dAvant = c.d; c.tAvant = c.t;
      c.d = c.d == null ? boucle : c.d + avance;
      c.boucle = boucle; c.t = t; c.n++;
      c.parBoucle.set(boucle, t);
      // LE TOUR, C'EST LA LIGNE D'ARRIVÉE. On compte ses passages dessus : un entier, exact, qui ne
      // doit rien à un arrondi. C'est la seule façon de dire « il a un tour de plus » sans marge.
      if (boucle === R.arrivee) c.tours0 = (c.tours0 || 0) + 1;
      if (t > maintenant) maintenant = t;
      examiner();
      return { bib, distance: c.d, boucle, t, detections: c.n };
    }

    /* ------------------------------------------------------------------ 2. ce qu'on sait d'un coureur */
    // sa vitesse, telle que ses deux dernières détections la donnent. Sans deux détections, on ne
    // sait pas, et on le dit (null) : rien ici ne remplace une mesure manquante par une moyenne.
    const vitesse = c => (c.dAvant == null || c.t === c.tAvant) ? null : (c.d - c.dAvant) / (c.t - c.tAvant);

    // sa distance de course, le tour retranché compris (E5)
    const distance = c => c.d - R.piste * (tours.get(c.bib) || 0);

    // les coureurs que les boucles ont vus, dans l'ordre : distance décroissante, puis l'heure du
    // passage — le premier passé est le premier (son point 174).
    function ordre() {
      return [...coureurs.values()].filter(c => c.n > 0)
        .sort((a, b) => (distance(b) - distance(a)) || (a.t - b.t) || (a.bib - b.bib));
    }

    /* ------------------------------------------------------------------ 3. l'écart entre deux coureurs */
    // §1, dans ses mots : « le temps entre la roue arrière du coureur 1 et la roue avant du
    // coureur 2 ». z est lu sur la dernière boucle que les DEUX ont franchie, le suiveur après
    // celui de devant ; on en retire le temps qu'il faut au suiveur pour couvrir une longueur de
    // vélo, à sa vitesse. Jamais de mètres, jamais de repli sur une position calculée (E1).
    function ecartS(devant, suiveur) {
      let z = null, dernier = -Infinity;
      for (const b of BOUCLES) {
        const ta = devant.parBoucle.get(b), tb = suiveur.parBoucle.get(b);
        if (ta == null || tb == null || tb < ta || tb <= dernier) continue;
        dernier = tb; z = tb - ta;
      }
      if (z == null) return null;                       // aucune boucle commune : on ne sait pas
      const v = vitesse(suiveur);
      return v ? z - R.veloM / v : z;
    }

    /* ------------------------------------------------------------------ 4. la cassure, confirmée */
    // E4 : un dépassement du seuil ne compte qu'une fois qu'il a tenu `confirmationS`.
    function confirme(cle, depasse) {
      let e = cassures.get(cle);
      if (!e) { e = { etat: false, depuis: null }; cassures.set(cle, e); }
      if (depasse === e.etat) { e.depuis = null; return e.etat; }
      if (e.depuis == null) e.depuis = maintenant;
      if (maintenant - e.depuis >= R.confirmationS) { e.etat = depasse; e.depuis = null; }
      return e.etat;
    }

    /* ------------------------------------------------------------------ 5. les groupes */
    // On descend la file. Entre deux coureurs qui se suivent, s'il y a cassure, le second ouvre un
    // nouveau groupe. C'est tout le §3.
    function groupes() {
      const file = ordre(), gs = [];
      let g = null;
      for (let i = 0; i < file.length; i++) {
        const c = file[i], devant = i ? file[i - 1] : null;
        let coupe = !g, ec = null;
        if (devant) {
          ec = ecartS(devant, c);
          // sans boucle commune on ne coupe pas : on ne sait pas, et on n'invente pas (E1, E6)
          coupe = ec == null ? false : confirme(c.bib + '|' + devant.bib, ec > R.cassureS);
        }
        if (coupe || !g) { g = { coureurs: [], ecartS: devant ? ec : null, devant: devant ? devant.bib : null }; gs.push(g); }
        g.coureurs.push(c.bib);
      }
      return gs;
    }

    /* ------------------------------------------------------------------ 6. le tour pris ou perdu */
    // SA RÈGLE, POINT 178 : « les tours se gagnent lorsqu'on rattrape le peloton, et se perdent
    // lorsqu'on se fait rattraper par le peloton ». Le peloton est la référence des deux côtés.
    // L'ÉVÉNEMENT est donc : un coureur qui n'était pas dans le peloton à la détection précédente
    // y est maintenant. LE NOMBRE de tours se lit sur la paire — lui et le coureur du peloton le
    // plus proche de lui sur la piste parmi ceux qui y étaient déjà (E2) —, et LE SENS vient de
    // lui seul : plus de distance comptée que le peloton, il l'a rattrapé et il prend un tour ;
    // moins, le peloton l'a rattrapé et il en perd un.
    const vus = [];                                  // les tours relevés, dans l'ordre où ils arrivent

    // LE PELOTON GARDE SON IDENTITÉ. Le plus gros groupe de l'instant ne suffit pas : quand la
    // course est éclatée en quatre blocs, le trio échappé peut se trouver être le plus nombreux, et
    // c'est alors contre un échappé qu'un tour perdu se compte. Mesuré à la build 185 : « −1 pour
    // le 46 et le 70, avec le 18 », qui est un échappé.
    // Le peloton reste donc LE MÊME tant que la plupart de ses coureurs roulent encore ensemble :
    // parmi les groupes du moment, c'est celui qui en partage le plus avec le peloton précédent. Au
    // départ, le plus nombreux. L'article UCI 3.2.017 quater laisse de toute façon le dernier mot au
    // président du collège des commissaires.
    let pelotonAvant = null;
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
        // s'il ne reste plus la moitié de l'ancien peloton, c'est qu'il a éclaté : on repart du plus gros
        if (mieux * 2 < pelotonAvant.length) g = plusGros;
      }
      pelotonAvant = g.coureurs.slice();
      return g;
    }

    // l'état d'une paire telle qu'on l'a vue la dernière fois : c'est le PASSAGE de « cassés » à
    // « collés » qui est l'événement, et non le fait d'être collés. Sans cela, deux coureurs déjà
    // ensemble au départ se verraient proposer un tour dès la première détection.
    const paireVue = new Map();
    // les retours dans le tour du peloton, qui ne proposent rien mais se notent : son point 181.
    const rendus = [];

    function examiner() {
      const gs = groupes(), pel = peloton(gs);
      if (!pel || pel.coureurs.length < 2) return;
      const tete = coureurs.get(pel.coureurs[0]);
      const queue = coureurs.get(pel.coureurs[pel.coureurs.length - 1]);
      const dedans = new Set(pel.coureurs);
      const gagnent = [], perdent = [];

      // SES QUATRE RÈGLES, POINT 180.
      //   « un tour gagné doit être proposé par l'appli au moment un coureur rattrape le dernier
      //     coureur du peloton. »
      //   « un tour perdu doit être proposé par l'appli au moment un coureur se fait rattraper par
      //     le premier coureur du peloton. »
      // Le moment, c'est le passage de la paire de « cassés » à « collés », au seuil du §1. Deux
      // paires seulement sont regardées, et elles sont nommées : (la queue du peloton, lui) pour le
      // tour gagné, (lui, la tête du peloton) pour le tour perdu.
      for (const c of coureurs.values()) {
        if (c.n === 0 || dedans.has(c.bib)) continue;

        if (queue && queue !== c) {
          const e = ecartS(queue, c);                 // il suit la queue du peloton
          if (e != null) {
            const cle = 'G' + queue.bib + '|' + c.bib, colle = e <= R.cassureS;
            // SON POINT 181 : « Rien : ils sont lâchés d'un tour, revenir au contact de la queue du
            // peloton ne leur fait rien gagner. » Le geste est le même que celui d'un coureur qui
            // prend un tour — il arrive par derrière et il colle —, et ce qui les distingue n'est pas
            // ce que les boucles voient à cet instant mais le SOLDE de tours qu'il porte déjà. Un
            // coureur en retard d'un tour revient simplement dans le tour du peloton (§2).
            const enRetard = (tours.get(c.bib) || 0) < 0;
            if (colle && paireVue.get(cle) === false) {
              if (enRetard) { tours.set(c.bib, (tours.get(c.bib) || 0) + 1); rendus.push({ t: maintenant, bib: c.bib, avec: queue.bib, ecart: +e.toFixed(2) }); }
              else gagnent.push({ c, avec: queue.bib, ecart: e });
            }
            paireVue.set(cle, colle);
          }
        }

        if (tete && tete !== c) {
          const e = ecartS(c, tete);                  // la tête du peloton le suit : elle le rattrape
          if (e != null) {
            const cle = 'P' + c.bib + '|' + tete.bib, colle = e <= R.cassureS;
            if (colle && paireVue.get(cle) === false) perdent.push({ c, avec: tete.bib, ecart: e });
            paireVue.set(cle, colle);
          }
        }
      }

      //   « Si ce sont deux coureurs qui rattrapent le peloton, l'appli doit le proposer pour les
      //     deux coureurs en même temps si ils ne sont pas éloignés de plus d'une seconde l'un de
      //     l'autre », et séparément au-delà. On regroupe donc les coureurs d'un même constat sur
      //     l'écart de temps ENTRE EUX, au même seuil d'une seconde.
      const grouper = (liste, tours) => {
        const restants = [...liste].sort((a, b) => (distance(b.c) - distance(a.c)) || (a.c.t - b.c.t));
        while (restants.length) {
          const chef = restants.shift(), ensemble = [chef];
          for (let i = restants.length - 1; i >= 0; i--) {
            const e = ecartS(chef.c, restants[i].c), f = ecartS(restants[i].c, chef.c);
            const ec = e != null ? e : f;
            if (ec != null && Math.abs(ec) <= R.cassureS) ensemble.push(...restants.splice(i, 1));
          }
          ensemble.sort((a, b) => a.c.bib - b.c.bib);
          vus.push({ t: maintenant, tours, bibs: ensemble.map(x => x.c.bib), avec: chef.avec,
            sens: tours > 0 ? 'ils ont rattrapé le dernier du peloton' : 'le premier du peloton les a rattrapés',
            ecarts: ensemble.map(x => +x.ecart.toFixed(2)) });
          // Son §2 : le retour dans le tour du peloton « n'attend aucune validation » — celle de
          // l'opérateur ne décide que les 20 points. On ramène donc tout de suite.
          for (const x of ensemble) ramener(x.c, tours > 0 ? 1 : -1);
        }
      };
      const ramener = (c, n) => tours.set(c.bib, (tours.get(c.bib) || 0) + n);
      if (gagnent.length) grouper(gagnent, 1);
      if (perdent.length) grouper(perdent, -1);
    }

    const toursPris = () => vus;
    const retours = () => rendus;

    // ce que l'opérateur valide ne change que les points ; le retour dans le tour du paquet, lui,
    // n'attend aucune validation (§2). C'est ici qu'on le relève, et une seule fois (E5).
    function rejoint(bib, nbTours) {
      const c = coureurs.get(bib); if (!c) return false;
      if (c.rejoint === c.t) return false;           // déjà relevé à cette détection-là
      c.rejoint = c.t;
      tours.set(bib, (tours.get(bib) || 0) + nbTours);
      return true;
    }

    /* ------------------------------------------------------------------ 7. l'état */
    function etat() {
      const gs = groupes();
      return {
        t: maintenant,
        coureurs: ordre().map(c => ({ bib: c.bib, distance: distance(c), compte: c.d, boucle: c.boucle, a: c.t, detections: c.n, toursRetranches: tours.get(c.bib) || 0 })),
        groupes: gs,
        tete: gs.length && gs[0].coureurs.length ? gs[0].coureurs[0] : null,
        toursPris: toursPris(),
      };
    }

    return { detection, etat, groupes, ordre: () => ordre().map(c => c.bib), toursPris, retours, rejoint,
             peloton: () => { const g = peloton(); return g ? g.coureurs.slice() : []; },
             reglage: R, _coureurs: coureurs };
  }

  const API = { creer };
  if (typeof window !== 'undefined') window.MoteurCourse = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
