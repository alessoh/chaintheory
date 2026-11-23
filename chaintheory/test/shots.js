// Screenshots of the page at desktop and phone widths in light and dark themes, with console and overflow checks.
const { chromium } = require('playwright');
(async () => {
  const url = 'file://' + process.argv[2], outdir = process.argv[3];
  const browser = await chromium.launch();
  const problems = [];
  for (const [name, w, h, scheme, scale] of [['desktop-light', 1280, 900, 'light', 1], ['desktop-dark', 1280, 900, 'dark', 1], ['phone-light', 400, 860, 'light', 2], ['phone-dark', 400, 860, 'dark', 2]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: scale, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`${name} console ${m.type()}: ${m.text()}`); });
    page.on('pageerror', e => problems.push(`${name} pageerror: ${e.message}`));
    page.on('requestfailed', r => problems.push(`${name} request failed: ${r.url().slice(0, 90)}`));
    await page.goto(url); await page.waitForTimeout(700);
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight,
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).length }));
    if (o.sw > o.cw) problems.push(`${name}: page scrolls sideways (${o.sw} > ${o.cw})`);
    console.log(name, 'scrollWidth', o.sw, 'clientWidth', o.cw, 'height', o.h, 'fonts loaded', o.fonts);
    await page.screenshot({ path: `${outdir}/${name}-top.png` });
    await page.screenshot({ path: `${outdir}/${name}-full.png`, fullPage: true });
    await ctx.close();
  }
  await browser.close();
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no console errors, no failed requests, no sideways scroll');
})();
