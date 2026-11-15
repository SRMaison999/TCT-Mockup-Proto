const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;                       // {bib:{nat,name}}
// Prénoms ILLUSTRATIFS : le modèle du prototype n'a que le nom de famille. À l'intégration, le
// prénom vient de la vraie startlist (il faudra un champ prénom).
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };
const NS = D.sprints.length;              // 6 sprints (S1..S5 + Final)
const LAP_PTS = 20;

// points par sprint et par coureur
const sprintPts = {};                     // sprintPts[bib][k] = points
for (const b of Object.keys(R)) sprintPts[b] = {};
D.sprints.forEach((s, i) => s.seq.forEach(e => { sprintPts[e.bib][i] = e.pts || 0; }));

// histoire des tours gagnés/perdus (cohérente avec « Lap by lap »)
const lapEvents = { 12: { gained: [17, 34, 48], lost: [] }, 70: { gained: [], lost: [19] } };

// classement
let rows = Object.keys(R).map(b => {
  const bib = +b;
  const spr = Object.values(sprintPts[b]).reduce((a, p) => a + p, 0);
  const ev = lapEvents[bib] || { gained: [], lost: [] };
  const lapPts = LAP_PTS * (ev.gained.length - ev.lost.length);
  return { bib, nat: R[b].nat, name: R[b].name, spr, ev, lapPts, total: spr + lapPts };
});
// ordre d'arrivée = ordre du sprint final
const finalOrder = D.sprints[NS - 1].seq.map(e => e.bib);
rows.forEach(r => r.fin = finalOrder.indexOf(r.bib) + 1);
rows.sort((a, b) => (b.total - a.total) || (a.fin - b.fin) || (a.bib - b.bib));
rows.forEach((r, i) => r.rank = i + 1);

const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - n % 10 == 10) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th');
const sprHd = D.sprints.map((s, i) => `<span class="sp">${s.final ? 'F' : 'S' + (i + 1)}</span>`).join('');

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

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maquette · Standings</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.board-h .ex{margin-left:auto;display:flex;gap:6px}
.exbtn{font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:5px 11px;background:#23272b;cursor:pointer;white-space:nowrap}
.tbl{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto}
/* colonnes : rang | bib | drapeau | noc | nom | TOTAL || sprints || lap+ | lap- || finish */
/* colonnes contiguës, largeurs confortables ; le vide éventuel part à droite (dernière colonne 1fr) */
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
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Standings</b><span class="hint">classement général · points par sprint, tours gagnés / perdus, arrivée</span>
    <span class="ex"><button class="exbtn">Export PDF</button><button class="exbtn">Export CSV</button></span>
  </div>
  <div class="tbl">
    <div class="hd">
      <span class="r">#</span><span>Bib</span><span></span><span>NOC</span><span>Rider</span><span class="r">Total</span>
      <span></span><span class="hdsprints">${sprHd}</span><span></span>
      <span class="c">Lap +</span><span class="c">Lap −</span><span></span><span class="c fo">Finish order</span>
    </div>
    ${rows.map(rowHtml).join('\n    ')}
  </div>
</div>
</body></html>`;
fs.writeFileSync(`${BASE}/maquette-standings.html`, html);
console.log('maquette standings écrite · ' + rows.length + ' coureurs, ' + NS + ' sprints');
