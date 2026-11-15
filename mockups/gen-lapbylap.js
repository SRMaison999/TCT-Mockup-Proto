const fs = require('fs');
const BASE = __dirname;
const REPO = require('path').join(__dirname, '..');
const flag = new Function(fs.readFileSync(`${REPO}/flags.js`, 'utf8') + '\nreturn flag;')();
const R = require(`${BASE}/sprints.json`).riders;

const COL = { lead: '#2ED47A', bunch: '#5b8fd6', last: '#e07a9a' };   // couleurs des groupes de la timeline
const SPRINT_LAPS = { 10: 1, 20: 2, 30: 3, 40: 4, 50: 5, 60: 6 };

// L'histoire : le 12 (SUI) est seul en tête (groupe « Leader ») et prend un tour au tour 17 ;
// le 70 (BRA) est décroché, dernier (« Last »), et se fait doubler au tour 19 ;
// le 9 (SLO) n'est pas détecté au tour 16 (transpondeur raté) et réapparaît au tour 17 avec un
// temps au tour doublé — le signal de l'anomalie.
const PELOTON = [18, 61, 7, 15, 4, 11, 23, 58, 67, 1, 9, 3, 46, 52];
const GBIB = 12, GAIN = 17;        // gagne un tour
const LBIB = 70, LOSS = 19;        // perd un tour
const MBIB = 9, MISS = 16, DBL = 17;   // détection ratée au tour 16, temps doublé au tour 17
const MID = Math.floor(PELOTON.length / 2);
const LAP_S = 16.7;                 // 250 m à 15 m/s

function lapTime(bib, lap, shifted) {
  if (bib === MBIB && lap === DBL && !shifted) return 2 * LAP_S + 0.3;   // ~2× : une détection a été ratée (avant correction)
  return +(LAP_S - 0.3 + ((bib * 3) % 9) / 12).toFixed(1);   // ~16.4–16.9, stable par coureur
}
function row(bib, lap, extra, shifted) { return { bib, laps: lap, time: lapTime(bib, lap, shifted), ...extra }; }

function lapGroups(lap, shifted) {
  const lead = [], last = [], legend = [];
  if (lap <= GAIN) lead.push(row(GBIB, lap, lap === GAIN ? { gain: true } : null, shifted));   // seul en tête
  let pel = PELOTON.filter(b => !(lap === MISS && b === MBIB)).map(b => row(b, lap, null, shifted));
  if (lap >= GAIN) pel.splice(MID, 0, row(GBIB, lap, { laps: lap + 1, gain: true }, shifted));  // replacé dans le peloton, +1
  if (lap > LOSS) pel.splice(MID + 2, 0, row(LBIB, lap, { laps: lap - 1, lost: true }, shifted)); // doublé, replacé, -1
  // Avant correction : au tour 16 le 9 n'est pas détecté → il est absent, sans supposition ; le logiciel
  // propose seulement de décaler au tour 17 (temps doublé). Après que l'opérateur a cliqué « Shift »,
  // sa détection est recalée : le tour raté l'affiche alors tout en bas de son groupe, avec la légende.
  if (shifted && lap === MISS) { pel.push({ bib: MBIB, laps: lap, time: null, missed: true }); legend.push({ bib: MBIB, txt: 'transponder not detected — placed by shift' }); }
  if (lap < LOSS) last.push(row(LBIB, lap, null, shifted));                            // décroché, dernier
  if (lap === GAIN) legend.push({ bib: GBIB, txt: 'gained a lap — appears twice' });
  if (lap === DBL && !shifted) legend.push({ bib: MBIB, txt: 'double lap time · maybe a missed detection', action: 'shift' });
  if (lap === LOSS) legend.push({ bib: LBIB, txt: 'lapped — no crossing this lap' });
  const groups = [];
  if (lead.length) groups.push({ name: lead.length > 1 ? 'Leaders' : 'Leader', col: COL.lead, gap: null, rows: lead });
  groups.push({ name: 'Bunch', col: COL.bunch, gap: lead.length ? '+14.0' : null, rows: pel });
  if (last.length) groups.push({ name: 'Last', col: COL.last, gap: '+6.0', rows: last });
  return { groups, legend };
}

function lapData(lap, shifted) { const { groups, legend } = lapGroups(lap, shifted); return { lap, sprint: SPRINT_LAPS[lap] || null, groups, legend, live: false }; }
function liveLap(lap, n, shifted) {
  const { groups } = lapGroups(lap, shifted); let left = n; const kept = [];
  for (const g of groups) { if (left <= 0) break; const rows = g.rows.slice(0, left); left -= rows.length; if (rows.length) kept.push({ ...g, rows }); }
  return { lap, sprint: SPRINT_LAPS[lap] || null, groups: kept, legend: [], live: true };
}

function riderRow(r, titleLap) {
  const ri = R[r.bib] || { nat: '', name: '' };
  const diff = r.laps !== titleLap;
  const dbl = r.time != null && r.time > LAP_S * 1.5;
  const t = r.time == null ? '—' : r.time.toFixed(1);
  return `<div class="lrk${r.gain ? ' gain' : ''}${r.lost ? ' lost' : ''}${r.missed ? ' missed' : ''}">
      <span class="chip">${r.bib}</span><span class="flagw">${flag(ri.nat)}</span><span class="noc">${ri.nat}</span>
      <span class="time${dbl ? ' warn' : ''}${r.time == null ? ' none' : ''}" title="lap time">${t}</span>
      <span class="lapchip${diff ? (r.laps > titleLap ? ' up' : ' down') : ''}" title="${ri.name} · ${r.laps} laps">${r.laps}</span>
    </div>`;
}

function col(d) {
  let rank = 0, body = '', gi = 0;
  for (const grp of d.groups) {
    if (!grp.rows.length) continue; gi++;
    if (grp.gap) body += `<div class="gapsep"><span>${grp.gap} s</span></div>`;
    body += `<div class="lgrp" style="--gc:${grp.col}"><div class="lgrp-h">${gi} · ${grp.name}</div>` +
      grp.rows.map(r => `<div class="lrkwrap${r.gain ? ' gain' : ''}${r.lost ? ' lost' : ''}${r.missed ? ' missed' : ''}"><span class="rk">${++rank}</span>${riderRow(r, d.lap)}</div>`).join('') + `</div>`;
  }
  const nA = d.legend.length;
  const legend = nA ? `<div class="lapcol-leg"><div class="legttl">${nA} alert${nA > 1 ? 's' : ''} — to check</div>` + d.legend.map(l => {
    const ri = R[l.bib] || { nat: '' };
    const btn = l.action === 'shift' ? `<button class="legbtn" title="Shift this rider's detections by one lap to correct the missed detection">Shift −1 lap</button>` : '';
    return `<div class="alertrow"><div class="ahd"><span class="chip sm">${l.bib}</span><span class="noc">${ri.nat}</span></div><div class="atxt">${l.txt}</div>${btn}</div>`;
  }).join('') + `</div>` : '';
  const badge = d.sprint ? `<span class="spbadge">SPRINT ${d.sprint}</span>` : (d.live ? `<span class="livebadge"><span class="dot"></span>live</span>` : '');
  const abadge = nA ? `<span class="alertbadge">${nA} alert${nA > 1 ? 's' : ''}</span>` : '';
  const head = `<div class="lapcol-h${nA ? ' alert' : ''}${d.sprint ? ' sprint' : ''}${d.live ? ' live' : ''}">LAP ${d.lap}${abadge}${badge}</div>`;
  const sub = `<div class="lcolhd"><span class="rk"></span><div class="lrk"><i></i><i></i><i></i><span class="h ht">lap<br>time</span><span class="h hl">laps<br>done</span></div></div>`;
  const foot = d.live ? `<div class="lapcol-live">riders still crossing…</div>` : '';
  return `<div class="lapcol${nA ? ' alert' : ''}${d.sprint ? ' sprint' : ''}${d.live ? ' live' : ''}">${head}${sub}<div class="lapcol-b">${body}</div>${legend}${foot}</div>`;
}

function buildPage(shifted) {
  const laps = [15, 16, 17, 18, 19, 20].map(l => lapData(l, shifted));
  laps.push(liveLap(21, 7, shifted));
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maquette · Lap by lap</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:baseline;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.board-h .close{margin-left:auto;font:500 12px var(--sans);color:var(--dim);border:1px solid var(--line2);border-radius:4px;padding:4px 10px;background:#23272b;cursor:pointer}
.colswrap{position:relative;flex:1 1 auto;min-height:0;display:flex}
.cols{flex:1 1 auto;min-height:0;display:flex;align-items:flex-start;gap:8px;overflow-x:auto;overflow-y:hidden;padding:0 38px 6px;scroll-behavior:smooth}
.nav{position:absolute;top:50%;transform:translateY(-50%);width:30px;height:54px;border-radius:6px;border:1px solid var(--line2);background:#23272bf0;color:var(--muted);font:400 22px var(--sans);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:5;box-shadow:0 2px 10px #0008}
.nav.left{left:0}.nav.right{right:0}
.lapcol{flex:0 0 194px;max-height:100%;display:flex;flex-direction:column;background:#17191c;border:1px solid var(--line2);border-radius:4px;overflow:hidden}
.lapcol.sprint{border-color:#8FB4FF}
.lapcol.live{border-color:var(--good)}
.lapcol.alert{border-color:var(--warn);box-shadow:0 0 0 1px var(--warn)}
.lapcol-h.alert{background:#2a1d08}
.alertbadge{font:700 9px var(--sans);letter-spacing:.04em;color:#120d02;background:var(--warn);border-radius:3px;padding:1px 6px}
.lapcol-h{padding:6px 8px 7px;border-bottom:1px solid var(--line);background:#1b1d20;font:700 13px var(--sans);letter-spacing:.03em;color:var(--muted);flex:0 0 auto;display:flex;align-items:center;gap:7px}
.lapcol-h.sprint{background:#1a2238}
.lapcol-h.live{background:#14241a}
.spbadge{font:700 9px var(--sans);letter-spacing:.05em;color:#8FB4FF;border:1px solid #8FB4FF;border-radius:3px;padding:1px 5px}
.livebadge{display:inline-flex;align-items:center;gap:4px;font:700 9px var(--sans);letter-spacing:.05em;color:var(--good);border:1px solid var(--good);border-radius:3px;padding:1px 5px}
.livebadge .dot{width:6px;height:6px;border-radius:50%;background:var(--good)}
.lapcol-b{flex:1 1 auto;min-height:0;overflow-y:auto;padding:3px}
.lgrp{border-left:3px solid var(--gc);background:color-mix(in srgb, var(--gc) 13%, transparent);border-radius:0 3px 3px 0;margin:0 0 2px;padding:2px 0}
.lgrp-h{font:700 9px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--gc);padding:2px 6px 1px}
.lrkwrap{display:grid;grid-template-columns:16px 1fr;gap:3px;align-items:center;padding:0 5px;height:23px}
.lrkwrap.missed{background:color-mix(in srgb, var(--warn) 14%, transparent)}
.rk{font:600 11px var(--mono);color:var(--dim);text-align:right}
.lrk{display:grid;grid-template-columns:26px 18px 1fr 40px 22px;gap:5px;align-items:center}
.lcolhd{display:grid;grid-template-columns:16px 1fr;gap:3px;align-items:center;padding:3px 5px 4px;border-bottom:1px solid var(--line);background:#141619;flex:0 0 auto}
.lcolhd .h{font:600 8px var(--sans);line-height:1.05;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.lcolhd .ht{text-align:right}
.lcolhd .hl{text-align:center}
.lrkwrap.gain .chip{box-shadow:inset 2px 0 0 var(--good);border-radius:2px}
.lrkwrap.lost .chip{box-shadow:inset 2px 0 0 var(--warn);border-radius:2px}
.lrkwrap.missed .chip{box-shadow:inset 2px 0 0 var(--warn);border-radius:2px}
.chip{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:20px;padding:0 3px;font:600 13px var(--mono);color:var(--fg)}
.chip.sm{min-width:22px;height:17px;font-size:11px}
.flagw .flag{width:18px;height:12px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.noc{font:600 12px var(--mono);letter-spacing:.02em;color:var(--dim)}
.time{font:500 11px var(--mono);color:var(--dim);text-align:right;font-variant-numeric:tabular-nums}
.time.warn{color:#121416;background:var(--warn);border-radius:3px;padding:0 3px;font-weight:700;justify-self:end}
.time.none{color:var(--warn)}
.lapchip{justify-self:end;min-width:22px;text-align:center;font:600 11px var(--mono);color:var(--dim);background:#0003;border:1px solid var(--line);border-radius:3px;padding:0 4px}
.lapchip.up{color:#121416;background:var(--good);border-color:var(--good)}
.lapchip.down{color:#fff;background:var(--crit);border-color:var(--crit)}
.gapsep{display:flex;align-items:center;justify-content:center;height:16px;margin:1px 0}
.gapsep span{font:600 9px var(--mono);color:var(--dim);background:#0004;border-radius:3px;padding:0 6px}
.lapcol-leg{flex:0 0 auto;border-top:1px solid var(--warn);background:#1a1308;padding:6px 7px 8px;display:flex;flex-direction:column;gap:6px}
.legttl{font:700 9px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--warn)}
.alertrow{display:flex;flex-direction:column;gap:3px;padding:6px 7px;background:#0e0f11;border-radius:4px;border-left:3px solid var(--warn)}
.ahd{display:flex;align-items:center;gap:5px}
.atxt{font:500 11px var(--sans);color:var(--muted);line-height:1.3}
.legbtn{align-self:flex-start;margin-top:2px;font:600 11px var(--sans);color:#0b1020;background:var(--acc);border:1px solid var(--acc);border-radius:4px;padding:5px 11px;cursor:pointer;white-space:nowrap}
.lapcol-live{flex:0 0 auto;border-top:1px dashed var(--line2);padding:5px 6px;font:500 10px var(--sans);color:var(--dim);text-align:center}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Lap by lap</b><span class="hint">finish-line order of every lap · newest lap on the right · lap time next to each rider · colours follow the timeline groups</span><button class="close">Close</button></div>
  <div class="colswrap">
    <button class="nav left">&lsaquo;</button>
    <div class="cols" id="cols">${laps.map(col).join('')}</div>
    <button class="nav right">&rsaquo;</button>
  </div>
</div>
<script>var c=document.getElementById('cols');c.scrollLeft=c.scrollWidth;</script>
</body></html>`;
}
fs.writeFileSync(`${BASE}/maquette-lapbylap.html`, buildPage(false));
fs.writeFileSync(`${BASE}/maquette-lapbylap-shift.html`, buildPage(true));
console.log('maquettes écrites (avant + après shift)');
