import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default create(
  persist(
    (set, get) => ({
      emergencyContact: null,   // { name, phone }
      isMinor:          false,
      locationSharing:  true,
      anonymousMode:    false,
      dataCollection:   true,
      sosLog:           [],     // [{ at, note }]

      setEmergencyContact: (contact) => set({ emergencyContact: contact }),
      clearEmergencyContact: () => set({ emergencyContact: null }),

      setIsMinor:        (v) => set({ isMinor: v }),
      setLocationSharing:(v) => set({ locationSharing: v }),
      setAnonymousMode:  (v) => set({ anonymousMode: v }),
      setDataCollection: (v) => set({ dataCollection: v }),

      logSOS: (note = '') => set(s => ({
        sosLog: [{ at: new Date().toISOString(), note }, ...s.sosLog].slice(0, 10),
      })),

      getEmergencyContact: () => get().emergencyContact,

      verified:       false,
      verifiedPhone:  null,
      setVerified:    (phone) => set({ verified: true,  verifiedPhone: phone }),
      clearVerified:  ()      => set({ verified: false, verifiedPhone: null }),
    }),
    {
      name:    'snapwild-safety-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
