import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NGOS = [
  { name: 'Wildlife SOS',    phone: '+91-8888-9000-90' },
  { name: 'Friendicoes SPCA', phone: '+91-11-2461-0942' },
  { name: 'PETA India',      phone: '+91-98201-22602'  },
  { name: 'CARE (NGO)',      phone: '+91-80-2337-9133'  },
];

const ts = (hoursAgo) => new Date(Date.now() - hoursAgo * 3_600_000).toISOString();

export const INJURY_TYPES = ['Injured', 'Sick', 'Trapped', 'Dead'];
export const SEVERITY_LEVELS = ['High', 'Medium', 'Low'];

export const SEEDED_REPORTS = [
  {
    id: 'r1',
    species: 'Indian Peacock',
    emoji: '🦚',
    injuryType: 'Injured',
    description: 'Found near National Highway 48 with a broken wing, unable to fly.',
    severity: 'High',
    location: { city: 'Delhi', area: 'Mehrauli', lat: 28.5244, lng: 77.1855 },
    reportedBy: 'User from Delhi',
    reportedAt: ts(1.5),
    status: 'pending',
    ngo: NGOS[0],
    responders: 2,
  },
  {
    id: 'r2',
    species: 'Street Dog',
    emoji: '🐕',
    injuryType: 'Injured',
    description: 'Dog with badly injured hind leg, bleeding, near railway crossing.',
    severity: 'High',
    location: { city: 'Mumbai', area: 'Dharavi', lat: 19.0416, lng: 72.8510 },
    reportedBy: 'User from Mumbai',
    reportedAt: ts(3),
    status: 'in-progress',
    ngo: NGOS[1],
    responders: 5,
  },
  {
    id: 'r3',
    species: 'Spotted Deer',
    emoji: '🦌',
    injuryType: 'Trapped',
    description: 'Young deer with antler caught in chain-link fence at park boundary.',
    severity: 'Medium',
    location: { city: 'Bangalore', area: 'Cubbon Park', lat: 12.9763, lng: 77.5929 },
    reportedBy: 'User from Bangalore',
    reportedAt: ts(5),
    status: 'pending',
    ngo: NGOS[0],
    responders: 1,
  },
  {
    id: 'r4',
    species: 'Indian Pond Heron',
    emoji: '🦢',
    injuryType: 'Injured',
    description: 'Bird tangled in fishing line, sitting on the bank unable to walk.',
    severity: 'Medium',
    location: { city: 'Kolkata', area: 'Rabindra Sarobar', lat: 22.5121, lng: 88.3612 },
    reportedBy: 'User from Kolkata',
    reportedAt: ts(8),
    status: 'pending',
    ngo: NGOS[0],
    responders: 0,
  },
  {
    id: 'r5',
    species: 'Bonnet Macaque',
    emoji: '🐒',
    injuryType: 'Injured',
    description: 'Monkey with burn injuries on hand, likely from electric wire contact.',
    severity: 'High',
    location: { city: 'Chennai', area: 'Guindy', lat: 13.0106, lng: 80.2098 },
    reportedBy: 'User from Chennai',
    reportedAt: ts(12),
    status: 'resolved',
    ngo: NGOS[2],
    responders: 3,
  },
  {
    id: 'r6',
    species: 'Stray Cat',
    emoji: '🐈',
    injuryType: 'Sick',
    description: 'Kitten with upper respiratory infection, lethargic and not eating.',
    severity: 'Low',
    location: { city: 'Delhi', area: 'Lajpat Nagar', lat: 28.5665, lng: 77.2431 },
    reportedBy: 'User from Delhi',
    reportedAt: ts(20),
    status: 'pending',
    ngo: NGOS[1],
    responders: 0,
  },
  {
    id: 'r7',
    species: 'Indian Flying Fox',
    emoji: '🦇',
    injuryType: 'Trapped',
    description: 'Large fruit bat entangled in mango orchard netting, alive but panicking.',
    severity: 'Medium',
    location: { city: 'Hyderabad', area: 'Shamirpet', lat: 17.5609, lng: 78.5490 },
    reportedBy: 'User from Hyderabad',
    reportedAt: ts(6),
    status: 'pending',
    ngo: NGOS[0],
    responders: 1,
  },
];

function pickNgo(species) {
  const s = species.toLowerCase();
  if (s.includes('dog') || s.includes('cat') || s.includes('cow') || s.includes('cattle')) return NGOS[1];
  if (s.includes('bird') || s.includes('parrot') || s.includes('eagle') || s.includes('owl')) return NGOS[0];
  return NGOS[Math.floor(Math.random() * NGOS.length)];
}

export default create(
  persist(
    (set, get) => ({
      reports:     SEEDED_REPORTS,
      myResponses: [],
      guardianXP:  0,

      fileReport: (data) => {
        const ngo = pickNgo(data.species || 'unknown');
        const report = {
          id:          `r${Date.now()}`,
          species:     data.species,
          emoji:       data.emoji ?? '🐾',
          injuryType:  data.injuryType,
          description: data.description,
          severity:    data.severity,
          location:    data.location,
          reportedBy:  'You',
          reportedAt:  new Date().toISOString(),
          status:      'pending',
          ngo,
          responders:  0,
        };
        set(s => ({
          reports:    [report, ...s.reports],
          guardianXP: s.guardianXP + 50,
        }));
        return { report, ngo };
      },

      respondToReport: (id) => {
        if (get().myResponses.includes(id)) return;
        set(s => ({
          myResponses: [...s.myResponses, id],
          reports:     s.reports.map(r => r.id === id ? { ...r, responders: r.responders + 1 } : r),
          guardianXP:  s.guardianXP + 20,
        }));
      },

      markResolved: (id) => {
        set(s => ({
          reports:    s.reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r),
          guardianXP: s.guardianXP + 30,
        }));
      },

      hasResponded: (id) => get().myResponses.includes(id),
    }),
    {
      name:    'snapwild-rescue-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
