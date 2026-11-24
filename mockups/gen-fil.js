// Génère ../fil.html — LE FIL COMMENTATEURS BRANCHÉ AU MOTEUR.
//
// Ce n'est PAS une nouvelle page : c'est la coque validée le 16 novembre 2026,
// `maquette-feed.html`, dont on reprend LE STYLE TEL QUEL (lu dans le fichier généré, jamais
// recopié) et LE MÊME BALISAGE — en-tête, onglets, cartes de la start list, table `.lv` du
// classement, colonnes `.spcol` des sprints. Seules les DONNÉES changent : au lieu de la course de
// test figée, elles arrivent en direct du prototype par BroadcastChannel (son point 316 :
// « Tout sur le même PC, nous travaillons sur un prototype »).
//
// Les vues que le moteur ne produit pas encore — Standings Évolution, Scenarios, Race facts —
// restent EMBARQUÉES EN IFRAME de leurs maquettes avec ?embed=1, exactement comme la coque le
// fait. Le fil le dit dans son en-tête pour qu'on ne les prenne pas pour du direct.
//
// Refaire : node gen-feed.js puis node gen-fil.js.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;

const maquette = fs.readFileSync(path.join(BASE, 'maquette-feed.html'), 'utf8');
const m = maquette.match(/<style>[\s\S]*?<\/style>/);
if (!m) { console.error('Le style de maquette-feed.html est introuvable — lancer node gen-feed.js d\'abord.'); process.exit(1); }
const STYLE = m[0];

// LE CLASSEMENT DU FIL EST LA MAQUETTE STANDINGS, pas une table a moi (son point 318). On lit son
// style dans le fichier genere, comme celui de la coque, et on garde son balisage : la barre
// .board-h avec la bascule Live / Evolution, la table .tbl, les lignes .row, la .cutrow de la
// ligne de coupe. Elle est servie dans sa propre page, fil-standings.html, que la coque embarque
// en iframe exactement comme elle embarque la maquette : deux documents, donc aucun melange de
// styles.
const mqStand = fs.readFileSync(path.join(BASE, 'maquette-standings.html'), 'utf8');
const mS = mqStand.match(/<style>[\s\S]*?<\/style>/);
if (!mS) { console.error('Le style de maquette-standings.html est introuvable — lancer node gen-standings.js d\'abord.'); process.exit(1); }
const STYLE_STAND = mS[0];
const FONTS = (maquette.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/) || [''])[0];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Commentator feed · live</title>
${FONTS}
<!-- LE STYLE EST CELUI DE LA COQUE VALIDEE, repris tel quel de maquette-feed.html. On ne le
     reecrit pas ici : gen-fil.js le lit dans le fichier genere. -->
${STYLE}
<style>
/* la seule chose que cette page ajoute : dire quand elle n'a encore rien recu, et marquer les
   vues qui sont la maquette et non le direct. */
.waiting{padding:42px 22px;font:500 14px var(--sans,'IBM Plex Sans',sans-serif);color:#9aa3ad}
.notlive{position:absolute;right:14px;top:10px;z-index:3;font:600 9.5px 'IBM Plex Sans',sans-serif;
  letter-spacing:.09em;text-transform:uppercase;color:#F2A33A;border:1px solid #F2A33A;
  border-radius:3px;padding:2px 7px;background:rgba(0,0,0,.55)}
.panel{position:relative}
</style></head>
<body>
<div class="board">
  <div class="hdr">
    <div class="ttl"><b>Commentator feed</b><span class="sub">CIS · Commentator Infosystem</span></div>
    <span class="live"><i class="dot"></i><span id="fstate">Waiting for the race computer</span></span>
    <span class="ro">Read only</span>
    <span class="rtype" id="frtype">—</span>
    <span class="upd">Received from Race view · <b id="fupd">—</b></span>
  </div>
  <nav class="nav">
    <button class="on" data-tab="start">Start list</button>
    <button data-tab="stand">Standings</button>
    <button data-tab="sprints">Sprints</button>
    <button data-tab="appr">Sprint approach</button>
    <button data-tab="log">Race facts</button>
    <button data-tab="scen">Scenarios</button>
  </nav>

  <div class="panel" data-panel="start"><div id="vstart"><div class="waiting">Nothing received yet.</div></div></div>
  <div class="panel" data-panel="stand" hidden><iframe class="vframe" src="fil-standings.html" title="Standings"></iframe></div>
  <div class="panel" data-panel="sprints" hidden><div id="vspr"></div></div>
  <div class="panel" data-panel="scen" hidden><iframe class="vframe" src="fil-scenarios.html?embed=1" title="Scenarios"></iframe></div>
  <div class="panel" data-panel="log" hidden><iframe class="vframe" src="fil-racefacts.html?embed=1" title="Race facts"></iframe></div>
  <div class="panel" data-panel="appr" hidden><iframe class="vframe" src="fil-approche.html?embed=1" title="Sprint approach"></iframe></div>
</div>

<script src="flags.js"></script>
<script>
(function(){
  var nav=document.querySelectorAll('.nav button'), panels=document.querySelectorAll('.panel');
  nav.forEach(function(btn){btn.onclick=function(){
    nav.forEach(function(b){b.classList.toggle('on',b===btn);});
    panels.forEach(function(p){p.hidden=p.getAttribute('data-panel')!==btn.getAttribute('data-tab');});
  };});

  // LECTURE SEULE : la seule chose que le fil envoie est « donne-moi tout », a son ouverture.
  var CH=new BroadcastChannel('tct-feed'), D=null;
  CH.addEventListener('message',function(e){ if(!e.data||!e.data.riders) return; D=e.data; draw(); });
  CH.postMessage({ask:true});

  function rid(b){ for(var i=0;i<D.riders.length;i++) if(D.riders[i].bib===b) return D.riders[i]; return null; }
  function up(s){ return String(s||'').toUpperCase(); }
  function hhmmss(ms){ var d=new Date(ms); function p(n){return (n<10?'0':'')+n;} return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds()); }

  // --- Start list : les memes cartes .sl-card que la coque ---
  function vStart(){
    var rs=D.riders.slice().sort(function(a,b){return a.bib-b.bib;});
    var cards=rs.map(function(r){ return '<div class="sl-card">'
      +'<span class="chip">'+r.bib+'</span><span class="flagw">'+flag(r.nat)+'</span>'
      +'<span class="sl-id"><span class="noc">'+r.nat+'</span><span class="sl-nm">'
      +'<span class="fn">'+r.first+'</span> <b>'+up(r.name)+'</b></span></span></div>'; }).join('');
    return '<div class="sl-head">'+rs.length+' riders on the start list · as sent to commentators</div>'
      +'<div class="sl-grid">'+cards+'</div>';
  }

  // --- Sprints COMPLETS : les memes colonnes .spcol que la coque ---
  function vSpr(){
    var run=D.sprints.filter(function(s){return s.started && s.order.length;});
    if(!run.length) return '<div class="waiting">No sprint judged yet.</div>';
    var cols=run.map(function(s){
      var head='<div class="spcol-h'+(s.final?' fin':'')+'">'
        +'<div class="spcol-t">'+(s.final?'FINAL':'SPRINT '+s.k)+(s.final?'<span class="x2">×2</span>':'')+'</div>'
        +'<div class="spcol-s">LAP '+s.lap+'</div></div>';
      var body=s.order.map(function(e,i){
        var r=rid(e.bib)||{nat:''}, place=i+1, score=(e.pts||0)>0;
        return '<div class="sprk'+(score?' score':'')+(place===4?' sepline':'')+'">'
          +'<span class="pl">'+place+'</span><span class="chip">'+e.bib+'</span>'
          +'<span class="flagw">'+flag(r.nat)+'</span><span class="noc">'+r.nat+'</span>'
          +'<span class="pts">'+(score?'+'+e.pts:'')+'</span></div>'; }).join('');
      return '<div class="spcol'+(s.final?' fin':'')+'">'+head+'<div class="spcol-b">'+body+'</div></div>';
    }).join('');
    return '<div class="sub-h"><span class="hint">every sprint, in full · left to right · top four score · the final counts double</span></div>'
      +'<div class="colswrap"><div class="cols" id="sprcols">'+cols+'</div></div>';
  }

  function draw(){
    if(!D) return;
    document.getElementById('fstate').textContent = D.started ? 'Live · updates automatically' : 'Race not started';
    document.getElementById('frtype').textContent = D.cfg && D.cfg.type==='qualification'
      ? 'Qualification · top '+D.cfg.advance+' advance' : 'Final · no cut';
    document.getElementById('fupd').textContent = D.wall0==null ? '—' : hhmmss(D.wall0 + D.t*1000);
    document.getElementById('vstart').innerHTML = vStart();
    document.getElementById('vspr').innerHTML = vSpr();
  }
})();
</script>
</body></html>`;

/* ===== fil-standings.html : la maquette du classement, en direct ========================== */
const standHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Standings · live</title>
${FONTS}
<!-- LE STYLE EST CELUI DE maquette-standings.html, repris tel quel. -->
${STYLE_STAND}
<style>
.notlive{position:absolute;right:14px;top:52px;z-index:3;font:700 9.5px 'IBM Plex Sans',sans-serif;
  letter-spacing:.09em;text-transform:uppercase;color:#F2A33A;border:1px solid #F2A33A;
  border-radius:3px;padding:2px 7px;background:rgba(0,0,0,.55)}
.waiting{padding:40px 16px;font:500 13px 'IBM Plex Sans',sans-serif;color:#c1bdb4}
.vframe{width:100%;height:calc(100vh - 56px);border:0;display:block}
</style></head>
<body>
<div class="board">
  <div class="board-h"><b>Standings</b>
    <span class="seg"><button class="on" data-view="table">Live</button><button data-view="evo">Evolution</button></span>
    <span class="hint" id="hint">overall classification &middot; points per sprint &middot; laps won / lost &middot; finish order</span>
  </div>
  <div id="v-table"><div class="waiting">Nothing received yet.</div></div>
  <div id="v-evo" hidden><iframe class="vframe" src="fil-evolution.html?embed=1" title="Evolution"></iframe></div>
</div>
<script src="flags.js"></script>
<script>
(function(){
  var CH=new BroadcastChannel('tct-feed'), D=null;
  CH.addEventListener('message',function(e){ if(!e.data||!e.data.riders) return; D=e.data; draw(); });
  CH.postMessage({ask:true});
  var segs=document.querySelectorAll('.seg button');
  segs.forEach(function(b){ b.onclick=function(){
    segs.forEach(function(x){x.classList.toggle('on',x===b);});
    var evo=b.getAttribute('data-view')==='evo';
    document.getElementById('v-table').hidden=evo;
    document.getElementById('v-evo').hidden=!evo;
    document.getElementById('hint').textContent=evo
      ? 'rank at every sprint and every lap gained or lost'
      : 'overall classification \u00b7 points per sprint \u00b7 laps won / lost \u00b7 finish order';
  };});
  function up(s){return String(s||'').toUpperCase();}
  function ord(n){ return n + (['th','st','nd','rd'][(n%100-n%10==10)?0:(n%10<4?n%10:0)]||'th'); }
  function rid(b){ for(var i=0;i<D.riders.length;i++) if(D.riders[i].bib===b) return D.riders[i]; return null; }
  function draw(){
    if(!D) return;
    var qual = D.cfg && D.cfg.type==='qualification', CUT = qual ? D.cfg.advance : 0;
    var sprHd = D.sprints.map(function(s,i){return '<span class="sp">'+(s.final?'F':'S'+(i+1))+'</span>';}).join('');
    var rank=0;
    var body = D.standings.map(function(x){
      var r=rid(x.bib)||{nat:'',first:'',name:''};
      if(!x.wd) rank++;
      var spr=D.sprints.map(function(s){ var p=0;
        for(var i=0;i<s.order.length;i++) if(s.order[i].bib===x.bib) p=s.order[i].pts||0;
        return '<span class="sp'+(p?' on':'')+'">'+(p||'\u00b7')+'</span>'; }).join('');
      var gl=x.gainedLaps||[], ll=x.lostLaps||[];
      var gained = x.gained ? '<span class="lpill up">+'+(x.gained*20)+'</span>'+(gl.length?' <span class="lp">L'+gl.join(', L')+'</span>':'') : '<span class="z">\u00b7</span>';
      var lost   = x.lost   ? '<span class="lpill down">\u2212'+(x.lost*20)+'</span>'+(ll.length?' <span class="lp">L'+ll.join(', L')+'</span>':'') : '<span class="z">\u00b7</span>';
      var row='<div class="row'+(qual && !x.wd && rank>CUT ? ' elim':'')+'">'
        +'<span class="rk">'+(x.wd?'':rank)+'</span>'
        +'<span class="chip">'+x.bib+'</span>'
        +'<span class="flagw">'+flag(r.nat)+'</span>'
        +'<span class="noc">'+r.nat+'</span>'
        +'<span class="nm"><span class="fn">'+r.first+'</span> <b>'+up(r.name)+'</b></span>'
        +'<span class="tot">'+x.total+'</span>'
        +'<span class="sep"></span><span class="sprints">'+spr+'</span><span class="sep"></span>'
        +'<span class="lap">'+gained+'</span><span class="lap">'+lost+'</span>'
        +'<span class="sep"></span><span class="fin">'+(x.fin?ord(x.fin):'')+'</span></div>';
      if(qual && !x.wd && rank===CUT)
        row += '<div class="cutrow"><span>Qualification cut &middot; top '+CUT+' advance to the next round</span></div>';
      return row;
    }).join('');
    document.getElementById('v-table').innerHTML='<div class="tbl"><div class="hd">'
      +'<span class="r">#</span><span>Bib</span><span></span><span>NOC</span><span>Rider</span><span class="r">Total</span>'
      +'<span></span><span class="hdsprints">'+sprHd+'</span><span></span>'
      +'<span class="c">Lap +</span><span class="c">Lap \u2212</span><span></span><span class="c fo">Finish order</span>'
      +'</div>'+body+'</div>';
  }
})();
</script>
</body></html>`;
fs.writeFileSync(path.join(BASE, '..', 'fil-standings.html'), standHtml);

fs.writeFileSync(path.join(BASE, '..', 'fil.html'), html);
console.log('fil.html écrit · style repris de maquette-feed.html (' + (STYLE.length / 1024).toFixed(1) + ' Ko)');
