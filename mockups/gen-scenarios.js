// Génère mockups/maquette-scenarios.html — « Possible scenarios » (ex-Race situation).
//
// Proposition NEUVE (16 nov. 2026) après rejet de la version en prose empilée (§9.4).
// Vue tournée vers l'AVENIR : avec X tours / Y sprints restants, ce qui est encore possible.
//   1. Bannière « points encore en jeu ».
//   2. Barres de PORTÉE : plancher = total actuel, plafond = actuel + points de sprint restants
//      (+20 si un tour gagné). On voit qui est verrouillé et où sont les bagarres.
//      Fourchette de place possible par coureur (best → worst).
//   3. Cartes de BAGARRES ciblées : la victoire, le podium, la dernière place qualifiante,
//      avec la condition qui tranche en UNE phrase. Pas de prose empilée.
// Scénario ILLUSTRATIF (fin de course serrée, 2 sprints restants), coureurs réels.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(__dirname, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };

// scénario : 2 sprints restants (S5 = 5, Final = 10) → 15 pts en jeu ; un tour = +20
const SPRINT_LEFT = 15, LAP = 20, QUAL = 10;   // 10 premiers qualifiés (illustratif)
const STAND = [
  { bib: 3, pts: 28 }, { bib: 52, pts: 25 }, { bib: 12, pts: 23 }, { bib: 9, pts: 20 },
  { bib: 15, pts: 18 }, { bib: 4, pts: 15 }, { bib: 11, pts: 12 }, { bib: 23, pts: 10 },
  { bib: 70, pts: 8 }, { bib: 7, pts: 6 }, { bib: 61, pts: 4 }, { bib: 18, pts: 2 },
];
STAND.forEach((r, i) => { r.rank = i + 1; r.ceil = r.pts + SPRINT_LEFT; });
const N = STAND.length;
const by = b => STAND.find(r => r.bib === b);
// fourchette de place possible (bornes mathématiques)
STAND.forEach(r => {
  r.best = 1 + STAND.filter(x => x.pts > r.ceil).length;                 // ceux qu'il ne rattrapera jamais
  r.worst = 1 + STAND.filter(x => x !== r && x.ceil > r.pts).length;     // ceux qui peuvent le dépasser
});
const leader = STAND[0];
const maxAxis = STAND[0].ceil + 2;
const nm = b => (FIRST[b] ? FIRST[b] + ' ' : '') + R[b].name;
const chip = b => `<span class="ch"><span class="cf">${flag(R[b].nat)}</span><b>${b}</b> ${R[b].name}</span>`;

/* ---- barres de portée ---- */
const barRow = r => {
  const canWin = r.ceil >= leader.pts;
  const fillW = (r.pts / maxAxis * 100).toFixed(1);
  const reachW = (SPRINT_LEFT / maxAxis * 100).toFixed(1);
  const place = r.best === r.worst ? 'P' + r.best : 'P' + r.best + '–' + r.worst;
  return `<div class="brow${canWin ? ' win' : ''}">
    <span class="brk">${r.rank}</span>
    <span class="bf">${flag(R[r.bib].nat)}</span>
    <span class="bbib">${r.bib}</span>
    <span class="bnm"><span class="fn">${FIRST[r.bib] || ''}</span> <b>${R[r.bib].name}</b></span>
    <span class="bpts">${r.pts}</span>
    <span class="bar"><span class="fill" style="width:${fillW}%"></span><span class="reach" style="width:${reachW}%"></span><span class="cap">${r.ceil}</span></span>
    <span class="bpl">${place}</span>
  </div>`;
};
// trait vertical « pour mener » à la hauteur du total actuel du leader
const winLineLeft = (leader.pts / maxAxis * 100).toFixed(1);

/* ---- cartes de bagarres ---- */
const battles = [
  {
    title: 'The win', place: 'P1', tone: 'good',
    riders: [3, 52, 12],
    line: `<b>${R[3].name}</b> (28) seals the race with <b>any point</b> in Sprint 5 or the final. If he blanks both, ${R[52].name} (25) or ${R[12].name} (23) can still win — but they must win the sprints themselves.`,
  },
  {
    title: 'The podium', place: 'P3–P5', tone: 'acc',
    riders: [12, 9, 15],
    line: `Behind the top two, <b>${R[12].name}</b> (23), <b>${R[9].name}</b> (20) and <b>${R[15].name}</b> (18) fight for 3rd to 5th — decided on the final order.`,
  },
  {
    title: 'Last qualifying place', place: 'P10', tone: 'warn',
    riders: [7, 61],
    line: `<b>${R[7].name}</b> (10th, 6 pts) holds the last top-10 spot unless <b>${R[61].name}</b> (11th, 4) finishes clearly ahead in the closing sprints.`,
  },
];
const battleCard = b => `<div class="bc ${b.tone}">
    <div class="bch"><span class="bct">${b.title}</span><span class="bcp">${b.place}</span></div>
    <div class="bcr">${b.riders.map(chip).join('')}</div>
    <div class="bcl">${b.line}</div>
  </div>`;

/* ---- données pour le projecteur « what if » (rendu client) ---- */
const WIDATA = {
  riders: STAND.map(r => ({ bib: r.bib, nat: R[r.bib].nat, name: R[r.bib].name, flag: flag(R[r.bib].nat), pts: r.pts, rank: r.rank })),
  s5: [5, 3, 2, 1], fin: [10, 6, 4, 2],
  s5def: [3, 52, 12, 9], findef: [52, 12, 15, 4],   // un final plausible par défaut (Rossi gagne le final)
};
const WIDATA_JSON = JSON.stringify(WIDATA).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup · Possible scenarios</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{color-scheme:dark;--bg:#121416;--panel:#4a4945;--line:#2d3237;--line2:#87a8c9;
  --fg:#ffecb3;--muted:#fffafa;--dim:#c1bdb4;--acc:#2265e2;--good:#2ED47A;--warn:#F2A33A;--crit:#FF5C5C;
  --sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--muted);font:14px/1.3 var(--sans)}
.seg{display:inline-flex;border:1px solid var(--line2);border-radius:5px;overflow:hidden}
.seg button{font:600 12px var(--sans);color:var(--dim);border:0;padding:5px 14px;background:#23272b;cursor:pointer;border-right:1px solid var(--line2)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--acc);color:#fff}
.board{position:fixed;inset:16px;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:12px 14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;box-shadow:0 18px 48px #000a}
.board-h{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.board-h b{font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.board-h .hint{font:500 12px var(--sans);color:var(--dim)}
.togo{margin-left:auto;font:600 12px var(--mono);color:var(--fg);border:1px solid var(--line2);border-radius:999px;padding:4px 12px}
.inplay{flex:0 0 auto;display:flex;align-items:center;gap:10px;background:#1c1e22;border:1px solid var(--line);border-radius:6px;padding:9px 13px;font:500 13px var(--sans);color:var(--muted)}
.inplay b{color:var(--fg)}
.inplay .k{font:700 10px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--dim);margin-right:2px}
.inplay .pill{font:700 12px var(--mono);border-radius:5px;padding:2px 8px;background:#39311c;color:var(--fg)}
.inplay .lap{background:#13261a;color:var(--good)}

.main{flex:1 1 auto;min-height:0;display:flex;gap:14px}
.col{display:flex;flex-direction:column;min-height:0;background:#1c1e22;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.col.bars{flex:1.5 1 0}
.col.fight{flex:1 1 0}
.ch2{font:600 11px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:9px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}
.ch2 .sub{font:500 10px var(--sans);letter-spacing:0;text-transform:none;color:var(--dim)}
.barswrap{flex:1 1 auto;overflow:auto;padding:4px 10px 10px;position:relative}
.winline{position:absolute;top:34px;bottom:10px;width:0;border-left:1px dashed #2ED47A66;z-index:1}
.winlabel{position:absolute;top:14px;font:600 10px var(--sans);color:var(--good);transform:translateX(-50%)}
.brow{display:grid;grid-template-columns:26px 26px 30px 150px 32px 1fr 64px;gap:9px;align-items:center;min-height:34px}
.brk{font:700 13px var(--mono);color:var(--dim);text-align:right}
.bf .flag{width:24px;height:16px;border-radius:2px;display:block;box-shadow:0 0 0 1px #0006}
.bbib{font:600 13px var(--mono);color:var(--fg)}
.bnm{font:600 13px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bnm .fn{color:var(--dim);font-weight:500}
.bpts{font:700 15px var(--mono);color:var(--fg);text-align:right}
.bar{position:relative;display:flex;align-items:center;height:16px;background:#23262b;border-radius:4px;overflow:visible}
.bar .fill{height:16px;background:#6b7178;border-radius:4px 0 0 4px}
.brow.win .bar .fill{background:#C6A64A}
.bar .reach{height:16px;background:repeating-linear-gradient(135deg,#6b717833,#6b717833 4px,transparent 4px,transparent 8px);border-right:1px solid var(--dim)}
.brow.win .bar .reach{background:repeating-linear-gradient(135deg,#2ED47A44,#2ED47A44 4px,transparent 4px,transparent 8px);border-right-color:var(--good)}
.bar .cap{position:absolute;left:100%;margin-left:6px;font:700 12px var(--mono);color:var(--dim);white-space:nowrap}
.bpl{font:600 12px var(--mono);color:var(--muted);text-align:right}
.brow.win .bpl{color:var(--good)}

.fightwrap{flex:1 1 auto;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:10px}
.bc{border:1px solid var(--line);border-radius:6px;padding:10px 12px;background:#17191c}
.bch{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.bct{font:700 12px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.bcp{margin-left:auto;font:700 11px var(--mono);color:var(--dim);border:1px solid var(--line2);border-radius:999px;padding:2px 9px}
.bc.good .bcp{color:var(--good);border-color:#2ED47A66}.bc.acc .bcp{color:#8FB4FF;border-color:#8FB4FF66}.bc.warn .bcp{color:var(--warn);border-color:#F2A33A66}
.bcr{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.ch{display:inline-flex;align-items:center;gap:6px;background:#23262b;border-radius:5px;padding:3px 8px;font:600 12px var(--sans);color:var(--muted)}
.ch .cf .flag{width:20px;height:13px;border-radius:2px;display:block}
.ch b{font:700 12px var(--mono);color:var(--fg)}
.bcl{font:500 13.5px var(--sans);color:var(--dim);line-height:1.4}
.bcl b{color:var(--muted);font-weight:600}
.note{flex:0 0 auto;font:500 12px var(--sans);color:var(--dim)}

/* ---- projecteur « what if » ---- */
.whatif{flex:1 1 auto;min-height:0;display:flex;gap:14px}
.wi-in{flex:0 0 400px;display:flex;flex-direction:column;gap:12px;overflow:auto}
.wi-sprint{background:#1c1e22;border:1px solid var(--line);border-radius:6px;padding:11px 13px}
.wi-sh{font:700 12px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;display:flex;align-items:center;gap:8px}
.wi-sh .pts{font:600 11px var(--mono);color:var(--dim);letter-spacing:0;text-transform:none}
.wi-slot{display:grid;grid-template-columns:66px 1fr;gap:9px;align-items:center;margin-bottom:7px}
.wi-slot:last-child{margin-bottom:0}
.wi-slot .pl{font:700 12px var(--mono);color:var(--fg)}
.wi-slot select{font:500 13px var(--sans);color:var(--muted);background:#23262b;border:1px solid var(--line2);border-radius:5px;padding:7px 8px;width:100%}
.wi-reset{font:500 12px var(--sans);color:var(--muted);background:#23262b;border:1px solid var(--line2);border-radius:5px;padding:8px 13px;cursor:pointer;align-self:flex-start}
.wi-out{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;background:#1c1e22;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.wi-th{font:600 11px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:10px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}
.wi-th .sub{font:500 10px var(--sans);letter-spacing:0;text-transform:none;color:var(--dim)}
.wi-rows{flex:1 1 auto;overflow:auto;padding:4px}
.wir{display:grid;grid-template-columns:30px 30px 26px 34px 1fr 56px 70px;gap:9px;align-items:center;padding:6px 10px;border-radius:5px;min-height:38px}
.wir:nth-child(even){background:#00000022}
.wir .wrk{font:700 15px var(--mono);color:var(--muted);text-align:right}
.wir .wdl{font:700 12px var(--mono);text-align:center}
.wir .wdl.up{color:var(--good)}.wir .wdl.down{color:var(--crit)}.wir .wdl.same{color:#5a5f66}
.wir .wf .flag{width:24px;height:16px;border-radius:2px;display:block;box-shadow:0 0 0 1px #0006}
.wir .wb{font:600 13px var(--mono);color:var(--fg)}
.wir .wn{font:600 14px var(--sans);color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wir .wadd{font:600 12px var(--mono);color:var(--good);text-align:right}
.wir .wtot{font:700 18px var(--mono);color:var(--fg);text-align:right}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Possible scenarios</b><span class="hint">what is still possible, looking ahead</span>
    <span class="seg"><button class="on" data-wv="overview">Overview</button><button data-wv="whatif">What if…</button></span>
    <span class="togo">11 laps to go &middot; 2 sprints left</span>
  </div>
  <div class="inplay"><span class="k">Still in play</span>
    <span class="pill">Sprint 5 · +5</span><span class="pill">Final · +10</span>
    <b>up to 15 pts from the sprints</b> · a lap gained is worth <span class="pill lap">+20</span>
  </div>
  <div class="main" id="v-overview">
    <div class="col bars">
      <div class="ch2">Reachable points <span class="sub">solid = secured now · hatched = still in play · green = can still win</span></div>
      <div class="barswrap">
        ${STAND.map(barRow).join('\n        ')}
      </div>
    </div>
    <div class="col fight">
      <div class="ch2">The battles <span class="sub">only the places still open — one line each</span></div>
      <div class="fightwrap">
        ${battles.map(battleCard).join('\n        ')}
      </div>
    </div>
  </div>
  <div class="whatif" id="v-whatif" hidden>
    <div class="wi-in">
      <div class="wi-sprint" id="wi-s5"></div>
      <div class="wi-sprint" id="wi-fin"></div>
      <button class="wi-reset" id="wi-reset">Reset to a likely finish</button>
    </div>
    <div class="wi-out">
      <div class="wi-th">Projected final classification <span class="sub">if the race finishes like this · ▲▼ vs the standings now</span></div>
      <div class="wi-rows" id="wi-table"></div>
    </div>
  </div>
  <div class="note">Reachable = current points + the most still available from the two remaining sprints (15). A lap gained adds +20. Places shown as a best → worst range.</div>
</div>
<script>
(function(){
  // mode « embed » (vue reçue dans la console commentateurs) : la vue remplit l'iframe, sans double cadre
  if(/embed/.test(location.search)){
    var _b=document.querySelector('.board');if(_b)_b.style.cssText+=';position:static;inset:auto;height:100%;border:0;border-radius:0;box-shadow:none;background:transparent;padding:4px 6px 8px';
    document.documentElement.style.height='100%';document.body.style.height='100%';document.body.style.background='transparent';
  }
  var WI=${WIDATA_JSON};
  var riders=WI.riders, S5P=WI.s5, FP=WI.fin;
  var s5=WI.s5def.slice(), fin=WI.findef.slice();
  var S5L=['1st +5','2nd +3','3rd +2','4th +1'], FL=['1st +10','2nd +6','3rd +4','4th +2'];
  function opts(sel){return '<option value="">—</option>'+riders.map(function(r){return '<option value="'+r.bib+'"'+(r.bib==sel?' selected':'')+'>'+r.bib+' '+r.name+'</option>';}).join('');}
  function renderInputs(){
    document.getElementById('wi-s5').innerHTML='<div class="wi-sh">Sprint 5 <span class="pts">+5 · +3 · +2 · +1</span></div>'+[0,1,2,3].map(function(i){return '<div class="wi-slot"><span class="pl">'+S5L[i]+'</span><select data-g="s5" data-i="'+i+'">'+opts(s5[i])+'</select></div>';}).join('');
    document.getElementById('wi-fin').innerHTML='<div class="wi-sh">Final <span class="pts">doubled · +10 · +6 · +4 · +2</span></div>'+[0,1,2,3].map(function(i){return '<div class="wi-slot"><span class="pl">'+FL[i]+'</span><select data-g="fin" data-i="'+i+'">'+opts(fin[i])+'</select></div>';}).join('');
  }
  function project(){
    var add={}; riders.forEach(function(r){add[r.bib]=0;});
    s5.forEach(function(b,i){ if(b) add[b]+=S5P[i]; });
    fin.forEach(function(b,i){ if(b) add[b]+=FP[i]; });
    var proj=riders.map(function(r){return {bib:r.bib,name:r.name,flag:r.flag,pts:r.pts,add:add[r.bib]||0,total:r.pts+(add[r.bib]||0),now:r.rank};});
    proj.sort(function(a,b){return b.total-a.total || a.now-b.now;});
    proj.forEach(function(r,i){r.nw=i+1;});
    document.getElementById('wi-table').innerHTML=proj.map(function(r){
      var d=r.now-r.nw, cls=d>0?'up':d<0?'down':'same', arr=d>0?'▲ '+d:d<0?'▼ '+(-d):'·';
      return '<div class="wir"><span class="wrk">'+r.nw+'</span><span class="wdl '+cls+'">'+arr+'</span><span class="wf">'+r.flag+'</span><span class="wb">'+r.bib+'</span><span class="wn">'+r.name+'</span><span class="wadd">'+(r.add?'+'+r.add:'·')+'</span><span class="wtot">'+r.total+'</span></div>';
    }).join('');
  }
  document.addEventListener('change',function(e){var s=e.target.closest&&e.target.closest('select[data-g]'); if(!s)return; var g=s.getAttribute('data-g'), i=+s.getAttribute('data-i'), v=s.value?+s.value:0; (g==='s5'?s5:fin)[i]=v; project();});
  document.getElementById('wi-reset').addEventListener('click',function(){s5=WI.s5def.slice();fin=WI.findef.slice();renderInputs();project();});
  renderInputs(); project();
  var wb=document.querySelectorAll('[data-wv]');
  wb.forEach(function(b){b.addEventListener('click',function(){wb.forEach(function(x){x.classList.toggle('on',x===b);});document.getElementById('v-overview').hidden=(b.dataset.wv!=='overview');document.getElementById('v-whatif').hidden=(b.dataset.wv!=='whatif');});});
})();
</script>
</body></html>`;
fs.writeFileSync(`${BASE}/maquette-scenarios.html`, html);
console.log('maquette possible scenarios écrite · ' + N + ' coureurs');
