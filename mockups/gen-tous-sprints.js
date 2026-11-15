const fs = require('fs');
const BASE = __dirname;
const REPO = require('path').join(__dirname, '..');
const d = require(`${BASE}/sprints.json`);
// flag() repris tel quel de flags.js (fonction pure, aucune dépendance navigateur)
const flag = new Function(fs.readFileSync(`${REPO}/flags.js`, 'utf8') + '\nreturn flag;')();

const col = (s) => {
  const lbl = s.final ? 'FINAL' : 'SPRINT ' + s.k;
  const head = `<div class="spcol-h${s.final ? ' fin' : ''}">
      <div class="spcol-t">${lbl}${s.final ? '<span class="x2">×2</span>' : ''}</div>
      <div class="spcol-s">LAP ${s.lap} · <span class="pill ${s.sent === 'not sent' ? 'warn' : 'good'}">${s.sent === 'live' ? 'live' : s.sent === 'sent' ? 'sent' : 'not sent'}</span></div>
    </div>`;
  const rows = s.seq.map((e, i) => {
    const place = i + 1, score = e.pts > 0, ne = e.ne;
    const nat = (d.riders[e.bib] || {}).nat || '';
    const sepAfter = place === 4 ? ' sepline' : '';
    return `<div class="sprk${score ? ' score' : ''}${ne ? ' ne' : ''}${sepAfter}">
        <span class="pl">${ne ? '' : place}</span>
        <span class="chip">${e.bib}</span>
        <span class="flagw">${flag(nat)}</span>
        <span class="noc">${nat}</span>
        <span class="pts">${ne ? '<span class="npts">NO PTS</span>' : (score ? '+' + e.pts : '')}</span>
      </div>`;
  }).join('');
  return `<div class="spcol${s.final ? ' fin' : ''}">${head}<div class="spcol-b">${rows}</div></div>`;
};

function page(sprints, title) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;
  --bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;
  padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:baseline;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.board-h .close{margin-left:auto;font:500 12px var(--sans);color:var(--dim);border:1px solid var(--line2);
  border-radius:4px;padding:4px 10px;background:#23272b;cursor:pointer}
.colswrap{position:relative;flex:1 1 auto;min-height:0;display:flex}
.cols{flex:1 1 auto;min-height:0;display:flex;align-items:flex-start;gap:8px;overflow-x:auto;overflow-y:hidden;padding-bottom:6px;scroll-behavior:smooth;scrollbar-color:var(--line2) transparent}
.nav{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:54px;border-radius:6px;
  border:1px solid var(--line2);background:#23272bf0;color:var(--muted);font:400 22px var(--sans);
  cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:5;box-shadow:0 2px 10px #0008}
.nav.left{left:2px}.nav.right{right:2px}
.nav:hover{border-color:var(--muted)}
.nav[disabled]{display:none}
.spcol{flex:0 0 150px;max-height:100%;display:flex;flex-direction:column;background:#17191c;border:1px solid var(--line2);
  border-radius:4px;overflow:hidden}
.spcol.fin{border-color:var(--fg)}
.spcol-h{padding:6px 8px 7px;border-bottom:1px solid var(--line);background:#1b1d20;flex:0 0 auto}
.spcol-h.fin{background:#241f14}
.spcol-t{font:700 12.5px var(--sans);letter-spacing:.03em;color:var(--muted);display:flex;align-items:center;gap:6px}
.spcol-t .x2{font:700 10px var(--sans);color:#121416;background:var(--fg);border-radius:3px;padding:1px 5px;letter-spacing:.04em}
.spcol-s{margin-top:3px;font:500 11px var(--sans);color:var(--dim);display:flex;align-items:center;gap:5px}
.pill{display:inline-block;border-radius:999px;padding:0 7px;font:600 10px var(--sans);border:1px solid var(--line2);color:var(--fg);white-space:nowrap}
.pill.good{border-color:var(--good);color:var(--good)}
.pill.warn{border-color:var(--warn);color:var(--warn)}
.spcol-b{flex:1 1 auto;min-height:0;overflow-y:auto}
.sprk{display:grid;grid-template-columns:16px 30px 20px 1fr 28px;gap:4px;align-items:center;height:25px;padding:0 6px}
.sprk + .sprk{border-top:1px solid #23262a}
.sprk.score{background:#1d2a22}
.sprk.sepline{box-shadow:inset 0 -2px 0 var(--line2)}
.sprk.ne{background:#3a1515}
.sprk .pl{font:600 12px var(--mono);color:var(--dim);text-align:right}
.sprk.score .pl{color:var(--muted)}
.chip{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:21px;padding:0 4px;
  font:600 13px var(--mono);color:var(--fg);background:0}
.flagw .flag{width:20px;height:13px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.noc{font:600 12px var(--mono);letter-spacing:.03em;color:var(--dim);overflow:hidden;text-overflow:ellipsis}
.sprk.score .noc{color:var(--muted)}
.sprk.ne .noc{display:none}
.pts{font:700 12px var(--mono);color:var(--good);text-align:right;overflow:visible}
.npts{display:inline-block;font:700 9px var(--sans);letter-spacing:.04em;color:#2a0d0d;background:var(--crit);
  border-radius:3px;padding:1px 5px;white-space:nowrap}
</style></head>
<body>
<div class="board">
  <div class="board-h">
    <b>All sprints</b>
    <span class="hint">every sprint at a glance · left to right · top four score · the final counts double</span>
    <button class="close">Close</button>
  </div>
  <div class="colswrap">
    <button class="nav left" aria-label="Previous sprints">‹</button>
    <div class="cols">
    ${sprints.map(col).join('\n    ')}
    </div>
    <button class="nav right" aria-label="Next sprints">›</button>
  </div>
</div>
<script>
  var cols=document.querySelector('.cols'),L=document.querySelector('.nav.left'),R=document.querySelector('.nav.right');
  var step=function(){return Math.max(160,cols.clientWidth*0.8)};
  L.onclick=function(){cols.scrollBy({left:-step()})};
  R.onclick=function(){cols.scrollBy({left:step()})};
  function upd(){var max=cols.scrollWidth-cols.clientWidth;L.disabled=cols.scrollLeft<=2;R.disabled=cols.scrollLeft>=max-2;}
  cols.addEventListener('scroll',upd);window.addEventListener('resize',upd);upd();
</script>
</body></html>`;
}

// --- version réelle (6 sprints) + un passage grisé illustratif au sprint 3 ---
const real = JSON.parse(JSON.stringify(d.sprints));
const s3 = real.find(s => s.k === 3);
if (s3) { const e = s3.seq.find(x => x.bib === 58); if (e) { e.ne = true; e.pts = 0; } }   // 58 KAZ : illustratif, non éligible
fs.writeFileSync(`${BASE}/maquette-tous-sprints.html`, page(real, 'Maquette · Tous les sprints'));

// --- version densité : 20 sprints (données répliquées pour juger la largeur) ---
const many = [];
for (let k = 1; k <= 19; k++) { const src = d.sprints[(k - 1) % 5]; many.push({ ...JSON.parse(JSON.stringify(src)), k, final: false, lap: k * 10 }); }
many.push({ ...JSON.parse(JSON.stringify(d.sprints[5])), k: 20, final: true, lap: 200 });
fs.writeFileSync(`${BASE}/maquette-tous-sprints-20.html`, page(many, 'Maquette · 20 sprints'));

console.log('maquettes écrites (6 réels + 20 densité)');
