/* =========================================================
   examdiv.js — 🗼 시험 등대 나눗셈 단원 (3-2 「2. 나눗셈」 + 3-1 복습 내용)
   exam.js 의 examSea('div')가 이 묶음으로 바꿔 끼운다. 문제 모양 도우미(ask·big·mid·word·qq·BOX·NUMS·SYM)는 exam.js 것을 쓴다.
   ========================================================= */
const EXAM_DIV = (function(){
const UNITS = [null,
  {no:'①', name:'(몇십), (몇십몇)<br>÷ (몇)',               short:'나누어떨어지는 나눗셈'},
  {no:'②', name:'나머지가 있는<br>(몇십몇) ÷ (몇)',          short:'나머지 있는 나눗셈'},
  {no:'③', name:'계산이 맞는지<br>확인하기',                short:'계산 확인'},
  {no:'④', name:'(세 자리 수)<br>÷ (한 자리 수)',           short:'세 자리 ÷ 한 자리'},
  {no:'⑤', name:'나눗셈 활용<br>(문장제 · 어림 · 추론)',     short:'나눗셈 활용'},
];
const UNIT_TIP = {
  1:'큰 자리부터 나누고, 남은 십막대는 <b>낱개 10개로 바꿔</b> 다음 자리와 함께 나눠요. (몇십 섬 · 몇십몇 섬)',
  2:'나머지는 늘 <b>나누는 수보다 작아야</b> 해요. 남은 것이 나누는 수만큼 있으면 한 번 더 나눠요. (나머지 섬)',
  3:'<b>나누는 수 × 몫 + 나머지 = 나누어지는 수</b>가 되는지 확인해요. (확인 섬)',
  4:'백의 자리가 나누는 수보다 작으면 <b>몫은 두 자리</b>예요. 나눌 수 없는 자리에는 몫에 <b>0</b>을 써요. (세 자리 섬)',
  5:'"적어도 몇 대?"처럼 나머지를 어떻게 할지 <b>문제를 다시 읽어요</b>. 어림으로 답을 확인해요. (나눗셈 보물섬)',
};
const CAT_TIP = {
  calc: '세로식에서 <b>몫 → 곱 → 빼기 → 내려쓰기</b> 순서를 지켜요. 다 풀면 나누는 수 × 몫 + 나머지로 확인해요.',
  idea: '나눗셈은 <b>곱셈을 거꾸로</b> 한 것! 나누는 수의 단에서 몫을 찾아요.',
  cmp:  '몫의 크기는 <b>몇십, 몇백으로 어림</b>해서 먼저 비교해 봐요.',
  word: '"똑같이 나누면", "몇씩 묶으면"을 찾아 <b>나눗셈 식</b>을 세우고, 나머지를 어떻게 할지 생각해요.',
  think:'숫자카드는 <b>나누는 수를 가장 작게</b>, 나뉘는 수를 가장 크게 하면 몫이 커져요.',
};
const Q = (a, d) => Math.floor(a/d), R = (a, d) => a % d;
const exp = (a, d) => { const q = Q(a,d), r = R(a,d); return `${a} ÷ ${d} = <b>${q}</b>${r ? ` … <b>${r}</b>` : ''}<br><span class=ps>확인: ${d} × ${q}${r ? ` + ${r}` : ''} = ${a}</span>`; };
const calc = (u, a, d, kind='q', cat='calc') => qq({u, cat, ask:kind, sol:{a, d, div:true},
  html: ask(kind === 'r' ? '나눗셈의 <b>나머지</b>를 구해 보세요.' : (R(a,d) ? '나눗셈의 <b>몫</b>을 구해 보세요.' : '계산해 보세요.')) + big(`${a} ÷ ${d}`),
  ans: kind === 'r' ? R(a,d) : Q(a,d), brief:`${a} ÷ ${d}${kind === 'r' ? '의 나머지' : (R(a,d) ? '의 몫' : '')}`, exp:exp(a, d)});

/* 수 만들기 (r: 시드 난수) */
const g1 = (r, k) => r.until(()=>{                          // ① 나누어떨어짐  k: 0 몇십 · 1 내림 없음 · 2 내림 있음
    if (k === 0){ const d = r.int(2,9), t = r.int(2,9); return [t*10, d]; }
    return [r.int(11,99), r.int(2,9)]; },
  ([a, d])=>{ const t = Math.floor(a/10), o = a%10; if (a % d || t < d) return false;
    if (k === 0) return o === 0 && a/d >= 10; if (k === 1) return o && t % d === 0; return o && t % d !== 0; });
const g2 = (r) => r.until(()=>[r.int(11,99), r.int(2,9)], ([a, d])=>a % d !== 0 && Math.floor(a/10) >= d);
const g4 = (r, k, rem) => r.until(()=>[r.int(100,999), r.int(2,9)], ([a, d])=>{     // ④  k: 0 보통 · 1 몫이 두 자리 · 2 몫 가운데 0
    if (rem ? a % d === 0 : a % d !== 0) return false;
    const q = String(Q(a,d)), h = Math.floor(a/100);
    if (k === 1) return h < d; if (k === 2) return h >= d && q.length === 3 && q[1] === '0'; return h >= d && q[1] !== '0'; });

const SHARE = [
  {f:(a,d)=>`사탕 <b>${a}개</b>를 <b>${d}명</b>이 똑같이 나누어 가지면<br>한 명이 몇 개씩 가질까요?`, unit:'개'},
  {f:(a,d)=>`색종이 <b>${a}장</b>을 <b>${d}모둠</b>에 똑같이 나누어 주면<br>한 모둠에 몇 장씩 줄 수 있을까요?`, unit:'장'},
  {f:(a,d)=>`구슬 <b>${a}개</b>를 한 상자에 <b>${d}개</b>씩 담으면<br>몇 상자가 될까요?`, unit:'상자'},
  {f:(a,d)=>`연필 <b>${a}자루</b>를 <b>${d}자루</b>씩 묶으면<br>몇 묶음이 될까요?`, unit:'묶음'},
];
const REMW = [
  {f:(a,d)=>`학생 <b>${a}명</b>이 보트 한 대에 <b>${d}명</b>씩 타요.<br>모두 타려면 보트는 <b>적어도</b> 몇 대 필요할까요?`, unit:'대', ans:(a,d)=>Q(a,d)+1, why:(a,d)=>`${a} ÷ ${d} = ${Q(a,d)} … ${R(a,d)} → 남은 ${R(a,d)}명도 타야 하니 한 대 더! <b>${Q(a,d)+1}대</b>`},
  {f:(a,d)=>`리본 <b>${a} cm</b>를 <b>${d} cm</b>씩 자르면<br>몇 도막이 될까요? (남는 것은 쓰지 않아요)`, unit:'도막', ans:(a,d)=>Q(a,d), why:(a,d)=>`${a} ÷ ${d} = ${Q(a,d)} … ${R(a,d)} → 남은 ${R(a,d)} cm로는 한 도막을 못 만들어요. <b>${Q(a,d)}도막</b>`},
  {f:(a,d)=>`귤 <b>${a}개</b>를 <b>${d}명</b>에게 똑같이 나누어 주면<br>몇 개가 남을까요?`, unit:'개', ans:(a,d)=>R(a,d), why:(a,d)=>`${a} ÷ ${d} = ${Q(a,d)} … <b>${R(a,d)}</b> → <b>${R(a,d)}개</b>가 남아요`},
];
function shareQ(u, r, a, d){ const t = r.pick(SHARE); return qq({u, cat:'word', html: word(t.f(a, d)), ans:Q(a,d), unit:t.unit, sol:{a, d, div:true}, brief:`문장제 · ${a} ÷ ${d}`, exp:`식: ${a} ÷ ${d} = ${Q(a,d)}<br>답: <b>${Q(a,d)}${t.unit}</b>`}); }
function remWordQ(u, r, a, d){ const t = r.pick(REMW); return qq({u, cat:'word', html: word(t.f(a, d)), ans:t.ans(a,d), unit:t.unit, brief:`나머지 문장제 · ${a} ÷ ${d}`, exp:t.why(a,d)}); }
function cmpQd(u, L, Rr){
  const lv = Q(...L), rv = Q(...Rr), ans = lv > rv ? 0 : (lv === rv ? 1 : 2);
  return qq({u, cat:'cmp', kind:'cmp', ans, html: ask('두 나눗셈의 <b>몫</b>을 비교해 ○ 안에 &gt;, =, &lt; 중 알맞은 것을 골라 보세요.') + big(`${L[0]} ÷ ${L[1]} <span class=qcirc></span> ${Rr[0]} ÷ ${Rr[1]}`),
    brief:`${L[0]} ÷ ${L[1]} ○ ${Rr[0]} ÷ ${Rr[1]}`, exp:`${L[0]} ÷ ${L[1]} = ${lv}${R(...L) ? ` … ${R(...L)}` : ''}<br>${Rr[0]} ÷ ${Rr[1]} = ${rv}${R(...Rr) ? ` … ${R(...Rr)}` : ''} → <b>${SYM[ans]}</b>`});
}
const choiceQ = (u, cat, h, ch, ans, brief, ex) => qq({u, cat, kind:'choice', ans, ch, html: ask(h) + `<div class=qlist>${ch.map((c,k)=>`<span>${NUMS[k]} ${c}</span>`).join('')}</div>`, brief, exp:ex});

const F = {
  // ① 나누어떨어지는 나눗셈
  d1calc: (r, k=1) => { const [a, d] = g1(r, k); return calc(1, a, d); },
  d1idea: (r) => {
    if (r() < .5){ const [a, d] = g1(r, 0), t = a/10; return qq({u:1, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + mid(`${t} ÷ ${d} = ${t/d}<br>${a} ÷ ${d} = ${BOX}`), ans:a/d, brief:`${a} ÷ ${d} (몇십 나누기)`, exp:`${t} ÷ ${d} = ${t/d}이니까 ${a} ÷ ${d}는 10배인 <b>${a/d}</b>`}); }
    const [a, d] = g1(r, 1), t = a - a%10, o = a%10;
    return qq({u:1, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + mid(`${a} ÷ ${d}<br>= ${t} ÷ ${d} + ${o} ÷ ${d}<br>= ${BOX} + ${o/d}`), ans:t/d, brief:`${a} ÷ ${d} 나누어 계산`, exp:`${t} ÷ ${d} = <b>${t/d}</b>, ${o} ÷ ${d} = ${o/d} → ${a/d}`});
  },
  d1cmp: (r) => { const p = g1(r, r.int(0,2)), q = g1(r, r.int(0,2)); return cmpQd(1, p, q); },
  d1word: (r) => { const [a, d] = g1(r, r.int(1,2)); return shareQ(1, r, a, d); },

  // ② 나머지가 있는 나눗셈
  d2q: (r) => { const [a, d] = g2(r); return calc(2, a, d, 'q'); },
  d2r: (r) => { const [a, d] = g2(r); return calc(2, a, d, 'r'); },
  d2rule: (r) => {
    const d = r.int(4,8), bad = r.int(d, d+3), goods = r.shuffle([...Array(d-1)].map((_,i)=>i+1)).slice(0,3), ch = r.shuffle([...goods, bad]);
    return choiceQ(2, 'idea', `어떤 수를 <b>${d}</b>로 나누었을 때 나머지가 될 수 <b>없는</b> 수를 골라 보세요.`, ch.map(String), ch.indexOf(bad), `÷ ${d}의 나머지가 될 수 없는 수`, `나머지는 나누는 수 ${d}보다 작아야 해요. <b>${bad}</b>${J(bad,'은','는')} ${d}보다 작지 않아요.`);
  },
  d2word: (r) => { const [a, d] = g2(r); return remWordQ(2, r, a, d); },

  // ③ 계산이 맞는지 확인하기
  d3inv: (r) => { const d = r.int(3,9), q = r.int(11,24), rm = r.int(1,d-1), a = d*q + rm;
    return qq({u:3, cat:'idea', html: ask('□ 안에 알맞은 수를 써넣으세요.') + big(`${BOX} ÷ ${d} = ${q} … ${rm}`), ans:a, brief:`□ ÷ ${d} = ${q} … ${rm}`, exp:`${d} × ${q} + ${rm} = <b>${a}</b>`}); },
  d3choice: (r) => { const [a, d] = g2(r), q = Q(a,d), rm = R(a,d);
    const right = `${d} × ${q} + ${rm} = ${a}`, ch = r.shuffle([right, `${q} × ${rm} + ${d} = ${q*rm+d}`, `${d} × ${rm} + ${q} = ${d*rm+q}`, `${a} × ${d} + ${rm} = ${a*d+rm}`]);
    return choiceQ(3, 'idea', `<b>${a} ÷ ${d} = ${q} … ${rm}</b>을 바르게 확인한 식을 골라 보세요.`, ch, ch.indexOf(right), `${a} ÷ ${d} 확인 식`, `나누는 수 × 몫 + 나머지 = 나누어지는 수<br>${right}`); },
  d3judge: (r) => {
    const mk1 = () => { const [a, d] = g2(r); return {a, d, q:Q(a,d), rm:R(a,d)}; };
    const ok = mk1(), w1 = mk1(), w2 = mk1();
    const bad1 = `${w1.a} ÷ ${w1.d} = ${w1.q - 1} … ${w1.rm + w1.d}`, bad2 = `${w2.a} ÷ ${w2.d} = ${w2.q} … ${w2.rm === 1 ? 2 : w2.rm - 1}`, good = `${ok.a} ÷ ${ok.d} = ${ok.q} … ${ok.rm}`;
    const ch = r.shuffle([good, bad1, bad2]);
    return choiceQ(3, 'think', '계산이 <b>바른</b> 것을 골라 보세요.', ch, ch.indexOf(good), '바른 나눗셈 고르기',
      `${good} ✓<br>${bad1} → 나머지가 ${w1.d}보다 커요<br>${bad2} → 확인하면 ${w2.d} × ${w2.q} + ${w2.rm === 1 ? 2 : w2.rm - 1} ≠ ${w2.a}`); },

  // ④ (세 자리 수) ÷ (한 자리 수)
  d4calc: (r, k=0) => { const [a, d] = g4(r, k, false); return calc(4, a, d); },
  d4rem: (r) => { const [a, d] = g4(r, r.int(0,1), true); return calc(4, a, d, r() < .5 ? 'q' : 'r'); },
  d4idea: (r) => { const set = [g4(r, 1, false)]; while (set.length < 4){ const p = g4(r, 0, false); if (!set.some(x=>x[0]===p[0])) set.push(p); }
    const ch = r.shuffle(set.map(([a,d])=>`${a} ÷ ${d}`)), ans = ch.indexOf(`${set[0][0]} ÷ ${set[0][1]}`);
    return choiceQ(4, 'idea', '몫이 <b>두 자리 수</b>인 나눗셈을 골라 보세요.', ch, ans, '몫이 두 자리 수인 나눗셈', `${ch[ans]} → 백의 자리 ${String(set[0][0])[0]}${J(+String(set[0][0])[0],'이','가')} ${set[0][1]}보다 작아서 몫은 십의 자리부터!`); },
  d4cmp: (r) => cmpQd(4, g4(r, r.int(0,2), false), g4(r, r.int(0,2), false)),

  // ⑤ 나눗셈 활용
  d5word: (r) => { const [a, d] = g4(r, r.int(0,1), false); return shareQ(5, r, a, d); },
  d5word2: (r) => { const [a, d] = g2(r); return remWordQ(5, r, a, d); },
  d5est: (r) => { const d = r.int(2,8), a = r.until(()=>r.int(100,999), x=>Q(x,d) >= 12);
    const near = Math.round(Q(a,d)/10)*10, ch = [near/10, near, near*10].map(v=>`약 ${v}`);
    return choiceQ(5, 'cmp', `<b>${a} ÷ ${d}</b>의 몫은 약 얼마일까요?`, ch, 1, `${a} ÷ ${d} 어림`, `${a} ÷ ${d} = ${Q(a,d)}${R(a,d) ? ` … ${R(a,d)}` : ''} → 약 <b>${near}</b>`); },
  d5missing: (r) => { const [a, d] = g1(r, 2), s = String(a), k = r.int(0,1), ans = +s[k], shown = s.split('').map((c,i)=>i===k ? BOX : c).join('');
    return qq({u:5, cat:'think', html: ask('□ 안에 알맞은 숫자를 써넣으세요.') + big(`${shown} ÷ ${d} = ${a/d}`), ans, brief:`${shown.replace(/<[^>]+>/g,'□')} ÷ ${d}`, exp:`${d} × ${a/d} = ${a} 이므로 □ = <b>${ans}</b>`}); },
  d5cards: (r, small) => {
    const ds = r.shuffle([2,3,4,5,6,7,8,9]).slice(0,4).sort((x,y)=>x-y), want = small ?? (r() < .5);
    const cand = []; for (const p of perms4()){ const a = +(ds[p[0]]+''+ds[p[1]]+ds[p[2]]), d = ds[p[3]]; cand.push([a, d, Q(a,d)]); }
    const best = cand.reduce((b,c)=>(want ? c[2] < b[2] : c[2] > b[2]) ? c : b);
    return qq({u:5, cat:'think', html: ask(`숫자카드 <b>${ds.join(', ')}</b>를 한 번씩 써서 (세 자리 수) ÷ (한 자리 수)를 만들 때, 몫이 가장 <b>${want ? '작은' : '큰'}</b> 나눗셈의 <b>몫</b>을 구해 보세요.`),
      ans:best[2], brief:`숫자카드 ${want ? '가장 작은' : '가장 큰'} 몫`, exp:`나누는 수를 가장 ${want ? '크게' : '작게'}, 나뉘는 수를 가장 ${want ? '작게' : '크게'}<br>${best[0]} ÷ ${best[1]} = <b>${best[2]}</b>${R(best[0],best[1]) ? ` … ${R(best[0],best[1])}` : ''}`});
  },
};
function perms4(){ const out = [], a = [0,1,2,3]; const go = (k)=>{ if (k === 4){ out.push([...a]); return; } for (let i=k;i<4;i++){ [a[k],a[i]] = [a[i],a[k]]; go(k+1); [a[k],a[i]] = [a[i],a[k]]; } }; go(0); return out; }

const BP_UNIT = [
  ['d1calc',0], ['d1calc',1], ['d1idea'], ['d1calc',2], ['d2q'], ['d2r'], ['d2rule'], ['d3inv'], ['d3choice'], ['d4calc',0],
  ['d4calc',1], ['d4calc',2], ['d4rem'], ['d4idea'], ['d1cmp'], ['d2word'], ['d5word'], ['d5est'], ['d5missing'], ['d5cards'],
];
const BP_SUB = {
  1: [['d1calc',0], ['d1calc',1], ['d1calc',2], ['d1calc',0], ['d1idea'], ['d1idea'], ['d1cmp'], ['d1word'], ['d1word'], ['d1calc',2]],
  2: [['d2q'], ['d2q'], ['d2r'], ['d2r'], ['d2rule'], ['d2rule'], ['d2word'], ['d2word'], ['d2q'], ['d2r']],
  3: [['d3inv'], ['d3inv'], ['d3choice'], ['d3choice'], ['d3judge'], ['d3judge'], ['d3inv'], ['d3choice'], ['d3judge'], ['d3inv']],
  4: [['d4calc',0], ['d4calc',1], ['d4calc',2], ['d4calc',0], ['d4rem'], ['d4rem'], ['d4idea'], ['d4cmp'], ['d4calc',1], ['d4calc',2]],
  5: [['d5word'], ['d5word'], ['d5word2'], ['d5word2'], ['d5est'], ['d5est'], ['d5cards',false], ['d5cards',true], ['d5missing'], ['d5missing']],
};
return {UNITS, UNIT_TIP, CAT_TIP, F, BP_UNIT, BP_SUB};
})();
