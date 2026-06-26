import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 52) / 3;

const LOCKED_ANIMALS = ['🦁', '🐯', '🐘', '🦏', '🐆', '🦌', '🦅', '🦜', '🐊', '🐢', '🦋', '🐍'];

export default function CollectionScreen() {
  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>My Pokédex</Text>
          <Text style={s.sub}>0 species caught</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>0 / ???</Text>
        </View>
      </View>

      {/* Empty state */}
      <View style={s.emptyCard}>
        <Text style={s.emptyEmoji}>📷</Text>
        <Text style={s.emptyTitle}>Your collection is empty</Text>
        <Text style={s.emptySub}>
          Go to Snap tab and photograph your first animal to begin your Pokédex!
        </Text>
      </View>

      {/* Filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
        {['All', 'Common', 'Uncommon', 'Rare', 'Legendary'].map((f, i) => (
          <View key={f} style={[s.filterChip, i === 0 && s.filterChipActive]}>
            <Text style={[s.filterText, i === 0 && s.filterTextActive]}>{f}</Text>
          </View>
        ))}
      </ScrollView>

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

  emptyCard: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 28, alignItems: 'center', gap: 8, marginBottom: 20, borderWidth: 1, borderColor: C.border },
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

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 10 },
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
