// Stage pictures of every model, and close-ups of the interactive states, for a visual check.
const { chromium } = require('playwright');
(async () => {
  const url = 'file://' + process.argv[2], out = process.argv[3];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', colorScheme: process.argv[4] || 'light' });
  const page = await ctx.newPage(); await page.goto(url); await page.waitForTimeout(400);
  const ids = await page.evaluate(() => [...document.querySelectorAll('.tile')].map(b => b.id.replace('tile-', '')));
  for (const id of ids.concat(['proton-star'])) {
    if (id === 'proton-star') { await page.click('#tile-proton'); await page.click('#form-star'); } else await page.click('#tile-' + id);
    // look at the nearest hidden rod if there is one, otherwise the nearest clear rod
    await page.evaluate(() => { const k = window.__kit, S = k.S; const rods = S.items.filter(it => it.kind === 'rod').sort((a, b) => (a.clear - b.clear) || (b.z - a.z)); k.select({ rod: rods[0].k }); });
    await page.locator('.stage').screenshot({ path: `${out}/g_${id}.png` });
  }
  // states of the trials and the chart
  await page.click('#way-b-1'); await page.click('#look-100'); await page.click('#distill'); await page.waitForTimeout(700);
  await page.locator('#trial-look').screenshot({ path: `${out}/s_look.png` });
  await page.locator('#trial-distill').screenshot({ path: `${out}/s_distill.png` });
  await page.hover('#plot .hit >> nth=5'); await page.waitForTimeout(150);
  await page.locator('.versus').screenshot({ path: `${out}/s_plot.png` });
  await page.click('summary'); await page.locator('.versus details').screenshot({ path: `${out}/s_table.png` });
  await page.click('#tile-hydrogen'); await page.locator('.bench').screenshot({ path: `${out}/s_hydrogen.png` });
  await browser.close();
})();
