import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore, { TEMPERAMENT_OPTIONS } from '../../store/usePetStore';
import { C } from '../../theme/colors';

const SPECIES_LIST = [
  { label: 'Dog',     emoji: '🐕' },
  { label: 'Cat',     emoji: '🐈' },
  { label: 'Bird',    emoji: '🐦' },
  { label: 'Rabbit',  emoji: '🐇' },
  { label: 'Fish',    emoji: '🐠' },
  { label: 'Reptile', emoji: '🦎' },
  { label: 'Other',   emoji: '🐾' },
];

const AGGRESSION_LEVELS = ['None', 'Low', 'Medium', 'High'];

function aggressionColor(level) {
  return { None: C.green, Low: C.accent, Medium: C.orange, High: C.red }[level] ?? C.muted;
}

export default function AddPetScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const addPet = usePetStore(s => s.addPet);

  const [species,     setSpecies]     = React.useState('Dog');
  const [name,        setName]        = React.useState('');
  const [breed,       setBreed]       = React.useState('');
  const [age,         setAge]         = React.useState('');
  const [gender,      setGender]      = React.useState('Male');
  const [temperament, setTemperament] = React.useState([]);
  const [notes,       setNotes]       = React.useState('');
  const [vaccinated,  setVaccinated]  = React.useState(true);
  const [lastVet,     setLastVet]     = React.useState('');
  const [allergies,   setAllergies]   = React.useState('');
  const [aggression,  setAggression]  = React.useState('None');

  function toggleTemperament(t) {
    setTemperament(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    Haptics.selectionAsync();
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name Required', "Enter your pet's name.");
      return;
    }
    if (temperament.length === 0) {
      Alert.alert('Personality Required', 'Pick at least one personality trait.');
      return;
    }
    addPet({
      name:        name.trim(),
      species,
      breed:       breed.trim() || species,
      age:         parseInt(age, 10) || 1,
      gender,
      temperament,
      personalityNotes: notes.trim(),
      healthCard: {
        vaccinated,
        lastVetVisit:   lastVet.trim() || 'Not specified',
        allergies:      allergies.trim() || 'None',
        aggressionLevel: aggression,
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Add Pet Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Species */}
        <FieldLabel text="Species" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
            {SPECIES_LIST.map(sp => (
              <TouchableOpacity
                key={sp.label}
                style={[s.speciesChip, species === sp.label && s.speciesChipActive]}
                onPress={() => { setSpecies(sp.label); Haptics.selectionAsync(); }}
              >
                <Text style={{ fontSize: 24 }}>{sp.emoji}</Text>
                <Text style={[s.speciesText, species === sp.label && s.speciesTextActive]}>
                  {sp.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Name */}
        <FieldLabel text="Name *" />
        <TextInput
          style={s.input}
          placeholder="Your pet's name"
          placeholderTextColor={C.muted}
          value={name}
          onChangeText={setName}
        />

        {/* Breed */}
        <FieldLabel text="Breed" />
        <TextInput
          style={s.input}
          placeholder={`${species} breed (optional)`}
          placeholderTextColor={C.muted}
          value={breed}
          onChangeText={setBreed}
        />

        {/* Age + Gender */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel text="Age (years)" />
            <TextInput
              style={s.input}
              placeholder="e.g. 3"
              placeholderTextColor={C.muted}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel text="Gender" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Male', 'Female'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.toggleChip, gender === g && s.toggleChipActive, { flex: 1 }]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[s.toggleText, gender === g && s.toggleTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Temperament */}
        <FieldLabel text="Personality (pick any) *" />
        <View style={s.chipWrap}>
          {TEMPERAMENT_OPTIONS.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, temperament.includes(t) && s.chipActive]}
              onPress={() => toggleTemperament(t)}
            >
              <Text style={[s.chipText, temperament.includes(t) && s.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <FieldLabel text="Personality Notes" />
        <TextInput
          style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
          placeholder="Describe your pet's quirks…"
          placeholderTextColor={C.muted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Health Card */}
        <View style={s.divider} />
        <Text style={s.sectionLabel}>Health Card</Text>

        <FieldLabel text="Vaccinated?" />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[true, false].map(v => (
            <TouchableOpacity
              key={String(v)}
              style={[s.toggleChip, vaccinated === v && s.toggleChipActive]}
              onPress={() => setVaccinated(v)}
            >
              <Text style={[s.toggleText, vaccinated === v && s.toggleTextActive]}>
                {v ? '✓ Yes' : '✗ No'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FieldLabel text="Last Vet Visit" />
        <TextInput
          style={s.input}
          placeholder="e.g. Jan 2026"
          placeholderTextColor={C.muted}
          value={lastVet}
          onChangeText={setLastVet}
        />

        <FieldLabel text="Allergies" />
        <TextInput
          style={s.input}
          placeholder="None / list any allergies"
          placeholderTextColor={C.muted}
          value={allergies}
          onChangeText={setAllergies}
        />

        <FieldLabel text="Aggression Level" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {AGGRESSION_LEVELS.map(a => (
            <TouchableOpacity
              key={a}
              style={[
                s.toggleChip,
                aggression === a && { backgroundColor: aggressionColor(a) + '30', borderColor: aggressionColor(a) },
              ]}
              onPress={() => setAggression(a)}
            >
              <Text style={[s.toggleText, aggression === a && { color: aggressionColor(a), fontWeight: '700' }]}>
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity style={s.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color={C.bg} />
          <Text style={s.saveBtnText}>Save Pet Profile</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ text }) {
  return (
    <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.8 }}>
      {text.toUpperCase()}
    </Text>
  );
}

const s = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: 'bold', color: C.text },

  speciesChip:       { alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border, minWidth: 72 },
  speciesChipActive: { backgroundColor: C.primary, borderColor: C.accent },
  speciesText:       { fontSize: 12, color: C.muted, fontWeight: '600' },
  speciesTextActive: { color: C.accent },

  input: {
    backgroundColor: C.card, borderRadius: 12, padding: 14, color: C.text,
    fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },

  toggleChip:       { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  toggleChipActive: { backgroundColor: C.primary + '50', borderColor: C.accent },
  toggleText:       { fontSize: 13, color: C.muted, fontWeight: '600' },
  toggleTextActive: { color: C.accent },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  chipActive:   { backgroundColor: C.primary, borderColor: C.accent },
  chipText:     { fontSize: 13, color: C.muted, fontWeight: '600' },
  chipTextActive:{ color: C.accent },

  divider:      { height: 1, backgroundColor: C.border, marginVertical: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },

  saveBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: C.bg },
});
