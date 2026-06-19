import { blankVerse, hiddenSequence, wordBank } from '@/domain/memorize';

const TEXT = 'యెహోవా నా కాపరి నాకు లేమి కలుగదు';

describe('blankVerse', () => {
  it('keeps every word and is deterministic for a seed', () => {
    const a = blankVerse(TEXT, 1, 42);
    const b = blankVerse(TEXT, 1, 42);
    expect(a.map((t) => t.word).join(' ')).toBe(TEXT);
    expect(a).toEqual(b);
  });

  it('hides roughly a third at level 1 and everything at level 3', () => {
    const level1 = blankVerse(TEXT, 1, 7).filter((t) => t.hidden).length;
    const level3 = blankVerse(TEXT, 3, 7).filter((t) => t.hidden).length;
    expect(level1).toBe(2); // 6 words * 0.34 ≈ 2
    expect(level3).toBe(6);
  });

  it('always hides at least one word, even for short verses', () => {
    expect(blankVerse('ఆమేన్', 1, 3).filter((t) => t.hidden).length).toBe(1);
  });

  it('varies the hidden set across seeds', () => {
    const masks = new Set(
      [1, 2, 3, 4, 5].map((seed) =>
        blankVerse(TEXT, 1, seed)
          .map((t) => (t.hidden ? '1' : '0'))
          .join(''),
      ),
    );
    expect(masks.size).toBeGreaterThan(1);
  });
});

describe('hiddenSequence + wordBank', () => {
  it('bank is a permutation of the hidden sequence', () => {
    const tokens = blankVerse(TEXT, 2, 11);
    const sequence = hiddenSequence(tokens);
    const bank = wordBank(tokens, 11);
    expect([...bank].sort()).toEqual([...sequence].sort());
  });
});
