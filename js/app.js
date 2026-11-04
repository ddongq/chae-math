/* =========================================================
   app.js — 시작 · 지도 · 섬 화면 · 보물상자 · 부모님 화면
   ========================================================= */
const ISL = [null,
  {name:'점프 섬',        icon:'🦘', mission:'30 × 40', code:'1200', prize:'🐚', prizeName:'반짝 진주',   x:165,  y:470},
  {name:'십막대 섬',      icon:'🪵', mission:'23 × 30', code:'690',  prize:'🪙', prizeName:'황금 동전',   x:360,  y:255},
  {name:'쪼개기 섬',      icon:'✂️', mission:'12 × 13', code:'156',  prize:'💍', prizeName:'마법 반지',   x:565,  y:470},
  {name:'받아올림 화산섬', icon:'🌋', mission:'39 × 27', code:'1053', prize:'💎', prizeName:'화산 보석',   x:770,  y:255},
  {name:'훈련 섬',        icon:'🏋️', mission:'46 × 28', code:'1288', prize:'🏆', prizeName:'훈련 트로피', x:965,  y:470},
  {name:'보물섬',         icon:'🏝️', mission:'숫자카드 최대 곱', code:'6900', prize:'👑', prizeName:'곱셈 왕관', x:1135, y:255},
];
const PHASES = {
  1: [['lesson','🎬 원리'],['guided','✋ 따라 풀기'],['practice','✏️ 연습문제'],['treasure','🎁 보물']],
  5: [['lesson','🎬 공책 쓰기'],['practice','🏋️ 훈련'],['treasure','🎁 보물']],
  6: [['wp','📖 문장제'],['blank','🔍 빈칸 추리'],['cards','🃏 숫자카드'],['est','⚖️ 어림·오답'],['treasure','🎁 보물']],
};
PHASES[2] = PHASES[3] = PHASES[4] = PHASES[1];
const PARENT_TIPS = {
  1: ['× 10을 하면 숫자가 왜 한 칸 왼쪽으로 갈까?', '40 × 50 = 2000에서 0이 왜 세 개일까?'],
  2: ['30을 곱할 때 왜 0을 먼저 쓸까?', '받아올린 숫자를 왜 다음 곱에 더할까?'],
  3: ['13을 10과 3으로 나누면 왜 쉬워질까?', '두 번째 줄을 한 칸 왼쪽부터 쓰는 이유는?'],
  4: ['받아올린 빨간 6은 진짜로는 얼마일까? (60)', '백의 자리에 아무것도 없을 때 왜 0을 쓸까?'],
  5: ['공책 칸에 맞춰 쓰면 무엇이 좋을까?', '어림한 답과 진짜 답이 많이 다르면 어떻게 할까?'],
  6: ["'몇 개씩 몇 묶음' 문장은 왜 곱셈일까?", '가장 큰 곱을 만들려면 큰 수를 어디에 놓을까?'],
};
const MISTAKE_ADVICE = {
  shift: '섬 3(쪼개기 섬) 6단계 "조심!" 장면을 다시 보여 주세요. 두 번째 줄은 × 몇십이라 0부터 쓴다는 점을 강조해 주세요.',
  carry: '섬 4(화산섬) 4~7단계를 다시 보며, 받아올린 숫자를 빨간색으로 작게 쓰는 습관을 들여 주세요.',
  add:   '부분곱 두 줄을 더할 때도 받아올림이 생긴다는 점(섬 4의 12~13단계)을 짚어 주세요.',
  fact:  '곱셈구구 자체의 실수예요. 6·7·8·9단을 짧게 복습하면 좋아요.',
  zero:  '섬 1(점프 섬)의 "0 붙이기" 규칙을 다시 확인해 주세요.',
  other: '문제를 끝까지 읽고 식을 세우는 연습, 어림으로 확인하는 습관을 함께 길러 주세요.',
};

const phaseDone = (n, k) => k==='practice' ? !!(Store.isl(n).practice && Store.isl(n).practice.done) : !!Store.isl(n)[k];
const treasureReady = n => n===6 ? ['wp','blank','cards','est'].every(k=>Store.isl(6)[k]) : phaseDone(n, 'practice');
const unlocked = n => n===1 || Store.d.unlockAll || !!Store.isl(n-1).treasure;
const currentIsland = () => { for (let n=1;n<=6;n++) if (!Store.isl(n).treasure) return n; return 6; };

function resetScreen(){
  SG++; abortAll(); clearTimers(); closeLesson();
  screenEl.innerHTML = ''; fx.innerHTML = ''; ovEl.innerHTML = '';
  KEYPAD = null; $('bottom').classList.remove('wide');
}

/* ---------- 지도 ---------- */
function openMap(opt={}){
  resetScreen();
  $('bMap').style.display = 'none';
  $('title').innerHTML = `${NM()}이의 곱셈 섬 탐험`;
  $('tabs').innerHTML = '';
  const sea = mk('sea', null, null, '', null, screenEl);
  [[80,60],[300,150],[520,40],[700,140],[960,70],[1100,170],[240,380],[460,330],[680,420],[900,350],[60,250],[1150,420]].forEach(([x,y])=>{ const w = mk('wave', x, y, '〰️', null, sea); });
  const pts = ISL.slice(1).map(i=>`${i.x-30},${i.y-80}`).join(' ');
  sea.insertAdjacentHTML('beforeend', `<svg width="1220" height="565" style="position:absolute;left:0;top:0"><polyline points="${pts}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/></svg>`);
  const cur = currentIsland();
  for (let n=1;n<=6;n++){
    const I = ISL[n], lock = !unlocked(n), done = !!Store.isl(n).treasure;
    const b = btn('isl'+(lock?' locked':'')+(n===cur && !lock && !done ? ' cur':''), `
      <div class="land"></div><div class="ico">${I.icon}</div><div class="day">${n}일차</div>
      <div class="nm">${I.name}</div><div class="st">${lock ? '🔒' : (done ? I.prize : '')}</div>`, ()=>{
        if (lock){ SFX.wrong(); say(`이 섬은 아직 잠겨 있어! <b>${ISL[n-1].name}</b>의 보물상자를 먼저 열어 줘.`); return; }
        openIsland(n);
      }, screenEl);
    css(b, {left:(I.x)+'px', top:(I.y)+'px'});
  }
  const from = opt.moveFrom ? ISL[opt.moveFrom] : ISL[cur];
  const boat = mk('boat', from.x+40, from.y-20, '⛵', null, screenEl);
  if (opt.moveFrom && opt.moveFrom < 6){ const to = ISL[opt.moveFrom+1]; setTimeout(()=>{ css(boat, {left:(to.x+40)+'px', top:(to.y-20)+'px'}); SFX.swoosh(); }, 500); }
  const tr = mk('trophies', null, null, '보물 ' + ISL.slice(1).map((I,k)=>`<span class="${Store.isl(k+1).treasure?'got':''}">${I.prize}</span>`).join(''), null, screenEl);
  const pb = btn('hbtn', '🔒 부모님 (길게 누르기)', ()=>{}, screenEl); css(pb, {left:'1000px', top:'588px', position:'absolute'});
  let pt = null;
  pb.onpointerdown = ()=>{ pt = setTimeout(()=>{ SFX.ding(); openParent(); }, 1000); };
  pb.onpointerup = pb.onpointerleave = ()=>clearTimeout(pt);
  pb.onclick = ()=>say('부모님 화면은 버튼을 <b>1초 동안 길게</b> 누르면 열려요.');
  const allDone = ISL.slice(1).every((_,k)=>Store.isl(k+1).treasure);
  say(allDone ? `{n} 대장님, 모든 섬을 정복했어! 👑 복습하고 싶은 섬을 골라 봐.`
              : `{n} 대장님, 오늘은 <b>${cur}일차 ${ISL[cur].name}</b>을 탐험할 차례야! 섬을 눌러 출발!`);
  setCtrls(btn('pill nudge', allDone ? '👑 인증서 보기' : `${ISL[cur].icon} 출발!`, ()=> allDone ? showCert() : openIsland(cur)));
}

/* ---------- 섬 ---------- */
function openIsland(n, key){
  const ph = PHASES[n];
  if (!key){ key = (ph.find(([k])=>k!=='treasure' && !phaseDone(n,k)) || ph[ph.length-1])[0]; }
  openPhase(n, key);
}
function islandHeader(n, key){
  const I = ISL[n];
  $('bMap').style.display = '';
  $('title').innerHTML = `${I.icon} ${I.name}<small>${n}일차${n<6?' · 미션 '+I.mission:''}</small>`;
  const tabs = $('tabs'); tabs.innerHTML = '';
  PHASES[n].forEach(([k, label])=>{
    const b = btn((k===key?'on ':'') + (phaseDone(n,k)?'done ':'') + (k==='treasure' && !treasureReady(n) ? 'locked' : ''), label, ()=>openPhase(n, k), tabs);
  });
}
function openPhase(n, key){
  resetScreen();
  islandHeader(n, key);
  const nextOf = k => { const ph = PHASES[n]; const i = ph.findIndex(([x])=>x===k); return ph[i+1][0]; };
  if (key === 'lesson') return openLesson(LESSONS[n], n, ()=>openPhase(n, nextOf('lesson')));
  if (key === 'guided') return safe(openGuided)(n, ()=>openPhase(n, 'practice'));
  if (key === 'practice') return safe(openPractice)(n, {train: n===5, onTreasure: ()=>openPhase(n, 'treasure')});
  if (key === 'wp') return safe(openWordProblems)(()=>openPhase(6, 'blank'));
  if (key === 'blank') return safe(openBlanks)(()=>openPhase(6, 'cards'));
  if (key === 'cards') return safe(openCards)(()=>openPhase(6, 'est'));
  if (key === 'est') return safe(openEstimate)(()=>openPhase(6, 'treasure'));
  if (key === 'treasure') return safe(openTreasure)(n);
}

/* ---------- 보물상자 ---------- */
async function openTreasure(n){
  const sg = SG, I = ISL[n], isl = Store.isl(n);
  const pf = fullPanel(); pf.style.background = 'linear-gradient(#5A3A1A,#3A2410)';
  if (!treasureReady(n)){
    say(n===6 ? '보물섬의 활동 4개를 모두 마치면 보물상자가 열려!' : '보물상자는 <b>연습문제를 끝까지</b> 풀면 열 수 있어!');
    const ph = PHASES[n].find(([k])=>k!=='treasure' && !phaseDone(n,k));
    setCtrls(btn('pill', '하러 가기 ▶', ()=>openPhase(n, ph ? ph[0] : PHASES[n][0][0])));
    const c = mk('', null, null, '🔒', null, pf); css(c, {position:'absolute', left:'0', width:'1220px', top:'170px', textAlign:'center', fontSize:'150px'});
    return;
  }
  // 아직 안 연 상자: 왼쪽에 계산 공간(공책 보드), 오른쪽에 상자
  const side = !isl.treasure;
  if (side){
    const bd = new Board({pen:true, note: n<6 ? '✏️ 미션 문제를 여기서 풀어 봐요' : '✏️ 숫자카드 2, 5, 7, 9로 곱을 만들어 계산해 봐요'});
    if (n<6){ const [a, b] = I.mission.split('×').map(t=>Number(t.trim())); bd.setProblem(a, b); }
  }
  const wrap = mk('ovbg'+(side?' side':''), null, null, `
    <div class="chest"><div class="glow" id="glow"></div><div class="prize" id="prize">${I.prize}</div>
      <div class="lid" id="lid"></div>
      <div class="cbody"><div class="lock" id="lock">${I.code.split('').map((_,i)=>`<div id="l${i}"></div>`).join('')}</div></div>
    </div>
    <div class="ovmsg" id="omsg">${isl.treasure ? `${I.prizeName} ${I.prize}` : '비밀번호를 입력해!'}</div>
    <div class="ovsub" id="osub">${isl.treasure ? '이미 연 보물상자야.' : (n===6 ? '힌트: 숫자카드 2, 5, 7, 9로 만든 <b>가장 큰 곱</b>' : `힌트: 미션 <b>${I.mission}</b>의 답`)}</div>
    <div class="minikeys" id="mk"></div>`, null, ovEl);
  if (isl.treasure){
    I.code.split('').forEach((d,i)=>$('l'+i).textContent = d);
    css($('lid'), {transform:'rotateX(74deg)'}); $('glow').style.opacity = 1; $('prize').style.opacity = 1; $('mk').remove();
    say(`${I.prizeName} ${I.prize}은 벌써 {n} 대장님 거야!`);
    setCtrls(btn('pill', '🗺 지도로', ()=>openMap()), n===6 ? btn('pill y', '👑 인증서', showCert) : null);
    return;
  }
  say(n===6 ? `마지막 보물상자! 비밀번호는 숫자카드 <b>2, 5, 7, 9</b>로 만든 <b>가장 큰 곱</b>이야.` : `보물상자 비밀번호는 오늘의 미션 <b>${I.mission}</b>의 답이야! 기억나?`);
  setCtrls();
  let v = '', wrong = 0;
  const render = () => I.code.split('').forEach((_,i)=>$('l'+i).textContent = v[i] || '');
  const mkEl = $('mk');
  await new Promise(res=>{
    [1,2,3,4,5,6,7,8,9,0].forEach(d=>btn('', String(d), ()=>{
      if (v.length >= I.code.length) return; v += d; render();
      if (v.length === I.code.length){
        if (v === I.code){ res(); return; }
        wrong++; SFX.wrong(); shake($('lock'));
        setTimeout(()=>{ v = ''; render(); }, 500);
        say(wrong < 2 ? `앗, 아니야! 미션 <b>${I.mission}</b>을 공책에 계산해 볼까?` : `비밀번호는 <b>${I.code}</b>! ${n<6 ? `(${I.mission} = ${fmt(Number(I.code))})` : '(92 × 75 = 6900)'}`);
      }
    }, mkEl));
    btn('', '⌫', ()=>{ v = v.slice(0,-1); render(); }, mkEl);
  });
  if (sg !== SG) return;
  mkEl.remove();
  SFX.ding();
  try {
    await waitFixed(300);
    await all([A($('lid'), {transform:'rotateX(74deg)'}, 800, {easing:'cubic-bezier(.3,1.3,.5,1)', fixed:true}), A($('glow'), {opacity:'1'}, 700, {fixed:true})]);
    SFX.fanfare(); confetti(30, 1220, ovEl);
    await A($('prize'), [{opacity:0, transform:'translateY(40px) scale(.3)'},{opacity:1, transform:'translateY(-60px) scale(1.3)', offset:.6},{opacity:1, transform:'translateY(-40px) scale(1)'}], 900, {fixed:true});
  } catch(e){ return; }
  Store.mark(n, 'treasure');
  $('omsg').innerHTML = `${I.prizeName} ${I.prize} 획득!`;
  $('osub').innerHTML = n<6 ? `다음 섬 <b>${ISL[n+1].icon} ${ISL[n+1].name}</b>이 열렸어!` : '모든 섬을 정복했어!';
  say(n<6 ? `찰칵! <b>${I.prizeName}</b>을 찾았어! {n} 대장님, ${I.name} 정복! 다음 섬으로 가 볼까?` : `찰칵! <b>곱셈 왕관</b>을 찾았어! 👑 {n} 대장님은 이제 <b>곱셈 마스터 탐험대장</b>이야!`);
  setCtrls(btn('pill nudge', n<6 ? '⛵ 다음 섬으로' : '👑 인증서 받기', ()=> n<6 ? openMap({moveFrom:n}) : showCert()));
}
function showCert(){
  resetScreen(); $('bMap').style.display = '';
  $('title').innerHTML = '👑 곱셈 마스터'; $('tabs').innerHTML = '';
  const bg = mk('ovbg', null, null, `<div class="cert">
    <div style="font-size:70px">👑</div>
    <h3>곱셈 마스터 탐험대장 인증서</h3>
    <p><b style="font-size:34px">${NM()}</b> 대장님은<br>곱셈 바다의 섬 6개를 모두 탐험하고<br><b>(두 자리 수) × (두 자리 수)</b> 받아올림 곱셈을 정복했습니다.</p>
    <p style="font-size:30px">${ISL.slice(1).map(I=>I.prize).join(' ')}</p>
    <p style="font-size:18px;color:#8A6A3A">${new Date().toLocaleDateString('ko-KR')} · 셈이 드림 🦜</p></div>`, null, ovEl);
  SFX.fanfare(); confetti(30, 1220, ovEl);
  say(`정말 대단해, {n} 대장님! 화면을 캡처해서 가족에게 자랑해 봐! 🎉`);
  setCtrls(btn('pill', '🗺 지도로', ()=>openMap()));
}

/* ---------- 부모님 화면 ---------- */
function openParent(){
  ovEl.innerHTML = '';
  const d = Store.d;
  const rows = ISL.slice(1).map((I,k)=>{
    const n = k+1, s = Store.isl(n);
    const pr = s.practice ? `${s.practice.ok} / ${s.practice.total}` : '-';
    const cells = n===6 ? [['wp','문장제'],['blank','빈칸'],['cards','카드'],['est','어림']].map(([x,l])=>`${l} ${s[x]?'✅':'⬜'}`).join(' ') : `${s.lesson?'✅':'⬜'} 원리 · ${n===5?'':(s.guided?'✅':'⬜')+' 따라 풀기 · '}연습 ${pr}`;
    return `<tr><td>${n}일차 ${I.icon} ${I.name}</td><td style="text-align:left">${cells}</td><td>${s.treasure ? I.prize : '⬜'}</td></tr>`;
  }).join('');
  const mis = Object.entries(d.mis).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const maxM = mis.length ? mis[0][1] : 1;
  const misHtml = mis.length ? mis.slice(0,3).map(([k,v],i)=>`<div style="margin:6px 0"><b>${i+1}. ${MISTAKE_NAME[k]}</b> ${v}회<span class=bar style="width:${Math.round(v/maxM*180)}px"></span><div class=ptip>→ ${MISTAKE_ADVICE[k]}</div></div>`).join('') : '<div class=ptip>아직 기록된 실수가 없어요.</div>';
  const t = d.times.filter(x=>x.ok);
  const avg = a => a.length ? Math.round(a.reduce((x,y)=>x+y.sec,0)/a.length) : null;
  const first = avg(t.slice(0,5)), last = avg(t.slice(-5));
  const timeHtml = t.length ? `<div>첫 5문제 평균 <b>${first}초</b> → 최근 5문제 평균 <b>${last}초</b> ${last<first?'🚀':''}</div><div class=ptip style="margin-top:6px">${d.times.slice(-8).reverse().map(x=>`${x.q} · ${x.sec}초 ${x.ok?'✅':'🔁'}`).join('<br>')}</div>` : '<div class=ptip>훈련 섬에서 문제를 풀면 걸린 시간이 기록돼요.</div>';
  const tips = ISL.slice(1).map((I,k)=>`<div class=ptip><b>${I.icon} ${I.name}</b> — ${PARENT_TIPS[k+1].join(' / ')}</div>`).join('');
  const p = mk('parent', null, null, `
    <button class="x" id="pX">✕</button>
    <h3>👨‍👩‍👧 부모님 화면 — ${NM()}</h3>
    <table><tr><th>섬</th><th>진행</th><th>보물</th></tr>${rows}</table>
    <div class="cols">
      <div><h4>자주 한 실수 Top 3</h4>${misHtml}</div>
      <div><h4>훈련 섬 손풀이 시간</h4>${timeHtml}</div>
    </div>
    <h4>섬별 "이렇게 물어봐 주세요"</h4>${tips}
    <div class="pbtns">
      <button id="pUnlock">${d.unlockAll ? '🔓 섬 순서대로 열기로 되돌리기' : '🔓 모든 섬 바로 열기'}</button>
      <button id="pName">✏️ 이름 바꾸기</button>
      <button id="pReset">🗑 학습 기록 초기화</button>
    </div>
    <div class=ptip style="margin-top:10px">기록은 이 아이패드의 이 브라우저 안에만 저장돼요. 다른 기기와는 공유되지 않아요.</div>`, null, ovEl);
  $('pX').onclick = ()=>{ ovEl.innerHTML = ''; openMap(); };
  $('pUnlock').onclick = ()=>{ d.unlockAll = !d.unlockAll; Store.save(); openParent(); };
  $('pName').onclick = ()=>{ const v = prompt('부르는 이름을 적어 주세요', NM()); if (v && v.trim()){ d.name = v.trim(); Store.save(); openParent(); } };
  $('pReset').onclick = ()=>{ if (confirm('학습 기록을 모두 지울까요? (이름은 그대로 남아요)')){ Store.reset(); openParent(); } };
}

/* ---------- 시작 ---------- */
$('bMap').onclick = ()=>openMap();
function startMsg(){
  $('startTitle').textContent = `${NM()}이의 곱셈 섬 탐험`;
  document.title = `${NM()}이의 곱셈 섬 탐험`;
  const cur = currentIsland();
  $('startMsg').innerHTML = `<b>${NM()}</b> 대장님, ${Store.isl(1).lesson ? `오늘은 <b>${cur}일차 ${ISL[cur].name}</b>을 탐험해요!` : '하루에 섬 하나씩, 6일 동안 탐험해요!'}<br>
    <span style="font-size:17px">부모님 Tip · 원리 장면에서는 상단 💬 버튼의 질문으로 대화해 주세요. 지도 화면의 🔒 버튼을 길게 누르면 학습 기록을 볼 수 있어요.</span>`;
}
startMsg();
$('rename').onclick = ()=>{ const v = prompt('부르는 이름을 적어 주세요', NM()); if (v && v.trim()){ Store.d.name = v.trim(); Store.save(); startMsg(); } };
$('go').onclick = ()=>{ unlockAudio(); SFX.ding(); $('start').style.display = 'none'; openMap(); };
