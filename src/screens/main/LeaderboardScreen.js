import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import useCatchStore from '../../store/useCatchStore';
import { C } from '../../theme/colors';

const TABS = ['City', 'State', 'National'];

const MOCK = {
  City: [
    { username: 'ArjunWild',    city: 'Mumbai',    xp: 2340, catches: 18 },
    { username: 'PriyaNature',  city: 'Mumbai',    xp: 1980, catches: 15 },
    { username: 'RaviForest',   city: 'Mumbai',    xp: 1650, catches: 12 },
    { username: 'SnehaWings',   city: 'Mumbai',    xp: 1200, catches: 9  },
    { username: 'KaranBirds',   city: 'Mumbai',    xp: 950,  catches: 7  },
    { username: 'MeeraLeaves',  city: 'Mumbai',    xp: 780,  catches: 6  },
    { username: 'TarunSafari',  city: 'Mumbai',    xp: 600,  catches: 5  },
    { username: 'AnanyaWild',   city: 'Mumbai',    xp: 450,  catches: 4  },
    { username: 'DevPaws',      city: 'Mumbai',    xp: 300,  catches: 3  },
    { username: 'RiyaGreen',    city: 'Mumbai',    xp: 150,  catches: 1  },
  ],
  State: [
    { username: 'ArjunWild',    city: 'Mumbai',      xp: 2340, catches: 18 },
    { username: 'LeoWildMH',    city: 'Pune',        xp: 2100, catches: 16 },
    { username: 'PriyaNature',  city: 'Mumbai',      xp: 1980, catches: 15 },
    { username: 'NayanTrek',    city: 'Nashik',      xp: 1740, catches: 13 },
    { username: 'RaviForest',   city: 'Mumbai',      xp: 1650, catches: 12 },
    { username: 'IshaJungle',   city: 'Nagpur',      xp: 1410, catches: 11 },
    { username: 'SnehaWings',   city: 'Mumbai',      xp: 1200, catches: 9  },
    { username: 'VinayBirds',   city: 'Kolhapur',    xp: 1050, catches: 8  },
    { username: 'KaranBirds',   city: 'Mumbai',      xp: 950,  catches: 7  },
    { username: 'MeeraLeaves',  city: 'Mumbai',      xp: 780,  catches: 6  },
  ],
  National: [
    { username: 'TigerEyeDelhi', city: 'Delhi',     xp: 5820, catches: 44 },
    { username: 'WildSoulKochi', city: 'Kochi',     xp: 4950, catches: 38 },
    { username: 'LeopardMindBLR',city: 'Bengaluru', xp: 4320, catches: 33 },
    { username: 'BirdQueenCHN', city: 'Chennai',    xp: 3780, catches: 29 },
    { username: 'ArjunWild',    city: 'Mumbai',     xp: 2340, catches: 18 },
    { username: 'LeoWildMH',    city: 'Pune',       xp: 2100, catches: 16 },
    { username: 'PriyaNature',  city: 'Mumbai',     xp: 1980, catches: 15 },
    { username: 'NaturePathHYD',city: 'Hyderabad',  xp: 1860, catches: 14 },
    { username: 'NayanTrek',    city: 'Nashik',     xp: 1740, catches: 13 },
    { username: 'RaviForest',   city: 'Mumbai',     xp: 1650, catches: 12 },
  ],
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen({ navigation }) {
  const [tab, setTab] = useState('City');
  const { user }      = useAuth();
  const getTotalXP    = useCatchStore(s => s.getTotalXP);
  const catches       = useCatchStore(s => s.catches);
  const insets        = useSafeAreaInsets();

  const myXP       = getTotalXP();
  const myUsername = user?.username ?? 'You';

  // Build list: inject current user with real XP, sort by XP
  const rawList = MOCK[tab];
  const withMe  = rawList.some(u => u.username === myUsername)
    ? rawList.map(u => u.username === myUsername ? { ...u, xp: myXP, catches: catches.length, isMe: true } : u)
    : [...rawList, { username: myUsername, city: 'Your City', xp: myXP, catches: catches.length, isMe: true }];

  const sorted  = [...withMe].sort((a, b) => b.xp - a.xp);
  const topThree = sorted.slice(0, 3);
  const rest     = sorted.slice(3);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab pills */}
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

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Podium */}
        <View style={s.podium}>
          {/* 2nd */}
          <PodiumCard rank={2} user={topThree[1]} isMe={topThree[1]?.isMe} />
          {/* 1st */}
          <PodiumCard rank={1} user={topThree[0]} isMe={topThree[0]?.isMe} large />
          {/* 3rd */}
          <PodiumCard rank={3} user={topThree[2]} isMe={topThree[2]?.isMe} />
        </View>

        {/* Rest of list */}
        <View style={s.listCard}>
          {rest.map((u, i) => {
            const rank = i + 4;
            return (
              <View key={u.username + rank} style={[s.row, u.isMe && s.rowMe]}>
                <Text style={s.rank}>#{rank}</Text>
                <View style={[s.avatar, u.isMe && s.avatarMe]}>
                  <Text style={s.avatarLetter}>{u.username[0].toUpperCase()}</Text>
                </View>
                <View style={s.userInfo}>
                  <Text style={[s.uname, u.isMe && s.unameMe]}>
                    {u.username}{u.isMe ? ' (You)' : ''}
                  </Text>
                  <Text style={s.ucity}>{u.city} · {u.catches} catches</Text>
                </View>
                <Text style={[s.xp, u.isMe && s.xpMe]}>{u.xp.toLocaleString()} XP</Text>
              </View>
            );
          })}
        </View>

        {/* Resets note */}
        <Text style={s.resetNote}>🔄 Leaderboard resets monthly</Text>
      </ScrollView>
    </View>
  );
}

function PodiumCard({ rank, user, isMe, large }) {
  if (!user) return <View style={{ flex: 1 }} />;
  const color = RANK_COLORS[rank - 1];
  return (
    <View style={[s.podiumCard, large && s.podiumCardLarge]}>
      <View style={[s.podiumAvatar, { borderColor: color }, large && s.podiumAvatarLarge, isMe && s.avatarMe]}>
        <Text style={[s.podiumLetter, large && { fontSize: 26 }]}>{user.username[0].toUpperCase()}</Text>
      </View>
      <View style={[s.podiumBadge, { backgroundColor: color }]}>
        <Text style={s.podiumBadgeText}>#{rank}</Text>
      </View>
      <Text style={s.podiumName} numberOfLines={1}>{isMe ? 'You' : user.username}</Text>
      <Text style={[s.podiumXP, { color }]}>{user.xp.toLocaleString()}</Text>
      <Text style={s.podiumXPLabel}>XP</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border },
  tabPill: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  tabPillActive: { backgroundColor: C.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.accent },

  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginHorizontal: 16, marginBottom: 24, gap: 8 },
  podiumCard: { flex: 1, alignItems: 'center', backgroundColor: C.card, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 6, borderWidth: 1, borderColor: C.border },
  podiumCardLarge: { paddingVertical: 24, marginBottom: -10 },
  podiumAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 4 },
  podiumAvatarLarge: { width: 64, height: 64, borderRadius: 32 },
  podiumLetter: { fontSize: 20, fontWeight: 'bold', color: C.text },
  podiumBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  podiumBadgeText: { fontSize: 10, fontWeight: 'bold', color: C.bg },
  podiumName: { fontSize: 11, fontWeight: '700', color: C.text, marginBottom: 2, textAlign: 'center' },
  podiumXP: { fontSize: 15, fontWeight: 'bold' },
  podiumXPLabel: { fontSize: 9, color: C.muted },

  listCard: { marginHorizontal: 16, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 },
  rowMe:    { backgroundColor: C.accent + '12' },
  rank:     { fontSize: 13, fontWeight: '700', color: C.muted, width: 28, textAlign: 'center' },
  avatar:   { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  avatarMe: { backgroundColor: C.primary, borderColor: C.accent },
  avatarLetter: { fontSize: 15, fontWeight: 'bold', color: C.text },
  userInfo: { flex: 1 },
  uname:    { fontSize: 13, fontWeight: '700', color: C.text },
  unameMe:  { color: C.accent },
  ucity:    { fontSize: 11, color: C.muted, marginTop: 1 },
  xp:       { fontSize: 13, fontWeight: 'bold', color: C.muted },
  xpMe:     { color: C.accent },

  resetNote: { textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 20 },
});
