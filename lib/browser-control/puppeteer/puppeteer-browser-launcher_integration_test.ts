import { afterEach, beforeEach, describe, it } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { PuppeteerBrowserLauncher } from './puppeteer-browser-launcher.ts';
import type { Browser } from 'rebrowser-puppeteer-core';
import type CdpFrame from 'rebrowser-puppeteer-core/lib/cdp-frame';
import type { RebrowserBotDetectorResult } from '../bot-detection/rebrowser-bot-detector-result.ts';
import { BROWSER_EXECUTABLE_PATH } from '../../env/env-keys.ts';

describe('Puppeteer BrowserLauncher Integration', () => {
  const TIME_FOR_WAITING_FOR_SWAP = 100;

  let browser: Browser;

  beforeEach(async () => {
    const launcher = new PuppeteerBrowserLauncher();
    console.debug(
      'Deno.env.get(BROWSER_EXECUTABLE_PATH): ',
      Deno.env.get(BROWSER_EXECUTABLE_PATH),
    );
    browser = await launcher.launch({
      executablePath: Deno.env.get(BROWSER_EXECUTABLE_PATH),
      headless: true,
    });
  });

  afterEach(async () => {
    const pages = await browser.pages();

    for (const page of pages) {
      console.log('closing page');
      await page.close();
      console.log('page closed');
    }
    await browser.close();

    // Puppeteer does stuff after browser close. Thus we must wait for this otherwise we get a "error: Leaks detected: 2 timers were started in this test" error. See https://github.com/puppeteer/puppeteer/blob/83449567c7013ae1c87c54e42501aa74575640d0/packages/puppeteer-core/src/cdp/FrameManager.ts#L36
    await new Promise((resolve) =>
      setTimeout(resolve, TIME_FOR_WAITING_FOR_SWAP + 1)
    );
  });

  it('should pass rebrowser-bot-detector by default', async () => {
    const ignoredBotTestTypes = [
      'exposeFunctionLeak', // I think there is no solution to this test apart from not calling page.exposeFunction. See https://github.com/rebrowser/rebrowser-bot-detector?tab=readme-ov-file#exposefunctionleak
    ];
    const page = await browser.newPage();

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

    // mainWorldExecution - must be called in an isolated context
    /* puppeteer */
    const frame = page.mainFrame() as CdpFrame;
    await frame.isolatedRealm().evaluate(() =>
      document.getElementsByClassName('div')
    );

    /*
      playwright - there is no way to explicitly evaluate script in an isolated context
      follow rebrowser-patches on github for the fix
      */
    // await page.evaluate('document.getElementsByClassName("div")');

    const results = await page.evaluate<
      string[],
      () => Array<RebrowserBotDetectorResult>
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
