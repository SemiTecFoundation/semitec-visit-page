/* Run: node validate.cjs — no packages required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({ console });
vm.runInContext(['content.js', 'js/journey.js'].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n') + '\nglobalThis.api={SITE_CONTENT,JOURNEY_SETTINGS,JourneyTimeline,ScrollSpace,branchRevealAt,branchesReady,makeLoopCurve,resolveRoute};', context);
const { SITE_CONTENT, JOURNEY_SETTINGS, JourneyTimeline, ScrollSpace, branchRevealAt, branchesReady, makeLoopCurve, resolveRoute } = context.api;
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
function near(a, b, tolerance = 1e-7) { return Math.hypot(...a.map((v, i) => v - b[i])) < tolerance; }
function poseEqual(a, b, message) {
  check(near(a.point, b.point), message + ': position');
  check(near(a.direction, b.direction), message + ': direction');
}
function bilingual(value, label) {
  check(Array.isArray(value) && value.length === 2 && value.every(s => typeof s === 'string' && s.trim()), label + ' needs English and Armenian');
}
function nodes(children, parent = []) {
  check(new Set(children.map(n => n.id)).size === children.length, 'Unique sibling IDs');
  for (const node of children) {
    const route = [...parent, node.id];
    check(/^[a-z][a-z0-9-]*$/.test(node.id), 'URL-safe ID: ' + route.join('/'));
    check(resolveRoute(route)?.node === node, 'Resolves route ' + route.join('/'));
    bilingual(node.title, route + ' title');
    bilingual(node.intro, route + ' intro');
    if (!parent.length) bilingual(node.label, route + ' label');
    (node.items || []).forEach((item, i) => bilingual(item, route + ' item ' + i));
    check(!!SITE_CONTENT.media[node.media], 'Media exists for ' + route.join('/'));
    if(node.branchAfter!==undefined)check(typeof node.branchAfter==='number'&&node.branchAfter>=0&&node.branchAfter<=.75,'Valid branch reveal fraction');
    if (node.children) nodes(node.children, route);
  }
}
check(SITE_CONTENT.sections[0].id === 'overview', 'Overview must be first');
nodes(SITE_CONTENT.sections);
for (const [key, value] of Object.entries(SITE_CONTENT.ui)) bilingual(value, 'UI ' + key);
for (const [id, media] of Object.entries(SITE_CONTENT.media)) {
  check(fs.existsSync(path.join(__dirname, media.src)), 'Local image exists: ' + id);
  for (const field of ['title', 'caption', 'alt']) bilingual(media[field], id + ' ' + field);
}
const timeline = new JourneyTimeline();
const eventsIndex = SITE_CONTENT.sections.findIndex(s => s.id === 'purpose');   /* a section with a nested path (About → Our values → …) */
const junction = timeline.mainLocation(eventsIndex);
const origin = timeline.locate(junction).pose;
const mainLength = timeline.length;
const loop = timeline.insertLoop(['purpose', 'values'], junction);
poseEqual(loop.curve.pose(0), origin, 'Loop starts at original junction');
const backPose = timeline.main.pose(junction - loop.back);   /* a side path off the main route rejoins it a little before where it left */
check(loop.back > 0, 'Main-route side paths come back a little earlier');
poseEqual(loop.curve.pose(loop.curve.length), backPose, 'Loop closes a little before its junction');
check(Math.abs(timeline.length - mainLength - loop.curve.length - loop.back) < 1e-7, 'Loop adds scroll distance');
check(timeline.locate(junction + 1).path.join('/') === 'purpose/values', 'Scrolling enters the selected loop');
const nestedAt = junction + loop.curve.length * .37;
const nestedOrigin = timeline.locate(nestedAt).pose;
const nested = timeline.insertLoop(['purpose', 'values', 'knowledge'], nestedAt);
poseEqual(nested.curve.pose(nested.curve.length), nestedOrigin, 'Nested loop returns to its own junction');
const nestedEnd = timeline.bounds(nested.id).end;
check(timeline.locate(nestedEnd + .01).path.join('/') === 'purpose/values', 'Scrolling out of nested loop resumes parent');
const loopEnd = timeline.bounds(loop.id).end;
poseEqual(timeline.locate(loopEnd).pose, backPose, 'Parent returns to the main route (before its junction) after nested detour');
check(timeline.locate(loopEnd + .01).segment.kind === 'main', 'Scrolling exits parent loop to main route');
check(timeline.locate(loopEnd - .01).segment.visit.id === loop.id, 'Active loop geometry reaches its return junction');
check(timeline.locate(loopEnd + 30 + loop.back).path[0] === 'focus', 'Main route continues to next section');
check(timeline.locate(timeline.mainLocation(eventsIndex)).segment.kind === 'main', 'Main menu selects About after its loop, not the submenu');
check(timeline.locate(timeline.visitLocation(loop,loop.curve.length*.37)).segment.visit.id === loop.id, 'Parent navigation chooses the parent side of a nested junction');
for (let i = 1; i < timeline.segments.length; i++) {
  const a = timeline.segments[i - 1], b = timeline.segments[i];
  poseEqual(a.curve.pose(a.to), b.curve.pose(b.from), 'Seam ' + i);
}
// Completing a nested visit removes only that child, with no camera jump.
const beforeNestedCleanup=timeline.locate(nestedEnd+.25).pose;
const childCleanup=timeline.pruneInactive(nestedEnd+.25);
check(childCleanup.removed.length===1&&childCleanup.removed[0].id===nested.id,'Completed nested branch is removed');
poseEqual(timeline.locate(childCleanup.distance).pose,beforeNestedCleanup,'Nested cleanup preserves camera pose');
check(timeline.visits.length===1&&timeline.visits[0].id===loop.id,'Parent remains scrollable after child cleanup');
const returnDistance=timeline.bounds(loop.id).end+7;
const beforeParentCleanup=timeline.locate(returnDistance).pose;
const parentCleanup=timeline.pruneInactive(returnDistance);
poseEqual(timeline.locate(parentCleanup.distance).pose,beforeParentCleanup,'Parent cleanup preserves forward overshoot');
check(Math.abs(timeline.length-mainLength)<1e-7,'Main scroll length is restored');
check(timeline.visits.length===0&&timeline.segments.length===1,'Completed branches leave no scroll history');
for(let i=0;i<=100;i++)check(timeline.locate(timeline.length*i/100).segment.kind==='main','Both scrolling directions now visit main route only');
const reopened=timeline.insertLoop(['purpose','values'],junction);
check(reopened.id!==loop.id,'A branch can be entered again by an explicit click');
const backwardPose=timeline.locate(junction-.4).pose;
const backwardCleanup=timeline.pruneInactive(junction-.4);
poseEqual(timeline.locate(backwardCleanup.distance).pose,backwardPose,'Backing out removes branch without a jump');
check(timeline.visits.length===0,'Backing out does not leave a future automatic detour');
// A large scroll can cross several nested returns in a single frame.
const fast=new JourneyTimeline(),outer=fast.insertLoop(['purpose','values'],junction);
fast.insertLoop(['purpose','values','knowledge'],junction+outer.curve.length*.3);
const overshoot=fast.bounds(outer.id).end+12,overshootPose=fast.locate(overshoot).pose;
const fastCleanup=fast.pruneInactive(overshoot);
check(fastCleanup.removed.length===2,'Fast scroll releases parent and nested child together');
poseEqual(fast.locate(fastCleanup.distance).pose,overshootPose,'Fast scroll cleanup preserves main position');
// Explicit map/deep-link navigation may prepare a future branch. Cancelling
// that navigation before arrival must remove it too.
const pending=new JourneyTimeline();pending.insertLoop(['events','past'],junction);
check(pending.pruneInactive(0,['events','past'])===null,'Explicit pending destination is retained');
check(pending.pruneInactive(0).removed.length===1,'Cancelled future branch is removed before scrolling can enter it');
// Headings away from the main axis must also close without a camera snap.
for (const angle of [0, .3, 1.4, 2.8, 4.1]) {
  const start = { point: [17, 0, -29], direction: [Math.sin(angle), 0, -Math.cos(angle)] };
  const curve = makeLoopCurve(start, .72);
  poseEqual(curve.pose(0), start, 'Rotated loop start');
  poseEqual(curve.pose(curve.length), start, 'Rotated loop finish');
  // Small equal distance samples should move nearly the same amount, even at bends.
  const steps = 800, step = curve.length / steps;
  for (let i = 1; i <= steps; i++) {
    const a = curve.pose((i - 1) * step).point, b = curve.pose(i * step).point;
    const actual = Math.hypot(...a.map((v, j) => v - b[j]));
    check(Math.abs(actual / step - 1) < .01, 'Arc-length speed stays within 1%');
  }
}
const ending = new JourneyTimeline();
const endOrigin = ending.locate(ending.length).pose;
const finalLoop = ending.insertLoop(['support', 'contact'], ending.length);
check(ending.locate(ending.length).segment.kind === 'main', 'Loop at page end returns to main endpoint');
poseEqual(ending.locate(ending.length).pose, endOrigin, 'End-of-page loop closure');
check(Math.abs(ending.bounds(finalLoop.id).end + finalLoop.back - ending.length) < 1e-7, 'End loop bounds remain reachable');
const endpointCleanup=ending.pruneInactive(ending.length);
check(ending.visits.length===0,'Final-section loop also leaves no history');
poseEqual(ending.locate(endpointCleanup.distance).pose,endOrigin,'Final cleanup preserves endpoint');
// Keep the physical browser scroll moving forward while removing a loop.
// Rewinding scrollY here used to interrupt wheel/touch momentum at the join.
const moving=new JourneyTimeline(),space=new ScrollSpace();
const movingLoop=moving.insertLoop(['purpose','values'],junction);
const movingNested=moving.insertLoop(['purpose','values','knowledge'],junction+movingLoop.curve.length*.4);
for(const visit of [movingNested,movingLoop]){
  const end=moving.bounds(visit.id).end,displayed=end+.2,target=end+1.5;
  const pixels=space.toPixels(target),oldHeight=space.height(moving.length);
  const incoming=moving.locate(end-.2).pose,after=moving.locate(displayed).pose;
  const forwardStep=after.point.reduce((sum,v,i)=>sum+(v-incoming.point[i])*incoming.direction[i],0);
  check(forwardStep>0,'Loop rejoins in the direction of travel, never in reverse');
  const oldNativeTarget=space.fromPixels(pixels),cleanup=moving.pruneInactive(displayed);
  const newTarget=cleanup.remap(oldNativeTarget);
  space.holdPosition(pixels,newTarget);
  check(Math.abs(space.toPixels(newTarget)-pixels)<=1,'Native scroll coordinate stays fixed during return');
  check(Math.abs(space.height(moving.length)-oldHeight)<=1,'Track does not shrink beneath active scrolling');
  poseEqual(moving.locate(cleanup.distance).pose,after,'Live return keeps camera pose');
  for(let delta=1;delta<=180;delta++)check(space.fromPixels(pixels+delta)>newTarget,'Continuing to scroll moves forward after return');
}
check(moving.visits.length===0,'Both completed branches are removed while scrolling continues');
const restingDistance=moving.mainLocation(eventsIndex)+9,restingPose=moving.locate(restingDistance).pose;
space.offset=0;
poseEqual(moving.locate(restingDistance).pose,restingPose,'Idle track compaction does not move the camera');
check(Math.abs(space.fromPixels(space.toPixels(restingDistance))-restingDistance)<=1/JOURNEY_SETTINGS.pixelsPerUnit,'Idle compaction preserves input position within one CSS pixel');
// Academy must introduce its content before offering third-level navigation.
const academyTimeline=new JourneyTimeline(),academyIndex=SITE_CONTENT.sections.findIndex(s=>s.id==='purpose');
const academyStart=academyTimeline.mainLocation(academyIndex),academy=academyTimeline.insertLoop(['purpose','values'],academyStart);
const reveal=branchRevealAt(resolveRoute(academy.path).node,academy.path)*academy.curve.length;
check(reveal*JOURNEY_SETTINGS.pixelsPerUnit>400,'Academy has a meaningful introductory scroll distance');
check(!branchesReady(academyTimeline.locate(academyStart)),'No level-three choices at Academy entrance');
check(!branchesReady(academyTimeline.locate(academyStart+reveal-.1)),'Choices stay hidden through introductory content');
check(branchesReady(academyTimeline.locate(academyStart+reveal+.1)),'Choices appear after the introduction');
const program=academyTimeline.insertLoop(['purpose','values','knowledge'],academyStart+reveal+2);
const programReturn=academyTimeline.bounds(program.id).end;
const programCleanup=academyTimeline.pruneInactive(programReturn+.1);
check(branchesReady(academyTimeline.locate(programCleanup.distance)),'Returning from a child preserves the parent content stage');
console.log(`Passed ${checks} checks: content, assets, curve speed, forward loop joins, momentum-safe cleanup, staged nested entrances and nested returns.`);

/* VisitPageDual additions: the generated chip-map floorplan must fit the die without overlaps. */
{
  const ctx2 = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, 'js/chiplayout.js'), 'utf8') +
    '\nglobalThis.L=buildChipLayout(SITE_CONTENT.sections,CHIP_LAYOUT);globalThis.C=SITE_CONTENT;globalThis.CFG=CHIP_LAYOUT;', ctx2);
  const { L, C, CFG } = ctx2;
  let extra = 0;
  const ok = (c, m) => { assert.ok(c, m); extra++; };
  ok(!CFG.power || C.sections.some(s => s.id === CFG.power), 'CHIP_LAYOUT.power names an existing section');
  const list = C.sections.slice(1).map(s => [s.id, L.blocks[s.id]]);
  for (const [id, b] of list) {
    ok(b, 'Chip map block for ' + id);
    ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= L.width && b.y + b.h <= L.height, 'Block inside die: ' + id);
    ok(b.w > 120 && b.h > 80, 'Block large enough to read: ' + id);
    const cells = (C.sections.find(s => s.id === id).children || []).length;
    ok(b.kind === 'power' || 66 + Math.ceil(cells / (cells > 4 ? 2 : 1)) * 36 <= b.h, 'Submenu cells fit inside ' + id);   /* more than 4: two columns */
  }
  for (let a = 0; a < list.length; a++) for (let c = a + 1; c < list.length; c++) {
    const [ia, A] = list[a], [ic, B] = list[c];
    ok(A.x + A.w <= B.x || B.x + B.w <= A.x || A.y + A.h <= B.y || B.y + B.h <= A.y, 'No overlap: ' + ia + ' / ' + ic);
  }
  ok(/^M[\d. ]+([HV][\d.]+)+$/.test(L.route), 'Route is a plain M/H/V trace');
  console.log('Passed ' + extra + ' chip-map floorplan checks.');
}
{
  const t = new JourneyTimeline(), i = SITE_CONTENT.sections.findIndex(s => s.id === 'purpose'), at = t.mainLocation(i);
  const a = t.insertLoop(['purpose', 'values'], at);
  const nestedAt = at + a.curve.length * .5, origin = t.locate(nestedAt).pose;
  const b = t.insertLoop(['purpose', 'values', 'knowledge'], nestedAt);
  assert.ok(a.side === 1 && b.side === -1, 'Level 1 turns left, level 2 turns right');
  const mid = b.curve.pose(b.curve.length / 2).point, right = [-origin.direction[2], 0, origin.direction[0]];
  const offset = (mid[0] - origin.point[0]) * right[0] + (mid[2] - origin.point[2]) * right[2];
  assert.ok(offset > 1, 'Level 2 loop bends to the right of its junction');
  poseEqual(b.curve.pose(b.curve.length), origin, 'Right-hand loop still closes at its junction');
  console.log('Passed alternating-side loop checks.');
}

/* VisitPageDual: partners, supporters and contact rows are bilingual */
{
  let n = 0;
  for (const p of SITE_CONTENT.partners || []) { bilingual(p.name, 'partner ' + p.id); assert.ok(['partner', 'supporter'].includes(p.kind), 'Partner kind: ' + p.id); n++; }
  assert.ok(new Set((SITE_CONTENT.partners || []).map(p => p.id)).size === (SITE_CONTENT.partners || []).length, 'Unique partner ids');
  for (const p of SITE_CONTENT.partners || []) assert.ok(p.logo === undefined || typeof p.logo === 'string', 'Partner logo is an image path: ' + p.id);
  for (const r of (SITE_CONTENT.contact || {}).rows || []) { bilingual(r.label, 'contact label'); bilingual(r.value, 'contact value'); n++; }
  console.log('Passed partner and contact checks (' + n + ' entries).');
}
/* VisitPageMemory: events have valid dates and bilingual text */
{
  const list = SITE_CONTENT.events || [];
  for (const e of list) {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(e.date) && !isNaN(new Date(e.date)), 'Event date YYYY-MM-DD: ' + e.id);
    bilingual(e.title, 'event ' + e.id + ' title'); bilingual(e.place, 'event ' + e.id + ' place'); bilingual(e.recap, 'event ' + e.id + ' recap');
    assert.ok(!!SITE_CONTENT.media[e.media], 'Event media exists: ' + e.id);
  }
  assert.ok(new Set(list.map(e => e.id)).size === list.length, 'Unique event ids');
  console.log('Passed event checks (' + list.length + ' events).');
}
/* VisitPageMemory: memory banks and their items */
{
  const banks = SITE_CONTENT.memoryBanks || [], ids = new Set(banks.map(b => b.id));
  for (const b of banks) {
    assert.ok(SITE_CONTENT.sections.some(s => s.id === b.section), 'Bank section exists: ' + b.id);
    bilingual(b.title, 'bank ' + b.id + ' title'); bilingual(b.intro, 'bank ' + b.id + ' intro'); bilingual(b.open, 'bank ' + b.id + ' open');
  }
  for (const m of SITE_CONTENT.memory || []) {
    assert.ok(ids.has(m.bank), 'Memory item bank exists: ' + m.id);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(m.date) && !isNaN(new Date(m.date)), 'Memory date YYYY-MM-DD: ' + m.id);
    bilingual(m.title, 'memory ' + m.id + ' title'); bilingual(m.summary, 'memory ' + m.id + ' summary');
    assert.ok(!!SITE_CONTENT.media[m.media], 'Memory media exists: ' + m.id);
  }
  console.log('Passed memory checks (' + banks.length + ' banks, ' + (SITE_CONTENT.memory || []).length + ' items).');
}
/* the ending: ecosystem modules (2D package → zoom out) */
{
  const list = SITE_CONTENT.ecosystem || [];
  assert.ok(list.length <= 8, 'At most 8 ecosystem modules (the layout has 4 per side)');
  const paths = new Set(); (function walk(nodes, pre) { for (const s of nodes || []) { const p = pre ? pre + '/' + s.id : s.id; paths.add(p); walk(s.children, p); } })(SITE_CONTENT.sections, '');
  for (const m of list) {
    bilingual(m.title, 'ecosystem ' + m.id + ' title'); bilingual(m.note, 'ecosystem ' + m.id + ' note');
    assert.ok(!m.path || paths.has(m.path), 'Ecosystem path exists: ' + m.id);
    assert.ok(['gold', 'teal', 'copper', undefined].includes(m.color), 'Ecosystem colour gold/teal/copper: ' + m.id);
  }
  assert.ok(new Set(list.map(m => m.id)).size === list.length, 'Unique ecosystem ids');
  for (const k of ['endKicker', 'endTitle', 'endText', 'endScroll', 'ecoKicker', 'ecoTitle', 'ecoText', 'ecoFree', 'ecoFreeNote', 'contactUs', 'backTop']) bilingual(SITE_CONTENT.ui[k], 'ui ' + k);
  console.log('Passed ecosystem checks (' + list.length + ' modules).');
}
