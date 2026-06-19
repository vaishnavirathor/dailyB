import { selectIndex } from '@/domain/daily-selection';

describe('selectIndex', () => {
  it('is deterministic for the same date', () => {
    expect(selectIndex('2026-06-05', 14)).toBe(selectIndex('2026-06-05', 14));
  });

  it('advances by one each day and wraps at collection length', () => {
    const a = selectIndex('2026-06-05', 14);
    const b = selectIndex('2026-06-06', 14);
    expect(b).toBe((a + 1) % 14);
  });

  it('wraps a full cycle back to the same index', () => {
    expect(selectIndex('2026-06-19', 14)).toBe(selectIndex('2026-06-05', 14));
  });

  it('always lands inside the collection bounds, including pre-epoch dates', () => {
    for (const date of ['1999-12-31', '2025-12-31', '2026-01-01', '2030-07-04']) {
      const i = selectIndex(date, 7);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(7);
    }
  });

  it('differs between collections with different salts', () => {
    // Salts shift the rotation so verse/promise/reflection never sync.
    const verse = selectIndex('2026-06-05', 10, 0);
    const promise = selectIndex('2026-06-05', 10, 3);
    expect(promise).toBe((verse + 3) % 10);
  });
});
