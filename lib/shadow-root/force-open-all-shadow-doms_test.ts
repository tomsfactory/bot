import { describe, it } from 'jsr:@std/testing/bdd';
import type { Page } from 'rebrowser-puppeteer-core';
import { forceOpenAllShadowDoms } from './force-open-all-shadow-doms.ts';
import { assertSpyCall, type Spy, spy } from 'jsr:@std/testing/mock';
import { assert } from '@std/assert';
import { getSpy } from '../test/get-spy.ts';

const overwriteAttachShadowScript: string = `
      if (!Element.prototype._attachShadow) {
        Element.prototype._attachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (...args) {
          console.log('attachShadow', args);
          return this._attachShadow( { mode: "open" } );
        };
      }
    `;

describe('forceOpenAllShadowDoms', () => {
  it('should evaluate script immediately', async () => {
    const page = mockPage();

    await forceOpenAllShadowDoms(page);

    assertSpyCall(page.evaluate, 0, {
      args: [overwriteAttachShadowScript],
    });
  });

  it('should NOT propagate error when evaluating script immediately', async () => {
    const page = mockPage();
    page.evaluate = getSpy<Page, Page['evaluate']>(() => {
      throw new Error('test error');
    }) as unknown as Page['evaluate'] & Spy;

    const result = await forceOpenAllShadowDoms(page);

    assert(result === undefined);
  });

  it('should evaluate script on load event', async () => {
    const page = mockPage();

    await forceOpenAllShadowDoms(page);
    const onLoad = page.on.calls.find((call) => call.args[0] === 'load');

    assert(onLoad !== undefined);

    onLoad.args[1](); // call the load event

    assertSpyCall(page.evaluate, 1, {
      args: [overwriteAttachShadowScript],
    });
  });

  it('should NOT propagate error when evaluating script on load event', async () => {
    const page = mockPage();
    await forceOpenAllShadowDoms(page);
    const onLoad = page.on.calls.find((call) => call.args[0] === 'load');

    assert(onLoad !== undefined);

    page.evaluate = getSpy<Page, Page['evaluate']>(() => {
      throw new Error('test error');
    }) as unknown as Page['evaluate'] & Spy;

    const result = await onLoad.args[1](); // call the load event

    assert(result === undefined);
  });

  it('should evaluate script on framenavigated event', async () => {
    const page = mockPage();
    const mockFrame = mockPage();

    await forceOpenAllShadowDoms(page);
    const onFrameNavigated = page.on.calls.find(
      (call) => call.args[0] === 'framenavigated',
    );

    assert(onFrameNavigated !== undefined);

    onFrameNavigated.args[1](mockFrame); // call the framenavigated event

    assertSpyCall(mockFrame.evaluate, 0, {
      args: [overwriteAttachShadowScript],
    });
  });

  it('should NOT propagate error when evaluating script on framenavigated event', async () => {
    const page = mockPage();

    await forceOpenAllShadowDoms(page);
    const onFrameNavigated = page.on.calls.find(
      (call) => call.args[0] === 'framenavigated',
    );

    assert(onFrameNavigated !== undefined);

    page.evaluate = getSpy<Page, Page['evaluate']>(() => {
      throw new Error('test error');
    }) as unknown as Page['evaluate'] & Spy;

    const result = await onFrameNavigated.args[1]({ url: () => 'test-url' }); // call the framenavigated event

    assert(result === undefined);
  });
});

function mockPage() {
  return {
    evaluate: getSpy<Page, Page['evaluate']>() as unknown as
      & Page['evaluate']
      & Spy,
    on: spy<
      Page,
      Parameters<Page['on']>,
      ReturnType<Page['on']>
    >() as unknown as Page['on'] & Spy,
    url: spy<Page, Parameters<Page['url']>, ReturnType<Page['url']>>(),
  };
}
