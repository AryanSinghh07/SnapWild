import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore, { SPECIES_EMOJI, getBreedGroups, petStats } from '../../store/usePetStore';
import { C } from '../../theme/colors';

function aggressionColor(level) {
  return { None: C.green, Low: C.accent, Medium: C.orange, High: C.red }[level] ?? C.muted;
}

export default function PetProfileScreen({ route, navigation }) {
  const { pet }  = route.params;
  const insets   = useSafeAreaInsets();
  const stats    = React.useMemo(() => petStats(pet), [pet.id]);

  const myPets          = usePetStore(s => s.myPets);
  const follows         = usePetStore(s => s.follows);
  const followPet       = usePetStore(s => s.followPet);
  const unfollowPet     = usePetStore(s => s.unfollowPet);
  const sendMeetRequest = usePetStore(s => s.sendMeetRequest);
  const hasSentRequest  = usePetStore(s => s.hasSentRequest);
  const friendships     = usePetStore(s => s.petFriendships);

  const following    = follows.includes(pet.id);
  const isFriend     = friendships.some(f => f.theirPet.id === pet.id);
  const alreadySent  = myPets[0] ? hasSentRequest(myPets[0].id, pet.id) : false;

  // Breed group this pet belongs to
  const groups        = getBreedGroups([]);
  const petGroup      = groups.find(g => g.species === pet.species && g.breed === pet.breed);

  // Displayed follower count (adjusted if user follows)
  const followerCount = stats.followers + (following ? 1 : 0);

  function handleFollow() {
    if (following) {
      unfollowPet(pet.id);
      Haptics.selectionAsync();
    } else {
      followPet(pet.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function handleSendRequest() {
    if (!myPets[0]) {
      Alert.alert('Add a Pet First', 'Go to My Pets tab to add your pet.');
      return;
    }
    const sent = sendMeetRequest(myPets[0], pet);
    if (sent) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Request Sent! 🐾', `${myPets[0].name} sent a meet request to ${pet.name}.`);
    } else {
      Alert.alert('Already Sent', `You already sent a request to ${pet.name}.`);
    }
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{pet.name}'s Profile</Text>
        <TouchableOpacity
          style={[s.followBtn, following && s.followBtnActive]}
          onPress={handleFollow}
          activeOpacity={0.8}
        >
          <Text style={[s.followBtnText, following && s.followBtnTextActive]}>
            {following ? '✓ Following' : '+ Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={[s.heroRing, following && s.heroRingActive]}>
            <View style={s.heroEmoji}>
              <Text style={{ fontSize: 64 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
            </View>
          </View>
          <Text style={s.heroName}>{pet.name}</Text>
          <Text style={s.heroBreed}>{pet.breed} · {pet.gender} · {pet.age} yr</Text>
          <View style={s.heroOwnerRow}>
            <Ionicons name="person-circle-outline" size={13} color={C.muted} />
            <Text style={s.heroOwner}>@{pet.owner.username} · {pet.owner.city}</Text>
          </View>
          <View style={s.heroOwnerRow}>
            <Ionicons name="location" size={13} color={C.accent} />
            <Text style={[s.heroOwner, { color: C.accent }]}>{pet.owner.distance} km away</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <StatBox value={followerCount} label="Followers" />
          <View style={s.statDivider} />
          <StatBox value={stats.meetups} label="Meetups" />
          <View style={s.statDivider} />
          <StatBox value={stats.friends} label="Friends" />
        </View>

        {/* Friend badge */}
        {isFriend && (
          <View style={s.friendBanner}>
            <Ionicons name="heart" size={14} color={C.green} />
            <Text style={s.friendBannerText}>You and {pet.name} are pet friends!</Text>
          </View>
        )}

        {/* Personality */}
        <Section title="Personality">
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
        </Section>

        {/* Health card */}
        <Section title="Health Card">
          <View style={s.healthCard}>
            <HealthRow
              icon={pet.healthCard.vaccinated ? 'shield-checkmark' : 'shield-outline'}
              color={pet.healthCard.vaccinated ? C.green : C.orange}
              label="Vaccinated"
              value={pet.healthCard.vaccinated ? 'Yes' : 'Not on record'}
            />
            <View style={s.hdivider} />
            <HealthRow icon="calendar-outline" color={C.blue} label="Last Vet Visit" value={pet.healthCard.lastVetVisit} />
            <View style={s.hdivider} />
            <HealthRow icon="alert-circle-outline" color={C.orange} label="Allergies" value={pet.healthCard.allergies} />
            <View style={s.hdivider} />
            <HealthRow
              icon="pulse-outline"
              color={aggressionColor(pet.healthCard.aggressionLevel)}
              label="Aggression"
              value={pet.healthCard.aggressionLevel}
            />
          </View>
        </Section>

        {/* Breed group */}
        {petGroup && (
          <Section title="Breed Community">
            <TouchableOpacity
              style={s.groupCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('BreedGroups')}
            >
              <View style={s.groupLeft}>
                <View style={s.groupEmoji}>
                  <Text style={{ fontSize: 22 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                </View>
                <View>
                  <Text style={s.groupName}>{petGroup.name}</Text>
                  <Text style={s.groupMeta}>{petGroup.members.length} member{petGroup.members.length !== 1 ? 's' : ''} · {petGroup.city}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
          </Section>
        )}

        {/* CTA */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {isFriend ? (
            <View style={[s.ctaBtn, { backgroundColor: C.green }]}>
              <Ionicons name="heart" size={18} color={C.text} />
              <Text style={[s.ctaBtnText, { color: C.text }]}>Pet Friends ✓</Text>
            </View>
          ) : alreadySent ? (
            <View style={[s.ctaBtn, s.ctaBtnDisabled]}>
              <Ionicons name="time-outline" size={18} color={C.muted} />
              <Text style={[s.ctaBtnText, { color: C.muted }]}>Request Sent · Pending</Text>
            </View>
          ) : (
            <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={handleSendRequest}>
              <Text style={{ fontSize: 18 }}>🐾</Text>
              <Text style={s.ctaBtnText}>Send Meet Request</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => navigation.navigate('PetDetail', { pet })}
          >
            <Ionicons name="sparkles-outline" size={16} color={C.accent} />
            <Text style={s.secondaryBtnText}>Check AI Compatibility</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.text }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function HealthRow({ icon, color, label, value }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={{ flex: 1, fontSize: 13, color: C.muted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: C.text, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },

  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 17, fontWeight: 'bold', color: C.text, flex: 1, textAlign: 'center' },
  followBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.accent },
  followBtnActive: { backgroundColor: C.accent },
  followBtnText:   { fontSize: 13, fontWeight: '700', color: C.accent },
  followBtnTextActive: { color: C.bg },

  hero:         { alignItems: 'center', paddingVertical: 24, gap: 6 },
  heroRing:     { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroRingActive:{ borderColor: C.accent, borderWidth: 3 },
  heroEmoji:    { width: 100, height: 100, borderRadius: 50, backgroundColor: C.primary + '50', alignItems: 'center', justifyContent: 'center' },
  heroName:     { fontSize: 26, fontWeight: '800', color: C.text },
  heroBreed:    { fontSize: 14, color: C.muted },
  heroOwnerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroOwner:    { fontSize: 13, color: C.muted },

  statsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  statDivider: { width: 1, height: 40, backgroundColor: C.border },

  friendBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.green + '20', borderRadius: 10, padding: 12 },
  friendBannerText: { fontSize: 13, color: C.green, fontWeight: '600' },

  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:     { backgroundColor: C.primary + '50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 12, color: C.accent, fontWeight: '600' },
  notes:   { fontSize: 13, color: C.muted, fontStyle: 'italic', lineHeight: 20 },

  healthCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  hdivider:   { height: 1, backgroundColor: C.border },

  groupCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  groupLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupEmoji: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  groupName:  { fontSize: 14, fontWeight: '700', color: C.text },
  groupMeta:  { fontSize: 12, color: C.muted, marginTop: 2 },

  ctaBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15 },
  ctaBtnDisabled: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  ctaBtnText:     { fontSize: 15, fontWeight: '700', color: C.bg },
  secondaryBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.card, borderRadius: 14, paddingVertical: 13, borderWidth: 1, borderColor: C.accent + '60' },
  secondaryBtnText:{ fontSize: 14, fontWeight: '600', color: C.accent },
});
