export type Token =
  | { type: "num"; val: number }
  | { type: "plus" | "star" | "lpar" | "rpar" | "eof" };

const map = {
  "+": "plus",
  "*": "star",
  "(": "lpar",
  ")": "rpar",
} as const;

export function lex(src: string): Token[] {
  const cursor = new Cursor(src);
  const tokens: Token[] = [];

  while (cursor.bounded()) {
    const current = cursor.current();

    if (current in map) {
      tokens.push({ type: map[current as keyof typeof map] });
      cursor.bump();
      continue;
    }

    const numberStr = cursor.accumulate(isDigit);
    if (numberStr) {
      tokens.push({ type: "num", val: parseInt(numberStr, 10) });
      continue;
    }

    if (cursor.accumulate(isWhitespace)) {
      continue;
    }

    throw new Error(`unexpected character '${current}' in stream`);
  }

  tokens.push({ type: "eof" });
  return tokens;
}

class Cursor {
  private cursor = 0;
  public constructor(private src: string) {}

  // Checks if the cursor is correctly bounded.
  public bounded(): boolean {
    return this.cursor < this.src.length;
  }

  // Returns the character at the current position.
  public current(): string {
    return this.src[this.cursor];
  }

  // Bumps the cursor and returns the previous character.
  public bump(): string {
    return this.src[this.cursor++];
  }

  // Accumulates a string while the given predicate holds. Advances the cursor
  // the number of times `pred` was called with a truthy result.
  //
  // Returns `null` if the cursor was not advanced.
  public accumulate(pred: (current: string) => boolean): string | null {
    const start = this.cursor;
    while (pred(this.current())) {
      this.bump();
    }
    if (this.cursor != start) {
      return this.src.slice(start, this.cursor);
    }
    return null;
  }
}

function isDigit(c: string): boolean {
  return /^[0-9]$/.test(c);
}

function isWhitespace(c: string): boolean {
  return /^[\r\n\t ]$/.test(c);
}
