/* ============ LETTER DATA ============
Coordinates are on a 0..100 grid (x right, y down) inside the letter box.
Each letter = list of strokes, each stroke = list of [x,y] points in writing order. */
function arcPts(cx,cy,rx,ry,a0,a1,n){
n = n || 28; const pts=[];
for(let i=0;i<=n;i++){
const a=(a0+(a1-a0)*i/n)*Math.PI/180;
pts.push([cx+rx*Math.cos(a), cy+ry*Math.sin(a)]);
}
return pts;
}
const LETTERS = {
A:{word:"Apple",emoji:"\uD83C\uDF4E",color:"#ff5252",strokes:[[[50,0],[8,100]],[[50,0],[92,100]],[[24,64],[76,64]]]},
B:{word:"Ball",emoji:"\u26BD",color:"#3d8bff",strokes:[[[14,0],[14,100]],[[14,0]].concat(arcPts(14,25,56,25,-90,90),[[14,50]]),[[14,50]].concat(arcPts(14,75,66,25,-90,90),[[14,100]])]},
C:{word:"Cat",emoji:"\uD83D\uDC31",color:"#ff9f1c",strokes:[arcPts(54,50,46,50,-40,-320,36)]},
D:{word:"Dog",emoji:"\uD83D\uDC36",color:"#a0673a",strokes:[[[14,0],[14,100]],[[14,0]].concat(arcPts(14,50,76,50,-90,90),[[14,100]])]},
E:{word:"Elephant",emoji:"\uD83D\uDC18",color:"#7d8aa5",strokes:[[[16,0],[16,100]],[[16,0],[88,0]],[[16,50],[74,50]],[[16,100],[88,100]]]},
F:{word:"Fish",emoji:"\uD83D\uDC1F",color:"#14b8c4",strokes:[[[16,0],[16,100]],[[16,0],[88,0]],[[16,50],[74,50]]]},
G:{word:"Grapes",emoji:"\uD83C\uDF47",color:"#8e44ad",strokes:[arcPts(54,50,46,50,-40,-320,36).concat([[96,56]]),[[96,56],[96,52],[56,52]]]},
H:{word:"House",emoji:"\uD83C\uDFE0",color:"#e8505b",strokes:[[[14,0],[14,100]],[[86,0],[86,100]],[[14,50],[86,50]]]},
I:{word:"Ice cream",emoji:"\uD83C\uDF66",color:"#f06292",strokes:[[[50,0],[50,100]],[[26,0],[74,0]],[[26,100],[74,100]]]},
J:{word:"Jug",emoji:"\uD83E\uDED6",color:"#2ec4a6",strokes:[[[68,0],[68,70]].concat(arcPts(44,70,24,30,0,160,14))]},
K:{word:"Kite",emoji:"\uD83E\uDE81",color:"#ff7043",strokes:[[[16,0],[16,100]],[[84,0],[16,56]],[[38,38],[86,100]]]},
L:{word:"Lion",emoji:"\uD83E\uDD81",color:"#e0a100",strokes:[[[18,0],[18,100]],[[18,100],[88,100]]]},
M:{word:"Mango",emoji:"\uD83E\uDD6D",color:"#ff8f00",strokes:[[[10,100],[10,0]],[[10,0],[50,72]],[[50,72],[90,0]],[[90,0],[90,100]]]},
N:{word:"Nest",emoji:"\uD83E\uDEB9",color:"#8d6e63",strokes:[[[16,100],[16,0]],[[16,0],[84,100]],[[84,100],[84,0]]]},
O:{word:"Orange",emoji:"\uD83C\uDF4A",color:"#fb8c00",strokes:[arcPts(50,50,44,50,-90,-450,44)]},
P:{word:"Pen",emoji:"\uD83D\uDD8A\uFE0F",color:"#5c6bc0",strokes:[[[16,0],[16,100]],[[16,0]].concat(arcPts(16,26,62,26,-90,90),[[16,52]])]},
Q:{word:"Queen",emoji:"\uD83D\uDC51",color:"#d4a017",strokes:[arcPts(48,48,42,46,-90,-450,44),[[62,66],[92,100]]]},
R:{word:"Rabbit",emoji:"\uD83D\uDC30",color:"#ec407a",strokes:[[[16,0],[16,100]],[[16,0]].concat(arcPts(16,26,62,26,-90,90),[[16,52]]),[[44,52],[86,100]]]},
S:{word:"Snake",emoji:"\uD83D\uDC0D",color:"#43a047",strokes:[arcPts(50,26,38,26,-20,-270,22).concat(arcPts(50,74,42,26,-90,160,24).slice(1))]},
T:{word:"Tree",emoji:"\uD83C\uDF33",color:"#2e9d4f",strokes:[[[10,0],[90,0]],[[50,0],[50,100]]]},
U:{word:"Umbrella",emoji:"\u2602\uFE0F",color:"#00acc1",strokes:[[[14,0],[14,60]].concat(arcPts(50,60,36,40,180,0,24),[[86,0]])]},
V:{word:"Van",emoji:"\uD83D\uDE90",color:"#7e57c2",strokes:[[[8,0],[50,100]],[[50,100],[92,0]]]},
W:{word:"Watch",emoji:"\u231A",color:"#26a69a",strokes:[[[2,0],[26,100]],[[26,100],[50,24]],[[50,24],[74,100]],[[74,100],[98,0]]]},
X:{word:"Xylophone",emoji:"\uD83C\uDFB6",color:"#ab47bc",strokes:[[[10,0],[90,100]],[[90,0],[10,100]]]},
Y:{word:"Yo-yo",emoji:"\uD83E\uDE80",color:"#f9a825",strokes:[[[10,0],[50,52]],[[90,0],[50,52],[50,100]]]},
Z:{word:"Zebra",emoji:"\uD83E\uDD93",color:"#455a64",strokes:[[[10,0],[90,0]],[[90,0],[10,100]],[[10,100],[90,100]]]}
};
const ORDER = Object.keys(LETTERS);
/* Each letter also gets a sticker + a cheerful soft background tint */
const STICKERS = {A:"\uD83C\uDF4E",B:"\u26BD",C:"\uD83D\uDC31",D:"\uD83D\uDC36",E:"\uD83D\uDC18",F:"\uD83D\uDC1F",G:"\uD83C\uDF47",H:"\uD83C\uDFE0",I:"\uD83C\uDF66",J:"\uD83E\uDED6",K:"\uD83E\uDE81",L:"\uD83E\uDD81",M:"\uD83E\uDD6D",
N:"\uD83E\uDEB9",O:"\uD83C\uDF4A",P:"\uD83D\uDD8A\uFE0F",Q:"\uD83D\uDC51",R:"\uD83D\uDC30",S:"\uD83D\uDC0D",T:"\uD83C\uDF33",U:"\u2602\uFE0F",V:"\uD83D\uDE90",W:"\u231A",X:"\uD83C\uDFB6",Y:"\uD83E\uDE80",Z:"\uD83E\uDD93"};
const LEVELS = [[0,"\uD83E\uDD5A Little Egg"],[3,"\uD83D\uDC25 Baby Chick"],[7,"\uD83D\uDC26 Happy Bird"],[12,"\uD83E\uDD8B Butterfly"],[18,"\uD83E\uDD84 Unicorn"],[24,"\uD83D\uDC09 Dragon"],[26,"\uD83C\uDFC6 ABC Champion"]];
const MASCOTS = ["\uD83E\uDD89","\uD83D\uDC3B","\uD83E\uDD8A","\uD83D\uDC27","\uD83E\uDD81","\uD83D\uDC3C"];
const PRAISE = ["Great job!","Awesome!","Super star!","Well done!","Fantastic!","Brilliant!","Wow!","You rock!","Amazing!"];
const TRY    = ["Try again, you can do it!","Almost there!","Oops! Have another go!","Nice try! Once more!"];
/* hex -> soft tint */
function tintOf(hex){
const n=parseInt(hex.slice(1),16), r=n>>16&255, g=n>>8&255, b=n&255;
const m=(c)=>Math.round(c+(255-c)*0.86);
return 'rgb('+m(r)+','+m(g)+','+m(b)+')';
}
for(const k in LETTERS){ LETTERS[k].tint = tintOf(LETTERS[k].color); }
/* ============ SOUND (all generated in the browser, no files) ============ */
const AudioFX = (function(){
let ac=null, master=null, muted=false;
try{ muted = localStorage.getItem('abcMuted')==='1'; }catch(e){}
function unlock(){
if(!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); master=ac.createGain(); master.gain.value=0.9; master.connect(ac.destination);}catch(e){return;} }
if(ac.state==='suspended') ac.resume();
}
function tone(freq,t0,dur,type,vol){
if(!ac||muted) return; const o=ac.createOscillator(), g=ac.createGain();
o.type=type||'sine'; o.frequency.value=freq;
g.gain.setValueAtTime(0.0001,ac.currentTime+t0);
g.gain.exponentialRampToValueAtTime(vol||0.25, ac.currentTime+t0+0.02);
g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime+t0+dur);
o.connect(g); g.connect(master); o.start(ac.currentTime+t0); o.stop(ac.currentTime+t0+dur+0.05);
}
function clap(t0,vol){
if(!ac||muted) return;
const len=Math.floor(ac.sampleRate*0.09), buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
for(let i=0;i<len;i++){ d[i]=(Math.random()*2-1)*Math.exp(-i/ac.sampleRate*55); }
const src=ac.createBufferSource(); src.buffer=buf;
const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1500+Math.random()*1800; bp.Q.value=0.8;
const g=ac.createGain(); g.gain.value=vol;
src.connect(bp); bp.connect(g); g.connect(master); src.start(ac.currentTime+t0);
}
function applause(long){
if(!ac||muted) return;
let t=0; for(let i=0;i<6;i++){ clap(t,1.0); t+=0.27+Math.random()*0.05; }
const end=long?6:3.6; t=0.05;
while(t<end){ const fade=1-0.7*t/end; for(let k=0;k<3;k++) clap(t+Math.random()*0.05, (0.25+Math.random()*0.45)*fade); t+=0.035+Math.random()*0.045; }
[784,988,1175,1568].forEach((f,i)=>tone(f,i*0.09,0.5,'triangle',0.2));
}
return {
unlock, applause,
isMuted(){ return muted; },
setMuted(m){ muted=m; try{ localStorage.setItem('abcMuted', m?'1':'0'); }catch(e){} },
pop(){ tone(660,0,0.12,'sine',0.25); tone(990,0.07,0.14,'sine',0.2); },
boop(){ tone(220,0,0.16,'triangle',0.22); tone(180,0.1,0.2,'triangle',0.2); },
click(){ tone(520,0,0.07,'square',0.08); },
sparkle(i){ tone(900+((i||0)%6)*140,0,0.1,'sine',0.07); },
fanfare(){ [523,659,784,1047].forEach((f,i)=>tone(f,i*0.12,0.3,'triangle',0.22)); },
win(){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,i*0.14,0.35,'triangle',0.24)); },
tada(){ [392,523,659,784].forEach((f,i)=>tone(f,i*0.08,0.25,'square',0.1)); }
};
})();
function speak(text, rate, pitch){
try{
if('speechSynthesis' in window && !AudioFX.isMuted()){
speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(text); u.rate=rate||0.8; u.pitch=pitch||1.3; speechSynthesis.speak(u);
}
}catch(e){}
}
