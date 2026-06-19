import { shouldShowCurtain } from '@/features/daily-curtain/gating';

describe('shouldShowCurtain', () => {
  it('shows on first-ever launch', () => {
    expect(shouldShowCurtain(null, '2026-06-05')).toBe(true);
  });

  it('shows on the first open of a new day', () => {
    expect(shouldShowCurtain('2026-06-04', '2026-06-05')).toBe(true);
  });

  it('does not show again the same day', () => {
    expect(shouldShowCurtain('2026-06-05', '2026-06-05')).toBe(false);
  });

  it('shows when the device clock moved backwards across days (still a fresh day)', () => {
    expect(shouldShowCurtain('2026-06-06', '2026-06-05')).toBe(true);
  });
});
