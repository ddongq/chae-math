/* =========================================================
   divmath.js — 나눗셈 세로식 모델 · 쓰는 자리 · 실수 진단 · 문제 만들기
   (몇십)÷(몇) ~ (세 자리 수)÷(한 자리 수), 나머지 포함
   ========================================================= */

/* 나눗셈 한 자리씩: 앞자리부터 '지금 수(cur)'를 나누는 수로 나눈다.
   맨 앞자리가 나누는 수보다 작으면 다음 자리와 합쳐서 시작(몫이 한 자리 줄어든다). */
function divModel(a, d){
  const ds = String(a).split('').map(Number), n = ds.length, steps = [];
  let rem = 0, started = false;
  for (let i=0;i<n;i++){
    const cur = rem*10 + ds[i];
    if (!started && cur < d && i < n-1){ rem = cur; continue; }
    const q = Math.floor(cur/d), prod = q*d, r = cur - prod;
    steps.push({i, cur, q, prod, rem:r, first:!started});
    started = true; rem = r;
  }
  return {a, d, ds, n, steps, q:Math.floor(a/d), r:a%d, startCol:steps[0].i};
}

/* 세로식에 쓰는 자리: 칸 = {row, col, txt, role}  (col 0..n-1 = 나누어지는 수의 자리, 왼쪽부터)
   row 0 = 몫, row 1 = 나누어지는 수, row 2부터 = (곱, 뺀 수) 반복. 몫 가운데 0이면 곱 줄을 쓰지 않고 바로 내려 쓴다. */
function divLayout(a, d){
  const M = divModel(a, d), cells = [], lines = [];
  const put = (row, endCol, val, role, step) => { const s = String(val); for (let k=0;k<s.length;k++) cells.push({row, col:endCol - (s.length-1-k), txt:s[k], role, step}); };
  M.steps.forEach((s,k)=>cells.push({row:0, col:s.i, txt:String(s.q), role:'q', step:k}));
  M.ds.forEach((v,i)=>cells.push({row:1, col:i, txt:String(v), role:'a'}));
  let row = 2;
  M.steps.forEach((s,k)=>{
    const last = k === M.steps.length-1, next = M.steps[k+1];
    if (s.q === 0 && !s.first){
      // 몫이 0: 곱 줄 없이, 지금 줄에 다음 자리를 내려 붙인다 (마지막이면 지금 줄이 나머지)
      if (!last) cells.push({row:row-1, col:next.i, txt:String(M.ds[next.i]), role:'down', step:k+1});
      return;
    }
    put(row, s.i, s.prod, 'prod', k);
    const w = String(s.prod).length; lines.push({row, c0:s.i-w+1, c1:s.i}); row++;
    if (last){ put(row, s.i, s.rem, 'rem', k); row++; return; }
    if (s.rem) put(row, s.i, s.rem, 'sub', k);
    cells.push({row, col:next.i, txt:String(M.ds[next.i]), role:'down', step:k+1});
    row++;
  });
  // 한 줄 맨 앞의 0은 쓰지 않는다 (609÷3 → '09'가 아니라 '9', 703÷7의 나머지 '03' → '3')
  for (let r=2;r<row;r++){
    const rc = cells.filter(c=>c.row===r).sort((x,y)=>x.col-y.col);
    while (rc.length > 1 && rc[0].txt === '0'){ cells.splice(cells.indexOf(rc.shift()), 1); }
  }
  return {M, cells, lines, rows:row};
}

/* ---------- 실수 진단 ---------- */
const DIV_MISTAKE_NAME = {rem:'나머지가 나누는 수보다 큼', zero:'몫 가운데 0 빠뜨림', sub:'빼기 실수', fact:'곱셈구구 실수', down:'내려쓰기 빠뜨림', other:'기타 계산 실수'};
// q, r: 아이가 쓴 몫·나머지 (나머지를 묻지 않으면 r = null)
function divDiagnose(a, d, q, r){
  const Q = Math.floor(a/d), R = a%d, rr = r === null || r === undefined ? R : r;
  if (q === Q && rr === R) return 'ok';
  if (q*d + rr === a && rr >= d) return 'rem';                        // 한 번 더 나눌 수 있었음
  const qs = String(Q), noZero = Number(qs.replace(/0/g, ''));
  if (qs.slice(1, -1).includes('0') && q === noZero) return 'zero';     // 몫 '가운데' 0만 (끝자리 0을 빠뜨린 건 아래 '내려쓰기'로)
  if (q === Q) return 'sub';                                            // 몫은 맞고 나머지만 틀림
  if (String(q).length < qs.length && Q.toString().startsWith(String(q))) return 'down';
  const a1 = String(q).padStart(qs.length, '0');
  if (a1.length === qs.length){ let diff = 0, one = true;
    for (let k=0;k<qs.length;k++){ const x = Math.abs(+a1[k] - +qs[k]); if (x){ diff++; if (x !== 1) one = false; } }
    if (diff === 1 && one) return 'fact'; }
  return 'other';
}
function divMistakeMsg(type, a, d){
  return {
    rem:  `남은 수가 <b>${d}</b>보다 크거나 같으면 <b>한 번 더</b> 나눌 수 있어! 나머지는 늘 나누는 수 <b>${d}</b>보다 작아야 해.`,
    zero: `몫 가운데 자리를 다시 볼까? 나눌 수 없는 자리에는 몫에 <b>0</b>을 써야 자리가 맞아.`,
    sub:  `몫은 맞았어! 마지막에 <b>빼기</b>를 다시 해 볼까? 나머지가 달라.`,
    fact: `<b>${d}단</b> 곱셈구구를 천천히 떠올려 봐! 몫 한 자리가 1만큼 달라.`,
    down: `다음 자리 숫자를 <b>내려 쓰고</b> 한 번 더 나눠야 해. 몫의 자리 수가 모자라!`,
    other:`아깝다! 어디서 실수했는지 <b>실수 찾기</b>로 같이 찾아보자.`,
  }[type] || '';
}
const divSloppy = (q, Q) => q === 0 || Math.abs(String(q).length - String(Q).length) >= 2;

/* ---------- 문제 만들기 ---------- */
const DP = (a, d) => ({a, d, text:`${a} ÷ ${d}`});
const DIV_GEN = {
  // 0 복습: 곱셈구구 안의 나눗셈
  0: () => { const d = rnd(2,9), q = rnd(2,9); return DP(d*q, d); },
  // 1 (몇십)÷(몇): 나누어떨어짐 (내림 있음·없음)
  1: () => genUntil(()=>DP(rnd(2,9)*10, rnd(2,9)), p=>p.a % p.d === 0 && p.a/p.d >= 10),
  // 2 (몇십몇)÷(몇): 나누어떨어짐
  2: () => genUntil(()=>DP(rnd(11,99), rnd(2,9)), p=>p.a%10 && p.a % p.d === 0 && Math.floor(p.a/10) >= p.d),
  // 3 나머지가 있는 (몇십몇)÷(몇)
  3: () => genUntil(()=>DP(rnd(11,99), rnd(2,9)), p=>p.a % p.d !== 0 && Math.floor(p.a/10) >= p.d),
  4: () => DIV_GEN[3](),
  // 5 (세 자리)÷(한 자리): 나누어떨어짐
  5: () => genUntil(()=>DP(rnd(100,999), rnd(2,9)), p=>p.a % p.d === 0),
  // 6 나머지가 있는 (세 자리)÷(한 자리)
  6: () => genUntil(()=>DP(rnd(100,999), rnd(2,9)), p=>p.a % p.d !== 0),
};
const DIV_SETS = {
  guided: { 1:[DP(60,3), DP(70,5)], 2:[DP(48,4), DP(72,4)], 3:[DP(37,3), DP(53,4)], 5:[DP(369,3), DP(256,4)], 6:[DP(487,4), DP(415,4)] },
  practice: {
    0: [DP(12,3), DP(20,4), DP(24,6), DP(35,7), DP(54,9)],
    1: [DP(80,4), DP(60,5), DP(90,5), DP(70,2), DP(80,5)],
    2: [DP(63,3), DP(84,2), DP(56,4), DP(78,3), DP(96,6)],
    3: [DP(29,2), DP(47,3), DP(58,4), DP(83,6), DP(95,7)],
    4: [DP(38,3), DP(61,4), DP(77,5), DP(89,6), DP(94,8)],
    5: [DP(486,2), DP(735,5), DP(312,4), DP(612,3), DP(824,8)],
    6: [DP(259,2), DP(503,4), DP(746,6), DP(381,5), DP(629,7)],
  },
};
const hasRem = isl => isl === 3 || isl === 4 || isl === 6;
