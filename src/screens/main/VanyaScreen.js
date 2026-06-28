import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, Dimensions, ActivityIndicator,
  KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { askVanya, identifyAnimal } from '../../services/gemini';
import { C } from '../../theme/colors';

const { height: SCREEN_H } = Dimensions.get('window');
const CAMERA_H = Math.round(SCREEN_H * 0.50);

const LANGUAGES = [
  { code: 'en-IN', label: 'EN', name: 'English'  },
  { code: 'hi-IN', label: 'हि', name: 'Hindi'    },
  { code: 'ta-IN', label: 'த',  name: 'Tamil'    },
  { code: 'te-IN', label: 'తె', name: 'Telugu'   },
  { code: 'bn-IN', label: 'বা', name: 'Bengali'  },
  { code: 'mr-IN', label: 'म',  name: 'Marathi'  },
];

const QUICK_QS = [
  { label: 'What is this?',    q: 'What animal is in this frame? Identify it for me.'                         },
  { label: 'Is it dangerous?', q: 'Is this animal dangerous? What safety precautions should I take?'           },
  { label: "What's it doing?", q: 'What behaviour is this animal displaying right now and why?'                },
  { label: 'Tell me more',     q: 'Give me one fascinating fact about this species specific to India.'          },
  { label: 'Is it injured?',   q: 'Does this animal appear injured or in distress? What should I do?'         },
  { label: 'Conservation?',    q: 'What is the IUCN conservation status of this species in India?'             },
];

export default function VanyaScreen({ navigation }) {
  const insets    = useSafeAreaInsets();
  const cameraRef = React.useRef(null);
  const loadingRef= React.useRef(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [language,       setLanguage]       = React.useState(LANGUAGES[0]);
  const [showLangPicker, setShowLangPicker] = React.useState(false);
  const [watchMode,      setWatchMode]      = React.useState(false);
  const [question,       setQuestion]       = React.useState('');
  const [response,       setResponse]       = React.useState(null);
  const [loading,        setLoading]        = React.useState(false);
  const [lastBase64,     setLastBase64]     = React.useState(null);
  const [showRescueBtn,  setShowRescueBtn]  = React.useState(false);

  // Watch mode — narrate every 7 seconds
  React.useEffect(() => {
    if (!watchMode) return;
    const id = setInterval(() => {
      if (!loadingRef.current) {
        captureAndAsk('What do you see in this frame? Narrate what the animal is doing like a wildlife documentary guide. Be vivid and under 50 words.');
      }
    }, 7000);
    return () => clearInterval(id);
  }, [watchMode, language]);

  // Stop speech on unmount
  React.useEffect(() => () => Speech.stop(), []);

  async function captureAndAsk(q) {
    if (loadingRef.current) return;
    const text = (q || question).trim() || 'What animal is this?';
    loadingRef.current = true;
    setLoading(true);
    setResponse(null);
    setShowRescueBtn(false);

    try {
      let base64 = null;
      if (cameraRef.current && permission?.granted) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            base64: true, quality: 0.5, skipProcessing: true,
          });
          base64 = photo.base64;
          setLastBase64(base64);
        } catch {
          // camera not ready — proceed text-only
        }
      }

      const answer = await askVanya(base64, text, language.name);
      setResponse(answer);

      const INJURY_KW = ['injur', 'wound', 'hurt', 'bleed', 'rescue', 'distress', 'trapped', 'sick', 'limp'];
      setShowRescueBtn(!watchMode && INJURY_KW.some(kw => answer.toLowerCase().includes(kw)));

      Speech.stop();
      Speech.speak(answer, { language: language.code, pitch: 1.05, rate: 0.90 });
    } catch {
      setResponse("I'm having trouble right now. Please try again!");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setQuestion('');
    }
  }

  async function handleAddToCollection() {
    if (!lastBase64) return;
    setLoading(true);
    try {
      const result = await identifyAnimal(lastBase64);
      navigation.navigate('CatchResult', { result });
    } finally {
      setLoading(false);
    }
  }

  function toggleWatch() {
    const next = !watchMode;
    setWatchMode(next);
    Haptics.selectionAsync();
    if (next) {
      setResponse('Watch Mode on — I\'ll narrate what I see every few seconds…');
      Speech.speak('Watch Mode activated. I\'ll describe what I see for you.', { language: language.code });
    } else {
      Speech.stop();
      setResponse(null);
    }
  }

  // ── No permission yet ──
  if (!permission) return <View style={s.screen} />;

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <View style={[s.screen, s.center, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { position: 'absolute', top: insets.top + 8, left: 16 }]}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 56 }}>🦁</Text>
        <Text style={s.permTitle}>Vanya needs your camera</Text>
        <Text style={s.permSub}>To identify wildlife in real time, Vanya needs camera access.</Text>
        <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
          <Text style={s.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => { Speech.stop(); navigation.goBack(); }}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>🦁 Vanya</Text>
          <View style={[s.statusDot, { backgroundColor: watchMode ? C.red : C.green }]} />
          <Text style={s.statusText}>{watchMode ? 'Watching' : 'Ready'}</Text>
        </View>

        <View style={s.headerRight}>
          <TouchableOpacity style={s.langBtn} onPress={() => setShowLangPicker(true)}>
            <Text style={s.langBtnText}>{language.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.watchToggle, watchMode && s.watchToggleActive]}
            onPress={toggleWatch}
          >
            <Ionicons name={watchMode ? 'eye' : 'eye-outline'} size={16} color={watchMode ? C.bg : C.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Camera ── */}
        <View style={[s.cameraWrap, { height: CAMERA_H }]}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

          {/* Watch mode badge */}
          {watchMode && (
            <View style={s.watchBadge}>
              <View style={s.recDot} />
              <Text style={s.watchBadgeText}>WATCH MODE</Text>
            </View>
          )}

          {/* Snap & Ask button */}
          {!loading && (
            <TouchableOpacity
              style={s.snapBtn}
              activeOpacity={0.85}
              onPress={() => captureAndAsk('What animal is this? Identify it and tell me something fascinating.')}
            >
              <Text style={s.snapBtnEmoji}>🦁</Text>
              <Text style={s.snapBtnText}>Snap & Ask</Text>
            </TouchableOpacity>
          )}
          {loading && (
            <View style={s.snapBtn}>
              <ActivityIndicator color={C.accent} />
              <Text style={s.snapBtnText}>Thinking…</Text>
            </View>
          )}

          {/* Response overlay */}
          {response && (
            <View style={s.responseOverlay}>
              <View style={s.responseInner}>
                <View style={s.vanyaDot}>
                  <Text style={{ fontSize: 14 }}>🦁</Text>
                </View>
                <Text style={s.responseText} numberOfLines={5}>{response}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => Speech.speak(response, { language: language.code })}
                >
                  <Ionicons name="volume-high-outline" size={20} color={C.accent} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── Quick questions ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 12 }}
        >
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
            {QUICK_QS.map(qq => (
              <TouchableOpacity
                key={qq.label}
                style={[s.quickChip, loading && { opacity: 0.4 }]}
                disabled={loading}
                onPress={() => { Haptics.selectionAsync(); captureAndAsk(qq.q); }}
              >
                <Text style={s.quickChipText}>{qq.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── Add to collection ── */}
        {response && lastBase64 && !watchMode && (
          <TouchableOpacity
            style={s.addCollBtn}
            activeOpacity={0.85}
            onPress={handleAddToCollection}
            disabled={loading}
          >
            <Ionicons name="add-circle" size={18} color={C.bg} />
            <Text style={s.addCollText}>Add to My Collection</Text>
          </TouchableOpacity>
        )}

        {/* ── Auto rescue report hint (4.2.9) ── */}
        {showRescueBtn && (
          <TouchableOpacity
            style={s.rescueBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ReportInjured')}
          >
            <Ionicons name="alert-circle" size={18} color="#fff" />
            <Text style={s.rescueBtnText}>This animal looks injured — File Rescue Report</Text>
          </TouchableOpacity>
        )}

        {/* ── Text input ── */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Ask Vanya anything about wildlife…"
            placeholderTextColor={C.muted}
            value={question}
            onChangeText={setQuestion}
            returnKeyType="send"
            onSubmitEditing={() => question.trim() && captureAndAsk(question)}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!question.trim() || loading) && s.sendBtnOff]}
            disabled={!question.trim() || loading}
            onPress={() => captureAndAsk(question)}
          >
            <Ionicons name="send" size={18} color={!question.trim() || loading ? C.muted : C.bg} />
          </TouchableOpacity>
        </View>

        {/* ── Tips row ── */}
        <View style={s.tipsRow}>
          {[
            { icon: 'camera-outline',    text: 'Point at any animal' },
            { icon: 'volume-high-outline', text: 'Vanya speaks back'  },
            { icon: 'eye-outline',       text: 'Watch Mode narrates' },
          ].map(t => (
            <View key={t.text} style={s.tipPill}>
              <Ionicons name={t.icon} size={13} color={C.muted} />
              <Text style={s.tipPillText}>{t.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Language picker modal ── */}
      <Modal visible={showLangPicker} transparent animationType="fade">
        <Pressable style={s.modalBg} onPress={() => setShowLangPicker(false)}>
          <Pressable style={s.modalCard}>
            <Text style={s.modalTitle}>Vanya speaks in…</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[s.langRow, language.code === lang.code && s.langRowActive]}
                onPress={() => {
                  setLanguage(lang);
                  setShowLangPicker(false);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={s.langLabel}>{lang.label}</Text>
                <Text style={[s.langName, language.code === lang.code && { color: C.accent, fontWeight: '700' }]}>
                  {lang.name}
                </Text>
                {language.code === lang.code && <Ionicons name="checkmark" size={16} color={C.accent} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },

  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: C.text },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  statusText:   { fontSize: 12, color: C.muted },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBtn:      { backgroundColor: C.card, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  langBtnText:  { fontSize: 12, fontWeight: '700', color: C.text },
  watchToggle:      { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  watchToggleActive:{ backgroundColor: C.accent, borderColor: C.accent },

  cameraWrap: { width: '100%', overflow: 'hidden', backgroundColor: '#000' },

  watchBadge:     { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  recDot:         { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.red },
  watchBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  snapBtn:      { position: 'absolute', bottom: 80, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 30, paddingHorizontal: 22, paddingVertical: 12, borderWidth: 1, borderColor: C.accent },
  snapBtnEmoji: { fontSize: 18 },
  snapBtnText:  { fontSize: 14, fontWeight: '700', color: C.accent },

  responseOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(13,31,22,0.88)', padding: 12 },
  responseInner:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  vanyaDot:        { width: 30, height: 30, borderRadius: 15, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  responseText:    { flex: 1, fontSize: 13, color: C.text, lineHeight: 20 },

  quickChip:     { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  quickChipText: { fontSize: 13, color: C.text, fontWeight: '600' },

  addCollBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.green, borderRadius: 14, paddingVertical: 14, marginHorizontal: 16, marginBottom: 12 },
  addCollText: { fontSize: 15, fontWeight: '700', color: C.bg },

  rescueBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.red, borderRadius: 14, paddingVertical: 14, marginHorizontal: 16, marginBottom: 12 },
  rescueBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  input:    { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border },
  sendBtn:  { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff:{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border },

  tipsRow:     { flexDirection: 'row', justifyContent: 'center', gap: 8, marginHorizontal: 16, flexWrap: 'wrap' },
  tipPill:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tipPillText: { fontSize: 11, color: C.muted },

  permTitle:  { fontSize: 20, fontWeight: '700', color: C.text, textAlign: 'center' },
  permSub:    { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },
  permBtn:    { backgroundColor: C.accent, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  permBtnText:{ fontSize: 16, fontWeight: '700', color: C.bg },

  modalBg:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard:  { backgroundColor: C.card, borderRadius: 20, padding: 20, width: '80%', borderWidth: 1, borderColor: C.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16, textAlign: 'center' },
  langRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderRadius: 10 },
  langRowActive:  { backgroundColor: C.primary + '40' },
  langLabel:      { fontSize: 16, fontWeight: '700', color: C.accent, width: 28 },
  langName:       { flex: 1, fontSize: 15, color: C.text },
});
