import { Token } from "./lexer.ts";

export type Op = "+" | "*";

export type Expr =
  | { type: "bin"; op: Op; left: Expr; right: Expr }
  | { type: "par"; expr: Expr }
  | { type: "num"; val: number };

// expr    ::= term
// term    ::= factor ( "+" factor )*
// factor  ::= primary ( "*" primary )*
// primary ::= <number-lit> | "(" expr ")"
export class Parser {
  private cursor = 0;

  constructor(private tokens: readonly Token[]) {}

  public static parse(tokens: readonly Token[]): Expr {
    const parser = new Parser(tokens);
    return parser.parse();
  }

  private parse(): Expr {
    const expr = this.parseExpr();
    this.eat("eof");
    return expr;
  }

  private parseExpr(): Expr {
    return this.parseTerm();
  }

  // +
  private parseTerm(): Expr {
    let left = this.parseFactor();
    while (this.current().type == "plus") {
      this.bump();
      const right = this.parseFactor();
      // The following would parse `term` as right-associative.
      // const right = this.parseTerm();
      left = {
        type: "bin",
        op: "+",
        left,
        right,
      };
    }
    return left;
  }

  // *
  private parseFactor(): Expr {
    let left = this.parsePrimary();
    while (this.current().type == "star") {
      this.bump();
      const right = this.parsePrimary();
      left = {
        type: "bin",
        op: "*",
        left,
        right,
      };
    }
    return left;
  }

  private parsePrimary(): Expr {
    const token = this.current();
    switch (token.type) {
      case "num": {
        this.eat("num");
        // Sometimes, structural types ain't that bad!!1
        return token;
      }
      case "lpar": {
        this.eat("lpar");
        const expr = this.parseExpr();
        this.eat("rpar");
        return {
          type: "par",
          expr,
        };
      }
      default: {
        this.unexpected(token.type, "primary expression");
      }
    }
  }

  // Returns the token at the current position.
  private current(): Token {
    return this.tokens[this.cursor];
  }

  // Bumps the cursor and returns the previous token.
  private bump(): Token {
    return this.tokens[this.cursor++];
  }

  // Bumps if the current token matches the predicate. Returns the previous token.
  private eat(type: Token["type"]): Token {
    const actual = this.current().type;
    if (type != actual) {
      this.unexpected(actual, type);
    }
    return this.bump();
  }

  private unexpected(actual: string, expected: string): never {
    throw new Error(`expected '${expected}, but got '${actual}'`);
  }
}

export function lispify(ast: Expr): string {
  const emitBinOp = (expr: Extract<Expr, { type: "bin" }>) =>
    `(${expr.op} ${lispify(expr.left)} ${lispify(expr.right)})`;

  switch (ast.type) {
    case "bin": {
      return emitBinOp(ast);
    }
    case "par": {
      // Extra parentheses aren't necessary.
      return lispify(ast.expr);
    }
    case "num": {
      return ast.val.toString(10);
    }
    default: {
      never(ast);
    }
  }
}

export function evaluate(ast: Expr): number {
  switch (ast.type) {
    case "bin": {
      const a = evaluate(ast.left);
      const b = evaluate(ast.right);
      switch (ast.op) {
        case "+":
          return a + b;
        case "*":
          return a * b;
        default:
          return never(ast.op);
      }
    }
    case "par": {
      return evaluate(ast.expr);
    }
    case "num": {
      return ast.val;
    }
    default: {
      never(ast);
    }
  }
}

function never(_val: never): never {
  throw new Error("Reached unreachable code. This is a bug.");
}
