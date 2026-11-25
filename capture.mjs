// capture.mjs — 4-shot capture + checks for the screenshot-first starter kit.
// Modelled on the cooking v3 playtest-v7.mjs pattern (Node 24 built-in
// WebSocket + headless Chromium over CDP). No network: game/ is served from
// localhost and three.js is vendored. Run: node capture.mjs
// Output: screenshots/0-cover.jpg, 1-night.jpg, 2-proof.jpg, 3-title.jpg,
// screenshots/contact-sheet.jpg, screenshots/checks.json
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8331;
const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome';
const BASE = `http://127.0.0.1:${PORT}/game/index.html`;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const file = path.join(ROOT, url);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kitcap-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--use-gl=angle', '--use-angle=swiftshader',
    '--window-size=1280,993', '--hide-scrollbars',
    `--user-data-dir=${profile}`, '--remote-debugging-port=9224',
    '--enable-logging=stderr', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let chromeLog = '';
  chrome.stderr.on('data', (d) => { chromeLog += d.toString(); });
  const checks = {};
  const check = (name, ok, detail = '') => {
    checks[name] = { pass: !!ok, detail: String(detail).slice(0, 300) };
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  };
  const failedRequests = [];
  try {
    let targets = null;
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      try { const r = await fetch('http://127.0.0.1:9224/json/list'); targets = await r.json(); if (targets?.length) break; } catch {}
    }
    if (!targets?.length) throw new Error('devtools never came up');
    const page = targets.find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
    const evalJs = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result?.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400));
      return r.result?.result?.value;
    };
    const shot = async (name) => {
      const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(r.result.data, 'base64'));
    };
    const key = async (type, k, code, kc) => send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: kc });
    const keyDown = (k, code, kc) => key('rawKeyDown', k, code, kc);
    const keyUp = (k, code, kc) => key('keyUp', k, code, kc);
    const press = async (k, code, kc) => { await keyDown(k, code, kc); await sleep(60); await keyUp(k, code, kc); };

    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    // Collect failed network requests + console errors via CDP events.
    const consoleErrors = [];
    const origOnMsg = ws.onmessage;
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.method === 'Network.loadingFailed') failedRequests.push(m.params?.errorText || 'failed');
      if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(JSON.stringify(m.params?.exceptionDetails).slice(0, 200));
      origOnMsg(ev);
    };
    await send('Page.navigate', { url: BASE });
    await sleep(4500);
    check('boot: game object + first frames rendered', await evalJs(`!!window.__game && window.__game.frames > 5`), `frames=${await evalJs('window.__game.frames')}`);
    check('boot: display font loaded', await evalJs(`document.fonts.check('16px "Bebas Neue"')`));

    const snapshot = () => evalJs(`(() => { const s = window.__game.save; return { cash: s.cash, mission: s.mission.current + '/' + s.mission.total, slot1: s.slots[0].completion, slot1cash: s.slots[0].cash }; })()`);
    const legibility = async (shotName) => evalJs(`(() => {
      const problems = [];
      const els = document.querySelectorAll('.panel, .count, .save, .mrow, .menu-btn, .gametitle, .ptitle, .radio, .veh, .obj, .next, .drow, .slot, .cash, .stars');
      for (const el of els) {
        if (getComputedStyle(el).display === 'none') continue;
        const scr = el.closest('.screen');
        if (scr && getComputedStyle(scr).display === 'none') continue;
        if (el.closest('#hud') && getComputedStyle(document.getElementById('hud')).display === 'none') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.left < -1 || r.top < -1 || r.right > 1281 || r.bottom > 801) problems.push('out-of-frame ' + (el.id || el.className));
        if (el.scrollWidth > el.clientWidth + 1) problems.push('h-overflow ' + (el.id || el.className) + ' ' + el.scrollWidth + '>' + el.clientWidth);
        if (el.scrollHeight > el.clientHeight + 1 && !el.closest('.proof-inner') && el.id !== 'proof-screen') problems.push('v-overflow ' + (el.id || el.className));
      }
      // Top-level HUD panels must not overlap each other.
      const tops = [...document.querySelectorAll('#hud > .panel')].filter((e) => getComputedStyle(e).display !== 'none');
      for (let i = 0; i < tops.length; i++) for (let j = i + 1; j < tops.length; j++) {
        const a = tops[i].getBoundingClientRect(), b = tops[j].getBoundingClientRect();
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)
          problems.push('overlap ' + tops[i].id + ' x ' + tops[j].id);
      }
      // Dispatch header count must equal visible rows.
      const hdr = document.getElementById('dispatch-header');
      if (hdr && getComputedStyle(document.getElementById('dispatch')).display !== 'none') {
        const n = parseInt((hdr.textContent.match(/(\\d+) UNITS/) || [])[1] || '0', 10);
        const rows = document.querySelectorAll('#dispatch-rows .drow').length;
        if (n !== rows) problems.push('dispatch count ' + n + ' != rows ' + rows);
      }
      return problems;
    })()`);

    // --- SHOT 0: cover — golden hour, in the car, chase ---
    await evalJs(`window.__kit.stageCover()`);
    await keyDown('w', 'KeyW', 87); await sleep(700); await keyUp('w', 'KeyW', 87);
    await sleep(800);
    const speed = await evalJs(`Math.round(window.__game.save.vehicle.speedKmh)`);
    check('play: car drives (W accelerates)', speed > 10, `speed=${speed} km/h`);
    await shot('0-cover.jpg');
    const snap0 = await snapshot();
    check('legibility: cover (no overflow / overlap / out-of-frame)', (await legibility('cover')).length === 0, JSON.stringify(await legibility('cover')));

    // --- SHOT 1: contrast — night, on foot ---
    await evalJs(`window.__kit.stageNight()`);
    await keyDown('w', 'KeyW', 87); await sleep(1200); await keyUp('w', 'KeyW', 87);
    await sleep(2500); // stand still — the idle bug shows up here
    const limb = await evalJs(`JSON.stringify({moving: window.__game.char.moving, legL: window.__game.char.legL.rotation.x, legR: window.__game.char.legR.rotation.x, armL: window.__game.char.armL.rotation.x})`);
    const l1 = JSON.parse(limb); await sleep(1500);
    const limb2 = await evalJs(`JSON.stringify({legL: window.__game.char.legL.rotation.x, legR: window.__game.char.legR.rotation.x, armL: window.__game.char.armL.rotation.x})`);
    const l2 = JSON.parse(limb2);
    check('idle: walk cycle stops when standing still', l1.moving === false && l1.legL === 0 && l1.legR === 0 && l1.legL === l2.legL && l1.armL === l2.armL, limb);
    check('idle: character has legs + shoes', await evalJs(`!!window.__game.char.legL && !!window.__game.char.shoeL`));
    await shot('1-night.jpg');
    const snap1 = await snapshot();
    check('legibility: night shot', (await legibility('night')).length === 0, JSON.stringify(await legibility('night')));

    // --- SHOT 2: proof screen ---
    await evalJs(`window.__kit.stageProof()`);
    await sleep(700);
    await shot('2-proof.jpg');
    const snap2 = await snapshot();
    check('legibility: proof screen', (await legibility('proof')).length === 0, JSON.stringify(await legibility('proof')));
    check('proof: count banner shows 6 totals', await evalJs(`document.querySelectorAll('.count b').length === 6`), await evalJs(`[...document.querySelectorAll('.count b')].map(e=>e.textContent).join(',')`));

    // --- SHOT 3: title screen ---
    await evalJs(`window.__kit.stageTitle()`);
    await sleep(700);
    await shot('3-title.jpg');
    const snap3 = await snapshot();
    check('legibility: title screen', (await legibility('title')).length === 0, JSON.stringify(await legibility('title')));
    check('title: Continue points at latest save', await evalJs(`document.getElementById('btn-continue').textContent.includes('Slot 1')`));

    // --- Consistency: same save state across all 4 shots ---
    const snaps = [snap0, snap1, snap2, snap3];
    const same = snaps.every((s) => s.cash === snap0.cash && s.mission === snap0.mission && s.slot1 === snap0.slot1 && s.slot1cash === snap0.slot1cash);
    check('consistency: cash / mission / Slot-1 % identical in all 4 shots', same, JSON.stringify(snaps));

    // --- Console / network ---
    await sleep(300);
    const errs = chromeLog.split('\n').filter((l) => /Uncaught|net::ERR_|Failed to load resource/.test(l));
    check('zero console errors', errs.length === 0 && consoleErrors.length === 0, [...errs.slice(0, 2), ...consoleErrors.slice(0, 2)].join(' | '));
    check('zero failed network requests', failedRequests.length === 0, failedRequests.slice(0, 3).join(' | '));

    // --- Files exist + non-trivial size ---
    for (const f of ['0-cover.jpg', '1-night.jpg', '2-proof.jpg', '3-title.jpg']) {
      const st = fs.statSync(path.join(OUT, f));
      check(`file: ${f} exists (${Math.round(st.size / 1024)} KB)`, st.size > 20000, `${st.size} bytes`);
    }

    // --- Contact sheet: cover large on top, 3 small below (PIL) ---
    const sheetOk = await new Promise((res) => {
      execFile('python3', ['-c', `
from PIL import Image
import os
out = r'${OUT}'
cover = Image.open(os.path.join(out, '0-cover.jpg')).convert('RGB').resize((1280, 800))
small = [Image.open(os.path.join(out, f)).convert('RGB').resize((416, 260)) for f in ['1-night.jpg', '2-proof.jpg', '3-title.jpg']]
sheet = Image.new('RGB', (1280, 800 + 8 + 260), (16, 16, 16))
sheet.paste(cover, (0, 0))
for i, im in enumerate(small):
    sheet.paste(im, (i * 424 + 4, 808))
sheet.save(os.path.join(out, 'contact-sheet.jpg'), quality=88)
print('sheet', sheet.size)
`], (err, stdout, stderr) => { if (err) console.log('sheet build failed:', stderr); else console.log(stdout.trim()); res(!err); });
    });
    check('contact sheet built', sheetOk && fs.existsSync(path.join(OUT, 'contact-sheet.jpg')));

    fs.writeFileSync(path.join(OUT, 'checks.json'), JSON.stringify({ shots: snaps, checks }, null, 2));
    const fails = Object.values(checks).filter((c) => !c.pass).length;
    console.log(`\n${fails} FAILURES`);
    if (fails) process.exitCode = 1;
  } finally {
    chrome.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
    server.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
