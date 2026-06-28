import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SPECIES_EMOJI = {
  Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇',
  Fish: '🐠', Reptile: '🦎', Other: '🐾',
};

export const NEAREST_VET = {
  name: 'Dr. Mehta Pet Clinic', distance: 1.2, phone: '+91-98100-12345',
};

const ALL_VETS = [
  { name: 'Dr. Mehta Pet Clinic',          city: 'Delhi',     distance: 1.2, phone: '+91-98100-12345' },
  { name: 'Happy Paws Vet Hospital',        city: 'Delhi',     distance: 2.5, phone: '+91-11-2345-6789' },
  { name: 'Mumbai Animal Care Centre',      city: 'Mumbai',    distance: 0.8, phone: '+91-22-6789-0123' },
  { name: 'PetCure Veterinary Clinic',      city: 'Mumbai',    distance: 1.9, phone: '+91-98765-43210' },
  { name: 'Bangalore Pet Hospital',         city: 'Bangalore', distance: 1.1, phone: '+91-80-4567-8901' },
  { name: 'Chennai Animal Rescue & Vet',    city: 'Chennai',   distance: 2.3, phone: '+91-44-7890-1234' },
  { name: 'Hyderabad Pet Care',             city: 'Hyderabad', distance: 1.7, phone: '+91-40-2345-6789' },
  { name: 'Kolkata Animal Hospital',        city: 'Kolkata',   distance: 2.1, phone: '+91-33-4567-8901' },
];

export function getNearestVet(city = 'Delhi') {
  const match = ALL_VETS.filter(v => v.city === city).sort((a, b) => a.distance - b.distance);
  return match[0] ?? ALL_VETS[0];
}

const PUBLIC_SPOTS = [
  'Lodi Garden, Delhi',
  'Cubbon Park, Bangalore',
  'Shivaji Park, Mumbai',
  'Gandhi Beach, Chennai',
  'Eco Park, Kolkata',
  'Sanjay Gandhi National Park, Mumbai',
  'Nehru Park, Delhi',
];

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

export function getBreedGroups(extraPets = []) {
  const all = [...NEARBY_PETS, ...extraPets];
  const map = {};
  all.forEach(pet => {
    const key = `${pet.species}::${pet.breed}`;
    if (!map[key]) {
      const city = pet.owner?.city ?? 'India';
      map[key] = {
        id:      key,
        species: pet.species,
        breed:   pet.breed,
        name:    breedGroupName(pet.breed, pet.species, city),
        city,
        members: [],
      };
    }
    map[key].members.push(pet);
  });
  return Object.values(map).sort((a, b) => b.members.length - a.members.length);
}

function breedGroupName(breed, species, city) {
  switch (species) {
    case 'Dog':    return `${breed}s of ${city}`;
    case 'Cat':    return `${city} ${breed} Parents`;
    case 'Bird':   return `${breed} Bird Club`;
    case 'Rabbit': return `${breed} Rabbit Club`;
    default:       return `${breed} Community`;
  }
}

export function petStats(pet) {
  const seed = pet.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    followers: 10 + (seed % 80),
    meetups:   1  + (seed % 8),
    friends:   1  + (seed % 5),
  };
}

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
      activeMeetups:    [],
      completedMeetups: [],
      follows:          [],

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

      startMeetup: (myPet, theirPet) => {
        const id       = `meetup-${Date.now()}`;
        const location = PUBLIC_SPOTS[Math.floor(Math.random() * PUBLIC_SPOTS.length)];
        set(s => ({
          activeMeetups: [...s.activeMeetups, {
            id, myPet, theirPet,
            startedAt: new Date().toISOString(),
            location,
          }],
        }));
        return id;
      },

      completeMeetup: (meetupId, rating) => {
        const meetup = get().activeMeetups.find(m => m.id === meetupId);
        if (!meetup) return;
        set(s => ({
          activeMeetups:    s.activeMeetups.filter(m => m.id !== meetupId),
          completedMeetups: [...s.completedMeetups, {
            ...meetup,
            endedAt: new Date().toISOString(),
            rating,
          }],
        }));
      },

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

      followPet: (petId) => set(s => ({
        follows: s.follows.includes(petId) ? s.follows : [...s.follows, petId],
      })),

      unfollowPet: (petId) => set(s => ({
        follows: s.follows.filter(id => id !== petId),
      })),

      isFollowing: (petId) => get().follows.includes(petId),

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
