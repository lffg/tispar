import { lex } from "./lexer.ts";
import { Parser } from "./parser.ts";

const tokens = lex("1 + (2+3)  *  4");
const ast = Parser.parse(tokens);
console.dir(ast, { depth: Infinity });
