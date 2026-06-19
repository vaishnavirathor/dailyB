import { create } from 'zustand';

interface BibleNavState {
  shouldRedirect: boolean;
  redirectRoute: string | null;
  pendingTabRedirect: boolean;
  setBibleSession: (route: string) => void;
  clearBibleSession: () => void;
  setPendingTabRedirect: (v: boolean) => void;
}

export const useBibleNav = create<BibleNavState>((set) => ({
  shouldRedirect: false,
  redirectRoute: null,
  pendingTabRedirect: false,
  setBibleSession: (route) => set({ shouldRedirect: true, redirectRoute: route }),
  clearBibleSession: () => set({ shouldRedirect: false, redirectRoute: null, pendingTabRedirect: false }),
  setPendingTabRedirect: (v) => set({ pendingTabRedirect: v }),
}));
