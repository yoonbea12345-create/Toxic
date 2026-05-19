import type { SajuResult, PersonData, RelationType } from './saju';

async function callAnalyzeAPI(phase: 1 | 2, myData: PersonData, targetData: PersonData, relationType: RelationType, result: SajuResult) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase, myData, targetData, relationType, result }),
    signal: AbortSignal.timeout(58000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function fetchAIPhase1(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
) {
  return callAnalyzeAPI(1, myData, targetData, relationType, result);
}

export async function fetchAIPhase2(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
) {
  if (!targetData.birthdate) return null;
  return callAnalyzeAPI(2, myData, targetData, relationType, result);
}
