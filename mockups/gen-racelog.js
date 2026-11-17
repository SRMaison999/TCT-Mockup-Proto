// Génère mockups/maquette-racelog.html — le « Race log » (ex-Decisions).
//
// Recréé depuis la capture retrouvée de la session précédente (maquette « plutôt
// bien reçue ») et les exigences du hand-off §9.2. Journal « boîte noire » de la
// course, en langage humain. Colonnes alignées :
//   Daytime · Race time · Lap · Type · Rider · Event · Status
// Types réels de l'appli (rien d'inventé) : RACE / GROUP / SPRINT / LAP /
// TRANSPONDER / OPERATOR / WITHDRAW (DNS·DNF·ABD) / ALERT / HARDWARE / INCIDENT.
// Anomalies au format Problème → Effet → Action, avec pastille de statut
// (Resolved / Pending / Ignored / …). Renommage §9.1 : « Decisions » → « Race log »,
// « READ » → « Transponder ». Les entrées sont ILLUSTRATIVES ; les coureurs sont
// les vrais de la course de test (sprints.json).

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };

// couleur + libellé par type (INCIDENT en rouge, provisoire §9.2)
const TYPE = {
  race:        { c: '#8FB4FF', label: 'RACE' },
  group:       { c: '#2ED47A', label: 'GROUP', bg: '#14231a' },
  sprint:      { c: '#8FB4FF', label: 'SPRINT', bg: '#161b2b' },
  lap:         { c: '#2ED47A', label: 'LAP' },             // couleur surchargée (gagné vert / perdu rouge)
  transponder: { c: '#c1bdb4', label: 'TRANSPONDER' },
  operator:    { c: '#8FB4FF', label: 'OPERATOR' },
  incident:    { c: '#FF5C5C', label: 'INCIDENT', bg: '#241518' },
  alert:       { c: '#F2A33A', label: 'ALERT', bg: '#231c10' },
  hardware:    { c: '#FF5C5C', label: 'HARDWARE', bg: '#241518' },
  dns:         { c: '#F2A33A', label: 'DNS', fil: 'withdraw' },
  dnf:         { c: '#FF5C5C', label: 'DNF', fil: 'withdraw' },
  abd:         { c: '#F2A33A', label: 'ABD', fil: 'withdraw' },
};

// résultat de sprint complet : place · dossard · drapeau · NOC · nom (§9.2)
const sprintResult = seq => seq.map((e, i) =>
  `<span class="pl">${i + 1}.</span> <span class="rf">${flag(R[e.bib].nat)}</span><b>${e.bib}</b> <span class="rn">${R[e.bib].nat} ${R[e.bib].name}</span>`).join('  ·  ');
const S1 = D.sprints[0].seq.slice(0, 4);
const SF = D.sprints[D.sprints.length - 1].seq;                 // sprint final (points déjà doublés dans les données)
const sprintPtsText = seq => seq.slice(0, 4).map(e => `<span class="rf">${flag(R[e.bib].nat)}</span><b>${e.bib}</b> <span class="rn">${R[e.bib].nat} ${R[e.bib].name}</span> <span class="pt">+${e.pts}</span>`).join('  ·  ');

// le journal, du plus récent au plus ancien — toute la course : fin de course en tête,
// sprints, groupes, incidents, un crash NEUTRALISANT au milieu (§9.2, décompte −5 → 0),
// jusqu'au départ.
const LOG = [
  // --- fin de course (lap 60) ---
  { dt: '14:48:12', rt: '18:12.0', lap: 60, type: 'race', event: 'Classification final — results published · PDF, CSV and scoreboard sent.' },
  { dt: '14:48:08', rt: '18:08.0', lap: 60, type: 'race', event: 'Race over — 16 riders classified · winner <b>12 Huber</b>, 60 pts (three laps gained).' },
  { dt: '14:48:07', rt: '18:07.4', lap: 60, type: 'race', event: 'Finish — last rider across the line · running time stopped at 18:07.4.' },
  { dt: '14:48:06', rt: '18:06.5', lap: 60, type: 'sprint', event: 'Final sprint closed — doubled points applied to the classification.' },
  { dt: '14:48:06', rt: '18:06.0', lap: 60, type: 'sprint', event: 'Final sprint points (×2) — ' + sprintPtsText(SF) + '.' },
  { dt: '14:48:05', rt: '18:05.8', lap: 60, type: 'sprint', event: 'Final sprint — order at the line: ' + sprintResult(SF) + '.' },
  { dt: '14:47:49', rt: '17:49.0', lap: 60, type: 'sprint', event: 'Final sprint armed — lap 60 · last lap · points doubled.' },
  // --- sprints intermédiaires ---
  { dt: '14:46:00', rt: '16:00.0', lap: 50, type: 'sprint', event: 'Sprint 5 run and closed — ' + sprintPtsText(D.sprints[4].seq) + ' · sent to TV.' },
  { dt: '14:42:48', rt: '12:48.0', lap: 40, type: 'sprint', event: 'Sprint 4 run and closed — ' + sprintPtsText(D.sprints[3].seq) + ' · sent to TV.' },
  { dt: '14:39:36', rt: '9:36.0', lap: 30, type: 'sprint', event: 'Sprint 3 run and closed — ' + sprintPtsText(D.sprints[2].seq) + ' · sent to TV.' },
  // --- crash NEUTRALISANT (§9.2) : chaque changement d'état = une ligne, décompte −5 → 0 ---
  { dt: '14:36:55', rt: '6:55.0', lap: 25, type: 'incident', event: '<b>0</b> · race relaunched by the referee — racing resumes · 4 laps to the next sprint.', status: ['Relaunched', 'good'] },
  { dt: '14:36:38', rt: '6:38.4', lap: 24, type: 'incident', bib: 67, event: '<b>−1</b> · 1 lap to the relaunch — 67 Lehmann back in his place in the bunch.' },
  { dt: '14:36:21', rt: '6:21.2', lap: 23, type: 'incident', event: '<b>−2</b> · 2 laps to the relaunch.' },
  { dt: '14:36:04', rt: '6:04.0', lap: 22, type: 'incident', bib: 67, event: '<b>−3</b> · 3 laps to the relaunch — 67 Lehmann back on a spare bike, restarts at the back.' },
  { dt: '14:35:47', rt: '5:47.6', lap: 21, type: 'incident', event: '<b>−4</b> · 4 laps to the relaunch.' },
  { dt: '14:35:30', rt: '5:30.1', lap: 20, type: 'incident', event: 'Race <b>neutralised</b> by the referee — countdown <b>−5</b> · 5 laps to the relaunch · the next sprint is held until 0.', status: ['Neutralised', 'warn'] },
  { dt: '14:35:24', rt: '5:24.3', lap: 20, type: 'incident', bib: 67, problem: 'Fall in the fight for position — 67 Lehmann and two riders down · track partly blocked.', effect: "The bunch is forced to slow · racing can't continue safely.", action: 'Referee consulted — race neutralisation called.', status: ['In progress', 'warn'] },
  { dt: '14:35:20', rt: '5:20.0', lap: 20, type: 'incident', bib: 67, event: 'Crash detected on the home straight — three transponders stopped moving at once.', status: ['In progress', 'warn'] },
  { dt: '14:35:05', rt: '5:05.0', lap: 20, type: 'sprint', event: 'Sprint 2 run and closed — ' + sprintPtsText(D.sprints[1].seq) + ' · sent to TV.' },
  { dt: '14:35:00', rt: '5:00.6', lap: 19, type: 'lap', bib: 70, c: '#FF5C5C', ec: '#FF5C5C', event: 'Lap lost confirmed — caught by the bunch · <b>−20 pts</b>.' },
  { dt: '14:34:43', rt: '4:43.9', lap: 18, type: 'hardware', problem: 'Pursuit B decoder — network link lost.', effect: 'No transponder reads on Pursuit B · half the lap went blind.', action: 'Link came back after 9 s · reads resumed on Pursuit B.', status: ['Resolved', 'good'] },
  { dt: '14:34:27', rt: '4:27.8', lap: 17, type: 'lap', bib: 12, c: '#2ED47A', ec: '#2ED47A', event: 'Lap gained confirmed — rejoins the bunch · <b>+20 pts</b>.' },
  { dt: '14:34:27', rt: '4:27.2', lap: 17, type: 'alert', bib: 9, problem: 'Transponder not read at lap 16.', effect: 'His lap came in at double time (33.7 s) — a lap could be miscounted.', action: 'Lap confirmed from the pursuit loops · count left unchanged.', status: ['Resolved', 'good'] },
  { dt: '14:34:10', rt: '4:10.5', lap: 16, type: 'alert', bib: 46, problem: 'A bike counted on Pursuit A with no transponder read.', effect: 'The bunch shows one bike more than it reads.', action: 'Left as is — known rider carried without a transponder.', status: ['Ignored', 'dim'] },
  { dt: '14:34:02', rt: '4:02.0', lap: 16, type: 'abd', bib: 1, event: 'Abandoned following his crash — did not rejoin inside the 5-lap window.' },
  { dt: '14:33:50', rt: '3:50.2', lap: 15, type: 'dnf', bib: 58, event: 'Did not finish — pulled out by the commissaires (too slow).' },
  { dt: '14:33:46', rt: '3:46.0', lap: 15, type: 'incident', bib: 11, event: 'Back in the bunch on the spare bike — <b>riding without a transponder</b> · counted by the tape switch only.', status: ['Rejoined · no transponder', 'warn'] },
  { dt: '14:33:37', rt: '3:37.8', lap: 14, type: 'operator', bib: 12, event: 'Operator set the race leader — at his next crossing.' },
  { dt: '14:33:37', rt: '3:37.1', lap: 14, type: 'hardware', problem: 'Tape switch at 100 m — no counts since lap 12 · likely defective.', effect: "Bikes with no transponder can't be separated at that point.", action: 'Flagged to the timing crew · the other tapes cover it meanwhile.', status: ['Pending', 'warn'] },
  { dt: '14:33:20', rt: '3:20.4', lap: 13, type: 'group', bib: 70, event: 'Group formed — dropped at the back · gap <b>6.0 s</b>.' },
  { dt: '14:33:14', rt: '3:14.2', lap: 13, type: 'incident', bib: 1, problem: 'Heavy crash on the back straight — a fall · 1 Rivera down.', effect: 'Did not remount · attended by the medics.', action: '5-lap window running · watching for a restart.', status: ['In progress', 'warn'] },
  { dt: '14:33:03', rt: '3:03.7', lap: 12, type: 'group', bib: 12, event: 'Group formed — breaks clear alone at the front · gap <b>14.0 s</b>.' },
  { dt: '14:32:56', rt: '2:56.3', lap: 11, type: 'incident', bib: 11, problem: 'Mechanical — rear puncture · 11 Tanaka dropped from the bunch.', effect: 'Stopped for a bike change · loses contact with the bunch.', action: '5-lap window running · watching for a restart.', status: ['In progress', 'warn'] },
  { dt: '14:32:50', rt: '2:50.0', lap: 10, type: 'hardware', problem: 'Finish loop — no reads for 9 s.', effect: 'Crossings on the line were missed · order uncertain at this point.', action: 'Order rebuilt from the back-straight tape · reads resumed.', status: ['Resolved', 'good'] },
  { dt: '14:32:48', rt: '2:48.0', lap: 10, type: 'sprint', event: 'Sprint 1 closed — points applied to the classification.' },
  { dt: '14:32:47', rt: '2:47.5', lap: 10, type: 'sprint', event: 'Sprint 1 points — ' + sprintPtsText(S1) + '.' },
  { dt: '14:32:47', rt: '2:47.2', lap: 10, type: 'sprint', event: 'Sprint 1 sent live → TV, scoreboard, web.' },
  { dt: '14:32:46', rt: '2:46.6', lap: 10, type: 'sprint', event: 'Sprint 1 — order at the line: ' + sprintResult(S1) + '.' },
  { dt: '14:32:30', rt: '2:30.0', lap: 10, type: 'sprint', event: 'Sprint 1 armed — lap 10 approaching the line.' },
  { dt: '14:32:20', rt: '2:20.1', lap: 9, type: 'incident', bib: 23, event: 'Back in the bunch — rejoined within the window (3 laps).', status: ['Rejoined', 'good'] },
  { dt: '14:32:13', rt: '2:13.6', lap: 9, type: 'transponder', event: 'Pursuit A — 15 transponders read for 16 riders · 1 missing (two wheels too close to separate).' },
  { dt: '14:32:08', rt: '2:08.3', lap: 8, type: 'abd', bib: 3, event: 'Abandoned — stopped on his own.' },
  { dt: '14:31:20', rt: '1:20.4', lap: 6, type: 'incident', bib: 23, problem: 'Crash in turn 2 — a fall · 23 Iversen down, two riders held up.', effect: 'His transponder stopped moving · out of the race order.', action: '5-lap window open · watching for a restart.', status: ['In progress', 'warn'] },
  { dt: '14:31:06', rt: '1:06.8', lap: 5, type: 'transponder', event: 'Finish — 16 transponders read, all matched.' },
  { dt: '14:30:00', rt: '0:00.0', lap: 1, type: 'race', event: 'Start — 16 riders · lap counter linked.' },
  { dt: '14:29:52', rt: '—', lap: '—', type: 'dns', bib: 61, event: 'Did not start — set by the operator before the race.' },
];

const riderCell = bib => bib == null ? '' :
  `<span class="rbib">${bib}</span><span class="rf">${flag(R[bib].nat)}</span><span class="rnoc">${R[bib].nat}</span><span class="rnm"><span class="fn">${FIRST[bib] || ''}</span> <b>${R[bib].name}</b></span>`;

const rowHtml = e => {
  const T = TYPE[e.type], fil = T.fil || e.type, col = e.c || T.c;
  const anomaly = e.problem != null;
  const statusPill = e.status ? `<span class="st ${e.status[1]}">${e.status[0]}</span>` : '';
  const eventHtml = anomaly
    ? `<div class="anom"><div class="al"><span class="k">Problem</span>${e.problem}</div><div class="al"><span class="k">Effect</span>${e.effect}</div>${e.action ? `<div class="al"><span class="k">Action</span>${e.action}</div>` : ''}</div>`
    : `<span class="ev"${e.ec ? ` style="color:${e.ec}"` : ''}>${e.event}</span>`;
  const txt = (e.bib ? e.bib + ' ' + (R[e.bib] ? R[e.bib].name : '') : '') + ' ' + (e.event || e.problem + ' ' + e.effect);
  return `<div class="rr t-${fil}${anomaly ? ' anom-row' : ''}" data-text="${txt.toLowerCase().replace(/<[^>]+>/g, '')}" style="--c:${col}${T.bg ? ';--bg:' + T.bg : ''}">
    <span class="dt">${e.dt}</span>
    <span class="rt">${e.rt}</span>
    <span class="lp">${e.lap === '—' ? '—' : 'L' + e.lap}</span>
    <span class="ty" style="color:${col}">${T.label}</span>
    <span class="rider">${riderCell(e.bib)}</span>
    <span class="event">${eventHtml}</span>
    <span class="status">${statusPill}</span>
  </div>`;
};

const FILTERS = [['all', 'All'], ['race', 'Race'], ['group', 'Group'], ['sprint', 'Sprint'], ['lap', 'Lap'], ['transponder', 'Transponder'], ['operator', 'Operator'], ['incident', 'Incident'], ['withdraw', 'Withdraw'], ['alert', 'Alert'], ['hardware', 'Hardware']];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Race log</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.board-h .close{margin-left:auto;font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:5px 13px;background:#23272b;cursor:pointer}

.filt{display:flex;align-items:center;gap:7px;flex-wrap:wrap;flex:0 0 auto}
.filt .lbl{font:600 10px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.pf{font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:4px 10px;background:#23272b;cursor:pointer}
.pf.on{background:var(--acc);border-color:var(--acc);color:#fff}
.srch{margin-left:auto;font:500 12px var(--mono);color:var(--muted);background:#23272b;border:1px solid var(--line2);border-radius:4px;padding:6px 11px;width:230px}
.srch::placeholder{color:var(--dim)}

.rows{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto;gap:2px}
.ph,.rr{display:grid;grid-template-columns:90px 76px 46px 118px 236px minmax(0,1fr) 172px;gap:10px;padding:0 12px}
.ph{flex:0 0 auto;position:sticky;top:0;z-index:1;height:26px;align-items:center;background:var(--panel);font:600 10px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--line2)}
.ph .r{text-align:right}
.rr{flex:0 0 auto;min-height:36px;align-items:center;border-left:3px solid var(--c);background:#17191c}
.rr[style*="--bg"]{background:var(--bg)}
.rr.anom-row{align-items:stretch;padding-top:7px;padding-bottom:7px}
.rr .dt{font:500 12px var(--mono);color:var(--fg);font-variant-numeric:tabular-nums;align-self:center}
.rr .rt{font:500 12px var(--mono);color:var(--muted);align-self:center}
.rr .lp{font:600 12px var(--mono);color:var(--muted);align-self:center}
.rr .ty{font:700 11px var(--sans);letter-spacing:.05em;align-self:center}
.rider{display:inline-flex;align-items:center;gap:8px;align-self:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rider .rbib{font:600 14px var(--mono);color:var(--fg)}
.rider .rf .flag{width:24px;height:16px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.rider .rnoc{font:600 12px var(--mono);color:var(--dim)}
.rider .rnm{font:600 13px var(--sans);color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.rider .rnm .fn{color:var(--dim);font-weight:500}
.event{align-self:center;min-width:0}
.event .ev{font:500 13.5px var(--sans);color:var(--muted)}
.event .ev b{color:var(--fg)}
.anom{display:flex;flex-direction:column;gap:3px}
.anom .al{font:500 13px var(--sans);color:var(--muted);line-height:1.35}
.anom .al .k{display:inline-block;width:62px;font:700 10px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);vertical-align:1px}
/* résultat de sprint : drapeaux inline */
.event .pl{color:var(--dim);font-weight:600}
.event .rf .flag{width:18px;height:12px;border-radius:1px;display:inline-block;vertical-align:-1px;margin-right:3px;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.event .rn{color:var(--dim)}
.event .pt{color:var(--fg);font-weight:700;font-family:var(--mono)}
.status{align-self:center;display:flex;justify-content:flex-start}
.st{font:600 10px var(--sans);letter-spacing:.04em;text-transform:uppercase;padding:2px 9px;border-radius:999px;border:1px solid;white-space:nowrap}
.st.good{color:var(--good);border-color:#2ED47A66;background:#2ED47A14}
.st.warn{color:var(--warn);border-color:#F2A33A66;background:#F2A33A14}
.st.dim{color:var(--dim);border-color:#4a515a}
.none{padding:16px;color:var(--dim);font:500 13px var(--sans)}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Race log</b><span class="hint">the race's black box &middot; everything that happened, in plain words</span>
    <button class="close">Export journal</button>
  </div>
  <div class="filt">
    <span class="lbl">Filter</span>
    ${FILTERS.map(([f, l]) => `<button class="pf${f === 'all' ? ' on' : ''}" data-fil="${f}">${l}</button>`).join('')}
    <input class="srch" id="srch" placeholder="search bib, rider, text…">
  </div>
  <div class="rows" id="rows">
    <div class="ph"><span>Daytime</span><span>Race time</span><span>Lap</span><span>Type</span><span>Rider</span><span>Event</span><span>Status</span></div>
    ${LOG.map(rowHtml).join('\n    ')}
    <div class="none" id="none" hidden>Nothing matches this filter.</div>
  </div>
</div>
<script>
(function(){
  var fil='all', q='';
  function sync(){
    var n=0;
    document.querySelectorAll('.rr').forEach(function(r){
      var okF = fil==='all' || r.classList.contains('t-'+fil);
      var okQ = !q || (r.getAttribute('data-text')||'').indexOf(q)>=0;
      var show = okF && okQ; r.hidden=!show; if(show)n++;
    });
    document.getElementById('none').hidden = n>0;
  }
  document.querySelectorAll('[data-fil]').forEach(function(b){b.addEventListener('click',function(){
    fil=b.dataset.fil;
    document.querySelectorAll('[data-fil]').forEach(function(x){x.classList.toggle('on',x===b);});
    sync();
  });});
  document.getElementById('srch').addEventListener('input',function(e){q=e.target.value.toLowerCase().trim();sync();});
})();
</script>
</body></html>`;

fs.writeFileSync(`${BASE}/maquette-racelog.html`, html);
console.log('maquette race log écrite · ' + LOG.length + ' lignes');
