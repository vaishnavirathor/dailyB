import { bibleBook, bibleBooks, bookText } from '@/bible/books';

describe('bundled Telugu Bible', () => {
  it('has the full 66-book Protestant canon', () => {
    expect(bibleBooks).toHaveLength(66);
    expect(bibleBooks.filter((b) => b.testament === 'old')).toHaveLength(39);
    expect(bibleBooks.filter((b) => b.testament === 'new')).toHaveLength(27);
    expect(new Set(bibleBooks.map((b) => b.id)).size).toBe(66);
  });

  it('matches canonical chapter counts on landmark books', () => {
    expect(bibleBook('genesis')?.chapters).toBe(50);
    expect(bibleBook('psalms')?.chapters).toBe(150);
    expect(bibleBook('john')?.chapters).toBe(21);
    expect(bibleBook('revelation')?.chapters).toBe(22);
  });

  it('loads chapter text lazily and serves known verses', () => {
    const psalms = bookText('te-ov', 'psalms');
    expect(psalms).toHaveLength(150);
    expect(psalms[22][0]).toContain('యెహోవా నా కాపరి');
    const john = bookText('te-ov', 'john');
    expect(john[2][15]).toContain('దేవుడు లోకమును ఎంతో ప్రేమించెను');
  });

  it('has Telugu names for every book', () => {
    for (const book of bibleBooks) {
      expect(book.name.te).toMatch(/[ఀ-౿]/);
      expect(book.name.en.length).toBeGreaterThan(2);
    }
  });

  it('counts 31,102 verses across the whole canon', () => {
    let total = 0;
    for (const book of bibleBooks) {
      for (const chapter of bookText('te-ov', book.id)) {
        total += chapter.length;
      }
    }
    expect(total).toBe(31102);
  });

  it('serves the English edition with matching canon shape', () => {
    expect(bookText('en-kjv', 'psalms')).toHaveLength(150);
    expect(bookText('en-kjv', 'john')[2][15]).toContain('For God so loved the world');
    let total = 0;
    for (const book of bibleBooks) {
      for (const chapter of bookText('en-kjv', book.id)) {
        total += chapter.length;
      }
    }
    expect(total).toBe(31102);
  });
});
