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
    }),
    {
      name:    'snapwild-catches-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCatchStore;
