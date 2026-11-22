// Génère mockups/maquette-racefacts.html — l'onglet « Race facts » du fil commentateurs.
//
// Il PREND LA PLACE de l'onglet « Race log » dans le fil (regles-operateur.md §303) ; le Race log
// de la vue Course, lui, ne change pas. Neuf familles de phrases, écrites depuis ce que le moteur
// mesure déjà : le sprint · l'approche · le tour gagné ou perdu · l'échappée · le coureur décroché ·
// le classement · la ligne de coupe · ce qui reste possible · la chute.
// Les alertes matériel n'y entrent pas.
//
// Les faits sont ILLUSTRATIFS et repris de ceux du fil et du Race log : les trois tours de
// 12 Huber (17, 34, 48), le tour perdu de 70 Silva (19), la chute du tour 20 et la neutralisation.
// Les coureurs, les sprints et le classement sont ceux de sprints.json.
//
//   node gen-racefacts.js

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };

// <BIB> <Flag> <NOC> <Prénom> <NOM> — la référence au coureur, partout (regles-operateur.md §276)
const r = (bib, hi) => `<span class="r${hi ? ' hi' : ''}"><b>${bib}</b>${flag(R[bib].nat).replace('<svg ', '<svg class="f" ')}<span class="noc">${R[bib].nat}</span> <span class="fn">${FIRST[bib]}</span> <span class="ln">${R[bib].name.toUpperCase()}</span></span>`;

const FAM = {
  sprint:   { label: 'Sprint',        c: '#8FB4FF' },
  approach: { label: 'Approach',      c: '#ffecb3' },
  lap:      { label: 'Lap',           c: '#2ED47A' },
  lost:     { label: 'Lap',           c: '#FF5C5C' },
  brk:      { label: 'Breakaway',     c: '#F2A33A' },
  drop:     { label: 'Dropped',       c: '#c1bdb4' },
  stand:    { label: 'Standings',     c: '#ffecb3' },
  cut:      { label: 'Cut line',      c: '#F2A33A' },
  out:      { label: 'Still possible',c: '#8FB4FF' },
  crash:    { label: 'Crash',         c: '#FF5C5C' },
};

// Les faits, du plus récent au plus ancien. head = retenu par la bascule « Headlines ».
const F = [
{ rt:'18:12.0', lap:60, fam:'stand', head:1, s:()=>`Final classification — ${r(12,1)} wins the race with <b>60 points</b>, 25 clear of ${r(15,1)}. ${r(4)} is third on 21.` },
{ rt:'18:06.0', lap:60, fam:'sprint', head:1, s:()=>`Final sprint, points doubled — ${r(15,1)} wins it from ${r(4)}, ${r(11)} and ${r(23)}. <b>+10 · +6 · +4 · +2</b>. Six sprints, six wins.` },
{ rt:'18:05.8', lap:60, fam:'approach', s:()=>`${r(15,1)} was <b>6th</b> with two laps to go. He moved up on the back straight of the last lap and led at the line by <b>0.12 s</b>.` },
{ rt:'18:05.6', lap:60, fam:'cut', head:1, s:()=>`${r(9,1)} is the last rider through to the next round — level on 0 points with ${r(3)}, ahead on the finish order.` },
{ rt:'17:49.0', lap:60, fam:'out', s:()=>`Last lap — <b>10 points</b> on the line. ${r(12)} cannot be caught.` },
{ rt:'16:00.0', lap:50, fam:'sprint', head:1, s:()=>`Sprint 5 — ${r(15,1)} takes his fifth in a row, from ${r(4)}, ${r(11)} and ${r(23)}. <b>+5 · +3 · +2 · +1</b>.` },
{ rt:'15:58.4', lap:50, fam:'approach', s:()=>`${r(15,1)} sat <b>4th</b> for the two laps of the approach and came round on the back straight of the last one.` },
{ rt:'15:40.0', lap:49, fam:'out', s:()=>`<b>15 points</b> left — 5 at sprint 5, 10 at the final. A lap gained is still worth <b>+20</b>.` },
{ rt:'14:30.2', lap:48, fam:'lap', head:1, s:()=>`<b>+20</b> — ${r(12,1)} takes his third lap. He attacked on lap 41, seven laps after sprint 4, and was out front for <b>7 laps · 1:57.9</b>. ${r(46)} went with him and was caught on lap 45.` },
{ rt:'14:30.0', lap:48, fam:'stand', head:1, s:()=>`${r(12,1)} moves 25 points clear of ${r(15,1)} — and he is the only rider who has gained a lap.` },
{ rt:'12:48.0', lap:40, fam:'sprint', head:1, s:()=>`Sprint 4 — ${r(15,1)} again, from ${r(4)}, ${r(11)} and ${r(23)}. <b>+5 · +3 · +2 · +1</b>.` },
{ rt:'12:46.5', lap:40, fam:'approach', s:()=>`The four who scored were the four who led onto the last lap — nothing changed between the back straight and the line.` },
{ rt:'10:12.0', lap:34, fam:'lap', head:1, s:()=>`<b>+20</b> — ${r(12,1)} takes a second lap, on lap 34. Away since lap 27, <b>7 laps · 1:56.4</b>, alone from lap 30.` },
{ rt:'9:36.0',  lap:30, fam:'sprint', head:1, s:()=>`Sprint 3 — ${r(15,1)} wins it from ${r(4)}, ${r(11)} and ${r(23)}. <b>+5 · +3 · +2 · +1</b>.` },
{ rt:'6:55.0',  lap:25, fam:'crash', head:1, s:()=>`Racing resumes — the race is relaunched after five neutralised laps. Sprint 3 is run in four laps.` },
{ rt:'6:38.4',  lap:24, fam:'crash', s:()=>`${r(67,1)} is back on a spare bike with <b>1 lap left to rejoin</b> — he takes his place in the bunch and loses nothing.` },
{ rt:'5:30.1',  lap:20, fam:'crash', head:1, s:()=>`Race <b>neutralised</b> — <b>5 laps to the relaunch</b>. Sprint 3 is held until then.` },
{ rt:'5:24.3',  lap:20, fam:'crash', head:1, s:()=>`${r(67,1)} is down on the home straight with two other riders — the track is partly blocked. <b>5 laps to rejoin</b>. He was 8th, on 0 points.` },
{ rt:'5:05.0',  lap:20, fam:'sprint', head:1, s:()=>`Sprint 2 — ${r(15,1)} from ${r(4)}, ${r(11)} and ${r(23)}. <b>+5 · +3 · +2 · +1</b>.` },
{ rt:'5:00.6',  lap:19, fam:'lost', head:1, s:()=>`<b>−20</b> — ${r(70,1)} is caught by the bunch and loses a lap. He had been off the back since lap 15 — <b>4 laps · 18.0 s</b> down at the worst of it.` },
{ rt:'4:40.0',  lap:18, fam:'drop', s:()=>`${r(70,1)} has been off the back since lap 15 — <b>3 laps</b>, and the gap is still growing.` },
{ rt:'4:27.8',  lap:17, fam:'lap', head:1, s:()=>`<b>+20</b> — ${r(12,1)} rejoins the bunch and takes his first lap. He went clear on lap 12, two laps after sprint 1: <b>5 laps · 1:23.5</b>, alone the whole way.` },
{ rt:'4:02.0',  lap:16, fam:'crash', head:1, s:()=>`${r(1,1)} did not rejoin inside his five laps — out of the race. He was 9th when he went down on lap 13.` },
{ rt:'3:20.4',  lap:13, fam:'brk', s:()=>`${r(70,1)} is dropped at the back — <b>6.0 s</b>.` },
{ rt:'3:03.7',  lap:12, fam:'brk', head:1, s:()=>`${r(12,1)} breaks clear alone at the front — <b>14.0 s</b> after one lap.` },
{ rt:'2:47.5',  lap:10, fam:'sprint', head:1, s:()=>`Sprint 1 — ${r(15,1)} wins the first one from ${r(4)}, ${r(11)} and ${r(23)}. <b>+5 · +3 · +2 · +1</b>.` },
{ rt:'2:45.9',  lap:10, fam:'approach', s:()=>`${r(15,1)} led onto the last lap and was never passed. ${r(12)} came through from <b>11th</b> to <b>5th</b> in the last two laps and took no points.` },
{ rt:'0:00.0',  lap:1,  fam:'stand', head:1, s:()=>`Start — <b>16 riders</b> · 40 km · 60 laps · 6 sprints · top 10 advance to the next round.` },
];

const FAMS = ['sprint','approach','lap','brk','drop','stand','cut','out','crash'];
const CHIPS = [['all','All'],['sprint','Sprint'],['approach','Approach'],['lap','Lap'],['brk','Breakaway'],['drop','Dropped'],['stand','Standings'],['cut','Cut line'],['out','Still possible'],['crash','Crash']];

const row = f => {
  const T = FAM[f.fam];
  const fil = f.fam === 'lost' ? 'lap' : f.fam;
  return `<div class="fr" data-fam="${fil}" data-head="${f.head ? 1 : 0}" style="--c:${T.c}">
    <span class="rt">${f.rt}</span>
    <span class="lp">L${f.lap}</span>
    <span class="fam">${T.label}</span>
    <span class="tx">${f.s()}</span>
  </div>`;
};

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Commentator feed — Race facts</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;box-shadow:0 18px 48px #000a}
.hdr{display:flex;align-items:center;gap:14px;flex:0 0 auto}
.ttl{display:flex;flex-direction:column;line-height:1.15}
.ttl b{font:700 16px var(--sans);letter-spacing:.02em;color:var(--muted)}
.ttl .sub{font:600 11px var(--mono);letter-spacing:.04em;color:var(--dim)}
.live{display:inline-flex;align-items:center;gap:7px;font:600 12px var(--sans);color:var(--good);border:1px solid #2e4e3e;background:#17241d;border-radius:20px;padding:5px 12px}
.live .dot{width:8px;height:8px;border-radius:50%;background:var(--good)}
.ro{font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--dim);border:1px solid var(--line2);border-radius:4px;padding:4px 9px}
.rtype{font:600 11px var(--sans);color:var(--fg);border:1px solid var(--line2);background:#1b2130;border-radius:4px;padding:4px 10px;white-space:nowrap}
.upd{margin-left:auto;font:500 12px var(--mono);color:var(--dim)}.upd b{color:var(--muted);font-weight:600}
.nav{display:flex;gap:4px;flex:0 0 auto;border-bottom:1px solid var(--line2)}
.nav button{font:600 13px var(--sans);color:var(--dim);background:none;border:0;border-bottom:2px solid transparent;padding:8px 16px 10px;cursor:pointer;margin-bottom:-1px}
.nav button.on{color:var(--fg);border-bottom-color:var(--acc)}
.sub-h{display:flex;align-items:center;gap:12px;flex:0 0 auto;flex-wrap:wrap}
.sub-h b{font:700 12px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.seg{display:inline-flex;border:1px solid var(--line2);border-radius:5px;overflow:hidden}
.seg button{font:600 12px var(--sans);color:var(--dim);border:0;padding:5px 15px;background:#23272b;cursor:pointer;border-right:1px solid var(--line2)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--acc);color:#fff}
.chips{display:flex;gap:5px;flex-wrap:wrap;margin-left:auto}
.chips button{font:600 11px var(--sans);color:var(--dim);background:#23272b;border:1px solid var(--line);border-radius:12px;padding:4px 11px;cursor:pointer}
.chips button.on{color:var(--muted);border-color:var(--line2);background:#2c3237}
.list{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column}
.fr{display:grid;grid-template-columns:72px 46px 104px 1fr;gap:12px;align-items:baseline;padding:11px 12px;border-bottom:1px solid #23262a}
.fr:nth-child(even){background:#00000022}
.fr .rt{font:600 13px var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
.fr .lp{font:500 12px var(--mono);color:var(--dim)}
.fr .fam{font:700 10.5px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--c)}
.fr .tx{font:400 15px/1.45 var(--sans);color:var(--muted)}
.fr .tx b{font-weight:700;color:var(--fg)}
.r{white-space:nowrap}
.r>b{font:700 14px var(--mono);color:var(--dim);font-weight:600}
.r .f{width:17px;height:11px;border-radius:2px;vertical-align:-1px;margin:0 4px}
.r .noc{font:600 12px var(--mono);color:var(--dim)}
.r .fn{color:var(--dim)}
.r .ln{font-weight:700;color:var(--muted)}
.r.hi>b,.r.hi .noc{color:var(--fg)}
.r.hi .fn{color:var(--fg)}
.r.hi .ln{color:var(--fg)}
.foot{flex:0 0 auto;font:500 12px var(--sans);color:var(--dim);border-top:1px solid var(--line);padding-top:7px}
/* embarquée dans le fil : la coque du fil porte déjà l'en-tête et les onglets */
body.embed .board{inset:0;border:0;border-radius:0;box-shadow:none;padding:0}
body.embed .hdr,body.embed .nav{display:none}
</style></head><body>
<div class="board">
  <div class="hdr">
    <div class="ttl"><b>Commentator feed</b><span class="sub">CIS &middot; Commentator Infosystem</span></div>
    <span class="live"><span class="dot"></span>Live &middot; updates automatically</span>
    <span class="ro">Read only</span>
    <span class="rtype">Qualification &middot; top 10 advance</span>
    <span class="upd">Received from Race view &middot; <b>14:38:21</b></span>
  </div>
  <div class="nav">
    <button>Start list</button><button>Standings</button><button>Sprints</button>
    <button>Scenarios</button><button class="on">Race facts</button>
  </div>
  <div class="sub-h">
    <b>Race facts</b>
    <span class="seg"><button class="on" data-m="all">All facts</button><button data-m="head">Headlines</button></span>
    <span class="chips">${CHIPS.map(([k, l], i) => `<button class="${i === 0 ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</span>
  </div>
  <div class="list">${F.map(row).join('\n')}</div>
  <div class="foot">Written from what the race already measured — loop crossings, bunch membership, lap counters, sprint order, classification. Hardware alerts are not sent here.</div>
</div>
<script>
if(location.search.indexOf('embed=1')>-1)document.body.classList.add('embed');
var mode='all', fam='all';
function apply(){
  document.querySelectorAll('.fr').forEach(function(e){
    var okM = mode==='all' || e.dataset.head==='1';
    var okF = fam==='all' || e.dataset.fam===fam;
    e.style.display = (okM&&okF) ? '' : 'none';
  });
}
document.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){
  document.querySelectorAll('[data-m]').forEach(function(x){x.classList.remove('on')});
  b.classList.add('on'); mode=b.dataset.m; apply();};});
document.querySelectorAll('[data-f]').forEach(function(b){b.onclick=function(){
  document.querySelectorAll('[data-f]').forEach(function(x){x.classList.remove('on')});
  b.classList.add('on'); fam=b.dataset.f; apply();};});
<\/script>
</body></html>`;

fs.writeFileSync(`${BASE}/maquette-racefacts.html`, html);
console.log('maquette Race facts écrite · ' + F.length + ' faits, ' + FAMS.length + ' familles');
