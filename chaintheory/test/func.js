// Functional checks of the building-set page against its own data block.
const { chromium, devices } = require('playwright');
const url = 'file://' + process.argv[2];
const fails = [], notes = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
(async () => {
  const browser = await chromium.launch();
  // ---------- desktop, motion allowed
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('pageerror ' + e.message));
  await page.goto(url); await page.waitForTimeout(400);

  // spin is on at load and stops at the first touch of the stage
  const r1 = await page.evaluate(() => window.__kit.S.R.slice());
  await page.waitForTimeout(500);
  const r2 = await page.evaluate(() => window.__kit.S.R.slice());
  ok(r1.some((v, i) => Math.abs(v - r2[i]) > 1e-4), 'model does not spin at load');
  ok(await page.getAttribute('#b-spin', 'aria-pressed') === 'true', 'spin button not pressed at load');

  const ids = await page.evaluate(() => [...document.querySelectorAll('.tile')].map(b => b.id.replace('tile-', '')));
  ok(ids.length === 20, 'expected 20 tiles, found ' + ids.length);
  const seen = [];
  for (const id of ids) {
    await page.click('#tile-' + id);
    const res = await page.evaluate(() => {
      const k = window.__kit, S = k.S, m = S.model, q = s => document.querySelectorAll(s).length;
      const fr = document.querySelector('#scene').getBoundingClientRect();
      const out = { id: m.id, balls: q('#layer .ball'), rods: q('#layer .rod'), dark: q('#layer .rod.dark'), socks: q('#layer .sock'), halos: q('#layer .halo'), rings: q('#layer .ring'),
        title: document.querySelector('#placard h2').textContent, parts: document.querySelector('.parts').textContent, tech: document.querySelector('.tech').textContent,
        standing: document.querySelector('#standing').textContent, pressed: [...document.querySelectorAll('.tile[aria-pressed="true"]')].map(b => b.id), nan: 0, outside: 0, worst: 1e9, scaleMin: 1e9, scaleMax: 0 };
      // every orientation on a grid of turns: nothing may leave the frame, nothing may be NaN
      const R0 = S.R.slice();
      for (let a = 0; a < 6.3; a += 0.35) for (const b of [-1.2, -0.6, 0, 0.6, 1.2]) for (const c of [0, 0.9]) {
        S.R = k.mul(k.rotY(a), k.mul(k.rotX(b), k.mul(k.rotY(c), R0))); k.render();
        out.scaleMin = Math.min(out.scaleMin, S.scale); out.scaleMax = Math.max(out.scaleMax, S.scale);
        for (const c2 of document.querySelectorAll('#layer circle.body')) {
          const x = +c2.getAttribute('cx'), y = +c2.getAttribute('cy'), r = +c2.getAttribute('r');
          if (!isFinite(x) || !isFinite(y) || !isFinite(r)) out.nan++;
          const margin = Math.min(x - r, y - r, fr.width - x - r, fr.height - y - r); out.worst = Math.min(out.worst, margin);
          if (margin < -0.5) out.outside++;
        }
        for (const l of document.querySelectorAll('#layer line')) for (const at of ['x1', 'y1', 'x2', 'y2']) if (!isFinite(+l.getAttribute(at))) out.nan++;
      }
      // spinning about the upright axis must not change the scale
      S.R = R0.slice(); k.render(); const s0 = S.scale; let drift = 0;
      for (let a = 0; a < 6.3; a += 0.2) { S.R = k.mul(k.rotY(a), R0); k.render(); drift = Math.max(drift, Math.abs(S.scale - s0) / s0); }
      S.R = R0; k.render(); out.spinDrift = drift; out.scale = S.scale;
      out.radius2 = Math.min(...[...document.querySelectorAll('#layer .ball.d2 circle.body')].map(c => +c.getAttribute('r')).concat([999]));
      out.data = { balls: m.d.length, rods: m.e.length, dark: m.dark, clear: m.clear, free: m.free, n2: m.n2, n3: m.n3, n4: m.n4, flags: m.e.filter(e => e[2]).length, shared: m.shared != null ? 1 : 0, web: m.web, measure: m.measure, standing: m.standing };
      return out;
    });
    const d = res.data; seen.push(res.id);
    ok(res.balls === d.balls && res.rods === d.rods && res.dark === d.dark && res.socks === d.free, `${id}: scene counts ${res.balls}/${res.rods}/${res.dark}/${res.socks} differ from data ${d.balls}/${d.rods}/${d.dark}/${d.free}`);
    ok(res.halos === d.flags && res.rings === d.shared, `${id}: read marks or shared ring wrong`);
    ok(res.pressed.length === 1 && res.pressed[0] === 'tile-' + id, `${id}: pressed tiles ${res.pressed}`);
    ok(res.nan === 0, `${id}: ${res.nan} non-finite coordinates`);
    ok(res.outside === 0, `${id}: ${res.outside} balls outside the frame (worst margin ${res.worst.toFixed(1)})`);
    ok(res.spinDrift < 1e-9, `${id}: scale changes by ${res.spinDrift} during a spin`);
    const want = [[d.n2, 'qubit'], [d.n3, 'qutrit'], [d.n4, 'hub'], [d.clear, 'clear rod'], [d.dark, 'hidden rod']].filter(x => x[0]).map(x => `×${x[0]} ${x[1]}${x[0] === 1 ? '' : 's'}`).join('');
    ok(res.parts.replace(/\s+/g, ' ').replace(/ ×/g, '×').trim() === want.replace(/ ×/g, '×'), `${id}: parts list "${res.parts}" differs from "${want}"`);
    ok(res.tech.includes(d.web) && res.tech.endsWith('measure ' + d.measure), `${id}: caption "${res.tech}"`);
    ok(res.standing === d.standing, `${id}: standing line differs from data`);
    notes.push(`${id.padEnd(11)} balls ${String(res.balls).padStart(2)} rods ${String(res.rods).padStart(2)} hidden ${String(res.dark).padStart(2)} sockets ${res.socks}  scale ${res.scale.toFixed(0)} px (range over turns ${res.scaleMin.toFixed(0)} to ${res.scaleMax.toFixed(0)})  smallest qubit radius ${res.radius2 === 999 ? 'n/a' : res.radius2.toFixed(1)}  worst margin ${res.worst.toFixed(1)}`);
  }
  // the proton's two forms and the neutron's shortcut
  await page.click('#tile-proton'); await page.click('#form-star');
  ok(await page.evaluate(() => window.__kit.S.model.id) === 'proton-star' && await page.locator('#layer .ball').count() === 11, 'proton star form not shown');
  ok((await page.textContent('.tech')).includes('measure 85'), 'proton star caption');
  await page.click('#form-catalog');
  ok(await page.evaluate(() => window.__kit.S.model.id) === 'proton', 'proton catalog form not restored');
  await page.click('#tile-neutron'); await page.click('#go-proton-star');
  ok(await page.evaluate(() => window.__kit.S.model.id) === 'proton-star', 'neutron shortcut to the proton star failed');
  ok((await page.textContent('#placard .conj')).includes('conjecture'), 'conjecture line missing');

  // look at a rod: a hidden one and a clear one in the electron
  await page.click('#tile-electron');
  const rodPts = await page.evaluate(() => { const S = window.__kit.S, fr = document.querySelector('#scene').getBoundingClientRect(); const pick = clear => S.items.filter(it => it.kind === 'rod' && it.clear === clear).sort((a, b) => b.z - a.z)[0]; const a = pick(false), b = pick(true); return { dark: [fr.left + a.mx, fr.top + a.my], clear: [fr.left + b.mx, fr.top + b.my] }; });
  await page.mouse.click(rodPts.dark[0], rodPts.dark[1]);
  let insp = await page.textContent('#inspect');
  ok(/above the limit of six/.test(insp) && /dark/.test(insp) && /matches this kind of rod with (the strong interaction|the weak interaction|the Yukawa sector|the Higgs)\./.test(insp), 'hidden rod text: ' + insp);
  ok(await page.locator('#overlay .pill').count() === 1 && /= (8|9|12|16)$/.test(await page.textContent('#overlay .pill text')), 'product label missing on hidden rod');
  ok(await page.getAttribute('#b-spin', 'aria-pressed') === 'false', 'spin did not stop on touch');
  await page.mouse.click(rodPts.clear[0], rodPts.clear[1]);
  insp = await page.textContent('#inspect');
  ok(/within the limit of six/.test(insp) && /with (electromagnetism|spacetime)\./.test(insp), 'clear rod text: ' + insp);
  // tap a ball
  const ballPt = await page.evaluate(() => { const S = window.__kit.S, fr = document.querySelector('#scene').getBoundingClientRect(); const it = S.items.filter(q => q.kind === 'ball').sort((a, b) => b.z - a.z)[0]; return { x: fr.left + it.x, y: fr.top + it.y, i: it.i, d: S.model.d[it.i] }; });
  await page.mouse.click(ballPt.x, ballPt.y);
  insp = await page.textContent('#inspect');
  ok(/sockets/.test(insp) && /free\./.test(insp), 'ball text: ' + insp);
  // pull a ball and let go
  const before = await page.evaluate(i => window.__kit.S.P[i].slice(), ballPt.i);
  await page.mouse.move(ballPt.x, ballPt.y); await page.mouse.down(); await page.mouse.move(ballPt.x + 40, ballPt.y - 50, { steps: 8 }); await page.waitForTimeout(250);
  const during = await page.evaluate(i => ({ p: window.__kit.S.P[i].slice(), active: window.__kit.S.active }), ballPt.i);
  ok(Math.hypot(during.p[0] - before[0], during.p[1] - before[1], during.p[2] - before[2]) > 0.2 && during.active, 'pulling a ball does not move it');
  await page.mouse.up(); const t0 = Date.now(); await page.waitForFunction(() => !window.__kit.S.active, null, { timeout: 16000 }).catch(() => {}); notes.push('electron settles ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s after a pull');
  const after = await page.evaluate(() => { const S = window.__kit.S, m = S.model; const L = m.e.map(([a, b]) => Math.hypot(S.P[a][0] - S.P[b][0], S.P[a][1] - S.P[b][1], S.P[a][2] - S.P[b][2])); return { active: S.active, min: Math.min(...L), max: Math.max(...L), raf: S.raf }; });
  ok(!after.active && after.min > 0.95 && after.max < 1.8, `model did not settle after a pull: ${JSON.stringify(after)}`);
  // turn buttons, sockets toggle, reset
  const ra = await page.evaluate(() => window.__kit.S.R.slice()); await page.click('#b-right');
  const rb = await page.evaluate(() => window.__kit.S.R.slice()); ok(ra.some((v, i) => Math.abs(v - rb[i]) > 0.05), 'turn button does nothing');
  await page.click('#b-sock'); ok(await page.locator('#layer .sock').first().isHidden(), 'sockets not hidden'); await page.click('#b-sock');
  await page.click('#b-reset'); ok((await page.textContent('#inspect')).startsWith('Drag the model sideways'), 'reset did not restore the hint');
  await page.focus('#scene'); await page.keyboard.press('ArrowLeft'); const rc = await page.evaluate(() => window.__kit.S.R.slice());
  ok(Math.abs(rc[0] - (await page.evaluate(() => window.__kit.S.R[0]))) < 1e-9, 'keyboard turn unstable');

  // bench trial 1: the quantum rule
  const combos = [];
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) {
    await page.click('#way-a-' + a); await page.click('#way-b-' + b);
    for (let k = 0; k < 20; k++) await page.click('#look-100');
    const n = await page.evaluate(() => window.__kit.LK.n.map(r => r.slice()));
    const N = n[0][0] + n[0][1] + n[1][0] + n[1][1]; ok(N === 2000, 'tally total ' + N);
    if (a === b) { ok(n[0][1] === 0 && n[1][0] === 0, `matching ways ${a}: off-diagonal ${n[0][1]}, ${n[1][0]}`); ok(Math.abs(n[0][0] - 1000) < 112, `matching ways ${a}: first answer ${n[0][0]} of 2000`); }
    else for (const v of n.flat()) ok(Math.abs(v - 500) < 97, `different ways ${a},${b}: cell ${v} of 2000`);
    const shown = await page.evaluate(() => [...document.querySelectorAll('#tally td')].map(td => +td.textContent));
    ok(shown.join() === n.flat().join(), 'tally table differs from counts');
    combos.push(`${a}${b}:${n.flat().join('/')}`);
  }
  notes.push('looks, 2,000 per setting (same/same, same/other, other/same, other/other): ' + combos.join('  '));
  await page.click('#look-clear'); ok((await page.textContent('#look-sum')) === 'No looks yet.', 'clear does not reset');
  await page.click('#look-1'); ok(/^1 look /.test(await page.textContent('#look-sum')), 'single look summary');
  // bench trial 2
  await page.click('#distill'); ok(await page.evaluate(() => document.querySelector('#swap').classList.contains('done')) && /re-matched/.test(await page.textContent('#distill-sum')), 'distill did not run');
  await page.click('#distill'); ok(!(await page.evaluate(() => document.querySelector('#swap').classList.contains('done'))), 'distill did not reset');

  // the one number
  const num = await page.evaluate(() => ({ shown: document.querySelector('#inverse').textContent.replace(/ /g, ''), data: window.__kit.DATA.alpha.inverse, cells: document.querySelectorAll('#waffle .cells i').length, groups: [...document.querySelectorAll('#waffle .wg')].map(g => g.querySelectorAll('i').length),
    pts: document.querySelectorAll('#plot .pt').length, cand: window.__kit.CAND, rows: document.querySelectorAll('#plottable tbody tr').length, sig: [...document.querySelectorAll('#plot .sg')].map(t => t.textContent), candX: +document.querySelector('#plot .cand').getAttribute('x1'), ptX: [...document.querySelectorAll('#plot .pt')].map(c => +c.getAttribute('cx')) }));
  ok(num.shown === num.data && num.shown === '137.035999189566', `inverse shown ${num.shown} vs ${num.data}`);
  ok(num.cells === 172 && num.groups.join() === '79,48,42,3', 'waffle counts ' + num.groups);
  ok(num.pts === 7 && num.rows === 8, 'chart rows');
  ok(Math.abs(num.cand - 189.566) < 0.001, 'candidate offset ' + num.cand);
  ok(num.sig.join(' ') === '+2.6σ +1.6σ +5.0σ +0.6σ +5.3σ −1.5σ +1.6σ', 'sigma labels: ' + num.sig.join(' '));
  ok(num.ptX[5] > num.candX && num.ptX[3] < num.candX && num.ptX[4] < num.ptX[0], 'chart marks out of order');
  await page.hover('#plot .hit >> nth=3'); await page.waitForTimeout(100);
  ok(/CODATA 2022: 1\/α = 137\.035 999 177\(21\)\. The candidate lies 0\.6 standard uncertainties above it\./.test(await page.textContent('#plot .tip')), 'tooltip text: ' + await page.textContent('#plot .tip').catch(() => 'none'));
  notes.push('chart labels: ' + num.sig.join(' '));
  ok(errs.length === 0, 'console errors: ' + errs.join(' | '));
  await ctx.close();

  // ---------- deep link, reduced motion, dark
  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  page = await ctx.newPage(); await page.goto(url + '#hydrogen'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.__kit.S.model.id) === 'hydrogen' && await page.locator('#layer .ring').count() === 1, 'deep link to hydrogen failed');
  ok(await page.getAttribute('#b-spin', 'aria-pressed') === 'false', 'spin is on although reduced motion is requested');
  await page.click('#tile-tau'); ok((await page.evaluate(() => location.hash)) === '#tau', 'hash not updated');
  await ctx.close();

  // ---------- phone, touch
  ctx = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  page = await ctx.newPage(); const perrs = []; page.on('pageerror', e => perrs.push(e.message)); await page.goto(url); await page.waitForTimeout(300);
  let small = 1e9;
  for (const id of ids) {
    await page.tap('#tile-' + id);
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, r2: Math.min(...[...document.querySelectorAll('#layer .ball circle.body')].map(c => +c.getAttribute('r'))),
      clipped: [...document.querySelectorAll('.tile .nm, .tile .sym')].filter(e => e.scrollWidth > e.clientWidth + 1).length, fs: Math.min(...[...document.querySelectorAll('#layer .num')].map(t => +t.getAttribute('font-size'))) }));
    ok(o.sw <= o.cw, `phone ${id}: sideways scroll ${o.sw} > ${o.cw}`); ok(o.clipped === 0, `phone ${id}: clipped tile text`);
    small = Math.min(small, o.fs);
  }
  notes.push('phone: smallest digit on any ball ' + small.toFixed(1) + ' px');
  ok(small >= 8, 'ball digits too small on the phone: ' + small.toFixed(1));
  await page.tap('#tile-electron');
  const pt = await page.evaluate(() => { const S = window.__kit.S, fr = document.querySelector('#scene').getBoundingClientRect(); const it = S.items.filter(q => q.kind === 'rod' && !q.clear).sort((a, b) => b.z - a.z)[0]; return [fr.left + it.mx, fr.top + it.my]; });
  await page.evaluate(y => window.scrollTo(0, y - 300), pt[1] + await page.evaluate(() => window.scrollY));
  const pt2 = await page.evaluate(() => { const S = window.__kit.S, fr = document.querySelector('#scene').getBoundingClientRect(); const it = S.items.filter(q => q.kind === 'rod' && !q.clear).sort((a, b) => b.z - a.z)[0]; return [fr.left + it.mx, fr.top + it.my]; });
  await page.touchscreen.tap(pt2[0], pt2[1]);
  ok(/above the limit of six/.test(await page.textContent('#inspect')), 'phone: tapping a rod does nothing: ' + await page.textContent('#inspect'));
  const stacked = await page.evaluate(() => [...document.querySelectorAll('.tbl')].filter(t => t.scrollWidth > t.clientWidth + 1).length);
  ok(stacked === 0, `phone: ${stacked} tables still scroll sideways`);
  ok(perrs.length === 0, 'phone page errors: ' + perrs.join(' | '));
  await ctx.close();
  await browser.close();
  console.log(notes.join('\n'));
  console.log(fails.length ? `\n${fails.length} FAILED:\n` + fails.join('\n') : '\nall checks passed');
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
