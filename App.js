import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const C = {
  bg:       '#0D1F16',
  card:     '#1A2E20',
  card2:    '#223B28',
  primary:  '#1B6B3A',
  accent:   '#F4A500',
  text:     '#FFFFFF',
  muted:    '#8FA99A',
  border:   '#2A4A30',
  green:    '#43A047',
  blue:     '#1E88E5',
  red:      '#E53935',
  orange:   '#FB8C00',
};

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function DiscoverScreen() {
  const stats = [
    { label: 'Catches', value: '0', icon: 'paw' },
    { label: 'Total XP', value: '0', icon: 'flash' },
    { label: 'Streak',  value: '0d', icon: 'flame' },
  ];
  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      <View style={s.hero}>
        <Text style={s.heroLeaf}>🌿</Text>
        <Text style={s.heroTitle}>SnapWild</Text>
        <Text style={s.heroSub}>India's Wildlife Discovery Platform</Text>
      </View>

      <View style={s.statsRow}>
        {stats.map(st => (
          <View key={st.label} style={s.statCard}>
            <Ionicons name={st.icon} size={20} color={C.accent} />
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Today's Mission" link="See all" />
      <View style={s.missionCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.missionTitle}>First Catch!</Text>
          <Text style={s.missionSub}>Catch your first animal to get started</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '0%' }]} />
          </View>
          <Text style={s.progressText}>0 / 1 complete</Text>
        </View>
        <View style={s.missionXPBadge}>
          <Text style={s.missionXPNum}>+15</Text>
          <Text style={s.missionXPLabel}>XP</Text>
        </View>
      </View>

      <SectionHeader title="Nearby Sightings" />
      <View style={s.emptyCard}>
        <Ionicons name="location-outline" size={40} color={C.muted} />
        <Text style={s.emptyTitle}>No sightings nearby yet</Text>
        <Text style={s.emptySub}>Be the first to catch a species in your area!</Text>
      </View>
    </ScrollView>
  );
}

function SnapScreen() {
  return (
    <View style={[s.screen, s.center]}>
      <View style={s.snapHero}>
        <View style={s.snapCamCircle}>
          <Ionicons name="camera" size={60} color={C.accent} />
        </View>
        <Text style={s.snapTitle}>Snap & Catch</Text>
        <Text style={s.snapSub}>
          Point your camera at any animal.{'\n'}Vanya will identify it instantly.
        </Text>
      </View>

      <View style={{ width: '100%', paddingHorizontal: 24, gap: 12 }}>
        <TouchableOpacity style={s.btnPrimary}>
          <Ionicons name="camera" size={20} color={C.bg} />
          <Text style={s.btnPrimaryText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline}>
          <Ionicons name="images-outline" size={20} color={C.accent} />
          <Text style={s.btnOutlineText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={s.rarityRow}>
        {[
          { label: 'Common',    color: '#78909C' },
          { label: 'Uncommon',  color: C.green },
          { label: 'Rare',      color: C.blue },
          { label: 'Legendary', color: C.orange },
        ].map(r => (
          <View key={r.label} style={[s.rarityChip, { borderColor: r.color }]}>
            <Text style={[s.rarityText, { color: r.color }]}>{r.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CollectionScreen() {
  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      <View style={s.collectionHeader}>
        <View>
          <Text style={s.collectionTitle}>My Pokédex</Text>
          <Text style={s.collectionSub}>0 species caught</Text>
        </View>
        <View style={s.collectionBadge}>
          <Text style={s.collectionBadgeText}>0 / ???</Text>
        </View>
      </View>

      <View style={s.emptyCard}>
        <Text style={{ fontSize: 52 }}>🦁</Text>
        <Text style={s.emptyTitle}>Your collection is empty</Text>
        <Text style={s.emptySub}>Go outside and snap your first animal!</Text>
      </View>

      <SectionHeader title="Waiting to be caught..." />
      <View style={s.grid}>
        {Array(6).fill(0).map((_, i) => (
          <View key={i} style={s.lockedCard}>
            <Text style={{ fontSize: 34, opacity: 0.12 }}>🐾</Text>
            <Text style={s.lockedLabel}>???</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ProfileScreen() {
  const tracks = [
    { name: 'Hunter XP',   icon: 'trail-sign',      color: C.accent },
    { name: 'Guardian XP', icon: 'shield-checkmark', color: C.green  },
    { name: 'Health XP',   icon: 'heart',            color: C.red    },
    { name: 'Social XP',   icon: 'people',           color: C.blue   },
  ];
  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 110 }}>
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarLetter}>W</Text>
        </View>
        <Text style={s.profileName}>Wildlife Explorer</Text>
        <View style={s.levelBadge}>
          <Ionicons name="flash" size={12} color={C.bg} />
          <Text style={s.levelText}>Level 1</Text>
        </View>
        <View style={s.profileStatsRow}>
          {[
            { val: '0',  label: 'Catches'  },
            { val: '0',  label: 'Rescues'  },
            { val: '0d', label: 'Streak'   },
          ].map((ps, i, arr) => (
            <React.Fragment key={ps.label}>
              <View style={s.profileStat}>
                <Text style={s.profileStatVal}>{ps.val}</Text>
                <Text style={s.profileStatLabel}>{ps.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.profileStatDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <SectionHeader title="XP Tracks" />
      {tracks.map(t => (
        <View key={t.name} style={s.xpCard}>
          <View style={s.xpLeft}>
            <Ionicons name={t.icon} size={18} color={t.color} />
            <Text style={s.xpName}>{t.name}</Text>
          </View>
          <View style={s.xpRight}>
            <View style={[s.xpTrack, { backgroundColor: t.color + '22' }]}>
              <View style={[s.xpFill, { width: '0%', backgroundColor: t.color }]} />
            </View>
            <Text style={[s.xpVal, { color: t.color }]}>0 XP</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function SectionHeader({ title, link }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {link && <Text style={s.sectionLink}>{link}</Text>}
    </View>
  );
}

// ─── CUSTOM TAB BAR ──────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { name: 'Discover',   icon: 'map-outline',    iconFocused: 'map'           },
  { name: 'Snap',       icon: 'camera',          iconFocused: 'camera',   special: true },
  { name: 'Collection', icon: 'grid-outline',    iconFocused: 'grid'          },
  { name: 'Profile',    icon: 'person-outline',  iconFocused: 'person'        },
];

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.tabBar, { paddingBottom: insets.bottom || 10 }]}>
      {state.routes.map((route, index) => {
        const tab = TAB_CONFIG[index];
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (tab.special) {
          return (
            <TouchableOpacity key={route.key} style={s.tabSnapWrap} onPress={onPress} activeOpacity={0.8}>
              <View style={[s.tabSnapBtn, focused && s.tabSnapBtnActive]}>
                <Ionicons name={tab.iconFocused} size={26} color={focused ? C.bg : C.text} />
              </View>
              <Text style={[s.tabLabel, focused && s.tabLabelFocused]}>Snap</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} style={s.tabItem} onPress={onPress} activeOpacity={0.7}>
            <Ionicons
              name={focused ? tab.iconFocused : tab.icon}
              size={22}
              color={focused ? C.accent : C.muted}
            />
            <Text style={[s.tabLabel, focused && s.tabLabelFocused]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={{
            headerStyle:      { backgroundColor: C.bg, elevation: 0, shadowOpacity: 0 },
            headerTintColor:  C.text,
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
            headerTitleAlign: 'left',
          }}
        >
          <Tab.Screen name="Discover"   component={DiscoverScreen}   options={{ headerTitle: '🌿 SnapWild'       }} />
          <Tab.Screen name="Snap"       component={SnapScreen}       options={{ headerTitle: '📸 Snap & Catch'   }} />
          <Tab.Screen name="Collection" component={CollectionScreen} options={{ headerTitle: '🦁 My Collection'  }} />
          <Tab.Screen name="Profile"    component={ProfileScreen}    options={{ headerTitle: '⚡ Profile'         }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  center:  { alignItems: 'center', justifyContent: 'center' },

  // Hero
  hero:      { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  heroLeaf:  { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 30, fontWeight: 'bold', color: C.text, letterSpacing: 1 },
  heroSub:   { fontSize: 13, color: C.muted, marginTop: 4, textAlign: 'center' },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 24,
  },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14, alignItems: 'center',
    paddingVertical: 14, gap: 4, borderWidth: 1, borderColor: C.border,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: C.text },
  statLabel: { fontSize: 11, color: C.muted },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  sectionLink:  { fontSize: 13, color: C.accent },

  // Mission
  missionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: C.border,
  },
  missionTitle:   { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  missionSub:     { fontSize: 12, color: C.muted, marginBottom: 10 },
  progressTrack:  { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:   { height: 6, backgroundColor: C.accent, borderRadius: 3 },
  progressText:   { fontSize: 11, color: C.muted, marginTop: 6 },
  missionXPBadge: {
    backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 8, alignItems: 'center', marginLeft: 12,
  },
  missionXPNum:   { fontSize: 18, fontWeight: 'bold', color: C.accent },
  missionXPLabel: { fontSize: 10, color: C.muted },

  // Empty
  emptyCard: {
    backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8, marginBottom: 24, borderWidth: 1, borderColor: C.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  emptySub:   { fontSize: 12, color: C.muted, textAlign: 'center' },

  // Snap Screen
  snapHero: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 36 },
  snapCamCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    borderWidth: 2, borderColor: C.accent,
  },
  snapTitle: { fontSize: 26, fontWeight: 'bold', color: C.text, marginBottom: 8 },
  snapSub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, gap: 10,
  },
  btnPrimaryText: { fontSize: 16, fontWeight: 'bold', color: C.bg },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: C.accent, borderRadius: 14, paddingVertical: 14, gap: 10,
  },
  btnOutlineText: { fontSize: 16, fontWeight: '600', color: C.accent },

  rarityRow: {
    flexDirection: 'row', gap: 8, marginTop: 28, paddingHorizontal: 24, flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rarityChip: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  rarityText: { fontSize: 11, fontWeight: '600' },

  // Collection
  collectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    margin: 16, marginBottom: 12,
  },
  collectionTitle: { fontSize: 22, fontWeight: 'bold', color: C.text },
  collectionSub:   { fontSize: 13, color: C.muted },
  collectionBadge: {
    backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  collectionBadgeText: { color: C.accent, fontWeight: 'bold', fontSize: 13 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 10,
  },
  lockedCard: {
    width: (width - 52) / 3, backgroundColor: C.card, borderRadius: 12,
    aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  lockedLabel: { fontSize: 11, color: C.muted, marginTop: 4 },

  // Profile
  profileCard: {
    backgroundColor: C.card, margin: 16, borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: C.accent,
  },
  avatarLetter:   { fontSize: 30, fontWeight: 'bold', color: C.text },
  profileName:    { fontSize: 18, fontWeight: 'bold', color: C.text, marginBottom: 8 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, gap: 4, marginBottom: 20,
  },
  levelText: { fontSize: 12, fontWeight: 'bold', color: C.bg },
  profileStatsRow: {
    flexDirection: 'row', width: '100%', justifyContent: 'space-around',
  },
  profileStat:      { alignItems: 'center', flex: 1 },
  profileStatVal:   { fontSize: 20, fontWeight: 'bold', color: C.text },
  profileStatLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: C.border },

  xpCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  xpLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, width: 120 },
  xpName:  { fontSize: 13, fontWeight: '600', color: C.text },
  xpRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  xpFill:  { height: 6, borderRadius: 3 },
  xpVal:   { fontSize: 12, fontWeight: '700', width: 40, textAlign: 'right' },

  // Tab Bar
  tabBar: {
    flexDirection: 'row', backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingBottom: 4,
  },
  tabLabel:        { fontSize: 10, color: C.muted, fontWeight: '600' },
  tabLabelFocused: { color: C.accent },

  tabSnapWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingBottom: 4 },
  tabSnapBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
    borderWidth: 2, borderColor: C.border,
    transform: [{ translateY: -10 }],
  },
  tabSnapBtnActive: {
    backgroundColor: C.accent, borderColor: C.accent,
  },
});
