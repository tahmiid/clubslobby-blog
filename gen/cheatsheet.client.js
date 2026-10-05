/* The cheat sheets' script (gen/cheatsheet.mjs pastes this file into the page
   after COST_JS from gen/archetype-stats.mjs, which gives ppt, apTo, esc, fmt).

   The first half is PURE: strings in, HTML out. The generator runs those same
   functions in Node to write the page's first paint (the default comparison,
   the match numbers, the calculator's opening answer), so what Google reads
   and what the reader's taps redraw cannot drift. The second half touches the
   DOM and only runs in a browser.

   D is the page's data island (#cs-data): K = attribute keys in one order for
   every array; A[id] = {n,p,mn,mx,t,...} per archetype, arrays aligned to K
   (null = the archetype has no such attribute, t -1 = not priced); builds[].a
   aligned to K as well. No backticks and no "</" + "script" in this file. */

function csGrade(v){return v>=80?'#2FD26B':v>=55?'#E8912D':'#D9542F'}
function csFt(i){return Math.floor(i/12)+"'"+(i%12)+'"'}
function csSg(v){return (v>0?'+':'')+v}
function csPs(D,s){return D.PS[s]||s}
function csPsImg(D,s){return D.site+'/assets/playstyles/'+s+'.png'}
function csTop(D,b,n){
  var r=[];for(var i=0;i<D.K.length;i++)if(b.a[i]!=null)r.push([D.K[i],b.a[i]]);
  r.sort(function(x,y){return y[1]-x[1]});return r.slice(0,n)}
function csCostTo(D,aid,i,to){
  var A=D.A[aid];if(A.mn[i]==null||A.t[i]<0)return null;
  var top=Math.min(to,A.mx[i]);return top>A.mn[i]?apTo(D.B,D.TK[A.t[i]],A.mn[i],top):0}
function csTag(D,t){return t<0?'':'<span class="tag t'+t+'">'+D.TN[t]+'</span>'}
function csDay(iso){
  var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var d=new Date(iso);return isNaN(d)?'':d.getUTCDate()+' '+m[d.getUTCMonth()]+' '+d.getUTCFullYear()}

/* The stats sheet for build i: every attribute, grouped like the game. */
function csSheet(D,i){
  var b=D.builds[i],A=D.A[D.id],h='';
  h+='<div class="grab"><i></i><div class="sh"><div><b>'+esc(b.n)+'</b><span>'+esc(D.name)+' · Level '+D.cap+(b.acc?' · '+esc(b.acc):'')+'</span></div>'
    +'<button class="x" type="button" data-close aria-label="Close">✕</button></div></div>';
  h+='<div class="kv"><div><small>Height</small><b>'+csFt(b.h)+'</b></div><div><small>Weight</small><b>'+b.w+' lb</b></div>'
    +'<div><small>Skill moves</small><b>'+b.sm+'★</b></div><div><small>Weak foot</small><b>'+b.wf+'★</b></div>'
    +'<div><small>PlayStyles</small><b>'+(b.sig.length+b.ps.length)+'</b></div></div>';
  h+='<div class="cs-tags">';
  for(var s=0;s<b.sig.length;s++)h+='<span class="g">★ '+esc(csPs(D,b.sig[s]))+'</span>';
  for(var r=0;r<b.ps.length;r++)h+='<span>'+esc(csPs(D,b.ps[r]))+'</span>';
  h+='</div>';
  h+='<div class="gs">';
  for(var g=0;g<D.G.length;g++){
    var ks=D.G[g][1],sum=0,n=0,rows='';
    for(var j=0;j<ks.length;j++){
      var ix=D.K.indexOf(ks[j]),v=b.a[ix];if(v==null)continue;sum+=v;n++;
      var t=A.t[ix];
      rows+='<div class="ar"><span>'+esc(D.N[ks[j]])+(t===0?' <em class="ct t0">CHEAP</em>':t===3?' <em class="ct t3">EXPEN</em>':'')+'</span><em>'+v+'</em>'
        +'<i><b style="width:'+v+'%"></b></i></div>'}
    if(n)h+='<div class="g"><h6>'+esc(D.G[g][0])+'<b>'+Math.round(sum/n)+'</b></h6>'+rows+'</div>'}
  h+='</div>';
  h+='<div class="sacts"><button class="cs-btn" type="button" data-share-build="'+i+'">'+D.ico+' Share</button>'
    +'<a class="cs-btn go" href="'+D.site+'/b/'+b.id+'?src=grid">Open &amp; copy →</a></div>';
  return h}

/* "On the pitch": S = the archetype's row of the public match stats. */
function csPitch(D,S){
  if(!S)return '';
  var a=S.archetypes[D.id];if(!a)return '';
  var pos=D.A[D.id].p,t=[['Played by',a.share+'%'],['Avg rating',a.rating]];
  if(pos==='Keeper'){t.push(['Saves / 90',a.saves90],['Pass accuracy',a.passPct+'%'])}
  else if(pos==='Defender'){t.push(['Tackles / 90',a.tackles90],['Pass accuracy',a.passPct+'%'])}
  else if(pos==='Midfielder'){t.push(['Assists / 90',a.assists90],['Tackles / 90',a.tackles90])}
  else{t.push(['Goals / 90',a.goals90],['Assists / 90',a.assists90])}
  t.push(['Man of the match',a.motmPct+'%']);
  var h='<div class="cs-tiles">';
  for(var i=0;i<t.length;i++)h+='<div><small>'+t[i][0]+'</small><b>'+t[i][1]+'</b></div>';
  h+='</div>';
  if(a.winEffect)h+='<div class="cs-we"><div class="big">'+csSg(a.winEffect.pts)+'</div><div class="tx"><b>Win effect.</b> Teams with '+D.an+' win '+a.winEffect.pts
    +' points more often than teams with the same number of humans and no '+esc(D.name)+'.<span class="pill '+(a.winEffect.clear?'y">clear':'n">early signal')+'</span></div></div>';
  var P={forward:'up front',midfielder:'in midfield',defender:'in defence',goalkeeper:'in goal'},ps=[];
  for(var k in a.positions)if(a.positions.hasOwnProperty(k)&&a.positions[k]>=5)ps.push([k,a.positions[k]]);
  ps.sort(function(x,y){return y[1]-x[1]});
  if(ps.length)h+='<p class="cs-pos">Where '+esc(D.plural)+' play: '+ps.map(function(x){return '<b>'+x[1]+'%</b> '+P[x[0]]}).join(', ')+'.</p>';
  h+='<p class="src">'+fmt(S.teams)+' league team-games · '+fmt(S.playerGames)+' player-games · updated '+csDay(S.computedAt)+'</p>';
  return h}

/* "Wins with": only partners the archetype wins MORE often beside. */
function csPairs(D,S){
  if(!S)return '';
  var a=S.archetypes[D.id];if(!a||!a.with||!a.with.length)return '';
  var mx=0,i;for(i=0;i<a.with.length;i++)mx=Math.max(mx,a.with[i].pts);
  var h='';
  for(i=0;i<a.with.length;i++){var w=a.with[i],o=D.A[w.id];if(!o)continue;
    h+='<div class="cs-pr'+(w.clear?'':' dim')+'"><a href="'+o.u+'">+ '+esc(o.n)+'</a><div class="bar"><b style="width:'+Math.max(6,Math.round(w.pts/mx*100))+'%"></b></div>'
      +'<em>'+csSg(w.pts)+(w.clear?'':'<span class="pill n">early</span>')+'</em></div>'}
  return h}

/* The comparison table's rows: this archetype against "other". */
function csCompare(D,S,other){
  var me=D.A[D.id],o=D.A[other],h='',i;
  function row(l,a,b,f){f=f||function(x){return x};var w=a===b||a==null||b==null?0:(a>b?1:2);
    return '<tr><td>'+l+'</td><td class="ctr'+(w===1?' w':'')+'">'+(a==null?'–':f(a))+'</td><td class="ctr'+(w===2?' w':'')+'">'+(b==null?'–':f(b))+'</td></tr>'}
  function sec(t){return '<tr class="sec"><td colspan="3">'+t+'</td></tr>'}
  function pc(x){return x+'%'}
  var sa=S&&S.archetypes[D.id],sb=S&&S.archetypes[other];
  if(sa&&sb){
    /* A keeper's match numbers only mean something beside another keeper's. */
    var ka=me.p==='Keeper',kb=o.p==='Keeper';
    h+=sec('In matches')+row('Played by',sa.share,sb.share,pc);
    if(ka&&kb)h+=row('Avg rating',sa.rating,sb.rating)+row('Saves / 90',sa.saves90,sb.saves90)+row('Pass accuracy',sa.passPct,sb.passPct,pc)+row('Man of the match',sa.motmPct,sb.motmPct,pc);
    else if(!ka&&!kb){h+=row('Avg rating',sa.rating,sb.rating)+row('Goals / 90',sa.goals90,sb.goals90)+row('Assists / 90',sa.assists90,sb.assists90)+row('Tackles / 90',sa.tackles90,sb.tackles90)
      +row('Pass accuracy',sa.passPct,sb.passPct,pc)+row('Man of the match',sa.motmPct,sb.motmPct,pc);
      if(sa.winEffect&&sb.winEffect)h+=row('Win effect',sa.winEffect.pts,sb.winEffect.pts,csSg)}}
  h+=sec('Body')+'<tr><td>Height</td><td class="ctr">'+csFt(me.hi[0])+'–'+csFt(me.hi[1])+'</td><td class="ctr">'+csFt(o.hi[0])+'–'+csFt(o.hi[1])+'</td></tr>'
    +row('Skill moves (max)',me.sm[1],o.sm[1],function(x){return x+'★'})+row('Weak foot (max)',me.wf[1],o.wf[1],function(x){return x+'★'});
  h+=sec('Attribute cap · AP from its start to the cap');
  var ks=[];for(i=0;i<D.K.length;i++)if(me.mx[i]!=null||o.mx[i]!=null)ks.push(i);
  ks.sort(function(x,y){return D.N[D.K[x]]<D.N[D.K[y]]?-1:1});
  function cell(A,ix,win){
    if(A.mx[ix]==null)return '<td class="ctr">–</td>';
    var c=csCostTo(D,A===me?D.id:other,ix,A.mx[ix]),t=A.t[ix];
    return '<td class="ctr'+(win?' w':'')+'">'+A.mx[ix]+(t===0?' <span class="tag t0">Cheap</span>':t===3?' <span class="tag t3">Expen</span>':'')+(c==null?'':'<small>'+fmt(c)+' AP</small>')+'</td>'}
  for(i=0;i<ks.length;i++){var ix=ks[i],a=me.mx[ix],b=o.mx[ix];
    h+='<tr><td>'+esc(D.N[D.K[ix]])+'</td>'+cell(me,ix,a!=null&&b!=null&&a>b)+cell(o,ix,a!=null&&b!=null&&b>a)+'</tr>'}
  return h}

/* The calculator's answer for attribute index ix raised to "to". */
function csCalc(D,ix,to){
  var A=D.A[D.id],tk=D.TK[A.t[ix]],ap=csCostTo(D,D.id,ix,to),lvl=null,i;
  for(i=0;i<D.L.length;i++)if(D.L[i][2]>=ap){lvl=D.L[i][0];break}
  var steps=[];for(var v=A.mn[ix]+1;v<=A.mx[ix];v++)steps.push(ppt(D.B,tk,v));
  return {ap:ap,last:to>A.mn[ix]?ppt(D.B,tk,to):0,lvl:lvl,t:A.t[ix],steps:steps,from:A.mn[ix],max:A.mx[ix]}}
function csSteps(c,to){
  var mx=0,i;for(i=0;i<c.steps.length;i++)mx=Math.max(mx,c.steps[i]);
  var h='';for(i=0;i<c.steps.length;i++)h+='<i style="height:'+Math.max(8,Math.round(c.steps[i]/mx*100))+'%;opacity:'+(c.from+1+i<=to?'.95':'.2')+'"></i>';
  return h}

/* What level L gives: [level, ap, cumulative, slot, perk, ps+, mastery, tier]. */
function csLevel(D,n){
  var l=D.L[n-1],u=[];
  if(l[3])u.push('PlayStyle slot '+l[3]);
  if(l[4]&&D.perk)u.push('the '+esc(D.perk)+' Signature Perk');
  if(l[5])u.push('the PlayStyle+ upgrade'+(D.sig?' ('+esc(D.sig)+'+)':''));
  if(l[6]&&D.mast[n])u.push('a Mastery point ('+esc(D.mast[n])+')');
  if(l[7])u.push('the '+esc(l[7])+' card');
  return '<b>Level '+n+'</b>: <b style="color:#2DE2C5">+'+l[1]+' AP</b>, '+fmt(l[2])+' AP in total'+(u.length?'. Unlocks '+u.join(', '):'')+'.'}

/* ── the page ─────────────────────────────────────────────────────────────── */
if(typeof document!=='undefined')(function(){
  var el=document.getElementById('cs-data');if(!el)return;
  var D;try{D=JSON.parse(el.textContent)}catch(e){return}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function ev(name,p){try{if(window.gtag)window.gtag('event',name,p||{})}catch(e){}}

  var toast=document.createElement('div');toast.className='cs-toast';document.body.appendChild(toast);var tt;
  function say(t){toast.textContent=t;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},1700)}
  function copy(u){
    function done(){say('Link copied')}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(done,function(){legacy()})}else legacy();
    function legacy(){try{var t=document.createElement('textarea');t.value=u;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();done()}catch(e){say(u)}}}
  function share(title,url,kind,id){
    ev('share',{method:navigator.share?'native':'copy',content_type:kind,item_id:id});
    if(navigator.share){navigator.share({title:title,url:url}).catch(function(){})}else copy(url)}

  /* stats sheet */
  var scrim=document.createElement('div');scrim.className='cs-scrim';
  var sheet=document.createElement('div');sheet.className='cs cs-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
  document.body.appendChild(scrim);document.body.appendChild(sheet);
  function openS(i){sheet.innerHTML=csSheet(D,i);sheet.scrollTop=0;sheet.classList.add('open');scrim.classList.add('open');
    document.documentElement.style.overflow='hidden';ev('select_content',{content_type:'build_stats',item_id:D.builds[i].id})}
  function closeS(){sheet.classList.remove('open');scrim.classList.remove('open');document.documentElement.style.overflow=''}
  scrim.addEventListener('click',closeS);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeS()});
  var y0=null;
  sheet.addEventListener('touchstart',function(e){y0=sheet.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
  sheet.addEventListener('touchmove',function(e){if(y0!==null&&e.touches[0].clientY-y0>80){closeS();y0=null}},{passive:true});

  document.addEventListener('click',function(e){
    var t=e.target;
    if(t.closest('[data-close]'))return closeS();
    var sb=t.closest('[data-share-build]');
    if(sb){var b=D.builds[+sb.getAttribute('data-share-build')];return share(b.n+' · FC 27 '+D.name+' build',D.site+'/b/'+b.id,'build',b.id)}
    var sh=t.closest('[data-share]');
    if(sh){var id=sh.getAttribute('data-share');return share(sh.getAttribute('data-title')||document.title,D.url+(id?'#'+id:''),'section',id||'page')}
    /* A build opens in the APP, not in a sheet here (owner, 5 Oct). */
    var c=t.closest('[data-b]');
    if(c&&!t.closest('a,button')){var bb=D.builds[+c.getAttribute('data-b')];location.href=D.site+'/b/'+bb.id+'?src=grid&ref=proclubshq.com'}});

  /* the theme's header button speaks for this page: "Make a Magician" */
  var cta=$('.pq-cta');if(cta&&D.make){cta.textContent=D.make;cta.href=D.site+'/create?ref=proclubshq.com'}

  /* the switcher opens on this archetype, not on the first keeper */
  var sw=$('.cs-sw'),cu=sw&&$('a.cur',sw);
  if(cu)sw.scrollLeft=Math.max(0,cu.offsetLeft-sw.offsetLeft-(sw.clientWidth-cu.offsetWidth)/2);

  /* search: "<archetype> <words>" into the app's Find */
  var f=$('.cs-srch');
  if(f)f.addEventListener('submit',function(){var q=$('input[type=search]',f),h=$('input[name=q]',f);h.value=(D.name.toLowerCase()+' '+q.value).trim();ev('search',{search_term:h.value})});

  /* price list: filter and sort */
  var body=$('#cs-ptab');
  if(body){
    var A=D.A[D.id],rows=[];
    for(var i=0;i<D.K.length;i++)if(A.mn[i]!=null&&A.t[i]>=0)rows.push({i:i,name:D.N[D.K[i]],tier:A.t[i],min:A.mn[i],max:A.mx[i],cost:csCostTo(D,D.id,i,A.mx[i])});
    var filt=-1,sk='cost',dir=-1;
    var draw=function(){
      var r=rows.filter(function(x){return filt<0||x.tier===filt}).sort(function(a,b){return (a[sk]>b[sk]?1:a[sk]<b[sk]?-1:0)*dir||(a.name<b.name?-1:1)});
      body.innerHTML=r.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+csTag(D,x.tier)+'</td><td class="num hm">'+x.min+'</td><td class="num">'+x.max+'</td><td class="num"><b>'+fmt(x.cost)+'</b></td></tr>'}).join('')};
    var seg=$('#cs-seg');
    seg.addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b)return;filt=+b.getAttribute('data-f');$$('.cs-btn',seg).forEach(function(x){x.classList.toggle('on',x===b)});draw()});
    $$('th[data-k]',body.parentNode).forEach(function(th){th.addEventListener('click',function(){var k=th.getAttribute('data-k');dir=sk===k?-dir:(k==='name'||k==='tier'?1:-1);sk=k;draw()})})}

  /* calculator */
  var sel=$('#cs-cattr'),rng=$('#cs-ct');
  if(sel&&rng){
    var calc=function(reset){
      var ix=+sel.value,A=D.A[D.id];rng.min=A.mn[ix];rng.max=A.mx[ix];
      if(reset)rng.value=Math.min(A.mx[ix],Math.max(A.mn[ix],90));
      var to=+rng.value,c=csCalc(D,ix,to);
      $('#cs-ctv').textContent=to;$('#cs-cap').textContent=fmt(c.ap);$('#cs-clast').textContent=c.last?c.last+' AP':'–';
      $('#cs-clv').textContent=c.lvl?'Level '+c.lvl:'Over '+D.cap;$('#cs-ctier').innerHTML=csTag(D,c.t);$('#cs-csteps').innerHTML=csSteps(c,to)};
    sel.addEventListener('change',function(){calc(true)});rng.addEventListener('input',function(){calc(false)})}

  /* level ladder */
  var lad=$('#cs-lad');
  if(lad)lad.addEventListener('click',function(e){var b=e.target.closest('[data-l]');if(!b)return;var n=+b.getAttribute('data-l');
    $$('i',lad).forEach(function(x){x.classList.toggle('sel',x===b)});$('#cs-lvi').innerHTML=csLevel(D,n)});

  /* compare */
  var vs=$('#cs-vsel');
  function drawV(){if(!vs)return;$('#cs-vname').textContent=D.A[vs.value].n;$('#cs-vtab').innerHTML=csCompare(D,D.S,vs.value)}
  if(vs)vs.addEventListener('change',function(){drawV();ev('select_content',{content_type:'compare',item_id:D.id+'-vs-'+vs.value})});

  /* the day's match numbers, when the box has a newer file than the page */
  /* Ghost serves the file with a year's max-age; the 6-hour block in the
     address is what lets a browser see a newer one. */
  var now=new Date(),blk=now.getUTCFullYear()*1000000+(now.getUTCMonth()+1)*10000+now.getUTCDate()*100+Math.floor(now.getUTCHours()/6)*6;
  if(D.statsUrl&&window.fetch)fetch(D.statsUrl+'?d='+blk,{credentials:'omit'}).then(function(r){return r.ok?r.json():null}).then(function(S){
    if(!S||S.v!==1||!S.archetypes||!S.archetypes[D.id])return;
    if(D.S&&!(new Date(S.computedAt)>new Date(D.S.computedAt)))return;
    D.S=S;var p=$('#cs-pitch'),w=$('#cs-prs');
    if(p)p.innerHTML=csPitch(D,S);
    if(w){var h=csPairs(D,S);if(h)w.innerHTML=h}
    drawV()}).catch(function(){});
})();
