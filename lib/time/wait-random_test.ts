import { describe, it } from '@std/testing/bdd';
import { waitRandom } from './wait-random.ts';
import { expect, fn } from '@std/expect';
import { FakeTime } from '@std/testing/time';
import { assertNotEquals } from '@std/assert';

describe('waitRandom', () => {
  it('resolves after a time within the specified range', async () => {
    const setTOut = globalThis.setTimeout;
    using time = new FakeTime();
    assertNotEquals(globalThis.setTimeout, setTOut);

    const fromMs = 100;
    const toMs = 200;
    const mockRandom = () => 0.5; // Mid-point of random range for consistency
    const cb = fn();

    console.log(time.start);
    console.log(time.now);
    waitRandom(fromMs, toMs, mockRandom).then(() => cb());

    await time.tickAsync(50);
    console.log(time.now);

    expect(cb).not.toHaveBeenCalled();

    await time.tickAsync(99); // ms elapsed 149
    console.log(time.now);

    expect(cb).not.toHaveBeenCalled();

    await time.tickAsync(2); // ms elapsed 151

    expect(cb).toHaveBeenCalled();
  });
});
