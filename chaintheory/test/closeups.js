const { chromium, devices } = require('playwright');
(async () => {
  const url = 'file://' + process.argv[2], out = process.argv[3];
  const browser = await chromium.launch();
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  let page = await ctx.newPage(); await page.goto(url); await page.waitForTimeout(300);
  await page.locator('#rodtable').screenshot({ path: `${out}/c_rods_desktop.png` });
  await ctx.close();
  ctx = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  page = await ctx.newPage(); await page.goto(url); await page.waitForTimeout(300);
  await page.tap('#tile-tau');
  await page.evaluate(() => { const k = window.__kit, S = k.S; const rods = S.items.filter(it => it.kind === 'rod' && !it.clear).sort((a, b) => b.z - a.z); k.select({ rod: rods[0].k }); window.scrollTo(0, 0); });
  await page.screenshot({ path: `${out}/c_phone_tau.png` });
  await page.locator('.bench').screenshot({ path: `${out}/c_phone_bench.png` });
  await page.locator('#rodtable').screenshot({ path: `${out}/c_rods_phone.png` });
  const info = await page.evaluate(() => ({ vh: innerHeight, stageTop: document.querySelector('.stage').getBoundingClientRect().top + scrollY, chartTop: document.querySelector('.chart').getBoundingClientRect().top + scrollY, chartBottom: document.querySelector('.chart').getBoundingClientRect().bottom + scrollY, minDigit: Math.min(...[...document.querySelectorAll('#layer .num')].map(t => +t.getAttribute('font-size'))) }));
  console.log(JSON.stringify(info));
  await browser.close();
})();
