/* =========================================================
   lesson.js — 원리 모션 플레이어 + 모션 도우미
   ========================================================= */
// 오른쪽 세로셈 좌표 (무대 기준)
const CX = [1190, 1105, 1020, 935];          // p: 0=일 1=십 2=백 3=천  → x
const LY = {col:94, k2:126, k1:162, A:222, B:298, L1:342, ac:364, r1:408, r2:484, L2:528, S:580};
const WY = 300;                               // 블록 놓는 기준 높이

/* ---------- 플레이어 ---------- */
const LP = {L:null, cur:0, busy:false, auto:false, onEnd:null, isl:0};
function openLesson(L, isl, onEnd){
  abortAll(); screenEl.innerHTML = ''; fx.innerHTML = '';
  document.body.classList.add('lesson-mode');
  Object.assign(LP, {L, cur:0, busy:false, onEnd, isl});
  mk('panel pL', null, null, '', null, screenEl); mk('panel pR', null, null, '', null, screenEl);
  const dots = $('dots'); dots.innerHTML = '';
  L.steps.forEach((_,i)=>{ const b = document.createElement('button'); b.onclick = ()=>lgo(i); dots.appendChild(b); });
  const prev = btn('cbtn', '⏮', ()=>lgo(LP.cur-1)); prev.id = 'lPrev';
  const rep  = btn('cbtn', '🔁', ()=>lgo(LP.cur));
  const pau  = btn('cbtn', '⏸', ()=>{ if (LP.busy) setPaused(!paused); }); pau.id = 'lPause';
  const nxt  = btn('pill', '다음 ▶', ()=>{ if (LP.cur >= L.steps.length-1) LP.onEnd && LP.onEnd(); else lgo(LP.cur+1); }); nxt.id = 'lNext';
  setCtrls(prev, rep, pau, nxt);
  lgo(0);
}
function closeLesson(){ abortAll(); document.body.classList.remove('lesson-mode'); $('tip').classList.remove('show'); $('bTip').classList.remove('on'); }
async function lgo(n){
  const L = LP.L; if (!L) return;
  n = Math.max(0, Math.min(L.steps.length-1, n));
  abortAll(); const g = gen;
  LP.cur = n; LP.busy = true; lUI();
  fx.innerHTML = ''; (L.base || (()=>lBase(L.a, L.b)))();
  stage.classList.add('instant'); INSTANT = true;
  try { for (let i=0;i<n;i++) await L.steps[i](); } catch(e){ if (!(e instanceof Abort)) console.error(e); }
  INSTANT = false; void stage.offsetWidth; stage.classList.remove('instant');
  if (g !== gen) return;
  try { await L.steps[n](); } catch(e){ if (e instanceof Abort) return; console.error(e); }
  if (g !== gen) return;
  LP.busy = false;
  if (n === L.steps.length-1) Store.mark(LP.isl, 'lesson');
  lUI();
  if (LP.auto && n < L.steps.length-1){ try { await wait(2400); } catch(e){ return; } if (g===gen) lgo(n+1); }
}
function setPaused(p){ paused = p; running.forEach(a=> p ? a.pause() : a.play()); lUI(); }
function lUI(){
  const L = LP.L, last = LP.cur === L.steps.length-1;
  [...$('dots').children].forEach((d,i)=>{ d.className = i===LP.cur ? 'on' : (i<LP.cur ? 'done' : ''); });
  $('lPrev').disabled = LP.cur===0;
  $('lPause').textContent = paused ? '▶' : '⏸'; $('lPause').disabled = !LP.busy;
  const nx = $('lNext');
  nx.textContent = last ? (L.endLabel || '따라 풀기 ▶') : '다음 ▶';
  nx.classList.toggle('nudge', !LP.busy && !LP.auto);
  $('tip').innerHTML = `<i>💬 부모님이 이렇게 물어봐 주세요 (${LP.cur+1}/${L.steps.length}단계)</i>${(L.tips||[])[LP.cur]||''}`;
}
$('bTip').onclick = ()=>{ $('tip').classList.toggle('show'); $('bTip').classList.toggle('on'); };
const SPEEDS = [[0.6,'🐢 느리게'],[1,'🙂 보통'],[1.5,'🐇 빠르게']]; let speedIdx = 1;
$('bSpeed').onclick = ()=>{ speedIdx = (speedIdx+1)%3; SPEED = SPEEDS[speedIdx][0]; $('bSpeed').textContent = SPEEDS[speedIdx][1]; running.forEach(a=>a.playbackRate=SPEED); };
$('bAuto').onclick = ()=>{ LP.auto = !LP.auto; $('bAuto').classList.toggle('on', LP.auto); $('bAuto').textContent = LP.auto ? '자동 넘김 ON' : '자동 넘김'; if (LP.L){ lUI(); if (LP.auto && !LP.busy && LP.cur < LP.L.steps.length-1) lgo(LP.cur+1); } };
addEventListener('keydown', e=>{
  if (!document.body.classList.contains('lesson-mode') || $('start').style.display !== 'none') return;
  if (e.key==='ArrowRight') lgo(LP.cur+1);
  else if (e.key==='ArrowLeft') lgo(LP.cur-1);
  else if (e.key===' '){ e.preventDefault(); if (LP.busy) setPaused(!paused); }
});

/* ---------- 세로셈 (오른쪽) ---------- */
function lBase(a, b, withCols=true){
  if (withCols) ['일','십','백','천'].forEach((t,p)=>mk('colLbl', CX[p], LY.col-10, t));
  digitsOf(a).reverse().forEach((d,p)=>mk('dg', CX[p], LY.A, String(d), 'a'+p));
  mk('dg op', 862, LY.B, '×', 'opx');
  digitsOf(b).reverse().forEach((d,p)=>mk('dg', CX[p], LY.B, String(d), 'b'+p));
  mk('hline', 885, LY.L1-2, '', 'L1');
}
async function swapBase(a, b){
  const olds = [...fx.querySelectorAll('.dg, .cr, .slash, .hline, .rowlbl, .band, .slot')];
  await fadeRm(olds, 300);
  lBase(a, b, false);
  const nw = ['a0','a1','b0','b1','opx','L1'].map($).filter(Boolean);
  nw.forEach(e=>e.style.opacity=0); await all(nw.map((e,i)=>A(e, IN, 300, {delay:i*60})));
}
async function writeDigit(id, p, y, txt, cls=''){
  const d = mk('dg '+cls, CX[p], y, txt, id); d.style.opacity = 0;
  SFX.write(); await A(d, POP, 420); return d;
}
async function writeCarry(id, p, y, txt, small){
  const d = mk('cr'+(small?' ac':''), CX[p], y, txt, id); d.style.opacity = 0;
  await A(d, POP, 420); return d;
}
async function slashL(id){
  const d = $(id), s = mk('slash', parseFloat(d.style.left), parseFloat(d.style.top));
  s.style.transform = 'rotate(-55deg) scaleX(0)'; SFX.slash();
  await A(s, [{transform:'rotate(-55deg) scaleX(0)'},{transform:'rotate(-55deg) scaleX(1)'}], 320);
  await A(d, {opacity:'.45'}, 200);
}
function clearHl(){ fx.querySelectorAll('.hl-b,.hl-g,.hl-s,.hl-r,.hl-y').forEach(e=>e.classList.remove('hl-b','hl-g','hl-s','hl-r','hl-y')); }
function hl(idsArr, c){ clearHl(); idsArr.forEach(id=>{ const e=$(id); if(e) e.classList.add(id[0]==='k'?'hl-r':'hl-'+c); }); }
async function rowLbl(id, y, txt, c){ const lb = mk('rowlbl '+c, 800, y-17, txt, id); lb.style.opacity = 0; await A(lb, IN, 300); }
async function drawLine(id, y){ const L = mk('hline', 885, y-2, '', id); L.style.transform='scaleX(0)'; SFX.swoosh(); await A(L, {transform:'scaleX(1)'}, 450); }
async function zeroDrop(id, p, y, cls='g'){
  const z = mk('dg '+cls, CX[p], y-220, '0', id); z.style.opacity = 0; SFX.pop();
  await A(z, [{top:(y-220)+'px',opacity:0},{top:(y-220)+'px',opacity:1,offset:.1},{top:y+'px',opacity:1,offset:.6},{top:(y-22)+'px',opacity:1,offset:.8},{top:y+'px',opacity:1}], 900, {easing:'ease-in'});
  SFX.write(); return z;
}

/* ---------- 수식 칩 · 태그 ---------- */
async function setEq(html, x=240, y=110, w=510){
  let e = $('eq'); if (!e){ e = mk('', x, y, '', 'eq'); e.style.opacity = 0; }
  css(e, {left:x+'px', top:y+'px', width:w+'px'});
  html = '<div>'+html+'</div>';
  if (INSTANT){ e.innerHTML = html; e.style.opacity = 1; return; }
  if (e.style.opacity !== '0') await A(e, {opacity:'0'}, 150);
  e.innerHTML = html; await A(e, {opacity:'1'}, 250);
}
async function fadeRm(els, dur=250){ els = els.filter(Boolean); await all(els.map(e=>A(e,{opacity:'0'},dur))); els.forEach(e=>e.remove()); }
const tagsRm = () => fadeRm([...fx.querySelectorAll('.tag')]);
async function tag(txt, x, y, id){ const t = mk('tag', x, y, txt, id); t.style.opacity = 0; await A(t, IN, 300); return t; }
async function tags(list){ await all(list.map(([t,x,y])=>tag(t,x,y))); }
async function showEl(e, dur=400){ e.style.opacity = 0; await A(e, IN, dur); return e; }

/* ---------- 블록 ---------- */
function blk(kind, x, y, id, red){
  const d = mk(kind+(red?' rr':'')+' ws', x, y, kind==='thou'?thouSVG():'', id);
  d.style.opacity = 0; return d;
}
const popIn = (els, stagger=20, dur=300) => all(els.map((e,i)=>A(e, POP, dur, {delay:i*stagger})));
async function flyTo(els, cx, cy, dur=750, stagger=35){
  SFX.swoosh();
  await all(els.map((e,i)=>A(e, {left:(cx-e.offsetWidth/2)+'px', top:(cy-e.offsetHeight/2)+'px', transform:'scale(.25)', opacity:'0'}, dur, {delay:i*stagger, easing:'cubic-bezier(.5,0,.3,1)'})));
  els.forEach(e=>e.remove());
}
async function emerge(kind, id, sx, sy, tx, ty, delay=0, red=true){
  const d = blk(kind, sx, sy, id, red);
  await A(d, [{left:sx+'px',top:sy+'px',opacity:0,transform:'scale(.2)'},{left:tx+'px',top:ty+'px',opacity:1,transform:'scale(1)'}], 750, {delay, easing:'cubic-bezier(.4,0,.2,1)'});
  return d;
}
async function cubesToRod(cubes, x, y, id){
  await all(cubes.map((c,k)=>A(c, {left:x+'px', top:(y+k*12)+'px'}, 380, {delay:k*22})));
  cubes.forEach(c=>c.remove());
  const r = blk('rod', x, y, id); r.style.opacity = 1; SFX.chak();
  await A(r, FLASH, 300); return r;
}
async function rodsToFlat(rods, x, y, id){
  await all(rods.map((r,k)=>A(r, {left:(x+k*12)+'px', top:y+'px'}, 460, {delay:k*30})));
  rods.forEach(r=>r.remove());
  const f = blk('flat', x, y, id); f.style.opacity = 1; SFX.chak();
  await A(f, FLASH, 320); return f;
}
// ×10 변신: 낱개 → 십막대, 십막대 → 백판
async function growTo(el, kind, x, y){
  const to = kind==='rod' ? {width:'12px', height:'120px'} : {width:'120px', height:'120px'};
  await A(el, {left:x+'px', top:y+'px', ...to}, 650);
  el.className = kind+' ws'; el.style.width = el.style.height = '';
  SFX.chak(); await A(el, FLASH, 260);
}
async function slideTo(els, x0, y, pitch=16){ await all(els.map((e,k)=>A(e, {left:(x0+k*pitch)+'px', top:y+'px'}, 450, {delay:k*25}))); }
function redden(els){ els.forEach(e=>e.classList.add('rr')); }
function ids(prefix, a, b){ const r=[]; for(let i=a;i<b;i++) r.push($(prefix+i)); return r; }
function thouSVG(){
  let l = '';
  for (let k=1;k<10;k++){
    l += `<line x1="${12*k}" y1="30" x2="${12*k}" y2="150"/><line x1="0" y1="${30+12*k}" x2="120" y2="${30+12*k}"/>`;
    l += `<line x1="${12*k}" y1="30" x2="${30+12*k}" y2="0"/><line x1="${3*k}" y1="${30-3*k}" x2="${120+3*k}" y2="${30-3*k}"/>`;
    l += `<line x1="${120+3*k}" y1="${30-3*k}" x2="${120+3*k}" y2="${150-3*k}"/><line x1="120" y1="${30+12*k}" x2="150" y2="${12*k}"/>`;
  }
  return `<svg viewBox="0 0 150 150" width="150" height="150" style="overflow:visible">
    <polygon points="0,30 30,0 150,0 120,30" style="fill:var(--block);filter:brightness(1.12)"/>
    <polygon points="120,30 150,0 150,120 120,150" style="fill:var(--block);filter:brightness(.82)"/>
    <rect x="0" y="30" width="120" height="120" style="fill:var(--block)"/>
    <g style="stroke:var(--blockEdge);stroke-width:1">${l}</g>
    <polygon points="0,30 30,0 150,0 150,120 120,150 0,150" style="fill:none;stroke:var(--blockEdge);stroke-width:2"/>
  </svg>`;
}

/* ---------- 직사각형(넓이) 모델 ---------- */
let RECT = null;
function buildRect(o){
  // o: {w, h, top, u}  top = 세로 중 '몇십' 부분(초록), 나머지 = 일의 자리 부분(파랑)
  const W = o.w*o.u, Ht = o.top*o.u, Hb = (o.h-o.top)*o.u;
  RECT = {...o, W, Ht, Hb, x: 30 + (740-W)/2 + 20, y: 150};
  const r = mk('rect', RECT.x, RECT.y, `
    <div class="part" id="pG" style="top:0;width:${W}px;height:${Ht}px;background-size:${o.u}px ${o.u}px;border-bottom-color:transparent"><div class="ptxt g" id="ptg"><span>${o.w} × ${o.top}</span></div></div>
    <div class="part" id="pB" style="top:${Ht}px;width:${W}px;height:${Hb}px;background-size:${o.u}px ${o.u}px;border-top-color:transparent"><div class="ptxt b" id="ptb"><span>${o.w} × ${o.h-o.top}</span></div></div>
    <div class="rlbl" id="lTop" style="left:0;top:-44px;width:${W}px;text-align:center">${o.w}</div>
    <div class="rlbl" id="lH" style="left:-66px;top:${(Ht+Hb)/2-20}px;width:54px;text-align:right">${o.h}</div>
    <div class="rlbl g" id="lT" style="left:-66px;top:${Ht/2-20}px;width:54px;text-align:right;opacity:0">${o.top}</div>
    <div class="rlbl b" id="lO" style="left:-66px;top:${Ht+16+Hb/2-20}px;width:54px;text-align:right;opacity:0">${o.h-o.top}</div>
  `, 'rect');
  css(r, {width:W+'px', height:(Ht+Hb+16)+'px'});
  return r;
}
async function revealRect(){
  const {x, y, W, Ht, Hb} = RECT;
  ['lTop','lH'].forEach(i=>$(i).style.opacity=0);
  const cv = mk('cover', x-4, y-4); css(cv, {width:(W+8)+'px', height:(Ht+Hb+8)+'px'});
  SFX.swoosh(); await A(cv, {top:(y+Ht+Hb+4)+'px', height:'0px'}, 1300, {easing:'linear'});
  cv.remove(); SFX.pop(); await all([A($('lTop'), IN, 300), A($('lH'), IN, 300)]);
}
async function cutRect(){
  const cut = document.createElement('div'); cut.className = 'cutline';
  css(cut, {top:(RECT.Ht-1)+'px', width:(RECT.W+48)+'px', transform:'scaleX(0)'}); $('rect').appendChild(cut);
  SFX.slash(); await A(cut, {transform:'scaleX(1)'}, 600);
  await all([A($('pB'), {top:(RECT.Ht+16)+'px'}, 500), A(cut, {opacity:'0'}, 400), A($('lH'), {opacity:'0'}, 300)]);
  cut.remove();
  $('pG').classList.add('g'); $('pB').classList.add('b'); $('pG').style.borderBottomColor = ''; $('pB').style.borderTopColor = '';
  SFX.pop(); await all([A($('lT'), IN, 300), A($('lO'), IN, 300), A($('ptg'), IN, 400), A($('ptb'), IN, 400)]);
}
async function toMini(active){
  const s = Math.min(150/RECT.W, 110/(RECT.Ht+RECT.Hb+16));
  await all([A($('rect'), {left:(50+66*s)+'px', top:(100+44*s)+'px', transform:`scale(${s})`}, 700), dimParts(active)]);
}
async function toFull(){ await all([A($('rect'), {left:RECT.x+'px', top:RECT.y+'px', transform:'scale(1)'}, 700), dimParts(null)]); }
async function dimParts(active){
  await all([A($('pG'), {opacity: active==='b'?'.28':'1'}, 400), A($('pB'), {opacity: active==='g'?'.28':'1'}, 400)]);
}
async function setPart(c, txt){ const t = $('pt'+c); t.innerHTML = `<span>${txt}</span>`; await pulse(t, 1.1); }
async function bands(list){
  const els = list.map(([c,y])=>{ const e = mk('band '+c, 885, y-36); e.style.opacity = 0; return e; });
  await all(els.map(e=>A(e, IN, 300))); return els;
}
