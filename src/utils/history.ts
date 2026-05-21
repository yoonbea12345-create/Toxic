const HISTORY_KEY = 'toxic_history';
const MAX = 5;

export interface HistoryEntry {
  id: string;
  date: number;
  myName: string;
  targetName: string;
  score: number;
  relationType: string;
  conflictType: string;
}

export function saveHistory(entry: Omit<HistoryEntry, 'id' | 'date'>) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift({ ...entry, id: Math.random().toString(36).slice(2), date: Date.now() });
    if (list.length > MAX) list.length = MAX;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {}
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
