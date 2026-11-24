// Capture les écrans de la présentation, à la même taille que les captures existantes
// (1440 × 900 à l'échelle 2, soit 2880 × 1800).
//
// Les vues des fils ne montrent rien toutes seules : elles lisent la course que le prototype
// publie sur `BroadcastChannel('tct-feed')`. Le canal ne sort pas du navigateur, donc le
// prototype et les vues doivent tourner dans LE MÊME Chrome. On en lance donc un, en arrière-
// plan, on y joue une course complète, puis on photographie chaque vue dans un second onglet.
//
//   node serve.js            (dans une autre console)
//   node presentation/capture.js
//
// Les options --disable-*-throttling sont indispensables : sans elles Chrome ralentit les
// minuteries des onglets qui ne sont pas au premier plan, et la course ne se jouerait pas.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE = 'http://localhost:8765';
const OUT = path.join(__dirname, 'images');
const PORT = 9333;
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
                'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
  .find(p => fs.existsSync(p));
if (!CHROME) { console.error("Chrome introuvable"); process.exit(1); }

const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'tct-capture-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profil,
  '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding', '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

const dors = ms => new Promise(r => setTimeout(r, ms));

// ---- un onglet, et les quelques ordres CDP dont on a besoin ----
async function onglet(url) {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const t = await r.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(ok => ws.addEventListener('open', ok, { once: true }));
  let id = 0; const attente = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); }
  });
  const envoie = (method, params) => new Promise(ok => {
    const n = ++id; attente.set(n, ok); ws.send(JSON.stringify({ id: n, method, params: params || {} }));
  });
  await envoie('Page.enable');
  await envoie('Runtime.enable');
  await envoie('Emulation.setDeviceMetricsOverride',
    { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
  return {
    async js(code) {
      const m = await envoie('Runtime.evaluate',
        { expression: `(async()=>{${code}})()`, awaitPromise: true, returnByValue: true });
      if (m.result && m.result.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails));
      return m.result && m.result.result && m.result.result.value;
    },
    async photo(nom) {
      const m = await envoie('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(OUT, nom), Buffer.from(m.result.data, 'base64'));
      const o = fs.statSync(path.join(OUT, nom));
      console.log('  ' + nom + ' · ' + (o.size / 1024).toFixed(0) + ' Ko');
    },
    ferme() { ws.close(); },
  };
}

(async () => {
  for (let i = 0; i < 40; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch (_) { await dors(250); } }

  // ---------- 1. LA COURSE ----------
  console.log('la course');
  const proto = await onglet(BASE + '/timeline-prototype_mixed.html');
  await dors(2500);
  await proto.js(`
    document.querySelector('[data-t="files"]').click(); await new Promise(r=>setTimeout(r,400));
    document.querySelector('[data-load="1"]').click(); await new Promise(r=>setTimeout(r,600));
    var sb=document.querySelector('#startbtn'); sb.click(); await new Promise(r=>setTimeout(r,300)); sb.click();
    return 1;`);
  await proto.js(`
    var S=window.__proto.state(); S.factor=40;
    for(var i=0;i<120;i++){ await new Promise(r=>setTimeout(r,250)); if(S.t>520) break; }
    var p=S.proposals.find(function(x){return x.lap===30&&x.delta>0;});
    if(p){ var a=p.actions.filter(function(a){return /^\\+20/.test(a.label);})[0]; if(a) a.run(p); }
    for(var i=0;i<200;i++){ await new Promise(r=>setTimeout(r,250)); if(S.finished) break; }
    S.factor=1; return Math.round(S.t);`);
  const etat = await proto.js(`var S=window.__proto.state(); return S.finished? 'terminee au tour '+Object.keys(S.cross).length : 'PAS TERMINEE';`);
  console.log('  ' + etat);

  // les deux vues de la course refaites depuis la refonte des colonnes
  for (const [tab, nom] of [['dec', '07-racelog.png'], ['pass', '10-passings.png']]) {
    await proto.js(`document.querySelector('[data-tab="${tab}"]').click(); await new Promise(r=>setTimeout(r,700)); return 1;`);
    await proto.photo(nom);
  }

  // ---------- 2. LE FIL COMMENTATEURS ----------
  console.log('le fil commentateurs');
  const fil = await onglet(BASE + '/fil.html');
  await dors(3000);
  const vues = [
    ['start', null, '40-feed-startlist.png'],
    ['stand', null, '41-feed-standings.png'],
    ['stand', 'evo', '42-feed-evolution.png'],
    ['sprints', null, '43-feed-sprints.png'],
    ['appr', 'app', '44-feed-approach.png'],
    ['appr', 'eff', '45-feed-lapgained.png'],
    ['log', null, '46-feed-racefacts.png'],
    ['scen', 'ov', '47-feed-scenarios.png'],
    ['scen', 'wi', '48-feed-whatif.png'],
  ];
  for (const [tab, sous, nom] of vues) {
    await fil.js(`
      document.querySelector('[data-tab="${tab}"]').click(); await new Promise(r=>setTimeout(r,900));
      var f=document.querySelector('[data-panel="${tab}"] iframe');
      var d=f&&f.contentDocument;
      if(d && ${JSON.stringify(sous)}){
        var s=${JSON.stringify(sous)};
        var b=null;
        if(s==='evo') b=d.querySelector('[data-view="evo"]');
        else if(s==='app'||s==='eff') b=d.querySelector('[data-v="'+s+'"]');
        else {
          var mots = s==='ov' ? /overview/i : /what if/i;
          b=[].slice.call(d.querySelectorAll('button')).filter(function(x){return mots.test(x.textContent);})[0];
        }
        if(b) b.click();
      }
      await new Promise(r=>setTimeout(r,1400)); return 1;`);
    await fil.photo(nom);
  }

  // ---------- 3. LE FIL ENTRAINEURS ----------
  console.log('le fil entraineurs');
  const co = await onglet(BASE + '/coachs.html');
  await dors(3000);
  const vuesCo = [
    ['chart', 'By rider', '50-coaches-charts-rider.png'],
    ['chart', 'By sprint', '51-coaches-charts-sprint.png'],
    ['app', null, '52-coaches-before.png'],
    ['aft', null, '53-coaches-after.png'],
    ['eff', null, '54-coaches-lapgained.png'],
  ];
  for (const [v, disp, nom] of vuesCo) {
    await co.js(`
      document.querySelector('[data-v="${v}"]').click(); await new Promise(r=>setTimeout(r,700));
      var d=${JSON.stringify(disp)};
      if(d){ var b=[].slice.call(document.querySelectorAll('button')).filter(function(x){return x.textContent.trim()===d;})[0]; if(b) b.click(); }
      await new Promise(r=>setTimeout(r,1200)); return 1;`);
    await co.photo(nom);
  }

  proto.ferme(); fil.ferme(); co.ferme();
  chrome.kill();
  console.log('termine');
  process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
