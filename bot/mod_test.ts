import { assertEquals } from "@std/assert";
import {add} from '@tomsfactory/bot';

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
