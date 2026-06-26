import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme/colors';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const insets = useSafeAreaInsets();

  const digits   = phone.replace(/\D/g, '');
  const isValid  = digits.length === 10;

  const handleSend = () => {
    if (!isValid) return;
    navigation.navigate('OTP', { phone: digits });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[s.container, {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>

        <View style={s.header}>
          <Text style={s.emoji}>📱</Text>
          <Text style={s.title}>Enter your{'\n'}phone number</Text>
          <Text style={s.subtitle}>We'll send you a 6-digit verification code</Text>
        </View>

        <View style={s.inputSection}>
          <Text style={s.label}>Phone Number</Text>
          <View style={[s.inputRow, isValid && s.inputRowValid]}>
            <View style={s.prefix}>
              <Text style={s.flag}>🇮🇳</Text>
              <Text style={s.prefixText}>+91</Text>
            </View>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
              onSubmitEditing={handleSend}
            />
            {isValid && (
              <View style={s.checkIcon}>
                <Ionicons name="checkmark-circle" size={22} color={C.green} />
              </View>
            )}
          </View>
          <Text style={s.hint}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        <TouchableOpacity
          style={[s.btn, !isValid && s.btnDisabled]}
          onPress={handleSend}
          disabled={!isValid}
          activeOpacity={0.85}
        >
          <Text style={[s.btnText, !isValid && s.btnTextDisabled]}>
            Send OTP  →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between', minHeight: '100%' },
  back:      { marginBottom: 36 },
  header:    { marginBottom: 44 },
  emoji:     { fontSize: 52, marginBottom: 16 },
  title: {
    fontSize: 34, fontWeight: 'bold', color: C.text, lineHeight: 44, marginBottom: 10,
  },
  subtitle: { fontSize: 15, color: C.muted, lineHeight: 22 },

  inputSection: { flex: 1, justifyContent: 'center', gap: 12 },
  label:        { fontSize: 12, color: C.muted, fontWeight: '700', letterSpacing: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    borderRadius: 16, borderWidth: 2, borderColor: C.border, overflow: 'hidden',
  },
  inputRowValid: { borderColor: C.green },
  prefix: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 16,
    gap: 8, borderRightWidth: 1, borderRightColor: C.border,
  },
  flag:        { fontSize: 22 },
  prefixText:  { fontSize: 16, color: C.text, fontWeight: '600' },
  input: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 18,
    fontSize: 20, color: C.text, letterSpacing: 3, fontWeight: '600',
  },
  checkIcon:   { paddingRight: 14 },
  hint:        { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 16 },

  btn: {
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 28,
  },
  btnDisabled:     { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  btnText:         { fontSize: 17, fontWeight: 'bold', color: C.bg },
  btnTextDisabled: { color: C.muted },
});
