import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCatchStore   from '../../store/useCatchStore';
import useSocialStore  from '../../store/useSocialStore';
import { C } from '../../theme/colors';

const CITY_COORDS = {
  'Mumbai':      { lat: 19.0760, lng: 72.8777 },
  'Delhi':       { lat: 28.6139, lng: 77.2090 },
  'Bangalore':   { lat: 12.9716, lng: 77.5946 },
  'Chennai':     { lat: 13.0827, lng: 80.2707 },
  'Kolkata':     { lat: 22.5726, lng: 88.3639 },
  'Hyderabad':   { lat: 17.3850, lng: 78.4867 },
  'Pune':        { lat: 18.5204, lng: 73.8567 },
  'Jaipur':      { lat: 26.9124, lng: 75.7873 },
  'Nashik':      { lat: 20.0059, lng: 73.7910 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
  'Bandipur':    { lat: 11.6688, lng: 76.6363 },
  'Tadoba':      { lat: 20.2135, lng: 79.6760 },
  'Aarey':       { lat: 19.1548, lng: 72.8671 },
  'Adyar':       { lat: 13.0063, lng: 80.2574 },
  'Bannerghatta':{ lat: 12.7960, lng: 77.5789 },
  'Borivali':    { lat: 19.2307, lng: 72.8567 },
};

function cityToCoords(location) {
  if (!location) return null;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (location.toLowerCase().includes(city.toLowerCase())) return coords;
  }
  return null;
}

const { width } = Dimensions.get('window');

const RARITY_COLOR = {
  Common:    C.gray,
  Uncommon:  C.green,
  Rare:      C.blue,
  Legendary: C.orange,
};

const FILTERS = ['All', 'Common', 'Uncommon', 'Rare', 'Legendary'];

// India centre
const INDIA = { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 18, longitudeDelta: 18 };

export default function MapScreen({ navigation }) {
  const [filter,  setFilter]  = useState('All');
  const [mapMode, setMapMode] = useState('my');
  const insets   = useSafeAreaInsets();
  const mapRef   = useRef(null);
  const catches  = useCatchStore(s => s.catches);
  const posts    = useSocialStore(s => s.posts);

  const pinCatches = catches.filter(c => c.lat != null && c.lng != null);
  const filtered   = filter === 'All' ? pinCatches : pinCatches.filter(c => c.rarity === filter);

  const rarePosts  = posts
    .filter(p => p.rarity === 'Rare' || p.rarity === 'Legendary')
    .map(p => ({ ...p, coords: cityToCoords(p.location) }))
    .filter(p => p.coords != null)
    .slice(0, 30);

  const flyTo = (lat, lng) => {
    mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 600);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{mapMode === 'my' ? 'Catch Map' : 'Rare Sightings'}</Text>
        <View style={s.modeToggle}>
          <TouchableOpacity
            style={[s.modeBtn, mapMode === 'my' && s.modeBtnActive]}
            onPress={() => setMapMode('my')}
          >
            <Text style={[s.modeBtnText, mapMode === 'my' && s.modeBtnTextActive]}>Mine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeBtn, mapMode === 'community' && s.modeBtnActive]}
            onPress={() => setMapMode('community')}
          >
            <Text style={[s.modeBtnText, mapMode === 'community' && s.modeBtnTextActive]}>Rare</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={s.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={INDIA}
          mapType="standard"
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {mapMode === 'my' && filtered.map((c, i) => {
            const color = RARITY_COLOR[c.rarity] ?? C.gray;
            return (
              <Marker
                key={c.id ?? i}
                coordinate={{ latitude: c.lat, longitude: c.lng }}
                pinColor={color}
              >
                <View style={[s.pin, { backgroundColor: color }]}>
                  <Text style={s.pinEmoji}>🐾</Text>
                </View>
                <Callout tooltip>
                  <View style={s.callout}>
                    <Text style={s.calloutName}>{c.name}</Text>
                    <Text style={[s.calloutRarity, { color }]}>{c.rarity}</Text>
                    <Text style={s.calloutXP}>+{c.xp} XP</Text>
                    <Text style={s.calloutDate}>
                      {new Date(c.caughtAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}

          {mapMode === 'community' && rarePosts.map((p, i) => {
            const color = RARITY_COLOR[p.rarity] ?? C.gray;
            return (
              <Marker
                key={p.id ?? i}
                coordinate={{ latitude: p.coords.lat, longitude: p.coords.lng }}
              >
                <View style={[s.pin, { backgroundColor: color }]}>
                  <Text style={s.pinEmoji}>{p.emoji}</Text>
                </View>
                <Callout tooltip>
                  <View style={s.callout}>
                    <Text style={s.calloutName}>{p.species}</Text>
                    <Text style={[s.calloutRarity, { color }]}>{p.rarity}</Text>
                    <Text style={s.calloutDate}>by {p.username} · {p.location}</Text>
                    <Text style={s.calloutDate}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* Reset to India button */}
        <TouchableOpacity
          style={[s.recenterBtn, { bottom: pinCatches.length === 0 ? 190 : 20 }]}
          onPress={() => mapRef.current?.animateToRegion(INDIA, 600)}
        >
          <Ionicons name="locate" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Empty state overlay */}
      {mapMode === 'my' && pinCatches.length === 0 && (
        <View style={s.emptyOverlay} pointerEvents="none">
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>📍</Text>
            <Text style={s.emptyTitle}>No pins yet</Text>
            <Text style={s.emptySub}>
              Catch animals outside and their locations will appear here as pins on the map.
            </Text>
          </View>
        </View>
      )}

      {/* Pins list at bottom */}
      {mapMode === 'my' && pinCatches.length > 0 && (
        <View style={[s.list, { paddingBottom: insets.bottom + 10 }]}>
          <Text style={s.listTitle}>Your Catches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {filtered.map((c, i) => {
              const color = RARITY_COLOR[c.rarity] ?? C.gray;
              return (
                <TouchableOpacity
                  key={c.id ?? i}
                  style={[s.catchChip, { borderColor: color + '80' }]}
                  onPress={() => flyTo(c.lat, c.lng)}
                >
                  <View style={[s.catchDot, { backgroundColor: color }]} />
                  <Text style={s.catchChipName} numberOfLines={1}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {mapMode === 'community' && rarePosts.length > 0 && (
        <View style={[s.list, { paddingBottom: insets.bottom + 10 }]}>
          <Text style={s.listTitle}>Rare Community Sightings ({rarePosts.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {rarePosts.map((p, i) => {
              const color = RARITY_COLOR[p.rarity] ?? C.gray;
              return (
                <TouchableOpacity
                  key={p.id ?? i}
                  style={[s.catchChip, { borderColor: color + '80' }]}
                  onPress={() => flyTo(p.coords.lat, p.coords.lng)}
                >
                  <Text style={{ fontSize: 14 }}>{p.emoji}</Text>
                  <Text style={s.catchChipName} numberOfLines={1}>{p.species}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },
  modeToggle:       { flexDirection: 'row', backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  modeBtn:          { paddingHorizontal: 14, paddingVertical: 7 },
  modeBtnActive:    { backgroundColor: C.primary },
  modeBtnText:      { fontSize: 12, fontWeight: '700', color: C.muted },
  modeBtnTextActive:{ color: C.accent },

  filterScroll: { maxHeight: 44, marginBottom: 8 },
  filterRow:    { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip:         { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  chipActive:   { backgroundColor: C.primary, borderColor: C.primary },
  chipText:     { fontSize: 12, color: C.muted, fontWeight: '600' },
  chipTextActive: { color: C.accent },

  mapContainer: { flex: 1, backgroundColor: C.card },

  pin: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  pinEmoji: { fontSize: 14 },

  callout: { backgroundColor: C.card, borderRadius: 12, padding: 12, minWidth: 130, borderWidth: 1, borderColor: C.border },
  calloutName:   { fontSize: 13, fontWeight: 'bold', color: C.text, marginBottom: 2 },
  calloutRarity: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  calloutXP:     { fontSize: 12, color: C.accent, fontWeight: '700', marginBottom: 2 },
  calloutDate:   { fontSize: 10, color: C.muted },

  recenterBtn: { position: 'absolute', right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },

  emptyOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 100, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
  emptyCard:    { backgroundColor: C.card + 'EE', marginHorizontal: 24, borderRadius: 18, padding: 24, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border },
  emptyEmoji:   { fontSize: 40 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: C.text },
  emptySub:     { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },

  list:      { backgroundColor: C.bg, paddingTop: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: C.border },
  listTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 10 },
  catchChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  catchDot:  { width: 8, height: 8, borderRadius: 4 },
  catchChipName: { fontSize: 12, color: C.text, fontWeight: '600', maxWidth: 100 },
});
