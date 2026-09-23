const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const routes = ['/', '/about/', '/products/', '/projects/', '/contact/', ...['windows','doors','cladding','hand-rails','sky-light','garage-doors','rollup-shutters'].map(s => '/products/' + s + '/')];
const output = path.join(__dirname, 'screenshots');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // External services are not needed to verify local layout and routing.
    await page.route('https://maps.google.com/**', route => route.abort());
    for (const route of routes) {
      const response = await page.goto(base + route, {waitUntil:'domcontentloaded'});
      assert(response.status() === 200, 'Route failed: ' + route);
      await page.locator('h1').waitFor();
      for (const width of [320,390,768,1024,1440]) {
        await page.setViewportSize({width,height:1000});
        const result = await page.evaluate(async () => {
          await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
          const hero = document.querySelector('.full-photo');
          const rect = hero?.getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            broken: [...document.images].some(img => !img.naturalWidth),
            crop: hero ? Math.abs(rect.width / rect.height - hero.naturalWidth / hero.naturalHeight) > .005 || getComputedStyle(hero).objectFit !== 'contain' || getComputedStyle(hero).transform !== 'none' : false,
            outOfBounds: hero ? rect.left < 0 || rect.right > innerWidth : false,
            english: document.documentElement.lang === 'en',
          };
        });
        assert(!result.overflow && !result.broken && !result.crop && !result.outOfBounds && result.english, JSON.stringify({route,width,...result}));
      }
      console.log('PASS ' + route + ' at 320, 390, 768, 1024, 1440px');
      await page.setViewportSize({width:390,height:844});
      for (const distance of [500,1500]) {
        await page.evaluate(y => window.scrollTo(0,y), distance);
        await page.waitForTimeout(50);
        const pinned = await page.locator('.site-header').evaluate(header => {
          const rect = header.getBoundingClientRect();
          return Math.abs(rect.top) < 1 && rect.bottom > 0;
        });
        assert(pinned, 'Mobile header is not pinned: ' + route);
      }
    }
    for (const size of [{width:320,height:568},{width:390,height:844},{width:667,height:375}]) {
      await page.setViewportSize(size);
      await page.goto(base, {waitUntil:'domcontentloaded'});
      for (const y of [0,600,1500]) {
        await page.evaluate(value => window.scrollTo(0,value), y);
        await page.waitForTimeout(50);
        const visible = await page.locator('#primary-nav').evaluate(nav => {
          const links = [...nav.querySelectorAll('a')];
          const rects = links.map(link => link.getBoundingClientRect());
          return links.length === 5 && rects.every((r,i) =>
            r.width > 0 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth &&
            r.top >= 0 && r.bottom <= innerHeight &&
            Math.abs(r.top - rects[0].top) < 1 && (i === 0 || r.left >= rects[i-1].right));
        });
        assert(visible, 'All five navigation links must remain visible side by side');
        assert(await page.locator('.site-header button').count() === 0, 'Header must have no dropdown buttons');
      }
      await page.locator('#primary-nav a[href="/products/"]').click();
      await page.waitForURL(base + '/products/');
      await page.locator('.product-card[href="/products/windows/"]').click();
      await page.waitForURL(base + '/products/windows/');
      assert(await page.locator('h1').innerText() === 'Windows', 'Product navigation failed');
    }
    const links = new Set();
    for(const route of routes) {
      await page.goto(base + route, {waitUntil:'domcontentloaded'});
      (await page.locator('a[href^="/"]').evaluateAll(nodes => nodes.map(n=>n.getAttribute('href')))).forEach(href=>links.add(href));
    }
    for(const href of links) assert((await page.request.get(base+href)).ok(), 'Broken link: '+href);
    await page.goto(base, {waitUntil:'domcontentloaded'});
    for (const material of ['glass','steel','aluminum']) {
      await page.locator('[data-material="' + material + '"]').click();
      assert(await page.locator('[data-material="' + material + '"]').getAttribute('aria-pressed') === 'true', 'Material selection failed');
      assert(await page.locator('[data-material-image]').evaluate(async img => { await img.decode(); return img.naturalWidth > 0; }), 'Material illustration failed');
      const expected = {glass:'sky-light',steel:'hand-rails',aluminum:'windows'}[material];
      assert((await page.locator('[data-material-link]').getAttribute('href')) === '/products/' + expected + '/', 'Material link mismatch');
    }
    const processDetail = page.locator('.process details').nth(1);
    await processDetail.locator('summary').click();
    assert(await processDetail.getAttribute('open') !== null, 'Process disclosure failed');
    await page.locator('[data-scene]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-scene]').dataset.ready === 'true');
    for (const finish of ['graphite','champagne','silver']) {
      await page.locator('[data-finish="' + finish + '"]').click();
      assert(await page.locator('[data-scene]').getAttribute('data-finish') === finish, '3D finish failed');
    }
    await page.locator('[data-door]').click();
    assert(await page.locator('[data-door]').getAttribute('aria-pressed') === 'true', '3D door failed to open');
    await page.locator('[data-door]').click();
    await page.locator('[data-rotation]').fill('-30');
    await page.locator('[data-reset-view]').click();
    assert(await page.locator('[data-rotation]').inputValue() === '21', '3D view reset failed');
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('[data-scene]').scrollIntoViewIfNeeded();
    const sceneBounds = await page.locator('[data-scene]').boundingBox();
    await page.mouse.move(sceneBounds.x + sceneBounds.width / 2, sceneBounds.y + sceneBounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(sceneBounds.x + sceneBounds.width / 2 + 50, sceneBounds.y + sceneBounds.height / 2, {steps:5});
    await page.mouse.up();
    assert(await page.locator('[data-rotation]').inputValue() !== '21', 'Dragging must rotate the model');
    await page.locator('[data-reset-view]').click();
    await page.evaluate(() => scrollTo(0,0));
    for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
      await page.setViewportSize({width,height});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);
      await page.screenshot({path:path.join(output,name+'-hero.png')});
      await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
    }
    assert(errors.length === 0, errors.join('\n'));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('[data-scene]').scrollIntoViewIfNeeded();
    await page.locator('[data-door]').click();
    assert(await page.locator('[data-door]').getAttribute('aria-pressed') === 'true', 'Reduced motion must preserve controls');
    await page.route('**/assets/vendor/three/three.module.js', route => route.abort());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-scene]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-scene-status]').textContent.includes('Static concept view'));
    assert(await page.locator('.scene-fallback').isVisible(), 'Fallback must remain visible');
    assert(await page.locator('[data-door]').isDisabled(), 'Unavailable 3D controls must be disabled');
    console.log('PASS always-visible horizontal mobile navigation, product navigation, internal links, runtime errors and image proportions.');
    console.log('PASS 3D loading, finishes, entrance, drag, rotation, reset, reduced-motion controls and static fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
