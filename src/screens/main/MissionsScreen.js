import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCatchStore from '../../store/useCatchStore';
import { C } from '../../theme/colors';

// ── helpers ──────────────────────────────────────────────────────────────────
const BIRDS = [
  'peacock','hornbill','eagle','owl','parrot','flamingo','roller','robin',
  'sparrow','crow','pigeon','kite','heron','stork','crane','duck','kingfisher',
  'woodpecker','mynah','myna','bulbul','sunbird','swallow','swift','warbler',
  'drongo','babbler','thrush','shrike','bird',
];

function isBird(name = '') {
  const n = name.toLowerCase();
  return BIRDS.some(b => n.includes(b));
}

function daysUntilMonday() {
  const d = new Date().getDay();
  return d === 1 ? 7 : (8 - d) % 7 || 7;
}

function daysUntilMonthEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
}

// Stable community totals based on day of year (feels live without a backend)
function communityCount() {
  const doy = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return {
    weekly:  280 + (doy % 7) * 38,   // 280–548 range
    monthly: 820 + (doy % 30) * 42,  // 820–2,058 range
  };
}

// ── Personal mission definitions ─────────────────────────────────────────────
function buildPersonalMissions(catches) {
  const uniqueNames  = new Set(catches.map(c => c.name));
  const birdCatches  = catches.filter(c => isBird(c.name));
  const gpsCount     = catches.filter(c => c.lat != null).length;
  const rareCatch    = catches.some(c => c.rarity === 'Rare' || c.rarity === 'Legendary');
  const legendCatch  = catches.some(c => c.rarity === 'Legendary');
  const nightCatch   = catches.some(c => {
    const h = new Date(c.caughtAt).getHours();
    return h >= 20 || h < 6;
  });

  return [
    {
      id: 'first',
      icon: '🎯',
      title: 'First Catch',
      desc: 'Make your very first catch',
      current: Math.min(catches.length, 1),
      goal: 1,
      xp: 15,
    },
    {
      id: 'birder',
      icon: '🦜',
      title: 'Birder',
      desc: 'Catch 3 different bird species',
      current: Math.min(birdCatches.length, 3),
      goal: 3,
      xp: 50,
    },
    {
      id: 'collector',
      icon: '📚',
      title: 'Collector',
      desc: 'Catch 5 unique species',
      current: Math.min(uniqueNames.size, 5),
      goal: 5,
      xp: 75,
    },
    {
      id: 'rare',
      icon: '💎',
      title: 'Rare Hunter',
      desc: 'Catch a Rare or Legendary animal',
      current: rareCatch ? 1 : 0,
      goal: 1,
      xp: 100,
    },
    {
      id: 'gps',
      icon: '📍',
      title: 'On Location',
      desc: 'Catch 3 animals with GPS saved',
      current: Math.min(gpsCount, 3),
      goal: 3,
      xp: 30,
    },
    {
      id: 'night',
      icon: '🌙',
      title: 'Night Owl',
      desc: 'Catch an animal after 8pm or before 6am',
      current: nightCatch ? 1 : 0,
      goal: 1,
      xp: 45,
    },
    {
      id: 'legend',
      icon: '⭐',
      title: 'Legend',
      desc: 'Catch a Legendary animal',
      current: legendCatch ? 1 : 0,
      goal: 1,
      xp: 200,
    },
    {
      id: 'veteran',
      icon: '🏆',
      title: 'SnapWild Veteran',
      desc: 'Catch 20 animals',
      current: Math.min(catches.length, 20),
      goal: 20,
      xp: 500,
    },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MissionsScreen({ navigation }) {
  const insets   = useSafeAreaInsets();
  const catches  = useCatchStore(s => s.catches);
  const totalXP  = useCatchStore(s => s.getTotalXP)();
  const streak   = useCatchStore(s => s.getStreak)();

  const { weekly, monthly } = communityCount();
  const weeklyGoal  = 500;
  const monthlyGoal = 2000;
  const myContrib   = catches.length;

  const personalMissions = buildPersonalMissions(catches);
  const completed = personalMissions.filter(m => m.current >= m.goal).length;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Missions</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>{completed}/{personalMissions.length}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* My stats strip */}
        <View style={s.statsStrip}>
          {[
            { label: 'Total Catches', val: catches.length, icon: 'paw' },
            { label: 'Total XP',      val: totalXP,        icon: 'flash' },
            { label: 'Day Streak',    val: `${streak}d`,   icon: 'flame' },
          ].map(st => (
            <View key={st.label} style={s.statItem}>
              <Ionicons name={st.icon} size={16} color={C.accent} />
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Community Missions ── */}
        <SectionHeader title="Community Missions" sub="Everyone contributes" />

        {/* Weekly */}
        <CommunityMission
          tag="WEEKLY"
          tagColor={C.green}
          title="India's Wild Week"
          desc="Help SnapWild India catch 500 animals this week"
          current={weekly + myContrib}
          goal={weeklyGoal}
          myContrib={myContrib}
          xp={50}
          daysLeft={daysUntilMonday()}
          icon="leaf"
        />

        {/* Monthly */}
        <CommunityMission
          tag="MONTHLY"
          tagColor={C.blue}
          title="Forest Guardians of India"
          desc="Community goal: 2,000 wild catches this month"
          current={monthly + myContrib}
          goal={monthlyGoal}
          myContrib={myContrib}
          xp={200}
          daysLeft={daysUntilMonthEnd()}
          icon="shield"
        />

        {/* ── Personal Missions ── */}
        <SectionHeader
          title="Personal Missions"
          sub={`${completed} of ${personalMissions.length} completed`}
        />

        <View style={s.personalCard}>
          {personalMissions.map((m, i) => (
            <PersonalMission
              key={m.id}
              mission={m}
              last={i === personalMissions.length - 1}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CommunityMission({ tag, tagColor, title, desc, current, goal, myContrib, xp, daysLeft, icon }) {
  const pct    = Math.min(current / goal, 1);
  const done   = current >= goal;

  return (
    <View style={[s.commCard, done && s.commCardDone]}>
      <View style={s.commTop}>
        <View style={[s.commTag, { backgroundColor: tagColor + '25', borderColor: tagColor + '60' }]}>
          <Text style={[s.commTagText, { color: tagColor }]}>{tag}</Text>
        </View>
        <View style={[s.xpBadge, { backgroundColor: C.accent + '20' }]}>
          <Ionicons name="flash" size={11} color={C.accent} />
          <Text style={s.xpBadgeText}>+{xp} XP</Text>
        </View>
      </View>

      <Text style={s.commTitle}>{title}</Text>
      <Text style={s.commDesc}>{desc}</Text>

      {/* Progress bar */}
      <View style={s.progTrack}>
        <View style={[s.progFill, { width: `${pct * 100}%`, backgroundColor: done ? C.green : tagColor }]} />
      </View>
      <View style={s.progRow}>
        <Text style={s.progText}>
          🌍 {current.toLocaleString('en-IN')} / {goal.toLocaleString('en-IN')} catches
        </Text>
        <Text style={s.progPct}>{Math.round(pct * 100)}%</Text>
      </View>

      <View style={s.commBottom}>
        <View style={s.myContrib}>
          <Ionicons name="person" size={12} color={C.muted} />
          <Text style={s.myContribText}>Your contribution: {myContrib} catch{myContrib !== 1 ? 'es' : ''}</Text>
        </View>
        {done ? (
          <View style={s.doneChip}>
            <Ionicons name="checkmark-circle" size={13} color={C.green} />
            <Text style={s.doneChipText}>Completed!</Text>
          </View>
        ) : (
          <Text style={s.daysLeft}>{daysLeft}d left</Text>
        )}
      </View>
    </View>
  );
}

function PersonalMission({ mission, last }) {
  const done = mission.current >= mission.goal;
  const pct  = Math.min(mission.current / mission.goal, 1);

  return (
    <View style={[s.personalRow, !last && s.personalRowBorder]}>
      <View style={[s.personalIcon, done && s.personalIconDone]}>
        <Text style={s.personalEmoji}>{mission.icon}</Text>
      </View>

      <View style={s.personalInfo}>
        <View style={s.personalTitleRow}>
          <Text style={[s.personalTitle, done && s.personalTitleDone]}>{mission.title}</Text>
          <View style={[s.personalXP, { backgroundColor: done ? C.green + '20' : C.accent + '15' }]}>
            <Text style={[s.personalXPText, { color: done ? C.green : C.accent }]}>+{mission.xp} XP</Text>
          </View>
        </View>
        <Text style={s.personalDesc}>{mission.desc}</Text>

        {/* Inline progress */}
        <View style={s.personalProgRow}>
          <View style={s.personalProgTrack}>
            <View style={[
              s.personalProgFill,
              { width: `${pct * 100}%`, backgroundColor: done ? C.green : C.accent },
            ]} />
          </View>
          <Text style={[s.personalProgText, done && { color: C.green }]}>
            {done ? '✓ Done' : `${mission.current}/${mission.goal}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {sub && <Text style={s.sectionSub}>{sub}</Text>}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
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
  headerBadge: {
    backgroundColor: C.accent, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  headerBadgeText: { fontSize: 12, fontWeight: 'bold', color: C.bg },

  statsStrip: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 20,
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
  },
  statItem:  { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  statVal:   { fontSize: 18, fontWeight: 'bold', color: C.text },
  statLabel: { fontSize: 10, color: C.muted },

  sectionHeader: { marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: C.text },
  sectionSub:    { fontSize: 12, color: C.muted, marginTop: 2 },

  // Community mission card
  commCard: {
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16,
  },
  commCardDone: { borderColor: C.green + '60' },
  commTop:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  commTag:  { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  commTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  xpBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  xpBadgeText:{ fontSize: 11, fontWeight: '700', color: C.accent },
  commTitle:  { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  commDesc:   { fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 18 },
  progTrack:  { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progFill:   { height: 8, borderRadius: 4 },
  progRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progText:   { fontSize: 12, color: C.muted },
  progPct:    { fontSize: 12, fontWeight: '700', color: C.text },
  commBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  myContrib:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  myContribText: { fontSize: 12, color: C.muted },
  doneChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.green + '20', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  doneChipText: { fontSize: 12, fontWeight: '700', color: C.green },
  daysLeft:   { fontSize: 12, color: C.muted, fontWeight: '600' },

  // Personal missions card
  personalCard: {
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 24,
    borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  personalRow:       { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  personalRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  personalIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: C.card2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  personalIconDone:  { backgroundColor: C.green + '20', borderColor: C.green + '50' },
  personalEmoji:     { fontSize: 20 },
  personalInfo:      { flex: 1 },
  personalTitleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  personalTitle:     { fontSize: 14, fontWeight: '700', color: C.text },
  personalTitleDone: { color: C.green },
  personalXP:        { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  personalXPText:    { fontSize: 11, fontWeight: '700' },
  personalDesc:      { fontSize: 12, color: C.muted, marginBottom: 8 },
  personalProgRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  personalProgTrack: { flex: 1, height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  personalProgFill:  { height: 5, borderRadius: 3 },
  personalProgText:  { fontSize: 11, fontWeight: '600', color: C.muted, minWidth: 36, textAlign: 'right' },
});
