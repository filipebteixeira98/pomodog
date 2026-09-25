import { useEffect, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path } from 'react-native-svg';
import { Dog } from './src/Dog';
import { clockText, dayKey, initialTimer, parseTimer, timerReducer } from './src/timer';

const STORAGE_KEY = 'pomodog.prototype.v1';
const themes = [{ name: 'Sálvia', color: '#4E6B55' }, { name: 'Terracota', color: '#9A5945' }, { name: 'Lavanda', color: '#71608B' }];
const ink = '#343C32';
const muted = '#73796D';
type Preferences = { focus: number; rest: number; theme: number; reduceMotion: boolean };
const defaultPreferences: Preferences = { focus: 25, rest: 5, theme: 0, reduceMotion: false };

function Paw({ color = ink, size = 24 }: { color?: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7.1 13.9c1.1-1 1.7-3.4 4.9-3.4s3.8 2.4 4.9 3.4c3.7 3.4 1.2 7-2 5.5-1.9-.9-3.9-.9-5.8 0-3.2 1.5-5.7-2.1-2-5.5Z" fill={color} /><Circle cx="4" cy="9" r="2.5" fill={color} /><Circle cx="9" cy="5" r="2.5" fill={color} /><Circle cx="15" cy="5" r="2.5" fill={color} /><Circle cx="20" cy="9" r="2.5" fill={color} /></Svg>;
}

function Button({ label, onPress, accent, secondary = false, disabled = false }: { label: string; onPress: () => void; accent: string; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, { backgroundColor: secondary ? '#ECEEE6' : accent, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }]}>
    <Text style={[s.buttonText, { color: secondary ? ink : '#FFFFFF' }]}>{label}</Text>
  </Pressable>;
}

function Pomodog() {
  const [timer, dispatch] = useReducer(timerReducer, initialTimer);
  const [prefs, setPrefs] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [tab, setTab] = useState<'focus' | 'progress'>('focus');
  const [settings, setSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const writeQueue = useRef(Promise.resolve());
  const currentTimer = useRef(timer);
  currentTimer.current = timer;
  const accent = themes[prefs.theme].color;
  const busy = timer.status === 'running' || timer.status === 'paused';

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!mounted || !raw) return;
      const saved = JSON.parse(raw);
      const restored = parseTimer(saved.timer);
      if (restored) dispatch({ type: 'restore', value: restored, now: Date.now() });
      else setStorageError(true);
      const p = saved.preferences;
      if (p && [15, 25, 50].includes(p.focus) && [5, 10, 15].includes(p.rest)
        && [0, 1, 2].includes(p.theme) && typeof p.reduceMotion === 'boolean') setPrefs(p);
    }).catch(() => { if (mounted) setStorageError(true); })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  // Persist transitions, not every animation/timer frame. Deadlines recover elapsed time.
  useEffect(() => {
    if (!ready) return;
    const raw = JSON.stringify({ timer: currentTimer.current, preferences: prefs });
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(STORAGE_KEY, raw)).catch(() => setStorageError(true));
  }, [ready, timer.status, timer.deadline, timer.duration, timer.mode, timer.demo, timer.sessions, prefs]);

  useEffect(() => {
    if (!ready || timer.status !== 'running') return;
    const interval = setInterval(() => dispatch({ type: 'tick', now: Date.now() }), 250);
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') dispatch({ type: 'tick', now: Date.now() });
    });
    return () => { clearInterval(interval); listener.remove(); };
  }, [ready, timer.status]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReducedMotion).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReducedMotion);
    return () => listener.remove();
  }, []);

  const today = timer.sessions.filter(session => dayKey(session.endedAt) === dayKey(Date.now()));
  const minutesToday = Math.round(today.reduce((sum, session) => sum + session.seconds, 0) / 60);
  const configure = (mode: 'focus' | 'break', seconds = (mode === 'focus' ? prefs.focus : prefs.rest) * 60, demo = false) => dispatch({ type: 'configure', mode, seconds, demo });
  const finished = timer.status === 'completed';
  const heading = finished ? 'Um passo de cada vez.' : timer.mode === 'break' ? 'Respire. Você merece.' : 'Seu tempo, com companhia.';
  const dogMessage = finished ? 'Boa! Eu sabia que você conseguia.' : timer.status === 'running' ? (timer.mode === 'focus' ? 'Pode focar. Eu fico aqui com você.' : 'Vamos recarregar as energias juntos.') : timer.status === 'paused' ? 'Sem pressa. Continuamos quando quiser.' : 'Um pequeno começo já faz diferença.';

  return <SafeAreaView style={s.safe}>
    <StatusBar style="dark" />
    <View style={s.shell}>
      <View style={s.header}>
        <View style={s.brand}><View style={[s.brandMark, { backgroundColor: accent }]}><Paw color="#FFF9EC" size={22} /></View><Text style={s.brandName}>pomodog<Text style={{ color: accent }}>.</Text></Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir ajustes e personalização" onPress={() => setSettings(true)} style={s.settingsButton}><Text style={s.settingsText}>Ajustes</Text><Text style={{ color: muted, fontSize: 20 }}>☷</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {storageError && <Text accessibilityRole="alert" style={s.warning}>Não foi possível recuperar ou salvar seus dados. O progresso pode não permanecer ao fechar o aplicativo.</Text>}
        {tab === 'focus' ? <>
          <View style={s.intro}><Text style={[s.eyebrow, { color: accent }]}>MENOS PRESSA, MAIS PRESENÇA</Text><Text style={s.title}>{heading}</Text><Text style={s.subtitle}>Um momento para o que importa. No seu ritmo.</Text></View>
          <View style={s.timerCard}>
            <View style={s.segments}>
              {(['focus', 'break'] as const).map(mode => <Pressable key={mode} accessibilityRole="button" accessibilityState={{ selected: timer.mode === mode, disabled: busy }} disabled={busy} onPress={() => configure(mode)} style={[s.segment, timer.mode === mode && s.selectedSegment]}><Text style={[s.segmentText, timer.mode === mode && { color: accent, fontWeight: '700' }]}>{mode === 'focus' ? 'Foco' : 'Descanso'}</Text></Pressable>)}
            </View>
            <Dog accent={accent} resting={timer.status === 'running'} celebrating={finished} reducedMotion={prefs.reduceMotion || systemReducedMotion} />
            <Text style={s.dogMessage} accessibilityLiveRegion="polite">{dogMessage}</Text>
            <Text style={[s.timer, { color: ink }]} accessibilityLabel={`${Math.floor(Math.ceil(timer.remaining) / 60)} minutos e ${Math.ceil(timer.remaining) % 60} segundos restantes`}>{clockText(timer.remaining)}</Text>
            <Text style={s.timerCaption}>{timer.demo ? 'DEMONSTRAÇÃO · NÃO CONTA NO PROGRESSO' : finished ? 'SESSÃO CONCLUÍDA' : timer.status === 'paused' ? 'UM RESPIRO NO CAMINHO' : timer.mode === 'focus' ? 'UM PASSO DE CADA VEZ' : 'DESCANSAR TAMBÉM FAZ PARTE'}</Text>
            <View style={s.track}><View style={[s.trackFill, { backgroundColor: accent, width: `${Math.max(0, Math.min(100, (1 - timer.remaining / timer.duration) * 100))}%` }]} /></View>
            <View style={s.actions}>
              {finished ? <Button accent={accent} label={timer.demo ? 'Voltar ao foco' : timer.mode === 'focus' ? 'Preparar descanso' : 'Preparar próximo foco'} onPress={() => configure(timer.demo || timer.mode === 'break' ? 'focus' : 'break')} /> : <Button accent={accent} disabled={!ready} label={!ready ? 'Preparando seu cantinho…' : timer.status === 'running' ? 'Pausar sessão' : timer.status === 'paused' ? 'Retomar sessão' : timer.mode === 'focus' ? 'Começar a focar' : 'Começar descanso'} onPress={() => dispatch({ type: timer.status === 'running' ? 'pause' : 'start', now: Date.now() })} />}
              {busy ? <Pressable accessibilityRole="button" onPress={() => setConfirmReset(true)} style={s.textButton}><Text style={s.linkText}>Reiniciar sessão</Text></Pressable> : !finished && <Pressable accessibilityRole="button" disabled={!ready} onPress={() => timer.demo ? configure('focus') : configure('focus', 10, true)} style={s.textButton}><Text style={s.linkText}>{timer.demo ? 'Sair da demonstração' : 'Experimentar em 10 segundos'}</Text></Pressable>}
            </View>
          </View>
          <View style={s.todayCard}><View><Text style={s.smallTitle}>SEU DIA, ATÉ AQUI</Text><Text style={s.todayText}><Text style={{ fontWeight: '700', color: accent }}>{minutesToday} min</Text> de presença</Text></View><View style={s.sessionBadge}><Paw color={accent} size={16} /><Text style={[s.sessionText, { color: accent }]}>{today.length} {today.length === 1 ? 'sessão' : 'sessões'}</Text></View></View>
          <Text style={s.bottomNote}>Cada começo conta. Seu companheiro está por aqui.</Text>
        </> : <>
          <View style={s.intro}><Text style={[s.eyebrow, { color: accent }]}>PEQUENOS PASSOS CONTAM</Text><Text style={s.title}>Seu caminho até aqui.</Text><Text style={s.subtitle}>Presença vale mais que uma sequência perfeita.</Text></View>
          <View style={s.progressCard}><Text style={s.smallTitle}>HOJE</Text><Text style={[s.progressNumber, { color: accent }]}>{minutesToday}<Text style={s.progressUnit}> min</Text></Text><Text style={s.subtitle}>{today.length} {today.length === 1 ? 'sessão de foco concluída' : 'sessões de foco concluídas'}</Text></View>
          <View style={s.progressCard}><Text style={s.sectionTitle}>Últimos 7 dias</Text><View style={s.week}>
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date(); date.setDate(date.getDate() - (6 - index));
              const minutes = Math.round(timer.sessions.filter(session => dayKey(session.endedAt) === dayKey(date.getTime())).reduce((sum, session) => sum + session.seconds, 0) / 60);
              return <View key={index} style={s.day} accessible accessibilityLabel={`${date.toLocaleDateString('pt-BR')}: ${minutes} minutos de foco`}><Text style={s.dayValue}>{minutes}</Text><View style={s.barTrack}><View style={{ height: minutes ? Math.max(8, Math.min(100, minutes / 120 * 100)) : 3, width: 18, backgroundColor: minutes ? accent : '#DFE4D7', borderRadius: 6 }} /></View><Text style={s.dayLabel}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][date.getDay()]}</Text></View>;
            })}
          </View><Text style={s.caption}>Minutos de foco por dia · barras com teto de 120 min</Text></View>
          <View style={s.progressCard}><Text style={s.sectionTitle}>Pequenas conquistas</Text>{timer.sessions.length === 0 ? <View style={{ paddingVertical: 22, gap: 12 }}><Paw color={accent} size={30} /><Text style={s.emptyTitle}>Seu primeiro passo ainda vem.</Text><Text style={s.subtitle}>Ao concluir um foco, ele aparece aqui. A demonstração não entra no histórico.</Text><Button label="Preparar meu primeiro foco" accent={accent} onPress={() => setTab('focus')} /></View> : timer.sessions.slice(-5).reverse().map(session => <View key={session.id} style={s.historyRow}><Paw color={accent} size={19} /><View style={{ flex: 1 }}><Text style={s.historyTitle}>{Math.round(session.seconds / 60)} minutos para você</Text><Text style={s.caption}>{new Date(session.endedAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text></View><Text style={{ color: accent }}>✓</Text></View>)}</View>
          <Text style={s.bottomNote}>Histórico local das últimas 1.000 sessões, neste dispositivo.</Text>
        </>}
      </ScrollView>

      <View style={s.nav}>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'focus' }} onPress={() => setTab('focus')} style={s.navItem}><Paw size={20} color={tab === 'focus' ? accent : muted} /><Text style={[s.navText, { color: tab === 'focus' ? accent : muted }]}>Meu foco</Text>{tab === 'focus' && <View style={[s.navDot, { backgroundColor: accent }]} />}</Pressable>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'progress' }} onPress={() => setTab('progress')} style={s.navItem}><Svg width={21} height={21} viewBox="0 0 24 24"><Path d="M5 19V13M12 19V5M19 19V9" stroke={tab === 'progress' ? accent : muted} strokeWidth="3" strokeLinecap="round" /></Svg><Text style={[s.navText, { color: tab === 'progress' ? accent : muted }]}>Meu progresso</Text>{tab === 'progress' && <View style={[s.navDot, { backgroundColor: accent }]} />}</Pressable>
      </View>
    </View>

    <Modal visible={settings} transparent animationType={prefs.reduceMotion || systemReducedMotion ? 'none' : 'fade'} onRequestClose={() => setSettings(false)}>
      <View style={s.overlay}><View style={s.modal} accessibilityViewIsModal><ScrollView contentContainerStyle={{ gap: 22 }}>
        <View><Text style={s.sectionTitle}>Do seu jeito.</Text><Text style={s.subtitle}>Pequenos ajustes para se sentir em casa.</Text></View>
        <View><Text style={s.fieldLabel}>Tempo de foco</Text><View style={s.options}>{[15, 25, 50].map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} minutos de foco`} accessibilityState={{ selected: prefs.focus === value, disabled: busy }} disabled={busy} style={[s.option, prefs.focus === value && { borderColor: accent, backgroundColor: '#EFF1E9' }, busy && { opacity: 0.5 }]} onPress={() => { setPrefs(p => ({ ...p, focus: value })); if (timer.mode === 'focus') configure('focus', value * 60); }}><Text style={s.optionText}>{value} min</Text></Pressable>)}</View></View>
        <View><Text style={s.fieldLabel}>Tempo de descanso</Text><View style={s.options}>{[5, 10, 15].map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} minutos de descanso`} accessibilityState={{ selected: prefs.rest === value, disabled: busy }} disabled={busy} style={[s.option, prefs.rest === value && { borderColor: accent, backgroundColor: '#EFF1E9' }, busy && { opacity: 0.5 }]} onPress={() => { setPrefs(p => ({ ...p, rest: value })); if (timer.mode === 'break') configure('break', value * 60); }}><Text style={s.optionText}>{value} min</Text></Pressable>)}</View>{busy && <Text style={s.caption}>Finalize ou reinicie a sessão para ajustar os tempos.</Text>}</View>
        <View><Text style={s.fieldLabel}>Sua cor, a coleira dele</Text><View style={s.options}>{themes.map((theme, index) => <Pressable key={theme.name} accessibilityRole="button" accessibilityState={{ selected: prefs.theme === index }} onPress={() => setPrefs(p => ({ ...p, theme: index }))} style={[s.option, prefs.theme === index && { borderColor: theme.color }]}><View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color, marginBottom: 6 }} /><Text style={s.optionText}>{theme.name}</Text></Pressable>)}</View></View>
        <View style={s.switchRow}><View style={{ flex: 1 }}><Text style={s.fieldLabel}>Menos movimento</Text><Text style={s.caption}>{systemReducedMotion ? 'Ativado também pelo seu dispositivo.' : 'Deixe o cachorro e as transições sem animação.'}</Text></View><Switch accessibilityLabel="Reduzir animações" value={prefs.reduceMotion || systemReducedMotion} disabled={systemReducedMotion} onValueChange={value => setPrefs(p => ({ ...p, reduceMotion: value }))} trackColor={{ true: accent }} /></View>
        <Text style={s.caption}>O timer se atualiza ao voltar ao aplicativo. Esta versão ainda não envia alertas com a tela bloqueada e não reproduz música.</Text>
        <Button label="Pronto, vamos lá" accent={accent} onPress={() => setSettings(false)} />
      </ScrollView></View></View>
    </Modal>
    <Modal visible={confirmReset} transparent animationType="fade" onRequestClose={() => setConfirmReset(false)}><View style={s.overlay}><View style={s.modal} accessibilityViewIsModal><Text style={s.sectionTitle}>Começar de novo?</Text><Text style={[s.subtitle, { marginVertical: 16 }]}>O tempo desta sessão será descartado. As sessões já concluídas continuam no seu progresso.</Text><View style={{ gap: 12 }}><Button label="Reiniciar sessão" accent={accent} onPress={() => { dispatch({ type: 'reset' }); setConfirmReset(false); }} /><Button label="Continuar como estou" accent={accent} secondary onPress={() => setConfirmReset(false)} /></View></View></View></Modal>
  </SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><Pomodog /></SafeAreaProvider>; }

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7F2' },
  shell: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  brandName: { fontSize: 25, letterSpacing: -1.2, fontWeight: '800', color: ink },
  settingsButton: { minHeight: 44, paddingLeft: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  settingsText: { fontSize: 13, color: muted },
  scroll: { paddingHorizontal: 22, paddingTop: 13, paddingBottom: 24, gap: 18 },
  intro: { alignItems: 'center', gap: 8, marginBottom: 2 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2.2, textAlign: 'center' },
  title: { fontSize: 28, fontFamily: Platform.OS === 'ios' ? 'Georgia' : Platform.OS === 'web' ? 'Georgia, serif' : 'serif', color: ink, textAlign: 'center', letterSpacing: -0.7 },
  subtitle: { color: muted, fontSize: 13, lineHeight: 21 },
  timerCard: { backgroundColor: '#FFFEFA', borderRadius: 28, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 8, borderWidth: 1, borderColor: '#E7E8DE', alignItems: 'center' },
  segments: { backgroundColor: '#F0F1E9', borderRadius: 14, flexDirection: 'row', padding: 4, width: 250, maxWidth: '100%', marginBottom: 5 },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  selectedSegment: { backgroundColor: '#FFFEFA', boxShadow: '0px 1px 4px #0000000D' },
  segmentText: { fontSize: 13, color: muted },
  dogMessage: { fontSize: 12, color: muted, textAlign: 'center', marginTop: -1, lineHeight: 18 },
  timer: { fontSize: 70, fontWeight: '300', letterSpacing: -3.5, fontVariant: ['tabular-nums'], marginTop: 10 },
  timerCaption: { fontSize: 9, letterSpacing: 1.7, color: muted, textAlign: 'center', lineHeight: 16 },
  track: { height: 4, width: '78%', backgroundColor: '#EBEEE3', borderRadius: 2, overflow: 'hidden', marginTop: 20, marginBottom: 22 },
  trackFill: { height: '100%', borderRadius: 2 },
  actions: { width: '100%', maxWidth: 340 },
  button: { minHeight: 52, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  textButton: { minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  linkText: { fontSize: 11, color: muted, textDecorationLine: 'underline' },
  todayCard: { backgroundColor: '#EEF0E6', borderRadius: 19, padding: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  smallTitle: { color: muted, fontSize: 9, fontWeight: '600', letterSpacing: 1.6 },
  todayText: { fontSize: 15, color: ink, marginTop: 7 },
  sessionBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FCFCF6', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20 },
  sessionText: { fontSize: 11, fontWeight: '600' },
  bottomNote: { color: muted, fontSize: 11, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#E5E7DB', paddingTop: 10, paddingBottom: 10, backgroundColor: '#F8F7F2' },
  navItem: { flex: 1, alignItems: 'center', gap: 5, minHeight: 54, paddingTop: 3 },
  navText: { fontSize: 11, fontWeight: '600' },
  navDot: { width: 4, height: 4, borderRadius: 2 },
  overlay: { flex: 1, backgroundColor: '#25332266', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 460, maxHeight: '90%', borderRadius: 24, backgroundColor: '#FFFEFA', padding: 24 },
  sectionTitle: { fontSize: 21, fontWeight: '600', color: ink, marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: ink, marginBottom: 9 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: '#E2E5D9', paddingVertical: 12, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  optionText: { color: ink, fontSize: 11 },
  switchRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  caption: { color: muted, fontSize: 11, lineHeight: 18 },
  warning: { backgroundColor: '#F9E8CB', padding: 12, borderRadius: 12, fontSize: 12, color: '#785621' },
  progressCard: { backgroundColor: '#FFFEFA', borderRadius: 24, borderWidth: 1, borderColor: '#E7E8DE', padding: 24 },
  progressNumber: { fontSize: 60, fontWeight: '300', marginTop: 12 },
  progressUnit: { fontSize: 22 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 16 },
  day: { alignItems: 'center', gap: 8, flex: 1 },
  dayValue: { fontSize: 11, color: muted },
  barTrack: { height: 100, justifyContent: 'flex-end' },
  dayLabel: { color: muted, fontSize: 11 },
  emptyTitle: { color: ink, fontSize: 17, fontWeight: '500' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#EEF0E6' },
  historyTitle: { fontSize: 14, color: ink, marginBottom: 3 },
});
