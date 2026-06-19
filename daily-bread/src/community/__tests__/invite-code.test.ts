import {
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
} from '@/community/invite-code';

describe('generateInviteCode', () => {
  it('produces 6 characters from the unambiguous alphabet', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it('never contains ambiguous characters across many draws', () => {
    let sequence = 0.001;
    const random = () => {
      sequence = (sequence * 9301 + 0.2113) % 1;
      return sequence;
    };
    for (let i = 0; i < 200; i++) {
      expect(generateInviteCode(random)).not.toMatch(/[01OIL]/);
    }
  });

  it('is deterministic for a fixed random source', () => {
    expect(generateInviteCode(() => 0)).toBe('AAAAAA');
    expect(generateInviteCode(() => 0.9999)).toBe('999999');
  });
});

describe('normalizeInviteCode', () => {
  it('uppercases and strips separators', () => {
    expect(normalizeInviteCode(' ab-c2 3d ')).toBe('ABC23D');
  });
});

describe('isValidInviteCode', () => {
  it('accepts a well-formed code in any case', () => {
    expect(isValidInviteCode('abc234')).toBe(true);
  });

  it('rejects wrong lengths and ambiguous characters', () => {
    expect(isValidInviteCode('ABC23')).toBe(false);
    expect(isValidInviteCode('ABC230')).toBe(false); // 0 not in alphabet
    expect(isValidInviteCode('ABCD1E')).toBe(false); // 1 not in alphabet
  });
});
