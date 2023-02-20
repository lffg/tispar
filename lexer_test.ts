import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.162.0/testing/asserts.ts";

import { lex, Token } from "./lexer.ts";

Deno.test("lexes string correctly", () => {
  const expected: Token[] = [
    { type: "num", val: 1 },
    { type: "plus" },
    { type: "lpar" },
    { type: "num", val: 2 },
    { type: "plus" },
    { type: "num", val: 3 },
    { type: "rpar" },
    { type: "star" },
    { type: "num", val: 4 },
    { type: "eof" },
  ];
  assertEquals(lex("1 + (2+3)  *  4"), expected);
});

Deno.test("lexes empty string", () => {
  assertEquals(lex(""), [{ type: "eof" }]);
});

Deno.test("doesn't lex when invalid character is found", () => {
  assertThrows(() => {
    lex("1+2 &");
  });
});
