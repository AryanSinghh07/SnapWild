import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme/colors';

export default function SnapScreen({ navigation }) {
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

      <TouchableOpacity style={s.btnPrimary} activeOpacity={0.85} onPress={() => navigation.navigate('Camera')}>
        <Ionicons name="camera" size={22} color={C.bg} />
        <Text style={s.btnPrimaryText}>Catch Now</Text>
      </TouchableOpacity>

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

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 18, gap: 10,
  },
  btnPrimaryText: { fontSize: 17, fontWeight: 'bold', color: C.bg },

});
