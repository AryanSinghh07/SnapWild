import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const useHealthStore = create(
  persist(
    (set, get) => ({
      // Keyed by YYYY-MM-DD
      days: {},

      // Active session
      sessionStart: null,

      // ── Session ────────────────────────────────────────────────
      startSession: () => set({ sessionStart: new Date().toISOString() }),

      endSession: () => {
        const { sessionStart, days } = get();
        if (!sessionStart) return;
        const minutes = Math.round((Date.now() - new Date(sessionStart).getTime()) / 60000);
        const key = todayKey();
        const today = days[key] ?? { steps: 0, minutes: 0, mood_before: null, mood_after: null };
        set({
          sessionStart: null,
          days: { ...days, [key]: { ...today, minutes: today.minutes + minutes } },
        });
      },

      // ── Steps (written by live pedometer in screen) ─────────────
      addSteps: (count) => {
        const { days } = get();
        const key = todayKey();
        const today = days[key] ?? { steps: 0, minutes: 0, mood_before: null, mood_after: null };
        set({ days: { ...days, [key]: { ...today, steps: today.steps + count } } });
      },

      setTodaySteps: (steps) => {
        const { days } = get();
        const key = todayKey();
        const today = days[key] ?? { steps: 0, minutes: 0, mood_before: null, mood_after: null };
        set({ days: { ...days, [key]: { ...today, steps } } });
      },

      // ── Mood ────────────────────────────────────────────────────
      logMood: (type, emoji) => {
        const { days } = get();
        const key = todayKey();
        const today = days[key] ?? { steps: 0, minutes: 0, mood_before: null, mood_after: null };
        set({ days: { ...days, [key]: { ...today, [`mood_${type}`]: emoji } } });
      },

      // ── Selectors ───────────────────────────────────────────────
      getToday: () => {
        const { days } = get();
        return days[todayKey()] ?? { steps: 0, minutes: 0, mood_before: null, mood_after: null };
      },

      // Nature Therapy Score 0-100
      getNatureScore: (todayCatches = 0) => {
        const { days } = get();
        const today = days[todayKey()] ?? { steps: 0, minutes: 0 };
        const stepPts  = Math.min(today.steps / 10000, 1) * 40;
        const timePts  = Math.min(today.minutes / 120, 1) * 40;
        const catchPts = Math.min(todayCatches / 5, 1)    * 20;
        return Math.round(stepPts + timePts + catchPts);
      },

      // Last 7 days for chart
      getWeeklyStats: () => {
        const { days } = get();
        return Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const key = d.toISOString().slice(0, 10);
          return {
            label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            key,
            ...(days[key] ?? { steps: 0, minutes: 0 }),
          };
        });
      },
    }),
    {
      name:    'snapwild-health-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useHealthStore;
