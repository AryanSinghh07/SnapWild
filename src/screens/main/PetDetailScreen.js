import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore, { SPECIES_EMOJI, getNearestVet } from '../../store/usePetStore';
import { getCompatibility } from '../../services/gemini';
import { C } from '../../theme/colors';

function scoreColor(score) {
  if (score >= 80) return C.green;
  if (score >= 60) return C.accent;
  if (score >= 40) return C.orange;
  return C.red;
}

function scoreLabel(score) {
  if (score >= 80) return 'Great Match! 🎉';
  if (score >= 60) return 'Good Match 👍';
  if (score >= 40) return 'Might Work 🤔';
  return 'Tricky Match ⚠️';
}

export default function PetDetailScreen({ route, navigation }) {
  const { pet }  = route.params;
  const insets   = useSafeAreaInsets();

  const myPets          = usePetStore(s => s.myPets);
  const sendMeetRequest = usePetStore(s => s.sendMeetRequest);
  const hasSentRequest  = usePetStore(s => s.hasSentRequest);
  const outgoing        = usePetStore(s => s.outgoingRequests);

  const [selectedMyPet, setSelectedMyPet] = React.useState(myPets[0] ?? null);
  const [compat,  setCompat]  = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const alreadySent = selectedMyPet ? hasSentRequest(selectedMyPet.id, pet.id) : false;
  const vet         = getNearestVet(pet.owner.city);

  // Reset compat when pet selection changes
  React.useEffect(() => { setCompat(null); }, [selectedMyPet]);

  async function checkCompatibility() {
    if (!selectedMyPet) return;
    setLoading(true);
    setCompat(null);
    try {
      const result = await getCompatibility(selectedMyPet, pet);
      setCompat(result);
    } catch {
      setCompat(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSendRequest() {
    if (!selectedMyPet) {
      Alert.alert('Add a Pet First', 'Go to My Pets tab and add your pet.');
      return;
    }
    const sent = sendMeetRequest(selectedMyPet, pet);
    if (sent) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Request Sent! 🐾',
        `${selectedMyPet.name} sent a meet request to ${pet.name}. @${pet.owner.username} will be notified.`
      );
    } else {
      Alert.alert('Already Sent', `You already sent a meet request to ${pet.name}.`);
    }
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{pet.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero */}
        <View style={s.heroCard}>
          <View style={s.heroEmojiBox}>
            <Text style={{ fontSize: 64 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
          </View>
          <Text style={s.heroName}>{pet.name}</Text>
          <Text style={s.heroBreed}>{pet.breed} · {pet.gender} · {pet.age} yr</Text>
          <View style={s.heroMeta}>
            <Ionicons name="person-circle-outline" size={13} color={C.muted} />
            <Text style={s.heroMetaText}>@{pet.owner.username} · {pet.owner.city}</Text>
          </View>
          <View style={s.heroMeta}>
            <Ionicons name="location" size={13} color={C.accent} />
            <Text style={[s.heroMetaText, { color: C.accent }]}>{pet.owner.distance} km away</Text>
          </View>
        </View>

        {/* Personality */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Personality</Text>
          <View style={s.tagRow}>
            {pet.temperament.map(t => (
              <View key={t} style={s.tag}>
                <Text style={s.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          {!!pet.personalityNotes && (
            <Text style={s.notes}>"{pet.personalityNotes}"</Text>
          )}
        </View>

        {/* AI Compatibility */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>AI Compatibility</Text>

          {myPets.length === 0 ? (
            <View style={s.compatEmpty}>
              <Text style={s.compatEmptyText}>
                Add your pet to check compatibility with {pet.name}
              </Text>
              <TouchableOpacity
                style={s.addPetSmallBtn}
                onPress={() => navigation.navigate('AddPet')}
              >
                <Text style={s.addPetSmallText}>+ Add Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* My pet selector */}
              {myPets.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
                    {myPets.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[s.myPetChip, selectedMyPet?.id === p.id && s.myPetChipActive]}
                        onPress={() => setSelectedMyPet(p)}
                      >
                        <Text style={{ fontSize: 16 }}>{SPECIES_EMOJI[p.species] ?? '🐾'}</Text>
                        <Text style={[s.myPetChipText, selectedMyPet?.id === p.id && { color: C.bg }]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}

              {/* Check button */}
              {!compat && !loading && (
                <TouchableOpacity style={s.checkBtn} onPress={checkCompatibility}>
                  <Ionicons name="sparkles" size={16} color={C.bg} />
                  <Text style={s.checkBtnText}>
                    Check {selectedMyPet?.name} × {pet.name}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Loading */}
              {loading && (
                <View style={s.loadingBox}>
                  <ActivityIndicator color={C.accent} />
                  <Text style={s.loadingText}>Vanya is analysing compatibility…</Text>
                </View>
              )}

              {/* Result */}
              {compat && (
                <View style={s.compatCard}>
                  <View style={s.compatScoreRow}>
                    <Text style={[s.compatScore, { color: scoreColor(compat.score) }]}>
                      {compat.score}%
                    </Text>
                    <Text style={s.compatLabel}>{scoreLabel(compat.score)}</Text>
                  </View>
                  <View style={[s.compatBar, { backgroundColor: C.border }]}>
                    <View style={[s.compatFill, { width: `${compat.score}%`, backgroundColor: scoreColor(compat.score) }]} />
                  </View>
                  <Text style={s.compatSummary}>{compat.summary}</Text>
                  {compat.tips?.map((tip, i) => (
                    <View key={i} style={s.tipRow}>
                      <Ionicons name="checkmark-circle" size={14} color={C.green} />
                      <Text style={s.tipText}>{tip}</Text>
                    </View>
                  ))}
                  <TouchableOpacity onPress={checkCompatibility} style={s.reCheckBtn}>
                    <Text style={s.reCheckText}>Re-check</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Health Card */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Health Card</Text>
          <View style={s.healthCard}>
            <HealthRow
              icon={pet.healthCard.vaccinated ? 'shield-checkmark' : 'shield-outline'}
              iconColor={pet.healthCard.vaccinated ? C.green : C.orange}
              label="Vaccinated"
              value={pet.healthCard.vaccinated ? 'Yes' : 'Not on record'}
            />
            <View style={s.divider} />
            <HealthRow icon="calendar-outline" iconColor={C.blue} label="Last Vet Visit" value={pet.healthCard.lastVetVisit} />
            <View style={s.divider} />
            <HealthRow icon="alert-circle-outline" iconColor={C.orange} label="Allergies" value={pet.healthCard.allergies} />
            <View style={s.divider} />
            <HealthRow
              icon="pulse-outline"
              iconColor={pet.healthCard.aggressionLevel === 'None' ? C.green : C.orange}
              label="Aggression"
              value={pet.healthCard.aggressionLevel}
            />
          </View>
        </View>

        {/* Nearest vet */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Nearest Vet (for meetup)</Text>
          <TouchableOpacity
            style={s.vetCard}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`tel:${vet.phone}`)}
          >
            <View style={s.vetLeft}>
              <View style={s.vetIcon}>
                <Ionicons name="medical" size={18} color={C.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.vetName}>{vet.name}</Text>
                <Text style={s.vetMeta}>{vet.distance} km · {vet.phone}</Text>
              </View>
            </View>
            <View style={s.vetCallBtn}>
              <Ionicons name="call" size={14} color={C.text} />
              <Text style={s.vetCallText}>Call</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Safety note */}
        <View style={s.safetyCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={C.green} />
          <Text style={s.safetyText}>
            Meetups are in public places only — parks, open grounds, pet-friendly cafes
          </Text>
        </View>

        {/* View full profile */}
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <TouchableOpacity
            style={s.profileBtn}
            onPress={() => navigation.navigate('PetProfile', { pet })}
          >
            <Ionicons name="person-circle-outline" size={16} color={C.accent} />
            <Text style={s.profileBtnText}>View {pet.name}'s Full Profile</Text>
            <Ionicons name="chevron-forward" size={14} color={C.accent} />
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {myPets.length === 0 ? (
            <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('AddPet')}>
              <Ionicons name="add-circle" size={20} color={C.bg} />
              <Text style={s.ctaBtnText}>Add Your Pet First</Text>
            </TouchableOpacity>
          ) : alreadySent ? (
            <View style={[s.ctaBtn, s.ctaBtnDisabled]}>
              <Ionicons name="time-outline" size={20} color={C.muted} />
              <Text style={[s.ctaBtnText, { color: C.muted }]}>Request Sent · Awaiting Response</Text>
            </View>
          ) : (
            <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={handleSendRequest}>
              <Text style={{ fontSize: 18 }}>🐾</Text>
              <Text style={s.ctaBtnText}>Send Meet Request to {pet.name}</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

function HealthRow({ icon, iconColor, label, value }) {
  return (
    <View style={s.healthRow}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={s.healthLabel}>{label}</Text>
      <Text style={s.healthValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

  heroCard:     { alignItems: 'center', backgroundColor: C.card, margin: 16, borderRadius: 20, padding: 24, gap: 6, borderWidth: 1, borderColor: C.border },
  heroEmojiBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.primary + '50', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroName:     { fontSize: 24, fontWeight: '800', color: C.text },
  heroBreed:    { fontSize: 14, color: C.muted },
  heroMeta:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { fontSize: 13, color: C.muted },

  section:      { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },

  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag:     { backgroundColor: C.primary + '50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 12, color: C.accent, fontWeight: '600' },
  notes:   { fontSize: 13, color: C.muted, fontStyle: 'italic', lineHeight: 20 },

  compatEmpty:      { backgroundColor: C.card, borderRadius: 14, padding: 20, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  compatEmptyText:  { fontSize: 13, color: C.muted, textAlign: 'center' },
  addPetSmallBtn:   { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  addPetSmallText:  { fontSize: 13, fontWeight: '700', color: C.accent },

  myPetChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  myPetChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  myPetChipText:   { fontSize: 13, color: C.text, fontWeight: '600' },

  checkBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14 },
  checkBtnText:  { fontSize: 14, fontWeight: '700', color: C.bg },

  loadingBox:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  loadingText:  { fontSize: 13, color: C.muted },

  compatCard:     { backgroundColor: C.card, borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: C.border },
  compatScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compatScore:    { fontSize: 36, fontWeight: '900' },
  compatLabel:    { fontSize: 16, fontWeight: '700', color: C.text },
  compatBar:      { height: 8, borderRadius: 4, overflow: 'hidden' },
  compatFill:     { height: 8, borderRadius: 4 },
  compatSummary:  { fontSize: 13, color: C.muted, lineHeight: 20 },
  tipRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipText:        { fontSize: 13, color: C.text, flex: 1, lineHeight: 18 },
  reCheckBtn:     { alignSelf: 'flex-end', paddingVertical: 4 },
  reCheckText:    { fontSize: 12, color: C.muted, textDecorationLine: 'underline' },

  healthCard:  { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  healthRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  healthLabel: { flex: 1, fontSize: 13, color: C.muted, fontWeight: '600' },
  healthValue: { fontSize: 13, color: C.text, fontWeight: '600' },
  divider:     { height: 1, backgroundColor: C.border },

  vetCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.red + '40', gap: 12 },
  vetLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  vetIcon:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.red + '20', alignItems: 'center', justifyContent: 'center' },
  vetName:    { fontSize: 13, fontWeight: '700', color: C.text },
  vetMeta:    { fontSize: 11, color: C.muted, marginTop: 2 },
  vetCallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.red, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  vetCallText:{ fontSize: 12, fontWeight: '700', color: C.text },

  safetyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.green + '15', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.green + '40' },
  safetyText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },

  profileBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.card, borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: C.accent + '50' },
  profileBtnText: { fontSize: 13, fontWeight: '600', color: C.accent, flex: 1, textAlign: 'center' },

  ctaBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16 },
  ctaBtnDisabled:{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  ctaBtnText:    { fontSize: 15, fontWeight: '700', color: C.bg },
});
