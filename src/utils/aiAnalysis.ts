import type { SajuResult, PersonData, RelationType } from './saju';

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

export async function fetchAIPhase1(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
  onProgress?: (pct: number) => void,
): Promise<any> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase: 1, myData, targetData, relationType, result }),
    signal: timeoutSignal(90000),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part.split('\n').find(l => l.startsWith('data: '));
      if (!line) continue;
      const evt = JSON.parse(line.slice(6));
      if (evt.type === 'progress') {
        onProgress?.(evt.pct);
      } else if (evt.type === 'done') {
        return evt.data;
      } else if (evt.type === 'error') {
        throw new Error(evt.message ?? 'stream error');
      }
    }
  }

  throw new Error('Stream ended without done event');
}

export async function fetchAIPhase2(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
): Promise<any> {
  if (!targetData.birthdate && !targetData.name) return null;
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase: 2, myData, targetData, relationType, result }),
    signal: timeoutSignal(90000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const { data } = await res.json();
  return data;
}
