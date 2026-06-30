import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions,
} from 'react-native';
import { Pedometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as Speech  from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useHealthStore from '../../store/useHealthStore';
import useCatchStore  from '../../store/useCatchStore';
import { C } from '../../theme/colors';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 80;

const MOODS = [
  { emoji: '😔', label: 'Low',     score: 1 },
  { emoji: '😐', label: 'Okay',    score: 2 },
  { emoji: '🙂', label: 'Good',    score: 3 },
  { emoji: '😊', label: 'Great',   score: 4 },
  { emoji: '🤩', label: 'Amazing', score: 5 },
];

function scoreColor(score) {
  if (score >= 80) return C.green;
  if (score >= 50) return C.accent;
  if (score >= 25) return C.orange;
  return C.red;
}

export default function HealthScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const getToday       = useHealthStore(s => s.getToday);
  const getNatureScore = useHealthStore(s => s.getNatureScore);
  const getWeeklyStats = useHealthStore(s => s.getWeeklyStats);
  const logMood        = useHealthStore(s => s.logMood);
  const startSession   = useHealthStore(s => s.startSession);
  const endSession     = useHealthStore(s => s.endSession);
  const setTodaySteps  = useHealthStore(s => s.setTodaySteps);
  const sessionStart   = useHealthStore(s => s.sessionStart);

  const catches        = useCatchStore(s => s.catches);

  const today          = getToday();
  const todayCatches   = catches.filter(c => c.caughtAt?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const natureScore    = getNatureScore(todayCatches);
  const weekly         = getWeeklyStats();
  const scoreCol       = scoreColor(natureScore);

  // Live pedometer
  const [pedometerAvail, setPedometerAvail] = useState(false);
  const [sessionSteps,   setSessionSteps]   = useState(0);
  const subRef = useRef(null);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(avail => {
      setPedometerAvail(avail);
      if (avail) {
        // Get today's historical steps
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        Pedometer.getStepCountAsync(start, new Date())
          .then(r => setTodaySteps(r.steps))
          .catch(() => {});
      }
    });
    return () => subRef.current?.remove();
  }, []);

  // Session timer display
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    if (sessionStart) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionStart]);

  const toggleSession = () => {
    if (sessionStart) {
      // Stop — unsubscribe pedometer
      subRef.current?.remove();
      subRef.current = null;
      endSession();
    } else {
      // Start — subscribe pedometer
      if (pedometerAvail) {
        setSessionSteps(0);
        subRef.current = Pedometer.watchStepCount(({ steps }) => {
          setSessionSteps(steps);
        });
      }
      startSession();
    }
  };

  const fmtTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const maxSteps = Math.max(...weekly.map(d => d.steps), 1);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Health Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

        {/* Nature Therapy Score */}
        <View style={s.scoreCard}>
          <View style={s.scoreLeft}>
            <Text style={s.scoreLabel}>Nature Therapy Score</Text>
            <Text style={[s.scoreNum, { color: scoreCol }]}>{natureScore}</Text>
            <Text style={s.scoreMax}>/100 today</Text>
            <View style={[s.scoreBar, { backgroundColor: scoreCol + '20' }]}>
              <View style={[s.scoreFill, { width: `${natureScore}%`, backgroundColor: scoreCol }]} />
            </View>
            <Text style={[s.scoreStatus, { color: scoreCol }]}>
              {natureScore >= 80 ? '🌟 Excellent!' : natureScore >= 50 ? '🌿 Good going' : natureScore >= 25 ? '👣 Keep moving' : '💤 Just getting started'}
            </Text>
          </View>
          <View style={s.scoreRight}>
            <ScoreChip icon="footsteps"     label="Steps"   value={today.steps.toLocaleString()} color={C.blue}  />
            <ScoreChip icon="time-outline"  label="Minutes" value={`${today.minutes}m`}          color={C.green} />
            <ScoreChip icon="paw"           label="Catches" value={todayCatches}                  color={C.accent}/>
          </View>
        </View>

        {/* Weekly Nature Report */}
        <WeeklyReport weekly={weekly} />

        {/* Outdoor Session */}
        <View style={s.sessionCard}>
          <View style={s.sessionTop}>
            <View>
              <Text style={s.sessionTitle}>
                {sessionStart ? '🟢 Session Active' : '⚪ Start Outdoor Session'}
              </Text>
              <Text style={s.sessionSub}>
                {sessionStart
                  ? `${fmtTime(elapsed)} · ${sessionSteps.toLocaleString()} steps this session`
                  : 'Track your time and steps outside'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.sessionBtn, sessionStart && s.sessionBtnStop]}
            onPress={toggleSession}
            activeOpacity={0.85}
          >
            <Ionicons name={sessionStart ? 'stop-circle' : 'play-circle'} size={20} color={C.bg} />
            <Text style={s.sessionBtnText}>{sessionStart ? 'End Session' : 'Start Session'}</Text>
          </TouchableOpacity>
          {!pedometerAvail && (
            <Text style={s.pedometerNote}>Step counting not available on this device</Text>
          )}
        </View>

        {/* Mood Check-in */}
        <SectionHeader title="Mood Check-in" />
        <View style={s.moodCard}>
          <MoodRow
            label="How do you feel right now?"
            type="before"
            current={today.mood_before}
            onSelect={(emoji) => logMood('before', emoji)}
          />
          {today.mood_before && (
            <>
              <View style={s.moodDivider} />
              <MoodRow
                label="How do you feel after being outside?"
                type="after"
                current={today.mood_after}
                onSelect={(emoji) => logMood('after', emoji)}
              />
            </>
          )}
          {today.mood_before && today.mood_after && (
            <View style={s.moodResult}>
              <Text style={s.moodResultText}>
                {getMoodInsight(today.mood_before, today.mood_after)}
              </Text>
            </View>
          )}
        </View>

        {/* Mood Trend Chart */}
        <MoodTrendChart weekly={weekly} />

        {/* Weekly Steps Chart */}
        <SectionHeader title="This Week" />
        <View style={s.chartCard}>
          <View style={s.chartBars}>
            {weekly.map((d, i) => {
              const h   = Math.max((d.steps / maxSteps) * BAR_MAX_H, 4);
              const today = i === 6;
              return (
                <View key={d.key} style={s.chartCol}>
                  <Text style={s.chartSteps}>
                    {d.steps > 999 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps || ''}
                  </Text>
                  <View style={s.chartBarBg}>
                    <View style={[s.chartBar, { height: h, backgroundColor: today ? C.accent : C.primary }]} />
                  </View>
                  <Text style={[s.chartDay, today && s.chartDayToday]}>{d.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.chartStats}>
            <ChartStat label="Avg Steps" value={Math.round(weekly.reduce((a,d)=>a+d.steps,0)/7).toLocaleString()} />
            <ChartStat label="Total Mins" value={`${weekly.reduce((a,d)=>a+d.minutes,0)}m`} />
            <ChartStat label="Active Days" value={weekly.filter(d=>d.steps>0||d.minutes>0).length} />
          </View>
        </View>

        {/* Breathing exercise */}
        <SectionHeader title="Mindfulness" />
        <BreathingCard />

        {/* Health tips */}
        <SectionHeader title="Nature Tips" />
        <View style={s.tipsCard}>
          {[
            { icon: '🌅', tip: '20 minutes of morning sunlight boosts serotonin and regulates your sleep cycle.' },
            { icon: '🌿', tip: 'Spending 2 hours/week in nature is linked to significantly better health.' },
            { icon: '👁️', tip: 'The 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds to rest your eyes.' },
          ].map((t, i) => (
            <View key={i} style={[s.tipRow, i < 2 && s.tipBorder]}>
              <Text style={s.tipEmoji}>{t.icon}</Text>
              <Text style={s.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────

const MOOD_SCORES = { '😔': 1, '😐': 2, '🙂': 3, '😊': 4, '🤩': 5 };
const CHART_MAX_H = 56;

function MoodTrendChart({ weekly }) {
  const days = weekly.map(d => ({
    label:  d.label,
    before: MOOD_SCORES[d.mood_before] ?? 0,
    after:  MOOD_SCORES[d.mood_after]  ?? 0,
  }));

  const hasMood = days.some(d => d.before > 0 || d.after > 0);

  const totalBefore = days.reduce((a, d) => a + d.before, 0);
  const totalAfter  = days.reduce((a, d) => a + d.after,  0);
  const logged      = days.filter(d => d.before > 0).length;
  const avgImprove  = logged > 0 ? ((totalAfter - totalBefore) / logged).toFixed(1) : null;

  if (!hasMood) {
    return (
      <View style={mt.empty}>
        <Text style={mt.emptyEmoji}>😐</Text>
        <Text style={mt.emptyText}>Log your mood before & after sessions to see your trend here</Text>
      </View>
    );
  }

  return (
    <View style={mt.card}>
      <View style={mt.header}>
        <Ionicons name="happy-outline" size={18} color={C.accent} />
        <Text style={mt.title}>Mood Trend — 7 Days</Text>
        {avgImprove !== null && (
          <View style={[mt.improveBadge, { backgroundColor: parseFloat(avgImprove) >= 0 ? C.green + '25' : C.red + '20' }]}>
            <Text style={[mt.improveText, { color: parseFloat(avgImprove) >= 0 ? C.green : C.red }]}>
              {parseFloat(avgImprove) >= 0 ? '+' : ''}{avgImprove} avg
            </Text>
          </View>
        )}
      </View>

      <View style={mt.chartRow}>
        {days.map((d, i) => {
          const bH = d.before > 0 ? Math.max((d.before / 5) * CHART_MAX_H, 4) : 4;
          const aH = d.after  > 0 ? Math.max((d.after  / 5) * CHART_MAX_H, 4) : 4;
          const improved = d.after > d.before;
          const afterCol = d.after > 0 ? (improved ? C.green : C.orange) : C.border;

          return (
            <View key={d.label + i} style={mt.col}>
              <View style={mt.barGroup}>
                <View style={[mt.bar, { height: bH, backgroundColor: d.before > 0 ? C.muted + '80' : C.border }]} />
                <View style={[mt.bar, { height: aH, backgroundColor: afterCol }]} />
              </View>
              <Text style={mt.dayLabel}>{d.label.slice(0, 1)}</Text>
            </View>
          );
        })}
      </View>

      <View style={mt.legend}>
        <View style={mt.legendRow}>
          <View style={[mt.legendDot, { backgroundColor: C.muted + '80' }]} />
          <Text style={mt.legendText}>Before</Text>
        </View>
        <View style={mt.legendRow}>
          <View style={[mt.legendDot, { backgroundColor: C.green }]} />
          <Text style={mt.legendText}>After (improved)</Text>
        </View>
        <View style={mt.legendRow}>
          <View style={[mt.legendDot, { backgroundColor: C.orange }]} />
          <Text style={mt.legendText}>After (lower)</Text>
        </View>
      </View>
    </View>
  );
}

const mt = StyleSheet.create({
  card:         { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  title:        { fontSize: 15, fontWeight: '700', color: C.text, flex: 1 },
  improveBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  improveText:  { fontSize: 11, fontWeight: '700' },
  chartRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  col:          { alignItems: 'center', flex: 1 },
  barGroup:     { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: CHART_MAX_H + 4, justifyContent: 'center' },
  bar:          { width: 10, borderRadius: 4 },
  dayLabel:     { fontSize: 9, color: C.muted, fontWeight: '600', marginTop: 4 },
  legend:       { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  legendRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:    { width: 8, height: 8, borderRadius: 4 },
  legendText:   { fontSize: 10, color: C.muted },
  empty:        { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center', flexDirection: 'row', gap: 12 },
  emptyEmoji:   { fontSize: 28 },
  emptyText:    { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
});

function WeeklyReport({ weekly }) {
  const totalSteps   = weekly.reduce((a, d) => a + (d.steps   ?? 0), 0);
  const totalMins    = weekly.reduce((a, d) => a + (d.minutes ?? 0), 0);
  const activeDays   = weekly.filter(d => d.steps > 0 || d.minutes > 0).length;
  const bestDay      = weekly.reduce((best, d) => (d.steps > (best?.steps ?? 0) ? d : best), null);
  const stepGoal     = 70000; // 10k/day × 7
  const progress     = Math.min(totalSteps / stepGoal, 1);

  const today        = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
  const isSunday     = new Date().getDay() === 0;

  return (
    <View style={wr.card}>
      <View style={wr.header}>
        <Ionicons name="calendar" size={18} color={C.accent} />
        <Text style={wr.title}>Weekly Nature Report</Text>
        {isSunday && <View style={wr.newBadge}><Text style={wr.newText}>New</Text></View>}
      </View>

      <View style={wr.row}>
        <WRStat icon="footsteps" label="Steps"       value={totalSteps.toLocaleString()} color={C.blue}   />
        <WRStat icon="time"      label="Outdoors"    value={`${totalMins}m`}             color={C.green}  />
        <WRStat icon="sunny"     label="Active Days" value={`${activeDays}/7`}           color={C.accent} />
      </View>

      <View style={wr.goalRow}>
        <Text style={wr.goalLabel}>Weekly step goal</Text>
        <Text style={wr.goalPct}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={wr.goalTrack}>
        <View style={[wr.goalFill, { width: `${progress * 100}%` }]} />
      </View>

      {bestDay && bestDay.steps > 0 && (
        <Text style={wr.bestDay}>
          🏆 Best day: {bestDay.label} — {bestDay.steps.toLocaleString()} steps
        </Text>
      )}

      <Text style={wr.tip}>
        {totalMins >= 120
          ? '🌟 You hit the 120-minute nature therapy target this week!'
          : `🌿 ${120 - totalMins} more minutes outdoors to hit your weekly target`}
      </Text>
    </View>
  );
}

function WRStat({ icon, label, value, color }) {
  return (
    <View style={wr.stat}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[wr.statVal, { color }]}>{value}</Text>
      <Text style={wr.statLabel}>{label}</Text>
    </View>
  );
}

const wr = StyleSheet.create({
  card:       { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title:      { fontSize: 15, fontWeight: '700', color: C.text, flex: 1 },
  newBadge:   { backgroundColor: C.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  newText:    { fontSize: 10, fontWeight: 'bold', color: C.bg },
  row:        { flexDirection: 'row', gap: 10, marginBottom: 14 },
  stat:       { flex: 1, backgroundColor: C.card2, borderRadius: 12, padding: 10, alignItems: 'center', gap: 3 },
  statVal:    { fontSize: 16, fontWeight: 'bold' },
  statLabel:  { fontSize: 9, color: C.muted, fontWeight: '600' },
  goalRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalLabel:  { fontSize: 12, color: C.muted },
  goalPct:    { fontSize: 12, fontWeight: '700', color: C.accent },
  goalTrack:  { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  goalFill:   { height: 6, backgroundColor: C.accent, borderRadius: 3 },
  bestDay:    { fontSize: 12, color: C.text, fontWeight: '600', marginBottom: 6 },
  tip:        { fontSize: 12, color: C.muted, lineHeight: 18 },
});

function ScoreChip({ icon, label, value, color }) {
  return (
    <View style={[sc.chip, { borderColor: color + '40' }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[sc.chipVal, { color }]}>{value}</Text>
      <Text style={sc.chipLabel}>{label}</Text>
    </View>
  );
}

function MoodRow({ label, current, onSelect }) {
  return (
    <View>
      <Text style={s.moodLabel}>{label}</Text>
      <View style={s.moodRow}>
        {MOODS.map(m => (
          <TouchableOpacity
            key={m.emoji}
            style={[s.moodBtn, current === m.emoji && s.moodBtnActive]}
            onPress={() => onSelect(m.emoji)}
            activeOpacity={0.7}
          >
            <Text style={s.moodEmoji}>{m.emoji}</Text>
            <Text style={[s.moodBtnLabel, current === m.emoji && s.moodBtnLabelActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function getMoodInsight(before, after) {
  const bScore = MOODS.find(m => m.emoji === before)?.score ?? 3;
  const aScore = MOODS.find(m => m.emoji === after)?.score  ?? 3;
  const diff   = aScore - bScore;
  if (diff >= 2) return '🌟 Nature gave you a big mood boost today!';
  if (diff === 1) return '🌿 Your mood improved after being outside.';
  if (diff === 0) return '😊 Your mood stayed steady — consistency is great!';
  return '💙 Some days are tough. Nature still helps over time.';
}

function ChartStat({ label, value }) {
  return (
    <View style={s.chartStatItem}>
      <Text style={s.chartStatVal}>{value}</Text>
      <Text style={s.chartStatLabel}>{label}</Text>
    </View>
  );
}

const BREATH_PHASES = [
  { key: 'inhale', label: 'Breathe In',  speech: 'Breathe in',  duration: 4, color: C.blue,   haptic: 'medium' },
  { key: 'hold',   label: 'Hold',        speech: 'Hold',        duration: 4, color: C.accent, haptic: 'light'  },
  { key: 'exhale', label: 'Breathe Out', speech: 'Breathe out', duration: 6, color: C.green,  haptic: 'light'  },
];

function BreathingCard() {
  const [phase,   setPhase]   = useState('idle');
  const [counter, setCounter] = useState(0);
  const [sound,   setSound]   = useState(true);
  const soundRef  = useRef(true);          // always current — readable inside intervals
  const timerRef  = useRef(null);
  const tickRef   = useRef(null);
  const phaseIdx  = useRef(0);
  const secRef    = useRef(0);

  // Keep ref in sync with state so intervals always read the latest value
  const toggleSound = () => {
    setSound(prev => {
      soundRef.current = !prev;
      if (!prev === false) Speech.stop(); // muted — stop any speaking immediately
      return !prev;
    });
  };

  const triggerHaptic = (type) => {
    if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
  };

  // Reads soundRef.current — always sees the latest toggle state
  const announcePhase = (ph) => {
    triggerHaptic(ph.haptic);
    if (soundRef.current) {
      Speech.stop();
      Speech.speak(ph.speech, { rate: 0.75, pitch: 0.85, language: 'en-IN' });
    }
  };

  const startBreathing = () => {
    phaseIdx.current = 0;
    secRef.current   = 0;
    const first = BREATH_PHASES[0];
    setPhase(first.key);
    setCounter(first.duration);
    announcePhase(first);

    tickRef.current = setInterval(() => Haptics.selectionAsync(), 1000);

    timerRef.current = setInterval(() => {
      secRef.current++;
      const cur       = BREATH_PHASES[phaseIdx.current];
      const remaining = cur.duration - secRef.current;

      if (remaining <= 0) {
        phaseIdx.current = (phaseIdx.current + 1) % BREATH_PHASES.length;
        secRef.current   = 0;
        const next = BREATH_PHASES[phaseIdx.current];
        setPhase(next.key);
        setCounter(next.duration);
        announcePhase(next);   // uses soundRef.current — always live
      } else {
        setCounter(remaining);
      }
    }, 1000);
  };

  const stopBreathing = () => {
    clearInterval(timerRef.current);
    clearInterval(tickRef.current);
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('idle');
    setCounter(0);
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(tickRef.current);
    Speech.stop();
  }, []);

  const cur = BREATH_PHASES.find(p => p.key === phase);

  return (
    <View style={s.breathCard}>
      <View style={s.breathLeft}>
        <View style={s.breathTitleRow}>
          <Text style={s.breathTitle}>Box Breathing</Text>
          {/* Sound toggle */}
          <TouchableOpacity
            style={[s.soundBtn, sound && s.soundBtnOn]}
            onPress={toggleSound}
          >
            <Ionicons name={sound ? 'volume-high' : 'volume-mute'} size={14} color={sound ? C.accent : C.muted} />
          </TouchableOpacity>
        </View>
        <Text style={s.breathSub}>4-4-6 · voice guidance · haptic rhythm</Text>

        {phase !== 'idle' ? (
          <View style={s.breathPhaseBlock}>
            {/* Phase dots */}
            <View style={s.breathDots}>
              {BREATH_PHASES.map(p => (
                <View key={p.key} style={[s.breathDot, { backgroundColor: phase === p.key ? p.color : C.border }]} />
              ))}
            </View>
            <Text style={[s.breathPhaseLabel, { color: cur.color }]}>{cur.label}</Text>
            <Text style={[s.breathCount, { color: cur.color }]}>{counter}</Text>
          </View>
        ) : (
          <Text style={s.breathIdle}>Reduces stress in 60 seconds</Text>
        )}
      </View>

      <TouchableOpacity
        style={[s.breathBtn, phase !== 'idle' && { backgroundColor: C.red }]}
        onPress={phase === 'idle' ? startBreathing : stopBreathing}
        activeOpacity={0.85}
      >
        <Ionicons name={phase === 'idle' ? 'play' : 'stop'} size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={s.secHeader}>
      <Text style={s.secTitle}>{title}</Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const sc = StyleSheet.create({
  chip:      { alignItems: 'center', backgroundColor: C.card2, borderRadius: 12, padding: 10, borderWidth: 1, gap: 2, flex: 1 },
  chipVal:   { fontSize: 16, fontWeight: 'bold' },
  chipLabel: { fontSize: 9, color: C.muted, fontWeight: '600' },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

  secHeader: { marginHorizontal: 16, marginTop: 8, marginBottom: 10 },
  secTitle:  { fontSize: 16, fontWeight: '700', color: C.text },

  // Score
  scoreCard:   { flexDirection: 'row', gap: 12, backgroundColor: C.card, margin: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border },
  scoreLeft:   { flex: 1 },
  scoreLabel:  { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5, marginBottom: 4 },
  scoreNum:    { fontSize: 52, fontWeight: 'bold', lineHeight: 58 },
  scoreMax:    { fontSize: 12, color: C.muted, marginBottom: 10 },
  scoreBar:    { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  scoreFill:   { height: 6, borderRadius: 3 },
  scoreStatus: { fontSize: 12, fontWeight: '700' },
  scoreRight:  { gap: 8, justifyContent: 'center', width: 88 },

  // Session
  sessionCard:    { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  sessionTop:     { marginBottom: 14 },
  sessionTitle:   { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  sessionSub:     { fontSize: 12, color: C.muted },
  sessionBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, gap: 8 },
  sessionBtnStop: { backgroundColor: C.red },
  sessionBtnText: { fontSize: 15, fontWeight: 'bold', color: C.bg },
  pedometerNote:  { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 8 },

  // Mood
  moodCard:   { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  moodLabel:  { fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 18 },
  moodRow:    { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  moodBtn:    { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: C.card2, borderWidth: 1, borderColor: C.border },
  moodBtnActive: { backgroundColor: C.primary, borderColor: C.accent },
  moodEmoji:  { fontSize: 22 },
  moodBtnLabel: { fontSize: 9, color: C.muted, marginTop: 3, fontWeight: '600' },
  moodBtnLabelActive: { color: C.accent },
  moodDivider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  moodResult:  { marginTop: 14, backgroundColor: C.primary + '30', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.primary },
  moodResultText: { fontSize: 13, color: C.text, textAlign: 'center', fontWeight: '600' },

  // Chart
  chartCard:    { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  chartBars:    { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: BAR_MAX_H + 48, marginBottom: 12 },
  chartCol:     { alignItems: 'center', flex: 1, gap: 4 },
  chartBarBg:   { width: '60%', height: BAR_MAX_H, justifyContent: 'flex-end', backgroundColor: C.border + '50', borderRadius: 6, overflow: 'hidden' },
  chartBar:     { width: '100%', borderRadius: 6 },
  chartSteps:   { fontSize: 8, color: C.muted, height: 14, textAlign: 'center' },
  chartDay:     { fontSize: 10, color: C.muted, fontWeight: '600' },
  chartDayToday:{ color: C.accent },
  chartStats:   { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 14, gap: 8 },
  chartStatItem:{ flex: 1, alignItems: 'center' },
  chartStatVal: { fontSize: 16, fontWeight: 'bold', color: C.text },
  chartStatLabel:{ fontSize: 10, color: C.muted, marginTop: 2 },

  // Breathing
  breathCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  breathLeft:       { flex: 1 },
  breathTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  breathTitle:      { fontSize: 15, fontWeight: '700', color: C.text },
  soundBtn:         { padding: 5, borderRadius: 8, backgroundColor: C.card2, borderWidth: 1, borderColor: C.border },
  soundBtnOn:       { borderColor: C.accent + '60', backgroundColor: C.accent + '15' },
  breathSub:        { fontSize: 12, color: C.muted, marginBottom: 4 },
  breathIdle:       { fontSize: 12, color: C.muted, fontStyle: 'italic', marginTop: 6 },
  breathPhaseBlock: { marginTop: 10, gap: 4 },
  breathDots:       { flexDirection: 'row', gap: 6, marginBottom: 6 },
  breathDot:        { width: 8, height: 8, borderRadius: 4 },
  breathPhaseLabel: { fontSize: 14, fontWeight: '700' },
  breathCount:      { fontSize: 32, fontWeight: 'bold', lineHeight: 36 },
  breathBtn:        { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },

  // Tips
  tipsCard:  { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  tipRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  tipEmoji:  { fontSize: 22, marginTop: 2 },
  tipText:   { flex: 1, fontSize: 13, color: C.muted, lineHeight: 20 },
});
