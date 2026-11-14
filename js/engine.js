/* =========================================================
   engine.js — 화면 맞춤 · 애니메이션 · 효과음 · 저장 · 공용 도우미
   ========================================================= */
const $ = id => document.getElementById(id);
const stage = $('stage'), fx = $('fx'), screenEl = $('screen'), ovEl = $('ov');

/* ---------- 화면 크기 맞추기 ----------
   iOS Safari는 확대되면 innerWidth가 함께 줄어들어서, 확대와 상관없는 레이아웃 크기(clientWidth)로 맞춘다. */
function fit(){
  const de = document.documentElement, w = de.clientWidth || innerWidth, h = de.clientHeight || innerHeight;
  const s = Math.min(w/1280, h/800);
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); fit();

/* ---------- 화면 확대 막기 · 확대됐을 때 원래대로 (아이패드) ----------
   iOS Safari는 viewport의 user-scalable=no를 무시하므로
   1) CSS touch-action:none 으로 두 번 탭·손가락 확대를 끄고
   2) Safari 전용 gesture 이벤트와 두 손가락 touchmove를 막고
   3) 길게 누르기 메뉴·글자 선택을 막는다.
   그래도 확대되면(visualViewport.scale > 1) 바로 원래 배율로 되돌리고,
   안 되돌아가면 '화면 원래대로' 버튼을 보여 주고 손가락 오므리기를 허용한다. */
const VV = window.visualViewport;
const zoomed = () => !!VV && VV.scale > 1.02;
['gesturestart','gesturechange','gestureend'].forEach(t =>
  document.addEventListener(t, e => { if (!zoomed()) e.preventDefault(); }, {passive:false}));
document.addEventListener('touchmove', e => { if (e.touches.length > 1 && !zoomed()) e.preventDefault(); }, {passive:false});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

const VIEWPORT = document.querySelector('meta[name=viewport]'), VP0 = VIEWPORT.content;
function resetZoom(){
  // viewport 값을 잠깐 바꿨다 되돌리면 Safari가 배율을 1로 다시 맞춘다
  VIEWPORT.content = VP0.replace('maximum-scale=1', 'maximum-scale=1.0001');
  setTimeout(()=>{ VIEWPORT.content = VP0; setTimeout(onViewport, 350); }, 60);
}
const unzoom = document.createElement('button');
unzoom.id = 'unzoom'; unzoom.innerHTML = '🔍 화면 원래대로';
unzoom.onclick = () => resetZoom();
document.body.appendChild(unzoom);
let zoomTry = 0;
function onViewport(){
  const z = zoomed();
  document.documentElement.classList.toggle('zoomed', z);
  unzoom.style.display = z ? 'block' : 'none';
  if (!z){ zoomTry = 0; return; }
  const k = 1/VV.scale;
  Object.assign(unzoom.style, {left:(VV.offsetLeft + VV.width/2)+'px', top:(VV.offsetTop + 14*k)+'px', transform:`translateX(-50%) scale(${k})`});
  if (zoomTry++ < 2) setTimeout(()=>{ if (zoomed()) resetZoom(); }, 250);
}
if (VV){ VV.addEventListener('resize', onViewport); VV.addEventListener('scroll', onViewport); }

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
/* v2 (2026-11-14): 기록을 바다별로 나눈다 — 수집 설계(수집_기획안.md 7·13장)와 같은 구조
   { ver:2, name, unlockAll, sea:{mul:{isl}, div:{isl}}, mis:{mul:{…}, div:{…}}, times, log, exam:{best,hist,note[{…,sea,addedAt}],cur}, ev:[…최근 800] }
   지금 보고 있는 바다는 Store.sea ('mul' | 'div'). 섬 번호만 넘기면 지금 바다로 본다. */
const SEAS = ['mul', 'div'];
const MIS_KEYS = {
  mul: ['shift','carry','add','fact','zero','other'],
  div: ['rem','zero','sub','fact','down','other'],   // 나머지≥나누는 수 · 몫 가운데 0 빠뜨림 · 빼기 · 곱셈구구 · 내려쓰기 · 기타
};
const zeroMis = sea => Object.fromEntries(MIS_KEYS[sea].map(k=>[k, 0]));
const Store = {
  key: 'chae_math_v1', d: null, sea: 'mul',
  blank(){ return {ver:2, name: localStorage.getItem('chae_name') || '채원', unlockAll:false,
    sea:{mul:{isl:{}}, div:{isl:{}}}, mis:{mul:zeroMis('mul'), div:zeroMis('div')}, times:[], log:[], ev:[]}; },
  // v1 → v2: 섬 기록은 곱셈 바다로, 실수는 곱셈 실수로, 오답 노트 항목에는 sea·addedAt
  migrate(d){
    if (!d || d.ver === 2) return d;
    const b = this.blank(), today = Date.now();
    b.name = d.name || b.name; b.unlockAll = !!d.unlockAll;
    b.sea.mul.isl = d.isl || {}; b.mis.mul = Object.assign(zeroMis('mul'), d.mis || {});
    b.times = d.times || []; b.log = d.log || [];
    if (d.exam){ b.exam = d.exam; (b.exam.note||[]).forEach(q=>{ if (!q.sea) q.sea = 'mul'; if (!q.addedAt) q.addedAt = today; }); }
    return b;
  },
  load(){
    try { this.d = JSON.parse(localStorage.getItem(this.key)); } catch(e){}
    if (!this.d) this.d = this.blank();
    else if (this.d.ver !== 2){ this.d = this.migrate(this.d); this.save(); }
    SEAS.forEach(s=>{ this.d.sea[s] = this.d.sea[s] || {isl:{}}; this.d.mis[s] = Object.assign(zeroMis(s), this.d.mis[s] || {}); });
    this.d.ev = this.d.ev || [];
    return this.d;
  },
  save(){ try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch(e){} },
  isl(n, sea=this.sea){ const I = this.d.sea[sea].isl; return I[n] || (I[n] = {}); },
  mark(n, k, v=true, sea=this.sea){ this.isl(n, sea)[k] = v; this.save(); },
  mis(sea=this.sea){ return this.d.mis[sea]; },
  mistake(type, sea=this.sea){ const m = this.mis(sea); m[type] = (m[type]||0) + 1; this.save(); },
  // 행동 기록: 수집 시스템이 쓸 자리. 이름은 바다와 무관, sea로 구분 (solve · trace.done · island.treasure · verify.* …)
  ev(name, data={}){ const e = Object.assign({ev:name, sea:this.sea, t:Date.now()}, data); this.d.ev.push(e); if (this.d.ev.length > 800) this.d.ev.splice(0, this.d.ev.length-800); this.save(); return e; },
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
// 조사 고르기: J(6,'은','는') → '은', J('나침반','을','를') → '을'
//   끝 글자가 숫자면 숫자 읽기(받침 있는 숫자: 0 1 3 6 7 8), 한글이면 받침 유무로 고른다 (태그·이모지·공백은 건너뜀)
const J = (n, a, b) => {
  const t = String(n).replace(/<[^>]*>/g, '').replace(/[^0-9가-힣]/g, ''), c = t[t.length-1];
  if (!c) return b;
  if (/[0-9]/.test(c)) return '013678'.includes(c) ? a : b;
  return (c.charCodeAt(0) - 0xAC00) % 28 ? a : b;
};

// '으로/로': 숫자 3·6·0(삼·육·영)과 받침 있는 글자(ㄹ 받침 제외) 뒤에는 '으로'
const JRO = n => { const t = String(n).replace(/[^0-9가-힣]/g, ''), c = t[t.length-1] || '';
  if (/[0-9]/.test(c)) return '360'.includes(c) ? '으로' : '로';
  const f = c ? (c.charCodeAt(0) - 0xAC00) % 28 : 0; return f && f !== 8 ? '으로' : '로'; };

// 말풍선: 한 문장이 끝나면 줄바꿈 + 넘치면 글자 크기 자동 축소
function breakSentences(h){
  // '12 … 1'처럼 나머지를 쓰는 '…' 뒤 숫자는 줄을 바꾸지 않는다
  return h.replace(/([.!?…])((?:<\/[a-z]+>)*)\s+(?=[^\s<]|<(?!br))/g, (m, p, tags, i, s) => p === '…' && /^(?:<[^>]+>)*\d/.test(s.slice(i + m.length)) ? m : p + tags + '<br>');
}
function fitBubble(){
  const b = $('bubble'), inner = b.firstElementChild; if (!inner) return;
  let fs = 23; b.style.fontSize = fs+'px';
  while (inner.scrollHeight > b.clientHeight - 18 && fs > 16){ fs--; b.style.fontSize = fs+'px'; }
}
function say(html, face){
  $('bubble').innerHTML = '<div>'+breakSentences(html.replace(/\{n\}/g, NM()))+'</div>';
  fitBubble();
  if (typeof setFace === 'function') setFace(face || pickFace(html));
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

/* ---------- 루퍼드 (안내) ----------
   그림: img/char/rupert_*.webp (512 정사각, 같은 인물은 머리 높이가 같아서 표정만 바꿔도 흔들리지 않음)
   say(html, face)에 표정을 직접 줄 수 있고, 안 주면: 방금 정답 소리 → 칭찬, 방금 오답 소리 → 위로, 물음표 → 생각, 그 밖엔 설명 */
const FACES = ['explain','praise','surprise','think','cheer','comfort','hello','focus'];
const faceSrc = f => `img/char/rupert_${f}.webp`;
FACES.forEach(f=>{ const im = new Image(); im.src = faceSrc(f); });
$('parrot').innerHTML = `<img id="face" src="${faceSrc('hello')}" alt="루퍼드">`;
let MOOD = null, MOODT = 0;
['right','fanfare'].forEach(k=>{ const f = SFX[k]; SFX[k] = (...a)=>{ MOOD = 'praise'; MOODT = performance.now(); return f(...a); }; });
{ const f = SFX.wrong; SFX.wrong = (...a)=>{ MOOD = 'comfort'; MOODT = performance.now(); return f(...a); }; }
function pickFace(html){
  if (MOOD && performance.now() - MOODT < 1200) return MOOD;
  return /\?/.test(html.replace(/<[^>]+>/g, '')) ? 'think' : 'explain';
}
function setFace(f){ const im = $('face'); if (im && !im.src.endsWith(faceSrc(f))) im.src = faceSrc(f); }
$('startParrot').innerHTML = `<img src="img/char/scene_start.webp" alt="채원과 루퍼드">`;
// 종이결: 작은 무늬를 한 번만 만들어 바탕에 깔기 (움직일 때 다시 그리지 않음)
(function paper(){
  try {
    const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d'), im = x.createImageData(180, 180);
    for (let i=0;i<im.data.length;i+=4){ const v = 110 + Math.random()*100; im.data[i] = im.data[i+1] = im.data[i+2] = v; im.data[i+3] = Math.random() < .5 ? 12 : 0; }
    x.putImageData(im, 0, 0);
    document.body.style.setProperty('--paper', `url(${c.toDataURL()})`); document.body.classList.add('paper');
  } catch(e){}
})();
/* ---------- 상단 공용 버튼 ---------- */
$('bSound').onclick = ()=>{ SOUND = !SOUND; $('bSound').textContent = SOUND ? '🔊' : '🔇'; unlockAudio(); };
