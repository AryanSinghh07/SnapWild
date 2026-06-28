import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSocialStore from '../../store/useSocialStore';
import { useAuth }    from '../../context/AuthContext';
import { C } from '../../theme/colors';

const RARITY_COLOR = { Common: C.gray, Uncommon: C.green, Rare: C.blue, Legendary: C.orange };

function timeAgo(iso) {
  const mins = (Date.now() - new Date(iso)) / 60000;
  if (mins < 60)   return `${Math.floor(Math.max(mins, 1))}m ago`;
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

export default function PostDetailScreen({ route, navigation }) {
  const { postId }   = route.params;
  const insets       = useSafeAreaInsets();
  const { user }     = useAuth();

  const post         = useSocialStore(s => s.posts.find(p => p.id === postId));
  const comments     = useSocialStore(s => s.getComments(postId));
  const mySpotted    = useSocialStore(s => s.mySpotted);
  const bookmarks    = useSocialStore(s => s.bookmarks);
  const toggleSpotted= useSocialStore(s => s.toggleSpotted);
  const toggleBookmark= useSocialStore(s => s.toggleBookmark);
  const addComment   = useSocialStore(s => s.addComment);

  const [text, setText] = React.useState('');
  const scrollRef = React.useRef(null);

  if (!post) {
    return (
      <View style={[s.screen, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.muted }}>Post not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: C.accent }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rarityColor = RARITY_COLOR[post.rarity] ?? C.gray;
  const spotted     = !!mySpotted[postId];
  const bookmarked  = bookmarks.includes(postId);
  const aqiC        = aqiColor(post.aqi);

  function handleSpotted() {
    toggleSpotted(postId, user?.phone ?? 'me');
    if (!spotted) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.selectionAsync();
  }

  function handleBookmark() {
    toggleBookmark(postId);
    Haptics.selectionAsync();
  }

  function handleComment() {
    const t = text.trim();
    if (!t) return;
    addComment(postId, t, user?.username ?? 'Explorer');
    setText('');
    Haptics.selectionAsync();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Post</Text>
        <TouchableOpacity style={s.bookmarkBtn} onPress={handleBookmark}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? C.accent : C.muted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Post card */}
        <View style={s.postCard}>
          {/* Author */}
          <View style={s.authorRow}>
            <View style={[s.avatar, { backgroundColor: C.primary }]}>
              <Text style={s.avatarLetter}>{post.username[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.username}>{post.username}</Text>
              <Text style={s.metaSub}>📍 {post.location} · {timeAgo(post.createdAt)}</Text>
            </View>
            {post.isStory && (
              <View style={[s.rarityPill, { backgroundColor: rarityColor + '25', borderColor: rarityColor + '60' }]}>
                <Text style={[s.rarityPillText, { color: rarityColor }]}>{post.rarity}</Text>
              </View>
            )}
          </View>

          {/* Species box */}
          <View style={[s.speciesBox, { backgroundColor: rarityColor + '12', borderColor: rarityColor + '30' }]}>
            <Text style={s.speciesEmoji}>{post.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.speciesName}>{post.species}</Text>
              {!!post.scientific && <Text style={s.speciesSci}>{post.scientific}</Text>}
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
            <View style={[s.rarityTag, { backgroundColor: rarityColor + '20' }]}>
              <Text style={[s.rarityTagText, { color: rarityColor }]}>{post.rarity}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.actionBtn} onPress={handleSpotted} activeOpacity={0.7}>
              <Ionicons name={spotted ? 'eye' : 'eye-outline'} size={20} color={spotted ? C.accent : C.muted} />
              <Text style={[s.actionCount, spotted && { color: C.accent }]}>{post.spottedBy.length}</Text>
              <Text style={[s.actionLabel, spotted && { color: C.accent }]}>Spotted</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={19} color={C.muted} />
              <Text style={s.actionCount}>{post.comments}</Text>
              <Text style={s.actionLabel}>Comments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Comments section */}
        <View style={s.commentsSection}>
          <Text style={s.commentsTitle}>
            {comments.length === 0 ? 'No comments yet — be the first!' : `Comments (${comments.length})`}
          </Text>

          {comments.map(c => (
            <View key={c.id} style={s.commentCard}>
              <View style={[s.commentAvatar, { backgroundColor: C.primary }]}>
                <Text style={s.commentAvatarLetter}>{c.author[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.commentHeader}>
                  <Text style={s.commentAuthor}>{c.author}</Text>
                  <Text style={s.commentTime}>{timeAgo(c.createdAt)}</Text>
                </View>
                <Text style={s.commentText}>{c.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment input bar */}
      <View style={[s.commentBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={[s.commentAvatar, { backgroundColor: C.primary, flexShrink: 0 }]}>
          <Text style={s.commentAvatarLetter}>{(user?.username ?? 'E')[0].toUpperCase()}</Text>
        </View>
        <TextInput
          style={s.commentInput}
          placeholder="Add a comment…"
          placeholderTextColor={C.muted}
          value={text}
          onChangeText={setText}
          returnKeyType="send"
          onSubmitEditing={handleComment}
          multiline
        />
        <TouchableOpacity
          style={[s.sendBtn, !text.trim() && s.sendBtnOff]}
          disabled={!text.trim()}
          onPress={handleComment}
        >
          <Ionicons name="send" size={16} color={text.trim() ? C.bg : C.muted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  bookmarkBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },

  postCard: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 4 },

  authorRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar:        { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:  { fontSize: 17, fontWeight: '700', color: C.text },
  username:      { fontSize: 14, fontWeight: '700', color: C.text },
  metaSub:       { fontSize: 11, color: C.muted, marginTop: 1 },
  rarityPill:    { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  rarityPillText:{ fontSize: 10, fontWeight: '700' },

  speciesBox:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1 },
  speciesEmoji: { fontSize: 32 },
  speciesName:  { fontSize: 16, fontWeight: '700', color: C.text },
  speciesSci:   { fontSize: 11, color: C.muted, fontStyle: 'italic', marginTop: 2 },

  caption: { fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 12 },

  tagsRow:      { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  xpTag:        { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.accent + '20', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  xpTagText:    { fontSize: 11, fontWeight: '700', color: C.accent },
  aqiTag:       { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  aqiTagText:   { fontSize: 11, fontWeight: '700' },
  rarityTag:    { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  rarityTagText:{ fontSize: 11, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  actionBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount:{ fontSize: 14, fontWeight: '600', color: C.muted },
  actionLabel:{ fontSize: 13, color: C.muted },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },

  commentsSection: { paddingHorizontal: 16, paddingTop: 4 },
  commentsTitle:   { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 16 },

  commentCard:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  commentAvatar:      { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentAvatarLetter:{ fontSize: 14, fontWeight: '700', color: C.text },
  commentHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentAuthor:      { fontSize: 13, fontWeight: '700', color: C.text },
  commentTime:        { fontSize: 11, color: C.muted },
  commentText:        { fontSize: 13, color: C.muted, lineHeight: 19 },

  commentBar:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg },
  commentInput: { flex: 1, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, maxHeight: 80 },
  sendBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff:   { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
});
