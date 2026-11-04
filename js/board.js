/* =========================================================
   board.js — 공책 보드 (칸 · 세로셈 쓰기 · 풀이 모션 · 펜)
   보드 안 좌표는 왼쪽 패널 기준 (패널 = 740 × 565)
   ========================================================= */
const BX = p => 92 + 68*(6-p);           // p: 0=일 1=십 2=백 3=천
const BY = {k2:25, k1:59, A:110, B:178, L1:212, ac:224, r1:246, r2:314, L2:348, S:382};

class Board {
  constructor(opts={}){
    this.opts = opts;
    const el = this.el = mk('panel pL board'+(opts.pen===false?' penoff':''), null, null, '', null, screenEl);
    mk('grid', null, null, '', null, el);
    if (opts.note) mk('bnote', null, null, opts.note, null, el);
    this.layer = mk('layer', null, null, '', null, el);
    if (opts.pen !== false) this.initPen();
  }
  /* ---------- 숫자 쓰기 ---------- */
  put(cls, x, y, txt, id){ const d = mk(cls, x, y, txt, id ? 'bd_'+id : null, this.layer); return d; }
  get(id){ return document.getElementById('bd_'+id); }
  clearLayer(){ this.layer.innerHTML = ''; }
  setProblem(a, b){
    this.clearLayer(); this.a = a; this.b = b;
    digitsOf(a).reverse().forEach((d,p)=>this.put('bd', BX(p), BY.A, String(d), 'A'+p));
    this.put('bd op', BX(4), BY.B, '×');
    digitsOf(b).reverse().forEach((d,p)=>this.put('bd', BX(p), BY.B, String(d), 'B'+p));
    this.put('bline', BX(4)-34, BY.L1-2, '', 'L1').style.width = '340px';
  }
  async write(p, row, txt, cls='', anim=true){
    const old = this.get(row+'p'+p); if (old) old.remove();
    const d = this.put('bd '+cls, BX(p), BY[row], txt, row+'p'+p);
    if (anim){ d.style.opacity = 0; SFX.write(); await A(d, POP, 380); }
    return d;
  }
  async carry(p, row, txt, anim=true){
    const x = row==='ac' ? BX(p)+16 : BX(p);
    const d = this.put('bk'+(row==='ac'?' ac':''), x, BY[row], txt, row+'c'+p);
    if (row==='ac'){ d.style.fontSize = '19px'; }
    if (anim){ d.style.opacity = 0; SFX.ppyong(); await A(d, POP, 380); }
    return d;
  }
  async slash(row, p=1){
    const k = this.get(row+'c'+p); if (!k) return;
    const s = this.put('bslash', parseFloat(k.style.left), parseFloat(k.style.top), '', row+'s'+p);
    s.style.transform = 'rotate(-55deg) scaleX(0)'; SFX.slash();
    await A(s, [{transform:'rotate(-55deg) scaleX(0)'},{transform:'rotate(-55deg) scaleX(1)'}], 260);
    await A(k, {opacity:'.45'}, 150);
  }
  async line(row){
    const L = this.put('bline', BX(4)-34, BY[row]-2, '', row); L.style.width = '340px'; L.style.transform = 'scaleX(0)';
    SFX.swoosh(); await A(L, {transform:'scaleX(1)'}, 380);
  }
  ask(p, row){
    this.unask();
    const isK = row[0]==='k' || row==='ac';
    const d = this.put((isK?'bk':'bd')+' ask', row==='ac'?BX(p)+16:BX(p), BY[row], '', 'ask');
    return d;
  }
  unask(){ const a = this.get('ask'); if (a) a.remove(); }
  hl(list, c){ this.unhl(); list.forEach(id=>{ const e = this.get(id); if (e) e.classList.add('hl-'+c); }); }
  unhl(){ this.layer.querySelectorAll('.hl-b,.hl-g,.hl-s,.hl-y,.hl-r').forEach(e=>e.classList.remove('hl-b','hl-g','hl-s','hl-y','hl-r')); }
  async act(x, anim=true){
    if (x.t==='dig')   return this.write(x.p, x.row, x.txt, x.cls, anim);
    if (x.t==='carry') return this.carry(x.p, x.row, x.txt, anim);
    if (x.t==='slash') return anim ? this.slash(x.row, x.p) : null;
    if (x.t==='line')  return this.line(x.row);
  }
  // 정답 세로셈을 한 줄씩 써 보이기
  async reveal(stages, gap=260){
    for (const st of stages){
      if (st.hl) this.hl(st.hl, st.hlc||'y');
      for (const x of st.acts){ await this.act(x); await wait(gap*.4); }
      await wait(gap);
    }
    this.unhl();
  }
  /* ---------- 펜 ---------- */
  initPen(){
    const cv = this.cv = document.createElement('canvas'); this.el.appendChild(cv);
    this.color = '#2A2A3C'; this.erase = false; this.penSeen = false;
    const size = () => {
      const r = this.el.getBoundingClientRect(); const k = Math.min(3, (r.width/740) * (devicePixelRatio||1));
      const img = this.ctx ? this.cv.toDataURL() : null;
      cv.width = Math.round(740*k); cv.height = Math.round(565*k);
      this.ctx = cv.getContext('2d'); this.ctx.setTransform(k,0,0,k,0,0); this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';
      if (img){ const im = new Image(); im.onload = ()=>this.ctx.drawImage(im, 0, 0, 740, 565); im.src = img; }
    };
    size(); this._resize = size; addEventListener('resize', size);
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX-r.left)*740/r.width, (e.clientY-r.top)*565/r.height]; };
    let drawing = null;
    cv.addEventListener('pointerdown', e=>{
      if (e.pointerType==='pen') this.penSeen = true;
      if (this.penSeen && e.pointerType==='touch') return;      // 펜을 쓰면 손바닥 터치는 무시
      cv.setPointerCapture(e.pointerId); drawing = e.pointerId; this.last = pos(e); this.dot(this.last, e);
    });
    cv.addEventListener('pointermove', e=>{
      if (drawing !== e.pointerId) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of (evs.length?evs:[e])){ const p = pos(ev); this.seg(this.last, p, ev); this.last = p; }
    });
    const end = e => { if (drawing === e.pointerId) drawing = null; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);

    const tools = mk('ptools', null, null, '', null, this.el);
    this.tPen = btn('on', '✏️', ()=>this.setPen(!this.penOn), tools); this.tPen.title = '펜 켜기/끄기';
    this.tCol = btn('', '⚫', ()=>{ this.erase = false; this.color = this.color==='#2A2A3C' ? '#E5484D' : '#2A2A3C'; this.tCol.textContent = this.color==='#2A2A3C' ? '⚫' : '🔴'; this.tEra.classList.remove('on'); this.setPen(true); }, tools);
    this.tEra = btn('', '🧽', ()=>{ this.erase = !this.erase; this.tEra.classList.toggle('on', this.erase); this.setPen(true); }, tools);
    btn('', '🗑', ()=>this.clearInk(), tools);
    this.penOn = true;
  }
  setPen(on){ this.penOn = on; this.el.classList.toggle('penoff', !on); if (this.tPen) this.tPen.classList.toggle('on', on); }
  width(e){ if (this.erase) return 28; return e.pointerType==='pen' ? 1.6 + 3.2*(e.pressure||.5) : 3.6; }
  dot(p, e){ const c = this.ctx; c.globalCompositeOperation = this.erase ? 'destination-out' : 'source-over'; c.fillStyle = this.color; c.beginPath(); c.arc(p[0], p[1], this.width(e)/2, 0, Math.PI*2); c.fill(); }
  seg(a, b, e){ const c = this.ctx; c.globalCompositeOperation = this.erase ? 'destination-out' : 'source-over'; c.strokeStyle = this.color; c.lineWidth = this.width(e); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  clearInk(){ if (this.ctx) this.ctx.clearRect(0, 0, 740, 565); }
  destroy(){ if (this._resize) removeEventListener('resize', this._resize); }
}

/* ---------- 풀이 단계 만들기 (따라 풀기 · 풀이 보기 공용) ---------- */
const PLACE = ['일','십','백','천','만'];
function solutionStages(a, b){
  const M = mulModel(a, b), S = [], two = M.rows.length===2;
  // 몇십 × 몇십 : 구구 → 0 붙이기
  if (a%10===0 && b%10===0 && a>=10 && b>=10){
    const x = a/10, y = b/10, base = x*y;
    const acts = []; digitsOf(M.ans).reverse().forEach((d,p)=>acts.push({t:'dig', p, row:'r1', txt:String(d), cls: p<2 ? 'g' : 'b'}));
    S.push({kind:'mul', say:`먼저 0을 떼고 <b>${x} × ${y} = ?</b>`, ans:base, cell:[2,'r1'], hl:['A1','B1'], hlc:'b', acts:[]});
    S.push({kind:'zeros', say:`${a}과 ${b}에 0이 하나씩, 모두 몇 개야? 0은 <b>몇 개</b> 붙일까?`, ans:2, cell:[0,'r1'], hl:['A0','B0'], hlc:'g', acts});
    return {M, S};
  }
  M.rows.forEach((r,i)=>{
    const row = i ? 'r2' : 'r1', kc = i ? 'k2' : 'k1';
    const col = two ? (i ? 'g' : 'b') : (r.shift ? 'g' : 'b');
    const mp = r.shift ? 1 : 0;            // 곱하는 수의 자리
    if (r.shift) S.push({kind:'zero', say:`이번엔 <b>${r.m}0</b>을 곱할 차례! ${r.m}0을 곱하면 끝에 0이 붙어. <b>일의 자리</b>에 먼저 쓸 수는?`, ans:0, cell:[0,row], hl:['B1'], hlc:col, acts:[{t:'dig', p:0, row, txt:'0', cls:col}]});
    if (!r.at){
      const acts = digitsOf(r.p).reverse().map((d,k)=>({t:'dig', p:r.shift+k, row, txt:String(d), cls:col}));
      S.push({kind:'mul', say:`<b>${r.ao} × ${r.m} = ?</b>`, ans:r.p, cell:[r.shift,row], hl:['A0','B'+mp], hlc:col, acts});
      return;
    }
    const a1 = [{t:'dig', p:r.shift, row, txt:String(r.p%10), cls:col}];
    if (r.c) a1.push({t:'carry', p:1, row:kc, txt:String(r.c)});
    S.push({kind:'mul', say:`<b>일의 자리: ${r.ao} × ${r.m} = ?</b>`, ans:r.p, cell:[r.shift,row], hl:['A0','B'+mp], hlc:col, acts:a1,
            after: r.c ? `<b>${r.p%10}</b>${J(r.p%10,'은','는')} 쓰고, <b class=r>${r.c}</b>${J(r.c,'은','는')} 십의 자리로 받아올려 작게 써 둬!` : null});
    const a2 = digitsOf(r.q).reverse().map((d,k)=>({t:'dig', p:r.shift+1+k, row, txt:String(d), cls:col}));
    if (r.c) a2.push({t:'slash', row:kc, p:1});
    S.push({kind: r.c ? 'mulc' : 'mul', say: r.c ? `<b>십의 자리: ${r.at} × ${r.m}</b>에 받아올린 <b class=r>${r.c}</b>까지 더하면?` : `<b>십의 자리: ${r.at} × ${r.m} = ?</b>`,
            ans:r.q, cell:[r.shift+1,row], hl: r.c ? ['A1','B'+mp, kc+'c1'] : ['A1','B'+mp], hlc:col, acts:a2});
  });
  if (two){
    S.push({acts:[{t:'line', row:'L2'}]});
    M.sum.cols.forEach(c=>{
      const parts = []; if (c.hasX) parts.push(c.dx); if (c.hasY) parts.push(c.dy);
      if (c.cin) parts.push(`<span class=r>${c.cin}</span>`);
      const say = (!c.hasX && !c.hasY)
        ? `${PLACE[c.col]}의 자리: 받아올린 <b class=r>${c.cin}</b>${J(c.cin,'은','는')} 그대로 내려 써. 몇을 쓸까?`
        : `덧셈 <b>${PLACE[c.col]}의 자리</b>: <b>${parts.join(' + ')}</b> = ?`;
      const acts = [{t:'dig', p:c.col, row:'S', txt:String(c.write), cls:'s'}];
      if (c.cout) acts.push({t:'carry', p:c.col+1, row:'ac', txt:String(c.cout)});
      const hl = []; if (c.hasX) hl.push('r1p'+c.col); if (c.hasY) hl.push('r2p'+c.col); if (c.cin) hl.push('acc'+c.col);
      S.push({kind: c.cin ? 'addc' : 'add', say, ans:c.s, cell:[c.col,'S'], hl, hlc:'s', acts,
              after: c.cout ? `<b>${c.write}</b>${J(c.write,'은','는')} 쓰고 <b class=r>${c.cout}</b>${J(c.cout,'은','는')} 다음 자리로 받아올림!` : null});
    });
  }
  return {M, S};
}
