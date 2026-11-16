/* =========================================================
   app.js — 시작 · 지도 · 섬 화면 · 보물상자 · 부모님 화면
   ========================================================= */
const ISL_MUL = [null,
  {name:'점프 섬',        icon:'🦘', mission:'30 × 40', code:'1200', prize:'🐚', prizeName:'반짝 진주',   x:165,  y:470},
  {name:'십막대 섬',      icon:'🪵', mission:'23 × 30', code:'690',  prize:'🪙', prizeName:'황금 동전',   x:360,  y:255},
  {name:'쪼개기 섬',      icon:'✂️', mission:'12 × 13', code:'156',  prize:'💍', prizeName:'마법 반지',   x:565,  y:470},
  {name:'받아올림 화산섬', icon:'🌋', mission:'39 × 27', code:'1053', prize:'💎', prizeName:'화산 보석',   x:770,  y:255},
  {name:'훈련 섬',        icon:'🏋️', mission:'46 × 28', code:'1288', prize:'🏆', prizeName:'훈련 트로피', x:965,  y:470},
  {name:'보물섬',         icon:'🏝️', mission:'숫자카드 최대 곱', code:'6900', prize:'👑', prizeName:'곱셈 왕관', x:1135, y:255},
];
const PHASES_MUL = {
  1: [['lesson','🎬 원리'],['guided','✋ 따라 풀기'],['practice','✏️ 연습문제'],['treasure','🎁 보물']],
  5: [['lesson','🎬 공책 쓰기'],['practice','🏋️ 훈련'],['treasure','🎁 보물']],
  6: [['wp','📖 문장제'],['blank','🔍 빈칸 추리'],['cards','🃏 숫자카드'],['est','⚖️ 어림·오답'],['treasure','🎁 보물']],
};
PHASES_MUL[2] = PHASES_MUL[3] = PHASES_MUL[4] = PHASES_MUL[1];
// 나눗셈 바다 (아이스크림 3-2 「2. 나눗셈」 차시 + 3-1 복습). 비밀번호는 몫(과 나머지)을 이어 쓴 수
const ISL_DIV = [
  {name:'사탕 섬',        icon:'🍬', mission:'24 ÷ 6',  code:'4',    prize:'🧭', prizeName:'나침반',     x:120,  y:470},
  {name:'몇십 섬',        icon:'🪵', mission:'90 ÷ 5',  code:'18',   prize:'⚓', prizeName:'은빛 닻',    x:265,  y:255},
  {name:'몇십몇 섬',      icon:'🧩', mission:'96 ÷ 4',  code:'24',   prize:'🔭', prizeName:'망원경',     x:410,  y:470},
  {name:'나머지 섬',      icon:'🧺', mission:'53 ÷ 4',  code:'131',  prize:'🪢', prizeName:'매듭 밧줄',  x:555,  y:255},
  {name:'확인 섬',        icon:'🔍', mission:'□ ÷ 6 = 12 … 5', code:'77', prize:'🗝️', prizeName:'황금 열쇠', x:700, y:470},
  {name:'세 자리 섬',     icon:'🧱', mission:'456 ÷ 3', code:'152',  prize:'🏮', prizeName:'바다 등불',  x:845,  y:255},
  {name:'큰 나머지 섬',   icon:'🎒', mission:'487 ÷ 4', code:'1213', prize:'🗺️', prizeName:'보물 지도',  x:990,  y:470},
  {name:'나눗셈 보물섬',  icon:'🏝️', mission:'숫자카드 최대 몫', code:'487', prize:'🌟', prizeName:'나눗셈 별', x:1135, y:255},
];
const PHASES_DIV = {
  0: [['lesson','🎬 원리'],['practice','✏️ 연습문제'],['treasure','🎁 보물']],
  1: [['lesson','🎬 원리'],['guided','✋ 따라 풀기'],['practice','✏️ 연습문제'],['treasure','🎁 보물']],
  4: [['lesson','🎬 원리'],['practice','✏️ 확인 연습'],['treasure','🎁 보물']],
  7: [['wp','📖 문장제'],['blank','🔍 빈칸 추리'],['cards','🃏 숫자카드'],['est','⚖️ 어림'],['treasure','🎁 보물']],
};
PHASES_DIV[2] = PHASES_DIV[3] = PHASES_DIV[5] = PHASES_DIV[6] = PHASES_DIV[1];
const SEA_DEF = {
  mul: {name:'곱셈 바다', title:'곱셈 섬 탐험', ISL:ISL_MUL, PHASES:PHASES_MUL, list:[1,2,3,4,5,6], last:6, finalActs:['wp','blank','cards','est'],
        master:'곱셈 마스터', crown:'곱셈 왕관', what:'<b>(두 자리 수) × (두 자리 수)</b> 받아올림 곱셈'},
  div: {name:'나눗셈 바다', title:'나눗셈 섬 탐험', ISL:ISL_DIV, PHASES:PHASES_DIV, list:[0,1,2,3,4,5,6,7], last:7, finalActs:['wp','blank','cards','est'],
        master:'나눗셈 마스터', crown:'나눗셈 별', what:'<b>(세 자리 수) ÷ (한 자리 수)</b> 나머지가 있는 나눗셈'},
};
// 나눗셈 바다는 다 만들 때까지 주소에 ?div 를 붙였을 때만 보인다
const DIV_OPEN = true;   // 나눗셈 바다 공개 (2026-11-14)
let ISL = ISL_MUL, PHASES = PHASES_MUL;
const SEAD = () => SEA_DEF[Store.sea];
function setSea(sea){
  if (sea === 'div' && !DIV_OPEN) sea = 'mul';
  Store.sea = sea; ISL = SEA_DEF[sea].ISL; PHASES = SEA_DEF[sea].PHASES;
  if (Store.d.lastSea !== sea){ Store.d.lastSea = sea; Store.save(); }
}
setSea(Store.d.lastSea || 'mul');
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
const isLast = n => n === SEAD().last;
const treasureReady = n => isLast(n) ? SEAD().finalActs.every(k=>Store.isl(n)[k]) : phaseDone(n, 'practice');
const prevIsl = n => { const L = SEAD().list, i = L.indexOf(n); return i > 0 ? L[i-1] : null; };
const nextIsl = n => { const L = SEAD().list, i = L.indexOf(n); return i < L.length-1 ? L[i+1] : null; };
const unlocked = n => prevIsl(n) === null || Store.d.unlockAll || !!Store.isl(prevIsl(n)).treasure;
const currentIsland = () => { for (const n of SEAD().list) if (!Store.isl(n).treasure) return n; return SEAD().last; };
const dayOf = n => SEAD().list.indexOf(n) + 1;

function resetScreen(){
  SG++; abortAll(); clearTimers(); closeLesson();
  screenEl.innerHTML = ''; fx.innerHTML = ''; ovEl.innerHTML = '';
  KEYPAD = null; $('bottom').classList.remove('wide'); $('tabs').className = ''; $('tabs').innerHTML = '';
  $('ctrls').innerHTML = '';
}

/* ---------- 지도 ---------- */
function openMap(opt={}){
  resetScreen();
  $('bMap').style.display = 'none';
  $('title').innerHTML = `${NM()}이의 ${SEAD().title}`;
  $('tabs').innerHTML = '';
  if (DIV_OPEN) Object.entries(SEA_DEF).forEach(([k, D])=>btn(k===Store.sea ? 'on' : '', `${k==='mul'?'✖️':'➗'} ${D.name}`, ()=>{ if (k===Store.sea) return; setSea(k); openMap({firstVisit:true}); }, $('tabs')));
  const sea = mk('sea', null, null, '', null, screenEl);
  [[80,60],[300,150],[520,40],[700,140],[960,70],[1100,170],[240,380],[460,330],[680,420],[900,350],[60,250],[1150,420]].forEach(([x,y])=>{ const w = mk('wave', x, y, '〰️', null, sea); });
  const pts = SEAD().list.map(n=>ISL[n]).map(i=>`${i.x-30},${i.y-80}`).join(' ');
  sea.insertAdjacentHTML('beforeend', `<svg width="1220" height="565" style="position:absolute;left:0;top:0"><polyline points="${pts}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/></svg>`);
  const cur = currentIsland();
  for (const n of SEAD().list){
    const I = ISL[n], lock = !unlocked(n), done = !!Store.isl(n).treasure;
    const b = btn('isl'+(lock?' locked':'')+(n===cur && !lock && !done ? ' cur':''), `
      <div class="land"></div><div class="ico">${I.icon}</div><div class="day">${dayOf(n)}일차</div>
      <div class="nm">${I.name}</div><div class="st">${lock ? '🔒' : (done ? I.prize : '')}</div>`, ()=>{
        if (lock){ SFX.wrong(); say(`이 섬은 아직 잠겨 있어! <b>${ISL[prevIsl(n)].name}</b>의 보물상자를 먼저 열어 줘.`); return; }
        openIsland(n);
      }, screenEl);
    css(b, {left:(I.x)+'px', top:(I.y)+'px'});
  }
  // 시험 등대 (언제든 들어갈 수 있음)
  const tw = btn('tower', `${TOWER_SVG}<div class=nm>시험 등대</div><div class=sub>단원평가 · 문제은행</div>`, ()=>openTower(), screenEl);
  css(tw, Store.sea === 'div' ? {left:'1098px', top:'378px'} : {left:'470px', top:'104px'});   // 나눗셈 바다는 섬이 8개라 오른쪽 아래 빈자리에
  const from = opt.moveFrom !== undefined ? ISL[opt.moveFrom] : ISL[cur];
  const boat = mk('boat', from.x+40, from.y-20, `<img src="img/char/scene_boat.webp" alt="">`, null, screenEl);
  if (opt.moveFrom !== undefined && nextIsl(opt.moveFrom) !== null){ const to = ISL[nextIsl(opt.moveFrom)]; setTimeout(()=>{ css(boat, {left:(to.x+40)+'px', top:(to.y-20)+'px'}); SFX.swoosh(); }, 500); }
  const tr = mk('trophies', null, null, '보물 ' + SEAD().list.map(n=>`<span class="${Store.isl(n).treasure?'got':''}">${ISL[n].prize}</span>`).join(''), null, screenEl);
  const pb = btn('hbtn', '🔒 부모님', ()=>askPin(openParent), screenEl); css(pb, {left:'1000px', top:'588px', position:'absolute'});
  const allDone = SEAD().list.every(n=>Store.isl(n).treasure);
  say(allDone ? `{n} 대장님, 모든 섬을 정복했어! 👑 복습하고 싶은 섬을 골라 봐.`
              : `{n} 대장님, 오늘은 <b>${dayOf(cur)}일차 ${ISL[cur].name}</b>${J(ISL[cur].name,'을','를')} 탐험할 차례야! 섬을 눌러 출발!`);
  setCtrls(btn('pill nudge', allDone ? '👑 인증서 보기' : `${ISL[cur].icon} 출발!`, ()=> allDone ? showCert() : openIsland(cur)));
  if (Store.sea === 'div' && !Store.d.divGate) showDivGate();   // 지도 버튼 다음에 띄워야 환영 화면 버튼이 남는다 (버튼을 눌러야 본 것으로 저장)
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
  $('title').innerHTML = `${I.icon} ${I.name}<small>${dayOf(n)}일차${!isLast(n)?' · 미션 '+I.mission:''}</small>`;
  const tabs = $('tabs'); tabs.innerHTML = '';
  PHASES[n].forEach(([k, label])=>{
    const b = btn((k===key?'on ':'') + (phaseDone(n,k)?'done ':'') + (k==='treasure' && !treasureReady(n) ? 'locked' : ''), label, ()=>openPhase(n, k), tabs);
  });
}
function openPhase(n, key){
  resetScreen();
  islandHeader(n, key);
  if (Store.sea === 'div' && key !== 'treasure') return divPhase(n, key);
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

const PARENT_TIPS_DIV = {
  0: ['사탕 12개를 3명이 나누면 한 명에 몇 개일까? 3개씩 묶으면 몇 묶음일까?', '3 × 4 = 12를 나눗셈식 두 개로 바꿔 볼까?'],
  1: ['70을 5묶음으로 나눌 때 십막대 2개가 남으면 어떻게 할까?', '몫의 십의 자리는 왜 십막대 개수일까?'],
  2: ['52 ÷ 4에서 남은 십막대 1개는 낱개 몇 개와 같을까?', '세로식에서 2를 내려 쓰는 건 그림에서 무엇일까?'],
  3: ['나머지는 왜 나누는 수보다 작아야 할까?', '53 ÷ 4에서 남은 1개는 어디에 있을까?'],
  4: ['13 × 4 + 1이 53이면 무엇을 알 수 있을까?', '나머지가 6인데 나누는 수가 4라면 무엇이 잘못됐을까?'],
  5: ['256 ÷ 4에서 백판 2개는 왜 바로 나눌 수 없을까?', '몫 가운데에 0이 오는 건 언제일까?'],
  6: ['487 ÷ 4의 답이 맞는지 어떻게 확인할까?', '나머지가 0이 아니면 처음 수와 어떻게 다를까?'],
  7: ['"몇 상자가 필요할까?" 문제에서 나머지는 어떻게 할까?', '몫이 가장 큰 나눗셈을 만들려면 나누는 수는 어떤 카드?'],
};
const DIV_ADVICE = {
  rem:  '나머지 섬 원리 장면에서 "남은 것이 접시 수보다 작으면 끝"을 다시 보여 주세요. 나머지가 나누는 수보다 크면 한 번 더 나눌 수 있어요.',
  zero: '세 자리 섬의 "몫 가운데 0" 장면을 다시 보여 주세요. 나눌 수 없는 자리에도 몫에 0을 써야 자리가 맞아요.',
  sub:  '몫은 맞았는데 빼기에서 틀렸어요. 받아내림 있는 뺄셈을 천천히 확인해 주세요.',
  fact: '곱셈구구에서 실수했어요. 나누는 수의 단(예: 7단)을 짧게 복습하면 좋아요.',
  down: '다음 자리를 내려 쓰지 않고 멈췄어요. "남은 십막대 → 낱개로 바꾸기" 장면과 내려쓰기 화살표를 다시 보여 주세요.',
  other:'문제를 다시 읽고, 나누는 수 × 몫 + 나머지로 확인하는 습관을 함께 길러 주세요.',
};
// 나눗셈 미션에 나머지가 있는가 (있으면 비밀번호 = 몫과 나머지를 이어 쓴 수)
function missionRem(n){ const m = ISL[n].mission.match(/^(\d+) ÷ (\d+)$/); return m ? +m[1] % +m[2] !== 0 : false; }
function treasureHint(n){
  if (Store.sea === 'div'){
    if (isLast(n)) return '힌트: 숫자카드 2, 5, 7, 9로 만든 (세 자리)÷(한 자리) 중 <b>몫이 가장 큰</b> 나눗셈의 몫';
    if (n === 4) return '힌트: 나누는 수 × 몫 + 나머지 = □';
    return missionRem(n) ? `힌트: 미션 <b>${ISL[n].mission}</b>의 몫과 나머지를 이어 쓴 수` : `힌트: 미션 <b>${ISL[n].mission}</b>의 몫`;
  }
  return isLast(n) ? '힌트: 숫자카드 2, 5, 7, 9로 만든 <b>가장 큰 곱</b>' : `힌트: 미션 <b>${ISL[n].mission}</b>의 답`;
}
function treasureIntro(n){
  if (Store.sea === 'div'){
    if (isLast(n)) return `마지막 보물상자! 숫자카드 <b>2, 5, 7, 9</b>로 (세 자리 수)÷(한 자리 수)를 만들 때 <b>가장 큰 몫</b>이 비밀번호야.`;
    if (n === 4) return `□ ÷ 6 = 12 … 5에서 □는 얼마일까? <b>나누는 수 × 몫 + 나머지</b>로 구해 봐!`;
    return `보물상자 비밀번호는 오늘의 미션 <b>${ISL[n].mission}</b>의 ${missionRem(n) ? '<b>몫과 나머지</b>를 이어 쓴 수야!' : '<b>몫</b>이야!'}`;
  }
  return isLast(n) ? `마지막 보물상자! 비밀번호는 숫자카드 <b>2, 5, 7, 9</b>로 만든 <b>가장 큰 곱</b>이야.` : `보물상자 비밀번호는 오늘의 미션 <b>${ISL[n].mission}</b>의 답이야! 기억나?`;
}
function showDivGate(){
  const g = mk('ovbg gate', null, null, `<img src="img/char/scene_division_gate.webp" alt=""><div><div class="ovmsg">나눗셈 바다에 온 걸 환영해!</div>
    <div class="ovsub">똑같이 나누는 섬 8개가 기다리고 있어.<br>첫 섬은 <b>🍬 사탕 섬</b>이야.</div></div>`, null, ovEl);
  say(`여기는 <b>나눗셈 바다</b>! 곱셈을 거꾸로 하면 나눗셈이야. 루퍼드랑 하나씩 똑같이 나눠 보자.`, 'hello');
  // 환영 화면에서도 진도와 상관없이 시험 등대·지도로 갈 수 있게
  const seen = () => { Store.d.divGate = true; Store.save(); ovEl.innerHTML = ''; };
  setCtrls(btn('pill w sm', '🗺 지도 보기', ()=>{ seen(); openMap(); }),
           btn('pill w sm', '🗼 시험 등대', ()=>{ seen(); openTower(); }),
           btn('pill nudge', '⛵ 출발!', ()=>{ seen(); openIsland(currentIsland()); }));
}

/* ---------- 보물상자 ---------- */
async function openTreasure(n){
  const sg = SG, I = ISL[n], isl = Store.isl(n);
  const pf = fullPanel(); pf.style.background = 'linear-gradient(#5A3A1A,#3A2410)';
  if (!treasureReady(n)){
    say(isLast(n) ? '보물섬의 활동 4개를 모두 마치면 보물상자가 열려!' : '보물상자는 <b>연습문제를 끝까지</b> 풀면 열 수 있어!');
    const ph = PHASES[n].find(([k])=>k!=='treasure' && !phaseDone(n,k));
    setCtrls(btn('pill', '하러 가기 ▶', ()=>openPhase(n, ph ? ph[0] : PHASES[n][0][0])));
    const c = mk('', null, null, '🔒', null, pf); css(c, {position:'absolute', left:'0', width:'1220px', top:'170px', textAlign:'center', fontSize:'150px'});
    return;
  }
  // 아직 안 연 상자: 왼쪽에 계산 공간(공책 보드), 오른쪽에 상자
  const side = !isl.treasure;
  let bd = null, ma = 0, mb = 0;
  const DIVS = Store.sea === 'div';
  if (side){
    if (DIVS){
      bd = new DivBoard({pen:true, note: isLast(n) ? '✏️ 숫자카드 2, 5, 7, 9로 나눗셈을 만들어 계산해 봐요' : '✏️ 미션 문제를 여기서 풀어 봐요'});
      const m = I.mission.match(/^(\d+) ÷ (\d+)$/); if (m){ [ma, mb] = [+m[1], +m[2]]; bd.setProblem(ma, mb); }
    } else {
      bd = new Board({pen:true, note: !isLast(n) ? '✏️ 미션 문제를 여기서 풀어 봐요' : '✏️ 숫자카드 2, 5, 7, 9로 곱을 만들어 계산해 봐요'});
      if (!isLast(n)){ [ma, mb] = I.mission.split('×').map(t=>Number(t.trim())); bd.setProblem(ma, mb); }
    }
  }
  const wrap = mk('ovbg'+(side?' side':''), null, null, `
    <div class="chest"><div class="glow" id="glow"></div><div class="prize" id="prize">${I.prize}</div>
      <div class="lid" id="lid"></div>
      <div class="cbody"><div class="lock" id="lock">${I.code.split('').map((_,i)=>`<div id="l${i}"></div>`).join('')}</div></div>
    </div>
    <div class="ovmsg" id="omsg">${isl.treasure ? `${I.prizeName} ${I.prize}` : '비밀번호를 입력해!'}</div>
    <div class="ovsub" id="osub">${isl.treasure ? '이미 연 보물상자야.' : treasureHint(n)}</div>
    <div class="minikeys" id="mk"></div>`, null, ovEl);
  if (isl.treasure){
    I.code.split('').forEach((d,i)=>$('l'+i).textContent = d);
    css($('lid'), {transform:'rotateX(74deg)'}); $('glow').style.opacity = 1; $('prize').style.opacity = 1; $('mk').remove();
    say(`${I.prizeName} ${I.prize}은 벌써 {n} 대장님 거야!`);
    setCtrls(btn('pill', '🗺 지도로', ()=>openMap()), isLast(n) ? btn('pill y', '👑 인증서', showCert) : null);
    return;
  }
  say(treasureIntro(n));
  setCtrls();
  let v = '', wrong = 0;
  const render = () => I.code.split('').forEach((_,i)=>$('l'+i).textContent = v[i] || '');
  const mkEl = $('mk');
  // 두 번째로 틀리면 비밀번호 대신 미션을 같이 푼다 (정답 공개는 세 번째부터)
  const helpTogether = () => {
    if (DIVS) return divHelpTogether(n, bd);
    if (isLast(n)){ say(`같이 생각해 보자! 큰 숫자 <b>9</b>와 <b>7</b>을 <b>십의 자리</b>에 놓아 봐. 9□ × 7□에서 남은 <b>2</b>와 <b>5</b>는 어디에 둘까? 두 가지를 공책에 곱해서 더 큰 쪽이 비밀번호야.`); return; }
    const M = mulModel(ma, mb);
    if (M.rows.length === 2 && bd){
      const S = solutionStages(ma, mb).S, cut = S.findIndex(s=>s.acts && s.acts.some(x=>x.t==='line'));
      bd.setProblem(ma, mb); bd.clearInk(); fire(bd.reveal(S.slice(0, cut), 200).then(()=>bd.unhl()));
      say(`같이 풀어 보자! 공책에 <b>${ma} × ${M.rows[0].m} = ${fmt(M.rows[0].val)}</b>, <b>${ma} × ${M.rows[1].m}0 = ${fmt(M.rows[1].val)}</b> 두 줄을 써 줬어. 두 줄을 <b>더하면</b> 비밀번호야!`);
    } else if (ma%10===0 && mb%10===0){
      say(`같이 풀어 보자! 0을 떼고 <b>${ma/10} × ${mb/10}</b>${J(mb/10,'을','를')} 먼저 구한 다음, 끝에 0을 <b>몇 개</b> 붙일지 세어 봐.`);
    } else {
      const bt = Math.floor(mb/10);
      say(`같이 풀어 보자! <b>${ma} × ${bt}</b>${J(bt,'을','를')} 먼저 구하고, 끝에 <b>0</b>을 하나 붙여 봐.`);
    }
  };
  const showCode = () => {
    isl.codeShown = true; Store.save();
    if (DIVS){ say(`세 번이나 도전했어, 멋져! 비밀번호는 <b>${I.code}</b>. ${divCodeWhy(n)}`); if (bd && ma && wrong === 3){ abortAll(); bd.setProblem(ma, mb); bd.clearInk(); fire(bd.reveal(160)); } return; }
    say(`세 번이나 도전했어, 멋져! 비밀번호는 <b>${I.code}</b>. ${!isLast(n) ? `(${I.mission} = ${fmt(Number(I.code))}) 공책의 세로셈과 비교해 봐.` : '(92 × 75 = 6900)'}`);
    if (bd && !isLast(n) && wrong === 3){ abortAll(); bd.setProblem(ma, mb); bd.clearInk(); fire(bd.reveal(solutionStages(ma, mb).S, 160).then(()=>bd.unhl())); }
  };
  await new Promise(res=>{
    [1,2,3,4,5,6,7,8,9,0].forEach(d=>btn('', String(d), ()=>{
      if (v.length >= I.code.length) return; v += d; render();
      if (v.length === I.code.length){
        if (v === I.code){ res(); return; }
        wrong++; SFX.wrong(); shake($('lock'));
        setTimeout(()=>{ v = ''; render(); }, 500);
        if (wrong === 1) say(isLast(n) ? `앗, 아니야! 숫자카드로 여러 가지를 만들어 공책에 계산해 볼까?` : `앗, 아니야! 미션 <b>${I.mission}</b>${J(I.mission,'을','를')} 공책에 계산해 볼까?`);
        else if (wrong === 2) helpTogether();
        else showCode();
      }
    }, mkEl));
    btn('', '⌫', ()=>{ v = v.slice(0,-1); render(); }, mkEl);
  });
  if (sg !== SG) return;
  mkEl.remove();
  SFX.ding();
  // 비밀번호를 맞힌 순간 저장 (열리는 연출 중에 지도로 나가도 보물은 남게)
  Store.mark(n, 'treasure');
  Store.ev('island.treasure', {isl:n, codeShown:!!isl.codeShown});
  try {
    await waitFixed(300);
    await all([A($('lid'), {transform:'rotateX(74deg)'}, 800, {easing:'cubic-bezier(.3,1.3,.5,1)', fixed:true}), A($('glow'), {opacity:'1'}, 700, {fixed:true})]);
    SFX.fanfare(); confetti(30, 1220, ovEl);
    await A($('prize'), [{opacity:0, transform:'translateY(40px) scale(.3)'},{opacity:1, transform:'translateY(-60px) scale(1.3)', offset:.6},{opacity:1, transform:'translateY(-40px) scale(1)'}], 900, {fixed:true});
  } catch(e){ return; }
  const nx = nextIsl(n);
  $('omsg').innerHTML = `${I.prizeName} ${I.prize} 획득!`;
  $('osub').innerHTML = nx !== null ? `다음 섬 <b>${ISL[nx].icon} ${ISL[nx].name}</b>이 열렸어!` : '모든 섬을 정복했어!';
  say(nx !== null ? `찰칵! <b>${I.prizeName}</b>${J(I.prizeName,'을','를')} 찾았어! {n} 대장님, ${I.name} 정복! 다음 섬으로 가 볼까?` : `찰칵! <b>${SEAD().crown}</b>${J(SEAD().crown,'을','를')} 찾았어! 👑 {n} 대장님은 이제 <b>${SEAD().master} 탐험대장</b>이야!`, 'praise');
  setCtrls(btn('pill nudge', nx !== null ? '⛵ 다음 섬으로' : '👑 인증서 받기', ()=> nx !== null ? openMap({moveFrom:n}) : showCert()));
}
function showCert(){
  resetScreen(); $('bMap').style.display = '';
  const D = SEAD();
  $('title').innerHTML = `👑 ${D.master}`; $('tabs').innerHTML = '';
  const bg = mk('ovbg', null, null, `<div class="cert"><img class="certpic" src="img/char/scene_certificate.webp" alt="">
    <h3>${D.master} 탐험대장 인증서</h3>
    <p><b style="font-size:34px">${NM()}</b> 대장님은<br>${D.name}의 섬 ${D.list.length}개를 모두 탐험하고<br>${D.what}을 정복했습니다.</p>
    <p style="font-size:30px">${D.list.map(n=>ISL[n].prize).join(' ')}</p>
    <p style="font-size:18px;color:#8A6A3A">${new Date().toLocaleDateString('ko-KR')} · 루퍼드 드림 🐾</p></div>`, null, ovEl);
  SFX.fanfare(); confetti(30, 1220, ovEl);
  say(`정말 대단해, {n} 대장님! 화면을 캡처해서 가족에게 자랑해 봐! 🎉`);
  setCtrls(btn('pill', '🗺 지도로', ()=>openMap()));
}

/* ---------- 부모님 비밀번호 (4자리) ----------
   학습 기록과 따로 저장해서 '기록 초기화'에도 남는다.
   잊었을 때: 주소 끝에 ?pin=reset 을 붙여 열면 다시 정할 수 있다. */
const PIN_KEY = 'chae_math_pin';
const getPin = () => { try { return localStorage.getItem(PIN_KEY); } catch(e){ return null; } };
const setPin = p => { try { p ? localStorage.setItem(PIN_KEY, p) : localStorage.removeItem(PIN_KEY); } catch(e){} };
if (/[?&]pin=reset\b/.test(location.search)){
  setPin(null);
  try { history.replaceState(null, '', location.pathname + location.search.replace(/[?&]pin=reset\b/, '').replace(/^&/, '?') + location.hash); } catch(e){}
}
function askPin(onOk, opt={}){
  ovEl.innerHTML = '';
  const saved = opt.change ? null : getPin();   // 바꾸기: 새로 두 번 입력해서 확인될 때만 저장 (✕로 닫으면 예전 비밀번호 그대로)
  let first = null;                       // 처음 정할 때 첫 번째 입력
  const wrap = mk('ovbg pinbg', null, null, `
    <div class="pinic">🔒</div>
    <div class="ovmsg" id="pmsg"></div>
    <div class="ovsub" id="psub"></div>
    <div class="pinbox" id="pbox">${'<div></div>'.repeat(4)}</div>
    <div class="minikeys" id="pkeys"></div>`, null, ovEl);
  const title = () => {
    if (saved){ $('pmsg').textContent = '부모님 확인'; $('psub').innerHTML = '부모님 비밀번호 4자리를 입력해 주세요.'; }
    else if (!first){ $('pmsg').textContent = '부모님 비밀번호 정하기'; $('psub').innerHTML = '아이가 모르는 숫자 4자리를 정해 주세요.<br>부모님 화면을 열 때마다 물어봐요.'; }
    else { $('pmsg').textContent = '한 번 더 입력해 주세요'; $('psub').innerHTML = '방금 정한 4자리를 다시 눌러 확인해요.'; }
  };
  let v = '';
  const render = () => [...$('pbox').children].forEach((d,i)=>d.textContent = v[i] ? '●' : '');
  const done = val => {
    if (saved){
      if (val === saved){ ovEl.innerHTML = ''; SFX.ding(); onOk(); return; }
      SFX.wrong(); shake($('pbox')); $('psub').innerHTML = '비밀번호가 달라요. 다시 입력해 주세요.';
    } else if (!first){ first = val; title(); }
    else if (val === first){ setPin(val); ovEl.innerHTML = ''; SFX.ding(); onOk(); return; }
    else { first = null; SFX.wrong(); shake($('pbox')); title(); $('psub').innerHTML = '두 번 입력한 숫자가 달라요. 처음부터 다시 정해 주세요.'; }
    setTimeout(()=>{ v = ''; render(); }, 350);
  };
  [1,2,3,4,5,6,7,8,9,0].forEach(d=>btn('', String(d), ()=>{
    if (v.length >= 4) return; v += d; render();
    if (v.length === 4) done(v);
  }, $('pkeys')));
  btn('', '⌫', ()=>{ v = v.slice(0,-1); render(); }, $('pkeys'));
  btn('pinx', '✕', ()=>{ ovEl.innerHTML = ''; }, $('pkeys'));
  title(); render();
}

/* ---------- 부모님 화면 ---------- */
// 나눗셈 바다 부모님 화면: 연습문제 풀이 기록 (Store.ev 'solve')
function divSolveHtml(){
  const L = Store.d.ev.filter(e=>e.ev === 'solve' && e.sea === 'div');
  if (!L.length) return '<div class=ptip>섬의 연습문제를 풀면 기록이 쌓여요.</div>';
  const ok = L.filter(e=>e.r === 'ok').length, sol = L.filter(e=>e.help === 'sol').length;
  const mark = e => e.r === 'ok' ? '✅' : e.r === 'fix' ? '🔁' : '📖';
  return `<div>푼 문제 <b>${L.length}개</b> · 한 번에 맞힘 <b>${Math.round(ok/L.length*100)}%</b>${sol ? ` · 풀이 보기 ${sol}번` : ''}</div>
    <div class=ptip style="margin-top:6px">${L.slice(-8).reverse().map(e=>`${e.q} ${mark(e)}`).join('<br>')}</div>
    <div class=ptip style="margin-top:4px">✅ 한 번에 · 🔁 고쳐서 맞힘 · 📖 풀이를 봄</div>`;
}
function openParent(){
  ovEl.innerHTML = '';
  const d = Store.d;
  const DV = Store.sea === 'div';
  const rows = SEAD().list.map(n=>{
    const I = ISL[n], s = Store.isl(n), ph = PHASES[n].map(([k])=>k);
    const pr = s.practice ? `${s.practice.ok} / ${s.practice.total}` : '-';
    const cells = isLast(n) ? [['wp','문장제'],['blank','빈칸'],['cards','카드'],['est','어림']].map(([x,l])=>`${l} ${s[x]?'✅':'⬜'}`).join(' ') : `${s.lesson?'✅':'⬜'} 원리 · ${ph.includes('guided')?(s.guided?'✅':'⬜')+' 따라 풀기 · ':''}연습 ${pr}`;
    return `<tr><td>${dayOf(n)}일차 ${I.icon} ${I.name}</td><td style="text-align:left">${cells}</td><td>${s.treasure ? I.prize : '⬜'}</td></tr>`;
  }).join('');
  const mis = Object.entries(Store.mis()).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const maxM = mis.length ? mis[0][1] : 1;
  const MN = DV ? DIV_MISTAKE_NAME : MISTAKE_NAME, MA = DV ? DIV_ADVICE : MISTAKE_ADVICE;
  const misHtml = mis.length ? mis.slice(0,3).map(([k,v],i)=>`<div style="margin:6px 0"><b>${i+1}. ${MN[k]}</b> ${v}회<span class=bar style="width:${Math.round(v/maxM*180)}px"></span><div class=ptip>→ ${MA[k]}</div></div>`).join('') : '<div class=ptip>아직 기록된 실수가 없어요.</div>';
  const t = d.times.filter(x=>x.ok);
  const avg = a => a.length ? Math.round(a.reduce((x,y)=>x+y.sec,0)/a.length) : null;
  const first = avg(t.slice(0,5)), last = avg(t.slice(-5));
  const timeHtml = t.length ? `<div>첫 5문제 평균 <b>${first}초</b> → 최근 5문제 평균 <b>${last}초</b> ${last<first?'🚀':''}</div><div class=ptip style="margin-top:6px">${d.times.slice(-8).reverse().map(x=>`${x.q} · ${x.sec}초 ${x.ok?'✅':'🔁'}`).join('<br>')}</div>` : '<div class=ptip>훈련 섬에서 문제를 풀면 걸린 시간이 기록돼요.</div>';
  const EX = ES(), eh = EX.hist.filter(h=>String(h.key||'').startsWith('div:') === DV).slice(-6).reverse(), noteN = EX.note.filter(x=>(x.sea || 'mul') === Store.sea).length;
  const examHtml = (eh.length ? `<div class=ptip>${eh.map(h=>`${new Date(h.t).toLocaleDateString('ko-KR')} · ${h.title} — <b>${h.score}점</b> (${h.ok}/${h.n}, ${minsec(h.used)})`).join('<br>')}</div>` : '<div class=ptip>아직 본 시험이 없어요. 지도의 🗼 시험 등대에서 볼 수 있어요.</div>')
    + `<div class=ptip style="margin-top:4px">오답 노트에 남은 문제: <b>${noteN}개</b></div>`;
  const TIPS = DV ? PARENT_TIPS_DIV : PARENT_TIPS;
  const tips = SEAD().list.map(n=>`<div class=ptip><b>${ISL[n].icon} ${ISL[n].name}</b> — ${TIPS[n].join(' / ')}</div>`).join('');
  const p = mk('parent', null, null, `
    <button class="x" id="pX">✕</button>
    <h3>👨‍👩‍👧 부모님 화면 — ${NM()} ${DIV_OPEN ? `<span class=psea>${Object.entries(SEA_DEF).map(([k,D])=>`<button data-sea="${k}" class="${k===Store.sea?'on':''}">${D.name}</button>`).join('')}</span>` : ''}</h3>
    <table><tr><th>섬</th><th>진행</th><th>보물</th></tr>${rows}</table>
    <div class="cols">
      <div><h4>자주 한 실수 Top 3</h4>${misHtml}</div>
      <div><h4>${DV ? '연습문제 기록' : '훈련 섬 손풀이 시간'}</h4>${DV ? divSolveHtml() : timeHtml}</div>
    </div>
    <h4>🗼 시험 등대 기록</h4>${examHtml}
    <h4>섬별 "이렇게 물어봐 주세요"</h4>${tips}
    <div class="pbtns">
      <button id="pUnlock">${d.unlockAll ? '🔓 섬 순서대로 열기로 되돌리기' : '🔓 모든 섬 바로 열기'} (두 바다)</button>
      <button id="pName">✏️ 이름 바꾸기</button>
      <button id="pPin">🔑 비밀번호 바꾸기</button>
      <button id="pReset">🗑 학습 기록 초기화 (두 바다 모두)</button>
    </div>
    <div class=ptip style="margin-top:10px">기록은 이 아이패드의 이 브라우저 안에만 저장돼요. 다른 기기와는 공유되지 않아요.<br>
      부모님 비밀번호를 잊었을 때는 주소 끝에 <b>?pin=reset</b> 을 붙여 열면 다시 정할 수 있어요.</div>`, null, ovEl);
  $('pPin').onclick = ()=>askPin(openParent, {change:true});
  p.querySelectorAll('.psea button').forEach(b=>b.onclick = ()=>{ setSea(b.dataset.sea); openParent(); });
  $('pX').onclick = ()=>{ ovEl.innerHTML = ''; openMap(); };
  $('pUnlock').onclick = ()=>{ d.unlockAll = !d.unlockAll; Store.save(); openParent(); };
  $('pName').onclick = ()=>{ const v = prompt('부르는 이름을 적어 주세요', NM()); if (v && v.trim()){ d.name = v.trim(); Store.save(); openParent(); } };
  $('pReset').onclick = ()=>{ if (confirm('곱셈 바다와 나눗셈 바다의 학습 기록을 모두 지울까요? (이름은 그대로 남아요)')){ Store.reset(); openParent(); } };
}

/* ---------- 시작 ---------- */
$('bMap').onclick = ()=>openMap();
function startMsg(){
  $('startTitle').textContent = `${NM()}이의 ${DIV_OPEN ? '수학 바다 탐험' : '곱셈 섬 탐험'}`;
  document.title = $('startTitle').textContent;
  if (DIV_OPEN) $('startSub').textContent = '곱셈 바다와 나눗셈 바다의 섬을 하나씩 탐험하며 3학년 계산을 정복해요';
  const cur = currentIsland(), started = SEAD().list.some(n=>Store.isl(n).lesson);
  $('startMsg').innerHTML = `<b>${NM()}</b> 대장님, ${started ? `오늘은 <b>${SEAD().name} ${dayOf(cur)}일차 ${ISL[cur].name}</b>을 탐험해요!` : `하루에 섬 하나씩, ${SEAD().list.length}일 동안 탐험해요!`}<br>
    <span style="font-size:17px">부모님 Tip · 원리 장면에서는 상단 💬 버튼의 질문으로 대화해 주세요. 학습 기록은 지도 화면의 🔒 부모님 버튼에서 비밀번호로 열어요.</span>`;
}
startMsg();
$('rename').onclick = ()=>{ const v = prompt('부르는 이름을 적어 주세요', NM()); if (v && v.trim()){ Store.d.name = v.trim(); Store.save(); startMsg(); } };
$('go').onclick = ()=>{ unlockAudio(); SFX.ding(); $('start').style.display = 'none'; openMap(); };
