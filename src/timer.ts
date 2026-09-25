export type Mode = 'focus' | 'break';
export type Session = { id: string; endedAt: number; seconds: number };
export type Timer = {
  mode: Mode;
  status: 'idle' | 'running' | 'paused' | 'completed';
  duration: number;
  remaining: number;
  deadline: number | null;
  demo: boolean;
  sessions: Session[];
};

export const initialTimer: Timer = {
  mode: 'focus', status: 'idle', duration: 1500, remaining: 1500,
  deadline: null, demo: false, sessions: [],
};

export type Action =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'tick'; now: number }
  | { type: 'reset' }
  | { type: 'configure'; mode: Mode; seconds: number; demo?: boolean }
  | { type: 'restore'; value: Timer; now: number };

export function reconcile(timer: Timer, now: number): Timer {
  if (timer.status !== 'running' || timer.deadline === null) return timer;
  const remaining = Math.max(0, (timer.deadline - now) / 1000);
  if (remaining > 0) return { ...timer, remaining };
  const session = { id: String(timer.deadline), endedAt: timer.deadline, seconds: timer.duration };
  return {
    ...timer, remaining: 0, deadline: null, status: 'completed',
    sessions: timer.mode === 'focus' && !timer.demo
      ? [...timer.sessions, session].slice(-1000)
      : timer.sessions,
  };
}

export function timerReducer(timer: Timer, action: Action): Timer {
  switch (action.type) {
    case 'restore': return reconcile(action.value, action.now);
    case 'tick': return reconcile(timer, action.now);
    case 'start': {
      if (timer.status === 'running') return timer;
      const remaining = timer.status === 'completed' ? timer.duration : timer.remaining;
      return { ...timer, status: 'running', remaining, deadline: action.now + remaining * 1000 };
    }
    case 'pause': {
      const current = reconcile(timer, action.now);
      return current.status === 'running' ? { ...current, status: 'paused', deadline: null } : current;
    }
    case 'reset': return { ...timer, status: 'idle', remaining: timer.duration, deadline: null };
    case 'configure':
      if (timer.status === 'running' || timer.status === 'paused') return timer;
      return { ...timer, mode: action.mode, duration: action.seconds, remaining: action.seconds,
        demo: action.demo ?? false, deadline: null, status: 'idle' };
  }
}

export function parseTimer(raw: unknown): Timer | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Timer;
  if (!['focus', 'break'].includes(t.mode) || !['idle', 'running', 'paused', 'completed'].includes(t.status)
    || !Number.isFinite(t.duration) || t.duration <= 0 || t.duration > 7200
    || !Number.isFinite(t.remaining) || t.remaining < 0 || t.remaining > t.duration
    || typeof t.demo !== 'boolean' || !Array.isArray(t.sessions)
    || (t.status === 'running' ? !Number.isFinite(t.deadline) : t.deadline !== null)) return null;
  return { ...t, sessions: t.sessions.filter(s => s && typeof s.id === 'string'
    && Number.isFinite(s.endedAt) && Number.isFinite(s.seconds) && s.seconds > 0).slice(-1000) };
}

export function clockText(seconds: number): string {
  const rounded = Math.ceil(seconds);
  return `${Math.floor(rounded / 60).toString().padStart(2, '0')}:${(rounded % 60).toString().padStart(2, '0')}`;
}

export function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
