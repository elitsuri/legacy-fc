// End-to-end: React shell + game iframe + FastAPI. Usage: node e2e.cjs http://localhost:8000 [screenshotDir]
const puppeteer = require(process.env.PUPPETEER_PATH || 'puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8000', SHOTS = process.argv[3] || '.';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const R = []; const ok = (n, c, x) => R.push((c ? 'PASS ' : 'FAIL ') + n + (x != null ? ' — ' + x : ''));
const uname = 'e2e' + Date.now().toString(36);
async function game(p) { const f = p.frames().find((f) => f.url().includes('/game/')); return f; }
async function waitFor(fn, ms = 15000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true } catch (e) {} await wait(250) } return false }
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'], headless: true });
  const errs = [];
  const ctxA = await b.createBrowserContext(); const p = await ctxA.newPage(); await p.setViewport({ width: 1100, height: 860 });
  p.on('pageerror', (e) => errs.push('A ' + e.message));
  await p.goto(BASE + '/'); await wait(2500);
  let g = await game(p); ok('game iframe loads', !!g && await g.evaluate(() => typeof S === 'object'));
  ok('shell guest bar', (await p.content()).includes('אורח') || (await p.content()).includes('guest'));
  // start a career inside the game (as the coach dialog would)
  await g.evaluate(() => { title = false; initPlayer('Finisher', 'Showman'); S.ct = mkCt(mine(), .8); S.money = 4321; S.lvl = 6; save(); flush(1) });
  // register through the UI
  await p.click('button.primary'); await wait(400);
  await p.click('a.switch'); await wait(200);
  const inputs = await p.$$('.modal input');
  await inputs[0].type(uname); await inputs[1].type('Eli Cloud'); await inputs[2].type('secret-pass-1');
  await p.click('.modal button.primary');
  ok('register via UI', await waitFor(async () => (await p.$('button.acct')) !== null));
  ok('first career uploaded to cloud', await waitFor(async () => (await p.$eval('.pill', (e) => e.className)).includes('synced'), 20000));
  await p.screenshot({ path: SHOTS + '/e2e_shell.png' });
  const token = await p.evaluate(() => localStorage.getItem('lfc_token'));
  const cloud = await p.evaluate(async (t) => (await fetch('/api/saves/1', { headers: { Authorization: 'Bearer ' + t } })).json(), token);
  ok('cloud save contains the career', cloud.data && cloud.data.money === 4321 && cloud.summary.level === 6, `v${cloud.version} lvl ${cloud.summary && cloud.summary.level}`);
  // progress -> autosync (debounced 15s after the game's save event)
  g = await game(p); await g.evaluate(() => { S.money = 5555; save(); flush(1) });
  ok('progress syncs automatically', await waitFor(async () => (await p.evaluate(async (t) => (await fetch('/api/saves/1', { headers: { Authorization: 'Bearer ' + t } })).json(), token)).data.money === 5555, 30000));
  // leaderboard
  await p.click('.bar nav button'); await wait(1200);
  ok('leaderboard shows the player', (await p.content()).includes('Eli Cloud')); await p.screenshot({ path: SHOTS + '/e2e_board.png' }); await p.keyboard.press('Escape');
  // second device: fresh browser, sign in -> career downloaded
  const ctxB = await b.createBrowserContext(); const q = await ctxB.newPage(); await q.setViewport({ width: 1100, height: 860 }); q.on('pageerror', (e) => errs.push('B ' + e.message));
  await q.goto(BASE + '/'); await wait(2500);
  await q.click('button.primary'); await wait(300);
  const qi = await q.$$('.modal input'); await qi[0].type(uname); await qi[1].type('secret-pass-1'); await q.click('.modal button.primary');
  const dl = await waitFor(async () => { const gg = await game(q); return gg && await gg.evaluate(() => S.money === 5555 && !!S.arch) }, 25000);
  ok('second device downloads the career', dl, dl ? null : await (async () => { const gg = await game(q); return gg ? await gg.evaluate(() => JSON.stringify({ m: S.money, a: S.arch, l: S.lvl, title })) : 'no frame' })());
  // conflict: both devices change the career
  const gB = await game(q); await gB.evaluate(() => { S.money = 7777; save(); flush(1) });
  ok('device B uploads', await waitFor(async () => (await q.evaluate(async (t) => (await fetch('/api/saves/1', { headers: { Authorization: 'Bearer ' + localStorage.getItem('lfc_token') } })).json())).data.money === 7777, 30000));
  g = await game(p); await g.evaluate(() => { S.money = 1111; save(); flush(1) });
  ok('device A gets a conflict dialog instead of overwriting', await waitFor(async () => !!(await p.$('.cmp')), 30000));
  await p.screenshot({ path: SHOTS + '/e2e_conflict.png' });
  const cloudNow = await p.evaluate(async (t) => (await fetch('/api/saves/1', { headers: { Authorization: 'Bearer ' + t } })).json(), token);
  ok('cloud kept device B data while waiting', cloudNow.data.money === 7777);
  // choose cloud version
  await p.click('.modal .row button.primary');
  ok('choosing cloud loads it into the game', await waitFor(async () => { const gg = await game(p); return gg && await gg.evaluate(() => S.money === 7777) }, 20000));
  // history
  await p.click('.bar nav button:nth-child(2)'); await wait(1200);
  ok('cloud history lists versions', (await p.$$('.saveRow')).length >= 3, (await p.$$('.saveRow')).length);
  await p.screenshot({ path: SHOTS + '/e2e_history.png' });
  ok('no page errors', errs.length === 0, JSON.stringify(errs.slice(0, 3)));
  console.log(R.join('\n')); await b.close(); process.exit(R.some((r) => r.startsWith('FAIL')) ? 1 : 0)
})().catch((e) => { console.log(R.join("\n")); console.error(e); process.exit(2) });
