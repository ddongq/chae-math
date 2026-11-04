/* =========================================================
   math.js — 곱셈 세로셈 모델 · 오답 진단 · 문제 만들기
   자리 번호: 0=일, 1=십, 2=백, 3=천
   ========================================================= */
const digitsOf = n => String(n).split('').map(Number);

// a × m 한 줄 (m은 한 자리 수). shift=1 이면 ×(m0) 줄
function rowModel(a, m, shift){
  const ao = a%10, at = Math.floor(a/10);
  const p = ao*m, c = at ? Math.floor(p/10) : 0;
  const q = at ? at*m + c : 0;
  return {m, shift, ao, at, p, c, q, val: a*m*(shift?10:1)};
}
// x + y 를 자리마다
function addModel(x, y){
  const cols = []; let cin = 0;
  for (let col=0; col<5; col++){
    const p = Math.pow(10, col);
    if (x < p && y < p && !cin) break;
    const dx = Math.floor(x/p)%10, dy = Math.floor(y/p)%10, s = dx+dy+cin;
    cols.push({col, dx, dy, cin, s, write:s%10, cout:Math.floor(s/10), hasX: x>=p, hasY: y>=p});
    cin = Math.floor(s/10);
  }
  return {cols, val:x+y};
}
function mulModel(a, b){
  const bo = b%10, bt = Math.floor(b/10), rows = [];
  if (bo) rows.push(rowModel(a, bo, 0));
  if (bt) rows.push(rowModel(a, bt, 1));
  const sum = rows.length===2 ? addModel(rows[0].val, rows[1].val) : null;
  return {a, b, bo, bt, rows, sum, ans:a*b};
}
function carryInfo(a, b){
  const M = mulModel(a, b);
  const rc = M.rows.map(r=>r.c>0);
  const ac = M.sum ? M.sum.cols.some(c=>c.cout>0) : false;
  return {rc, ac, nrc: rc.filter(Boolean).length, q10: M.rows.some(r=>r.q>=10)};
}

/* ---------- 오답 진단 ---------- */
const noCarryRow = (a, m) => Math.floor(a/10)*m*10 + (a%10*m)%10;
function addNoCarry(x, y){ let r=0, p=1; while (x||y){ r += ((x%10 + y%10)%10)*p; x=Math.floor(x/10); y=Math.floor(y/10); p*=10; } return r; }
function diagnose(a, b, ans){
  const M = mulModel(a, b);
  if (ans === M.ans) return 'ok';
  const {bo, bt} = M;
  if (a%10===0 && b%10===0){
    const base = (a/10)*(b/10);
    if ([base, base*10, base*1000, base*10000].includes(ans)) return 'zero';
  }
  if (b===10 && [a, a*100].includes(ans)) return 'zero';
  if (bo && bt){
    if (ans === a*bo + a*bt) return 'shift';
    const r1 = a*bo, r2 = a*bt*10, n1 = noCarryRow(a,bo), n2 = noCarryRow(a,bt)*10;
    if ([n1+r2, r1+n2, n1+n2, addNoCarry(n1,n2), addNoCarry(n1,r2), addNoCarry(r1,n2)].includes(ans)) return 'carry';
    if (ans === addNoCarry(r1, r2)) return 'add';
  } else if (bt){
    if (ans === a*bt || ans === a*bt*100) return 'zero';
    if (ans === noCarryRow(a,bt)*10 || ans === noCarryRow(a,bt)) return 'carry';
  } else {
    if (ans === noCarryRow(a,bo)) return 'carry';
  }
  return 'other';
}
const MISTAKE_NAME = {shift:'두 번째 줄 자리 안 맞춤', carry:'곱셈 받아올림 빠뜨림', add:'덧셈 받아올림 빠뜨림', fact:'곱셈구구 실수', zero:'0의 개수 실수', other:'기타 계산 실수'};
function mistakeMsg(type, a, b){
  const bt = Math.floor(b/10);
  return {
    shift: `혹시 두 번째 줄을 <b>한 칸 왼쪽</b>으로 안 밀었니? 십의 자리 ${bt}${J(bt,'을','를')} 곱하는 건 사실 <b>× ${bt}0</b>이라서 일의 자리에 <b>0</b>이 와야 해!`,
    carry: `<b class=r>받아올림</b>을 빠뜨린 것 같아! 받아올린 숫자는 빨간색으로 작게 써 두고, 다음 자리 곱에 꼭 <b>더해</b> 줘.`,
    add:   `곱셈은 잘했는데, 두 줄을 <b>더할 때</b> 10이 넘으면 <b class=r>받아올림</b>을 해야 해. 다시 더해 볼까?`,
    zero:  `<b>0의 개수</b>를 다시 세어 볼까? 몇십을 곱하면 끝에 0이 붙어!`,
    other: `아깝다! 어디서 실수했는지 <b>실수 찾기</b>로 같이 찾아보자.`,
  }[type] || '';
}

/* ---------- 문제 만들기 ---------- */
const P = (a, b, text) => ({a, b, text: text || `${a} × ${b}`});
const notTen = n => n%10 !== 0;
function genUntil(make, ok, tries=400){ for (let i=0;i<tries;i++){ const p = make(); if (ok(p)) return p; } return make(); }

const GEN = {
  1: () => Math.random() < .35 ? P(rnd(11,99), 10) : P(rnd(2,9)*10, rnd(2,9)*10),
  2: () => Math.random() < .7
      ? genUntil(()=>P(rnd(12,98), rnd(2,9)*10), p=>notTen(p.a))
      : (()=>{ const a = genUntil(()=>rnd(12,49), notTen), m = rnd(3,9); return P(a, m, `${m} × ${a}`); })(),
  3: () => genUntil(()=>P(rnd(11,43), rnd(11,34)), p=>{ if(!notTen(p.a)||!notTen(p.b)) return false; const c = carryInfo(p.a,p.b); return c.nrc===0 && !c.ac && !c.q10; }),
  4: (lv) => genUntil(()=>P(rnd(12,98), rnd(12,98)), p=>{
      if (!notTen(p.a)||!notTen(p.b)) return false;
      const c = carryInfo(p.a, p.b);
      if (lv===1) return c.nrc===1 && !c.ac;
      if (lv===2) return c.nrc===2 && !c.ac;
      return c.ac && c.nrc>=1;
    }),
  5: () => GEN[4](Math.random()<.5 ? 2 : 3),
};
function levelOf(p){
  if (p.a%10===0 || p.b%10===0 || p.b<10) return 0;
  const c = carryInfo(p.a, p.b);
  if (c.ac) return 3; if (c.nrc===2) return 2; if (c.nrc===1) return 1; return 0;
}

// 섬별 고정 문제
const SETS = {
  guided: {
    1: [P(30,40), P(50,60)],
    2: [P(34,20), P(26,30)],
    3: [P(13,12), P(23,12)],
    4: [P(26,35), P(48,27)],
  },
  practice: {
    1: [P(23,10), P(40,30), P(60,70), P(80,50), P(56,10)],
    2: [P(32,30), P(45,20), P(67,40), P(38,5,'5 × 38'), P(46,8,'8 × 46')],
    3: [P(11,14), P(21,13), P(32,12), P(41,12), P(12,24)],
    4: [P(18,21), P(36,24), P(47,36), P(64,38), P(79,46)],
    5: [P(28,34), P(57,26), P(46,38), P(65,47), P(89,23), P(74,59)],
  },
};
