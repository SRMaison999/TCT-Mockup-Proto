// Génère ../fil-evolution.html — L'ÉVOLUTION DU CLASSEMENT, branchée au moteur.
//
// On ne réécrit NI le dessin NI le style : on prend `maquette-standings.html` telle qu'elle est
// générée et on remplace sa SEULE donnée figée — le bloc `var DATA={…}` de la vue Evolution —
// par un bloc qui se construit sur l'instantané du prototype. La vue, le graphe, la colonne de
// gauche et la bascule des moments sont celles de la maquette validée.
//
// La page s'ouvre directement sur Evolution : la coque `fil-standings.html` porte déjà la bascule
// Live / Evolution, et un second en-tête dans l'iframe ferait doublon.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const SRC = 'maquette-standings.html';
const OUT = 'fil-evolution.html';

const BUILDER = `
/* ---- DATA, construit sur l'instantane du prototype (et non sur la course figee) ---- */
var DATA=null;
var CH=new BroadcastChannel('tct-feed');
CH.addEventListener('message',function(ev){ if(!ev.data||!ev.data.riders) return; DATA=build(ev.data); boot(ev.data); });
CH.postMessage({ask:true});

function build(S){
  // LES MOMENTS : le depart, chaque sprint juge, et chaque tour gagne ou perdu — dans l'ordre des
  // tours. Un tour gagne par plusieurs coureurs au meme tour est UN moment, comme dans le
  // classement du prototype.
  var ev=[{l:'Start', lap:null, kind:'start', add:{}}];
  S.sprints.forEach(function(s){ if(!s.started||!s.order.length) return;
    var add={}; s.order.forEach(function(e){ if(e.pts) add[e.bib]=(add[e.bib]||0)+e.pts; });
    ev.push({l:(s.final?'F':'S'+s.k), lap:s.lap, kind:'sprint', add:add}); });
  var byLap={};
  S.standings.forEach(function(x){
    (x.gainedLaps||[]).forEach(function(L){ var k='g'+L; (byLap[k]=byLap[k]||{l:'+1',lap:L,kind:'gain',add:{}}).add[x.bib]=20; });
    (x.lostLaps||[]).forEach(function(L){ var k='l'+L; (byLap[k]=byLap[k]||{l:'\\u22121',lap:L,kind:'lose',add:{}}).add[x.bib]=-20; });
  });
  Object.keys(byLap).forEach(function(k){ ev.push(byLap[k]); });
  ev.sort(function(a,b){ return (a.lap==null?-1:a.lap)-(b.lap==null?-1:b.lap); });

  // LES POINTS A CHAQUE MOMENT, et le rang qui en decoule.
  var bibs=S.riders.map(function(r){return r.bib;});
  var run={}; bibs.forEach(function(b){ run[b]=0; });
  var riders={};
  S.riders.forEach(function(r){ riders[r.bib]={nat:r.nat, name:r.name, flag:flag(r.nat), pts:[], rank:[]}; });
  ev.forEach(function(e){
    Object.keys(e.add).forEach(function(b){ run[b]=(run[b]||0)+e.add[b]; });
    var sorted=bibs.slice().sort(function(a,b){ return (run[b]-run[a])||(a-b); });
    var rk={}; sorted.forEach(function(b,i){ rk[b]=i+1; });
    bibs.forEach(function(b){ riders[b].pts.push(run[b]||0); riders[b].rank.push(rk[b]); });
  });

  return {CK:ev.map(function(e){ return {l:e.l, lap:e.lap, kind:e.kind}; }),
          order:S.standings.map(function(x){return x.bib;}), riders:riders};
}
`;

let s = fs.readFileSync(path.join(BASE, SRC), 'utf8');

const i = s.indexOf('var DATA=');
if (i < 0) { console.error('var DATA introuvable'); process.exit(1); }
const j = s.indexOf('\n', i);

let tail = s.slice(j + 1)
  .replace('var order=DATA.order, CKc=DATA.CK, nck=CKc.length;', 'var order=[], CKc=[], nck=0;')
  .replace('var MAX=4, sel=order.slice(0,2), snapAt=nck-1;', 'var MAX=4, sel=[], snapAt=-1, __picked=false;')
  .replace("snapAt=+t.getAttribute('data-ck');renderAll();", "snapAt=+t.getAttribute('data-ck');__picked=true;renderAll();");

// CE QUE LA MAQUETTE FAISAIT SUR SA DONNEE FIGEE se refait a chaque instantane.
const BOOT = `
function boot(S){
  CUT=(S.cfg && S.cfg.type==='qualification') ? S.cfg.advance : 0;
  order=DATA.order; CKc=DATA.CK; nck=CKc.length;
  sel=sel.filter(function(b){ return DATA.riders[b]; });
  if(!sel.length) sel=order.slice(0,2);
  if(!__picked||snapAt>=nck||snapAt<0) snapAt=nck-1;
  var t=document.getElementById('v-table'), e=document.getElementById('v-evo');
  if(t) t.hidden=true; if(e) e.hidden=false;
  var h=document.querySelector('.board-h'); if(h) h.style.display='none';
  try{ renderAll(); }catch(err){ console.error('renderAll',err); }
}
`;

s = s.slice(0, i) + BUILDER + BOOT + tail;
s = s.replace('var CUT=10;', 'var CUT=0;');
s = s.replace(/<title>[^<]*<\/title>/, '<title>Standings · evolution</title>');
s = s.replace('<body>', '<body>\n<script src="flags.js"></script>');
fs.writeFileSync(path.join(BASE, '..', OUT), s);
console.log(OUT + ' écrit · évolution, depuis la maquette (' + (s.length / 1024).toFixed(0) + ' Ko)');
