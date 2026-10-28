/* ============ POINTER INPUT ============ */
function pos(e){ const r=cv.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; }
cv.addEventListener('pointerdown', e=>{
e.preventDefault(); AudioFX.unlock();
if(mode==='draw'){ startDoodle(e); return; }
if(mode==='quiz') return;
if(completed||demo) return;
const p=pos(e); const guide=strokePx(strokeIdx);
if(dist(p,guide[0]) > BOX.h*0.20){
setMsg("Start at the green dot \u2B07"); AudioFX.boop(); pulseMsg(); mascotSay("Start at the green dot!",'sad'); return;
}
cv.setPointerCapture(e.pointerId);
drawing=true; live=[p]; strokeOK=true; addSpark(p[0],p[1]);
});
cv.addEventListener('pointermove', e=>{
if(mode==='draw'){ moveDoodle(e); return; }
if(!drawing) return; e.preventDefault();
const p=pos(e); const last=live[live.length-1];
if(dist(p,last)<2) return;
live.push(p);
const guide=strokePx(strokeIdx);
strokeOK = distToPoly(p,guide) < BOX.h*0.20;
if(strokeOK){ addSpark(p[0],p[1],LETTERS[cur].color); if(live.length%6===0) AudioFX.sparkle(live.length/6); }
});
function endDraw(e){
if(mode==='draw'){ endDoodle(e); return; }
if(!drawing) return; drawing=false;
const guide=strokePx(strokeIdx);
const cov=coverage(guide,live), acc=accuracy(guide,live);
const endNear = live.length && dist(live[live.length-1], guide[guide.length-1]) < BOX.h*0.24;
if(cov>=0.80 && acc>=0.70 && endNear){
drawn.push(guide.slice());
for(let i=0;i<14;i++){ const q=pointAt(guide,i/13); addSpark(q[0],q[1],LETTERS[cur].color); }
live=[]; AudioFX.pop();
strokeIdx++;
const L=LETTERS[cur];
if(strokeIdx>=L.strokes.length){ finishLetter(); }
else { setMsg("Nice! Now stroke "+(strokeIdx+1)); mascotSay("Nice! Next stroke!",'happy'); }
} else {
live=[]; AudioFX.boop();
if(cov<0.80 && !endNear) setMsg("Keep going to the end of the line!");
else if(acc<0.70) setMsg("Stay on the colour path \u2014 try again!");
else setMsg("Almost! Try once more");
mascotSay(TRY[Math.floor(Math.random()*TRY.length)],'sad');
pulseMsg();
}
}
cv.addEventListener('pointerup', endDraw);
cv.addEventListener('pointercancel', endDraw);
cv.addEventListener('pointerleave', e=>{ if(drawing||doodleDown) endDraw(e); });
/* ============ UI HELPERS ============ */
function setMsg(t){ $('msg').textContent=t; }
function pulseMsg(){ const m=$('msg'); m.animate([{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.12)'},{transform:'translateX(-50%) scale(1)'}],{duration:300}); }
function say(t){ speak(t,0.85,1.3); }
/* mascot friend reacts to what the child does */
let mascotEmoji = MASCOTS[0];
try{ mascotEmoji = localStorage.getItem('abcMascot') || MASCOTS[0]; }catch(e){}
function setMascot(e){
mascotEmoji=e; $('mascot').textContent=e; $('mascot0').textContent=e;
try{ localStorage.setItem('abcMascot',e); }catch(x){}
}
function mascotSay(text,mood){
const m=$('mascot'), b=$('bubble'); b.textContent=text;
m.classList.remove('happy','sad'); void m.offsetWidth; if(mood) m.classList.add(mood);
}
$('mascot').addEventListener('click',()=>{
AudioFX.unlock(); AudioFX.tada();
const i=(MASCOTS.indexOf(mascotEmoji)+1)%MASCOTS.length; setMascot(MASCOTS[i]);
mascotSay("Hi! I'm your new friend!",'happy');
});
$('mascot0').addEventListener('click',()=>{ AudioFX.unlock(); AudioFX.tada(); setMascot(MASCOTS[(MASCOTS.indexOf(mascotEmoji)+1)%MASCOTS.length]); });
/* ============ CONFETTI (emoji + paper) ============ */
const fx=$('fx'), fctx=fx.getContext('2d'); let bits=[], fxRun=false;
function fxResize(){ fx.width=innerWidth; fx.height=innerHeight; }
function confetti(big){
const cols=['#ff6b6b','#ffc93c','#2ec4a6','#4cc3ff','#7a5cff','#ff9ff3'];
const emo=['\u2B50','\uD83C\uDF88','\uD83C\uDF89','\u2728','\uD83C\uDF1F','\uD83D\uDC96'];
const n=big?260:120;
for(let i=0;i<n;i++){
const isE=i%5===0;
bits.push({x:innerWidth/2+(Math.random()-0.5)*(big?innerWidth*.6:160),y:innerHeight*(big?0.7:0.45),vx:(Math.random()-0.5)*(big?22:14),vy:-Math.random()*(big?24:14)-4,
s:6+Math.random()*8,c:cols[i%cols.length],r:Math.random()*6,vr:(Math.random()-0.5)*0.4,life:0,e:isE?emo[i%emo.length]:null});
}
if(!fxRun){ fxRun=true; requestAnimationFrame(fxLoop); }
}
function fxLoop(){
fctx.clearRect(0,0,fx.width,fx.height);
bits.forEach(b=>{ b.vy+=0.45; b.x+=b.vx; b.y+=b.vy; b.r+=b.vr; b.life++;
fctx.save(); fctx.translate(b.x,b.y); fctx.rotate(b.r);
if(b.e){ fctx.font=(b.s*2.4)+'px sans-serif'; fctx.textAlign='center'; fctx.textBaseline='middle'; fctx.fillText(b.e,0,0); }
else { fctx.fillStyle=b.c; fctx.fillRect(-b.s/2,-b.s/4,b.s,b.s/2); }
fctx.restore(); });
bits=bits.filter(b=>b.y<innerHeight+30 && b.life<220);
if(bits.length) requestAnimationFrame(fxLoop); else { fxRun=false; fctx.clearRect(0,0,fx.width,fx.height); }
}
/* ============ THEME: whole page takes the letter's colour ============ */
function applyTheme(){
const L=LETTERS[cur], r=document.documentElement.style;
r.setProperty('--letter',L.color); r.setProperty('--tint',L.tint);
document.querySelector('meta[name=theme-color]').setAttribute('content',L.color);
}
/* ============ LETTER FLOW ============ */
function resetPractice(){ strokeIdx=0; drawn=[]; live=[]; drawing=false; completed=false; sparks=[]; }
function showPicture(reveal){
const L=LETTERS[cur], pic=$('pic'), emo=$('emo');
applyTheme();
if(reveal){
emo.textContent=L.emoji; emo.classList.remove('hid');
pic.classList.remove('pop'); void pic.offsetWidth; pic.classList.add('pop');
$('word').textContent=cur+' for '+L.word; $('hint').textContent='';
} else {
pic.classList.remove('pop'); emo.textContent='?'; emo.classList.add('hid');
$('word').textContent=''; $('hint').textContent='Finish the letter to see the picture!';
}
}
$('pic').addEventListener('click',()=>{
AudioFX.unlock(); const L=LETTERS[cur];
if(!$('emo').classList.contains('hid')){ speak(cur+' for '+L.word,0.8,1.3); mascotSay(cur+' for '+L.word+'!','happy'); }
else { speak(cur,0.8,1.3); }
});
function finishLetter(){
completed=true;
const L=LETTERS[cur];
setMsg(cur+" is complete!");
showPicture(true);
AudioFX.applause(); confetti();
const ch=$('cheer'); ch.textContent=PRAISE[Math.floor(Math.random()*PRAISE.length)];
ch.classList.remove('on'); void ch.offsetWidth; ch.classList.add('on');
mascotSay("You wrote "+cur+"! Hooray!",'happy');
streak++; $('streak').textContent=streak;
const isNew=!progress[cur];
if(isNew){ progress[cur]=true; saveProgress(); }
updateStrip();
setTimeout(()=>speak(cur+' for '+L.word,0.8,1.3),500);
setTimeout(()=>{ if(completed) setMsg(cur+" for "+L.word+" \u2014 tap Next \u25B6"); }, 2200);
if(isNew && Object.keys(progress).length===26){ setTimeout(winGame,2600); }
}
function winGame(){
AudioFX.win(); setTimeout(()=>AudioFX.applause(true),500); confetti(true);
setTimeout(()=>confetti(true),700); setTimeout(()=>confetti(true),1400);
$('win').classList.remove('hidden');
}
$('winX').addEventListener('click',()=>$('win').classList.add('hidden'));
function selectLetter(l){
try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
cur=l; demo=null; resetPractice(); showPicture(false);
if(mode==='draw'){ doodle=[]; liveDoodle=null; setMsg("Draw anything you like!"); }
else if(mode==='quiz'){ newQuiz(); }
else setMsg("Write the letter "+l+" \u2014 start at the green dot");
updateStrip();
const chip=document.querySelector('.chip.cur'); if(chip&&chip.scrollIntoView) chip.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
}
function updateStrip(){
document.querySelectorAll('.chip').forEach(c=>{
const l=c.dataset.l; c.classList.toggle('cur', l===cur); c.classList.toggle('done', !!progress[l]);
});
const n=Object.keys(progress).length;
$('starCount').textContent=n;
const pct=Math.round(n/26*100);
$('progFill').style.width=Math.max(pct,n?4:0)+'%'; $('progTxt').textContent=pct+'% of the alphabet';
}
function buildStrip(){
const s=$('strip'); s.innerHTML='';
ORDER.forEach(l=>{
const b=document.createElement('button'); b.className='chip'; b.textContent=l; b.dataset.l=l;
b.style.setProperty('--cc',LETTERS[l].color);
b.addEventListener('click',()=>{ AudioFX.unlock(); AudioFX.click(); selectLetter(l); });
s.appendChild(b);
});
}
function showMe(){
AudioFX.unlock(); AudioFX.click();
if(mode!=='trace' && mode!=='case'){ setMode('trace'); }
resetPractice(); showPicture(false);
setMsg("Watch the pen \u270F\uFE0F"); mascotSay("Watch me first!",'happy');
demo={idx:0, pts:strokePx(0), start:performance.now()};
}
