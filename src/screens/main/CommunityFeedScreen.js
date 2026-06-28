import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import useCatchStore from '../../store/useCatchStore';
import useSocialStore from '../../store/useSocialStore';
import { C } from '../../theme/colors';

const RARITY_COLOR = {
  Common: C.gray, Uncommon: C.green, Rare: C.blue, Legendary: C.orange,
};

const TABS = ['Nearby', 'Trending', 'Following'];

function timeAgo(iso) {
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  if (mins < 60) return `${Math.floor(Math.max(mins, 1))}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function aqiColor(aqi) {
  if (aqi == null) return C.muted;
  if (aqi < 50)  return C.green;
  if (aqi < 100) return '#CDDC39';
  if (aqi < 150) return C.orange;
  return C.red;
}

function getEmoji(name) {
  if (!name) return '🐾';
  const n = name.toLowerCase();
  const map = {
    peacock: '🦚', tiger: '🐯', elephant: '🐘', cobra: '🐍', bear: '🐻',
    hornbill: '🦜', parrot: '🦜', deer: '🦌', leopard: '🐆', cheetah: '🐆',
    monkey: '🐒', crocodile: '🐊', flamingo: '🦩', eagle: '🦅', owl: '🦉',
    dolphin: '🐬', turtle: '🐢', snake: '🐍', frog: '🐸', fish: '🐟',
    lion: '🦁', rhino: '🦏', buffalo: '🐃', wolf: '🐺', fox: '🦊',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (n.includes(key)) return emoji;
  }
  return '🐾';
}

export default function CommunityFeedScreen({ navigation }) {
  const [tab, setTab]   = useState('Trending');
  const insets          = useSafeAreaInsets();
  const { user }        = useAuth();

  const catches        = useCatchStore(s => s.catches);
  const posts          = useSocialStore(s => s.posts);
  const mySpotted      = useSocialStore(s => s.mySpotted);
  const bookmarks      = useSocialStore(s => s.bookmarks);
  const toggleSpotted  = useSocialStore(s => s.toggleSpotted);
  const toggleBookmark = useSocialStore(s => s.toggleBookmark);
  const getStories     = useSocialStore(s => s.getStories);

  const stories  = getStories();
  const myStory  = catches.find(c => c.rarity === 'Rare' || c.rarity === 'Legendary');

  const feed = useMemo(() => {
    switch (tab) {
      case 'Nearby':
        return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
      case 'Trending':
        return [...posts].sort((a, b) => b.spottedBy.length - a.spottedBy.length);
      case 'Following':
        return posts.filter((_, i) => [0, 2, 4, 6].includes(i));
      default:
        return posts;
    }
  }, [tab, posts]);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Community</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="search-outline" size={20} color={C.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={C.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Stories row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.storiesScroll}
          contentContainerStyle={s.storiesRow}
        >
          {/* My story / Add */}
          <TouchableOpacity
            style={s.storyItem}
            onPress={() => navigation.navigate('SnapHome')}
            activeOpacity={0.8}
          >
            <View style={[
              s.storyRing,
              myStory
                ? { borderColor: RARITY_COLOR[myStory.rarity] }
                : { borderColor: C.muted, borderStyle: 'dashed' },
            ]}>
              <View style={[s.storyAvatar, { backgroundColor: C.card }]}>
                {myStory
                  ? <Text style={s.storyEmoji}>{getEmoji(myStory.name)}</Text>
                  : <Ionicons name="add" size={24} color={C.muted} />}
              </View>
            </View>
            <Text style={s.storyLabel} numberOfLines={1}>
              {myStory ? 'My catch' : 'Add story'}
            </Text>
          </TouchableOpacity>

          {/* Community stories */}
          {stories.map(p => (
            <TouchableOpacity key={p.id} style={s.storyItem} activeOpacity={0.8}>
              <View style={[s.storyRing, { borderColor: RARITY_COLOR[p.rarity] }]}>
                <View style={[s.storyAvatar, { backgroundColor: C.card2 }]}>
                  <Text style={s.storyEmoji}>{p.emoji}</Text>
                </View>
              </View>
              <Text style={s.storyLabel} numberOfLines={1}>{p.username}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed tabs */}
        <View style={s.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.tabPill, tab === t && s.tabPillActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts */}
        {feed.map(post => (
          <PostCard
            key={post.id}
            post={post}
            spotted={!!mySpotted[post.id]}
            bookmarked={bookmarks.includes(post.id)}
            onSpotted={() => toggleSpotted(post.id, user?.phone ?? 'me')}
            onBookmark={() => toggleBookmark(post.id)}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          />
        ))}
      </ScrollView>

      {/* Create Post FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={C.bg} />
      </TouchableOpacity>
    </View>
  );
}

function PostCard({ post, spotted, bookmarked, onSpotted, onBookmark, onPress }) {
  const color = RARITY_COLOR[post.rarity] ?? C.gray;
  const aqiC  = aqiColor(post.aqi);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.92}>
      {/* Author row */}
      <View style={s.cardTop}>
        <View style={[s.cardAvatar, { backgroundColor: C.primary }]}>
          <Text style={s.cardAvatarLetter}>{post.username[0].toUpperCase()}</Text>
        </View>
        <View style={s.cardMeta}>
          <Text style={s.cardUsername}>{post.username}</Text>
          <Text style={s.cardSubMeta}>📍 {post.location} · {timeAgo(post.createdAt)}</Text>
        </View>
        {post.isStory && (
          <View style={[s.rarityPill, { backgroundColor: color + '25', borderColor: color + '60' }]}>
            <Text style={[s.rarityPillText, { color }]}>{post.rarity}</Text>
          </View>
        )}
      </View>

      {/* Species box */}
      <View style={[s.speciesBox, { backgroundColor: color + '12', borderColor: color + '30' }]}>
        <Text style={s.speciesBoxEmoji}>{post.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.speciesBoxName}>{post.species}</Text>
          <Text style={s.speciesBoxSci}>{post.scientific}</Text>
        </View>
      </View>

      {/* Caption */}
      <Text style={s.caption}>{post.caption}</Text>

      {/* Tags */}
      <View style={s.tagsRow}>
        <View style={s.xpTag}>
          <Ionicons name="flash" size={11} color={C.accent} />
          <Text style={s.xpTagText}>+{post.xp} XP</Text>
        </View>
        {post.aqi != null && (
          <View style={[s.aqiTag, { backgroundColor: aqiC + '20' }]}>
            <Text style={[s.aqiTagText, { color: aqiC }]}>AQI {post.aqi}</Text>
          </View>
        )}
        <View style={[s.rarityTag, { backgroundColor: color + '20' }]}>
          <Text style={[s.rarityTagText, { color }]}>{post.rarity}</Text>
        </View>
      </View>

      {/* Action bar */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionBtn} onPress={onSpotted} activeOpacity={0.7}>
          <Ionicons
            name={spotted ? 'eye' : 'eye-outline'}
            size={18}
            color={spotted ? C.accent : C.muted}
          />
          <Text style={[s.actionCount, spotted && s.actionActive]}>{post.spottedBy.length}</Text>
          <Text style={[s.actionLabel, spotted && s.actionActive]}>Spotted</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={17} color={C.muted} />
          <Text style={s.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, { marginLeft: 'auto' }]}
          onPress={onBookmark}
          activeOpacity={0.7}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={bookmarked ? C.accent : C.muted}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },

  storiesScroll: { maxHeight: 100, marginBottom: 4 },
  storiesRow:    { paddingHorizontal: 16, gap: 14, paddingBottom: 8 },
  storyItem:     { alignItems: 'center', width: 64 },
  storyRing: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', padding: 2,
  },
  storyAvatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  storyEmoji: { fontSize: 26 },
  storyLabel: { fontSize: 10, color: C.muted, marginTop: 5, textAlign: 'center' },

  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 14,
    backgroundColor: C.card, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: C.border,
  },
  tabPill:       { flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center' },
  tabPillActive: { backgroundColor: C.primary },
  tabText:       { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.accent },

  card: {
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  cardAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  cardAvatarLetter: { fontSize: 16, fontWeight: 'bold', color: C.text },
  cardMeta:   { flex: 1 },
  cardUsername: { fontSize: 13, fontWeight: '700', color: C.text },
  cardSubMeta:  { fontSize: 11, color: C.muted, marginTop: 1 },
  rarityPill: {
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3,
  },
  rarityPillText: { fontSize: 10, fontWeight: '700' },

  speciesBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1,
  },
  speciesBoxEmoji: { fontSize: 30 },
  speciesBoxName:  { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  speciesBoxSci:   { fontSize: 11, color: C.muted, fontStyle: 'italic' },

  caption: { fontSize: 13, color: C.text, lineHeight: 20, marginBottom: 10 },

  tagsRow:     { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  xpTag:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.accent + '20', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  xpTagText:   { fontSize: 11, fontWeight: '700', color: C.accent },
  aqiTag:      { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  aqiTagText:  { fontSize: 11, fontWeight: '700' },
  rarityTag:   { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  rarityTagText: { fontSize: 11, fontWeight: '700' },

  actionsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 18,
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12,
  },
  actionBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, fontWeight: '600', color: C.muted },
  actionLabel: { fontSize: 13, color: C.muted },
  actionActive: { color: C.accent },

  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
});
