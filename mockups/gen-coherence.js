// Génère mockups/maquette-coherence.html — proposition du 22 novembre 2026, deuxième tour.
//
// Premier tour : colonnes communes et barre de filtres unique. Il a corrigé quatre points
// (son point 311) :
//   1. TYPE est une COLONNE dans les deux onglets. Passings : TRANSPONDER · TAPE SWITCH ·
//      MANUAL PULSE.
//   2. LOCATION est une colonne des Passings : PURSUIT A · PURSUIT B · FINISH · 200m · 100m ·
//      Push button.
//   3. Un événement à trois coureurs s'écrit sur TROIS lignes, une par coureur.
//   4. Le Race log n'a rien à montrer avant le départ ; les Passings montrent les passages
//      d'avant le départ comme les autres, RACE TIME et LAP vides.
// Et les couleurs sont celles de l'application : cette maquette CHARGE styles.css et n'ajoute que
// sa grille. Aucun hexadécimal ici (pitfalls.md D57).
//
// Rien n'est codé dans le prototype : c'est une proposition, à critiquer avant.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const flag = new Function(fs.readFileSync(path.join(BASE, '..', 'flags.js'), 'utf8') + '\nreturn flag;')();
const D = require(`${BASE}/sprints.json`);
const R = D.riders;
const FIRST = { 15: 'Liam', 4: 'Tom', 12: 'Marco', 11: 'Yuki', 23: 'Mads', 46: 'Lars', 58: 'Dmitriy', 67: 'Max', 1: 'Carlos', 9: 'Luka', 3: 'Julien', 18: 'João', 61: 'Juan', 7: 'Daan', 52: 'Luca', 70: 'Lucas' };

// les familles du Race log, avec la classe du prototype : t-race, t-sprint, … (build 270)
const LOGT = { race: 'RACE', sprint: 'SPRINT', group: 'GROUP', lap: 'LAP',
               transponder: 'TRANSPONDER', operator: 'OPERATOR', incident: 'INCIDENT', withdraw: 'DNF' };
// les types des Passings, qu'il a nommés
const PT = { transponder: 'TRANSPONDER', tape: 'TAPE SWITCH', pulse: 'MANUAL PULSE' };

const cell = bib => bib == null
  ? `<span class="bib none">—</span><span class="noc"></span><span class="rn"></span>`
  : `<span class="bib">${bib}</span><span class="noc">${flag(R[bib].nat)}<i>${R[bib].nat}</i></span>` +
    `<span class="rn"><em>${FIRST[bib] || ''}</em> <b>${R[bib].name}</b></span>`;

const nameOf = b => `${flag(R[b].nat)}<b>${b}</b> <i>${R[b].nat}</i> ${R[b].name}`;
const ORD = ['1st', '2nd', '3rd', '4th'];
// UN SPRINT EST UN ÉVÉNEMENT QUI TOUCHE QUATRE COUREURS : il fait donc quatre lignes, comme une
// chute en fait trois. Ses mots du 22 novembre. Les quatre gardent l'heure et le tour du sprint,
// et restent dans l'ordre du classement — pas dans celui des envois.
const sprintRows = (lbl, seq, dt, rt, lap, dbl) => seq.slice(0, 4).map((e, i) => ({
  dt, rt, lap, t: 'sprint', bib: e.bib,
  // SES MOTS, 22 novembre : « Tu mets "1st 10 points" ». Pas de « at the line », pas de « + ».
  ev: `<b>${lbl}</b> · ${ORD[i]} <i class="pt">${dbl ? e.pts * 2 : e.pts} points</i>`,
}));

// ---- Race log : rien avant le départ, et un incident à trois coureurs fait trois lignes --------
const CRASH = [7, 18, 61];
const ROWS_LOG = [
  { dt: '14:48:08', rt: '18:08.0', lap: 60, t: 'race', bib: null, ev: 'Race over · 16 riders classified · winner ' + nameOf(12) + ', 60 points' },
  ...sprintRows('Final sprint', D.sprints[D.sprints.length - 1].seq, '14:48:06', '18:06.0', 60, false),
  { dt: '14:45:22', rt: '15:22.4', lap: 52, t: 'lap', bib: 12, ev: 'Lap gained · 1 → 2 · operator' },
  ...CRASH.map(b => ({ dt: '14:43:40', rt: '13:40.0', lap: 48, t: 'incident', bib: b, ev: 'Crash of Lap 47 · still 4 laps to rejoin' })),
  ...CRASH.map(b => ({ dt: '14:43:10', rt: '13:10.8', lap: 47, t: 'incident', bib: b, ev: 'Crash · 5 laps to rejoin' })),
  ...sprintRows('Sprint 3', D.sprints[2].seq, '14:40:18', '10:18.2', 38, false),
  { dt: '14:38:02', rt: '8:02.6', lap: 31, t: 'transponder', bib: 52, ev: 'Not read on Finish · carried with the bunch' },
  { dt: '14:30:00', rt: '0:00.0', lap: null, t: 'race', bib: null, ev: 'Start · 16 riders · lap counter linked' },
];

// ---- Passings : les passages d'avant le départ ont RACE TIME et LAP vides ----------------------
const ROWS_PASS = [
  { dt: '14:43:11', rt: '13:11.0', lap: 47, t: 'transponder', lo: 'FINISH', bib: 7, sig: 'read' },
  { dt: '14:43:11', rt: '13:11.0', lap: 47, t: 'transponder', lo: 'FINISH', bib: 18, sig: 'read' },
  { dt: '14:43:10', rt: '13:10.8', lap: 47, t: 'tape', lo: 'FINISH', bib: null, sig: '13 contacts / 14 reads', note: '1 read with no contact', odd: true },
  { dt: '14:43:08', rt: '13:08.1', lap: 47, t: 'transponder', lo: 'PURSUIT A', bib: 61, sig: 'read' },
  { dt: '14:43:02', rt: '13:02.9', lap: 47, t: 'pulse', lo: 'PUSH BUTTON', bib: 12, sig: 'placed · operator', note: 'not read' },
  { dt: '14:42:58', rt: '12:58.4', lap: 46, t: 'transponder', lo: '200m', bib: 52, sig: 'read' },
  { dt: '14:29:46', rt: null, lap: null, t: 'transponder', lo: 'FINISH', bib: 15, sig: 'read' },
  { dt: '14:29:44', rt: null, lap: null, t: 'transponder', lo: 'PURSUIT A', bib: 4, sig: 'read' },
];

// ---- la barre de filtres, la même des deux côtés -----------------------------------------------
const btn = (l, on) => l.map((x, i) => `<button class="pf${on && !i ? ' on' : ''}">${x}</button>`).join('');
// SON POINT DU 22 NOVEMBRE : un champ par chose qu'on filtre — Bib, Noc, Rider, Lap — et la
// recherche ne travaille QUE sur le texte, pas sur ce que les champs retiennent déjà.
// La barre tient sur DEUX LIGNES, et le partage n'est pas laissé au hasard (ses mots du
// 22 novembre) : les BOUTONS sur la première, les CHAMPS DE SAISIE sur la seconde.
// ET LES FILTRES SONT DANS L'ORDRE DES COLONNES, de gauche à droite : Type (Location aux
// Passings) en haut, puis Lap · Bib · Noc · Rider · le texte en bas — l'ordre exact de l'en-tête.
const bar = own => `<div class="filt">
  <div class="frow">${own}</div>
  <div class="frow">
    <span class="lbl">Lap</span><input class="pin" placeholder="all">
    <span class="lbl">Bib</span><input class="pin" placeholder="all">
    <span class="lbl">Noc</span><input class="pin noc3" placeholder="all">
    <span class="lbl">Rider</span><input class="pin rid" placeholder="all">
    <span class="sep"></span>
    <input class="pin wide" placeholder="search the text…">
    <button class="pf">Clear</button>
  </div>
</div>`;
const FAM = ['All', 'Race', 'Sprint', 'Group', 'Lap', 'Transponder', 'Operator', 'Incident', 'Withdraw', 'Leader'];
const PTYP = ['All', 'Transponder', 'Tape switch', 'Manual pulse'];
const PLOC = ['All', 'Pursuit A', 'Pursuit B', 'Finish', '200m', '100m', 'Push button'];

const hd = cols => `<div class="row hd">` + cols.map(c => `<span>${c}</span>`).join('') + `</div>`;
const COM = ['Daytime', 'Race time', 'Lap', 'Type'];
const WHO = ['Bib', 'Noc', 'Rider name'];

const rowLog = r => `<div class="row t-${r.t}">` +
  `<span class="dt">${r.dt}</span><span class="rt">${r.rt}</span><span class="lp">${r.lap == null ? '' : r.lap}</span>` +
  `<span class="k">${LOGT[r.t]}</span>` + cell(r.bib) + `<span class="ev">${r.ev}</span></div>`;

const rowPass = r => `<div class="row t-${r.t === 'tape' ? 'tape' : r.t === 'pulse' ? 'operator' : 'transponder'}${r.odd ? ' odd' : ''}">` +
  `<span class="dt">${r.dt}</span><span class="rt">${r.rt || ''}</span><span class="lp">${r.lap == null ? '' : r.lap}</span>` +
  `<span class="k">${PT[r.t]}</span><span class="lo">${r.lo}</span>` + cell(r.bib) +
  `<span class="ev">${r.sig}${r.note ? ` <i class="note">· ${r.note}</i>` : ''}</span></div>`;

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Cohérence Race log · Passings</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<!-- LES COULEURS SONT CELLES DE L'APPLICATION : styles.css, et rien d'autre (pitfalls.md D57). -->
<link rel="stylesheet" href="../styles.css">
<style>
/* Cette maquette n'ajoute QUE sa grille. Aucun hexadécimal : les tokens de styles.css. */
body{margin:0;background:var(--bg);color:var(--fg);font:400 13px/1.5 var(--sans);
     padding:22px 26px 60px;height:auto;overflow:auto}
h1{font:600 19px var(--sans);margin:0 0 4px;color:var(--fg)}
h2{font:600 12px var(--sans);letter-spacing:.09em;text-transform:uppercase;color:var(--dim);margin:26px 0 8px}
p.intro{color:var(--dim);max-width:94ch;margin:0 0 18px}
p.intro b{color:var(--muted)}
.panel{background:var(--bg);border:1px solid var(--line);border-radius:6px;overflow:hidden}
.filt{padding:7px 10px;background:var(--panel);border-bottom:1px solid var(--line)}
.frow{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.frow + .frow{margin-top:6px}
.lbl{font:600 10px var(--sans);letter-spacing:.09em;text-transform:uppercase;color:var(--dim);margin-right:2px}
.pf{height:26px;padding:0 9px;background:var(--bg);border:1px solid var(--line);border-radius:4px;
    color:var(--dim);font:500 11px var(--sans);cursor:pointer}
.pf.on{background:var(--acc);border-color:var(--acc);color:var(--muted)}
.pin{width:54px;height:26px;padding:0 7px;background:var(--bg);border:1px solid var(--line);
     border-radius:4px;color:var(--fg);font:500 12px var(--mono)}
.pin.wide{width:190px;font-family:var(--sans)}
.pin.noc3{width:50px;text-transform:uppercase}
.pin.noc3::placeholder{text-transform:none}
.pin.rid{width:120px;font-family:var(--sans)}
.pin::placeholder{color:var(--dim);font:400 11px var(--sans)}
.sep{width:1px;height:18px;background:var(--line);margin:0 4px}
/* la grille : les quatre colonnes communes, puis Bib · Noc · Rider name, puis celle de l'onglet */
.row{display:grid;align-items:center;gap:0 10px;padding:5px 10px 5px 9px;
     border-left:3px solid transparent;border-bottom:1px solid var(--line);min-height:30px}
#log .row{grid-template-columns:68px 62px 30px 104px 40px 56px 150px minmax(0,1fr)}
#pass .row{grid-template-columns:68px 62px 30px 104px 96px 40px 56px 150px minmax(0,1fr)}
.row.hd{min-height:26px;background:var(--panel);border-left-color:transparent;
        font:600 9.5px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.row:last-child{border-bottom:0}
.dt,.rt,.lp,.bib{font:500 12px var(--mono);font-variant-numeric:tabular-nums}
.dt{color:var(--fg)}.rt{color:var(--dim)}.lp{color:var(--dim);text-align:right}
.hd span:nth-child(3){text-align:right}
.bib{color:var(--fg);font-weight:600}
.bib.none{color:var(--dim);font-weight:400}
.k{font:600 9.5px var(--sans);letter-spacing:.09em;color:var(--dim)}
.lo{font:600 10px var(--mono);color:var(--dim);letter-spacing:.04em}
.noc{display:flex;align-items:center;gap:5px}
.noc i{font:500 11px var(--mono);color:var(--dim);font-style:normal}
.rn{font:400 12px var(--sans);color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rn em{font-style:normal;color:var(--dim)}
.rn b{font-weight:600}
.ev{font:400 12px var(--sans);color:var(--fg);min-width:0}
.ev i{font-style:normal}
.pl{color:var(--dim);font:500 11px var(--mono)}
.pt{color:var(--good);font-weight:600}
.note{color:var(--warn)}
.flag{width:15px;height:10px;border-radius:1px;display:block}
.ev .flag{display:inline-block;vertical-align:-1px;margin-right:3px}
/* les familles, exactement celles du prototype au build 270 */
.t-race,.t-leader,.t-operator{border-left-color:var(--acc)}
.t-race .k,.t-leader .k,.t-operator .k{color:var(--acc)}
.t-lap{border-left-color:var(--good)} .t-lap .k{color:var(--good)}
.t-transponder{border-left-color:var(--dim)} .t-transponder .k{color:var(--dim)}
.t-withdraw{border-left-color:var(--warn)} .t-withdraw .k{color:var(--warn)}
.t-tape{border-left-color:var(--wood)} .t-tape .k{color:var(--wood)}
.t-group{border-left-color:var(--good);background:color-mix(in srgb, var(--good) 8%, var(--bg))}
.t-group .k{color:var(--good)}
.t-sprint{border-left-color:var(--acc);background:color-mix(in srgb, var(--acc) 10%, var(--bg))}
.t-sprint .k{color:var(--acc)}
.t-incident{border-left-color:var(--crit);background:color-mix(in srgb, var(--crit) 10%, var(--bg))}
.t-incident .k{color:var(--crit)}
.row.odd{background:color-mix(in srgb, var(--warn) 10%, var(--bg))}
ul{margin:6px 0 0;padding-left:18px;color:var(--dim);max-width:94ch}
li{margin:5px 0}
.q{color:var(--warn);font-weight:600}
.ab{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px}
.box{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:10px 12px}
.box h3{font:600 10px var(--sans);letter-spacing:.09em;text-transform:uppercase;margin:0 0 7px}
.box.bad h3{color:var(--crit)} .box.good h3{color:var(--good)}
.box pre{margin:0;font:400 11px/1.65 var(--mono);color:var(--dim);white-space:pre-wrap}
</style></head><body>

<h1>Race log et Passings, deuxième tour</h1>
<p class="intro">Les quatre corrections du 22 novembre sont dedans : <b>Type</b> est une colonne des
deux côtés, <b>Location</b> une colonne des Passings, un événement à trois coureurs fait
<b>trois lignes</b>, et les passages d'avant le départ gardent <b>Race time</b> et <b>Lap</b>
vides. Les couleurs ne sont plus les miennes : cette page charge <b>styles.css</b>, celui de
l'application. La barre porte un champ par chose qu'on filtre, <b>dans l'ordre des colonnes</b> —
<b>Lap</b>, <b>Bib</b>, <b>Noc</b>, <b>Rider</b> — et la recherche ne travaille que sur le
<b>texte</b> de la dernière colonne : elle ne refait pas ce que les quatre champs font déjà.</p>

<h2>Race log</h2>
<div class="panel" id="log">
${bar(`<span class="lbl">Type</span>${btn(FAM, true)}`)}
${hd([...COM, ...WHO, 'Event'])}
${ROWS_LOG.map(rowLog).join('\n')}
</div>

<h2>Passings</h2>
<div class="panel" id="pass">
${bar(`<span class="lbl">Type</span>${btn(PTYP, true)}<span class="sep"></span><span class="lbl">Location</span>${btn(PLOC, true)}`)}
${hd([...COM, 'Location', ...WHO, 'Signal / count'])}
${ROWS_PASS.map(rowPass).join('\n')}
</div>

<h2>Le sprint au journal</h2>
<div class="ab">
  <div class="box bad"><h3>Ce que le prototype écrit aujourd'hui</h3><pre>Sprint 2 · live → TV, scoreboard, web · 5. 5
Sprint 2 · live → TV, scoreboard, web · 4. 4
Sprint 2 · live → TV, scoreboard, web · 3. 3
Sprint 2 · live → TV, scoreboard, web · 2. 2
Sprint 2 · live → TV, scoreboard, web · 1. 1</pre></div>
  <div class="box good"><h3>Ce qu'il écrirait</h3><pre>Sprint 2 · 1st at the line · +5 points   15 IRL O'NEILL
Sprint 2 · 2nd at the line · +3 points    4 GBR WALSH
Sprint 2 · 3rd at the line · +2 points   11 JPN TANAKA
Sprint 2 · 4th at the line · +1 point    23 DEN NIELSEN</pre>
  <p style="color:var(--dim);margin:9px 0 0;font-size:12px">Quatre coureurs, quatre lignes, avec
  leur dossard, leur drapeau et leur nom dans les colonnes — et non quatre fois la même phrase
  d'envoi. Elles gardent l'heure et le tour du sprint, et restent dans l'ordre du classement.</p></div>
</div>

<h2>Ce qui reste à trancher</h2>
<ul>
<li><span class="q">L'ordre des quatre lignes d'un sprint.</span> Elles sont rangées par place,
la première en haut, et non par ordre d'envoi — le journal descend du plus récent au plus ancien
partout ailleurs. À l'intérieur d'un même événement, le classement m'a paru plus lisible que
l'ordre d'arrivée des places.</li>
<li><span class="q">Les couleurs des types des Passings.</span> TRANSPONDER prend le gris discret
qu'il a déjà au Race log, MANUAL PULSE le bleu des gestes de l'opérateur, TAPE SWITCH le bois.
Rien de tout cela ne vient de vous.</li>
<li><span class="q">200m, 100m et Push button</span> n'existent pas encore dans le moteur : il ne
connaît que Finish, Pursuit A, Pursuit B et les rubans. La colonne les porte, les filtres aussi ;
elles resteront vides tant que l'installation ne les aura pas.</li>
</ul>

</body></html>`;

fs.writeFileSync(path.join(BASE, 'maquette-coherence.html'), html);
console.log('maquette-coherence.html écrite · ' + (html.length / 1024).toFixed(0) + ' Ko');
