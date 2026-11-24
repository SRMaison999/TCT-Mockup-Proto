// Génère ../fil-racefacts.html — RACE FACTS, branché au moteur.
//
// Style LU dans `maquette-racefacts.html`, balisage gardé : la barre `.sub-h` avec la bascule
// All facts / Headlines et les pastilles de famille, la liste `.list`, les lignes `.fr` avec leur
// temps de course, leur tour, leur famille colorée et leur phrase.
//
// `MAQUETTES OUTPUTS.pdf` : « il n'y a RIEN à enregistrer en plus » — les faits se lisent dans
// Lap by lap (S.cross : le tour, l'heure de passage, la marque du tour gagné ou perdu, le BLOC où
// roulait le coureur), dans All sprints (l'ordre complet) et dans les groupes d'incident. Et
// « la phrase se compose à l'affichage depuis les champs du fait, jamais stockée en texte » :
// chaque fait est recalculé à chaque instantané, donc un fait corrigé par l'opérateur change de
// phrase tout seul. Les alertes matériel ne sont pas des faits : elles n'entrent pas ici.

const fs = require('fs');
const path = require('path');
const BASE = __dirname;

const mq = fs.readFileSync(path.join(BASE, 'maquette-racefacts.html'), 'utf8');
const m = mq.match(/<style>[\s\S]*?<\/style>/);
if (!m) { console.error('Style introuvable — lancer node gen-racefacts.js d\'abord.'); process.exit(1); }
const STYLE = m[0];
const FONTS = (mq.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/) || [''])[0];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Race facts · live</title>
${FONTS}
<!-- LE STYLE EST CELUI DE maquette-racefacts.html, lu dans le fichier genere. -->
${STYLE}
<style>.waiting{padding:40px 16px;font:500 13px var(--sans);color:var(--dim)}</style>
</head>
<body>
<div class="board">
  <div class="sub-h">
    <span class="t">Race facts</span>
    <span class="seg"><button class="on" data-m="all">All facts</button><button data-m="head">Headlines</button></span>
    <span class="chips" id="chips"></span>
  </div>
  <div class="list" id="list"><div class="waiting">Nothing received yet.</div></div>
  <div class="foot">Written from what the race already measured — loop crossings, bunch membership, lap counters, sprint order, classification. Hardware alerts are not sent here.</div>
</div>
<script src="flags.js"></script>
<script>
(function(){
  if(/embed/.test(location.search)){
    var _b=document.querySelector('.board');
    if(_b)_b.style.cssText+=';position:static;inset:auto;height:100%;border:0;border-radius:0;box-shadow:none;background:transparent;padding:4px 6px 8px';
    document.documentElement.style.height='100%';document.body.style.height='100%';document.body.style.background='transparent';
  }
  var FAM={sprint:{label:'Sprint',c:'#8FB4FF'},approach:{label:'Approach',c:'#ffecb3'},
    lap:{label:'Lap',c:'#2ED47A'},lost:{label:'Lap',c:'#FF5C5C'},brk:{label:'Breakaway',c:'#F2A33A'},
    drop:{label:'Dropped',c:'#c1bdb4'},stand:{label:'Standings',c:'#ffecb3'},
    cut:{label:'Cut line',c:'#F2A33A'},out:{label:'Still possible',c:'#8FB4FF'},crash:{label:'Crash',c:'#FF5C5C'}};
  var CHIPS=[['all','All'],['sprint','Sprint'],['approach','Approach'],['lap','Lap'],['brk','Breakaway'],
    ['drop','Dropped'],['stand','Standings'],['cut','Cut line'],['out','Still possible'],['crash','Crash']];
  var mode='all', fil='all', D=null;
  document.getElementById('chips').innerHTML=CHIPS.map(function(c,i){
    return '<button class="'+(i?'':'on')+'" data-f="'+c[0]+'">'+c[1]+'</button>';}).join('');
  document.querySelectorAll('.seg button').forEach(function(b){ b.onclick=function(){
    document.querySelectorAll('.seg button').forEach(function(x){x.classList.toggle('on',x===b);});
    mode=b.dataset.m; draw(); };});
  document.getElementById('chips').onclick=function(e){ var b=e.target.closest('[data-f]'); if(!b) return;
    document.querySelectorAll('#chips button').forEach(function(x){x.classList.toggle('on',x===b);});
    fil=b.dataset.f; draw(); };

  var CH=new BroadcastChannel('tct-feed');
  CH.addEventListener('message',function(e){ if(!e.data||!e.data.riders) return; D=e.data; draw(); });
  CH.postMessage({ask:true});

  function T(s){ s=Math.max(0,s); var m=Math.floor(s/60), r=s-m*60; return m+':'+(r<10?'0':'')+r.toFixed(1); }
  function rid(b){ for(var i=0;i<D.riders.length;i++) if(D.riders[i].bib===b) return D.riders[i]; return null; }
  // un coureur s'ecrit dossard, drapeau, NOC, prenom, NOM (son point 276)
  function r(b,hi){ var x=rid(b); if(!x) return '<b>'+b+'</b>';
    return '<span class="r'+(hi?' hi':'')+'"><b>'+b+'</b>'+flag(x.nat).replace('<svg ','<svg class="f" ')
      +'<span class="noc">'+x.nat+'</span> <span class="fn">'+x.first+'</span> '
      +'<span class="ln">'+x.name.toUpperCase()+'</span></span>'; }
  function ord(n){ return n+(['th','st','nd','rd'][(n%100-n%10==10)?0:(n%10<4?n%10:0)]||'th'); }

  // ---- LES FAITS, lus dans les trois releves -------------------------------------------------
  function facts(){
    var F=[], done=D.sprints.filter(function(s){return s.started && s.order.length;});

    // 1. LE SPRINT — All sprints garde l'ordre complet.
    done.forEach(function(s){
      var o=s.order, sc=o.slice(0,4);
      F.push({t:s.sentAt!=null?s.sentAt:0, lap:s.lap, fam:'sprint', head:1, s:
        (s.final?'Final sprint, points doubled':'Sprint '+s.k)+' \\u2014 '+r(sc[0].bib,1)+' wins it'
        + (sc.length>1 ? ' from '+sc.slice(1).map(function(e){return r(e.bib);}).join(', ') : '')
        + '. <b>'+sc.map(function(e){return '+'+e.pts;}).join(' \\u00b7 ')+'</b>.'});

      // 2. L'APPROCHE — la position du vainqueur au back straight du tour d'avant, lue sur la boucle.
      var back=backLoop(); if(back==null) return;
      var was=posAt(back, s.lap-1, sc[0].bib), at=posAt(back, s.lap, sc[0].bib);
      if(was) F.push({t:(s.sentAt||0)-0.2, lap:s.lap, fam:'approach', s:
        r(sc[0].bib,1)+' was <b>'+ord(was)+'</b> on the back straight '+(at?'of the lap before':'')
        +' and led at the line.'});
    });

    // 3. LE TOUR GAGNE OU PERDU — la marque est gravee dans Lap by lap.
    eachCross(function(lap,c){
      if(!c.mark) return;
      F.push({t:c.t, lap:lap, fam:c.mark>0?'lap':'lost', head:1, s:
        r(c.bib,1)+(c.mark>0?' takes a lap on the field. <b>+20 points</b>.'
                            :' loses a lap. <b>\\u221220 points</b>.')});
    });

    // 4. L'ECHAPPEE ET LE COUREUR DECROCHE — le BLOC grave a la lecture dit qui roulait avec qui.
    // UN FAIT PAR EPISODE, pas par tour : un coureur hors du peloton pendant au moins deux tours.
    // Le bloc est renumerote pendant la course, donc un simple changement de bloc ne dit rien.
    episodes().forEach(function(ep){
      var lost = ep.lost, won = ep.won;
      F.push({t:ep.t0, lap:ep.lap0, fam:lost?'drop':'brk', head:(won||lost)?1:0, s:
        r(ep.bib,1)+(lost?' is dropped from the bunch on lap ':' goes clear of the bunch on lap ')+ep.lap0
        +(ep.with.length?' with '+ep.with.map(function(b){return r(b);}).join(' and '):', alone')+'.'});
      if(ep.lap1!=null) F.push({t:ep.t1, lap:ep.lap1, fam:lost?'drop':'brk', s:
        r(ep.bib,1)+' is back in the bunch on lap '+ep.lap1+', after '+(ep.lap1-ep.lap0)
        +(ep.lap1-ep.lap0===1?' lap':' laps')+(won?' and a lap gained':lost?' and a lap lost':'')+'.'});
    });

    // 5. LA CHUTE — un groupe d'incident, date du tour.
    (D.groups||[]).filter(function(g){return g.type==='crash'||g.type==='mech';}).forEach(function(g){
      F.push({t:g.t, lap:g.lap, fam:'crash', head:1, s:
        (g.type==='crash'?'Crash':'Mechanical')+' on lap '+g.lap+' \\u2014 '
        + g.bibs.map(function(b){return r(b,1);}).join(', ')+'. Five laps to rejoin.'});
    });

    // 6. LE CLASSEMENT ET LA LIGNE DE COUPE — a chaque sprint juge.
    if(done.length){
      var st=D.standings.filter(function(x){return !x.wd;});
      if(st.length>1) F.push({t:D.t, lap:D.lap, fam:'stand', head:1, s:
        'Standings \\u2014 '+r(st[0].bib,1)+' leads with <b>'+st[0].total+' points</b>, '
        +(st[0].total-st[1].total)+' clear of '+r(st[1].bib)+'.'});
      if(D.cfg && D.cfg.type==='qualification' && st.length>D.cfg.advance)
        F.push({t:D.t-0.1, lap:D.lap, fam:'cut', head:1, s:
          r(st[D.cfg.advance-1].bib,1)+' is the last rider through to the next round, ahead of '
          +r(st[D.cfg.advance].bib)+'.'});
    }

    // 7. CE QUI RESTE POSSIBLE — le bareme de ce qui n'est pas couru.
    var leftS=D.sprints.filter(function(s){return !s.started;});
    if(leftS.length){
      var maxLeft=leftS.reduce(function(a,s){return a+(s.final?10:5);},0);
      F.push({t:D.t-0.2, lap:D.lap, fam:'out', s:
        (D.race.laps-D.lap)+' laps to go \\u2014 <b>'+maxLeft+' points</b> still on the line'
        +(leftS.length>1?' across '+leftS.length+' sprints':'')+'. A lap gained is worth +20.'});
    }

    F.sort(function(a,b){ return b.t-a.t; });
    return F;
  }

  // --- les trois releves, lus ---
  function backLoop(){ var L=D.loops||[]; for(var i=0;i<L.length;i++) if(/Pursuit B/i.test(L[i].name)) return L[i].i; return null; }
  function posAt(loop, lap, bib){
    // le rang d'un coureur a un releve, c'est sa place dans la lecture de ce passage sur la boucle
    var list=(D.reads&&D.reads[loop])||[], cross=(D.cross||{})[lap]||[];
    if(!cross.length) return null;
    var t0=Math.min.apply(null,cross.map(function(c){return c.t;}));
    var t1=Math.max.apply(null,cross.map(function(c){return c.t;}));
    var pass=list.filter(function(x){return x.t>=t0-30 && x.t<=t1;});
    var seen={}, order=[]; for(var i=pass.length-1;i>=0;i--){ var x=pass[i];
      if(seen[x.bib]) continue; seen[x.bib]=1; order.unshift(x.bib); }
    var k=order.indexOf(bib); return k<0?null:k+1;
  }
  function eachCross(fn){ var C=D.cross||{};
    Object.keys(C).sort(function(a,b){return a-b;}).forEach(function(lap){
      C[lap].forEach(function(c){ fn(+lap,c); }); }); }
  // un episode : le coureur quitte le bloc du peloton, et y revient (ou pas). Moins de deux tours
  // hors du peloton n'est pas un fait : c'est la timeline qui renumerote ses blocs.
  function episodes(){
    var laps=Object.keys(D.cross||{}).map(Number).sort(function(a,b){return a-b;});
    var open={}, out=[];
    laps.forEach(function(lap){
      var bunch=bunchAt(lap), list=D.cross[lap]||[];
      list.forEach(function(c){
        var away = bunch!==null && c.blkid!==bunch;
        var e=open[c.bib];
        if(away && !e){
          open[c.bib]={bib:c.bib, lap0:lap, t0:c.t, with:list.filter(function(o){
            return o.bib!==c.bib && o.blkid===c.blkid;}).map(function(o){return o.bib;}).slice(0,3),
            won:false, lost:false};
        } else if(away && e){
          if(c.mark>0) e.won=true; if(c.mark<0) e.lost=true;
        } else if(!away && e){
          e.lap1=lap; e.t1=c.t;
          if(e.lap1-e.lap0>=2) out.push(e);
          delete open[c.bib];
        }
      });
    });
    Object.keys(open).forEach(function(b){ var e=open[b];
      if(D.lap-e.lap0>=2){ e.lap1=null; out.push(e); } });
    return out;
  }
  function blockMoves(){
    // le bloc est grave sur chaque passage : un changement de bloc est une sortie ou un retour
    var last={}, out=[];
    eachCross(function(lap,c){
      var prev=last[c.bib];
      if(prev!==undefined && prev!==c.blkid){
        var bunch=bunchAt(lap);
        out.push({bib:c.bib, lap:lap, t:c.t, away:c.blkid!==bunch,
          with:(D.cross[lap]||[]).filter(function(o){return o.bib!==c.bib && o.blkid===c.blkid;})
                 .map(function(o){return o.bib;}).slice(0,3)});
      }
      last[c.bib]=c.blkid;
    });
    return out;
  }
  function bunchAt(lap){   // le bloc le plus nombreux du tour, c'est le peloton
    var n={}, best=null;
    (D.cross[lap]||[]).forEach(function(c){ n[c.blkid]=(n[c.blkid]||0)+1;
      if(best===null||n[c.blkid]>n[best]) best=c.blkid; });
    return best===null?null:(best==='null'?null:+best);
  }

  function draw(){
    if(!D) return;
    var F=facts().filter(function(f){
      if(mode==='head' && !f.head) return false;
      if(fil!=='all'){ if(fil==='lap') return f.fam==='lap'||f.fam==='lost'; return f.fam===fil; }
      return true; });
    document.getElementById('list').innerHTML = F.length ? F.map(function(f){
      var T2=FAM[f.fam];
      return '<div class="fr" data-fam="'+f.fam+'" data-head="'+(f.head?1:0)+'" style="--c:'+T2.c+'">'
        +'<span class="rt">'+T(f.t)+'</span><span class="lp">L'+(f.lap||'')+'</span>'
        +'<span class="fam">'+T2.label+'</span><span class="tx">'+f.s+'</span></div>'; }).join('')
      : '<div class="waiting">No fact in this filter yet.</div>';
  }
})();
</script>
</body></html>`;

fs.writeFileSync(path.join(BASE, '..', 'fil-racefacts.html'), html);
console.log('fil-racefacts.html écrit · style repris de maquette-racefacts.html (' + (STYLE.length / 1024).toFixed(1) + ' Ko)');
