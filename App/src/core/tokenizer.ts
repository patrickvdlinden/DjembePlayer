export const tokenTypes = {
  B: 'bass', b: 'bass-small', n: 'bass-flam',
  O: 'tone', o: 'tone-small', i: 'tone-flam',
  X: 'slap', x: 'slap-small', z: 'slap-flam',
  v: 'bell', '.': 'pulse',
  '1': 'connection', '-': 'half', '_': 'two-thirds',
  '2': 'double-half', '3': 'double-two-thirds',
  l: 'left', r: 'right', L: 'left-right', R: 'right-left',
  m: 'measure', '>': 'repeat-start', '<': 'repeat-end',
  p: 'starting-point', '#': 'triplet-signature',
  ' ': 'next-beat', '=': 'next-beat-half', '+': 'next-beat-two-thirds',
  '\n': 'newline',
} as const;

export type TokenType = typeof tokenTypes[keyof typeof tokenTypes];
export interface Token { type: TokenType; value: string; position: number }

export class NotationError extends Error {
  constructor(message: string, public readonly position?: number) {
    super(position === undefined ? message : `${message} (character ${position + 1})`);
    this.name = 'NotationError';
  }
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  for (let position = 0; position < input.length; position++) {
    const value = input[position]!;
    if (value === '\r' && input[position + 1] === '\n') {
      tokens.push({ type: 'newline', value: '\r\n', position });
      position++;
      continue;
    }
    const type = tokenTypes[value as keyof typeof tokenTypes];
    if (!type) throw new NotationError(`Unknown notation character ${JSON.stringify(value)}`, position);
    tokens.push({ type, value, position });
  }
  return tokens;
}
