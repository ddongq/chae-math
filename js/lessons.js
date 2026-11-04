/* =========================================================
   lessons.js — 섬 1~5 원리 모션
   ========================================================= */

/* ---------- 섬 1: 점프 섬 (× 10, 몇십 × 몇십) ---------- */
const PVC = ['#F2994A','#2F7BEA','#14995A','#7A3FD0'];
const PR = [210, 290, 370, 450, 530];
function pvBase(){
  ['일','십','백','천'].forEach((t,p)=>{ const b = mk('pvbox', CX[p], 94, t); b.style.background = PVC[p]; });
  for (let p=0;p<3;p++) css(mk('pvline', (CX[p]+CX[p+1])/2, 152), {height:'470px'});
}
const pvW = (row, p, txt, cls='b') => writeDigit('v'+row+'p'+p, p, PR[row], txt, cls);
async function jump(fromId, toId, p, y, cls){
  const s = $(fromId), sx = parseFloat(s.style.left), sy = parseFloat(s.style.top), tx = CX[p];
  const d = mk('dg '+cls, sx, sy, s.textContent, toId); SFX.pop();
  await A(d, [{left:sx+'px',top:sy+'px'},{left:((sx+tx)/2)+'px',top:(Math.min(sy,y)-70)+'px',offset:.5},{left:tx+'px',top:y+'px'}], 750, {easing:'ease-in-out'});
  return d;
}
const pvClear = () => fadeRm([...fx.querySelectorAll('[id^="v"]')]);
const wsClear = () => fadeRm([...fx.querySelectorAll('.ws, .tag, .title, .card, .mini, .bigx, .bigo, .lineq')]);

const L1 = {
  a:30, b:40, base: pvBase,
  tips: [
    '3개씩 4봉지는 덧셈으로 어떻게 쓸까? (3 + 3 + 3 + 3)',
    '낱개 12개를 십막대로 바꾸면 몇 개가 남을까?',
    '십막대 12개는 사탕 몇 개일까?',
    '십막대 10개가 왜 백판 1개와 같을까?',
    '× 10을 하면 숫자가 왜 한 칸씩 왼쪽으로 갈까?',
    '20 × 30 직사각형에 백판이 몇 장 들어갈까?',
    '40 × 50 = 2000에서 0이 왜 세 개일까?',
    '50 × 60은 얼마일까? 0을 몇 개 붙일까?',
  ],
  steps: [
  async()=>{
    say(`{n} 대장님, 곱셈 바다 탐험 시작! 첫 섬은 <b>점프 섬</b>이야. 사탕이 한 봉지에 <b>3개씩</b>, <b>4봉지</b> 있어. 모두 몇 개일까?`);
    const t = mk('title ws', 30, 112, '사탕 봉지 <b class=r>4개</b> · 봉지마다 <b class=r>3개</b>', 'ttl'); t.style.width = '740px'; await showEl(t);
    const bags = [0,1,2,3].map(i=>{ const b = mk('bag ws', 92+i*160, 220, '', 'bag'+i); b.style.opacity = 0; return b; });
    await popIn(bags, 90, 300);
    const cs = [];
    for (let i=0;i<12;i++){ const g = Math.floor(i/3), k = i%3; cs.push(blk('cube', 92+g*160+22+k*20, 262, 'q'+i)); }
    SFX.pop(); await popIn(cs, 40, 260);
  },
  async()=>{
    say(`봉지에서 꺼내 모아 보면 <b>3 × 4 = 12</b>! 낱개 10개는 십막대 1개니까 <b>십이 1개, 일이 2개</b>야.`);
    await fadeRm([$('ttl'), ...ids('bag',0,4)]);
    await setEq('3 × 4 = <span class=b>12</span>');
    await slideTo(ids('q',0,12), 120, 408, 18);
    const rod = await cubesToRod(ids('q',0,10), 120, 300, 'qr');
    await slideTo(ids('q',10,12), 240, 408);
    await tags([['십막대 1개', [rod], 440], ['낱개 2개', ids('q',10,12), 440]]);
    await rowLbl('vl0', PR[0], '3×4', 'b');
    await pvW(0, 1, '1'); await pvW(0, 0, '2');
  },
  async()=>{
    say(`이번엔 한 봉지에 <b>30개씩</b>! 30은 <b>십막대 3개</b>야. 4봉지면 십막대가 모두 <b>12개</b>!`);
    await fadeRm([...fx.querySelectorAll('.ws, .tag')]);
    await setEq('30 × 4 = ?');
    const rs = [];
    for (let i=0;i<12;i++){ const g = Math.floor(i/3), k = i%3; rs.push(blk('rod', 80+g*150+k*18, 300, 'tr'+i)); }
    SFX.pop(); await popIn(rs, 50);
    await tag('십막대 12개', rs, 440);
  },
  async()=>{
    say(`십막대 10개는 <b>백판 1개</b>! 백판 1개, 십막대 2개 = <b>120</b>. 3 × 4 = 12였는데, 숫자가 <b>한 칸 왼쪽으로 점프</b>하고 0이 붙었어!`);
    await tagsRm();
    await rodsToFlat(ids('tr',0,10), 80, 300, 'tf');
    await slideTo(ids('tr',10,12), 300, 300, 18);
    await tags([['백판 1개 = 100', [$('tf')], 440], ['십막대 2개 = 20', ids('tr',10,12), 440]]);
    await setEq('30 × 4 = <span class=g>120</span>');
    await rowLbl('vl1', PR[1], '30×4', 'g');
    await jump('v0p1', 'v1p2', 2, PR[1], 'g'); await jump('v0p0', 'v1p1', 1, PR[1], 'g');
    await zeroDrop('v1p0', 0, PR[1]);
  },
  async()=>{
    say(`<b>× 10의 비밀!</b> 10을 곱하면 낱개는 십막대로, 십막대는 백판으로 변신해. 그래서 숫자들이 <b>한 칸씩 왼쪽</b>으로 점프하고, 일의 자리엔 <b>0</b>!`);
    await wsClear();
    await setEq('24 × 10 = ?');
    const r = [blk('rod', 300, 300, 'zr0'), blk('rod', 318, 300, 'zr1')];
    const c = [0,1,2,3].map(k=>blk('cube', 350+k*18, 408, 'zc'+k));
    SFX.pop(); await popIn([...r, ...c], 60);
    await tag('24 = 십막대 2개 + 낱개 4개', [...r, ...c], 440);
    await rowLbl('vl2', PR[2], '24', 'b');
    await pvW(2, 1, '2'); await pvW(2, 0, '4');
    await wait(400); await tagsRm();
    await all([growTo(r[0], 'flat', 80, 300), growTo(r[1], 'flat', 210, 300), ...c.map((e,k)=>growTo(e, 'rod', 360+k*18, 300))]);
    await tag('백판 2개 + 십막대 4개 = 240', [...r, ...c], 440);
    await setEq('24 × 10 = <span class=g>240</span>');
    await rowLbl('vl3', PR[3], '24×10', 'g');
    await jump('v2p1', 'v3p2', 2, PR[3], 'g'); await jump('v2p0', 'v3p1', 1, PR[3], 'g');
    await zeroDrop('v3p0', 0, PR[3]);
  },
  async()=>{
    say(`이번엔 <b>20 × 30</b>! 가로 20, 세로 30인 직사각형을 <b>백판(10 × 10)</b>으로 채워 볼까? 가로로 2장, 세로로 3장…`);
    await wsClear(); await pvClear();
    await setEq('20 × 30 = ?', 400, 110, 350);
    const fr = mk('ws', 120, 200); css(fr, {width:'244px', height:'364px', border:'4px dashed #C9A97A', borderRadius:'8px', opacity:0}); await showEl(fr, 300);
    const l1 = mk('rlbl ws', 120, 156, '20'); css(l1, {width:'244px', textAlign:'center'});
    const l2 = mk('rlbl ws', 66, 360, '30');
    await all([showEl(l1, 300), showEl(l2, 300)]);
    const fs = [];
    for (let i=0;i<6;i++){
      const f = blk('flat', 122+(i%2)*120, 202+Math.floor(i/2)*120, 'hf'+i); fs.push(f);
      SFX.pop(); await A(f, POP, 300);
      const n = mk('tag ws cnt', 122+(i%2)*120+40, 202+Math.floor(i/2)*120+38, String(i+1)); await A(n, IN, 150);
    }
    await tag('백판 6장 = 600', 420, 320);
    await setEq('2 × 3 = 6 → <span class=g>600</span>', 400, 110, 350);
    await rowLbl('vl0', PR[0], '2×3', 'b'); await pvW(0, 0, '6');
    await rowLbl('vl1', PR[1], '20×30', 'g');
    await jump('v0p0', 'v1p2', 2, PR[1], 'g');
    await zeroDrop('v1p1', 1, PR[1]); await zeroDrop('v1p0', 0, PR[1]);
  },
  async()=>{
    say(`규칙 발견! <b>몇십 × 몇십</b>은 0을 떼고 곱한 다음 <b>0을 두 개</b> 붙여. 40 × 50은 4 × 5 = 20에 0 두 개 → <b>2000</b>!`);
    await wsClear(); await pvClear(); await fadeRm([$('eq')]);
    const rows = [['2 × 3 = 6', '20 × 30 = 6<b class=g>00</b>'], ['3 × 4 = 12', '30 × 40 = 12<b class=g>00</b>'], ['4 × 5 = 20', '40 × 50 = 20<b class=g>00</b>']];
    for (let i=0;i<rows.length;i++){
      const e = mk('lineq', 70, 150+i*100, `<span style="display:inline-block;width:230px">${rows[i][0]}</span> → &nbsp;${rows[i][1]}`);
      css(e, {fontSize:'40px', fontWeight:'800', width:'680px'}); await showEl(e, 350); await wait(250);
    }
    const n = mk('card ws', 70, 470, '💡 4 × 5 = 2<b>0</b>에도 0이 있어서, 2000에는 0이 <b>세 개</b>처럼 보여!'); css(n, {fontSize:'22px'}); await showEl(n);
    await rowLbl('vl0', PR[0], '3×4', 'b'); await pvW(0, 1, '1'); await pvW(0, 0, '2');
    await rowLbl('vl1', PR[1], '30×40', 'g');
    await jump('v0p1', 'v1p3', 3, PR[1], 'g'); await jump('v0p0', 'v1p2', 2, PR[1], 'g');
    await zeroDrop('v1p1', 1, PR[1]); await zeroDrop('v1p0', 0, PR[1]);
  },
  async()=>{
    say(`<b>한눈에 정리!</b> × 10 → 한 칸 점프 + 0 하나. 몇십 × 몇십 → 곱하고 0 두 개. 미션 <b>30 × 40 = 1200</b> 성공!`);
    await wsClear();
    const c = mk('card', 70, 130, `<b>🦘 × 10</b> : 숫자가 한 칸 왼쪽으로 점프, 일의 자리에 0<br><span style="font-size:22px;color:#777">24 × 10 = 24<b class=g>0</b></span><br><br><b>🦘🦘 몇십 × 몇십</b> : 0을 떼고 곱한 뒤 0 두 개<br><span style="font-size:22px;color:#777">30 × 40 → 3 × 4 = 12 → 12<b class=g>00</b></span>`);
    await showEl(c);
    const b = await bands([['g', PR[1]]]); b[0].style.left = '885px';
    SFX.ding(); await pulse(b[0], 1.06, 700);
  },
  ],
};

/* ---------- 섬 2: 십막대 섬 (몇십몇 × 몇십, 몇 × 몇십몇) ---------- */
const L2 = {
  a:23, b:30,
  tips: [
    '23개씩 30봉지를 덧셈으로 하면 몇 번이나 더해야 할까?',
    '23 × 3은 23 + 23 + 23과 같을까?',
    '× 10을 하면 낱개와 십막대가 어떻게 변할까?',
    '30을 곱할 때 왜 0을 먼저 쓸까?',
    '받아올린 빨간 2는 진짜로는 얼마일까? (정답: 200)',
    '빨간 2를 왜 4 × 3에 더할까?',
    '6줄씩 24개와 24줄씩 6개는 왜 개수가 같을까?',
    '24 × 6에서 받아올린 2는 무엇을 뜻할까?',
    '45 × 20은 어떻게 풀까? 0을 먼저 쓰고…',
  ],
  steps: [
  async()=>{
    say(`두 번째 섬, <b>십막대 섬</b>! 구슬이 한 봉지에 <b>23개씩</b>, <b>30봉지</b> 있대. 모두 몇 개일까?`);
    await setEq('23 × 30 = ?');
    const g = [blk('rod', 330, 300, 'o0'), blk('rod', 348, 300, 'o1'), ...[0,1,2].map(k=>blk('cube', 380+k*18, 408, 'oc'+k))];
    SFX.pop(); await popIn(g, 60);
    await tag('구슬 23개 = 십막대 2개 + 낱개 3개', g, 440);
  },
  async()=>{
    say(`30봉지는 너무 많아! 먼저 <b>3봉지</b>만 생각해 보자. <b>23 × 3</b>은?`);
    await wsClear();
    await setEq('23 × 3 = ?');
    const els = [];
    for (let g=0; g<3; g++){
      const gx = 80 + g*190;
      els.push(blk('rod', gx, 300, 'm'+(g*2)), blk('rod', gx+18, 300, 'm'+(g*2+1)));
      for (let k=0;k<3;k++) els.push(blk('cube', gx+50+k*18, 408, 'n'+(g*3+k)));
    }
    SFX.pop(); await popIn(els, 30);
    await wait(500);
    await slideTo(ids('m',0,6), 100, 300, 18);
    await slideTo(ids('n',0,9), 240, 408, 18);
    await tags([['십막대 6개', ids('m',0,6), 440], ['낱개 9개', ids('n',0,9), 440]]);
    await setEq('23 × 3 = <span class=b>69</span>');
  },
  async()=>{
    say(`이제 <b>× 10 변신!</b> 10배가 되면 낱개는 <b>십막대</b>로, 십막대는 <b>백판</b>으로 바뀌어. 23 × 30 = <b class=g>690</b>!`);
    await tagsRm();
    const rods = ids('m',0,6), cubes = ids('n',0,9);
    await all([
      ...rods.map((e,i)=>growTo(e, 'flat', 70+(i%3)*128, 214+Math.floor(i/3)*128)),
      ...cubes.map((e,i)=>growTo(e, 'rod', 470+i*18, 214)),
    ]);
    await tags([['백판 6개 = 600', rods, 480], ['십막대 9개 = 90', cubes, 350]]);
    await setEq('23 × 30 = 23 × 3 × 10 = <span class=g>690</span>');
  },
  async()=>{
    say(`세로셈에서는? 30을 곱하면 끝에 0이 붙으니까 <b>0을 먼저</b> 쓰고, 23 × 3을 <b>한 칸 왼쪽부터</b> 써!`);
    await zeroDrop('r1p0', 0, LY.r1);
    hl(['a0','b1'], 'g'); await wait(300);
    await setEq('3 × 3 = 9');
    await writeDigit('r1p1', 1, LY.r1, '9', 'g');
    hl(['a1','b1'], 'g'); await wait(300);
    await setEq('2 × 3 = 6');
    await writeDigit('r1p2', 2, LY.r1, '6', 'g');
    clearHl();
    await rowLbl('rl1', LY.r1, '23×30', 'g');
    await setEq('23 × 30 = <span class=g>690</span>');
  },
  async()=>{
    say(`받아올림이 있으면? <b>47 × 30</b>. 0을 먼저 쓰고, 7 × 3 = 21 → <b>1</b>은 쓰고 <b class=r>2</b>는 받아올림!`);
    await wsClear();
    await swapBase(47, 30);
    await setEq('47 × 30 = ?');
    await zeroDrop('r1p0', 0, LY.r1);
    hl(['a0','b1'], 'g'); await wait(300);
    await setEq('7 × 3 = 21');
    await writeDigit('r1p1', 1, LY.r1, '1', 'g');
    SFX.ppyong(); burst(CX[1], LY.k1); await writeCarry('k1', 1, LY.k1, '2');
  },
  async()=>{
    say(`4 × 3 = 12에 받아올린 <b class=r>2</b>를 더하면 <b>14</b>! 그래서 47 × 30 = <b class=g>1410</b>`);
    hl(['a1','b1','k1'], 'g'); await wait(300);
    await setEq('4 × 3 + <span class=r>2</span> = 14');
    await writeDigit('r1p2', 2, LY.r1, '4', 'g'); await writeDigit('r1p3', 3, LY.r1, '1', 'g');
    clearHl(); await slashL('k1');
    await setEq('47 × 30 = <span class=g>1410</span>');
  },
  async()=>{
    say(`<b>6 × 24</b>처럼 앞이 한 자리 수면? 곱하는 <b>순서를 바꿔도</b> 답은 같아! 6줄씩 24개를 돌리면 24줄씩 6개!`);
    await swapBase(24, 6);
    await setEq('6 × 24 = 24 × 6', 240, 110, 510);
    const cs = [];
    for (let i=0;i<144;i++){ const r = Math.floor(i/24), c = i%24; cs.push(blk('cube', 80+c*14, 220+r*14, 'x'+i)); }
    SFX.pop(); await popIn(cs, 4, 200);
    await tag('6줄 × 24개', cs, 320);
    await wait(500); await tagsRm(); SFX.swoosh();
    await all(cs.map((e,i)=>{ const r = Math.floor(i/24), c = i%24; return A(e, {left:(80+r*14)+'px', top:(220+c*14)+'px'}, 900, {delay:c*12}); }));
    await tag('24줄 × 6개 — 개수는 똑같이 144개!', 200, 400);
  },
  async()=>{
    say(`24 × 6: 4 × 6 = 24 → <b>4</b>는 쓰고 <b class=r>2</b>는 받아올림. 2 × 6 = 12에 2를 더해 <b>14</b>. 답은 <b class=b>144</b>!`);
    hl(['a0','b0'], 'b'); await setEq('4 × 6 = 24');
    await writeDigit('r1p0', 0, LY.r1, '4', 'b');
    SFX.ppyong(); burst(CX[1], LY.k1); await writeCarry('k1', 1, LY.k1, '2');
    hl(['a1','b0','k1'], 'b'); await setEq('2 × 6 + <span class=r>2</span> = 14');
    await writeDigit('r1p1', 1, LY.r1, '4', 'b'); await writeDigit('r1p2', 2, LY.r1, '1', 'b');
    clearHl(); await slashL('k1');
    await setEq('6 × 24 = <span class=b>144</span>');
  },
  async()=>{
    say(`<b>한눈에 정리!</b> 몇십을 곱할 땐 ① 0을 먼저 ② 한 칸 왼쪽부터 곱하기 ③ 받아올림은 빨간 숫자로! 미션 <b>23 × 30 = 690</b> 성공!`);
    await wsClear(); await fadeRm([$('eq')]);
    await swapBase(23, 30);
    const c = mk('card', 70, 130, `<b>몇십을 곱할 때</b><br>① 일의 자리에 <b class=g>0</b>을 먼저<br>② 몇을 곱해서 <b>한 칸 왼쪽부터</b> 쓰기<br>③ 받아올림은 <b class=r>빨간 숫자로 작게</b>, 다 쓰면 빗금<br><br><b>몇 × 몇십몇</b> : 순서를 바꿔서 몇십몇 × 몇`);
    await showEl(c);
    await zeroDrop('r1p0', 0, LY.r1); await writeDigit('r1p1', 1, LY.r1, '9', 'g'); await writeDigit('r1p2', 2, LY.r1, '6', 'g');
    const b = await bands([['g', LY.r1]]); SFX.ding(); await pulse(b[0], 1.06, 700);
  },
  ],
};

/* ---------- 섬 3: 쪼개기 섬 (12 × 13) ---------- */
const L3 = {
  a:12, b:13,
  tips: [
    '화분 12개씩 13줄을 그림으로 그리면 어떤 모양일까?',
    '13을 10과 3으로 나누면 왜 계산이 쉬워질까?',
    '12 × 3은 12를 몇 번 더한 걸까?',
    '파란 조각 36은 직사각형의 어디일까?',
    '12 × 10은 왜 120일까? 숫자가 어디로 점프했지?',
    '36 + 120에서 자리를 맞추는 게 왜 중요할까?',
    '48이 틀린 답인 걸 어떻게 바로 알 수 있을까?',
    '그림, 식, 세로셈 중 어디가 제일 이해가 잘 됐어?',
  ],
  steps: [
  async()=>{
    say(`세 번째 섬, <b>쪼개기 섬</b>! 화분이 한 줄에 <b>12개씩</b>, <b>13줄</b> 있어. 줄 맞춰 세우면 이런 직사각형이 돼. 모두 몇 개일까?`);
    buildRect({w:12, h:13, top:10, u:20});
    await revealRect();
  },
  async()=>{
    say(`13을 <b class=g>10</b>과 <b class=b>3</b>으로 쪼개 보자! 그러면 12 × 13 = <b class=b>12 × 3</b> + <b class=g>12 × 10</b>, 쉬운 곱셈 두 개가 돼.`);
    await cutRect();
    const f = mk('formula', 30, 470, `12 × 13 = <span class=b>12 × 3</span> + <span class=g>12 × 10</span>`, 'formula'); await showEl(f);
  },
  async()=>{
    say(`먼저 <b class=b>파란 조각 12 × 3</b>! 12는 십막대 1개와 낱개 2개. 이걸 <b>3묶음</b> 모으면?`);
    await fadeRm([$('formula')]);
    await toMini('b');
    hl(['a0','b0'], 'b');
    await setEq('12 × 3 = ?');
    const els = [];
    for (let g=0; g<3; g++){ const gx = 80+g*150; els.push(blk('rod', gx, 300, 'rr'+g), blk('cube', gx+30, 408, 'cc'+(g*2)), blk('cube', gx+48, 408, 'cc'+(g*2+1))); }
    SFX.pop(); await popIn(els, 50);
    await wait(400);
    await slideTo(ids('rr',0,3), 100, 300, 18);
    await slideTo(ids('cc',0,6), 240, 408, 18);
    await tags([['십막대 3개 = 30', ids('rr',0,3), 440], ['낱개 6개 = 6', ids('cc',0,6), 440]]);
    await setEq('12 × 3 = <span class=b>36</span>');
  },
  async()=>{
    say(`낱개 <b>6</b>은 일의 자리, 십막대 <b>3</b>은 십의 자리에! 12 × 3 = <b class=b>36</b>`);
    await tagsRm();
    await flyTo(ids('cc',0,6), CX[0], LY.r1); await writeDigit('r1p0', 0, LY.r1, '6', 'b');
    hl(['a1','b0'], 'b');
    await flyTo(ids('rr',0,3), CX[1], LY.r1); await writeDigit('r1p1', 1, LY.r1, '3', 'b');
    clearHl();
    await rowLbl('rl1', LY.r1, '12×3', 'b');
    await setPart('b', '12 × 3 = 36');
  },
  async()=>{
    say(`이번엔 <b class=g>초록 조각 12 × 10</b>. × 10 변신! 십막대는 백판, 낱개는 십막대가 되고, 일의 자리엔 <b>0</b>.`);
    await dimParts('g');
    hl(['b1'], 'g');
    await setEq('12 × 10 = ?');
    const r = blk('rod', 100, 300, 'gr'), c = [blk('cube', 140, 408, 'gc0'), blk('cube', 158, 408, 'gc1')];
    SFX.pop(); await popIn([r, ...c], 80);
    await wait(400);
    await all([growTo(r, 'flat', 80, 300), growTo(c[0], 'rod', 230, 300), growTo(c[1], 'rod', 248, 300)]);
    await tag('백판 1개 + 십막대 2개 = 120', [r, ...c], 440);
    await setEq('12 × 10 = <span class=g>120</span>');
    await zeroDrop('r2p0', 0, LY.r2);
    await writeDigit('r2p1', 1, LY.r2, '2', 'g'); await writeDigit('r2p2', 2, LY.r2, '1', 'g');
    clearHl();
    await rowLbl('rl2', LY.r2, '12×10', 'g');
    await setPart('g', '12 × 10 = 120');
  },
  async()=>{
    say(`두 줄을 더해요! 36 + 120. 일의 자리 6 + 0 = 6, 십의 자리 3 + 2 = 5, 백의 자리 1 → <b class=s>156</b>!`);
    await wsClear(); await dimParts(null);
    await drawLine('L2', LY.L2);
    await setEq('<span class=b>36</span> + <span class=g>120</span>');
    hl(['r1p0','r2p0'], 's'); await writeDigit('sp0', 0, LY.S, '6', 's');
    hl(['r1p1','r2p1'], 's'); await writeDigit('sp1', 1, LY.S, '5', 's');
    hl(['r2p2'], 's'); await writeDigit('sp2', 2, LY.S, '1', 's');
    clearHl(); SFX.fanfare(); confetti();
    await setEq('12 × 13 = <span class=s>156</span> 🎉');
  },
  async()=>{
    say(`<b>조심!</b> 두 번째 줄에 0을 안 쓰고 12를 그대로 쓰면 36 + 12 = 48… 12 × 13이 48일 리 없어! <b>12 × 10만 해도 120</b>인걸.`);
    await fadeRm([$('eq'), $('rect')]);
    const w = mk('mini', 110, 160, `36<br>12<br><span style="border-top:4px solid #2A2A3C;display:inline-block;width:100%">48</span>`); css(w, {width:'130px', fontSize:'52px', color:'#B74A4D'});
    const r = mk('mini', 430, 160, `36<br><span class=g>120</span><br><span style="border-top:4px solid #2A2A3C;display:inline-block;width:100%" class=s>156</span>`); css(r, {width:'130px', fontSize:'52px'});
    await showEl(w);
    const x = mk('bigx', 180, 420, '✗'); x.style.opacity = 0; SFX.wrong(); await A(x, POP, 400);
    await tag('0을 안 써서 자리가 밀렸어!', [w], 560);
    await showEl(r);
    const o = mk('bigo', 500, 420, '○'); o.style.opacity = 0; SFX.right(); await A(o, POP, 400);
    await tag('0을 먼저 쓰면 자리가 딱!', [r], 560);
  },
  async()=>{
    say(`<b>한눈에 정리!</b> 파란 조각 <b class=b>36</b>, 초록 조각 <b class=g>120</b>, 합치면 <b class=s>156</b>. 그림도, 식도, 세로셈도 모두 <b>같은 이야기</b>야.`);
    await wsClear();
    buildRect({w:12, h:13, top:10, u:20});
    $('pG').classList.add('g'); $('pB').classList.add('b'); $('pB').style.top = (RECT.Ht+16)+'px';
    $('pG').style.borderBottomColor = ''; $('pB').style.borderTopColor = '';
    ['lT','lO','ptg','ptb'].forEach(i=>$(i).style.opacity=1); $('lH').style.opacity = 0;
    $('ptg').innerHTML = '<span>12 × 10 = 120</span>'; $('ptb').innerHTML = '<span>12 × 3 = 36</span>';
    $('rect').style.opacity = 0; await showEl($('rect'));
    const f = mk('formula', 30, 458, `12 × 13 = <span class=b id=fb1>12 × 3</span> + <span class=g id=fg1>12 × 10</span><br>= <span class=b id=fb2>36</span> + <span class=g id=fg2>120</span> = <span class=s id=fs>156</span>`, 'formula');
    await showEl(f);
    const [b1, b2, b3] = await bands([['b', LY.r1], ['g', LY.r2], ['s', LY.S]]);
    SFX.pop(); await all([pulse($('pB'), 1.05, 700), pulse($('fb1')), pulse($('fb2')), pulse(b1, 1.06, 700)]);
    SFX.pop(); await all([pulse($('pG'), 1.04, 700), pulse($('fg1')), pulse($('fg2')), pulse(b2, 1.06, 700)]);
    SFX.ding(); await all([pulse($('fs'), 1.25, 700), pulse(b3, 1.06, 700)]);
  },
  ],
};

/* ---------- 섬 4: 받아올림 화산섬 (39 × 27) ---------- */
const L4 = {
  a:39, b:27,
  tips: [
    '39개씩 27상자를 덧셈으로만 구하면 몇 번이나 더해야 할까?',
    '직사각형의 칸 수가 왜 39 × 27과 같을까?',
    '27을 20과 7로 나누면 무엇이 더 쉬워질까?',
    '왜 일의 자리부터 곱할까? 십의 자리부터 하면 어떻게 될까?',
    '낱개 63개를 10개씩 묶으면 몇 묶음, 몇 개가 남을까?',
    '받아올린 빨간 6은 진짜로는 얼마일까? (정답: 60)',
    '받아올린 6을 왜 더할까? 3 × 7에 곱하면 안 될까?',
    '다 쓴 받아올림 숫자에 빗금을 치면 무엇이 좋을까?',
    '39 × 20의 답은 왜 항상 0으로 끝날까?',
    '여기서 받아올린 빨간 1은 진짜로는 얼마일까? (정답: 100)',
    '39 × 2 = 78과 39 × 20 = 780을 비교해 볼까?',
    '273과 780은 직사각형의 어느 조각일까?',
    '7 + 8 = 15에서 1을 왜 백의 자리로 올릴까?',
    '백의 자리에 아무것도 안 남으면 왜 0을 꼭 써야 할까?',
    '어림해 보자: 39는 약 40, 27은 약 30 → 40 × 30 = 1200. 1053이 그럴듯해?',
    '그림, 식, 세로셈 중 어디가 제일 이해가 잘 됐어?',
  ],
  steps: [
  async()=>{
    say(`{n} 대장님, 화산섬 보물 동굴에 도착했어! 보석이 <b>한 상자에 39개씩</b>, 상자가 <b>27개</b> 있대. 보석은 모두 몇 개일까?`);
    const t = mk('title ws', 30, 112, '보석 상자 <b class=r>27개</b> · 상자마다 보석 <b class=r>39개</b>', 'ttl'); t.style.width='740px'; await showEl(t);
    const bx = [];
    for (let i=0;i<27;i++) bx.push(css(mk('box ws', 76+(i%9)*72, 190+Math.floor(i/9)*82, '<span>💎</span>39', 'box'+i), {opacity:0}));
    SFX.pop(); await popIn(bx, 35, 320);
  },
  async()=>{
    say(`보석을 <b>한 줄에 39개씩, 27줄</b>로 세우면 직사각형이 돼! 이 칸이 모두 몇 개인지가 바로 <b>39 × 27</b>이야.`);
    fire(fadeRm([$('ttl')]));
    buildRect({w:39, h:27, top:20, u:10});
    const bx = ids('box', 0, 27);
    await all([
      revealRect(),
      ...bx.map((b,i)=>A(b, {left:RECT.x+'px', top:(RECT.y+i*10)+'px', width:'390px', height:'10px', borderRadius:'0px', fontSize:'0px', opacity:'0'}, 650, {delay:i*25}))
    ]);
    bx.forEach(b=>b.remove());
  },
  async()=>{
    say(`27은 <b class=g>20</b>과 <b class=b>7</b>로 쪼갤 수 있어. 그러면 어려운 곱셈 하나가 <b>쉬운 곱셈 두 개</b>로 나뉘어!`);
    await cutRect();
    const f = mk('formula', 30, 470, `39 × 27 = <span class=b>39 × 7</span> + <span class=g>39 × 20</span>`, 'formula'); await showEl(f);
  },
  async()=>{
    say(`먼저 <b class=b>파란 조각 39 × 7</b>부터! 세로셈은 <b>일의 자리부터</b> 곱해. <b>9 × 7</b>은? 낱개 블록을 9개씩 7줄 놓아 보자.`);
    fire(fadeRm([$('formula')]));
    await toMini('b');
    hl(['a0','b0'], 'b');
    await setEq('9 × 7 = <span class=b>63</span>');
    const cs = [];
    for (let i=0;i<63;i++) cs.push(blk('cube', 80+(i%9)*16, 300+Math.floor(i/9)*16, 'c'+i));
    SFX.pop(); await popIn(cs, 12, 260);
    await tag('9개씩 7줄 = 낱개 63개', cs, 428);
  },
  async()=>{
    say(`낱개가 <b>10개</b> 모이면 <b>십막대 1개</b>로 바꿀 수 있어. 10개씩 묶어 보자!`);
    await tagsRm();
    for (let g=0; g<6; g++) await cubesToRod(ids('c', g*10, g*10+10), 320+g*20, 300, 'rd'+g);
    await slideTo(ids('c', 60, 63), 520, 408);
    await setEq('63 = <span class=b>60</span> + <span class=b>3</span>');
    await tags([['십막대 6개 = 60', ids('rd',0,6), 438], ['낱개 3개 = 3', ids('c',60,63), 438]]);
  },
  async()=>{
    say(`낱개 <b>3</b>은 일의 자리에 쓰고, 십막대 <b>6개</b>는 십의 자리로 <b class=r>받아올려!</b> 빨간 숫자로 작게 써 두는 거야.`);
    await tagsRm();
    await flyTo(ids('c', 60, 63), CX[0], LY.r1);
    await writeDigit('r1p0', 0, LY.r1, '3', 'b');
    const rods = ids('rd', 0, 6); redden(rods); await wait(350);
    SFX.ppyong(); await flyTo(rods, CX[1], LY.k1, 850, 50);
    burst(CX[1], LY.k1); SFX.pop();
    await writeCarry('k1', 1, LY.k1, '6');
    await setEq('63 → <b class=b>3</b> 쓰고 <b class=r>6</b> 받아올림');
  },
  async()=>{
    say(`이제 십의 자리 <b>3 × 7</b>. 이 3은 사실 <b>30</b>이라서 30 × 7 = 210, 십막대 <b>21개</b>야. 받아올린 <b class=r>6개</b>도 더해 주자!`);
    hl(['a1','b0','k1'], 'b');
    await setEq('3 × 7 = 21');
    const rs = [];
    for (let i=0;i<21;i++) rs.push(blk('rod', 80+Math.floor(i/3)*62+(i%3)*16, 300, 't'+i));
    SFX.pop(); await popIn(rs, 35);
    await wait(300); SFX.ppyong();
    await all([0,1,2,3,4,5].map(k=>emerge('rod', 't'+(21+k), CX[1]-6, LY.k1-60, 530+k*16, 300, k*90)));
    await setEq('21 + <span class=r>6</span> = 27');
    await tag('십막대 모두 27개', ids('t',0,27), 440);
  },
  async()=>{
    say(`십막대 <b>10개</b>는 <b>백판 1개</b>! 백판 2개, 십막대 7개가 돼. <b>7</b>은 십의 자리, <b>2</b>는 백의 자리에 쓰자.`);
    await tagsRm();
    const f1 = await rodsToFlat(ids('t', 0, 10), 80, 300, 'f1');
    const f2 = await rodsToFlat(ids('t', 10, 20), 220, 300, 'f2');
    const left = ids('t', 20, 27);
    await slideTo(left, 380, 300);
    await tags([['백판 2개 = 200', [f1, f2], 440], ['십막대 7개 = 70', left, 440]]);
    await wait(900); await tagsRm();
    await flyTo(left, CX[1], LY.r1); await writeDigit('r1p1', 1, LY.r1, '7', 'b');
    await flyTo([f1, f2], CX[2], LY.r1); await writeDigit('r1p2', 2, LY.r1, '2', 'b');
    clearHl();
    await slashL('k1');
    await rowLbl('rl1', LY.r1, '39×7', 'b');
    await setPart('b', '39 × 7 = 273');
    await setEq('39 × 7 = <span class=b>273</span>');
  },
  async()=>{
    say(`이번엔 <b class=g>초록 조각 39 × 20</b>! 20은 2의 10배라서 답의 <b>일의 자리는 0</b>이야. 0을 먼저 쓰고, <b>한 칸 왼쪽</b>부터 시작!`);
    await dimParts('g');
    hl(['b1'], 'g');
    await setEq('39 × 20 = 39 × 2 × <span class=g>10</span>');
    await zeroDrop('r2p0', 0, LY.r2);
    const s = mk('slot', CX[1], LY.r2, '', 'slot'); s.style.opacity = 0;
    await A(s, [{opacity:0,transform:'scale(1.3)'},{opacity:1,transform:'scale(1)'}], 400);
    fire(A(s, [{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}], 1400));
  },
  async()=>{
    say(`<b>9 × 2 = 18</b>. 사실은 9 × 20 = 180이니까 십막대 <b>18개</b>! 10개는 백판으로 바꾸고, <b>8</b>은 쓰고, <b class=r>1</b>은 받아올려.`);
    fire(fadeRm([$('slot')]));
    hl(['a0','b1'], 'g');
    await setEq('9 × 2 = 18');
    const rs = [];
    for (let i=0;i<18;i++) rs.push(blk('rod', 80+Math.floor(i/9)*158+(i%9)*16, 300, 'u'+i));
    SFX.pop(); await popIn(rs, 30);
    await wait(300);
    const fl = await rodsToFlat(ids('u', 0, 10), 80, 300, 'uf');
    const left = ids('u', 10, 18);
    await slideTo(left, 240, 300);
    await tags([['백판 1개', [fl], 440], ['십막대 8개', left, 440]]);
    await wait(700); await tagsRm();
    await flyTo(left, CX[1], LY.r2); await writeDigit('r2p1', 1, LY.r2, '8', 'g');
    redden([fl]); await wait(300);
    SFX.ppyong(); await flyTo([fl], CX[1], LY.k2, 850);
    burst(CX[1], LY.k2); SFX.pop();
    await writeCarry('k2', 1, LY.k2, '1');
  },
  async()=>{
    say(`<b>3 × 2 = 6</b>. 30 × 20 = 600이라서 백판 <b>6개</b>! 받아올린 <b class=r>1</b>을 더하면 <b>7</b>. 그래서 39 × 20 = <b class=g>780</b>!`);
    hl(['a1','b1','k2'], 'g');
    await setEq('3 × 2 = 6');
    const fs = [];
    for (let i=0;i<6;i++) fs.push(blk('flat', 80+(i%3)*128, 280+Math.floor(i/3)*128, 'v'+i));
    SFX.pop(); await popIn(fs, 90, 320);
    await wait(250);
    SFX.ppyong(); const rf = await emerge('flat', 'v6', CX[1]-60, LY.k2-60, 480, 280);
    await setEq('6 + <span class=r>1</span> = 7');
    await tag('백판 모두 7개', [rf], 420);
    await wait(800); await tagsRm();
    await flyTo([...fs, rf], CX[2], LY.r2, 800, 40); await writeDigit('r2p2', 2, LY.r2, '7', 'g');
    clearHl();
    await slashL('k2');
    await rowLbl('rl2', LY.r2, '39×20', 'g');
    await setPart('g', '39 × 20 = 780');
    await setEq('39 × 20 = <span class=g>780</span>');
  },
  async()=>{
    say(`이제 두 조각을 더하면 끝! <b class=b>273</b> + <b class=g>780</b>. 덧셈도 <b>일의 자리부터</b>: 3 + 0 = <b class=s>3</b>`);
    await dimParts(null);
    await drawLine('L2', LY.L2);
    await setEq('<span class=b>273</span> + <span class=g>780</span>');
    hl(['r1p0','r2p0'], 's');
    await wait(400);
    await writeDigit('sp0', 0, LY.S, '3', 's');
  },
  async()=>{
    say(`십의 자리: <b>7 + 8 = 15</b>. 십막대가 10개를 넘었네? <b class=r>또 받아올림!</b> 5는 쓰고 1은 백의 자리로.`);
    hl(['r1p1','r2p1'], 's');
    await setEq('7 + 8 = 15');
    const rs = [];
    for (let i=0;i<15;i++) rs.push(blk('rod', i<7 ? 80+i*16 : 222+(i-7)*16, 300, 'w'+i));
    SFX.pop(); await popIn(rs, 35);
    await tags([['7개', ids('w',0,7), 440], ['8개', ids('w',7,15), 440]]);
    await wait(500); await tagsRm();
    const fl = await rodsToFlat(ids('w', 0, 10), 80, 300, 'wf');
    const left = ids('w', 10, 15);
    await slideTo(left, 240, 300);
    await tags([['백판 1개', [fl], 440], ['십막대 5개', left, 440]]);
    await wait(600); await tagsRm();
    await flyTo(left, CX[1], LY.S); await writeDigit('sp1', 1, LY.S, '5', 's');
    redden([fl]); await wait(300);
    SFX.ppyong(); await flyTo([fl], CX[2], LY.ac, 850);
    burst(CX[2], LY.ac); SFX.pop();
    await writeCarry('k3', 2, LY.ac, '1', true);
  },
  async()=>{
    say(`백의 자리: 2 + 7 + <b class=r>1</b> = <b>10</b>. 백판 10개는 <b>천 모형 1개</b>로 변신! 백판이 하나도 안 남으니 백의 자리는 <b class=s>0</b>.`);
    hl(['r1p2','r2p2','k3'], 's');
    await setEq('2 + 7 + <span class=r>1</span> = 10');
    const pos = i => [80+(i%5)*128, 280+Math.floor(i/5)*130];
    const fs = [];
    for (let i=0;i<9;i++){ const [x,y] = pos(i); fs.push(blk('flat', x, y, 'x'+i)); }
    SFX.pop(); await popIn(fs, 70, 300);
    SFX.ppyong(); const [rx, ry] = pos(9);
    fs.push(await emerge('flat', 'x9', CX[2]-60, LY.ac-60, rx, ry));
    await wait(500);
    await all(fs.map((f,k)=>A(f, {left:(290+k*3)+'px', top:(330-k*3)+'px'}, 650, {delay:k*60})));
    fs.forEach(f=>f.remove());
    const cube = blk('thou', 285, 300, 'cube'); cube.style.opacity = 1;
    SFX.boom(); burst(360, 375, '#FF8A3D', 18);
    await A(cube, FLASH, 400);
    await tag('천 모형 1개 = 1000', [cube], 470);
    await writeDigit('sp2', 2, LY.S, '0', 's');
    await wait(500); await tagsRm();
    redden([cube]); await wait(300);
    SFX.ppyong(); await flyTo([cube], CX[3], LY.ac, 850);
    burst(CX[3], LY.ac); SFX.pop();
    await writeCarry('k4', 3, LY.ac, '1', true);
  },
  async()=>{
    say(`천의 자리: 받아올린 <b class=r>1</b>을 그대로 내려 써요. <b>39 × 27 = <span class=s>1053</span></b>! {n} 대장님 최고! 🎉`);
    hl(['k4'], 's');
    await wait(300);
    await writeDigit('sp3', 3, LY.S, '1', 's');
    clearHl();
    SFX.fanfare(); confetti();
    for (const id of ['sp3','sp2','sp1','sp0']) await pulse($(id), 1.3, 300);
    await setEq('39 × 27 = <span class=s>1053</span> 🎉');
  },
  async()=>{
    say(`<b>한눈에 정리!</b> 파란 조각 <b class=b>273</b>, 초록 조각 <b class=g>780</b>, 합치면 <b class=s>1053</b>. 그림도, 식도, 세로셈도 모두 <b>같은 이야기</b>야.`);
    await fadeRm([$('eq')]);
    await toFull();
    const f = mk('formula', 30, 458, `39 × 27 = <span class=b id=fb1>39 × 7</span> + <span class=g id=fg1>39 × 20</span><br>= <span class=b id=fb2>273</span> + <span class=g id=fg2>780</span> = <span class=s id=fs>1053</span>`, 'formula');
    await showEl(f);
    const [b1, b2, b3] = await bands([['b', LY.r1], ['g', LY.r2], ['s', LY.S]]);
    await wait(400);
    SFX.pop(); await all([pulse($('pB'), 1.05, 700), pulse($('fb1')), pulse($('fb2')), pulse(b1, 1.06, 700)]);
    SFX.pop(); await all([pulse($('pG'), 1.04, 700), pulse($('fg1')), pulse($('fg2')), pulse(b2, 1.06, 700)]);
    SFX.ding(); await all([pulse($('fs'), 1.25, 700), pulse(b3, 1.06, 700)]);
  },
  ],
};

/* ---------- 섬 5: 훈련 섬 (공책에 쓰는 순서) ---------- */
let LB = null;
const L5S = () => solutionStages(46, 28).S;
function l5Base(){
  if (LB){ LB.el.remove(); LB.destroy(); }
  LB = new Board({pen:false, note:'📒 공책 칸 = 이 칸 하나에 숫자 하나'});
  LB.setProblem(46, 28);
  LB.layer.querySelectorAll('.bd, .bline').forEach(e=>e.style.opacity=0);
  mk('title', 800, 100, '📒 공책 쓰기 약속', 'chkT').style.width = '440px';
}
async function chk(i, html){
  const e = mk('', 820, 160+i*86, `<span style="color:var(--green);font-size:30px">✔</span> ${html}`, 'chk'+i);
  css(e, {width:'410px', fontSize:'21px', fontWeight:'700', lineHeight:'1.4'}); SFX.pop(); await showEl(e, 350);
}
const L5 = {
  base: l5Base, endLabel: '훈련 시작 ▶',
  tips: [
    '공책에 쓸 때 가장 헷갈리는 게 뭐야?',
    '숫자를 칸에 맞춰 쓰면 무엇이 좋을까?',
    '받아올림 숫자를 다 쓰고 빗금을 치는 이유는?',
    '두 번째 줄에 0을 쓰는 걸 잊으면 어떻게 될까?',
    '더할 때 받아올림은 어디에 써 둘까?',
    '어림한 답과 진짜 답이 많이 다르면 어떻게 할까?',
  ],
  steps: [
  async()=>{
    say(`<b>훈련 섬</b>에 온 걸 환영해, {n} 대장님! 이제 <b>공책에 직접</b> 푸는 연습을 할 거야. 먼저 공책에 쓰는 순서를 볼까?`);
    await showEl($('chkT'));
  },
  async()=>{
    say(`① <b>한 칸에 숫자 하나</b>씩, 자리를 맞춰서 써요. 46 × 28을 세로로!`);
    const els = [...LB.layer.querySelectorAll('.bd, .bline')];
    SFX.pop(); await all(els.map((e,i)=>A(e, POP, 360, {delay:i*120})));
    await chk(0, '한 칸에 숫자 하나, <b>자리 맞춰</b> 쓰기');
  },
  async()=>{
    say(`② 46 × 8 먼저. 6 × 8 = 48 → 8을 쓰고 <b class=r>4</b>는 작게 받아올림! 4 × 8 = 32에 4를 더해 36 → <b class=b>368</b>`);
    await LB.reveal(L5S().slice(0, 2), 500);
    await chk(1, '받아올림은 <b class=r>작게</b>, 다 쓰면 <b class=r>빗금</b>');
  },
  async()=>{
    say(`③ 46 × 20. 일의 자리에 <b>0</b>을 먼저 쓰고 한 칸 왼쪽부터! 6 × 2 = 12, 4 × 2 = 8에 1을 더해 9 → <b class=g>920</b>`);
    await LB.reveal(L5S().slice(2, 5), 500);
    await chk(2, '두 번째 줄은 <b class=g>0 먼저</b>, 한 칸 왼쪽부터');
  },
  async()=>{
    say(`④ 두 줄을 더해요. 368 + 920. 십의 자리 6 + 2 = 8, 백의 자리 3 + 9 = 12 → 받아올림! 답은 <b class=s>1288</b>`);
    await LB.reveal(L5S().slice(5), 450);
    await chk(3, '더할 때도 <b>받아올림</b> 확인');
  },
  async()=>{
    say(`⑤ 마지막으로 <b>어림</b>해서 확인! 46은 약 50, 28은 약 30 → 50 × 30 = 1500. 1288이면 <b>그럴듯해!</b>`);
    await chk(4, '<b>어림</b>으로 확인 (50 × 30 = 1500)');
    SFX.ding();
  },
  ],
};

const LESSONS = {1:L1, 2:L2, 3:L3, 4:L4, 5:L5};
