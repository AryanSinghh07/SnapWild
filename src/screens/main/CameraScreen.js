import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing,   setFacing]   = useState('back');
  const [flash,    setFlash]    = useState('off');
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);
  const insets    = useSafeAreaInsets();

  // ── Permission not decided yet ──────────────────────────────
  if (!permission) {
    return <View style={s.bg} />;
  }

  // ── Permission denied ───────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={[s.bg, s.center, { paddingHorizontal: 32 }]}>
        <Text style={s.permEmoji}>📷</Text>
        <Text style={s.permTitle}>Camera Permission Needed</Text>
        <Text style={s.permSub}>
          SnapWild needs camera access so Vanya can identify animals for you.
        </Text>
        <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
          <Text style={s.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.permBack} onPress={() => navigation.goBack()}>
          <Text style={s.permBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Take photo ──────────────────────────────────────────────
  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });
      navigation.navigate('CatchResult', { base64: photo.base64, uri: photo.uri });
    } catch (e) {
      console.error('Capture error:', e);
    } finally {
      setCapturing(false);
    }
  };

  // ── Pick from gallery ───────────────────────────────────────
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      base64: true,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      navigation.navigate('CatchResult', { base64: asset.base64, uri: asset.uri });
    }
  };

  // ── UI ──────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {/* Viewfinder overlay */}
      <View style={s.overlay}>
        <View style={s.cornerTL} /><View style={s.cornerTR} />
        <View style={s.cornerBL} /><View style={s.cornerBR} />
      </View>

      {/* Vanya hint */}
      <View style={[s.vanyaHint, { top: insets.top + 70 }]}>
        <Text style={s.vanyaText}>Point at any animal · Vanya will identify it</Text>
      </View>

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.iconBtn, flash === 'on' && s.iconBtnActive]}
          onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}
        >
          <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={s.galleryBtn} onPress={handleGallery}>
          <Ionicons name="images-outline" size={26} color="#fff" />
          <Text style={s.galleryText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.captureBtn, capturing && s.captureBtnActive]}
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.85}
        >
          {capturing
            ? <ActivityIndicator color={C.bg} size="large" />
            : <View style={s.captureInner} />
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={s.flipBtn}
          onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
        >
          <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
          <Text style={s.galleryText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CORNER = 28;
const s = StyleSheet.create({
  bg:        { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: '#000' },
  center:    { alignItems: 'center', justifyContent: 'center' },

  // Permission screen
  permEmoji: { fontSize: 64, marginBottom: 16 },
  permTitle: { fontSize: 22, fontWeight: 'bold', color: C.text, marginBottom: 10, textAlign: 'center' },
  permSub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  permBtn:   { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  permBtnText: { fontSize: 16, fontWeight: 'bold', color: C.bg },
  permBack:  { marginTop: 16, paddingVertical: 12 },
  permBackText: { fontSize: 14, color: C.muted },

  // Viewfinder corners
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  cornerTL: { position: 'absolute', top: '25%', left: '12%', width: CORNER, height: CORNER, borderTopWidth: 3, borderLeftWidth: 3, borderColor: C.accent, borderTopLeftRadius: 4 },
  cornerTR: { position: 'absolute', top: '25%', right: '12%', width: CORNER, height: CORNER, borderTopWidth: 3, borderRightWidth: 3, borderColor: C.accent, borderTopRightRadius: 4 },
  cornerBL: { position: 'absolute', bottom: '35%', left: '12%', width: CORNER, height: CORNER, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: C.accent, borderBottomLeftRadius: 4 },
  cornerBR: { position: 'absolute', bottom: '35%', right: '12%', width: CORNER, height: CORNER, borderBottomWidth: 3, borderRightWidth: 3, borderColor: C.accent, borderBottomRightRadius: 4 },

  // Vanya hint
  vanyaHint: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  vanyaText: { backgroundColor: '#00000080', color: '#fff', fontSize: 13, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },

  // Top bar
  topBar:   { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconBtn:  { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00000060', alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { backgroundColor: C.accent + 'CC' },

  // Bottom bar
  bottomBar:   { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 20 },
  galleryBtn:  { alignItems: 'center', gap: 4, width: 70 },
  galleryText: { fontSize: 11, color: '#fff', opacity: 0.8 },
  flipBtn:     { alignItems: 'center', gap: 4, width: 70 },

  captureBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.accent,
    borderWidth: 4, borderColor: '#ffffff60',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnActive: { backgroundColor: C.primary },
  captureInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff',
  },
});
