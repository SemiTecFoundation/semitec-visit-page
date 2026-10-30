/* ==========================================================================
   3D view — "Travel". The Signal journey (from ../VisitPageSignal), wrapped as
   a view of the shared page. Its loops, branches, media boards and dialogs
   behave as before; the header, language, bottom bar and mode switch are
   shared (js/core.js).
   Changes from the original script.js are marked  ▸DUAL
   ========================================================================== */
(function(){
const ST=window.ST;
let on=false;            // ▸DUAL this view is showing
let lift=0;
let power=0;            // ▸DUAL 0…1 brightness of the power-on effect              // ▸DUAL 0 = trace level, 1 = camera risen above the chip (exit / arrival animation)
const sections=SITE_CONTENT.sections;
let timeline=new JourneyTimeline();
let scrollSpace=new ScrollSpace();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const panel=document.querySelector('#reading-panel');
const chapterLinks=document.querySelector('#chapter-links');
const mapDialog=document.querySelector('#route-map');
const mediaDialog=document.querySelector('#media-dialog');
const panelFadeMs=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-fade'))||380;
let language='en',still=reducedMotion.matches,scene=null,animation=0,lastTime=0;
let currentDistance=0,targetDistance=0,active=timeline.locate(0),cardKey='',currentCard=null;
let displayedFrame=null,navigationTarget=null,mediaCounter=0;
let lastScrollMotion=0;
const mediaBoards=[];
const retiredVisits=[],branchEntrances=[];
let currentEntrance=null;
const pick=value=>Array.isArray(value)?value[language==='hy'?1:0]:(value??'');
const text=key=>pick(SITE_CONTENT.ui[key]);
const pathKey=path=>path.join('/');
const labelFor=path=>{const r=resolveRoute(path);return r?pick(r.node.label||r.node.title):'';};
function element(tag,className,value){const e=document.createElement(tag);if(className)e.className=className;if(value!==undefined)e.textContent=value;return e;}
function routeLink(path,label,className=''){
 const a=element('a',className,label);a.href='#'+pathKey(path);
 a.addEventListener('click',event=>{event.preventDefault();if(mapDialog.open)mapDialog.close();navigate(path,{focus:true});});return a;
}
/* ▸DUAL glide: a timed, eased scroll so the camera travels forward along the trace
   (choosing a side path, Continue, Return, the section bar). Any wheel, touch or
   scroll key takes control back immediately. */
let glide=null;
function glideTo(distance){
 const from=scrollY,to=scrollSpace.toPixels(clamp(distance,0,timeline.length)),gap=Math.abs(to-from);
 if(gap<2){window.scrollTo({top:to,behavior:'instant'});return;}
 glide={from,to,start:performance.now(),ms:clamp(700+gap*.32,1100,3200)};
 wake();
}
function stepGlide(){
 if(!glide)return;
 const t=clamp((performance.now()-glide.start)/glide.ms,0,1),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 window.scrollTo({top:Math.round(glide.from+(glide.to-glide.from)*e),behavior:'instant'});
 targetDistance=clamp(scrollSpace.fromPixels(scrollY),0,timeline.length);lastScrollMotion=performance.now();
 if(t>=1)glide=null;
}
function nativeScroll(distance,instant=false){
 const destination=clamp(distance,0,timeline.length);
 if(instant||still){glide=null;window.scrollTo({top:scrollSpace.toPixels(destination),behavior:'instant'});}
 else glideTo(destination);
 // During smooth browser scrolling, scroll events drive the camera. Do not
 // pull the camera toward the final destination before scrolling has begun.
 targetDistance=instant||still?destination:scrollSpace.fromPixels(scrollY);
 if(instant||still)currentDistance=destination;
 wake();
}
/* ▸ENDING after the chip edge the page scrolls on: the camera rises and pulls back, the package closes over
   the chip and the ecosystem modules connect — the same ending as the 2D page (js/ecosystem.js) */
const outroPx=()=>Math.round(innerHeight*3.4);
let eco3d=null,endLift=0,endStage=0,endMap=null,endEl=null,endCur=null,endAnim=null,endFade=null,endShow=0;
function updateTrack(){document.querySelector('#scroll-track').style.height=(scrollSpace.height(timeline.length)+innerHeight+outroPx())+'px';}
function outroAmount(){return clamp((scrollY-scrollSpace.toPixels(timeline.length))/outroPx(),0,1);}
/* four switching points after the chip edge, each a timed animation (the same ending as the 2D page):
   1 the camera rises out to the chip's topology, with every partner's and supporter's name
   2 the chip turns over to its I/O side, every partner's and supporter's name fixed by its contact   3 it shrinks and the package closes over it   4 the ecosystem connects
   The chip here is a chip map of its own (js/chipmap.js), above the board; it fades away under the package lid. */
function ensureEndMap(){
 if(endMap)return;
 endEl=document.createElement('div');endEl.className='end-map';endEl.innerHTML='<div class="chipmap is-bare"></div>';
 document.querySelector('.experience').append(endEl);
 endMap=new ST.ChipMap(endEl.firstElementChild,{onSelect:p=>navigate(p)});
 endMap.setScroll(sections.length-1);endMap.setOutro(1);
}
function updateOutro(dt){
 if(!eco3d)return;
 const e=active.segment.kind==='main'?outroAmount():0,h=.02,at=n=>endStage>=n?h:0;
 const want=e>.68-at(4)?4:e>.45-at(3)?3:e>.22-at(2)?2:e>.04-at(1)?1:0;
 if(want!==endStage){
  ensureEndMap();
  const now=performance.now(),quick=still||ST.state.switching,place=n=>n===0?0:n<=2?1:2;
  if(place(want)!==place(endStage)&&endCur&&endStage>0)endAnim=quick?null:{from:{...endCur},start:now+(want>=3?500:0)};
  const to=want>=1&&want<=2?1:0;
  if(to!==(endFade?endFade.to:endShow>.5?1:0))endFade=quick?null:{from:endShow,to,start:now+(want>=3?500+650+80:endStage===0?450:0),ms:want===1&&endStage===0?600:450};
  if(quick)endShow=to;
  endStage=want;eco3d.setStage(endStage);endMap.setFlip(endStage===2);endMap.setPacking(endStage>=3);
  if(ST.sound)endStage>=3?ST.sound.blip('open'):ST.sound.tick();
 }
 const target=endStage>=1?1:0;
 endLift=still?target:endLift+(target-endLift)*(1-Math.exp(-dt*4.5));
 if(Math.abs(endLift-target)<.002)endLift=target;
 eco3dEl.classList.toggle('is-live',endStage>=1||endLift>.01);
 document.documentElement.classList.toggle('travel-end',endStage>=1);
 if(!endMap)return;
 /* where the chip is: in the middle for the topology and the turn, in the package's place afterwards */
 const tgt=(endStage>=3?eco3d.packMapRect():eco3d.bigRect())||endCur;let r=tgt;
 if(endAnim&&tgt){const t=clamp((performance.now()-endAnim.start)/624,0,1),k=ST.easeInOut(t);r={l:endAnim.from.l+(tgt.l-endAnim.from.l)*k,t:endAnim.from.t+(tgt.t-endAnim.from.t)*k,w:endAnim.from.w+(tgt.w-endAnim.from.w)*k,h:endAnim.from.h+(tgt.h-endAnim.from.h)*k};if(t>=1)endAnim=null;}
 if(endFade){const t=clamp((performance.now()-endFade.start)/endFade.ms,0,1);endShow=endFade.from+(endFade.to-endFade.from)*t;if(t>=1)endFade=null;}
 if(r){endCur=r;Object.assign(endEl.style,{left:r.l.toFixed(1)+'px',top:r.t.toFixed(1)+'px',width:r.w.toFixed(1)+'px',height:r.h.toFixed(1)+'px'});}
 endEl.style.opacity=endShow.toFixed(3);endEl.style.visibility=endShow>.01?'visible':'hidden';
 endEl.style.pointerEvents=endStage>=1&&endStage<=2?'auto':'none';
}
const eco3dEl=document.querySelector('#eco-3d');
/* ▸STORY the opening story before the journey: the same chip and cards as the 2D page (js/story.js).
   While it shows, the wheel, touch and keys move through its steps; the page does not scroll. After the
   last card the chip dives into the journey. Scrolling up at the very start of the journey opens it again. */
const introEl=document.querySelector('#intro-3d');
let introMap=null,introOn=false,introP=0,introT=0,introRoot=null,touchY=null;
const storyLen=()=>introRoot?ST.story.length(introRoot):1;
/* the story, then one more step: the dive, where the chip's topology zooms in and opens into the 3D chip */
const introLen=()=>storyLen()+1;
function renderIntro(){
 introEl.innerHTML=`<div class="intro-board" aria-hidden="true"></div><div class="intro-root story">${ST.story.html('3d')}</div><button type="button" class="story-skip">${ST.esc(text('storySkip'))} →</button>`;
 introRoot=introEl.querySelector('.intro-root');
 const stage=introRoot.querySelector('.choose-stage');stage.innerHTML='<div class="chipmap"></div>';
 introMap=new ST.ChipMap(stage.firstElementChild,{onSelect:p=>{finishIntro(true);navigate(p);}});
 introMap.setLocked(true);introMap.setScroll(0);
}
function openIntro(P){
 if(!introRoot)renderIntro();
 introOn=true;introP=introT=clamp(P,0,introLen());lift=.6;
 introEl.classList.remove('is-leaving');introEl.classList.add('is-on');document.documentElement.classList.add('travel-intro');
 updateIntro(0,true);wake();
}
function finishIntro(quiet){
 if(!introOn)return;introOn=false;ST.state.storyP=null;
 introEl.classList.add('is-leaving');document.documentElement.classList.remove('travel-intro');
 setTimeout(()=>{if(!introOn)introEl.classList.remove('is-on','is-leaving');},650);
 window.scrollTo({top:0,behavior:'instant'});targetDistance=currentDistance=0;
 if(!quiet&&!still&&lift>.01)tweenLift(lift,0,1400,ST.easeOut);else lift=0;
 if(ST.sound)ST.sound.sweep();wake();
}
function updateIntro(dt,force){
 if(!introOn||!introRoot)return;
 introP=still||force?introT:introP+(introT-introP)*(1-Math.exp(-dt*7));
 if(Math.abs(introT-introP)<.0005)introP=introT;
 const S=storyLen(),d=clamp(introP-S,0,1);
 const cr=ST.story.apply(introRoot,Math.min(introP,S),introMap,innerWidth<=900);
 const stage=introRoot.querySelector('.choose-stage');
 Object.assign(stage.style,{left:cr.l.toFixed(1)+'px',top:cr.t.toFixed(1)+'px',width:cr.w.toFixed(1)+'px',height:cr.h.toFixed(1)+'px'});
 /* the dive: the topology grows towards the middle of the screen and fades as the 3D chip comes up close */
 const z=d*d*(3-2*d),zi=Math.pow(d,1.6),rr=introRoot.getBoundingClientRect();
 const dx=(rr.width/2-(cr.l+cr.w/2))*z,dy=(rr.height/2-(cr.t+cr.h/2))*z;
 stage.style.transform=d>0?`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${(1+zi*5).toFixed(3)})`:'';
 stage.style.opacity=d>0?(1-clamp((d-.45)/.5,0,1)).toFixed(3):'';
 const rest=d>0?(1-clamp(d/.3,0,1)).toFixed(3):'';
 introRoot.querySelectorAll('.story-head,.story-cards,.story-hint').forEach(el=>{el.style.opacity=rest;el.style.pointerEvents=d>.2?'none':'';});
 const board=introEl.querySelector('.intro-board');if(board)board.style.opacity=d>0?(1-clamp((d-.15)/.75,0,1)).toFixed(3):'';
 const skip=introEl.querySelector('.story-skip');if(skip)skip.style.opacity=rest;
 introEl.style.pointerEvents=d>.6?'none':'';
 document.documentElement.classList.toggle('travel-intro',d<.85);
 ST.state.storyP=d>0?null:introP;lift=.6*(1-z);
 if(introT>=introLen()-1e-3&&introP>=introLen()-.004&&!force)finishIntro(true);
}
function introMove(steps){
 const L=introLen();
 if(steps>0&&introT>=L-.001&&introP>L-.15){finishIntro(true);return;}
 introT=clamp(introT+steps,0,L);wake();
}
const atJourneyStart=()=>on&&!introOn&&scrollY<=2&&currentDistance<.5&&introRoot!==undefined;
window.addEventListener('wheel',e=>{
 if(!on||ST.state.switching)return;
 if(introOn){e.preventDefault();introMove(e.deltaY/(innerHeight*.6));return;}
 if(e.deltaY<0&&atJourneyStart()&&lift<.05){e.preventDefault();openIntro(introLen()-.02);}
},{passive:false,capture:true});
window.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true,capture:true});
window.addEventListener('touchmove',e=>{
 if(!on||touchY==null)return;const y=e.touches[0].clientY,dy=touchY-y;
 if(introOn){e.preventDefault();touchY=y;introMove(dy/(innerHeight*.55));return;}
 if(dy<-30&&atJourneyStart()){touchY=null;openIntro(introLen()-.02);}
},{passive:false,capture:true});
window.addEventListener('keydown',e=>{
 if(!on||!introOn||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.target.closest&&e.target.closest('input,textarea,select,dialog'))return;
 const fwd=['ArrowDown','PageDown'].includes(e.key)||(e.key===' '&&!e.shiftKey),back=['ArrowUp','PageUp'].includes(e.key)||(e.key===' '&&e.shiftKey);
 if(e.key==='Escape'){e.preventDefault();finishIntro();return;}
 if(!fwd&&!back)return;
 if(e.key===' '&&e.target.closest&&e.target.closest('button,a'))return;
 e.preventDefault();e.stopImmediatePropagation();
 introMove(fwd?Math.floor(introT+1e-3)+1-introT:-(introT-Math.ceil(introT-1e-3)+1));
},{capture:true});
introEl.addEventListener('click',e=>{
 if(e.target.closest('.story-skip,.story-start')){e.preventDefault();if(still)finishIntro();else{introT=introLen();wake();}return;}
 const go=e.target.closest('.sc-go[data-path]');
 if(go){e.preventDefault();e.stopPropagation();finishIntro(true);navigate(go.dataset.path.split('/'));}
},true);

eco3dEl.addEventListener('click',e=>{const top=e.target.closest('[data-top]');if(top){e.preventDefault();navigate(['overview']);}});
function insertVisit(path,distance,instant=false){
 const visit=timeline.insertLoop(path,distance);visit.createdAt=performance.now()-(instant?1000:0);
 if(distance<currentDistance-1e-6){currentDistance+=visit.curve.length;targetDistance+=visit.curve.length;}
 addVisitMedia(visit);updateTrack();return visit;
}
function releaseFinishedBranches(time){
 const physicalPosition=scrollY,nativeTarget=clamp(scrollSpace.fromPixels(physicalPosition),0,timeline.length);
 const released=timeline.pruneInactive(currentDistance,navigationTarget?.path);
 if(!released)return;
 currentDistance=released.distance;
 targetDistance=clamp(released.remap(nativeTarget),0,timeline.length);
 if(navigationTarget)navigationTarget.distance=clamp(released.remap(navigationTarget.distance),0,timeline.length);
 released.removed.forEach(visit=>{visit.retiredAt=time;retiredVisits.push(visit);});
 scrollSpace.holdPosition(physicalPosition,targetDistance);
 updateTrack();
 // Do not call scrollTo here. The browser keeps moving forward through the
 // junction; only its mapping to the shortened itinerary changes.
}
function settleScrollSpace(time){
 if(scrollY>scrollSpace.toPixels(timeline.length)+2)return; // ▸ENDING never pull the reader back out of the ending
 if(Math.abs(scrollSpace.offset)<1e-6||navigationTarget||Math.abs(targetDistance-currentDistance)>.005)return;
 const atStart=currentDistance<.001&&targetDistance===0;
 if(!atStart&&time-lastScrollMotion<JOURNEY_SETTINGS.scrollIdleMs)return;
 // Reclaim the temporary track only after both native motion and camera
 // easing stop. This changes no visible world position or direction.
 scrollSpace.offset=0;updateTrack();
 window.scrollTo({top:scrollSpace.toPixels(targetDistance),behavior:'instant'});lastScrollMotion=time;
}
function navigate(path,{historyMode='push',focus=false,instant=false}={}){
 if(!resolveRoute(path)&&ST.isShowcase(path))path=[path[0]];   // a card on a section's main road: go to that section
 const route=resolveRoute(path);if(!route)return;
 const here=timeline.locate(currentDistance),parent=path.slice(0,-1);
 let destination;
 if(path.length===1){destination=route.index>0?Math.max(0,timeline.mainLocation(route.index)-JOURNEY_SETTINGS.arriveBeforeMiddle):timeline.mainLocation(route.index);} // just past the section's gate, with its paths ahead
 else if(pathKey(here.path)===pathKey(parent)){
  // Insert at the exact displayed camera position, without moving or rebuilding it.
  // ▸DUAL …then travel forward into it, so the turn onto the side path is visible.
  const mid=here.segment.kind==='main'?timeline.mainLocation(route.index)+JOURNEY_SETTINGS.mainBranchAhead:-1;
  const at=mid>currentDistance+1?mid:currentDistance;
  const visit=insertVisit(path,at,instant);
  destination=instant||still?timeline.visitLocation(visit,0):at+Math.min(34,visit.curve.length*.2);
  glide=null;window.scrollTo({top:scrollSpace.toPixels(currentDistance),behavior:'instant'});
  targetDistance=currentDistance;
 }else{
  let visit=timeline.findPath(path);
  if(!visit){
   let at=timeline.mainLocation(route.index);
   for(let depth=2;depth<=path.length;depth++){
    const partial=path.slice(0,depth),existing=timeline.findPath(partial);
    visit=existing||insertVisit(partial,at,instant);
    const reveal=branchRevealAt(resolveRoute(partial).node,partial);
    at=timeline.visitLocation(visit,visit.curve.length*Math.max(.34,reveal+.08));
   }
  }
  destination=timeline.visitLocation(visit,Math.min(6,visit.curve.length*.04));
 }
 const hash='#'+pathKey(path);
 if(historyMode!=='none'&&location.hash!==hash)history[historyMode==='replace'?'replaceState':'pushState'](null,'',hash);
 navigationTarget={path:[...path],distance:destination};
 if(!instant&&Math.abs(currentDistance-here.distance)>.001){
  window.scrollTo({top:scrollSpace.toPixels(currentDistance),behavior:'instant'});
  targetDistance=currentDistance;
 }
 updateTrack();nativeScroll(destination,instant);
 if(focus)panel.focus({preventScroll:true});
}
function returnFromLoop(){
 if(active.segment.kind==='loop'){
  // Move two CSS pixels beyond the seam so browser pixel rounding cannot
  // leave the visitor at 99.99% on the child side of the junction.
  const end=Math.min(timeline.length,timeline.bounds(active.segment.visit.id).end+2/JOURNEY_SETTINGS.pixelsPerUnit);
  navigationTarget={path:active.segment.visit.parentPath,distance:end};nativeScroll(end);
 }else navigate([sections[Math.max(0,active.index-1)].id]);
}
function breadcrumb(path){
 const nav=element('nav','breadcrumbs');nav.setAttribute('aria-label',text('breadcrumb'));
 nav.append(routeLink(['overview'],text('home')));
 if(path[0]!=='overview')for(let i=1;i<=path.length;i++){
  const separator=element('span','', '/');separator.setAttribute('aria-hidden','true');nav.append(separator);
  if(i===path.length){const label=element('span','',labelFor(path));label.setAttribute('aria-current','page');nav.append(label);}
  else nav.append(routeLink(path.slice(0,i),labelFor(path.slice(0,i))));
 }
 return nav;
}
function renderCard(force=false){
 const ready=branchesReady(active);
 const key=pathKey(active.path)+':'+(active.segment.visit?.id||0)+':'+language+':'+ready;
 if(key===cardKey&&!force)return;cardKey=key;
 const route=resolveRoute(active.path),node=route.node,inLoop=active.segment.kind==='loop';
 const card=element('article','section-card');card.append(breadcrumb(active.path));
 const eyebrow=element('div','eyebrow');eyebrow.append(element('span','chapter-number',String(route.index).padStart(2,'0')+(inLoop?'.'+(active.path.length-1):'')),element('span','eyebrow-line'));
 const phase=element('span','',inLoop?text('loop'):route.index?pick(node.label).toUpperCase():text('beginning'));phase.dataset.loopPhase='';eyebrow.append(phase);card.append(eyebrow);
 const title=element('h1');
 if(route.index===0){const lines=pick(node.title).split('\n');title.append(document.createTextNode(lines[0]),document.createElement('br'),element('span','',lines.slice(1).join(' ')));}
 else title.textContent=pick(node.title);
 card.append(title,element('p','panel-intro',pick(node.intro)));
 if(inLoop&&(node.text||[]).length){   // the path's text, in a scrolling area that fits above the buttons
  const more=element('div','panel-more');node.text.forEach(t=>more.append(element('p','panel-text',pick(t))));card.append(more);
 }

 if(inLoop){
  const status=element('div','loop-status');const ring=element('div','loop-ring');ring.setAttribute('role','progressbar');ring.setAttribute('aria-label',text('loopProgress'));ring.setAttribute('aria-valuemin','0');ring.setAttribute('aria-valuemax','100');
  const detail=element('div');detail.append(element('span','',text('back')+labelFor(active.segment.visit.parentPath)),element('small','',text('loopHint')));status.append(ring,detail);card.append(status);
 }
 if(route.children.length&&ready){
  card.append(element('p','route-options-label',text('optional')));const list=element('div','route-options');
  route.children.forEach((child,i)=>{const a=routeLink([...active.path,child.id],'');const symbol=element('span','option-symbol','↺');symbol.setAttribute('aria-hidden','true');a.append(element('span','option-number',String(i+1).padStart(2,'0')),element('span','',pick(child.title)),symbol);list.append(a);});card.append(list);
 }else{
  const list=element('div',route.index===0?'intro-tags':'panel-items');(node.items||[]).forEach(item=>list.append(element(route.index===0?'span':'div',route.index===0?'':'panel-item',pick(item))));card.append(list);
 }
 if((node.links||[]).length){const ls=element('div','panel-links');node.links.forEach(l=>{const inner=l.href[0]==='#',a=element('a','',pick(l.label)+(inner?' →':' ↗'));a.href=l.href;if(!inner){a.target='_blank';a.rel='noopener';}ls.append(a);});card.append(ls);}
 const actions=element('div','panel-actions');
 const primary=element('button','primary-action');primary.type='button';
 primary.append(element('span','',inLoop?text('back')+labelFor(active.segment.visit.parentPath):route.index===0?text('enter'):route.index===sections.length-1?text('restart'):text('next')),element('span','',inLoop?'↺':'↗'));
 primary.addEventListener('click',()=>inLoop?returnFromLoop():navigate([sections[route.index===sections.length-1?0:route.index+1].id]));
 actions.append(primary);
 if(!inLoop){const previous=element('button','previous','←');previous.type='button';previous.disabled=route.index===0;previous.setAttribute('aria-label',text('previous'));previous.addEventListener('click',returnFromLoop);actions.append(previous);}
 card.append(actions,element('p','prototype-note',text('prototype')));
 // Both cards coexist briefly. Only the new card remains interactive/accessibile.
 const old=currentCard;panel.querySelectorAll('.is-leaving').forEach(e=>e.remove());panel.append(card);currentCard=card;updatePanelSize();requestAnimationFrame(updatePanelSize);setTimeout(updatePanelSize,160);setTimeout(updatePanelSize,panelFadeMs+60);
 renderBranchEntrances(route,ready);
 if(old){old.inert=true;old.setAttribute('aria-hidden','true');old.classList.add('is-leaving');old.classList.remove('is-current');setTimeout(()=>old.remove(),panelFadeMs+30);}
 if(still||!old)card.classList.add('is-current');else requestAnimationFrame(()=>card.classList.add('is-current'));
 ST.report(route.index,active.path); // ▸DUAL the shared bottom bar follows this view
 const hint=inLoop?'':route.index===0?text('introHint'):route.index===sections.length-1?text('doneHint'):''; // no hint in the middle sections or inside paths
 document.querySelector('#scroll-hint').textContent=hint;document.body.dataset.cueText=hint?'1':'0';
 document.body.dataset.longCard=String((ready&&route.children.length>4)||(node.items||[]).length>4); // ▸DUAL long cards hide the scroll hint
 document.querySelector('#route-announcement').textContent=active.path.map((_,i)=>labelFor(active.path.slice(0,i+1))).join(' / ');
 if(!navigationTarget)history.replaceState(null,'','#'+pathKey(active.path));
}
function updatePanelSize(){
 if(!currentCard)return;
 /* large screens: "Continue the journey" and "back" always stand at the same place, just above the bottom bar.
    Shorter content leaves a gap above them; longer content gives up height (the path list or the read-more text scroll). */
 const acts=currentCard.querySelector('.panel-actions');
 if(acts&&innerWidth>760){
  const ro=currentCard.querySelector('.route-options'),more=currentCard.querySelector('.panel-more');
  acts.style.paddingTop='';if(ro)ro.style.maxHeight='';if(more)more.style.maxHeight='';
  const nav=document.querySelector('.chapter-nav'),target=(nav?nav.getBoundingClientRect().top:innerHeight)-18,top=panel.getBoundingClientRect().top;
  const bottom=()=>acts.getBoundingClientRect().bottom-(currentCard.getBoundingClientRect().top-top);   // without the card's entrance slide
  let over=bottom()-target;
  if(over>0&&more){more.style.maxHeight=Math.max(80,more.offsetHeight-over)+'px';over=bottom()-target;}
  if(over>0&&ro){ro.style.maxHeight=Math.max(84,ro.offsetHeight-over)+'px';over=bottom()-target;}
  if(over<0)acts.style.paddingTop=(-over)+'px';   // padding, not margin: margins would collapse with the element above
 }
 panel.style.height=currentCard.offsetHeight+'px';
}
/* after a side path returns to the main route, the sign comes back just ahead of the camera, so the
   other paths can be chosen without scrolling back */
let entranceEpoch=0,lastEntranceKind='main';
function renderBranchEntrances(route,ready){
 if(active.segment.kind==='main'&&lastEntranceKind==='loop')entranceEpoch++;
 lastEntranceKind=active.segment.kind;
 const key=pathKey(active.path)+':'+(active.segment.visit?.id||0)+':'+entranceEpoch;
 let entrance=currentEntrance?.key===key?currentEntrance:null;
 if(!route.children.length||!ready){currentEntrance=null;return;}
 if(!entrance){
  const curve=active.segment.curve;
  const distance=active.segment.kind==='main'?timeline.main.distanceAt(active.index/(sections.length-1))+JOURNEY_SETTINGS.mainBranchAhead:curve.length*branchRevealAt(route.node,active.path)+JOURNEY_SETTINGS.branchSignAhead*(active.segment.visit?.scale||1);
  const pose=curve.pose(Math.min(distance,curve.length));
  if(distance>curve.length)pose.point=pose.point.map((v,i)=>v+pose.direction[i]*(distance-curve.length));
  const layer=element('div','branch-entrance');layer.setAttribute('aria-hidden','true');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('branch-wire');svg.setAttribute('aria-hidden','true');
  const wire=document.createElementNS(svg.namespaceURI,'path'),dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('r','3');svg.append(wire,dot);
  const sign=element('nav','branch-sign');layer.append(svg,sign);document.querySelector('#branch-entrances').append(layer);
  entrance={key,layer,sign,svg,wire,dot,pose,alpha:0,side:loopSide([...active.path,'next'])};branchEntrances.push(entrance); // ▸DUAL sign sits on the side the loop will turn
 }
 currentEntrance=entrance;entrance.sign.replaceChildren(element('p','branch-sign-title',text('branchTitle')));entrance.sign.setAttribute('aria-label',text('branchTitle'));
 route.children.forEach(child=>{
  const a=routeLink([...active.path,child.id],'');a.setAttribute('aria-label',text('branchEnter')+pick(child.title));a.append(element('span','',pick(child.title)),element('span','',entrance.side>0?'↰':'↱'));entrance.sign.append(a);
 });
 entrance.width=entrance.sign.offsetWidth;entrance.height=entrance.sign.offsetHeight;
}
function updateBranchEntrances(dt){
 if(!scene)return;
 const mobile=innerWidth<=760,readingRight=panel.getBoundingClientRect().right;
 /* arriving at (or coming back to) a section past its branch point puts the sign behind the camera: it then
    stays a little ahead of the camera until the next gate, so the other paths can be chosen without scrolling back */
 const ce=currentEntrance;
 if(ce&&!ce.seen&&active.segment.kind==='main'&&!navigationTarget){
  const sd=timeline.main.distanceAt(active.index/(sections.length-1)),gate=sd+JOURNEY_SETTINGS.sectionSpacing*.5;
  if(active.curveDistance>sd+JOURNEY_SETTINGS.mainBranchAhead-6&&active.curveDistance<gate-8){ce.follow=true;ce.pose=timeline.main.pose(Math.min(active.curveDistance+20,gate-2));}
 }
 for(let i=branchEntrances.length-1;i>=0;i--){
  const b=branchEntrances[i],r=[-b.pose.direction[2],0,b.pose.direction[0]],left=mobile?.8:JOURNEY_SETTINGS.branchSignLeft;
  const point=[b.pose.point[0]-r[0]*left*b.side,mobile?.45:1.5,b.pose.point[2]-r[2]*left*b.side];
  const p=scene.project(point),foot=scene.project([point[0],.08,point[2]]),start=scene.project([b.pose.point[0],.08,b.pose.point[2]]);
  let alpha=0,scale=p?mobile?.88:clamp(22/p.depth,.66,.95):1;
  if(b===currentEntrance&&p&&p.depth>5&&p.depth<85){
   alpha=clamp((p.depth-5)/7,0,1)*clamp((85-p.depth)/25,0,1);
   if(!mobile)alpha*=clamp(((b.side>0?p.x-b.width*scale:p.x)-readingRight-14)/20,0,1);
   else alpha*=clamp((p.y-b.height*scale-112)/25,0,1);
  }
  alpha*=1-finaleAlpha; // ▸DUAL the finale's partner names take this space
  b.alpha=still?alpha:b.alpha+(alpha-b.alpha)*(1-Math.exp(-dt*10));
  if(b===currentEntrance&&b.alpha>.5&&!navigationTarget&&!b.follow)b.seen=true;
  const visible=b.alpha>.025;
  b.layer.style.opacity=String(b.alpha);b.layer.style.visibility=visible?'visible':'hidden';b.layer.setAttribute('aria-hidden',String(!visible));b.sign.inert=b!==currentEntrance||b.alpha<.3;
  if(p&&visible){
   const anchorX=b.side>0?p.x-b.width*scale:p.x;
   const leftEdge=mobile?clamp(anchorX,12,innerWidth-b.width*scale-12):anchorX;
   b.sign.style.transform=`translate(${leftEdge}px,${p.y-b.height*scale}px) scale(${scale})`;
   b.svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
   if(foot&&start){b.wire.setAttribute('d',`M ${start.x} ${start.y} L ${foot.x} ${foot.y} L ${b.side>0?leftEdge+b.width*scale:leftEdge} ${p.y}`);b.dot.setAttribute('cx',String(start.x));b.dot.setAttribute('cy',String(start.y));}
  }
  if(b!==currentEntrance&&!visible){b.layer.remove();branchEntrances.splice(i,1);}
 }
}
function updateReadouts(){
 const inLoop=active.segment.kind==='loop',progress=inLoop?active.progress:active.pose.t,percent=Math.round(progress*100);
 document.body.dataset.route=pathKey(active.path);document.body.dataset.routeKind=active.segment.kind;
 document.body.dataset.contentStage=branchesReady(active)?'explore':'introduction';
 document.querySelector('#travel-label').textContent=inLoop?text('loopProgress'):text('inside');
 ST.progress(active.pose.t); // ▸DUAL
 document.querySelector('#journey-percent').textContent=String(percent).padStart(3,'0')+'%';document.querySelector('#travel-fill').style.width=percent+'%';
 const ring=currentCard?.querySelector('.loop-ring');if(ring){ring.style.setProperty('--progress',progress);ring.setAttribute('aria-valuenow',percent);currentCard.querySelector('[data-loop-phase]').textContent=progress>.72?text('returning'):text('loop');}
}
function createBoard(mediaId,title,point,visit=null,mobilePoint=point){
 const data=SITE_CONTENT.media[mediaId];if(!data)return;
 const figure=element('figure','media-board');figure.id='visual-'+(++mediaCounter);figure.setAttribute('aria-hidden','true');
 const button=element('button');button.type='button';button.tabIndex=-1;
 const image=element('img');image.src=data.src;image.alt=pick(data.alt);image.decoding='async';
 const caption=element('figcaption');const kicker=element('div','media-kicker',text('mediaType')),heading=element('strong','',pick(title||data.title)),view=element('span','media-view');view.append(element('span','',text('viewImage')),element('span','','↗'));caption.append(kicker,heading,view);button.append(image,caption);figure.append(button);document.querySelector('#scene-media').append(figure);
 button.addEventListener('click',()=>openMedia(mediaId,title));
 mediaBoards.push({figure,button,image,heading,kicker,view,data,title,point,mobilePoint,visit,width:figure.offsetWidth,alpha:0});
}
function addMainMedia(){
 sections.forEach((section,index)=>{
  if(ST.bankFor(section.id))return; // ▸MEMORY the section's memory board takes this place
  const pose=timeline.main.pose(timeline.main.distanceAt(index/(sections.length-1))+23),r=[-pose.direction[2],0,pose.direction[0]];
  createBoard(section.media,section.label,[pose.point[0]+r[0]*8,5.5,pose.point[2]+r[2]*8],null,[pose.point[0]+r[0]*2.2,3.7,pose.point[2]+r[2]*2.2]);
 });
}
/* product boards along a path (e.g. SemiTec Academy): text cards that come one after another after the point
   where a selected path arrives. Clicking one opens it large: details, every picture, and its links. */
function createShow(item,k,n,point,visit,mobilePoint){
 const figure=element('figure','media-board show-board');figure.id='visual-'+(++mediaCounter);figure.setAttribute('aria-hidden','true');
 const card=element('button','sb-card');card.type='button';card.tabIndex=-1;
 const kick=element('span','sb-kicker'),title=element('strong'),intro=element('p','sb-intro'),more=element('span','sb-more');
 const thumbs=element('span','sb-thumbs');
 (item.gallery||(item.media?[item.media]:[])).forEach(id=>{const m=SITE_CONTENT.media[id];if(!m)return;const im=element('img');im.src=m.src;im.alt='';im.decoding='async';thumbs.append(im);});
 card.append(kick,title,intro,thumbs,more);figure.append(card);document.querySelector('#scene-media').append(figure);
 card.addEventListener('pointerenter',()=>figure.classList.add('is-hover'));card.addEventListener('pointerleave',()=>figure.classList.remove('is-hover'));
 card.addEventListener('click',()=>ST.openShowcase(item,k,n));
 const relabel=()=>{kick.textContent=String(k+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');title.textContent=pick(item.title);intro.textContent=pick(item.intro);more.textContent=text('showMore')+' ↗';};
 relabel();
 mediaBoards.push({figure,button:card,point,mobilePoint,visit,width:figure.offsetWidth,alpha:0,relabel});
}
function addVisitMedia(visit){
 const node=resolveRoute(visit.path).node;
 if((node.showcase||[]).length){
  const n=node.showcase.length;
  /* a selected path arrives at min(34, 20% of the loop): the first board stands a little after that point */
  const L=visit.curve.length,from=Math.min(34,L*.2)+26,to=Math.max(from+1,L*.8);
  /* each board stands on the side of the road that the camera sees on its right while approaching it (the loop turns) */
  const rightness=(d,pt)=>{let sum=0;for(const back of [26,18,10]){const c=visit.curve.pose(Math.max(0,d-back)),f=c.direction,rr=[-f[2],0,f[0]],v=[pt[0]-c.point[0],0,pt[2]-c.point[2]],ahead=v[0]*f[0]+v[2]*f[2];sum+=(v[0]*rr[0]+v[2]*rr[2])/Math.max(4,ahead);}return sum;};
  node.showcase.forEach((item,k)=>{
   const d=n>2?[from,L*.64,L*.88][Math.round(k*2/(n-1))]:n>1?from+(to-from)*k/(n-1):from,pose=visit.curve.pose(d),r=[-pose.direction[2],0,pose.direction[0]];
   const at=(sd,o)=>[pose.point[0]+r[0]*o*sd,0,pose.point[2]+r[2]*o*sd];
   const sd=rightness(d,at(1,7))>=rightness(d,at(-1,7))?1:-1,p=at(sd,7),m=at(sd,2.2);
   createShow(item,k,n,[p[0],5.6,p[2]],visit,[m[0],3.7,m[2]]);
  });
  return;
 }
 /* a path without its own cards shows no repeated section picture */
}
function updateMedia(time,dt){
 if(!scene)return;
 const mobile=innerWidth<=760,readingRight=panel.getBoundingClientRect().right;
 for(let i=mediaBoards.length-1;i>=0;i--){
  const board=mediaBoards[i];
  const p=scene.project(mobile?board.mobilePoint:board.point);let alpha=0;
  const scale=p?clamp((mobile?15:24)/p.depth,.27,mobile?.8:1.1):1;
  const belongsHere=board.visit?active.segment.visit?.id===board.visit.id:active.segment.kind==='main';
  const far=board.far||110,near=board.far?4:5;if(belongsHere&&p&&p.depth>near&&p.depth<far&&p.x>innerWidth*(mobile?-.1:.4)&&p.x<innerWidth*1.25&&p.y>(board.far?(mobile?150:60):100)&&p.y<innerHeight*(mobile?(board.far?.5:.4):.72))alpha=clamp((p.depth-near)/(board.far?2.5:14),0,1)*clamp((far-p.depth)/(board.far?4:30),0,1);
  if(p&&!mobile)alpha*=clamp((p.x-board.width*scale/2-readingRight-20)/40,0,1);
  if(board.visit)alpha*=clamp((time-board.visit.createdAt)/650,0,1);
  board.alpha+=(alpha-board.alpha)*(1-Math.exp(-dt*9));
  const visible=board.alpha>.015;
  board.figure.style.visibility=visible?'visible':'hidden';board.figure.style.opacity=String(board.alpha);board.figure.setAttribute('aria-hidden',String(!visible));board.button.tabIndex=board.alpha>.5?0:-1;
  if(visible&&p){board.figure.style.zIndex=String(1000-Math.round(p.depth));board.figure.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%) scale(${scale})`;}
  if(board.visit?.retiredAt!==undefined&&!visible){board.figure.remove();mediaBoards.splice(i,1);}
 }
}
/* ▸DUAL finale labels: partner & supporter names above their bond pads at the end of the journey */
const finaleLayer=document.querySelector('#finale-pads');let finaleAlpha=0,finaleBuilt=false;
function buildFinaleLabels(){
 if(!scene||!scene.finale)return;finaleBuilt=true;
 const partners=SITE_CONTENT.partners||[];
 finaleLayer.innerHTML=`<div class="fp-title"><span class="fp-kicker"></span><strong></strong><small></small></div>`+scene.finale.pads.map((p,k)=>{
  const hi=k%2?' is-high':'';
  if(p.free)return `<a class="fp-pad is-free is-${p.free}${hi}" href="#" data-k="${k}" data-fp-free="${p.free}"><i></i><span></span><em></em></a>`;
  const q=partners.find(x=>x.id===p.id);return q?`<a class="fp-pad is-${q.kind}${hi}" href="#" data-k="${k}" data-fp="${q.id}"><i></i><span></span><em></em></a>`:'';}).join('');
 finaleLayer.addEventListener('click',e=>{
  const f=e.target.closest('[data-fp-free]');if(f){e.preventDefault();navigate(f.dataset.fpFree==='supporter'?['donate']:['support','partner']);return;}
  const a=e.target.closest('[data-fp]');if(!a)return;e.preventDefault();const q=partners.find(x=>x.id===a.dataset.fp);
  if(q.url)window.open(q.url,'_blank','noopener');else navigate(q.kind==='supporter'?['donate']:['people','partners']);});
 textFinale();
}
function textFinale(){
 if(!finaleBuilt)return;const partners=SITE_CONTENT.partners||[];
 finaleLayer.querySelector('.fp-kicker').textContent=text('padsTitle');finaleLayer.querySelector('.fp-title strong').textContent=text('finaleTitle');finaleLayer.querySelector('.fp-title small').textContent=text('padsIntro');
 finaleLayer.querySelectorAll('[data-fp]').forEach(a=>{const q=partners.find(x=>x.id===a.dataset.fp);a.querySelector('span').textContent=pick(q.name);a.querySelector('em').textContent=text(q.kind==='supporter'?'supporterKind':'partnerKind');});
 finaleLayer.querySelectorAll('[data-fp-free]').forEach(a=>{const sup=a.dataset.fpFree==='supporter';a.querySelector('span').textContent='+ '+text(sup?'becomeSupporter':'becomePartner');a.querySelector('em').textContent=text('freePad');});
}
function updateFinale(dt){
 if(!scene||!scene.finale)return;if(!finaleBuilt)buildFinaleLabels();
 const last=sections.length-1,toEnd=timeline.mainLocation(last)-currentDistance;
 const target=active.segment.kind==='main'&&Math.max(lift,endLift)<.05?clamp(1-toEnd/38,0,1):0;
 finaleAlpha=still?target:finaleAlpha+(target-finaleAlpha)*(1-Math.exp(-dt*6));
 finaleLayer.style.opacity=String(finaleAlpha);finaleLayer.style.visibility=finaleAlpha>.02?'visible':'hidden';
 finaleLayer.inert=finaleAlpha<.5;
 if(finaleAlpha<.02)return;
 const t=scene.project(scene.finale.title);const title=finaleLayer.querySelector('.fp-title');
 if(t){title.style.transform=`translate(${t.x}px,${t.y}px) translate(-50%,-100%)`;}
 const readingRight=panel.getBoundingClientRect().right;
 finaleLayer.querySelectorAll('[data-k]').forEach(el=>{const p=scene.finale.pads[+el.dataset.k],q=scene.project(p.point);
  if(q){el.style.transform=`translate(${q.x}px,${q.y}px) translate(-50%,-100%)`;el.style.opacity=innerWidth>760&&q.x-70<readingRight?'.12':'1';}});
}
/* ▸MEMORY labels: upcoming-event posts on the approach to Events, and one board per memory bank
   (gallery, projects, reports) standing after its section's gate */
const eventLayer=document.querySelector('#event-layer');let eventBuilt=false;const layerAlpha=new Map();
function buildEventLabels(){
 if(!scene||!scene.eventsGeo)return;eventBuilt=true;
 const g=scene.eventsGeo;
 eventLayer.innerHTML=g.markers.map(m=>`<div class="ev-tag" data-ev="${m.id}"><i></i><span class="d"></span><span class="t"></span></div>`).join('')+
  g.memories.map(m=>{const b=ST.bank(m.bank),n=ST.memoryItems(m.bank).length;
   return `<div class="mem-board" data-board="${m.bank}" data-bank-color="${b.color||'gold'}"><p class="mb-kicker"></p><strong></strong><div class="mb-bits">${Array.from({length:16},(_,k)=>`<i class="${k<n?'on':''}"></i>`).join('')}</div><button type="button" data-open-memory="${m.bank}"></button></div>`;}).join('');
 textEvents();
}
function textEvents(){
 if(!eventBuilt)return;const ev=ST.events();
 eventLayer.querySelectorAll('[data-ev]').forEach(el=>{const e=ev.upcoming.find(x=>x.id===el.dataset.ev);if(!e)return;el.querySelector('.d').textContent=ST.fmtDate(e.when);el.querySelector('.t').textContent=pick(e.title);});
 eventLayer.querySelectorAll('[data-board]').forEach(el=>{const b=ST.bank(el.dataset.board);
  el.querySelector('.mb-kicker').textContent=`${text('memoryView')} · ${pick(b.title)}`.toUpperCase();
  el.querySelector('strong').textContent=`${ST.memoryItems(b.id).length} ${text('stored')}`;el.querySelector('button').textContent=pick(b.open)+' ↗';});
}
/* the section's name on its gate: crossing a gate is where the reading panel changes to that section */
let gateBuilt=false;const gateLayer=element('div','event-layer gate-layer');gateLayer.setAttribute('aria-hidden','true');eventLayer.after(gateLayer);
function buildGateLabels(){
 if(!scene||!scene.gates)return;gateBuilt=true;
 scene.gates.forEach((g,i)=>{const sec=sections[i+2];if(!sec)return;const el=element('div','gate-name');el.dataset.gate=i;el.append(element('span','gn-num',String(i+2).padStart(2,'0')),element('strong'));gateLayer.append(el);});
 textGates();
}
function textGates(){gateLayer.querySelectorAll('[data-gate]').forEach(el=>{el.querySelector('strong').textContent=pick(sections[+el.dataset.gate+2].label);});}
function updateGates(dt){
 if(!scene||!scene.gates)return;if(!gateBuilt)buildGateLabels();
 const main=active.segment.kind==='main'&&Math.max(lift,endLift)<.05;
 gateLayer.querySelectorAll('[data-gate]').forEach(el=>{
  const g=scene.gates[+el.dataset.gate],q=main?scene.project([g.x,g.y+.5,g.z+.95]):null;
  let target=0;if(q&&q.depth>3&&q.depth<150)target=clamp((q.depth-3)/6,0,1)*clamp((150-q.depth)/40,0,1);
  let a=layerAlpha.get(el)||0;a=still?target:a+(target-a)*(1-Math.exp(-dt*6));layerAlpha.set(el,a);
  if(!q||a<.02){el.style.visibility='hidden';return;}
  el.style.visibility='visible';el.style.opacity=String(a);
  el.style.transform=`translate(${q.x}px,${q.y}px) translate(-50%,-50%) scale(${clamp(26/q.depth,.35,2.2)})`;
 });
}
function updateEvents(dt){
 updateGates(dt);
 if(!scene||!scene.eventsGeo)return;if(!eventBuilt)buildEventLabels();
 const g=scene.eventsGeo,main=active.segment.kind==='main'&&Math.max(lift,endLift)<.05;
 const readingRight=innerWidth>760?panel.getBoundingClientRect().right:0;
 const show=(el,pt,idx)=>{
  const near=Math.abs(currentDistance-timeline.mainLocation(idx)),target=main?clamp(1-(near-30)/18,0,1):0;
  let a=layerAlpha.get(el)||0;a=still?target:a+(target-a)*(1-Math.exp(-dt*6));layerAlpha.set(el,a);
  const q=a>.02?scene.project(pt):null;
  if(!q||q.depth<3){el.style.visibility='hidden';el.style.pointerEvents='none';return;}
  el.style.visibility='visible';el.style.pointerEvents=a>.5?'auto':'none';
  el.style.transform=`translate(${q.x}px,${q.y}px) translate(-50%,-100%) scale(${clamp(22/q.depth,.6,1.1)})`;
  el.style.opacity=String(a*(q.x<readingRight+40?.15:1));
 };
 eventLayer.querySelectorAll('[data-ev]').forEach((el,k)=>show(el,g.markers[k].point,g.site.idx));
 eventLayer.querySelectorAll('[data-board]').forEach((el,k)=>show(el,g.memories[k].point,g.memories[k].idx));
}
function openMedia(id,title){const data=SITE_CONTENT.media[id];document.querySelector('#media-large').src=data.src;document.querySelector('#media-large').alt=pick(data.alt);document.querySelector('#media-title').textContent=pick(title||data.title);document.querySelector('#media-caption').textContent=pick(data.caption);mediaDialog.showModal();}
function buildMap(){
 const tree=document.querySelector('#map-tree');tree.replaceChildren(routeLink(['overview'],'◉ '+text('home'),'map-home'));
 function child(node,path,container){const li=element('li');container.append(li);if(node.children?.length){const details=element('details');details.open=pathKey(active.path).startsWith(pathKey(path));details.append(element('summary','',pick(node.title)),routeLink(path,text('mapOpen')+' ↗','map-enter'));const ul=element('ul');node.children.forEach(n=>child(n,[...path,n.id],ul));details.append(ul);li.append(details);}else li.append(routeLink(path,pick(node.title)));}
 sections.slice(1).forEach((section,i)=>{const details=element('details','map-section');details.open=active.index===i+1;details.append(element('summary','',String(i+1).padStart(2,'0')+' / '+pick(section.label)),routeLink([section.id],text('mapOpen')+' ↗','map-enter'));const ul=element('ul');section.children.forEach(n=>child(n,[section.id,n.id],ul));details.append(ul);tree.append(details);});
}
function setLanguage(lang){ // ▸DUAL brand, bottom bar and [data-ui] are handled by core.js
 language=lang;
 panel.setAttribute('aria-label',text('content'));
 document.querySelector('#map-close').setAttribute('aria-label',text('close'));document.querySelector('#media-close').setAttribute('aria-label',text('close'));
 for(const b of mediaBoards){if(b.relabel){b.relabel();continue;}b.image.alt=pick(b.data.alt);b.heading.textContent=pick(b.title||b.data.title);b.kicker.textContent=text('mediaType');b.view.firstChild.textContent=text('viewImage');}
 updateMotionButton();textFinale();textEvents();textGates();if(eco3d){eco3d.render(eco3dEl);}if(introRoot){const was=introOn,P=introT;introRoot=null;renderIntro();if(was){introOn=false;openIntro(P);}else introEl.classList.remove('is-on');}if(on){renderCard(true);if(mapDialog.open)buildMap();wake();}
}
function updateMotionButton(){const b=document.querySelector('#motion-toggle');b.setAttribute('aria-pressed',String(still));b.setAttribute('aria-label',still?text('resume'):text('pause'));b.querySelector('span').textContent=still?text('motion'):text('still');}
function setStill(value){still=value;document.body.classList.toggle('still-view',still);if(!still)displayedFrame=null;updateMotionButton();wake();}
function readHash(){try{const p=decodeURIComponent(location.hash.slice(1)).split('/').filter(Boolean);return resolveRoute(p)?.path||(ST.isShowcase(p)?[p[0]]:['overview']);}catch{return ['overview'];}}
function frame(time){
 animation=0;stepGlide();const dt=Math.min((time-lastTime)/1000||.016,.05);lastTime=time;
 targetDistance=clamp(targetDistance,0,timeline.length);
 const difference=targetDistance-currentDistance;
 currentDistance=still?targetDistance:Math.abs(difference)<.0005?targetDistance:currentDistance+difference*(1-Math.exp(-dt/JOURNEY_SETTINGS.smoothingSeconds));
 releaseFinishedBranches(time);
 active=timeline.locate(currentDistance);renderCard();updateReadouts();
 if(navigationTarget&&Math.abs(currentDistance-navigationTarget.distance)<1/JOURNEY_SETTINGS.pixelsPerUnit+.01){navigationTarget=null;history.replaceState(null,'','#'+pathKey(active.path));}
 settleScrollSpace(time);
 const distance=currentDistance;
 for(let i=retiredVisits.length-1;i>=0;i--)if(time-retiredVisits[i].retiredAt>500)retiredVisits.splice(i,1);
 const visibleVisits=[...timeline.visits,...retiredVisits];
 /* ▸DUAL power-on: near the power section (CHIP_LAYOUT.power) every trace brightens */
 const powerIndex=sections.findIndex(s=>s.id===CHIP_LAYOUT.power);
 const powerTarget=active.segment.kind!=='main'?0:Math.max(powerIndex>0?clamp(1-Math.abs(distance-timeline.mainLocation(powerIndex))/26,0,1):0,clamp(1-(timeline.mainLocation(sections.length-1)-distance)/30,0,1)); // also lights up at the finale
 const powerBefore=power;
 power+=(powerTarget-power)*(still?1:1-Math.exp(-dt*3));
 if(powerBefore<.6&&power>=.6&&ST.sound)ST.sound.power(); // ▸SOUND the chip powers on
 if(ST.sound)ST.sound.motion(Math.abs(targetDistance-currentDistance)/6+Math.abs(lift-(frame.lastLift??lift))*8);frame.lastLift=lift;
 document.documentElement.style.setProperty('--power',power.toFixed(3));
 updateIntro(dt);
 updateOutro(dt);
 const L=Math.max(lift,endLift);
 const sceneFrame={pose:active.pose,sample:offset=>timeline.locate(clamp(distance+offset,0,timeline.length)).pose,visits:visibleVisits,still,lift:L,power};
 if(!still||!displayedFrame)displayedFrame=sceneFrame;
 if(scene){scene.render({...displayedFrame,visits:visibleVisits,still,lift:L,power},time);updateMedia(time,dt);updateBranchEntrances(dt);updateFinale(dt);updateEvents(dt);}
 if(!still||glide||Math.abs(targetDistance-currentDistance)>.001||Math.abs(scrollSpace.offset)>1e-6)wake();
}
function wake(){if(on&&!animation&&!document.hidden)animation=requestAnimationFrame(frame);}
function fallback(){document.body.classList.add('no-webgl');document.querySelector('#scene-media').hidden=true;document.querySelector('#motion-toggle').hidden=true;}
/* ▸DUAL wiring: bottom bar, brand, language and the "Explore sections" button live in core.js */
document.querySelector('#motion-toggle').addEventListener('click',()=>setStill(!still));reducedMotion.addEventListener('change',e=>setStill(e.matches));
document.querySelector('#map-close').addEventListener('click',()=>mapDialog.close());document.querySelector('#media-close').addEventListener('click',()=>mediaDialog.close());
for(const dialog of [mapDialog,mediaDialog])dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
window.addEventListener('scroll',()=>{if(!on)return;lastScrollMotion=performance.now();targetDistance=clamp(scrollSpace.fromPixels(scrollY),0,timeline.length);wake();},{passive:true});
for(const type of ['wheel','touchstart','touchmove'])window.addEventListener(type,()=>{if(!on)return;glide=null;navigationTarget=null;lastScrollMotion=performance.now();},{passive:true});
window.addEventListener('keydown',e=>{if(on&&glide&&['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key)){glide=null;navigationTarget=null;}});
/* ▸DUAL Space = next stop, Shift+Space = previous stop (buttons and links keep their own Space) */
window.addEventListener('keydown',e=>{
 if(!on||e.key!==' '||e.ctrlKey||e.metaKey||e.altKey||ST.state.switching)return;
 if(e.target.closest&&e.target.closest('button,a,input,textarea,select,summary,dialog,[contenteditable]'))return;
 e.preventDefault();step(e.shiftKey?-1:1);
});
function step(dir){
 if(active.segment.kind==='loop'){
  if(dir>0)returnFromLoop();
  else{const b=timeline.bounds(active.segment.visit.id);navigationTarget=null;nativeScroll(Math.max(0,b.start-2/JOURNEY_SETTINGS.pixelsPerUnit));}
  return;
 }
 const stops=sections.map((_,i)=>timeline.mainLocation(i));
 if(dir>0){const i=stops.findIndex(d=>d>currentDistance+3);if(i>=0)navigate([sections[i].id]);else if(currentDistance<timeline.length-1)nativeScroll(timeline.length);else window.scrollBy({top:innerHeight*.85,behavior:still?'instant':'smooth'});} // ▸ENDING Space continues into the ending
 else{let i=-1;stops.forEach((d,k)=>{if(d<currentDistance-3)i=k;});navigate([sections[Math.max(0,i)].id]);}
}
window.addEventListener('resize',()=>{if(!on)return;scene?.resize();eco3d?.layout();updateTrack();updatePanelSize();mediaBoards.forEach(b=>b.width=b.figure.offsetWidth);branchEntrances.forEach(b=>{b.width=b.sign.offsetWidth;b.height=b.sign.offsetHeight;});wake();});
window.addEventListener('popstate',()=>{if(on)navigate(readHash(),{historyMode:'none'});});
window.addEventListener('hashchange',()=>{if(!on||ST.state.switching||location.hash==='#reading-panel')return;const path=readHash();if(pathKey(path)!==pathKey(active.path)&&!navigationTarget)navigate(path,{historyMode:'none'});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(animation);animation=0;}else{lastTime=0;wake();}});

/* ▸DUAL the WebGL chip is built lazily: on first entry, or quietly when the browser is idle */
let sceneTried=false;
function ensureScene(){
 if(sceneTried)return;sceneTried=true;
 try{scene=new SignalScene(document.querySelector('#chip-scene'),fallback);}catch(error){console.warn('3D view unavailable:',error.message);fallback();}
}
/* ▸DUAL a fresh journey every time the view opens: no loops left over from an earlier visit */
function resetJourney(){
 timeline=new JourneyTimeline();scrollSpace=new ScrollSpace();
 for(let i=mediaBoards.length-1;i>=0;i--)if(mediaBoards[i].visit){mediaBoards[i].figure.remove();mediaBoards.splice(i,1);}
 branchEntrances.splice(0).forEach(b=>b.layer.remove());currentEntrance=null;retiredVisits.length=0;
 navigationTarget=null;cardKey='';currentDistance=targetDistance=0;active=timeline.locate(0);displayedFrame=null;
}
function tweenLift(from,to,ms,ease){lift=from;wake();return ST.tween(ms,t=>{lift=from+(to-from)*t;wake();},ease);}

/* a section's own cards (About): they stand along its road one after another; each shows only while it is
   near (it comes up as you approach and fades once passed), so they never pile up */
function addMainShowcase(){
 sections.forEach((section,index)=>{
  const list=section.showcase||[];if(!list.length||index<1)return;
  const sd=timeline.main.distanceAt(index/(sections.length-1)),gap=JOURNEY_SETTINGS.mainCardGap,n=list.length,from=sd-JOURNEY_SETTINGS.arriveBeforeMiddle+10;
  list.forEach((item,k)=>{
   const pose=timeline.main.pose(from+gap*k),r=[-pose.direction[2],0,pose.direction[0]];
   createShow(item,k,n,[pose.point[0]+r[0]*2.8,3.9,pose.point[2]+r[2]*2.8],null,[pose.point[0]+r[0]*.9,2.3,pose.point[2]+r[2]*.9]);
   mediaBoards.at(-1).far=JOURNEY_SETTINGS.mainCardGap*2.05;
  });
 });
}
addMainShowcase();
setStill(still);
const V=ST.modes['3d']={
 init(){ if('requestIdleCallback' in window)requestIdleCallback(()=>ensureScene(),{timeout:4000});else setTimeout(ensureScene,1500); },
 enter(path,from,end){
  on=true;ensureScene();scene?.resize();resetJourney();
  if(!eco3d)eco3d=ST.makeEco();endLift=0;endStage=0;eco3d.setStage(0);endShow=0;endAnim=endFade=null;if(endEl){endEl.style.opacity='0';endEl.style.visibility='hidden';endMap.setFlip(false);endMap.setPacking(false);}
  setLanguage(ST.state.lang);
  mediaBoards.forEach(b=>b.width=b.figure.offsetWidth);
  updateTrack();
  navigate(path,{historyMode:'replace',instant:true});
  /* ▸STORY the journey opens with the story at the start (or at the reader's step when switching from 2D) */
  const storyAt=!end&&path[0]==='overview'?(from==='2d'?ST.state.storyP:0):null;
  if(storyAt!=null){openIntro(storyAt);if(from==='2d'&&introRoot)introEl.classList.add('is-snap');setTimeout(()=>introEl.classList.remove('is-snap'),100);}
  else if(introOn){introOn=false;introEl.classList.remove('is-on','is-leaving');document.documentElement.classList.remove('travel-intro');}
  if(end){ // ▸ENDING switching views inside the ending: open at the same step of it
   navigationTarget=null;glide=null;currentDistance=targetDistance=timeline.length;active=timeline.locate(currentDistance);
   window.scrollTo({top:scrollSpace.toPixels(timeline.length)+Math.round([0,.12,.33,.56,.85][end]*outroPx()),behavior:'instant'});
   endLift=1;eco3d.snap();
  }
  else if(from&&!still&&!introOn){
   /* arrival: start a little behind the section and above the chip, then glide in */
   if(path.length===1){currentDistance=Math.max(0,currentDistance-16);}
   lift=.55;document.documentElement.classList.add('is-arriving');
  }
  lastTime=performance.now();frame(lastTime);     // draw now, so the view transition captures the 3D frame
 },
 afterEnter(from){
  if(introOn){document.documentElement.classList.remove('is-arriving');wake();return;}
  if(from&&!still)tweenLift(lift,0,1300,ST.easeOut).then(()=>document.documentElement.classList.remove('is-arriving'));
  else{lift=0;document.documentElement.classList.remove('is-arriving');}
  wake();
 },
 beforeLeave(){
  if(mapDialog.open)mapDialog.close();if(mediaDialog.open)mediaDialog.close();
  if(still||endStage||introOn)return Promise.resolve(); // ▸ENDING / ▸STORY the picture stays put: no rise
  document.documentElement.classList.add('is-rising');
  return tweenLift(0,1,800,ST.easeInOut);
 },
 leave(){
  on=false;cancelAnimationFrame(animation);animation=0;lift=0;glide=null;endLift=0;
  introOn=false;introEl.classList.remove('is-on','is-leaving');document.documentElement.classList.remove('travel-intro');
  document.documentElement.classList.remove('is-rising','is-arriving','travel-end');eco3dEl.classList.remove('is-live');if(endEl){endEl.style.visibility='hidden';endMap.setFlip(false);endMap.setPacking(false);}
  if(mapDialog.open)mapDialog.close();if(mediaDialog.open)mediaDialog.close();
 },
 currentPath(){return [...active.path];},
 currentEnd(){return on?endStage:0;},
 isPlain(){return introOn;},
 go(path){
  /* the menu during the opening story: the start goes back to its first step, a section leaves the story and travels there */
  if(introOn){if(pathKey(path)==='overview'){introT=0;wake();return;}finishIntro(true);}
  navigate(path,{focus:false});
 },
 openMap(){buildMap();mapDialog.showModal();},
 onLanguage(lang){setLanguage(lang);}
};
})();
