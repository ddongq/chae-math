/* =========================================================
   apply.js — 보물섬 응용 4종
   ========================================================= */
function fullPanel(){ return mk('panel pFull', null, null, '', null, screenEl); }
function place(el, x, y, w){ css(el, {left:x+'px', top:y+'px'}); if (w) el.style.width = w+'px'; return el; }

// 공용: 보드 + 키패드로 한 문제 풀기 → 'ok' | 'fix' | 'no'
async function simpleSolve(bd, kp, q, sg){
  bd.setProblem(q.a, q.b); bd.clearInk();
  let tries = 0;
  while (true){
    const v = await kp.wait('답을 입력해요');
    if (sg !== SG) return null;
    const type = diagnose(q.a, q.b, v);
    if (type === 'ok'){ kp.mark(true); SFX.right(); return tries ? 'fix' : 'ok'; }
    tries++; kp.mark(false); SFX.wrong();
    if (tries === 1){ Store.mistake(type); say(mistakeMsg(type, q.a, q.b)); }
    else {
      say(`정답 세로셈을 같이 볼까?`);
      bd.clearInk(); try { await bd.reveal(solutionStages(q.a, q.b).S, 200); } catch(e){ return null; }
      return 'no';
    }
  }
}
function nextBtn(label='다음 ▶'){ return new Promise(res=>setCtrls(btn('pill', label, res))); }
function applyDone(key, onDone){
  Store.mark(6, key); SFX.fanfare(); confetti(30, 1220);
  say(`<b>${APPLY_NAME[key]}</b> 완료! 보석을 하나 더 모았어 💎`);
  setCtrls(btn('pill nudge', '다음 활동 ▶', ()=>onDone && onDone()));
}
const APPLY_NAME = {wp:'📖 문장제', blank:'🔍 빈칸 추리', cards:'🃏 숫자카드', est:'⚖️ 어림·오답 찾기'};

/* ---------- 1. 문장제 ---------- */
const WP = [
  {icon:'🍊', story:'한 상자에 <b>36개</b>씩 든 귤이 <b>24상자</b> 있어요.<br>귤은 모두 몇 개일까요?', a:36, b:24, ch:['36 + 24','36 × 24','36 − 24'], ok:1, unit:'개'},
  {icon:'🪢', story:'줄넘기를 하루에 <b>45번</b>씩 <b>28일</b> 동안 했어요.<br>줄넘기를 모두 몇 번 했을까요?', a:45, b:28, ch:['45 × 28','45 + 28','45 − 28'], ok:0, unit:'번'},
  {icon:'📚', story:'한 권에 <b>58쪽</b>인 동화책이 <b>17권</b> 있어요.<br>동화책은 모두 몇 쪽일까요?', a:58, b:17, ch:['58 − 17','58 + 17','58 × 17'], ok:2, unit:'쪽'},
];
async function openWordProblems(onDone){
  const sg = ++SG;
  for (let i=0;i<WP.length;i++){
    const w = WP[i];
    screenEl.innerHTML = ''; fx.innerHTML = '';
    const pf = fullPanel();
    const ic = place(mk('', null, null, w.icon, null, pf), 0, 40, 1220); css(ic, {fontSize:'90px', textAlign:'center', position:'absolute'});
    const tx = place(mk('qtext', null, null, w.story, null, pf), 0, 170, 1220); tx.style.position = 'absolute';
    const q = place(mk('qtext', null, null, '어떤 식을 세워야 할까?', null, pf), 0, 300, 1220); css(q, {position:'absolute', fontSize:'24px', color:'#9A5B1E'});
    const row = place(mk('hub', null, null, '', null, pf), 0, 360, 1220); css(row, {position:'absolute', justifyContent:'center'});
    say(`문장제 ${i+1} / ${WP.length}. 문제를 천천히 읽고, <b>알맞은 식</b>을 골라 봐!`);
    setCtrls();
    await new Promise(res=>{
      let wrong = 0;
      w.ch.forEach((c,k)=>{
        const b = btn('choice', c, ()=>{
          if (k === w.ok){ b.classList.add('ok'); SFX.right(); say(`맞아! <b>${w.ch[w.ok]}</b>. '몇 개씩 몇 묶음'이면 곱셈이야.`); setTimeout(res, 1300); }
          else { b.classList.add('no'); SFX.wrong(); wrong++; say(wrong===1 ? `<b>${w.a}</b>씩 <b>${w.b}</b>번 있으니까… 같은 수가 여러 번! 어떤 계산일까?` : `같은 수를 여러 번 더할 땐 <b>곱셈</b>!`); if (wrong===1) Store.mistake('other'); }
        }, row);
      });
    });
    if (sg !== SG) return;
    screenEl.innerHTML = '';
    const bd = new Board({pen:true, note:'✏️ 화면이나 공책에 세로셈으로 풀어요'});
    const {pr, st} = rightPanel(); st.innerHTML = `📖 문장제 ${i+1} / ${WP.length}<span style="margin-left:auto">${w.a} × ${w.b}</span>`;
    const kp = new Keypad(pr);
    say(`식은 <b>${w.a} × ${w.b}</b>! 세로셈으로 풀고 답을 입력해 줘.`);
    const r = await simpleSolve(bd, kp, P(w.a, w.b), sg);
    if (r === null || sg !== SG) return;
    if (r !== 'no') say(`${praise()} 답은 <b>${fmt(w.a*w.b)}${w.unit}</b>!`);
    else say(`답은 <b>${fmt(w.a*w.b)}${w.unit}</b>! 다음 문제도 힘내자!`);
    await nextBtn(i < WP.length-1 ? '다음 문제 ▶' : '완료 ✓');
    if (sg !== SG) return;
  }
  applyDone('wp', onDone);
}

/* ---------- 2. 빈칸 추리 ---------- */
async function openBlanks(onDone){
  const sg = ++SG;
  const items = [
    {eq:'4<span class=bx>?</span> × 23 = 989', ans:3,
     hint:'<b>일의 자리</b>를 봐! □ × 3의 일의 자리가 <b>9</b>가 되려면 □는?', why:'3 × 3 = 9! 그래서 43 × 23 = 989'},
    {eq:'<span class=bx>?</span>7 × 15 = 405', ans:2,
     hint:'<b>어림</b>해 봐! 30 × 15 = 450이야. 405는 450보다 조금 작으니까 □7은 30보다 조금 작아.', why:'27 × 15 = 405!'},
  ];
  for (let i=0;i<items.length;i++){
    const it = items[i];
    screenEl.innerHTML = ''; fx.innerHTML = '';
    const pl = mk('panel pL', null, null, '', null, screenEl);
    const e = place(mk('', null, null, it.eq, null, pl), 0, 180, 740); css(e, {position:'absolute', fontSize:'70px', fontWeight:'900', textAlign:'center'});
    e.querySelectorAll('.bx').forEach(b=>css(b, {display:'inline-block', width:'80px', border:'5px dashed #E2A400', background:'#FFF5CC', borderRadius:'14px', color:'#E2A400'}));
    const h = place(mk('card', null, null, '💡 힌트는 틀리면 나와요', null, pl), 50, 360); css(h, {position:'absolute', fontSize:'22px'});
    const {pr, st} = rightPanel(); st.innerHTML = `🔍 빈칸 추리 ${i+1} / 3`;
    const kp = new Keypad(pr, {max:1, ph:'? 에 들어갈 수'});
    say(`<b>?</b>에 들어갈 숫자를 찾아봐! 곱셈 탐정 출동 🕵️`);
    let tries = 0;
    while (true){
      const v = await kp.wait(); if (sg !== SG) return;
      if (v === it.ans){ kp.mark(true); SFX.right(); e.querySelectorAll('.bx').forEach(b=>{ b.textContent = it.ans; css(b, {borderStyle:'solid', borderColor:'var(--green)', color:'var(--green)', background:'var(--greenBg)'}); }); say(`${praise()} ${it.why}`); break; }
      tries++; kp.mark(false); SFX.wrong(); h.innerHTML = '💡 ' + it.hint; say(tries < 3 ? `다시 생각해 봐! 아래 힌트를 읽어 볼까?` : `정답은 <b>${it.ans}</b>! ${it.why}`);
      if (tries >= 3){ e.querySelectorAll('.bx').forEach(b=>b.textContent = it.ans); break; }
    }
    await nextBtn(); if (sg !== SG) return;
  }
  // 세로셈 빈칸: 36 × 24
  screenEl.innerHTML = ''; fx.innerHTML = '';
  const bd = new Board({pen:true, note:'✏️ 빈칸(노란 칸)에 들어갈 수를 찾아요'});
  const {pr, st} = rightPanel(); st.innerHTML = `🔍 빈칸 추리 3 / 3 · 세로셈`;
  const kp = new Keypad(pr, {max:1, ph:'노란 칸의 수'});
  bd.setProblem(36, 24);
  INSTANT = true; for (const s of solutionStages(36, 24).S) for (const x of s.acts) await bd.act(x, false); INSTANT = false;
  const blanks = [{p:1, row:'r1', ans:4, hint:'36 × 4 = ? 를 계산해 봐!'}, {p:1, row:'r2', ans:2, hint:'36 × 20 = ? 를 계산해 봐! (0 먼저)'}, {p:1, row:'S', ans:6, hint:'십의 자리끼리 더해 봐: 4 + 2 = ?'}];
  blanks.forEach(b=>{ const d = bd.get(b.row+'p'+b.p); if (d){ d.textContent = ''; } });
  bd.layer.querySelectorAll('.bk').forEach(e=>e.remove());
  for (const b of blanks){
    bd.ask(b.p, b.row);
    say(`노란 칸에 들어갈 숫자는? <span style="font-size:19px;color:#888">(받아올림 숫자는 지웠어요)</span>`);
    let tries = 0;
    while (true){
      const v = await kp.wait(); if (sg !== SG) return;
      if (v === b.ans){ kp.mark(true); SFX.right(); break; }
      tries++; kp.mark(false); SFX.wrong(); say('💡 ' + b.hint);
      if (tries >= 3){ say(`정답은 <b>${b.ans}</b>!`); break; }
    }
    bd.unask(); const d = bd.get(b.row+'p'+b.p); d.textContent = b.ans; await A(d, POP, 380).catch(()=>{});
  }
  bd.layer.querySelectorAll('.bk').forEach(e=>e.remove());
  await nextBtn('완료 ✓'); if (sg !== SG) return;
  applyDone('blank', onDone);
}

/* ---------- 3. 숫자카드 ---------- */
function bestProduct(ds, wantMax){
  let best = null, arr = null;
  const perm = (a, k=0) => {
    if (k === a.length){ if (a[0]===0 || a[2]===0) return; const x = a[0]*10+a[1], y = a[2]*10+a[3], p = x*y;
      if (best===null || (wantMax ? p>best : p<best)){ best = p; arr = [x,y]; } return; }
    for (let i=k;i<a.length;i++){ [a[k],a[i]]=[a[i],a[k]]; perm(a, k+1); [a[k],a[i]]=[a[i],a[k]]; }
  };
  perm([...ds]); return {best, arr};
}
async function openCards(onDone){
  const sg = ++SG;
  const rounds = [{ds:[2,5,7,9], max:true}, {ds:[1,3,4,6], max:false}];
  for (let ri=0; ri<rounds.length; ri++){
    const R = rounds[ri], B = bestProduct(R.ds, R.max);
    screenEl.innerHTML = ''; fx.innerHTML = '';
    const pf = fullPanel();
    const t = place(mk('qtext', null, null, `숫자카드 4장으로 <b class=${R.max?'r':'b'}>가장 ${R.max?'큰':'작은'} 곱</b>을 만들어 봐!`, null, pf), 0, 26, 1220); t.style.position = 'absolute';
    const SX = [300, 420, 700, 820], SY = 110;
    const slots = SX.map((x,i)=>{ const s = mk('nslot', 30+x, 80+SY, '', null, screenEl); return s; });
    mk('', 30+575, 80+SY+24, '×', null, screenEl).style.cssText += 'font-size:70px;font-weight:900;color:#888';
    const res = mk('qtext', 30, 80+290, '', null, screenEl); res.style.width = '1220px';
    const fill = [null,null,null,null];
    const cards = R.ds.map((d,i)=>{
      const c = mk('ncard', 30+380+i*120, 80+410, String(d), null, screenEl);
      c.dataset.home = i; c.onclick = ()=>{
        unlockAudio();
        const at = fill.indexOf(c);
        if (at >= 0){ fill[at] = null; SFX.tap(); A(c, {left:(410+i*120)+'px', top:'490px'}, 300).catch(()=>{}); return; }
        const k = fill.indexOf(null); if (k < 0) return;
        fill[k] = c; SFX.pop(); A(c, {left:(30+SX[k]+6)+'px', top:(80+SY+6)+'px'}, 350).catch(()=>{});
      };
      return c;
    });
    say(`카드를 누르면 빈칸으로 쏙! 다시 누르면 돌아와. 다 놓으면 <b>확인</b>을 눌러 줘.`);
    let tries = 0;
    await new Promise(done=>{
      const check = () => {
        if (fill.includes(null)){ say('카드 4장을 모두 놓아 줘!'); return; }
        const x = Number(fill[0].textContent)*10 + Number(fill[1].textContent), y = Number(fill[2].textContent)*10 + Number(fill[3].textContent), p = x*y;
        res.innerHTML = `${x} × ${y} = <b>${fmt(p)}</b>`;
        if (p === B.best){ SFX.right(); res.innerHTML += ` 🎉`; say(`${praise()} <b>${fmt(p)}</b>${J(p,'이','가')} 가장 ${R.max?'큰':'작은'} 곱이야! ${R.max ? '큰 숫자를 <b>십의 자리</b>에 놓는 게 비법!' : '작은 숫자를 <b>십의 자리</b>에 놓는 게 비법!'}`); setCtrls(btn('pill', ri<rounds.length-1 ? '다음 ▶' : '완료 ✓', done)); return; }
        tries++; SFX.wrong();
        if (tries < 3) say(`${fmt(p)}! 좋아, 그런데 더 ${R.max?'큰':'작은'} 곱을 만들 수 있어. 💡 ${R.max?'큰':'작은'} 숫자 두 개를 <b>십의 자리</b>에 놓아 봐!`);
        else { say(`정답은 <b>${B.arr[0]} × ${B.arr[1]} = ${fmt(B.best)}</b>! 십의 자리에 ${R.max?'큰':'작은'} 수를 놓았지?`); setCtrls(btn('pill', ri<rounds.length-1 ? '다음 ▶' : '완료 ✓', done)); }
      };
      setCtrls(btn('pill w sm', '↩ 다시 놓기', ()=>{ fill.forEach((c,k)=>{ if (c){ fill[k]=null; const h = Number(c.dataset.home); A(c, {left:(410+h*120)+'px', top:'490px'}, 300).catch(()=>{}); } }); res.innerHTML = ''; }), btn('pill', '확인', check));
    });
    if (sg !== SG) return;
  }
  applyDone('cards', onDone);
}

/* ---------- 4. 어림 · 오답 찾기 ---------- */
async function openEstimate(onDone){
  const sg = ++SG;
  // ① 어림 고르기
  const choiceQ = async (html, choices, okIdx, okMsg, hint) => {
    screenEl.innerHTML = ''; fx.innerHTML = '';
    const pf = fullPanel();
    const t = place(mk('qtext', null, null, html, null, pf), 0, 90, 1220); css(t, {position:'absolute', fontSize:'40px'});
    const row = place(mk('hub', null, null, '', null, pf), 0, 300, 1220); css(row, {position:'absolute', justifyContent:'center'});
    await new Promise(res=>{
      let wrong = 0;
      choices.forEach((c,k)=>{ const b = btn('choice', c, ()=>{
        if (k === okIdx){ b.classList.add('ok'); SFX.right(); say(`${praise()} ${okMsg}`); setCtrls(btn('pill', '다음 ▶', res)); }
        else { b.classList.add('no'); SFX.wrong(); if (!wrong++) Store.mistake('other'); say('💡 ' + hint); }
      }, row); css(b, {minWidth:'200px'}); });
    });
  };
  say(`<b>어림</b>은 답을 대충 짐작하는 거야. 몇십으로 바꿔서 계산하면 쉬워!`);
  await choiceQ('<b>38 × 21</b>은 약 얼마일까?', ['약 80','약 800','약 8000'], 1, '38은 약 40, 21은 약 20 → 40 × 20 = <b>800</b>!', '38은 약 40, 21은 약 20이야. 40 × 20은?');
  if (sg !== SG) return;

  // ② · ③ 친구 풀이에서 틀린 줄 찾기
  const wrongQ = async (a, b, rows, bad, fixMsg) => {
    screenEl.innerHTML = ''; fx.innerHTML = '';
    const bd = new Board({pen:false, note:'🕵️ 친구의 풀이 — 틀린 줄을 눌러 봐!'});
    bd.setProblem(a, b);
    const keys = ['r1','r2','S'];
    rows.forEach((v,k)=>{ digitsOf(v).reverse().forEach((d,p)=>bd.write(p, keys[k], String(d), '', false)); });
    bd.put('bline', BX(4)-34, BY.L2-2, '', 'L2').style.width = '340px';
    const pr = mk('panel pR', null, null, '', null, screenEl);
    const info = place(mk('', null, null, `친구가 <b>${a} × ${b}</b>를<br>이렇게 풀었대.<br><br>어느 줄이 틀렸을까?`, null, pr), 30, 60, 400); css(info, {position:'absolute', fontSize:'28px', fontWeight:'800', lineHeight:'1.5'});
    say(`친구 풀이에 실수가 있어! <b>틀린 줄</b>을 눌러 찾아봐. (세로셈을 직접 해 보면 쉬워)`);
    await new Promise(res=>{
      let wrong = 0;
      keys.forEach((k,idx)=>{
        const hit = mk('wrongrow', 30+BX(4)-40, 80+BY[k]-31, '', null, screenEl); css(hit, {width:'352px', height:'62px'});
        hit.onclick = ()=>{
          unlockAudio();
          if (idx === bad){
            hit.classList.add('picked'); SFX.right(); say(`찾았다! 🕵️ ${fixMsg}`);
            info.innerHTML = `<span class=g>바르게 고치면</span><br>${a} × ${b} = <b class=s>${fmt(a*b)}</b>`;
            setCtrls(btn('pill', '다음 ▶', res));
          } else { SFX.wrong(); hit.classList.add('right'); setTimeout(()=>hit.classList.remove('right'), 600); if (!wrong++) Store.mistake('other'); say(`그 줄은 맞아! 다른 줄을 계산해 볼까? 💡 ${a} × ${b%10}과 ${a} × ${Math.floor(b/10)}0을 직접 해 봐.`); }
        };
      });
    });
  };
  await wrongQ(46, 23, [138, 92, 230], 1, `두 번째 줄은 46 × <b>20</b>이라서 <b>920</b>이어야 해. 0을 안 써서 자리가 밀렸어! 그래서 답도 138 + 920 = <b>1058</b>.`);
  if (sg !== SG) return;
  await wrongQ(58, 34, [202, 1740, 1942], 0, `8 × 4 = 32에서 받아올린 <b class=r>3</b>을 안 더했어! 5 × 4 + 3 = 23 → 첫 줄은 <b>232</b>. 답은 <b>1972</b>.`);
  if (sg !== SG) return;

  // ④ 어림으로 답 확인
  say(`마지막! 어림으로 답이 맞는지 확인하는 연습이야.`);
  await choiceQ('<b>63 × 48 = 3024</b><br><span style="font-size:28px">어림하면 60 × 50 = 3000</span><br>이 답은 그럴듯할까?', ['그럴듯해 👍','이상해 🤔'], 0, '3024는 3000이랑 아주 가까워! 그럴듯한 답이야.', '어림한 3000과 3024를 비교해 봐!');
  if (sg !== SG) return;
  applyDone('est', onDone);
}
