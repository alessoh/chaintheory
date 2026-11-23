// Smoke test of the page exactly as published (real skeleton, no test hook).
const { chromium } = require('playwright');
(async () => {
  const file = process.argv[2], outdir = process.argv[3];
  const browser = await chromium.launch();
  let bad = 0;
  for (const [name, vp, scheme] of [['desktop-light', { width: 1280, height: 900 }, 'light'], ['desktop-dark', { width: 1280, height: 900 }, 'dark'], ['phone-light', { width: 400, height: 860 }, 'light'], ['phone-dark', { width: 400, height: 860 }, 'dark']]) {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: 1, hasTouch: name.startsWith('phone') });
    const page = await ctx.newPage();
    const errs = [], failed = [];
    page.on('pageerror', e => errs.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('requestfailed', r => failed.push(r.url().slice(0, 60)));
    await page.goto('file://' + file); await page.waitForTimeout(900);
    const r = await page.evaluate(() => ({
      title: document.title,
      tiles: document.querySelectorAll('.tile').length,
      balls: document.querySelectorAll('#layer .ball').length,
      name: document.querySelector('#placard h2, #placard h3')?.innerText,
      bg: getComputedStyle(document.body).backgroundColor,
      fg: getComputedStyle(document.body).color,
      scheme: getComputedStyle(document.documentElement).colorScheme,
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      kit: typeof window.__kit,
      rootPadTop: getComputedStyle(document.documentElement).paddingTop,
    }));
    await page.click('#tile-hydrogen'); await page.waitForTimeout(500);
    const h = await page.evaluate(() => ({ name: document.querySelector('#placard h2, #placard h3')?.innerText, balls: document.querySelectorAll('#layer .ball').length, hash: location.hash }));
    // one look in the bench trial
    await page.click('#look-100'); await page.waitForTimeout(200);
    const tally = await page.evaluate(() => document.querySelector('#look-sum')?.innerText);
    await page.click('#distill'); await page.waitForTimeout(200);
    const dsum = await page.evaluate(() => document.querySelector('#distill-sum')?.innerText);
    const nonFont = failed.filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u));
    console.log(name, JSON.stringify(r), '->', JSON.stringify(h), '| tally:', tally, '| distill:', dsum, '| errors:', errs.filter(e => !/fonts\.|ERR_|Failed to load resource/.test(e)).length, '| failed non-font requests:', nonFont.length, '| font requests failed here:', failed.length - nonFont.length);
    if (errs.filter(e => !/fonts\.|ERR_|Failed to load resource/.test(e)).length || nonFont.length || r.over > 0 || r.tiles !== 20 || h.balls !== 16) bad++;
    if (name === 'phone-dark' || name === 'desktop-light') await page.screenshot({ path: outdir + '/pub-' + name + '.png' });
    await ctx.close();
  }
  await browser.close();
  console.log(bad ? 'SMOKE FAILED' : 'smoke test passed');
})();
