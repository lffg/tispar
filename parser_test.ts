import { assertEquals } from "https://deno.land/std@0.162.0/testing/asserts.ts";

import { lex } from "./lexer.ts";
import { lispify, Parser } from "./parser.ts";

const parse = (str: string) => lispify(Parser.parse(lex(str)));

Deno.test("parses expression correctly", () => {
  assertEquals(parse("1 + (2+3)  *  4"), "(+ 1 (* (+ 2 3) 4))");
});

Deno.test("correctly handles associativity", () => {
  assertEquals(parse("1+2+3"), "(+ (+ 1 2) 3)");
});

Deno.test("correctly handles precedence", () => {
  assertEquals(parse("1+2*3"), "(+ 1 (* 2 3))");
});
