import type {
  Browser,
  LaunchOptions,
  PuppeteerNode,
} from 'rebrowser-puppeteer-core';
import puppeteer from 'rebrowser-puppeteer-core';
import type { BrowserLauncher } from '../browser-launcher.ts';
import { BROWSER_EXECUTABLE_PATH } from '../../env/env-keys.ts';

/**
 * A subtype of PuppeteerNode that includes launch.
 */
export type PuppeteerImplementation = Pick<PuppeteerNode, 'launch'>;

/**
 * Launches a puppeteer browser.
 */
export class PuppeteerBrowserLauncher
  implements BrowserLauncher<LaunchOptions, Browser> {
  /**
   * @internal
   */
  private readonly necessaryArgs = [
    // navigator.webdriver = true indicates that browser is automated. Use --disable-blink-features=AutomationControlled switch for Chrome. See https://bot-detector.rebrowser.net/
    '--disable-blink-features=AutomationControlled',
  ];

  /**
   * Create a PuppeteerBrowserLauncher
   * @param puppeteerImplementation
   */
  constructor(
    private readonly puppeteerImplementation: PuppeteerImplementation =
      puppeteer,
  ) {}

  /**
   * Launches a puppeteer browser
   */
  launch(options?: LaunchOptions): Promise<Browser> {
    return this.puppeteerImplementation.launch({
      executablePath: Deno.env.get(BROWSER_EXECUTABLE_PATH),
      headless: false,
      defaultViewport: null,
      ...{
        ...options,
        args: [...(options?.args ?? []), ...this.necessaryArgs],
      },
    });
  }
}
