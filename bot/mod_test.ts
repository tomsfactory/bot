import { assertEquals } from '@std/assert';
import { add } from '@tomsfactory/bot';
import { subtract } from './mod.ts';

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});

Deno.test(function subtractTest() {
  assertEquals(subtract(5, 3), 2);
});
