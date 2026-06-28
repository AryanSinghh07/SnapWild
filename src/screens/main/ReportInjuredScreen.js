import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useRescueStore, { INJURY_TYPES, SEVERITY_LEVELS } from '../../store/useRescueStore';
import { C } from '../../theme/colors';

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
const QUICK_SPECIES = [
  { label: 'Dog 🐕',     species: 'Street Dog',        emoji: '🐕' },
  { label: 'Cat 🐈',     species: 'Stray Cat',         emoji: '🐈' },
  { label: 'Bird 🐦',    species: 'Unknown Bird',      emoji: '🐦' },
  { label: 'Cow 🐄',     species: 'Cow',               emoji: '🐄' },
  { label: 'Peacock 🦚', species: 'Indian Peacock',    emoji: '🦚' },
  { label: 'Deer 🦌',    species: 'Spotted Deer',      emoji: '🦌' },
  { label: 'Monkey 🐒',  species: 'Bonnet Macaque',    emoji: '🐒' },
  { label: 'Snake 🐍',   species: 'Unknown Snake',     emoji: '🐍' },
];

const SEV_COLOR  = { High: C.red, Medium: C.orange, Low: C.green };
const SEV_DESC   = { High: 'Life-threatening', Medium: 'Needs attention', Low: 'Non-urgent' };

export default function ReportInjuredScreen({ navigation }) {
  const insets    = useSafeAreaInsets();
  const fileReport= useRescueStore(s => s.fileReport);

  const [species,     setSpecies]     = React.useState('');
  const [emoji,       setEmoji]       = React.useState('🐾');
  const [injuryType,  setInjuryType]  = React.useState(null);
  const [severity,    setSeverity]    = React.useState(null);
  const [description, setDescription] = React.useState('');
  const [city,        setCity]        = React.useState(CITIES[0]);
  const [area,        setArea]        = React.useState('');
  const [submitted,   setSubmitted]   = React.useState(false);
  const [resultNgo,   setResultNgo]   = React.useState(null);

  function handleQuick(item) {
    setSpecies(item.species);
    setEmoji(item.emoji);
    Haptics.selectionAsync();
  }

  function handleSubmit() {
    if (!species.trim()) {
      Alert.alert('Species required', 'Please enter or select the animal species.');
      return;
    }
    if (!injuryType) {
      Alert.alert('Injury type required', 'Please select what type of emergency this is.');
      return;
    }
    if (!severity) {
      Alert.alert('Severity required', 'Please select the severity level.');
      return;
    }

    const { ngo } = fileReport({
      species:     species.trim(),
      emoji,
      injuryType,
      severity,
      description: description.trim() || `${injuryType} ${species} reported.`,
      location:    { city, area: area.trim() || city, lat: 20.5937, lng: 78.9629 },
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResultNgo(ngo);
    setSubmitted(true);
  }

  // ── Success screen ──
  if (submitted && resultNgo) {
    return (
      <View style={[s.screen, s.center, { paddingTop: insets.top }]}>
        <View style={s.successIcon}>
          <Text style={{ fontSize: 48 }}>🛡️</Text>
        </View>
        <Text style={s.successTitle}>Report Filed!</Text>
        <Text style={s.successSub}>
          Your alert has been sent to the community. Nearby users will be notified.
          You earned <Text style={{ color: C.green, fontWeight: '700' }}>+50 Guardian XP</Text>.
        </Text>

        {/* NGO contact */}
        <View style={s.ngoSuccessCard}>
          <Text style={s.ngoSuccessLabel}>Suggested Rescue Contact</Text>
          <Text style={s.ngoSuccessName}>{resultNgo.name}</Text>
          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL(`tel:${resultNgo.phone}`)}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={18} color={C.bg} />
            <Text style={s.callBtnText}>Call {resultNgo.phone}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.successWarning}>
          <Ionicons name="warning-outline" size={16} color={C.orange} />
          <Text style={s.successWarningText}>
            Do not approach aggressive or venomous animals. Wait for trained rescuers.
          </Text>
        </View>

        <TouchableOpacity
          style={s.doneBtn}
          onPress={() => navigation.navigate('RescueAlerts')}
          activeOpacity={0.85}
        >
          <Text style={s.doneBtnText}>View All Alerts</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ──
  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Report Injured Animal</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Safety notice */}
        <View style={s.safetyBanner}>
          <Ionicons name="shield-outline" size={16} color={C.orange} />
          <Text style={s.safetyText}>Your identity is anonymous — only your city is shared with the community.</Text>
        </View>

        {/* Quick species select */}
        <Label text="What animal did you find?" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {QUICK_SPECIES.map(q => (
              <TouchableOpacity
                key={q.species}
                style={[s.quickChip, species === q.species && s.quickChipActive]}
                onPress={() => handleQuick(q)}
              >
                <Text style={s.quickChipText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TextInput
          style={s.input}
          placeholder="Or type species name…"
          placeholderTextColor={C.muted}
          value={species}
          onChangeText={v => { setSpecies(v); setEmoji('🐾'); }}
        />

        {/* Injury type */}
        <Label text="Type of Emergency" />
        <View style={s.chipRow}>
          {INJURY_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.typeChip, injuryType === t && s.typeChipActive]}
              onPress={() => { setInjuryType(t); Haptics.selectionAsync(); }}
            >
              <Text style={[s.typeChipText, injuryType === t && s.typeChipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Severity */}
        <Label text="Severity" />
        <View style={s.chipRow}>
          {SEVERITY_LEVELS.map(sev => {
            const col = SEV_COLOR[sev];
            const active = severity === sev;
            return (
              <TouchableOpacity
                key={sev}
                style={[s.sevChip, active && { backgroundColor: col + '25', borderColor: col }]}
                onPress={() => { setSeverity(sev); Haptics.selectionAsync(); }}
              >
                <View style={[s.sevDot, { backgroundColor: col }]} />
                <View>
                  <Text style={[s.sevChipText, active && { color: col, fontWeight: '700' }]}>{sev}</Text>
                  <Text style={s.sevChipDesc}>{SEV_DESC[sev]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Label text="Description (optional)" />
        <TextInput
          style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="Describe what you see — injuries, behaviour, exact spot…"
          placeholderTextColor={C.muted}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Location */}
        <Label text="Location" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CITIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.quickChip, city === c && s.quickChipActive]}
                onPress={() => { setCity(c); Haptics.selectionAsync(); }}
              >
                <Text style={s.quickChipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TextInput
          style={s.input}
          placeholder="Area / landmark (e.g. Cubbon Park, near gate 2)"
          placeholderTextColor={C.muted}
          value={area}
          onChangeText={setArea}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, (!species.trim() || !injuryType || !severity) && s.submitBtnOff]}
          disabled={!species.trim() || !injuryType || !severity}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name="alert-circle" size={18} color={(!species.trim() || !injuryType || !severity) ? C.muted : C.bg} />
          <Text style={[s.submitBtnText, (!species.trim() || !injuryType || !severity) && { color: C.muted }]}>
            File Rescue Report
          </Text>
        </TouchableOpacity>

        <Text style={s.footer}>Reports are reviewed by the community. False reports may result in account action.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }) {
  return (
    <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
      {text.toUpperCase()}
    </Text>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },

  safetyBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.orange + '15', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: C.orange + '40' },
  safetyText:   { flex: 1, fontSize: 12, color: C.text, lineHeight: 18 },

  input:    { backgroundColor: C.card, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 16 },

  quickChip:       { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  quickChipActive: { backgroundColor: C.primary, borderColor: C.accent },
  quickChipText:   { fontSize: 13, color: C.text, fontWeight: '600' },

  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip:        { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  typeChipActive:  { backgroundColor: C.primary, borderColor: C.accent },
  typeChipText:    { fontSize: 13, color: C.muted, fontWeight: '600' },
  typeChipTextActive: { color: C.accent },

  sevChip:     { flex: 1, minWidth: '30%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  sevDot:      { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  sevChipText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  sevChipDesc: { fontSize: 10, color: C.muted, marginTop: 1 },

  submitBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.red, borderRadius: 14, paddingVertical: 16, marginBottom: 10 },
  submitBtnOff: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  submitBtnText:{ fontSize: 16, fontWeight: '700', color: C.bg },

  footer: { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17 },

  // Success screen
  successIcon:    { width: 90, height: 90, borderRadius: 45, backgroundColor: C.green + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.green + '40' },
  successTitle:   { fontSize: 24, fontWeight: '800', color: C.text },
  successSub:     { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },
  ngoSuccessCard: { width: '100%', backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 8, alignItems: 'center' },
  ngoSuccessLabel:{ fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  ngoSuccessName: { fontSize: 17, fontWeight: '700', color: C.text },
  callBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.green, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4 },
  callBtnText:    { fontSize: 14, fontWeight: '700', color: C.bg },
  successWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.orange + '15', borderRadius: 12, padding: 12, width: '100%' },
  successWarningText: { flex: 1, fontSize: 12, color: C.text, lineHeight: 18 },
  doneBtn:        { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: C.accent + '60' },
  doneBtnText:    { fontSize: 15, fontWeight: '700', color: C.accent },
});
