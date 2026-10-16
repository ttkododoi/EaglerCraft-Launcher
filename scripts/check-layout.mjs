// Optional browser regression suite. See README for Playwright setup.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {}),
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
// Validate our layout without downloading game binaries or relying on GX uptime.
await page.route('https://gx-launcher.github.io/**', route => route.fulfill({
  contentType: 'text/html',
  body: '<!doctype html><style>body{margin:0;background:#263c32;color:white}</style><h1>Mock hosted game</h1>',
}));
const viewports = [[1920,1080],[1440,900],[1366,768],[1280,600],[1024,600],
  [900,600],[768,1024],[390,844],[360,640],[320,568],[844,390],[667,375]];
try {
  for (const [width,height] of viewports) {
    await page.setViewportSize({width,height});
    await page.goto(process.env.LAUNCHER_URL || 'http://localhost:3000');
    await page.waitForSelector('#launch[href]');
    const layout = await page.evaluate(() => {
      const rect = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return {top:r.top,left:r.left,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      };
      return {
        width:document.documentElement.scrollWidth,
        height:document.documentElement.scrollHeight,
        launch:rect('#launch'),version:rect('#version-select'),runtime:rect('.runtime-options'),
        copy:rect('.hero-copy'),heroFooter:rect('.hero-bottom'),
      };
    });
    const size = `${width}×${height}`;
    assert.ok(layout.width <= width + 1, `Horizontal document overflow at ${size}`);
    assert.ok(layout.height <= height + 1, `Vertical document overflow at ${size}`);
    for (const name of ['launch','version','runtime']) {
      const r = layout[name];
      assert.ok(r.bottom <= height && r.top >= 0 && r.left >= 0 && r.right <= width,
        `${name} is outside viewport at ${size}`);
      assert.ok(r.height >= 40, `${name} is too short at ${size}`);
    }
    assert.ok(layout.copy.bottom <= layout.heroFooter.top + 1, `Hero text overlaps footer at ${size}`);

    await page.locator('#launch').click();
    await page.locator('#remote-stage iframe').waitFor();
    const player = await page.evaluate(() => {
      const dialog = document.querySelector('#remote-dialog');
      const stage = document.querySelector('#remote-stage').getBoundingClientRect();
      const frame = document.querySelector('#remote-stage iframe').getBoundingClientRect();
      const close = document.querySelector('#remote-close').getBoundingClientRect();
      return {overflow:dialog.scrollWidth > dialog.clientWidth || dialog.scrollHeight > dialog.clientHeight,
        stageHeight:stage.height,frameHeight:frame.height,closeRight:close.right,closeBottom:close.bottom};
    });
    assert.equal(player.overflow,false, `Player overflow at ${size}`);
    assert.ok(player.stageHeight >= 150, `Game surface too small at ${size}`);
    assert.ok(Math.abs(player.stageHeight - player.frameHeight) < 1, `Frame doesn't fill stage at ${size}`);
    assert.ok(player.closeRight <= width && player.closeBottom <= height, `Close offscreen at ${size}`);
    await page.locator('#remote-close').click();
    await page.waitForFunction(() => !document.querySelector('iframe'));

    for (const tab of ['library','modules','settings','guide']) {
      await page.locator(`[data-page="${tab}"]`).click();
      const result = await page.locator(`#page-${tab}`).evaluate(el => ({
        overflowX:el.scrollWidth > el.clientWidth + 1,
        bottom:el.getBoundingClientRect().bottom,
        scrolls:getComputedStyle(el).overflowY === 'auto',
      }));
      assert.equal(result.overflowX,false, `${tab} horizontal overflow at ${size}`);
      assert.ok(result.scrolls && result.bottom <= height, `${tab} is not correctly bounded at ${size}`);
    }
    console.log(`PASS ${size}: visible launch controls, no hero overlap, bounded pages and player`);
  }
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  console.log('All layout regressions passed. Remote responses were mocked, not live-tested.');
} finally {
  await browser.close();
}
