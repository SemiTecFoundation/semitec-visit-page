/* Navigation geometry and timeline. Content belongs in content.js. */
const JOURNEY_SETTINGS = Object.freeze({
  sectionSpacing: 44,
  initialZ: 52,
  pixelsPerUnit: 30,        // ▸DUAL was 18: higher = slower travel per scroll
  smoothingSeconds: 0.2,     // ▸DUAL was 0.13: softer camera easing
  loopWidth: 55,
  loopDepth: 23,
  nestedLoopScale: 0.72,
  cameraHeight: 3.15,
  fieldOfView: 62,
  lookAhead: 18,
  branchSignAhead: 20,
  mainBranchAhead: -4,      // on the main route the paths branch off around the middle of a section, between its gates (0 = the exact middle)
  arriveBeforeMiddle: 18,   // choosing a section arrives just past its gate (the gate is half a section spacing before the middle)
  branchSignLeft: 2.8,
  nestedBranchReveal: 0.24,
  scrollIdleMs: 240,
  maxPixelRatio: 1.5
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function chipPath(z){return Math.sin((z-20)*.025)*4.4+Math.sin(z*.009)*2;}
function chipSlope(z){return Math.cos((z-20)*.025)*.11+Math.cos(z*.009)*.018;}
function unit(v){const n=Math.hypot(...v)||1;return v.map(x=>x/n);}
function resolveRoute(path){
  const sections=SITE_CONTENT.sections;
  if(!path.length||path[0]==='overview')return {index:0,path:['overview'],node:sections[0],children:[]};
  const index=sections.findIndex(s=>s.id===path[0]);if(index<1)return null;
  let node=sections[index];
  for(const id of path.slice(1)){node=node.children?.find(child=>child.id===id);if(!node)return null;}
  return {index,path:[...path],node,children:node.children||[]};
}
function branchRevealAt(node,path){return path.length<2?0:clamp(node.branchAfter??JOURNEY_SETTINGS.nestedBranchReveal,0,.75);}
function branchesReady(location){const route=resolveRoute(location.path);return location.segment.kind==='main'||location.progress>=branchRevealAt(route.node,location.path);}
/* Keep native scrolling monotonic during a loop return. Logical itinerary
   cleanup must not rewind an active wheel/touch scroll or its momentum. */
class ScrollSpace {
  constructor(){this.offset=0;}
  fromPixels(pixels){return pixels/JOURNEY_SETTINGS.pixelsPerUnit-this.offset;}
  toPixels(distance){return Math.ceil((distance+this.offset)*JOURNEY_SETTINGS.pixelsPerUnit);}
  height(length){return Math.ceil((length+this.offset)*JOURNEY_SETTINGS.pixelsPerUnit);}
  holdPosition(pixels,distance){this.offset=pixels/JOURNEY_SETTINGS.pixelsPerUnit-distance;}
}
/* Arc length lookup keeps speed consistent through straight lines and curves. */
class Curve {
  constructor(point,tangent,samples=900){
    this.point=point;this.tangent=tangent;this.table=[0];let previous=point(0),distance=0;
    for(let i=1;i<=samples;i++){const p=point(i/samples);distance+=Math.hypot(...p.map((v,j)=>v-previous[j]));this.table.push(distance);previous=p;}
    this.length=distance;this.samples=samples;
  }
  parameter(distance){
    distance=clamp(distance,0,this.length);let lo=0,hi=this.samples;
    while(lo+1<hi){const mid=(lo+hi)>>1;if(this.table[mid]<=distance)lo=mid;else hi=mid;}
    return (lo+(distance-this.table[lo])/(this.table[hi]-this.table[lo]||1))/this.samples;
  }
  pose(distance){const t=this.parameter(distance);return {point:this.point(t),direction:unit(this.tangent(t)),t};}
  distanceAt(t){const f=clamp(t,0,1)*this.samples,i=Math.floor(f);return this.table[i]+((this.table[i+1]??this.table[i])-this.table[i])*(f-i);}
}
function makeMainCurve(){
  const span=(SITE_CONTENT.sections.length-1)*JOURNEY_SETTINGS.sectionSpacing;
  return new Curve(t=>{const z=JOURNEY_SETTINGS.initialZ-t*span;return [chipPath(z),0,z];},t=>{const z=JOURNEY_SETTINGS.initialZ-t*span;return [-chipSlope(z),0,-1];},1400);
}
function localLoopPoint(t,width=JOURNEY_SETTINGS.loopWidth,depth=JOURNEY_SETTINGS.loopDepth){
  if(t<=0||t>=1)return [0,0,0];const angle=t*Math.PI*2;
  return [-width*Math.pow((1-Math.cos(angle))/2,2),0,-depth*Math.sin(angle)];
}
function localLoopTangent(t,width=JOURNEY_SETTINGS.loopWidth,depth=JOURNEY_SETTINGS.loopDepth){
  const angle=t*Math.PI*2;
  return unit([-width*.5*(1-Math.cos(angle))*Math.sin(angle),0,-depth*Math.cos(angle)]);
}
/* ▸DUAL loops alternate sides by depth: level 1 turns left, level 2 right, level 3 left…
   side = +1 keeps the original (left) shape, −1 mirrors it to the right. */
function loopSide(path){return (path.length-1)%2===1?1:-1;}
function makeLoopCurve(origin,scale=1,side=1){
  const forward=unit(origin.direction),right=[-forward[2],0,forward[0]];
  const world=v=>v.map((_,i)=>right[i]*v[0]*side-forward[i]*v[2]);
  const width=JOURNEY_SETTINGS.loopWidth*scale,depth=JOURNEY_SETTINGS.loopDepth*scale;
  const curve=new Curve(t=>world(localLoopPoint(t,width,depth)).map((v,i)=>v+origin.point[i]),t=>world(localLoopTangent(t,width,depth)));
  curve.origin=origin;curve.scale=scale;curve.side=side;return curve;
}
class JourneyTimeline {
  constructor(){this.main=makeMainCurve();this.segments=[{kind:'main',curve:this.main,from:0,to:this.main.length}];this.visits=[];this.nextId=1;this.reindex();}
  reindex(){let sum=0;for(const segment of this.segments){segment.start=sum;sum+=segment.to-segment.from;segment.end=sum;}this.length=sum;}
  locate(distance){
    distance=clamp(distance,0,this.length);
    const segment=this.segments.find(s=>distance<s.end-1e-7)||this.segments.at(-1);
    const curveDistance=segment.from+clamp(distance-segment.start,0,segment.to-segment.from),pose=segment.curve.pose(curveDistance);
    const index=segment.kind==='main'?Math.round(pose.t*(SITE_CONTENT.sections.length-1)):resolveRoute(segment.visit.path).index;
    return {segment,curveDistance,pose,index,path:segment.kind==='main'?[SITE_CONTENT.sections[index].id]:segment.visit.path,progress:curveDistance/segment.curve.length,distance};
  }
  insertLoop(path,distance){
    if(!resolveRoute(path)||path.length<2)throw new Error('A valid submenu path is required.');
    const at=this.locate(distance),segment=at.segment,cut=at.curveDistance,index=this.segments.indexOf(segment);
    const scale=Math.pow(JOURNEY_SETTINGS.nestedLoopScale,path.length-2);
    const side=loopSide(path);
    const visit={id:this.nextId++,path:[...path],parentPath:[...at.path],parentVisit:segment.visit?.id??null,origin:at.pose,scale,side,curve:makeLoopCurve(at.pose,scale,side),createdAt:0};
    const replacement=[];
    if(cut-segment.from>1e-7)replacement.push({...segment,to:cut});
    replacement.push({kind:'loop',curve:visit.curve,from:0,to:visit.curve.length,visit});
    replacement.push({...segment,from:cut});
    this.segments.splice(index,1,...replacement);this.visits.push(visit);this.reindex();return visit;
  }
  mainLocation(index){
    const d=this.main.distanceAt(clamp(index,0,SITE_CONTENT.sections.length-1)/(SITE_CONTENT.sections.length-1));
    // At a junction, choose the resumed main route, beyond any inserted loop.
    const segment=[...this.segments].reverse().find(s=>s.kind==='main'&&d>=s.from-1e-7&&d<=s.to+1e-7);
    return segment?segment.start+d-segment.from:this.length;
  }
  visitLocation(visit,distance){
    const d=clamp(distance,0,visit.curve.length);
    const segment=[...this.segments].reverse().find(s=>s.visit?.id===visit.id&&d>=s.from-1e-7&&d<=s.to+1e-7);
    return segment?segment.start+d-segment.from:this.length;
  }
  bounds(visitId){const matches=this.segments.filter(s=>s.visit?.id===visitId);return matches.length?{start:matches[0].start,end:matches.at(-1).end}:null;}
  findPath(path){return [...this.visits].reverse().find(v=>v.path.join('/')===path.join('/'));}
  pruneInactive(distance,retainedPath=null){
    // A loop exists only while visiting it (or explicitly navigating to it).
    // Ancestors stay alive while a nested child is being explored.
    const keep=new Set();let visit=this.locate(distance).segment.visit;
    while(visit){keep.add(visit.id);visit=this.visits.find(v=>v.id===visit.parentVisit);}
    if(retainedPath)for(const v of this.visits){
      if(v.path.every((id,i)=>retainedPath[i]===id))keep.add(v.id);
    }
    const removed=this.visits.filter(v=>!keep.has(v.id));if(!removed.length)return null;
    const ids=new Set(removed.map(v=>v.id));
    const ranges=this.segments.filter(s=>ids.has(s.visit?.id)).map(s=>({start:s.start,end:s.end}));
    // Rebase every scroll coordinate, preserving the exact world pose and any
    // forward overshoot beyond the return junction.
    const remap=value=>value-ranges.reduce((sum,r)=>sum+clamp(value-r.start,0,r.end-r.start),0);
    const remaining=[];
    for(const segment of this.segments){
      if(ids.has(segment.visit?.id))continue;
      const previous=remaining.at(-1);
      if(previous&&previous.curve===segment.curve&&Math.abs(previous.to-segment.from)<1e-7)previous.to=segment.to;
      else remaining.push({...segment});
    }
    this.segments=remaining;this.visits=this.visits.filter(v=>keep.has(v.id));this.reindex();
    return {removed,remap,distance:clamp(remap(distance),0,this.length)};
  }
}
