/* =========================================================
   exam.js — 🗼 시험 등대 : 단원평가 · 소단원 평가 · 문제은행 · 오답 노트
   범위: 3-2 「1. 곱셈」 단원 전체 (소단원 ①~⑤)
   ========================================================= */

/* ---------- 시드 난수 (같은 회차는 늘 같은 문제) ---------- */
function RNG(seed){
  let s = 2166136261 >>> 0;
  for (const ch of String(seed)) s = Math.imul(s ^ ch.charCodeAt(0), 16777619) >>> 0;
  const f = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.int = (a, b) => a + Math.floor(f() * (b - a + 1));
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  f.shuffle = arr => { const a = [...arr]; for (let i = a.length-1; i > 0; i--){ const j = Math.floor(f()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  f.until = (make, ok) => { for (let i = 0; i < 800; i++){ const v = make(); if (ok(v)) return v; } return make(); };
  return f;
}

/* ---------- 소단원 · 유형 ---------- */
const UNITS = [null,
  {no:'①', name:'(세 자리 수)<br>× (한 자리 수)',         short:'세 자리 × 한 자리'},
  {no:'②', name:'(몇십) × (몇십),<br>(몇십몇) × (몇십)', short:'몇십 곱하기'},
  {no:'③', name:'(몇) × (몇십몇)',                     short:'몇 × 몇십몇'},
  {no:'④', name:'(몇십몇) × (몇십몇)',                  short:'몇십몇 × 몇십몇'},
  {no:'⑤', name:'곱셈 활용<br>(문장제 · 어림 · 비교)',     short:'곱셈 활용'},
];
const CATS = {calc:'계산', idea:'원리·빈칸', cmp:'비교·어림', word:'문장제', think:'추론'};
const UNIT_TIP = {
  1:'(세 자리 수) × (한 자리 수)는 <b>일 → 십 → 백</b> 순서로 곱하고, 받아올린 수를 다음 자리 곱에 꼭 더해요.',
  2:'몇십을 곱할 때는 <b>0을 떼고 곱한 다음 0을 붙여요</b>. 0의 개수를 세어 보세요. (섬 1 · 2)',
  3:'(몇) × (몇십몇)은 <b>몇십몇을 몇십과 몇으로 나눠</b> 곱하고 더해요. (섬 2)',
  4:'두 번째 줄은 <b>× 몇십</b>이라 0부터 써요. 받아올림은 빨간 숫자로 작게! (섬 3 · 4)',
  5:'문제를 끝까지 읽고 <b>몇씩 몇 묶음</b>인지 찾아 식을 세워요. 어림으로 답을 확인해요. (보물섬)',
};
const CAT_TIP = {
  calc: '계산할 때 공책 칸에 <b>자리를 맞춰</b> 쓰고, 다 풀면 어림으로 확인해요.',
  idea: '곱셈을 <b>나눠서 곱하는 원리</b>(36 × 24 = 36 × 4 + 36 × 20)를 다시 떠올려 봐요.',
  cmp:  '<b>어림</b>과 크기 비교는 몇십, 몇백으로 바꿔 생각하면 쉬워요.',
  word: '문장제는 <b>밑줄 긋기 → 식 세우기 → 계산 → 단위 붙이기</b> 순서로 풀어요.',
  think:'빈 숫자 찾기는 <b>일의 자리</b>부터, 숫자카드는 <b>큰 수를 십의 자리</b>에 놓는 것부터 생각해요.',
};

/* ---------- 문제 모양 도우미 ---------- */
const BOX = '<span class=qbox>□</span>';
const ask = h => `<div class=qh>${h}</div>`;
const big = h => `<div class=qbig>${h}</div>`;
const mid = h => `<div class=qmid>${h}</div>`;
const word = h => `<div class=qword>${h}</div>`;
const SYM = ['&gt;', '=', '&lt;'];
const NUMS = '①②③④';
const stripH = h => h.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const SOL = (a, b) => a < 10 ? {a:b, b:a} : {a, b};          // 공책 세로셈은 큰 수를 위에
// 세로셈 그림 (오른쪽 정렬 5칸). rows: {s} · {op, s} · {bar} · {box, n}
function vcalc(rows){
  return '<div class=vc>' + rows.map(r=>{
    if (r.bar) return '<div class=vbar></div>';
    if (r.box) return `<div class=vrow><span class=vbox style="width:${r.n*40-6}px">${r.box}</span></div>`;
    const s = String(r.s);
    return `<div class=vrow>${r.op ? `<i>${r.op}</i>` : ''}` + Array.from({length:5}, (_,i)=>`<span>${s[s.length-5+i] ?? ''}</span>`).join('') + '</div>';
  }).join('') + '</div>';
}
function mulExp(a, b){
  if (a >= 100 && b < 10){
    const parts = digitsOf(a).reverse().map((d,p)=>d*Math.pow(10,p)*b).reverse().filter(v=>v>0);
    return `${a} × ${b} = ${parts.join(' + ')} = <b>${a*b}</b>`;
  }
  if (a < 10 && b >= 10){ const bo = b%10, bt = b-bo; return bo ? `${a} × ${b} = ${a} × ${bt} + ${a} × ${bo}<br>= ${a*bt} + ${a*bo} = <b>${a*b}</b>` : `${a} × ${b} = <b>${a*b}</b>`; }
  if (a%10===0 && b%10===0) return `${a/10} × ${b/10} = ${a*b/100} → 0을 두 개 붙여 <b>${a*b}</b>`;
  if (b%10===0) return `${a} × ${b/10} = ${a*b/10} → 0을 하나 붙여 <b>${a*b}</b>`;
  const bo = b%10, bt = b-bo;
  return `${a} × ${b} = ${a} × ${bo} + ${a} × ${bt}<br>= ${a*bo} + ${a*bt} = <b>${a*b}</b>`;
}
const qq = o => Object.assign({kind:'num', unit:'', exp:'', brief: stripH(o.html||'').slice(0, 36)}, o);

/* ---------- 수 만들기 ---------- */
// (세 자리)×(한 자리)  k: 0 올림 없음 · 1 일→십 올림 · 2 십→백 올림 · 3 여러 번 올림 · 4 백의 자리 올림
function g31(r, k){
  return r.until(()=>({a: r.int(1,9)*100 + r.int(k===0?0:1, 9)*10 + r.int(1,9), m: r.int(2,9)}), ({a, m})=>{
    const [h, t, o] = digitsOf(a), c1 = Math.floor(o*m/10), c2 = Math.floor((t*m + c1)/10), top = h*m + c2;
    if (k===0) return !c1 && !c2 && top < 10;
    if (k===1) return c1 > 0 && !c2 && top < 10;
    if (k===2) return !c1 && c2 > 0 && top < 10;
    if (k===4) return !c1 && !c2 && top >= 10;
    return c1 > 0 && c2 > 0;
  });
}
// (몇십몇)×(몇십몇)  lv: 0 올림 없음 · 1 곱 올림 1번 · 2 곱 올림 2번 · 3 덧셈 올림까지
function g22(r, lv){
  return r.until(()=>({a:r.int(12,98), b:r.int(12,98)}), ({a, b})=>{
    if (a%10===0 || b%10===0) return false;
    const c = carryInfo(a, b);
    if (lv===0) return c.nrc===0 && !c.ac && !c.q10;
    if (lv===1) return c.nrc===1 && !c.ac;
    if (lv===2) return c.nrc===2 && !c.ac;
    return c.ac && c.nrc >= 1;
  });
}
const g2 = (r, lo=12, hi=98) => r.until(()=>r.int(lo, hi), n=>n%10!==0);

/* ---------- 문장제 틀 ---------- */
const W31 = [
  {f:(a,m)=>`색종이가 한 묶음에 <b>${a}장</b>씩 <b>${m}묶음</b> 있어요.<br>색종이는 모두 몇 장일까요?`, unit:'장'},
  {f:(a,m)=>`한 상자에 구슬이 <b>${a}개</b>씩 들어 있어요.<br><b>${m}상자</b>에 들어 있는 구슬은 모두 몇 개일까요?`, unit:'개'},
  {f:(a,m)=>`하루에 <b>${a}걸음</b>씩 <b>${m}일</b> 동안 걸었어요.<br>모두 몇 걸음을 걸었을까요?`, unit:'걸음'},
  {f:(a,m)=>`한 권이 <b>${a}쪽</b>인 책이 <b>${m}권</b> 있어요.<br>책은 모두 몇 쪽일까요?`, unit:'쪽'},
];
const W22 = [
  {f:(a,b)=>`한 상자에 귤이 <b>${a}개</b>씩 들어 있어요.<br><b>${b}상자</b>에 들어 있는 귤은 모두 몇 개일까요?`, unit:'개'},
  {f:(a,b)=>`한 봉지에 사탕이 <b>${a}개</b>씩 들어 있어요.<br><b>${b}봉지</b>에 들어 있는 사탕은 모두 몇 개일까요?`, unit:'개'},
  {f:(a,b)=>`줄넘기를 하루에 <b>${a}번</b>씩 <b>${b}일</b> 동안 했어요.<br>줄넘기를 모두 몇 번 했을까요?`, unit:'번', bmax:31},
  {f:(a,b)=>`버스 한 대에 <b>${a}명</b>씩 탈 수 있어요.<br>버스 <b>${b}대</b>에는 모두 몇 명이 탈 수 있을까요?`, unit:'명', amax:45, bmax:40},
  {f:(a,b)=>`한 권이 <b>${a}쪽</b>인 공책이 <b>${b}권</b> 있어요.<br>공책은 모두 몇 쪽일까요?`, unit:'쪽', amin:10},
];
function wordQ(u, r, a, b, list){
  const t = r.pick(list.filter(t=>a <= (t.amax||999) && b <= (t.bmax||99) && a >= (t.amin||0)));
  return qq({u, cat:'word', html: word(t.f(a, b)), ans:a*b, unit:t.unit, sol: a >= 100 ? {a, b} : SOL(a, b),
    brief:`문장제 · ${a} × ${b}`, exp:`식: ${a} × ${b} = ${a*b}<br>답: <b>${a*b}${t.unit}</b>`});
}
function cmpQ(u, L, R){
  const lv = L[0]*L[1], rv = R[0]*R[1], ans = lv > rv ? 0 : (lv === rv ? 1 : 2);
  return qq({u, cat:'cmp', kind:'cmp', ans,
    html: ask('두 곱의 크기를 비교해 ○ 안에 &gt;, =, &lt; 중 알맞은 것을 골라 보세요.') + big(`${L[0]} × ${L[1]} <span class=qcirc></span> ${R[0]} × ${R[1]}`),
    brief:`${L[0]} × ${L[1]} ○ ${R[0]} × ${R[1]}`, exp:`${L[0]} × ${L[1]} = ${lv}<br>${R[0]} × ${R[1]} = ${rv} → <b>${SYM[ans]}</b>`});
}
function bigQ(u, r, makePair, small){
  const set = [], vals = new Set();
  for (let g = 0; set.length < 4 && g < 200; g++){ const p = makePair(); const v = p[0]*p[1]; if (vals.has(v)) continue; vals.add(v); set.push(p); }
  const vs = set.map(p=>p[0]*p[1]), target = small ? Math.min(...vs) : Math.max(...vs), ans = vs.indexOf(target);
  return qq({u, cat:'cmp', kind:'choice', ans, ch: set.map(p=>`${p[0]} × ${p[1]}`),
    html: ask(`계산 결과가 가장 <b>${small ? '작은' : '큰'}</b> 것을 골라 보세요.`) + `<div class=qlist>${set.map((p,k)=>`<span>${NUMS[k]} ${p[0]} × ${p[1]}</span>`).join('')}</div>`,
    brief:`가장 ${small ? '작은' : '큰'} 곱 고르기`, exp: set.map((p,k)=>`${NUMS[k]} ${p[0]} × ${p[1]} = ${vs[k]}`).join('<br>')});
}
function missQ(u, a, b, r, slots){
  const A = String(a).split(''), B = String(b).split(''), w = r.pick(slots);
  const arr = w[0]==='a' ? A : B, idx = arr.length - 1 - Number(w[1]), ans = Number(arr[idx]);
  arr[idx] = BOX;
  const ones = w[1]==='0';
  return qq({u, cat:'think', html: ask('□ 안에 알맞은 숫자를 써넣으세요.') + big(`${A.join('')} × ${B.join('')} = ${a*b}`), ans,
    brief:`${String(a)} × ${String(b)}의 빈 숫자`, exp:`${a} × ${b} = ${a*b} 이므로 □ = <b>${ans}</b>` + (ones ? '<br><span class=ps>일의 자리끼리 곱한 값의 일의 자리부터 맞춰 봐요.</span>' : '<br><span class=ps>어림으로 범위를 좁혀 봐요.</span>')});
}

/* ---------- 문제 공장 ---------- */
const F = {
  // ① (세 자리 수) × (한 자리 수)
  u1calc: (r, k=0) => { const {a, m} = g31(r, k); return qq({u:1, cat:'calc', html: ask('계산해 보세요.') + big(`${a} × ${m}`), ans:a*m, sol:{a, b:m}, brief:`${a} × ${m}`, exp:mulExp(a, m)}); },
  u1vert: (r) => { const {a, m} = g31(r, 3); return qq({u:1, cat:'calc', html: ask('계산해 보세요.') + vcalc([{s:a}, {op:'×', s:m}, {bar:1}]), ans:a*m, sol:{a, b:m}, brief:`${a} × ${m} (세로셈)`, exp:mulExp(a, m)}); },
  u1decomp: (r) => {
    const {a, m} = g31(r, 3), [h, t, o] = digitsOf(a), parts = [h*100*m, t*10*m, o*m], hide = r.int(0, 2);
    return qq({u:1, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + mid(`${a} × ${m}<br>= ${h*100} × ${m} + ${t*10} × ${m} + ${o} × ${m}<br>= ${parts.map((v,i)=>i===hide ? BOX : v).join(' + ')}`),
      ans:parts[hide], brief:`${a} × ${m} 나누어 곱하기`, exp:`${[h*100, t*10, o][hide]} × ${m} = <b>${parts[hide]}</b>`});
  },
  u1cmp: (r) => {
    if (r() < .25){ const m = r.pick([4,6,8]), a = r.int(101, 499); const L = [a, m], R = [a*2, m/2]; return r() < .5 ? cmpQ(1, L, R) : cmpQ(1, R, L); }
    const p = g31(r, r.int(0,3)), q = g31(r, r.int(0,3)); return cmpQ(1, [p.a, p.m], [q.a, q.m]);
  },
  u1missing: (r) => { const {a, m} = g31(r, 3); return missQ(1, a, m, r, ['a1','a2']); },
  u1word: (r) => { const {a, m} = g31(r, r.pick([1,2,3])); return wordQ(1, r, a, m, W31); },

  // ② (몇십) × (몇십), (몇십몇) × (몇십)
  u2tt: (r, z) => { const [x, y] = r.until(()=>[r.int(2,9), r.int(2,9)], ([x,y])=>!z || (x*y)%10===0); const a = x*10, b = y*10;
    return qq({u:2, cat:'calc', html: ask('계산해 보세요.') + big(`${a} × ${b}`), ans:a*b, sol:{a, b}, brief:`${a} × ${b}`, exp:mulExp(a, b)}); },
  u2xt: (r) => { const a = g2(r), b = r.int(2,9)*10; return qq({u:2, cat:'calc', html: ask('계산해 보세요.') + big(`${a} × ${b}`), ans:a*b, sol:{a, b}, brief:`${a} × ${b}`, exp:mulExp(a, b)}); },
  u2blank: (r, k=0) => {
    if (k===0){ const x = r.int(2,9), y = r.int(2,9);
      return qq({u:2, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + big(`${x*10} × ${y*10} = ${x} × ${y} × ${BOX}`), ans:100, brief:`${x*10} × ${y*10} = ${x} × ${y} × □`,
        exp:`${x*10} = ${x} × 10, ${y*10} = ${y} × 10 이니까<br>10 × 10 = <b>100</b>을 곱해요.`}); }
    const a = g2(r), y = r.int(2,9);
    return qq({u:2, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + big(`${a} × ${y*10} = ${a} × ${y} × ${BOX}`), ans:10, brief:`${a} × ${y*10} = ${a} × ${y} × □`,
      exp:`${y*10} = ${y} × 10 이니까 <b>10</b>을 곱해요.`});
  },
  u2missing: (r) => {
    if (r() < .5){ const a = g2(r), y = r.int(2,9); return qq({u:2, cat:'think', html: ask('□ 안에 알맞은 수를 써넣으세요.') + big(`${a} × ${BOX}0 = ${a*y*10}`), ans:y, brief:`${a} × □0 = ${a*y*10}`, exp:`${a} × ${y*10} = ${a*y*10} 이므로 □ = <b>${y}</b>`}); }
    const x = r.int(2,9), y = r.int(2,9);
    return qq({u:2, cat:'think', html: ask('□ 안에 알맞은 수를 써넣으세요.') + big(`${BOX}0 × ${y*10} = ${x*y*100}`), ans:x, brief:`□0 × ${y*10} = ${x*y*100}`, exp:`${x*10} × ${y*10} = ${x*y*100} 이므로 □ = <b>${x}</b>`});
  },
  u2cmp: (r) => {
    if (r() < .25){ const p = r.until(()=>[r.int(2,9), r.int(2,9), r.int(2,9), r.int(2,9)], ([a,b,c,d])=>a*b===c*d && a!==c && a!==d); return cmpQ(2, [p[0]*10, p[1]*10], [p[2]*10, p[3]*10]); }
    const one = () => r() < .5 ? [r.int(2,9)*10, r.int(2,9)*10] : [g2(r), r.int(2,9)*10];
    return cmpQ(2, one(), one());
  },
  u2word: (r) => { const a = r() < .3 ? r.int(2,9)*10 : g2(r, 12, 60), b = r.int(2,9)*10; return wordQ(2, r, a, b, W22); },

  // ③ (몇) × (몇십몇)
  u3calc: (r) => { const m = r.int(3,9), a = r.until(()=>g2(r), a=>m*(a%10) >= 10); return qq({u:3, cat:'calc', html: ask('계산해 보세요.') + big(`${m} × ${a}`), ans:m*a, sol:SOL(m, a), brief:`${m} × ${a}`, exp:mulExp(m, a)}); },
  u3split: (r) => {
    const m = r.int(3,9), a = g2(r), at = a - a%10, ao = a%10, hide = r.int(0,1), parts = [m*at, m*ao];
    return qq({u:3, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + mid(`${m} × ${a} = ${m} × ${at} + ${m} × ${ao}<br>= ${parts.map((v,i)=>i===hide ? BOX : v).join(' + ')}`),
      ans:parts[hide], brief:`${m} × ${a} 나누어 곱하기`, exp:`${m} × ${[at, ao][hide]} = <b>${parts[hide]}</b>`});
  },
  u3cmp: (r) => { const one = () => [r.int(3,9), g2(r)]; return cmpQ(3, one(), one()); },
  u3big: (r) => bigQ(3, r, ()=>[r.int(3,9), g2(r)], r() < .4),
  u3word: (r) => { const m = r.int(3,9), a = g2(r, 12, 45); return wordQ(3, r, m, a, W22); },

  // ④ (몇십몇) × (몇십몇)
  u4calc: (r, lv=1) => { const {a, b} = g22(r, lv); return qq({u:4, cat:'calc', html: ask('계산해 보세요.') + big(`${a} × ${b}`), ans:a*b, sol:{a, b}, brief:`${a} × ${b}`, exp:mulExp(a, b)}); },
  u4vert: (r, lv=3) => { const {a, b} = g22(r, lv); return qq({u:4, cat:'calc', html: ask('계산해 보세요.') + vcalc([{s:a}, {op:'×', s:b}, {bar:1}]), ans:a*b, sol:{a, b}, brief:`${a} × ${b} (세로셈)`, exp:mulExp(a, b)}); },
  u4partial: (r) => {
    const {a, b} = g22(r, 2), bo = b%10, bt = b-bo, r1 = a*bo, r2 = a*bt, w = r.int(0,1);
    return qq({u:4, cat:'idea', html: ask('세로셈에서 ㉠에 알맞은 수를 써넣으세요.') + vcalc([{s:a}, {op:'×', s:b}, {bar:1}, w===0 ? {box:'㉠', n:String(r1).length} : {s:r1}, w===1 ? {box:'㉠', n:String(r2).length} : {s:r2}, {bar:1}, {s:a*b}]),
      ans: w ? r2 : r1, sol:{a, b}, brief:`${a} × ${b} 세로셈의 ㉠`, exp: w ? `㉠은 ${a} × ${bt} = <b>${r2}</b> (십의 자리 ${bt/10}${J(bt/10,'은','는')} 사실 ${bt})` : `㉠은 ${a} × ${bo} = <b>${r1}</b>`});
  },
  u4error: (r, kind) => {
    kind = kind || r.pick(['shift', 'carry']);
    const {a, b} = g22(r, kind==='carry' ? 2 : 1), bo = b%10, bt = b-bo;
    let w1 = a*bo, w2 = a*bt, why;
    if (kind==='shift'){ w2 = a*(bt/10); why = `두 번째 줄은 ${a} × ${bt} = ${a*bt}${J(a*bt,'이에요','예요')}. 한 칸 왼쪽(0부터)에 써야 해요.`; }
    else { w1 = noCarryRow(a, bo); why = `첫 번째 줄에서 받아올린 수를 더하지 않았어요. ${a} × ${bo} = ${a*bo}${J(a*bo,'이에요','예요')}.`; }
    return qq({u:4, cat:'think', html: ask('잘못 계산한 곳을 찾아, 바르게 계산한 값을 써 보세요.') + vcalc([{s:a}, {op:'×', s:b}, {bar:1}, {s:w1}, {s:w2}, {bar:1}, {s:w1+w2}]),
      ans:a*b, sol:{a, b}, brief:`${a} × ${b} 잘못된 곳 찾기`, exp:`${why}<br>${a*bo} + ${a*bt} = <b>${a*b}</b>`});
  },
  u4missing: (r) => { const {a, b} = g22(r, 2); return missQ(4, a, b, r, ['a0','a1','b0','b1']); },
  u4cmp: (r) => { const p = g22(r, r.int(1,3)), q = g22(r, r.int(1,3)); return cmpQ(4, [p.a, p.b], [q.a, q.b]); },
  u4word: (r) => { const {a, b} = r.until(()=>g22(r, r.int(1,3)), ({a, b})=>b <= 31); return wordQ(4, r, a, b, W22); },

  // ⑤ 곱셈 활용
  u5word: (r) => { const q = r.pick([F.u1word, F.u2word, F.u4word])(r); q.u = 5; return q; },
  u5word2: (r) => {
    const {a, b} = r.until(()=>({a:r.int(12,45), b:r.int(12,30)}), ({a, b})=>a%10 && b%10 && a*b < 1000);
    if (r() < .5){
      const c = r.int(2, 9)*10 + r.int(1, 9);
      return qq({u:5, cat:'word', html: word(`사탕이 한 봉지에 <b>${a}개</b>씩 <b>${b}봉지</b> 있었어요.<br>그중에서 <b>${c}개</b>를 친구들에게 나누어 주었어요.<br>남은 사탕은 몇 개일까요?`),
        ans:a*b-c, unit:'개', sol:{a, b}, brief:`문장제 · ${a} × ${b} − ${c}`, exp:`${a} × ${b} = ${a*b}<br>${a*b} − ${c} = <b>${a*b-c}개</b>`});
    }
    const c = r.int(3, a-1);
    return qq({u:5, cat:'word', html: word(`사과가 <b>${a}개</b>씩 든 상자가 <b>${b}상자</b> 있고,<br>상자에 넣지 못한 사과가 <b>${c}개</b> 있어요.<br>사과는 모두 몇 개일까요?`),
      ans:a*b+c, unit:'개', sol:{a, b}, brief:`문장제 · ${a} × ${b} + ${c}`, exp:`${a} × ${b} = ${a*b}<br>${a*b} + ${c} = <b>${a*b+c}개</b>`});
  },
  u5est: (r, k=0) => {
    let a, b, ra, rb, why;
    if (k===1){ const h = r.int(2,8); a = h*100 + r.pick([-1,1])*r.int(2,12); b = r.int(3,9); ra = h*100; rb = b; why = `${a}${J(a,'은','는')} 약 ${ra}이니까 ${ra} × ${b} = ${ra*rb}`; }
    else {
      const near = () => r.until(()=>r.int(12,94), n=>[1,2,3,7,8,9].includes(n%10));
      a = near(); b = near(); ra = Math.round(a/10)*10; rb = Math.round(b/10)*10;
      why = `${a}${J(a,'은','는')} 약 ${ra}, ${b}${J(b,'은','는')} 약 ${rb}<br>→ ${ra} × ${rb} = ${ra*rb}`;
    }
    const est = ra*rb, opts = r.shuffle([est/10, est, est*10]);
    return qq({u:5, cat:'cmp', kind:'choice', ch: opts.map(v=>`약 ${v}`), ans: opts.indexOf(est),
      html: ask(`<b>${a} × ${b}</b>${J(b,'을','를')} 어림하여 계산하면 약 얼마일까요?`), brief:`${a} × ${b} 어림하기`, exp:why});
  },
  u5big: (r) => bigQ(5, r, ()=>r.pick([
    ()=>[r.int(2,9)*10, r.int(2,9)*10], ()=>[g2(r), r.int(2,9)*10], ()=>[r.int(3,9), g2(r)], ()=>{ const p = g22(r, r.int(1,3)); return [p.a, p.b]; },
  ])(), r() < .35),
  u5cards: (r, max) => {
    max = (max === undefined || max === null) ? r() < .5 : !!max;
    const ds = r.shuffle([1,2,3,4,5,6,7,8,9]).slice(0, 4).sort((x,y)=>x-y), B = bestProduct(ds, max);
    return qq({u:5, cat:'think', html: ask(`숫자 카드 4장을 한 번씩 모두 써서 (두 자리 수) × (두 자리 수)를 만들려고 해요. 곱이 가장 <b>${max ? '큰' : '작은'}</b> 곱셈식의 곱은 얼마일까요?`) + `<div class=qcards>${ds.map(d=>`<span>${d}</span>`).join('')}</div>`,
      ans:B.best, sol:{a:B.arr[0], b:B.arr[1]}, brief:`숫자카드 ${ds.join(' ')} 가장 ${max ? '큰' : '작은'} 곱`,
      exp:`${max ? '큰' : '작은'} 수를 <b>십의 자리</b>에 놓아요.<br>${B.arr[0]} × ${B.arr[1]} = <b>${B.best}</b>`});
  },
  u5cmp: (r) => {
    const a = r.int(25,60), b = r.int(12,31);
    const [c, d] = r.until(()=>[r.int(25,60), r.int(12,31)], ([c,d])=>c*d !== a*b && Math.abs(c*d - a*b) < a*b*.2 && c !== a && d !== b);
    const ans = a*b > c*d ? 0 : 1, who = ['민지', '준호'];
    return qq({u:5, cat:'cmp', kind:'choice', ch:who, ans,
      html: word(`민지는 줄넘기를 하루에 <b>${a}번</b>씩 <b>${b}일</b> 동안 했고,<br>준호는 하루에 <b>${c}번</b>씩 <b>${d}일</b> 동안 했어요.<br>줄넘기를 더 많이 한 사람은 누구일까요?`),
      brief:`줄넘기 비교 ${a} × ${b} / ${c} × ${d}`, exp:`민지: ${a} × ${b} = ${a*b}번<br>준호: ${c} × ${d} = ${c*d}번 → <b>${who[ans]}</b>`});
  },
};
const factUnit = name => Number(name[1]);

/* ---------- 시험지 구성 ---------- */
const BP_UNIT = [
  ['u1calc',0], ['u1decomp'], ['u1calc',3], ['u2tt'], ['u2blank',0], ['u2xt'], ['u3calc'], ['u3split'],
  ['u4calc',1], ['u4calc',3], ['u4partial'], ['u4vert',3], ['u2cmp'], ['u1word'], ['u4word'],
  ['u5est',0], ['u5big'], ['u4error'], ['u4missing'], ['u5cards'],
];
const BP_SUB = {
  1: [['u1calc',0], ['u1calc',1], ['u1calc',2], ['u1calc',4], ['u1vert'], ['u1decomp'], ['u1cmp'], ['u1missing'], ['u1word'], ['u1calc',3]],
  2: [['u2tt'], ['u2tt',1], ['u2xt'], ['u2xt'], ['u2blank',0], ['u2blank',1], ['u2cmp'], ['u2missing'], ['u2word'], ['u2word']],
  3: [['u3calc'], ['u3calc'], ['u3calc'], ['u3split'], ['u3split'], ['u3cmp'], ['u3big'], ['u3word'], ['u3word'], ['u3calc']],
  4: [['u4calc',1], ['u4calc',2], ['u4calc',3], ['u4vert',3], ['u4partial'], ['u4error','shift'], ['u4error','carry'], ['u4missing'], ['u4cmp'], ['u4word']],
  5: [['u5word'], ['u5word'], ['u5word2'], ['u5est',0], ['u5est',1], ['u5big'], ['u5cards',1], ['u5cards',0], ['u5cmp'], ['u5word2']],
};
function buildExam(spec){
  const r = RNG(spec.seed);
  let bp, title, limit;
  if (spec.mode === 'unit'){ bp = BP_UNIT; title = `📝 단원평가 ${spec.k}회`; limit = 40*60; }
  else if (spec.mode === 'sub'){ bp = BP_SUB[spec.k]; title = `📑 소단원 평가 ${UNITS[spec.k].no}`; limit = 20*60; }
  else {
    bp = []; for (let i = 0; i < spec.n; i++) bp.push(r.pick(BP_SUB[spec.units[i % spec.units.length]]));
    bp.sort((x, y)=>factUnit(x[0]) - factUnit(y[0]));
    title = `🎲 문제은행 ${spec.n}문항`; limit = spec.n*2*60;
  }
  const qs = [], seen = new Set();
  for (const [name, arg] of bp){
    let q; for (let t = 0; t < 30; t++){ q = F[name](r, arg); if (!seen.has(q.html)) break; }
    seen.add(q.html); qs.push(q);
  }
  return {spec, title, qs, pt: 100/qs.length, limit};
}

/* ---------- 기록 ---------- */
const ES = () => Store.d.exam || (Store.d.exam = {best:{}, hist:[], note:[], cur:null});
const examKey = spec => spec.mode === 'bank' ? 'bank' : spec.mode + spec.k;
const isRight = (q, a) => a !== null && a !== undefined && a !== '' && (q.kind === 'num' ? Number(a) === q.ans : a === q.ans);
const ansText = (q, a) => (a === null || a === undefined || a === '') ? '<span class=gemp>안 풀었어요</span>'
  : q.kind === 'num' ? `${a}${q.unit ? `<small>${q.unit}</small>` : ''}` : q.kind === 'cmp' ? SYM[a] : `${NUMS[a]} ${q.ch[a]}`;
const mmss = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const minsec = s => s >= 60 ? `${Math.floor(s/60)}분 ${s%60}초` : `${s}초`;

/* ---------- 지도 위 등대 그림 ---------- */
const TOWER_SVG = `<svg viewBox="0 0 80 110" width="80" height="110" style="overflow:visible">
  <g class="beam"><polygon points="40,22 128,2 128,42" fill="rgba(255,240,160,.6)"/><polygon points="40,22 -48,2 -48,42" fill="rgba(255,240,160,.6)"/></g>
  <ellipse cx="40" cy="104" rx="38" ry="8" fill="#6F8796"/>
  <defs><clipPath id="twc"><polygon points="27,34 53,34 60,102 20,102"/></clipPath></defs>
  <polygon points="27,34 53,34 60,102 20,102" fill="#fff"/>
  <g clip-path="url(#twc)" fill="#E5484D"><rect x="0" y="46" width="80" height="12"/><rect x="0" y="70" width="80" height="12"/><rect x="0" y="94" width="80" height="10"/></g>
  <polygon points="27,34 53,34 60,102 20,102" fill="none" stroke="#6E3F12" stroke-width="3" stroke-linejoin="round"/>
  <rect x="22" y="30" width="36" height="6" rx="2" fill="#6E3F12"/>
  <rect x="29" y="16" width="22" height="15" rx="3" fill="#FFE27A" stroke="#6E3F12" stroke-width="3"/>
  <polygon points="25,17 40,4 55,17" fill="#E5484D" stroke="#6E3F12" stroke-width="3" stroke-linejoin="round"/>
  <rect x="35" y="82" width="10" height="14" rx="5" fill="#6E3F12"/>
</svg>`;

/* =========================================================
   등대 입구 — 단원평가 · 소단원 평가 · 문제은행 · 오답 노트
   ========================================================= */
let BANK = {units:[1,2,3,4,5], n:10};
function openTower(tab='unit'){
  resetScreen();
  const E = ES();
  $('bMap').style.display = '';
  $('title').innerHTML = `🗼 시험 등대<small>곱셈 단원</small>`;
  const tabs = $('tabs'); tabs.innerHTML = '';
  [['unit','📝 단원평가'], ['sub','📑 소단원 평가'], ['bank','🎲 문제은행'], ['note', `📒 오답 노트${E.note.length ? ` ${E.note.length}` : ''}`]]
    .forEach(([k, l])=>btn(k===tab ? 'on' : '', l, ()=>openTower(k), tabs));
  const pf = fullPanel();
  const resume = E.cur ? btn('pill y sm', '▶ 보던 시험 이어서', ()=>startExam(E.cur.spec, E.cur)) : null;
  const bestTxt = key => E.best[key] !== undefined ? `최고 <b>${E.best[key]}점</b>` : '아직 안 봤어요';

  if (tab === 'unit'){
    mk('hhead', null, null, '곱셈 단원 전체(① ~ ⑤) · <b>20문항 · 100점 · 40분</b><br>학교 단원평가처럼 끝까지 풀고 마지막에 제출해요', null, pf);
    const row = mk('hcards', null, null, '', null, pf);
    [1,2,3].forEach(k=>btn('hcard', `<div class=hk>${k}회</div><div class=hd>20문항 · 40분</div><div class=hb>${bestTxt('unit'+k)}</div><div class=hgo>시작 ▶</div>`,
      ()=>startExam({mode:'unit', k, seed:'unit-'+k}), row));
    say(E.cur ? '보던 시험이 있어! <b>이어서</b> 볼 수도 있어.' : '단원평가는 학교 시험처럼 <b>20문제</b>를 다 풀고 제출해. 셈이는 시험 중엔 힌트를 안 줘!');
  }
  if (tab === 'sub'){
    mk('hhead', null, null, '소단원마다 <b>10문항 · 100점 · 20분</b><br>약한 부분만 골라서 집중 연습해요', null, pf);
    const row = mk('hcards', null, null, '', null, pf);
    [1,2,3,4,5].forEach(u=>btn('hcard sm', `<div class=hk>${UNITS[u].no}</div><div class=hn>${UNITS[u].name}</div><div class=hb>${bestTxt('sub'+u)}</div><div class=hgo>시작 ▶</div>`,
      ()=>startExam({mode:'sub', k:u, seed:'sub-'+u}), row));
    say('소단원 평가는 <b>한 부분만</b> 10문제! 약한 곳을 골라 봐.');
  }
  if (tab === 'bank'){
    const box = mk('bankbox', null, null, '', null, pf);
    mk('blabel', null, null, '① 범위를 골라요 (여러 개 가능)', null, box);
    const ur = mk('brow', null, null, '', null, box);
    [1,2,3,4,5].forEach(u=>{ const c = btn('chip'+(BANK.units.includes(u) ? ' on' : ''), `${UNITS[u].no} ${UNITS[u].short}`, ()=>{
      const has = BANK.units.includes(u);
      if (has && BANK.units.length === 1){ say('범위는 <b>하나 이상</b> 골라야 해!'); return; }
      BANK.units = has ? BANK.units.filter(x=>x!==u) : [...BANK.units, u].sort();
      c.classList.toggle('on', !has);
    }, ur); });
    mk('blabel', null, null, '② 문항 수를 골라요', null, box);
    const nr = mk('brow', null, null, '', null, box);
    const nb = [5,10,20].map(n=>btn('chip'+(BANK.n===n ? ' on' : ''), `${n}문항 · ${n*2}분`, ()=>{ BANK.n = n; nb.forEach((b,i)=>b.classList.toggle('on', [5,10,20][i]===n)); }, nr));
    const go = btn('pill nudge', '🎲 새 시험지 만들기', ()=>startExam({mode:'bank', units:[...BANK.units], n:BANK.n, seed:'bank-'+Date.now()}), box);
    go.style.marginTop = '8px';
    say('문제은행은 누를 때마다 <b>새로운 문제</b>가 나와! 몇 번이든 풀 수 있어.');
  }
  if (tab === 'note'){
    if (!E.note.length){
      mk('hhead', null, null, '<span style="font-size:60px">🎉</span><br>오답 노트가 비어 있어요!<br>시험에서 틀린 문제가 여기에 모여요.', null, pf).style.top = '150px';
      say('틀린 문제가 하나도 없어! 시험을 보면 틀린 문제가 여기로 와.');
    } else {
      mk('hhead', null, null, `틀린 문제 <b>${E.note.length}개</b>가 모여 있어요 · 다시 풀어서 맞히면 노트에서 빠져요`, null, pf);
      const list = mk('notelist', null, null, '', null, pf);
      E.note.slice(0, 9).forEach(q=>mk('nitem', null, null, `<span class=nu>${UNITS[q.u].no}</span> ${q.brief}<small>${q.from || ''}</small>`, null, list));
      if (E.note.length > 9) mk('nmore', null, null, `… 외 ${E.note.length - 9}개`, null, pf);
      say(`오답 노트에 <b>${E.note.length}문제</b>! 한 번에 10문제씩 다시 풀 수 있어.`);
    }
  }
  setCtrls(resume, tab === 'note' && E.note.length ? btn('pill nudge', `🔁 다시 풀기 (${Math.min(10, E.note.length)}문제)`, ()=>safe(retryWrong)(E.note.slice(0, 10), 'note')) : null);
}

/* =========================================================
   시험 보기 — 실제 시험처럼 (번호 이동 · 연습 공간 · 제출 후 채점)
   ========================================================= */
class ExamPad {
  constructor(parent, o){
    this.o = o; this.v = o.val || ''; this.max = 5; this.locked = false;
    this.disp = mk('disp', null, null, '', null, parent);
    const keys = this.keys = mk('keys', null, null, '', null, parent);
    [1,2,3,4,5,6,7,8,9].forEach(n=>btn('', String(n), ()=>this.press(String(n)), keys));
    btn('del', '⌫', ()=>this.del(), keys); btn('', '0', ()=>this.press('0'), keys);
    this.okb = btn('ok next', o.ok || '다음 ▶', ()=>this.submit(), keys);
    this.render(); KEYPAD = this;
  }
  press(d){ if (this.locked || this.v.length >= this.max) return; if (this.v === '0') this.v = ''; this.v += d; this.changed(); }
  del(){ if (this.locked) return; this.v = this.v.slice(0, -1); this.changed(); }
  changed(){ this.disp.className = 'disp'; this.render(); this.o.onChange && this.o.onChange(this.v); }
  render(){ this.disp.innerHTML = (this.v ? this.v : `<span class=ph>${this.o.ph || '답을 써요'}</span>`) + (this.o.unit ? `<small class=du>${this.o.unit}</small>` : ''); }
  submit(){ if (this.locked) return; this.o.onNext && this.o.onNext(this.v); }
  mark(ok){ this.disp.classList.add(ok ? 'ok' : 'no'); if (!ok) shake(this.disp); }
}
// 답 쓰는 곳: 숫자(키패드) · 보기 고르기 · >, =, <
function answerArea(area, q, val, o){
  area.innerHTML = '';
  if (q.kind === 'num') return new ExamPad(area, {unit:q.unit, val: val ?? '', ok:o.ok, onChange:o.onChange, onNext:o.onNext});
  KEYPAD = null;
  mk('ehint', null, null, q.kind === 'cmp' ? '○ 안에 들어갈 것을 골라요' : '알맞은 것을 골라요', null, area);
  const box = mk(q.kind === 'cmp' ? 'ecmp' : 'echo', null, null, '', null, area);
  const labels = q.kind === 'cmp' ? SYM : q.ch.map((c,k)=>`<b>${NUMS[k]}</b> ${c}`);
  const bs = labels.map((l,k)=>btn(val === k ? 'on' : '', l, ()=>{ if (box.dataset.lock) return; bs.forEach((b,j)=>b.classList.toggle('on', j===k)); o.onChange(k, bs[k]); }, box));
  return {box, bs};
}
function examScreen(){
  const bd = new Board({pen:true});
  const paper = mk('qpaper', null, null, '', null, bd.el);
  const {pr, st} = rightPanel();
  const area = mk('earea', null, null, '', null, pr);
  const sum = mk('esum', null, null, '', null, pr);
  return {bd, paper, pr, st, area, sum};
}
function setPaper(paper, no, sub, q){ paper.style.display = ''; paper.innerHTML = `<div class=qno>${no}. <small>${sub}</small></div>${q.html}`; }

function startExam(spec, resume){
  resetScreen();
  const sg = SG, E = ES(), ex = buildExam(spec), N = ex.qs.length;
  const S = {i:0, ans: resume ? [...resume.ans] : Array(N).fill(null), ink:[], used: resume ? resume.used : 0, t0: Date.now()};
  const elapsed = () => S.used + (Date.now() - S.t0)/1000;
  const saveCur = () => { E.cur = {spec, ans:S.ans, used: Math.round(elapsed())}; Store.save(); };
  saveCur();

  $('bMap').style.display = '';
  $('title').innerHTML = ex.title;
  const nav = $('tabs'); nav.innerHTML = ''; nav.className = 'qnav';
  const nb = ex.qs.map((_,k)=>btn('', String(k+1), ()=>go(k), nav));
  const {bd, paper, st, area, sum} = examScreen();
  const paintNav = () => {
    nb.forEach((b,k)=>{ b.classList.toggle('ans', S.ans[k] !== null); b.classList.toggle('on', k === S.i); });
    sum.innerHTML = `답한 문제 <b>${S.ans.filter(a=>a !== null).length}</b> / ${N}`;
  };
  let warned = false;
  const tick = () => {
    const e = $('etm'); if (!e) return;
    const rem = ex.limit - elapsed();
    e.textContent = rem >= 0 ? `⏱ ${mmss(rem)} 남음` : `⏱ ${mmss(-rem)} 넘음`;
    e.classList.toggle('over', rem < 0);
    if (rem < 0 && !warned){ warned = true; say('시간이 다 됐어! 마무리하고 <b>📮 제출</b>을 눌러 줘.'); }
  };
  let tk = 0;
  TIMERS.push(setInterval(()=>{ if (sg !== SG) return; tick(); if (++tk % 5 === 0) saveCur(); }, 1000));

  const ctrls = () => setCtrls(
    btn('cbtn', '◀', ()=>go(S.i-1)), btn('cbtn', '▶', ()=>go(S.i+1)),
    btn('pill sm', '📮 제출', submit));
  function go(k){
    if (k < 0 || k >= N) return;
    if (bd.cv) S.ink[S.i] = bd.cv.toDataURL();
    S.i = k; bd.clearInk();
    if (S.ink[k]){ const im = new Image(); im.onload = ()=>{ if (S.i === k && sg === SG) bd.ctx.drawImage(im, 0, 0, 740, 565); }; im.src = S.ink[k]; }
    const q = ex.qs[k];
    setPaper(paper, k+1, `(${ex.pt}점)`, q);
    st.innerHTML = `<b>${k+1}번</b><span class=pt>${ex.pt}점</span><span class=timer id=etm></span>`; tick();
    answerArea(area, q, S.ans[k], {
      onChange: v => { S.ans[S.i] = (v === '' || v === null) ? null : v; paintNav(); saveCur(); },
      onNext: () => { if (S.i < N-1) go(S.i+1); else say('마지막 문제야! 다 풀었으면 <b>📮 제출</b>을 눌러 줘.'); },
    });
    paintNav(); ctrls();
    const [pb, nx] = $('ctrls').children; pb.disabled = k === 0; nx.disabled = k === N-1;
  }
  function submit(){
    const empty = S.ans.map((a,k)=>a === null ? k+1 : 0).filter(Boolean);
    if (empty.length) say(`아직 안 푼 문제가 <b>${empty.length}개</b> 있어 (${empty.slice(0,6).join(', ')}${empty.length > 6 ? ' …' : ''}번).<br>그래도 제출할까?`);
    else say('정말 제출할까? 제출하면 답을 고칠 수 없어.');
    setCtrls(btn('pill w sm', '✏️ 더 풀기', ()=>{ say('좋아, 천천히 다시 봐!'); go(empty.length ? empty[0]-1 : S.i); }), btn('pill sm', '📮 제출', finish));
  }
  function finish(){
    clearTimers();
    const used = Math.round(elapsed()), res = ex.qs.map((q,k)=>isRight(q, S.ans[k]));
    const ok = res.filter(Boolean).length, score = Math.round(ok * ex.pt), diag = [];
    ex.qs.forEach((q,k)=>{
      if (res[k] || S.ans[k] === null || q.cat !== 'calc' || !q.sol) return;
      const t = q.sol.a < 100 ? diagnose(q.sol.a, q.sol.b, Number(S.ans[k])) : 'other';
      diag.push(t === 'ok' ? 'other' : t); Store.mistake(t === 'ok' ? 'other' : t);
    });
    const key = examKey(spec);
    if (spec.mode !== 'bank') E.best[key] = Math.max(E.best[key] ?? 0, score);
    E.hist.push({key, title:ex.title, score, ok, n:N, used, t:Date.now()}); if (E.hist.length > 60) E.hist.shift();
    ex.qs.forEach((q,k)=>{ if (!res[k] && !E.note.some(x=>x.html === q.html)) E.note.push({...q, from:ex.title}); });
    while (E.note.length > 80) E.note.shift();
    E.cur = null; Store.save();
    safe(showGrading)({ex, ans:S.ans, res, ok, score, used, diag});
  }
  say(`${ex.title} 시작! 문제는 <b>${N}개</b>, 시간은 <b>${ex.limit/60}분</b>이야.<br>위의 번호를 누르면 다른 문제로 갈 수 있어. 다 풀면 <b>📮 제출</b>!`);
  go(0);
}

/* ---------- 채점표 (선생님처럼 ○ / ✓ 채점 모션) ---------- */
async function showGrading(R, instant){
  resetScreen();
  const sg = SG, N = R.ex.qs.length;
  $('bMap').style.display = '';
  $('title').innerHTML = `${R.ex.title}<small>채점</small>`;
  const pf = fullPanel();
  mk('gtitle', null, null, '채점표', null, pf);
  const scoreEl = mk('gscore', null, null, instant ? `${R.score}<small>점</small>` : '', null, pf);
  const stamp = mk('stamp', null, null, R.score >= 90 ? '참 잘했어요' : R.score >= 70 ? '잘했어요' : '조금만 더!', null, pf);
  const cols = N <= 5 ? N : N <= 10 ? 5 : 4, rows = Math.ceil(N/cols);
  const cw = (1140 - (cols-1)*16)/cols, ch = Math.min(110, Math.floor((565 - 100 - 20 - (rows-1)*12)/rows));
  const cells = R.ex.qs.map((q,k)=>{
    const c = mk('gcell', 40 + (k%cols)*(cw+16), 100 + Math.floor(k/cols)*(ch+12), `<div class=gn>${k+1}</div><div class=gbody><div class=ga>${ansText(q, R.ans[k])}</div><div class=gc></div></div>`, null, pf);
    css(c, {width:cw+'px', height:ch+'px'}); return c;
  });
  const wrongN = R.res.filter(x=>!x).length;
  const mark = (k) => {
    const c = cells[k], m = mk(R.res[k] ? 'mk-o' : 'mk-x', null, null, '', null, c);
    if (!R.res[k]) c.querySelector('.gc').innerHTML = `정답 ${ansText(R.ex.qs[k], R.ex.qs[k].ans)}`;
    return m;
  };
  if (instant){ R.ex.qs.forEach((_,k)=>mark(k)); stamp.style.opacity = 1; }
  else {
    say('채점 중… 두근두근!');
    setCtrls();
    try {
      await waitFixed(500);
      for (let k = 0; k < N; k++){
        const m = mark(k); R.res[k] ? SFX.pop() : SFX.slash();
        await A(m, R.res[k] ? [{opacity:0, transform:'scale(1.8)'}, {opacity:1, transform:'scale(1)'}] : [{opacity:0, transform:'rotate(-55deg) scaleX(0)'}, {opacity:1, transform:'rotate(-55deg) scaleX(1)'}], 220, {fixed:true});
        await waitFixed(N > 10 ? 70 : 140);
      }
      for (let s = 0; s <= 10; s++){ scoreEl.innerHTML = `${Math.round(R.score*s/10)}<small>점</small>`; await waitFixed(55); }
      R.score >= 90 ? (SFX.fanfare(), confetti(40, 1180)) : SFX.ding();
      await A(stamp, [{opacity:0, transform:'rotate(-8deg) scale(2.2)'}, {opacity:1, transform:'rotate(-8deg) scale(1)'}], 380, {fixed:true});
    } catch(e){ return; }
    if (sg !== SG) return;
  }
  const msg = R.score === 100 ? `<b>100점</b>! 완벽해, {n} 대장님! 🎉` : R.score >= 90 ? `<b>${R.score}점</b>! 정말 훌륭해! 틀린 ${wrongN}문제만 다시 보면 완벽!`
            : R.score >= 70 ? `<b>${R.score}점</b>! 잘했어. <b>약점 분석</b>을 보고 틀린 문제를 다시 풀어 볼까?` : `<b>${R.score}점</b>. 괜찮아! 틀린 문제를 다시 풀면 실력이 쑥쑥 올라.`;
  say(msg + ` <span style="font-size:19px">(걸린 시간 ${minsec(R.used)})</span>`);
  resultCtrls(R, 'sheet');
}
function resultCtrls(R, at){
  const wrong = R.ex.qs.filter((_,k)=>!R.res[k]);
  setCtrls(
    at === 'sheet' ? btn('pill w sm', '📊 약점 분석', ()=>showAnalysis(R)) : btn('pill w sm', '📋 채점표', ()=>safe(showGrading)(R, true)),
    wrong.length ? btn('pill y sm', `🔁 틀린 ${wrong.length}문제 다시 풀기`, ()=>safe(retryWrong)(wrong.map(q=>({...q, from:R.ex.title})), R)) : null,
    btn('pill sm', '🗼 등대로', ()=>openTower(R.ex.spec.mode === 'unit' ? 'unit' : R.ex.spec.mode)),
  );
}

/* ---------- 약점 분석 ---------- */
function showAnalysis(R){
  resetScreen();
  $('bMap').style.display = '';
  $('title').innerHTML = `${R.ex.title}<small>약점 분석</small>`;
  const pf = fullPanel();
  const tally = keyOf => { const m = new Map(); R.ex.qs.forEach((q,k)=>{ const key = keyOf(q); const v = m.get(key) || {ok:0, n:0}; v.n++; if (R.res[k]) v.ok++; m.set(key, v); }); return m; };
  const bars = (map, label) => [...map.entries()].map(([k, v])=>{
    const p = v.ok/v.n, col = p >= .8 ? 'var(--green)' : p >= .5 ? '#E2A400' : 'var(--red)';
    return `<div class=arow><span class=al>${label(k)}</span><span class=at><i style="width:${Math.round(p*100)}%;background:${col}"></i></span><span class=an>${v.ok} / ${v.n}</span></div>`;
  }).join('');
  const U = tally(q=>q.u), C = tally(q=>q.cat);
  mk('ascore', null, null, `<div class=asc>${R.score}<small>점</small></div><div>${R.ok} / ${R.ex.qs.length} 맞힘</div><div class=asm>걸린 시간 ${minsec(R.used)}</div>`, null, pf);
  mk('anbox au', null, null, `<h4>소단원별</h4>${bars(new Map([...U.entries()].sort((a,b)=>a[0]-b[0])), u=>`${UNITS[u].no} ${UNITS[u].short}`)}`, null, pf);
  mk('anbox ac', null, null, `<h4>유형별</h4>${bars(new Map(Object.keys(CATS).filter(c=>C.has(c)).map(c=>[c, C.get(c)])), c=>CATS[c])}`, null, pf);
  const weakest = map => { let w = null; map.forEach((v,k)=>{ const p = v.ok/v.n; if (p < 1 && (!w || p < w.p)) w = {k, p}; }); return w; };
  const wu = weakest(U), wc = weakest(C);
  const diagCount = {}; R.diag.forEach(t=>diagCount[t] = (diagCount[t]||0) + 1);
  const dtxt = Object.entries(diagCount).filter(([t])=>t !== 'other').map(([t,n])=>`${MISTAKE_NAME[t]} ${n}번`).join(', ');
  const adv = !wu && !wc ? '모든 문제를 맞혔어요! 🎉 문제은행에서 새로운 문제에 도전해 보세요.'
    : [wu ? `<b>${UNITS[wu.k].no} ${UNITS[wu.k].short}</b> — ${UNIT_TIP[wu.k]}` : '', wc ? `<b>${CATS[wc.k]}</b> — ${CAT_TIP[wc.k]}` : '', dtxt ? `<b>이번 시험의 계산 실수</b> — ${dtxt}` : ''].filter(Boolean).join('<br>');
  mk('advice', null, null, `<div class=adt>💡 이렇게 해 봐요</div>${adv}`, null, pf);
  say(!wu && !wc ? '약한 곳이 없어! 대단해, {n} 대장님!' : `막대가 짧은 곳이 약한 부분이야. <b>${UNITS[wu ? wu.k : 5].short}</b>부터 다시 연습해 볼까?`);
  resultCtrls(R, 'analysis');
}

/* =========================================================
   틀린 문제 다시 풀기 — 한 문제씩 바로 채점, 틀리면 풀이
   ========================================================= */
function stages3(a, m){
  const S = [], ds = digitsOf(a).reverse(); let c = 0;
  ds.forEach((d, p)=>{
    const v = d*m + c, last = p === ds.length-1;
    const acts = last ? digitsOf(v).reverse().map((x,k)=>({t:'dig', p:p+k, row:'r1', txt:String(x), cls:'b'})) : [{t:'dig', p, row:'r1', txt:String(v%10), cls:'b'}];
    if (c) acts.push({t:'slash', row:'k1', p});
    if (!last && v >= 10) acts.push({t:'carry', p:p+1, row:'k1', txt:String(Math.floor(v/10))});
    S.push({hl: ['A'+p, 'B0'].concat(c ? ['k1c'+p] : []), hlc:'b', acts});
    c = last ? 0 : Math.floor(v/10);
  });
  return S;
}
const solStages = s => (s.a >= 100 && s.b < 10) ? stages3(s.a, s.b) : solutionStages(s.a, s.b).S;

async function retryWrong(list, back){
  resetScreen();
  const sg = SG, E = ES(), N = list.length;
  $('bMap').style.display = '';
  $('title').innerHTML = '🔁 다시 풀기';
  const nav = $('tabs'); nav.innerHTML = ''; nav.className = 'qnav';
  const nb = list.map((_,k)=>btn('', String(k+1), ()=>{}, nav));
  const {bd, paper, st, area, sum} = examScreen();
  let okN = 0;
  for (let i = 0; i < N; i++){
    const q = list[i];
    nb.forEach((b,k)=>b.classList.toggle('on', k === i));
    bd.clearInk(); bd.clearLayer(); bd.unhl();
    setPaper(paper, i+1, q.from || '', q);
    st.innerHTML = `🔁 다시 풀기 <b>${i+1}</b> / ${N}`;
    sum.innerHTML = `맞힌 문제 <b>${okN}</b>`;
    say('다시 도전! 이번엔 천천히, 공책 칸에 써 가며 풀어 봐.');
    setCtrls();
    let tries = 0;
    const outcome = await new Promise(res=>{
      const check = (v, b) => {
        if (v === '' || v === null || v === undefined) return;
        const right = isRight(q, v);
        if (q.kind === 'num') ui.mark(right); else { b.classList.remove('on'); b.classList.add(right ? 'ok' : 'no'); }
        if (right){ SFX.right(); if (q.kind !== 'num') ui.box.dataset.lock = 1; else ui.locked = true; res('ok'); return; }
        SFX.wrong(); tries++;
        if (tries === 1){
          const dt = (q.cat === 'calc' && q.sol && q.sol.a < 100) ? diagnose(q.sol.a, q.sol.b, Number(v)) : 'other';
          const tip = dt !== 'other' ? mistakeMsg(dt, q.sol.a, q.sol.b) : '';
          say(tip || '아깝다! 한 번 더 생각해 볼까? 공책에 써 보면 실수를 찾기 쉬워.');
        } else { if (q.kind !== 'num') ui.box.dataset.lock = 1; else ui.locked = true; res('no'); }
      };
      const ui = answerArea(area, q, null, {ok:'확인', onChange:(v, b)=>{ if (q.kind !== 'num') check(v, b); }, onNext:v=>check(v)});
    });
    if (sg !== SG) return;
    nb[i].classList.add(outcome === 'ok' ? 'ok' : 'no');
    if (outcome === 'ok'){
      okN++; sum.innerHTML = `맞힌 문제 <b>${okN}</b>`;
      E.note = E.note.filter(x=>x.html !== q.html); Store.save();
      SFX.fanfare(); gemFly(1000, 200);
      say(`${praise()} 정답은 <b>${ansText(q, q.ans)}</b>! 오답 노트에서 뺐어.`);
    } else {
      say(`정답은 <b>${ansText(q, q.ans)}</b>! 풀이를 같이 보자.`);
      area.innerHTML = ''; KEYPAD = null;
      mk('expcard', null, null, `<div class=adt>📖 풀이</div>${q.exp}`, null, area);
    }
    await new Promise(res=>{
      const showVert = q.sol ? btn('pill w sm', '👀 세로셈 풀이', async ()=>{
        showVert.disabled = true; paper.style.display = 'none'; bd.clearInk();
        bd.setProblem(q.sol.a, q.sol.b);
        try { await bd.reveal(solStages(q.sol), 220); } catch(e){}
      }) : null;
      setCtrls(outcome === 'no' ? showVert : null, btn('pill sm', i < N-1 ? '다음 문제 ▶' : '끝! ✓', res));
    });
    if (sg !== SG) return;
  }
  SFX.ding();
  say(`다시 풀기 끝! <b>${okN}문제</b>를 맞혀서 오답 노트에서 뺐어.${okN < N ? ' 남은 문제는 오답 노트에서 또 풀 수 있어.' : ' 🎉'}`);
  setCtrls(back && back !== 'note' ? btn('pill w sm', '📋 시험 결과', ()=>safe(showGrading)(back, true)) : null, btn('pill sm', '🗼 등대로', ()=>openTower('note')));
}
