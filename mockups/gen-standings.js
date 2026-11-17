// Génère mockups/maquette-standings.html — le classement général.
//
// Une page, deux vues basculables dans l'en-tête (hand-off §9.4) :
//   · Live       — le classement complet finalisé (points par sprint, tours
//                  gagnés/perdus en points, Finish order, exports). Tout en anglais.
//   · Evolution  — la vue « Compare » validée le 16 novembre 2026 : le classement à
//                  l'instant choisi sert de sélecteur (panneau gauche), on suit jusqu'à
//                  4 coureurs, le graphe montre leurs points dans le temps et l'écart,
//                  et un clic sur un moment re-classe le panneau à cet instant.
//
// Prénoms ILLUSTRATIFS : le modèle n'a que le nom de famille ; à l'intégration le
// prénom vient de la vraie startlist. Tours gagnés/perdus (cohérents « Lap by lap ») :
// 12 gagne L17/L34/L48, 70 perd L19.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };
const NS = D.sprints.length, LAP_PTS = 20;

const sprintPts = {};
for (const b of Object.keys(R)) sprintPts[b] = {};
D.sprints.forEach((s, i) => s.seq.forEach(e => { sprintPts[e.bib][i] = e.pts || 0; }));
const lapEvents = { 12: { gained: [17, 34, 48], lost: [] }, 70: { gained: [], lost: [19] } };

let rows = Object.keys(R).map(b => {
  const bib = +b;
  const spr = Object.values(sprintPts[b]).reduce((a, p) => a + p, 0);
  const ev = lapEvents[bib] || { gained: [], lost: [] };
  const lapPts = LAP_PTS * (ev.gained.length - ev.lost.length);
  return { bib, nat: R[b].nat, name: R[b].name, spr, ev, lapPts, total: spr + lapPts };
});
const finalOrder = D.sprints[NS - 1].seq.map(e => e.bib);
const fIdx = b => { const i = finalOrder.indexOf(+b); return i < 0 ? 99 : i; };
rows.forEach(r => r.fin = fIdx(r.bib) + 1);
rows.sort((a, b) => (b.total - a.total) || (a.fin - b.fin) || (a.bib - b.bib));
rows.forEach((r, i) => r.rank = i + 1);
// Type de course : qualification (les N premiers passent au tour suivant) ou finale.
// Fixé avant la course (comme les tours et les sprints). En qualification, une ligne de
// coupe sépare qualifiés et éliminés ; en finale, pas de coupe.
const RACE = { type: 'qualification', advance: 10 };

const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - n % 10 == 10) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th');
const sprHd = D.sprints.map((s, i) => `<span class="sp">${s.final ? 'F' : 'S' + (i + 1)}</span>`).join('');

/* ===== vue Live (le classement complet) =================================== */
const rowHtml = r => {
  const spr = D.sprints.map((s, i) => { const p = sprintPts[r.bib][i] || 0; return `<span class="sp${p ? ' on' : ''}">${p || '·'}</span>`; }).join('');
  const gained = r.ev.gained.length ? `<span class="lpill up">+${r.ev.gained.length * LAP_PTS}</span> <span class="lp">L${r.ev.gained.join(', L')}</span>` : '<span class="z">·</span>';
  const lost = r.ev.lost.length ? `<span class="lpill down">−${r.ev.lost.length * LAP_PTS}</span> <span class="lp">L${r.ev.lost.join(', L')}</span>` : '<span class="z">·</span>';
  return `<div class="row${RACE.type === 'qualification' && r.rank > RACE.advance ? ' elim' : ''}">
    <span class="rk">${r.rank}</span>
    <span class="chip">${r.bib}</span>
    <span class="flagw">${flag(r.nat)}</span>
    <span class="noc">${r.nat}</span>
    <span class="nm"><span class="fn">${FIRST[r.bib] || ''}</span> <b>${r.name.toUpperCase()}</b></span>
    <span class="tot">${r.total}</span>
    <span class="sep"></span>
    <span class="sprints">${spr}</span>
    <span class="sep"></span>
    <span class="lap">${gained}</span>
    <span class="lap">${lost}</span>
    <span class="sep"></span>
    <span class="fin">${ord(r.fin)}</span>
  </div>`;
};
const liveView = `<div class="tbl" id="v-table">
    <div class="hd">
      <span class="r">#</span><span>Bib</span><span></span><span>NOC</span><span>Rider</span><span class="r">Total</span>
      <span></span><span class="hdsprints">${sprHd}</span><span></span>
      <span class="c">Lap +</span><span class="c">Lap −</span><span></span><span class="c fo">Finish order</span>
    </div>
    ${rows.map(r => rowHtml(r) + (RACE.type === 'qualification' && r.rank === RACE.advance ? `\n    <div class="cutrow"><span>Qualification cut &middot; top ${RACE.advance} advance to the next round</span></div>` : '')).join('\n    ')}
  </div>`;

/* ===== vue Evolution (Compare) ============================================ */
// checkpoints, dans l'ordre de la course
const CK = [
  { l: 'Start', lap: null, kind: 'start' },
  { l: 'S1', lap: 10, kind: 'sprint', k: 0 },
  { l: '+1', lap: 17, kind: 'gain', bib: 12, d: +LAP_PTS },
  { l: '−1', lap: 19, kind: 'lose', bib: 70, d: -LAP_PTS },
  { l: 'S2', lap: 20, kind: 'sprint', k: 1 },
  { l: 'S3', lap: 30, kind: 'sprint', k: 2 },
  { l: '+1', lap: 34, kind: 'gain', bib: 12, d: +LAP_PTS },
  { l: 'S4', lap: 40, kind: 'sprint', k: 3 },
  { l: '+1', lap: 48, kind: 'gain', bib: 12, d: +LAP_PTS },
  { l: 'S5', lap: 50, kind: 'sprint', k: 4 },
  { l: 'F', lap: 60, kind: 'sprint', k: 5 },
];
const run = {}; Object.keys(R).forEach(b => run[b] = 0);
const rankS = {}, ptsS = {}; Object.keys(R).forEach(b => { rankS[b] = []; ptsS[b] = []; });
CK.forEach(e => {
  if (e.k != null) Object.keys(R).forEach(b => run[b] += (sprintPts[b][e.k] || 0));
  if (e.bib != null) run[e.bib] += e.d;
  const order = Object.keys(R).map(Number).sort((a, b) => (run[b] - run[a]) || (fIdx(a) - fIdx(b)) || (a - b));
  order.forEach((b, i) => rankS[b].push(i + 1));
  Object.keys(R).forEach(b => ptsS[b].push(run[b]));
});
const bibsFinal = rows.map(r => r.bib);   // par rang final
const DATA = { CK: CK.map(e => ({ l: e.l, lap: e.lap, kind: e.kind })), order: bibsFinal, riders: {} };
bibsFinal.forEach(b => { DATA.riders[b] = { nat: R[b].nat, name: R[b].name, flag: flag(R[b].nat), pts: ptsS[b], rank: rankS[b] }; });
const DATA_JSON = JSON.stringify(DATA).replace(/</g, '\\u003c');

// Rendu client (voir le <script>) : panneau gauche = classement à l'instant + sélecteur.
const evoView = `<div class="compare" id="v-evo" hidden>
    <div class="side">
      <div class="sh" id="cmp-lefth">Standings</div>
      <div class="rlist" id="cmp-left"></div>
    </div>
    <div class="cmp-content">
      <div class="cmp-top" id="cmp-head"></div>
      <div class="cmp-body" id="cmp-body"></div>
      <div class="cmp-note">Click a rider in the standings to follow them (up to 4). Click a moment in the race to re-rank the standings to that point. Long race: scroll the chart sideways — the scale and the names stay put.</div>
    </div>
  </div>`;

/* ===== page ============================================================== */
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Standings</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.seg{display:inline-flex;border:1px solid var(--line2);border-radius:5px;overflow:hidden}
.seg button{font:600 12px var(--sans);color:var(--dim);border:0;padding:5px 14px;background:#23272b;cursor:pointer;border-right:1px solid var(--line2)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--acc);color:#fff}
.board-h .ex{margin-left:auto;display:flex;gap:6px}
.exbtn{font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:5px 11px;background:#23272b;cursor:pointer;white-space:nowrap}

/* ---- vue Live (table) ---- */
.tbl{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto}
.hd,.row{display:grid;grid-template-columns:44px 52px 30px 48px 248px 80px 14px ${NS * 58}px 14px 176px 176px 14px 124px 1fr;gap:9px;align-items:center;padding:0 10px}
.hd{height:30px;font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--line2)}
.hd span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hd .r{text-align:right}.hd .c{text-align:center}
.row{min-height:44px;border-bottom:1px solid #23262a;font-size:14px}
.row:nth-child(even){background:#00000022}
.row.elim{opacity:.46}
.cutrow{display:flex;align-items:center;gap:12px;height:30px;padding:0 12px}
.cutrow span{font:700 10px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--warn);white-space:nowrap}
.cutrow::before,.cutrow::after{content:"";height:0;border-top:2px dashed var(--warn);flex:1 1 auto}
.cutlb{font:700 9px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--warn);text-align:center;padding:4px 0;border-top:2px dashed var(--warn);margin:3px 6px 1px}
.rk{font:600 15px var(--mono);color:var(--muted);text-align:right}
.chip{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:25px;font:600 15px var(--mono);color:var(--fg)}
.flagw .flag{width:27px;height:17px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.noc{font:600 14px var(--mono);letter-spacing:.03em;color:var(--dim)}
.nm{font:600 15px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.01em}
.nm .fn{color:var(--dim);font-weight:500}
.nm b{color:var(--muted);font-weight:700}
.tot{font:700 21px var(--mono);color:var(--fg);text-align:right;font-variant-numeric:tabular-nums}
.sep{height:70%;border-left:1px solid var(--line)}
.sprints{display:grid;grid-template-columns:repeat(${NS},1fr);gap:2px}
.sprints .sp{min-width:0;text-align:center;font:500 15px var(--mono);color:var(--dim);font-variant-numeric:tabular-nums;padding:4px 0;border-radius:4px}
.sprints .sp.on{color:var(--fg);font-weight:700;background:#39311c}
.lap{font:500 13px var(--mono);color:var(--dim);white-space:normal;line-height:1.3;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.lpill{display:inline-block;font:700 14px var(--mono);border-radius:5px;padding:2px 9px;font-variant-numeric:tabular-nums}
.lpill.up{color:#121416;background:var(--good)}
.lpill.down{color:#fff;background:var(--crit)}
.lap .lp{color:var(--dim);font-size:12px}
.lap .z{color:#555;font-size:16px}
.fin{font:600 15px var(--mono);color:var(--muted);text-align:center}
.hd .fo{white-space:normal;line-height:1.05;text-align:center}
.hdsprints{display:grid;grid-template-columns:repeat(${NS},1fr);gap:2px}
.hdsprints span{text-align:center}

/* ---- panneau latéral partagé ---- */
.side{flex:0 0 268px;display:flex;flex-direction:column;min-height:0;background:#1c1e22;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.sh{font:600 11px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:9px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}
.sh .hint{font:500 10px var(--sans);letter-spacing:0;text-transform:none;color:var(--dim)}
.rlist{flex:1 1 auto;overflow:auto;padding:4px}

/* ---- vue Evolution (Compare) ---- */
.compare{flex:1 1 auto;min-height:0;display:flex;gap:14px}
.side .at{color:var(--fg);text-transform:none;letter-spacing:0;font-weight:700;margin-left:4px}
.lb{display:grid;grid-template-columns:22px 11px 26px 30px 1fr 36px;gap:8px;align-items:center;width:100%;background:none;border:0;border-radius:5px;padding:6px 8px;cursor:pointer;text-align:left;color:var(--dim)}
.lb:hover{background:#24272c}
.lb .rrk{font:700 13px var(--mono);color:var(--dim);text-align:right}
.lb .sw{width:11px;height:11px;border-radius:3px;background:#3a4046}
.lb.on{background:#23272e;color:var(--muted)}
.lb.on .rrk{color:var(--muted)}.lb.on .sw{background:var(--c)}
.lb .flagw .flag{width:24px;height:16px;border-radius:2px;display:block}
.lb .rbib{font:600 13px var(--mono);color:var(--fg)}
.lb .rnm{font:600 13px var(--sans);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lb .rtot{font:700 14px var(--mono);color:var(--fg);text-align:right}
.cmp-content{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}
.cmp-top{flex:0 0 auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap;min-height:24px}
.cmp-top .leg{display:inline-flex;align-items:center;gap:7px;font:600 14px var(--sans);color:var(--muted)}
.cmp-top .leg .sw{width:12px;height:12px;border-radius:3px}
.cmp-top .leg .flagw .flag{width:24px;height:16px;border-radius:2px;display:block}
.cmp-top .leg b{font:700 14px var(--mono);color:var(--fg)}
.cmp-top .gap{margin-left:auto;font:600 15px var(--sans);color:var(--muted)}
.cmp-top .gap b{color:var(--fg);font-size:17px}
.cmp-body{flex:1 1 auto;min-height:0;display:flex}
.cmp-fixed{flex:0 0 auto;display:flex;flex-direction:column;z-index:2}
.cmp-scroll{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;overflow-x:auto;overflow-y:hidden}
.cyaxis,.csvg{display:block;flex:0 0 auto}
.csvg .grid{stroke:#ffffff10}
.cyaxis .axn{fill:var(--dim);font:600 13px var(--mono);text-anchor:end}
.csvg .colg{stroke:#ffffff0b}.csvg .colg.on{stroke:#ffffff18}
.csvg .cxl{text-anchor:middle;font:700 13px var(--sans)}
.csvg .cxl.sprint{fill:var(--fg)}.csvg .cxl.gain{fill:var(--good)}.csvg .cxl.lose{fill:var(--crit)}.csvg .cxl.start{fill:var(--dim)}
.csvg .cxs{text-anchor:middle;fill:var(--dim);font:500 11px var(--mono)}
.csvg .ptlab{text-anchor:middle;font:700 13px var(--mono)}
.csvg .ptlab.l{text-anchor:end}.csvg .ptlab.r{text-anchor:start}
.csvg .gapband{fill:#ffffff10}
.csvg .ckhit{cursor:pointer;fill:#fff;fill-opacity:0}.csvg .ckhit:hover{fill-opacity:.04}.csvg .cksel{fill:#ffffff0e}
.csvg .enbib{font:700 14px var(--mono)}.csvg .ennm{font:600 13px var(--sans);fill:var(--muted)}
.cmp-note{flex:0 0 auto;font:500 12px var(--sans);color:var(--dim)}
.cmp-ltbl{display:flex;flex-direction:column;background:#1c1e22;border:1px solid var(--line);border-right:0;border-radius:6px 0 0 6px;overflow:hidden}
.cmp-rtbl{display:grid;background:#1c1e22;border:1px solid var(--line);border-left:0;border-radius:0 6px 6px 0;overflow:hidden}
.lh{height:28px;display:flex;align-items:center;padding-left:10px;font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid #2a2e33}
.lr{height:34px;display:flex;align-items:center;gap:6px;padding-left:8px;font:600 12px var(--sans);color:var(--muted);border-bottom:1px solid #2a2e33;border-left:3px solid var(--c);white-space:nowrap;overflow:hidden}
.lr .sw{width:10px;height:10px;border-radius:3px;background:var(--c);flex-shrink:0}
.lg{height:28px;display:flex;align-items:center;padding-left:10px;font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--dim)}
.cc{display:flex;flex-direction:column;min-width:0;border-right:1px solid #2a2e33}
.cc[data-ck]{cursor:pointer}.cc[data-ck]:hover{background:#23262b}.cc[data-ck].on{background:#272b31}
.cc:last-child{border-right:0}
.cck{height:28px;display:flex;align-items:center;justify-content:center;gap:5px;font:700 12px var(--sans);color:var(--muted);border-bottom:1px solid #2a2e33}
.cck span{font:500 10px var(--mono);color:var(--dim)}
.ccr{height:34px;display:flex;align-items:center;justify-content:center;gap:5px;border-bottom:1px solid #2a2e33;border-left:3px solid var(--c)}
.ccr b{font:700 15px var(--mono);color:var(--fg)}.ccr span{font:600 11px var(--mono);color:var(--dim)}
.ccg{height:28px;display:flex;align-items:center;justify-content:center;font:700 13px var(--mono)}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Standings</b>
    <span class="seg"><button class="on" data-view="table">Live</button><button data-view="evo">Evolution</button></span>
    <span class="hint" id="hint">overall classification · points per sprint · laps won / lost · finish order</span>
    <span class="ex"><button class="exbtn">Export PDF</button><button class="exbtn">Export CSV</button></span>
  </div>
  ${liveView}
  ${evoView}
</div>
<script>
(function(){
  // mode « embed » (vue reçue dans la console commentateurs) : on masque les exports opérateur
  // et on neutralise le cadre interne pour que la vue remplisse l'iframe (pas de double cadre)
  if(/embed/.test(location.search)){
    var _ex=document.querySelector('.ex');if(_ex)_ex.style.display='none';
    var _b=document.querySelector('.board');if(_b)_b.style.cssText+=';position:static;inset:auto;height:100%;border:0;border-radius:0;box-shadow:none;background:transparent;padding:4px 6px 8px';
    document.documentElement.style.height='100%';document.body.style.height='100%';document.body.style.background='transparent';
  }
  var CUT=${RACE.type === 'qualification' ? RACE.advance : 0};   // ligne de coupe (0 = finale, pas de coupe)
  var hints={table:"overall classification · points per sprint · laps won / lost · finish order",
             evo:"follow up to 4 riders · see how they move and how the gap changes · click a moment to re-rank"};
  // ---- Evolution (Compare) : rendu client ----
  var DATA=${DATA_JSON};
  var order=DATA.order, CKc=DATA.CK, nck=CKc.length;
  var PAL=['#2ED47A','#45B6D6','#E0B64A','#A98BE6'];
  var MAX=4, sel=order.slice(0,2), snapAt=nck-1;
  var colOf=function(b){var i=sel.indexOf(b);return i>=0?PAL[i]:'#565c64';};
  var ckLab=function(i){var e=CKc[i];return (e.kind==='gain'?'+1 lap':e.kind==='lose'?'−1 lap':e.l)+(e.lap!=null?' · L'+e.lap:'');};
  function renderLeft(){
    document.getElementById('cmp-lefth').innerHTML='Standings <span class="at">@ '+ckLab(snapAt)+'</span>';
    var i=snapAt, ranked=order.slice().sort(function(a,b){return DATA.riders[a].rank[i]-DATA.riders[b].rank[i];});
    document.getElementById('cmp-left').innerHTML=ranked.map(function(b){
      var r=DATA.riders[b],on=sel.indexOf(b)>=0;
      var row='<button class="lb'+(on?' on':'')+'" data-bib="'+b+'"'+(on?' style="--c:'+colOf(b)+'"':'')+'><span class="rrk">'+r.rank[i]+'</span><span class="sw"></span><span class="flagw">'+r.flag+'</span><span class="rbib">'+b+'</span><span class="rnm">'+r.name+'</span><span class="rtot">'+r.pts[i]+'</span></button>';
      return row+(CUT&&r.rank[i]===CUT?'<div class="cutlb">top '+CUT+' advance</div>':'');
    }).join('');
  }
  function renderHead(){
    var leg=sel.map(function(b){var r=DATA.riders[b];return '<span class="leg"><span class="sw" style="background:'+colOf(b)+'"></span><span class="flagw">'+r.flag+'</span><b>'+b+'</b> '+r.name+'</span>';}).join('');
    var gap='';
    if(sel.length===2){var a=sel[0],b=sel[1],gv=DATA.riders[a].pts[nck-1]-DATA.riders[b].pts[nck-1],ld=gv>=0?a:b,tr=gv>=0?b:a;gap='<span class="gap">'+DATA.riders[ld].name+' leads '+DATA.riders[tr].name+' by <b>'+Math.abs(gv)+' pts</b></span>';}
    document.getElementById('cmp-head').innerHTML=leg+gap;
  }
  function renderChart(){
    renderHead();
    var body=document.getElementById('cmp-body');
    if(!sel.length){body.innerHTML='<div style="margin:auto;color:var(--dim);font:500 14px var(--sans)">Click a rider in the standings to start comparing.</div>';return;}
    var labelW=190,minColW=86,endPad=156,mT=18,mB=40;
    var availW=body.clientWidth||1000,availH=body.clientHeight||480;
    var colW=Math.max(minColW,Math.floor((availW-labelW-endPad)/nck)),plotW=nck*colW;
    var tableH=28+sel.length*34+(sel.length===2?28:0),H=Math.max(200,availH-tableH-2);
    var ys=[0];sel.forEach(function(b){DATA.riders[b].pts.forEach(function(v){ys.push(v);});});
    var yMax=Math.max.apply(null,ys),yMin=Math.min.apply(null,ys);
    var pad=Math.max(6,(yMax-yMin)*0.12);yMax+=pad;yMin=yMin<0?yMin-pad:0;
    var cY=function(v){return mT+(yMax-v)/(yMax-yMin)*(H-mT-mB);};
    var cX=function(i){return (i+0.5)*colW;};
    var step=(yMax-yMin)>50?20:10,v;
    var ax='';for(v=Math.ceil(yMin/step)*step;v<=yMax;v+=step)ax+='<text x="'+(labelW-16)+'" y="'+(cY(v)+5).toFixed(1)+'" class="axn">'+v+'</text>';
    var yaxis='<svg class="cyaxis" width="'+labelW+'" height="'+H+'">'+ax+'</svg>';
    var g='';for(v=Math.ceil(yMin/step)*step;v<=yMax;v+=step)g+='<line x1="0" y1="'+cY(v).toFixed(1)+'" x2="'+plotW+'" y2="'+cY(v).toFixed(1)+'" class="grid"/>';
    var xl='';CKc.forEach(function(e,i){var xi=cX(i).toFixed(1),cls=e.kind==='sprint'?'sprint':e.kind==='gain'?'gain':e.kind==='lose'?'lose':'start',lab=e.kind==='gain'?'+1':e.kind==='lose'?'−1':e.l;xl+='<line x1="'+xi+'" y1="'+mT+'" x2="'+xi+'" y2="'+(H-mB)+'" class="colg'+(e.kind==='sprint'?' on':'')+'"/><text x="'+xi+'" y="'+(H-22)+'" class="cxl '+cls+'">'+lab+'</text>'+(e.lap!=null?'<text x="'+xi+'" y="'+(H-7)+'" class="cxs">L'+e.lap+'</text>':'');});
    var selrect='<rect x="'+(snapAt*colW)+'" y="'+mT+'" width="'+colW+'" height="'+(H-mT-mB)+'" class="cksel"/>';
    var hits='';CKc.forEach(function(e,i){hits+='<rect x="'+(i*colW)+'" y="'+mT+'" width="'+colW+'" height="'+(H-mT-mB)+'" data-ck="'+i+'" class="ckhit"/>';});
    var band='';
    if(sel.length===2){var pa=DATA.riders[sel[0]].pts,pb=DATA.riders[sel[1]].pts,p=[],k;for(k=0;k<nck;k++)p.push(cX(k).toFixed(1)+','+cY(pa[k]).toFixed(1));for(k=nck-1;k>=0;k--)p.push(cX(k).toFixed(1)+','+cY(pb[k]).toFixed(1));band='<polygon points="'+p.join(' ')+'" class="gapband"/>';}
    var lines='';sel.forEach(function(b){var r=DATA.riders[b],c=colOf(b),pts=r.pts.map(function(v,i){return cX(i).toFixed(1)+','+cY(v).toFixed(1);}).join(' ');lines+='<polyline points="'+pts+'" fill="none" stroke="'+c+'" stroke-width="3.5" stroke-linejoin="round"/>';r.pts.forEach(function(v,i){lines+='<circle cx="'+cX(i).toFixed(1)+'" cy="'+cY(v).toFixed(1)+'" r="4.2" fill="'+c+'"/>';});var ye=cY(r.pts[nck-1]);var fl=r.flag.replace('<svg class="flag"','<svg class="flag" x="'+(plotW+8)+'" y="'+(ye-8).toFixed(1)+'" width="22" height="15"');lines+='<g>'+fl+'<text x="'+(plotW+36)+'" y="'+(ye+5).toFixed(1)+'" class="enbib" fill="'+c+'">'+b+'</text><text x="'+(plotW+62)+'" y="'+(ye+5).toFixed(1)+'" class="ennm">'+r.name+'</text></g>';});
    var labels='';
    if(sel.length===2){var pa=DATA.riders[sel[0]].pts,pb=DATA.riders[sel[1]].pts,ca=colOf(sel[0]),cb=colOf(sel[1]);var L=function(x,y,c,vv,cl){return '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" class="ptlab'+(cl?' '+cl:'')+'" fill="'+c+'">'+vv+'</text>';};CKc.forEach(function(e,i){var yA=cY(pa[i]),yB=cY(pb[i]),x=cX(i);if(Math.abs(yA-yB)>=24){labels+=L(x,yA-11,ca,pa[i])+L(x,yB-11,cb,pb[i]);}else if(Math.max(yA,yB)>H-mB-22){var yt=Math.min(yA,yB)-11;labels+=L(x-7,yt,ca,pa[i],'l')+L(x+7,yt,cb,pb[i],'r');}else{labels+=yA<=yB?L(x,yA-11,ca,pa[i])+L(x,yB+17,cb,pb[i]):L(x,yA+17,ca,pa[i])+L(x,yB-11,cb,pb[i]);}});}
    var plot='<svg class="csvg" width="'+(plotW+endPad)+'" height="'+H+'">'+g+selrect+xl+band+lines+labels+hits+'</svg>';
    var ltbl='<div class="cmp-ltbl"><div class="lh">Update</div>'+sel.map(function(b){return '<div class="lr" style="--c:'+colOf(b)+'"><span class="sw"></span><b style="font:700 13px var(--mono);color:var(--fg)">'+b+'</b> '+DATA.riders[b].name+'</div>';}).join('')+(sel.length===2?'<div class="lg">Gap</div>':'')+'</div>';
    var cols='';CKc.forEach(function(e,i){var cell='<div class="cc'+(i===snapAt?' on':'')+'" data-ck="'+i+'"><div class="cck">'+(e.kind==='gain'?'+1':e.kind==='lose'?'−1':e.l)+(e.lap!=null?'<span>L'+e.lap+'</span>':'')+'</div>';sel.forEach(function(b){var r=DATA.riders[b];cell+='<div class="ccr" style="--c:'+colOf(b)+'"><b>'+r.pts[i]+'</b><span>P'+r.rank[i]+'</span></div>';});if(sel.length===2){var gi=DATA.riders[sel[0]].pts[i]-DATA.riders[sel[1]].pts[i],lc=gi>0?colOf(sel[0]):gi<0?colOf(sel[1]):'#6b7178';cell+='<div class="ccg" style="color:'+lc+'">'+(gi===0?'—':(gi>0?'+':'−')+Math.abs(gi))+'</div>';}cols+=cell+'</div>';});
    var rtbl='<div class="cmp-rtbl" style="grid-template-columns:repeat('+nck+','+colW+'px);width:'+plotW+'px">'+cols+'</div>';
    body.innerHTML='<div class="cmp-fixed" style="width:'+labelW+'px">'+yaxis+ltbl+'</div><div class="cmp-scroll">'+plot+rtbl+'</div>';
  }
  function renderAll(){renderLeft();renderChart();}
  document.getElementById('cmp-left').addEventListener('click',function(e){
    var btn=e.target.closest('.lb');if(!btn)return;
    var bib=+btn.dataset.bib,i=sel.indexOf(bib);
    if(i>=0)sel.splice(i,1);else{if(sel.length>=MAX)return;sel.push(bib);}
    renderAll();
  });
  document.getElementById('cmp-body').addEventListener('click',function(e){
    var t=e.target.closest('[data-ck]');if(!t)return;
    snapAt=+t.getAttribute('data-ck');renderAll();
  });
  window.addEventListener('resize',function(){if(!document.getElementById('v-evo').hidden)renderChart();});
  // ---- bascule Live / Evolution ----
  var btns=document.querySelectorAll('[data-view]');
  btns.forEach(function(btn){btn.addEventListener('click',function(){
    var vv=btn.dataset.view;
    btns.forEach(function(b){b.classList.toggle('on',b===btn);});
    document.getElementById('v-table').hidden=(vv!=='table');
    document.getElementById('v-evo').hidden=(vv!=='evo');
    document.getElementById('hint').textContent=hints[vv];
    if(vv==='evo') renderAll();
  });});
})();
</script>
</body></html>`;
fs.writeFileSync(`${BASE}/maquette-standings.html`, html);
console.log('maquette standings écrite · Live + Evolution · ' + rows.length + ' coureurs, ' + NS + ' sprints, ' + CK.length + ' checkpoints');
