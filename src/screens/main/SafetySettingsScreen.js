import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Switch, Alert, Linking, KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSafetyStore from '../../store/useSafetyStore';
import { C } from '../../theme/colors';

const SAFETY_TIPS = [
  { icon: 'location-outline',      tip: 'Always meet at public, well-lit locations like parks or cafes.' },
  { icon: 'people-outline',        tip: 'Bring a friend or family member to pet meetups when possible.' },
  { icon: 'phone-portrait-outline',tip: 'Keep your phone charged before heading out for a meetup.' },
  { icon: 'eye-outline',           tip: 'Share your meetup location with someone you trust beforehand.' },
  { icon: 'shield-outline',        tip: 'Trust your instincts — leave immediately if something feels wrong.' },
];

export default function SafetySettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const emergencyContact    = useSafetyStore(s => s.emergencyContact);
  const setEmergencyContact = useSafetyStore(s => s.setEmergencyContact);
  const clearEmergencyContact= useSafetyStore(s => s.clearEmergencyContact);
  const isMinor             = useSafetyStore(s => s.isMinor);
  const setIsMinor          = useSafetyStore(s => s.setIsMinor);
  const locationSharing     = useSafetyStore(s => s.locationSharing);
  const setLocationSharing  = useSafetyStore(s => s.setLocationSharing);
  const verified            = useSafetyStore(s => s.verified);
  const verifiedPhone       = useSafetyStore(s => s.verifiedPhone);
  const setVerified         = useSafetyStore(s => s.setVerified);
  const clearVerified       = useSafetyStore(s => s.clearVerified);

  const [showContactModal, setShowContactModal] = React.useState(false);
  const [draftName,  setDraftName]  = React.useState('');
  const [draftPhone, setDraftPhone] = React.useState('');

  const [otpStep,       setOtpStep]       = React.useState('idle'); // idle | phone | otp | done
  const [otpPhone,      setOtpPhone]      = React.useState('');
  const [otpCode,       setOtpCode]       = React.useState('');
  const [otpSending,    setOtpSending]    = React.useState(false);

  function handleSendOTP() {
    const p = otpPhone.trim().replace(/\s+/g, '');
    if (p.length < 10) { Alert.alert('Enter a valid phone number (10+ digits)'); return; }
    setOtpSending(true);
    setTimeout(() => {
      setOtpSending(false);
      setOtpStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200);
  }

  function handleVerifyOTP() {
    if (otpCode.trim() !== '123456') {
      Alert.alert('Incorrect OTP', 'Enter the 6-digit code sent to your number.\n(Demo: use 123456)');
      return;
    }
    setVerified(otpPhone.trim());
    setOtpStep('idle');
    setOtpPhone('');
    setOtpCode('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function openContactModal() {
    setDraftName(emergencyContact?.name  ?? '');
    setDraftPhone(emergencyContact?.phone ?? '');
    setShowContactModal(true);
  }

  function saveContact() {
    const name  = draftName.trim();
    const phone = draftPhone.trim();
    if (!name)  { Alert.alert('Name required'); return; }
    if (!phone || phone.length < 10) { Alert.alert('Enter a valid phone number'); return; }
    setEmergencyContact({ name, phone });
    setShowContactModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function removeContact() {
    Alert.alert(
      'Remove Emergency Contact?',
      'Your emergency contact will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => { clearEmergencyContact(); Haptics.selectionAsync(); } },
      ]
    );
  }

  function testSOS() {
    const contact = emergencyContact;
    Alert.alert(
      '🚨 SOS Test',
      contact
        ? `In a real emergency, SnapWild will call:\n\n📞 ${contact.name}: ${contact.phone}\n📞 Emergency: 112 (Police)`
        : 'No emergency contact set.\n\nIn an emergency, SnapWild will call 112 (Police).\n\nAdd an emergency contact for extra safety.',
      [
        { text: 'Got it' },
        ...(contact ? [{ text: `Call ${contact.name}`, onPress: () => Linking.openURL(`tel:${contact.phone}`) }] : []),
      ]
    );
  }

  function handleMinorToggle(val) {
    if (val) {
      Alert.alert(
        'Minor Account Protection',
        'Enabling this will restrict meetup requests with adult accounts and hide your exact location from non-friends.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => { setIsMinor(true); Haptics.selectionAsync(); } },
        ]
      );
    } else {
      setIsMinor(false);
      Haptics.selectionAsync();
    }
  }

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Safety Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>

        {/* SOS section */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="alert-circle" size={18} color={C.red} />
            <Text style={s.sectionTitle}>SOS & Emergency</Text>
          </View>

          {/* Emergency contact */}
          {emergencyContact ? (
            <View style={s.contactCard}>
              <View style={s.contactLeft}>
                <View style={s.contactAvatar}>
                  <Text style={s.contactAvatarLetter}>{emergencyContact.name[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={s.contactName}>{emergencyContact.name}</Text>
                  <Text style={s.contactPhone}>{emergencyContact.phone}</Text>
                </View>
              </View>
              <View style={s.contactActions}>
                <TouchableOpacity style={s.contactEditBtn} onPress={openContactModal}>
                  <Ionicons name="pencil" size={14} color={C.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={s.contactRemoveBtn} onPress={removeContact}>
                  <Ionicons name="trash-outline" size={14} color={C.red} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.addContactBtn} onPress={openContactModal} activeOpacity={0.85}>
              <Ionicons name="person-add-outline" size={18} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={s.addContactTitle}>Add Emergency Contact</Text>
                <Text style={s.addContactSub}>Called automatically when you trigger SOS</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.testSOSBtn} onPress={testSOS} activeOpacity={0.85}>
            <Ionicons name="radio-button-on" size={16} color={C.red} />
            <Text style={s.testSOSText}>Test SOS Alert</Text>
          </TouchableOpacity>

          <View style={s.infoRow}>
            <Ionicons name="information-circle-outline" size={14} color={C.muted} />
            <Text style={s.infoText}>
              During any active meetup, a red SOS button is always visible. Tapping it calls your emergency contact and 112.
            </Text>
          </View>
        </View>

        {/* Privacy toggles */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="shield-outline" size={18} color={C.green} />
            <Text style={s.sectionTitle}>Privacy Controls</Text>
          </View>

          <ToggleRow
            icon="location-outline"
            title="Location Sharing"
            subtitle="Show your approximate city to nearby users"
            value={locationSharing}
            onToggle={v => { setLocationSharing(v); Haptics.selectionAsync(); }}
          />

          <View style={s.divider} />

          <ToggleRow
            icon="person-outline"
            title="Minor Account Protection"
            subtitle="Restricts meetups with adult accounts (under 18)"
            value={isMinor}
            onToggle={handleMinorToggle}
            accentColor={C.orange}
          />
          {isMinor && (
            <View style={s.minorBanner}>
              <Ionicons name="shield-checkmark" size={14} color={C.orange} />
              <Text style={s.minorBannerText}>Minor protection is active. Meetup requests from adult accounts are blocked.</Text>
            </View>
          )}
        </View>

        {/* Verified Badge */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="checkmark-circle" size={18} color={C.blue} />
            <Text style={s.sectionTitle}>Verified Badge</Text>
            {verified && (
              <View style={vf.badge}>
                <Ionicons name="checkmark-circle" size={12} color="#fff" />
                <Text style={vf.badgeText}>Verified</Text>
              </View>
            )}
          </View>

          {verified ? (
            <View>
              <View style={vf.verifiedRow}>
                <View style={vf.verifiedIconBox}>
                  <Ionicons name="checkmark-circle" size={28} color={C.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={vf.verifiedTitle}>Phone Verified</Text>
                  <Text style={vf.verifiedPhone}>{verifiedPhone}</Text>
                </View>
              </View>
              <Text style={s.infoText}>Your profile shows a verified badge visible to the community.</Text>
              <TouchableOpacity
                style={[s.testSOSBtn, { borderColor: C.red + '40', marginTop: 12, marginBottom: 0 }]}
                onPress={() => Alert.alert(
                  'Remove Verified Badge?',
                  'Your verified badge will be removed.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => { clearVerified(); Haptics.selectionAsync(); } },
                  ]
                )}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={16} color={C.red} />
                <Text style={[s.testSOSText]}>Remove Verification</Text>
              </TouchableOpacity>
            </View>
          ) : otpStep === 'idle' ? (
            <TouchableOpacity style={vf.getVerifiedBtn} onPress={() => setOtpStep('phone')} activeOpacity={0.85}>
              <Ionicons name="phone-portrait-outline" size={18} color={C.blue} />
              <View style={{ flex: 1 }}>
                <Text style={vf.getVerifiedTitle}>Get Verified</Text>
                <Text style={vf.getVerifiedSub}>Verify your phone number to earn a trust badge</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
          ) : otpStep === 'phone' ? (
            <View>
              <Text style={s.inputLabel}>Phone Number</Text>
              <TextInput
                style={s.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={C.muted}
                value={otpPhone}
                onChangeText={setOtpPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[s.saveBtn, otpSending && { opacity: 0.6 }]}
                onPress={handleSendOTP}
                disabled={otpSending}
                activeOpacity={0.85}
              >
                <Text style={s.saveBtnText}>{otpSending ? 'Sending OTP…' : 'Send OTP'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOtpStep('idle')} style={{ marginTop: 10, alignItems: 'center' }}>
                <Text style={{ color: C.muted, fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={s.inputLabel}>Enter 6-digit OTP sent to {otpPhone}</Text>
              <TextInput
                style={s.input}
                placeholder="123456"
                placeholderTextColor={C.muted}
                value={otpCode}
                onChangeText={v => setOtpCode(v.slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={s.saveBtn} onPress={handleVerifyOTP} activeOpacity={0.85}>
                <Text style={s.saveBtnText}>Verify & Get Badge</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOtpStep('phone')} style={{ marginTop: 10, alignItems: 'center' }}>
                <Text style={{ color: C.accent, fontSize: 13 }}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Safety tips */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="bulb-outline" size={18} color={C.accent} />
            <Text style={s.sectionTitle}>Safety Tips</Text>
          </View>
          {SAFETY_TIPS.map((t, i) => (
            <View key={i} style={[s.tipRow, i > 0 && { marginTop: 12 }]}>
              <View style={s.tipIcon}>
                <Ionicons name={t.icon} size={16} color={C.accent} />
              </View>
              <Text style={s.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

        {/* Emergency numbers */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Ionicons name="call-outline" size={18} color={C.blue} />
            <Text style={s.sectionTitle}>Emergency Numbers (India)</Text>
          </View>
          {[
            { label: 'Police',           number: '100',          color: C.blue  },
            { label: 'Ambulance',        number: '108',          color: C.red   },
            { label: 'Women Helpline',   number: '1091',         color: C.orange },
            { label: 'All Emergencies',  number: '112',          color: C.red   },
            { label: 'Wildlife Crime',   number: '1800-111-600', color: C.green  },
          ].map((e, i, arr) => (
            <View key={e.label}>
              <TouchableOpacity
                style={s.emergencyRow}
                onPress={() => Linking.openURL(`tel:${e.number}`)}
                activeOpacity={0.7}
              >
                <Text style={s.emergencyLabel}>{e.label}</Text>
                <View style={s.emergencyRight}>
                  <Text style={[s.emergencyNumber, { color: e.color }]}>{e.number}</Text>
                  <Ionicons name="call" size={14} color={e.color} />
                </View>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Emergency contact modal */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <Pressable style={s.modalBg} onPress={() => setShowContactModal(false)}>
          <Pressable style={[s.modalCard, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>Emergency Contact</Text>

            <Text style={s.inputLabel}>Full Name</Text>
            <TextInput
              style={s.input}
              placeholder="E.g. Mom, Dad, Riya…"
              placeholderTextColor={C.muted}
              value={draftName}
              onChangeText={setDraftName}
            />

            <Text style={s.inputLabel}>Phone Number</Text>
            <TextInput
              style={s.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={C.muted}
              value={draftPhone}
              onChangeText={setDraftPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={s.saveBtn} onPress={saveContact} activeOpacity={0.85}>
              <Text style={s.saveBtnText}>Save Contact</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function ToggleRow({ icon, title, subtitle, value, onToggle, accentColor }) {
  const col = accentColor ?? C.green;
  return (
    <View style={s.toggleRow}>
      <View style={[s.toggleIcon, { backgroundColor: col + '20' }]}>
        <Ionicons name={icon} size={16} color={col} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.toggleTitle}>{title}</Text>
        <Text style={s.toggleSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.border, true: col + '60' }}
        thumbColor={value ? col : C.muted}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },

  sectionCard:   { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: C.text },

  contactCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  contactLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactAvatar:  { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  contactAvatarLetter: { fontSize: 18, fontWeight: '700', color: C.accent },
  contactName:    { fontSize: 14, fontWeight: '700', color: C.text },
  contactPhone:   { fontSize: 12, color: C.muted, marginTop: 1 },
  contactActions: { flexDirection: 'row', gap: 8 },
  contactEditBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' },
  contactRemoveBtn:{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.red + '20', alignItems: 'center', justifyContent: 'center' },

  addContactBtn:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  addContactTitle:{ fontSize: 14, fontWeight: '700', color: C.text },
  addContactSub:  { fontSize: 11, color: C.muted, marginTop: 2 },

  testSOSBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.red + '15', borderRadius: 12, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: C.red + '40' },
  testSOSText: { fontSize: 14, fontWeight: '700', color: C.red },

  infoRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },

  toggleRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  toggleSub:   { fontSize: 11, color: C.muted, marginTop: 1 },

  minorBanner:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.orange + '15', borderRadius: 10, padding: 10, marginTop: 12, borderWidth: 1, borderColor: C.orange + '40' },
  minorBannerText: { flex: 1, fontSize: 12, color: C.text, lineHeight: 18 },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  tipRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, color: C.muted, lineHeight: 20 },

  emergencyRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  emergencyLabel: { fontSize: 14, color: C.text, fontWeight: '600' },
  emergencyRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emergencyNumber:{ fontSize: 14, fontWeight: '700' },

  modalBg:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard:  { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginBottom: 6 },
  input:      { backgroundColor: C.bg, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  saveBtn:    { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveBtnText:{ fontSize: 16, fontWeight: '700', color: C.bg },
});

const vf = StyleSheet.create({
  badge:          { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.blue, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 'auto' },
  badgeText:      { fontSize: 10, fontWeight: '700', color: '#fff' },
  verifiedRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.blue + '10', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.blue + '30' },
  verifiedIconBox:{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue + '20', alignItems: 'center', justifyContent: 'center' },
  verifiedTitle:  { fontSize: 14, fontWeight: '700', color: C.text },
  verifiedPhone:  { fontSize: 12, color: C.muted, marginTop: 2 },
  getVerifiedBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  getVerifiedTitle:{ fontSize: 14, fontWeight: '700', color: C.text },
  getVerifiedSub: { fontSize: 11, color: C.muted, marginTop: 2 },
});
