// 과학 놀이터 오프라인 저장소 (tools/make-sw.py 가 만든 파일)
const VERSION = 'b3fa8758b8';
const CACHE = 'science-pwa-v1';
const FILES = ["./", "index.html", "manifest.webmanifest", "games/butterfly.html", "games/magnet.html", "games/river.html", "games/sound.html", "font/GowunBatang-400.woff2", "font/GowunBatang-700.woff2", "font/GowunDodum-400.woff2", "font/IBMPlexSansKR-400.woff2", "font/IBMPlexSansKR-500.woff2", "font/IBMPlexSansKR-600.woff2", "font/NotoSansKR-400.woff2", "font/NotoSansKR-500.woff2", "font/NotoSansKR-700.woff2", "font/fonts.css", "img/butterfly.jpg", "img/magnet.jpg", "img/river.jpg", "img/sound.jpg", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 판이 바뀌었으면 처음부터 다시 받는다
    const stamp = await c.match('__version__');
    const old = stamp ? await stamp.text() : null;
    let done = 0;
    for (const f of FILES) {
      if (old === VERSION && await c.match(f)) { done++; continue; }
      const r = await fetch(new Request(f, { cache: 'reload' }));
      if (!r.ok) throw new Error('fetch failed ' + f);
      await c.put(f, r);
      done++;
      const cl = await self.clients.matchAll({ includeUncontrolled: true });
      cl.forEach(x => x.postMessage({ type: 'progress', done, total: FILES.length }));
    }
    await c.put('__version__', new Response(VERSION));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    const cl = await self.clients.matchAll({ includeUncontrolled: true });
    cl.forEach(x => x.postMessage({ type: 'ready' }));
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); }
    catch (err) {
      if (req.mode === 'navigate') return (await c.match('index.html')) || Response.error();
      return Response.error();
    }
  })());
});
