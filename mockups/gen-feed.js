// Génère mockups/maquette-feed.html — la COQUE de la console commentateurs (fil CIS/MIS).
//
// Cadrage validé avec l'opérateur (16 novembre 2026) :
//   · Un FIL AUTOMATIQUE, en lecture seule : rien à piloter dessus. Ce que l'opérateur
//     valide dans la vue Course part tout seul vers les commentateurs.
//   · Pas d'« abandon pressenti » (idée écartée).
//   · Six vues, reçues telles quelles : Start list · Standings (Live + Evolution) ·
//     Sprints (COMPLETS, tous les coureurs) · Scenarios · Race log (journal).
//   · Journal filtré des ALERTES MATÉRIEL (elles ne regardent que l'opérateur).
//   · L'INTERFACE EST EN ANGLAIS (console commentateurs internationale), comme la vue
//     Standings « Live » validée.
//
// Les vues Evolution et Scenarios sont les maquettes DÉJÀ validées, référencées ici ;
// les Sprints reprennent le format « All sprints » validé (gen-tous-sprints.js).
//
// Données : course de test (palier 1) de sprints.json. Prénoms ILLUSTRATIFS. Tours
// gagnés / perdus cohérents avec « Lap by lap » et « Standings » : 12 gagne L17/34/48,
// 70 perd L19.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };
const NS = D.sprints.length, LAP_PTS = 20;
const titleCase = s => s.toLowerCase().replace(/(^|[ '\-])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase());

/* ===== classement (même calcul que gen-standings.js) ====================== */
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
const nameHtml = r => `<span class="fn">${FIRST[r.bib] || ''}</span> <b>${r.name.toUpperCase()}</b>`;

/* ===== page d'accueil : classement en direct (large, lisible) ============= */
const sprHd = D.sprints.map((s, i) => `<span>${s.final ? 'F' : 'S' + (i + 1)}</span>`).join('');
const liveRow = r => {
  const spr = D.sprints.map((s, i) => { const p = sprintPts[r.bib][i] || 0; return `<span class="sp${p ? ' on' : ''}">${p || '·'}</span>`; }).join('');
  const net = r.lapPts;
  const laps = net === 0 ? '<span class="z">·</span>' : `<span class="lpill ${net > 0 ? 'up' : 'down'}">${net > 0 ? '+' : '−'}${Math.abs(net)}</span>`;
  return `<div class="lv-row${r.rank === 1 ? ' lead' : ''}">
    <span class="rk">${r.rank}</span><span class="chip">${r.bib}</span>
    <span class="flagw">${flag(r.nat)}</span><span class="noc">${r.nat}</span>
    <span class="nm">${nameHtml(r)}</span><span class="tot">${r.total}</span>
    <span class="spr">${spr}</span><span class="laps">${laps}</span>
  </div>`;
};
const liveTable = `<div class="lv">
  <div class="lv-hd">
    <span class="rk">#</span><span>Bib</span><span></span><span>NOC</span><span>Rider</span>
    <span class="rr">Total</span><span class="spr-hd">${sprHd}</span><span class="c">Laps</span>
  </div>
  ${rows.map(liveRow).join('\n  ')}
</div>`;

/* ===== Start list ========================================================= */
const startCards = Object.keys(R).map(b => +b).sort((a, b) => a - b).map(bib => `<div class="sl-card">
    <span class="chip">${bib}</span><span class="flagw">${flag(R[bib].nat)}</span>
    <span class="sl-id"><span class="noc">${R[bib].nat}</span><span class="sl-nm"><span class="fn">${FIRST[bib] || ''}</span> <b>${R[bib].name.toUpperCase()}</b></span></span>
  </div>`).join('\n  ');
const startView = `<div class="sl-head">16 riders on the start list · as sent to commentators</div>
  <div class="sl-grid">${startCards}</div>`;

/* ===== Sprints — COMPLETS (format « All sprints » validé) ================= */
const sprCol = s => {
  const lbl = s.final ? 'FINAL' : 'SPRINT ' + s.k;
  const head = `<div class="spcol-h${s.final ? ' fin' : ''}">
      <div class="spcol-t">${lbl}${s.final ? '<span class="x2">×2</span>' : ''}</div>
      <div class="spcol-s">LAP ${s.lap}</div></div>`;
  const body = s.seq.map((e, i) => {
    const place = i + 1, score = e.pts > 0, nat = (R[e.bib] || {}).nat || '';
    return `<div class="sprk${score ? ' score' : ''}${place === 4 ? ' sepline' : ''}">
        <span class="pl">${place}</span><span class="chip">${e.bib}</span>
        <span class="flagw">${flag(nat)}</span><span class="noc">${nat}</span>
        <span class="pts">${score ? '+' + e.pts : ''}</span></div>`;
  }).join('');
  return `<div class="spcol${s.final ? ' fin' : ''}">${head}<div class="spcol-b">${body}</div></div>`;
};
const sprintsView = `<div class="sub-h"><span class="hint">every sprint, in full · left to right · top four score · the final counts double</span></div>
  <div class="colswrap">
    <button class="snav left" aria-label="Previous sprints">‹</button>
    <div class="cols" id="sprcols">${D.sprints.map(sprCol).join('\n    ')}</div>
    <button class="snav right" aria-label="Next sprints">›</button>
  </div>`;

/* ===== Race log (plain language, NO hardware alerts) ====================== */
const jflag = nat => flag(nat).replace('<svg ', '<svg style="width:18px;height:12px;border-radius:2px;vertical-align:-1px;margin:0 2px" ');
const rName = bib => `${titleCase(R[bib].name)} (${R[bib].nat})`;
// un sprint = tous les coureurs qui marquent des points, avec drapeau, NOC et points
const scorerTxt = s => s.seq.filter(e => e.pts > 0).map((e, j) => {
  const nm = titleCase(R[e.bib].name);
  return `${jflag(R[e.bib].nat)}${j === 0 ? '<b>' + nm + '</b>' : nm} (${R[e.bib].nat}) <span class="jp">+${e.pts}</span>`;
}).join(' &middot; ');
const jLines = [];
jLines.push({ t: '14:38', k: 'Final', m: `Final sprint (lap 60) — ${scorerTxt(D.sprints[NS - 1])}. Final standings locked.` });
const sTimes = ['14:06', '14:12', '14:19', '14:26', '14:32'];
D.sprints.slice(0, NS - 1).forEach((s, i) => {
  jLines.push({ t: sTimes[i], k: 'Sprint ' + (i + 1), m: `Lap ${s.lap} — ${scorerTxt(s)}` });
});
jLines.push({ t: '14:29', k: 'Lap gained', m: `Lap 48 — <b>${rName(12)}</b> ${jflag('SUI')} laps the field. +20 points.`, tone: 'up' });
jLines.push({ t: '14:22', k: 'Lap gained', m: `Lap 34 — <b>${rName(12)}</b> ${jflag('SUI')} takes another lap. +20 points.`, tone: 'up' });
jLines.push({ t: '14:10', k: 'Lap lost', m: `Lap 19 — <b>${rName(70)}</b> ${jflag('BRA')} loses a lap. −20 points.`, tone: 'down' });
jLines.push({ t: '14:08', k: 'Lap gained', m: `Lap 17 — <b>${rName(12)}</b> ${jflag('SUI')} laps the field. +20 points.`, tone: 'up' });
jLines.push({ t: '14:00', k: 'Start', m: '16 riders on the gun · 40 km · 6 sprints.' });
jLines.sort((a, b) => a.t < b.t ? 1 : a.t > b.t ? -1 : 0);
const logView = `<div class="jg-note">Race facts, in plain language — <b>without hardware alerts</b> (muted transponder, etc.: those are not sent to commentators).</div>
  <div class="jg">${jLines.map(e => `<div class="jg-row${e.tone ? ' ' + e.tone : ''}">
      <span class="jg-t">${e.t}</span><span class="jg-k">${e.k}</span><span class="jg-m">${e.m}</span>
    </div>`).join('\n  ')}</div>`;

/* ===== vues reçues telles quelles (déjà validées) ========================= */
const received = (title, desc, points) => `<div class="rc"><div class="rc-card">
      <div class="rc-tag">Received as-is</div>
      <div class="rc-ttl">${title}</div>
      <div class="rc-desc">${desc}</div>
      <ul class="rc-list">${points.map(p => `<li>${p}</li>`).join('')}</ul>
      <div class="rc-foot">Already validated · fed automatically from the Race view</div>
    </div></div>`;
const evoView = received(
  'Standings — Evolution',
  'The "Compare" view: how the classification moves at each update.',
  ['Each rider\'s rank at every sprint and every lap gained / lost',
   'Up to 4 riders tracked side by side, the rank and points gap between them',
   'Names at the end of the lines, lap axis to the race\'s real scale']);
const scenView = received(
  'Race scenarios',
  'What is still possible — in short, plain words, no cryptic notation.',
  ['Points still up for grabs: Sprint 5 = 5, Final = 10 → 15 pts (+20 with a lap gained)',
   'Per rider: current total, highest reachable, best place that ceiling allows',
   'Who can win, who can take whose place, who can be relegated']);

/* ===== assemblage ========================================================= */
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Commentator feed — mockup</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;box-shadow:0 18px 48px #000a}
/* en-tête */
.hdr{display:flex;align-items:center;gap:14px;flex:0 0 auto}
.ttl{display:flex;flex-direction:column;line-height:1.15}
.ttl b{font:700 16px var(--sans);letter-spacing:.02em;color:var(--muted)}
.ttl .sub{font:600 11px var(--mono);letter-spacing:.04em;color:var(--dim)}
.live{display:inline-flex;align-items:center;gap:7px;font:600 12px var(--sans);color:var(--good);border:1px solid #2e4e3e;background:#17241d;border-radius:20px;padding:5px 12px}
.live .dot{width:8px;height:8px;border-radius:50%;background:var(--good);animation:pulse 1.8s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 #2ED47A66}70%{box-shadow:0 0 0 7px #2ED47A00}100%{box-shadow:0 0 0 0 #2ED47A00}}
.ro{font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--dim);border:1px solid var(--line2);border-radius:4px;padding:4px 9px}
.rtype{font:600 11px var(--sans);letter-spacing:.02em;color:var(--fg);border:1px solid var(--line2);background:#1b2130;border-radius:4px;padding:4px 10px;white-space:nowrap}
.vframe{width:100%;height:100%;border:0;display:block;background:var(--bg)}
.upd{margin-left:auto;font:500 12px var(--mono);color:var(--dim)}.upd b{color:var(--muted);font-weight:600}
/* navigation */
.nav{display:flex;gap:4px;flex:0 0 auto;border-bottom:1px solid var(--line2)}
.nav button{position:relative;font:600 13px var(--sans);color:var(--dim);background:none;border:0;border-bottom:2px solid transparent;padding:8px 16px 10px;cursor:pointer;margin-bottom:-1px}
.nav button:hover{color:var(--muted)}
.nav button.on{color:var(--fg);border-bottom-color:var(--acc)}
/* contenu */
.panel{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:9px;overflow:hidden}
.sub-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.seg{display:inline-flex;border:1px solid var(--line2);border-radius:5px;overflow:hidden}
.seg button{font:600 12px var(--sans);color:var(--dim);border:0;padding:5px 15px;background:#23272b;cursor:pointer;border-right:1px solid var(--line2)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--acc);color:#fff}
.sub-h .hint{font:500 12px var(--sans);color:var(--dim)}
/* classement en direct */
.lv{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column}
.lv-hd,.lv-row{display:grid;grid-template-columns:46px 56px 34px 50px 1fr 92px ${NS * 40}px 96px;gap:11px;align-items:center;padding:0 12px}
.lv-hd{height:30px;font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--line2);position:sticky;top:0;background:var(--panel);z-index:1}
.lv-hd .rr{text-align:right}.lv-hd .c{text-align:center}
.lv-hd .spr-hd{display:grid;grid-template-columns:repeat(${NS},1fr);gap:2px;text-align:center;color:var(--dim)}
.lv-row{min-height:50px;border-bottom:1px solid #23262a;font-size:15px}
.lv-row:nth-child(even){background:#00000022}
.lv-row.lead{background:#39311c55}
.rk{font:700 17px var(--mono);color:var(--muted);text-align:right}
.lv-row.lead .rk{color:var(--fg)}
.chip{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:26px;font:600 16px var(--mono);color:var(--fg)}
.flagw .flag{width:28px;height:18px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.noc{font:600 14px var(--mono);letter-spacing:.03em;color:var(--dim)}
.nm{font:600 16px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nm .fn{color:var(--dim);font-weight:500}.nm b{color:var(--muted);font-weight:700}
.tot{font:700 24px var(--mono);color:var(--fg);text-align:right;font-variant-numeric:tabular-nums}
.spr{display:grid;grid-template-columns:repeat(${NS},1fr);gap:2px}
.spr .sp{text-align:center;font:500 15px var(--mono);color:var(--dim);font-variant-numeric:tabular-nums;padding:4px 0;border-radius:4px}
.spr .sp.on{color:var(--fg);font-weight:700;background:#39311c}
.laps{text-align:center}
.lpill{display:inline-block;font:700 14px var(--mono);border-radius:5px;padding:3px 10px;font-variant-numeric:tabular-nums}
.lpill.up{color:#121416;background:var(--good)}.lpill.down{color:#fff;background:var(--crit)}
.laps .z{color:#555;font-size:16px}
/* Start list */
.sl-head{font:500 13px var(--sans);color:var(--dim);flex:0 0 auto}
.sl-grid{flex:1 1 auto;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-content:start}
.sl-card{display:flex;align-items:center;gap:10px;background:#1c1e22;border:1px solid var(--line);border-radius:6px;padding:9px 12px}
.sl-id{display:flex;flex-direction:column;line-height:1.2;min-width:0}
.sl-nm{font:600 14px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-nm .fn{color:var(--dim);font-weight:500}.sl-nm b{color:var(--muted)}
/* Sprints complets (colonnes) */
.colswrap{position:relative;flex:1 1 auto;min-height:0;display:flex}
.cols{flex:1 1 auto;min-height:0;display:flex;align-items:flex-start;gap:8px;overflow-x:auto;overflow-y:hidden;padding-bottom:6px;scroll-behavior:smooth;scrollbar-color:var(--line2) transparent}
.snav{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:54px;border-radius:6px;border:1px solid var(--line2);background:#23272bf0;color:var(--muted);font:400 22px var(--sans);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:5;box-shadow:0 2px 10px #0008}
.snav.left{left:2px}.snav.right{right:2px}
.snav:hover{border-color:var(--muted)}
.snav[disabled]{display:none}
.spcol{flex:0 0 158px;max-height:100%;display:flex;flex-direction:column;background:#17191c;border:1px solid var(--line2);border-radius:4px;overflow:hidden}
.spcol.fin{border-color:var(--fg)}
.spcol-h{padding:6px 9px 7px;border-bottom:1px solid var(--line);background:#1b1d20;flex:0 0 auto}
.spcol-h.fin{background:#241f14}
.spcol-t{font:700 12.5px var(--sans);letter-spacing:.03em;color:var(--muted);display:flex;align-items:center;gap:6px}
.spcol-t .x2{font:700 10px var(--sans);color:#121416;background:var(--fg);border-radius:3px;padding:1px 5px;letter-spacing:.04em}
.spcol-s{margin-top:3px;font:500 11px var(--mono);color:var(--dim)}
.spcol-b{flex:1 1 auto;min-height:0;overflow-y:auto}
.sprk{display:grid;grid-template-columns:16px 32px 22px 1fr 30px;gap:5px;align-items:center;height:26px;padding:0 7px}
.sprk + .sprk{border-top:1px solid #23262a}
.sprk.score{background:#1d2a22}
.sprk.sepline{box-shadow:inset 0 -2px 0 var(--line2)}
.sprk .pl{font:600 12px var(--mono);color:var(--dim);text-align:right}
.sprk.score .pl{color:var(--muted)}
.spcol .chip{min-width:28px;height:21px;padding:0 4px;font:600 13px var(--mono);color:var(--fg)}
.spcol .flagw .flag{width:20px;height:13px}
.spcol .noc{font:600 12px var(--mono);color:var(--dim)}
.sprk.score .noc{color:var(--muted)}
.sprk .pts{font:700 12px var(--mono);color:var(--good);text-align:right}
/* Race log */
.jg-note{font:500 13px var(--sans);color:var(--dim);flex:0 0 auto;padding:4px 0}
.jg-note b{color:var(--muted)}
.jg{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column}
.jg-row{display:grid;grid-template-columns:54px 108px 1fr;gap:12px;align-items:center;min-height:40px;padding:6px 10px;border-bottom:1px solid #23262a;border-left:3px solid var(--line)}
.jg-row.up{border-left-color:var(--good)}.jg-row.down{border-left-color:var(--crit)}
.jg-t{font:600 13px var(--mono);color:var(--dim)}
.jg-k{font:600 12px var(--sans);letter-spacing:.03em;color:var(--muted)}
.jg-m{font:500 14px var(--sans);color:var(--muted)}.jg-m b{color:var(--fg);font-weight:700}
.jg-m .jp{color:var(--good);font-weight:700;font-family:var(--mono);margin-right:2px}
/* vues reçues */
.rc{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}
.rc-card{max-width:560px;background:#1c1e22;border:1px solid var(--line);border-radius:10px;padding:22px 26px}
.rc-tag{display:inline-block;font:600 10px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--good);border:1px solid #2e4e3e;background:#17241d;border-radius:4px;padding:3px 8px;margin-bottom:12px}
.rc-ttl{font:700 20px var(--sans);color:var(--fg);margin-bottom:6px}
.rc-desc{font:500 14px var(--sans);color:var(--muted);margin-bottom:12px}
.rc-list{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px}
.rc-list li{font:500 13px var(--sans);color:var(--dim)}
.rc-foot{margin-top:14px;font:500 12px var(--mono);color:var(--dim);border-top:1px solid var(--line);padding-top:10px}
</style></head>
<body>
<div class="board">
  <div class="hdr">
    <div class="ttl"><b>Commentator feed</b><span class="sub">CIS · Commentator Infosystem</span></div>
    <span class="live"><i class="dot"></i>Live · updates automatically</span>
    <span class="ro">Read only</span>
    <span class="rtype">Qualification · top 10 advance</span>
    <span class="upd">Received from Race view · <b>14:38:21</b></span>
  </div>
  <nav class="nav">
    <button data-tab="start">Start list</button>
    <button class="on" data-tab="stand">Standings</button>
    <button data-tab="sprints">Sprints</button>
    <button data-tab="scen">Scenarios</button>
    <button data-tab="log">Race facts</button>
  </nav>

  <div class="panel" data-panel="start" hidden>${startView}</div>

  <div class="panel" data-panel="stand"><iframe class="vframe" src="maquette-standings.html?embed=1" title="Standings"></iframe></div>
  <div class="panel" data-panel="sprints" hidden>${sprintsView}</div>
  <div class="panel" data-panel="scen" hidden><iframe class="vframe" src="maquette-scenarios.html?embed=1" title="Scenarios"></iframe></div>
  <div class="panel" data-panel="log" hidden><iframe class="vframe" src="maquette-racefacts.html?embed=1" title="Race facts"></iframe></div>
</div>
<script>
(function(){
  var nav=document.querySelectorAll('.nav button'), panels=document.querySelectorAll('.panel');
  var cols=document.getElementById('sprcols'), L=document.querySelector('.snav.left'), Rn=document.querySelector('.snav.right');
  function updSpr(){ if(!cols) return; var max=cols.scrollWidth-cols.clientWidth; L.disabled=cols.scrollLeft<=2; Rn.disabled=cols.scrollLeft>=max-2; }
  if(cols){ var step=function(){return Math.max(170,cols.clientWidth*0.8)};
    L.onclick=function(){cols.scrollBy({left:-step()})}; Rn.onclick=function(){cols.scrollBy({left:step()})};
    cols.addEventListener('scroll',updSpr); window.addEventListener('resize',updSpr); }
  nav.forEach(function(btn){btn.onclick=function(){
    nav.forEach(function(b){b.classList.toggle('on',b===btn);});
    panels.forEach(function(p){p.hidden=p.getAttribute('data-panel')!==btn.getAttribute('data-tab');});
    if(btn.getAttribute('data-tab')==='sprints') updSpr();
  };});
})();
</script>
</body></html>`;

fs.writeFileSync(path.join(BASE, 'maquette-feed.html'), html);
console.log('maquette-feed.html généré (' + rows.length + ' coureurs, ' + NS + ' sprints complets)');
