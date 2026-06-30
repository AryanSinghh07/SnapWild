import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, Pressable,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme/colors';

const INDIA = { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 18, longitudeDelta: 18 };

const TYPE_COLOR = {
  Park:       C.green,
  Cafe:       C.orange,
  Beach:      C.blue,
  Trail:      C.accent,
  Promenade:  C.blue,
};

const SEED_SPOTS = [
  {
    id: 'sp1', name: 'Cubbon Park', city: 'Bangalore',
    lat: 12.9763, lng: 77.5929, type: 'Park', rating: 4.8, reviews: 234,
    tags: ['Off-leash area', 'Water fountain', 'Shaded paths'],
    emoji: '🌳', desc: 'One of Bangalore\'s largest parks, very pet-friendly with wide open lawns.',
  },
  {
    id: 'sp2', name: 'Lodhi Garden', city: 'Delhi',
    lat: 28.5933, lng: 77.2231, type: 'Park', rating: 4.7, reviews: 312,
    tags: ['Morning walks', 'Heritage site', 'Leash required'],
    emoji: '🏛️', desc: 'Beautiful heritage park ideal for peaceful morning walks with your pet.',
  },
  {
    id: 'sp3', name: 'Marine Drive Promenade', city: 'Mumbai',
    lat: 18.9439, lng: 72.8232, type: 'Promenade', rating: 4.5, reviews: 189,
    tags: ['Sea breeze', 'Evening walks', 'Open space'],
    emoji: '🌊', desc: 'Iconic sea-facing promenade perfect for evening walks with dogs.',
  },
  {
    id: 'sp4', name: 'Sanjay Gandhi NP Trail', city: 'Mumbai',
    lat: 19.2307, lng: 72.8567, type: 'Trail', rating: 4.6, reviews: 98,
    tags: ['Nature trail', 'Bird watching', 'Keep leash on'],
    emoji: '🌿', desc: 'Forest trails at the edge of Mumbai — great for active dogs and nature lovers.',
  },
  {
    id: 'sp5', name: 'Nandini Layout Park', city: 'Bangalore',
    lat: 13.0200, lng: 77.5521, type: 'Park', rating: 4.4, reviews: 76,
    tags: ['Off-leash zone', 'Dog runs', 'Benches'],
    emoji: '🐕', desc: 'Dedicated dog-friendly park with a fenced off-leash zone.',
  },
  {
    id: 'sp6', name: 'Elliot\'s Beach', city: 'Chennai',
    lat: 12.9990, lng: 80.2715, type: 'Beach', rating: 4.3, reviews: 141,
    tags: ['Sunrise walks', 'Sandy shore', 'Pet welcome'],
    emoji: '🏖️', desc: 'Quieter than Marina, Elliot\'s is a favourite for early morning pet walks.',
  },
  {
    id: 'sp7', name: 'The Puppy Cafe', city: 'Pune',
    lat: 18.5204, lng: 73.8567, type: 'Cafe', rating: 4.9, reviews: 203,
    tags: ['Pet-friendly seating', 'Water bowls', 'Dog treats'],
    emoji: '☕', desc: 'Pune\'s most popular pet-friendly cafe — dogs are treated like royalty here.',
  },
  {
    id: 'sp8', name: 'Aravalli Biodiversity Park', city: 'Delhi',
    lat: 28.5497, lng: 77.1702, type: 'Trail', rating: 4.6, reviews: 167,
    tags: ['Bird watching', 'Nature walk', 'Wide paths'],
    emoji: '🦋', desc: 'Urban forest with wide paths — calm atmosphere perfect for nature-loving pets.',
  },
];

export default function PetSpotsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = React.useRef(null);

  const [selected,      setSelected]      = React.useState(null);
  const [filterType,    setFilterType]    = React.useState('All');
  const [showSuggest,   setShowSuggest]   = React.useState(false);
  const [suggestName,   setSuggestName]   = React.useState('');
  const [suggestCity,   setSuggestCity]   = React.useState('');
  const [suggestDesc,   setSuggestDesc]   = React.useState('');
  const [userSpots,     setUserSpots]     = React.useState([]);

  const allSpots  = [...SEED_SPOTS, ...userSpots];
  const types     = ['All', ...Array.from(new Set(allSpots.map(s => s.type)))];
  const displayed = filterType === 'All' ? allSpots : allSpots.filter(s => s.type === filterType);

  function flyTo(lat, lng) {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 600
    );
  }

  function handleSuggest() {
    const name = suggestName.trim();
    const city = suggestCity.trim();
    if (!name || !city) { Alert.alert('Name and City are required'); return; }
    const spot = {
      id:      `us_${Date.now()}`,
      name,
      city,
      lat:     20.5937 + (Math.random() - 0.5) * 10,
      lng:     78.9629 + (Math.random() - 0.5) * 10,
      type:    'Park',
      rating:  null,
      reviews: 0,
      tags:    [],
      emoji:   '📍',
      desc:    suggestDesc.trim() || 'Community-suggested spot.',
    };
    setUserSpots(p => [...p, spot]);
    setShowSuggest(false);
    setSuggestName(''); setSuggestCity(''); setSuggestDesc('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Thanks!', 'Your spot has been added to the map.');
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Pet-Friendly Spots</Text>
        <TouchableOpacity style={s.suggestBtn} onPress={() => setShowSuggest(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color={C.accent} />
          <Text style={s.suggestBtnText}>Suggest</Text>
        </TouchableOpacity>
      </View>

      {/* Type filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
        {types.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.chip, filterType === t && s.chipActive]}
            onPress={() => { setFilterType(t); Haptics.selectionAsync(); }}
          >
            <Text style={[s.chipText, filterType === t && s.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={s.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={INDIA}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {displayed.map(spot => {
            const col = TYPE_COLOR[spot.type] ?? C.accent;
            return (
              <Marker
                key={spot.id}
                coordinate={{ latitude: spot.lat, longitude: spot.lng }}
                onPress={() => { setSelected(spot); flyTo(spot.lat, spot.lng); }}
              >
                <View style={[s.pin, { backgroundColor: col }]}>
                  <Text style={s.pinEmoji}>{spot.emoji}</Text>
                </View>
                <Callout tooltip>
                  <View style={s.callout}>
                    <Text style={s.calloutName}>{spot.name}</Text>
                    <Text style={[s.calloutType, { color: col }]}>{spot.type} · {spot.city}</Text>
                    {spot.rating != null && (
                      <Text style={s.calloutRating}>⭐ {spot.rating.toFixed(1)} ({spot.reviews})</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Spot list */}
      <View style={[s.list, { paddingBottom: insets.bottom + 10 }]}>
        <Text style={s.listTitle}>
          {filterType === 'All' ? 'All Spots' : filterType + 's'} ({displayed.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {displayed.map(spot => {
            const col = TYPE_COLOR[spot.type] ?? C.accent;
            const active = selected?.id === spot.id;
            return (
              <TouchableOpacity
                key={spot.id}
                style={[s.spotCard, active && { borderColor: col }]}
                onPress={() => { setSelected(spot); flyTo(spot.lat, spot.lng); Haptics.selectionAsync(); }}
                activeOpacity={0.85}
              >
                <View style={s.spotCardTop}>
                  <Text style={s.spotEmoji}>{spot.emoji}</Text>
                  <View style={[s.spotTypeBadge, { backgroundColor: col + '20' }]}>
                    <Text style={[s.spotTypeBadgeText, { color: col }]}>{spot.type}</Text>
                  </View>
                </View>
                <Text style={s.spotName} numberOfLines={1}>{spot.name}</Text>
                <Text style={s.spotCity}>{spot.city}</Text>
                {spot.rating != null
                  ? <Text style={s.spotRating}>⭐ {spot.rating.toFixed(1)}</Text>
                  : <Text style={[s.spotRating, { color: C.muted }]}>New</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected spot detail */}
      {selected && (
        <Modal visible transparent animationType="slide">
          <Pressable style={s.detailBg} onPress={() => setSelected(null)}>
            <Pressable style={[s.detailCard, { paddingBottom: insets.bottom + 16 }]}>
              <View style={s.detailHandle} />
              <View style={s.detailRow}>
                <Text style={s.detailEmoji}>{selected.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.detailName}>{selected.name}</Text>
                  <Text style={s.detailCity}>{selected.type} · {selected.city}</Text>
                </View>
                {selected.rating != null && (
                  <View style={s.ratingBadge}>
                    <Text style={s.ratingBadgeText}>⭐ {selected.rating.toFixed(1)}</Text>
                    <Text style={s.reviewCount}>{selected.reviews} reviews</Text>
                  </View>
                )}
              </View>
              {selected.desc ? <Text style={s.detailDesc}>{selected.desc}</Text> : null}
              {selected.tags.length > 0 && (
                <View style={s.tagsRow}>
                  {selected.tags.map(tag => (
                    <View key={tag} style={s.tag}>
                      <Text style={s.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={s.directionsBtn}
                onPress={() => { flyTo(selected.lat, selected.lng); setSelected(null); }}
                activeOpacity={0.85}
              >
                <Ionicons name="navigate" size={16} color={C.bg} />
                <Text style={s.directionsBtnText}>Show on Map</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Suggest a spot modal */}
      <Modal visible={showSuggest} transparent animationType="slide">
        <Pressable style={s.detailBg} onPress={() => setShowSuggest(false)}>
          <Pressable style={[s.detailCard, { paddingBottom: insets.bottom + 20 }]}>
            <View style={s.detailHandle} />
            <Text style={s.suggestTitle}>Suggest a Spot</Text>
            <Text style={s.suggestSub}>Help the community discover pet-friendly places!</Text>

            <FieldLabel text="Spot Name" />
            <TextInput style={s.input} placeholder="E.g. Cubbon Park" placeholderTextColor={C.muted} value={suggestName} onChangeText={setSuggestName} />

            <FieldLabel text="City" />
            <TextInput style={s.input} placeholder="E.g. Bangalore" placeholderTextColor={C.muted} value={suggestCity} onChangeText={setSuggestCity} />

            <FieldLabel text="Why is it pet-friendly? (optional)" />
            <TextInput
              style={[s.input, { minHeight: 72, textAlignVertical: 'top' }]}
              placeholder="Describe what makes this spot great for pets…"
              placeholderTextColor={C.muted}
              multiline
              value={suggestDesc}
              onChangeText={setSuggestDesc}
            />

            <TouchableOpacity style={s.directionsBtn} onPress={handleSuggest} activeOpacity={0.85}>
              <Ionicons name="paper-plane" size={16} color={C.bg} />
              <Text style={s.directionsBtnText}>Submit Spot</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function FieldLabel({ text }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginBottom: 6, marginTop: 12 }}>
      {text.toUpperCase()}
    </Text>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle:   { fontSize: 18, fontWeight: 'bold', color: C.text },
  suggestBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.accent + '40' },
  suggestBtnText:{ fontSize: 13, fontWeight: '700', color: C.accent },

  filterScroll: { maxHeight: 44, marginBottom: 8 },
  filterRow:    { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip:         { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  chipActive:   { backgroundColor: C.primary, borderColor: C.primary },
  chipText:     { fontSize: 12, color: C.muted, fontWeight: '600' },
  chipTextActive:{ color: C.accent },

  mapContainer: { flex: 1, backgroundColor: C.card },

  pin:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  pinEmoji: { fontSize: 14 },

  callout:     { backgroundColor: C.card, borderRadius: 12, padding: 10, minWidth: 120, borderWidth: 1, borderColor: C.border },
  calloutName: { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 2 },
  calloutType: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  calloutRating:{ fontSize: 11, color: C.text },

  list:      { backgroundColor: C.bg, paddingTop: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: C.border },
  listTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 10 },

  spotCard:     { width: 120, backgroundColor: C.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border, gap: 4 },
  spotCardTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  spotEmoji:    { fontSize: 22 },
  spotTypeBadge:{ borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  spotTypeBadgeText:{ fontSize: 9, fontWeight: '700' },
  spotName:     { fontSize: 12, fontWeight: '700', color: C.text },
  spotCity:     { fontSize: 10, color: C.muted },
  spotRating:   { fontSize: 11, fontWeight: '700', color: C.orange },

  detailBg:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailCard: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: C.border },
  detailHandle:{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 },
  detailRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  detailEmoji:{ fontSize: 36 },
  detailName: { fontSize: 18, fontWeight: '800', color: C.text },
  detailCity: { fontSize: 12, color: C.muted, marginTop: 2 },
  detailDesc: { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 12 },
  ratingBadge:{ alignItems: 'center', backgroundColor: C.orange + '15', borderRadius: 10, padding: 8 },
  ratingBadgeText:{ fontSize: 16, fontWeight: '800', color: C.orange },
  reviewCount:{ fontSize: 9, color: C.muted },
  tagsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:        { backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText:    { fontSize: 11, fontWeight: '600', color: C.accent },

  directionsBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14 },
  directionsBtnText:{ fontSize: 15, fontWeight: '700', color: C.bg },

  suggestTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 4 },
  suggestSub:   { fontSize: 13, color: C.muted, marginBottom: 4 },
  input:        { backgroundColor: C.bg, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
});
