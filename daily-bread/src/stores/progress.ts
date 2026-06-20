import { create } from 'zustand';

import {
  completedDates,
  getActivity,
  markPrayed,
  markReflectionRead,
  markVerseSeen,
  type DayActivity,
} from '@/data/activity';
import { addCelebratedMilestone, celebratedMilestones } from '@/data/kv';
import { toDateKey, type DateKey } from '@/domain/dates';
import { reachedMilestone, type Milestone } from '@/domain/milestones';
import { computeStreak, type StreakResult } from '@/domain/streaks';
import { cancelStreakCheckNotification } from '@/services/notification-scheduler';

export interface ProgressState {
  todayKey: DateKey;
  activity: DayActivity;
  streak: StreakResult;
  /** Milestone awaiting its celebration sheet, if any. */
  pendingMilestone: Milestone | null;
  /** Re-reads today + streak from the database (also rolls the date). */
  refresh: () => Promise<void>;
  recordVerseSeen: () => Promise<void>;
  recordReflectionRead: () => Promise<void>;
  recordPrayed: () => Promise<void>;
  acknowledgeMilestone: () => void;
}

async function snapshot(): Promise<
  Pick<ProgressState, 'todayKey' | 'activity' | 'streak' | 'pendingMilestone'>
> {
  const todayKey = toDateKey(new Date());
  const [completed, activity, celebrated] = await Promise.all([
    completedDates(),
    getActivity(todayKey),
    celebratedMilestones(),
  ]);
  const streak = computeStreak(completed, todayKey);
  return {
    todayKey,
    activity,
    streak,
    pendingMilestone: reachedMilestone(streak.length, celebrated),
  };
}

export const useProgress = create<ProgressState>((set, get) => ({
  todayKey: toDateKey(new Date()),
  activity: { verseSeen: false, reflectionRead: false, prayed: false },
  streak: { length: 0, graceDays: [] },
  pendingMilestone: null,

  refresh: async () => {
    try {
      set(await snapshot());
    } catch (error) {
      console.warn('[progress] refresh failed', error);
    }
  },

  recordVerseSeen: async () => {
    try {
      await markVerseSeen(toDateKey(new Date()));
      cancelStreakCheckNotification();
      set(await snapshot());
    } catch (error) {
      console.warn('[progress] recordVerseSeen failed', error);
    }
  },

  recordReflectionRead: async () => {
    try {
      await markReflectionRead(toDateKey(new Date()));
      set(await snapshot());
    } catch (error) {
      console.warn('[progress] recordReflectionRead failed', error);
    }
  },

  recordPrayed: async () => {
    try {
      await markPrayed(toDateKey(new Date()));
      set(await snapshot());
    } catch (error) {
      console.warn('[progress] recordPrayed failed', error);
    }
  },

  acknowledgeMilestone: () => {
    const milestone = get().pendingMilestone;
    if (milestone !== null) {
      void addCelebratedMilestone(milestone);
      set({ pendingMilestone: null });
    }
  },
}));
