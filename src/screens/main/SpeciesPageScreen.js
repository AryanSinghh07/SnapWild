import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCatchStore   from '../../store/useCatchStore';
import useSocialStore  from '../../store/useSocialStore';
import { C } from '../../theme/colors';

const RARITY_COLOR = { Common: C.gray, Uncommon: C.green, Rare: C.blue, Legendary: C.orange };

const IUCN_STATUS = {
  'Bengal Tiger':            { status: 'Endangered',       code: 'EN', color: '#E53935', icon: '🔴' },
  'Indian Elephant':         { status: 'Endangered',       code: 'EN', color: '#E53935', icon: '🔴' },
  'Snow Leopard':            { status: 'Vulnerable',       code: 'VU', color: '#FB8C00', icon: '🟠' },
  'King Cobra':              { status: 'Vulnerable',       code: 'VU', color: '#FB8C00', icon: '🟠' },
  'Sloth Bear':              { status: 'Vulnerable',       code: 'VU', color: '#FB8C00', icon: '🟠' },
  'Indian Leopard':          { status: 'Vulnerable',       code: 'VU', color: '#FB8C00', icon: '🟠' },
  'Malabar Pied Hornbill':   { status: 'Near Threatened',  code: 'NT', color: '#FDD835', icon: '🟡' },
  'Indian Peacock':          { status: 'Least Concern',    code: 'LC', color: C.green,   icon: '🟢' },
  'Spotted Deer':            { status: 'Least Concern',    code: 'LC', color: C.green,   icon: '🟢' },
  'Indian Roller':           { status: 'Least Concern',    code: 'LC', color: C.green,   icon: '🟢' },
  'Indian Monkey':           { status: 'Least Concern',    code: 'LC', color: C.green,   icon: '🟢' },
};

const CONSERVATION_TIPS = {
  EN: 'This species is endangered. Avoid habitat destruction and report illegal wildlife trade to forest authorities.',
  VU: 'This species is vulnerable. Support local conservation NGOs and avoid disturbing their natural habitat.',
  NT: 'This species is near threatened. Habitat preservation and responsible wildlife tourism help protect them.',
  LC: 'This species is least concern but still needs protection. Keep habitats clean and avoid feeding wildlife.',
};

function iucnFor(species) {
  for (const [key, val] of Object.entries(IUCN_STATUS)) {
    if (species.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(species.toLowerCase())) {
      return val;
    }
  }
  return { status: 'Data Deficient', code: 'DD', color: C.muted, icon: '⚪' };
}

function timeAgo(iso) {
  const mins = (Date.now() - new Date(iso)) / 60000;
  if (mins < 60) return `${Math.floor(Math.max(mins, 1))}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function SpeciesPageScreen({ route, navigation }) {
  const { species, emoji = '🐾', rarity = 'Common', scientific = '' } = route.params ?? {};
  const insets  = useSafeAreaInsets();

  const catches          = useCatchStore(s => s.catches);
  const posts            = useSocialStore(s => s.posts);
  const followedSpecies  = useSocialStore(s => s.followedSpecies);
  const followSpecies    = useSocialStore(s => s.followSpecies);
  const isFollowing      = followedSpecies.includes(species);

  const rarityColor = RARITY_COLOR[rarity] ?? C.gray;
  const iucn        = iucnFor(species);

  const myCatches = catches.filter(c =>
    c.name?.toLowerCase() === species?.toLowerCase()
  );

  const communityPosts = posts.filter(p =>
    p.species?.toLowerCase().includes(species?.toLowerCase()) ||
    species?.toLowerCase().includes(p.species?.toLowerCase())
  );

  const totalSpotters = communityPosts.reduce(
    (sum, p) => sum + (p.spottedBy?.length ?? 0), 0
  );

  const totalSightings = myCatches.length + communityPosts.length;

  const topSpotters = React.useMemo(() => {
    const counts = {};
    communityPosts.forEach(p => {
      counts[p.username] = (counts[p.username] ?? 0) + 1 + (p.spottedBy?.length ?? 0);
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, score]) => ({ name, score }));
  }, [communityPosts]);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{species}</Text>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => Linking.openURL(`https://en.wikipedia.org/wiki/${species?.replace(/ /g, '_')}`)}
        >
          <Ionicons name="open-outline" size={20} color={C.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Hero */}
        <View style={[s.hero, { borderColor: rarityColor + '40' }]}>
          <Text style={s.heroEmoji}>{emoji}</Text>
          <Text style={s.heroName}>{species}</Text>
          {!!scientific && <Text style={s.heroSci}>{scientific}</Text>}
          <TouchableOpacity
            style={[s.followBtn, isFollowing && { backgroundColor: rarityColor, borderColor: rarityColor }]}
            onPress={() => followSpecies(species)}
            activeOpacity={0.85}
          >
            <Ionicons name={isFollowing ? 'checkmark' : 'add'} size={14} color={isFollowing ? C.bg : rarityColor} />
            <Text style={[s.followBtnText, isFollowing && { color: C.bg }]}>
              {isFollowing ? 'Following' : 'Follow Species'}
            </Text>
          </TouchableOpacity>
          <View style={s.heroBadges}>
            <View style={[s.rarityBadge, { backgroundColor: rarityColor + '20', borderColor: rarityColor + '50' }]}>
              <Text style={[s.rarityBadgeText, { color: rarityColor }]}>{rarity}</Text>
            </View>
            <View style={[s.iucnBadge, { backgroundColor: iucn.color + '20', borderColor: iucn.color + '50' }]}>
              <Text style={s.iucnIcon}>{iucn.icon}</Text>
              <Text style={[s.iucnBadgeText, { color: iucn.color }]}>{iucn.status}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <StatBox icon="eye-outline"    value={totalSightings} label="Total Sightings" color={C.accent} />
          <StatBox icon="people-outline" value={totalSpotters}  label="Spotters"        color={C.blue}   />
          <StatBox icon="chatbubble-outline" value={communityPosts.reduce((s, p) => s + p.comments, 0)} label="Comments" color={C.green} />
        </View>

        {/* My Catches */}
        {myCatches.length > 0 ? (
          <Section title={`My Catches (${myCatches.length})`}>
            {myCatches.map(c => (
              <View key={c.id} style={s.myCatchRow}>
                <View style={[s.myCatchDot, { backgroundColor: rarityColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.myCatchDate}>{timeAgo(c.caughtAt)}</Text>
                  {!!c.location && <Text style={s.myCatchLoc}>📍 {c.location}</Text>}
                </View>
                <View style={s.xpBadge}>
                  <Ionicons name="flash" size={11} color={C.accent} />
                  <Text style={s.xpBadgeText}>+{c.xp} XP</Text>
                </View>
              </View>
            ))}
          </Section>
        ) : (
          <View style={s.notCaughtCard}>
            <Text style={s.notCaughtEmoji}>📷</Text>
            <Text style={s.notCaughtTitle}>You haven't caught this species yet</Text>
            <TouchableOpacity
              style={s.snapBtn}
              onPress={() => navigation.navigate('SnapHome')}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={15} color={C.bg} />
              <Text style={s.snapBtnText}>Go Snap One</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conservation */}
        <Section title="Conservation Status">
          <View style={[s.conservationCard, { backgroundColor: iucn.color + '10', borderColor: iucn.color + '30' }]}>
            <View style={s.conservationHeader}>
              <Text style={s.conservationEmoji}>{iucn.icon}</Text>
              <View>
                <Text style={[s.conservationStatus, { color: iucn.color }]}>{iucn.status}</Text>
                <Text style={s.conservationCode}>IUCN Red List · {iucn.code}</Text>
              </View>
            </View>
            <Text style={s.conservationTip}>{CONSERVATION_TIPS[iucn.code] ?? CONSERVATION_TIPS.LC}</Text>
          </View>
        </Section>

        {/* Community Posts */}
        {communityPosts.length > 0 && (
          <Section title={`Community Posts (${communityPosts.length})`}>
            {communityPosts.map(p => (
              <TouchableOpacity
                key={p.id}
                style={s.communityPost}
                onPress={() => navigation.navigate('PostDetail', { postId: p.id })}
                activeOpacity={0.85}
              >
                <View style={[s.postAvatar, { backgroundColor: C.primary }]}>
                  <Text style={s.postAvatarLetter}>{p.username[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.postUsername}>{p.username}</Text>
                  <Text style={s.postCaption} numberOfLines={2}>{p.caption}</Text>
                  <Text style={s.postMeta}>📍 {p.location} · {timeAgo(p.createdAt)}</Text>
                </View>
                <View style={s.postActions}>
                  <Ionicons name="eye-outline" size={13} color={C.muted} />
                  <Text style={s.postStat}>{p.spottedBy?.length ?? 0}</Text>
                  <Ionicons name="chatbubble-outline" size={12} color={C.muted} style={{ marginLeft: 6 }} />
                  <Text style={s.postStat}>{p.comments}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Section>
        )}

        {/* Top Spotters */}
        {topSpotters.length > 0 && (
          <Section title="Top Spotters">
            {topSpotters.map((sp, i) => (
              <View key={sp.name} style={s.spotterRow}>
                <Text style={s.spotterRank}>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</Text>
                <View style={[s.spotterAvatar, { backgroundColor: C.primary }]}>
                  <Text style={s.spotterAvatarLetter}>{sp.name[0].toUpperCase()}</Text>
                </View>
                <Text style={s.spotterName}>{sp.name}</Text>
                <Text style={s.spotterScore}>{sp.score} pts</Text>
              </View>
            ))}
          </Section>
        )}

      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatBox({ icon, value, label, color }) {
  return (
    <View style={s.statBox}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text, textAlign: 'center', marginHorizontal: 8 },

  hero: {
    marginHorizontal: 16, backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, padding: 24, alignItems: 'center', gap: 6, marginBottom: 16,
  },
  heroEmoji:   { fontSize: 64, marginBottom: 4 },
  heroName:    { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center' },
  heroSci:      { fontSize: 13, color: C.muted, fontStyle: 'italic', textAlign: 'center' },
  followBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 7 },
  followBtnText:{ fontSize: 13, fontWeight: '700' },
  heroBadges:  { flexDirection: 'row', gap: 8, marginTop: 6 },
  rarityBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4 },
  rarityBadgeText: { fontSize: 12, fontWeight: '700' },
  iucnBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  iucnIcon:    { fontSize: 12 },
  iucnBadgeText: { fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16 },
  statBox:  { flex: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center', gap: 4 },
  statValue:{ fontSize: 22, fontWeight: '800' },
  statLabel:{ fontSize: 10, color: C.muted, fontWeight: '600', textAlign: 'center' },

  section:      { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12 },

  myCatchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  myCatchDot: { width: 10, height: 10, borderRadius: 5 },
  myCatchDate:{ fontSize: 13, fontWeight: '600', color: C.text },
  myCatchLoc: { fontSize: 11, color: C.muted, marginTop: 2 },
  xpBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.accent + '20', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  xpBadgeText:{ fontSize: 11, fontWeight: '700', color: C.accent },

  notCaughtCard: { marginHorizontal: 16, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center', gap: 8, marginBottom: 16 },
  notCaughtEmoji:{ fontSize: 36 },
  notCaughtTitle:{ fontSize: 14, color: C.muted, textAlign: 'center' },
  snapBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accent, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  snapBtnText:   { fontSize: 14, fontWeight: '700', color: C.bg },

  conservationCard:   { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  conservationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  conservationEmoji:  { fontSize: 28 },
  conservationStatus: { fontSize: 15, fontWeight: '700' },
  conservationCode:   { fontSize: 11, color: C.muted, marginTop: 2 },
  conservationTip:    { fontSize: 13, color: C.muted, lineHeight: 20 },

  communityPost: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  postAvatar:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  postAvatarLetter: { fontSize: 15, fontWeight: '700', color: C.text },
  postUsername:  { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 3 },
  postCaption:   { fontSize: 12, color: C.muted, lineHeight: 17, marginBottom: 4 },
  postMeta:      { fontSize: 10, color: C.muted },
  postActions:   { flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 2 },
  postStat:      { fontSize: 11, color: C.muted, marginRight: 2 },

  spotterRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  spotterRank:        { fontSize: 18, width: 28, textAlign: 'center' },
  spotterAvatar:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  spotterAvatarLetter:{ fontSize: 15, fontWeight: '700', color: C.text },
  spotterName:        { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  spotterScore:       { fontSize: 13, fontWeight: '700', color: C.accent },
});
