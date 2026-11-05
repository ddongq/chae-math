/* =========================================================
   engine.js — 화면 맞춤 · 애니메이션 · 효과음 · 저장 · 공용 도우미
   ========================================================= */
const $ = id => document.getElementById(id);
const stage = $('stage'), fx = $('fx'), screenEl = $('screen'), ovEl = $('ov');

/* ---------- 화면 크기 맞추기 ---------- */
function fit(){
  const s = Math.min(innerWidth/1280, innerHeight/800);
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); fit();

/* ---------- 화면 확대 막기 (아이패드) ----------
   iOS Safari는 viewport의 user-scalable=no를 무시하므로
   1) CSS touch-action:none 으로 두 번 탭·손가락 확대를 끄고
   2) Safari 전용 gesture 이벤트와 두 손가락 touchmove를 막는다.
   (펜·한 손가락 탭은 pointer 이벤트라 영향 없음) */
['gesturestart','gesturechange','gestureend'].forEach(t =>
  document.addEventListener(t, e => e.preventDefault(), {passive:false}));
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, {passive:false});

/* ---------- 애니메이션 엔진 (멈춤 · 속도 · 중단 지원) ---------- */
let SPEED = 1, INSTANT = false, gen = 0, paused = false;
const running = new Set();
class Abort extends Error {}

function setStyles(el, f){ for (const k in f){ if (k==='offset'||k==='easing') continue; el.style[k] = f[k]; } }

async function A(el, frames, dur=500, o={}){
  const g = gen;
  if (!Array.isArray(frames)) frames = [frames];
  const last = frames[frames.length-1];
  if (INSTANT || !el || !el.isConnected){ if (el) setStyles(el, last); return; }
  if (frames.length === 1){
    const cs = getComputedStyle(el), first = {};
    for (const k in last){ if (k!=='easing' && k!=='offset') first[k] = el.style[k] || cs[k]; }
    frames = [first, last];
  }
  const a = el.animate(frames, {duration:dur, delay:o.delay||0, easing:o.easing||'cubic-bezier(.33,.9,.4,1)', fill:'both'});
  a.playbackRate = o.fixed ? 1 : SPEED; if (paused) a.pause();
  running.add(a);
  try { await a.finished; } catch(e){ running.delete(a); throw new Abort(); }
  running.delete(a);
  setStyles(el, last);
  try { a.cancel(); } catch(e){}
  if (g !== gen) throw new Abort();
}
const dummy = document.createElement('i'); dummy.style.cssText = 'position:absolute;width:0;height:0'; stage.appendChild(dummy);
const wait = ms => A(dummy, [{opacity:0},{opacity:0}], ms);
const waitFixed = ms => A(dummy, [{opacity:0},{opacity:0}], ms, {fixed:true});
const all = arr => Promise.all(arr);
function fire(p){ p && p.catch && p.catch(()=>{}); }
function abortAll(){
  gen++;
  running.forEach(a=>{ try{ a.cancel(); }catch(e){} }); running.clear();
  paused = false;
}
// Abort 예외는 조용히 무시하고 실제 오류만 콘솔에
function safe(fn){ return (...args) => { try { const p = fn(...args); if (p && p.catch) p.catch(e=>{ if (!(e instanceof Abort)) console.error(e); }); } catch(e){ if (!(e instanceof Abort)) console.error(e); } }; }

/* ---------- 효과음 (기기에서 바로 합성) ---------- */
let ac = null, SOUND = true;
function unlockAudio(){
  try { if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); if (ac.state==='suspended') ac.resume(); } catch(e){}
}
function tone(f, dur, type='sine', vol=.2, when=0, fEnd){
  if (!SOUND || INSTANT || !ac) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t+dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+.012); g.gain.exponentialRampToValueAtTime(.0001, t+dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t+dur+.03);
}
function noise(dur, vol, freq){
  if (!SOUND || INSTANT || !ac) return;
  const len = Math.floor(ac.sampleRate*dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i=0;i<len;i++) d[i] = (Math.random()*2-1)*(1-i/len);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = buf; f.type='bandpass'; f.frequency.value=freq; g.gain.value=vol;
  s.connect(f).connect(g).connect(ac.destination); s.start();
}
const SFX = {
  pop:   ()=>tone(520,.12,'sine',.16,0,900),
  tap:   ()=>tone(760,.05,'triangle',.08),
  chak:  ()=>{ tone(190,.1,'triangle',.28,0,90); noise(.06,.18,2600); },
  boom:  ()=>{ tone(120,.35,'triangle',.3,0,50); noise(.3,.22,700); },
  ppyong:()=>tone(360,.3,'sine',.2,0,1500),
  write: ()=>tone(1150,.06,'triangle',.12),
  swoosh:()=>noise(.25,.1,1100),
  slash: ()=>noise(.12,.14,4200),
  ding:  ()=>{ tone(1046,.4,'sine',.18); tone(784,.6,'sine',.18,.22); },
  right: ()=>{ tone(880,.15,'sine',.16); tone(1318,.35,'sine',.16,.12); },
  wrong: ()=>{ tone(300,.18,'triangle',.14,0,220); tone(220,.28,'triangle',.12,.15,170); },
  fanfare:()=>{ [523,659,784,1046].forEach((f,i)=>tone(f,.28,'triangle',.17,i*.12)); tone(1318,.7,'sine',.15,.5); },
};

/* ---------- 저장 (이 기기 · 이 브라우저) ---------- */
const Store = {
  key: 'chae_math_v1', d: null,
  blank(){ return {name: localStorage.getItem('chae_name') || '채원', isl:{}, mis:{shift:0,carry:0,add:0,fact:0,zero:0,other:0}, times:[], log:[], unlockAll:false}; },
  load(){ try { this.d = JSON.parse(localStorage.getItem(this.key)); } catch(e){} if (!this.d) this.d = this.blank(); return this.d; },
  save(){ try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch(e){} },
  isl(n){ return this.d.isl[n] || (this.d.isl[n] = {}); },
  mark(n, k, v=true){ this.isl(n)[k] = v; this.save(); },
  mistake(type){ this.d.mis[type] = (this.d.mis[type]||0) + 1; this.save(); },
  reset(){ const name = this.d.name; this.d = this.blank(); this.d.name = name; this.save(); },
};
Store.load();
const NM = () => Store.d.name;

/* ---------- 만들기 도우미 ---------- */
function mk(cls, x, y, html='', id, parent=fx){
  const d = document.createElement('div'); if (cls) d.className = cls;
  if (x !== null && x !== undefined) d.style.left = x+'px';
  if (y !== null && y !== undefined) d.style.top = y+'px';
  if (html) d.innerHTML = html; if (id) d.id = id;
  parent.appendChild(d); return d;
}
function btn(cls, html, onclick, parent){
  const b = document.createElement('button'); b.className = cls; b.innerHTML = html;
  b.onclick = e => { unlockAudio(); SFX.tap(); onclick(e); };
  if (parent) parent.appendChild(b); return b;
}
const css = (el, o) => { Object.assign(el.style, o); return el; };
const POP = [{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1.25)',offset:.6},{opacity:1,transform:'scale(1)'}];
const FLASH = [{filter:'brightness(1.8)',transform:'scale(1.15)'},{filter:'brightness(1)',transform:'scale(1)'}];
const IN = [{opacity:0},{opacity:1}];
const sleep = ms => new Promise(r=>setTimeout(r, ms));
const rnd = (a, b) => a + Math.floor(Math.random()*(b-a+1));
const fmt = n => n.toLocaleString('ko-KR');
// 숫자 뒤 조사: J(6,'은','는') → '은'  (받침 있는 숫자: 0 1 3 6 7 8)
const J = (n, a, b) => { const d = String(n).replace(/[^0-9]/g,''); return '013678'.includes(d[d.length-1]) ? a : b; };

// 말풍선: 한 문장이 끝나면 줄바꿈 + 넘치면 글자 크기 자동 축소
function breakSentences(h){
  return h.replace(/([.!?…])((?:<\/[a-z]+>)*)\s+(?=[^\s<]|<(?!br))/g, (m, p, tags) => p + tags + '<br>');
}
function fitBubble(){
  const b = $('bubble'), inner = b.firstElementChild; if (!inner) return;
  let fs = 23; b.style.fontSize = fs+'px';
  while (inner.scrollHeight > b.clientHeight - 18 && fs > 16){ fs--; b.style.fontSize = fs+'px'; }
}
function say(html){
  $('bubble').innerHTML = '<div>'+breakSentences(html.replace(/\{n\}/g, NM()))+'</div>';
  fitBubble();
  if (!INSTANT){
    $('bubble').animate([{transform:'scale(.97)',opacity:.4},{transform:'scale(1)',opacity:1}],{duration:260});
    const p = $('parrot'); p.classList.remove('talk'); void p.offsetWidth; p.classList.add('talk');
  }
}
// 버튼 칸 너비만큼 말풍선을 줄여서 겹치지 않게
function setCtrls(...els){
  const c = $('ctrls'); c.innerHTML = ''; els.filter(Boolean).forEach(e=>c.appendChild(e));
  layoutBottom();
}
// 버튼 글자가 바뀌어 폭이 달라졌을 때도 다시 맞추기
function layoutBottom(){
  const c = $('ctrls'), w = c.children.length ? c.offsetWidth : 0;
  $('bubble').style.width = (1220 - 135 - (w ? w + 24 : 0)) + 'px';
  fitBubble();
}
async function pulse(el, s=1.14, dur=520){ await A(el, [{transform:'scale(1)'},{transform:`scale(${s})`},{transform:'scale(1)'}], dur); }
function shake(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

function burst(x, y, color='#E5484D', n=12, parent=fx){
  if (INSTANT) return;
  for (let i=0;i<n;i++){
    const s = mk('spark', x-5, y-5, '', null, parent); s.style.position='absolute'; s.style.background = i%3 ? color : '#FFC531';
    const a = i/n*Math.PI*2, r = 46+Math.random()*34;
    const an = s.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px) scale(.3)`,opacity:0}],{duration:600,easing:'cubic-bezier(.2,.8,.3,1)'});
    an.onfinish = ()=>s.remove();
  }
}
function confetti(x0=800, w=440, parent=fx){
  if (INSTANT) return;
  const cols = ['#E5484D','#2F7BEA','#14995A','#FFC531','#7A3FD0','#FF8A3D'];
  for (let i=0;i<60;i++){
    const c = mk('confetti', x0+Math.random()*w, 70, '', null, parent); c.style.position='absolute'; c.style.background = cols[i%cols.length];
    const dx = (Math.random()-.5)*160, rot = Math.random()*720;
    const an = c.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${520+Math.random()*60}px) rotate(${rot}deg)`,opacity:.1}],{duration:1600+Math.random()*900,delay:Math.random()*400,easing:'cubic-bezier(.3,.2,.6,1)'});
    an.onfinish = ()=>c.remove();
  }
}
function gemFly(fromX, fromY){
  if (INSTANT) return;
  const g = mk('gem', fromX-20, fromY-20, '💎'); g.style.position='absolute';
  const an = g.animate([{transform:'translate(0,0) scale(.5)',opacity:0},{transform:'translate(0,-60px) scale(1.4)',opacity:1,offset:.4},{transform:`translate(${1180-fromX}px,${-fromY+30}px) scale(.6)`,opacity:.2}],{duration:1100,easing:'cubic-bezier(.4,0,.2,1)'});
  an.onfinish = ()=>g.remove();
}

/* ---------- 셈이 (앵무새) ---------- */
const PARROT = `<svg viewBox="0 0 120 130" width="120" height="130">
  <ellipse cx="60" cy="124" rx="32" ry="5" fill="rgba(0,0,0,.13)"/>
  <path d="M50 100 L42 128 L60 112 L76 128 L70 100Z" fill="#2E9E5B"/>
  <ellipse cx="60" cy="82" rx="34" ry="35" fill="#3CC46E"/>
  <ellipse cx="60" cy="92" rx="21" ry="22" fill="#C4F2CD"/>
  <path d="M27 70 Q16 100 44 108 Q40 86 27 70Z" fill="#2E9E5B"/>
  <path d="M93 70 Q104 100 76 108 Q80 86 93 70Z" fill="#2E9E5B"/>
  <circle cx="60" cy="44" r="28" fill="#3CC46E"/>
  <path d="M50 18 Q46 0 60 5 Q55 11 58 18Z" fill="#FF5A5F"/>
  <path d="M58 17 Q65 -1 74 7 Q65 10 65 19Z" fill="#FFC531"/>
  <circle cx="39" cy="55" r="6" fill="#FF9AA2" opacity=".75"/><circle cx="81" cy="55" r="6" fill="#FF9AA2" opacity=".75"/>
  <circle cx="48" cy="40" r="8.5" fill="#fff"/><circle cx="49" cy="41" r="4.8" fill="#222"/><circle cx="50.7" cy="39" r="1.6" fill="#fff"/>
  <circle cx="72" cy="40" r="8.5" fill="#fff"/><circle cx="71" cy="41" r="4.8" fill="#222"/><circle cx="72.7" cy="39" r="1.6" fill="#fff"/>
  <path d="M52 50 Q60 45 68 50 Q66 64 60 66 Q54 64 52 50Z" fill="#FF9F1C"/>
  <path d="M54 56 Q60 60 66 56" stroke="#D97706" stroke-width="2" fill="none"/>
  <path d="M50 116 l-4 8 M56 117 l0 8 M66 117 l0 8 M72 116 l4 8" stroke="#E08A1C" stroke-width="3" stroke-linecap="round"/>
</svg>`;
$('parrot').innerHTML = PARROT;
$('startParrot').innerHTML = PARROT.replace('width="120" height="130"', 'width="170" height="184"');

/* ---------- 상단 공용 버튼 ---------- */
$('bSound').onclick = ()=>{ SOUND = !SOUND; $('bSound').textContent = SOUND ? '🔊' : '🔇'; unlockAudio(); };
