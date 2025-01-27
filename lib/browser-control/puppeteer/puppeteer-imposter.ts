import type { ElementHandle, Page } from 'rebrowser-puppeteer-core';
import { Locator } from 'rebrowser-puppeteer-core';
import {
  type ClickOptions,
  createCursor,
  type GhostCursor,
} from 'ghost-cursor';
import type { RecursivePartial } from '../../common/types.ts';
import type {
  MoveOptions,
  MoveToOptions,
  RandomMoveOptions,
} from 'ghost-cursor';
import { waitRandom } from '../../time/wait-random.ts';

/**
 * Options for PuppeteerImposter,
 * specifying behavior and delays between actions.
 *
 * @interface PuppeteerImposterOptions
 *
 * @property {Object} waitBetweenActions Configuration for timing between actions.
 * @property {number} waitBetweenActions.fromMs The minimum delay in milliseconds between actions. Default is 1000.
 * @property {number} waitBetweenActions.toMs The maximum delay in milliseconds between actions. Default is 5000.
 */
interface PuppeteerImposterOptions {
  waitBetweenActions: {
    fromMs: number;
    toMs: number;
  };
}

/**
 * @internal
 */
const defaultOptions: PuppeteerImposterOptions = {
  waitBetweenActions: {
    fromMs: 1000,
    toMs: 5000,
  },
};

/**
 * Represents a factory function for creating a Ghost Cursor with optional configurations and behavior.
 * @param {Page} page - The Puppeteer page on which the cursor will operate.
 * @param {{ x: number; y: number }} [start] - Optional starting position for the cursor on the page.
 * @param {boolean} [performRandomMoves=false] - A flag to determine if the cursor should perform random movements automatically.
 * @param {Object} [defaultOptions] - Optional default configurations for various cursor functions.
 *
 * @returns {Pick<GhostCursor, 'click'>} An object containing the `click` method of the `GhostCursor`.
 */
export type CreateCursor = (
  page: Page,
  start?: { x: number; y: number },
  performRandomMoves?: boolean,
  defaultOptions?: {
    /**
     * Default options for the `randomMove` function that occurs when `performRandomMoves=true`
     * @default RandomMoveOptions
     */
    randomMove?: RandomMoveOptions;
    /**
     * Default options for the `move` function
     * @default MoveOptions
     */
    move?: MoveOptions;
    /**
     * Default options for the `moveTo` function
     * @default MoveToOptions
     */
    moveTo?: MoveToOptions;
    /**
     * Default options for the `click` function
     * @default ClickOptions
     */
    click?: ClickOptions;
  },
) => Pick<GhostCursor, 'click'>;

/**
 * PuppeteerImposter class provides functionalities to simulate human-like behavior
 * when interacting with web elements using Puppeteer.
 */
export class PuppeteerImposter {
  private cursor: Pick<GhostCursor, 'click'>;
  private readonly options: PuppeteerImposterOptions;

  /**
   * Constructs an instance of the class.
   *
   * @param {Page} page - The Puppeteer page instance to be used.
   * @param {RecursivePartial<PuppeteerImposterOptions>} [options=defaultOptions] - Partial configuration options for the imposter instance.
   * @param {Function} [createCursorImpl=createCursor] - Factory function to create a cursor implementation.
   * @param {Function} [waitRandomImpl] - Function to wait for a random time between two values in milliseconds.
   * @return {void} - Does not return a value.
   */
  constructor(
    private readonly page: Page,
    options: RecursivePartial<PuppeteerImposterOptions> = defaultOptions,
    private readonly createCursorImpl: CreateCursor = createCursor,
    private readonly waitRandomImpl: typeof waitRandom = waitRandom,
  ) {
    this.options = {
      waitBetweenActions: {
        ...defaultOptions.waitBetweenActions,
        ...options.waitBetweenActions,
      },
    };
    this.cursor = this.createCursorImpl(page);
  }

  /**
   * Simulates a click action on the specified element or selector.
   *
   * @example
   * imposter.click('button', {waitForClick: 2400});
   *
   * @param {string | ElementHandle} [selector] - The selector or element handle to click on. If not provided, defaults to a pre-defined element.
   * @param {ClickOptions} [options] - Optional configurations for the click action, such as delay or button type.
   * @return {Promise<void>} A promise that resolves once the click action is completed.
   */
  async click<ElType = unknown>(
    selector?: string | ElementHandle | Locator<ElType>,
    options?: ClickOptions,
  ): Promise<void> {
    await this.waitBetweenActions();

    if (selector instanceof Locator) {
      selector.wait();
      const handle = await selector.waitHandle();
      return this.cursor.click(handle, options);
    }

    return this.cursor.click(selector, options);
  }

  /**
   * Scrolls to the bottom of the webpage continuously until no further scrolling is possible.
   * This function evaluates the current scroll height of the page and scrolls further down
   * until the page content stops loading, or the scroll height no longer changes.
   *
   * @example
   * await imposter.scrollToBottomInfinitely();
   *
   * @return {Promise<void>} A Promise that resolves when the bottom of the page is reached and scrolling ends.
   */
  async scrollToBottomInfinitely(): Promise<void> {
    let previousScrollHeight = 0;
    let currentScrollHeight = await this.page.evaluate(() => {
      return document.body.scrollHeight;
    }) as number;

    while (previousScrollHeight < currentScrollHeight) {
      previousScrollHeight = currentScrollHeight;
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await this.waitBetweenActions();
      currentScrollHeight = await this.page.evaluate(() => {
        return window.document.body.scrollHeight;
      });
    }
  }

  /**
   * @internal
   */
  private async waitBetweenActions() {
    await this.waitRandomImpl(
      this.options.waitBetweenActions.fromMs,
      this.options.waitBetweenActions.toMs,
    );
  }
}
