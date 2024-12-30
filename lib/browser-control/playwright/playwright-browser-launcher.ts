import type {
  Browser,
  BrowserType,
  LaunchOptions,
} from 'rebrowser-playwright-core';
import { chromium } from 'rebrowser-playwright-core';
import type { BrowserLauncher } from '../browser-launcher.ts';

/**
 * A subtype of BrowserType that includes launch.
 */
export type PlaywrightImplementation = Pick<BrowserType, 'launch'>;

/**
 * Launches a playwright browser.
 */
export class PlaywrightBrowserLauncher
  implements BrowserLauncher<LaunchOptions, Browser> {
  /**
   * Create a PlaywrightBrowserLauncher
   * @param playwrightImplementation
   */
  constructor(
    private readonly playwrightImplementation: PlaywrightImplementation =
      chromium,
  ) {}

  /**
   * Launches a playwright browser
   */
  launch(options?: LaunchOptions): Promise<Browser> {
    return this.playwrightImplementation.launch({
      executablePath: Deno.env.get('BROWSER_EXECUTABLE_PATH'),
      headless: false,
      args: [
        // navigator.webdriver = true indicates that browser is automated. Use --disable-blink-features=AutomationControlled switch for Chrome. See https://bot-detector.rebrowser.net/
        '--disable-blink-features=AutomationControlled',
      ],
      ...options,
    });
  }
}
