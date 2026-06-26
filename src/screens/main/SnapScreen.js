import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme/colors';

export default function SnapScreen() {
  return (
    <View style={s.screen}>
      <View style={s.hero}>
        <View style={s.camRing}>
          <View style={s.camCircle}>
            <Ionicons name="camera" size={56} color={C.accent} />
          </View>
        </View>
        <Text style={s.title}>Snap & Catch</Text>
        <Text style={s.sub}>
          Point your camera at any animal.{'\n'}
          Vanya identifies it in seconds.
        </Text>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.btnPrimary} activeOpacity={0.85}>
          <Ionicons name="camera" size={22} color={C.bg} />
          <Text style={s.btnPrimaryText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline} activeOpacity={0.8}>
          <Ionicons name="images-outline" size={22} color={C.accent} />
          <Text style={s.btnOutlineText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={s.raritySection}>
        <Text style={s.rarityTitle}>Catch rewards by rarity</Text>
        <View style={s.rarityRow}>
          {[
            { label: 'Common',    xp: '15',   color: C.gray   },
            { label: 'Uncommon',  xp: '45',   color: C.green  },
            { label: 'Rare',      xp: '100',  color: C.blue   },
            { label: 'Legendary', xp: '150+', color: C.orange },
          ].map(r => (
            <View key={r.label} style={[s.rarityChip, { borderColor: r.color + '80' }]}>
              <Text style={[s.rarityLabel, { color: r.color }]}>{r.label}</Text>
              <Text style={[s.rarityXP,    { color: r.color }]}>{r.xp} XP</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.vanyaHint}>
        <Text style={s.vanyaEmoji}>🌳</Text>
        <Text style={s.vanyaText}>
          "I'll identify the species, share fun facts, and add it to your collection automatically!"
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24, justifyContent: 'space-evenly', paddingBottom: 80 },

  hero:     { alignItems: 'center' },
  camRing: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 2, borderColor: C.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  camCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.border,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: C.text, marginBottom: 8 },
  sub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },

  actions: { gap: 12 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 18, gap: 10,
  },
  btnPrimaryText: { fontSize: 17, fontWeight: 'bold', color: C.bg },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.accent, borderRadius: 16, paddingVertical: 16, gap: 10,
  },
  btnOutlineText: { fontSize: 17, fontWeight: '600', color: C.accent },

  raritySection: { gap: 10 },
  rarityTitle:   { fontSize: 13, color: C.muted, fontWeight: '600', textAlign: 'center' },
  rarityRow:     { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  rarityChip: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center',
  },
  rarityLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  rarityXP:    { fontSize: 12, fontWeight: 'bold' },

  vanyaHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border,
  },
  vanyaEmoji: { fontSize: 22 },
  vanyaText:  { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18, fontStyle: 'italic' },
});
