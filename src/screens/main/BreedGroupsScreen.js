import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePetStore, { SPECIES_EMOJI, getBreedGroups } from '../../store/usePetStore';
import { C } from '../../theme/colors';

const GROUP_BG = {
  Dog:    C.accent  + '20',
  Cat:    C.blue    + '20',
  Bird:   C.green   + '20',
  Rabbit: C.orange  + '20',
  Fish:   C.blue    + '25',
  Reptile:C.green   + '25',
  Other:  C.gray    + '20',
};
const GROUP_COLOR = {
  Dog: C.accent, Cat: C.blue, Bird: C.green,
  Rabbit: C.orange, Fish: C.blue, Reptile: C.green, Other: C.gray,
};

export default function BreedGroupsScreen({ navigation }) {
  const insets  = useSafeAreaInsets();
  const myPets  = usePetStore(s => s.myPets);
  const follows = usePetStore(s => s.follows);

  const [query,    setQuery]    = React.useState('');
  const [expanded, setExpanded] = React.useState(null);

  const groups = React.useMemo(() => getBreedGroups(myPets), [myPets]);

  const filtered = query.trim()
    ? groups.filter(g =>
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.breed.toLowerCase().includes(query.toLowerCase())
      )
    : groups;

  function isMember(group) {
    return myPets.some(p => p.species === group.species && p.breed === group.breed);
  }

  function toggle(id) {
    setExpanded(prev => (prev === id ? null : id));
    Haptics.selectionAsync();
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>🐾 Breed Communities</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color={C.muted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search breed or species…"
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Stats banner */}
        <View style={s.statsBanner}>
          <StatPill icon="people" value={groups.reduce((a, g) => a + g.members.length, 0)} label="pets nearby" />
          <StatPill icon="paw" value={groups.length} label="breed groups" />
          <StatPill icon="location" value={new Set(groups.map(g => g.city)).size} label="cities" />
        </View>

        {filtered.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={s.emptyTitle}>No groups found</Text>
            <Text style={s.emptyText}>Try a different breed name</Text>
          </View>
        )}

        {filtered.map(group => {
          const isOpen   = expanded === group.id;
          const member   = isMember(group);
          const color    = GROUP_COLOR[group.species] ?? C.muted;
          const bg       = GROUP_BG[group.species]    ?? C.card;

          return (
            <View key={group.id} style={s.groupCard}>
              {/* Group header row */}
              <TouchableOpacity
                style={s.groupHeader}
                activeOpacity={0.8}
                onPress={() => toggle(group.id)}
              >
                <View style={[s.groupEmojiBox, { backgroundColor: bg }]}>
                  <Text style={{ fontSize: 26 }}>{SPECIES_EMOJI[group.species] ?? '🐾'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.groupNameRow}>
                    <Text style={s.groupName}>{group.name}</Text>
                    {member && (
                      <View style={[s.memberBadge, { backgroundColor: color + '30', borderColor: color }]}>
                        <Text style={[s.memberBadgeText, { color }]}>You're in!</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.groupMeta}>
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''} · {group.city}
                  </Text>
                </View>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={C.muted}
                />
              </TouchableOpacity>

              {/* Expanded members list */}
              {isOpen && (
                <View style={s.membersList}>
                  <View style={s.divider} />
                  {group.members.map((pet, i) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[s.memberRow, i > 0 && s.memberRowBorder]}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('PetProfile', { pet })}
                    >
                      <View style={s.memberEmojiBox}>
                        <Text style={{ fontSize: 20 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.memberName}>{pet.name}</Text>
                        <Text style={s.memberSub}>
                          {pet.breed} · @{pet.owner?.username ?? 'You'}
                          {pet.owner?.distance != null ? ` · ${pet.owner.distance} km` : ''}
                        </Text>
                      </View>
                      <View style={s.tagsRow}>
                        {pet.temperament.slice(0, 2).map(t => (
                          <View key={t} style={[s.tag, { backgroundColor: color + '20' }]}>
                            <Text style={[s.tagText, { color }]}>{t}</Text>
                          </View>
                        ))}
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={C.muted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <View style={s.statPill}>
      <Ionicons name={icon} size={14} color={C.accent} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

  searchBox:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },

  statsBanner: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statPill:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.border },
  statValue:   { fontSize: 15, fontWeight: '800', color: C.text },
  statLabel:   { fontSize: 10, color: C.muted },

  groupCard:      { backgroundColor: C.card, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  groupHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  groupEmojiBox:  { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  groupNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  groupName:      { fontSize: 14, fontWeight: '700', color: C.text },
  groupMeta:      { fontSize: 12, color: C.muted, marginTop: 2 },
  memberBadge:    { borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  memberBadgeText:{ fontSize: 10, fontWeight: '700' },

  membersList:    { paddingHorizontal: 14, paddingBottom: 8 },
  divider:        { height: 1, backgroundColor: C.border, marginBottom: 8 },
  memberRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  memberRowBorder:{ borderTopWidth: 1, borderTopColor: C.border },
  memberEmojiBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  memberName:     { fontSize: 13, fontWeight: '700', color: C.text },
  memberSub:      { fontSize: 11, color: C.muted },
  tagsRow:        { flexDirection: 'row', gap: 4 },
  tag:            { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText:        { fontSize: 10, fontWeight: '600' },

  emptyBox:   { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  emptyText:  { fontSize: 13, color: C.muted },
});
