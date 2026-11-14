/* =========================================================
   divpractice.js — 나눗셈 바다: 공책 보드 · 원리 차례 · 따라 풀기 · 연습 · 확인 · 보물섬 활동
   ========================================================= */

/* 나눗셈 바다: 아래 버튼을 한 번 누르면 나머지 버튼은 잠근다 (애니메이션 도중 다시 눌러 헷갈리지 않게).
   새 버튼이 나오면 setCtrls가 통째로 바꾸므로 따로 풀 필요 없음. '풀이 보기'처럼 여러 번 눌러도 되는 버튼은 data-keep */
$('ctrls').addEventListener('click', e=>{
  if (Store.sea !== 'div') return;
  const b = e.target.closest('button'); if (!b || b.dataset.keep) return;
  if (!document.querySelector('#screen .dvscene') && !b.classList.contains('opt')) return;   // 원리 장면과 보기 고르기 버튼에만
  // 누른 순간에 있던 버튼만 잠근다 (누른 뒤 새로 나온 버튼은 그대로 쓸 수 있게)
  const olds = [...$('ctrls').querySelectorAll('button')].filter(x=>!x.dataset.keep);
  olds.forEach(x=>{ if (x !== b){ x.disabled = true; x.classList.add('used'); } });
  setTimeout(()=>{ if (b.isConnected){ b.disabled = true; b.classList.add('used'); } }, 0);
}, true);

/* ---------- 나눗셈 공책 보드 (펜 + 세로식 칸) ---------- */
const DCLS = {h:'s', t:'g', o:'b'};
const keep = b => { b.dataset.keep = '1'; return b; };
class DivBoard extends Board {
  constructor(opts={}){ super(opts); this.grid = this.el.querySelector('.grid'); this.grid.innerHTML = ''; }
  setProblem(a, d){
    this.clearLayer(); this.a = a; this.d = d; this.L = divLayout(a, d); const n = this.L.M.n;
    this.CS = n === 3 ? 58 : 62; this.RH = n === 3 ? 56 : 62;
    const W = (n+1)*this.CS; this.X0 = Math.round((740 - W)/2 + 50) + this.CS/2; this.Y0 = 66;
    this.place = col => ['h','t','o'].slice(3-n)[col];
    // 모눈: 숫자 칸 가운데에 맞춘 선 (칸 크기와 시작점 하나로 계산)
    const CS = this.CS, RH = this.RH, gx = this.X0 - CS/2, gy = this.Y0 - RH/2; let h = '';
    for (let x = gx - Math.ceil(gx/CS)*CS; x <= 740; x += CS) h += `<line x1="${x}" y1="0" x2="${x}" y2="565"/>`;
    for (let y = gy - Math.ceil(gy/RH)*RH; y <= 565; y += RH) h += `<line x1="0" y1="${y}" x2="740" y2="${y}"/>`;
    this.grid.innerHTML = `<svg width="740" height="565" style="position:absolute;left:0;top:0"><g stroke="#D7E6F7" stroke-width="2">${h}</g></svg>`;
    Object.assign(this.el.dataset, {cs:CS, rh:RH, gx:gx, gy:gy});
    const bx = this.X0 + CS/2, y0 = this.Y0 + RH/2, y1 = this.Y0 + RH*1.5;
    const sv = mk('', 0, 0, `<svg width="740" height="565"><path d="M${bx} ${y0} Q${bx+20} ${(y0+y1)/2} ${bx} ${y1} M${bx} ${y0} L${bx + n*CS + 12} ${y0}" fill="none" stroke="#2A2A3C" stroke-width="4" stroke-linecap="round"/><g class="dl"></g></svg>`, 'bd_frame', this.layer);
    css(sv, {pointerEvents:'none'}); this.dl = sv.querySelector('.dl');
    this.cell(-1, 1, String(d), 'k');
    this.L.M.ds.forEach((v,i)=>this.cell(i, 1, String(v), DCLS[this.place(i)]));
  }
  cx(col){ return this.X0 + (col+1)*this.CS; }
  cy(row){ return this.Y0 + row*this.RH; }
  cell(col, row, txt, cls='k', anim=false){
    const old = this.get(`c${row}_${col}`); if (old) old.remove();
    const e = this.put('bd '+cls, this.cx(col), this.cy(row), txt, `c${row}_${col}`);
    if (this.CS < 60) css(e, {fontSize:'44px'});
    if (anim && !INSTANT){ e.style.opacity = 0; SFX.write(); A(e, POP, 360).catch(()=>{}); }
    return e;
  }
  clsOf(c){
    const M = this.L.M;
    if (c.role === 'q') return DCLS[this.place(c.col)];
    if (c.role === 'down') return DCLS[this.place(c.col)];
    if (c.role === 'prod') return DCLS[this.place(M.steps[c.step].i)];
    if (c.role === 'rem') return c.txt === '0' && this.L.cells.filter(x=>x.row===c.row).length === 1 ? 'k' : 'r';
    return 'r';
  }
  line(ln){
    const x0 = this.cx(ln.c0) - this.CS*.42, x1 = this.cx(ln.c1) + this.CS*.42, y = this.cy(ln.row) + this.RH*.5;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    Object.entries({x1:x0, y1:y, x2:x1, y2:y, stroke:'#2A2A3C', 'stroke-width':4, 'stroke-linecap':'round'}).forEach(([k,v])=>l.setAttribute(k,v)); this.dl.appendChild(l);
  }
  arrow(c){
    const x = this.cx(c.col) + this.CS*.36, y0 = this.cy(1) + this.RH*.3, y1 = this.cy(c.row) - this.RH*.3;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Object.entries({d:`M${x} ${y0} C ${x+22} ${y0+30}, ${x+22} ${y1-30}, ${x} ${y1}`, fill:'none', stroke:'#E5484D', 'stroke-width':3, 'stroke-dasharray':'6 6'}).forEach(([k,v])=>p.setAttribute(k,v)); this.dl.appendChild(p);
  }
  // k번째 몫 자리의 칸 쓰기 (역할 순서: 몫 → 곱 → 뺀 수 → 내림 → 나머지)
  writeStep(k, anim=true){
    const cs = this.L.cells.filter(c=>c.step === k && c.role !== 'down');
    cs.forEach(c=>this.cell(c.col, c.row, c.txt, this.clsOf(c), anim));
    const prodRow = cs.find(c=>c.role === 'prod'); if (prodRow){ const ln = this.L.lines.find(l=>l.row === prodRow.row); if (ln) this.line(ln); }
  }
  writeDown(k, anim=true){ const c = this.L.cells.find(x=>x.step === k && x.role === 'down'); if (!c) return; this.arrow(c); this.cell(c.col, c.row, c.txt, this.clsOf(c), anim); }
  async reveal(gap=200){
    const sg = SG;
    for (let k=0;k<this.L.M.steps.length;k++){
      this.writeStep(k); await waitFixed(gap*2.2); if (sg !== SG) return;
      this.writeDown(k+1); await waitFixed(gap*1.4); if (sg !== SG) return;
    }
  }
  askAt(col, row){ this.unask(); return this.put('bd ask', this.cx(col), this.cy(row), '', 'ask'); }
}

/* ---------- 섬별 원리 장면 차례 ---------- */
const DIV_EPISODES = {
  1: [[60,3],[70,5]],
  2: [[48,4],[52,4]],
  3: [[37,3],[53,4],'remRule'],
  4: [[53,4],'checkWrong'],
  5: [[369,3],[456,3],[256,4],[412,4]],
  6: [[487,4],'checkBig'],
};
async function divLesson(n, onDone){
  const sg = ++SG, alive = () => sg === SG;
  if (n === 0) return divReviewLesson(onDone);
  const eps = DIV_EPISODES[n], N = eps.length;
  for (let i=0;i<N;i++){
    const e = eps[i], badge = `장면 ${i+1} / ${N}`;
    if (Array.isArray(e)){ const ok = await DivScene.dealEpisode(e[0], e[1], {badge}); if (!ok || !alive()) return; }
    else if (e === 'remRule'){
      say(`<b>나머지의 약속!</b> 나머지는 늘 <b>나누는 수보다 작아야</b> 해. 남은 것이 접시 수만큼 있으면 한 바퀴 더 나눠 줄 수 있으니까!`, 'focus');
    } else if (e === 'checkWrong'){
      say(`친구가 <b>53 ÷ 4 = 12 … 5</b>라고 했대. 4 × 12 + 5 = 53이라 맞는 것 같지? 그런데 나머지 <b class=r>5</b>는 나누는 수 <b>4</b>보다 커! 한 바퀴 더 나눌 수 있으니 틀린 답이야.`, 'focus');
    } else if (e === 'checkBig'){
      say(`세 자리 나눗셈도 확인 방법은 같아! <b>나누는 수 × 몫 + 나머지</b>가 처음 수와 같고, 나머지가 나누는 수보다 작으면 맞는 계산이야.`, 'explain');
    }
    if (i < N-1){ await new Promise(res=>setCtrls(btn('pill nudge', '다음 장면 ▶', res))); if (!alive()) return; }
  }
  Store.mark(n, 'lesson');
  await new Promise(res=>setCtrls(btn('pill nudge', PHASES[n][1][0] === 'guided' ? '✋ 따라 풀기 ▶' : '✏️ 연습하러 ▶', res)));
  if (alive()) onDone && onDone();
}

/* ---------- 복습 섬 (3-1 나눗셈): 똑같이 나누기 · 묶어 덜기 · 곱셈과 나눗셈 · 구구로 몫 ---------- */
async function divReviewLesson(onDone){
  const sg = SG, alive = () => sg === SG, D = DivScene, CANDY = ['#FFB4C8','#F28AA8','#FFE0EA'];
  const next = label => new Promise(res=>setCtrls(btn('pill nudge', label, res)));
  const ask = async (opts, ans, why) => { let t = 0; while (alive()){ const v = await new Promise(res=>setCtrls(...opts.map(x=>btn('pill opt', String(x), ()=>res(x))))); if (!alive()) return;
    if (v === ans){ SFX.right(); return; } t++; SFX.wrong(); say(why(v) + (t>=2 ? `<br>정답은 <b>${ans}</b>!` : ''), 'comfort'); if (t>=2){ await D.wait(1400); return; } } };
  function scene(badge){
    screenEl.innerHTML = ''; fx.innerHTML = '';
    const pl = mk('panel pL dvscene', null, null, `<svg viewBox="0 0 740 565" width="740" height="565"><defs><radialGradient id="dvwell" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#FFFCF6"/><stop offset="1" stop-color="#F1E7D6"/></radialGradient></defs></svg>`, null, screenEl);
    D.setSV(pl.firstChild); D.setC(18);
    const pr = mk('panel pR', null, null, '', null, screenEl); mk('dvbadge', null, null, badge, null, pr);
    const eq = mk('dveq', null, null, '', null, pr);
    return {pr, eq, layer:{sh:D.el('g', {}), fg:D.el('g', {})}};
  }
  const toTop = S => { const p = S.layer.fg.parentNode; p.appendChild(S.layer.sh); p.appendChild(S.layer.fg); };
  const candies = (layer, k, x0=110, y0=60) => Array.from({length:k}, (_,i)=>new D.Piece('o', CANDY, layer).set(x0 + (i%12)*42, y0 + Math.floor(i/12)*40));
  const eqLine = (eq, html, cls='') => { const e = mk('dvl '+cls, null, null, html, null, eq); e.style.opacity = 0; A(e, IN, 350).catch(()=>{}); return e; };

  // 1. 똑같이 나누기 (한 접시에 몇 개씩?)
  let S = scene('장면 1 / 4');
  const plates = [0,1,2].map(i=>({cx:190 + i*180, cy:370, ...D.drawPlate(190 + i*180, 370, 82)}));
  const lb = plates.map(p=>D.label(p.cx, 482)); toTop(S);
  let cs = candies(S.layer, 12, 140, 90);
  say(`사탕 <b>12개</b>를 접시 <b>3개</b>에 <b>똑같이</b> 나누어 담으면, 한 접시에 몇 개씩일까?`, 'hello');
  await ask([3,4,5], 4, v => v > 4 ? `${v}개씩이면 ${v*3}개가 필요해. 12개뿐이야!` : `${v}개씩 담으면 ${12 - v*3}개가 남아. 더 담을 수 있어!`); if (!alive()) return;
  say(`한 개씩 차례로 담아 볼게.`, 'praise');
  const on = [0,0,0];
  for (let r=0;r<4;r++) for (let i=0;i<3;i++){ const c = cs.shift(); c.raise(); await c.fly(plates[i].cx - 40 + (on[i]%2)*44, plates[i].cy - 36 + Math.floor(on[i]/2)*40, 380, 60, 10); if (!alive()) return; on[i]++; lb[i].setText(String(on[i])); }
  eqLine(S.eq, '12 ÷ 3 = 4', 'big'); eqLine(S.eq, '12를 3으로 나누면 4', 'sm');
  eqLine(S.eq, `<span class=tag>12</span> 나누어지는 수 · <span class=tag>3</span> 나누는 수 · <span class=tag>4</span> 몫`, 'sm');
  say(`한 접시에 <b>4개</b>씩! 이렇게 똑같이 나누는 걸 <b>12 ÷ 3 = 4</b>라고 써. 4를 <b>몫</b>이라고 해.`, 'explain');
  await next('다음 장면 ▶'); if (!alive()) return;

  // 2. 묶어 덜어내기 (3개씩 담으면 몇 봉지?)
  S = scene('장면 2 / 4');
  cs = candies(S.layer, 12, 140, 90);
  say(`이번엔 사탕 <b>12개</b>를 한 봉지에 <b>3개씩</b> 담을 거야. 봉지가 몇 개 필요할까?`, 'think');
  await ask([3,4,5], 4, v => v > 4 ? `${v}봉지면 사탕이 ${v*3}개 있어야 해!` : `${v}봉지에 담으면 ${12 - v*3}개가 남아!`); if (!alive()) return;
  for (let b=0;b<4;b++){
    const cx = 130 + b*160, bag = D.drawPlate(cx, 380, 66, 'bag'); const bl = D.label(cx, 474, false, true); toTop(S);
    for (let k=0;k<3;k++){ const c = cs.shift(); c.raise(); await c.fly(cx - 30 + k*22, 370 + (k%2)*10, 340, 50); if (!alive()) return; }
    bl.setText(`${b+1}봉지`); SFX.tap();
  }
  eqLine(S.eq, '12 ÷ 3 = 4', 'big'); eqLine(S.eq, '3개씩 묶으면 4묶음', 'sm');
  say(`3개씩 덜어 내면 <b>4봉지</b>! 이것도 <b>12 ÷ 3 = 4</b>야. 나눗셈은 <b>똑같이 나누기</b>도 되고, <b>몇 개씩 묶기</b>도 돼.`, 'explain');
  await next('다음 장면 ▶'); if (!alive()) return;

  // 3. 곱셈과 나눗셈
  S = scene('장면 3 / 4');
  const pl3 = [0,1,2].map(i=>({cx:190 + i*180, cy:300, ...D.drawPlate(190 + i*180, 300, 82)})); toTop(S);
  pl3.forEach(p=>{ for (let k=0;k<4;k++) new D.Piece('o', CANDY, S.layer).set(p.cx - 40 + (k%2)*44, p.cy - 36 + Math.floor(k/2)*40); });
  eqLine(S.eq, '3 × 4 = 12', 'big');
  say(`접시 3개에 4개씩이면 <b>3 × 4 = 12</b>. 이 곱셈식을 거꾸로 하면 나눗셈식이 돼! <b>12 ÷ 3 = □</b>에서 □는?`, 'think');
  await ask([3,4,12], 4, v => v === 12 ? `12는 처음 수야. 12를 3으로 나누면?` : `한 접시에 몇 개였는지 봐!`); if (!alive()) return;
  eqLine(S.eq, '12 ÷ 3 = 4', 'big g');
  say(`맞아! 그럼 <b>12 ÷ 4 = □</b>는? 사탕 12개를 4개씩 묶으면 몇 묶음?`, 'think');
  await ask([3,4,8], 3, v => `4개씩 묶은 접시가 몇 개인지 세어 봐!`); if (!alive()) return;
  eqLine(S.eq, '12 ÷ 4 = 3', 'big b');
  say(`곱셈식 하나로 나눗셈식 <b>두 개</b>를 만들 수 있어! 3 × 4 = 12 → 12 ÷ 3 = 4, 12 ÷ 4 = 3.`, 'praise');
  await next('다음 장면 ▶'); if (!alive()) return;

  // 4. 곱셈구구로 몫 찾기
  S = scene('장면 4 / 4');
  eqLine(S.eq, '24 ÷ 6 = □', 'big');
  say(`<b>24 ÷ 6</b>의 몫은 <b>6단</b>에서 찾을 수 있어. 6에 무엇을 곱하면 24가 될까? 6단을 같이 외워 보자.`, 'explain');
  await next('6단 보기 ▶'); if (!alive()) return;
  for (let k=1;k<=4;k++){ const e = eqLine(S.eq, `6 × ${k} = ${6*k}`, k===4 ? 'mid hit' : 'mid'); SFX.write(); await D.wait(650); if (!alive()) return; }
  say(`<b>6 × 4 = 24</b>! 그래서 <b>24 ÷ 6 = □</b>에서 □는?`, 'think');
  await ask([3,4,6], 4, v => `6 × □ = 24에서 □를 찾아 봐!`); if (!alive()) return;
  eqLine(S.eq, '24 ÷ 6 = 4', 'big g');
  say(`나눗셈의 몫은 <b>나누는 수의 단</b>에서 찾으면 돼. 이제 연습해 보자!`, 'cheer');
  Store.mark(0, 'lesson');
  await next('✏️ 연습하러 ▶'); if (alive()) onDone && onDone();
}

/* ---------- 따라 풀기: 칸마다 묻고 답하며 세로식 완성 ---------- */
async function divGuided(isl, onDone){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  const set = DIV_SETS.guided[isl];
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new DivBoard({pen:false, note:'✋ 한 칸씩 같이 풀어요'});
  const {pr, st} = rightPanel(); const kp = new Keypad(pr); const prog = progDots(pr, set.length); const results = [];
  const PL = {h:'백', t:'십', o:'일'};
  for (let qi=0; qi<set.length; qi++){
    const {a, d} = set[qi]; bd.setProblem(a, d); setProg(prog, results, qi);
    st.innerHTML = `✋ 따라 풀기 ${qi+1} / ${set.length} <span style="margin-left:auto">${a} ÷ ${d}</span>`;
    const L = bd.L, M = L.M; let clean = true;
    say(`<b>${a} ÷ ${d}</b>를 한 칸씩 풀어 보자! ${M.steps[0].i > 0 ? `맨 앞 ${M.ds[0]}${J(M.ds[0],'은','는')} ${d}보다 작아서 <b>${M.ds.slice(0, M.steps[0].i+1).join('')}</b>부터 나눠.` : '큰 자리부터 나눠.'}`, 'hello');
    await waitFixed(INSTANT ? 0 : 1400); if (!alive()) return;
    const askVal = async (col, row, html, ans, type) => {
      bd.askAt(col, row); say(html, 'think'); let t = 0;
      while (alive()){
        const v = await kp.wait('답을 입력해요'); if (!alive()) return false;
        if (v === ans){ kp.mark(true); SFX.right(); bd.unask(); return true; }
        kp.mark(false); SFX.wrong(); t++; clean = false;
        if (t === 1) Store.mistake(type);
        if (t >= 2){ say(`정답은 <b>${ans}</b>! 같이 써 두자.`, 'comfort'); await waitFixed(INSTANT ? 0 : 1100); bd.unask(); return true; }
        say({fact:`<b>${d}단</b>을 떠올려 봐! ${d} × □가 넘지 않는 가장 큰 □를 찾아.`, sub:`위 수에서 아래 수를 천천히 빼 봐!`}[type] || '다시 생각해 볼까?', 'comfort');
      }
      return false;
    };
    for (let k=0;k<M.steps.length;k++){
      const s = M.steps[k], last = k === M.steps.length-1, p = bd.place(s.i);
      const qc = L.cells.find(c=>c.role==='q' && c.step===k);
      if (s.q === 0 && !s.first){
        say(`<b>${s.cur}</b>${J(s.cur,'은','는')} ${d}보다 작아서 ${d}로 나눌 수 없어. 몫의 ${PL[p]}의 자리에 <b>0</b>을 써!`, 'focus');
        bd.cell(qc.col, 0, '0', DCLS[p], true); await waitFixed(INSTANT ? 0 : 1300); if (!alive()) return;
        if (!last){ bd.writeDown(k+1); say(`다음 자리 숫자를 내려 써.`, 'explain'); await waitFixed(INSTANT ? 0 : 900); }
        continue;
      }
      if (!(await askVal(qc.col, 0, `<b>${s.cur} ÷ ${d}</b>: ${d}에 몇을 곱하면 ${s.cur}에 가장 가까워질까? 몫의 ${PL[p]}의 자리를 써!`, s.q, 'fact'))) return;
      bd.cell(qc.col, 0, String(s.q), DCLS[p], true);
      const pcs = L.cells.filter(c=>c.role==='prod' && c.step===k), lastP = pcs[pcs.length-1];
      if (!(await askVal(lastP.col, lastP.row, `<b>${d} × ${s.q} = ?</b> 나눈 만큼을 아래에 써.`, s.prod, 'fact'))) return;
      pcs.forEach(c=>bd.cell(c.col, c.row, c.txt, bd.clsOf(c), true)); const ln = L.lines.find(l=>l.row===lastP.row); if (ln) bd.line(ln);
      const remCells = L.cells.filter(c=>(c.role==='sub' || c.role==='rem') && c.step===k);
      if (remCells.length){
        const rc = remCells[remCells.length-1];
        if (!(await askVal(rc.col, rc.row, `<b>${s.cur} − ${s.prod} = ?</b> 남은 수를 써.${last ? '' : ''}`, s.rem, 'sub'))) return;
        remCells.forEach(c=>bd.cell(c.col, c.row, c.txt, bd.clsOf(c), true));
        if (s.rem >= d) Store.mistake('rem');
      }
      if (!last){ bd.writeDown(k+1); say(`${s.rem ? `남은 <b class=r>${s.rem}</b> 옆에` : '빈자리에'} 다음 자리 숫자 <b>${M.ds[M.steps[k+1].i]}</b>${J(M.ds[M.steps[k+1].i],'을','를')} 내려 써!`, 'explain'); await waitFixed(INSTANT ? 0 : 1200); if (!alive()) return; }
    }
    results[qi] = clean ? 'ok' : 'fix'; setProg(prog, results, -1); SFX.fanfare(); gemFly(1000, 200);
    say(`${praise()} <b>${a} ÷ ${d} = ${M.q}${M.r ? ` … ${M.r}` : ''}</b>`, 'praise');
    await new Promise(res=>setCtrls(btn('pill', qi < set.length-1 ? '다음 문제 ▶' : '✏️ 연습문제로 ▶', res))); if (!alive()) return;
  }
  Store.mark(isl, 'guided');
  onDone && onDone();
}

/* ---------- 연습문제: 공책에 풀고 몫(·나머지) 입력 → 진단 · 실수 찾기 · 풀이 ---------- */
async function divPractice(isl, opts={}){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  const base = DIV_SETS.practice[isl].map(p=>({...p})), data = Store.isl(isl), withR = hasRem(isl);
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new DivBoard({pen:true, note:'✏️ 화면에 풀어도 되고, 공책에 풀어도 돼요'});
  const {pr, st} = rightPanel(); const kp = new Keypad(pr); const prog = progDots(pr, base.length);
  const results = []; let i = 0, extra = 0;
  while (alive()){
    const inSet = i < base.length, q = inSet ? base[i] : DIV_GEN[isl]();
    if (!inSet) extra++;
    setProg(prog, results, inSet ? i : -1);
    st.innerHTML = `${inSet ? `✏️ 연습 ${i+1} / ${base.length}` : `✏️ 더 풀기 ${extra}`}<span style="margin-left:auto">${q.text}</span>`;
    bd.setProblem(q.a, q.d); bd.clearInk();
    const Q = Math.floor(q.a/q.d), R = q.a % q.d;
    say(`문제! <b>${q.text} = ?</b> ${withR ? '몫을 먼저 쓰고, 다음에 나머지를 써.' : '몫을 입력해 줘.'}`);
    let tries = 0, first = null, revealed = false, help = 'none';
    const outcome = await (async ()=>{
      let preQ = null;
      while (alive()){
        const qa = preQ !== null ? preQ : await kp.wait('몫을 입력해요'); preQ = null; if (!alive()) return null;
        let ra = null;
        if (withR){ kp.mark(true); await waitFixed(INSTANT ? 0 : 250); ra = await kp.wait('나머지를 입력해요'); if (!alive()) return null; }
        if (divSloppy(qa, Q)){ kp.mark(false); say('답을 끝까지 써 볼까? 공책에 세로식으로 풀고, 나온 수를 그대로 넣어 줘.', 'comfort'); continue; }
        const type = divDiagnose(q.a, q.d, qa, withR ? ra : null);
        if (type === 'ok'){ kp.mark(true); SFX.right(); return tries ? 'fix' : 'ok'; }
        tries++; kp.mark(false); SFX.wrong();
        if (tries === 1){ first = type; Store.mistake(type); }
        if (tries >= 3){ say(`세 번이나 도전했어, 멋져! 이번엔 정답을 같이 보자.`, 'comfort'); await waitFixed(INSTANT ? 0 : 1200); help = 'sol'; return 'no'; }
        say(tries === 1 ? divMistakeMsg(type, q.a, q.d) : `아직 아니야! <b>실수 찾기</b>나 <b>풀이 보기</b>를 눌러 볼까? 한 번 더 틀리면 정답을 알려 줄게.`);
        const choice = await new Promise(res=>{ setCtrls(btn('pill y sm', '🔍 실수 찾기', ()=>{ kp.cancel(); res('find'); }), btn('pill w sm', '👀 풀이 보기', ()=>{ kp.cancel(); res('sol'); })); kp.wait('다시 입력해요').then(v=>{ if (v !== undefined) res({retry:v}); }); });
        if (!alive()) return null;
        setCtrls();
        if (choice === 'sol'){ help = 'sol'; return 'no'; }
        if (choice === 'find'){ help = 'find'; await findMistake(); if (!alive()) return null; say(`이제 다시 <b>${q.text}</b>의 답을 입력해 봐!`); continue; }
        // 버튼 대신 키패드로 바로 다시 입력한 경우: 그 값을 몫으로 다시 확인
        preQ = choice.retry;
      }
      return null;
    })();
    if (!alive() || outcome === null) return;
    async function findMistake(){
      const M = bd.L.M; bd.setProblem(q.a, q.d);
      for (let k=0;k<M.steps.length;k++){
        const s = M.steps[k];
        if (s.q === 0 && !s.first){ bd.writeStep(k); bd.writeDown(k+1); continue; }
        say(`실수 찾기: <b>${s.cur} ÷ ${q.d}</b>의 몫은?`, 'think');
        let v = await kp.wait('몫 한 자리'); if (!alive()) return;
        if (v !== s.q){ kp.mark(false); SFX.wrong(); say(`찾았다! <b>${s.cur} ÷ ${q.d}</b>의 몫은 <b>${s.q}</b>야. ${q.d}단을 다시 떠올려 봐.`, 'focus'); if (first === 'other'){ const m = Store.mis(); m.other = Math.max(0, m.other-1); Store.mistake('fact'); } bd.writeStep(k); await waitFixed(INSTANT ? 0 : 1600); return; }
        kp.mark(true);
        say(`${s.cur} − ${s.prod} = ?  남은 수는?`, 'think');
        v = await kp.wait('남은 수'); if (!alive()) return;
        if (v !== s.rem){ kp.mark(false); SFX.wrong(); say(`찾았다! ${s.cur} − ${s.prod} = <b>${s.rem}</b>. 빼기를 다시 확인해 봐.`, 'focus'); if (first === 'other'){ const m = Store.mis(); m.other = Math.max(0, m.other-1); Store.mistake('sub'); } bd.writeStep(k); await waitFixed(INSTANT ? 0 : 1600); return; }
        kp.mark(true); SFX.right(); bd.writeStep(k); bd.writeDown(k+1); await waitFixed(INSTANT ? 0 : 500);
      }
      say(`단계는 모두 맞았어! 마지막에 몫과 나머지를 옮겨 쓸 때 실수했나 봐.`, 'comfort'); await waitFixed(INSTANT ? 0 : 1400);
    }
    if (inSet){ results[i] = outcome; }
    setProg(prog, results, -1);
    Store.ev('solve', {isl, q:q.text, r:outcome, type:first, help, extra:!inSet});
    if (outcome === 'no'){ say(`정답 세로식을 한 줄씩 써 볼게. 공책과 비교해 봐!`, 'explain'); bd.setProblem(q.a, q.d); bd.clearInk(); await bd.reveal(220); if (!alive()) return; say(`<b>${q.text} = ${Q}${R ? ` … ${R}` : ''}</b>. 다음엔 꼭 맞힐 수 있어!`, 'cheer'); }
    else { SFX.fanfare(); gemFly(1000, 200); say(`${praise()} <b>${q.text} = ${Q}${R ? ` … ${R}` : ''}</b>`, 'praise'); }
    if (inSet) i++;
    const setDone = i >= base.length;
    if (setDone && !(data.practice && data.practice.done)){ data.practice = {done:true, ok:results.filter(r=>r==='ok').length, total:base.length}; Store.save(); }
    if (setDone && inSet) say(`${base.length}문제 끝! 한 번에 맞힌 문제 <b>${results.filter(r=>r==='ok').length}개</b>. 이제 <b>보물상자</b>를 열 수 있어!`, 'cheer');
    await new Promise(res=>setCtrls(
      outcome !== 'no' ? keep(btn('pill w sm', '👀 풀이 보기', async ()=>{ bd.setProblem(q.a, q.d); bd.clearInk(); await bd.reveal(200); })) : null,
      setDone ? btn('pill y sm'+(inSet?' nudge':''), '🎁 보물상자', ()=>{ SG++; opts.onTreasure && opts.onTreasure(); }) : null,
      btn('pill sm', setDone ? '✏️ 더 풀기' : '다음 문제 ▶', res)));
    if (!alive()) return;
  }
}

/* ---------- 확인 섬 연습: 나누는 수 × 몫 + 나머지 = 처음 수? ---------- */
const CHECK_SET = [
  {a:53, d:4, q:13, r:1}, {a:61, d:4, q:14, r:5}, {a:77, d:5, q:15, r:2}, {a:89, d:6, q:14, r:3}, {a:94, d:8, q:11, r:6},
];
async function divCheckPractice(isl, opts={}){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new DivBoard({pen:true, note:'✏️ 확인 계산을 여기서 해 봐요'});
  const {pr, st} = rightPanel(); const kp = new Keypad(pr); const prog = progDots(pr, CHECK_SET.length); const results = [];
  for (let i=0;i<CHECK_SET.length;i++){
    const c = CHECK_SET[i], val = c.d*c.q + c.r, good = val === c.a && c.r < c.d;
    setProg(prog, results, i); st.innerHTML = `🔍 확인 ${i+1} / ${CHECK_SET.length}`;
    bd.setProblem(c.a, c.d); bd.clearInk();
    say(`친구의 답: <b>${c.a} ÷ ${c.d} = ${c.q} … ${c.r}</b>. 먼저 <b>${c.d} × ${c.q} + ${c.r}</b>를 계산해 봐!`, 'think');
    let t = 0, clean = true;
    while (alive()){
      const v = await kp.wait('확인 계산'); if (!alive()) return;
      if (v === val){ kp.mark(true); SFX.right(); break; }
      kp.mark(false); SFX.wrong(); t++; clean = false;
      if (t >= 2){ say(`${c.d} × ${c.q} = ${c.d*c.q}, 여기에 ${c.r}${J(c.r,'을','를')} 더하면 <b>${val}</b>!`, 'comfort'); await waitFixed(INSTANT ? 0 : 1300); break; }
      say(`곱하기 먼저, 그다음 나머지를 더해!`, 'comfort');
    }
    say(`<b>${val}</b>${val === c.a ? '은 처음 수와 같아.' : `${J(val,'은','는')} 처음 수 ${c.a}${J(c.a,'와','과')} 달라!`} ${c.r >= c.d ? `그리고 나머지 <b class=r>${c.r}</b>${J(c.r,'은','는')} 나누는 수 ${c.d}보다 커.` : ''} 친구의 답은 맞을까?`, 'think');
    const ans = await new Promise(res=>setCtrls(btn('pill opt', '⭕ 맞아요', ()=>res(true)), btn('pill opt', '❌ 틀려요', ()=>res(false)))); if (!alive()) return;
    if (ans === good){ SFX.right(); say(good ? `맞아! 확인해 보니 바른 계산이야.` : `맞아, 틀린 답이야! ${c.r >= c.d ? '나머지가 나누는 수보다 크면 한 번 더 나눌 수 있어.' : '확인한 수가 처음 수와 다르니까.'}`, 'praise'); Store.ev('verify.inverse', {a:c.a, d:c.d}); }
    else { SFX.wrong(); clean = false; Store.mistake(c.r >= c.d ? 'rem' : 'other'); say(good ? `확인한 수가 처음 수와 같고 나머지도 작으니 <b>맞는</b> 계산이야.` : `확인해 보면 ${c.r >= c.d ? '나머지가 나누는 수보다 커서' : '처음 수와 달라서'} <b>틀린</b> 계산이야.`, 'comfort'); }
    results[i] = clean ? 'ok' : 'fix'; setProg(prog, results, -1);
    await new Promise(res=>setCtrls(btn('pill', i < CHECK_SET.length-1 ? '다음 ▶' : '끝 ✓', res))); if (!alive()) return;
  }
  Store.isl(isl).practice = {done:true, ok:results.filter(r=>r==='ok').length, total:CHECK_SET.length}; Store.save();
  say(`확인 연습 끝! 이제 <b>보물상자</b>를 열 수 있어!`, 'cheer');
  setCtrls(btn('pill nudge', '🎁 보물상자', ()=>opts.onTreasure && opts.onTreasure()));
}

/* ---------- 나눗셈 보물섬 활동 ---------- */
function divApplyDone(key, onDone){
  Store.mark(7, key); SFX.fanfare(); confetti(30, 1220);
  say(`<b>${DIV_APPLY_NAME[key]}</b> 완료! 끝까지 해냈어, {n} 대장님!`, 'praise');
  setCtrls(btn('pill nudge', '다음 활동 ▶', ()=>onDone && onDone()));
}
const DIV_APPLY_NAME = {wp:'📖 문장제', blank:'🔍 빈칸 추리', cards:'🃏 숫자카드', est:'⚖️ 어림'};
const DWP = [
  {icon:'🍬', story:'사탕 <b>75개</b>를 <b>5명</b>이 똑같이 나누어 가지면<br>한 명이 몇 개씩 가질까요?', ch:['75 × 5','75 ÷ 5','75 − 5'], ok:1, ans:15, unit:'개'},
  {icon:'🚣', story:'학생 <b>29명</b>이 보트 한 대에 <b>4명</b>씩 타요.<br>모두 타려면 보트는 <b>적어도</b> 몇 대 필요할까요?', ch:['29 ÷ 4','29 × 4','29 + 4'], ok:0, ans:8, unit:'대', note:'29 ÷ 4 = 7 … 1 → 남은 1명도 타야 하니까 보트가 한 대 더! 7 + 1 = 8대'},
  {icon:'🎀', story:'리본 <b>50 cm</b>를 <b>6 cm</b>씩 자르면<br>몇 도막이 될까요? (남는 것은 쓰지 않아요)', ch:['50 − 6','50 × 6','50 ÷ 6'], ok:2, ans:8, unit:'도막', note:'50 ÷ 6 = 8 … 2 → 2 cm는 6 cm가 안 되니까 8도막'},
  {icon:'📦', story:'구슬 <b>156개</b>를 상자 <b>4개</b>에 똑같이 나누어 담으면<br>한 상자에 몇 개씩 담을까요?', ch:['156 ÷ 4','156 × 4','156 + 4'], ok:0, ans:39, unit:'개'},
];
async function divWordProblems(onDone){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new DivBoard({pen:true, note:'✏️ 식을 세우고 여기서 계산해 봐요'});
  const {pr, st} = rightPanel(); const kp = new Keypad(pr); const prog = progDots(pr, DWP.length); const res = [];
  for (let i=0;i<DWP.length;i++){
    const w = DWP[i]; setProg(prog, res, i); st.innerHTML = `📖 문장제 ${i+1} / ${DWP.length}`;
    bd.clearLayer(); bd.grid.innerHTML = ''; bd.clearInk();
    const card = mk('dvstory', null, null, `<div class=ic>${w.icon}</div><div>${w.story}</div>`, null, bd.layer);
    say(`어떤 식으로 풀까? 알맞은 식을 골라 봐!`, 'think');
    let wrong = 0;
    while (alive()){
      const v = await new Promise(r=>setCtrls(...w.ch.map((c,k)=>btn('pill opt', c, ()=>r(k))))); if (!alive()) return;
      if (v === w.ok){ SFX.right(); break; }
      SFX.wrong(); wrong++; say(wrong === 1 ? `똑같이 나누거나, 몇 개씩 묶는 이야기는 어떤 계산일까?` : `<b>나눗셈</b>이야! 알맞은 식은 <b>${w.ch[w.ok]}</b>`, 'comfort'); if (wrong === 1) Store.mistake('other');
      if (wrong >= 2){ await waitFixed(INSTANT ? 0 : 1400); break; }
    }
    card.remove(); const [A1, D1] = w.ch[w.ok].split('÷').map(t=>+t.trim()); bd.setProblem(A1, D1);
    say(`<b>${w.ch[w.ok]}</b>를 공책에 풀고, 답을 입력해 줘. ${w.note ? '나머지를 어떻게 할지 잘 생각해!' : ''}`);
    let t = 0;
    while (alive()){
      const v = await kp.wait(`답 (${w.unit})`); if (!alive()) return;
      if (v === w.ans){ kp.mark(true); SFX.right(); break; }
      kp.mark(false); SFX.wrong(); t++; if (t >= 2){ await bd.reveal(160); break; }
      say(w.note ? `나머지가 있을 때 문제에서 무엇을 묻는지 다시 읽어 봐!` : `세로식으로 차근차근 다시 나눠 볼까?`, 'comfort');
    }
    res[i] = t || wrong ? 'fix' : 'ok'; setProg(prog, res, -1);
    say(`답은 <b>${w.ans}${w.unit}</b>! ${w.note || ''}`, t ? 'explain' : 'praise');
    await new Promise(r=>setCtrls(btn('pill', '다음 ▶', r))); if (!alive()) return;
  }
  divApplyDone('wp', onDone);
}
const DBLANK = [
  {html:'□ ÷ 6 = 12 … 5', ans:77, hint:'나누는 수 × 몫 + 나머지 = □', why:'6 × 12 + 5 = 77'},
  {html:'84 ÷ □ = 21', ans:4, hint:'21 × □ = 84가 되는 □를 찾아 봐', why:'21 × 4 = 84'},
  {html:'□ ÷ 7 = 9 … 3', ans:66, hint:'7 × 9에 나머지 3을 더해', why:'7 × 9 + 3 = 66'},
  {html:'96 ÷ 4 = □', ans:24, hint:'세로식으로 나눠 봐', why:'96 ÷ 4 = 24'},
];
async function divBlanks(onDone){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new DivBoard({pen:true, note:'✏️ 여기서 계산해 봐요'}); bd.grid.innerHTML = '';
  const {pr, st} = rightPanel(); const kp = new Keypad(pr); const prog = progDots(pr, DBLANK.length); const res = [];
  for (let i=0;i<DBLANK.length;i++){
    const b = DBLANK[i]; setProg(prog, res, i); st.innerHTML = `🔍 빈칸 추리 ${i+1} / ${DBLANK.length}`;
    bd.clearLayer(); bd.clearInk(); mk('dvstory big', null, null, b.html.replace('□', '<span class=bx>□</span>'), null, bd.layer);
    say(`□에 알맞은 수는? 💡 ${b.hint}`, 'think');
    let t = 0;
    while (alive()){
      const v = await kp.wait('□ = ?'); if (!alive()) return;
      if (v === b.ans){ kp.mark(true); SFX.right(); break; }
      kp.mark(false); SFX.wrong(); t++; if (t >= 3){ say(`정답은 <b>${b.ans}</b>! ${b.why}`, 'comfort'); break; }
      say(`다시 생각해 봐! 💡 ${b.hint}`, 'comfort');
    }
    bd.layer.querySelectorAll('.bx').forEach(x=>{ x.textContent = b.ans; x.classList.add('ok'); });
    res[i] = t ? 'fix' : 'ok'; setProg(prog, res, -1);
    if (t < 3) say(`${praise()} ${b.why}`, 'praise');
    await new Promise(r=>setCtrls(btn('pill', '다음 ▶', r))); if (!alive()) return;
  }
  divApplyDone('blank', onDone);
}
async function divCards(onDone){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const pf = fullPanel(); const DIG = [2,5,7,9];
  const rounds = [{max:true, title:'몫이 <b>가장 큰</b> 나눗셈', best:Math.floor(975/2), ex:'975 ÷ 2 = 487 … 1'},
                  {max:false, title:'몫이 <b>가장 작은</b> 나눗셈', best:Math.floor(257/9), ex:'257 ÷ 9 = 28 … 5'}];
  for (const R of rounds){
    pf.innerHTML = '';
    const head = mk('dvhead', null, null, `숫자카드 2, 5, 7, 9를 한 번씩 써서 ${R.title}을 만들어요`, null, pf);
    const row = mk('dvcardrow', null, null, '', null, pf);
    const slots = [0,1,2,3].map(k=>mk('nslot dvslot'+(k===3?' dv':''), null, null, '', null, row));
    row.insertBefore(Object.assign(document.createElement('span'), {className:'dvop', textContent:'÷'}), slots[3]);
    const out = mk('dvout', null, null, '', null, pf);
    const hand = mk('dvhand', null, null, '', null, pf);
    let tries = 0;
    say(`카드를 눌러 빈칸에 차례로 놓아 봐. 앞의 세 칸이 나뉘는 수, 마지막 칸이 나누는 수야.`, 'think');
    const done = await new Promise(resolve=>{
      let pick = [];
      const render = () => { slots.forEach((s,k)=>s.textContent = pick[k] !== undefined ? DIG[pick[k]] : ''); hand.innerHTML = ''; DIG.forEach((v,k)=>{ const c = btn('ncard'+(pick.includes(k)?' used':''), String(v), ()=>{ if (pick.includes(k) || pick.length >= 4) return; pick.push(k); render(); if (pick.length === 4) check(); }, hand); }); };
      const check = () => {
        const a = +pick.slice(0,3).map(k=>DIG[k]).join(''), d = DIG[pick[3]], q = Math.floor(a/d), r = a % d;
        out.innerHTML = `${a} ÷ ${d} = <b>${q}</b>${r ? ` … ${r}` : ''}`;
        if (q === R.best){ SFX.right(); say(`${praise()} ${R.ex}! ${R.max ? '나누는 수는 가장 <b>작게</b>, 나뉘는 수는 가장 <b>크게</b>!' : '나누는 수는 가장 <b>크게</b>, 나뉘는 수는 가장 <b>작게</b>!'}`, 'praise'); setCtrls(btn('pill nudge', '다음 ▶', ()=>resolve(true))); return; }
        tries++; SFX.wrong();
        say(tries < 3 ? `몫은 ${q}! 좋아, 그런데 더 ${R.max ? '큰' : '작은'} 몫을 만들 수 있어. 💡 나누는 수를 ${R.max ? '가장 작은' : '가장 큰'} 카드로 바꿔 볼까?` : `정답은 <b>${R.ex}</b>!`, 'comfort');
        setCtrls(tries < 3 ? btn('pill w sm', '다시 놓기', ()=>{ pick = []; out.innerHTML = ''; setCtrls(); render(); }) : btn('pill nudge', '다음 ▶', ()=>resolve(true)));
      };
      render();
    });
    if (!alive() || !done) return;
  }
  divApplyDone('cards', onDone);
}
const DEST = [
  {q:'<b>487 ÷ 4</b>의 몫은 약 얼마일까요?', ch:['약 12','약 120','약 1200'], ok:1, why:'487을 480쯤으로 보면 480 ÷ 4 = 120'},
  {q:'<b>63 ÷ 3 = 201</b> 이라고 쓴 친구가 있어요. 그럴듯할까요?', ch:['그럴듯해','이상해'], ok:1, why:'60 ÷ 3 = 20이니까 몫은 20쯤! 201은 너무 커요'},
  {q:'<b>298 ÷ 3</b>의 몫은 100보다 클까요, 작을까요?', ch:['100보다 커','100보다 작아'], ok:1, why:'3 × 100 = 300인데 298은 300보다 작으니 몫은 100보다 작아요'},
];
async function divEstimate(onDone){
  const sg = ++SG, alive = () => sg === SG; clearTimers();
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const pf = fullPanel();
  for (let i=0;i<DEST.length;i++){
    const e = DEST[i]; pf.innerHTML = ''; mk('dvhead', null, null, `⚖️ 어림 ${i+1} / ${DEST.length}`, null, pf);
    mk('dvstory big', null, null, e.q, null, pf);
    say(`계산하기 전에 <b>어림</b>해 보자! 몇십, 몇백으로 생각하면 쉬워.`, 'think');
    let w = 0;
    while (alive()){
      const v = await new Promise(r=>setCtrls(...e.ch.map((c,k)=>btn('pill opt', c, ()=>r(k))))); if (!alive()) return;
      if (v === e.ok){ SFX.right(); Store.ev('verify.estimate', {}); break; }
      SFX.wrong(); w++; say(w < 2 ? `가까운 몇십, 몇백으로 바꿔서 생각해 봐!` : `${e.why}`, 'comfort'); if (w >= 2) break;
    }
    say(`${w ? '' : praise() + ' '}${e.why}`, w ? 'explain' : 'praise');
    await new Promise(r=>setCtrls(btn('pill', '다음 ▶', r))); if (!alive()) return;
  }
  divApplyDone('est', onDone);
}

/* ---------- 보물상자 도움 (app.js에서 부름) ---------- */
function divHelpTogether(n, bd){
  if (n === SEA_DEF.div.last){ say(`같이 생각해 보자! 몫이 크려면 <b>나누는 수는 가장 작게(2)</b>, 나뉘는 수는 남은 카드로 <b>가장 크게</b> 만들어 봐.`, 'think'); return; }
  if (n === 4){ say(`같이 풀어 보자! <b>6 × 12 = 72</b>, 여기에 나머지 <b>5</b>를 더하면 □야.`, 'think'); return; }
  const m = ISL_DIV[n].mission.match(/^(\d+) ÷ (\d+)$/); if (!m || !bd) return;
  const a = +m[1], d = +m[2]; bd.setProblem(a, d); bd.clearInk(); bd.writeStep(0); bd.writeDown(1);
  const s = divModel(a, d).steps[0];
  say(`같이 풀어 보자! 공책에 첫 자리를 나눠 줬어(${s.cur} ÷ ${d} = ${s.q} … ${s.rem}). 이어서 끝까지 나눠서 ${missionRem(n) ? '<b>몫과 나머지</b>를 이어 쓰면' : '<b>몫</b>이'} 비밀번호야!`, 'think');
}
function divCodeWhy(n){
  if (n === SEA_DEF.div.last) return '(975 ÷ 2 = 487 … 1)';
  if (n === 4) return '(6 × 12 + 5 = 77)';
  const m = ISL_DIV[n].mission.match(/^(\d+) ÷ (\d+)$/); if (!m) return '';
  const a = +m[1], d = +m[2], q = Math.floor(a/d), r = a % d;
  return `(${a} ÷ ${d} = ${q}${r ? ` … ${r}` : ''}) 공책의 세로식과 비교해 봐.`;
}

/* ---------- 나눗셈 바다 단계 연결 ---------- */
function divPhase(n, key){
  const nextOf = k => { const ph = PHASES[n]; const i = ph.findIndex(([x])=>x===k); return ph[i+1][0]; };
  if (key === 'lesson')   return safe(divLesson)(n, ()=>openPhase(n, nextOf('lesson')));
  if (key === 'guided')   return safe(divGuided)(n, ()=>openPhase(n, 'practice'));
  if (key === 'practice') return n === 4 ? safe(divCheckPractice)(n, {onTreasure:()=>openPhase(n, 'treasure')}) : safe(divPractice)(n, {onTreasure:()=>openPhase(n, 'treasure')});
  if (key === 'wp')    return safe(divWordProblems)(()=>openPhase(n, 'blank'));
  if (key === 'blank') return safe(divBlanks)(()=>openPhase(n, 'cards'));
  if (key === 'cards') return safe(divCards)(()=>openPhase(n, 'est'));
  if (key === 'est')   return safe(divEstimate)(()=>openPhase(n, 'treasure'));
}
