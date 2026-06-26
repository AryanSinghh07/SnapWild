import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import useFriendStore from '../../store/useFriendStore';
import { C } from '../../theme/colors';

export default function FriendsScreen({ navigation }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const insets = useSafeAreaInsets();

  const allUsers      = useFriendStore(s => s.allUsers);
  const requests      = useFriendStore(s => s.requests);
  const friends       = useFriendStore(s => s.friends);
  const sentRequests  = useFriendStore(s => s.sentRequests);
  const searchUsers   = useFriendStore(s => s.searchUsers);
  const sendRequest   = useFriendStore(s => s.sendRequest);
  const cancelRequest = useFriendStore(s => s.cancelRequest);
  const acceptRequest = useFriendStore(s => s.acceptRequest);
  const declineRequest = useFriendStore(s => s.declineRequest);
  const getOrCreateConv = useFriendStore(s => s.getOrCreateConv);

  const friendIds = friends.map(f => f.id);
  const sentIds   = sentRequests.map(r => r.toId);
  const reqFromIds = requests.map(r => r.from.id);

  const suggestions = allUsers.filter(
    u => !friendIds.includes(u.id) && !sentIds.includes(u.id) && !reqFromIds.includes(u.id)
  );

  const handleSearch = (q) => {
    setQuery(q);
    setResults(q.trim() ? searchUsers(q) : []);
  };

  const handleMessage = (friend) => {
    const conv = getOrCreateConv(friend);
    navigation.navigate('Chat', { convId: conv.id, friend });
  };

  const handleAdd = (user) => {
    sendRequest(user);
    Haptics.selectionAsync();
  };

  const handleAccept = (requestId) => {
    acceptRequest(requestId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={C.muted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Search results */}
        {query.trim().length > 0 && (
          <>
            <SectionHeader title={`Results for "${query}"`} />
            {results.length === 0 ? (
              <View style={s.emptySmall}>
                <Text style={s.emptySmallText}>No users found</Text>
              </View>
            ) : (
              results.map(u => (
                <UserRow
                  key={u.id}
                  user={u}
                  isFriend={u.isFriend}
                  isPending={u.isPending}
                  onAdd={() => handleAdd(u)}
                  onCancel={() => cancelRequest(u.id)}
                  onMessage={() => handleMessage(u)}
                />
              ))
            )}
          </>
        )}

        {/* Friend Requests */}
        {!query && requests.length > 0 && (
          <>
            <SectionHeader title={`Friend Requests  ${requests.length}`} />
            {requests.map(req => (
              <View key={req.id} style={s.requestRow}>
                <View style={s.reqAvatar}>
                  <Text style={s.reqAvatarLetter}>{req.from.username[0].toUpperCase()}</Text>
                </View>
                <View style={s.reqInfo}>
                  <Text style={s.reqName}>{req.from.username}</Text>
                  <Text style={s.reqMeta}>{req.from.city} · {req.from.catches} catches</Text>
                </View>
                <View style={s.reqBtns}>
                  <TouchableOpacity style={s.acceptBtn} onPress={() => handleAccept(req.id)}>
                    <Text style={s.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.declineBtn} onPress={() => declineRequest(req.id)}>
                    <Text style={s.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Friends */}
        {!query && friends.length > 0 && (
          <>
            <SectionHeader title={`Friends  ${friends.length}`} />
            {friends.map(f => (
              <UserRow
                key={f.id}
                user={f}
                isFriend={true}
                isPending={false}
                onMessage={() => handleMessage(f)}
              />
            ))}
          </>
        )}

        {/* Suggestions */}
        {!query && (
          <>
            <SectionHeader title="People You May Know" />
            {suggestions.slice(0, 8).map(u => (
              <UserRow
                key={u.id}
                user={u}
                isFriend={false}
                isPending={sentIds.includes(u.id)}
                onAdd={() => handleAdd(u)}
                onCancel={() => cancelRequest(u.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function UserRow({ user, isFriend, isPending, onAdd, onCancel, onMessage }) {
  return (
    <View style={s.userRow}>
      <View style={[s.userAvatar, isFriend && s.userAvatarFriend]}>
        <Text style={s.userAvatarLetter}>{user.username[0].toUpperCase()}</Text>
      </View>
      <View style={s.userInfo}>
        <Text style={s.userName}>{user.username}</Text>
        <Text style={s.userMeta}>{user.city} · {user.catches} catches</Text>
      </View>
      {isFriend ? (
        <TouchableOpacity style={s.msgBtn} onPress={onMessage} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={14} color={C.accent} />
          <Text style={s.msgBtnText}>Message</Text>
        </TouchableOpacity>
      ) : isPending ? (
        <TouchableOpacity style={s.pendingBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={s.pendingBtnText}>Pending ✕</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.addBtn} onPress={onAdd} activeOpacity={0.7}>
          <Ionicons name="person-add" size={14} color={C.bg} />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
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

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle:  { fontSize: 14, fontWeight: '700', color: C.muted, letterSpacing: 0.3 },

  emptySmall:     { paddingHorizontal: 16, paddingVertical: 12 },
  emptySmallText: { fontSize: 13, color: C.muted },

  // Request row
  requestRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, gap: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  reqAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  reqAvatarLetter: { fontSize: 18, fontWeight: 'bold', color: C.text },
  reqInfo: { flex: 1 },
  reqName: { fontSize: 14, fontWeight: '700', color: C.text },
  reqMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  reqBtns: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    backgroundColor: C.accent, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: C.bg },
  declineBtn: {
    backgroundColor: C.card2, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.border,
  },
  declineBtnText: { fontSize: 13, fontWeight: '700', color: C.muted },

  // User row
  userRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.card2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  userAvatarFriend: { backgroundColor: C.primary, borderColor: C.accent },
  userAvatarLetter: { fontSize: 18, fontWeight: 'bold', color: C.text },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '700', color: C.text },
  userMeta: { fontSize: 12, color: C.muted, marginTop: 2 },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: C.bg },

  pendingBtn: {
    backgroundColor: C.card2, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.border,
  },
  pendingBtnText: { fontSize: 12, fontWeight: '600', color: C.muted },

  msgBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.accent + '20', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.accent + '40',
  },
  msgBtnText: { fontSize: 13, fontWeight: '700', color: C.accent },
});
