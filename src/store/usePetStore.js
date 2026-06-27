import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SPECIES_EMOJI = {
  Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇',
  Fish: '🐠', Reptile: '🦎', Other: '🐾',
};

export const TEMPERAMENT_OPTIONS = [
  'Playful', 'Friendly', 'Calm', 'Energetic',
  'Shy', 'Independent', 'Loyal', 'Curious', 'Protective', 'Gentle',
];

const ts = (hoursAgo) => new Date(Date.now() - hoursAgo * 3_600_000).toISOString();

export const NEARBY_PETS = [
  {
    id: 'np1', name: 'Bruno', species: 'Dog', breed: 'Labrador',
    age: 3, gender: 'Male',
    temperament: ['Friendly', 'Playful', 'Energetic'],
    personalityNotes: 'Loves fetch and meeting new dogs. Very social.',
    owner: { username: 'TigerEyeDelhi', city: 'Delhi', distance: 0.8 },
    healthCard: { vaccinated: true, lastVetVisit: '10 Dec 2025', allergies: 'None', aggressionLevel: 'None' },
  },
  {
    id: 'np2', name: 'Nala', species: 'Cat', breed: 'Persian',
    age: 2, gender: 'Female',
    temperament: ['Calm', 'Independent', 'Gentle'],
    personalityNotes: 'Prefers quiet environments. Warms up slowly to strangers.',
    owner: { username: 'ArjunWild', city: 'Delhi', distance: 1.2 },
    healthCard: { vaccinated: true, lastVetVisit: '20 Jan 2026', allergies: 'Fish', aggressionLevel: 'Low' },
  },
  {
    id: 'np3', name: 'Moti', species: 'Dog', breed: 'Beagle',
    age: 5, gender: 'Male',
    temperament: ['Curious', 'Energetic', 'Friendly'],
    personalityNotes: 'Super food-motivated. Great with kids and other dogs.',
    owner: { username: 'PriyaNature', city: 'Delhi', distance: 2.1 },
    healthCard: { vaccinated: true, lastVetVisit: '05 Nov 2025', allergies: 'None', aggressionLevel: 'None' },
  },
  {
    id: 'np4', name: 'Simba', species: 'Dog', breed: 'Golden Retriever',
    age: 1, gender: 'Male',
    temperament: ['Playful', 'Loyal', 'Friendly'],
    personalityNotes: 'Puppy energy! Loves everyone he meets.',
    owner: { username: 'SundarbanSpy', city: 'Kolkata', distance: 3.4 },
    healthCard: { vaccinated: true, lastVetVisit: '01 Mar 2026', allergies: 'None', aggressionLevel: 'None' },
  },
  {
    id: 'np5', name: 'Luna', species: 'Cat', breed: 'British Shorthair',
    age: 4, gender: 'Female',
    temperament: ['Calm', 'Curious', 'Independent'],
    personalityNotes: 'Laid-back and curious. Coexists well with dogs.',
    owner: { username: 'WesternGhatsW', city: 'Mumbai', distance: 4.0 },
    healthCard: { vaccinated: true, lastVetVisit: '15 Oct 2025', allergies: 'None', aggressionLevel: 'None' },
  },
  {
    id: 'np6', name: 'Raja', species: 'Dog', breed: 'Indian Pariah',
    age: 6, gender: 'Male',
    temperament: ['Loyal', 'Protective', 'Calm'],
    personalityNotes: 'Street-smart and very loyal. Gentle once he trusts you.',
    owner: { username: 'NilgiriNest', city: 'Chennai', distance: 5.5 },
    healthCard: { vaccinated: true, lastVetVisit: '20 Sep 2025', allergies: 'None', aggressionLevel: 'Low' },
  },
  {
    id: 'np7', name: 'Tutu', species: 'Bird', breed: 'Indian Ringneck Parakeet',
    age: 3, gender: 'Female',
    temperament: ['Curious', 'Playful', 'Independent'],
    personalityNotes: 'Talks! Loves showing off her vocabulary.',
    owner: { username: 'GirForestGuru', city: 'Ahmedabad', distance: 6.2 },
    healthCard: { vaccinated: false, lastVetVisit: '10 Aug 2025', allergies: 'None', aggressionLevel: 'None' },
  },
  {
    id: 'np8', name: 'Koko', species: 'Dog', breed: 'Pomeranian',
    age: 1, gender: 'Female',
    temperament: ['Energetic', 'Playful', 'Friendly'],
    personalityNotes: 'Tiny but mighty! Great with other small dogs.',
    owner: { username: 'MangroveMapper', city: 'Hyderabad', distance: 7.8 },
    healthCard: { vaccinated: true, lastVetVisit: '14 Feb 2026', allergies: 'None', aggressionLevel: 'None' },
  },
];

const INIT_INCOMING = [
  { id: 'inc-1', theirPet: NEARBY_PETS[0], sentAt: ts(2)  },
  { id: 'inc-2', theirPet: NEARBY_PETS[2], sentAt: ts(20) },
];

export default create(
  persist(
    (set, get) => ({
      myPets:           [],
      outgoingRequests: [],
      incomingRequests: INIT_INCOMING,
      petFriendships:   [],

      addPet: (pet) => set(s => ({
        myPets: [...s.myPets, {
          ...pet,
          id:        `mypet-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }],
      })),

      updatePet: (id, updates) => set(s => ({
        myPets: s.myPets.map(p => p.id === id ? { ...p, ...updates } : p),
      })),

      deletePet: (id) => set(s => ({
        myPets:           s.myPets.filter(p => p.id !== id),
        outgoingRequests: s.outgoingRequests.filter(r => r.myPet.id !== id),
      })),

      sendMeetRequest: (myPet, theirPet) => {
        const exists = get().outgoingRequests.some(
          r => r.myPet.id === myPet.id && r.theirPet.id === theirPet.id && r.status === 'pending'
        );
        if (exists) return false;
        set(s => ({
          outgoingRequests: [...s.outgoingRequests, {
            id:       `out-${Date.now()}`,
            myPet,
            theirPet,
            status:   'pending',
            sentAt:   new Date().toISOString(),
          }],
        }));
        return true;
      },

      cancelOutgoing: (requestId) => set(s => ({
        outgoingRequests: s.outgoingRequests.filter(r => r.id !== requestId),
      })),

      acceptIncoming: (requestId, myPet) => {
        const req = get().incomingRequests.find(r => r.id === requestId);
        if (!req) return;
        set(s => ({
          incomingRequests: s.incomingRequests.filter(r => r.id !== requestId),
          petFriendships:   [...s.petFriendships, {
            myPetId:   myPet?.id ?? 'no-pet',
            myPetName: myPet?.name ?? 'My Pet',
            theirPet:  req.theirPet,
            since:     new Date().toISOString(),
          }],
        }));
      },

      declineIncoming: (requestId) => set(s => ({
        incomingRequests: s.incomingRequests.filter(r => r.id !== requestId),
      })),

      hasSentRequest: (myPetId, theirPetId) =>
        get().outgoingRequests.some(
          r => r.myPet.id === myPetId && r.theirPet.id === theirPetId && r.status === 'pending'
        ),
    }),
    {
      name:    'snapwild-pets-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
