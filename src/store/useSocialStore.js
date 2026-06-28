import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const t = (h) => new Date(Date.now() - h * 3_600_000).toISOString();

const SEED = [
  {
    id: 'mp1', userId: 'u1', username: 'ArjunWild', city: 'Mumbai',
    species: 'Indian Peacock', scientific: 'Pavo cristatus',
    rarity: 'Uncommon', xp: 45, emoji: '🦚',
    caption: 'Found this beauty in Sanjay Gandhi National Park! Feathers glowing in the morning sun. 🌅',
    location: 'Borivali, Mumbai', aqi: 68, createdAt: t(2),
    spottedBy: ['u2', 'u3', 'u4', 'u7'], comments: 7, isStory: false,
  },
  {
    id: 'mp2', userId: 'u2', username: 'TigerEyeDelhi', city: 'Delhi',
    species: 'Bengal Tiger', scientific: 'Panthera tigris tigris',
    rarity: 'Legendary', xp: 200, emoji: '🐯',
    caption: 'Unbelievable sighting at Jim Corbett! 3 minutes of pure adrenaline. Stay safe out there. 🔥',
    location: 'Uttarakhand', aqi: 112, createdAt: t(5),
    spottedBy: ['u1', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'], comments: 31, isStory: true,
  },
  {
    id: 'mp3', userId: 'u3', username: 'PriyaNature', city: 'Pune',
    species: 'Indian Elephant', scientific: 'Elephas maximus indicus',
    rarity: 'Rare', xp: 100, emoji: '🐘',
    caption: 'Gentle giant crossing the road near Bandipur. We waited 20 minutes — worth every second. 🐘',
    location: 'Bandipur, Karnataka', aqi: 43, createdAt: t(8),
    spottedBy: ['u1', 'u2', 'u6'], comments: 14, isStory: true,
  },
  {
    id: 'mp4', userId: 'u4', username: 'BirdQueenCHN', city: 'Chennai',
    species: 'Indian Roller', scientific: 'Coracias benghalensis',
    rarity: 'Common', xp: 15, emoji: '🐦',
    caption: 'State bird of Karnataka spotted right here in Chennai! Those turquoise wings never get old.',
    location: 'Adyar, Chennai', aqi: 89, createdAt: t(12),
    spottedBy: ['u5', 'u8'], comments: 3, isStory: false,
  },
  {
    id: 'mp5', userId: 'u5', username: 'RaviForest', city: 'Nashik',
    species: 'King Cobra', scientific: 'Ophiophagus hannah',
    rarity: 'Rare', xp: 100, emoji: '🐍',
    caption: 'Spotted this 4-footer near the forest trail. Beautiful creature — please keep your distance.',
    location: 'Nashik Forest', aqi: 34, createdAt: t(18),
    spottedBy: ['u1', 'u2', 'u3', 'u4', 'u6', 'u7'], comments: 22, isStory: true,
  },
  {
    id: 'mp6', userId: 'u6', username: 'SnehaWings', city: 'Bangalore',
    species: 'Malabar Pied Hornbill', scientific: 'Anthracoceros coronatus',
    rarity: 'Uncommon', xp: 45, emoji: '🦜',
    caption: 'Rare sighting in Bannerghatta! These birds are disappearing fast due to habitat loss. 💚',
    location: 'Bannerghatta, Bangalore', aqi: 57, createdAt: t(24),
    spottedBy: ['u1', 'u4', 'u7'], comments: 9, isStory: false,
  },
  {
    id: 'mp7', userId: 'u7', username: 'LeoWildMH', city: 'Pune',
    species: 'Sloth Bear', scientific: 'Melursus ursinus',
    rarity: 'Rare', xp: 100, emoji: '🐻',
    caption: 'Mama bear with her cub at Tadoba! Kept my distance and just watched in awe for 10 minutes.',
    location: 'Tadoba, Maharashtra', aqi: 28, createdAt: t(30),
    spottedBy: ['u1', 'u2', 'u3', 'u5'], comments: 18, isStory: true,
  },
  {
    id: 'mp8', userId: 'u8', username: 'NayanTrek', city: 'Mumbai',
    species: 'Spotted Deer', scientific: 'Axis axis',
    rarity: 'Common', xp: 15, emoji: '🦌',
    caption: 'Morning walk in Aarey — spotted a family of chital grazing peacefully in the mist.',
    location: 'Aarey, Mumbai', aqi: 51, createdAt: t(36),
    spottedBy: ['u3', 'u6', 'u2'], comments: 5, isStory: false,
  },
];

const SEED_COMMENTS = {
  mp2: [
    { id: 'c1', author: 'ArjunWild',    text: 'Incredible sighting! How close were you? 🐯',         createdAt: t(4.5) },
    { id: 'c2', author: 'PriyaNature',  text: 'Jim Corbett never disappoints. Lucky you! 🌿',         createdAt: t(4.2) },
    { id: 'c3', author: 'SnehaWings',   text: 'This is legendary! How long did it stay in view?',     createdAt: t(3.8) },
    { id: 'c4', author: 'LeoWildMH',    text: 'The conservation work there is paying off 🙏',         createdAt: t(3.2) },
  ],
  mp3: [
    { id: 'c5', author: 'NayanTrek',    text: 'Did you turn off your engine? Elephants respond well to silence', createdAt: t(7.5) },
    { id: 'c6', author: 'RaviForest',   text: 'Bandipur corridor is so important for their migration', createdAt: t(7.1) },
  ],
  mp5: [
    { id: 'c7', author: 'BirdQueenCHN', text: 'King Cobras are so misunderstood. Vital for ecosystem!', createdAt: t(17) },
    { id: 'c8', author: 'ArjunWild',    text: 'Please report this location to Forest Dept for protection', createdAt: t(16) },
    { id: 'c9', author: 'TigerEyeDelhi',text: 'Stay safe everyone — keep at least 10 metres distance',  createdAt: t(15) },
  ],
  mp7: [
    { id: 'c10', author: 'PriyaNature', text: 'Sloth bears with cubs are extra protective. Smart move!', createdAt: t(29) },
    { id: 'c11', author: 'SnehaWings',  text: 'Tadoba is the best for sloth bear sightings 🐻',         createdAt: t(28) },
  ],
};

const useSocialStore = create(
  persist(
    (set, get) => ({
      posts:        SEED,
      mySpotted:    {},
      bookmarks:    [],
      postComments: SEED_COMMENTS,

      addPost: (post) =>
        set(s => ({ posts: [post, ...s.posts] })),

      addComment: (postId, text, username) => {
        const comment = {
          id:        `cmt_${Date.now()}`,
          author:    username ?? 'Explorer',
          text:      text.trim(),
          createdAt: new Date().toISOString(),
        };
        set(s => ({
          postComments: {
            ...s.postComments,
            [postId]: [comment, ...(s.postComments[postId] ?? [])],
          },
          posts: s.posts.map(p =>
            p.id === postId ? { ...p, comments: p.comments + 1 } : p
          ),
        }));
      },

      getComments: (postId) => get().postComments[postId] ?? [],

      toggleSpotted: (postId, myUserId) =>
        set(s => {
          const already = !!s.mySpotted[postId];
          const uid = myUserId ?? 'me';
          const posts = s.posts.map(p => {
            if (p.id !== postId) return p;
            const spottedBy = already
              ? p.spottedBy.filter(id => id !== uid)
              : [...p.spottedBy, uid];
            return { ...p, spottedBy };
          });
          return { posts, mySpotted: { ...s.mySpotted, [postId]: !already } };
        }),

      toggleBookmark: (postId) =>
        set(s => ({
          bookmarks: s.bookmarks.includes(postId)
            ? s.bookmarks.filter(id => id !== postId)
            : [...s.bookmarks, postId],
        })),

      isSpotted:    (postId) => !!get().mySpotted[postId],
      isBookmarked: (postId) => get().bookmarks.includes(postId),
      getStories:   ()       => get().posts.filter(p => p.isStory).slice(0, 8),
    }),
    { name: 'snapwild-social-v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);

export default useSocialStore;
