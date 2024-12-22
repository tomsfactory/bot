import type { Page } from 'playwright';

/**
 * Force open all shadow doms on the page and all iframes
 * @example
 * ```ts
 * import { forceOpenAllShadowDoms } from '@tomsfactory/bot/shadow-root';
 * import { chromium, Page } from "npm:playwright";
 *
 * const browser = await chromium.launch({
 *  headless: false,
 *  executablePath: '/usr/bin/google-chrome',
 * });
 * const page: Page = await browser.newPage();
 * await forceOpenAllShadowDoms(page);
 * ```
 */
export async function forceOpenAllShadowDoms(
  page: Pick<Page, 'evaluate' | 'on' | 'url'>,
): Promise<void> {
  const overwriteAttachShadowScript = `
      if (!Element.prototype._attachShadow) {
        Element.prototype._attachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (...args) {
          console.log('attachShadow', args);
          return this._attachShadow( { mode: "open" } );
        };
      }
    `;
  try {
    await page.evaluate(overwriteAttachShadowScript);
  } catch (e) {
    console.debug(
      'failed to evaluate overwriteAttachShadowScript in listenForInterception. Continuing...',
      e,
    );
  }

  page.on('load', async () => {
    const url = page.url(); // the new url

    try {
      await page.evaluate(overwriteAttachShadowScript);
    } catch (e) {
      console.debug(
        'failed to evaluate overwriteAttachShadowScript in load. Continuing...',
        e,
      );
    }

    console.debug('inside load', url);
  });

  page.on('framenavigated', async (frame) => {
    const url = frame.url(); // the new url

    try {
      await frame.evaluate(overwriteAttachShadowScript);
    } catch (e) {
      console.debug(
        'failed to evaluate overwriteAttachShadowScript in framenavigated. Continuing...',
        e,
      );
    }

    console.debug('inside framenavigated', url);
  });
}
