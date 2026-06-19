/**
 * Group invite codes: 6 characters from an unambiguous alphabet
 * (no 0/O, 1/I/L) — easy to read aloud across a church hall.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 6;

export function generateInviteCode(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(random() * ALPHABET.length) % ALPHABET.length];
  }
  return code;
}

/** Uppercases and strips separators users tend to type. */
export function normalizeInviteCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidInviteCode(input: string): boolean {
  const normalized = normalizeInviteCode(input);
  return (
    normalized.length === INVITE_CODE_LENGTH &&
    [...normalized].every((ch) => ALPHABET.includes(ch))
  );
}
