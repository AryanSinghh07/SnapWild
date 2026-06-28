import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore,   { SPECIES_EMOJI, getNearestVet } from '../../store/usePetStore';
import useSafetyStore from '../../store/useSafetyStore';
import { C } from '../../theme/colors';

const MEETUP_TIPS = [
  'Keep both pets on leash for the first 10 minutes',
  "Let them sniff — it's normal greeting behaviour",
  'Watch for play bows and wagging tails — great signs!',
  'Have treats ready to reward calm behaviour',
  'Avoid crowded spots for a first meeting',
];

function useTimer(startedAt) {
  const [elapsed, setElapsed] = React.useState(
    Math.floor((Date.now() - new Date(startedAt)) / 1000)
  );
  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MeetupScreen({ route, navigation }) {
  const { meetupId } = route.params;
  const insets = useSafeAreaInsets();

  const activeMeetups      = usePetStore(s => s.activeMeetups);
  const meetup             = activeMeetups.find(m => m.id === meetupId);
  const timer              = useTimer(meetup?.startedAt ?? new Date().toISOString());
  const vet                = getNearestVet();
  const emergencyContact   = useSafetyStore(s => s.emergencyContact);
  const logSOS             = useSafetyStore(s => s.logSOS);

  // Auto safety check at 30 seconds (demo stand-in for 30 minutes)
  React.useEffect(() => {
    const id = setTimeout(() => {
      Alert.alert(
        '🛡️ Safety Check-in',
        'Are you and your pet safe?',
        [
          { text: "Yes, all good! 👍", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
          { text: 'Need help', style: 'destructive', onPress: () => Linking.openURL(`tel:${vet.phone}`) },
        ]
      );
    }, 30_000);
    return () => clearTimeout(id);
  }, []);

  if (!meetup) {
    return (
      <View style={[s.screen, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.muted, fontSize: 15 }}>Meetup not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: C.accent }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleSOS() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    logSOS('Triggered from MeetupScreen');
    const buttons = [
      { text: 'Cancel', style: 'cancel' },
      { text: '📞 Call 112', onPress: () => Linking.openURL('tel:112') },
    ];
    if (emergencyContact) {
      buttons.splice(1, 0, {
        text: `📞 Call ${emergencyContact.name}`,
        onPress: () => Linking.openURL(`tel:${emergencyContact.phone}`),
      });
    }
    Alert.alert(
      '🚨 SOS — Need Help?',
      emergencyContact
        ? `Calling your emergency contact:\n${emergencyContact.name}: ${emergencyContact.phone}\n\nOr call emergency services.`
        : 'No emergency contact set. Calling emergency services.',
      buttons
    );
  }

  function handleEmergencyCall() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      '🚨 Emergency Vet',
      `${vet.name}\n${vet.phone}\n${vet.distance} km away`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL(`tel:${vet.phone}`) },
      ]
    );
  }

  function handleSafetyCheck() {
    Alert.alert(
      '🛡️ Safety Check-in',
      'Are you and your pet safe?',
      [
        { text: "Yes, all good! 👍", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
        { text: 'Need help 🚨', style: 'destructive', onPress: () => Linking.openURL(`tel:${vet.phone}`) },
      ]
    );
  }

  function handleEndMeetup() {
    Alert.alert(
      'End Meetup?',
      'Ready to wrap up? You can rate the experience next.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End & Rate', onPress: () => navigation.replace('RateMeetup', { meetupId }) },
      ]
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ width: 36 }} />
        <Text style={s.headerTitle}>Active Meetup</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Floating SOS button — always visible */}
      <TouchableOpacity
        style={[s.sosBtn, { top: insets.top + 8 }]}
        onPress={handleSOS}
        activeOpacity={0.85}
      >
        <Ionicons name="alert-circle" size={16} color="#fff" />
        <Text style={s.sosBtnText}>SOS</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Live timer */}
        <View style={s.timerCard}>
          <View style={s.liveDot} />
          <Text style={s.liveLabel}>LIVE</Text>
          <Text style={s.timer}>{timer}</Text>
          <View style={s.locationRow}>
            <Ionicons name="location" size={13} color={C.accent} />
            <Text style={s.locationText}>{meetup.location}</Text>
          </View>
        </View>

        {/* Pets */}
        <View style={s.petsRow}>
          <PetBubble pet={meetup.myPet} sublabel="Your Pet" />
          <View style={s.pawBox}>
            <Text style={{ fontSize: 28 }}>🐾</Text>
            <Text style={s.pawLabel}>Meeting!</Text>
          </View>
          <PetBubble pet={meetup.theirPet} sublabel={`@${meetup.theirPet.owner?.username ?? 'them'}`} />
        </View>

        {/* Meetup tips */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tips for a Great Meetup</Text>
          <View style={s.tipsCard}>
            {MEETUP_TIPS.map((tip, i) => (
              <View key={i} style={[s.tipRow, i > 0 && { marginTop: 10 }]}>
                <Ionicons name="checkmark-circle" size={15} color={C.green} />
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nearest vet */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Nearest Vet</Text>
          <TouchableOpacity style={s.vetCard} activeOpacity={0.85} onPress={handleEmergencyCall}>
            <View style={s.vetLeft}>
              <View style={s.vetIconBox}>
                <Ionicons name="medical" size={20} color={C.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.vetName}>{vet.name}</Text>
                <Text style={s.vetMeta}>{vet.distance} km away · {vet.phone}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={handleEmergencyCall}>
              <Ionicons name="call" size={15} color={C.text} />
              <Text style={s.callText}>Call</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity style={s.safetyBtn} onPress={handleSafetyCheck} activeOpacity={0.85}>
            <Ionicons name="shield-checkmark-outline" size={18} color={C.green} />
            <Text style={s.safetyBtnText}>Safety Check-in</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency vet banner */}
        <View style={s.emergencyBanner}>
          <Ionicons name="alert-circle" size={18} color={C.red} />
          <Text style={s.emergencyText}>Emergency? One-tap vet call available above</Text>
        </View>

        {/* End meetup */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <TouchableOpacity style={s.endBtn} activeOpacity={0.85} onPress={handleEndMeetup}>
            <Ionicons name="flag" size={18} color={C.bg} />
            <Text style={s.endBtnText}>End Meetup & Rate</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

function PetBubble({ pet, sublabel }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={s.petBubble}>
        <Text style={{ fontSize: 36 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
      </View>
      <Text style={s.petBubbleName}>{pet.name}</Text>
      <Text style={s.petBubbleSub}>{sublabel}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

  timerCard:    { alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 20, padding: 28, marginBottom: 16, borderWidth: 1, borderColor: C.border, gap: 6 },
  liveDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  liveLabel:    { fontSize: 11, fontWeight: '800', color: C.red, letterSpacing: 2 },
  timer:        { fontSize: 52, fontWeight: '900', color: C.text, letterSpacing: 2 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: C.accent, fontWeight: '600' },

  petsRow:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 20 },
  petBubble:     { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary + '50', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  petBubbleName: { fontSize: 15, fontWeight: '700', color: C.text, textAlign: 'center' },
  petBubbleSub:  { fontSize: 11, color: C.muted, textAlign: 'center' },
  pawBox:        { alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  pawLabel:      { fontSize: 11, color: C.muted, fontWeight: '600' },

  section:      { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },

  tipsCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  tipRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipText:  { flex: 1, fontSize: 13, color: C.muted, lineHeight: 20 },

  vetCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.red + '40', gap: 12 },
  vetLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  vetIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.red + '20', alignItems: 'center', justifyContent: 'center' },
  vetName:    { fontSize: 14, fontWeight: '700', color: C.text },
  vetMeta:    { fontSize: 11, color: C.muted, marginTop: 2 },
  callBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.red, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  callText:   { fontSize: 13, fontWeight: '700', color: C.text },

  safetyBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.green + '20', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: C.green + '40' },
  safetyBtnText: { fontSize: 15, fontWeight: '700', color: C.green },

  emergencyBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, backgroundColor: C.red + '15', borderRadius: 10, padding: 10 },
  emergencyText:   { fontSize: 12, color: C.muted, flex: 1 },

  endBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16 },
  endBtnText: { fontSize: 15, fontWeight: '700', color: C.bg },

  sosBtn:     { position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.red, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, zIndex: 10, elevation: 10 },
  sosBtnText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
