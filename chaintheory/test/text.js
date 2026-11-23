// The page's visible text, model by model, for a read-through against the sources.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage();
  await page.goto('file://' + process.argv[2]); await page.waitForTimeout(300);
  const ids = await page.evaluate(() => [...document.querySelectorAll('.tile')].map(b => b.id.replace('tile-', '')));
  const out = [];
  out.push('=== HEADER\n' + await page.innerText('header.top'));
  for (const id of ids) { await page.click('#tile-' + id); out.push(`--- ${id}: ` + (await page.innerText('#placard')).replace(/\n+/g, ' | ')); if (id === 'proton') { await page.click('#form-star'); out.push('--- proton (star): ' + (await page.innerText('#placard')).replace(/\n+/g, ' | ')); } }
  out.push('=== STAGE\n' + await page.innerText('.stagecol') + '\n' + await page.innerText('.gradebox'));
  for (const s of ['#rules', '#rod', '#number', '#limits', 'footer']) out.push('=== ' + s + '\n' + await page.innerText(s));
  console.log(out.join('\n\n'));
  await browser.close();
})();
