// Génère mockups/maquette-passings.html — le relevé brut des boucles, repensé.
//
// Demande de l'opérateur (16 novembre 2026) : garder le flux chronologique, mais
// « des démarcations colorées pour différencier les différents types de Passings,
// dans le style de la vue Race logs ». Chaque ligne porte donc une bordure gauche
// et une pastille de type colorées selon le point de passage (Finish / Pursuit A /
// Pursuit B / Tape switch), et les anomalies (contact sans lecture, lecture sans
// contact) ressortent en orange, comme dans le reste du prototype.
//
// Les lectures sont ILLUSTRATIVES — le prototype n'expose pas de relevé brut dans
// un fichier. Elles sont bâties à partir des coureurs réels de la course de test
// (palier 1, sprints.json) et de temps de tour réalistes (~16,5 s à 250 m), avec
// deux anomalies typiques posées à la main pour montrer ce que la vue doit rendre.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;                        // {bib:{nat,name}}

// Ordre du peloton sur la ligne, repris de l'ordre de passage réel du sprint 2.
const PACK = D.sprints[1].seq.map(e => e.bib);   // 16 dossards, de la tête à la queue

// Les trois boucles de la piste, et l'instant où un coureur les franchit dans un
// tour. Finish et Pursuit A sont voisines sur la ligne d'arrivée (leurs lectures
// s'entremêlent, comme dans le relevé réel) ; Pursuit B est de l'autre côté.
const LOOPS = [
  { key: 'finish', name: 'Finish',    off: 0.0 },
  { key: 'pursA',  name: 'Pursuit A', off: 0.9 },
  { key: 'pursB',  name: 'Pursuit B', off: 8.3 },
];

const LAP_T = 16.6;                        // temps de tour moyen (s)
const GAP = 0.19;                          // écart entre deux roues du peloton (s)
// Petite variation de cadence par dossard, pour que les temps de tour ne soient pas tous identiques.
const JIT = {}; PACK.forEach((b, i) => { JIT[b] = ((b * 7) % 9 - 4) / 100; });   // ±0,04 s, déterministe

// Un coureur sans transpondeur : il déclenche les tapes (contact) mais aucune boucle ne le lit.
const NO_TP = 46;                          // BEL — porté à la main dans les sprints

const rows = [];
let id = 0;
const add = r => rows.push({ id: id++, ...r });

// Trois tours : L18 et L19 complets, puis L20 « live » — seules Finish et Pursuit A
// sont déjà franchies (le peloton n'a pas encore atteint Pursuit B de ce tour).
const lapStart = lap => lap * LAP_T + 300;
const lapLoops = lap => lap === 20 ? LOOPS.filter(L => L.key !== 'pursB') : LOOPS;
for (const lap of [18, 19, 20]) {
  const start = lapStart(lap);
  lapLoops(lap).forEach(L => {
    PACK.forEach((bib, pos) => {
      if (bib === NO_TP) return;           // pas de transpondeur : aucune lecture de boucle
      const t = start + L.off + pos * GAP + JIT[bib] * L.off;
      add({ t, type: L.key, point: L.name, bib, lap, sig: 'read', note: '' });
    });
  });
}

// Passages de tape switch : le ruban compte les vélos d'un groupe sans les nommer.
// Le peloton franchit chaque tape une fois par tour ; on en pose quelques-uns, dont
// les deux anomalies que la vue doit rendre lisibles.
const TAPES = [
  { name: 'Home straight', pos: 0.0 },
  { name: 'Back straight', pos: 8.3 },
];
for (const lap of [18, 19, 20]) {
  const start = lapStart(lap);
  TAPES.forEach(T => {
    const t = start + T.pos + 1.6;
    // anomalies posées à la main, réparties pour rester visibles
    if (lap === 20 && T.name === 'Home straight') {   // le tour live, en haut de la liste
      add({ t, type: 'tape', point: T.name, bib: null, lap,
            sig: '16 contacts for 15 reads', note: '1 contact with no read', odd: true, crit: true });
      return;
    }
    if (lap === 20 && T.name === 'Back straight') return;   // pas encore franchie ce tour
    if (lap === 19 && T.name === 'Back straight') {
      add({ t, type: 'tape', point: T.name, bib: null, lap,
            sig: '16 contacts for 15 reads', note: '1 read with no contact', odd: true });
      return;
    }
    add({ t, type: 'tape', point: T.name, bib: null, lap,
          sig: '15 contacts for 15 reads', note: '', odd: false });
  });
}

rows.sort((a, b) => b.t - a.t || a.id - b.id);
const SHOWN = rows.slice(0, 64);

// comptage par boucle, pour LOOP HEALTH
const health = { finish: 0, pursA: 0, pursB: 0, tape: 0 };
rows.forEach(r => { if (health[r.type] != null) health[r.type]++; });

const fmtT = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3); };

const TYPE = {
  finish: { label: 'Finish',    cls: 'finish' },
  pursA:  { label: 'Pursuit A', cls: 'pursa' },
  pursB:  { label: 'Pursuit B', cls: 'pursb' },
  tape:   { label: 'Tape',      cls: 'tape' },
};

const rowHtml = r => {
  const rd = r.bib != null ? R[r.bib] : null;
  const meta = TYPE[r.type];
  const anomaly = r.odd ? (r.crit ? ' crit' : ' warn') : '';
  return `<div class="prow ${meta.cls}${anomaly}">
    <span class="t">${fmtT(r.t)}</span>
    <span class="ty"><span class="typill ${meta.cls}">${meta.label}</span></span>
    <span class="bib">${r.bib != null ? r.bib : '—'}</span>
    <span class="flagw">${rd ? flag(rd.nat) : ''}</span>
    <span class="noc">${rd ? rd.nat : ''}</span>
    <span class="lp">L${r.lap}</span>
    <span class="sig">${r.sig}</span>
    <span class="mk">${r.note}</span>
  </div>`;
};

const health_html =
  `<span class="h finish">Finish <b>${health.finish}</b></span>` +
  `<span class="h pursa">Pursuit A <b>${health.pursA}</b></span>` +
  `<span class="h pursb">Pursuit B <b>${health.pursB}</b></span>` +
  `<span class="h tape">Tape <b>${health.tape}</b></span>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Passings</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  /* une couleur par type de passage */
  --c-finish:#E0B64A;--c-pursa:#45B6D6;--c-pursb:#A98BE6;--c-tape:#E08BB0;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.board-h .close{margin-left:auto;font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:5px 13px;background:#23272b;cursor:pointer}

/* la barre de filtres, reprise de l'onglet actuel */
.filt{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:0 0 auto;padding:2px 2px 6px}
.filt .lbl{font:600 10px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.pf{font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:4px 10px;background:#23272b;cursor:pointer}
.pf.on{background:var(--acc);border-color:var(--acc);color:#fff}
.pf.warn.on{background:var(--warn);border-color:var(--warn);color:#121416}
.pfsep{width:1px;height:18px;background:var(--line2);opacity:.5;margin:0 2px}
.filt .note{font:500 11px var(--sans);color:var(--dim)}
.health{margin-left:auto;display:flex;align-items:center;gap:8px;font:600 11px var(--mono)}
.health .lbl{color:var(--muted)}
.health .h{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:4px;background:#23272b;color:var(--dim)}
.health .h b{color:var(--muted)}
.health .h::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--line2)}
.health .h.finish::before{background:var(--c-finish)}
.health .h.pursa::before{background:var(--c-pursa)}
.health .h.pursb::before{background:var(--c-pursb)}
.health .h.tape::before{background:var(--c-tape)}

/* la liste */
.tbl{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto;gap:2px}
.ph,.prow{display:grid;grid-template-columns:76px 104px 46px 30px 48px 56px minmax(0,1fr) 300px;gap:10px;align-items:center;padding:0 12px}
.ph{position:sticky;top:0;z-index:1;height:26px;background:var(--panel);font:600 10px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--line2)}
.ph .r{text-align:right}
.prow{min-height:32px;background:#17191c;border-left:3px solid var(--line2);font-size:13px;border-radius:0 3px 3px 0}
/* la démarcation colorée par type : bordure + léger fond teinté */
.prow.finish{border-left-color:var(--c-finish);background:linear-gradient(90deg,#E0B64A14,#17191c 120px)}
.prow.pursa{border-left-color:var(--c-pursa);background:linear-gradient(90deg,#45B6D614,#17191c 120px)}
.prow.pursb{border-left-color:var(--c-pursb);background:linear-gradient(90deg,#A98BE614,#17191c 120px)}
.prow.tape{border-left-color:var(--c-tape);background:linear-gradient(90deg,#E08BB018,#17191c 160px)}
.prow.warn{border-left-color:var(--warn);background:linear-gradient(90deg,#F2A33A1f,#17191c 220px)}
.prow.crit{border-left-color:var(--crit);background:linear-gradient(90deg,#FF5C5C22,#17191c 220px)}
.prow .t{font:500 12px var(--mono);color:var(--fg);font-variant-numeric:tabular-nums}
.typill{display:inline-block;font:600 10px var(--sans);letter-spacing:.05em;text-transform:uppercase;padding:2px 9px;border-radius:999px;border:1px solid var(--line2);color:var(--dim)}
.typill.finish{color:var(--c-finish);border-color:#E0B64A66;background:#E0B64A14}
.typill.pursa{color:var(--c-pursa);border-color:#45B6D666;background:#45B6D614}
.typill.pursb{color:var(--c-pursb);border-color:#A98BE666;background:#A98BE614}
.typill.tape{color:var(--c-tape);border-color:#E08BB066;background:#E08BB014}
.prow .bib{font:600 14px var(--mono);color:var(--fg);text-align:right}
.flagw .flag{width:24px;height:16px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.prow .noc{font:600 12px var(--mono);letter-spacing:.03em;color:var(--dim)}
.prow .lp{font:500 12px var(--mono);color:var(--muted)}
.prow .sig{font:500 13px var(--mono);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prow .mk{font:600 11px var(--sans);letter-spacing:.03em;text-align:right;color:var(--dim)}
.prow.warn .mk{color:var(--warn)}
.prow.crit .mk{color:var(--crit)}
.foot{font:500 11px var(--sans);color:var(--dim);padding:10px 12px 2px;flex:0 0 auto}
.foot b{color:var(--warn);font-weight:600}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Passings</b><span class="hint">every loop reading and every tape-switch passage &middot; newest first &middot; race time</span>
    <button class="close">Close</button>
  </div>

  <div class="filt">
    <span class="lbl">Source</span>
    <button class="pf on">All</button>
    <button class="pf">Finish</button>
    <button class="pf">Pursuit A</button>
    <button class="pf">Pursuit B</button>
    <button class="pf">Tape switches</button>
    <span class="pfsep"></span>
    <button class="pf warn">Unmatched only</button>
    <span class="note">a contact with no read is a bike without a transponder &middot; a read with no contact is a wheel the tape could not separate</span>
    <span class="health"><span class="lbl">Loop health</span>${health_html}</span>
  </div>

  <div class="tbl">
    <div class="ph"><span>Time</span><span>Type</span><span class="r">Bib</span><span></span><span>NOC</span><span>Lap</span><span>Signal / count</span><span class="r">Note</span></div>
    ${SHOWN.map(rowHtml).join('\n    ')}
  </div>
  <div class="foot">Last unmatched &middot; <b>Home straight &middot; 16 contacts for 15 reads on Lap 20 — 1 bike more than the loop named</b> (a bike without a transponder). Earlier: Back straight &middot; 1 read the tape could not separate on Lap 19.</div>
</div>
</body></html>`;

fs.writeFileSync(`${BASE}/maquette-passings.html`, html);
console.log('maquette passings écrite · ' + SHOWN.length + ' lignes affichées / ' + rows.length + ' au total');
