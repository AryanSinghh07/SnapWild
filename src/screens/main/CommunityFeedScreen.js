import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert,
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

const TABS = ['Nearby', 'Trending', 'Following', 'Species'];

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
  const [tab,          setTab]          = useState('Trending');
  const [repostingPost, setRepostingPost] = useState(null);
  const [repostNote,   setRepostNote]   = useState('');
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const catches          = useCatchStore(s => s.catches);
  const posts            = useSocialStore(s => s.posts);
  const mySpotted        = useSocialStore(s => s.mySpotted);
  const bookmarks        = useSocialStore(s => s.bookmarks);
  const flags            = useSocialStore(s => s.flags);
  const followedSpecies  = useSocialStore(s => s.followedSpecies);
  const toggleSpotted    = useSocialStore(s => s.toggleSpotted);
  const toggleBookmark   = useSocialStore(s => s.toggleBookmark);
  const repostWithNote   = useSocialStore(s => s.repostWithNote);
  const flagPost         = useSocialStore(s => s.flagPost);
  const getStories       = useSocialStore(s => s.getStories);

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
      case 'Species':
        return followedSpecies.length > 0
          ? posts.filter(p => followedSpecies.includes(p.species))
          : [];
      default:
        return posts;
    }
  }, [tab, posts, followedSpecies]);

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

        {/* Species empty state */}
        {tab === 'Species' && feed.length === 0 && (
          <View style={s.speciesEmpty}>
            <Text style={s.speciesEmptyEmoji}>🦁</Text>
            <Text style={s.speciesEmptyTitle}>No species followed yet</Text>
            <Text style={s.speciesEmptySub}>
              Open any Species Page and tap Follow to see their catches here
            </Text>
          </View>
        )}

        {/* Posts */}
        {feed.map(post => (
          <PostCard
            key={post.id}
            post={post}
            spotted={!!mySpotted[post.id]}
            bookmarked={bookmarks.includes(post.id)}
            flagged={!!flags[post.id]}
            onSpotted={() => toggleSpotted(post.id, user?.phone ?? 'me')}
            onBookmark={() => toggleBookmark(post.id)}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
            onSpeciesPress={() => navigation.navigate('SpeciesPage', {
              species:    post.species,
              emoji:      post.emoji,
              rarity:     post.rarity,
              scientific: post.scientific ?? '',
            })}
            onRepost={() => { setRepostingPost(post); setRepostNote(''); }}
            onFlag={() => Alert.alert('Flag Post', 'Why are you flagging this?', [
              { text: 'Wrong species ID',    onPress: () => flagPost(post.id, 'wrong-id')      },
              { text: 'False rescue claim',  onPress: () => flagPost(post.id, 'false-rescue')  },
              { text: 'Harmful content',     onPress: () => flagPost(post.id, 'harmful')       },
              { text: 'Cancel', style: 'cancel' },
            ])}
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

      {/* Repost modal */}
      <RepostModal
        post={repostingPost}
        note={repostNote}
        onChangeNote={setRepostNote}
        onClose={() => setRepostingPost(null)}
        onSubmit={() => {
          repostWithNote(repostingPost, repostNote, user?.username ?? 'Explorer');
          setRepostingPost(null);
        }}
      />
    </View>
  );
}

function PostCard({ post, spotted, bookmarked, flagged, onSpotted, onBookmark, onPress, onSpeciesPress, onRepost, onFlag }) {
  const color = RARITY_COLOR[post.rarity] ?? C.gray;
  const aqiC  = aqiColor(post.aqi);

  return (
    <TouchableOpacity style={[s.card, flagged && s.cardFlagged]} onPress={onPress} activeOpacity={0.92}>
      {/* Repost header */}
      {post.repostedFrom && (
        <View style={s.repostHeader}>
          <Ionicons name="repeat" size={12} color={C.muted} />
          <Text style={s.repostHeaderText}>Reposted from @{post.repostedFrom}</Text>
        </View>
      )}

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
        <TouchableOpacity style={s.moreBtn} onPress={onFlag} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={16} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* Species box */}
      <TouchableOpacity
        style={[s.speciesBox, { backgroundColor: color + '12', borderColor: color + '30' }]}
        onPress={onSpeciesPress}
        activeOpacity={0.8}
      >
        <Text style={s.speciesBoxEmoji}>{post.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.speciesBoxName}>{post.species}</Text>
          <Text style={s.speciesBoxSci}>{post.scientific}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={C.muted} />
      </TouchableOpacity>

      {/* Caption */}
      <Text style={s.caption}>{post.caption}</Text>

      {/* Pet tag */}
      {post.petName && (
        <View style={s.petTag}>
          <Text style={s.petTagEmoji}>🐾</Text>
          <Text style={s.petTagText}>with {post.petName}</Text>
        </View>
      )}

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

      {/* Flag indicator */}
      {flagged && (
        <View style={s.flaggedBadge}>
          <Ionicons name="flag" size={11} color={C.red} />
          <Text style={s.flaggedText}>Flagged for review</Text>
        </View>
      )}

      {/* Action bar */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionBtn} onPress={onSpotted} activeOpacity={0.7}>
          <Ionicons name={spotted ? 'eye' : 'eye-outline'} size={18} color={spotted ? C.accent : C.muted} />
          <Text style={[s.actionCount, spotted && s.actionActive]}>{post.spottedBy.length}</Text>
          <Text style={[s.actionLabel, spotted && s.actionActive]}>Spotted</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={17} color={C.muted} />
          <Text style={s.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={onRepost} activeOpacity={0.7}>
          <Ionicons name="repeat" size={18} color={C.muted} />
          <Text style={s.actionLabel}>Repost</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionBtn, { marginLeft: 'auto' }]} onPress={onBookmark} activeOpacity={0.7}>
          <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? C.accent : C.muted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function RepostModal({ post, note, onChangeNote, onClose, onSubmit }) {
  if (!post) return null;
  const color = RARITY_COLOR[post.rarity] ?? C.gray;
  return (
    <Modal transparent animationType="slide" visible={!!post} onRequestClose={onClose}>
      <TouchableOpacity style={rm.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={rm.card} activeOpacity={1}>
          <View style={rm.handle} />
          <Text style={rm.title}>Repost with Note</Text>

          {/* Original post preview */}
          <View style={[rm.preview, { borderColor: color + '40' }]}>
            <Text style={rm.previewEmoji}>{post.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={rm.previewSpecies}>{post.species}</Text>
              <Text style={rm.previewUser}>by @{post.username}</Text>
            </View>
            <View style={[rm.previewRarity, { backgroundColor: color + '20' }]}>
              <Text style={[rm.previewRarityText, { color }]}>{post.rarity}</Text>
            </View>
          </View>

          <TextInput
            style={rm.input}
            placeholder="Add your thoughts... (optional)"
            placeholderTextColor={C.muted}
            value={note}
            onChangeText={onChangeNote}
            multiline
            maxLength={200}
            autoFocus
          />
          <Text style={rm.charCount}>{note.length}/200</Text>

          <TouchableOpacity style={rm.submitBtn} onPress={onSubmit} activeOpacity={0.85}>
            <Ionicons name="repeat" size={18} color={C.bg} />
            <Text style={rm.submitText}>Repost to Community</Text>
          </TouchableOpacity>
          <TouchableOpacity style={rm.cancelBtn} onPress={onClose}>
            <Text style={rm.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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

  // Repost header
  repostHeader:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  repostHeaderText: { fontSize: 11, color: C.muted, fontStyle: 'italic' },

  // More button
  moreBtn: { padding: 4 },

  // Pet tag
  petTag:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  petTagEmoji: { fontSize: 13 },
  petTagText:  { fontSize: 12, color: C.muted, fontStyle: 'italic' },

  // Flag
  cardFlagged:  { borderColor: C.red + '40' },
  flaggedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  flaggedText:  { fontSize: 11, color: C.red, fontWeight: '600' },

  // Species empty
  speciesEmpty:      { alignItems: 'center', padding: 40, gap: 10 },
  speciesEmptyEmoji: { fontSize: 48 },
  speciesEmptyTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  speciesEmptySub:   { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
});

// Repost modal styles
const rm = StyleSheet.create({
  overlay:           { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  card:              { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 12 },
  handle:            { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  title:             { fontSize: 17, fontWeight: '700', color: C.text },
  preview:           { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card2, borderRadius: 12, padding: 12, borderWidth: 1 },
  previewEmoji:      { fontSize: 26 },
  previewSpecies:    { fontSize: 14, fontWeight: '700', color: C.text },
  previewUser:       { fontSize: 11, color: C.muted },
  previewRarity:     { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  previewRarityText: { fontSize: 10, fontWeight: '700' },
  input:             { backgroundColor: C.card2, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, minHeight: 80, textAlignVertical: 'top' },
  charCount:         { textAlign: 'right', fontSize: 11, color: C.muted, marginTop: -6 },
  submitBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16 },
  submitText:        { fontSize: 15, fontWeight: 'bold', color: C.bg },
  cancelBtn:         { alignItems: 'center', paddingVertical: 8 },
  cancelText:        { fontSize: 14, color: C.muted },
});
