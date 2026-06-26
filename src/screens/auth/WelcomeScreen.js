import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme/colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      {/* Logo */}
      <View style={s.logoSection}>
        <Text style={s.logoEmoji}>🌿</Text>
        <Text style={s.appName}>SNAPWILD</Text>
        <Text style={s.tagline}>Catch Animals. Save Wildlife.{'\n'}Explore India.</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatPill value="91,000" label="Species" />
        <StatPill value="1.4B"   label="People"  />
        <StatPill value="Free"   label="Forever" />
      </View>

      {/* Feature highlights */}
      <View style={s.features}>
        <FeatureRow icon="📸" text="Snap any animal — AI identifies it in seconds" />
        <FeatureRow icon="🗺️" text="Build a live wildlife map of India together" />
        <FeatureRow icon="🚨" text="Report injured animals and save lives" />
        <FeatureRow icon="⚡" text="Earn XP, badges, and climb the leaderboard" />
      </View>

      {/* Vanya intro */}
      <View style={s.vanyaCard}>
        <Text style={s.vanyaAvatar}>🌳</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.vanyaName}>Meet Vanya</Text>
          <Text style={s.vanyaDesc}>Your AI wildlife guide. Named from the Sanskrit word for forest.</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={s.cta}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Phone')} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>Get Started  →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Phone')} activeOpacity={0.7}>
          <Text style={s.btnSecondaryText}>Already have an account?  Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatPill({ value, label }) {
  return (
    <View style={s.statPill}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureRow({ icon, text }) {
  return (
    <View style={s.featureRow}>
      <Text style={s.featureIcon}>{icon}</Text>
      <Text style={s.featureText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.bg, paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: C.primary + '25', top: -60, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: C.accent + '12', bottom: 120, left: -60,
  },

  logoSection: { alignItems: 'center' },
  logoEmoji:   { fontSize: 64, marginBottom: 10 },
  appName: {
    fontSize: 38, fontWeight: '900', color: C.text,
    letterSpacing: 8, marginBottom: 10,
  },
  tagline: { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22 },

  statsRow:  { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  statPill: {
    backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  statValue: { fontSize: 17, fontWeight: 'bold', color: C.accent },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2 },

  features:   { gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  featureText: { fontSize: 13, color: C.muted, flex: 1, lineHeight: 18 },

  vanyaCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    borderRadius: 16, padding: 16, gap: 14,
    borderWidth: 1, borderColor: C.border,
  },
  vanyaAvatar: { fontSize: 36 },
  vanyaName:   { fontSize: 14, fontWeight: 'bold', color: C.text, marginBottom: 3 },
  vanyaDesc:   { fontSize: 12, color: C.muted, lineHeight: 17 },

  cta:           { gap: 12 },
  btnPrimary: {
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
  },
  btnPrimaryText:   { fontSize: 17, fontWeight: 'bold', color: C.bg },
  btnSecondaryText: { fontSize: 14, color: C.muted, textAlign: 'center' },
});
