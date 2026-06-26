import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCatchStore = create(
  persist(
    (set, get) => ({
      catches: [],

      addCatch: (species) => {
        const entry = {
          ...species,
          id:        Date.now().toString(),
          caughtAt:  new Date().toISOString(),
        };
        set(state => ({ catches: [entry, ...state.catches] }));
        return entry;
      },

      hasCaught: (name) =>
        get().catches.some(c => c.name.toLowerCase() === name.toLowerCase()),

      getTotalXP: () =>
        get().catches.reduce((sum, c) => sum + (c.xp ?? 0), 0),

      getXPByTrack: () => ({
        hunter:   get().catches.reduce((s, c) => s + (c.xp ?? 0), 0),
        guardian: 0,
        health:   0,
        social:   0,
      }),

      getUniqueSpecies: () => {
        const seen = new Set();
        return get().catches.filter(c => {
          if (seen.has(c.name)) return false;
          seen.add(c.name);
          return true;
        });
      },

      getStreak: () => {
        const catches = get().catches;
        if (catches.length === 0) return 0;
        const today     = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86_400_000).toDateString();
        const days = [...new Set(catches.map(c => new Date(c.caughtAt).toDateString()))]
          .sort((a, b) => new Date(a) - new Date(b));
        const last = days[days.length - 1];
        if (last !== today && last !== yesterday) return 0;
        let streak = 1;
        for (let i = days.length - 2; i >= 0; i--) {
          const diff = (new Date(days[i + 1]) - new Date(days[i])) / 86_400_000;
          if (diff === 1) streak++;
          else break;
        }
        return streak;
      },
    }),
    {
      name:    'snapwild-catches-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCatchStore;
