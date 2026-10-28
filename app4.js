/* ============ STICKER BOOK ============ */
function levelFor(n){ let t=LEVELS[0][1]; for(const [k,name] of LEVELS){ if(n>=k) t=name; } return t; }
function openBook(){
const n=Object.keys(progress).length;
$('level').innerHTML='Level: <b>'+levelFor(n)+'</b> &nbsp;\u2022&nbsp; '+n+' of 26 stickers';
const g=$('stickers'); g.innerHTML='';
ORDER.forEach(l=>{
const d=document.createElement('div'); const got=!!progress[l];
d.className='stk '+(got?'got':'lockd');
if(got) d.style.setProperty('--bg',LETTERS[l].tint);
d.innerHTML=(got?STICKERS[l]:'\uD83D\uDD12')+'<small>'+l+'</small>';
if(got) d.addEventListener('click',()=>{ speak(l+' for '+LETTERS[l].word,0.8,1.3); });
g.appendChild(d);
});
$('book').classList.remove('hidden'); AudioFX.unlock(); AudioFX.tada();
}
$('bStick').addEventListener('click',openBook);
$('bookX').addEventListener('click',()=>$('book').classList.add('hidden'));
$('book').addEventListener('click',e=>{ if(e.target.id==='book') $('book').classList.add('hidden'); });
$('resetBtn').addEventListener('click',()=>{
if(confirm('Start over and clear all stickers?')){ progress={}; saveProgress(); streak=0; $('streak').textContent=0; updateStrip(); openBook(); }
});
/* ============ MUTE ============ */
function paintMute(){ $('bMute').innerHTML=AudioFX.isMuted()?'&#128263;':'&#128266;'; }
$('bMute').addEventListener('click',()=>{ AudioFX.unlock(); AudioFX.setMuted(!AudioFX.isMuted()); try{speechSynthesis.cancel();}catch(e){} paintMute(); AudioFX.click(); });
/* ============ MODES ============ */
function setMode(m){
mode=m; demo=null; drawing=false; doodleDown=false; liveDoodle=null;
document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
$('tools').classList.toggle('hidden', m!=='draw');
$('quiz').classList.toggle('hidden', m!=='quiz');
$('msg').classList.toggle('hidden', m==='quiz');
resetPractice(); showPicture(false);
if(m==='trace'){ setMsg("Write the letter "+cur+" \u2014 start at the green dot"); mascotSay("Let's trace!",'happy'); }
else if(m==='draw'){ doodle=[]; setMsg("Draw anything you like! \uD83C\uDFA8"); mascotSay("Let's draw!",'happy'); }
else if(m==='quiz'){ mascotSay("Quiz time!",'happy'); newQuiz(); }
else if(m==='case'){ setMsg("Big and small: "+cur+" "+cur.toLowerCase()); mascotSay("Big "+cur+" and small "+cur.toLowerCase()+"!",'happy'); }
}
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>{ AudioFX.unlock(); AudioFX.click(); setMode(b.dataset.m); if(b.dataset.m==='case') showCase(); }));
/* ---------- Aa: big and small letter side by side ---------- */
function showCase(){
setMsg("Trace the BIG "+cur+" \u2014 then meet small "+cur.toLowerCase());
}
const _finish=finishLetter;
finishLetter=function(){
_finish();
if(mode==='case'){
setTimeout(()=>{ setMsg(cur+" "+cur.toLowerCase()+"  \u2014 big and small!"); speak("Big "+cur+", small "+cur.toLowerCase(),0.8,1.3);
$('hint').textContent=''; $('word').innerHTML=cur+' <span style="font-size:1.3em">'+cur.toLowerCase()+'</span> for '+LETTERS[cur].word; },1200);
}
};
/* ---------- FREE DRAW ---------- */
let doodleDown=false;
function buildPalette(){
const p=$('palette'); p.innerHTML='';
COLORS.forEach(c=>{
const b=document.createElement('button'); b.className='sw'+(c===pen.color&&!pen.rainbow?' on':''); b.style.background=c; b.dataset.c=c;
b.addEventListener('click',()=>{ pen.color=c; pen.rainbow=false; pen.stamp=false; paintTools(); AudioFX.click(); });
p.appendChild(b);
});
}
function paintTools(){
document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b.dataset.c===pen.color&&!pen.rainbow&&!pen.stamp));
document.querySelectorAll('.sz').forEach(b=>b.classList.toggle('on',+b.dataset.s===pen.size));
$('tRainbow').classList.toggle('on',pen.rainbow); $('tStamp').classList.toggle('on',pen.stamp);
}
document.querySelectorAll('.sz').forEach(b=>b.addEventListener('click',()=>{ pen.size=+b.dataset.s; paintTools(); AudioFX.click(); }));
$('tRainbow').addEventListener('click',()=>{ pen.rainbow=!pen.rainbow; pen.stamp=false; paintTools(); AudioFX.tada(); });
$('tStamp').addEventListener('click',()=>{ pen.stamp=!pen.stamp; pen.rainbow=false; paintTools(); AudioFX.tada(); });
$('tUndo').addEventListener('click',()=>{ doodle.pop(); AudioFX.click(); });
$('tWipe').addEventListener('click',()=>{ doodle=[]; AudioFX.boop(); setMsg("Fresh page! Draw again \uD83C\uDFA8"); });
const STAMPS=['\u2B50','\u2764\uFE0F','\uD83C\uDF38','\uD83E\uDD8B','\uD83C\uDF08','\uD83D\uDC1E','\uD83C\uDF1F'];
function startDoodle(e){
const p=pos(e);
doodleDown=true; cv.setPointerCapture(e.pointerId);
if(pen.stamp){
const em=STAMPS[Math.floor(Math.random()*STAMPS.length)];
doodle.push({stamp:p,emoji:em,size:pen.size}); AudioFX.pop();
for(let i=0;i<8;i++) addSpark(p[0],p[1]);
doodleDown=false; return;
}
liveDoodle={pts:[p],color:pen.color,size:pen.size,rainbow:pen.rainbow,cols:[rainbowAt(0)]};
hue=(hue+30)%360;
}
function moveDoodle(e){
if(!doodleDown||!liveDoodle) return; e.preventDefault();
const p=pos(e), last=liveDoodle.pts[liveDoodle.pts.length-1];
if(dist(p,last)<2) return;
liveDoodle.pts.push(p); hue=(hue+4)%360; liveDoodle.cols.push(rainbowAt(0));
if(liveDoodle.rainbow || Math.random()<.3) addSpark(p[0],p[1],liveDoodle.rainbow?null:liveDoodle.color);
if(liveDoodle.pts.length%8===0) AudioFX.sparkle(liveDoodle.pts.length/8);
}
function endDoodle(e){
if(!doodleDown) return; doodleDown=false;
if(liveDoodle){ doodle.push(liveDoodle); liveDoodle=null; }
}
/* ---------- QUIZ: which letter does this picture start with? ---------- */
let quizAns='A', quizLock=false, quizScore=0;
function newQuiz(){
quizLock=false;
const pool=ORDER.filter(l=>!progress[l]); const src=pool.length&&Math.random()<.6?pool:ORDER;
quizAns=src[Math.floor(Math.random()*src.length)]; cur=quizAns; applyTheme();
const opts=[quizAns]; while(opts.length<3){ const r=ORDER[Math.floor(Math.random()*26)]; if(!opts.includes(r)) opts.push(r); }
opts.sort(()=>Math.random()-.5);
const q=$('qPic'); q.textContent=LETTERS[quizAns].emoji; q.style.animation='none'; void q.offsetWidth; q.style.animation='';
$('qAsk').textContent='What letter does "'+LETTERS[quizAns].word+'" start with?';
const o=$('qOpts'); o.innerHTML='';
opts.forEach(l=>{
const b=document.createElement('button'); b.className='q-opt'; b.textContent=l; b.style.background=LETTERS[l].color;
b.addEventListener('click',()=>pickQuiz(b,l)); o.appendChild(b);
});
updateStrip(); setTimeout(()=>speak(LETTERS[quizAns].word,0.8,1.3),300);
}
function pickQuiz(btn,l){
if(quizLock) return; AudioFX.unlock();
if(l===quizAns){
quizLock=true; btn.classList.add('right'); AudioFX.applause(); confetti(); quizScore++;
mascotSay("Yes! "+quizAns+" for "+LETTERS[quizAns].word+"!",'happy'); speak(quizAns+' for '+LETTERS[quizAns].word,0.8,1.3);
$('qAsk').textContent='\uD83C\uDF89 '+quizAns+' for '+LETTERS[quizAns].word+'!';
setTimeout(newQuiz,2400);
} else {
btn.classList.add('wrong'); AudioFX.boop(); mascotSay("Not that one. Try again!",'sad');
speak("Try again",0.9,1.3);
}
}
$('qPic').addEventListener('click',()=>speak(LETTERS[quizAns].word,0.8,1.3));
/* ============ BUTTONS & START ============ */
$('bShow').addEventListener('click', showMe);
$('bClear').addEventListener('click', ()=>{
AudioFX.unlock(); AudioFX.click();
if(mode==='draw'){ doodle=[]; setMsg("Fresh page! Draw again \uD83C\uDFA8"); return; }
if(mode==='quiz'){ newQuiz(); return; }
demo=null; resetPractice(); showPicture(false); setMsg("Try again \u2014 start at the green dot");
});
$('bNext').addEventListener('click', ()=>{ AudioFX.unlock(); AudioFX.click(); selectLetter(ORDER[(ORDER.indexOf(cur)+1)%ORDER.length]); });
$('bPrev').addEventListener('click', ()=>{ AudioFX.unlock(); AudioFX.click(); selectLetter(ORDER[(ORDER.indexOf(cur)+ORDER.length-1)%ORDER.length]); });
$('goBtn').addEventListener('click', ()=>{ AudioFX.unlock(); AudioFX.fanfare(); $('start').classList.add('hide'); mascotSay("Hi! Let's write the letter A!",'happy'); speak("Let's write!",0.85,1.4); });
window.addEventListener('keydown', e=>{
if(e.key==='ArrowRight') $('bNext').click(); else if(e.key==='ArrowLeft') $('bPrev').click();
});
window.addEventListener('resize', ()=>{ resize(); fxResize(); });
setMascot(mascotEmoji); buildPalette(); paintTools(); paintMute();
buildStrip(); resize(); fxResize(); selectLetter('A'); updateStrip(); requestAnimationFrame(frame);
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
