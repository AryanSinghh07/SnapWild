import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useRescueStore from '../../store/useRescueStore';
import { C } from '../../theme/colors';

const TABS = ['Feed', 'Map', 'Vet Guide'];

const SEV_COLOR = { High: C.red, Medium: C.orange, Low: C.green };
const SEV_ICON  = { High: 'alert-circle', Medium: 'warning', Low: 'information-circle' };
const STATUS_LABEL = { pending: 'Needs Help', 'in-progress': 'Help Coming', resolved: 'Resolved' };
const STATUS_COLOR = { pending: C.red, 'in-progress': C.orange, resolved: C.green };

const INDIA = { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 18, longitudeDelta: 18 };

function timeAgo(iso) {
  const mins = (Date.now() - new Date(iso)) / 60000;
  if (mins < 60)   return `${Math.floor(Math.max(mins, 1))}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function RescueAlertsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab,  setTab]  = React.useState('Feed');

  const reports        = useRescueStore(s => s.reports);
  const guardianXP     = useRescueStore(s => s.guardianXP);
  const respondToReport= useRescueStore(s => s.respondToReport);
  const markResolved   = useRescueStore(s => s.markResolved);
  const hasResponded   = useRescueStore(s => s.hasResponded);

  const active   = reports.filter(r => r.status !== 'resolved');
  const resolved = reports.filter(r => r.status === 'resolved');

  function callNgo(phone) {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Cannot Call', 'Please dial the number manually: ' + phone)
    );
  }

  function handleRespond(id) {
    respondToReport(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Thank you! 🙏', "Your response has been logged. You earned +20 Guardian XP. Please approach cautiously and contact the NGO for guidance.");
  }

  function handleResolved(report) {
    Alert.alert(
      'Mark as Resolved?',
      `Is the ${report.species} now safe or with a rescuer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Resolved',
          onPress: () => {
            markResolved(report.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Rescue Alerts</Text>
          <Text style={s.headerSub}>{active.length} active · Guardian XP: {guardianXP}</Text>
        </View>
        <TouchableOpacity
          style={s.reportBtn}
          onPress={() => navigation.navigate('ReportInjured')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={C.bg} />
          <Text style={s.reportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tabPill, tab === t && s.tabPillActive]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === 'Feed' ? 'list-outline' : 'map-outline'}
              size={14}
              color={tab === t ? C.accent : C.muted}
            />
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── FEED TAB ── */}
      {tab === 'Feed' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Guardian XP banner */}
          {guardianXP > 0 && (
            <View style={s.xpBanner}>
              <Ionicons name="shield-checkmark" size={18} color={C.green} />
              <Text style={s.xpBannerText}>You've earned <Text style={{ color: C.green, fontWeight: '700' }}>{guardianXP} Guardian XP</Text> from rescue actions</Text>
            </View>
          )}

          {active.length === 0 && (
            <View style={s.emptyCard}>
              <Text style={{ fontSize: 40 }}>🌿</Text>
              <Text style={s.emptyTitle}>No active alerts nearby</Text>
              <Text style={s.emptySubtitle}>If you spot an injured animal, tap Report to alert the community.</Text>
            </View>
          )}

          {active.map(r => (
            <AlertCard
              key={r.id}
              report={r}
              responded={hasResponded(r.id)}
              onCall={() => callNgo(r.ngo.phone)}
              onRespond={() => handleRespond(r.id)}
              onResolved={() => handleResolved(r)}
            />
          ))}

          {resolved.length > 0 && (
            <>
              <View style={s.sectionLabel}>
                <Ionicons name="checkmark-circle" size={14} color={C.green} />
                <Text style={[s.sectionLabelText, { color: C.green }]}>Resolved ({resolved.length})</Text>
              </View>
              {resolved.map(r => (
                <AlertCard key={r.id} report={r} resolved responded={hasResponded(r.id)} onCall={() => callNgo(r.ngo.phone)} />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* ── VET GUIDE TAB (4.4.6) ── */}
      {tab === 'Vet Guide' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <View style={s.vetHeader}>
            <Ionicons name="medkit" size={22} color={C.green} />
            <View style={{ flex: 1 }}>
              <Text style={s.vetHeaderTitle}>Wildlife First Aid Guide</Text>
              <Text style={s.vetHeaderSub}>Species-specific advice from wildlife vets</Text>
            </View>
          </View>
          {VET_CARDS.map(card => <VetCard key={card.species} card={card} />)}
          <View style={s.vetDisclaimer}>
            <Ionicons name="information-circle-outline" size={14} color={C.muted} />
            <Text style={s.vetDisclaimerText}>
              This is a quick-reference guide only. Always contact a licensed wildlife vet or NGO for professional assistance.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── MAP TAB ── */}
      {tab === 'Map' && (
        <View style={{ flex: 1 }}>
          <MapView style={StyleSheet.absoluteFill} initialRegion={INDIA}>
            {reports.map(r => (
              <Marker
                key={r.id}
                coordinate={{ latitude: r.location.lat, longitude: r.location.lng }}
                title={`${r.emoji} ${r.species}`}
                description={`${r.injuryType} · ${r.severity} severity · ${STATUS_LABEL[r.status]}`}
                pinColor={SEV_COLOR[r.severity] ?? C.orange}
              />
            ))}
          </MapView>

          {/* Map legend */}
          <View style={[s.mapLegend, { bottom: insets.bottom + 90 }]}>
            {Object.entries(SEV_COLOR).map(([sev, col]) => (
              <View key={sev} style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor: col }]} />
                <Text style={s.legendText}>{sev}</Text>
              </View>
            ))}
          </View>

          {/* Report FAB */}
          <TouchableOpacity
            style={[s.mapFab, { bottom: insets.bottom + 90 }]}
            onPress={() => navigation.navigate('ReportInjured')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color={C.bg} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const VET_CARDS = [
  {
    species: 'Dogs & Cats',
    emoji: '🐕',
    safeDistance: '1–2 metres',
    doList:  ['Approach slowly from the side', 'Cover with a light cloth to calm', 'Call PETA/Friendicoes immediately', 'Keep water nearby but do not force-feed'],
    dontList:['Do NOT pick up by the scruff', 'Do NOT muzzle if breathing is laboured', 'Do NOT give human medication'],
    emergency: 'Friendicoes: +91-11-2461-0942',
  },
  {
    species: 'Birds',
    emoji: '🐦',
    safeDistance: '0.5 metres',
    doList:  ['Place in a dark, ventilated cardboard box', 'Keep warm and quiet', 'Contact local bird rescue within 1 hour', 'Place near window if stunned by glass'],
    dontList:['Do NOT give water by dropper — aspiration risk', 'Do NOT handle wings unless visibly broken', 'Do NOT release at night'],
    emergency: 'CARE Bangalore: +91-80-2337-9133',
  },
  {
    species: 'Snakes',
    emoji: '🐍',
    safeDistance: '3 metres minimum',
    doList:  ['Keep bystanders back — at least 3 metres', 'Note colour and markings for vet', 'Call Snake Helpline immediately', 'Keep the victim calm and still if bitten'],
    dontList:['Do NOT attempt to pick up even if "dead"', 'Do NOT cut the bite or suck venom', 'Do NOT give alcohol or pain killers'],
    emergency: 'Snake Helpline: 9300-999-000',
  },
  {
    species: 'Deer & Antelope',
    emoji: '🦌',
    safeDistance: '5 metres',
    doList:  ['Contact Forest Department immediately', 'Reduce noise around the animal', 'Block roads to prevent further injury', 'If orphaned fawn: cover with cloth, call NGO'],
    dontList:['Do NOT chase or corner the animal', 'Do NOT offer food', 'Do NOT attempt to carry alone — severe kick risk'],
    emergency: 'Forest Dept Helpline: 1926',
  },
  {
    species: 'Monkeys',
    emoji: '🐒',
    safeDistance: '3 metres',
    doList:  ['Keep crowds away immediately', 'Call Wildlife SOS', 'Provide water at safe distance if injured', 'Note if mother–infant pair'],
    dontList:['Do NOT offer food — bite risk', 'Do NOT attempt to restrain', 'Do NOT make eye contact directly'],
    emergency: 'Wildlife SOS: +91-8888-9000-90',
  },
  {
    species: 'Large Wildlife (Elephant/Tiger/Leopard)',
    emoji: '🐘',
    safeDistance: '50 metres minimum',
    doList:  ['Call Forest Department immediately: 1926', 'Block roads, clear civilians', 'Keep engine off and stay inside vehicle', 'Inform local village panchayat'],
    dontList:['Do NOT approach under any circumstances', 'Do NOT use flash photography', 'Do NOT block escape routes'],
    emergency: 'Forest Dept Emergency: 1926',
  },
];

function VetCard({ card }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <TouchableOpacity
      style={s.vetCard}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={s.vetCardHeader}>
        <Text style={{ fontSize: 26 }}>{card.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.vetCardTitle}>{card.species}</Text>
          <Text style={s.vetCardDist}>Safe distance: {card.safeDistance}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
      </View>
      {expanded && (
        <View style={s.vetCardBody}>
          <Text style={s.vetListLabel}>✅ Do</Text>
          {card.doList.map((d, i) => (
            <View key={i} style={s.vetListRow}>
              <View style={[s.vetDot, { backgroundColor: C.green }]} />
              <Text style={s.vetListText}>{d}</Text>
            </View>
          ))}
          <Text style={[s.vetListLabel, { color: C.red, marginTop: 10 }]}>❌ Don't</Text>
          {card.dontList.map((d, i) => (
            <View key={i} style={s.vetListRow}>
              <View style={[s.vetDot, { backgroundColor: C.red }]} />
              <Text style={s.vetListText}>{d}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={s.vetCallBtn}
            onPress={() => {
              const num = card.emergency.match(/[\d\-+]+/)?.[0];
              if (num) Linking.openURL(`tel:${num.replace(/-/g, '')}`);
            }}
          >
            <Ionicons name="call" size={14} color={C.bg} />
            <Text style={s.vetCallBtnText}>{card.emergency}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function AlertCard({ report: r, responded, resolved, onCall, onRespond, onResolved }) {
  const sevColor = SEV_COLOR[r.severity] ?? C.orange;
  const sevIcon  = SEV_ICON[r.severity]  ?? 'warning';

  return (
    <View style={[s.card, resolved && { opacity: 0.65 }]}>
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={[s.speciesCircle, { backgroundColor: sevColor + '20' }]}>
          <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardSpecies}>{r.species}</Text>
          <Text style={s.cardMeta}>
            📍 {r.location.area}, {r.location.city} · {timeAgo(r.reportedAt)}
          </Text>
        </View>
        <View style={[s.sevBadge, { backgroundColor: sevColor + '20', borderColor: sevColor + '60' }]}>
          <Ionicons name={sevIcon} size={11} color={sevColor} />
          <Text style={[s.sevBadgeText, { color: sevColor }]}>{r.severity}</Text>
        </View>
      </View>

      {/* Status + injury type */}
      <View style={s.statusRow}>
        <View style={[s.statusPill, { backgroundColor: STATUS_COLOR[r.status] + '20' }]}>
          <Text style={[s.statusText, { color: STATUS_COLOR[r.status] }]}>{STATUS_LABEL[r.status]}</Text>
        </View>
        <View style={s.injuryPill}>
          <Text style={s.injuryText}>{r.injuryType}</Text>
        </View>
        {r.responders > 0 && (
          <View style={s.respondersPill}>
            <Ionicons name="walk-outline" size={11} color={C.muted} />
            <Text style={s.respondersText}>{r.responders} heading</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={s.cardDesc} numberOfLines={2}>{r.description}</Text>

      {/* NGO suggestion */}
      <TouchableOpacity style={s.ngoCard} onPress={onCall} activeOpacity={0.8}>
        <View style={s.ngoLeft}>
          <Ionicons name="medkit" size={14} color={C.green} />
          <View>
            <Text style={s.ngoName}>{r.ngo.name}</Text>
            <Text style={s.ngoPhone}>{r.ngo.phone}</Text>
          </View>
        </View>
        <View style={s.callBtn}>
          <Ionicons name="call" size={14} color={C.bg} />
          <Text style={s.callBtnText}>Call</Text>
        </View>
      </TouchableOpacity>

      {/* Action buttons */}
      {!resolved && (
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.headingBtn, responded && s.headingBtnDone]}
            onPress={onRespond}
            disabled={responded}
            activeOpacity={0.8}
          >
            <Ionicons name={responded ? 'checkmark-circle' : 'walk-outline'} size={16} color={responded ? C.green : C.text} />
            <Text style={[s.headingBtnText, responded && { color: C.green }]}>
              {responded ? "I'm heading there ✓" : "I'm heading there"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.resolvedBtn} onPress={onResolved} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={14} color={C.muted} />
            <Text style={s.resolvedBtnText}>Resolved</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: C.text },
  headerSub:     { fontSize: 12, color: C.muted, marginTop: 1 },
  reportBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.red, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  reportBtnText: { fontSize: 13, fontWeight: '700', color: C.bg },

  tabRow:        { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border },
  tabPill:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 11 },
  tabPillActive: { backgroundColor: C.primary },
  tabText:       { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.accent },

  xpBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, backgroundColor: C.green + '15', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.green + '40' },
  xpBannerText: { flex: 1, fontSize: 13, color: C.text },

  emptyCard:     { alignItems: 'center', gap: 10, backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 32, borderWidth: 1, borderColor: C.border },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: C.text },
  emptySubtitle: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },

  sectionLabel:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginVertical: 12 },
  sectionLabelText: { fontSize: 13, fontWeight: '700' },

  card: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 14 },

  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  speciesCircle:{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardSpecies:  { fontSize: 15, fontWeight: '700', color: C.text },
  cardMeta:     { fontSize: 11, color: C.muted, marginTop: 2 },
  sevBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  sevBadgeText: { fontSize: 10, fontWeight: '700' },

  statusRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statusPill:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  injuryPill:   { backgroundColor: C.card2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  injuryText:   { fontSize: 11, color: C.muted, fontWeight: '600' },
  respondersPill:{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.card2, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  respondersText:{ fontSize: 11, color: C.muted },

  cardDesc: { fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 10 },

  ngoCard:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.green + '12', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: C.green + '30' },
  ngoLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ngoName:    { fontSize: 13, fontWeight: '700', color: C.text },
  ngoPhone:   { fontSize: 11, color: C.muted },
  callBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.green, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  callBtnText:{ fontSize: 12, fontWeight: '700', color: C.bg },

  actionRow:        { flexDirection: 'row', gap: 8 },
  headingBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 10 },
  headingBtnDone:   { backgroundColor: C.green + '20', borderWidth: 1, borderColor: C.green + '40' },
  headingBtnText:   { fontSize: 13, fontWeight: '700', color: C.text },
  resolvedBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.card2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  resolvedBtnText:  { fontSize: 13, fontWeight: '600', color: C.muted },

  mapLegend:   { position: 'absolute', left: 16, backgroundColor: C.card + 'DD', borderRadius: 12, padding: 10, gap: 6, borderWidth: 1, borderColor: C.border },
  legendRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { fontSize: 11, color: C.text, fontWeight: '600' },
  mapFab:      { position: 'absolute', right: 16, width: 52, height: 52, borderRadius: 26, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },

  vetHeader:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.green + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.green + '30' },
  vetHeaderTitle:  { fontSize: 15, fontWeight: '700', color: C.text },
  vetHeaderSub:    { fontSize: 12, color: C.muted, marginTop: 2 },

  vetCard:       { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  vetCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  vetCardTitle:  { fontSize: 14, fontWeight: '700', color: C.text },
  vetCardDist:   { fontSize: 11, color: C.muted, marginTop: 2 },
  vetCardBody:   { borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 10 },
  vetListLabel:  { fontSize: 12, fontWeight: '700', color: C.green, marginBottom: 8 },
  vetListRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  vetDot:        { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  vetListText:   { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
  vetCallBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.green, borderRadius: 10, paddingVertical: 10, marginTop: 10 },
  vetCallBtnText:{ fontSize: 13, fontWeight: '700', color: C.bg },

  vetDisclaimer:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, marginTop: 8, backgroundColor: C.card2, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  vetDisclaimerText: { flex: 1, fontSize: 11, color: C.muted, lineHeight: 17 },
});
