// Génère mockups/maquette-standings.html — le classement général.
//
// Deux vues, basculables dans l'en-tête :
//   · Table      — le classement finalisé (points par sprint, tours gagnés/perdus
//                  en points, Finish order, exports). Tout en anglais.
//   · Evolution  — demande de l'opérateur (16 novembre 2026) : montrer l'évolution
//                  du classement tout au long de la course. Un graphe de rang par
//                  checkpoint (chaque sprint et chaque tour gagné / perdu).
//
// Prénoms ILLUSTRATIFS : le modèle n'a que le nom de famille ; à l'intégration le
// prénom vient de la vraie startlist. Les tours gagnés / perdus sont ceux de la
// course de test (cohérents avec « Lap by lap ») : 12 gagne L17/L34/L48, 70 perd L19.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;                       // {bib:{nat,name}}
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };
const NS = D.sprints.length;              // 6 sprints (S1..S5 + Final)
const LAP_PTS = 20;

// points par sprint et par coureur
const sprintPts = {};
for (const b of Object.keys(R)) sprintPts[b] = {};
D.sprints.forEach((s, i) => s.seq.forEach(e => { sprintPts[e.bib][i] = e.pts || 0; }));

// tours gagnés / perdus
const lapEvents = { 12: { gained: [17, 34, 48], lost: [] }, 70: { gained: [], lost: [19] } };

// classement final
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

const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - n % 10 == 10) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th');
const sprHd = D.sprints.map((s, i) => `<span class="sp">${s.final ? 'F' : 'S' + (i + 1)}</span>`).join('');

/* ===== vue Table (inchangée, finalisée en anglais) ======================== */
const rowHtml = r => {
  const spr = D.sprints.map((s, i) => { const p = sprintPts[r.bib][i] || 0; return `<span class="sp${p ? ' on' : ''}">${p || '·'}</span>`; }).join('');
  const gained = r.ev.gained.length ? `<span class="lpill up">+${r.ev.gained.length * LAP_PTS}</span> <span class="lp">L${r.ev.gained.join(', L')}</span>` : '<span class="z">·</span>';
  const lost = r.ev.lost.length ? `<span class="lpill down">−${r.ev.lost.length * LAP_PTS}</span> <span class="lp">L${r.ev.lost.join(', L')}</span>` : '<span class="z">·</span>';
  return `<div class="row">
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

const tableView = `<div class="tbl" id="v-table">
    <div class="hd">
      <span class="r">#</span><span>Bib</span><span></span><span>NOC</span><span>Rider</span><span class="r">Total</span>
      <span></span><span class="hdsprints">${sprHd}</span><span></span>
      <span class="c">Lap +</span><span class="c">Lap −</span><span></span><span class="c fo">Finish order</span>
    </div>
    ${rows.map(rowHtml).join('\n    ')}
  </div>`;

/* ===== vue Evolution (nouvelle) =========================================== */
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
const N = rows.length;                     // 16 coureurs
const run = {}; Object.keys(R).forEach(b => run[b] = 0);
const series = {}; Object.keys(R).forEach(b => series[b] = []);
CK.forEach(e => {
  if (e.k != null) Object.keys(R).forEach(b => run[b] += (sprintPts[b][e.k] || 0));
  if (e.bib != null) run[e.bib] += e.d;
  const order = Object.keys(R).map(Number).sort((a, b) => (run[b] - run[a]) || (fIdx(a) - fIdx(b)) || (a - b));
  order.forEach((b, i) => series[b].push(i + 1));
});

// classe de chaque coureur : grimpeur (tour gagné) / lâché (tour perdu) / sprinteur / sans point
const cls = bib => bib === 12 ? 'climb' : bib === 70 ? 'drop'
  : (rows.find(r => r.bib === bib).spr > 0 ? 'score' : 'flat');
const LINE = { climb: '#2ED47A', drop: '#FF5C5C', score: '#E0B64A', flat: '#6b7178' };

// géométrie du graphe
const W = 1640, H = 760, mL = 46, mR = 232, mT = 62, mB = 26;
const x = i => mL + i * (W - mL - mR) / (CK.length - 1);
const y = rank => mT + (rank - 1) * (H - mT - mB) / (N - 1);

const grid = [];
// lignes de rang horizontales + numéros
for (let rk = 1; rk <= N; rk++) {
  grid.push(`<line x1="${mL}" y1="${y(rk).toFixed(1)}" x2="${(W - mR).toFixed(1)}" y2="${y(rk).toFixed(1)}" class="grid"/>`);
  grid.push(`<text x="${mL - 12}" y="${(y(rk) + 4).toFixed(1)}" class="axn">${rk}</text>`);
}
// colonnes de checkpoint : trait vertical + étiquette
const cols = CK.map((e, i) => {
  const xi = x(i).toFixed(1);
  const head = e.kind === 'sprint' ? `<text x="${xi}" y="26" class="ckl sprint">${e.l}</text>`
    : e.kind === 'gain' ? `<text x="${xi}" y="26" class="ckl gain">+1 lap</text>`
    : e.kind === 'lose' ? `<text x="${xi}" y="26" class="ckl lose">−1 lap</text>`
    : `<text x="${xi}" y="26" class="ckl start">Start</text>`;
  const sub = e.lap != null ? `<text x="${xi}" y="44" class="cks">L${e.lap}</text>` : '';
  return `<line x1="${xi}" y1="${mT}" x2="${xi}" y2="${H - mB}" class="colg${e.kind === 'sprint' ? ' on' : ''}"/>${head}${sub}`;
}).join('');

// une polyligne par coureur, les sans-point d'abord (dessous), les marquants au-dessus
const bibsByZ = rows.map(r => r.bib).sort((a, b) => {
  const rank = c => ({ flat: 0, score: 1, drop: 2, climb: 3 })[cls(c)];
  return rank(a) - rank(b);
});
const lines = bibsByZ.map(bib => {
  const c = cls(bib), col = LINE[c];
  const pts = series[bib].map((rk, i) => `${x(i).toFixed(1)},${y(rk).toFixed(1)}`).join(' ');
  const dots = series[bib].map((rk, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(rk).toFixed(1)}" r="${c === 'flat' ? 0 : 3.4}" fill="${col}"/>`).join('');
  return `<g class="ln ${c}"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${c === 'flat' ? 1.4 : 3}" stroke-opacity="${c === 'flat' ? 0.4 : 1}" stroke-linejoin="round"/>${dots}</g>`;
}).join('');

// marqueur du tour gagné / perdu sur le dot concerné
const marks = CK.map((e, i) => {
  if (e.bib == null) return '';
  const rk = series[e.bib][i], col = e.kind === 'gain' ? LINE.climb : LINE.drop;
  return `<circle cx="${x(i).toFixed(1)}" cy="${y(rk).toFixed(1)}" r="7" fill="none" stroke="${col}" stroke-width="2"/>`;
}).join('');

// étiquettes de fin : drapeau + dossard + total, au rang final
const endX = W - mR + 12;
const ends = rows.map(r => {
  const yy = y(r.rank), c = cls(r.bib), col = LINE[c];
  const fl = flag(r.nat).replace('<svg class="flag"', `<svg class="flag" x="${endX}" y="${(yy - 8).toFixed(1)}" width="24" height="16"`);
  const dim = c === 'flat' ? ' dim' : '';
  return `${fl}<text x="${endX + 32}" y="${(yy + 4).toFixed(1)}" class="enm${dim}">${r.bib}</text>` +
    `<text x="${endX + 70}" y="${(yy + 4).toFixed(1)}" class="enn${dim}">${r.name.toUpperCase()}</text>` +
    `<text x="${(W - 10).toFixed(1)}" y="${(yy + 4).toFixed(1)}" class="ent" fill="${col}">${r.total > 0 ? '+' + r.total : r.total}</text>`;
}).join('');

const evoView = `<div class="evo" id="v-evo" hidden>
    <div class="evleg">
      <span class="lg"><i style="background:#2ED47A"></i>Lap gained — climbs</span>
      <span class="lg"><i style="background:#FF5C5C"></i>Lap lost — drops</span>
      <span class="lg"><i style="background:#E0B64A"></i>Sprint points</span>
      <span class="lg"><i style="background:#6b7178"></i>No points yet</span>
      <span class="lgnote">rank after each sprint and each lap gained or lost · top line leads</span>
    </div>
    <svg class="evsvg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Classification evolution">
      <g class="grids">${grid.join('')}</g>
      <g class="colsg">${cols}</g>
      <g class="lns">${lines}</g>
      <g class="marks">${marks}</g>
      <g class="ends">${ends}</g>
    </svg>
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

.tbl{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto}
.hd,.row{display:grid;grid-template-columns:44px 52px 30px 48px 248px 80px 14px ${NS * 58}px 14px 176px 176px 14px 124px 1fr;gap:9px;align-items:center;padding:0 10px}
.hd{height:30px;font:600 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--line2)}
.hd span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hd .r{text-align:right}.hd .c{text-align:center}
.row{min-height:44px;border-bottom:1px solid #23262a;font-size:14px}
.row:nth-child(even){background:#00000022}
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

/* ---- vue Evolution ---- */
.evo{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:6px;overflow:hidden}
.evleg{display:flex;align-items:center;gap:16px;flex:0 0 auto;padding:2px 4px}
.evleg .lg{display:inline-flex;align-items:center;gap:7px;font:600 12px var(--sans);color:var(--muted)}
.evleg .lg i{width:16px;height:4px;border-radius:2px;display:inline-block}
.evleg .lgnote{margin-left:auto;font:500 12px var(--sans);color:var(--dim)}
.evsvg{flex:1 1 auto;min-height:0;width:100%;height:100%}
.evsvg .grid{stroke:#ffffff10;stroke-width:1}
.evsvg .axn{fill:var(--dim);font:500 12px var(--mono);text-anchor:end}
.evsvg .colg{stroke:#ffffff0d;stroke-width:1}
.evsvg .colg.on{stroke:#ffffff1c}
.evsvg .ckl{text-anchor:middle;font:700 14px var(--sans)}
.evsvg .ckl.sprint{fill:var(--fg)}
.evsvg .ckl.gain{fill:var(--good)}
.evsvg .ckl.lose{fill:var(--crit)}
.evsvg .ckl.start{fill:var(--dim)}
.evsvg .cks{text-anchor:middle;fill:var(--dim);font:500 11px var(--mono)}
.evsvg .enm{fill:var(--fg);font:700 14px var(--mono)}
.evsvg .enn{fill:var(--muted);font:600 13px var(--sans)}
.evsvg .enm.dim,.evsvg .enn.dim{fill:var(--dim);opacity:.7}
.evsvg .ent{font:700 15px var(--mono);text-anchor:end;font-variant-numeric:tabular-nums}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Standings</b>
    <span class="seg"><button class="on" data-view="table">Table</button><button data-view="evo">Evolution</button></span>
    <span class="hint" id="hint">overall classification · points per sprint · laps won / lost · finish order</span>
    <span class="ex"><button class="exbtn">Export PDF</button><button class="exbtn">Export CSV</button></span>
  </div>
  ${tableView}
  ${evoView}
</div>
<script>
(function(){
  var hints={table:"overall classification · points per sprint · laps won / lost · finish order",
             evo:"how the classification moved — climbs when a lap is taken, drops when a lap is lost"};
  var btns=document.querySelectorAll('[data-view]');
  btns.forEach(function(btn){btn.addEventListener('click',function(){
    var v=btn.dataset.view;
    btns.forEach(function(b){b.classList.toggle('on',b===btn);});
    document.getElementById('v-table').hidden=(v!=='table');
    document.getElementById('v-evo').hidden=(v!=='evo');
    document.getElementById('hint').textContent=hints[v];
  });});
})();
</script>
</body></html>`;
fs.writeFileSync(`${BASE}/maquette-standings.html`, html);
console.log('maquette standings écrite · ' + rows.length + ' coureurs, ' + NS + ' sprints, ' + CK.length + ' checkpoints');
