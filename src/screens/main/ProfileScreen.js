import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import useCatchStore from '../../store/useCatchStore';
import useFriendStore from '../../store/useFriendStore';
import { C } from '../../theme/colors';

const XP_TRACKS = [
  { name: 'Hunter XP',   key: 'hunter',   icon: 'trail-sign',      color: C.accent, desc: 'Earn by catching animals'   },
  { name: 'Guardian XP', key: 'guardian', icon: 'shield-checkmark', color: C.green,  desc: 'Earn by rescuing animals'   },
  { name: 'Health XP',   key: 'health',   icon: 'heart',            color: C.red,    desc: 'Earn by walking outdoors'   },
  { name: 'Social XP',   key: 'social',   icon: 'people',           color: C.blue,   desc: 'Earn by engaging community' },
];

const BIRD_WORDS = [
  'peacock','hornbill','eagle','owl','parrot','flamingo','roller','robin',
  'sparrow','crow','pigeon','kite','heron','stork','crane','duck','kingfisher',
  'woodpecker','mynah','myna','bulbul','sunbird','swallow','swift','warbler',
  'drongo','babbler','thrush','shrike','bird',
];

function computeBadges(catches) {
  const birdCount   = catches.filter(c => BIRD_WORDS.some(b => c.name?.toLowerCase().includes(b))).length;
  const uniqueCount = new Set(catches.map(c => c.name)).size;
  const hasRare     = catches.some(c => c.rarity === 'Rare' || c.rarity === 'Legendary');
  const hasLegend   = catches.some(c => c.rarity === 'Legendary');
  const hasNight    = catches.some(c => { const h = new Date(c.caughtAt).getHours(); return h >= 20 || h < 6; });
  const hasGPS      = catches.filter(c => c.lat != null).length >= 3;

  return [
    { name: 'First Catch',   icon: '🎯', desc: 'Make your first catch',     locked: catches.length < 1 },
    { name: 'Birder',        icon: '🦜', desc: 'Catch 3 bird species',       locked: birdCount < 3     },
    { name: 'Rare Hunter',   icon: '💎', desc: 'Catch a Rare or Legendary',  locked: !hasRare          },
    { name: 'Collector',     icon: '📚', desc: 'Catch 5 unique species',     locked: uniqueCount < 5   },
    { name: 'Night Shift',   icon: '🦉', desc: 'Catch after 8pm or before 6am', locked: !hasNight     },
    { name: 'On Location',   icon: '📍', desc: 'Catch 3 animals with GPS',   locked: !hasGPS           },
    { name: 'Legend',        icon: '⭐', desc: 'Catch a Legendary animal',    locked: !hasLegend        },
    { name: 'Guardian',      icon: '🛡️', desc: 'File 5 rescue reports',     locked: true              },
  ];
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const catches        = useCatchStore(s => s.catches);
  const getXPByTrack   = useCatchStore(s => s.getXPByTrack);
  const getTotalXP     = useCatchStore(s => s.getTotalXP);
  const xpByTrack      = getXPByTrack();
  const totalXP        = getTotalXP();
  const catchCount     = catches.length;

  const friendCount    = useFriendStore(s => s.friends.length);
  const requestCount   = useFriendStore(s => s.requests.length);
  const getTotalUnread = useFriendStore(s => s.getTotalUnread);
  const totalUnread    = getTotalUnread();

  const badges = computeBadges(catches);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [draftName,   setDraftName]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [nameError,   setNameError]   = useState('');

  const openEdit = () => {
    setDraftName(user?.username ?? '');
    setNameError('');
    setEditVisible(true);
  };

  const handleSave = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setNameError('Username cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setNameError('Username must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setNameError('Username must be 20 characters or less.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setNameError('Only letters, numbers, and underscores allowed.');
      return;
    }
    setSaving(true);
    await updateUser({ username: trimmed });
    setSaving(false);
    setEditVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <>
      <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Profile card */}
        <View style={s.profileCard}>
          {/* Edit button */}
          <TouchableOpacity style={s.editBtn} onPress={openEdit}>
            <Ionicons name="pencil" size={14} color={C.accent} />
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>

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
              { val: catchCount,              label: 'Catches' },
              { val: user?.rescues ?? 0,      label: 'Rescues' },
              { val: `${user?.streak ?? 0}d`, label: 'Streak'  },
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
          const pct = Math.min((xp / 500) * 100, 100);
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
          {badges.map(b => (
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

        {/* Social */}
        <SectionHeader title="Social" />
        <TouchableOpacity style={s.socialCard} onPress={() => navigation.navigate('Friends')} activeOpacity={0.85}>
          <View style={s.socialLeft}>
            <View style={[s.socialIcon, { backgroundColor: C.accent + '20' }]}>
              <Ionicons name="people" size={20} color={C.accent} />
            </View>
            <View>
              <Text style={s.socialTitle}>Friends</Text>
              <Text style={s.socialSub}>{friendCount} friend{friendCount !== 1 ? 's' : ''}{requestCount > 0 ? ` · ${requestCount} request${requestCount > 1 ? 's' : ''}` : ''}</Text>
            </View>
          </View>
          <View style={s.socialRight}>
            {requestCount > 0 && (
              <View style={s.badge}><Text style={s.badgeText}>{requestCount}</Text></View>
            )}
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[s.socialCard, { marginTop: 8 }]} onPress={() => navigation.navigate('Conversations')} activeOpacity={0.85}>
          <View style={s.socialLeft}>
            <View style={[s.socialIcon, { backgroundColor: C.blue + '20' }]}>
              <Ionicons name="chatbubbles" size={20} color={C.blue} />
            </View>
            <View>
              <Text style={s.socialTitle}>Messages</Text>
              <Text style={s.socialSub}>{totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'Chat with friends'}</Text>
            </View>
          </View>
          <View style={s.socialRight}>
            {totalUnread > 0 && (
              <View style={[s.badge, { backgroundColor: C.blue }]}><Text style={s.badgeText}>{totalUnread}</Text></View>
            )}
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
        </TouchableOpacity>

        {/* Health Tracking */}
        <TouchableOpacity style={[s.healthCard, { marginTop: 8 }]} onPress={() => navigation.navigate('Health')} activeOpacity={0.85}>
          <View style={s.healthLeft}>
            <View style={s.healthIcon}>
              <Ionicons name="leaf" size={20} color={C.green} />
            </View>
            <View>
              <Text style={s.healthTitle}>Health Tracking</Text>
              <Text style={s.healthSub}>Steps · Mood · Nature Score</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={C.red} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={s.backdrop} onPress={() => setEditVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kbView}>
            <Pressable style={s.sheet} onPress={() => {}}>
              {/* Handle */}
              <View style={s.handle} />

              <Text style={s.sheetTitle}>Edit Profile</Text>

              {/* Avatar preview */}
              <View style={s.sheetAvatarWrap}>
                <View style={s.sheetAvatar}>
                  <Text style={s.sheetAvatarLetter}>
                    {(draftName[0] ?? user?.username?.[0] ?? 'W').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Username field */}
              <Text style={s.fieldLabel}>Username</Text>
              <View style={[s.inputWrap, nameError ? s.inputWrapError : null]}>
                <Ionicons name="person-outline" size={18} color={C.muted} />
                <TextInput
                  style={s.input}
                  value={draftName}
                  onChangeText={v => { setDraftName(v); setNameError(''); }}
                  placeholder="Enter username"
                  placeholderTextColor={C.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                {draftName.length > 0 && (
                  <Text style={s.charCount}>{draftName.length}/20</Text>
                )}
              </View>
              {nameError ? <Text style={s.errorText}>{nameError}</Text> : null}
              <Text style={s.fieldHint}>Letters, numbers, and underscores only</Text>

              {/* Phone (read-only) */}
              <Text style={[s.fieldLabel, { marginTop: 16 }]}>Phone Number</Text>
              <View style={[s.inputWrap, s.inputWrapReadOnly]}>
                <Ionicons name="call-outline" size={18} color={C.muted} />
                <Text style={[s.input, { color: C.muted }]}>+91 {user?.phone}</Text>
                <Ionicons name="lock-closed-outline" size={14} color={C.muted} />
              </View>
              <Text style={s.fieldHint}>Phone number cannot be changed</Text>

              {/* Actions */}
              <View style={s.modalActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setEditVisible(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.saveBtn, saving && s.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
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
  editBtn:     { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accent + '18', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.accent + '40' },
  editBtnText: { fontSize: 12, fontWeight: '700', color: C.accent },

  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: C.accent },
  avatarLetter: { fontSize: 34, fontWeight: 'bold', color: C.text },
  username:     { fontSize: 20, fontWeight: 'bold', color: C.text, marginBottom: 4 },
  phone:        { fontSize: 13, color: C.muted, marginBottom: 10 },

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

  xpCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  xpLeft:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  xpName:  { fontSize: 13, fontWeight: '700', color: C.text },
  xpDesc:  { fontSize: 11, color: C.muted },
  xpRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpTrack: { width: 70, height: 6, borderRadius: 3, overflow: 'hidden' },
  xpFill:  { height: 6, borderRadius: 3 },
  xpVal:   { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },

  badgeGrid:       { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 10, marginBottom: 24 },
  badgeCard:       { flex: 1, minWidth: '45%', backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border },
  badgeCardLocked: { opacity: 0.7 },
  badgeEmoji:      { fontSize: 32 },
  badgeName:       { fontSize: 13, fontWeight: '700', color: C.text },
  badgeNameLocked: { color: C.muted },
  badgeDesc:       { fontSize: 11, color: C.muted, textAlign: 'center' },
  badgeLock:       { position: 'absolute', top: 8, right: 8 },

  socialCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  socialLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  socialIcon:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  socialTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  socialSub:   { fontSize: 12, color: C.muted, marginTop: 2 },
  socialRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:       { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText:   { fontSize: 11, fontWeight: 'bold', color: C.bg },

  healthCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  healthLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthIcon:  { width: 44, height: 44, borderRadius: 12, backgroundColor: C.green + '20', alignItems: 'center', justifyContent: 'center' },
  healthTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  healthSub:   { fontSize: 12, color: C.muted, marginTop: 2 },

  signOutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.card, marginHorizontal: 16, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: C.red + '40' },
  signOutText: { fontSize: 15, fontWeight: '600', color: C.red },

  // ── Modal ──
  backdrop: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  kbView:   { justifyContent: 'flex-end' },
  sheet:    { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle:   { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: C.text, marginBottom: 20, textAlign: 'center' },

  sheetAvatarWrap: { alignItems: 'center', marginBottom: 24 },
  sheetAvatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.accent },
  sheetAvatarLetter: { fontSize: 30, fontWeight: 'bold', color: C.text },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.5, marginBottom: 8 },
  fieldHint:  { fontSize: 11, color: C.muted, marginTop: 6, marginBottom: 4 },

  inputWrap:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: C.border, gap: 10 },
  inputWrapError:     { borderColor: C.red },
  inputWrapReadOnly:  { opacity: 0.6 },
  input:              { flex: 1, fontSize: 15, color: C.text },
  charCount:          { fontSize: 11, color: C.muted },
  errorText:          { fontSize: 12, color: C.red, marginTop: 6 },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  cancelBtn:    { flex: 1, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
  cancelBtnText:{ fontSize: 15, fontWeight: '600', color: C.muted },
  saveBtn:      { flex: 2, paddingVertical: 16, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:  { fontSize: 15, fontWeight: 'bold', color: C.bg },
});
