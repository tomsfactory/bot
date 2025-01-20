import { assertSpyCall, assertSpyCalls } from '@std/testing/mock';
import { type CreateCursor, PuppeteerImposter } from './puppeteer-imposter.ts';
import type { Frame, Page } from 'rebrowser-puppeteer-core';
import { ElementHandle, Locator } from 'rebrowser-puppeteer-core';
import { describe, it } from '@std/testing/bdd';
import { getSpy, type SpyReturnSpy } from '../../test/get-spy.ts';
import type { ClickOptions, GhostCursor } from 'npm:ghost-cursor@1.3.0';
import { expect } from '@std/expect/expect';
import type { waitRandom } from '../../time/wait-random.ts';

const defaultOptions = {
  waitBetweenActions: {
    fromMs: 200,
    toMs: 600,
  },
};

describe('PuppeteerImposter', () => {
  let mockPage: Page;
  let mockClick: SpyReturnSpy<
    GhostCursor,
    (selector?: string | ElementHandle, options?: ClickOptions) => Promise<void>
  >;
  let mockWaitRandom: SpyReturnSpy<typeof globalThis, typeof waitRandom>;
  let mockHandle: MockElementHandle;
  let createCursorSpy: SpyReturnSpy<typeof globalThis, CreateCursor>;
  let puppeteerImposter: PuppeteerImposter;
  class MockLocator extends Locator<HTMLElement> {
    override wait = getSpy();
    override waitHandle = getSpy(() => mockHandle);
  }
  class MockElementHandle extends ElementHandle {
    override remoteObject = getSpy();
    override toString = getSpy();
    override dispose = getSpy();
    override asElement = getSpy();
    override jsonValue = getSpy();
    override backendNodeId = getSpy();
    override autofill = getSpy();
    override uploadFile = getSpy();
    override contentFrame = getSpy();
    override get frame(): Frame {
      throw new Error('Method not implemented.');
    }
  }

  function setup(clickImpl?: GhostCursor['click']) {
    mockPage = {} as Page;
    mockClick = getSpy<GhostCursor, GhostCursor['click']>(clickImpl);
    mockHandle = new MockElementHandle();
    createCursorSpy = getSpy<typeof globalThis, CreateCursor>(() => ({
      click: mockClick,
    }));
    mockWaitRandom = getSpy<typeof globalThis, typeof waitRandom>();
    puppeteerImposter = new PuppeteerImposter(
      mockPage,
      defaultOptions,
      createCursorSpy,
      mockWaitRandom,
    );
  }

  describe('constructor', () => {
    it('should create cursor', () => {
      setup();

      assertSpyCalls(createCursorSpy, 1);
      assertSpyCall(createCursorSpy, 0, {
        args: [
          mockPage,
        ],
      });
    });
  });

  describe('click', () => {
    it('clicks on the given selector using the cursor', async () => {
      setup();
      const mockSelector = 'button#submit';

      await puppeteerImposter.click(mockSelector, {
        hesitate: 200,
      });

      assertSpyCalls(mockClick, 1);
      assertSpyCall(mockClick, 0, {
        args: [mockSelector, { hesitate: 200 }],
      });
    });

    it('should throw an error if cursor throws an error', async () => {
      const error = new Error('Cursor failed');
      const clickImpl = () => {
        throw error;
      };
      setup(clickImpl);
      const mockSelector = 'button#submit';

      await expect(puppeteerImposter.click(mockSelector)).rejects.toThrow(
        error,
      );
    });

    it('waits according to options before clicking', async () => {
      setup();

      await puppeteerImposter.click();

      assertSpyCalls(mockWaitRandom, 1);
      assertSpyCall(mockWaitRandom, 0, {
        args: [200, 600],
      });
    });

    it('accepts a Locator', async () => {
      const locator = new MockLocator();

      setup();

      await puppeteerImposter.click(locator, {
        hesitate: 200,
      });

      assertSpyCalls(locator.wait, 1);
      assertSpyCalls(locator.waitHandle, 1);
      assertSpyCalls(mockClick, 1);
      assertSpyCall(mockClick, 0, {
        args: [mockHandle, { hesitate: 200 }],
      });
    });
  });
});
