import { add } from "./bot/mod.ts";

if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}
