// Génère ../fil-scenarios.html — POSSIBLE SCENARIOS, branché au moteur.
//
// Même méthode que gen-fil.js : le style est LU dans `maquette-scenarios.html`, jamais recopié, et
// le balisage de la maquette est gardé — la barre `.board-h` avec la bascule Overview / What if…,
// le bandeau `.inplay`, les barres `.brow`, les cartes de bagarre `.bc`, et le projecteur
// `.whatif` avec ses `.wi-slot` et ses lignes `.wir`.
//
// Ce que dit `MAQUETTES OUTPUTS.pdf` : « Deux sources seulement : le classement courant, et le
// barème de ce qui reste — un sprint restant vaut 5, le final 10, un tour gagné 20. Le plafond
// atteignable d'un coureur, sa fourchette de place et les bagarres s'en déduisent sans rien
// enregistrer de plus. » C'est exactement ce que fait cette page, sur l'instantané du prototype.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;

const mq = fs.readFileSync(path.join(BASE, 'maquette-scenarios.html'), 'utf8');
const m = mq.match(/<style>[\s\S]*?<\/style>/);
if (!m) { console.error('Style introuvable — lancer node gen-scenarios.js d\'abord.'); process.exit(1); }
const STYLE = m[0];
const FONTS = (mq.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/) || [''])[0];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Possible scenarios · live</title>
${FONTS}
<!-- LE STYLE EST CELUI DE maquette-scenarios.html, lu dans le fichier genere. -->
${STYLE}
<style>.waiting{padding:40px 16px;font:500 13px var(--sans);color:var(--dim)}</style>
</head>
<body>
<div class="board">
  <div class="board-h"><b>Possible scenarios</b><span class="hint">what is still possible, looking ahead</span>
    <span class="seg"><button class="on" data-wv="overview">Overview</button><button data-wv="whatif">What if…</button></span>
    <span class="togo" id="togo">—</span>
  </div>
  <div class="inplay" id="inplay"><span class="k">Still in play</span></div>
  <div class="main" id="v-overview">
    <div class="col bars">
      <div class="ch2">Reachable points <span class="sub">solid = secured now · hatched = still in play · green = can still win</span></div>
      <div class="barswrap"><div id="bars"><div class="waiting">Nothing received yet.</div></div></div>
    </div>
    <div class="col fight">
      <div class="ch2">The battles <span class="sub">only the places still open — one line each</span></div>
      <div class="fightwrap"><div id="fights"></div></div>
    </div>
  </div>
  <div class="whatif" id="v-whatif" hidden>
    <div class="wi-in"><div id="wi-slots"></div>
      <button class="wi-reset" id="wi-reset">Reset to a likely finish</button></div>
    <div class="wi-out">
      <div class="wi-th">Projected final classification <span class="sub">if the race finishes like this · ▲▼ vs the standings now</span></div>
      <div class="wi-rows" id="wi-table"></div>
    </div>
  </div>
  <div class="note" id="note">Reachable = current points + the most still available from the remaining sprints. A lap gained adds +20. Places shown as a best → worst range.</div>
</div>
<script src="flags.js"></script>
<script>
(function(){
  if(/embed/.test(location.search)){
    var _b=document.querySelector('.board');
    if(_b)_b.style.cssText+=';position:static;inset:auto;height:100%;border:0;border-radius:0;box-shadow:none;background:transparent;padding:4px 6px 8px';
    document.documentElement.style.height='100%';document.body.style.height='100%';document.body.style.background='transparent';
  }
  var POINTS=[5,3,2,1], LAP_PTS=20;
  var CH=new BroadcastChannel('tct-feed'), D=null, wi=null;
  CH.addEventListener('message',function(e){ if(!e.data||!e.data.riders) return; D=e.data; draw(); });
  CH.postMessage({ask:true});

  var segs=document.querySelectorAll('.seg button');
  segs.forEach(function(b){ b.onclick=function(){
    segs.forEach(function(x){x.classList.toggle('on',x===b);});
    var w=b.getAttribute('data-wv')==='whatif';
    document.getElementById('v-overview').hidden=w;
    document.getElementById('v-whatif').hidden=!w;
  };});
  document.getElementById('wi-reset').onclick=function(){ wi=null; draw(); };

  function rid(b){ for(var i=0;i<D.riders.length;i++) if(D.riders[i].bib===b) return D.riders[i]; return null; }
  function left(){ return D.sprints.filter(function(s){return !s.started;}); }
  function scale(s){ return s.final ? POINTS.map(function(p){return p*2;}) : POINTS.slice(); }
  function maxLeft(){ return left().reduce(function(a,s){return a+scale(s)[0];},0); }

  function draw(){
    if(!D) return;
    var L=left(), lapsToGo = D.started ? Math.max(0, D.race.laps - D.lap) : D.race.laps;
    document.getElementById('togo').textContent = lapsToGo+' laps to go \\u00b7 '+L.length+(L.length===1?' sprint left':' sprints left');
    document.getElementById('inplay').innerHTML='<span class="k">Still in play</span>'
      + L.map(function(s){return '<span class="pill">'+(s.final?'Final':'Sprint '+s.k)+' \\u00b7 +'+scale(s)[0]+'</span>';}).join('')
      + '<b>up to '+maxLeft()+' pts from the sprints</b> \\u00b7 a lap gained is worth <span class="pill lap">+'+LAP_PTS+'</span>';

    // --- le classement courant, et le plafond de chacun ---
    var rank=0;
    var ST=D.standings.filter(function(x){return !x.wd;}).map(function(x){ rank++;
      var r=rid(x.bib)||{nat:'',first:'',name:''};
      return {bib:x.bib,nat:r.nat,first:r.first,name:r.name,pts:x.total,rank:rank,ceil:x.total+maxLeft()}; });
    if(!ST.length) return;
    var leader=ST[0], maxAxis=Math.max.apply(null,ST.map(function(r){return r.ceil;}))||1;
    // fourchette de place : au mieux, il prend tout et les autres rien ; au pire, il ne prend rien
    ST.forEach(function(r){
      var best=1,worst=1;
      ST.forEach(function(o){ if(o.bib===r.bib) return;
        if(o.pts>r.ceil) best++;
        if(o.ceil>r.pts) worst++; });
      r.best=best; r.worst=worst;
    });
    document.getElementById('bars').innerHTML=ST.map(function(r){
      var canWin=r.ceil>=leader.pts, fillW=(r.pts/maxAxis*100).toFixed(1), reachW=(maxLeft()/maxAxis*100).toFixed(1);
      var place=r.best===r.worst?'P'+r.best:'P'+r.best+'\\u2013'+r.worst;
      return '<div class="brow'+(canWin?' win':'')+'">'
        +'<span class="brk">'+r.rank+'</span><span class="bf">'+flag(r.nat)+'</span>'
        +'<span class="bbib">'+r.bib+'</span>'
        +'<span class="bnm"><span class="fn">'+r.first+'</span> <b>'+r.name+'</b></span>'
        +'<span class="bpts">'+r.pts+'</span>'
        +'<span class="bar"><span class="fill" style="width:'+fillW+'%"></span>'
        +'<span class="reach" style="width:'+reachW+'%"></span><span class="cap">'+r.ceil+'</span></span>'
        +'<span class="bpl">'+place+'</span></div>';
    }).join('');

    // --- les bagarres : seulement les places encore ouvertes ---
    function chip(b){ var r=rid(b)||{nat:'',name:''};
      return '<span class="ch"><span class="cf">'+flag(r.nat)+'</span><b>'+b+'</b> '+r.name+'</span>'; }
    function contenders(place){   // qui peut encore finir a cette place ou mieux, et n'y est pas deja sur
      return ST.filter(function(r){ return r.best<=place && r.worst>=place; });
    }
    var cards=[];
    var win=contenders(1);
    cards.push({tone:'good',title:'The win',place:'P1',riders:win.slice(0,4).map(function(r){return r.bib;}),
      line: win.length<=1
        ? '<b>'+leader.name+'</b> ('+leader.pts+') cannot be caught: the win is settled.'
        : '<b>'+win[0].name+'</b> ('+win[0].pts+') leads; '+few(win.slice(1),3)
          +' can still pass him \\u2014 up to '+maxLeft()+' points are left.'});
    function few(list,n){ return list.slice(0,n).map(function(r){return '<b>'+r.name+'</b> ('+r.pts+')';}).join(', ')
      + (list.length>n ? ' and '+(list.length-n)+' others' : ''); }
    var pod=ST.filter(function(r){ return r.best<=3 && r.worst>=2; });
    if(pod.length) cards.push({tone:'acc',title:'The podium',place:'P2\\u2013P3',
      riders:pod.slice(0,4).map(function(r){return r.bib;}),
      line: few(pod,3)+' are inside the podium range.'});
    if(D.cfg && D.cfg.type==='qualification'){
      var CUT=D.cfg.advance, q=ST.filter(function(r){ return r.best<=CUT && r.worst>CUT; });
      cards.push({tone:'warn',title:'Last qualifying place',place:'P'+CUT,
        riders:q.slice(0,4).map(function(r){return r.bib;}),
        line: q.length
          ? few(q.slice(0,4),4)+(q.length>4?'':'')+' are on either side of the cut: top '+CUT+' advance.'
          : 'The top '+CUT+' can no longer change: the cut is settled.'});
    }
    document.getElementById('fights').innerHTML=cards.map(function(b){
      return '<div class="bc '+b.tone+'"><div class="bch"><span class="bct">'+b.title+'</span>'
        +'<span class="bcp">'+b.place+'</span></div>'
        +'<div class="bcr">'+b.riders.map(chip).join('')+'</div>'
        +'<div class="bcl">'+b.line+'</div></div>'; }).join('');

    // --- What if : un bloc par sprint restant, le bareme de la maquette ---
    if(!wi){ wi={}; L.forEach(function(s){ wi[s.k]=ST.slice(0,4).map(function(r){return r.bib;}); }); }
    document.getElementById('wi-slots').innerHTML = L.map(function(s){
      var sc=scale(s), lbl=['1st','2nd','3rd','4th'];
      return '<div class="wi-sprint"><div class="wi-sh">'+(s.final?'Final':'Sprint '+s.k)
        +' <span class="pts">'+(s.final?'doubled \\u00b7 ':'')+sc.map(function(p){return '+'+p;}).join(' \\u00b7 ')+'</span></div>'
        + [0,1,2,3].map(function(i){
            return '<div class="wi-slot"><span class="pl">'+lbl[i]+' +'+sc[i]+'</span>'
              +'<select data-k="'+s.k+'" data-i="'+i+'"><option value="">\\u2014</option>'
              + ST.map(function(r){ return '<option value="'+r.bib+'"'+((wi[s.k]||[])[i]==r.bib?' selected':'')+'>'
                  +r.bib+' '+r.name+'</option>'; }).join('')
              +'</select></div>'; }).join('')
        +'</div>'; }).join('');
    document.getElementById('wi-slots').onchange=function(ev){
      var sel=ev.target; if(!sel.dataset.k) return;
      wi[sel.dataset.k][+sel.dataset.i]= sel.value?+sel.value:null; project();
    };
    project();

    function project(){
      var add={}; ST.forEach(function(r){add[r.bib]=0;});
      L.forEach(function(s){ var sc=scale(s); (wi[s.k]||[]).forEach(function(b,i){ if(b) add[b]+=sc[i]; }); });
      var proj=ST.map(function(r){ return {bib:r.bib,nat:r.nat,name:r.name,pts:r.pts,add:add[r.bib]||0,
        total:r.pts+(add[r.bib]||0),now:r.rank}; });
      proj.sort(function(a,b){return b.total-a.total || a.now-b.now;});
      document.getElementById('wi-table').innerHTML=proj.map(function(r,i){
        var nw=i+1, d=r.now-nw, cls=d>0?'up':d<0?'down':'same', arr=d>0?'\\u25b2 '+d:d<0?'\\u25bc '+(-d):'\\u00b7';
        return '<div class="wir"><span class="wrk">'+nw+'</span><span class="wdl '+cls+'">'+arr+'</span>'
          +'<span class="wf">'+flag(r.nat)+'</span><span class="wb">'+r.bib+'</span>'
          +'<span class="wn">'+r.name+'</span><span class="wadd">'+(r.add?'+'+r.add:'\\u00b7')+'</span>'
          +'<span class="wtot">'+r.total+'</span></div>'; }).join('');
    }
  }
})();
</script>
</body></html>`;

fs.writeFileSync(path.join(BASE, '..', 'fil-scenarios.html'), html);
console.log('fil-scenarios.html écrit · style repris de maquette-scenarios.html (' + (STYLE.length / 1024).toFixed(1) + ' Ko)');
