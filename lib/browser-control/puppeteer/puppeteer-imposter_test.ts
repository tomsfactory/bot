import { assertSpyCall, assertSpyCalls, returnsNext } from '@std/testing/mock';
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

interface SetupParams {
  clickImpl?: GhostCursor['click'];
  mockEvaluateOverride?: SpyReturnSpy<Page, Page['evaluate']>;
}

function mockEvaluateInfiniteScroll(): SpyReturnSpy<Page, Page['evaluate']> {
  return getSpy<Page, Page['evaluate']>(returnsNext([
    Promise.resolve(1), // initial
    Promise.resolve(), // scrollTo
    Promise.resolve(5), // current
    Promise.resolve(), // scrollTo
    Promise.resolve(10), // current
    Promise.resolve(), // scrollTo
    Promise.resolve(10), // current
  ]));
}

describe('PuppeteerImposter', () => {
  let mockPage: Page;
  let mockEvaluate: SpyReturnSpy<Page, Page['evaluate']>;
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

  function setup({ clickImpl, mockEvaluateOverride }: SetupParams = {}) {
    mockEvaluate = getSpy<Page, Page['evaluate']>();
    mockPage = {
      evaluate: mockEvaluateOverride ?? mockEvaluate,
    } as unknown as Page;
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
      setup({ clickImpl });
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

  describe('scrollToBottomInfinitely', () => {
    it('should scroll once if there is no infinite load', async () => {
      const mockEvaluateOverride = getSpy<Page, Page['evaluate']>(
        returnsNext([
          Promise.resolve(1),
          Promise.resolve(),
          Promise.resolve(1),
        ]),
      );
      setup({ mockEvaluateOverride });

      await puppeteerImposter.scrollToBottomInfinitely();

      assertSpyCalls(mockEvaluateOverride, 3);
    });

    it('should scroll as many times as is necessary if there is infinite load', async () => {
      const mockEvaluateOverride = mockEvaluateInfiniteScroll();
      setup({ mockEvaluateOverride });

      await puppeteerImposter.scrollToBottomInfinitely();

      assertSpyCalls(mockEvaluateOverride, 7);
    });

    it('waits according to options between scrolling', async () => {
      const mockEvaluateOverride = mockEvaluateInfiniteScroll();
      setup({ mockEvaluateOverride });

      await puppeteerImposter.scrollToBottomInfinitely();

      assertSpyCalls(mockWaitRandom, 3);
      assertSpyCall(mockWaitRandom, 0, { args: [200, 600] });
      assertSpyCall(mockWaitRandom, 1, { args: [200, 600] });
      assertSpyCall(mockWaitRandom, 2, { args: [200, 600] });
    });
  });
});
