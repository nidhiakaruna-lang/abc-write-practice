/* ============ STATE & CANVAS ============ */
const $ = id=>document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
let DPR = 1, CW = 0, CH = 0;
let BOX = {x:0,y:0,w:0,h:0};
let cur = 'A';
let mode = 'trace';          // trace | draw | quiz | case
let strokeIdx = 0, drawn = [], live = [], drawing = false, strokeOK = true, completed = false;
let demo = null;
let sparks = [];             // sparkle particles while tracing
let progress = {};
let streak = 0;
try{ progress = JSON.parse(localStorage.getItem('abcProgress')||'{}'); }catch(e){ progress = {}; }
function saveProgress(){ try{ localStorage.setItem('abcProgress', JSON.stringify(progress)); }catch(e){} }
/* free-draw state */
const COLORS=['#ff5252','#ff9f1c','#ffe03c','#43d17a','#3dc6ff','#3d5bff','#a35cff','#ff7ad9','#8d5a3a','#3b2f5c'];
let pen = {color:'#ff5252', size:16, rainbow:false, stamp:false};
let doodle = [];             // list of {pts,color,size,rainbow} or {stamp:[x,y],emoji}
let hue = 0;
function resize(){
const r = cv.parentElement.getBoundingClientRect();
DPR = Math.min(window.devicePixelRatio||1, 2);
CW = r.width; CH = r.height;
cv.width = Math.round(CW*DPR); cv.height = Math.round(CH*DPR);
ctx.setTransform(DPR,0,0,DPR,0,0);
const h = Math.min(CH*0.70, CW*0.95);
const w = h*0.78;
BOX = {x:(CW-w)/2, y:CH*0.17, w:w, h:h};
if(BOX.y + BOX.h > CH-8){ BOX.h = CH-8-BOX.y; BOX.w = BOX.h*0.78; BOX.x = (CW-BOX.w)/2; }
}
function toPx(p){ return [BOX.x + p[0]/100*BOX.w, BOX.y + p[1]/100*BOX.h]; }
function strokePx(i){ return LETTERS[cur].strokes[i].map(toPx); }
/* ============ GEOMETRY HELPERS ============ */
function dist(a,b){ return Math.hypot(a[0]-b[0], a[1]-b[1]); }
function polyLen(pts){ let s=0; for(let i=1;i<pts.length;i++) s+=dist(pts[i-1],pts[i]); return s; }
function ptSegDist(p,a,b){
const dx=b[0]-a[0], dy=b[1]-a[1]; const l2=dx*dx+dy*dy;
let t = l2? ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2 : 0; t=Math.max(0,Math.min(1,t));
return Math.hypot(p[0]-(a[0]+t*dx), p[1]-(a[1]+t*dy));
}
function distToPoly(p,pts){ let m=1e9; for(let i=1;i<pts.length;i++) m=Math.min(m,ptSegDist(p,pts[i-1],pts[i])); return m; }
function pointAt(pts,frac){
const total=polyLen(pts); let target=total*frac, acc=0;
for(let i=1;i<pts.length;i++){
const d=dist(pts[i-1],pts[i]);
if(acc+d>=target){ const t=d?(target-acc)/d:0; return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]; }
acc+=d;
}
return pts[pts.length-1];
}
function partialPoly(pts,frac){
const total=polyLen(pts), target=total*frac; let acc=0; const out=[pts[0]];
for(let i=1;i<pts.length;i++){
const d=dist(pts[i-1],pts[i]);
if(acc+d>=target){ const t=d?(target-acc)/d:0; out.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]); return out; }
out.push(pts[i]); acc+=d;
}
return out;
}
function coverage(guide, ink){
const n=40; let hit=0; const tol = BOX.h*0.14;
for(let i=0;i<=n;i++){
const g = pointAt(guide,i/n); let ok=false;
for(let j=0;j<ink.length;j++){ if(dist(g,ink[j])<tol){ ok=true; break; } }
if(ok) hit++;
}
return hit/(n+1);
}
function accuracy(guide, ink){
const tol = BOX.h*0.16; let good=0;
for(const p of ink){ if(distToPoly(p,guide)<tol) good++; }
return ink.length? good/ink.length : 0;
}
/* ============ DRAWING THE SCENE ============ */
function drawGuides(){
const top=BOX.y, bot=BOX.y+BOX.h, mid=BOX.y+BOX.h/2;
ctx.save();
ctx.fillStyle='rgba(255,255,255,.65)'; ctx.fillRect(10,top,CW-20,BOX.h);
ctx.fillStyle='rgba(120,200,255,.12)'; ctx.fillRect(10,top,CW-20,BOX.h/2);
ctx.fillStyle='rgba(255,200,120,.12)'; ctx.fillRect(10,mid,CW-20,BOX.h/2);
ctx.lineWidth=3; ctx.setLineDash([12,10]); ctx.strokeStyle='#6fb6f5';
ctx.beginPath(); ctx.moveTo(14,top); ctx.lineTo(CW-14,top); ctx.moveTo(14,mid); ctx.lineTo(CW-14,mid); ctx.stroke();
ctx.setLineDash([]); ctx.strokeStyle='#f27d7d'; ctx.lineWidth=4;
ctx.beginPath(); ctx.moveTo(14,bot); ctx.lineTo(CW-14,bot); ctx.stroke();
ctx.restore();
}
function strokePath(pts){
ctx.beginPath(); pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
}
function drawGhost(){
const L=LETTERS[cur]; const w=Math.max(14,BOX.h*0.11);
ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
L.strokes.forEach((s,i)=>{
const pts=s.map(toPx);
ctx.strokeStyle = i<strokeIdx ? 'rgba(0,0,0,0)' : L.tint;
ctx.lineWidth=w; strokePath(pts); ctx.stroke();
if(i>=strokeIdx){
ctx.setLineDash([2,w*0.9]); ctx.strokeStyle=L.color; ctx.globalAlpha=.35; ctx.lineWidth=4; strokePath(pts); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
}
});
ctx.restore();
}
function drawArrowHead(a,b,size,color){
const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
ctx.save(); ctx.fillStyle=color; ctx.beginPath();
ctx.moveTo(b[0],b[1]);
ctx.lineTo(b[0]-size*Math.cos(ang-0.5), b[1]-size*Math.sin(ang-0.5));
ctx.lineTo(b[0]-size*Math.cos(ang+0.5), b[1]-size*Math.sin(ang+0.5));
ctx.closePath(); ctx.fill(); ctx.restore();
}
function drawStartHint(ts){
if(completed||demo) return;
const pts=strokePx(strokeIdx); const s=pts[0];
const r=BOX.h*0.045 + Math.sin(ts/200)*3;
const a=pointAt(pts,0.10), b=pointAt(pts,0.22);
ctx.save();
drawArrowHead(a,b,BOX.h*0.05,'#1fae5b');
ctx.beginPath(); ctx.arc(s[0],s[1],r*1.7+Math.sin(ts/260)*4,0,Math.PI*2); ctx.fillStyle='rgba(46,196,106,.22)'; ctx.fill();
ctx.beginPath(); ctx.arc(s[0],s[1],r,0,Math.PI*2); ctx.fillStyle='#2ec46a'; ctx.fill();
ctx.lineWidth=4; ctx.strokeStyle='#fff'; ctx.stroke();
ctx.fillStyle='#fff'; ctx.font='900 '+Math.round(r*1.2)+'px "Baloo 2","Comic Sans MS",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
ctx.fillText(String(strokeIdx+1), s[0], s[1]+1);
ctx.restore();
}
/* finished strokes look like candy: thick colour + glossy highlight */
function candyStroke(pts,col,w){
ctx.lineCap='round'; ctx.lineJoin='round';
ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=w+6; ctx.save(); ctx.translate(0,4); strokePath(pts); ctx.stroke(); ctx.restore();
ctx.strokeStyle=col; ctx.lineWidth=w; strokePath(pts); ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=Math.max(3,w*0.22); ctx.save(); ctx.translate(-w*0.15,-w*0.18); strokePath(pts); ctx.stroke(); ctx.restore();
}
function drawInk(){
const col=LETTERS[cur].color; const w=Math.max(14,BOX.h*0.085);
ctx.save();
drawn.forEach(s=>{ if(s.length>1) candyStroke(s,col,w); });
if(live.length>1){
if(strokeOK) candyStroke(live,col,w);
else { ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#ff9a9a'; ctx.lineWidth=w; strokePath(live); ctx.stroke(); }
}
ctx.restore();
}
function drawDemo(ts){
if(!demo) return;
const col=LETTERS[cur].color; const w=Math.max(14,BOX.h*0.085);
const el=(ts-demo.start)/1000;
const dur=Math.max(0.9, polyLen(demo.pts)/BOX.h*1.5);
let f = Math.min(1, Math.max(0, (el-0.5)/dur)); f = f*f*(3-2*f);
ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
for(let i=0;i<demo.idx;i++){ candyStroke(strokePx(i),col,w); }
const part=partialPoly(demo.pts,f);
if(part.length>1) candyStroke(part,col,w);
const tip=part[part.length-1];
if(f>0 && f<1 && Math.random()<.6) addSpark(tip[0],tip[1],col);
ctx.beginPath(); ctx.arc(tip[0],tip[1],w*0.75,0,7); ctx.fillStyle='#fff'; ctx.fill(); ctx.lineWidth=5; ctx.strokeStyle=col; ctx.stroke();
ctx.font=Math.round(w*1.1)+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('\u270F\uFE0F',tip[0]+w*0.3,tip[1]-w*0.3);
const s=demo.pts[0]; ctx.beginPath(); ctx.arc(s[0],s[1],BOX.h*0.04,0,7); ctx.fillStyle='#2ec46a'; ctx.fill();
ctx.fillStyle='#fff'; ctx.font='900 '+Math.round(BOX.h*0.05)+'px sans-serif'; ctx.fillText(String(demo.idx+1),s[0],s[1]+1);
ctx.restore();
if(el>0.5+dur+0.35){
const L=LETTERS[cur];
if(demo.idx+1<L.strokes.length){ demo={idx:demo.idx+1, pts:strokePx(demo.idx+1), start:ts}; }
else { demo=null; resetPractice(); setMsg("Your turn! Start at the green dot"); say("Your turn!"); }
}
}
/* ---- sparkle particles that follow the finger ---- */
const SPARK_COLS=['#ff5252','#ffc93c','#43d17a','#3dc6ff','#a35cff','#ff7ad9','#fff'];
function addSpark(x,y,col){
sparks.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*2.4,vy:(Math.random()-.9)*2.4,
life:0,max:26+Math.random()*16,s:5+Math.random()*7,c:col&&Math.random()<.4?col:SPARK_COLS[Math.floor(Math.random()*SPARK_COLS.length)]});
}
function drawSparks(){
if(!sparks.length) return;
ctx.save();
sparks.forEach(p=>{
p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life++;
const a=1-p.life/p.max; ctx.globalAlpha=Math.max(0,a); ctx.fillStyle=p.c;
const s=p.s*(0.5+a*.7); ctx.beginPath();
ctx.moveTo(p.x,p.y-s); ctx.quadraticCurveTo(p.x,p.y,p.x+s,p.y); ctx.quadraticCurveTo(p.x,p.y,p.x,p.y+s); ctx.quadraticCurveTo(p.x,p.y,p.x-s,p.y); ctx.quadraticCurveTo(p.x,p.y,p.x,p.y-s); ctx.fill();
});
ctx.restore();
sparks=sparks.filter(p=>p.life<p.max);
}
/* ---- free-draw rendering ---- */
function rainbowAt(i){ return 'hsl('+((hue+i*9)%360)+',92%,58%)'; }
function drawStrokeDoodle(d){
if(d.stamp){ ctx.save(); ctx.font=d.size*2.2+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(d.emoji,d.stamp[0],d.stamp[1]); ctx.restore(); return; }
ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=d.size;
if(d.rainbow){
for(let i=1;i<d.pts.length;i++){ ctx.strokeStyle=d.cols[i]||d.cols[d.cols.length-1]; ctx.beginPath(); ctx.moveTo(d.pts[i-1][0],d.pts[i-1][1]); ctx.lineTo(d.pts[i][0],d.pts[i][1]); ctx.stroke(); }
if(d.pts.length===1){ ctx.fillStyle=d.cols[0]; ctx.beginPath(); ctx.arc(d.pts[0][0],d.pts[0][1],d.size/2,0,7); ctx.fill(); }
} else {
ctx.strokeStyle=d.color; ctx.fillStyle=d.color;
if(d.pts.length===1){ ctx.beginPath(); ctx.arc(d.pts[0][0],d.pts[0][1],d.size/2,0,7); ctx.fill(); }
else { strokePath(d.pts); ctx.stroke(); }
}
ctx.restore();
}
function drawDoodle(){
ctx.save(); ctx.globalAlpha=.10; ctx.fillStyle=LETTERS[cur].color; ctx.font='900 '+Math.round(CH*0.7)+'px "Baloo 2","Comic Sans MS",sans-serif';
ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(cur,CW/2,CH*0.48); ctx.restore();
doodle.forEach(drawStrokeDoodle);
if(liveDoodle) drawStrokeDoodle(liveDoodle);
}
let liveDoodle=null;
function frame(ts){
ctx.clearRect(0,0,CW,CH);
if(mode==='draw'){ drawDoodle(); drawSparks(); }
else if(mode==='quiz'){ /* quiz is DOM overlay */ }
else {
drawGuides(); drawGhost(); drawInk(); drawDemo(ts); drawStartHint(ts); drawSparks();
}
requestAnimationFrame(frame);
}
