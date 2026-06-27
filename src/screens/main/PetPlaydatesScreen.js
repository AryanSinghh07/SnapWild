import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore, { NEARBY_PETS, SPECIES_EMOJI, getNearestVet } from '../../store/usePetStore';
import { C } from '../../theme/colors';

const RADII = [
  { label: '500m', value: 0.5 },
  { label: '2 km', value: 2   },
  { label: '5 km', value: 5   },
  { label: '10 km', value: 10  },
];

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600)  return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function PetPlaydatesScreen({ navigation }) {
  const [tab,    setTab]    = React.useState('nearby');
  const [radius, setRadius] = React.useState(5);

  const myPets          = usePetStore(s => s.myPets);
  const outgoing        = usePetStore(s => s.outgoingRequests);
  const incoming        = usePetStore(s => s.incomingRequests);
  const friendships     = usePetStore(s => s.petFriendships);
  const completedMeetups= usePetStore(s => s.completedMeetups);
  const declineIncoming = usePetStore(s => s.declineIncoming);
  const acceptIncoming  = usePetStore(s => s.acceptIncoming);
  const startMeetup     = usePetStore(s => s.startMeetup);
  const cancelOutgoing  = usePetStore(s => s.cancelOutgoing);
  const deletePet       = usePetStore(s => s.deletePet);

  const insets         = useSafeAreaInsets();
  const nearbyFiltered = NEARBY_PETS.filter(p => p.owner.distance <= radius);
  const requestCount   = incoming.length;

  function handleAccept(req) {
    const myPet = myPets[0] ?? null;
    acceptIncoming(req.id, myPet);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (myPet) {
      const meetupId = startMeetup(myPet, req.theirPet);
      navigation.navigate('Meetup', { meetupId });
    }
  }

  function confirmDelete(pet) {
    Alert.alert(
      'Remove Pet',
      `Remove ${pet.name} from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deletePet(pet.id) },
      ]
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>🐾 Pet Playdates</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {[
          { key: 'nearby',   label: 'Nearby'                                                },
          { key: 'requests', label: requestCount ? `Requests (${requestCount})` : 'Requests' },
          { key: 'friends',  label: `Friends${friendships.length ? ` (${friendships.length})` : ''}` },
          { key: 'mypets',   label: 'My Pets'                                             },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── NEARBY ── */}
        {tab === 'nearby' && (
          <View>
            <View style={s.radiusRow}>
              <Ionicons name="location-outline" size={13} color={C.muted} />
              <Text style={s.radiusLabel}>Within:</Text>
              {RADII.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[s.radiusChip, radius === r.value && s.radiusChipActive]}
                  onPress={() => setRadius(r.value)}
                >
                  <Text style={[s.radiusText, radius === r.value && s.radiusTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {nearbyFiltered.length === 0 ? (
              <EmptyState icon="🐾" title="No pets this close" sub="Try a larger radius" />
            ) : (
              <View style={s.grid}>
                {nearbyFiltered.map(pet => (
                  <TouchableOpacity
                    key={pet.id}
                    style={s.petCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('PetDetail', { pet })}
                  >
                    <View style={s.petEmojiBox}>
                      <Text style={s.petEmojiText}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                    </View>
                    <Text style={s.petName}>{pet.name}</Text>
                    <Text style={s.petBreed} numberOfLines={1}>{pet.breed}</Text>
                    <View style={s.petDistRow}>
                      <Ionicons name="location" size={10} color={C.accent} />
                      <Text style={s.petDist}>{pet.owner.distance} km</Text>
                    </View>
                    <Text style={s.petOwner} numberOfLines={1}>@{pet.owner.username}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          <View style={s.section}>
            {incoming.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Incoming Requests</Text>
                {incoming.map(req => (
                  <View key={req.id} style={s.requestCard}>
                    <View style={s.reqEmojiBox}>
                      <Text style={{ fontSize: 26 }}>{SPECIES_EMOJI[req.theirPet.species] ?? '🐾'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.reqName}>{req.theirPet.name} wants to meet!</Text>
                      <Text style={s.reqSub}>
                        {req.theirPet.breed} · @{req.theirPet.owner.username} · {timeAgo(req.sentAt)}
                      </Text>
                    </View>
                    <View style={s.reqActions}>
                      <TouchableOpacity style={s.acceptBtn} onPress={() => handleAccept(req)}>
                        <Ionicons name="checkmark" size={18} color={C.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.declineBtn}
                        onPress={() => { declineIncoming(req.id); Haptics.selectionAsync(); }}
                      >
                        <Ionicons name="close" size={18} color={C.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {outgoing.length > 0 && (
              <>
                <Text style={[s.sectionTitle, incoming.length > 0 && { marginTop: 20 }]}>Sent Requests</Text>
                {outgoing.map(req => (
                  <View key={req.id} style={s.requestCard}>
                    <View style={s.reqEmojiBox}>
                      <Text style={{ fontSize: 26 }}>{SPECIES_EMOJI[req.theirPet.species] ?? '🐾'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.reqName}>{req.theirPet.name}</Text>
                      <Text style={s.reqSub}>@{req.theirPet.owner.username} · {timeAgo(req.sentAt)}</Text>
                      <View style={s.pendingBadge}>
                        <Text style={s.pendingText}>PENDING</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => cancelOutgoing(req.id)}>
                      <Text style={s.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {incoming.length === 0 && outgoing.length === 0 && (
              <EmptyState icon="💌" title="No requests yet" sub="Browse nearby pets and send a Meet request!" />
            )}
          </View>
        )}

        {/* ── FRIENDS ── */}
        {tab === 'friends' && (
          <View style={s.section}>
            {friendships.length === 0 ? (
              <EmptyState icon="🐾" title="No pet friends yet" sub="Accept a meet request to start your pet's social network!" />
            ) : (
              friendships.map((f, i) => {
                const met = completedMeetups.find(
                  m => m.theirPet.id === f.theirPet.id
                );
                return (
                  <View key={i} style={s.friendCard}>
                    <View style={s.reqEmojiBox}>
                      <Text style={{ fontSize: 26 }}>{SPECIES_EMOJI[f.theirPet.species] ?? '🐾'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.reqName}>{f.theirPet.name}</Text>
                      <Text style={s.reqSub}>{f.theirPet.breed} · @{f.theirPet.owner.username}</Text>
                      {met?.rating?.stars > 0 && (
                        <View style={s.ratingRow}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Text key={j} style={{ fontSize: 11, color: j < met.rating.stars ? C.accent : C.border }}>★</Text>
                          ))}
                          {met.rating.meetAgain === 'Yes! 🐾' && (
                            <Text style={{ fontSize: 11, color: C.green, marginLeft: 4 }}>Meet again ✓</Text>
                          )}
                        </View>
                      )}
                    </View>
                    <View style={s.friendBadge}>
                      <Text style={s.friendBadgeText}>Friends</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── MY PETS ── */}
        {tab === 'mypets' && (
          <View style={s.section}>
            <TouchableOpacity
              style={s.addPetBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AddPet')}
            >
              <Ionicons name="add-circle" size={20} color={C.accent} />
              <Text style={s.addPetText}>Add a Pet Profile</Text>
            </TouchableOpacity>

            {myPets.length === 0 ? (
              <EmptyState icon="🐾" title="No pets added yet" sub="Add your pet to find playmates nearby" />
            ) : (
              myPets.map(pet => (
                <View key={pet.id} style={s.myPetCard}>
                  <View style={s.myPetLeft}>
                    <View style={s.myPetEmojiBox}>
                      <Text style={{ fontSize: 30 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.myPetName}>{pet.name}</Text>
                      <Text style={s.myPetBreed}>{pet.breed} · {pet.age} yr · {pet.gender}</Text>
                      <View style={s.tagRow}>
                        {pet.temperament.slice(0, 3).map(t => (
                          <View key={t} style={s.tag}>
                            <Text style={s.tagText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(pet)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color={C.red} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <View style={s.emptyBox}>
      <Text style={{ fontSize: 40 }}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyText}>{sub}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: C.bg },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: 'bold', color: C.text },

  tabBar:         { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border },
  tabBtn:         { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabBtnActive:   { backgroundColor: C.primary },
  tabText:        { fontSize: 12, color: C.muted, fontWeight: '600' },
  tabTextActive:  { color: C.accent },

  radiusRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  radiusLabel:    { fontSize: 13, color: C.muted, marginRight: 4 },
  radiusChip:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  radiusChipActive:{ backgroundColor: C.primary, borderColor: C.primary },
  radiusText:     { fontSize: 12, color: C.muted, fontWeight: '600' },
  radiusTextActive:{ color: C.accent },

  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  petCard:        { width: '47%', backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  petEmojiBox:    { width: 56, height: 56, borderRadius: 28, backgroundColor: C.primary + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  petEmojiText:   { fontSize: 30 },
  petName:        { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  petBreed:       { fontSize: 11, color: C.muted, marginBottom: 4, textAlign: 'center' },
  petDistRow:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  petDist:        { fontSize: 11, color: C.accent, fontWeight: '700' },
  petOwner:       { fontSize: 10, color: C.muted },

  section:        { paddingHorizontal: 16 },
  sectionTitle:   { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },

  requestCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  reqEmojiBox:    { width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  reqName:        { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  reqSub:         { fontSize: 11, color: C.muted },
  reqActions:     { flexDirection: 'row', gap: 8 },
  acceptBtn:      { width: 34, height: 34, borderRadius: 17, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  declineBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: C.card2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  pendingBadge:   { marginTop: 4, backgroundColor: C.orange + '30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  pendingText:    { fontSize: 10, fontWeight: 'bold', color: C.orange, letterSpacing: 0.5 },
  cancelText:     { fontSize: 12, color: C.red, fontWeight: '600' },

  addPetBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.accent + '60', borderStyle: 'dashed' },
  addPetText:     { fontSize: 15, fontWeight: '700', color: C.accent },

  myPetCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  myPetLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  myPetEmojiBox:  { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  myPetName:      { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  myPetBreed:     { fontSize: 11, color: C.muted, marginBottom: 6 },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag:            { backgroundColor: C.primary + '50', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText:        { fontSize: 10, color: C.accent, fontWeight: '600' },

  emptyBox:       { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: C.text },
  emptyText:      { fontSize: 13, color: C.muted, textAlign: 'center' },

  friendCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  friendBadge:   { backgroundColor: C.green + '25', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  friendBadgeText:{ fontSize: 11, fontWeight: '700', color: C.green },
});
