// Builds public/deck/index.html (served at /deck) from deck/src/deck.json + deck/src/slides/*.html,
// the Claude Slides artifact format. Run from the repo root: node deck/build.mjs
// Also writes src/lib/deck-slides.json (slide titles) for the admin page's Back/Next bar.
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'deck/src'
const deck = JSON.parse(readFileSync(`${SRC}/deck.json`, 'utf8'))
// Images a slide references as /_blob/<id> map to files under public/deck/assets.
const ASSETS = {}
// The live audience screen (/screen) is shown full-bleed right after these slides.
const LIVE_AFTER = {
  how: 'LIVE: the audience screen. Phase 1 vote bars; admin → 2 · Feature requests and Add all; then 3 · Brief locked and Copy box 1 into Terminal. After the build: /exit, Copy box 2, then admin → 4 · It\'s live for the app QR.',
}
const ICONS = {
  Book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 1 2-2h13"/><path d="M9 7h6"/>',
  Code: '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 4-4 16"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  Cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 .4-9 7 7 0 0 0-13.4 2A4 4 0 0 0 6 19z"/>',
  Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  Database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  Lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  Key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  Lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14a6.5 6.5 0 1 0-6.2 0c.7.5 1.1 1.3 1.1 2.1V18h4v-1.9c0-.8.4-1.6 1.1-2.1z"/>',
  Verified: '<path d="M12 2 15 5l4 .5.5 4 3 2.5-3 2.5-.5 4-4 .5-3 3-3-3-4-.5-.5-4L1 12l3-2.5.5-4L8.5 5z"/><path d="m9 12 2 2 4-4"/>',
  Activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  Warning: '<path d="m10.3 3.9-8.5 14.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Lightning: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  Chart: '<path d="M3 3v18h18"/><path d="M8 17v-6"/><path d="M13 17V7"/><path d="M18 17v-4"/>',
  Wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  CheckCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  Tool: '<path d="m15 12-8.4 8.4a2.1 2.1 0 0 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.9-1.9a2 2 0 0 1-.6-1.4V7l-2.3-2.3A6 6 0 0 0 12.5 3H9l.9.8A6.2 6.2 0 0 1 12 8.4V10l2 2h1.2a2 2 0 0 1 1.4.6l1.9 1.9"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
}
function icon(name, style) {
  if (!ICONS[name]) throw new Error('no drawing for icon ' + name)
  return `<svg class="x-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${style}">${ICONS[name]}</svg>`
}
const strip = (s) => s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

let slides = ''
const notes = []
const titles = []
for (const id of deck.order) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error('bad slide id ' + id)
  let html = readFileSync(`${SRC}/slides/${id}.html`, 'utf8')
  html = html.replace(/\/?_blob\/([0-9a-f]{32})/g, (m, h) => { if (!ASSETS[h]) throw new Error('unmapped asset ' + h); return ASSETS[h] })
  const aside = html.match(/<aside>([\s\S]*?)<\/aside>/)
  notes.push(aside ? aside[1].trim() : '')
  html = html.replace(/<aside>[\s\S]*?<\/aside>/, '')
  const heading = html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/)
  titles.push(heading ? strip(heading[1]) : id === 'host' ? 'Opener video' : id)
  html = html.replace(/<img ([^>]*?)data-video="([^"]+)"([^>]*?)>/g, (m, a, src, b) => {
    const attrs = a + b
    const poster = (attrs.match(/src="([^"]+)"/) || [])[1] || ''
    const style = (attrs.match(/style="([^"]+)"/) || [])[1] || ''
    const alt = (attrs.match(/alt="([^"]*)"/) || [])[1] || ''
    const sound = /data-video-sound="on"/.test(attrs)
    return `<video class="deck-video" src="${src}" poster="${poster}" preload="auto" playsinline ${sound ? '' : 'muted'} aria-label="${alt}" style="${style};display:block;background:#000"></video>`
  })
  html = html.replace(/<x-icon name="([^"]+)" style="([^"]*)"><\/x-icon>/g, (m, n, st) => icon(n, st))
  html = html.replace(/<x-shape kind="arrow-right" style="([^"]*)"><\/x-shape>/g, (m, st) => `<div class="x-arrow" style="${st}"></div>`)
  if (/<x-(icon|shape|embed|connector)/.test(html)) throw new Error('unsupported element left in ' + id)
  slides += html.trim() + '\n'
  if (LIVE_AFTER[id]) {
    slides += `<section data-live="1" style="background:#05080f"></section>\n`
    notes.push(LIVE_AFTER[id])
    titles.push('LIVE screen')
  }
}
const faces = Object.values(deck.faces).map((f) => `<link rel="stylesheet" href="${f.href}">`).join('\n')
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${deck.title}</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
${faces}
<style>
  html,body{margin:0;height:100%;background:#05080f;color:#f4f7fb;overflow:hidden;font-family:'IBM Plex Sans',Arial,sans-serif}
  #viewport{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
  #stage{position:relative;width:1920px;height:1080px;transform-origin:center center;flex:none}
  #stage>section{position:absolute;left:0;top:0;width:1920px;height:1080px;box-sizing:border-box;overflow:hidden;opacity:0;transition:opacity .35s ease;pointer-events:none}
  #stage>section.active{opacity:1;pointer-events:auto}
  #stage>section>*{position:relative}
  #stage>section>[style*="position:absolute"],#stage>section>[style*="position: absolute"]{position:absolute}
  section h1,section h2,section h3,section p,section ul,section ol{margin:0}
  section h1{font-size:96px;font-weight:600;line-height:1.1}
  section h2{font-size:64px;font-weight:600;line-height:1.15}
  section h3{font-size:44px;font-weight:600;line-height:1.2}
  section p{font-size:32px;font-weight:400;line-height:1.4}
  section ul{padding-left:1.1em}
  section li{margin:0}
  section img{display:block}
  .x-arrow{clip-path:polygon(0 30%,60% 30%,60% 0,100% 50%,60% 100%,60% 70%,0 70%)}
  .x-icon{display:block;flex:none}
  #live{position:absolute;left:0;top:0;width:1920px;height:1080px;border:0;background:#05080f;visibility:hidden;z-index:5}
  #live.on{visibility:visible}
  #hud{position:fixed;right:16px;bottom:12px;font:14px/1 'IBM Plex Sans',Arial,sans-serif;color:#7c8ba3;opacity:.7;user-select:none;z-index:10}
  #notes{position:fixed;left:0;right:0;bottom:0;max-height:34vh;overflow:auto;background:rgba(5,8,15,.94);color:#e2e8f0;padding:16px 24px;font:18px/1.5 'IBM Plex Sans',Arial,sans-serif;border-top:1px solid #1e2a42;display:none;z-index:10}
  #notes.show{display:block}
  #playhint{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(10,17,32,.9);border:2px solid #38bdf8;color:#f4f7fb;border-radius:999px;padding:14px 28px;font:600 20px 'IBM Plex Sans',Arial,sans-serif;display:none;cursor:pointer;z-index:10}
  #playhint.show{display:block}
</style>
</head>
<body>
<div id="viewport"><div id="stage">
${slides}<iframe id="live" src="/screen" allow="clipboard-write" title="Live audience screen"></iframe>
</div></div>
<div id="hud"></div>
<div id="notes"></div>
<button id="playhint" type="button">Click to play with sound</button>
<script>
(() => {
  const NOTES = ${JSON.stringify(notes)};
  const stage = document.getElementById('stage');
  const live = document.getElementById('live');
  const sections = Array.from(stage.querySelectorAll(':scope > section'));
  const hud = document.getElementById('hud'), notes = document.getElementById('notes'), hint = document.getElementById('playhint');
  let i = 0, remote = null, online = false, lastLocal = 0;
  let key = ''; try { key = localStorage.getItem('tct-admin-key') || '' } catch (e) {}
  let anon = ''; try { anon = localStorage.getItem('tct-anon') || '' } catch (e) {}
  if (!anon) anon = 'deck-' + Math.random().toString(36).slice(2, 12);
  function fit(){ const s = Math.min(innerWidth/1920, innerHeight/1080); stage.style.transform = 'scale(' + s + ')'; }
  function stopVideos(){ sections.forEach(sec => sec.querySelectorAll('video').forEach(v => { v.pause(); try { v.currentTime = 0 } catch(e){} })); myStart = 0; }
  // Only one copy of the deck may have sound: hidden tabs never play, and when two deck tabs on this
  // site both start the video, the one you are looking at keeps playing and the others pause.
  const tabId = Math.random().toString(36).slice(2);
  const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('tct-deck-video') : null;
  let myStart = 0, other = null;
  function pauseAll(){ sections.forEach(sec => sec.querySelectorAll('video').forEach(v => v.pause())); hint.classList.remove('show'); myStart = 0; }
  // Does another tab's playing copy beat ours? The tab you are looking at wins; otherwise the copy that
  // started first keeps playing; an exact tie goes to the lower tab id.
  function otherWins(o){
    const me = document.hasFocus();
    if (o.focus !== me) return o.focus;
    if (o.start !== myStart) return o.start < myStart;
    return o.from < tabId;
  }
  sections.forEach(sec => sec.querySelectorAll('video').forEach(v => {
    let beat = 0;
    const announce = () => { if (!myStart) return; beat = Date.now(); if (bc) bc.postMessage({ t: 'playing', from: tabId, focus: document.hasFocus(), start: myStart }); };
    v.addEventListener('playing', () => {
      if (!myStart) myStart = Date.now();
      if (other && Date.now() - other.at < 5000 && otherWins(other)) { pauseAll(); return; }
      announce();
    });
    // Heartbeat while playing, so a closed or crashed tab stops counting after 5 s.
    v.addEventListener('timeupdate', () => { if (!v.paused && myStart && Date.now() - beat > 2000) announce(); });
    v.addEventListener('pause', () => { if (bc) bc.postMessage({ t: 'stopped', from: tabId }); });
  }));
  addEventListener('pagehide', () => { if (bc) bc.postMessage({ t: 'stopped', from: tabId }); });
  if (bc) bc.onmessage = (e) => {
    const d = e.data || {};
    if (d.from === tabId) return;
    if (d.t === 'stopped') { if (other && other.from === d.from) other = null; return; }
    if (d.t !== 'playing') return;
    other = { from: d.from, focus: d.focus, start: d.start, at: Date.now() };
    const playing = sections.some(sec => [...sec.querySelectorAll('video')].some(v => !v.paused));
    if (playing && myStart && otherWins(other)) pauseAll();
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') pauseAll(); });
  function playVideos(sec){
    if (document.visibilityState !== 'visible') return;
    sec.querySelectorAll('video').forEach(v => {
      v.muted = false;
      const p = v.play();
      // A late answer from a slide we already left (or a play cut short by our own pause) is ignored.
      const here = () => sections[i] === sec;
      if (p && p.catch) p.catch((err) => {
        if (!here() || (err && err.name === 'AbortError')) return;
        v.muted = true;
        v.play().then(() => { if (here()) hint.classList.add('show'); else v.pause(); }).catch(() => { if (here()) hint.classList.add('show'); });
      });
    });
  }
  function paintHud(){ hud.textContent = (i + 1) + ' / ' + sections.length + (online ? '  ●' : '  ○'); }
  function show(n, report){
    n = Math.max(0, Math.min(sections.length - 1, n));
    const changed = n !== i || !sections[n].classList.contains('active');
    i = n;
    if (changed) {
      stopVideos();
      sections.forEach((s, k) => s.classList.toggle('active', k === i));
      live.classList.toggle('on', sections[i].hasAttribute('data-live'));
      notes.textContent = NOTES[i] || '';
      hint.classList.remove('show');
      playVideos(sections[i]);
      history.replaceState(null, '', '#' + (i + 1));
    }
    paintHud();
    if (report) lastLocal = Date.now();
    if (report && key) {
      remote = i;
      fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json', 'x-anon': anon, 'x-admin-key': key }, body: JSON.stringify({ action: 'slide', to: i }) }).catch(() => {});
    }
  }
  function onKey(e){
    if (['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(e.key)) { e.preventDefault(); show(i + 1, true); }
    else if (['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)) { e.preventDefault(); show(i - 1, true); }
    else if (e.key === 'Home') show(0, true); else if (e.key === 'End') show(sections.length - 1, true);
    else if (e.key.toLowerCase() === 'n') notes.classList.toggle('show');
    else if (e.key.toLowerCase() === 'f') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (e.key.toLowerCase() === 'r') { sections[i].querySelectorAll('video').forEach(v => { v.currentTime = 0; v.muted = false; v.play(); }); }
  }
  // Keys pressed while the live screen has focus (after clicking Copy) still drive the deck.
  // Hook it now, on every load, and re-check every 2 s, so a fast-loading frame is never missed.
  function hookLive(){
    try {
      const w = live.contentWindow;
      if (w && w.document && w.document.readyState !== 'loading' && !w.__deckKeys) {
        w.__deckKeys = true;
        w.addEventListener('keydown', e => {
          if (['ArrowRight','ArrowDown','PageDown','ArrowLeft','ArrowUp','PageUp'].includes(e.key)) onKey(e);
        });
      }
    } catch (err) {}
  }
  live.addEventListener('load', hookLive); hookLive(); setInterval(hookLive, 2000);
  hint.addEventListener('click', () => { hint.classList.remove('show'); sections[i].querySelectorAll('video').forEach(v => { v.muted = false; v.currentTime = 0; v.play(); }); });
  addEventListener('resize', fit);
  addEventListener('keydown', onKey);
  document.getElementById('viewport').addEventListener('click', e => {
    if (e.target.closest('video') || e.target.closest('a') || e.target.closest('#playhint') || e.target.closest('#live')) return;
    show(e.clientX > innerWidth / 2 ? i + 1 : i - 1, true);
  });
  // Phone remote: the admin page's Back/Next set settings.slide; the deck follows it.
  async function poll(){
    const asked = Date.now();
    try {
      const r = await fetch('/api/state', { headers: { 'x-anon': anon }, cache: 'no-store' });
      const s = await r.json();
      online = r.ok;
      const n = s && s.settings && typeof s.settings.slide === 'number' ? s.settings.slide : null;
      // Ignore an answer that was already on its way before the last local move (it is stale).
      if (n !== null && n !== remote && asked > lastLocal) { remote = n; if (n !== i) show(n, false); }
    } catch (e) { online = false; }
    paintHud();
    setTimeout(poll, 1000);
  }
  fit();
  const h = parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(h) && h >= 1 ? h - 1 : 0, false);
  sections[i].classList.add('active');
  poll();
})();
</script>
</body>
</html>
`
writeFileSync('public/deck/index.html', page)
writeFileSync('src/lib/deck-slides.json', JSON.stringify(titles, null, 1) + '\n')
console.log('built public/deck/index.html', page.length, 'bytes,', titles.length, 'slides:', titles.map((t, k) => `${k + 1}. ${t}`).join(' | '))
