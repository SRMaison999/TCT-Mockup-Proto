// Génère mockups/maquette-passings.html — le relevé brut des capteurs, repensé.
//
// Modèle de capteurs repris TEL QUEL du prototype (timeline-prototype_mixed.html,
// buildTapes / applyCfg), sur la piste de la course de test (250 m, gap 10 m) :
//
//   Deux familles de passage
//   · Transponder — les 3 boucles qui NOMMENT le coureur : Finish, Pursuit B, Pursuit A.
//   · Timing pulse — les tape switches qui COMPTENT les contacts sans nommer, à 5 points :
//       on Finish (0 m), 200 m start (50 m), on Pursuit B (115 m),
//       100 m intermediate (150 m), on Pursuit A (240 m).
//
// Demande de l'opérateur (16 novembre 2026) : une couleur par POSITION (le point sur
// la piste), le TYPE de capteur (transpondeur / pulse) distingué par le style, et
// pouvoir trier par type ET par endroit.
//
// Les passages sont ILLUSTRATIFS — le prototype n'expose pas de relevé brut dans un
// fichier. Ils sont bâtis sur les coureurs réels (sprints.json) et la géométrie réelle
// (positions ci-dessus, allure 15 m/s), avec deux anomalies posées à la main.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const PACK = D.sprints[1].seq.map(e => e.bib);     // ordre du peloton sur la ligne

const PACE = 15;                                   // m/s
const TRACK = 250, LAP_T = TRACK / PACE;           // 16,667 s
const GAP = 0.19;                                  // écart entre deux roues du peloton
const NO_TP = 46;                                  // BEL — pas de transpondeur (compté par le ruban, jamais lu)

// Les points de la piste, dans l'ordre d'un tour. loop = une boucle y nomme le coureur ;
// tape = un tape switch y compte les contacts. loc = la clé de couleur / de filtre d'endroit.
const POINTS = [
  { loc: 'finish', name: 'Finish',     pos: 0,   loop: true,  tapeName: 'on Finish' },
  { loc: 'm200',   name: '200 m',      pos: 50,  loop: false, tapeName: '200 m start' },
  { loc: 'pursb',  name: 'Pursuit B',  pos: 115, loop: true,  tapeName: 'on Pursuit B' },
  { loc: 'm100',   name: '100 m',      pos: 150, loop: false, tapeName: '100 m intermediate' },
  { loc: 'pursa',  name: 'Pursuit A',  pos: 240, loop: true,  tapeName: 'on Pursuit A' },
];
const LOCNAME = { finish: 'Finish', m200: '200 m', pursb: 'Pursuit B', m100: '100 m', pursa: 'Pursuit A' };

const rows = [];
let id = 0;
const add = r => rows.push({ id: id++, ...r });
const lapStart = lap => lap * LAP_T + 300;

// Trois tours : 18 et 19 complets, 20 « live » — seuls les points déjà franchis (jusqu'à 100 m).
for (const lap of [18, 19, 20]) {
  const start = lapStart(lap);
  for (const P of POINTS) {
    if (lap === 20 && P.pos > 150) continue;       // pas encore atteint ce tour
    // passages transpondeur : un par coureur, à la boucle
    if (P.loop) {
      PACK.forEach((bib, i) => {
        if (bib === NO_TP) return;                 // pas de transpondeur : la boucle ne le voit pas
        add({ t: start + P.pos / PACE + i * GAP, fam: 'tag', loc: P.loc, point: P.name, bib, lap, sig: 'read', note: '' });
      });
    }
    // timing pulse : un par passage de groupe sur le tape switch
    let sig = '16 contacts for 16 reads', note = '', odd = false;
    if (lap === 20 && P.loc === 'pursb') { sig = '16 contacts for 15 reads'; note = '1 contact with no read — a bike without a transponder'; odd = true; }
    else if (lap === 19 && P.loc === 'm200') { sig = '15 contacts for 16 reads'; note = '1 read with no contact — two wheels too close to tell apart'; odd = true; }
    add({ t: start + P.pos / PACE + 1.4, fam: 'pulse', loc: P.loc, point: P.name, tapeName: P.tapeName, bib: null, lap, sig, note, odd });
  }
}

rows.sort((a, b) => b.t - a.t || a.id - b.id);
const SHOWN = rows.slice(0, 58);

// Loop health : lectures transpondeur par boucle
const tagHealth = { finish: 0, pursb: 0, pursa: 0 };
let pulseCount = 0;
rows.forEach(r => { if (r.fam === 'tag') tagHealth[r.loc]++; else pulseCount++; });

const fmtT = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(3); };
// Daytime = heure du jour (horloge murale), départ de la course posé à 14:00:00
const DAYSEC = 14 * 3600;
const p2 = (n, w) => String(n).padStart(w, '0');
const fmtDT = s => { const tot = DAYSEC + Math.max(0, s), h = Math.floor(tot / 3600) % 24, m = Math.floor(tot % 3600 / 60), sec = tot % 60, ss = Math.floor(sec); return `${p2(h, 2)}:${p2(m, 2)}:${p2(ss, 2)}.${p2(Math.round((sec - ss) * 1000), 3)}`; };

// icônes de famille (inline, currentColor)
const ICON_TAG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="2.2" fill="currentColor" stroke="none"/><path d="M8.2 9.2a5 5 0 0 1 7.6 0"/><path d="M5.6 6.6a8.5 8.5 0 0 1 12.8 0"/></svg>';
const ICON_PULSE = '<svg viewBox="0 0 24 24" width="14" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 15h4V9h5v9h2V6h5v9h4"/></svg>';

// Colonnes inspirées de la feuille Race log : Daytime · Race time · Lap · Type ·
// Location · Rider · Event · Status.
const rowHtml = r => {
  const rd = r.bib != null ? R[r.bib] : null;
  const fam = r.fam;   // 'tag' (transpondeur) | 'pulse' (timing pulse)
  const famLabel = fam === 'tag' ? 'Transponder' : 'Timing pulse';
  const famIcon = fam === 'tag' ? ICON_TAG : ICON_PULSE;
  const anomaly = r.odd ? ' odd' : '';
  const locName = LOCNAME[r.loc];
  const rider = rd
    ? `<span class="flagw">${flag(rd.nat)}</span><span class="rbib">${r.bib}</span><span class="rnoc">${rd.nat}</span><span class="rnm">${rd.name}</span>`
    : `<span class="rnone">group</span>`;
  const event = fam === 'tag' ? 'Read' : r.sig + (r.note ? ` &middot; ${r.note}` : '');
  return `<div class="prow ${fam} loc-${r.loc}${anomaly}">
    <span class="dt">${fmtDT(r.t)}</span>
    <span class="t">${fmtT(r.t)}</span>
    <span class="lap">${r.lap}</span>
    <span class="fam ${fam}">${famIcon}<span>${famLabel}</span></span>
    <span class="loc"><i></i>${locName}</span>
    <span class="rider">${rider}</span>
    <span class="event">${event}</span>
  </div>`;
};

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Passings</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--deep:#2c455e;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  /* une couleur par POSITION sur la piste */
  --loc-finish:#E0B64A;--loc-m200:#E8894A;--loc-pursb:#A98BE6;--loc-m100:#E06AA0;--loc-pursa:#45B6D6;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:7px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.board-h .close{margin-left:auto;font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:5px 13px;background:#23272b;cursor:pointer}

/* deux lignes de filtres : par type de capteur, et par endroit */
.filt{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:0 0 auto}
.filt .lbl{font:600 10px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--dim);min-width:62px}
.pf{font:500 12px var(--sans);color:var(--muted);border:1px solid var(--line2);border-radius:4px;padding:4px 10px;background:#23272b;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.pf.on{background:var(--acc);border-color:var(--acc);color:#fff}
.pf.warn.on{background:var(--warn);border-color:var(--warn);color:#121416}
.pf i{width:9px;height:9px;border-radius:2px;display:inline-block;flex-shrink:0}
.pf.l-finish i{background:var(--loc-finish)}.pf.l-m200 i{background:var(--loc-m200)}
.pf.l-pursb i{background:var(--loc-pursb)}.pf.l-m100 i{background:var(--loc-m100)}.pf.l-pursa i{background:var(--loc-pursa)}
.pfsep{width:1px;height:16px;background:var(--line2);opacity:.5;margin:0 2px}
.filt .health{margin-left:auto;display:flex;align-items:center;gap:8px;font:600 11px var(--mono)}
.filt .health .lbl{color:var(--muted);min-width:0}
.filt .health .h{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:4px;background:#23272b;color:var(--dim)}
.filt .health .h b{color:var(--muted)}
.filt .health .h::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--line2)}
.filt .health .h.finish::before{background:var(--loc-finish)}
.filt .health .h.pursb::before{background:var(--loc-pursb)}
.filt .health .h.pursa::before{background:var(--loc-pursa)}
.filt .note{font:500 11px var(--sans);color:var(--dim)}

/* la liste */
.tbl{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:auto;gap:2px;margin-top:2px}
.ph,.prow{display:grid;grid-template-columns:100px 84px 44px 140px 120px 244px minmax(0,1fr);gap:10px;align-items:center;padding:0 12px}
.ph{position:sticky;top:0;z-index:1;height:26px;background:var(--panel);font:600 10px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--line2)}
.ph .r{text-align:right}
.prow{min-height:32px;background:#17191c;border-left:3px solid var(--line2);font-size:13px;border-radius:0 3px 3px 0}
/* famille = style du trait : transpondeur plein, pulse en tirets */
.prow.pulse{border-left-style:dashed}
/* position = couleur de la ligne sur toute sa longueur (fond uni) + bordure gauche */
.prow.loc-finish{border-left-color:var(--loc-finish);background:#241f12}
.prow.loc-m200{border-left-color:var(--loc-m200);background:#261c13}
.prow.loc-pursb{border-left-color:var(--loc-pursb);background:#1f1a27}
.prow.loc-m100{border-left-color:var(--loc-m100);background:#271823}
.prow.loc-pursa{border-left-color:var(--loc-pursa);background:#142029}
.prow.odd{border-left-color:var(--warn)!important;background:#2a2012}
.prow .dt{font:500 12px var(--mono);color:var(--dim);font-variant-numeric:tabular-nums}
.prow .t{font:500 12px var(--mono);color:var(--fg);font-variant-numeric:tabular-nums}
/* famille : icône + mot */
.fam{display:inline-flex;align-items:center;gap:6px;font:600 11px var(--sans)}
.fam.tag{color:var(--muted)}
.fam.pulse{color:var(--dim)}
.fam svg{flex-shrink:0}
/* position : pastille de couleur + nom */
.loc{display:inline-flex;align-items:center;gap:7px;font:600 12px var(--sans);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.loc i{width:9px;height:9px;border-radius:2px;flex-shrink:0;display:inline-block}
.loc-finish .loc i{background:var(--loc-finish)}.loc-m200 .loc i{background:var(--loc-m200)}
.loc-pursb .loc i{background:var(--loc-pursb)}.loc-m100 .loc i{background:var(--loc-m100)}.loc-pursa .loc i{background:var(--loc-pursa)}
.prow .lap{font:600 13px var(--mono);color:var(--muted)}
/* Rider : drapeau + dossard + NOC + nom */
.rider{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.flagw .flag{width:24px;height:16px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.rider .rbib{font:600 14px var(--mono);color:var(--fg)}
.rider .rnoc{font:600 12px var(--mono);letter-spacing:.03em;color:var(--dim)}
.rider .rnm{font:600 13px var(--sans);color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.rider .rnone{font:500 12px var(--sans);color:var(--dim);font-style:italic}
/* Event : le signal / comptage brut */
.event{font:500 13px var(--mono);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prow.pulse .event{color:var(--dim)}
.prow.odd .event{color:var(--warn)}
/* Status : pastille de correspondance */
.status{display:flex;justify-content:flex-start}
.st{font:600 10px var(--sans);letter-spacing:.05em;text-transform:uppercase;padding:2px 9px;border-radius:999px;border:1px solid var(--line2)}
.st.matched{color:var(--dim);border-color:#4a515a}
.st.unmatched{color:var(--warn);border-color:var(--warn);background:#F2A33A14}
.foot{font:500 11px var(--sans);color:var(--dim);padding:9px 12px 2px;flex:0 0 auto}
.foot b{color:var(--warn);font-weight:600}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Passings</b><span class="hint">every transponder read and every timing-pulse passage &middot; newest first &middot; race time</span>
    <button class="close">Close</button>
  </div>

  <div class="filt">
    <span class="lbl">Type</span>
    <button class="pf on" data-sensor="all">All</button>
    <button class="pf" data-sensor="tag">${ICON_TAG}&nbsp;Transponder</button>
    <button class="pf" data-sensor="pulse">${ICON_PULSE}&nbsp;Timing pulse</button>
    <span class="pfsep"></span>
    <button class="pf warn" data-odd>Unmatched only</button>
    <span class="health"><span class="lbl">Loop health</span>` +
      `<span class="h finish">Finish <b>${tagHealth.finish}</b></span>` +
      `<span class="h pursb">Pursuit B <b>${tagHealth.pursb}</b></span>` +
      `<span class="h pursa">Pursuit A <b>${tagHealth.pursa}</b></span>` +
    `</span>
  </div>
  <div class="filt">
    <span class="lbl">Location</span>
    <button class="pf on" data-loc="all">All</button>
    <button class="pf l-finish" data-loc="finish"><i></i>Finish</button>
    <button class="pf l-m200" data-loc="m200"><i></i>200 m</button>
    <button class="pf l-pursb" data-loc="pursb"><i></i>Pursuit B</button>
    <button class="pf l-m100" data-loc="m100"><i></i>100 m</button>
    <button class="pf l-pursa" data-loc="pursa"><i></i>Pursuit A</button>
    <span class="note">a contact with no read is a bike without a transponder &middot; a read with no contact is a wheel the tape could not separate</span>
  </div>

  <div class="tbl">
    <div class="ph"><span>Daytime</span><span>Race time</span><span>Lap</span><span>Type</span><span>Location</span><span>Rider</span><span>Event</span></div>
    ${SHOWN.map(rowHtml).join('\n    ')}
  </div>
  <div class="foot">Last unmatched &middot; <b>Timing pulse · on Pursuit B · 16 contacts for 15 reads on Lap 20</b> — 1 bike more than the loops named (a bike without a transponder). Earlier: 200 m start · 1 read the tape could not separate on Lap 19.</div>
</div>
<script>
(function(){
  var sensor='all', loc='all', odd=false;
  function sync(){
    document.querySelectorAll('.prow').forEach(function(row){
      var okS = sensor==='all' || row.classList.contains(sensor);
      var okL = loc==='all' || row.classList.contains('loc-'+loc);
      var okO = !odd || row.classList.contains('odd');
      row.hidden = !(okS && okL && okO);
    });
  }
  document.querySelectorAll('[data-sensor]').forEach(function(b){b.addEventListener('click',function(){
    sensor=b.dataset.sensor;
    document.querySelectorAll('[data-sensor]').forEach(function(x){x.classList.toggle('on',x===b);});
    sync();
  });});
  document.querySelectorAll('[data-loc]').forEach(function(b){b.addEventListener('click',function(){
    loc=b.dataset.loc;
    document.querySelectorAll('[data-loc]').forEach(function(x){x.classList.toggle('on',x===b);});
    sync();
  });});
  var ob=document.querySelector('[data-odd]');
  ob.addEventListener('click',function(){odd=!odd;ob.classList.toggle('on',odd);sync();});
})();
</script>
</body></html>`;

fs.writeFileSync(`${BASE}/maquette-passings.html`, html);
console.log('maquette passings écrite · ' + SHOWN.length + ' lignes affichées / ' + rows.length + ' au total');
