import { track as vercelTrack } from '@vercel/analytics';

const EVENTS_KEY = 'toxic_events';
const SESSION_START_KEY = 'toxic_session_start';
const TIMES_KEY = 'toxic_session_times';
const MAX_EVENTS = 500;

export function trackEvent(event: string, props?: Record<string, unknown>) {
  // Vercel Analytics로 전송
  try { vercelTrack(event, props as Record<string, string>); } catch {}

  // localStorage에 로컬 저장 (admin 대시보드용)
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const events = raw ? JSON.parse(raw) : [];
    events.push({ event, props, ts: Date.now() });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {}
}

export function startSession() {
  sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
  trackEvent('page_view_landing');
}

export function endSession() {
  const start = sessionStorage.getItem(SESSION_START_KEY);
  if (!start) return;
  const duration = Date.now() - Number(start);
  try {
    const raw = localStorage.getItem(TIMES_KEY);
    const times = raw ? JSON.parse(raw) : [];
    times.push(duration);
    if (times.length > 200) times.splice(0, times.length - 200);
    localStorage.setItem(TIMES_KEY, JSON.stringify(times));
  } catch {}
}
