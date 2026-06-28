import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import useCatchStore from '../../store/useCatchStore';
import { C } from '../../theme/colors';

const RARITY_COLOR = { Common: C.gray, Uncommon: C.green, Rare: C.blue, Legendary: C.orange };


function greeting(h) {
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function useClock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const MISSIONS = [
  { goal: 1,  title: 'First Catch!',       sub: 'Snap your first wild animal to begin',       xp: 15  },
  { goal: 3,  title: 'Wild Trio',           sub: 'Catch 3 different animals',                  xp: 50  },
  { goal: 5,  title: 'Nature Explorer',     sub: 'Build a collection of 5 animals',            xp: 100 },
  { goal: 10, title: 'Wildlife Watcher',    sub: 'Identify 10 animals with Vanya',             xp: 200 },
  { goal: 20, title: 'SnapWild Veteran',    sub: 'Reach 20 catches — you\'re a pro!',          xp: 500 },
];

function currentMission(catchCount) {
  return MISSIONS.find(m => catchCount < m.goal) ?? MISSIONS[MISSIONS.length - 1];
}

export default function DiscoverScreen({ navigation }) {
  const { user }   = useAuth();
  const catches    = useCatchStore(s => s.catches);
  const now        = useClock();
  const timeStr    = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dayStr     = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const totalXP    = catches.reduce((sum, c) => sum + (c.xp ?? 0), 0);
  const catchCount = catches.length;
  const mission    = currentMission(catchCount);
  const prevGoal   = MISSIONS[MISSIONS.indexOf(mission) - 1]?.goal ?? 0;
  const progress   = Math.min((catchCount - prevGoal) / (mission.goal - prevGoal), 1);
  const recent     = catches.slice(0, 3);
  const rareCatches = catches.filter(c => c.rarity === 'Rare' || c.rarity === 'Legendary').slice(0, 6);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const stats = [
    { label: 'Catches',  value: catchCount, icon: 'paw'   },
    { label: 'Total XP', value: totalXP,    icon: 'flash' },
    { label: 'Streak',   value: `${user?.streak ?? 0}d`, icon: 'flame' },
  ];

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingBottom: 110 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />}
    >
      {/* Greeting */}
      <View style={s.greeting}>
        <View>
          <Text style={s.greetSub}>{greeting(now.getHours())},</Text>
          <Text style={s.greetName}>{user?.username ?? 'Explorer'} 🌿</Text>
          <View style={s.clockRow}>
            <Ionicons name="time-outline" size={12} color={C.muted} />
            <Text style={s.clockText}>{dayStr} · {timeStr}</Text>
          </View>
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

      {/* First-launch banner */}
      {catchCount === 0 && (
        <View style={s.welcomeCard}>
          <Text style={s.welcomeEmoji}>🦁</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.welcomeTitle}>Welcome to SnapWild!</Text>
            <Text style={s.welcomeSub}>Head outside, tap Snap, and point at any animal. Vanya will identify it instantly.</Text>
          </View>
        </View>
      )}

      {/* Mission */}
      <SectionHeader title="Today's Mission" />
      <View style={s.missionCard}>
        <View style={{ flex: 1 }}>
          <View style={s.missionBadge}>
            <Text style={s.missionBadgeText}>{catchCount >= mission.goal ? 'DONE' : 'ACTIVE'}</Text>
          </View>
          <Text style={s.missionTitle}>{mission.title}</Text>
          <Text style={s.missionSub}>{mission.sub}</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={s.progressText}>
            {Math.min(catchCount, mission.goal)} / {mission.goal} {catchCount >= mission.goal ? '✓' : ''}
          </Text>
        </View>
        <View style={s.xpBadge}>
          <Ionicons name="flash" size={14} color={C.bg} />
          <Text style={s.xpNum}>+{mission.xp}</Text>
          <Text style={s.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Recent catches */}
      {recent.length > 0 && (
        <>
          <SectionHeader title="Recent Catches" link="See all" onLink={() => navigation.getParent()?.navigate('Collection')} />
          <View style={s.recentCard}>
            {recent.map((c, i) => {
              const color = RARITY_COLOR[c.rarity] ?? C.gray;
              return (
                <View key={c.id ?? i}>
                  <View style={s.recentRow}>
                    <View style={[s.recentDot, { backgroundColor: color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.recentName}>{c.name}</Text>
                      <Text style={s.recentSub}>{c.rarity} · {new Date(c.caughtAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                    </View>
                    <Text style={[s.recentXP, { color }]}>+{c.xp} XP</Text>
                  </View>
                  {i < recent.length - 1 && <View style={s.divider} />}
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Rarity guide */}
      <SectionHeader title="Rarity Tiers" />
      <View style={s.rarityCard}>
        {[
          { tier: 'Common',    xp: '15 XP',   color: C.gray   },
          { tier: 'Uncommon',  xp: '45 XP',   color: C.green  },
          { tier: 'Rare',      xp: '100 XP',  color: C.blue   },
          { tier: 'Legendary', xp: '150+ XP', color: C.orange },
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

      {/* Pet Playdates */}
      <SectionHeader title="Pet Playdates" link="See all" onLink={() => navigation.navigate('PetPlaydates')} />
      <TouchableOpacity style={s.leaderCard} activeOpacity={0.85} onPress={() => navigation.navigate('PetPlaydates')}>
        <View style={s.leaderLeft}>
          <View style={[s.leaderIconBox, { backgroundColor: C.green + '20' }]}>
            <Ionicons name="paw" size={22} color={C.green} />
          </View>
          <View>
            <Text style={s.leaderTitle}>Find Pet Playmates</Text>
            <Text style={s.leaderSub}>Discover pets nearby + AI compatibility</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Missions */}
      <SectionHeader title="Missions" link="See all" onLink={() => navigation.navigate('Missions')} />
      <TouchableOpacity style={s.leaderCard} activeOpacity={0.85} onPress={() => navigation.navigate('Missions')}>
        <View style={s.leaderLeft}>
          <View style={[s.leaderIconBox, { backgroundColor: C.orange + '20' }]}>
            <Ionicons name="trophy" size={22} color={C.orange} />
          </View>
          <View>
            <Text style={s.leaderTitle}>Community Missions</Text>
            <Text style={s.leaderSub}>Weekly & monthly group challenges</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Community */}
      <SectionHeader title="Community" link="See all" onLink={() => navigation.navigate('Community')} />
      <TouchableOpacity style={s.leaderCard} activeOpacity={0.85} onPress={() => navigation.navigate('Community')}>
        <View style={s.leaderLeft}>
          <View style={[s.leaderIconBox, { backgroundColor: C.blue + '20' }]}>
            <Ionicons name="people" size={22} color={C.blue} />
          </View>
          <View>
            <Text style={s.leaderTitle}>Wildlife Community</Text>
            <Text style={s.leaderSub}>See catches from across India</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Rescue Alerts */}
      <SectionHeader title="Rescue Alerts" link="See all" onLink={() => navigation.navigate('RescueAlerts')} />
      <TouchableOpacity style={s.leaderCard} activeOpacity={0.85} onPress={() => navigation.navigate('RescueAlerts')}>
        <View style={s.leaderLeft}>
          <View style={[s.leaderIconBox, { backgroundColor: C.red + '20' }]}>
            <Ionicons name="alert-circle" size={22} color={C.red} />
          </View>
          <View>
            <Text style={s.leaderTitle}>Animal Rescue Alerts</Text>
            <Text style={s.leaderSub}>Report & respond to injured animals nearby</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Health & Wellness shortcut */}
      <SectionHeader title="Health & Wellness" link="Open" onLink={() => navigation.navigate('Health')} />
      <TouchableOpacity style={s.leaderCard} activeOpacity={0.85} onPress={() => navigation.navigate('Health')}>
        <View style={s.leaderLeft}>
          <View style={[s.leaderIconBox, { backgroundColor: C.green + '20' }]}>
            <Ionicons name="leaf" size={22} color={C.green} />
          </View>
          <View>
            <Text style={s.leaderTitle}>Nature Therapy Tracker</Text>
            <Text style={s.leaderSub}>Steps · Mood · Outdoor time · Score</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </TouchableOpacity>

      {/* Rare & Legendary catches (4.9.6) */}
      <SectionHeader title="Your Rare Catches" link="See all" onLink={() => navigation.getParent()?.navigate('Collection')} />
      {rareCatches.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {rareCatches.map(c => {
            const col = RARITY_COLOR[c.rarity] ?? C.gray;
            return (
              <TouchableOpacity
                key={c.id}
                style={[s.hintCard, { borderColor: col + '50' }]}
                onPress={() => navigation.navigate('SpeciesPage', {
                  species:    c.name,
                  emoji:      c.emoji ?? '🐾',
                  rarity:     c.rarity,
                  scientific: c.scientific ?? '',
                })}
                activeOpacity={0.85}
              >
                <Text style={s.hintEmoji}>{c.emoji ?? '🐾'}</Text>
                <Text style={s.hintName} numberOfLines={2}>{c.name}</Text>
                <Text style={s.hintLoc} numberOfLines={1}>
                  {new Date(c.caughtAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
                <View style={[s.hintRarityPill, { backgroundColor: col + '20' }]}>
                  <Text style={[s.hintRarityText, { color: col }]}>{c.rarity}</Text>
                </View>
                <Text style={s.hintTime}>+{c.xp} XP</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="location-outline" size={38} color={C.muted} />
          <Text style={s.emptyTitle}>No rare catches yet</Text>
          <Text style={s.emptySub}>Snap Rare or Legendary animals to see them here!</Text>
        </View>
      )}
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
  greetName: { fontSize: 20, fontWeight: 'bold', color: C.text, marginBottom: 4 },
  clockRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockText: { fontSize: 11, color: C.muted },
  notifBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },

  statsRow:  { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard:  { flex: 1, backgroundColor: C.card, borderRadius: 14, alignItems: 'center', paddingVertical: 14, gap: 4, borderWidth: 1, borderColor: C.border },
  statValue: { fontSize: 20, fontWeight: 'bold', color: C.text },
  statLabel: { fontSize: 11, color: C.muted },

  welcomeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.primary + '30', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.primary },
  welcomeEmoji: { fontSize: 32 },
  welcomeTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 },
  welcomeSub:   { fontSize: 12, color: C.muted, lineHeight: 18 },

  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 10 },
  secTitle:  { fontSize: 16, fontWeight: '700', color: C.text },
  secLink:   { fontSize: 13, color: C.accent },

  missionCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  missionBadge:     { backgroundColor: C.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  missionBadgeText: { fontSize: 10, fontWeight: 'bold', color: C.accent, letterSpacing: 1 },
  missionTitle:     { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  missionSub:       { fontSize: 12, color: C.muted, marginBottom: 12 },
  progressTrack:    { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: 6, backgroundColor: C.accent, borderRadius: 3 },
  progressText:     { fontSize: 11, color: C.muted, marginTop: 6 },
  xpBadge:  { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', marginLeft: 14, gap: 2 },
  xpNum:    { fontSize: 16, fontWeight: 'bold', color: C.accent },
  xpLabel:  { fontSize: 10, color: C.muted },

  recentCard: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  recentRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  recentDot:  { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  recentName: { fontSize: 14, fontWeight: '600', color: C.text },
  recentSub:  { fontSize: 11, color: C.muted, marginTop: 2 },
  recentXP:   { fontSize: 13, fontWeight: 'bold' },

  rarityCard: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  rarityRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  rarityDot:  { width: 10, height: 10, borderRadius: 5 },
  rarityName: { flex: 1, fontSize: 14, color: C.text, fontWeight: '600' },
  rarityXP:   { fontSize: 13, fontWeight: '700' },
  divider:    { height: 1, backgroundColor: C.border },

  leaderCard:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  leaderLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leaderIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' },
  leaderTitle:   { fontSize: 14, fontWeight: '700', color: C.text },
  leaderSub:     { fontSize: 12, color: C.muted, marginTop: 2 },

  emptyCard:  { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 32, alignItems: 'center', gap: 8, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  emptySub:   { fontSize: 12, color: C.muted, textAlign: 'center' },

  hintCard:       { width: 130, backgroundColor: C.card, borderRadius: 16, borderWidth: 1.5, padding: 12, gap: 5 },
  hintEmoji:      { fontSize: 30, marginBottom: 2 },
  hintName:       { fontSize: 12, fontWeight: '700', color: C.text, lineHeight: 16 },
  hintLoc:        { fontSize: 10, color: C.muted },
  hintRarityPill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
  hintRarityText: { fontSize: 10, fontWeight: '700' },
  hintTime:       { fontSize: 10, color: C.muted },
});
