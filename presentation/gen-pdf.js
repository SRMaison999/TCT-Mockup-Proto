// Écrit Course-aux-points-presentation.pdf à partir du Markdown et des captures.
//
// Le PDF d'origine était une impression Chrome d'un rendu HTML du Markdown : papier Letter,
// une seule famille sans empattement. On refait la même chose — un HTML intermédiaire, puis
// l'impression par Chrome en arrière-plan.
//
//   node presentation/gen-pdf.js

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE = __dirname;
const MD = path.join(BASE, 'Course-aux-points-presentation.md');
const HTML = path.join(BASE, 'Course-aux-points-presentation.html');
const PDF = path.join(BASE, 'Course-aux-points-presentation.pdf');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
                'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
  .find(p => fs.existsSync(p));
if (!CHROME) { console.error('Chrome introuvable'); process.exit(1); }

const ech = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const enligne = t => ech(t)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');

// ---- le Markdown de ce document : titres, paragraphes, listes, images, filets ----
function rendu(md) {
  const out = [];
  let liste = false;
  const finListe = () => { if (liste) { out.push('</ul>'); liste = false; } };
  for (const ligne of md.split(/\r?\n/)) {
    const l = ligne.trim();
    if (!l) { finListe(); continue; }
    const img = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) { finListe(); out.push(`<figure><img src="${img[2]}" alt="${ech(img[1])}"><figcaption>${enligne(img[1])}</figcaption></figure>`); continue; }
    const t = l.match(/^(#{1,4})\s+(.*)$/);
    if (t) { finListe(); const n = t[1].length; out.push(`<h${n}>${enligne(t[2])}</h${n}>`); continue; }
    if (/^---+$/.test(l)) { finListe(); out.push('<hr>'); continue; }
    if (/^[-*]\s+/.test(l)) { if (!liste) { out.push('<ul>'); liste = true; } out.push(`<li>${enligne(l.replace(/^[-*]\s+/, ''))}</li>`); continue; }
    finListe();
    out.push(`<p>${enligne(l)}</p>`);
  }
  finListe();
  return out.join('\n');
}

const md = fs.readFileSync(MD, 'utf8');
const titre = (md.match(/^#\s+(.*)$/m) || [, 'Course aux points'])[1];

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>${ech(titre)}</title>
<style>
  @page { size: Letter; margin: 18mm 16mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "DejaVu Sans", "Segoe UI", Arial, sans-serif; font-size: 10.5pt;
         line-height: 1.55; color: #111; margin: 0; }
  h1 { font-size: 22pt; line-height: 1.2; margin: 0 0 18pt; }
  h2 { font-size: 15pt; margin: 26pt 0 8pt; page-break-after: avoid; }
  h3 { font-size: 12.5pt; margin: 20pt 0 6pt; page-break-after: avoid; }
  h4 { font-size: 11pt; margin: 14pt 0 4pt; page-break-after: avoid; }
  p  { margin: 0 0 9pt; text-align: justify; }
  ul { margin: 0 0 9pt; padding-left: 18pt; }
  li { margin: 0 0 4pt; }
  hr { border: 0; border-top: 1px solid #ccc; margin: 18pt 0; }
  strong { font-weight: 700; }
  code { font-family: "DejaVu Sans Mono", Consolas, monospace; font-size: 9.5pt; }
  figure { margin: 12pt 0 16pt; page-break-inside: avoid; }
  figure img { width: 100%; height: auto; display: block;
               border: 1px solid #d8d8d8; border-radius: 3px; }
  figcaption { font-size: 8.5pt; color: #666; margin-top: 4pt; }
</style></head><body>
${rendu(md)}
</body></html>`;

fs.writeFileSync(HTML, html);
console.log('HTML intermédiaire écrit (' + (html.length / 1024).toFixed(0) + ' Ko)');

const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'tct-pdf-'));
const r = spawnSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--user-data-dir=' + profil, '--no-pdf-header-footer',
  '--print-to-pdf=' + PDF, '--virtual-time-budget=20000',
  'file:///' + HTML.replace(/\\/g, '/'),
], { stdio: 'inherit' });
if (r.status !== 0 || !fs.existsSync(PDF)) { console.error('impression ratée'); process.exit(1); }
console.log('PDF écrit · ' + (fs.statSync(PDF).size / 1024 / 1024).toFixed(1) + ' Mo');
