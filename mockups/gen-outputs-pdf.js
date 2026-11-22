// Assemble « MAQUETTES OUTPUTS.pdf » à partir des captures de outputs/ et du catalogue.
// Une page par écran : l'image, ce que l'écran montre, comment on l'obtient, où il en est.
//
//   node gen-outputs.js       (les captures)
//   node gen-outputs-pdf.js   (le document)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = __dirname;
const OUT = path.join(BASE, 'outputs');
const SHOTS = require(`${BASE}/outputs-catalogue.js`);
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('Aucun Chrome ni Edge trouvé.'); process.exit(1); }

const DATE = '22 novembre 2026';
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dataUri = id => {
  const p = path.join(OUT, id + '.png');
  return fs.existsSync(p) ? 'data:image/png;base64,' + fs.readFileSync(p).toString('base64') : null;
};

const sections = [];
SHOTS.forEach(s => {
  let g = sections.find(x => x.sec === s.sec);
  if (!g) { g = { sec: s.sec, items: [] }; sections.push(g); }
  g.items.push(s);
});

const page = (s, first) => {
  const img = dataUri(s.id);
  return `<section class="pg">
  ${first ? `<div class="sec">${esc(s.sec)}</div>` : ''}
  <h2>${esc(s.title)}</h2>
  <div class="meta"><span class="vue">${esc(s.view)}</span><span class="etat">${esc(s.etat)}</span></div>
  <div class="shot">${img ? `<img src="${img}" alt="${esc(s.title)}">` : '<div class="missing">capture manquante</div>'}</div>
  <div class="txt">
    <h3>Ce que montre l'écran</h3><p>${esc(s.quoi)}</p>
    <h3>Comment on l'obtient</h3><p>${esc(s.comment)}</p>
    ${s.branche ? `<h3>Comment on le branche au moteur</h3><p>${esc(s.branche)}</p>` : ''}
    <p class="src">Fichier : <code>mockups/${esc(s.file)}</code> &middot; image : <code>mockups/outputs/${esc(s.id)}.png</code></p>
  </div>
</section>`;
};

const toc = sections.map(g => `<div class="tg"><div class="th">${esc(g.sec)}</div>${
  g.items.map(s => `<div class="ti"><b>${esc(s.title)}</b><span>${esc(s.view)}</span></div>`).join('')
}</div>`).join('');

const body = sections.map(g => g.items.map((s, i) => page(s, i === 0)).join('\n')).join('\n');


const fin = `<section class="pg">
  <div class="sec">Brancher au moteur</div>
  <h2>Trois relevés portent tout</h2>
  <div class="txt">
    <p>Aucune de ces vues ne demande d'enregistrer quelque chose de nouveau pendant la course. Ce
    qu'il leur faut est déjà tenu par trois relevés du prototype, gardés pour la course entière.</p>
    <h3>1. Lap by lap — le tour, et avec qui</h3>
    <p>Tour par tour, qui a franchi la ligne, à quelle heure, son propre compte de tours, la marque du
    tour gagné ou perdu, et le <b>bloc dans lequel il roulait</b>, gravé au moment de la lecture. C'est
    de là que se lisent le tour où un coureur a quitté le peloton, celui où il y est revenu, qui était
    avec lui, et l'écart du groupe à ce tour — la différence des heures de passage sur la même ligne.
    Le numéro de tour n'a jamais à être recompté.</p>
    <h3>2. Les Passings sur la boucle du back straight — la position</h3>
    <p>Toutes les lectures de chaque boucle sont gardées, dans l'ordre où elles sont tombées, et cet
    ordre <b>est</b> l'ordre sur la piste. Le rang d'un coureur à un relevé, c'est sa place dans la
    lecture de ce passage : il se lit sur la boucle, jamais sur la position dessinée dans l'ovale. Les
    analyses d'approche, avant comme après le sprint, tiennent entièrement là-dedans.</p>
    <h3>3. All sprints — le résultat</h3>
    <p>Un sprint jugé garde l'ordre <b>complet</b> des coureurs à la ligne, pas seulement les quatre qui
    marquent.</p>
    <h3>Et les chutes</h3>
    <p>Elles sont dans le prototype : la chute ouvre un groupe daté du tour, avec le décompte des tours
    qui restent au coureur pour revenir, et la carte à trois issues — il repart, il repart sur un autre
    vélo, il abandonne. Le journal en porte la trace.</p>
    <h3>Ce qui reste à faire</h3>
    <p>Lire ces relevés, et <b>écrire</b>. Les phrases de Race facts se composent au moment de
    l'affichage, depuis les champs du fait — jamais stockées en texte, sinon un fait corrigé par
    l'opérateur garderait son ancienne phrase. Les alertes matériel sont dans le même journal : le fil
    les écarte.</p>
    <p class="src">Le brief technique d'intégration — quoi lire, la méthode, les conventions du
    prototype, ce qui est déjà fait — est dans <code>mockups/INTEGRATION.md</code>. Ce document-ci ne
    dit que ce qui alimente chaque vue.</p>
  </div>
</section>`;

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Maquettes outputs</title>
<style>
@page{size:A4 portrait;margin:12mm 13mm}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:12px/1.45 "Segoe UI",system-ui,sans-serif;color:#15181b;background:#fff}
code{font:11px ui-monospace,Consolas,monospace;background:#f1f3f5;padding:1px 4px;border-radius:3px}
.pg{page-break-after:always;height:100%;display:flex;flex-direction:column}
.pg:last-child{page-break-after:auto}
.sec{font:700 10px/1 "Segoe UI",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#1d4ed8;margin-bottom:6px}
h2{font:700 19px/1.2 "Segoe UI",sans-serif;margin:0 0 4px}
.meta{display:flex;gap:10px;align-items:center;margin-bottom:8px}
.vue{font:600 11px sans-serif;color:#475569}
.etat{margin-left:auto;font:600 10px sans-serif;color:#334155;background:#e8edf3;border-radius:999px;padding:3px 10px}
.shot{flex:0 0 auto;border:1px solid #cbd5e1;border-radius:5px;overflow:hidden;background:#121416;margin-bottom:9px;text-align:center}
.shot img{display:block;margin:0 auto;max-width:100%;max-height:120mm;width:auto;height:auto}
.missing{padding:40px;text-align:center;color:#94a3b8;font-size:13px}
.txt{flex:1 1 auto}
h3{font:700 10px/1 "Segoe UI",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#64748b;margin:0 0 3px}
.txt p{margin:0 0 8px;max-width:none}
.src{color:#64748b;font-size:10.5px}
/* couverture et sommaire */
.cover{page-break-after:always;height:100%;display:flex;flex-direction:column;justify-content:center}
.cover h1{font:700 40px/1.1 "Segoe UI",sans-serif;margin:0 0 10px}
.cover .sub{font:400 15px sans-serif;color:#475569;max-width:70%;margin-bottom:22px}
.cover .how{border-top:2px solid #15181b;padding-top:12px;max-width:80%}
.cover .how p{margin:0 0 6px}
.toc{page-break-after:always}
.toc h1{font:700 22px "Segoe UI",sans-serif;margin:0 0 14px}
.tg{margin-bottom:12px;break-inside:avoid}
.th{font:700 10px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #cbd5e1;padding-bottom:3px;margin-bottom:5px}
.ti{display:flex;gap:10px;padding:2px 0;font-size:11.5px}
.ti b{flex:0 0 330px}
.ti span{color:#64748b}
</style></head><body>
<section class="cover">
  <h1>Maquettes — outputs</h1>
  <div class="sub">Les maquettes des sorties du prototype Course aux points : le fil des commentateurs — les analyses d'approche y sont intégrées — et l'écran des entraîneurs. Vue par vue : l'image, ce que l'écran montre, comment on l'obtient, et comment on la branche au moteur. Les écrans de la vue Course, qui sont les outils de l'opérateur, n'y sont pas.</div>
  <div class="how">
    <p><b>Course aux points — TCT.</b> Document arrêté le ${DATE}. ${SHOTS.length} vues.</p>
    <p>Les maquettes sont <b>statiques</b> : elles fixent le dessin avec l'opérateur <b>avant</b> l'intégration dans <code>timeline-prototype_mixed.html</code>. Les données sont celles de la course de test où le peloton reste groupé — 60 tours, 6 sprints, <code>sprints.json</code> — complétées par des cas illustratifs là où le prototype ne produit rien à montrer.</p>
    <p><b>Tout refaire :</b> <code>cd mockups</code>, puis chaque <code>node gen-*.js</code>, puis <code>node gen-outputs.js</code> (les captures) et <code>node gen-outputs-pdf.js</code> (ce document). Les captures pilotent le Chrome de la machine en mode headless ; rien n'est à installer.</p>
    <p><b>L'autorité reste <code>docs/regles-operateur.md</code></b> : les règles y sont dans les mots de l'opérateur, datées. Ce document ne fait que montrer.</p>
  </div>
</section>
<section class="toc"><h1>Les sorties</h1>${toc}</section>
${body}
${fin}
</body></html>`;

const tmp = path.join(OUT, '.doc.html');
fs.writeFileSync(tmp, html);
const pdf = path.join(BASE, 'MAQUETTES OUTPUTS.pdf');
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
  `--print-to-pdf=${pdf}`, '--virtual-time-budget=20000',
  'file:///' + tmp.replace(/\\/g, '/'),
], { stdio: 'ignore' });
console.log(fs.existsSync(pdf)
  ? 'MAQUETTES OUTPUTS.pdf écrit · ' + (fs.statSync(pdf).size / 1048576).toFixed(1) + ' Mo · ' + SHOTS.length + ' vues'
  : 'échec : le PDF n\'a pas été écrit');
