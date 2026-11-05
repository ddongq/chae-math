/* =========================================================
   audit.js — 화면 정렬 자동 검사 (개발·점검용)
   주소 끝에 ?audit 을 붙여 열고, 콘솔에서 layoutAudit() 실행
   검사 항목
   1. 칸 정렬   : 공책 보드의 숫자 네모가 칸 가운데에 있는가 (±0.75px)
   2. 글자 넘침 : 글상자·버튼·말풍선 안에서 글자가 넘치지 않는가
   3. 겹침      : 글상자·버튼·라벨끼리, 또는 글상자와 블록이 겹치지 않는가
   4. 경계 밖   : 글상자가 자기 패널 밖으로 나가지 않는가
   ========================================================= */
function sRect(el){
  const sr = stage.getBoundingClientRect(), k = sr.width/1280, r = el.getBoundingClientRect();
  return {l:(r.left-sr.left)/k, t:(r.top-sr.top)/k, r:(r.right-sr.left)/k, b:(r.bottom-sr.top)/k};
}
function shown(el){
  if (!el.isConnected || !el.getClientRects().length) return false;
  for (let e = el; e && e !== stage; e = e.parentElement){
    const cs = getComputedStyle(e);
    if (cs.display==='none' || cs.visibility==='hidden' || parseFloat(cs.opacity) < .05) return false;
  }
  return true;
}
const descr = el => (el.id ? '#'+el.id : '.'+[...el.classList].join('.')) + ` "${(el.textContent||'').trim().slice(0,18)}"`;
const overlap = (a, b) => Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l)) * Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t));
const PANELS = () => [...document.querySelectorAll('.panel, .sea, .ovbg, .parent')].filter(shown).map(p=>({el:p, r:sRect(p)}));

function layoutAudit(){
  const out = [], add = (type, el, msg) => out.push(`[${type}] ${descr(el)} ${msg}`);

  // 1. 칸 정렬
  document.querySelectorAll('.board').forEach(b=>{
    const br = sRect(b);
    b.querySelectorAll('.bd').forEach(d=>{
      if (!shown(d)) return;
      const r = sRect(d), cx = (r.l+r.r)/2 - br.l, cy = (r.t+r.b)/2 - br.t;
      const dx = ((cx - GX0) % CELL) - CELL/2, dy = ((cy - GY0) % CELL) - CELL/2;
      if (Math.abs(dx) > .75 || Math.abs(dy) > .75) add('칸 정렬', d, `칸 가운데에서 가로 ${dx.toFixed(1)}px, 세로 ${dy.toFixed(1)}px`);
    });
  });

  // 2. 글자 넘침
  const bub = $('bubble');
  if (bub.firstElementChild && bub.firstElementChild.offsetHeight > bub.clientHeight - 16) add('글자 넘침', bub, '말풍선 높이를 넘음');
  document.querySelectorAll('.hcard, .chip, .gcell .ga, .echo button, .nitem, #eq, .tag, .disp, .pill, .hbtn, .choice, .rowlbl, #tabs button, .keys button, .status, .ncard, .cbtn').forEach(e=>{
    if (!shown(e)) return;
    if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) add('글자 넘침', e, `${e.scrollWidth}×${e.scrollHeight} > ${e.clientWidth}×${e.clientHeight}`);
  });

  // 3. 겹침
  const TXT = [...document.querySelectorAll('.tag:not(.cnt), .rowlbl, #eq, .formula, .card, .title, .mini, .choice, .bnote, .status, .disp, .keys, .prog, #bubble, #ctrls > *, .ptools, .trophies, .lineq, .chk, .colLbl, .qtext, .qpaper, .hcard, .chip, .gcell, .ehint, .echo, .ecmp, .esum, .expcard, .advice, .anbox, .ascore, .hhead, .tower, .isl')].filter(shown);
  const BLK = [...document.querySelectorAll('.cube, .rod, .flat, .thou, .box, .bag')].filter(shown);
  const R = new Map([...TXT, ...BLK].map(e=>[e, sRect(e)]));
  for (let i=0;i<TXT.length;i++){
    for (let j=i+1;j<TXT.length;j++){
      const a = TXT[i], b = TXT[j];
      if (a.contains(b) || b.contains(a)) continue;
      if (overlap(R.get(a), R.get(b)) > 4) add('겹침', a, `↔ ${descr(b)}`);
    }
    if (/tag|rowlbl|formula|card|title|lineq/.test(TXT[i].className) || TXT[i].id==='eq')
      for (const k of BLK) if (overlap(R.get(TXT[i]), R.get(k)) > 4){ add('블록 가림', TXT[i], `↔ ${descr(k)}`); break; }
  }

  // 4. 경계 밖 (글상자는 자기가 놓인 패널 안에 다 들어와야 함)
  const ps = PANELS();
  document.querySelectorAll('#fx .tag, #fx .rowlbl, #fx .formula, #fx .card, #fx .title, #fx .lineq, #fx #eq, .bnote').forEach(e=>{
    if (!shown(e)) return;
    const r = sRect(e), cx = (r.l+r.r)/2, cy = (r.t+r.b)/2;
    const p = ps.find(p=>cx>=p.r.l && cx<=p.r.r && cy>=p.r.t && cy<=p.r.b);
    if (!p) { add('경계 밖', e, '어느 패널에도 속하지 않음'); return; }
    if (r.l < p.r.l-1 || r.r > p.r.r+1 || r.t < p.r.t-1 || r.b > p.r.b+1) add('경계 밖', e, `패널(${Math.round(p.r.l)}~${Math.round(p.r.r)}) 밖으로 나감 ${Math.round(r.l)}~${Math.round(r.r)}`);
  });
  return [...new Set(out)];
}
