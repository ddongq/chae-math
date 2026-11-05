/* =========================================================
   practice.js — 키패드 · 따라 풀기 · 연습문제 · 훈련(손풀이)
   ========================================================= */
let SG = 0;                       // 화면 세대 (화면을 바꾸면 이전 흐름은 멈춤)
const TIMERS = [];
function clearTimers(){ while (TIMERS.length) clearInterval(TIMERS.pop()); }
const PRAISE = ['정답! 👏', '최고야!', '완벽해!', '역시 탐험대장!', '멋져, {n} 대장님!', '척척박사!'];
const praise = () => PRAISE[Math.floor(Math.random()*PRAISE.length)];

/* ---------- 키패드 ---------- */
let KEYPAD = null;
class Keypad {
  constructor(parent, opts={}){
    this.v = ''; this.max = opts.max || 5; this.ph = opts.ph || '답을 입력해요'; this.locked = true;
    this.disp = mk('disp', null, null, '', null, parent);
    const keys = this.keys = mk('keys', null, null, '', null, parent);
    [1,2,3,4,5,6,7,8,9].forEach(n=>btn('', String(n), ()=>this.press(String(n)), keys));
    btn('del', '⌫', ()=>this.del(), keys); btn('', '0', ()=>this.press('0'), keys);
    this.okb = btn('ok', '확인', ()=>this.submit(), keys);
    this.render(); KEYPAD = this;
  }
  press(d){ if (this.locked || this.v.length >= this.max) return; if (this.v==='0') this.v=''; this.v += d; this.render(); }
  del(){ if (this.locked) return; this.v = this.v.slice(0,-1); this.render(); }
  render(){ this.disp.className = 'disp'; this.disp.innerHTML = this.v ? this.v : `<span class=ph>${this.ph}</span>`; }
  submit(){ if (this.locked || this.v==='') return; const r = this.res; this.res = null; this.locked = true; if (r) r(Number(this.v)); }
  wait(ph){ if (ph) this.ph = ph; this.v = ''; this.render(); this.locked = false; return new Promise(r=>this.res = r); }
  mark(ok){ this.disp.classList.add(ok ? 'ok' : 'no'); if (!ok) shake(this.disp); }
  cancel(){ this.res = null; this.locked = true; }
}
addEventListener('keydown', e=>{
  if (!KEYPAD || !KEYPAD.disp.isConnected || document.body.classList.contains('lesson-mode')) return;
  if (/^[0-9]$/.test(e.key)) KEYPAD.press(e.key);
  else if (e.key==='Backspace') KEYPAD.del();
  else if (e.key==='Enter') KEYPAD.submit();
});

function rightPanel(){
  const pr = mk('panel pR', null, null, '', null, screenEl);
  const st = mk('status', null, null, '', null, pr);
  return {pr, st};
}
function progDots(parent, n){
  const p = mk('prog', null, null, '', null, parent);
  p.innerHTML = Array.from({length:n}, (_,i)=>`<i>${i+1}</i>`).join('');
  return p;
}
function setProg(p, results, cur){
  [...p.children].forEach((d,i)=>{ d.className = (results[i]==='ok'||results[i]==='fix') ? 'ok' : (results[i]==='no' ? 'no' : ''); if (i===cur) d.classList.add('cur'); });
}

/* =========================================================
   따라 풀기 — 칸마다 질문에 답하며 세로셈 완성
   ========================================================= */
const HINT = {
  mul:  '곱셈구구를 천천히 떠올려 봐!',
  mulc: '먼저 곱하고, 빨간 <b class=r>받아올림 숫자</b>를 더해!',
  zero: '몇십을 곱하면 일의 자리는 늘 <b>0</b>이야!',
  zeros:'두 수에 있는 <b>0을 모두</b> 세어 봐!',
  add:  '위아래 두 숫자를 더해 봐!',
  addc: '빨간 <b class=r>받아올림 숫자</b>도 같이 더해야 해!',
};
const KIND_MISTAKE = {mul:'fact', mulc:'carry', zero:'shift', zeros:'zero', add:'other', addc:'add'};

async function openGuided(isl, onDone){
  const sg = ++SG;
  const list = SETS.guided[isl];
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new Board({pen:false, note:'✋ 노란 칸에 들어갈 수를 오른쪽에 입력해요'});
  const {pr, st} = rightPanel();
  const kp = new Keypad(pr, {ph:'노란 칸의 수'});
  const prog = progDots(pr, list.length);
  const results = [];
  for (let i=0; i<list.length; i++){
    const q = list[i];
    setProg(prog, results, i);
    st.innerHTML = `✋ 따라 풀기 ${i+1} / ${list.length} <span style="margin-left:auto">${q.text}</span>`;
    bd.setProblem(q.a, q.b);
    const {S} = solutionStages(q.a, q.b);
    say(`따라 풀기 ${i+1}번: <b>${q.text}</b>. 셈이가 칸마다 물어볼게. 노란 칸에 들어갈 수를 입력해 줘!`);
    setCtrls();
    try { await waitFixed(1600); } catch(e){ return; }
    if (sg !== SG) return;
    let allOk = true;
    for (const stg of S){
      if (stg.ans === undefined){ try { for (const x of stg.acts) await bd.act(x); } catch(e){ return; } continue; }
      bd.ask(stg.cell[0], stg.cell[1]); if (stg.hl) bd.hl(stg.hl, stg.hlc);
      say(stg.say);
      let tries = 0;
      while (true){
        const v = await kp.wait();
        if (sg !== SG) return;
        if (v === stg.ans){ kp.mark(true); SFX.right(); break; }
        tries++; kp.mark(false); SFX.wrong(); allOk = false;
        if (tries === 1){ Store.mistake(KIND_MISTAKE[stg.kind] || 'other'); say(`음… 다시 생각해 볼까? ${HINT[stg.kind]||''}<br><span style="font-size:19px;color:#888">${stg.say.replace(/<[^>]+>/g,'')}</span>`); }
        else { say(`정답은 <b>${stg.ans}</b>! 같이 써 보자.`); try { await waitFixed(1300); } catch(e){ return; } break; }
      }
      bd.unask(); bd.unhl();
      try { for (const x of stg.acts) await bd.act(x); } catch(e){ return; }
      if (stg.after){ say(stg.after); try { await waitFixed(1700); } catch(e){ return; } }
      else { try { await waitFixed(350); } catch(e){ return; } }
      if (sg !== SG) return;
    }
    results[i] = allOk ? 'ok' : 'fix'; setProg(prog, results, -1);
    SFX.fanfare(); confetti(30, 740); gemFly(400, 500);
    say(`${praise()} <b>${q.text} = ${fmt(q.a*q.b)}</b> 완성!`);
    await new Promise(res=>{
      const last = i === list.length-1;
      setCtrls(btn('pill', last ? '따라 풀기 끝! ✓' : '다음 문제 ▶', res));
    });
    if (sg !== SG) return;
  }
  Store.mark(isl, 'guided');
  say(`따라 풀기 완료! 이제 혼자서 <b>연습문제</b>에 도전해 볼까?`);
  setCtrls(btn('pill nudge', '연습문제 ▶', ()=>onDone && onDone()));
}

/* =========================================================
   연습문제 / 훈련 — 스스로 풀고 답 입력 → 채점 → 실수 찾기 / 풀이 보기
   ========================================================= */
async function openPractice(isl, opts={}){
  const sg = ++SG; clearTimers();
  const train = !!opts.train;
  const base = SETS.practice[isl].map(p=>({...p}));
  const data = Store.isl(isl);
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new Board({pen:true, note: train ? '📒 공책에 칸 모양 그대로 따라 쓰고 풀어요 (화면에 써도 OK)' : '✏️ 화면에 풀어도 되고, 공책에 풀어도 돼요'});
  const {pr, st} = rightPanel();
  const kp = new Keypad(pr);
  const prog = progDots(pr, base.length);
  const results = [];
  let i = 0, extra = 0, lv4 = 1;

  const statusLine = (q, label) => {
    const lv = levelOf(q);
    st.innerHTML = `${label} <span class=lv>${lv ? '⭐'.repeat(lv) : ''}</span>` + (train ? `<span class=timer id=tmr>⏱ 0초</span>` : `<span style="margin-left:auto">${q.text}</span>`);
  };
  const finishSet = () => {
    const ok = results.filter(r=>r==='ok').length;
    data.practice = {done:true, ok, total:base.length}; Store.save();
  };

  while (true){
    if (sg !== SG) return;
    const inSet = i < base.length;
    let q;
    if (inSet) q = base[i];
    else { q = isl===4 ? GEN[4](lv4) : GEN[isl](); lv4 = lv4 % 3 + 1; extra++; }
    setProg(prog, results, inSet ? i : -1);
    statusLine(q, inSet ? `✏️ ${train?'훈련':'연습'} ${i+1} / ${base.length}` : `✏️ 더 풀기 ${extra}`);
    bd.setProblem(q.a, q.b); bd.clearInk(); bd.unhl();
    const swapped = q.text !== `${q.a} × ${q.b}`;
    say(`${train ? '공책에 따라 쓰고 풀어 봐!' : '문제!'} <b>${q.text} = ?</b>` + (swapped ? `<br><span style="font-size:19px">순서를 바꿔 <b>${q.a} × ${q.b}</b>로 세로셈해도 같아요.</span>` : '') + (train ? ' 다 풀면 답을 입력해 줘.' : ''));
    setCtrls();
    const t0 = Date.now();
    if (train){ const tm = setInterval(()=>{ const e = $('tmr'); if (e) e.textContent = `⏱ ${Math.round((Date.now()-t0)/1000)}초`; }, 500); TIMERS.push(tm); }

    let tries = 0, solved = false, revealed = false, firstType = null, finding = false;
    // 결과 버튼 만들기
    const outcome = await new Promise(resolve=>{
      const loop = async () => {
        const v = await kp.wait('답을 입력해요');
        if (sg !== SG) return;
        const type = diagnose(q.a, q.b, v);
        if (type === 'ok'){
          kp.mark(true); SFX.right(); clearTimers();
          solved = true; resolve(tries === 0 ? 'ok' : 'fix'); return;
        }
        tries++; kp.mark(false); SFX.wrong();
        if (tries === 1){ firstType = type; Store.mistake(type); }
        if (tries >= 3){
          kp.cancel(); setCtrls(); revealed = true;
          say(`세 번이나 도전했어, 멋져! 이번엔 정답을 같이 보자.`);
          try { await waitFixed(1300); } catch(e){ return; }
          if (sg === SG) resolve('no'); return;
        }
        say(tries === 1 ? mistakeMsg(type, q.a, q.b) : `아직 아니야! <b>실수 찾기</b>나 <b>풀이 보기</b>를 눌러 볼까?<br><span style="font-size:19px">한 번 더 틀리면 정답을 알려 줄게.</span>`);
        const two = mulModel(q.a, q.b).rows.length === 2;
        setCtrls(
          two ? btn('pill y sm', '🔍 실수 찾기', ()=>findMistake()) : null,
          btn('pill w sm', '👀 풀이 보기', ()=>{ kp.cancel(); revealed = true; resolve('no'); }),
        );
        setTimeout(()=>{ if (!solved && !revealed && !finding && sg===SG) loop(); }, 400);
      };
      const findMistake = async () => {
        finding = true; kp.cancel(); setCtrls();
        const M = mulModel(q.a, q.b), r1 = M.rows[0], r2 = M.rows[1];
        const {S} = solutionStages(q.a, q.b);
        const steps = [
          {say:`실수 찾기 ①: 먼저 <b>${q.a} × ${r1.m}</b>${J(r1.m,'은','는')} 얼마였어?`, ans:r1.val, acts:S.slice(0, 2), name:`${q.a} × ${r1.m}`},
          {say:`실수 찾기 ②: <b>${q.a} × ${r2.m}0</b>은 얼마였어?`, ans:r2.val, acts:S.slice(2, 5), name:`${q.a} × ${r2.m}0`},
          {say:`실수 찾기 ③: 두 줄을 더하면? <b>${fmt(r1.val)} + ${fmt(r2.val)}</b>`, ans:M.ans, acts:S.slice(5), name:'덧셈'},
        ];
        bd.clearInk();
        for (const s of steps){
          say(s.say);
          const v = await kp.wait('부분곱 입력');
          if (sg !== SG) return;
          if (v === s.ans){ kp.mark(true); SFX.right(); try { await bd.reveal(s.acts, 120); } catch(e){ return; } continue; }
          kp.mark(false); SFX.wrong();
          const t = s.name==='덧셈' ? 'add' : (diagnose(q.a, s===steps[0] ? r1.m : r2.m, s===steps[0] ? v : v/10) === 'carry' ? 'carry' : 'fact');
          if (firstType === 'other') Store.d.mis.other = Math.max(0, (Store.d.mis.other||0)-1), Store.mistake(t), firstType = t;
          say(`찾았다! <b>${s.name}</b>에서 실수했어. 정답은 <b>${fmt(s.ans)}</b>! 세로셈으로 다시 볼까?`);
          try { await bd.reveal(s.acts, 260); } catch(e){ return; }
          break;
        }
        say(`이제 다시 <b>${q.text}</b>의 답을 입력해 봐!`);
        setCtrls(btn('pill w sm', '👀 풀이 보기', ()=>{ kp.cancel(); revealed = true; resolve('no'); }));
        finding = false; loop();
      };
      loop();
    });
    if (sg !== SG) return;
    const sec = Math.round((Date.now()-t0)/1000);
    if (inSet) results[i] = outcome;
    setProg(prog, results, -1);
    Store.d.log.push({isl, q:q.text, r:outcome, t:Date.now()}); if (Store.d.log.length > 300) Store.d.log.shift();

    // 정답 보여주기
    const showSolution = async () => {
      bd.clearInk(); bd.setProblem(q.a, q.b);
      try { await bd.reveal(solutionStages(q.a, q.b).S, 240); } catch(e){}
    };
    if (outcome === 'no'){
      say(`정답 세로셈을 한 줄씩 써 볼게. 공책과 비교해 봐!`);
      await showSolution();
      if (sg !== SG) return;
      say(`<b>${q.text} = ${fmt(q.a*q.b)}</b>. 다음엔 꼭 맞힐 수 있어!`);
    } else {
      SFX.fanfare(); gemFly(1000, 200);
      let msg = `${praise()} <b>${q.text} = ${fmt(q.a*q.b)}</b>`;
      if (train){
        const prev = Store.d.times.filter(t=>t.ok).map(t=>t.sec);
        const avg = prev.length ? Math.round(prev.slice(-10).reduce((x,y)=>x+y,0)/Math.min(prev.length,10)) : null;
        Store.d.times.push({sec, ok: outcome==='ok', q:q.text, t:Date.now()}); if (Store.d.times.length > 200) Store.d.times.shift();
        msg += ` · ⏱ <b>${sec}초</b>`;
        if (avg !== null && outcome==='ok') msg += sec < avg ? ` — 평균보다 <b>${avg-sec}초 빨라졌어!</b> 🚀` : ` (평균 ${avg}초)`;
      }
      say(msg);
      Store.save();
      if (train){ try { await waitFixed(900); } catch(e){ return; } if (sg !== SG) return; say(msg + '<br><span style="font-size:19px">정답 세로셈과 공책을 비교해 봐!</span>'); await showSolution(); }
    }
    if (sg !== SG) return;
    if (inSet) i++;
    const setDone = i >= base.length;
    if (setDone && !data.practice?.done) finishSet();
    if (setDone && inSet){
      const ok = results.filter(r=>r==='ok').length;
      say(`${base.length}문제 끝! 한 번에 맞힌 문제 <b>${ok}개</b>. 이제 <b>보물상자</b>를 열 수 있어! 더 연습하고 싶으면 <b>더 풀기</b>!`);
    }
    await new Promise(res=>{
      setCtrls(
        (!train && outcome !== 'no') ? btn('pill w sm', '👀 풀이 보기', async ()=>{ await showSolution(); }) : null,
        setDone ? btn('pill y sm'+(inSet?' nudge':''), '🎁 보물상자', ()=>{ SG++; opts.onTreasure && opts.onTreasure(); }) : null,
        btn('pill sm', setDone ? '✏️ 더 풀기' : '다음 문제 ▶', res),
      );
    });
  }
}
