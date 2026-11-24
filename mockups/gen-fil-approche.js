// Génère ../fil-approche.html et ../coachs.html — LES ANALYSES D'APPROCHE, branchées au moteur.
//
// On ne réécrit NI le dessin NI le style : on prend `maquette-approches.html` (médias) et
// `maquette-approches-coachs.html` (entraîneurs) tels qu'ils sont générés, et on remplace leur
// SEULE donnée figée — le bloc `var D={…}` — par un bloc qui se construit sur l'instantané du
// prototype. Tout le reste de la page, graphes compris, est celui de la maquette validée.
//
// `MAQUETTES OUTPUTS.pdf` : « Les positions viennent des Passings sur la boucle du back straight :
// S.reads garde toutes les lectures de chaque boucle pour toute la course, dans l'ordre où elles
// sont tombées — et cet ordre est l'ordre sur la piste. Le rang d'un coureur à un relevé, c'est sa
// place dans la lecture de ce passage. Le tour vient de Lap by lap. Le résultat du sprint et la
// bande des quatre places viennent de All sprints. »

const fs = require('fs');
const path = require('path');
const BASE = __dirname;

// le constructeur de D, commun aux deux pages : il parle le même langage que la maquette
const BUILDER = `
/* ---- D, construit sur l'instantane du prototype (et non sur la course figee) ---- */
var D=null, __ready=false, __premiere=true;
var CH=new BroadcastChannel('tct-feed');
CH.addEventListener('message',function(ev){ if(!ev.data||!ev.data.riders) return; D=build(ev.data); boot(); });
CH.postMessage({ask:true});

function build(S){
  var loops=S.loops||[], iB=null, iA=null, iF=null;
  loops.forEach(function(l){ if(/Pursuit B/i.test(l.name)) iB=l.i; else if(/Pursuit A/i.test(l.name)) iA=l.i; else iF=l.i; });
  var riders=S.riders.map(function(r){ return {bib:r.bib,nat:r.nat,name:r.name,first:r.first,flag:flag(r.nat)}; })
    .sort(function(a,b){ return a.bib-b.bib; });
  // LE CLASSEMENT GENERAL A CET INSTANT, dans l'ordre : il donne les coureurs suivis a l'ouverture.
  var standing=S.standings.filter(function(x){ return !x.wd; }).map(function(x){ return x.bib; });

  // LE TOUR D'UNE LECTURE : les passages de ligne de Lap by lap bornent chaque tour.
  var cross=S.cross||{}, laps=Object.keys(cross).map(Number).sort(function(a,b){return a-b;});
  var win={};                                   // tour -> [t0,t1] sur la ligne
  laps.forEach(function(L){ var l=cross[L].map(function(c){return c.t;});
    win[L]=[Math.min.apply(null,l), Math.max.apply(null,l)]; });

  // LE RELEVE CONTINU : un enregistrement par tour et par boucle, dans l'ORDRE DES LECTURES.
  //
  // CE QUI BORNE LE TOUR D'UNE LECTURE, c'est le passage de ligne DU COUREUR, pas une fenetre de
  // temps commune : entre son passage du tour precedent et celui de ce tour-ci. Une fenetre large
  // prenait la lecture du tour d'avant et l'ordre sortait faux (le vainqueur du sprint annonce
  // 14e au back straight du dernier tour).
  var at={};                                    // tour -> dossard -> t de son passage de ligne
  laps.forEach(function(L){ var m={}; cross[L].forEach(function(c){ if(m[c.bib]==null||c.t<m[c.bib]) m[c.bib]=c.t; }); at[L]=m; });
  var stream=[];
  function push(L, code, idx){
    if(idx==null) return;
    var cur=at[L]||{}, prev=at[L-1]||{}, reads=S.reads[idx]||[], out=[];
    Object.keys(cur).forEach(function(k){
      var b=+k, t1=cur[b], t0=(prev[b]!=null?prev[b]:-1e9), best=null;
      reads.forEach(function(x){ if(x.bib===b && x.t>t0 && x.t<=t1+0.001 && (best===null||x.t>best)) best=x.t; });
      if(best!==null) out.push({bib:b, t:best});
    });
    out.sort(function(p,q){ return p.t-q.t; });
    if(out.length) stream.push({lap:L, loop:code, order:out.map(function(o){return o.bib;})});
  }
  laps.forEach(function(L){ push(L,'B',iB); push(L,'A',iA); push(L,'F',iF); });

  // LE SPRINT : All sprints garde l'ordre complet.
  var sprints=S.sprints.filter(function(s){return s.started && s.order.length;}).map(function(s){
    var pts = s.final ? [10,6,4,2] : [5,3,2,1];
    return {k:s.k, lap:s.lap, final:s.final, res:s.order.map(function(e){return e.bib;}), pts:pts,
            racetime:(win[s.lap]?win[s.lap][1]:0), stand:standAt(S)};
  });

  // LE TOUR PRIS : la marque est gravee dans Lap by lap ; les compagnons sont ceux du meme bloc.
  var efforts=[];
  var open={};
  laps.forEach(function(L){
    var bunch=bunchAt(cross[L]);
    cross[L].forEach(function(c){
      var away = bunch!==null && c.blkid!==bunch;
      if(away && !open[c.bib]) open[c.bib]={bib:c.bib, attack:L, clear:L, with:[]};
      if(away && open[c.bib]){
        cross[L].forEach(function(o){ if(o.bib!==c.bib && o.blkid===c.blkid){
          var w=open[c.bib].with.filter(function(x){return x.bib===o.bib;})[0];
          if(w) w.to=L; else open[c.bib].with.push({bib:o.bib, from:L, to:L}); } });
      }
      if(!away && open[c.bib]){ open[c.bib].rejoin=L; }
      if(c.mark>0 && open[c.bib]){
        var e=open[c.bib]; e.credit=L; if(e.rejoin==null) e.rejoin=L;
        var bef=sprints.filter(function(s){return s.lap<=e.attack;});
        var last=bef.length?bef[bef.length-1]:null;
        e.afterK=last?last.k:0; e.afterLaps=e.attack-(last?last.lap:0);
        e.breakLap=lapTime(cross, e.attack, e.credit, c.bib);
        e.bunchLap=lapTime(cross, e.attack, e.credit, null);
        e.during=sprints.filter(function(s){return s.lap>=e.attack && s.lap<=e.credit;})
          .map(function(s){ var pl=s.res.indexOf(c.bib)+1; return {k:s.k, place:pl, pts:pl>0?(s.pts[pl-1]||0):0}; });
        e.laps=e.credit-e.attack;
        e.time=e.laps*((e.breakLap+e.bunchLap)/2);
        e.waitLaps=e.credit-e.rejoin;
        e.steps=[{lap:e.attack,t:'attacked'},{lap:e.clear,t:'clear of the bunch'},
                 {lap:e.rejoin,t:'back on the bunch'},{lap:e.credit,t:'lap credited'}];
        e.with.forEach(function(w){ w.laps=w.to-w.from; });
        efforts.push(e); delete open[c.bib];
      }
    });
  });
  var attacks=efforts.map(function(e){ return {from:e.attack, to:e.credit, bibs:[e.bib]}; });

  var lapt = laps.length>1 ? (win[laps[laps.length-1]][1]-win[laps[0]][0])/(laps.length-1) : 16.7;

  // LE TOUR DU PELOTON a un tour donne : l'heure mediane des passages de ligne de ce tour, moins
  // celle du tour d'avant. Mediane et non premiere, pour que l'echappee ne dicte pas le tour.
  function mid(L){ var m=at[L]; if(!m) return null;
    var v=Object.keys(m).map(function(k){ return m[k]; }).sort(function(a,b){ return a-b; });
    return v.length ? v[Math.floor(v.length/2)] : null; }
  var applaps={};
  sprints.forEach(function(sp){ var arr=[];
    for(var k=4;k>=0;k--){ var L=sp.lap-k, a=mid(L), b=mid(L-1);
      arr.push((a!=null&&b!=null&&a>b) ? (a-b) : lapt); }
    applaps[sp.k]=arr; });

  return {riders:riders, standing:standing, applaps:applaps, loopnm:{B:'Back straight',A:'Home straight',F:'Finish line'},
    loopsh:{B:'Back',A:'Home',F:'Line'}, maxspan:5, appt:[lapt,lapt,lapt,lapt,lapt], lapt:lapt,
    laps:S.race.laps, qual:(S.cfg&&S.cfg.type==='qualification')?S.cfg.advance:0,
    started:!!S.started, finished:!!S.finished, lap:S.lap||0, nspr:(S.race&&S.race.sprints)||S.sprints.length,
    stream:stream, sprints:sprints, efforts:efforts, attacks:attacks};

  function standAt(S){ var r=0; return S.standings.filter(function(x){return !x.wd;})
    .map(function(x){ return {bib:x.bib, pts:x.total}; }); }
}
function lapsIn(rs){ var v={}, n=0; (rs||[]).forEach(function(r){ if(!v[r.lap]){ v[r.lap]=1; n++; } }); return n; }
function clock3(x){ var m=Math.floor(x/60), r=x-m*60;
  return (m<10?'0':'')+m+':'+(r<10?'0':'')+r.toFixed(3); }
function raceState(){
  var n=D.sprints.length, spr=D.nspr||n;
  if(!D.started)  return 'Waiting for the start \u00b7 '+D.laps+' laps \u00b7 '+spr+' sprints';
  if(!D.finished) return 'Lap '+D.lap+' of '+D.laps+' \u00b7 '+n+' sprint'+(n===1?'':'s')+' judged';
  return 'Race finished \u00b7 '+D.laps+' laps \u00b7 '+n+' sprints';
}
function bunchAt(list){ var n={}, best=null;
  (list||[]).forEach(function(c){ n[c.blkid]=(n[c.blkid]||0)+1; if(best===null||n[c.blkid]>n[best]) best=c.blkid; });
  return best===null?null:(best==='null'?null:+best); }
function lapTime(cross, a, b, bib){
  var t0=null,t1=null;
  [[a,0],[b,1]].forEach(function(p){ var l=cross[p[0]]||[], v=null;
    l.forEach(function(c){ if(bib==null || c.bib===bib){ if(v===null||c.t<v) v=c.t; } });
    if(p[1]) t1=v; else t0=v; });
  return (t0==null||t1==null||b===a) ? 16.7 : (t1-t0)/(b-a);
}
`;

function live(src, out, label) {
  let s = fs.readFileSync(path.join(BASE, src), 'utf8');
  const i = s.indexOf('var D=');
  if (i < 0) { console.error('var D introuvable dans ' + src); process.exit(1); }
  const j = s.indexOf('};', i);
  if (j < 0) { console.error('fin du blob introuvable dans ' + src); process.exit(1); }

  // CE QUE LA MAQUETTE FAISAIT AU CHARGEMENT sur sa donnee figee doit se refaire a chaque
  // instantane : on le retire de la queue de page AVANT d'inserer le constructeur, sinon le
  // remplacement tomberait sur le code qu'on vient d'ecrire.
  // UN REMPLACEMENT QUI NE TROUVE RIEN NE DIT RIEN : c'est `pitfalls.md` D63. Chacun porte donc
  // son etiquette, et la generation annonce ceux qui n'ont pas pris. Les deux pages n'ont pas le
  // meme contenu : une etiquette marquee `2` doit prendre sur les deux, `1` sur une seule.
  let tail = s.slice(j + 2), rates = [], pris = [];
  function chg(cherche, pose, etiquette) {
    const avant = tail;
    tail = tail.replace(cherche, pose);
    (tail === avant ? rates : pris).push(etiquette);
  }
  chg('var NB=D.riders.length, byBib={};', '', 'table des dossards');
  chg('D.riders.forEach(function(r){byBib[r.bib]=r;});', '', 'remplissage de la table');
  chg('var si=D.sprints.length-1,', 'var si=0,', 'sprint choisi');
  chg(/\n(?:defaults\(\);)?\s*render\(\);\s*(?=\}\)\(\);)/, '\n', 'lancement au chargement');
  chg("function sprintLabel(s){return s.final?'Final':'Sprint '+s.k;}",
      "function sprintLabel(s){return !s?'the start':s.final?'Final':'Sprint '+s.k;}", 'parti avant le premier sprint');
  chg(/'Race finished \u00b7 '\+D\.laps\+' laps \u00b7 '\+D\.sprints\.length\+' sprints'/g,
      'raceState()', "en-tete : ou en est la course");
  chg("function appTime(span){var t=0;for(var i=D.appt.length-span;i<D.appt.length;i++)t+=D.appt[i];return t;}",
      "function appTime(span){ var sp=(typeof si!=='undefined'&&D.sprints[si])?D.sprints[si]:D.sprints[0];"
      + " var a=(D.applaps&&sp&&D.applaps[sp.k])?D.applaps[sp.k]:D.appt; var t=0;"
      + " for(var i=a.length-span;i<a.length;i++) t+=a[i]; return t; }", "temps des tours d'approche");
  chg(`'+t.toFixed(1)+' s</span> \u2014 <span class="num">'+(t/span).toFixed(1)+' s</span> a lap against a race average of <span class="num">'+D.lapt.toFixed(1)+' s</span>.'`,
      `'+clock3(t)+'</span> \u2014 <span class="num">'+clock3(t/span)+'</span> a lap against a race average of <span class="num">'+clock3(D.lapt)+'</span>.'`,
      "phrase de l'approche");
  chg(`'+(e.bunchLap-e.breakLap).toFixed(1)+' s a lap <small>\u00b7 '+e.breakLap.toFixed(1)+' s against '+e.bunchLap.toFixed(1)+' s</small>`,
      `'+(e.bunchLap-e.breakLap).toFixed(1)+' s a lap <small>\u00b7 '+clock3(e.breakLap)+' against '+clock3(e.bunchLap)+'</small>`,
      'tour de l\'echappe contre le peloton');
  chg("var span=3, sel=[52,15], view='chart', arr='rider';",
      "var span=3, sel=[], view='chart', arr='rider';", 'dossards en dur effaces');
  chg("+(e.bunchLap-e.breakLap).toFixed(1)+' s a lap",
      "+clock3(e.bunchLap-e.breakLap)+' a lap", "ecart entre les deux tours");
  chg(`if(after.length)o+='<text x="'+(W-Rr)+'" y="'+(H-B+14)+'" fill="#6c7279" font-size="9" text-anchor="end">+'+span+'</text>';`,
      `if(after.length)o+='<text x="'+(W-Rr)+'" y="'+(H-B+14)+'" fill="#6c7279" font-size="9" text-anchor="end">+'+lapsIn(after)+'</text>';`,
      'tours reellement courus apres le sprint');
  chg(`o+='<text x="'+L+'" y="'+(H-B+14)+'" fill="#6c7279" font-size="9">-'+span+'</text>';`,
      `o+='<text x="'+L+'" y="'+(H-B+14)+'" fill="#6c7279" font-size="9">-'+lapsIn(before)+'</text>';`,
      'tours reellement courus avant le sprint');
  chg("' laps</span><span class=\"pill\">'+t.toFixed(1)+' s</span>",
      "' laps</span><span class=\"pill\">'+clock3(t)+'</span>", "temps de l'approche en mm:ss.xxx");
  chg("+(t/span).toFixed(1)+' s a lap</span>", "+clock3(t/span)+' a lap</span>", "pastille du tour d'approche");
  // un coureur hors des quatre places ne marque rien : le bareme n'a que quatre valeurs
  chg("(place>=0?' \u2014 <span class=\"num\">+'+s.pts[place]+'</span> points.':' \u2014 no points.')",
      "(place>=0&&s.pts[place]?' \u2014 <span class=\"num\">+'+s.pts[place]+'</span> points.':' \u2014 no points.')",
      'coureur hors des places qui marquent');

  s = s.slice(0, i) + BUILDER
    + '\nvar NB=0, byBib={};\n'
    + 'function boot(){ NB=D.riders.length; byBib={}; D.riders.forEach(function(r){byBib[r.bib]=r;});'
    + ' if(typeof si!=="undefined" && (si>=D.sprints.length||si<0)) si=Math.max(0,D.sprints.length-1);'
    + ' __ready=true;'
    + ' try{ var _rt=document.getElementById("rt"); if(_rt) _rt.textContent=raceState(); }catch(e){}'
    + ' if(!D.sprints.length) return;'
    + ' if(typeof hi!=="undefined" && hi && hi.filter) hi=hi.filter(function(b){return byBib[b];});'
    + ' try{ if(typeof defaults==="function" && (typeof hi==="undefined"||!hi||!hi.length)) defaults(); }catch(e){ console.error("defaults",e); }'
    + ' if(typeof sel!=="undefined" && sel && sel.filter){'
    + '   if(__premiere) sel=(D.standing||[]).slice(0,4).filter(function(b){return byBib[b];});'
    + '   else sel=sel.filter(function(b){return byBib[b];});'
    + '   if(!sel.length) sel=(D.standing||D.riders.map(function(r){return r.bib;})).slice(0,4); }'
    + ' __premiere=false;'
    + ' try{ if(typeof renderPick==="function") renderPick(); }catch(e){ console.error("renderPick",e); }'
    + ' try{ render(); }catch(e){ console.error("render",e); } }\n'
    + tail;

  // flags.js pour les drapeaux construits a l'ecran
  s = s.replace('<body>', '<body>\n<script src="flags.js"></script>');
  // la page n'est plus une maquette : elle lit la course
  s = s.replace(/<title>Mockup · /, '<title>');
  fs.writeFileSync(path.join(BASE, '..', out), s);
  console.log(out + ' écrit · ' + label + ' (' + (s.length / 1024).toFixed(0) + ' Ko) · '
    + pris.length + ' remplacements' + (rates.length ? ' · sans effet ici : ' + rates.join(', ') : ''));
}

live('maquette-approches.html', 'fil-approche.html', 'médias, depuis la maquette');
live('maquette-approches-coachs.html', 'coachs.html', 'entraîneurs, depuis la maquette');
