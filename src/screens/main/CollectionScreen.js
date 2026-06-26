import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCatchStore from '../../store/useCatchStore';
import { C } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 52) / 3;

const RARITY_COLOR = {
  Common:    C.gray,
  Uncommon:  C.green,
  Rare:      C.blue,
  Legendary: C.orange,
};

const LOCKED_ANIMALS = ['🦁', '🐯', '🐘', '🦏', '🐆', '🦌', '🦅', '🦜', '🐊', '🐢', '🦋', '🐍'];

const FILTERS = ['All', 'Common', 'Uncommon', 'Rare', 'Legendary'];

export default function CollectionScreen() {
  const [filter, setFilter] = useState('All');
  const getUniqueSpecies = useCatchStore(s => s.getUniqueSpecies);
  const catches = useCatchStore(s => s.catches);

  const unique = getUniqueSpecies();
  const filtered = filter === 'All' ? unique : unique.filter(c => c.rarity === filter);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>My Pokédex</Text>
          <Text style={s.sub}>{unique.length} species caught</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>{unique.length} / ???</Text>
        </View>
      </View>

      {/* Empty state */}
      {unique.length === 0 && (
        <View style={s.emptyCard}>
          <Text style={s.emptyEmoji}>📷</Text>
          <Text style={s.emptyTitle}>Your collection is empty</Text>
          <Text style={s.emptySub}>
            Go to Snap tab and photograph your first animal to begin your Pokédex!
          </Text>
        </View>
      )}

      {/* Filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Caught species grid */}
      {filtered.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {filter === 'All' ? 'All Caught Species' : filter + ' Species'}
            </Text>
          </View>
          <View style={s.grid}>
            {filtered.map((c, i) => {
              const color = RARITY_COLOR[c.rarity] ?? C.gray;
              return (
                <View key={c.id ?? i} style={[s.caughtCard, { borderColor: color + '60' }]}>
                  {c.photoUri
                    ? <Image source={{ uri: c.photoUri }} style={s.caughtImg} />
                    : <Text style={s.caughtEmoji}>🐾</Text>
                  }
                  <View style={[s.caughtRarityBar, { backgroundColor: color }]} />
                  <Text style={s.caughtName} numberOfLines={2}>{c.name}</Text>
                  <Text style={[s.caughtXP, { color }]}>+{c.xp} XP</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Locked grid */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Waiting to be discovered</Text>
      </View>
      <View style={s.grid}>
        {LOCKED_ANIMALS.map((emoji, i) => (
          <View key={i} style={s.lockedCard}>
            <Text style={s.lockedEmoji}>{emoji}</Text>
            <View style={s.lockedOverlay} />
            <Ionicons name="lock-closed" size={16} color={C.muted} style={s.lockIcon} />
            <Text style={s.lockedLabel}>???</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16, marginTop: 20 },
  title:  { fontSize: 24, fontWeight: 'bold', color: C.text },
  sub:    { fontSize: 13, color: C.muted, marginTop: 2 },
  countBadge: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  countText:  { color: C.accent, fontWeight: 'bold', fontSize: 14 },

  emptyCard:  { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 28, alignItems: 'center', gap: 8, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  emptySub:   { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },

  filterScroll: { marginBottom: 20 },
  filterRow:    { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText:       { fontSize: 13, color: C.muted, fontWeight: '600' },
  filterTextActive: { color: C.accent },

  sectionHeader: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: C.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 10, marginBottom: 20 },

  // Caught card
  caughtCard: {
    width: CARD_SIZE, backgroundColor: C.card,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1.5, alignItems: 'center', paddingBottom: 8,
  },
  caughtImg:       { width: '100%', height: CARD_SIZE * 0.7 },
  caughtEmoji:     { fontSize: 36, marginTop: 12, marginBottom: 4 },
  caughtRarityBar: { height: 3, width: '100%', marginBottom: 6 },
  caughtName:      { fontSize: 10, color: C.text, fontWeight: '600', textAlign: 'center', paddingHorizontal: 4 },
  caughtXP:        { fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  // Locked card
  lockedCard: {
    width: CARD_SIZE, height: CARD_SIZE, backgroundColor: C.card,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border, overflow: 'hidden', gap: 4,
  },
  lockedEmoji:   { fontSize: 32, opacity: 0.08, position: 'absolute' },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg + 'AA' },
  lockIcon:      { marginBottom: 2 },
  lockedLabel:   { fontSize: 11, color: C.muted, fontWeight: '600' },
});
