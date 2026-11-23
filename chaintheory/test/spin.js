// The spin pauses while the stage is off screen and resumes when it returns.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.goto('file://' + process.argv[2]); await page.waitForTimeout(500);
  const R = () => page.evaluate(() => window.__kit.S.R[0]);
  const a = await R(); await page.waitForTimeout(400); const b = await R();
  await page.evaluate(() => window.scrollTo(0, 3000)); await page.waitForTimeout(500); const c = await R(); await page.waitForTimeout(500); const d = await R();
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600); const e = await R();
  console.log('spinning on screen:', a !== b, '| paused off screen:', c === d, '| resumes on return:', e !== d);
  await browser.close();
})();
