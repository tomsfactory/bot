import { afterEach, beforeEach, describe, it } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { PlaywrightBrowserLauncher } from './playwright-browser-launcher.ts';
import type { Browser } from 'rebrowser-playwright-core';
import type { RebrowserBotDetectorResult } from '../bot-detection/rebrowser-bot-detector-result.ts';
import { BROWSER_EXECUTABLE_PATH } from '../../env/env-keys.ts';

// Skip because not working in github actions
describe.skip('Playwright BrowserLauncher Integration', () => {
  const TIME_FOR_WAITING_FOR_SWAP = 100;

  let browser: Browser;

  beforeEach(async () => {
    const launcher = new PlaywrightBrowserLauncher();
    browser = await launcher.launch({
      executablePath: Deno.env.get(BROWSER_EXECUTABLE_PATH),
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
      ],
    });
  });

  afterEach(async () => {
    const pages = browser.contexts().flatMap((c) => c.pages());

    for (const page of pages) {
      console.log('closing page');
      await page.close();
      console.log('page closed');
    }
    await browser.close();

    // Playwright does stuff after browser close. Thus we must wait for this otherwise we get a "error: Leaks detected: 2 timers were started in this test" error. See https://github.com/playwright/playwright/blob/83449567c7013ae1c87c54e42501aa74575640d0/packages/playwright-core/src/cdp/FrameManager.ts#L36
    await new Promise((resolve) =>
      setTimeout(resolve, TIME_FOR_WAITING_FOR_SWAP + 1)
    );
  });

  it('should pass rebrowser-bot-detector by default', async () => {
    const ignoredBotTestTypes = [
      'exposeFunctionLeak', // I think there is no solution to this test apart from not calling page.exposeFunction. See https://github.com/rebrowser/rebrowser-bot-detector?tab=readme-ov-file#exposefunctionleak
      // These checks can't be defeated with playwright right now (2025-01-04). https://github.com/rebrowser/rebrowser-patches?tab=readme-ov-file#playwright-support
      'sourceUrlLeak',
      'pwInitScripts',
    ];
    const context = await browser.newContext({
      viewport: null,
    });
    const page = await context.newPage();

    await page.goto('https://bot-detector.rebrowser.net/');

    /* puppeteer & playwright */
    // dummyFn - must be called in the main context
    await page.evaluate('window.dummyFn()');

    // exposeFunctionLeak
    await page.exposeFunction('exposedFn', () => {
      console.log('exposedFn call');
    });

    // sourceUrlLeak
    await page.evaluate(() => document.getElementById('detections-json'));

    /*
      playwright - there is no way to explicitly evaluate script in an isolated context
      follow rebrowser-patches on github for the fix
      */
    // await page.evaluate('document.getElementsByClassName("div")');

    const results = await page.evaluate<
      Array<RebrowserBotDetectorResult>
    >('JSON.parse(document.getElementById("detections-json").value)');

    for (const result of results) {
      if (ignoredBotTestTypes.includes(result.type)) {
        continue;
      }
      // 1 means fail. 0 means neutral. -1 means pass.
      if (result.rating >= 1) {
        console.error(result.note);
      }
      expect(result.rating).toBeLessThan(1);
    }
  });
});
