import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Dimensions, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech  from 'expo-speech';
import { identifyAnimal } from '../../services/gemini';
import useCatchStore from '../../store/useCatchStore';
import useSocialStore from '../../store/useSocialStore';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { C } from '../../theme/colors';

const EMOJI_MAP = {
  peacock: '🦚', tiger: '🐯', elephant: '🐘', cobra: '🐍', bear: '🐻',
  hornbill: '🦜', parrot: '🦜', deer: '🦌', leopard: '🐆', monkey: '🐒',
  crocodile: '🐊', flamingo: '🦩', eagle: '🦅', owl: '🦉', dolphin: '🐬',
  turtle: '🐢', snake: '🐍', frog: '🐸', lion: '🦁', rhino: '🦏',
  wolf: '🐺', fox: '🦊', bird: '🐦', fish: '🐟',
};

function getEmoji(name) {
  if (!name) return '🐾';
  const n = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (n.includes(key)) return emoji;
  }
  return '🐾';
}

const { width } = Dimensions.get('window');

const RARITY_COLOR = {
  Common:    C.gray,
  Uncommon:  C.green,
  Rare:      C.blue,
  Legendary: C.orange,
};

const RARITY_EMOJI = {
  Common: '⬜', Uncommon: '🟩', Rare: '🟦', Legendary: '🟧',
};

const CONSERVATION_COLOR = {
  'Least Concern':       C.green,
  'Near Threatened':     '#CDDC39',
  'Vulnerable':          C.orange,
  'Endangered':          '#FF5722',
  'Critically Endangered': C.red,
};

export default function CatchResultScreen({ navigation, route }) {
  const { base64, uri, lat, lng } = route.params;
  const { addCatch, hasCaught } = useCatchStore();
  const addPost = useSocialStore(s => s.addPost);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [state,        setState]        = useState('loading'); // loading | result | notfound | error
  const [result,       setResult]       = useState(null);
  const [saved,        setSaved]        = useState(false);
  const [shared,       setShared]       = useState(false);
  const [showToast,    setShowToast]    = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  useEffect(() => {
    identifyAnimal(base64).then(data => {
      if (data.found) {
        setResult(data);
        setState('result');
      } else {
        setState(data.error ? 'error' : 'notfound');
      }
    });
  }, []);

  const handleAddToCollection = () => {
    if (saved) return;
    addCatch({ ...result, photoUri: uri, ...(lat != null ? { lat, lng } : {}) });
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    if (result.rarity === 'Rare' || result.rarity === 'Legendary') {
      setTimeout(() => setShowBreathing(true), 1800);
    }
  };

  const handleShareToCommunity = () => {
    if (shared || !result) return;
    addPost({
      id: `post_${Date.now()}`,
      userId: user?.phone ?? 'me',
      username: user?.username ?? 'Explorer',
      city: 'India',
      species: result.name,
      scientific: result.scientific,
      rarity: result.rarity,
      xp: result.xp,
      emoji: getEmoji(result.name),
      caption: `Just caught a ${result.name}! 🌿`,
      location: 'My Location',
      aqi: null,
      createdAt: new Date().toISOString(),
      spottedBy: [],
      comments: 0,
      isStory: result.rarity === 'Rare' || result.rarity === 'Legendary',
    });
    setShared(true);
    Haptics.selectionAsync();
  };

  // ── Loading ─────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <View style={[s.bg, s.center]}>
        <Image source={{ uri }} style={s.analysingImg} />
        <View style={s.analysingOverlay} />
        <View style={s.analysingBox}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.analysingTitle}>Vanya is identifying...</Text>
          <Text style={s.analysingSub}>Analysing species, rarity and fun facts</Text>
        </View>
      </View>
    );
  }

  // ── Not found / Error ───────────────────────────────────────
  if (state === 'notfound' || state === 'error') {
    return (
      <View style={[s.bg, s.center, { paddingHorizontal: 32 }]}>
        <Text style={{ fontSize: 64 }}>{state === 'error' ? '⚠️' : '🔍'}</Text>
        <Text style={s.nfTitle}>
          {state === 'error' ? 'Something went wrong' : 'No animal found'}
        </Text>
        <Text style={s.nfSub}>
          {state === 'error'
            ? 'Check your internet connection and try again.'
            : "Vanya couldn't spot an animal in this photo. Try getting closer or better lighting!"}
        </Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="camera" size={18} color={C.bg} />
          <Text style={s.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Result ──────────────────────────────────────────────────
  const rarityColor = RARITY_COLOR[result.rarity] ?? C.gray;
  const alreadyCaught = hasCaught(result.name);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={s.bg}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Photo + overlay */}
      <View style={s.photoContainer}>
        <Image source={{ uri }} style={s.photo} />
        <View style={s.photoGradient} />

        {/* Close button */}
        <TouchableOpacity
          style={[s.closeBtn, { top: insets.top + 8 }]}
          onPress={() => navigation.navigate('SnapHome')}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Demo badge */}
        {result.isDemo && (
          <View style={[s.demoBadge, { top: insets.top + 8 }]}>
            <Text style={s.demoText}>Demo — add Gemini API key for live ID</Text>
          </View>
        )}

        {/* Rarity chip on photo */}
        <View style={[s.rarityChip, { backgroundColor: rarityColor }]}>
          <Text style={s.rarityChipText}>{RARITY_EMOJI[result.rarity]} {result.rarity}</Text>
        </View>
      </View>

      {/* Species card */}
      <View style={s.card}>
        {/* Name + XP */}
        <View style={s.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.speciesName}>{result.name}</Text>
            <Text style={s.scientific}>{result.scientific}</Text>
          </View>
          <View style={[s.xpBubble, { backgroundColor: rarityColor + '22', borderColor: rarityColor }]}>
            <Ionicons name="flash" size={14} color={rarityColor} />
            <Text style={[s.xpNum, { color: rarityColor }]}>+{result.xp}</Text>
            <Text style={[s.xpLabel, { color: rarityColor }]}>XP</Text>
          </View>
        </View>

        {/* Info row */}
        <View style={s.infoRow}>
          <InfoChip
            icon="leaf-outline"
            label="Habitat"
            value={result.habitat}
            color={C.green}
          />
          <InfoChip
            icon="shield-outline"
            label="Status"
            value={result.conservation}
            color={CONSERVATION_COLOR[result.conservation] ?? C.muted}
          />
        </View>

        {/* Danger warning */}
        {result.dangerous && result.dangerNote && (
          <View style={s.dangerCard}>
            <Ionicons name="warning" size={18} color={C.red} />
            <Text style={s.dangerText}>{result.dangerNote}</Text>
          </View>
        )}

        {/* Fun facts */}
        <Text style={s.factsHeader}>🌿 Fun Facts from Vanya</Text>
        {result.facts?.map((fact, i) => (
          <View key={i} style={s.factRow}>
            <View style={[s.factDot, { backgroundColor: rarityColor }]} />
            <Text style={s.factText}>{fact}</Text>
          </View>
        ))}

        {/* Already caught notice */}
        {alreadyCaught && !saved && (
          <View style={s.alreadyCaughtCard}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Text style={s.alreadyCaughtText}>Already in your collection!</Text>
          </View>
        )}

        {/* CTA buttons */}
        <View style={s.ctaRow}>
          {saved ? (
            <View style={s.savedCard}>
              <Ionicons name="checkmark-circle" size={22} color={C.green} />
              <Text style={s.savedText}>Added to your collection!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: rarityColor }]}
              onPress={handleAddToCollection}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color={C.bg} />
              <Text style={s.addBtnText}>
                {alreadyCaught ? 'Catch Again (+XP)' : 'Add to Collection'}
              </Text>
            </TouchableOpacity>
          )}

          {saved && !shared && (
            <TouchableOpacity style={s.shareBtn} onPress={handleShareToCommunity} activeOpacity={0.85}>
              <Ionicons name="people" size={18} color={C.text} />
              <Text style={s.shareBtnText}>Share to Community</Text>
            </TouchableOpacity>
          )}

          {shared && (
            <View style={s.sharedCard}>
              <Ionicons name="checkmark-circle" size={18} color={C.blue} />
              <Text style={s.sharedText}>Posted to Community!</Text>
            </View>
          )}

          <TouchableOpacity style={s.retrySmall} onPress={() => navigation.goBack()}>
            <Ionicons name="camera" size={18} color={C.accent} />
            <Text style={s.retrySmallText}>Snap Another</Text>
          </TouchableOpacity>

          {/* Report if injured */}
          <TouchableOpacity
            style={s.reportBtn}
            onPress={() => navigation.navigate('ReportInjured')}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle-outline" size={16} color={C.red} />
            <Text style={s.reportBtnText}>Animal looks injured? Report it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    <Toast visible={showToast} message={`${result?.name} added to collection!`} />
    <BreathingModal
      visible={showBreathing}
      rarity={result?.rarity}
      onClose={() => setShowBreathing(false)}
    />
    </View>
  );
}

const BREATH_PHASES = [
  { key: 'inhale', label: 'Breathe In',  speech: 'Breathe in',  duration: 4, color: C.blue   },
  { key: 'hold',   label: 'Hold',        speech: 'Hold',        duration: 4, color: C.accent  },
  { key: 'exhale', label: 'Breathe Out', speech: 'Breathe out', duration: 6, color: C.green  },
];

function BreathingModal({ visible, rarity, onClose }) {
  const [phase,   setPhase]   = useState('idle');
  const [counter, setCounter] = useState(0);
  const timerRef  = useRef(null);
  const tickRef   = useRef(null);
  const phaseIdx  = useRef(0);
  const secRef    = useRef(0);
  const col       = RARITY_COLOR[rarity] ?? C.orange;

  const announce = (ph) => {
    Speech.stop();
    Speech.speak(ph.speech, { rate: 0.75, pitch: 0.85, language: 'en-IN' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const start = () => {
    phaseIdx.current = 0;
    secRef.current   = 0;
    const first = BREATH_PHASES[0];
    setPhase(first.key);
    setCounter(first.duration);
    announce(first);
    tickRef.current = setInterval(() => Haptics.selectionAsync(), 1000);
    timerRef.current = setInterval(() => {
      secRef.current++;
      const cur = BREATH_PHASES[phaseIdx.current];
      const remaining = cur.duration - secRef.current;
      if (remaining <= 0) {
        phaseIdx.current = (phaseIdx.current + 1) % BREATH_PHASES.length;
        secRef.current   = 0;
        const next = BREATH_PHASES[phaseIdx.current];
        setPhase(next.key);
        setCounter(next.duration);
        announce(next);
      } else {
        setCounter(remaining);
      }
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    clearInterval(tickRef.current);
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('idle');
    setCounter(0);
  };

  const handleClose = () => {
    stop();
    onClose();
  };

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(tickRef.current); Speech.stop(); }, []);

  const cur = BREATH_PHASES.find(p => p.key === phase);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={handleClose}>
      <View style={bm.overlay}>
        <View style={bm.card}>
          <View style={[bm.rarityBadge, { backgroundColor: col + '20', borderColor: col + '50' }]}>
            <Text style={[bm.rarityText, { color: col }]}>{rarity} Catch!</Text>
          </View>
          <Text style={bm.title}>Mindful Moment 🌿</Text>
          <Text style={bm.sub}>Celebrate this rare find with 60 seconds of breathing</Text>

          <View style={bm.phaseArea}>
            {phase === 'idle' ? (
              <Text style={bm.idleHint}>Tap Start to begin guided breathing</Text>
            ) : (
              <>
                <View style={bm.dots}>
                  {BREATH_PHASES.map(p => (
                    <View key={p.key} style={[bm.dot, { backgroundColor: phase === p.key ? p.color : C.border }]} />
                  ))}
                </View>
                <Text style={[bm.phaseLabel, { color: cur.color }]}>{cur.label}</Text>
                <Text style={[bm.phaseCount, { color: cur.color }]}>{counter}</Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[bm.startBtn, phase !== 'idle' && { backgroundColor: C.red }]}
            onPress={phase === 'idle' ? start : stop}
            activeOpacity={0.85}
          >
            <Ionicons name={phase === 'idle' ? 'play' : 'stop'} size={18} color="#fff" />
            <Text style={bm.startBtnText}>{phase === 'idle' ? 'Start Breathing' : 'Stop'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={bm.skipBtn} onPress={handleClose}>
            <Text style={bm.skipText}>Skip — go to my collection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const bm = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  card:        { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center', gap: 12, paddingBottom: 40 },
  rarityBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1 },
  rarityText:  { fontSize: 13, fontWeight: '700' },
  title:       { fontSize: 22, fontWeight: 'bold', color: C.text },
  sub:         { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
  phaseArea:   { width: '100%', alignItems: 'center', minHeight: 80, justifyContent: 'center', marginVertical: 8 },
  idleHint:    { fontSize: 13, color: C.muted, fontStyle: 'italic' },
  dots:        { flexDirection: 'row', gap: 8, marginBottom: 10 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  phaseLabel:  { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  phaseCount:  { fontSize: 52, fontWeight: 'bold', lineHeight: 60 },
  startBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, width: '100%', justifyContent: 'center' },
  startBtnText:{ fontSize: 16, fontWeight: 'bold', color: '#fff' },
  skipBtn:     { paddingVertical: 10 },
  skipText:    { fontSize: 13, color: C.muted },
});

function InfoChip({ icon, label, value, color }) {
  return (
    <View style={s.infoChip}>
      <View style={s.infoChipHeader}>
        <Ionicons name={icon} size={13} color={color} />
        <Text style={[s.infoChipLabel, { color }]}>{label}</Text>
      </View>
      <Text style={s.infoChipValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Analysing
  analysingImg:     { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  analysingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000CC' },
  analysingBox:     { alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  analysingTitle:   { fontSize: 20, fontWeight: 'bold', color: C.text, marginTop: 16 },
  analysingSub:     { fontSize: 14, color: C.muted, textAlign: 'center' },

  // Not found
  nfTitle: { fontSize: 22, fontWeight: 'bold', color: C.text, marginTop: 16, marginBottom: 10, textAlign: 'center' },
  nfSub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 28, gap: 8 },
  retryBtnText: { fontSize: 16, fontWeight: 'bold', color: C.bg },

  // Photo
  photoContainer: { position: 'relative' },
  photo:          { width, height: width * 0.85 },
  photoGradient:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: C.bg, opacity: 0.6 },
  closeBtn:       { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#00000060', alignItems: 'center', justifyContent: 'center' },
  demoBadge:      { position: 'absolute', right: 16, backgroundColor: C.card, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  demoText:       { fontSize: 10, color: C.muted },
  rarityChip:     { position: 'absolute', bottom: 16, right: 16, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  rarityChipText: { fontSize: 13, fontWeight: 'bold', color: '#fff' },

  // Card
  card:    { marginTop: -20, backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  speciesName: { fontSize: 26, fontWeight: 'bold', color: C.text, marginBottom: 4 },
  scientific:  { fontSize: 13, color: C.muted, fontStyle: 'italic' },
  xpBubble:    { borderWidth: 2, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 60 },
  xpNum:       { fontSize: 22, fontWeight: 'bold' },
  xpLabel:     { fontSize: 10, fontWeight: '600' },

  infoRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoChip:     { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  infoChipHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  infoChipLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  infoChipValue:  { fontSize: 12, color: C.text, lineHeight: 16 },

  dangerCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.red + '15', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.red + '40' },
  dangerText: { flex: 1, fontSize: 13, color: C.red, lineHeight: 18 },

  factsHeader: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  factRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  factDot:     { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  factText:    { flex: 1, fontSize: 13, color: C.muted, lineHeight: 20 },

  alreadyCaughtCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.green + '15', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: C.green + '40' },
  alreadyCaughtText: { fontSize: 13, color: C.green, fontWeight: '600' },

  ctaRow:     { gap: 10, marginTop: 20 },
  addBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 18, gap: 8 },
  addBtnText: { fontSize: 17, fontWeight: 'bold', color: C.bg },
  savedCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.green + '20', borderRadius: 16, paddingVertical: 18, borderWidth: 1, borderColor: C.green + '50' },
  savedText:  { fontSize: 16, fontWeight: '700', color: C.green },
  shareBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, gap: 8, borderWidth: 1, borderColor: C.border },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: C.text },
  sharedCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.blue + '20', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: C.blue + '50' },
  sharedText: { fontSize: 14, fontWeight: '700', color: C.blue },
  retrySmall: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: C.border },
  retrySmallText: { fontSize: 15, fontWeight: '600', color: C.accent },
  reportBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  reportBtnText: { fontSize: 13, color: C.red, fontWeight: '600' },
});
