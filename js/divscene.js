/* =========================================================
   divscene.js — 나눗셈 개념 장면 (2D 손그림)
   왼쪽: 나무 쟁반의 수 모형을 접시에 한 개씩 나눠 주기 / 오른쪽: 같은 색 세로식
   '진행'(무엇을 어디로, 질문, 세로식 맞추기)과 '그리기'(Piece·쟁반·접시)를 나눠 두어
   나중에 그리기만 three.js 등으로 바꿔 끼울 수 있다. (기획안 14장)
   ========================================================= */
(function(){
const NS = 'http://www.w3.org/2000/svg', INK = '#6B4A2E';
const PAL = { h:['#C3A7F0','#9C7BDA','#E6DAFB'], t:['#8ED3A9','#5FB283','#C9EED8'], o:['#9CC3F5','#6C96DB','#D3E5FC'], r:['#F5A493','#DA735E','#FBD3CA'] };
const PLACE = {h:'백', t:'십', o:'일'}, UNIT = {h:'백판', t:'십막대', o:'낱개'}, NEXT = {h:'t', t:'o'};
const COLCLS = {h:'s', t:'g', o:'b'};

/* ---------- 움직임 (화면이 바뀌면 SG가 달라져 멈춘다) ---------- */
const tweens = new Set();
let clockOff = 0; const now = () => performance.now() + clockOff;
const ease = p => p<.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;
const outBack = p => { const c1 = 1.7, c3 = c1+1; return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2); };
const tw = (dur, f) => new Promise(res=>tweens.add({t0:now(), dur:INSTANT ? 1 : dur/SPEED, f, res}));
const wait = ms => tw(ms, ()=>{});
function frame(){ const n = now(); for (const t of [...tweens]){ const p = Math.min(1, (n-t.t0)/t.dur); try { t.f(p); } catch(e){} if (p>=1){ tweens.delete(t); t.res(); } } }
(function loop(){ frame(); requestAnimationFrame(loop); })();
window.DT = { async step(sec){ for (let t=0; t<sec*1000; t+=16){ clockOff += 16; frame(); for (let k=0;k<6;k++) await Promise.resolve(); } } };

/* ---------- 손그림 도구 ---------- */
let SV = null;
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent||SV).appendChild(e); return e; }
let seed = 7; const rr = () => { seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; };
function wobblyCircle(cx, cy, r, amp=0.9){
  const p1 = rr()*6.28, p2 = rr()*6.28, n = 72; let d = '';
  for (let i=0;i<=n;i++){ const a = i/n*Math.PI*2, R = r + amp*(.6*Math.sin(3*a+p1) + .4*Math.sin(7*a+p2)); d += (i?'L':'M') + (cx+Math.cos(a)*R).toFixed(1) + ' ' + (cy+Math.sin(a)*R).toFixed(1); }
  return d + 'Z';
}
function wobblyRoundRect(x, y, w, h, r, amp=0.6){
  const tmp = el('path', {d:`M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 1 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`});
  const L = tmp.getTotalLength(), n = Math.max(40, Math.round(L/6)), cx = x+w/2, cy = y+h/2, p1 = rr()*6.28; let d = '';
  for (let i=0;i<=n;i++){ const pt = tmp.getPointAtLength(i/n*L), dx = pt.x-cx, dy = pt.y-cy, m = Math.hypot(dx,dy)||1, o = amp*Math.sin(i*0.21+p1);
    d += (i?'L':'M') + (pt.x+dx/m*o).toFixed(1) + ' ' + (pt.y+dy/m*o).toFixed(1); }
  tmp.remove(); return d + 'Z';
}
function mix(a, b, p){ const A = parseInt(a.slice(1),16), B = parseInt(b.slice(1),16); const ch = s => Math.round(((A>>s)&255)*(1-p) + ((B>>s)&255)*p);
  return '#'+[16,8,0].map(s=>ch(s).toString(16).padStart(2,'0')).join(''); }

/* ---------- 수 모형 조각 ----------
   kind: 'o' 낱개, 't' 십막대(가로로 눕힘), 'h' 백판. C = 한 칸 크기 */
let C = 13;
function cellG(g, pal, x, y){
  const c = el('g', {transform:`translate(${x},${y})`}, g);
  const f = el('rect', {x:0, y:0, width:C, height:C, rx:C*.2, fill:pal[0]}, c);
  const s = el('rect', {x:1, y:C*.64, width:C-2, height:C*.36-1, rx:C*.12, fill:pal[1]}, c);
  const h = el('path', {d:`M${C*.2} ${C*.55} V${C*.26} H${C*.62}`, fill:'none', stroke:pal[2], 'stroke-width':Math.max(1, C*.11), 'stroke-linecap':'round'}, c);
  el('rect', {x:0, y:0, width:C, height:C, rx:C*.2, fill:'none', stroke:INK, 'stroke-width':Math.max(1, C*.1)}, c);
  c._f = f; c._s = s; c._h = h; return c;
}
class Piece {
  constructor(kind, pal, parent){
    this.kind = kind; this.g = el('g', {}, parent.fg); this.cells = []; this.gap = 0;
    if (kind === 'h'){                         // 백판: 낱개 칸을 다 그리지 않고 판 하나 + 칸 선 (가볍게)
      const S = 10*C;
      this.base = el('rect', {x:0, y:0, width:S, height:S, rx:C*.3, fill:pal[0]}, this.g);
      let d = ''; for (let k=1;k<10;k++) d += `M${k*C} 1V${S-1}M1 ${k*C}H${S-1}`;
      this.lines = el('path', {d, stroke:INK, 'stroke-width':Math.max(.8, C*.08), opacity:.45}, this.g);
      el('path', {d:`M${C*.4} ${S*.5} V${C*.4} H${S*.5}`, fill:'none', stroke:pal[2], 'stroke-width':Math.max(1.2, C*.16), 'stroke-linecap':'round'}, this.g);
      el('rect', {x:0, y:0, width:S, height:S, rx:C*.3, fill:'none', stroke:INK, 'stroke-width':Math.max(1.4, C*.16)}, this.g);
    } else {
      const n = kind === 't' ? 10 : 1;
      for (let k=0;k<n;k++) this.cells.push(cellG(this.g, pal, k*C, 0));
      if (n > 1) this.frame = el('rect', {x:-.6, y:-.6, width:n*C+1.2, height:C+1.2, rx:C*.25, fill:'none', stroke:INK, 'stroke-width':Math.max(1.4, C*.15)}, this.g);
    }
    this.sh = el('rect', {width:this.W, height:this.H, rx:C*.3, fill:INK, opacity:.2}, parent.sh);
    this.x = 0; this.y = 0; this.hgt = 0; this.r = 0; this.s = 1;
  }
  get W(){ return this.kind === 'o' ? C : 10*C; }
  get H(){ return this.kind === 'h' ? 10*C : C; }
  layout(){ this.cells.forEach((c,k)=>c.setAttribute('transform', `translate(${k*C + (k-4.5)*this.gap},0)`)); }
  set(x, y){ this.x = x; this.y = y; this.draw(); return this; }
  draw(){
    const W = this.W, H = this.H, k = this.hgt;
    this.g.setAttribute('transform', `translate(${this.x},${this.y - k}) rotate(${this.r} ${W/2} ${H/2}) translate(${W/2} ${H/2}) scale(${this.s}) translate(${-W/2} ${-H/2})`);
    const ss = 1 - Math.min(.35, k/260);
    this.sh.setAttribute('transform', `translate(${this.x + 2.5 + k*.12},${this.y + 4}) translate(${W/2} ${H/2}) scale(${ss}) translate(${-W/2} ${-H/2})`);
    this.sh.setAttribute('opacity', (.2 * (1 - Math.min(.6, k/150))).toFixed(3));
  }
  async fly(x, y, dur=520, h=60, spin=0){
    const x0 = this.x, y0 = this.y;
    await tw(dur, p=>{ const e = ease(p); this.x = x0+(x-x0)*e; this.y = y0+(y-y0)*e; this.hgt = Math.sin(Math.PI*e)*h; this.r = Math.sin(Math.PI*e)*spin; this.draw(); });
    this.hgt = 0; this.r = 0;
    await tw(170, p=>{ this.s = 1 + .1*Math.sin(Math.PI*p); this.draw(); }); this.s = 1; this.draw();
  }
  recolor(pal, dur=420){
    if (this.kind === 'h'){ const f0 = this.base.getAttribute('fill'); return tw(dur, p=>this.base.setAttribute('fill', mix(f0, pal[0], p))); }
    const from = this.cells.map(c=>[c._f.getAttribute('fill'), c._s.getAttribute('fill'), c._h.getAttribute('stroke')]);
    return tw(dur, p=>this.cells.forEach((c,i)=>{ c._f.setAttribute('fill', mix(from[i][0], pal[0], p)); c._s.setAttribute('fill', mix(from[i][1], pal[1], p)); c._h.setAttribute('stroke', mix(from[i][2], pal[2], p)); }));
  }
  raise(){ this.g.parentNode.appendChild(this.g); }
  remove(){ this.g.remove(); this.sh.remove(); }
}

/* ---------- 장면 (쟁반 · 접시 · 라벨) ---------- */
const TRAY = {x:40, y:16, w:660, h:176};
function drawTray(){
  const g = el('g', {});
  el('rect', {x:TRAY.x+6, y:TRAY.y+12, width:TRAY.w, height:TRAY.h, rx:22, fill:'rgba(107,74,46,.10)'}, g);
  el('rect', {x:TRAY.x+3, y:TRAY.y+6, width:TRAY.w, height:TRAY.h, rx:22, fill:'rgba(107,74,46,.10)'}, g);
  el('path', {d:wobblyRoundRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 22, .5), fill:'#D49D61', stroke:INK, 'stroke-width':2.3, 'stroke-linejoin':'round'}, g);
  el('path', {d:`M${TRAY.x+24} ${TRAY.y+5} H${TRAY.x+TRAY.w-24}`, stroke:'#E8BE86', 'stroke-width':3, 'stroke-linecap':'round'}, g);
  const ix = TRAY.x+14, iy = TRAY.y+14, iw = TRAY.w-28, ih = TRAY.h-28;
  el('path', {d:wobblyRoundRect(ix, iy, iw, ih, 12, .4), fill:'#F0D4A7', stroke:'#B98149', 'stroke-width':1.6}, g);
  el('rect', {x:ix+2, y:iy+2, width:iw-4, height:9, rx:5, fill:'rgba(140,90,40,.13)'}, g);
  [ih/3, ih*2/3].forEach(o=>el('path', {d:`M${ix+6} ${iy+o} H${ix+iw-6}`, stroke:'#DDB27F', 'stroke-width':1.6}, g));
  for (let i=0;i<9;i++){ const y0 = iy + 10 + rr()*(ih-20), x0 = ix + 20 + rr()*(iw-200), L = 80 + rr()*120;
    el('path', {d:`M${x0} ${y0} c ${L*.3} ${-3-rr()*3}, ${L*.6} ${3+rr()*3}, ${L} 0`, fill:'none', stroke:'#E2BB86', 'stroke-width':1.3, 'stroke-linecap':'round'}, g); }
  [[TRAY.x+10,TRAY.y+10],[TRAY.x+TRAY.w-10,TRAY.y+10],[TRAY.x+10,TRAY.y+TRAY.h-10],[TRAY.x+TRAY.w-10,TRAY.y+TRAY.h-10]].forEach(([x,y])=>{
    el('circle', {cx:x, cy:y, r:3.4, fill:'#C9A04A', stroke:INK, 'stroke-width':1.1}, g); el('circle', {cx:x-1, cy:y-1, r:1, fill:'#FFF3C4'}, g); });
}
function drawPlate(cx, cy, R, kind='plate'){
  const g = el('g', {});
  el('circle', {cx:cx+4, cy:cy+9, r:R+1, fill:'rgba(107,74,46,.09)'}, g);
  el('circle', {cx:cx+2, cy:cy+5, r:R, fill:'rgba(107,74,46,.12)'}, g);
  if (kind === 'bag'){        // 봉지 (묶어 담기)
    el('path', {d:wobblyCircle(cx, cy, R), fill:'#FFF3D6', stroke:INK, 'stroke-width':2.3}, g);
    el('path', {d:`M${cx-R*.55} ${cy-R*.78} Q${cx} ${cy-R*1.08} ${cx+R*.55} ${cy-R*.78}`, fill:'none', stroke:'#E5484D', 'stroke-width':3, 'stroke-linecap':'round'}, g);
  } else {
    el('path', {d:wobblyCircle(cx, cy, R), fill:'#FFFFFF', stroke:INK, 'stroke-width':2.3}, g);
    el('circle', {cx, cy, r:R-6.5, fill:'none', stroke:'#86A9D9', 'stroke-width':2}, g);
    el('circle', {cx, cy, r:R-10.5, fill:'none', stroke:'#A9C2E6', 'stroke-width':1.6, 'stroke-dasharray':'1.5 5', 'stroke-linecap':'round'}, g);
    el('circle', {cx, cy, r:R-15, fill:'url(#dvwell)', stroke:'#E0D0B6', 'stroke-width':1.5}, g);
    const a0 = Math.PI*1.08, a1 = Math.PI*1.38, rr2 = R-3.2;
    el('path', {d:`M${cx+Math.cos(a0)*rr2} ${cy+Math.sin(a0)*rr2} A${rr2} ${rr2} 0 0 1 ${cx+Math.cos(a1)*rr2} ${cy+Math.sin(a1)*rr2}`, fill:'none', stroke:'#fff', 'stroke-width':3, 'stroke-linecap':'round', opacity:.95}, g);
  }
  const glow = el('circle', {cx, cy, r:R+3, fill:'none', stroke:'#FFC93C', 'stroke-width':5, opacity:0}, g);
  return {g, glow};
}
const flash = e => tw(420, p=>e.setAttribute('opacity', (.85*(1-p)).toFixed(3)));
function label(x, y, red, small){
  const g = el('g', {class:'dvlb'+(small?' s':''), opacity:0});
  const r = el('rect', {y:y-(small?14:19), height:small?28:38, rx:small?14:19, fill:'#fff', stroke: red ? '#D9534F' : INK, 'stroke-width':2.3}, g);
  const t = el('text', {x, y:y+1, 'text-anchor':'middle', 'dominant-baseline':'central', fill: red ? '#C0392B' : '#2A2A3C'}, g);
  g.setText = (s, bump=true) => { t.textContent = s; const w = Math.max(small?40:54, t.getComputedTextLength() + 26); r.setAttribute('x', x - w/2); r.setAttribute('width', w); g.setAttribute('opacity', 1);
    if (bump && !INSTANT) tw(240, p=>g.setAttribute('transform', `translate(${x} ${y}) scale(${1+.18*Math.sin(Math.PI*p)}) translate(${-x} ${-y})`)); };
  return g;
}
function spotlight(x, y, w, h){ const e = el('rect', {x, y, width:w, height:h, rx:14, fill:'#FFE07A', opacity:0}, SV.querySelector('#dvspots')); tw(300, p=>e.setAttribute('opacity', (.42*p).toFixed(3))); return e; }
function unspot(e){ if (e) tw(250, p=>e.setAttribute('opacity', (.42*(1-p)).toFixed(3))).then(()=>e.remove()); }
function sparks(x, y){
  const g = el('g', {stroke:INK, 'stroke-width':1.6, 'stroke-linecap':'round'});
  for (let k=0;k<3;k++){ const a = -Math.PI/2 + (k-1)*0.6, x1 = x + Math.cos(a)*9, y1 = y + Math.sin(a)*9; el('path', {d:`M${x1} ${y1} L${x1+Math.cos(a)*7} ${y1+Math.sin(a)*7}`}, g); }
  tw(360, p=>g.setAttribute('opacity', (1-p).toFixed(3))).then(()=>g.remove());
}

/* ---------- 오른쪽 세로식 (divLayout과 같은 자리) ---------- */
class DivForm {
  constructor(pr, a, d){
    this.L = divLayout(a, d); this.M = this.L.M; const n = this.M.n;
    this.CS = n === 3 ? 56 : 64; this.RH = n === 3 ? 52 : 64;
    const W = (n+1)*this.CS; this.X0 = Math.round((460 - W)/2) + this.CS/2; this.Y0 = n === 3 ? 58 : 70;
    this.box = mk('dvform', null, null, '', null, pr);
    const CS = this.CS, RH = this.RH, cols = n+1, gx0 = this.X0 - CS/2, gy0 = this.Y0 - RH/2;
    let h = ''; for (let x = gx0 - CS*2; x <= 460; x += CS) h += `<line x1="${x}" y1="0" x2="${x}" y2="565"/>`;
    for (let y = gy0 - RH; y <= 565; y += RH) h += `<line x1="0" y1="${y}" x2="460" y2="${y}"/>`;
    const bx = this.X0 + CS/2, by0 = this.Y0 + RH/2, by1 = this.Y0 + RH*1.5;
    this.box.innerHTML = `<div class="dvbands"></div><svg width="460" height="565"><g stroke="#EFE5D3" stroke-width="2">${h}</g>
      <path d="M${bx} ${by0} Q${bx+20} ${(by0+by1)/2} ${bx} ${by1} M${bx} ${by0} L${bx + n*CS + 12} ${by0}" fill="none" stroke="#2A2A3C" stroke-width="4" stroke-linecap="round"/>
      <g class="arrows"></g><g class="flines"></g></svg><div class="dvdigits"></div><div class="dvchk"></div>`;
    this.digits = this.box.querySelector('.dvdigits'); this.arrows = this.box.querySelector('.arrows'); this.flines = this.box.querySelector('.flines');
    this.bands = this.box.querySelector('.dvbands');
    this.place = col => ['h','t','o'].slice(3-n)[col];
    this.dg(-1, 1, String(d), 'k', false);
    this.M.ds.forEach((v,i)=>this.dg(i, 1, String(v), COLCLS[this.place(i)], false));
  }
  cx(col){ return this.X0 + (col+1)*this.CS; }
  cy(row){ return this.Y0 + row*this.RH; }
  dg(col, row, txt, cls='k', anim=true){
    const e = mk('ldg '+cls+(anim && !INSTANT ? ' pop' : ''), null, null, txt, null, this.digits);
    css(e, {left:this.cx(col)+'px', top:this.cy(row)+'px', width:this.CS+'px', height:this.CS+'px', fontSize:(this.CS*.74)+'px'}); if (anim) SFX.write && SFX.write(); return e;
  }
  band(col, c0 = col){ this.bands.innerHTML = ''; if (col === null) return; const b = mk('cband '+COLCLS[this.place(col)], null, null, '', null, this.bands);   // c0~col: 앞자리와 합쳐 나눌 때는 두 칸을 함께 비춘다
    css(b, {left:(this.cx(c0)-this.CS*.46)+'px', width:(this.cx(col)-this.cx(c0)+this.CS*.92)+'px', top:(this.cy(0)-this.RH*.46)+'px', height:(this.cy(this.L.rows-1)-this.cy(0)+this.RH*.92)+'px'}); }
  // step 번째 몫 자리를 다 나눴을 때 쓰는 칸들
  async writeStep(k){
    const cs = this.L.cells.filter(c=>c.step === k && c.row >= 0);
    const order = ['q','prod','sub','rem'];
    for (const role of order){
      const list = cs.filter(c=>c.role === role); if (!list.length) continue;
      for (const c of list) this.dg(c.col, c.row, c.txt, role === 'q' ? COLCLS[this.place(c.col)] : (role === 'prod' ? COLCLS[this.place(this.M.steps[k].i)] : (role === 'rem' && c.txt !== '0' ? 'r' : (role === 'sub' ? 'r' : 'k'))));
      if (role === 'prod'){ const ln = this.L.lines.find(l=>l.row === list[0].row); if (ln) this.line(ln); }
      await wait(240);
    }
  }
  line(ln){ const x0 = this.cx(ln.c0) - this.CS*.42, x1 = this.cx(ln.c1) + this.CS*.42, y = this.cy(ln.row) + this.RH*.5;
    const l = document.createElementNS(NS, 'line'); Object.entries({x1:x0, y1:y, x2:x0, y2:y, stroke:'#2A2A3C', 'stroke-width':4, 'stroke-linecap':'round'}).forEach(([k,v])=>l.setAttribute(k,v)); this.flines.appendChild(l);
    tw(380, p=>l.setAttribute('x2', x0 + (x1-x0)*ease(p))); }
  async down(k){   // 다음 자리 숫자 내려 쓰기 (점선 화살표)
    const c = this.L.cells.find(x=>x.step === k && x.role === 'down'); if (!c) return;
    const x = this.cx(c.col) + this.CS*.36, y0 = this.cy(1) + this.RH*.3, y1 = this.cy(c.row) - this.RH*.3;
    const p = document.createElementNS(NS, 'path'); Object.entries({d:`M${x} ${y0} C ${x+22} ${y0+30}, ${x+22} ${y1-30}, ${x} ${y1}`, fill:'none', stroke:'#E5484D', 'stroke-width':3, 'stroke-dasharray':'6 6'}).forEach(([k,v])=>p.setAttribute(k,v)); this.arrows.appendChild(p);
    this.dg(c.col, c.row, c.txt, COLCLS[this.place(c.col)]); await wait(280);
  }
  check(html){ const e = this.box.querySelector('.dvchk'); e.innerHTML = html; css(e, {top:(this.cy(this.L.rows) + 4)+'px'}); e.classList.add('on'); }
}

/* ---------- 한 문제를 접시에 나눠 보이는 장면 ---------- */
// 자리 이름: 세 자리면 h,t,o / 두 자리면 t,o
async function dealEpisode(a, d, o={}){
  const sg = SG, alive = () => sg === SG;
  const ds = String(a).split('').map(Number), n = ds.length, places = ['h','t','o'].slice(3-n);
  C = n === 3 ? (d >= 4 ? 7 : 9) : (d >= 5 ? 10 : 13);   // 접시가 5개 이상이면 접시가 작아져서 십막대도 줄인다
  // 화면
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const pl = mk('panel pL dvscene', null, null, '', null, screenEl);
  pl.innerHTML = `<svg viewBox="0 0 740 565" width="740" height="565"><defs><radialGradient id="dvwell" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#FFFCF6"/><stop offset="1" stop-color="#F1E7D6"/></radialGradient></defs></svg>`;
  SV = pl.firstChild; seed = 7;
  const pr = mk('panel pR', null, null, '', null, screenEl);
  if (o.badge) mk('dvbadge', null, null, o.badge, null, pr);
  const F = new DivForm(pr, a, d);
  TRAY.h = n === 3 ? 206 : 176;
  drawTray(); el('g', {id:'dvspots'});
  const sp = Math.min(240, 712/d), R = Math.min(108, sp/2 - 7), cy = n === 3 ? 372 : 344;
  const plates = []; for (let i=0;i<d;i++){ const cx = 370 + (i-(d-1)/2)*sp; plates.push({cx, cy, ...drawPlate(cx, cy, R)}); }
  const lbl = plates.map(p=>label(p.cx, cy + R + 30));
  const layer = {sh:el('g', {}), fg:el('g', {})};
  const trayLbl = label(TRAY.x + TRAY.w/2, TRAY.y + TRAY.h + 2, false, true);
  // 쟁반 안 자리: 백판 → 십막대(두 줄로 쌓기) → 낱개(남은 폭에 격자)
  const IX = TRAY.x + 24, IY = TRAY.y + 22, IW = TRAY.w - 48, IH = TRAY.h - 44;
  const cnt = {h:0, t:0, o:0};
  const slot = {
    h: k => [IX + k*(10*C+8), IY],
    t: k => { const x0 = IX + (cnt0.h ? cnt0.h*(10*C+8) + 6 : 0), per = Math.max(1, Math.floor((IH+6)/(C+6))); return [x0 + Math.floor(k/per)*(10*C+8), IY + (k%per)*(C+6)]; },
    o: k => {
      if (n === 3){   // 세 자리: 낱개는 백판 아래 띠에
        const cols = Math.max(8, Math.floor((Math.max(cnt0.h,2)*(10*C+8) - 8)/(C+5)));
        return [IX + (k%cols)*(C+5), IY + 10*C + 12 + Math.floor(k/cols)*(C+5)];
      }
      const tcols = cnt0.t ? Math.ceil(cnt0.t / Math.max(1, Math.floor((IH+6)/(C+6)))) : 0;
      const x0 = IX + tcols*(10*C+8) + 10, cols = Math.max(4, Math.floor((IX + IW - x0)/(C+5)));
      return [x0 + (k%cols)*(C+5), IY + 4 + Math.floor(k/cols)*(C+6)]; },
  };
  // 쟁반 자리 계산의 기준: 처음 개수(십막대는 백판을 바꿀 때 늘어남 → 최대 개수로 자리 잡기)
  const M = divModel(a, d), cnt0 = {h:0, t:0, o:0};
  places.forEach((p,i)=>cnt0[p] = ds[i]);
  { let carry = 0; places.forEach((p,i)=>{ const pool = carry*10 + ds[i]; cnt0[p] = Math.max(cnt0[p], pool); carry = pool % d; if (i === 0 && pool < d) carry = pool; }); }
  const pool = {h:[], t:[], o:[]};
  places.forEach((p,i)=>{ for (let k=0;k<ds[i];k++){ const [x,y] = slot[p](k); pool[p].push(new Piece(p, PAL[p], layer).set(x, y)); } });
  const trayCount = () => trayLbl.setText('쟁반: ' + places.map(p=>`${UNIT[p]} ${pool[p].length}`).join(' · '), false);
  trayCount();
  // 접시 위 자리: 백판 → 십막대(가로로 눕혀 쌓기) → 낱개 (6개씩 줄)
  const qd = {h:0, t:0, o:0}; M.steps.forEach(s=>qd[places[s.i]] = s.q);
  const HT = (qd.h ? 10*C + 6 : 0) + qd.t*(C+4) + (qd.o ? 6 + Math.ceil(qd.o/6)*(C+3) : 0), TOP = cy - HT/2;
  const at = {
    h: (i, r) => [plates[i].cx - 5*C + r*3, TOP],
    t: (i, r) => [plates[i].cx - 5*C, TOP + (qd.h ? 10*C + 6 : 0) + r*(C+4)],
    o: (i, r) => { const per = 6, row = Math.floor(r/per), col = r%per; return [plates[i].cx - (per*(C+3)-3)/2 + col*(C+3), TOP + (qd.h ? 10*C + 6 : 0) + qd.t*(C+4) + 6 + row*(C+3)]; },
  };
  const on = plates.map(()=>({h:0, t:0, o:0}));
  const setCnt = i => lbl[i].setText(String(on[i].h*100 + on[i].t*10 + on[i].o));
  const areaOf = p => { const ps = pool[p]; if (!ps.length) return null; const xs = ps.map(q=>q.x), ys = ps.map(q=>q.y); return [Math.min(...xs)-8, Math.min(...ys)-8, Math.max(...xs)-Math.min(...xs)+ps[0].W+16, Math.max(...ys)-Math.min(...ys)+ps[0].H+16]; };

  const ask = async (opts, ans, why) => {
    let tries = 0;
    while (alive()){
      const v = await new Promise(res=>setCtrls(...opts.map(x=>btn('pill opt', `${x}개`, ()=>res(x)))));
      if (!alive()) return;
      if (v === ans){ SFX.right(); return; }
      tries++; SFX.wrong(); say(why(v) + (tries>=2 ? `<br>정답은 <b>${ans}개</b>야!` : ''), 'comfort');
      if (tries>=2){ await wait(1500); return; }
    }
  };
  const next = label => new Promise(res=>setCtrls(btn('pill nudge', label, ()=>{ setCtrls(); res(); })));

  if (o.intro !== false){
    say(`<b>${a}</b>${J(a,'을','를')} 접시 <b>${d}</b>개에 똑같이 나누어 볼까? ${places.map((p,i)=>ds[i] ? `${UNIT[p]} ${ds[i]}개` : '').filter(Boolean).join(', ')}가 있어. <b>큰 것부터</b> 나눠!`, 'hello');
    await next('시작 ▶'); if (!alive()) return;
  }
  let stepIdx = 0;
  for (let pi=0; pi<places.length; pi++){
    const p = places[pi], have = pool[p].length, last = pi === places.length-1;
    const st = M.steps.find(s=>s.i === pi);
    F.band(pi, st && st.first ? 0 : pi);
    if (!st){
      // 맨 앞자리가 나누는 수보다 작음 → 몫 자리 없이 다음 자리로 바꾸기
      let spot = spotlight(...areaOf(p));
      say(`${UNIT[p]} <b>${have}개</b>로는 접시 <b>${d}</b>개에 하나씩도 못 줘! ${UNIT[p]}${J(UNIT[p],'을','를')} 모두 ${UNIT[NEXT[p]]}로 바꿔서 나눠 보자. 그래서 몫은 <b>${PLACE[NEXT[p]]}의 자리부터</b> 시작해.`, 'focus');
      await next('바꿔 보기 ▶'); if (!alive()) return; unspot(spot);
      await convert(p, pool[p].slice()); if (!alive()) return;
      continue;
    }
    const q = st.q;
    if (have){
      let spot = spotlight(...areaOf(p));
      if (q === 0 && !st.first){
        say(`${UNIT[p]} <b>${have}개</b>는 접시 <b>${d}</b>개에 하나씩도 못 줘. 그래서 몫의 ${PLACE[p]}의 자리는 <b>0</b>!`, 'focus');
        await next('다음 ▶'); if (!alive()) return; unspot(spot);
      } else {
        say(`${UNIT[p]} <b class=${COLCLS[p]}>${have}개</b>를 접시 <b>${d}</b>개에 똑같이 나누면, 한 접시에 <b>몇 개씩</b> 줄 수 있을까?`, 'think');
        await ask([q-1, q, q+1].filter(x=>x>=1), q, v => v > q ? `${v}개씩이면 ${UNIT[p]}${J(UNIT[p],'이','가')} ${v*d}개 필요해. ${have}개뿐이라 모자라!` : `${v}개씩 주고도 ${have - v*d}개가 남아. 한 바퀴 더 줄 수 있어!`);
        if (!alive()) return; unspot(spot); say(`맞아! 한 개씩 차례로 나눠 줄게.`, 'praise');
        // 한 바퀴씩: 접시마다 하나씩 차례로 날아가되 앞 조각이 닿기 전에 다음 조각이 출발 (첫 바퀴는 천천히 보여 주고 점점 빠르게)
        for (let r=0;r<q;r++){
          const gap = r===0 ? 200 : r===1 ? 110 : 75, dur = r===0 ? 440 : r===1 ? 340 : 290;
          await Promise.all(Array.from({length:d}, (_,i)=>{
            const pc = pool[p].shift(); pc.raise(); const [x,y] = at[p](i, on[i][p]); on[i][p]++;
            return wait(i*gap).then(()=>pc.fly(x, y, dur, p==='o' ? 56 : 80, p==='o' ? (i%2?1:-1)*12 : 0)).then(()=>{ if (!alive()) return; SFX.tap && SFX.tap(); flash(plates[i].glow); setCnt(i); trayCount(); });
          }));
          if (!alive()) return;
        }
      }
    } else {
      say(`${UNIT[p]}${J(UNIT[p],'은','는')} 하나도 없어. 그래서 몫의 ${PLACE[p]}의 자리는 <b>0</b>!`, 'focus'); await next('다음 ▶'); if (!alive()) return;
    }
    await F.writeStep(stepIdx); if (!alive()) return;
    const left = pool[p].slice();
    if (!last){
      if (left.length){
        await Promise.all(left.map(x=>x.recolor(PAL.r, 320)));
        say(`${UNIT[p]} <b class=r>${left.length}개</b>가 남았어. 이건 접시 <b>${d}</b>개에 똑같이 못 나눠. 어떻게 할까?`, 'think');
        const v = await new Promise(res=>setCtrls(btn('pill opt', `${UNIT[NEXT[p]]}로 바꿔요`, ()=>res('s')), btn('pill opt', '그냥 둬요', ()=>res('k'))));
        if (!alive()) return;
        if (v === 'k'){ SFX.wrong(); say(`그대로 두면 똑같이 나누지 못한 게 너무 많아! ${UNIT[p]} 1개는 <b>${UNIT[NEXT[p]]} 10개</b>와 같으니까 바꿔서 나눠 보자.`, 'comfort'); await next('바꿔 보기 ▶'); if (!alive()) return; }
        else SFX.right();
        await convert(p, left); if (!alive()) return;
      }
      await F.down(stepIdx+1); if (!alive()) return;
      const nx = NEXT[p];
      if (pool[nx].length) say(`${UNIT[nx]}${J(UNIT[nx],'이','가')} 모두 <b class=${COLCLS[nx]}>${pool[nx].length}개</b>! 세로식에서는 다음 자리 숫자를 <b>내려 써서</b> ${pool[nx].length}${J(pool[nx].length,'을','를')} 나눠.`, 'explain');
      await wait(1900);   // 내려 쓰기 설명을 읽을 시간
    }
    stepIdx++;
  }
  F.band(null);
  const Q = Math.floor(a/d), Rm = a%d, rest = pool.o;
  if (Rm){
    await Promise.all(rest.map(c=>c.recolor(PAL.r, 320)));
    const LX = TRAY.x + TRAY.w/2, LY = TRAY.y + 70;
    await Promise.all(rest.map((c,k)=>wait(k*55).then(()=>c.fly(LX - C/2 + (k-(rest.length-1)/2)*(C+6), LY, 400, 30))));
    const ring = el('ellipse', {cx:LX, cy:LY + C/2, rx:22 + rest.length*(C*.7), ry:20, fill:'none', stroke:'#D9534F', 'stroke-width':2, 'stroke-dasharray':'5 5', opacity:0}, SV.querySelector('#dvspots'));
    tw(300, p=>ring.setAttribute('opacity', p.toFixed(2)));
    label(LX, LY + 46, true, true).setText(`남은 것 ${Rm}`);
  }
  if (!alive()) return;
  SFX.ding();
  say(Rm ? `한 접시에 <b>${Q}</b>개씩, <b class=r>${Rm}개</b>가 남아. 남은 것이 접시 수 <b>${d}</b>보다 작으니 더는 못 나눠! 남은 <b class=r>${Rm}</b>${J(Rm,'을','를')} <b>나머지</b>라고 해. <b>${a} ÷ ${d} = ${Q} … ${Rm}</b> (몫 ${Q}, 나머지 ${Rm})`
         : `한 접시에 <b>${Q}</b>개씩, 남는 것 없이 똑같이 나눴어! <b>${a} ÷ ${d} = ${Q}</b>`, Rm ? 'surprise' : 'praise');
  if (o.check !== false){
    await next('맞는지 확인 ▶'); if (!alive()) return;
    for (let i=0;i<d;i++){ flash(plates[i].glow); lbl[i].setText(String(Q)); SFX.write && SFX.write(); await wait(150); }
    F.check(Rm ? `확인: ${d} × ${Q} + ${Rm} = ${a}` : `확인: ${d} × ${Q} = ${a}`); SFX.ding();
    Store.ev('verify.inverse', {a, d});
    say(Rm ? `<b>${Q}</b>개짜리 접시가 <b>${d}</b>개면 ${d*Q}, 남은 <b class=r>${Rm}</b>${J(Rm,'을','를')} 더하면 <b>${a}</b>! 처음 수와 같으니 맞았어.`
           : `<b>${Q}</b>개짜리 접시가 <b>${d}</b>개면 <b>${d} × ${Q} = ${a}</b>. 처음 수와 같으니 맞았어!`, 'cheer');
  }
  return true;

  // p 자리 조각들을 한 단계 아래 자리 10개씩으로 바꾸기
  async function convert(p, list){
    const nx = NEXT[p];
    for (const [ci, pc] of list.entries()){
      const f = ci === 0 ? .8 : .55;   // 첫 번째 바꾸기는 또렷하게, 나머지는 빠르게
      pc.raise();
      const mx = TRAY.x + TRAY.w/2 - pc.W/2, my = p === 'h' ? TRAY.y + 20 : TRAY.y + 64;
      await pc.fly(mx, my, 520*f, 36); if (!alive()) return;
      await tw(300*f, q=>{ pc.r = Math.sin(q*Math.PI*6)*4*(1-q); pc.draw(); }); SFX.pop && SFX.pop();
      let parts;
      if (p === 't'){
        for (let k=1;k<10;k++) sparks(pc.x + k*C, pc.y + C/2);
        if (pc.frame) tw(200*f, q=>pc.frame.setAttribute('opacity', (1-q).toFixed(2)));
        await tw(420*f, q=>{ pc.gap = 6*outBack(q); pc.layout(); });
        await pc.recolor(PAL.o, 380*f); if (!alive()) return;
        parts = pc.cells.map((c,k)=>new Piece('o', PAL.o, layer).set(pc.x + k*C + (k-4.5)*pc.gap, pc.y));
      } else {
        for (let k=1;k<10;k++) sparks(pc.x + 5*C, pc.y + k*C);
        await pc.recolor(PAL.t, 380*f); if (!alive()) return;
        parts = Array.from({length:10}, (_,k)=>new Piece('t', PAL.t, layer).set(pc.x, pc.y + k*C));
        await Promise.all(parts.map((q,k)=>tw(380*f, e=>{ q.y = pc.y + k*C + (k-4.5)*5*outBack(e); q.draw(); })));
      }
      pc.remove(); pool[p].splice(pool[p].indexOf(pc), 1);
      const k0 = pool[nx].length;
      await Promise.all(parts.map((q,k)=>wait(k*30*f).then(()=>{ const [x,y] = slot[nx](k0+k); return q.fly(x, y, 480*f, 36, nx==='o' ? (k%2?1:-1)*14 : 0); })));
      pool[nx].push(...parts); trayCount();
    }
  }
}

window.DivScene = { dealEpisode, DivForm, wait, tw, label, Piece, drawPlate, drawTray, el:(...a)=>el(...a), setSV:s=>{ SV = s; seed = 7; }, setC:c=>{ C = c; }, PAL, flash };
})();
