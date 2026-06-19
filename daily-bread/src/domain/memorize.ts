/**
 * Verse memorization — progressive blanking. Pure and seeded so practice
 * rounds are reproducible and testable.
 */
export interface Token {
  word: string;
  hidden: boolean;
}

export type MemorizeLevel = 1 | 2 | 3;

/** Deterministic LCG in [0,1) — Math.random with a memory. */
function lcg(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const HIDE_RATIO: Record<MemorizeLevel, number> = { 1: 0.34, 2: 0.67, 3: 1 };

/** Splits on whitespace and hides a level-proportional seeded subset. */
export function blankVerse(text: string, level: MemorizeLevel, seed: number): Token[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const random = lcg(seed);
  const indices = words.map((_, i) => i);
  // Seeded Fisher–Yates, then take the first N as hidden.
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const hideCount = Math.max(1, Math.round(words.length * HIDE_RATIO[level]));
  const hidden = new Set(indices.slice(0, hideCount));
  return words.map((word, i) => ({ word, hidden: hidden.has(i) }));
}

/** The hidden words in verse order — the fill sequence. */
export function hiddenSequence(tokens: Token[]): string[] {
  return tokens.filter((t) => t.hidden).map((t) => t.word);
}

/** Seeded shuffle of the hidden words — the word bank. */
export function wordBank(tokens: Token[], seed: number): string[] {
  const words = hiddenSequence(tokens);
  const random = lcg(seed + 7);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
}
