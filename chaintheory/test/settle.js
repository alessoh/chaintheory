// How long does a model take to come to rest after one ball is pulled and released?
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage();
  await page.goto('file://' + process.argv[2]); await page.waitForTimeout(300);
  const out = await page.evaluate(() => {
    const k = window.__kit, S = k.S, res = [];
    for (const id of ['electron', 'tau', 'hydrogen', 'photon', 'up', 'neutrino-3']) {
      k.choose(id, false);
      const i = 0; S.P[i] = [S.P[i][0] + 1.5, S.P[i][1] + 1.2, S.P[i][2] + 0.8];       // pull one ball away and let go
      const marks = {}; let steps = 0, v = 1;
      while (steps < 6000) { v = k.physics(); steps++; for (const th of [3e-3, 1.5e-3, 4e-4]) if (v < th && !(th in marks)) marks[th] = steps; if (v < 1e-5) break; }
      res.push(id + ': steps to fall below 3e-3: ' + marks[3e-3] + ', 1.5e-3: ' + marks[1.5e-3] + ', 4e-4: ' + marks[4e-4] + ' (two steps per frame); final v ' + v.toExponential(1) + ' after ' + steps);
    }
    return res;
  });
  console.log(out.join('\n')); await browser.close();
})();
