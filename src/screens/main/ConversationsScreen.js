import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import useFriendStore from '../../store/useFriendStore';
import { C } from '../../theme/colors';

function timeAgo(iso) {
  if (!iso) return '';
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  if (mins < 1)    return 'now';
  if (mins < 60)   return `${Math.floor(mins)}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

export default function ConversationsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const insets  = useSafeAreaInsets();
  const { user } = useAuth();

  const conversations  = useFriendStore(s => s.conversations);
  const requests       = useFriendStore(s => s.requests);
  const getTotalUnread = useFriendStore(s => s.getTotalUnread);

  const filtered = query
    ? conversations.filter(c =>
        c.friend.username.toLowerCase().includes(query.toLowerCase())
      )
    : conversations;

  const lastMsg = (conv) => conv.messages[conv.messages.length - 1] ?? null;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{user?.username ?? 'Messages'}</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => navigation.navigate('Friends')}
        >
          <Ionicons name="person-add-outline" size={20} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={C.muted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Friend requests teaser */}
      {requests.length > 0 && !query && (
        <TouchableOpacity
          style={s.requestsTeaser}
          onPress={() => navigation.navigate('Friends')}
          activeOpacity={0.8}
        >
          <View style={s.reqAvatarStack}>
            {requests.slice(0, 3).map((r, i) => (
              <View
                key={r.id}
                style={[s.reqStackAvatar, { marginLeft: i > 0 ? -12 : 0, zIndex: 3 - i }]}
              >
                <Text style={s.reqStackLetter}>{r.from.username[0].toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.reqTitle}>Friend Requests</Text>
            <Text style={s.reqSub}>
              {requests.length} pending request{requests.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={s.reqBadge}>
            <Text style={s.reqBadgeText}>{requests.length}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={C.muted} />
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>💬</Text>
            <Text style={s.emptyTitle}>
              {query ? 'No conversations match' : 'No messages yet'}
            </Text>
            <Text style={s.emptySub}>
              {query ? 'Try a different name' : 'Add friends to start chatting'}
            </Text>
            {!query && (
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('Friends')}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add" size={16} color={C.bg} />
                <Text style={s.emptyBtnText}>Find Friends</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Messages</Text>
            </View>
            {filtered.map(conv => {
              const last = lastMsg(conv);
              return (
                <TouchableOpacity
                  key={conv.id}
                  style={s.convRow}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Chat', { convId: conv.id, friend: conv.friend })}
                >
                  <View style={s.convAvatar}>
                    <Text style={s.convAvatarLetter}>{conv.friend.username[0].toUpperCase()}</Text>
                    <View style={s.onlineDot} />
                  </View>
                  <View style={s.convInfo}>
                    <Text style={s.convName}>{conv.friend.username}</Text>
                    <Text
                      style={[s.convLast, conv.unread > 0 && s.convLastBold]}
                      numberOfLines={1}
                    >
                      {last
                        ? (last.fromMe ? `You: ${last.text}` : last.text)
                        : 'Say hello! 👋'}
                    </Text>
                  </View>
                  <View style={s.convRight}>
                    {last && <Text style={s.convTime}>{timeAgo(last.time)}</Text>}
                    {conv.unread > 0 && (
                      <View style={s.unreadBadge}>
                        <Text style={s.unreadText}>{conv.unread}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
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
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  requestsTeaser: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border,
  },
  reqAvatarStack: { flexDirection: 'row' },
  reqStackAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg,
  },
  reqStackLetter: { fontSize: 13, fontWeight: 'bold', color: C.text },
  reqTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  reqSub:   { fontSize: 12, color: C.muted, marginTop: 1 },
  reqBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  reqBadgeText: { fontSize: 11, fontWeight: 'bold', color: C.bg },

  sectionHeader: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: C.muted },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },
  emptySub:   { fontSize: 13, color: C.muted, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16,
    backgroundColor: C.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14,
  },
  emptyBtnText: { fontSize: 15, fontWeight: 'bold', color: C.bg },

  convRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  convAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  convAvatarLetter: { fontSize: 20, fontWeight: 'bold', color: C.text },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.green, borderWidth: 2, borderColor: C.bg,
  },
  convInfo:     { flex: 1 },
  convName:     { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  convLast:     { fontSize: 13, color: C.muted },
  convLastBold: { color: C.text, fontWeight: '600' },
  convRight:    { alignItems: 'flex-end', gap: 4 },
  convTime:     { fontSize: 11, color: C.muted },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontWeight: 'bold', color: C.bg },
});
