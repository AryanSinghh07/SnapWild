import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ts = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString();

const ALL_USERS = [
  { id: 'u1',  username: 'ArjunWild',      city: 'Mumbai',    catches: 18 },
  { id: 'u2',  username: 'TigerEyeDelhi',  city: 'Delhi',     catches: 44 },
  { id: 'u3',  username: 'PriyaNature',    city: 'Pune',      catches: 15 },
  { id: 'u4',  username: 'BirdQueenCHN',   city: 'Chennai',   catches: 29 },
  { id: 'u5',  username: 'RaviForest',     city: 'Nashik',    catches: 12 },
  { id: 'u6',  username: 'SnehaWings',     city: 'Bangalore', catches: 16 },
  { id: 'u7',  username: 'LeoWildMH',      city: 'Pune',      catches: 21 },
  { id: 'u8',  username: 'NayanTrek',      city: 'Mumbai',    catches: 8  },
  { id: 'u9',  username: 'IshaJungle',     city: 'Nagpur',    catches: 11 },
  { id: 'u10', username: 'VinayBirds',     city: 'Kolhapur',  catches: 6  },
];

const INIT_REQUESTS = [
  { id: 'req1', from: ALL_USERS[0], createdAt: ts(90)  },
  { id: 'req2', from: ALL_USERS[2], createdAt: ts(240) },
];

const INIT_FRIENDS = [ALL_USERS[1]]; // TigerEyeDelhi

const INIT_CONVS = [
  {
    id: 'conv_u2',
    friend: ALL_USERS[1],
    messages: [
      { id: 'cm1', fromMe: false, text: 'Bhai tera tiger catch dekha community mein! 🔥', time: ts(100) },
      { id: 'cm2', fromMe: true,  text: 'Haan yaar, Jim Corbett mein tha. Pura 3 minute ruka!', time: ts(95) },
      { id: 'cm3', fromMe: false, text: 'Lucky hai bhai tu 😭 mujhe kabhi nahi milta', time: ts(90) },
      { id: 'cm4', fromMe: true,  text: 'Jaldi aa ek baar, mil ke jaate hain Corbett 🌿', time: ts(85) },
    ],
    unread: 0,
  },
];

const useFriendStore = create(
  persist(
    (set, get) => ({
      allUsers:     ALL_USERS,
      requests:     INIT_REQUESTS,
      sentRequests: [],
      friends:      INIT_FRIENDS,
      conversations: INIT_CONVS,

      searchUsers: (query) => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        const { friends, sentRequests } = get();
        const friendIds = friends.map(f => f.id);
        const sentIds   = sentRequests.map(r => r.toId);
        return ALL_USERS
          .filter(u => u.username.toLowerCase().includes(q))
          .map(u => ({
            ...u,
            isFriend:  friendIds.includes(u.id),
            isPending: sentIds.includes(u.id),
          }));
      },

      sendRequest: (toUser) =>
        set(s => ({
          sentRequests: [
            ...s.sentRequests,
            { id: `sr_${Date.now()}`, toId: toUser.id, to: toUser, createdAt: new Date().toISOString() },
          ],
        })),

      cancelRequest: (toId) =>
        set(s => ({ sentRequests: s.sentRequests.filter(r => r.toId !== toId) })),

      acceptRequest: (requestId) =>
        set(s => {
          const req = s.requests.find(r => r.id === requestId);
          if (!req) return s;
          const alreadyConv = s.conversations.find(c => c.friend.id === req.from.id);
          return {
            requests: s.requests.filter(r => r.id !== requestId),
            friends:  [...s.friends, req.from],
            conversations: alreadyConv
              ? s.conversations
              : [...s.conversations, { id: `conv_${req.from.id}`, friend: req.from, messages: [], unread: 0 }],
          };
        }),

      declineRequest: (requestId) =>
        set(s => ({ requests: s.requests.filter(r => r.id !== requestId) })),

      removeFriend: (friendId) =>
        set(s => ({ friends: s.friends.filter(f => f.id !== friendId) })),

      sendMessage: (convId, text) =>
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id !== convId ? c : {
              ...c,
              messages: [...c.messages, { id: `msg_${Date.now()}`, fromMe: true, text, time: new Date().toISOString() }],
              unread: 0,
            }
          ),
        })),

      markRead: (convId) =>
        set(s => ({
          conversations: s.conversations.map(c => c.id === convId ? { ...c, unread: 0 } : c),
        })),

      getOrCreateConv: (friend) => {
        const existing = get().conversations.find(c => c.friend.id === friend.id);
        if (existing) return existing;
        const newConv = { id: `conv_${friend.id}`, friend, messages: [], unread: 0 };
        set(s => ({ conversations: [...s.conversations, newConv] }));
        return newConv;
      },

      getTotalUnread: () =>
        get().conversations.reduce((sum, c) => sum + (c.unread ?? 0), 0),
    }),
    { name: 'snapwild-friends-v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);

export default useFriendStore;
