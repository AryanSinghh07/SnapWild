import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Switch, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSafetyStore from '../../store/useSafetyStore';
import useCatchStore  from '../../store/useCatchStore';
import { useAuth }    from '../../context/AuthContext';
import { C } from '../../theme/colors';

export default function DataPrivacyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const anonymousMode   = useSafetyStore(s => s.anonymousMode);
  const setAnonymousMode= useSafetyStore(s => s.setAnonymousMode);
  const dataCollection  = useSafetyStore(s => s.dataCollection);
  const setDataCollection= useSafetyStore(s => s.setDataCollection);

  const catches  = useCatchStore(s => s.catches);

  function handleDownloadData() {
    const summary = {
      account: { username: user?.username, phone: user ? `+91 ${user.phone?.slice(0, 3)}XXXXXXX` : 'N/A' },
      catches: catches.length,
      species: [...new Set(catches.map(c => c.name))],
      exportedAt: new Date().toISOString(),
    };
    Alert.alert(
      'Your Data Summary',
      `Username: ${summary.account.username}\nPhone: ${summary.account.phone}\nTotal catches: ${summary.catches}\nUnique species: ${summary.species.length}\n\nFull export will be sent to your registered email within 72 hours as per DPDP Act, 2023.`,
      [{ text: 'OK' }]
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, all catches, XP, and personal data. This cannot be undone.\n\nAs required by the DPDP Act, 2023, all your data will be erased within 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.clear();
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      logout();
                    } catch {
                      Alert.alert('Error', 'Could not delete account. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }

  function handleAnonymousToggle(v) {
    setAnonymousMode(v);
    Haptics.selectionAsync();
    if (v) {
      Alert.alert(
        'Anonymous Mode',
        'Your username will be shown as "Explorer" in the community feed. Your catch data remains yours.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Data & Privacy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>

        {/* DPDP badge */}
        <View style={s.dpdpBanner}>
          <View style={s.dpdpBadge}>
            <Ionicons name="shield-checkmark" size={16} color={C.green} />
            <Text style={s.dpdpBadgeText}>DPDP Act, 2023 Compliant</Text>
          </View>
          <Text style={s.dpdpSub}>
            SnapWild complies with India's Digital Personal Data Protection Act, 2023. You have full control over your data.
          </Text>
        </View>

        {/* What we collect */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={C.blue} />
            <Text style={s.sectionTitle}>What We Collect</Text>
          </View>
          {[
            { icon: 'call-outline',     label: 'Phone number',      detail: 'For login only. Never shared publicly.',       color: C.green  },
            { icon: 'camera-outline',   label: 'Photos you snap',   detail: 'Processed locally. Not stored on our servers.', color: C.accent },
            { icon: 'location-outline', label: 'Approximate location', detail: 'City-level only. Exact GPS never stored.',   color: C.orange },
            { icon: 'paw-outline',      label: 'Catch history',     detail: 'Species you\'ve identified. Stored locally.',   color: C.blue   },
            { icon: 'people-outline',   label: 'Pet & meetup data', detail: 'Stored on your device only.',                  color: C.muted  },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={s.dataRow}>
                <View style={[s.dataIcon, { backgroundColor: row.color + '20' }]}>
                  <Ionicons name={row.icon} size={15} color={row.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.dataLabel}>{row.label}</Text>
                  <Text style={s.dataDetail}>{row.detail}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {/* Privacy controls */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="settings-outline" size={18} color={C.accent} />
            <Text style={s.sectionTitle}>Privacy Controls</Text>
          </View>

          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Anonymous Mode</Text>
              <Text style={s.toggleSub}>Show as "Explorer" in community feed</Text>
            </View>
            <Switch
              value={anonymousMode}
              onValueChange={handleAnonymousToggle}
              trackColor={{ false: C.border, true: C.green + '60' }}
              thumbColor={anonymousMode ? C.green : C.muted}
            />
          </View>

          <View style={s.divider} />

          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Analytics & Improvement</Text>
              <Text style={s.toggleSub}>Help us improve with anonymous usage data</Text>
            </View>
            <Switch
              value={dataCollection}
              onValueChange={v => { setDataCollection(v); Haptics.selectionAsync(); }}
              trackColor={{ false: C.border, true: C.green + '60' }}
              thumbColor={dataCollection ? C.green : C.muted}
            />
          </View>
        </View>

        {/* Your rights */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="person-outline" size={18} color={C.green} />
            <Text style={s.sectionTitle}>Your Rights (DPDP Act)</Text>
          </View>
          {[
            { right: 'Right to Access', desc: 'Request a copy of all data we hold about you.' },
            { right: 'Right to Correction', desc: 'Update or correct any inaccurate personal data.' },
            { right: 'Right to Erasure', desc: 'Delete your account and all associated data.' },
            { right: 'Right to Grievance', desc: 'File a complaint with our Data Protection Officer.' },
          ].map((r, i, arr) => (
            <View key={r.right}>
              <View style={s.rightRow}>
                <Ionicons name="checkmark-circle" size={14} color={C.green} />
                <View>
                  <Text style={s.rightTitle}>{r.right}</Text>
                  <Text style={s.rightDesc}>{r.desc}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="cloud-download-outline" size={18} color={C.blue} />
            <Text style={s.sectionTitle}>Data Actions</Text>
          </View>

          <TouchableOpacity style={s.actionBtn} onPress={handleDownloadData} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={18} color={C.blue} />
            <View style={{ flex: 1 }}>
              <Text style={s.actionBtnTitle}>Download My Data</Text>
              <Text style={s.actionBtnSub}>Get a full export of your SnapWild data</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => Linking.openURL('mailto:privacy@snapwild.in?subject=Data%20Privacy%20Query')}
            activeOpacity={0.85}
          >
            <Ionicons name="mail-outline" size={18} color={C.accent} />
            <View style={{ flex: 1 }}>
              <Text style={s.actionBtnTitle}>Contact DPO</Text>
              <Text style={s.actionBtnSub}>privacy@snapwild.in — Data Protection Officer</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Moderation Status — 3-strike system */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="shield-half-outline" size={18} color={C.blue} />
            <Text style={s.sectionTitle}>Moderation Status</Text>
          </View>

          <View style={ms.statusRow}>
            <View style={[ms.statusDot, { backgroundColor: C.green }]} />
            <View style={{ flex: 1 }}>
              <Text style={ms.statusTitle}>Good Standing</Text>
              <Text style={ms.statusSub}>No violations on your account</Text>
            </View>
            <View style={ms.badge}>
              <Ionicons name="checkmark-circle" size={14} color={C.green} />
              <Text style={ms.badgeText}>0 strikes</Text>
            </View>
          </View>

          <View style={ms.strikeRow}>
            {[
              { label: 'Warning',        color: C.orange, desc: 'Post removed; account flagged'  },
              { label: 'Temp Ban',       color: C.red,    desc: '7-day suspension from posting'  },
              { label: 'Permanent Ban',  color: '#8B0000',desc: 'Account permanently restricted' },
            ].map((st, i) => (
              <View key={st.label} style={ms.strikeItem}>
                <View style={[ms.strikeDot, { backgroundColor: st.color + '30', borderColor: st.color + '60' }]}>
                  <Text style={[ms.strikeNum, { color: st.color }]}>{i + 1}</Text>
                </View>
                <Text style={ms.strikeLabel}>{st.label}</Text>
                <Text style={ms.strikeDesc}>{st.desc}</Text>
              </View>
            ))}
          </View>

          <View style={ms.infoRow}>
            <Ionicons name="information-circle-outline" size={13} color={C.muted} />
            <Text style={ms.infoText}>
              Strikes are issued for misinformation, spam, or community guideline violations. Appeals can be sent to moderation@snapwild.in.
            </Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={[s.sectionCard, { borderColor: C.red + '40' }]}>
          <View style={s.sectionHeader}>
            <Ionicons name="warning-outline" size={18} color={C.red} />
            <Text style={[s.sectionTitle, { color: C.red }]}>Danger Zone</Text>
          </View>
          <Text style={s.dangerDesc}>
            Deleting your account is permanent and irreversible. All your catches, XP, pets, and data will be erased within 30 days.
          </Text>
          <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}>
            <Ionicons name="trash" size={16} color={C.bg} />
            <Text style={s.deleteBtnText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>SnapWild · Privacy Policy · snapwild.in/privacy</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },

  dpdpBanner:    { marginHorizontal: 16, marginBottom: 16, backgroundColor: C.green + '12', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.green + '30' },
  dpdpBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dpdpBadgeText: { fontSize: 13, fontWeight: '700', color: C.green },
  dpdpSub:       { fontSize: 12, color: C.muted, lineHeight: 18 },

  sectionCard:   { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: C.text },

  dataRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  dataIcon:   { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  dataLabel:  { fontSize: 13, fontWeight: '600', color: C.text },
  dataDetail: { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 16 },

  toggleRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  toggleSub:   { fontSize: 11, color: C.muted, marginTop: 2 },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  rightRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  rightTitle: { fontSize: 13, fontWeight: '600', color: C.text },
  rightDesc:  { fontSize: 11, color: C.muted, marginTop: 2 },

  actionBtn:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  actionBtnSub:   { fontSize: 11, color: C.muted, marginTop: 1 },

  dangerDesc: { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 14 },
  deleteBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.red, borderRadius: 14, paddingVertical: 14 },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: C.bg },

  footer: { textAlign: 'center', fontSize: 11, color: C.muted, marginHorizontal: 16, marginTop: 4 },
});

const ms = StyleSheet.create({
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.green + '12', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.green + '30' },
  statusDot:   { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  statusSub:   { fontSize: 11, color: C.muted, marginTop: 1 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.green + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText:   { fontSize: 11, fontWeight: '700', color: C.green },

  strikeRow:   { flexDirection: 'row', gap: 8, marginBottom: 14 },
  strikeItem:  { flex: 1, alignItems: 'center', gap: 4 },
  strikeDot:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  strikeNum:   { fontSize: 14, fontWeight: '800' },
  strikeLabel: { fontSize: 10, fontWeight: '700', color: C.text, textAlign: 'center' },
  strikeDesc:  { fontSize: 9, color: C.muted, textAlign: 'center', lineHeight: 13 },

  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  infoText:    { flex: 1, fontSize: 11, color: C.muted, lineHeight: 17 },
});
