import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import useCatchStore from '../../store/useCatchStore';
import { C } from '../../theme/colors';

const XP_TRACKS = [
  { name: 'Hunter XP',   key: 'hunter',   icon: 'trail-sign',       color: C.accent, desc: 'Earn by catching animals'   },
  { name: 'Guardian XP', key: 'guardian', icon: 'shield-checkmark',  color: C.green,  desc: 'Earn by rescuing animals'   },
  { name: 'Health XP',   key: 'health',   icon: 'heart',             color: C.red,    desc: 'Earn by walking outdoors'   },
  { name: 'Social XP',   key: 'social',   icon: 'people',            color: C.blue,   desc: 'Earn by engaging community' },
];

const BADGES = [
  { name: 'Birder',    icon: '🦜', desc: 'Catch 3 birds',       locked: true },
  { name: 'Night Shift', icon: '🦉', desc: 'Catch nocturnal animal', locked: true },
  { name: 'Guardian', icon: '🛡️', desc: 'File 5 rescues',      locked: true },
  { name: 'Explorer',  icon: '🗺️', desc: 'Visit 10 cities',    locked: true },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const catches        = useCatchStore(s => s.catches);
  const getXPByTrack   = useCatchStore(s => s.getXPByTrack);
  const getTotalXP     = useCatchStore(s => s.getTotalXP);
  const xpByTrack      = getXPByTrack();
  const totalXP        = getTotalXP();
  const catchCount     = catches.length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarLetter}>
            {(user?.username ?? 'W')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.username}>{user?.username ?? 'Explorer'}</Text>
        <Text style={s.phone}>+91 {user?.phone?.slice(0, 5)} {user?.phone?.slice(5)}</Text>
        <View style={s.badgeRow}>
          <View style={s.levelBadge}>
            <Ionicons name="flash" size={12} color={C.bg} />
            <Text style={s.levelText}>Level {user?.level ?? 1}</Text>
          </View>
          <View style={s.totalXPBadge}>
            <Ionicons name="star" size={12} color={C.accent} />
            <Text style={s.totalXPText}>{totalXP} Total XP</Text>
          </View>
        </View>

        <View style={s.statsRow}>
          {[
            { val: catchCount,              label: 'Catches'  },
            { val: user?.rescues ?? 0,      label: 'Rescues'  },
            { val: `${user?.streak ?? 0}d`, label: 'Streak'   },
          ].map((st, i, arr) => (
            <React.Fragment key={st.label}>
              <View style={s.stat}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* XP Tracks */}
      <SectionHeader title="XP Tracks" />
      {XP_TRACKS.map(t => {
        const xp  = xpByTrack[t.key] ?? 0;
        const max = 500;
        const pct = Math.min((xp / max) * 100, 100);
        return (
          <View key={t.name} style={s.xpCard}>
            <View style={s.xpLeft}>
              <View style={[s.xpIcon, { backgroundColor: t.color + '22' }]}>
                <Ionicons name={t.icon} size={18} color={t.color} />
              </View>
              <View>
                <Text style={s.xpName}>{t.name}</Text>
                <Text style={s.xpDesc}>{t.desc}</Text>
              </View>
            </View>
            <View style={s.xpRight}>
              <View style={[s.xpTrack, { backgroundColor: t.color + '20' }]}>
                <View style={[s.xpFill, { width: `${pct}%`, backgroundColor: t.color }]} />
              </View>
              <Text style={[s.xpVal, { color: t.color }]}>{xp} XP</Text>
            </View>
          </View>
        );
      })}

      {/* Badges */}
      <SectionHeader title="Badges" />
      <View style={s.badgeGrid}>
        {BADGES.map(b => (
          <View key={b.name} style={[s.badgeCard, b.locked && s.badgeCardLocked]}>
            <Text style={[s.badgeEmoji, b.locked && { opacity: 0.3 }]}>{b.icon}</Text>
            <Text style={[s.badgeName, b.locked && s.badgeNameLocked]}>{b.name}</Text>
            <Text style={s.badgeDesc}>{b.desc}</Text>
            {b.locked && (
              <View style={s.badgeLock}>
                <Ionicons name="lock-closed" size={10} color={C.muted} />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={s.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={C.red} />
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={s.secHeader}>
      <Text style={s.secTitle}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  profileCard: { backgroundColor: C.card, margin: 16, marginTop: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: C.accent },
  avatarLetter: { fontSize: 34, fontWeight: 'bold', color: C.text },
  username: { fontSize: 20, fontWeight: 'bold', color: C.text, marginBottom: 4 },
  phone:    { fontSize: 13, color: C.muted, marginBottom: 10 },
  badgeRow:     { flexDirection: 'row', gap: 8, marginBottom: 20 },
  levelBadge:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, gap: 4 },
  levelText:    { fontSize: 12, fontWeight: 'bold', color: C.bg },
  totalXPBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, gap: 4, borderWidth: 1, borderColor: C.border },
  totalXPText:  { fontSize: 12, fontWeight: 'bold', color: C.accent },

  statsRow:    { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  stat:        { alignItems: 'center', flex: 1 },
  statVal:     { fontSize: 22, fontWeight: 'bold', color: C.text },
  statLabel:   { fontSize: 11, color: C.muted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border },

  secHeader: { marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  secTitle:  { fontSize: 16, fontWeight: '700', color: C.text },

  xpCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  xpLeft:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  xpName:  { fontSize: 13, fontWeight: '700', color: C.text },
  xpDesc:  { fontSize: 11, color: C.muted },
  xpRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpTrack: { width: 70, height: 6, borderRadius: 3, overflow: 'hidden' },
  xpFill:  { height: 6, borderRadius: 3 },
  xpVal:   { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 10, marginBottom: 24 },
  badgeCard: { flex: 1, minWidth: '45%', backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border },
  badgeCardLocked: { opacity: 0.7 },
  badgeEmoji: { fontSize: 32 },
  badgeName:  { fontSize: 13, fontWeight: '700', color: C.text },
  badgeNameLocked: { color: C.muted },
  badgeDesc:  { fontSize: 11, color: C.muted, textAlign: 'center' },
  badgeLock:  { position: 'absolute', top: 8, right: 8 },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.card, marginHorizontal: 16, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: C.red + '40' },
  signOutText: { fontSize: 15, fontWeight: '600', color: C.red },
});
