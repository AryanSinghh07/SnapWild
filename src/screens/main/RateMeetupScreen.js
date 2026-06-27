import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore, { SPECIES_EMOJI } from '../../store/usePetStore';
import { C } from '../../theme/colors';

const BEHAVIOURS = [
  { key: 'great',      label: 'Great!',     emoji: '😊' },
  { key: 'good',       label: 'Good',       emoji: '👍' },
  { key: 'okay',       label: 'Okay',       emoji: '😐' },
  { key: 'aggressive', label: 'Aggressive', emoji: '⚠️' },
];

function duration(startedAt) {
  const mins = Math.round((Date.now() - new Date(startedAt)) / 60_000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function RateMeetupScreen({ route, navigation }) {
  const { meetupId } = route.params;
  const insets = useSafeAreaInsets();

  const activeMeetups  = usePetStore(s => s.activeMeetups);
  const completeMeetup = usePetStore(s => s.completeMeetup);

  const meetup = activeMeetups.find(m => m.id === meetupId);

  const [stars,     setStars]     = React.useState(0);
  const [behaviour, setBehaviour] = React.useState(null);
  const [meetAgain, setMeetAgain] = React.useState(null);
  const [notes,     setNotes]     = React.useState('');

  function handleSubmit() {
    if (stars === 0) {
      Alert.alert('Rate the meetup', 'Please give at least a star rating.');
      return;
    }
    completeMeetup(meetupId, { stars, behaviour, meetAgain, notes: notes.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('PetPlaydates');
  }

  if (!meetup) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <Text style={{ color: C.muted }}>Meetup not found.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PetPlaydates')} style={{ marginTop: 16 }}>
          <Text style={{ color: C.accent }}>Back to Pet Playdates</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ width: 36 }} />
        <Text style={s.headerTitle}>Rate the Meetup</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recap card */}
        <View style={s.recapCard}>
          <View style={s.recapPets}>
            <Text style={{ fontSize: 34 }}>{SPECIES_EMOJI[meetup.myPet.species] ?? '🐾'}</Text>
            <Text style={s.recapX}>×</Text>
            <Text style={{ fontSize: 34 }}>{SPECIES_EMOJI[meetup.theirPet.species] ?? '🐾'}</Text>
          </View>
          <Text style={s.recapTitle}>{meetup.myPet.name} × {meetup.theirPet.name}</Text>
          <Text style={s.recapMeta}>
            📍 {meetup.location} · ⏱ {duration(meetup.startedAt)}
          </Text>
        </View>

        {/* Star rating */}
        <Label text="How was the meetup overall?" />
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => { setStars(n); Haptics.selectionAsync(); }}
              hitSlop={6}
            >
              <Ionicons
                name={n <= stars ? 'star' : 'star-outline'}
                size={42}
                color={n <= stars ? C.accent : C.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        {stars > 0 && (
          <Text style={s.starLabel}>
            {['', 'Poor 😟', 'Fair 😐', 'Good 👍', 'Great! 😊', 'Amazing! 🎉'][stars]}
          </Text>
        )}

        {/* Pet behaviour */}
        <Label text={`How did ${meetup.theirPet.name} behave?`} />
        <View style={s.behaviourRow}>
          {BEHAVIOURS.map(b => (
            <TouchableOpacity
              key={b.key}
              style={[s.behaviourChip, behaviour === b.key && s.behaviourChipActive]}
              onPress={() => { setBehaviour(b.key); Haptics.selectionAsync(); }}
            >
              <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
              <Text style={[s.behaviourText, behaviour === b.key && s.behaviourTextActive]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meet again */}
        <Label text="Would you meet again?" />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {['Yes! 🐾', 'Maybe', 'No'].map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.toggleChip, meetAgain === opt && s.toggleChipActive, { flex: 1, alignItems: 'center' }]}
              onPress={() => { setMeetAgain(opt); Haptics.selectionAsync(); }}
            >
              <Text style={[s.toggleText, meetAgain === opt && s.toggleTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Label text="Notes (optional)" />
        <TextInput
          style={s.input}
          placeholder="How did it go? Any memorable moments?"
          placeholderTextColor={C.muted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, stars === 0 && s.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark-circle" size={20} color={stars > 0 ? C.bg : C.muted} />
          <Text style={[s.submitText, stars === 0 && { color: C.muted }]}>Submit & Save</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }) {
  return (
    <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 0.8 }}>
      {text.toUpperCase()}
    </Text>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

  recapCard:  { alignItems: 'center', backgroundColor: C.card, borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: C.border, gap: 8 },
  recapPets:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recapX:     { fontSize: 22, color: C.muted, fontWeight: '300' },
  recapTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  recapMeta:  { fontSize: 12, color: C.muted },

  starsRow:  { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starLabel: { textAlign: 'center', fontSize: 15, color: C.text, fontWeight: '600', marginBottom: 20 },

  behaviourRow:       { flexDirection: 'row', gap: 8, marginBottom: 20 },
  behaviourChip:      { flex: 1, alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: C.border },
  behaviourChipActive:{ backgroundColor: C.primary, borderColor: C.accent },
  behaviourText:      { fontSize: 11, color: C.muted, fontWeight: '600' },
  behaviourTextActive:{ color: C.accent },

  toggleChip:       { paddingVertical: 12, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  toggleChipActive: { backgroundColor: C.primary, borderColor: C.accent },
  toggleText:       { fontSize: 13, color: C.muted, fontWeight: '600' },
  toggleTextActive: { color: C.accent },

  input: {
    backgroundColor: C.card, borderRadius: 12, padding: 14, color: C.text,
    fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 24,
    minHeight: 80, textAlignVertical: 'top',
  },

  submitBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16 },
  submitBtnDisabled: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  submitText:        { fontSize: 16, fontWeight: '700', color: C.bg },
});
