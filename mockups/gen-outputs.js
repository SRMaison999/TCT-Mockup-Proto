// Génère mockups/outputs/*.png et « MAQUETTES OUTPUTS.pdf » — le catalogue des maquettes :
// une image par écran et par vue, ce que l'écran montre, et comment on l'obtient.
//
// Aucune dépendance installée : on pilote le Chrome de la machine en mode headless, pour les
// captures (--screenshot) comme pour l'impression (--print-to-pdf). Une vue qui demande un clic
// est capturée depuis une COPIE temporaire de la page, à laquelle on ajoute un petit script qui
// clique au chargement.
//
//   node gen-outputs.js
//
// Les maquettes elles-mêmes se regénèrent avec les gen-*.js ; voir README.md.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = __dirname;
const OUT = path.join(BASE, 'outputs');
const TMP = BASE;   // la copie cliquee vit A COTE des maquettes : sinon les iframes relatives ne chargent pas
const W = 1680, H = 980;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('Aucun Chrome ni Edge trouvé.'); process.exit(1); }

// { file, id, titre, vue, clics[], quoi, comment }
const SHOTS = require(`${BASE}/outputs-catalogue.js`);



function pageUrl(s) {
  if (!(s.clicks&&s.clicks.length) && !s.inframe) return 'file:///' + path.join(BASE, s.file).replace(/\\/g, '/');
  const html = fs.readFileSync(path.join(BASE, s.file), 'utf8');
  // les sous-onglets (Live/Evolution, Overview/What if) vivent DANS la page embarquee en iframe :
  // on les clique a travers le document de l'iframe, une fois celle-ci chargee.
  const main = (s.clicks || []).map(c => `try{document.querySelector('${c}').click()}catch(e){}`).join('');
  const sub = s.inframe ? `setTimeout(function(){var f=document.querySelector('[data-panel="${s.inframe[0]}"] iframe');try{f.contentDocument.querySelector('${s.inframe[1]}').click()}catch(e){}},1200);` : '';
  const inject = `<script>window.addEventListener('load',function(){${main}${sub}});</script>`;
  const tmp = path.join(TMP, '.shot-' + s.id + '.html');
  fs.writeFileSync(tmp, html.replace('</body>', inject + '</body>'));
  return 'file:///' + tmp.replace(/\\/g, '/');
}

// --headless=old : le mode « new » reste bloque sur certaines pages statiques et ne rend jamais
function shoot(s) {
  const png = path.join(OUT, s.id + '.png');
  try {
  execFileSync(CHROME, [
    '--headless=old', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    '--force-device-scale-factor=1', '--virtual-time-budget=12000',
    `--window-size=${W},${H}`, `--screenshot=${png}`, pageUrl(s),
  ], { stdio: 'ignore', timeout: 40000 });
  } catch (e) { /* page qui ne se stabilise pas : on la signale plus bas */ }
  return fs.existsSync(png);
}

let ok = 0, ko = [];
SHOTS.forEach(s => { if (shoot(s)) { ok++; process.stdout.write('.'); } else ko.push(s.id); });
// les copies cliquees vivent a cote des maquettes le temps de la capture : on les efface ensuite
fs.readdirSync(BASE).filter(f => f.startsWith('.shot-')).forEach(f => fs.unlinkSync(path.join(BASE, f)));
console.log('\n' + ok + ' captures sur ' + SHOTS.length + (ko.length ? ' — manquantes : ' + ko.join(', ') : ''));
module.exports = { SHOTS, OUT, BASE, CHROME, W, H };
