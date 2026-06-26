import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const OTP_LEN = 6;

export default function OTPScreen({ navigation, route }) {
  const { phone } = route.params;
  const { login } = useAuth();
  const insets     = useSafeAreaInsets();
  const inputs     = useRef([]);

  const [otp,     setOtp]     = useState(Array(OTP_LEN).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer,   setTimer]   = useState(30);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (timer === 0) return;
    const t = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (text, i) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[i]     = digit;
    setOtp(next);
    setError('');
    if (digit && i < OTP_LEN - 1) inputs.current[i + 1]?.focus();
    if (!digit && i > 0)           inputs.current[i - 1]?.focus();
  };

  const handleKeyPress = (e, i) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LEN) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    await login(phone);
    setLoading(false);
  };

  const filled      = otp.filter(Boolean).length === OTP_LEN;
  const masked      = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

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
          <Text style={s.emoji}>🔐</Text>
          <Text style={s.title}>Verify your{'\n'}number</Text>
          <Text style={s.subtitle}>
            Code sent to{' '}
            <Text style={s.phoneNum}>{masked}</Text>
          </Text>
        </View>

        {/* OTP boxes */}
        <View style={s.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => (inputs.current[i] = r)}
              style={[s.box, digit && s.boxFilled, error && s.boxError]}
              value={digit}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        {/* Resend */}
        <TouchableOpacity
          style={s.resendRow}
          onPress={() => { setTimer(30); setOtp(Array(OTP_LEN).fill('')); inputs.current[0]?.focus(); }}
          disabled={timer > 0}
        >
          <Ionicons name="refresh" size={14} color={timer > 0 ? C.muted : C.accent} />
          <Text style={[s.resendText, timer > 0 && s.resendDisabled]}>
            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        {/* Demo hint */}
        <View style={s.demoCard}>
          <Ionicons name="information-circle-outline" size={15} color={C.muted} />
          <Text style={s.demoText}>Demo mode — enter any 6 digits to continue</Text>
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[s.btn, (!filled || loading) && s.btnDisabled]}
          onPress={handleVerify}
          disabled={!filled || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.bg} />
            : <Text style={[s.btnText, !filled && s.btnTextOff]}>Verify & Continue  →</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between', minHeight: '100%' },
  back:      { marginBottom: 36 },
  header:    { alignItems: 'center', marginBottom: 44 },
  emoji:     { fontSize: 52, marginBottom: 16 },
  title: {
    fontSize: 34, fontWeight: 'bold', color: C.text,
    lineHeight: 44, marginBottom: 10, textAlign: 'center',
  },
  subtitle:  { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22 },
  phoneNum:  { color: C.text, fontWeight: '700' },

  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 16 },
  box: {
    width: 46, height: 58, borderRadius: 14, backgroundColor: C.card,
    borderWidth: 2, borderColor: C.border, textAlign: 'center',
    fontSize: 24, fontWeight: 'bold', color: C.text,
  },
  boxFilled: { borderColor: C.accent, backgroundColor: C.card2 },
  boxError:  { borderColor: C.red },
  errorText: { color: C.red, fontSize: 13, textAlign: 'center', marginBottom: 8 },

  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 14 },
  resendText:    { fontSize: 14, color: C.accent, fontWeight: '600' },
  resendDisabled: { color: C.muted },

  demoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: C.card, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
  },
  demoText: { fontSize: 12, color: C.muted },

  btn: {
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 24,
  },
  btnDisabled:  { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  btnText:      { fontSize: 17, fontWeight: 'bold', color: C.bg },
  btnTextOff:   { color: C.muted },
});
