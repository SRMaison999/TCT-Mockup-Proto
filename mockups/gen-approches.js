// Génère mockups/maquette-approches.html (médias) et mockups/maquette-approches-coachs.html
// (entraîneurs) — session S11 « Analyses d'approche », cadrée le 22 novembre 2026.
//
// SES NOMS : « Back straight » (boucle Pursuit B), « Home straight » (boucle Pursuit A), et la
// ligne d'arrivée. DEUX RELEVÉS PAR TOUR dans chaque vue, mais pas les mêmes : les entraîneurs
// gardent Back straight + Home straight, les médias Back straight + la ligne — c'est là que le
// sprint se juge. Les trois restent dans la donnée.
//
// La position se lit sur les PASSAGES DES BOUCLES, jamais sur des mètres. Chaque chiffre est
// donné EN TEMPS ET EN TOURS. Le NOMBRE DE TOURS d'approche n'est pas tranché
// (regles-operateur.md §15) : sélecteur 2·3·4·5 dans les deux écrans.
//
// UN COUREUR S'ÉCRIT TOUJOURS : <dossard> <drapeau> <NOC> <prénom> <NOM>.
// PAS DE BANDE COLORÉE sur le côté des cartes : la couleur va sur le NOM du coureur surligné.
//
// La donnée est un RELEVÉ CONTINU de toute la course — 60 tours × 3 boucles — calé sur le
// résultat de chaque sprint. Il sert l'approche ET le suivi APRÈS le sprint (sa demande du
// 22 novembre 2026 : se laisser glisser plus bas dans le peloton pour reprendre son souffle,
// ou rester devant à donner le tempo).
//
// Course ILLUSTRATIVE sur les vrais coureurs : les six sprints de la course de test sont
// identiques (le peloton reste groupé) et ne montreraient aucune approche. Manche de
// QUALIFICATION, huit qualifiés sur seize.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(BASE, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };
const BIBS = Object.keys(R).map(Number);
const NB = BIBS.length;

const LAPS = 60, MAXSPAN = 5, QUAL = 8;
const LOOPS = ['B', 'A', 'F'];
const LOOPFRAC = { B: 0.40, A: 0.82, F: 1.00 };
const LOOPNM = { B: 'Back straight', A: 'Home straight', F: 'Finish line' };
const LOOPSH = { B: 'Back', A: 'Home', F: 'Line' };
const SPRINTS = [
  { k: 1, lap: 10, final: false, res: [15, 52, 4, 11] },
  { k: 2, lap: 20, final: false, res: [52, 12, 15, 9] },
  { k: 3, lap: 30, final: false, res: [3, 52, 23, 15] },
  { k: 4, lap: 40, final: false, res: [9, 52, 15, 4] },
  { k: 5, lap: 50, final: false, res: [12, 3, 52, 11] },
  { k: 6, lap: 60, final: true, res: [52, 15, 3, 4] },
];
const LAPT = 16.7;
const APPT = [16.4, 15.8, 14.9, 13.9, 13.2];
// Les attaques de la course illustrative. Certaines prennent le tour, d'autres sont reprises.
// Elles donnent la SITUATION DE COURSE des tours qui suivent chaque sprint : on ne peut pas
// toujours se laisser glisser, il y a parfois un rival à ne pas laisser partir.
const ATTACKS = [
  { bibs: [61], from: 22, to: 31, got: true },
  { bibs: [9], from: 33, to: 47, got: true },
  { bibs: [70, 46], from: 41, to: 45, got: false },
  { bibs: [3], from: 52, to: 56, got: false },
];
const attackersAt = L => { const a = []; ATTACKS.forEach(t => { if (L >= t.from && L <= t.to) a.push(...t.bibs); }); return a; };

/* ───────── le relevé continu ───────── */
const hash = (a, b, c) => { let s = ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0; s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const posMap = o => { const m = {}; o.forEach((b, i) => m[b] = i + 1); return m; };
function fullOrder(si) {
  const s = SPRINTS[si], rest = BIBS.filter(b => !s.res.includes(b));
  let seed = si + 7;
  const rd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  rest.sort(() => rd() - 0.5);
  return s.res.concat(rest);
}
// ancres : la liste de départ au tour 0, puis l'ordre de chaque sprint à son tour
const ANCHORS = [{ x: 0, pos: posMap(BIBS.slice()), res: null }]
  .concat(SPRINTS.map((s, i) => ({ x: s.lap, pos: posMap(fullOrder(i)), res: s.res })));

const STREAM = [];
for (let L = 1; L <= LAPS; L++) {
  for (const loop of LOOPS) {
    const x = L - 1 + LOOPFRAC[loop];
    let pi = 0;
    while (pi + 1 < ANCHORS.length && ANCHORS[pi + 1].x < x) pi++;
    const A0 = ANCHORS[pi], A1 = ANCHORS[pi + 1];
    if (!A1) continue;                                   // rien après le dernier sprint
    const t = (x - A0.x) / (A1.x - A0.x);
    const atSprint = Math.abs(x - A1.x) < 1e-9;
    let order;
    if (atSprint) order = Object.keys(A1.pos).map(Number).sort((a, b) => A1.pos[a] - A1.pos[b]);
    else {
      const sc = {};
      const atk = attackersAt(L);
      const tt = Math.pow(t, 2.1);          // on se replace surtout dans les derniers tours
      BIBS.forEach(b => {
        let v = (1 - tt) * A0.pos[b] + tt * A1.pos[b];
        // on se laisse glisser après avoir marqué
        if (A0.res && A0.res.includes(b)) {
          const d = x - A0.x;
          v += 9 * (d / 2) * Math.exp(1 - d / 2);
        }
        v += (hash(L, loop.charCodeAt(0), b) - 0.5) * 4.0;
        if (atk.includes(b)) v -= 60;                       // il est devant tant qu'il est parti
        sc[b] = v;
      });
      order = BIBS.slice().sort((a, b) => sc[a] - sc[b]);
    }
    STREAM.push({ lap: L, loop, order });
  }
}

const PTS_OF = s => (s.final ? [10, 6, 4, 2] : [5, 3, 2, 1]);
const STANDINGS = [];
{
  const tot = {}; BIBS.forEach(b => tot[b] = 0);
  SPRINTS.forEach(s => {
    s.res.forEach((b, i) => tot[b] += PTS_OF(s)[i]);
    STANDINGS.push(BIBS.map(b => ({ bib: b, pts: tot[b] })).sort((a, b) => b.pts - a.pts || a.bib - b.bib));
  });
}

// l'effort du tour pris — posé à la main, avec ceux qui l'ont accompagné
const EFFORTS = [
  {
    bib: 9, attack: 33, clear: 34, rejoin: 46, credit: 47, afterK: 3, afterLaps: 3,
    breakLap: 14.1, bunchLap: 16.9, during: [{ k: 4, place: 1, pts: 5 }],
    with: [{ bib: 46, from: 33, to: 38 }, { bib: 23, from: 36, to: 41 }],
  },
  {
    bib: 61, attack: 22, clear: 23, rejoin: 30, credit: 31, afterK: 2, afterLaps: 2,
    breakLap: 14.6, bunchLap: 16.8, during: [{ k: 3, place: 5, pts: 0 }],
    with: [{ bib: 18, from: 22, to: 25 }],
  },
];
EFFORTS.forEach(e => {
  e.laps = e.credit - e.attack;
  e.time = e.laps * ((e.breakLap + e.bunchLap) / 2);
  e.waitLaps = e.credit - e.rejoin;
  e.steps = [
    { lap: e.attack, t: 'attacked' },
    { lap: e.clear, t: 'clear of the bunch' },
    { lap: e.rejoin, t: 'back on the bunch' },
    { lap: e.credit, t: 'lap credited' },
  ];
  e.with.forEach(w => w.laps = w.to - w.from);
});

const DATA = {
  riders: BIBS.map(b => ({ bib: b, nat: R[b].nat, name: R[b].name, first: FIRST[b] || '', flag: flag(R[b].nat) })),
  loopnm: LOOPNM, loopsh: LOOPSH, maxspan: MAXSPAN, appt: APPT, lapt: LAPT, laps: LAPS, qual: QUAL,
  stream: STREAM,
  sprints: SPRINTS.map((s, i) => ({
    k: s.k, lap: s.lap, final: s.final, res: s.res, pts: PTS_OF(s),
    racetime: s.lap * LAPT, stand: STANDINGS[i],
  })),
  efforts: EFFORTS, attacks: ATTACKS,
};
const JSON_BLOB = JSON.stringify(DATA).replace(/</g, '\u003c');

/* ───────── feuille de style commune ───────── */
const CSS = `
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:12px 14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.ro{font:700 10px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--dim);border:1px solid var(--line2);border-radius:999px;padding:3px 10px}
.togo{margin-left:auto;font:600 12px var(--mono);color:var(--fg);border:1px solid var(--line2);border-radius:999px;padding:4px 12px}
.seg{display:inline-flex;border:1px solid var(--line2);border-radius:5px;overflow:hidden}
.seg button{font:600 12px var(--sans);color:var(--dim);border:0;padding:5px 13px;background:#23272b;cursor:pointer;border-right:1px solid var(--line2)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--acc);color:#fff}
.strip{flex:0 0 auto;display:flex;align-items:center;gap:10px;background:#1c1e22;border:1px solid var(--line);border-radius:6px;padding:9px 13px;flex-wrap:wrap}
.strip .k{font:700 10px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--dim)}
.strip .dur{margin-left:auto;font:600 12px var(--mono);color:var(--fg);display:flex;gap:8px;align-items:center}
.strip .pill{background:#39311c;border-radius:5px;padding:2px 8px}
.strip .pill.cold{background:#1c2733;color:#8FB4FF}
.main{flex:1 1 auto;min-height:0;display:flex;gap:14px}
.col{display:flex;flex-direction:column;min-height:0;background:#1c1e22;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.ch2{font:600 11px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:9px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px;flex:0 0 auto}
.ch2 .sub{font:500 10px var(--sans);letter-spacing:0;text-transform:none;color:var(--dim)}
.note{flex:0 0 auto;font:500 12px var(--sans);color:var(--dim)}
.rid{white-space:nowrap;font:600 12.5px var(--sans);color:var(--muted)}
.rid .bb{font:700 12.5px var(--mono);color:var(--fg);margin-right:4px}
.rid .flag{width:17px;height:11px;border-radius:2px;display:inline-block;vertical-align:-1px;margin-right:4px;box-shadow:0 0 0 1px #0006}
.rid .noc{font:700 11px var(--mono);color:var(--dim);margin-right:4px}
.rid .fn{font-weight:500;color:var(--dim)}
.rid .sn{font-weight:700}
.card{border:1px solid var(--line);border-radius:6px;padding:9px 11px;background:#17191c}
.card .t{display:block;font:700 10px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--dim);margin-bottom:6px}
.card .bd{font:500 13.5px/1.5 var(--sans);color:var(--dim)}
.card .num{font:700 13px var(--mono);color:var(--fg)}
`;

/* ───────── script client commun ─────────
   Les deux vues lisent les MÊMES deux relevés par tour : Back straight et la ligne
   (ses mots du 22 novembre 2026). La boucle du home straight reste dans la donnée,
   elle n'est affichée nulle part.                                                   */
const CLIENT_CORE = `
var D=__BLOB__;
var VIEWLOOPS=['B','F'];
var NB=D.riders.length, byBib={};
D.riders.forEach(function(r){byBib[r.bib]=r;});
var PAL=['#FFD166','#8FB4FF','#2ED47A','#FF8FA3','#F2A33A','#C9A6FF'];
function clock(x){var m=Math.floor(x/60),r=x-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1);}
function ord(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function rid(b,col){var r=byBib[b];
  return '<span class="rid"'+(col?' style="color:'+col+'"':'')+'><span class="bb"'+(col?' style="color:'+col+'"':'')+'>'+b+'</span>'+r.flag+'<span class="noc">'+r.nat+'</span>'+(r.first?'<span class="fn">'+r.first+'</span> ':'')+'<span class="sn">'+r.name+'</span></span>';}
function P(r,b){return r.order.indexOf(b)+1;}
// les relevés d'une fenêtre de tours : approche (avant le sprint) ou retour (après)
function window_(si,span,after){
  var L=D.sprints[si].lap, lo=after?L+1:L-span+1, hi=after?L+span:L;
  return D.stream.filter(function(r){return r.lap>=lo&&r.lap<=hi&&VIEWLOOPS.indexOf(r.loop)>=0;});
}
function appTime(span){var t=0;for(var i=D.appt.length-span;i<D.appt.length;i++)t+=D.appt[i];return t;}
function sprintLabel(s){return s.final?'Final':'Sprint '+s.k;}
function flagAt(b,x,y,w){return byBib[b].flag.replace('<svg ','<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+(w*2/3).toFixed(1)+'" ');}
function card(t,body){return '<div class="card"><span class="t">'+t+'</span><div class="bd">'+body+'</div></div>';}
`;

/* ───────── surface 1 : les médias ───────── */
const CSS_MEDIA = `
.col.chart{flex:2 1 0}
.col.notes{flex:1 1 0;min-width:340px}
.chartwrap{flex:1 1 auto;min-height:0;padding:6px 8px}
.chartwrap svg{width:100%;height:100%;display:block}
.chartwrap .rrow{cursor:pointer}
.noteswrap{flex:1 1 auto;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:9px}
.effwrap{flex:1 1 auto;overflow:auto;padding:12px;display:flex;flex-direction:row;align-items:stretch;gap:14px}
.story{display:flex;flex-direction:column;gap:0;margin:2px 0 2px}
.step:last-child{padding-bottom:2px}
.step::before{content:'';position:absolute;left:-5px;top:9px;width:8px;height:8px;border-radius:50%;background:var(--good)}
.step{border-left:2px solid var(--good);padding:5px 0 10px 12px;position:relative}
.step .lp{font:700 13px var(--mono);color:var(--fg)}
.step .tm{font:600 11px var(--mono);color:var(--dim);margin-left:5px}
.step .tx{display:block;font:500 12px var(--sans);color:var(--muted);margin-top:2px}
.effg{display:grid;grid-template-columns:1fr;gap:8px}
.kv{background:#1c1e22;border:1px solid var(--line);border-radius:6px;padding:8px 10px}
.kv .k2{display:block;font:700 9.5px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--dim);margin-bottom:4px}
.kv .v{font:700 15px var(--mono);color:var(--fg)}
.kv .v small{font:500 11.5px var(--sans);color:var(--dim)}
.eff{flex:0 0 430px;display:flex;flex-direction:column;gap:9px;overflow:auto;border:1px solid var(--line);border-radius:7px;background:#17191c;padding:12px 14px}
.effh{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.effh .pts{margin-left:auto;font:700 13px var(--mono);color:var(--good);border:1px solid #2ED47A66;border-radius:999px;padding:3px 11px}
`;

const MEDIA_CHART = `
function drawChart(svg,si,span,hi){
  var rs=window_(si,span,false), n=rs.length;
  var W=1180,H=440,PL=46,LISTW=282,PR=W-LISTW-16,T=30,B=40;
  var cw=(PR-PL)/(n-1), rh=(H-T-B)/(NB-1);
  var x=function(i){return (PL+i*cw).toFixed(1);}, y=function(p){return (T+(p-1)*rh).toFixed(1);};
  var col=function(b){var k=hi.indexOf(b);return k>=0?PAL[k%PAL.length]:null;};
  var o='';
  o+='<rect x="'+PL+'" y="'+(T-rh/2).toFixed(1)+'" width="'+(PR-PL)+'" height="'+(rh*4).toFixed(1)+'" fill="#2ED47A12" stroke="#2ED47A33" stroke-dasharray="3 3"/>';
  o+='<text x="'+(PL+6)+'" y="'+(T-rh/2-6).toFixed(1)+'" fill="#2ED47A" font-size="10" font-weight="700">the four scoring places</text>';
  // l'échelle des rangs, à gauche du tracé : d'où il part, où il arrive
  for(var p=1;p<=NB;p++){
    o+='<line x1="'+PL+'" y1="'+y(p)+'" x2="'+PR+'" y2="'+y(p)+'" stroke="#ffffff07"/>';
    o+='<text x="'+(PL-10)+'" y="'+(+y(p)+4)+'" fill="#8d9298" font-size="11" font-weight="700" text-anchor="end" font-family="monospace">'+p+'</text>';
  }
  o+='<text x="'+(PL-10)+'" y="'+(T-rh/2-6).toFixed(1)+'" fill="#6c7279" font-size="9.5" text-anchor="end">rank</text>';
  rs.forEach(function(r,i){
    var isF=r.loop==='F';
    o+='<line x1="'+x(i)+'" y1="'+(T-rh/2-2)+'" x2="'+x(i)+'" y2="'+(H-B+4)+'" stroke="'+(isF?'#3a4046':'#262b30')+'"/>';
    var back=D.sprints[si].lap-r.lap;
    var lab=isF?(back===0?'Sprint':back+(back===1?' lap':' laps')+' to go'):'Back';
    o+='<text x="'+x(i)+'" y="'+(H-B+18)+'" fill="'+(isF?'#87a8c9':'#6c7279')+'" font-size="9.5" font-weight="'+(isF?'700':'400')+'" text-anchor="middle">'+lab+'</text>';
  });
  D.riders.forEach(function(rd){
    if(hi.indexOf(rd.bib)>=0)return;
    o+='<polyline points="'+rs.map(function(r,i){return x(i)+','+y(P(r,rd.bib));}).join(' ')+'" fill="none" stroke="#4d535a" stroke-width="1.1" stroke-linejoin="round"/>';
  });
  hi.forEach(function(b,k){
    var c=PAL[k%PAL.length];
    o+='<polyline points="'+rs.map(function(r,i){return x(i)+','+y(P(r,b));}).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="2.8" stroke-linejoin="round"/>';
    rs.forEach(function(r,i){o+='<circle cx="'+x(i)+'" cy="'+y(P(r,b))+'" r="2.8" fill="'+c+'"/>';});
  });
  // la liste du résultat du sprint, à droite : chaque ligne à la hauteur où la courbe arrive
  var LX=PR+34;
  o+='<text x="'+(PR+6)+'" y="'+(T-rh/2-6).toFixed(1)+'" fill="#c1bdb4" font-size="10" font-weight="700" letter-spacing="0.6">SPRINT RESULT</text>';
  rs[n-1].order.forEach(function(b,idx){
    var p=idx+1, c=col(b), yy=+y(p);
    o+='<text x="'+(PR+24)+'" y="'+(yy+4.5)+'" fill="'+(c||'#8d9298')+'" font-size="11.5" font-weight="700" text-anchor="end" font-family="monospace">'+p+'</text>';
    o+='<rect class="rrow" data-bib="'+b+'" x="'+LX+'" y="'+(yy-rh/2+1)+'" width="'+(W-LX-4)+'" height="'+(rh-2).toFixed(1)+'" rx="4" fill="'+(c?c+'1f':'#00000000')+'" stroke="'+(c||'#00000000')+'"/>';
    o+='<text x="'+(LX+28)+'" y="'+(yy+4.5)+'" fill="'+(c||'#ffecb3')+'" font-size="11.5" font-weight="700" text-anchor="end" font-family="monospace" pointer-events="none">'+b+'</text>';
    o+=flagAt(b,LX+34,yy-6,18);
    o+='<text x="'+(LX+56)+'" y="'+(yy+4.5)+'" fill="#8d9298" font-size="10.5" font-weight="700" font-family="monospace" pointer-events="none">'+byBib[b].nat+'</text>';
    o+='<text x="'+(LX+84)+'" y="'+(yy+4.5)+'" font-size="11.5" fill="'+(c||'#c1bdb4')+'" pointer-events="none">'+esc(byBib[b].first)+' <tspan font-weight="700" fill="'+(c||'#fffafa')+'">'+esc(byBib[b].name)+'</tspan></text>';
  });
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.innerHTML=o;
}
`;

const mediaHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Sprint approach (media)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>${CSS}${CSS_MEDIA}</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Sprint approach</b><span class="hint">where the riders were in the laps before the sprint</span>
    <span class="seg" id="segV"><button class="on" data-v="app">Approach</button><button data-v="eff">Lap gained</button></span>
    <span class="ro">Read only</span><span class="togo" id="rt"></span>
  </div>
  <div class="strip" id="strip">
    <span class="k">Sprint</span><span class="seg" id="segS"></span>
    <span class="k">Approach</span><span class="seg" id="segL"></span>
    <span class="dur" id="dur"></span>
  </div>
  <div class="main" id="v-app">
    <div class="col chart">
      <div class="ch2">Where they were <span class="sub">two readings a lap — back straight, then the finish line · click a rider in the result to follow him</span></div>
      <div class="chartwrap"><svg id="svg" preserveAspectRatio="none"></svg></div>
    </div>
    <div class="col notes">
      <div class="ch2">What happened <span class="sub">read from the loop passings</span></div>
      <div class="noteswrap" id="lines"></div>
    </div>
  </div>
  <div class="col" id="v-eff" hidden style="flex:1 1 auto">
    <div class="ch2">A lap gained <span class="sub">what it took, from the attack to the credited lap</span></div>
    <div class="effwrap" id="eff"></div>
  </div>
  <div class="note">Positions are read from the transponder loops — back straight and the finish line, two readings a lap — never from metres on the track. The view appears as soon as a sprint is judged.</div>
</div>
<script>
(function(){
${CLIENT_CORE.replace('__BLOB__', JSON_BLOB)}
${MEDIA_CHART}
var si=D.sprints.length-1, span=3, hi=[], view='app';
function colOf(b){var k=hi.indexOf(b);return k>=0?PAL[k%PAL.length]:null;}
function where(rs,b,span){var n=rs.length;
  return 'was <span class="num">'+ord(P(rs[0],b))+'</span> with '+span+' laps to run, <span class="num">'+ord(P(rs[n-2],b))+'</span> half a lap from the line, <span class="num">'+ord(P(rs[n-1],b))+'</span> at the line';}
function insights(){
  var s=D.sprints[si], rs=window_(si,span,false), n=rs.length, out=[];
  var fin=rs[n-1], pre=rs[n-2];
  if(hi.length) out.push(card('The riders you are following', hi.map(function(b){
    var place=s.res.indexOf(b);
    return '<div style="margin-bottom:6px">'+rid(b,colOf(b))+' '+where(rs,b,span)+(place>=0?' — <span class="num">+'+s.pts[place]+'</span> points.':' — no points.')+'</div>';}).join('')));
  var TITLES=['The win','Second place','Third place','Fourth place'];
  for(var k=0;k<4;k++){
    var a=s.res[k], b=(k<3?s.res[k+1]:fin.order[4]);
    if(!a||!b)continue;
    out.push(card(TITLES[k]+' — '+ord(k+1)+' against '+ord(k+2),
      rid(a,colOf(a))+' was <span class="num">'+ord(P(pre,a))+'</span> at the back straight of the last lap, '+rid(b,colOf(b))+' <span class="num">'+ord(P(pre,b))+'</span>. '+
      'At the line <span class="num">'+ord(P(fin,a))+'</span> and <span class="num">'+ord(P(fin,b))+'</span> — '+
      (P(pre,a)>P(pre,b)?'the place changed hands on the last half lap.':'the order held to the line.')));
  }
  var st=s.stand, q=D.qual;
  if(st[q]&&st[q-1]){
    var inq=st[q-1], outq=st[q];
    out.push(card('Last qualifying place — '+ord(q),
      rid(inq.bib,colOf(inq.bib))+' holds it on <span class="num">'+inq.pts+'</span> points, '+rid(outq.bib,colOf(outq.bib))+' is next on <span class="num">'+outq.pts+'</span>. '+
      'Here they crossed <span class="num">'+ord(P(fin,inq.bib))+'</span> and <span class="num">'+ord(P(fin,outq.bib))+'</span>.'));
  }
  var t=appTime(span);
  out.push(card('How hard the approach was run',
    'The <span class="num">'+span+'</span> approach laps took <span class="num">'+t.toFixed(1)+' s</span> — <span class="num">'+(t/span).toFixed(1)+' s</span> a lap against a race average of <span class="num">'+D.lapt.toFixed(1)+' s</span>.'));
  D.efforts.forEach(function(e){
    if(s.lap>e.attack&&s.lap<=e.credit){
      var d=e.during.filter(function(x){return x.k===s.k;})[0];
      out.push(card('A lap being taken',
        rid(e.bib,colOf(e.bib))+' was off the front, <span class="num">'+(s.lap-e.attack)+' laps</span> into his attempt'+
        (d?', and crossed <span class="num">'+ord(d.place)+'</span> here for <span class="num">'+(d.pts?'+'+d.pts:'no')+'</span> points':'')+
        '. The lap was credited on <span class="num">lap '+e.credit+'</span>.'));
    }
  });
  return out.join('');
}
__LAPGAINED__
function render(){
  var s=D.sprints[si];
  document.getElementById('rt').textContent=sprintLabel(s)+' judged · lap '+s.lap+' of '+D.laps+' · '+clock(s.racetime);
  var t=appTime(span);
  document.getElementById('dur').innerHTML='<span class="pill">'+span+' laps</span><span class="pill">'+t.toFixed(1)+' s</span><span class="pill cold">'+(t/span).toFixed(1)+' s a lap</span>';
  document.getElementById('segS').innerHTML=D.sprints.map(function(x,i){
    return '<button data-si="'+i+'" class="'+(i===si?'on':'')+'">'+(x.final?'Final':'S'+x.k)+'</button>';}).join('');
  document.getElementById('segL').innerHTML=[2,3,4,5].map(function(n){
    return '<button data-span="'+n+'" class="'+(n===span?'on':'')+'">'+n+' laps</button>';}).join('');
  drawChart(document.getElementById('svg'),si,span,hi);
  document.getElementById('lines').innerHTML=insights();
  document.getElementById('eff').innerHTML=lapGained(false);
  document.getElementById('v-app').hidden=(view!=='app');
  document.getElementById('v-eff').hidden=(view!=='eff');
  document.getElementById('strip').hidden=(view!=='app');
}
function defaults(){var s=D.sprints[si];hi=[s.res[0],s.res[1]];}
document.addEventListener('click',function(e){
  var v=e.target.closest&&e.target.closest('[data-v]');
  if(v){view=v.dataset.v;document.querySelectorAll('#segV button').forEach(function(x){x.classList.toggle('on',x===v);});render();return;}
  var b=e.target.closest&&e.target.closest('[data-si]');
  if(b){si=+b.dataset.si;defaults();render();return;}
  var l=e.target.closest&&e.target.closest('[data-span]');
  if(l){span=+l.dataset.span;render();return;}
  var bib=e.target.getAttribute&&e.target.getAttribute('data-bib');
  if(bib){bib=+bib;var k=hi.indexOf(bib);if(k>=0)hi.splice(k,1);else hi.push(bib);render();}
});
defaults();render();
})();
</script>
</body></html>`;

/* ───────── « Lap gained », la même carte pour les deux surfaces ─────────
   Racontée dans l'ordre, chaque étape avec son tour ET son temps de course ;
   et qui l'a accompagné entre le début et la fin de son attaque.          */
const LAPGAINED = `
function lapGained(){
  return D.efforts.map(function(e){
    var rt=function(l){return clock(l*D.lapt);};
    var story=e.steps.map(function(st){
      return '<div class="step"><span class="lp">lap '+st.lap+'</span><span class="tm">'+rt(st.lap)+'</span><span class="tx">'+st.t+'</span></div>';}).join('');
    var sprAfter=D.sprints.filter(function(x){return x.k===e.afterK;})[0];
    var during=e.during.map(function(d){
      var s=D.sprints.filter(function(x){return x.k===d.k;})[0];
      return sprintLabel(s)+' fell while he was away — he crossed '+ord(d.place)+(d.pts?' for +'+d.pts:' for no points');}).join('. ');
    var withs=e.with.length? e.with.map(function(w){
      return rid(w.bib)+' for <span class="num">'+w.laps+' laps</span> (lap '+w.from+' to '+w.to+')';}).join(', ')+(e.with.length>1?' — neither of them stayed to the end.':' — he did not stay to the end.') : 'Nobody went with him.';
    return '<div class="eff"><div class="effh">'+rid(e.bib)+'<span class="pts">+20 — a lap gained</span></div>'+
      '<div class="story">'+story+'</div>'+
      '<div class="effg">'+
      '<div class="kv"><span class="k2">The whole move</span><span class="v">'+e.laps+' laps <small>· '+clock(e.time)+'</small></span></div>'+
      '<div class="kv"><span class="k2">He attacked</span><span class="v">'+e.afterLaps+' laps <small>after '+sprintLabel(sprAfter)+'</small></span></div>'+
      '<div class="kv"><span class="k2">Faster than the bunch</span><span class="v">'+(e.bunchLap-e.breakLap).toFixed(1)+' s a lap <small>· '+e.breakLap.toFixed(1)+' s against '+e.bunchLap.toFixed(1)+' s</small></span></div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:9px">'+
      card('Who was with him', withs)+
      card('A sprint fell in the middle of it', during||'No sprint fell while he was away.')+
      card('Waiting on the decision','He came back on the bunch on <span class="num">lap '+e.rejoin+'</span> and the lap was credited on <span class="num">lap '+e.credit+'</span> — <span class="num">'+e.waitLaps+' lap'+(e.waitLaps>1?'s':'')+'</span> later.')+
      '</div></div>';
  }).join('');
}
`;
fs.writeFileSync(`${BASE}/maquette-approches.html`, mediaHtml.replace('__LAPGAINED__', LAPGAINED));
console.log('maquette approches (medias) ecrite');


/* ───────── le graphe réutilisable : un sprint, n tours avant ET n tours après ───────── */
const MINICHART = `
function miniChart(si,bibs,span,W,H,cols){
  cols=cols||PAL;
  var s=D.sprints[si];
  var before=window_(si,span,false), after=window_(si,span,true);
  var rs=before.concat(after), n=rs.length, iS=before.length-1;
  var L=28,Rr=10,T=16,B=20;
  var cw=(W-L-Rr)/(n-1), rh=(H-T-B)/(NB-1);
  var x=function(i){return (L+i*cw).toFixed(1);}, y=function(p){return (T+(p-1)*rh).toFixed(1);};
  var o='';
  // la bande des quatre places qui donnent des points : seulement AVANT le sprint
  o+='<rect x="'+L+'" y="'+(T-rh/2).toFixed(1)+'" width="'+(+x(iS)-L)+'" height="'+(rh*4).toFixed(1)+'" fill="#2ED47A12" stroke="#2ED47A28" stroke-dasharray="3 3"/>';
  [1,4,8,12,NB].forEach(function(p){
    o+='<line x1="'+L+'" y1="'+y(p)+'" x2="'+(W-Rr)+'" y2="'+y(p)+'" stroke="#ffffff08"/>';
    o+='<text x="'+(L-6)+'" y="'+(+y(p)+3.5)+'" fill="#6c7279" font-size="9" text-anchor="end" font-family="monospace">'+p+'</text>';
  });
  // la ligne du sprint
  o+='<line x1="'+x(iS)+'" y1="'+(T-rh/2-4)+'" x2="'+x(iS)+'" y2="'+(H-B+3)+'" stroke="#FFD166" stroke-width="1.6"/>';
  o+='<text x="'+x(iS)+'" y="'+(H-B+14)+'" fill="#FFD166" font-size="9" text-anchor="middle">sprint</text>';
  o+='<text x="'+L+'" y="'+(H-B+14)+'" fill="#6c7279" font-size="9">-'+span+'</text>';
  if(after.length)o+='<text x="'+(W-Rr)+'" y="'+(H-B+14)+'" fill="#6c7279" font-size="9" text-anchor="end">+'+span+'</text>';
  // les attaques qui tombent dans la fenêtre
  D.attacks.forEach(function(t){
    var idx=-1;
    rs.forEach(function(r,i){if(idx<0&&r.lap===t.from&&r.loop==='B')idx=i;});
    if(idx<0)return;
    o+='<line x1="'+x(idx)+'" y1="'+(T-rh/2-4)+'" x2="'+x(idx)+'" y2="'+(H-B+3)+'" stroke="#F2A33A" stroke-width="1" stroke-dasharray="2 2"/>';
    o+='<text x="'+(+x(idx)+3)+'" y="'+(T-rh/2+1)+'" fill="#F2A33A" font-size="8.5">'+t.bibs.join(' ')+' attack</text>';
  });
  D.riders.forEach(function(rd){
    if(bibs.indexOf(rd.bib)>=0)return;
    o+='<polyline points="'+rs.map(function(r,i){return x(i)+','+y(P(r,rd.bib));}).join(' ')+'" fill="none" stroke="#464c53" stroke-width="1"/>';
  });
  bibs.forEach(function(b,k){
    var c=cols[k%cols.length];
    o+='<polyline points="'+rs.map(function(r,i){return x(i)+','+y(P(r,b));}).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="2.4" stroke-linejoin="round"/>';
    o+='<circle cx="'+x(iS)+'" cy="'+y(P(rs[iS],b))+'" r="3" fill="'+c+'"/>';
  });
  return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" style="width:100%;height:'+H+'px;display:block">'+o+'</svg>';
}
function situationLine(si,span){
  var L=D.sprints[si].lap, lo=L-span+1, hi=L+span, out=[];
  D.attacks.forEach(function(t){
    if(t.from>=lo&&t.from<=hi) out.push(rid(t.bibs[0])+(t.bibs[1]?' and '+rid(t.bibs[1]):'')+' attacked on lap '+t.from+(t.got?' and took the lap':' and was caught on lap '+t.to));
    else if(t.from<lo&&t.to>=lo) out.push(rid(t.bibs[0])+(t.bibs[1]?' and '+rid(t.bibs[1]):'')+' already away since lap '+t.from);
  });
  return out.length?out.join('. '):'<span style="color:#6c7279">no attack in these laps</span>';
}
`;

/* ───────── surface 2 : les entraîneurs ───────── */
const CSS_COACH = `
.main.coach{gap:12px}
.col.pick{flex:0 0 288px}
.pickwrap{flex:1 1 auto;overflow:auto;padding:6px}
.pr{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:5px;cursor:pointer;border:1px solid transparent}
.pr:nth-child(even){background:#00000022}
.pr.on{background:#2b3138;border-color:var(--line2)}
.pr .dot{width:9px;height:9px;border-radius:3px;background:#3a4046;flex:0 0 auto}
.col.grid{flex:1.8 1 0}
.gridwrap{flex:1 1 auto;overflow:auto;padding:8px 10px}
.gblock{margin-bottom:16px}
.gbh{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.gbh .sum{margin-left:auto;font:600 11px var(--sans);color:var(--dim)}
table.ap{width:100%;border-collapse:separate;border-spacing:0 2px;font:600 12px var(--mono)}
table.ap th{font:700 9.5px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);padding:3px 4px 5px;text-align:center;border-bottom:1px solid var(--line)}
table.ap th.lf{text-align:left}
table.ap th.grp{color:#87a8c9}
table.ap td{padding:5px 4px;text-align:center;color:var(--dim);background:#1f2227}
table.ap td.lf{text-align:left;font:600 12px var(--sans);color:var(--muted);padding-left:8px;border-radius:4px 0 0 4px;white-space:nowrap}
table.ap td.last{border-radius:0 4px 4px 0}
table.ap td.p1{color:#0d2b1a;background:#2ED47A;font-weight:700}
table.ap td.sep{box-shadow:inset 1px 0 0 #3a4046}
table.ap td.gain{color:var(--good);font-weight:700}
table.ap td.loss{color:var(--crit);font-weight:700}
table.ap td.res{color:var(--muted);font-weight:700}
table.ap td.verdict{font:600 11.5px var(--sans);text-align:left;padding-left:8px}
table.ap td.ease{color:var(--good)}
table.ap td.front{color:var(--warn)}
.col.vs{flex:1 1 0;min-width:330px}
.col.charts{flex:3 1 0}
.chartwrap2{flex:1 1 auto;overflow:auto;padding:10px}
.cblock{margin-bottom:14px}
.cbh{display:flex;align-items:center;gap:9px;margin-bottom:6px}
.cbh .sp{margin-left:auto;font:600 11px var(--mono);color:var(--dim)}
.chartsrow{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}
.mini{flex:0 0 252px;background:#17191c;border:1px solid var(--line);border-radius:6px;padding:6px 8px}
.mini .cap{font:700 10px var(--sans);color:var(--dim);margin-bottom:3px;display:flex;gap:6px;align-items:center}
.mini .cap b{color:var(--fg);font-family:var(--mono);font-size:11px}
.wide{background:#17191c;border:1px solid var(--line);border-radius:6px;padding:8px 10px;margin-bottom:10px}
.wide .sit{font:500 12px/1.4 var(--sans);color:var(--dim);margin:0 0 6px}
.vswrap{flex:1 1 auto;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:9px}
.effwrap{flex:1 1 auto;overflow:auto;padding:12px;display:flex;flex-direction:row;align-items:stretch;gap:14px}
.story{display:flex;flex-direction:column;gap:0;margin:2px 0 2px}
.step:last-child{padding-bottom:2px}
.step::before{content:'';position:absolute;left:-5px;top:9px;width:8px;height:8px;border-radius:50%;background:var(--good)}
.step{border-left:2px solid var(--good);padding:5px 0 10px 12px;position:relative}
.step .lp{font:700 13px var(--mono);color:var(--fg)}
.step .tm{font:600 11px var(--mono);color:var(--dim);margin-left:5px}
.step .tx{display:block;font:500 12px var(--sans);color:var(--muted);margin-top:2px}
.effg{display:grid;grid-template-columns:1fr;gap:8px}
.kv{background:#1c1e22;border:1px solid var(--line);border-radius:6px;padding:8px 10px}
.kv .k2{display:block;font:700 9.5px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--dim);margin-bottom:4px}
.kv .v{font:700 15px var(--mono);color:var(--fg)}
.kv .v small{font:500 11.5px var(--sans);color:var(--dim)}
.eff{flex:0 0 430px;display:flex;flex-direction:column;gap:9px;overflow:auto;border:1px solid var(--line);border-radius:7px;background:#17191c;padding:12px 14px}
.effh{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.effh .pts{margin-left:auto;font:700 13px var(--mono);color:var(--good);border:1px solid #2ED47A66;border-radius:999px;padding:3px 11px}
`;

const coachHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Approach analysis (coaches)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>${CSS}${CSS_COACH}</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Approach analysis</b><span class="hint">for coaches — every rider, every sprint, read from the loops</span>
    <span class="seg" id="segV"><button class="on" data-v="chart">Charts</button><button data-v="app">Before the sprint</button><button data-v="aft">After the sprint</button><button data-v="eff">Lap gained</button></span>
    <span class="togo" id="rt"></span>
  </div>
  <div class="strip" id="strip">
    <span class="k">Laps watched</span><span class="seg" id="segL"></span>
    <span class="k" id="arrk">Laid out</span><span class="seg" id="segA"></span>
  </div>
  <div class="main coach" id="v-main">
    <div class="col pick">
      <div class="ch2">Riders <span class="sub">click to follow</span></div>
      <div class="pickwrap" id="pick"></div>
    </div>
    <div class="col grid" id="gridcol">
      <div class="ch2" id="gridh">Position lap by lap <span class="sub">two readings a lap — back straight, then the finish line</span></div>
      <div class="gridwrap" id="grid"></div>
    </div>
    <div class="col vs" id="vscol">
      <div class="ch2" id="vsh">Head to head <span class="sub">select two riders or more</span></div>
      <div class="vswrap" id="vs"></div>
    </div>
    <div class="col charts" id="chartcol" hidden>
      <div class="ch2" id="charth">Around the sprint <span class="sub">the laps before and after · the yellow line is the sprint · dotted orange is an attack</span></div>
      <div class="chartwrap2" id="charts"></div>
    </div>
  </div>
  <div class="col" id="v-eff" hidden style="flex:1 1 auto">
    <div class="ch2">A lap gained <span class="sub">what it took, from the attack to the credited lap</span></div>
    <div class="effwrap" id="eff"></div>
  </div>
  <div class="note">Positions come from the transponder loops — back straight and the finish line, two readings a lap — never from metres on the track. Every figure is given in laps and in time. How many laps are watched is not settled: 2, 3, 4 and 5 are all shown here.</div>
</div>
<script>
(function(){
${CLIENT_CORE.replace('__BLOB__', JSON_BLOB)}
__LAPGAINED__
__MINICHART__
var span=3, sel=[52,15], view='chart', arr='rider';
function colOf(b){var k=sel.indexOf(b);return k>=0?PAL[k%PAL.length]:null;}
function renderPick(){
  document.getElementById('pick').innerHTML=D.riders.map(function(r){
    var c=colOf(r.bib);
    return '<div class="pr'+(c?' on':'')+'" data-bib="'+r.bib+'">'+
      '<span class="dot" style="background:'+(c||'#3a4046')+'"></span>'+rid(r.bib,c)+'</div>';}).join('');
}
function lapLabel(sl,lap){var d=sl-lap;return d===0?'Sprint':d>0?d+(d===1?' lap':' laps')+' to go':(-d)+(d===-1?' lap':' laps')+' after';}
function headRow(rs,sl,extra){
  var h='<tr><th class="lf">Sprint</th>';
  rs.forEach(function(r){
    h+=(r.loop==='B')?'<th>Back</th>':'<th class="grp">'+lapLabel(sl,r.lap)+'</th>';
  });
  return h+extra+'</tr>';
}
function renderBefore(){
  var o='';
  sel.forEach(function(bib){
    var c=colOf(bib);
    o+='<div class="gblock"><div class="gbh">'+rid(bib,c)+'</div>';
    o+='<table class="ap">'+headRow(window_(0,span,false),D.sprints[0].lap,'<th>Last lap</th><th>Pts</th>');
    D.sprints.forEach(function(s){
      var rs=window_(D.sprints.indexOf(s),span,false), n=rs.length;
      o+='<tr><td class="lf">'+sprintLabel(s)+' <span style="color:#6c7279">lap '+s.lap+'</span></td>';
      rs.forEach(function(r,i){
        var p=P(r,bib), cl=p<=4?'p1':'';
        o+='<td class="'+cl+(r.loop==='B'&&i?' sep':'')+'">'+p+'</td>';
      });
      var g=P(rs[n-3],bib)-P(rs[n-1],bib), place=s.res.indexOf(bib);
      o+='<td class="sep '+(g>0?'gain':g<0?'loss':'')+'">'+(g>0?'+'+g:g<0?g:'0')+'</td>';
      o+='<td class="last res" style="color:'+(place>=0?'#2ED47A':'#5a5f66')+'">'+(place>=0?'+'+s.pts[place]:'·')+'</td></tr>';
    });
    o+='</table></div>';
  });
  document.getElementById('grid').innerHTML=o||card('Nobody selected','Pick a rider on the left.');
}
function situation(si){
  var L=D.sprints[si].lap, lo=L+1, hi=L+span, out=[];
  D.attacks.forEach(function(t){
    if(t.from>=lo&&t.from<=hi) out.push(t.bibs.map(function(b){return rid(b);}).join(' and ')+' attacked on lap '+t.from+(t.got?' and took the lap':' and was caught on lap '+t.to));
    else if(t.from<lo&&t.to>=lo) out.push(t.bibs.map(function(b){return rid(b);}).join(' and ')+' still away, '+(lo-t.from)+' laps into the move');
  });
  return out.length?out.join('. '):'<span style="color:#6c7279">no attack in these laps</span>';
}
function afterStats(si,bib){
  var rs=window_(si,span,true);
  if(!rs.length)return null;
  var low=0, lowAt=0;
  rs.forEach(function(r){var p=P(r,bib);if(p>low){low=p;lowAt=r.lap-D.sprints[si].lap;}});
  var endP=P(rs[rs.length-1],bib);
  return {rs:rs,low:low,lowAt:lowAt,end:endP,front:low<=4};
}
function renderAfter(){
  var o=card('What was going on after each sprint', D.sprints.map(function(s,si){
    return '<div style="margin-bottom:4px"><b style="color:#fffafa">'+sprintLabel(s)+'</b> — '+situation(si)+'</div>';}).join(''))+'<div style="height:12px"></div>';
  sel.forEach(function(bib){
    var c=colOf(bib), first=null;
    D.sprints.forEach(function(s,i){if(!first){var a=afterStats(i,bib);if(a)first=a;}});
    o+='<div class="gblock"><div class="gbh">'+rid(bib,c)+'</div>';
    if(!first){o+=card('Nothing after','The race ends on the last sprint.')+'</div>';return;}
    o+='<table class="ap">'+headRow(first.rs,D.sprints[0].lap,'');
    D.sprints.forEach(function(s,si){
      var a=afterStats(si,bib);
      var fr=window_(si,1,false); fr=fr[fr.length-1];
      o+='<tr><td class="lf">'+sprintLabel(s)+' <span style="color:#6c7279">lap '+s.lap+'</span> <b style="color:#ffecb3">'+ord(P(fr,bib))+'</b></td>';
      if(!a){o+='<td class="last" colspan="'+first.rs.length+'" style="color:#6c7279">the race ends here</td></tr>';return;}
      a.rs.forEach(function(r,i){
        o+='<td class="'+(r.loop==='B'&&i?'sep ':'')+(i===a.rs.length-1?'last':'')+'">'+P(r,bib)+'</td>';
      });
      o+='</tr>';
    });
    o+='</table></div>';
  });
  document.getElementById('grid').innerHTML=o||card('Nobody selected','Pick a rider on the left.');
}
function renderVs(){
  var o='', after=(view==='aft');
  if(sel.length<2){o=card('Head to head','Select a second rider to compare them.');}
  else{
    var a=sel[0],b=sel[1],ca=PAL[0],cb=PAL[1],body='';
    if(after){
      var lowA=0,lowB=0,nn=0;
      D.sprints.forEach(function(s,si){
        var sa=afterStats(si,a), sb=afterStats(si,b);
        if(!sa||!sb)return;
        lowA+=sa.low; lowB+=sb.low; nn++;
        body+=card(sprintLabel(s)+' — the '+span+' laps after · '+situation(si),
          rid(a,ca)+' went down to <span class="num">'+ord(sa.low)+'</span> on lap +<span class="num">'+sa.lowAt+'</span>, <span class="num">'+ord(sa.end)+'</span> at the end. '+
          rid(b,cb)+' down to <span class="num">'+ord(sb.low)+'</span> on lap +<span class="num">'+sb.lowAt+'</span>, <span class="num">'+ord(sb.end)+'</span> at the end.');
      });
      o=card('Over the race — where they sit after a sprint',
        'Lowest place reached in the '+span+' laps after a sprint, on average: '+rid(a,ca)+' <span class="num">'+(lowA/nn).toFixed(1)+'</span>, '+rid(b,cb)+' <span class="num">'+(lowB/nn).toFixed(1)+'</span>.')+body;
    } else {
      var aheadH=0,aheadF=0;
      D.sprints.forEach(function(s,si){
        var rs=window_(si,span,false),n=rs.length,pre=rs[n-2],fin=rs[n-1];
        var pa=P(pre,a),pb=P(pre,b),fa=P(fin,a),fb=P(fin,b);
        if(pa<pb)aheadH++;
        if(fa<fb)aheadF++;
        body+=card(sprintLabel(s)+' — lap '+s.lap+' · '+clock(s.racetime),
          'Half a lap from the line: '+rid(a,ca)+' <span class="num">'+ord(pa)+'</span>, '+rid(b,cb)+' <span class="num">'+ord(pb)+'</span>. '+
          'At the line <span class="num">'+ord(fa)+'</span> and <span class="num">'+ord(fb)+'</span>.');
      });
      o=card('Over the race — '+span+' laps of approach',
        rid(a,ca)+' was ahead of '+rid(b,cb)+' half a lap from the line in <span class="num">'+aheadH+' of '+D.sprints.length+'</span> sprints, and at the line in <span class="num">'+aheadF+'</span>.')+body;
    }
  }
  document.getElementById('vs').innerHTML=o;
}
function renderCharts(){
  var o='';
  if(!sel.length){o=card('Nobody selected','Pick a rider on the left.');}
  else if(arr==='rider'){
    // un coureur, ses sprints posés horizontalement
    sel.forEach(function(bib){
      o+='<div class="cblock"><div class="cbh">'+rid(bib,colOf(bib))+'</div><div class="chartsrow">';
      D.sprints.forEach(function(s,si){
        o+='<div class="mini"><div class="cap"><b>'+sprintLabel(s)+'</b> lap '+s.lap+' · '+clock(s.racetime)+'</div>'+miniChart(si,[bib],span,252,170,[colOf(bib)||PAL[0]])+'</div>';
      });
      o+='</div></div>';
    });
  } else {
    // les mêmes coureurs, un sprint par bande, les bandes empilées
    D.sprints.forEach(function(s,si){
      o+='<div class="wide"><div class="cbh">'+sprintLabel(s)+' <span style="color:#6c7279">lap '+s.lap+' · '+clock(s.racetime)+'</span></div>'+
         '<div class="sit">'+situationLine(si,span)+'</div>'+miniChart(si,sel,span,1000,190)+'</div>';
    });
  }
  document.getElementById('charts').innerHTML=o;
}
function render(){
  document.getElementById('rt').textContent='Race finished · '+D.laps+' laps · '+D.sprints.length+' sprints';
  document.getElementById('segL').innerHTML=[2,3,4,5].map(function(n){
    return '<button data-span="'+n+'" class="'+(n===span?'on':'')+'">'+n+' laps</button>';}).join('');
  renderPick();
  document.getElementById('gridh').innerHTML=(view==='aft'
    ? 'After the sprint <span class="sub">where they sat in the laps that follow, and what was going on in the race</span>'
    : 'Position lap by lap <span class="sub">two readings a lap — back straight, then the finish line</span>');
  document.getElementById('vsh').innerHTML=(view==='aft'
    ? 'Head to head <span class="sub">where each of them sat after the sprint</span>'
    : 'Head to head <span class="sub">select two riders or more</span>');
  document.getElementById('segA').innerHTML=[['rider','By rider'],['sprint','By sprint']].map(function(a){
    return '<button data-a="'+a[0]+'" class="'+(a[0]===arr?'on':'')+'">'+a[1]+'</button>';}).join('');
  document.getElementById('charth').innerHTML='Around the sprint <span class="sub">'+span+' laps before and after each sprint · the yellow line is the sprint · dotted orange is an attack</span>';
  if(view==='chart')renderCharts(); else if(view==='aft')renderAfter(); else if(view==='app')renderBefore();
  if(view!=='chart')renderVs();
  document.getElementById('eff').innerHTML=lapGained();
  document.getElementById('v-main').hidden=(view==='eff');
  document.getElementById('v-eff').hidden=(view!=='eff');
  document.getElementById('strip').hidden=(view==='eff');
  document.getElementById('chartcol').hidden=(view!=='chart');
  document.getElementById('gridcol').hidden=(view==='chart');
  document.getElementById('vscol').hidden=(view==='chart');
  document.getElementById('segA').hidden=(view!=='chart');
  document.getElementById('arrk').hidden=(view!=='chart');
}
document.addEventListener('click',function(e){
  var v=e.target.closest&&e.target.closest('[data-v]');
  if(v){view=v.dataset.v;document.querySelectorAll('#segV button').forEach(function(x){x.classList.toggle('on',x===v);});render();return;}
  var l=e.target.closest&&e.target.closest('[data-span]');
  if(l){span=+l.dataset.span;render();return;}
  var a=e.target.closest&&e.target.closest('[data-a]');
  if(a){arr=a.dataset.a;render();return;}
  var p=e.target.closest&&e.target.closest('.pr');
  if(p){var b=+p.dataset.bib,k=sel.indexOf(b);if(k>=0)sel.splice(k,1);else sel.push(b);render();}
});
render();
})();
</script>
</body></html>`;
fs.writeFileSync(`${BASE}/maquette-approches-coachs.html`, coachHtml.replace('__LAPGAINED__', LAPGAINED).replace('__MINICHART__', MINICHART));
console.log('maquette approches (entraineurs) ecrite');
