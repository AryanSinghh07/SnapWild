import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import useCatchStore from '../../store/useCatchStore';
import { C } from '../../theme/colors';

export default function DiscoverScreen({ navigation }) {
  const { user } = useAuth();
  const catches       = useCatchStore(s => s.catches);
  const getTotalXP    = useCatchStore(s => s.getTotalXP);
  const uniqueSpecies = useCatchStore(s => s.getUniqueSpecies);

  const totalXP    = getTotalXP();
  const catchCount = catches.length;
  const missionDone = catchCount >= 1;

  const stats = [
    { label: 'Catches',  value: catchCount,              icon: 'paw'   },
    { label: 'Total XP', value: totalXP,                 icon: 'flash' },
    { label: 'Streak',   value: `${user?.streak ?? 0}d`, icon: 'flame' },
  ];

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Greeting */}
      <View style={s.greeting}>
        <View>
          <Text style={s.greetSub}>Good morning,</Text>
          <Text style={s.greetName}>{user?.username ?? 'Explorer'} 🌿</Text>
        </View>
        <View style={s.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={C.muted} />
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {stats.map(st => (
          <View key={st.label} style={s.statCard}>
            <Ionicons name={st.icon} size={18} color={C.accent} />
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Mission */}
      <SectionHeader title="Today's Mission" link="See all" />
      <View style={s.missionCard}>
        <View style={{ flex: 1 }}>
          <View style={s.missionBadge}>
            <Text style={s.missionBadgeText}>NEW</Text>
          </View>
          <Text style={s.missionTitle}>First Catch!</Text>
          <Text style={s.missionSub}>Snap your first wild animal to begin</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: missionDone ? '100%' : '0%' }]} />
          </View>
          <Text style={s.progressText}>{missionDone ? '1 / 1 complete ✓' : '0 / 1 complete'}</Text>
        </View>
        <View style={s.xpBadge}>
          <Ionicons name="flash" size={14} color={C.bg} />
          <Text style={s.xpNum}>+15</Text>
          <Text style={s.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Rarity guide */}
      <SectionHeader title="Rarity Tiers" />
      <View style={s.rarityCard}>
        {[
          { tier: 'Common',    xp: '15 XP',  color: C.gray   },
          { tier: 'Uncommon',  xp: '45 XP',  color: C.green  },
          { tier: 'Rare',      xp: '100 XP', color: C.blue   },
          { tier: 'Legendary', xp: '150+ XP',color: C.orange },
        ].map((r, i, arr) => (
          <View key={r.tier}>
            <View style={s.rarityRow}>
              <View style={[s.rarityDot, { backgroundColor: r.color }]} />
              <Text style={s.rarityName}>{r.tier}</Text>
              <Text style={[s.rarityXP, { color: r.color }]}>{r.xp}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.divider} />}
          </View>
        ))}
      </View>

      {/* Leaderboard entry */}
      <SectionHeader title="Leaderboard" link="See all" onLink={() => navigation.navigate('Leaderboard')} />
      <TouchableOpacity style={s.leaderCard} activeOpacity={0.85} onPress={() => navigation.navigate('Leaderboard')}>
        <View style={s.leaderLeft}>
          <View style={s.leaderIconBox}>
            <Ionicons name="trophy" size={22} color={C.accent} />
          </View>
          <View>
            <Text style={s.leaderTitle}>City Rankings</Text>
            <Text style={s.leaderSub}>See how you rank this month</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Nearby */}
      <SectionHeader title="Nearby Sightings" />
      <View style={s.emptyCard}>
        <Ionicons name="location-outline" size={38} color={C.muted} />
        <Text style={s.emptyTitle}>No sightings nearby yet</Text>
        <Text style={s.emptySub}>Be the first to catch a species in your area!</Text>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title, link, onLink }) {
  return (
    <View style={s.secHeader}>
      <Text style={s.secTitle}>{title}</Text>
      {link && <TouchableOpacity onPress={onLink}><Text style={s.secLink}>{link}</Text></TouchableOpacity>}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  greeting:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16, marginTop: 20 },
  greetSub:  { fontSize: 13, color: C.muted },
  greetName: { fontSize: 20, fontWeight: 'bold', color: C.text },
  notifBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, alignItems: 'center', paddingVertical: 14, gap: 4, borderWidth: 1, borderColor: C.border },
  statValue: { fontSize: 20, fontWeight: 'bold', color: C.text },
  statLabel: { fontSize: 11, color: C.muted },

  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 10 },
  secTitle:  { fontSize: 16, fontWeight: '700', color: C.text },
  secLink:   { fontSize: 13, color: C.accent },

  missionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  missionBadge: { backgroundColor: C.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  missionBadgeText: { fontSize: 10, fontWeight: 'bold', color: C.accent, letterSpacing: 1 },
  missionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  missionSub:   { fontSize: 12, color: C.muted, marginBottom: 12 },
  progressTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 6, backgroundColor: C.accent, borderRadius: 3 },
  progressText:  { fontSize: 11, color: C.muted, marginTop: 6 },
  xpBadge: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', marginLeft: 14, gap: 2 },
  xpNum:   { fontSize: 16, fontWeight: 'bold', color: C.accent },
  xpLabel: { fontSize: 10, color: C.muted },

  rarityCard: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  rarityRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  rarityDot:  { width: 10, height: 10, borderRadius: 5 },
  rarityName: { flex: 1, fontSize: 14, color: C.text, fontWeight: '600' },
  rarityXP:   { fontSize: 13, fontWeight: '700' },
  divider:    { height: 1, backgroundColor: C.border },

  emptyCard:  { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 32, alignItems: 'center', gap: 8, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  emptySub:   { fontSize: 12, color: C.muted, textAlign: 'center' },

  leaderCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  leaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leaderIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' },
  leaderTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  leaderSub:   { fontSize: 12, color: C.muted, marginTop: 2 },
});
