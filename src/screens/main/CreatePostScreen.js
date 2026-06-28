import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSocialStore from '../../store/useSocialStore';
import useCatchStore  from '../../store/useCatchStore';
import { useAuth }    from '../../context/AuthContext';
import { C } from '../../theme/colors';

const POST_TYPES = [
  { key: 'catch',   label: 'Catch Share',   emoji: '🎯', desc: 'Share an animal you identified'    },
  { key: 'pet',     label: 'Pet Moment',    emoji: '🐾', desc: 'Share a moment with your pet'       },
  { key: 'rescue',  label: 'Rescue Story',  emoji: '🆘', desc: 'Share a rescue you were part of'   },
  { key: 'sighting',label: 'My Sighting',   emoji: '👁️', desc: 'Share a wildlife sighting manually' },
];

const RARITY_COLOR = { Common: C.gray, Uncommon: C.green, Rare: C.blue, Legendary: C.orange };

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Ahmedabad'];

const EMOJI_MAP = {
  peacock: '🦚', tiger: '🐯', elephant: '🐘', cobra: '🐍', bear: '🐻',
  deer: '🦌', leopard: '🐆', monkey: '🐒', eagle: '🦅', owl: '🦉',
  hornbill: '🦜', parrot: '🦜', crocodile: '🐊', flamingo: '🦩',
};
function getEmoji(name) {
  if (!name) return '🐾';
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(EMOJI_MAP)) if (n.includes(k)) return v;
  return '🐾';
}

export default function CreatePostScreen({ navigation }) {
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const addPost  = useSocialStore(s => s.addPost);
  const catches  = useCatchStore(s => s.catches);

  const [postType,  setPostType]  = React.useState(POST_TYPES[0]);
  const [caption,   setCaption]   = React.useState('');
  const [species,   setSpecies]   = React.useState('');
  const [city,      setCity]      = React.useState(CITIES[0]);
  const [submitting,setSubmitting]= React.useState(false);

  const recentCatch = catches[0];

  function handleSelectCatch(c) {
    setSpecies(c.name);
    setPostType(POST_TYPES[0]);
    setCaption(`Just caught a ${c.name}! 🌿`);
    Haptics.selectionAsync();
  }

  function handleSubmit() {
    if (!caption.trim()) {
      Alert.alert('Caption required', 'Add a caption to share with the community.');
      return;
    }
    setSubmitting(true);

    const isRare = postType.key === 'catch' && recentCatch?.rarity !== 'Common';

    addPost({
      id:         `post_${Date.now()}`,
      userId:     user?.phone ?? 'me',
      username:   user?.username ?? 'Explorer',
      city,
      postType:   postType.key,
      species:    species.trim() || postType.label,
      scientific: '',
      rarity:     recentCatch?.rarity ?? 'Common',
      xp:         recentCatch?.xp     ?? 15,
      emoji:      getEmoji(species) || postType.emoji,
      caption:    caption.trim(),
      location:   city,
      aqi:        null,
      createdAt:  new Date().toISOString(),
      spottedBy:  [],
      comments:   0,
      isStory:    isRare,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(false);
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Post</Text>
        <TouchableOpacity
          style={[s.postBtn, (!caption.trim() || submitting) && s.postBtnOff]}
          disabled={!caption.trim() || submitting}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={[s.postBtnText, (!caption.trim() || submitting) && { color: C.muted }]}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Post type selector */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Label text="Post Type" />
          <View style={s.typeGrid}>
            {POST_TYPES.map(t => {
              const active = postType.key === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[s.typeCard, active && s.typeCardActive]}
                  onPress={() => { setPostType(t); Haptics.selectionAsync(); }}
                  activeOpacity={0.8}
                >
                  <Text style={s.typeEmoji}>{t.emoji}</Text>
                  <Text style={[s.typeLabel, active && s.typeLabelActive]}>{t.label}</Text>
                  <Text style={s.typeDesc} numberOfLines={2}>{t.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Link to recent catch (if catch share) */}
        {postType.key === 'catch' && catches.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <Label text="Link a Catch (optional)" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {catches.slice(0, 6).map(c => {
                  const col = RARITY_COLOR[c.rarity] ?? C.gray;
                  const selected = species === c.name;
                  return (
                    <TouchableOpacity
                      key={c.id ?? c.name}
                      style={[s.catchChip, selected && { borderColor: col, backgroundColor: col + '15' }]}
                      onPress={() => handleSelectCatch(c)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 20 }}>{getEmoji(c.name)}</Text>
                      <Text style={[s.catchChipName, selected && { color: col }]} numberOfLines={1}>{c.name}</Text>
                      <View style={[s.catchRarityDot, { backgroundColor: col }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Species / subject */}
        {postType.key !== 'catch' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <Label text={postType.key === 'pet' ? 'Pet Name' : 'Species / Subject'} />
            <TextInput
              style={s.input}
              placeholder={postType.key === 'pet' ? 'E.g. Bruno, Nala…' : 'E.g. Indian Peacock, Peacock spider…'}
              placeholderTextColor={C.muted}
              value={species}
              onChangeText={setSpecies}
            />
          </View>
        )}

        {/* Caption */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Label text="Caption" />
          <TextInput
            style={[s.input, s.captionInput]}
            placeholder={
              postType.key === 'catch'   ? 'Tell the community what you found! 🌿' :
              postType.key === 'pet'     ? 'Share a moment with your furry friend 🐾' :
              postType.key === 'rescue'  ? 'Describe what happened and how you helped 🆘' :
                                           'What did you see? Where were you? 👁️'
            }
            placeholderTextColor={C.muted}
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={300}
          />
          <Text style={s.charCount}>{caption.length}/300</Text>
        </View>

        {/* Location */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Label text="Location (City)" />
          <View style={s.cityRow}>
            {CITIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.cityChip, city === c && s.cityChipActive]}
                onPress={() => { setCity(c); Haptics.selectionAsync(); }}
              >
                <Text style={[s.cityChipText, city === c && s.cityChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy note */}
        <View style={s.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={C.green} />
          <Text style={s.privacyNoteText}>
            Only your username and city are shared. Exact location and phone number are never posted.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }) {
  return (
    <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
      {text.toUpperCase()}
    </Text>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 20 },
  closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  postBtn:     { backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  postBtnOff:  { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  postBtnText: { fontSize: 14, fontWeight: '700', color: C.bg },

  typeGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard:       { width: '47%', backgroundColor: C.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border, gap: 4 },
  typeCardActive: { borderColor: C.accent, backgroundColor: C.primary + '40' },
  typeEmoji:      { fontSize: 24, marginBottom: 4 },
  typeLabel:      { fontSize: 13, fontWeight: '700', color: C.muted },
  typeLabelActive:{ color: C.accent },
  typeDesc:       { fontSize: 10, color: C.muted, lineHeight: 14 },

  catchChip:      { alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.border, minWidth: 72 },
  catchChipName:  { fontSize: 11, fontWeight: '600', color: C.text, textAlign: 'center' },
  catchRarityDot: { width: 6, height: 6, borderRadius: 3 },

  input:        { backgroundColor: C.card, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border },
  captionInput: { minHeight: 100, textAlignVertical: 'top' },
  charCount:    { textAlign: 'right', fontSize: 11, color: C.muted, marginTop: 6 },

  cityRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityChip:         { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  cityChipActive:   { backgroundColor: C.primary, borderColor: C.accent },
  cityChipText:     { fontSize: 12, fontWeight: '600', color: C.muted },
  cityChipTextActive:{ color: C.accent },

  privacyNote:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, backgroundColor: C.green + '12', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.green + '30' },
  privacyNoteText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
});
